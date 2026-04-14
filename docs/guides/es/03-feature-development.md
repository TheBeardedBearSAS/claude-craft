# Guía de Desarrollo de Funcionalidades

Flujo de trabajo completo para desarrollar nuevas funcionalidades con Claude-Craft.

---

## Flujo de Trabajo TDD

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Analizar │ --> │ 2. Diseñar  │ --> │  3. Tests   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Revisar │ <-- │5. Refactorizar│ <--│4. Implementar│
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Fase 1: Análisis

```bash
/common:analyze-feature "Autenticación de usuarios con tokens JWT"
```

```markdown
@research-assistant Investiga las mejores prácticas para autenticación JWT en Symfony 7
```

---

## Fase 2: Diseño

### Base de Datos
```markdown
@database-architect Diseña el esquema para la entidad User con roles y permisos
```

### API
```markdown
@api-designer Diseña la API REST para gestión de usuarios
```

### Decisión Arquitectónica
```bash
/common:architecture-decision "Cómo implementar control de acceso basado en roles"
```

---

## Fase 3: Escribir Tests

```markdown
@tdd-coach Ayúdame a escribir tests para el método de autenticación de UserService
```

### Tipos de Tests

**Tests Unitarios:**
```php
public function test_user_can_change_password(): void
{
    $user = User::create('test@example.com', 'old-password');
    $user->changePassword('new-password');
    $this->assertTrue($user->verifyPassword('new-password'));
}
```

**Tests de Integración:**
```php
public function test_user_service_creates_user_in_database(): void
{
    $service = $this->container->get(UserService::class);
    $user = $service->createUser('test@example.com', 'password');
    $this->assertNotNull($user->getId());
}
```

---

## Fase 4: Implementación

### Comandos de Generación

```bash
# Symfony
/symfony:generate-crud User
/symfony:api-endpoint POST /api/users CreateUserRequest

# Flutter
/flutter:generate-feature Authentication
/flutter:generate-widget LoginScreen

# Python
/python:generate-endpoint POST /users CreateUser
/python:generate-model User

# React
/react:generate-component UserProfile
/react:generate-hook useAuth

# Angular
/angular:generate-component UserProfile

# Vue.js
/vuejs:generate-component UserProfile

# C# / .NET
/csharp:generate-feature User

# Laravel
/laravel:generate-controller UserController

# React Native
/reactnative:generate-screen LoginScreen
```

---

## Fase 5: Refactorización

```bash
/symfony:check-code-quality
/symfony:check-architecture
```

```markdown
@refactoring-specialist Revisa esta clase de servicio para mejoras potenciales
```

---

## Fase 6: Revisión

```bash
# Auditoría completa (puntuación /100)
/symfony:check-compliance
```

```markdown
@symfony-reviewer Revisa mi implementación completa de autenticación de Usuario
```

```bash
/common:security-audit
```

---

## Checklist de Funcionalidad

- [ ] User story definida
- [ ] Tests escritos (TDD)
- [ ] Código implementado
- [ ] Tests pasan (80%+ cobertura)
- [ ] Revisión efectuada
- [ ] Documentación actualizada

---

## Resumen de Agentes

| Agente | Uso |
|--------|-----|
| `@api-designer` | Diseño de endpoints API |
| `@database-architect` | Diseño de esquemas BD |
| `@tdd-coach` | Guía para escritura de tests |
| `@refactoring-specialist` | Mejora de código |
| `@{tech}-reviewer` | Revisión de código |

---

[&larr; Creación de Proyecto](02-project-creation.md) | [Corrección de Bugs &rarr;](04-bug-fixing.md)
