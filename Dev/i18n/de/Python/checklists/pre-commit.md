# Pre-Commit-Checkliste

## Vor jedem Commit

### 1. Code-Qualität

- [ ] **Linting** - Code folgt Standards
  ```bash
  make lint
  # oder
  ruff check src/ tests/
  ```

- [ ] **Formatierung** - Code ordnungsgemäß formatiert
  ```bash
  make format-check
  # oder
  black --check src/ tests/
  isort --check src/ tests/
  ```

- [ ] **Typ-Checking** - Keine Typ-Fehler
  ```bash
  make type-check
  # oder
  mypy src/
  ```

- [ ] **Sicherheit** - Keine offensichtlichen Schwachstellen
  ```bash
  make security-check
  # oder
  bandit -r src/ -ll
  ```

### 2. Tests

- [ ] **Alle Tests bestehen**
  ```bash
  make test
  # oder
  pytest tests/
  ```

- [ ] **Neue Tests geschrieben** für neuen Code
  - [ ] Unit-Tests für neue Logik
  - [ ] Integrationstests falls erforderlich
  - [ ] E2E-Tests falls kritischer Ablauf

- [ ] **Coverage beibehalten** (> 80%)
  ```bash
  make test-cov
  # oder
  pytest --cov=src --cov-report=term
  ```

- [ ] **Relevante Tests** für behobene Bugs
  - [ ] Test reproduziert Bug (sollte vor Fix fehlschlagen)
  - [ ] Test läuft nach Fix durch

### 3. Code-Standards

- [ ] **PEP 8** eingehalten
  - [ ] Max. Zeile 88 Zeichen
  - [ ] Imports organisiert (stdlib, third-party, lokal)
  - [ ] Keine abschließenden Leerzeichen

- [ ] **Type Hints** auf allen öffentlichen Funktionen
  ```python
  def my_function(param: str) -> int:
      """Docstring."""
      pass
  ```

- [ ] **Docstrings** Google-Stil
  ```python
  def function(arg1: str, arg2: int) -> bool:
      """
      Zusammenfassungszeile.

      Args:
          arg1: Beschreibung
          arg2: Beschreibung

      Returns:
          Beschreibung

      Raises:
          ValueError: Wenn Bedingung
      """
      pass
  ```

- [ ] **Namenskonventionen**
  - [ ] Klassen: PascalCase
  - [ ] Funktionen/Variablen: snake_case
  - [ ] Konstanten: UPPER_CASE
  - [ ] Privat: _vorangestellt

### 4. Architektur

- [ ] **Clean Architecture** eingehalten
  - [ ] Domain hängt von nichts ab
  - [ ] Abhängigkeiten zeigen nach innen
  - [ ] Protocols für Abstraktionen

- [ ] **SOLID** angewendet
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI**
  - [ ] Einfache Lösung
  - [ ] Keine Duplikation
  - [ ] Kein unnötiger Code

### 5. Sicherheit

- [ ] **Keine Geheimnisse** fest im Code codiert
  - [ ] Keine Passwörter
  - [ ] Keine API-Schlüssel
  - [ ] Keine Token

- [ ] **Umgebungsvariablen**
  - [ ] Zu `.env.example` hinzugefügt falls neu
  - [ ] In README dokumentiert falls erforderlich

- [ ] **Eingabevalidierung**
  - [ ] Alle Eingaben validiert (Pydantic)
  - [ ] Keine SQL-Injection (parametrisierte Abfragen)
  - [ ] Keine XSS-Injection

- [ ] **Sensible Daten**
  - [ ] Passwörter gehasht (bcrypt)
  - [ ] PII geschützt
  - [ ] Logs enthalten keine sensiblen Daten

### 6. Datenbank

- [ ] **Migration** erstellt falls Schema-Änderung
  ```bash
  make db-migrate msg="Beschreibung"
  # oder
  alembic revision --autogenerate -m "Beschreibung"
  ```

- [ ] **Migration getestet**
  - [ ] Upgrade funktioniert
  - [ ] Downgrade funktioniert
  - [ ] Kein Datenverlust

- [ ] **Indizes** hinzugefügt falls erforderlich
  - [ ] Auf häufig durchsuchten Spalten
  - [ ] Auf Fremdschlüsseln

### 7. Performance

- [ ] **N+1-Abfragen** vermieden
  - [ ] Verwendung von joinedload/selectinload falls erforderlich
  - [ ] Keine Abfragen in Schleifen

- [ ] **Paginierung** für große Listen
  - [ ] Limit/Offset implementiert
  - [ ] Keine Tausende von Elementen laden

- [ ] **Caching** falls angebracht
  - [ ] Cache für häufig abgerufene Daten
  - [ ] Cache-Invalidierung verwaltet

### 8. Logging & Monitoring

- [ ] **Angemessenes Logging**
  - [ ] Korrektes Level (DEBUG, INFO, WARNING, ERROR)
  - [ ] Klare und informative Meldungen
  - [ ] Kontext hinzugefügt (user_id, request_id, etc.)

