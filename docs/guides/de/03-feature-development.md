# Anleitung zur Feature-Entwicklung

Vollständiger Workflow zur Entwicklung neuer Features mit Claude-Craft.

---

## TDD-Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Analysieren│ -->│ 2. Entwerfen│ --> │  3. Tests   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Prüfen  │ <-- │5. Refactoring│ <--│4. Implementieren│
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Phase 1: Analyse

```bash
/common:analyze-feature "Benutzerauthentifizierung mit JWT-Tokens"
```

```markdown
@research-assistant Recherchiere Best Practices für JWT-Authentifizierung in Symfony 7
```

---

## Phase 2: Entwurf

### Datenbank
```markdown
@database-architect Entwerfe das Schema für die User-Entität mit Rollen und Berechtigungen
```

### API
```markdown
@api-designer Entwerfe die REST-API für Benutzerverwaltung
```

### Architekturentscheidung
```bash
/common:architecture-decision "Wie implementiert man rollenbasierte Zugriffskontrolle"
```

---

## Phase 3: Tests schreiben

```markdown
@tdd-coach Hilf mir, Tests für die Authentifizierungsmethode von UserService zu schreiben
```

### Testarten

**Unit-Tests:**
```php
public function test_user_can_change_password(): void
{
    $user = User::create('test@example.com', 'old-password');
    $user->changePassword('new-password');
    $this->assertTrue($user->verifyPassword('new-password'));
}
```

**Integrationstests:**
```php
public function test_user_service_creates_user_in_database(): void
{
    $service = $this->container->get(UserService::class);
    $user = $service->createUser('test@example.com', 'password');
    $this->assertNotNull($user->getId());
}
```

---

## Phase 4: Implementierung

### Generierungsbefehle

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

## Phase 5: Refactoring

```bash
/symfony:check-code-quality
/symfony:check-architecture
```

```markdown
@refactoring-specialist Überprüfe diese Service-Klasse auf mögliche Verbesserungen
```

---

## Phase 6: Überprüfung

```bash
# Vollständiges Audit (Punktzahl /100)
/symfony:check-compliance
```

```markdown
@symfony-reviewer Überprüfe meine vollständige User-Authentifizierungsimplementierung
```

```bash
/common:security-audit
```

---

## Feature-Checkliste

- [ ] User Story definiert
- [ ] Tests geschrieben (TDD)
- [ ] Code implementiert
- [ ] Tests bestanden (80%+ Abdeckung)
- [ ] Review durchgeführt
- [ ] Dokumentation aktualisiert

---

## Agenten-Übersicht

| Agent | Verwendung |
|-------|------------|
| `@api-designer` | API-Endpoint-Design |
| `@database-architect` | Datenbankschema-Design |
| `@tdd-coach` | Anleitung zum Testschreiben |
| `@refactoring-specialist` | Code-Verbesserung |
| `@{tech}-reviewer` | Code-Review |

---

[&larr; Projekterstellung](02-project-creation.md) | [Fehlerbehebung &rarr;](04-bug-fixing.md)
