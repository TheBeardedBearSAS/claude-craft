---
description: PHP Architektur-Validierung
argument-hint: [argumente]
---

# PHP Architektur-Validierung

## Argumente

$ARGUMENTS (optional: Pfad zum zu auditierenden PHP-Projekt, standardmäßig aktuelles Verzeichnis)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Sie sind ein erfahrener PHP-Softwarearchitekt. Auditieren Sie die Architektur eines nativen PHP-Projekts (kein Framework) gegen Clean Architecture, Hexagonal Architecture, DDD Tactical Patterns und PSR-4 Autoloading-Regeln.

**Referenzregeln**: `.claude/rules/php-architecture.md`

### Schritt 1: Projektstruktur-Analyse

1. Projekt-Root identifizieren (verwenden Sie $ARGUMENTS oder aktuelles Verzeichnis)
2. `composer.json` lesen — PHP-Version überprüfen (≥ 8.4, idealerweise 8.5) und PSR-4 Autoload-Mapping
3. `src/`-Verzeichnisstruktur und erwartete Schichten abbilden
4. Alle Top-Level-Namespaces auflisten

**Erwartete Struktur** (natives PHP):

```
src/
├── Domain/              # Pure business logic (Entities, Value Objects, Domain Events)
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/         # Use Cases / Commands / Queries, orchestration
│   ├── UseCase/
│   ├── DTO/
│   └── Port/            # Interfaces consumed by Application
└── Infrastructure/      # Adapters (DB, HTTP, filesystem, external APIs)
    ├── Persistence/
    ├── Http/
    └── Adapter/
tests/
├── Unit/
├── Integration/
└── Fixtures/
```

### Schritt 2: Schichtentrennung prüfen (6 Pkt.)

- [ ] Domain-Schicht hat **null** Abhängigkeiten zu Application oder Infrastructure
- [ ] Application-Schicht hängt **nur** von Domain-Abstraktionen ab (Interfaces/Ports)
- [ ] Infrastructure implementiert Domain/Application-Ports, niemals umgekehrt
- [ ] Kein Framework-spezifischer Code leckt in Domain
- [ ] `declare(strict_types=1);` am Anfang jeder Datei

**Erkennungsbefehl**:

```bash
docker compose exec app grep -rn "use.*Infrastructure" src/Domain/ src/Application/
# Erwartet: keine Treffer
```

### Schritt 3: Ports und Adapters (5 Pkt.)

- [ ] Inbound-Ports (Interfaces) definiert in `Application/Port/In/` oder ähnlich
- [ ] Outbound-Ports definiert in `Application/Port/Out/` oder `Domain/Port/`
- [ ] Adapters in `Infrastructure/` implementieren diese Ports
- [ ] Dependency Injection via Konstruktor (kein Service Locator, kein statischer Zustand)

### Schritt 4: Domain-Modellierung (5 Pkt.)

- [ ] Entities haben Identität und Invarianten, die in Konstruktoren / Named Constructors durchgesetzt werden
- [ ] Value Objects sind unveränderlich (`readonly` Klassen PHP 8.2+, oder readonly Properties)
- [ ] Aggregates kapseln Invarianten; externe Mutation unmöglich
- [ ] Domain Events werden für relevante Zustandsänderungen ausgelöst
- [ ] Exceptions sind Domain-spezifisch (erweitern eine Basis-`DomainException`)

### Schritt 5: Use Cases (4 Pkt.)

- [ ] Ein Use Case = eine Klasse mit einer einzigen öffentlichen Methode (`execute()`, `handle()` oder `__invoke()`)
- [ ] Input als dediziertes DTO / Command / Query-Objekt
- [ ] Output als Rückgabe-DTO oder void (für Commands)
- [ ] Transaktionsgrenzen auf Application-Ebene behandelt, nicht in Domain

### Schritt 6: PSR-4 & Abhängigkeitsregeln (3 Pkt.)

- [ ] `composer.json` Autoload ist PSR-4-konform
- [ ] Namespace entspricht exakt der Verzeichnisstruktur
- [ ] Keine zirkulären Abhängigkeiten (`deptrac` oder `phparkitect` zur Überprüfung)
- [ ] Kopplung zwischen Modulen ist explizit und dokumentiert

**Erkennungsbefehl**:

```bash
docker compose exec app composer dump-autoload --strict-psr
docker compose exec app vendor/bin/deptrac analyse --fail-on-uncovered
```

### Schritt 7: Alternative Patterns (2 Pkt.)

Akzeptieren Sie pragmatische Alternativen, wenn gerechtfertigt:

| Pattern | Wann akzeptabel |
|---|---|
| **Vertical Slice Architecture** | Kleine App, CRUD-lastig, keine funktionsübergreifende Wiederverwendung |
| **Modular Monolith** | Mehrere Bounded Contexts innerhalb einer deployable Unit |
| **Simple layered** | Domain ist trivial — nicht über-engineeren |

Markieren Sie Over-Engineering (leere Abstraktionen, übermäßiges DTO-Mapping) als Problem.

## OUTPUT-FORMAT

```
PHP ARCHITEKTUR-AUDIT
=====================

SCORE: XX/25

SCHICHTENTRENNUNG (X/6)
  Stärken:
  - [...]
  Probleme:
  - [datei:zeile] beschreibung

PORTS & ADAPTERS (X/5)
  [...]

DOMAIN-MODELLIERUNG (X/5)
  [...]

USE CASES (X/4)
  [...]

PSR-4 & ABHÄNGIGKEITSREGELN (X/3)
  [...]

PATTERN-FITNESS (X/2)
  [...]

TOP 3 AKTIONEN:
1. [KRITISCH] Beschreibung
   Dateien: src/...
   Aufwand: Niedrig/Mittel/Hoch
2. [...]
3. [...]

EMPFOHLENES PATTERN: [Clean / Hexagonal / VSA / Modular Monolith]
```

## WICHTIGE HINWEISE

- Docker für alle Analysetools verwenden (`composer`, `deptrac`, `phparkitect`)
- Konkrete `datei:zeile`-Referenzen für jedes Problem zitieren
- Nicht Clean Architecture aufzwingen, wenn die Domain trivial ist — Pragmatismus bevorzugen
- Framework-Lecks sofort markieren (ein natives PHP-Projekt darf nicht von Symfony/Laravel-Klassen abhängen)
