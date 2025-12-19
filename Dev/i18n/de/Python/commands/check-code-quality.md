---
description: Python-Codequalität prüfen
argument-hint: [arguments]
---

# Python-Codequalität prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## MISSION

Führen Sie ein vollständiges Codequalitäts-Audit des Python-Projekts durch, indem Sie PEP8-Konformität, Typisierung, Lesbarkeit und in den Projektregeln definierte Best Practices überprüfen.

### Schritt 1: PEP8-Codierungsstandards

Überprüfen Sie die Einhaltung der Python-Konventionen:
- [ ] Benennung: snake_case für Funktionen/Variablen, PascalCase für Klassen
- [ ] Einrückung: 4 Leerzeichen (keine Tabs)
- [ ] Zeilenlänge: maximal 88 Zeichen (Black)
- [ ] Imports: organisiert (stdlib, third-party, lokal) und sortiert
- [ ] Leerzeichen: um Operatoren, nach Kommas
- [ ] Docstrings: vorhanden für Module, Klassen, öffentliche Funktionen

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 python -m flake8 /app --max-line-length=88`

**Referenz**: `rules/03-coding-standards.md` Abschnitt "PEP 8 Compliance"

### Schritt 2: Type Hints und MyPy

Prüfen Sie die Verwendung statischer Typisierung:
- [ ] Type Hints auf allen Funktionsparametern
- [ ] Type Hints auf Rückgabewerten
- [ ] Annotationen für Klassenattribute
- [ ] Verwendung von `typing` für komplexe Typen (Optional, Union, List, Dict)
- [ ] Keine MyPy-Fehler im Strict-Modus

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 python -m mypy /app --strict`

**Referenz**: `rules/03-coding-standards.md` Abschnitt "Type Hints"

### Schritt 3: Linting mit Ruff

Code mit Ruff analysieren (ersetzt Flake8, isort, pydocstyle):
- [ ] Keine ungenutzten Imports
- [ ] Keine ungenutzten Variablen
- [ ] Kein toter Code (unerreichbarer Code)
- [ ] Akzeptable zyklomatische Komplexität (<10)
- [ ] Sicherheitsregeln eingehalten (S-Regeln)

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 pip install ruff && ruff check /app`

**Referenz**: `rules/06-tooling.md` Abschnitt "Linting and Formatting"

### Schritt 4: Formatierung mit Black

Formatierungskonsistenz überprüfen:
- [ ] Code mit Black formatiert
- [ ] Black-Konfiguration in pyproject.toml
- [ ] Keine Unterschiede nach `black --check`
- [ ] Konsistente Zeilenlänge (88 Zeichen)

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 pip install black && black --check /app`

**Referenz**: `rules/06-tooling.md` Abschnitt "Code Formatting"

### Schritt 5: KISS, DRY, YAGNI-Prinzipien

Code-Einfachheit und -Klarheit analysieren:
- [ ] Kurze Funktionen (<20 Zeilen idealerweise)
- [ ] Keine Code-Duplikation (DRY)
- [ ] Keine Überentwicklung (YAGNI)
- [ ] Explizite und selbstdokumentierende Benennung
- [ ] Einzelne Abstraktionsebene pro Funktion
- [ ] Frühe Returns zur Komplexitätsreduzierung

**Referenz**: `rules/05-kiss-dry-yagni.md`

### Schritt 6: Kommentare und Dokumentation

Dokumentationsqualität bewerten:
- [ ] Google- oder NumPy-Stil Docstrings
- [ ] Kommentare nur für "Warum", nicht "Was"
- [ ] Vollständiges README.md mit Setup und Verwendung
- [ ] Kein auskommentierter Code (git verwenden)
- [ ] Dokumentation wichtiger Architekturentscheidungen

**Referenz**: `rules/03-coding-standards.md` Abschnitt "Documentation"

### Schritt 7: Fehlerbehandlung

Code-Robustheit überprüfen:
- [ ] Spezifische Exceptions (nicht generisch Exception)
- [ ] Kein stilles `pass` in except
- [ ] Informative Fehlermeldungen
- [ ] Benutzereingabe-Validierung
- [ ] Ordnungsgemäße Ressourcenverwaltung (Context Manager)

**Referenz**: `rules/03-coding-standards.md` Abschnitt "Error Handling"

### Schritt 8: Bewertung berechnen

Punktevergabe (von 25):
- PEP8 und Formatierung: 5 Punkte
- Type Hints und MyPy: 5 Punkte
- Ruff-Linting: 4 Punkte
- KISS/DRY/YAGNI: 4 Punkte
- Dokumentation: 4 Punkte
- Fehlerbehandlung: 3 Punkte

## AUSGABEFORMAT

```
PYTHON-CODEQUALITÄTS-AUDIT
================================

GESAMTBEWERTUNG: XX/25

STÄRKEN:
- [Liste beobachteter guter Praktiken]

VERBESSERUNGEN:
- [Liste geringfügiger Verbesserungen]

KRITISCHE PROBLEME:
- [Liste schwerwiegender Standards-Verletzungen]

DETAILS NACH KATEGORIE:

1. PEP8 UND FORMATIERUNG (XX/5)
   Status: [Python-Standards-Konformität]
   Flake8-Fehler: XX
   Black-Unterschiede: XX Dateien

2. TYPE HINTS (XX/5)
   Status: [Statische Typisierungsabdeckung]
   MyPy-Fehler: XX
   Abdeckung: XX%

3. RUFF-LINTING (XX/4)
   Status: [Codequalität]
   Warnungen: XX
   Ungenutzte Imports: XX
   Max. Komplexität: XX

4. KISS/DRY/YAGNI (XX/4)
   Status: [Einfachheit und Klarheit]
   Funktionen >20 Zeilen: XX
   Duplizierter Code: XX Instanzen

5. DOKUMENTATION (XX/4)
   Status: [Dokumentationsqualität]
   Fehlende Docstrings: XX
   Abdeckung: XX%

6. FEHLERBEHANDLUNG (XX/3)
   Status: [Code-Robustheit]
   Generische Exceptions: XX
   `except pass`: XX

TOP 3 PRIORITÄTS-AKTIONEN:
1. [Kritischste Aktion zur Qualitätsverbesserung]
2. [Zweite Prioritätsaktion]
3. [Dritte Prioritätsaktion]
```

## HINWEISE

- Alle verfügbaren Linting-Tools im Projekt ausführen
- Docker verwenden, um von lokaler Umgebung zu abstrahieren
- Beispiele problematischer Dateien/Zeilen bereitstellen
- Automatisierbare Korrekturen vorschlagen (Pre-Commit-Hooks)
- Quick Wins (Auto-Formatierung) vs. tiefes Refactoring priorisieren
