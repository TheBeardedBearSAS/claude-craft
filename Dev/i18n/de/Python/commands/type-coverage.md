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

### Schritt 3: Coverage-Analyse-Skript

[Python-Skript zur Analyse der Typ-Coverage mittels AST]

### Schritt 4: Typ-Patterns

[Patterns anzeigen: TypeAlias, Generics, Protocols, Callable, Overload, etc.]

### Schritt 5: Bericht generieren

```
══════════════════════════════════════════════════════════════
📊 TYPE-COVERAGE-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📈 GLOBALE ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Metrik              | Wert   | Schwelle | Status |
|---------------------|--------|----------|--------|
| Globale Coverage    | 78.5%  | 80%      | ⚠️     |
| Gesamt-Funktionen   | 245    | -        | -      |
| Vollständig typisiert | 192  | -        | -      |
| Teilweise typisiert | 38     | -        | -      |
| Nicht typisiert     | 15     | -        | -      |

──────────────────────────────────────────────────────────────
📁 COVERAGE NACH MODUL
──────────────────────────────────────────────────────────────

| Modul           | Funktionen | Typisiert | Coverage  |
|-----------------|------------|-----------|-----------|
| app/api/        | 45         | 45        | 100% ✅   |
| app/core/       | 32         | 30        | 93.8% ✅  |
| app/services/   | 58         | 52        | 89.7% ✅  |
| app/crud/       | 40         | 35        | 87.5% ✅  |
| app/models/     | 28         | 20        | 71.4% ⚠️  |
| app/utils/      | 42         | 10        | 23.8% ❌  |

──────────────────────────────────────────────────────────────
❌ NICHT TYPISIERTE FUNKTIONEN
──────────────────────────────────────────────────────────────

### app/utils/helpers.py

| Zeile | Funktion           | Fehlend                    |
|-------|--------------------|-----------------------------|
| 15    | `parse_date`       | Rückgabetyp                 |
| 28    | `format_currency`  | Parameter: amount, Rückgabe |
| 45    | `slugify`          | Rückgabetyp                 |
| 67    | `calculate_hash`   | Parameter: data             |

──────────────────────────────────────────────────────────────
🔧 VORGESCHLAGENE KORREKTUREN
──────────────────────────────────────────────────────────────

### app/utils/helpers.py:15

```python
# Vorher
def parse_date(date_str):
    ...

# Nachher
def parse_date(date_str: str) -> datetime | None:
    ...
```

──────────────────────────────────────────────────────────────
🎯 PRIORITÄTEN
──────────────────────────────────────────────────────────────

1. [ ] app/utils/ typisieren (23.8% → 80%+)
2. [ ] app/models/ vervollständigen (71.4% → 90%+)
3. [ ] 23 MyPy-Fehler beheben
4. [ ] MyPy-Plugin für SQLAlchemy hinzufügen
5. [ ] Pre-commit Hook für MyPy konfigurieren
```