- [ ] **Kein print()** - Logger verwenden
  ```python
  # ❌ Schlecht
  print(f"Benutzer {user_id} erstellt")

  # ✅ Gut
  logger.info(f"Benutzer erstellt", extra={"user_id": user_id})
  ```

- [ ] **Exceptions protokolliert**
  ```python
  try:
      risky_operation()
  except Exception as e:
      logger.error(f"Operation fehlgeschlagen: {e}", exc_info=True)
      raise
  ```

### 9. Dokumentation

- [ ] **Code-Kommentare** für komplexe Logik
  - [ ] Keine offensichtlichen Kommentare
  - [ ] Erklärung des "Warum", nicht "Was"

- [ ] **README** aktualisiert falls erforderlich
  - [ ] Neue Features dokumentiert
  - [ ] Setup-Anweisungen aktuell
  - [ ] Umgebungsvariablen dokumentiert

- [ ] **API-Docs** aktuell
  - [ ] Neue Endpoints dokumentiert
  - [ ] Beispiele bereitgestellt
  - [ ] Fehler dokumentiert

### 10. Git

- [ ] **Commit-Message** folgt Conventional Commits
  ```
  type(scope): subject

  body

  footer
  ```
  - Typen: feat, fix, docs, style, refactor, test, chore
  - Subject: imperativ, Kleinbuchstaben, kein Punkt
  - Body: optional, Änderungsdetails
  - Footer: Breaking Changes, schließt Issues

- [ ] **Atomarer Commit**
  - [ ] Ein Commit = eine logische Änderung
  - [ ] Keine riesigen Commits
  - [ ] Keine "WIP"- oder "fix"-Commits

- [ ] **Temporäre Dateien** nicht enthalten
  - [ ] Keine .pyc, __pycache__
  - [ ] Keine .env (nur .env.example)
  - [ ] Keine IDE-Dateien

### 11. Abhängigkeiten

- [ ] **Neue Abhängigkeiten** begründet
  - [ ] Wirklich notwendig?
  - [ ] Keine Alternative in bestehenden Deps?
  - [ ] Gewartete und sichere Bibliothek?

- [ ] **Lock-Datei** aktualisiert
  ```bash
  poetry lock
  # oder
  uv lock
  ```

- [ ] **Version korrekt gepinnt**
  - [ ] Nicht zu breite Versionen (`*`)
  - [ ] Kompatibel mit anderen Deps

### 12. Aufräumen

- [ ] **Toter Code** entfernt
  - [ ] Kein auskommentierter Code
  - [ ] Keine ungenutzten Funktionen
  - [ ] Keine ungenutzten Imports

- [ ] **Debug-Code** entfernt
  - [ ] Kein breakpoint()
  - [ ] Keine Debug-Prints
  - [ ] Keine TODO/FIXME (oder Issue erstellen)

- [ ] **Konsolen-Logs** entfernt
  - [ ] Keine Debug-print()
  - [ ] Geeignete Logs verwendet

## Quick-Check-Befehl

```bash
# Einzeiler zum Prüfen von allem
make quality && make test-cov
```

## Pre-Commit-Hook

Zur Automatisierung Pre-Commit-Hooks verwenden:

```bash
# .pre-commit-config.yaml bereits konfiguriert
pre-commit install

# Manuell ausführen
pre-commit run --all-files
```

## Wenn etwas fehlschlägt

### Linting-Fehler

```bash
# Auto-Fix für Behebbare
make lint-fix
# oder
ruff check --fix src/ tests/
```

### Formatierungsfehler

```bash
# Auto-Format
make format
# oder
black src/ tests/
isort src/ tests/
```

### Fehlschlagende Tests

```bash
# Tests im Verbose-Modus zum Debuggen ausführen
pytest -vv tests/

# Spezifischen Test ausführen
pytest tests/path/to/test.py::test_function -vv

# stdout/stderr anzeigen
pytest -s tests/
```

### Typ-Fehler

```bash
# Detaillierte Fehler anzeigen
mypy src/ --show-error-codes

# Temporär ignorieren (vermeiden!)
# type: ignore[error-code]
```

## Ausnahmen

### Dringender Hotfix

Wenn dringender Produktions-Hotfix:
- [ ] Mindest-Tests laufen durch
- [ ] Fix manuell verifiziert
- [ ] PR sofort danach erstellt
- [ ] TODO erstellt zur Verbesserung der Tests

### WIP-Commit

Wenn wirklich notwendig (vermeiden):
- [ ] Commit in separatem Branch
- [ ] Mit `WIP:` vorangestellt
- [ ] Vor Merge zu main squashen

## Quick-Checkliste (Minimum)

- [ ] `make lint` ✅
- [ ] `make type-check` ✅
- [ ] `make test` ✅
- [ ] Gültige Commit-Message ✅
- [ ] Keine Geheimnisse ✅
