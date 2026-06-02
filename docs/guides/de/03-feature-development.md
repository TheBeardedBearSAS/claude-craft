# Leitfaden zur Feature-Entwicklung

Dieser Leitfaden beschreibt den vollständigen Workflow für die Entwicklung neuer Features mit Claude-Craft, von der ersten Analyse bis zum abschließenden Review.

---

## Inhaltsverzeichnis

1. [TDD-Workflow – Überblick](#tdd-workflow-überblick)
2. [Phase 1: Analyse](#phase-1-analyse)
3. [Phase 2: Design](#phase-2-design)
4. [Phase 3: Tests schreiben](#phase-3-tests-schreiben)
5. [Phase 4: Implementierung](#phase-4-implementierung)
6. [Phase 5: Refactoring](#phase-5-refactoring)
7. [Phase 6: Review](#phase-6-review)
8. [Vollständiges Beispiel](#vollständiges-beispiel)
9. [Verfügbare Ressourcen](#verfügbare-ressourcen)

---

## TDD-Workflow – Überblick

Claude-Craft setzt einen testgetriebenen Entwicklungs-Workflow durch:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  1. Analyse │ --> │  2. Design  │ --> │  3. Tests   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Review  │ <-- │ 5. Refactor │ <-- │ 4. Implment.│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Warum TDD?

- **Sicherheit**: Tests beweisen, dass Ihr Code funktioniert
- **Dokumentation**: Tests beschreiben das erwartete Verhalten
- **Design**: Tests zuerst zu schreiben führt zu besseren APIs
- **Regression**: Tests decken künftige Bugs auf

---

## Phase 1: Analyse

Bevor Sie Code schreiben, verstehen Sie zunächst, was gebaut werden muss.

### Aufwandsstufe festlegen

Für Analysephasen, die tiefes Nachdenken erfordern, wählen Sie einen hohen Aufwand:

```bash
/effort high
```

Verwenden Sie `/effort low` für einfache Nachschläge und `/effort medium` für Standard-Implementierungsarbeiten.

### Den Analysebefehl verwenden

```bash
/common:analyze-feature "User authentication with JWT tokens and role-based access"
```

Dieser Befehl wird:
1. Das Feature in Komponenten aufschlüsseln
2. Technische Anforderungen identifizieren
3. Mögliche Randfälle auflisten
4. Einen Implementierungsansatz vorschlagen

### Den Research-Agenten verwenden

```markdown
@research-assistant Research best practices for JWT authentication in Symfony 7
```

Der Research-Agent wird:
- Dokumentation und Best Practices durchsuchen
- Ergebnisse zusammenfassen
- Code-Beispiele bereitstellen
- Sicherheitsaspekte hervorheben

### Analyse-Checkliste

- [ ] User Story klar definiert
- [ ] Abnahmekriterien dokumentiert
- [ ] Randfälle identifiziert
- [ ] Technischer Ansatz gewählt
- [ ] Abhängigkeiten identifiziert
- [ ] Sicherheitsimplikationen geprüft

---

## Phase 2: Design

Entwerfen Sie die Architektur vor der Implementierung.

### Datenbankdesign

```markdown
@database-architect Design the schema for User entity with roles and permissions

Requirements:
- User can have multiple roles
- Roles have permissions
- Support for soft delete
- Audit trail for changes
```

Der Datenbankarchitekt wird:
- Ein normalisiertes Schema entwerfen
- Indizes vorschlagen
- Beziehungen berücksichtigen
- Migrationen planen

### API-Design

```markdown
@api-designer Design the REST API for user management

Endpoints needed:
- CRUD operations for users
- Role assignment
- Authentication (login/logout)
- Password reset flow
```

Der API-Designer wird:
- Endpunkte und Methoden definieren
- Request-/Response-Formate festlegen
- Authentifizierungsanforderungen dokumentieren
- Fehlerantworten planen

### Architekturentscheidung

```bash
/common:architecture-decision "How to implement role-based access control"
```

Verwenden Sie diesen Befehl für wichtige Architekturentscheidungen. Er erstellt einen Architecture Decision Record (ADR), der Folgendes dokumentiert:
- Kontext und Problem
- Betrachtete Optionen
- Gewählte Lösung
- Konsequenzen

### Design-Checkliste

- [ ] Datenbankschema entworfen
- [ ] API-Endpunkte definiert
- [ ] Architekturentscheidungen dokumentiert
- [ ] Sicherheitsmodell definiert
- [ ] Strategie für Fehlerbehandlung geplant

---

## Phase 3: Tests schreiben

Schreiben Sie Tests VOR der Implementierung. Das ist das „TDD" in TDD.

### Den TDD-Coach verwenden

```markdown
@tdd-coach Help me write tests for the UserService authentication method

The method should:
- Accept email and password
- Return JWT token on success
- Throw exception on invalid credentials
- Lock account after 5 failed attempts
```

Der TDD-Coach wird:
- Testfälle vorschlagen
- Testcode-Beispiele schreiben
- Assertions erklären
- Randfälle identifizieren

### Testkategorien

#### Unit-Tests

Einzelne Komponenten isoliert testen:

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

#### Integrationstests

Zusammenspiel von Komponenten testen:

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

#### BDD-/Funktionale Tests

Geschäftliche Szenarien testen:

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

### Technologiespezifische Testbefehle

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

### Checkliste für das Schreiben von Tests

- [ ] Unit-Tests für die Domänenlogik
- [ ] Integrationstests für Services
- [ ] API-Tests für Endpunkte
- [ ] Randfälle abgedeckt
- [ ] Fehlerszenarien getestet
- [ ] Alle Tests schlagen fehl (noch nicht implementiert)

---

## Phase 4: Implementierung

Jetzt implementieren Sie den Code, damit die Tests bestehen.

### Codegenerierungsbefehle

#### Symfony

```bash
# CRUD mit Tests generieren
/symfony:generate-crud User

# API-Endpunkt generieren
/symfony:api-endpoint POST /api/users CreateUserRequest

# Command generieren
/symfony:generate-command SendWelcomeEmailCommand
```

#### Flutter

```bash
# BLoC generieren
/flutter:generate-bloc Authentication

# Screen generieren
/flutter:generate-screen LoginScreen

# Widget generieren
/flutter:generate-widget UserAvatar
```

#### Python

```bash
# FastAPI-Endpunkt generieren
/python:generate-endpoint POST /users CreateUser

# Service generieren
/python:generate-service UserService

# Modell generieren
/python:generate-model User
```

#### React

```bash
# Komponente generieren
/react:generate-component UserProfile

# Hook generieren
/react:generate-hook useAuth

# Context generieren
/react:generate-context AuthContext
```

### Templates verwenden

Templates stellen einsatzbereite Code-Muster bereit. Zugriff mit:

```markdown
Show me the service template for Symfony
```

Verfügbare Templates nach Technologie:

| Symfony | Flutter | Python | React |
|---------|---------|--------|-------|
| service.md | bloc.md | service.md | component.md |
| value-object.md | widget.md | repository.md | hook.md |
| aggregate-root.md | screen.md | endpoint.md | context.md |
| domain-event.md | state.md | model.md | reducer.md |
| repository.md | cubit.md | schema.md | - |

### Best Practices bei der Implementierung

1. **Ein Test nach dem anderen**: Lassen Sie einen Test bestehen, bevor Sie zum nächsten übergehen
2. **Minimaler Code**: Schreiben Sie gerade genug Code, um den Test zu bestehen
3. **Keine vorzeitige Optimierung**: Konzentrieren Sie sich zunächst auf Korrektheit
4. **Bestehende Muster befolgen**: Verwenden Sie Templates und Konventionen

### Implementierungs-Checkliste

- [ ] Alle Unit-Tests bestehen
- [ ] Alle Integrationstests bestehen
- [ ] Alle API-Tests bestehen
- [ ] Keine hartkodierten Werte
- [ ] Fehlerbehandlung implementiert
- [ ] Logging hinzugefügt

---

## Phase 5: Refactoring

Nachdem die Tests bestehen, verbessern Sie die Codequalität.

### Refactoring-Befehle

```bash
# Codequalität prüfen
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality
/react:check-code-quality

# Architekturkonformität prüfen
/symfony:check-architecture
/flutter:check-architecture
```

### Den Refactoring-Spezialisten verwenden

```markdown
@refactoring-specialist Review this service class for potential improvements

[paste code here]
```

Der Refactoring-Spezialist wird:
- Code Smells identifizieren
- Verbesserungen vorschlagen
- Refaktorierte Beispiele zeigen
- Kompromisse erläutern

### Gängige Refactoring-Muster

1. **Methode extrahieren**: Lange Methoden in kleinere aufteilen
2. **Klasse extrahieren**: Große Klassen aufsplitten
3. **Value Object einführen**: Primitive durch Domänentypen ersetzen
4. **Conditional durch Polymorphismus ersetzen**: Strategy-Muster verwenden
5. **Methode verschieben**: Methoden dort platzieren, wo sie hingehören

### Refactoring-Checkliste

- [ ] Keine Code-Duplikation
- [ ] Methoden unter 20 Zeilen
- [ ] Klassen unter 200 Zeilen
- [ ] Klare Benennung
- [ ] Konsistenter Stil
- [ ] Alle Tests bestehen weiterhin

---

## Phase 6: Review

Abschließende Qualitätsprüfung vor dem Abschluss.

### Compliance-Audit

```bash
# Vollständige Compliance-Prüfung (gibt Score /100 zurück)
/symfony:check-compliance
/flutter:check-compliance
/python:check-compliance
/react:check-compliance
```

Dieses umfassende Audit prüft:
- Architekturkonformität
- Codequalität
- Testabdeckung
- Sicherheitsprobleme
- Dokumentation

### Code Review mit Agenten

```markdown
@symfony-reviewer Review my complete User authentication implementation

Files changed:
- src/Domain/User/User.php
- src/Application/Service/AuthenticationService.php
- src/Infrastructure/Security/JwtTokenGenerator.php
- tests/Unit/Domain/User/UserTest.php
- tests/Integration/AuthenticationServiceTest.php
```

Der Reviewer wird:
- Architekturkonformität prüfen
- Potenzielle Probleme identifizieren
- Verbesserungen vorschlagen
- Best Practices überprüfen

### Sicherheits-Audit

```bash
/common:security-audit
```

Oder den sicherheitsfokussierten Agenten verwenden:

```markdown
@devops-engineer Review security of the authentication system

Concerns:
- JWT token security
- Password storage
- Rate limiting
- CORS configuration
```

### Feature-Checkliste

Die eingebaute Checkliste verwenden:

```bash
cat .claude/checklists/feature-checklist.md
```

Wichtige Punkte:
- [ ] User-Story-Anforderungen erfüllt
- [ ] Alle Abnahmekriterien verifiziert
- [ ] Tests geschrieben und bestanden (≥80 % Abdeckung)
- [ ] Code reviewed
- [ ] Sicherheits-Audit bestanden
- [ ] Dokumentation aktualisiert
- [ ] Keine kritischen Probleme in der statischen Analyse
- [ ] Performance akzeptabel
- [ ] Bereit für Code Review

---

## Vollständiges Beispiel

Lassen Sie uns ein vollständiges Feature durchgehen: Benutzerregistrierung hinzufügen.

### Schritt 1: Analyse

```markdown
/common:analyze-feature "User registration with email verification"

Expected:
- User submits email and password
- System sends verification email
- User clicks link to verify
- Account becomes active
```

### Schritt 2: Datenbank designen

```markdown
@database-architect Design schema for User with email verification

Fields needed:
- id, email, password_hash
- email_verified_at (nullable timestamp)
- verification_token
- created_at, updated_at
```

### Schritt 3: API designen

```markdown
@api-designer Design registration API endpoints

POST /api/register - Create account
POST /api/verify-email - Verify email with token
POST /api/resend-verification - Resend verification email
```

### Schritt 4: Tests schreiben

```markdown
@tdd-coach Help me write tests for UserRegistrationService

Test cases:
1. Successful registration creates user
2. Duplicate email returns error
3. Weak password returns error
4. Verification email is sent
5. Verification token activates account
6. Expired token returns error
```

### Schritt 5: Code generieren

```bash
/symfony:generate-crud User --with-api
/symfony:generate-command SendVerificationEmailCommand
```

### Schritt 6: Implementieren

Tests einen nach dem anderen bestehen lassen:

```php
// Test 1 bestehen lassen
public function register(string $email, string $password): User
{
    $user = User::create($email, $password);
    $this->repository->save($user);
    return $user;
}

// Test 2 bestehen lassen
public function register(string $email, string $password): User
{
    if ($this->repository->findByEmail($email)) {
        throw new DuplicateEmailException($email);
    }
    // ...
}

// Für jeden Test fortfahren...
```

### Schritt 7: Refactoring

```bash
/symfony:check-code-quality
```

Identifizierte Probleme beheben.

### Schritt 8: Review

```markdown
@symfony-reviewer Review my user registration implementation

Complete implementation including:
- Domain: User entity, ValueObjects
- Application: RegistrationService
- Infrastructure: DoctrineUserRepository
- API: RegisterController
- Tests: Unit, Integration, API
```

### Schritt 9: Abschließende Prüfung

```bash
/symfony:check-compliance
```

Ziel: Score 90+/100

---

## Verfügbare Ressourcen

### Agentenübersicht

| Agent | Verwendung für |
|-------|----------------|
| `@api-designer` | API-Endpunkt-Design |
| `@database-architect` | Datenbankschema-Design |
| `@tdd-coach` | Anleitung zum Schreiben von Tests |
| `@refactoring-specialist` | Code-Verbesserung |
| `@{tech}-reviewer` | Code Review |
| `@devops-engineer` | Infrastruktur-Review |
| `@research-assistant` | Recherche zu Best Practices |

### Befehlsübersicht

| Phase | Befehle |
|-------|---------|
| Analyse | `/common:analyze-feature` |
| Design | `/common:architecture-decision` |
| Tests | `/{tech}:check-testing` |
| Generierung | `/{tech}:generate-*` |
| Qualität | `/{tech}:check-code-quality` |
| Review | `/{tech}:check-compliance` |
| Sicherheit | `/common:security-audit` |

### Speicherort der Templates

```bash
ls .claude/templates/
```

### Speicherort der Checklisten

```bash
ls .claude/checklists/
```

---

## Tipps für den Erfolg

1. **Tests nicht überspringen**: Sie sind Ihr Sicherheitsnetz
2. **Agenten verwenden**: Sie bieten Expertenbegleitung
3. **Compliance-Prüfungen regelmäßig ausführen**: Probleme frühzeitig erkennen
4. **Den Workflow befolgen**: Jede Phase hat einen Zweck
5. **Entscheidungen dokumentieren**: ADRs für wichtige Entscheidungen verwenden
6. **Kontext verwalten**: `/context` für Optimierungsvorschläge nutzen, `/clear` zwischen den Phasen
7. **Aufwand anpassen**: `/effort high` für Analyse/Design, `/effort low` für die Code-Generierung

---

[&larr; Projekterstellung](02-project-creation.md) | [Fehlerbehebung &rarr;](04-bug-fixing.md)
