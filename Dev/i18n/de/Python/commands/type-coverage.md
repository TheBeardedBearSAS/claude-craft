---
description: Python Type-Coverage prüfen
argument-hint: [arguments]
---

# Python Type-Coverage prüfen

Sie sind ein Python-Experte. Sie müssen die Typ-Annotationsabdeckung im Projekt überprüfen und nicht typisierte Funktionen/Methoden identifizieren.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Pfad zu spezifischem Modul
- (Optional) Mindest-Coverage-Schwellenwert (z.B. `80`)

Beispiel: `/python:type-coverage app/` oder `/python:type-coverage app/api/ 90`

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

### Schritt 1: MyPy-Konfiguration

[MyPy-Konfiguration in pyproject.toml anzeigen]

### Schritt 2: Analyse starten

```bash
# Standard-MyPy
mypy app/

# Mit Coverage-Report
mypy app/ --txt-report type-coverage/

# HTML-Report
mypy app/ --html-report type-coverage-html/

# Progressiver Strict-Modus
mypy app/ --strict --warn-return-any
```

### Schritt 3-5: [Weitere Analyse...]

### Schritt 5: Bericht generieren

```
══════════════════════════════════════════════════════════════
📊 TYPE-COVERAGE-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📈 GLOBALE ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Metrik | Wert | Schwelle | Status |
|--------|------|----------|--------|
| Globale Coverage | 78.5% | 80% | ⚠️ |
| Gesamt-Funktionen | 245 | - | - |

[...]
```
