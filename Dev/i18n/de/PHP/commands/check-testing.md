---
description: PHP Test-Coverage-Analyse
argument-hint: [argumente]
---

# PHP Test-Coverage-Analyse

## Argumente

$ARGUMENTS (optional: Pfad zum zu auditierenden PHP-Projekt, standardmäßig aktuelles Verzeichnis)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Auditieren Sie Teststrategie, Coverage und Qualität eines nativen PHP-Projekts. Bewerten Sie die Testpyramide (Unit, Integration, End-to-End), Pest / PHPUnit Praktiken, Mutation Score und Fixture-Hygiene. Erstellen Sie einen Report mit einer Bewertung von 25 Punkten.

**Referenzregeln**: `.claude/rules/php-testing.md`

### Schritt 1: Testsuite-Inventar

- [ ] `phpunit.xml` / `phpunit.xml.dist` oder Pest-Konfiguration lesen
- [ ] Nach Pest 4.5+ (`pestphp/pest`) oder PHPUnit 12+ suchen
- [ ] Nach Infection (`infection/infection`) für Mutation Testing suchen
- [ ] Nach Mockery, Prophecy oder PHPUnit nativen Doubles suchen
- [ ] `tests/`-Struktur lesen: Unit / Integration / Feature / Browser

**Erwartetes Layout**:

```
tests/
├── Unit/           # Schnell, kein IO, Domain + Application
├── Integration/    # DB, Dateisystem, externe Adapter
├── Feature/        # Use-Case-Ebene, End-to-End innerhalb App-Grenze
└── Fixtures/       # Testdaten-Factories, Builders
```

### Schritt 2: Coverage (7 Pkt.)

```bash
docker compose exec app vendor/bin/pest --coverage --min=80
# oder
docker compose exec app vendor/bin/phpunit --coverage-text --coverage-html=var/coverage
```

Prüfen:
- [ ] Globale Line-Coverage ≥ 80%
- [ ] Domain-Schicht Coverage ≥ 95% (Business-Logik ist dort, wo Bugs am meisten schaden)
- [ ] Application-Schicht Coverage ≥ 90%
- [ ] Infrastructure Coverage ≥ 70% (integrations-getestet)
- [ ] Coverage-Report in CI veröffentlicht

**Bewertung**:
- ≥ 90%: 7 Pkt.
- 80–89%: 5 Pkt.
- 70–79%: 3 Pkt.
- < 70%: 0 Pkt.

### Schritt 3: Unit-Tests — Domain (6 Pkt.)

- [ ] Jedes Value Object hat Invarianten-Tests (ungültige Inputs werfen)
- [ ] Jede Entity hat Identitäts- + Verhaltens-Tests
- [ ] Aggregates auf Invarianten-Durchsetzung getestet
- [ ] Domain-Events-Emission getestet
- [ ] Kein IO / keine Mocks nötig (echte Unit-Tests)
- [ ] AAA-Pattern (Arrange-Act-Assert) respektiert

### Schritt 4: Integrationstests (4 Pkt.)

- [ ] Datenbank-Adapter gegen echte DB getestet (Postgres/MySQL in Docker)
- [ ] HTTP-Adapter mit aufgezeichneten Fixtures (VCR-Pattern) oder Mock-Server getestet
- [ ] Dateisystem-Adapter mit temporären Verzeichnissen getestet
- [ ] **Keine Mocks für den zu testenden Adapter** — Mocks verschleiern Vertragsbrüche (Ref: User-Feedback für Real-DB-Testing)

### Schritt 5: Testqualität — Pest / PHPUnit (3 Pkt.)

- [ ] Testnamen beschreiben Verhalten: `it('rejects empty email')` / `testRejectsEmptyEmail`
- [ ] Eine Assertions-Gruppe pro Test (mehrere `expect()` OK, wenn gleiches Verhalten)
- [ ] Kein `$this->markTestSkipped()` ohne Ticket-Referenz
- [ ] Keine auskommentierten Tests
- [ ] `setUp` / `beforeEach` minimal halten; Factories/Builders bevorzugen

### Schritt 6: Fixtures & Data Builders (3 Pkt.)

- [ ] Factories existieren für Aggregates (z. B. `UserFactory::make()->withEmail(...)`)
- [ ] Keine magischen Daten in Tests — benannte Konstanten oder Builders
- [ ] Fixtures zwischen Tests zurückgesetzt (Transaktions-Rollback für DB-Tests)
- [ ] Faker oder deterministische Fake-Daten

### Schritt 7: Mutation Testing & Isolation (2 Pkt.)

```bash
docker compose exec app vendor/bin/infection --min-msi=70 --min-covered-msi=80
```

Prüfen:
- [ ] Mutation Score Indicator (MSI) ≥ 70% (Ziel 80%)
- [ ] Tests sind unabhängig (zufällige Reihenfolge sollte bestehen)
- [ ] Kein gemeinsamer mutierbarer Zustand über Tests hinweg
- [ ] Zeit und Zufall injiziert (kein `time()` / `rand()` direkt)

## OUTPUT-FORMAT

```
PHP TESTING AUDIT
=================

SCORE: XX/25

COVERAGE (X/7)
  Global      : XX%
  Domain      : XX%
  Application : XX%
  Infrastructure: XX%
  Lücken:
  - src/Domain/... : 0% Coverage

UNIT-TESTS — DOMAIN (X/6)
  Getestete Entities: N/M
  Getestete Value Objects: N/M
  Fehlend:
  - src/Domain/ValueObject/Email.php

INTEGRATION (X/4)
  Echte DB verwendet: ja/nein
  Gemockte Adapter (Warnsignal): N

TESTQUALITÄT (X/3)
  Übersprungene Tests ohne Ticket: N
  Auskommentierte Tests: N

FIXTURES (X/3)
  Factories vorhanden: ja/nein
  Anzahl magischer Daten: N

MUTATION & ISOLATION (X/2)
  MSI: XX%
  Flaky Tests erkannt: N

TOP 3 AKTIONEN:
1. [KRITISCH] Unit-Tests für src/Domain/... hinzufügen
2. Infection mit MSI ≥ 70 konfigurieren
3. Adapter-Mocks durch echte DB in tests/Integration/ ersetzen
```

## WICHTIGE HINWEISE

- **Goldene Regel**: ein behobener Bug darf niemals zurückkehren → Regressions-Test HINZUFÜGEN VOR dem Fixen
- Coverage allein ist keine Qualität → Mutation Score melden (Infection)
- Integrationstests SOLLTEN NICHT den zu testenden Adapter mocken — Mocks verbergen Vertragsbrüche
- Pest 4.5+ liefert Browser Testing (Playwright-backed) — nützlich für End-to-End HTTP/CLI-Szenarien
- Docker für die gesamte Test-Pipeline verwenden, um lokale Env-Drift zu vermeiden
