# Template: Architekturanalyse

> **Template für Feature-Design** - Vorbereitung vor Code-Implementierung
> Referenz: `.claude/rules/01-workflow-analysis.md`

## Zweck

Dieses Template wird verwendet um:
- Eine neue Feature/Epic zu **analysieren**
- Architekturentscheidungen zu **dokumentieren**
- Klare **Implementierungsspezifikationen** bereitzustellen

**WICHTIG**: Diese Datei wird NIEMALS ins Repository committed. Sie dient als Arbeitsdokument zwischen dem PO und dem Lead Dev.

---

## 1. Feature-Übersicht

### Titel
[Titel des Features]

### Priorität
- [ ] P0 - Kritisch (Blocker)
- [ ] P1 - Hoch (nächster Sprint)
- [ ] P2 - Mittel (Backlog priorisiert)
- [ ] P3 - Niedrig (Nice to have)

### Geschäftlicher Kontext
[Warum dieses Feature? Welches geschäftliche Problem löst es?]

**Geschäftsnutzen:**
- [Nutzen 1]
- [Nutzen 2]

**Betroffene Stakeholder:**
- [Stakeholder 1: Rolle]
- [Stakeholder 2: Rolle]

---

## 2. Funktionale Anforderungen

### User Stories

#### US-001: [Titel]
```gherkin
Als [Rolle]
Möchte ich [Aktion]
Um [Nutzen]
```

**Akzeptanzkriterien:**
- [ ] [Kriterium 1]
- [ ] [Kriterium 2]
- [ ] [Kriterium 3]

**Out of Scope:**
- [Was NICHT eingeschlossen ist]

---

#### US-002: [Titel]
[Weitere User Stories...]

---

## 3. Technische Analyse

### Betroffene Bounded Contexts

- [ ] **Catalog** (Séjours, Destinations)
- [ ] **Reservation** (Réservations, Participants)
- [ ] **Payment** (Paiements, Factures)
- [ ] **Customer** (Clients, Comptes)
- [ ] **Notification** (Emails, SMS)

**Primärer BC:** [Name]

**Sekundäre BCs:**
- [Name BC]: [Grund der Abhängigkeit]

---

### Domain-Modellierung

#### Neue Aggregates

**[Aggregate Name]** (Aggregate Root)

**Verantwortlichkeiten:**
- [Verantwortlichkeit 1]
- [Verantwortlichkeit 2]

**Invarianten:**
- [Invariante 1]
- [Invariante 2]

**Geschäftsregeln:**
- [Regel 1]
- [Regel 2]

**Kind-Entities:**
- `[Entity Name]`: [Beschreibung]

**Value Objects:**
- `[VO Name]`: [Beschreibung]

---

#### Domain Events

| Event | Auslöser | Handler | Zweck |
|-------|----------|---------|-------|
| `[Entity]CreatedEvent` | [Aggregate]::create() | [Handler] | [Zweck] |
| `[Entity]UpdatedEvent` | [Aggregate]::update() | [Handler] | [Zweck] |

---

#### Domain Services

**[Service Name]**

**Verantwortlichkeit:** [Beschreibung]

**Methoden:**
- `method1(params): ReturnType` - [Beschreibung]
- `method2(params): ReturnType` - [Beschreibung]

**Abhängigkeiten:**
- [Repository Interface]
- [Anderer Service]

---

### Anwendungsschicht

#### Use Cases

**UC-001: [Use Case Name]**

**Command:**
```php
final readonly class [UseCaseCommand]
{
    public function __construct(
        public string $param1,
        public array $param2,
    ) {}
}
```

**Handler:**
```php
final readonly class [UseCaseHandler]
{
    public function __construct(
        private [Repository]Interface $repository,
        private [Service] $service,
    ) {}

    public function handle([UseCaseCommand] $command): [Result]
    {
        // 1. Validierung
        // 2. Aggregate abrufen/erstellen
        // 3. Geschäftslogik
        // 4. Speichern
        // 5. Events dispatchen

        return new [Result](...);
    }
}
```

**Workflow:**
```
1. Controller empfängt Request
2. DTO validieren (Symfony Validator)
3. Command erstellen
4. CommandHandler aufrufen
5. Events dispatchen
6. Response zurückgeben
```

