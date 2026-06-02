# Guía de Corrección de Bugs

Esta guía cubre el enfoque sistemático para corregir bugs usando Claude-Craft, desde el diagnóstico hasta la validación.

---

## Tabla de Contenidos

1. [Flujo de Trabajo para la Corrección de Bugs](#flujo-de-trabajo-para-la-corrección-de-bugs)
2. [Fase 1: Reproducir](#fase-1-reproducir)
3. [Fase 2: Diagnosticar](#fase-2-diagnosticar)
4. [Fase 3: Escribir Test de Regresión](#fase-3-escribir-test-de-regresión)
5. [Fase 4: Corregir](#fase-4-corregir)
6. [Fase 5: Validar](#fase-5-validar)
7. [Fase 6: Documentar](#fase-6-documentar)
8. [Procedimientos de Hotfix](#procedimientos-de-hotfix)
9. [Ejemplo Completo](#ejemplo-completo)

---

## Flujo de Trabajo para la Corrección de Bugs

El enfoque sistemático para corregir bugs:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Reproducir│ --> │2. Diagnosticar│ --> │  3. Test   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 6. Documentar│ <-- │  5. Validar │ <-- │ 4. Corregir │
└─────────────┘     └─────────────┘     └─────────────┘
```

### ¿Por Qué Este Enfoque?

1. **Reproducir primero**: No se puede corregir lo que no se puede ver
2. **Test antes de la corrección**: Prueba que el bug existe y que se ha corregido
3. **Validar a fondo**: Garantiza que no hay regresión
4. **Documentar**: Ayuda a prevenir bugs similares

---

## Fase 1: Reproducir

Antes de corregir, reproduce el bug de forma consistente.

### Recopilar Información

Recoge del informe de bug:
- Pasos para reproducir
- Comportamiento esperado
- Comportamiento real
- Entorno (versión, SO, etc.)
- Mensajes de error/logs
- Capturas de pantalla si aplica

### Crear el Entorno de Reproducción

```bash
# Hacer checkout de la versión problemática
git checkout <commit-o-tag>

# Configurar un entorno idéntico
make docker-up

# Reproducir con los pasos exactos
```

### Verificar la Reproducción

¿Puedes activar el bug de forma consistente?

- [ ] El bug ocurre con los pasos reportados
- [ ] El bug ocurre en el mismo entorno
- [ ] El bug es determinístico (no aleatorio)

### Si No Puedes Reproducirlo

```markdown
@research-assistant Ayúdame a entender por qué este bug podría ser específico del entorno

Informe de bug:
- El usuario ve el error X al hacer Y
- No puedo reproducirlo localmente
- El usuario está en el entorno Z

¿Posibles causas?
```

---

## Fase 2: Diagnosticar

Encuentra la causa raíz del bug.

### Usar el Comando de Análisis

```bash
/common:analyze-bug "Los usuarios no pueden iniciar sesión con las credenciales correctas después de restablecer la contraseña"
```

Este comando:
1. Sugerirá áreas a investigar
2. Identificará posibles causas
3. Recomendará pasos de depuración
4. Listará las áreas de código relacionadas

### Usar el Entrenador TDD para el Diagnóstico

```markdown
@tdd-coach Ayúdame a diagnosticar este bug de autenticación

Síntomas:
- El usuario restablece la contraseña con éxito
- La nueva contraseña se guarda (confirmado en la BD)
- El inicio de sesión falla con "credenciales inválidas"
- La contraseña antigua tampoco funciona

¿Qué debería investigar?
```

### Técnicas de Depuración

#### Añadir Logging

```php
// Logging de depuración temporal
$this->logger->debug('Password verification', [
    'user_id' => $user->getId(),
    'stored_hash' => substr($user->getPasswordHash(), 0, 20) . '...',
    'verification_result' => $result,
]);
```

#### Inspeccionar el Estado de la Base de Datos

```sql
-- Comprobar el estado del usuario tras el restablecimiento de contraseña
SELECT id, email, password_hash, updated_at
FROM users
WHERE email = 'user@example.com';
```

#### Rastrear la Ruta de Ejecución

```php
// Añadir traza de pila en puntos sospechosos
debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
```

### Identificar la Causa Raíz

Categorías comunes:
- **Error de lógica**: Condición o cálculo incorrecto
- **Error de estado**: Estado de datos incorrecto
- **Condición de carrera**: Comportamiento dependiente del tiempo
- **Error de integración**: Problema con un servicio externo
- **Error de configuración**: Configuración incorrecta

### Lista de Verificación del Diagnóstico

- [ ] Bug reproducido de forma consistente
- [ ] Ubicación del error identificada
- [ ] Causa raíz comprendida
- [ ] Áreas de código relacionadas identificadas
- [ ] Enfoque de corrección determinado

---

## Fase 3: Escribir Test de Regresión

Escribe un test que falle ANTES de la corrección y que pase DESPUÉS.

### ¿Por Qué Hacer el Test Primero?

1. **Prueba que el bug existe**: El test falla con el código actual
2. **Prueba que la corrección funciona**: El test pasa después de la corrección
3. **Previene regresiones**: El test detecta futuras roturas
4. **Documenta el comportamiento**: El test describe el comportamiento esperado

### Usar el Entrenador TDD

```markdown
@tdd-coach Ayúdame a escribir un test de regresión para este bug

Bug: El restablecimiento de contraseña no actualiza el hash de contraseña correctamente

Comportamiento esperado:
- El usuario solicita el restablecimiento de contraseña
- El usuario establece una nueva contraseña
- El usuario puede iniciar sesión con la nueva contraseña

Comportamiento real:
- El inicio de sesión falla después del restablecimiento de contraseña
```

### Ejemplo de Test de Regresión

```php
/**
 * @test
 * @see https://github.com/company/project/issues/123
 *
 * Bug: Los usuarios no podían iniciar sesión después del restablecimiento de contraseña
 * Causa raíz: El hash de contraseña no se persistía correctamente
 */
public function test_user_can_login_after_password_reset(): void
{
    // Arrange: Crear usuario con contraseña conocida
    $user = $this->createUser('user@example.com', 'old-password');

    // Act: Restablecer contraseña
    $this->passwordResetService->resetPassword($user, 'new-password');

    // Assert: Puede iniciar sesión con la nueva contraseña
    $result = $this->authService->authenticate('user@example.com', 'new-password');

    $this->assertTrue($result->isSuccess());
    $this->assertNotNull($result->getToken());
}

/**
 * @test
 * Relacionado: Verificar que la contraseña antigua ya no funciona
 */
public function test_old_password_fails_after_reset(): void
{
    $user = $this->createUser('user@example.com', 'old-password');

    $this->passwordResetService->resetPassword($user, 'new-password');

    $result = $this->authService->authenticate('user@example.com', 'old-password');

    $this->assertFalse($result->isSuccess());
}
```

### Lista de Verificación para Escribir el Test

- [ ] El test reproduce el bug (falla antes de la corrección)
- [ ] El test tiene un nombre descriptivo
- [ ] El test hace referencia al número de incidencia
- [ ] El test documenta la causa raíz en un comentario
- [ ] Se testean los casos límite relacionados

---

## Fase 4: Corregir

Implementa la corrección mínima para el bug.

### Pautas para la Corrección

1. **Cambio mínimo**: Corrige solo el bug, no refactorices
2. **Intención clara**: El código debe mostrar qué era incorrecto
3. **Sin efectos secundarios**: No cambies el comportamiento no relacionado
4. **Mantener el estilo**: Seguir los patrones de código existentes

### Ejemplo de Corrección

```php
// ANTES (con bug)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    // Bug: ¡Falta persist/flush!
}

// DESPUÉS (corregido)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    $this->entityManager->persist($user);  // <-- Corrección
    $this->entityManager->flush();          // <-- Corrección
}
```

### Ejecutar el Test de Regresión

```bash
# El test debería pasar ahora
make test-unit TEST=tests/Unit/PasswordResetTest.php

# O ejecutar un test específico
./vendor/bin/phpunit --filter test_user_can_login_after_password_reset
```

### Lista de Verificación de la Corrección

- [ ] El test de regresión ahora pasa
- [ ] La corrección es mínima y enfocada
- [ ] No se incluyen cambios no relacionados
- [ ] Se mantiene el estilo del código

---

## Fase 5: Validar

Asegúrate de que la corrección no rompe nada más.

### Ejecutar la Suite de Tests Completa

```bash
# Todos los tests unitarios
make test-unit

# Todos los tests de integración
make test-integration

# Suite de tests completa
make test
```

### Comprobaciones de Calidad

```bash
# Calidad del código (según tecnología)
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality

# Seguridad (si la corrección toca código sensible)
/common:security-audit

# Cumplimiento completo
/symfony:check-compliance
```

### Pruebas Manuales

Incluso con tests automatizados, verifica manualmente:

1. Sigue los pasos originales de reproducción del bug
2. Verifica que el bug ya no ocurre
3. Prueba la funcionalidad relacionada
4. Comprueba los casos límite

### Usar el Agente Revisor

```markdown
@symfony-reviewer Revisa mi corrección del bug del issue #123

Bug: Los usuarios no podían iniciar sesión después del restablecimiento de contraseña
Corrección: Añadidos los persist/flush faltantes en resetPassword()

Archivos modificados:
- src/Application/Service/PasswordResetService.php
- tests/Unit/PasswordResetTest.php

Por favor comprueba:
1. La corrección es correcta y completa
2. Sin efectos secundarios
3. Cobertura de tests adecuada
```

### Lista de Verificación de Validación

- [ ] El test de regresión pasa
- [ ] Todos los tests existentes pasan
- [ ] El análisis estático pasa
- [ ] Las pruebas manuales confirman la corrección
- [ ] La revisión de código se ha completado

---

## Fase 6: Documentar

Documenta la corrección para referencia futura.

### Formato del Mensaje de Commit

```
fix(auth): resolver fallo de inicio de sesión tras restablecimiento de contraseña

Bug: Los usuarios no podían iniciar sesión después de restablecer su contraseña
Causa raíz: El cambio del hash de contraseña no se persistía en la base de datos
Corrección: Añadidas las llamadas a persist() y flush() en PasswordResetService

Closes #123

Test: test_user_can_login_after_password_reset
```

### Actualizar el Rastreador de Incidencias

```markdown
## Resolución

**Causa Raíz:**
El método `resetPassword()` en `PasswordResetService` actualizaba el hash de
contraseña del usuario en memoria pero no persistía el cambio en la base de datos.

**Corrección:**
Añadidas las llamadas a `persist()` y `flush()` después de establecer el nuevo
hash de contraseña.

**Testing:**
- Añadido el test de regresión `test_user_can_login_after_password_reset`
- Añadido el test de caso límite `test_old_password_fails_after_reset`

**Prevención:**
Considerar añadir un elemento de lista de verificación de revisión de código
para las operaciones de persistencia.
```

### Entrada en la Base de Conocimiento (si es un patrón recurrente)

```markdown
# Bug Común: Cambios en Entidades No Persistidos

## Síntomas
- Los cambios de datos parecen funcionar (sin errores)
- Los cambios no aparecen en la base de datos
- Los cambios se pierden tras la actualización

## Causa Raíz
Faltan las llamadas a `persist()` y/o `flush()` en Doctrine.

## Patrón de Corrección
```php
$entity->setSomething($value);
$this->entityManager->persist($entity); // ¡No olvidar!
$this->entityManager->flush();
```

## Prevención
- Añadir comprobación de persistencia a la lista de revisión de código
- Considerar el auto-flush en la clase base de servicio
```

### Lista de Verificación de Documentación

- [ ] El mensaje de commit describe el bug y la corrección
- [ ] El rastreador de incidencias actualizado con la resolución
- [ ] La documentación relacionada actualizada
- [ ] Entrada en la base de conocimiento si es un patrón

---

## Procedimientos de Hotfix

Para bugs críticos en producción.

### Flujo de Trabajo de Hotfix

```
1. Crear rama de hotfix desde producción
2. Aplicar la corrección mínima
3. Testear a fondo
4. Desplegar a producción
5. Fusionar de vuelta a main
```

### Paso a Paso

```bash
# 1. Crear rama de hotfix
git checkout production
git checkout -b hotfix/issue-123-login-failure

# 2. Aplicar la corrección
# ... hacer cambios ...

# 3. Escribir test de regresión
# ... añadir test ...

# 4. Verificar
make test
/symfony:check-compliance

# 5. Commit con mensaje claro
git commit -m "fix(auth): resolver fallo crítico de inicio de sesión tras restablecimiento de contraseña

HOTFIX para incidencia de producción.
Causa raíz: Hash de contraseña no persistido tras el restablecimiento.

Closes #123"

# 6. Crear PR para revisión
gh pr create --base production --title "HOTFIX: Fallo de inicio de sesión tras restablecimiento de contraseña"

# 7. Tras la fusión, desplegar
# ... proceso de despliegue ...

# 8. Fusionar de vuelta a main
git checkout main
git merge hotfix/issue-123-login-failure
git push origin main
```

### Lista de Verificación de Hotfix

- [ ] Rama de hotfix desde producción
- [ ] Corrección mínima y enfocada únicamente
- [ ] Test de regresión añadido
- [ ] Todos los tests pasando
- [ ] PR revisada y aprobada
- [ ] Desplegado a producción
- [ ] Verificado en producción
- [ ] Fusionado de vuelta a main

---

## Ejemplo Completo

Veamos la corrección de un bug real.

### Informe de Bug

```
Incidencia #456: Total del pedido calculado incorrectamente

Pasos para reproducir:
1. Añadir artículo con precio $10.00, cantidad 3
2. Añadir artículo con precio $5.50, cantidad 2
3. Ver el carrito

Esperado: Total = $41.00 (30 + 11)
Real: Total = $36.00

Entorno: Producción v2.3.1
Reportado por: Soporte al cliente
Prioridad: Alta
```

### Paso 1: Reproducir

```php
// Test local rápido
$order = new Order();
$order->addItem(new Item('A', 10.00), 3);  // $30
$order->addItem(new Item('B', 5.50), 2);   // $11
echo $order->getTotal(); // Muestra 36.00 - ¡confirmado!
```

### Paso 2: Diagnosticar

```markdown
@tdd-coach Ayúdame a encontrar el bug en el cálculo del total del pedido

El total debería ser 41.00 pero muestra 36.00
La diferencia es 5.00, que es exactamente el precio de uno de los artículos B

Hipótesis: ¿la cantidad del segundo artículo no se está contando?
```

La investigación revela:

```php
// Bug encontrado en Order::calculateTotal()
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // BUG: ¡Usando 1 en lugar de la cantidad del artículo!
        $total = $total->add($item->getPrice()->multiply(1));
    }
    return $total;
}
```

### Paso 3: Escribir Test de Regresión

```php
/**
 * @test
 * @see https://github.com/company/shop/issues/456
 *
 * Bug: El total del pedido ignoraba las cantidades de los artículos
 */
public function test_order_total_includes_all_quantities(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 3);  // $30
    $order->addItem($this->createItem(5.50), 2);   // $11

    $total = $order->calculateTotal();

    $this->assertEquals(41.00, $total->getAmount());
}

/**
 * @test
 * Caso límite: artículo único con cantidad > 1
 */
public function test_single_item_quantity_multiplied(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 5);

    $this->assertEquals(50.00, $order->calculateTotal()->getAmount());
}
```

Ejecutar el test: confirma que falla.

### Paso 4: Corregir

```php
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // Corregido: Usar la cantidad real del artículo del pedido
        $total = $total->add(
            $item->getPrice()->multiply($item->getQuantity())
        );
    }
    return $total;
}
```

### Paso 5: Validar

```bash
# El test de regresión pasa
./vendor/bin/phpunit --filter test_order_total

# Todos los tests pasan
make test

# Comprobación de calidad
/symfony:check-compliance
# Puntuación: 94/100 ✓
```

### Paso 6: Documentar

```bash
git commit -m "fix(order): corregir el cálculo del total para incluir las cantidades

Bug: El total del pedido ignoraba las cantidades de los artículos, usando siempre 1
Causa raíz: multiply(1) codificado en lugar de multiply(quantity)
Corrección: Usar getQuantity() del artículo del pedido en el cálculo

Closes #456

Tests de regresión añadidos:
- test_order_total_includes_all_quantities
- test_single_item_quantity_multiplied"
```

---

## Consejos para la Prevención de Bugs

1. **Escribir tests primero**: El TDD previene muchos bugs
2. **Revisión de código**: Los ojos frescos detectan problemas
3. **Análisis estático**: Las herramientas encuentran errores comunes
4. **Tests de integración**: Detectan bugs de interacción
5. **Monitorear producción**: Detectar problemas a tiempo
6. **Usar `/loop`**: Configurar comprobaciones de calidad recurrentes (p. ej., `/loop 5m /common:pre-commit-check`)
7. **Guardar aprendizajes**: Usar `/memory` para persistir patrones de bugs entre sesiones

---

[&larr; Desarrollo de Funcionalidades](03-feature-development.md) | [Referencia de Herramientas &rarr;](05-tools-reference.md)
