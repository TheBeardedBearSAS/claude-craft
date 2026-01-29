# Code-Qualitaetswerkzeuge - Python

## Ruff - Schneller Python-Linter und Formatter

### Installation

```bash
pip install ruff
# Oder mit pipx fuer globale Installation
pipx install ruff
```

### pyproject.toml Konfiguration

```toml
[tool.ruff]
# Ziel-Python-Version
target-version = "py312"

# Zeilenlaenge
line-length = 88

# Ausgeschlossene Verzeichnisse
exclude = [
    ".git",
    "__pycache__",
    ".venv",
    "venv",
    ".eggs",
    "build",
    "dist",
    ".mypy_cache",
    ".pytest_cache",
]

[tool.ruff.lint]
# Aktivierte Regeln
select = [
    "E",      # pycodestyle Fehler
    "W",      # pycodestyle Warnungen
    "F",      # Pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
    "ARG",    # flake8-unused-arguments
    "SIM",    # flake8-simplify
    "PTH",    # flake8-use-pathlib
    "ERA",    # eradicate (auskommentierter Code)
    "RUF",    # Ruff-spezifische Regeln
    "S",      # flake8-bandit (Sicherheit)
    "T20",    # flake8-print
    "PL",     # Pylint
    "TRY",    # tryceratops
    "PERF",   # Perflint
    "ASYNC",  # flake8-async
]

# Ignorierte Regeln
ignore = [
    "E501",   # Zeile zu lang (wird vom Formatter behandelt)
    "S101",   # Verwendung von assert (fuer Tests erforderlich)
    "PLR0913", # Zu viele Argumente
]

# Ausnahmen pro Datei
[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = [
    "S101",   # Assert in Tests erlauben
    "ARG",    # Unbenutzte Argumente in Fixtures erlauben
    "PLR2004", # Magische Werte in Tests
]
"**/migrations/**/*.py" = [
    "ALL",    # Migrationen ignorieren
]

[tool.ruff.lint.isort]
# Import-Sortierungskonfiguration
known-first-party = ["src", "app"]
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
force-single-line = false
combine-as-imports = true

[tool.ruff.format]
# Formatierungsoptionen
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
```

### CLI-Befehle

```bash
# Auf Probleme pruefen
ruff check .

# Auto-korrigierbare Probleme beheben
ruff check --fix .

# Code formatieren
ruff format .

# Formatierung ohne Aenderungen pruefen
ruff format --check .

# Ueberwachungsmodus fuer Entwicklung
ruff check --watch .
```

## mypy - Statische Typueberpruefung

### Installation

```bash
pip install mypy
# Mit gaengigen Stubs
pip install types-requests types-python-dateutil types-redis
```

### pyproject.toml Konfiguration

```toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
show_error_codes = true
show_column_numbers = true

# Plugins
plugins = [
    "pydantic.mypy",
    "sqlalchemy.ext.mypy.plugin",
]

# Modulspezifische Ueberschreibungen
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
disallow_incomplete_defs = false

[[tool.mypy.overrides]]
module = "migrations.*"
ignore_errors = true
```

### CLI-Befehle

```bash
# Typueberpruefung ausfuehren
mypy src/

# Bericht generieren
mypy src/ --html-report mypy-report

# Bestimmte Datei pruefen
mypy src/main.py

# Strikter Modus
mypy --strict src/
```

## pytest - Test-Framework

### Installation

```bash
pip install pytest pytest-cov pytest-asyncio pytest-xdist httpx
```

### pyproject.toml Konfiguration

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_functions = ["test_*"]
python_classes = ["Test*"]
asyncio_mode = "auto"
addopts = [
    "-v",
    "--strict-markers",
    "--tb=short",
    "-ra",
    "--cov=src",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-report=xml",
    "--cov-fail-under=80",
]
markers = [
    "slow: markiert Tests als langsam",
    "integration: markiert Tests als Integrationstests",
    "unit: markiert Tests als Unit-Tests",
]
filterwarnings = [
    "error",
    "ignore::DeprecationWarning",
]
```

### CLI-Befehle

```bash
# Alle Tests ausfuehren
pytest

# Mit Abdeckung ausfuehren
pytest --cov=src --cov-report=html

# Bestimmte Testdatei ausfuehren
pytest tests/test_user.py

# Tests nach Muster ausfuehren
pytest -k "test_user"

# Parallel ausfuehren
pytest -n auto

# Nur fehlgeschlagene Tests ausfuehren
pytest --lf

# Ausfuehrliche Ausgabe
pytest -vv
```

## pre-commit - Git Hooks

### Installation

```bash
pip install pre-commit
pre-commit install
```

### .pre-commit-config.yaml

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.13.0
    hooks:
      - id: mypy
        additional_dependencies:
          - types-requests
          - pydantic

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-merge-conflict
      - id: detect-private-key
      - id: no-commit-to-branch
        args: ['--branch', 'main', '--branch', 'master']

  - repo: https://github.com/commitizen-tools/commitizen
    rev: v4.1.0
    hooks:
      - id: commitizen
        stages: [commit-msg]

  - repo: local
    hooks:
      - id: pytest-check
        name: pytest
        entry: pytest tests/ -x --no-cov
        language: system
        pass_filenames: false
        always_run: true
```