---

#### Queries (CQRS)

**Q-001: [Query Name]**

**Query:**
```php
final readonly class [QueryName]
{
    public function __construct(
        public string $filter1,
        public ?int $limit = 20,
    ) {}
}
```

**Query Handler:**
```php
final readonly class [QueryHandler]
{
    public function __construct(
        private [ReadModel]RepositoryInterface $repository,
    ) {}

    public function handle([QueryName] $query): array
    {
        return $this->repository->findBy(...);
    }
}
```

---

### Infrastruktur-Schicht

#### Doctrine-Mapping

**[Entity]** → Tabelle `[table_name]`

| Feld | Typ | Constraint | Index | Verschlüsselt |
|------|-----|-----------|-------|---------------|
| `id` | UUID | PK | ✅ | ❌ |
| `field1` | VARCHAR(255) | NOT NULL | ✅ | ❌ |
| `field2` | TEXT | NULL | ❌ | ✅ (Halite) |
| `created_at` | TIMESTAMP | NOT NULL | ✅ | ❌ |

**Doctrine-Extensions:**
- [ ] Timestampable (createdAt, updatedAt)
- [ ] Blameable (createdBy, updatedBy)
- [ ] SoftDeleteable
- [ ] Loggable

**Indizes:**
```sql
CREATE INDEX idx_[table]_[field] ON [table]([field]);
CREATE UNIQUE INDEX uniq_[table]_[field] ON [table]([field]);
```

---

#### Repository

**Interface:** `[Entity]RepositoryInterface`

```php
interface [Entity]RepositoryInterface
{
    public function findById([Entity]Id $id): [Entity];
    public function save([Entity] $entity): void;
    public function delete([Entity] $entity): void;

    // Custom Queries
    public function findByFilter(array $criteria): array;
}
```

**Implementierung:** Doctrine ORM

---

#### API-Endpunkte

| Methode | Route | Controller | Use Case |
|---------|-------|------------|----------|
| POST | `/api/[resource]` | Create[Resource]Controller | Create[Resource]UseCase |
| GET | `/api/[resource]/{id}` | Get[Resource]Controller | Get[Resource]Query |
| PUT | `/api/[resource]/{id}` | Update[Resource]Controller | Update[Resource]UseCase |
| DELETE | `/api/[resource]/{id}` | Delete[Resource]Controller | Delete[Resource]UseCase |

**Request/Response DTOs:**
```php
// Request
final readonly class Create[Resource]Request
{
    #[Assert\NotBlank]
    public string $field1;

    #[Assert\Email]
    public string $field2;
}

// Response
final readonly class [Resource]Response
{
    public string $id;
    public string $field1;
    public \DateTimeImmutable $createdAt;
}
```

---

## 4. Nicht-funktionale Anforderungen

### Performance

**Ziele:**
- [ ] Antwortzeit < 200ms (p95)
- [ ] Durchsatz > 100 req/s
- [ ] DB-Abfragen < 50ms

**Optimierungen:**
- [ ] Doctrine Query-Optimierung
- [ ] Cache (Redis) für [was]
- [ ] Eager loading für [Relationen]
- [ ] Asynchrone Verarbeitung für [Tasks]

---

### Sicherheit

**DSGVO/Datenschutz:**
- [ ] Persönliche Daten mit Halite verschlüsselt
- [ ] Recht auf Vergessenwerden implementiert
- [ ] Audit-Trail mit Gedmo Loggable
- [ ] Zugriffskontrollen (Voter)

**Validierungen:**
- [ ] Input-Sanitization (Symfony Validator)
- [ ] CSRF-Protection
- [ ] Rate Limiting (API)
- [ ] SQL Injection Prevention (Doctrine ORM)

---

### Skalierbarkeit

**Erwartetes Volumen:**
- [X] Benutzer/Tag
- [Y] Transaktionen/Stunde
- [Z] GB Daten/Monat

**Skalierungsstrategie:**
- [ ] Horizontale Skalierung (Docker + Kubernetes)
- [ ] Database Read Replicas
- [ ] Caching-Layer (Redis)
- [ ] Asynchrone Jobs (Symfony Messenger)

---

## 5. Abhängigkeiten

### Externe Services

