# Python-Entwicklungsregeln für Claude Code

Dieses Verzeichnis enthält vollständige Python-Entwicklungsregeln für Claude Code.

## Struktur

```
Python/
├── CLAUDE.md.template          # Hauptvorlage für neue Projekte
├── README.md                   # Diese Datei
│
├── rules/                      # Entwicklungsregeln
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-async.md
│   └── 13-frameworks.md
│
├── templates/                  # Code-Vorlagen
│   ├── service.md
│   ├── repository.md
│   ├── api-endpoint.md
│   ├── test-unit.md
│   └── test-integration.md
│
├── checklists/                 # Prozess-Checklisten
│   ├── pre-commit.md
│   ├── new-feature.md
│   ├── refactoring.md
│   └── security.md
│
└── examples/                   # Vollständige Code-Beispiele
    └── (demnächst)
```

## Verwendung

### Für ein neues Python-Projekt

1. **CLAUDE.md.template kopieren** ins Projekt:
   ```bash
   cp Python/CLAUDE.md.template /path/to/project/CLAUDE.md
   ```

2. **Platzhalter ersetzen**:
   - `{{PROJECT_NAME}}` - Projektname
   - `{{PROJECT_VERSION}}` - Version (z.B. 0.1.0)
   - `{{TECH_STACK}}` - Technologie-Stack
   - `{{WEB_FRAMEWORK}}` - FastAPI/Django/Flask
   - `{{PYTHON_VERSION}}` - Python-Version (z.B. 3.11)
   - `{{ORM}}` - SQLAlchemy/Django ORM/etc.
   - `{{TASK_QUEUE}}` - Celery/RQ/arq
   - `{{PACKAGE_MANAGER}}` - poetry/uv
   - usw.

3. **Anpassen** nach Projektbedarf:
   - Spezifische Regeln im Abschnitt `SPECIFIC_RULES` hinzufügen
   - Makefile-Befehle bei Bedarf anpassen
   - Kontaktinformationen vervollständigen

4. **00-project-context.md.template kopieren** (optional):
   ```bash
   cp Python/rules/00-project-context.md.template /path/to/project/docs/context.md
   ```
   Und alle spezifischen Informationen ausfüllen.

### Für ein bestehendes Projekt

1. **CLAUDE.md hinzufügen** mit den Regeln
2. **Bestehenden Code schrittweise anpassen**
3. **Checklisten verwenden** für neue Features

## Regelinhalt

### Rules (Grundlegende Regeln)

#### 01-workflow-analysis.md
**Obligatorische Analyse vor jeder Änderung**

Methodik in 7 Schritten:
1. Anforderung verstehen
2. Bestehenden Code erkunden
3. Auswirkungen identifizieren
4. Lösung entwerfen
5. Implementierung planen
6. Risiken identifizieren
7. Tests definieren

**Vollständige Beispiele** für:
- Neue Feature (E-Mail-Benachrichtigungssystem)
- Bug-Fix
- Dokumentationsvorlagen

#### 02-architecture.md
**Clean Architecture & Hexagonal**

- Vollständige Projektstruktur
- Domain/Application/Infrastructure-Schichten
- Entitäten, Value Objects, Services
- Repository-Pattern
- Dependency Injection
- Event-Driven Architecture
- CQRS-Pattern

**200+ annotierte Code-Beispiele**.

#### 03-coding-standards.md
**Python-Code-Standards**

- Vollständiges PEP 8
- Import-Organisation
- Type Hints (PEP 484, 585, 604)
- Docstrings Google/NumPy-Stil
- Namenskonventionen
- Comprehensions
- Context Manager
- Exception Handling

#### 04-solid-principles.md
**SOLID-Prinzipien mit Python-Beispielen**

Jedes Prinzip mit:
- Erklärung
- Verletzungsbeispiel
- Korrektes Beispiel
- Konkrete Anwendungsfälle

Plus: Vollständiges Beispiel eines Benachrichtigungssystems.

#### 05-kiss-dry-yagni.md
**Prinzipien der Einfachheit**

- KISS: Einfachheit bevorzugen
- DRY: Duplizierung vermeiden
- YAGNI: Nur Notwendiges implementieren

Mit vielen Beispielen für Verletzungen und Korrekturen.

#### 06-tooling.md
**Entwicklungswerkzeuge**

- Poetry / uv (Paketverwaltung)
- pyenv (Versionsverwaltung)
- Docker + docker-compose
- Vollständiges Makefile
- Pre-commit Hooks
- Ruff, Black, isort (Linting/Formatierung)
- mypy (Typprüfung)
- Bandit (Sicherheit)
- CI/CD (GitHub Actions)

Vollständige Konfiguration bereitgestellt.

#### 07-testing.md
**Teststrategie**

