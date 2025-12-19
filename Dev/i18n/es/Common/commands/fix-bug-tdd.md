---
description: Corrección de Bug en Modo TDD/BDD
argument-hint: [arguments]
---

# Corrección de Bug en Modo TDD/BDD

Eres un desarrollador senior experto en TDD (Test-Driven Development) y BDD (Behavior-Driven Development). Debes corregir un bug siguiendo estrictamente la metodología TDD/BDD: primero escribir una prueba fallida que reproduzca el bug, luego corregir el código para que la prueba pase.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripción del bug o enlace al ticket
- (Opcional) Archivo o módulo afectado

Ejemplo: `/common:fix-bug-tdd "Usuario no puede cerrar sesión"` o `/common:fix-bug-tdd #123`

## MISIÓN

### Filosofía TDD/BDD

```
ROJO → VERDE → REFACTORIZAR

1. ROJO    : Escribir prueba fallida (reproduce el bug)
2. VERDE   : Escribir código mínimo para hacer pasar la prueba
3. REFACTORIZAR : Mejorar código sin romper pruebas
```

### Paso 1: Entender el Bug

#### Recopilar información
- Descripción precisa del comportamiento actual
- Comportamiento esperado
- Pasos de reproducción
- Entorno afectado
- Logs/stack traces disponibles

#### Preguntas a hacer
1. ¿Cuál es el comportamiento actual?
2. ¿Cuál debería ser el comportamiento correcto?
3. ¿Cuándo se introdujo el bug? (git bisect si es necesario)
4. ¿Cuáles son los casos extremos?
5. ¿Hay pruebas existentes que deberían haber detectado este bug?

### Paso 2: ROJO - Escribir la Prueba Fallida

#### Formato BDD (estilo Gherkin)

```gherkin
Feature: [Funcionalidad afectada]
  Como [tipo de usuario]
  Quiero [acción]
  Para [beneficio]

  Scenario: [Descripción del caso del bug]
    Dado [contexto/estado inicial]
    Cuando [acción que desencadena el bug]
    Entonces [comportamiento esperado que actualmente no ocurre]
```

#### Prueba Unitaria

```python
# Python - pytest
class TestBugFix:
    """
    Bug: [Descripción corta]
    Ticket: #XXX

    Comportamiento actual: [lo que pasa]
    Comportamiento esperado: [lo que debería pasar]
    """

    def test_should_[comportamiento_esperado]_when_[condicion](self):
        # Arrange - Preparar contexto
        # ...

        # Act - Ejecutar acción que causa el bug
        # ...

        # Assert - Verificar comportamiento esperado
        # Esta prueba DEBE fallar antes de la corrección
        assert result == expected_value
```

```typescript
// TypeScript - Jest
describe('Bug #XXX: [Descripción]', () => {
  /**
   * Comportamiento actual: [lo que pasa]
   * Comportamiento esperado: [lo que debería pasar]
   */
  it('should [comportamiento esperado] when [condición]', () => {
    // Arrange
    const input = prepareTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert - Esta prueba DEBE fallar antes de la corrección
    expect(result).toBe(expectedValue);
  });
});
```

```php
// PHP - PHPUnit
/**
 * @testdox Bug #XXX: [Descripción del bug]
 */
class BugFixTest extends TestCase
{
    /**
     * Comportamiento actual: [lo que pasa]
     * Comportamiento esperado: [lo que debería pasar]
     *
     * @test
     */
    public function it_should_comportamiento_esperado_when_condicion(): void
    {
        // Arrange
        $input = $this->prepareTestData();

        // Act
        $result = $this->service->methodUnderTest($input);

        // Assert - Esta prueba DEBE fallar antes de la corrección
        $this->assertEquals($expectedValue, $result);
    }
}
```

```dart
// Dart - Flutter test
group('Bug #XXX: [Descripción]', () {
  /// Comportamiento actual: [lo que pasa]
  /// Comportamiento esperado: [lo que debería pasar]
  test('should [comportamiento esperado] when [condición]', () {
    // Arrange
    final input = prepareTestData();

    // Act
    final result = functionUnderTest(input);

    // Assert - Esta prueba DEBE fallar antes de la corrección
    expect(result, equals(expectedValue));
  });
});
```

### Paso 3: Verificar que la Prueba Falla

```bash
# Ejecutar prueba específica
# Python
pytest tests/test_bug_xxx.py -v

# JavaScript/TypeScript
npm test -- --testPathPattern="bug-xxx"

# PHP
./vendor/bin/phpunit --filter "it_should_comportamiento_esperado"

# Flutter
flutter test test/bug_xxx_test.dart
```

**IMPORTANTE**: La prueba DEBE fallar en esta etapa. Si la prueba pasa, significa:
- La prueba no reproduce correctamente el bug
- El bug ya fue corregido
- La prueba está mal escrita

### Paso 4: VERDE - Corregir el Bug (Código Mínimo)