| Service | Zweck | Kritikalität | Fallback |
|---------|-------|--------------|----------|
| [Service API] | [Zweck] | Hoch/Mittel/Niedrig | [Fallback-Strategie] |

---

### Composer-Pakete

**Neu hinzufügen:**
```bash
composer require vendor/package:^version
```

**Zu aktualisierende Pakete:**
- `vendor/package`: ^old-version → ^new-version

---

## 6. Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------------|------------|-----------|
| [Risiko 1] | Hoch/Mittel/Niedrig | Hoch/Mittel/Niedrig | [Strategie] |
| [Risiko 2] | Hoch/Mittel/Niedrig | Hoch/Mittel/Niedrig | [Strategie] |

---

## 7. Aufwandsschätzung

### Story Points (Planning Poker)

**Fibonacci-Skala:** 1, 2, 3, 5, 8, 13, 21

**US-001:** [Titel] → **[X] SP**
- Entwicklung: [Y] SP
- Tests: [Z] SP
- Code Review: [W] SP

**US-002:** [Titel] → **[X] SP**

**TOTAL:** **[Summe] SP** ≈ **[Tage] Tage** (Velocity: [X] SP/Tag)

---

### Aufgliederung

| Aufgabe | Geschätzt | Verantwortlich |
|---------|----------|----------------|
| Domain-Modell | [X]h | Lead Dev |
| Repository-Implementierung | [Y]h | Backend Dev |
| Use Cases | [Z]h | Backend Dev |
| API-Controller | [W]h | Backend Dev |
| Tests (Unit + Integration) | [V]h | Backend Dev |
| Dokumentation | [U]h | Lead Dev |

**TOTAL:** **[Summe] Stunden** ≈ **[Tage] Tage**

---

## 8. Implementierungs-Plan

### Sprint 1 - Woche 1-2

- [ ] Domain-Modell (Aggregates, VOs, Events)
- [ ] Repository-Interfaces
- [ ] Doctrine-Mapping
- [ ] Basis-Use-Cases

### Sprint 2 - Woche 3-4

- [ ] API-Endpunkte
- [ ] Event-Handler
- [ ] Frontend-Integration
- [ ] Unit-Tests

### Sprint 3 - Woche 5-6

- [ ] Integrationstests
- [ ] Performance-Optimierungen
- [ ] Dokumentation
- [ ] Code Review

---

## 9. Definition of Done

- [ ] **Code:**
  - [ ] Folgt `.claude/rules/` (Architecture, Coding Standards)
  - [ ] PHPStan Level 8 ohne Fehler
  - [ ] PHP-CS-Fixer durchgeführt
  - [ ] Keine TODOs/FIXME im Code

- [ ] **Tests:**
  - [ ] Unit-Tests: > 90% Coverage
  - [ ] Integrationstests: Happy Paths + Edge Cases
  - [ ] Behat-Szenarien (falls zutreffend)
  - [ ] Alle Tests grün auf CI

- [ ] **Dokumentation:**
  - [ ] PHPDoc für alle öffentlichen Methoden
  - [ ] ADR erstellt (falls architektonische Entscheidung)
  - [ ] README aktualisiert
  - [ ] API-Dokumentation (OpenAPI)

- [ ] **Review:**
  - [ ] Code Review vom Lead Dev
  - [ ] Sicherheitsreview (bei sensiblen Daten)
  - [ ] Performance-Review (bei kritischem Pfad)

- [ ] **Deployment:**
  - [ ] Migrations erstellt und getestet
  - [ ] Env-Variablen dokumentiert (.env.example)
  - [ ] Docker-Build erfolgreich
  - [ ] Staging-Tests bestanden

---

## 10. Post-Implementation

### Metriken zu verfolgen

- **Performance:** Antwortzeit, Durchsatz, DB-Abfragen
- **Business:** Konversionsrate, Benutzernutzung
- **Technisch:** Fehlerrate, Verfügbarkeit

### Feedback-Loop

- Sprint Review: [Datum]
- Retrospektive: [Datum]
- Produktionsbereitstellung: [Datum]

---

**Analysiert von:** [Name]
**Datum:** [JJJJ-MM-TT]
**Validiert von:** [Lead Dev Name]
**Status:** [Draft / Approved / In Progress / Done]