### CLI-Befehle

```bash
# Hooks installieren
pre-commit install

# Auf allen Dateien ausfuehren
pre-commit run --all-files

# Hooks aktualisieren
pre-commit autoupdate

# Hooks temporaer ueberspringen
git commit --no-verify -m "message"
```

## Bandit - Sicherheits-Linter

### Installation

```bash
pip install bandit[toml]
```

### pyproject.toml Konfiguration

```toml
[tool.bandit]
exclude_dirs = ["tests", "venv", ".venv"]
skips = ["B101"]  # Assert-Warnungen ueberspringen

[tool.bandit.assert_used]
skips = ["*_test.py", "test_*.py"]
```

### CLI-Befehle

```bash
# Sicherheitsanalyse ausfuehren
bandit -r src/

# Ausgabe in Datei
bandit -r src/ -f json -o bandit-report.json

# Nach Schweregrad filtern
bandit -r src/ -ll  # Nur mittel und hoch
```

## Coverage.py - Code-Abdeckung

### pyproject.toml Konfiguration

```toml
[tool.coverage.run]
source = ["src"]
branch = true
omit = [
    "*/tests/*",
    "*/__pycache__/*",
    "*/migrations/*",
    "*/.venv/*",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise NotImplementedError",
    "if TYPE_CHECKING:",
    "if __name__ == .__main__.:",
    "@abstractmethod",
]
fail_under = 80
show_missing = true

[tool.coverage.html]
directory = "htmlcov"
```

## EditorConfig

### .editorconfig

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.py]
indent_size = 4
max_line_length = 88

[*.{yml,yaml,toml,json}]
indent_size = 2

[Makefile]
indent_style = tab
```

## VS Code Konfiguration

### .vscode/settings.json

```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "python.analysis.typeCheckingMode": "strict",

  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },

  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["tests"],

  "mypy.runUsingActiveInterpreter": true,

  "files.exclude": {
    "**/__pycache__": true,
    "**/.pytest_cache": true,
    "**/.mypy_cache": true,
    "**/*.egg-info": true
  }
}
```

### .vscode/extensions.json

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "ms-python.mypy-type-checker",
    "tamasfe.even-better-toml",
    "redhat.vscode-yaml",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

## GitHub Actions CI

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -e ".[dev]"

      - name: Lint with Ruff
        run: ruff check .

      - name: Format check with Ruff
        run: ruff format --check .

      - name: Type check with mypy
        run: mypy src/

      - name: Security check with Bandit
        run: bandit -r src/

      - name: Test with pytest
        run: pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
```

## Makefile

```makefile
.PHONY: install lint format test coverage clean

install:
	pip install -e ".[dev]"
	pre-commit install

lint:
	ruff check .
	mypy src/

format:
	ruff format .
	ruff check --fix .

test:
	pytest

coverage:
	pytest --cov=src --cov-report=html
	open htmlcov/index.html

security:
	bandit -r src/

clean:
	rm -rf .pytest_cache .mypy_cache .ruff_cache htmlcov .coverage
	find . -type d -name __pycache__ -exec rm -rf {} +

quality: format lint test security
	@echo "Alle Qualitaetspruefungen bestanden!"
```

## Qualitaets-Checkliste

### Vor jedem Commit

- [ ] Code mit Ruff formatiert
- [ ] Keine Linting-Fehler
- [ ] Keine Typfehler (mypy)
- [ ] Tests bestanden
- [ ] Keine Sicherheitsprobleme (bandit)
- [ ] Commit-Nachricht folgt Conventional Commits

### Vor jedem Push

- [ ] Alle Tests bestanden
- [ ] Abdeckung >= 80%
- [ ] Keine TODO/FIXME im committeten Code
- [ ] Dokumentation aktualisiert

### Ziele fuer Qualitaetsmetriken

- **Testabdeckung**: >= 80%
- **Typabdeckung**: 100%
- **Linting-Fehler**: 0
- **Sicherheitsprobleme**: 0
- **Zyklomatische Komplexitaet**: < 10 pro Funktion

## Fazit

Qualitaetswerkzeuge ermoeglichen:

1. **Konsistenz**: Einheitlicher Code im gesamten Team
2. **Qualitaet**: Fruehe Fehlererkennung
3. **Sicherheit**: Erkennung von Schwachstellen
4. **Wartbarkeit**: Einfach zu wartender Code
5. **Vertrauen**: Deployment mit Zuversicht

**Goldene Regel**: Code-Qualitaet muss automatisiert und nicht verhandelbar sein.
