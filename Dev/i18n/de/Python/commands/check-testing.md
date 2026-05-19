---
description: Python-Testing prüfen
argument-hint: [arguments]
---

# Python-Testing prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Führen Sie ein vollständiges Audit der Teststrategie des Python-Projekts durch, indem Sie Coverage, Testqualität und Einhaltung der in den Projektregeln definierten Best Practices überprüfen.

### Schritt 1: Struktur und Test-Organisation

Test-Organisation untersuchen:
- [ ] `tests/` Ordner im Projektstamm
- [ ] Spiegelstruktur des Quellcodes (tests/domain, tests/application, etc.)
- [ ] Testdateien benannt `test_*.py` oder `*_test.py`
- [ ] Pytest-Fixtures in `conftest.py`
- [ ] Trennung von Unit- / Integrations- / E2E-Tests

**Referenz**: `rules/07-testing.md` Abschnitt "Test Organization"

### Schritt 2: Code-Coverage

Test-Coverage messen:
- [ ] Gesamt-Coverage ≥ 80%
- [ ] Domain-Layer-Coverage ≥ 90%
- [ ] Application-Layer-Coverage ≥ 85%
- [ ] Kritische Dateien bei 100%
- [ ] Coverage-Konfiguration in pyproject.toml

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest pytest-cov && pytest /app --cov=/app --cov-report=term-missing"`

**Referenz**: `rules/07-testing.md` Abschnitt "Code Coverage"

### Schritt 3: Unit-Tests

Unit-Testqualität analysieren:
- [ ] Isolierte Tests (keine externen Abhängigkeiten)
- [ ] Verwendung von Mocks/Stubs für Abhängigkeiten
- [ ] Schnelle Tests (<100ms pro Test)
- [ ] Ein Test = Ein Verhalten
- [ ] Beschreibende Benennung: `test_should_X_when_Y`
- [ ] AAA-Pattern (Arrange, Act, Assert)

**Referenz**: `rules/07-testing.md` Abschnitt "Unit Tests"

### Schritt 4: Integrationstests

Integrationstests überprüfen:
- [ ] Tests der Interaktionen zwischen Komponenten
- [ ] Tests der Infrastrukturschicht (DB, API, etc.)
- [ ] Verwendung von Test-Datenbanken (Fixtures)
- [ ] Bereinigung nach jedem Test (Teardown)
- [ ] Isolierte und unabhängige Tests

**Referenz**: `rules/07-testing.md` Abschnitt "Integration Tests"

### Schritt 5: Assertions und Testqualität

Assertion-Qualität prüfen:
- [ ] Explizite und spezifische Assertions
- [ ] Keine mehrfachen, nicht zusammenhängenden Assertions
- [ ] Klare Fehlermeldungen
- [ ] Tests für Randfälle
- [ ] Tests für Fehler und Ausnahmen
- [ ] Keine deaktivierten Tests ohne Begründung (skip/xfail)

**Referenz**: `rules/07-testing.md` Abschnitt "Assertions and Test Quality"

### Schritt 6: Fixtures und Parametrisierung

Verwendung von Pytest-Fixtures bewerten:
- [ ] Fixtures für gemeinsames Setup/Teardown
- [ ] Angemessener Scope (function, class, module, session)
- [ ] Parametrisierung mit `@pytest.mark.parametrize`
- [ ] Factories für komplexe Testobjekte
- [ ] Keine Duplikation in Fixtures

**Referenz**: `rules/07-testing.md` Abschnitt "Pytest Fixtures"

### Schritt 7: Performance und Ausführung

Test-Performance analysieren:
- [ ] Gesamtausführungszeit <30 Sekunden (Unit-Tests)
- [ ] Parallelisierbare Tests (pytest-xdist)
- [ ] Kein sleep() in Tests
- [ ] Pytest-Konfiguration in pyproject.toml
- [ ] CI/CD mit automatischer Testausführung

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest && pytest /app -v --duration=10"`

**Referenz**: `rules/07-testing.md` Abschnitt "Test Performance"

### Schritt 8: Test-Driven Development (TDD)

TDD-Adoption überprüfen:
- [ ] Tests vor dem Code geschrieben (falls zutreffend)
- [ ] Red-Green-Refactor-Zyklus
- [ ] Tests leiten das Design
- [ ] Kein ungetesteter Code in der Produktion

**Referenz**: `rules/01-workflow-analysis.md` Abschnitt "TDD Workflow"

### Schritt 9: Bewertung berechnen

Punktevergabe (von 25):
- Code-Coverage: 7 Punkte
- Unit-Tests: 6 Punkte
- Integrationstests: 4 Punkte
- Assertion-Qualität: 3 Punkte
- Fixtures und Organisation: 3 Punkte
- Performance: 2 Punkte

## AUSGABEFORMAT

```
PYTHON-TESTING-AUDIT
================================

GESAMTBEWERTUNG: XX/25

STÄRKEN:
- [Liste beobachteter guter Testpraktiken]

VERBESSERUNGEN:
- [Liste geringfügiger Verbesserungen]

KRITISCHE PROBLEME:
- [Liste kritischer Testlücken]

DETAILS NACH KATEGORIE:

1. COVERAGE (XX/7)
   Status: [Coverage-Analyse]
   Gesamt-Coverage: XX%
   Domain: XX%
   Application: XX%
   Infrastructure: XX%

2. UNIT-TESTS (XX/6)
   Status: [Unit-Test-Qualität]
   Anzahl Tests: XX
   Isolierte Tests: XX%
   Durchschnittliche Zeit: XXms

3. INTEGRATIONSTESTS (XX/4)
   Status: [Integrationstests]
   Anzahl Tests: XX
   Infrastruktur-Coverage: XX%

4. ASSERTIONS (XX/3)
   Status: [Assertion-Qualität]
   Spezifische Assertions: XX%
   Randfälletests: XX

5. FIXTURES (XX/3)
   Status: [Organisation und Fixtures]
   Wiederverwendbare Fixtures: XX
   Parametrisierte Tests: XX

6. PERFORMANCE (XX/2)
   Status: [Test-Performance]
   Gesamtzeit: XXs
   Tests >1s: XX

TOP 3 PRIORITÄTSMASSNAHMEN:
1. [Kritischste Maßnahme zur Verbesserung der Tests]
2. [Zweite Prioritätsmaßnahme]
3. [Dritte Prioritätsmaßnahme]
```

## HINWEISE

- pytest mit Coverage ausführen, um Metriken zu erhalten
- Docker verwenden, um von lokaler Umgebung zu abstrahieren
- Kritische Dateien ohne Tests identifizieren
- Fehlende Tests für Schlüsselfunktionalitäten vorschlagen
- Konkrete Verbesserungen für bestehende Tests vorschlagen
- Tests nach Geschäftsrisiko priorisieren
