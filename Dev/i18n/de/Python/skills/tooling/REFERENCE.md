# Regel 06: Tooling

Python-Tooling für Codequalität, Testing und Entwicklungs-Workflow.

## Package-Management

### UV (Empfohlen)

Schneller Python-Package-Installer und Resolver.

```bash
# UV installieren
curl -LsSf https://astral.sh/uv/install.sh | sh

# Virtuelle Umgebung erstellen
uv venv

# Abhängigkeiten installieren
uv pip install -r requirements.txt

# Abhängigkeit hinzufügen
uv pip install fastapi

# Abhängigkeiten aktualisieren
uv pip install --upgrade package-name
```

### Poetry (Alternative)

```bash
# Poetry installieren
curl -sSL https://install.python-poetry.org | python3 -

# Projekt initialisieren
poetry init

# Abhängigkeiten installieren
poetry install

# Abhängigkeit hinzufügen
poetry add fastapi

# Dev-Abhängigkeit hinzufügen
poetry add --group dev pytest
```

## Linting und Formatierung

### Ruff (Empfohlen)

Extrem schneller Python-Linter (ersetzt Flake8, isort, pydocstyle).

```bash
# Installieren
pip install ruff

# Code prüfen
ruff check src/ tests/

# Auto-Fix
ruff check --fix src/ tests/

# Spezifische Regeln prüfen
ruff check --select E,F,I src/
```

Konfiguration in `pyproject.toml`:

```toml
[tool.ruff]
line-length = 88
target-version = "py312"

select = [
    "E",  # pycodestyle errors
    "F",  # pyflakes
    "I",  # isort
    "N",  # pep8-naming
    "W",  # pycodestyle warnings
    "UP", # pyupgrade
    "B",  # flake8-bugbear
    "S",  # flake8-bandit
    "C4", # flake8-comprehensions
]

ignore = ["E501"]  # line too long

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/*" = ["S101"]  # assert in Tests erlaubt
```

### Black (Code-Formatierer)

```bash
# Installieren
pip install black

# Code formatieren
black src/ tests/

# Ohne Änderung prüfen
black --check src/

# Konfiguration
black --line-length 88 src/
```

### isort (Import-Sortierer)

```bash
# Installieren
pip install isort

# Imports sortieren
isort src/ tests/

# Nur prüfen
isort --check src/

# Konfiguration mit Black
isort --profile black src/
```

## Typprüfung

### MyPy

```bash
# Installieren
pip install mypy

# Typ-Check
mypy src/

# Strict-Modus
mypy src/ --strict

# HTML-Report generieren
mypy src/ --html-report coverage/
```

Konfiguration in `pyproject.toml`:

```toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

## Testing

### Pytest

```bash
# Installieren
pip install pytest pytest-cov pytest-asyncio

# Alle Tests ausführen
pytest

# Mit Coverage ausführen
pytest --cov=src --cov-report=html

# Spezifischen Test ausführen
pytest tests/unit/test_user.py::test_create_user

# Verbose-Modus
pytest -vv

# Bei erstem Fehler stoppen
pytest -x
```

Konfiguration:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-ra -q --strict-markers"
markers = [
    "unit: Unit-Tests",
    "integration: Integrationstests",
    "e2e: End-to-End-Tests",
    "slow: Langsame Tests",
]
```

## Sicherheitsanalyse

### Bandit

```bash
# Installieren
pip install bandit

# Nach Schwachstellen scannen
bandit -r src/

# JSON-Ausgabe
bandit -r src/ -f json -o bandit-report.json

# Nur hohe Schwere anzeigen
bandit -r src/ -ll
```

### Safety

```bash
# Installieren
pip install safety

# Abhängigkeiten prüfen
safety check

# Gegen Requirements-Datei
safety check -r requirements.txt
```

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix]

  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
```

Installieren:

```bash
pip install pre-commit
pre-commit install

# Manuell ausführen
pre-commit run --all-files
```

## Makefile

```makefile
.PHONY: help install lint format type-check test test-cov clean

help:
	@echo "Verfügbare Befehle:"
	@echo "  install       Abhängigkeiten installieren"
	@echo "  lint          Linter ausführen"
	@echo "  format        Code formatieren"
	@echo "  type-check    Typ-Checker ausführen"
	@echo "  test          Tests ausführen"
	@echo "  test-cov      Tests mit Coverage ausführen"
	@echo "  quality       Alle Qualitätsprüfungen ausführen"
	@echo "  clean         Generierte Dateien bereinigen"

install:
	uv pip install -r requirements.txt
	uv pip install -r requirements-dev.txt

lint:
	ruff check src/ tests/

lint-fix:
	ruff check --fix src/ tests/

format:
	black src/ tests/
	isort src/ tests/

format-check:
	black --check src/ tests/
	isort --check src/ tests/

type-check:
	mypy src/

security-check:
	bandit -r src/ -ll
	safety check

test:
	pytest tests/

test-unit:
	pytest tests/unit/

test-integration:
	pytest tests/integration/

test-e2e:
	pytest tests/e2e/

test-cov:
	pytest --cov=src --cov-report=html --cov-report=term-missing

quality: lint format-check type-check security-check test-cov

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	rm -rf htmlcov/
	rm -rf coverage/
	rm -f .coverage
```

## Checkliste

- [ ] Package-Manager konfiguriert (uv oder poetry)
- [ ] Ruff konfiguriert und integriert
- [ ] Black konfiguriert
- [ ] MyPy im Strict-Modus
- [ ] Pytest mit Coverage
- [ ] Pre-commit Hooks installiert
- [ ] Makefile erstellt
- [ ] Sicherheitstools konfiguriert
- [ ] CI/CD führt alle Prüfungen aus