#### Principios
1. Escribir el código MÍNIMO para hacer pasar la prueba
2. No anticipar otros casos
3. No refactorizar todavía
4. Mantener código simple

#### Proceso
1. Identificar causa raíz
2. Implementar corrección mínima
3. Volver a ejecutar la prueba
4. Asegurar que la prueba pasa

```bash
# Volver a ejecutar prueba después de la corrección
# La prueba DEBE pasar ahora
```

### Paso 5: Verificar No-Regresión

```bash
# Ejecutar TODAS las pruebas existentes
# Python
pytest

# JavaScript/TypeScript
npm test

# PHP
./vendor/bin/phpunit

# Flutter
flutter test

# TODAS las pruebas deben pasar
```

### Paso 6: REFACTORIZAR - Mejorar el Código

#### Lista de Verificación de Refactorización
- [ ] ¿Es el código legible?
- [ ] ¿Hay duplicación?
- [ ] ¿Son explícitos los nombres?
- [ ] ¿Hace la función una sola cosa?
- [ ] ¿Respeta el código las convenciones del proyecto?

#### Después de cada modificación
```bash
# Volver a ejecutar pruebas después de cada refactorización
# Las pruebas deben pasar siempre
```

### Paso 7: Agregar Pruebas Complementarias

#### Casos extremos a cubrir
```python
class TestBugFixEdgeCases:
    """Pruebas complementarias para casos extremos."""

    def test_with_empty_input(self):
        """Verificar comportamiento con entrada vacía."""
        pass

    def test_with_null_input(self):
        """Verificar comportamiento con null."""
        pass

    def test_with_maximum_values(self):
        """Verificar comportamiento en límites."""
        pass

    def test_with_special_characters(self):
        """Verificar comportamiento con caracteres especiales."""
        pass
```

### Paso 8: Documentación

#### Comentario en prueba
```python
def test_logout_clears_session_bug_123(self):
    """
    Prueba de regresión para bug #123.

    Problema: La sesión del usuario no se borraba al cerrar sesión, permitiendo
              acceso a recursos protegidos después del cierre de sesión.

    Causa raíz: Session.destroy() no se llamaba en el manejador de logout.

    Corrección: Se agregó llamada a Session.destroy() antes del redirect.

    Fecha: 2024-01-15
    Autor: developer@example.com
    """
```

#### Mensaje de commit
```
fix(auth): borrar sesión al cerrar sesión (#123)

- Agregar prueba de regresión para bug de logout
- Llamar Session.destroy() en manejador de logout
- Verificar que sesión se borra antes de redirect

Fixes #123
```

### Reporte Final

```
══════════════════════════════════════════════════════════════
🐛 REPORTE DE CORRECCIÓN DE BUG - TDD/BDD
══════════════════════════════════════════════════════════════

Ticket: #XXX
Descripción: [Descripción del bug]

──────────────────────────────────────────────────────────────
📋 ANÁLISIS
──────────────────────────────────────────────────────────────

Comportamiento actual:
[Lo que estaba pasando]

Comportamiento esperado:
[Lo que debería pasar]

Causa raíz:
[Por qué ocurrió el bug]

──────────────────────────────────────────────────────────────
🔴 PRUEBA ESCRITA (ROJO)
──────────────────────────────────────────────────────────────

Archivo: tests/test_xxx.py
Prueba: test_should_xxx_when_yyy

```python
def test_should_xxx_when_yyy(self):
    # ... código de prueba
```

Resultado inicial: ❌ FAIL
Mensaje: AssertionError: expected X but got Y

──────────────────────────────────────────────────────────────
🟢 CORRECCIÓN (VERDE)
──────────────────────────────────────────────────────────────

Archivo modificado: src/module/file.py
Líneas: 45-52

```python
# Antes
def problematic_function():
    # código con bug

# Después
def problematic_function():
    # código corregido
```

Resultado después de corrección: ✅ PASS

──────────────────────────────────────────────────────────────
♻️ REFACTORIZACIÓN
──────────────────────────────────────────────────────────────

- [x] Código simplificado
- [x] Variable renombrada para claridad
- [x] Duplicación eliminada

──────────────────────────────────────────────────────────────
✅ PRUEBAS
──────────────────────────────────────────────────────────────

| Prueba | Estado |
|------|--------|
| test_should_xxx_when_yyy (nueva) | ✅ |
| test_existing_1 | ✅ |
| test_existing_2 | ✅ |
| ... | ✅ |

Total: XX pruebas, 0 fallos

──────────────────────────────────────────────────────────────
📝 COMMIT
──────────────────────────────────────────────────────────────

```
fix(module): descripción corta (#XXX)

- Agregar prueba de regresión
- Corregir causa raíz
- Agregar pruebas de casos extremos

Fixes #XXX
```

──────────────────────────────────────────────────────────────
🎯 ACCIONES POST-CORRECCIÓN
──────────────────────────────────────────────────────────────

- [ ] PR creado
- [ ] Revisión de código solicitada
- [ ] Documentación actualizada
- [ ] Ticket cerrado
```
