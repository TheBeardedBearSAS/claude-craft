---
description: Python-Testing prüfen
argument-hint: [arguments]
---

# Python-Testing prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

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

### Schritt 3-9: [Weitere Testprüfungen...]

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

[...]
```

## HINWEISE

- pytest mit Coverage ausführen, um Metriken zu erhalten
- Docker verwenden, um von lokaler Umgebung zu abstrahieren
- Kritische Dateien ohne Tests identifizieren
- Fehlende Tests für Schlüsselfunktionalitäten vorschlagen
- Konkrete Verbesserungen für bestehende Tests vorschlagen
- Tests nach Geschäftsrisiko priorisieren