- pytest-Konfiguration
- Unit-Tests (vollständige Isolation)
- Integrationstests (echte DB)
- E2E-Tests (vollständige Flows)
- Erweiterte Fixtures
- Mocking mit pytest-mock
- Abdeckung mit pytest-cov

**Viele Testbeispiele**.

#### 09-git-workflow.md
**Git-Workflow & Conventional Commits**

- Branch-Namenskonvention
- Conventional Commits (Types, Scope, Format)
- Atomare Commits
- Pre-commit Hooks
- PR-Vorlage
- Nützliche Git-Befehle

### Templates (Code-Vorlagen)

#### service.md
Vollständige Vorlage für Domain Service:
- Wann verwenden
- Vollständige Struktur
- Konkretes Beispiel (PricingService)
- Unit-Tests
- Checkliste

#### repository.md
Vollständige Vorlage für Repository-Pattern:
- Interface (Protocol) im Domain
- Implementierung in Infrastructure
- ORM-Modell
- Konkretes Beispiel (UserRepository)
- Unit- und Integrationstests
- Checkliste

### Checklists (Prozesse)

#### pre-commit.md
**Checkliste vor jedem Commit**

12 Kategorien:
1. Code-Qualität (Lint, Format, Types, Sicherheit)
2. Tests (Unit, Integration, Abdeckung)
3. Code-Standards (PEP 8, Type Hints, Docstrings)
4. Architektur (Clean, SOLID, KISS/DRY/YAGNI)
5. Sicherheit (Secrets, Validierung, Passwörter)
6. Datenbank (Migrationen)
7. Performance (N+1, Pagination, Cache)
8. Logging & Monitoring
9. Dokumentation
10. Git (Message, Atomarität)
11. Dependencies
12. Aufräumen (toter Code, Debug)

#### new-feature.md
**Checkliste neue Feature**

7 vollständige Phasen:
1. Analyse (obligatorisch)
2. Implementierung (Domain/Application/Infrastructure)
3. Tests (Unit/Integration/E2E)
4. Qualität (Lint, Types, Review)
5. Dokumentation
6. Git & PR
7. Deployment

## Wichtige Regeln

### 1. Analyse OBLIGATORISCH

**KEINE Code-Änderung ohne vorherige Analyse.**

Siehe `rules/01-workflow-analysis.md`.

### 2. Clean Architecture

```
Domain (reine Geschäftslogik)
  ↑
Application (Use Cases)
  ↑
Infrastructure (Adapter: API, DB, etc.)
```

Abhängigkeiten zeigen **immer nach innen**.

### 3. SOLID

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 4. Tests

- Unit: > 95% Domain-Abdeckung
- Integration: > 75% Infrastructure-Abdeckung
- E2E: Kritische Flows

### 5. Type Hints

**Obligatorisch** für alle öffentlichen Funktionen.

```python
def my_function(param: str) -> int:
    """Docstring."""
    pass
```

### 6. Docstrings

**Google-Stil** für alle öffentlichen Funktionen/Klassen.

```python
def function(arg1: str) -> bool:
    """
    Zusammenfassung.

    Args:
        arg1: Beschreibung

    Returns:
        Beschreibung

    Raises:
        ValueError: Wenn Bedingung
    """
    pass
```

## Schnellbefehle

### Projekt-Setup

```bash
# Vorlage kopieren
cp Python/CLAUDE.md.template myproject/CLAUDE.md

# Platzhalter bearbeiten
vim myproject/CLAUDE.md

# Projekt einrichten
cd myproject
make setup
```

### Entwicklung

```bash
make dev          # Umgebung starten
make test         # Alle Tests
make quality      # Lint + Type-Check + Sicherheit
make test-cov     # Tests mit Abdeckung
```

### Pre-commit

```bash
# Schnellprüfung vor Commit
make quality && make test-cov

# Oder mit Pre-commit Hooks
pre-commit run --all-files
```

## Zusätzliche Ressourcen

### Externe Dokumentation

- [PEP 8](https://pep8.org/)
- [Type Hints (PEP 484)](https://www.python.org/dev/peps/pep-0484/)
- [Protocols (PEP 544)](https://www.python.org/dev/peps/pep-0544/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID-Prinzipien](https://en.wikipedia.org/wiki/SOLID)

### Werkzeuge

- [Poetry](https://python-poetry.org/)
- [uv](https://github.com/astral-sh/uv)
- [Ruff](https://github.com/astral-sh/ruff)
- [mypy](https://mypy.readthedocs.io/)
- [pytest](https://docs.pytest.org/)

## Beitragen

Um diese Regeln zu verbessern:

1. Issue zur Diskussion erstellen
2. Konkrete Beispiele vorschlagen
3. PR mit Änderungen einreichen

## Lizenz

Diese Regeln sind für den internen Gebrauch bei TheBeardedCTO Tools bestimmt.

---

**Version**: 1.0.0
**Letzte Aktualisierung**: 2025-12-03
