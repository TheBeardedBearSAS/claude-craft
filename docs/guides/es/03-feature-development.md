# Guía de Desarrollo de Funcionalidades

Esta guía cubre el flujo de trabajo completo para desarrollar nuevas funcionalidades con Claude-Craft, desde el análisis inicial hasta la revisión final.

---

## Tabla de Contenidos

1. [Visión General del Flujo TDD](#visión-general-del-flujo-tdd)
2. [Fase 1: Análisis](#fase-1-análisis)
3. [Fase 2: Diseño](#fase-2-diseño)
4. [Fase 3: Escritura de Tests](#fase-3-escritura-de-tests)
5. [Fase 4: Implementación](#fase-4-implementación)
6. [Fase 5: Refactorización](#fase-5-refactorización)
7. [Fase 6: Revisión](#fase-6-revisión)
8. [Ejemplo Completo](#ejemplo-completo)
9. [Recursos Disponibles](#recursos-disponibles)

---

## Visión General del Flujo TDD

Claude-Craft impone un flujo de trabajo de Desarrollo Guiado por Tests (TDD):

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  1. Analizar│ --> │  2. Diseñar │ --> │  3. Tests   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Revisar │ <-- │5. Refactori.│ <-- │4. Implementar│
└─────────────┘     └─────────────┘     └─────────────┘
```

### ¿Por qué TDD?

- **Confianza**: Los tests demuestran que tu código funciona
- **Documentación**: Los tests describen el comportamiento esperado
- **Diseño**: Escribir los tests primero conduce a mejores APIs
- **Regresión**: Los tests detectan bugs futuros

---

## Fase 1: Análisis

Antes de escribir cualquier código, comprende qué necesita construirse.

### Establecer el Nivel de Esfuerzo

Para las fases de análisis que requieren razonamiento profundo, establece un esfuerzo alto:

```bash
/effort high
```

Usa `/effort low` para búsquedas simples y `/effort medium` para trabajo de implementación estándar.

> **Modelos actuales (junio de 2026):** `low` → Haiku 4.5, `medium` → **Sonnet 5** (`claude-sonnet-5`, lanzado el 2026-06-30 — agéntico, precio inicial $2/$10 por M tokens hasta el 2026-08-31), `high`/`xhigh` → Opus 4.8. El alias `model:` se resuelve automáticamente a la última versión, así que `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` ahora apunta a Sonnet 5. Fable 5 está suspendido — no usarlo. Tabla completa de precios/enrutamiento: [FAQ](../../FAQ.md).

### Usar el Comando de Análisis

```bash
/common:analyze-feature "Autenticación de usuario con tokens JWT y acceso basado en roles"
```

Este comando hará lo siguiente:
1. Desglosar la funcionalidad en componentes
2. Identificar los requisitos técnicos
3. Listar posibles casos límite
4. Sugerir el enfoque de implementación

### Usar el Agente de Investigación

```markdown
@research-assistant Investiga las mejores prácticas para autenticación JWT en Symfony 7
```

El agente de investigación hará lo siguiente:
- Buscar documentación y mejores prácticas
- Resumir los hallazgos
- Proporcionar ejemplos de código
- Destacar consideraciones de seguridad

### Lista de Verificación del Análisis

- [ ] Historia de usuario claramente definida
- [ ] Criterios de aceptación documentados
- [ ] Casos límite identificados
- [ ] Enfoque técnico elegido
- [ ] Dependencias identificadas
- [ ] Implicaciones de seguridad revisadas

---

## Fase 2: Diseño

Diseña la arquitectura antes de la implementación.

### Diseño de Base de Datos

```markdown
@database-architect Diseña el esquema para la entidad User con roles y permisos

Requisitos:
- El usuario puede tener múltiples roles
- Los roles tienen permisos
- Soporte para borrado lógico (soft delete)
- Historial de auditoría para los cambios
```

El arquitecto de base de datos hará lo siguiente:
- Diseñar el esquema normalizado
- Sugerir índices
- Considerar relaciones
- Planificar migraciones

### Diseño de API

```markdown
@api-designer Diseña la API REST para la gestión de usuarios

Endpoints necesarios:
- Operaciones CRUD para usuarios
- Asignación de roles
- Autenticación (login/logout)
- Flujo de restablecimiento de contraseña
```

El diseñador de API hará lo siguiente:
- Definir endpoints y métodos
- Especificar formatos de solicitud/respuesta
- Documentar los requisitos de autenticación
- Planificar las respuestas de error

### Decisión de Arquitectura

```bash
/common:architecture-decision "Cómo implementar el control de acceso basado en roles"
```

Usa este comando para decisiones arquitectónicas importantes. Crea un Registro de Decisión de Arquitectura (ADR) que documenta:
- Contexto y problema
- Opciones consideradas
- Solución elegida
- Consecuencias

### Lista de Verificación del Diseño

- [ ] Esquema de base de datos diseñado
- [ ] Endpoints de la API definidos
- [ ] Decisiones arquitectónicas documentadas
- [ ] Modelo de seguridad definido
- [ ] Estrategia de manejo de errores planificada

---

## Fase 3: Escritura de Tests

Escribe tests ANTES de la implementación. Esto es el "TDD" en TDD.

### Usar el Entrenador TDD

```markdown
@tdd-coach Ayúdame a escribir tests para el método de autenticación de UserService

El método debe:
- Aceptar email y contraseña
- Devolver un token JWT en caso de éxito
- Lanzar una excepción con credenciales inválidas
- Bloquear la cuenta después de 5 intentos fallidos
```

El entrenador TDD hará lo siguiente:
- Sugerir casos de prueba
- Escribir ejemplos de código de prueba
- Explicar las aserciones
- Identificar casos límite

### Categorías de Tests

#### Tests Unitarios

Prueba componentes individuales de forma aislada:

```php
// tests/Unit/Domain/User/UserTest.php
public function test_user_can_change_password(): void
{
    $user = User::create(
        email: 'test@example.com',
        password: 'old-password'
    );

    $user->changePassword('new-password');

    $this->assertTrue($user->verifyPassword('new-password'));
    $this->assertFalse($user->verifyPassword('old-password'));
}
```

#### Tests de Integración

Prueba las interacciones entre componentes:

```php
// tests/Integration/UserServiceTest.php
public function test_user_service_creates_user_in_database(): void
{
    $service = $this->container->get(UserService::class);

    $user = $service->createUser(
        email: 'test@example.com',
        password: 'secure-password'
    );

    $this->assertNotNull($user->getId());
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
}
```

#### Tests BDD/Funcionales

Prueba escenarios de negocio:

```gherkin
# features/authentication.feature
Feature: User Authentication
  As a user
  I want to log in with my credentials
  So that I can access protected resources

  Scenario: Successful login
    Given I have a registered user with email "user@example.com"
    When I submit valid credentials
    Then I should receive a JWT token
    And the token should be valid for 1 hour
```

### Comandos de Tests Específicos por Tecnología

```bash
# Symfony
/symfony:check-testing

# Flutter
/flutter:check-testing

# Python
/python:check-testing

# React
/react:check-testing
```

### Lista de Verificación de Escritura de Tests

- [ ] Tests unitarios para la lógica del dominio
- [ ] Tests de integración para los servicios
- [ ] Tests de API para los endpoints
- [ ] Casos límite cubiertos
- [ ] Escenarios de error probados
- [ ] Todos los tests fallando (aún no implementados)

---

## Fase 4: Implementación

Ahora implementa el código para que los tests pasen.

### Comandos de Generación de Código

#### Symfony

```bash
# Generar CRUD con tests
/symfony:generate-crud User

# Generar endpoint de API
/symfony:api-endpoint POST /api/users CreateUserRequest

# Generar comando
/symfony:generate-command SendWelcomeEmailCommand
```

#### Flutter

```bash
# Generar BLoC
/flutter:generate-bloc Authentication

# Generar pantalla
/flutter:generate-screen LoginScreen

# Generar widget
/flutter:generate-widget UserAvatar
```

#### Python

```bash
# Generar endpoint FastAPI
/python:generate-endpoint POST /users CreateUser

# Generar servicio
/python:generate-service UserService

# Generar modelo
/python:generate-model User
```

#### React

```bash
# Generar componente
/react:generate-component UserProfile

# Generar hook
/react:generate-hook useAuth

# Generar contexto
/react:generate-context AuthContext
```

### Usar Plantillas

Las plantillas proporcionan patrones de código listos para usar. Accede a ellas con:

```markdown
Muéstrame la plantilla de servicio para Symfony
```

Plantillas disponibles por tecnología:

| Symfony | Flutter | Python | React |
|---------|---------|--------|-------|
| service.md | bloc.md | service.md | component.md |
| value-object.md | widget.md | repository.md | hook.md |
| aggregate-root.md | screen.md | endpoint.md | context.md |
| domain-event.md | state.md | model.md | reducer.md |
| repository.md | cubit.md | schema.md | - |

### Mejores Prácticas de Implementación

1. **Un test a la vez**: Haz pasar un test antes de pasar al siguiente
2. **Código mínimo**: Escribe solo el código necesario para pasar el test
3. **Sin optimización prematura**: Concéntrate en la corrección primero
4. **Seguir patrones existentes**: Usa plantillas y convenciones

### Lista de Verificación de Implementación

- [ ] Todos los tests unitarios pasando
- [ ] Todos los tests de integración pasando
- [ ] Todos los tests de API pasando
- [ ] Sin valores codificados en duro
- [ ] Manejo de errores implementado
- [ ] Logging añadido

---

## Fase 5: Refactorización

Con los tests pasando, mejora la calidad del código.

### Comandos de Refactorización

```bash
# Verificar calidad del código
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality
/react:check-code-quality

# Verificar cumplimiento de la arquitectura
/symfony:check-architecture
/flutter:check-architecture
```

### Usar el Especialista en Refactorización

```markdown
@refactoring-specialist Revisa esta clase de servicio para posibles mejoras

[pega el código aquí]
```

El especialista en refactorización hará lo siguiente:
- Identificar malos olores de código (code smells)
- Sugerir mejoras
- Mostrar ejemplos refactorizados
- Explicar las compensaciones (trade-offs)

### Patrones Comunes de Refactorización

1. **Extraer Método**: Dividir métodos largos en otros más pequeños
2. **Extraer Clase**: Separar clases grandes
3. **Introducir Value Object**: Reemplazar primitivos con tipos de dominio
4. **Reemplazar Condicional con Polimorfismo**: Usar el patrón Strategy
5. **Mover Método**: Colocar los métodos donde pertenecen

### Lista de Verificación de Refactorización

- [ ] Sin duplicación de código
- [ ] Métodos de menos de 20 líneas
- [ ] Clases de menos de 200 líneas
- [ ] Nombres claros
- [ ] Estilo consistente
- [ ] Todos los tests siguen pasando

---

## Fase 6: Revisión

Verificación de calidad final antes de la finalización.

### Auditoría de Cumplimiento

```bash
# Verificación de cumplimiento completa (devuelve puntuación /100)
/symfony:check-compliance
/flutter:check-compliance
/python:check-compliance
/react:check-compliance
```

Esta auditoría completa verifica:
- Cumplimiento de arquitectura
- Calidad del código
- Cobertura de tests
- Problemas de seguridad
- Documentación

### Revisión de Código con Agentes

```markdown
@symfony-reviewer Revisa mi implementación completa de autenticación de usuario

Archivos modificados:
- src/Domain/User/User.php
- src/Application/Service/AuthenticationService.php
- src/Infrastructure/Security/JwtTokenGenerator.php
- tests/Unit/Domain/User/UserTest.php
- tests/Integration/AuthenticationServiceTest.php
```

El revisor hará lo siguiente:
- Verificar el cumplimiento de la arquitectura
- Identificar posibles problemas
- Sugerir mejoras
- Verificar las mejores prácticas

### Auditoría de Seguridad

```bash
/common:security-audit
```

O usa el agente enfocado en seguridad:

```markdown
@devops-engineer Revisa la seguridad del sistema de autenticación

Preocupaciones:
- Seguridad del token JWT
- Almacenamiento de contraseñas
- Rate limiting
- Configuración CORS
```

### Lista de Verificación de la Funcionalidad

Usa la lista de verificación incorporada:

```bash
cat .claude/checklists/feature-checklist.md
```

Elementos clave:
- [ ] Requisitos de la historia de usuario cumplidos
- [ ] Todos los criterios de aceptación verificados
- [ ] Tests escritos y pasando (cobertura ≥80%)
- [ ] Código revisado
- [ ] Auditoría de seguridad superada
- [ ] Documentación actualizada
- [ ] Sin problemas críticos en el análisis estático
- [ ] Rendimiento aceptable
- [ ] Listo para revisión de código

---

## Ejemplo Completo

Veamos un ejemplo completo: Añadir registro de usuarios.

### Paso 1: Analizar

```markdown
/common:analyze-feature "Registro de usuario con verificación de correo electrónico"

Esperado:
- El usuario envía email y contraseña
- El sistema envía un correo de verificación
- El usuario hace clic en el enlace para verificar
- La cuenta se activa
```

### Paso 2: Diseñar la Base de Datos

```markdown
@database-architect Diseña el esquema para User con verificación de email

Campos necesarios:
- id, email, password_hash
- email_verified_at (timestamp nullable)
- verification_token
- created_at, updated_at
```

### Paso 3: Diseñar la API

```markdown
@api-designer Diseña los endpoints de la API de registro

POST /api/register - Crear cuenta
POST /api/verify-email - Verificar email con token
POST /api/resend-verification - Reenviar email de verificación
```

### Paso 4: Escribir los Tests

```markdown
@tdd-coach Ayúdame a escribir tests para UserRegistrationService

Casos de prueba:
1. El registro exitoso crea al usuario
2. El email duplicado devuelve un error
3. La contraseña débil devuelve un error
4. Se envía el email de verificación
5. El token de verificación activa la cuenta
6. El token expirado devuelve un error
```

### Paso 5: Generar el Código

```bash
/symfony:generate-crud User --with-api
/symfony:generate-command SendVerificationEmailCommand
```

### Paso 6: Implementar

Haz pasar los tests uno a uno:

```php
// Hacer pasar el test 1
public function register(string $email, string $password): User
{
    $user = User::create($email, $password);
    $this->repository->save($user);
    return $user;
}

// Hacer pasar el test 2
public function register(string $email, string $password): User
{
    if ($this->repository->findByEmail($email)) {
        throw new DuplicateEmailException($email);
    }
    // ...
}

// Continuar para cada test...
```

### Paso 7: Refactorizar

```bash
/symfony:check-code-quality
```

Corrige los problemas identificados.

### Paso 8: Revisar

```markdown
@symfony-reviewer Revisa mi implementación de registro de usuarios

Implementación completa que incluye:
- Domain: entidad User, ValueObjects
- Application: RegistrationService
- Infrastructure: DoctrineUserRepository
- API: RegisterController
- Tests: Unitarios, Integración, API
```

### Paso 9: Verificación Final

```bash
/symfony:check-compliance
```

Objetivo: Puntuación ≥90/100

---

## Recursos Disponibles

### Resumen de Agentes

| Agente | Usar Para |
|--------|----------|
| `@api-designer` | Diseño de endpoints de API |
| `@database-architect` | Diseño de esquema de base de datos |
| `@tdd-coach` | Guía para escritura de tests |
| `@refactoring-specialist` | Mejora de código |
| `@{tech}-reviewer` | Revisión de código |
| `@devops-engineer` | Revisión de infraestructura |
| `@research-assistant` | Investigación de mejores prácticas |

### Resumen de Comandos

| Fase | Comandos |
|------|----------|
| Análisis | `/common:analyze-feature` |
| Diseño | `/common:architecture-decision` |
| Testing | `/{tech}:check-testing` |
| Generación | `/{tech}:generate-*` |
| Calidad | `/{tech}:check-code-quality` |
| Revisión | `/{tech}:check-compliance` |
| Seguridad | `/common:security-audit` |

### Ubicación de Plantillas

```bash
ls .claude/templates/
```

### Ubicación de Listas de Verificación

```bash
ls .claude/checklists/
```

---

## Consejos para el Éxito

1. **No omitas los tests**: Son tu red de seguridad
2. **Usa los agentes**: Proporcionan orientación experta
3. **Ejecuta verificaciones de cumplimiento frecuentemente**: Detecta problemas con anticipación
4. **Sigue el flujo de trabajo**: Cada fase tiene un propósito
5. **Documenta las decisiones**: Usa ADRs para elecciones importantes
6. **Gestiona el contexto**: Usa `/context` para ver sugerencias de optimización, `/clear` entre fases
7. **Ajusta el esfuerzo**: Usa `/effort high` para análisis/diseño, `/effort low` para generación de código

---

[&larr; Creación de Proyectos](02-project-creation.md) | [Corrección de Errores &rarr;](04-bug-fixing.md)
