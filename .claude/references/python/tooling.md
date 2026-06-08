# Rule 06: Tooling

Python tooling for code quality, testing, and development workflow.

## Package Management

### UV (Recommended) — Gestionnaire de projet complet

uv est le gestionnaire de projet Python recommandé : gestion des dépendances, environnement virtuel,
lockfile, et exécution des commandes — tout en un.

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# --- Workflow projet complet ---

# Initialiser un nouveau projet (crée pyproject.toml, .python-version, .venv, uv.lock)
uv init my-project
cd my-project

# Ajouter une dépendance (met à jour pyproject.toml + uv.lock + .venv)
uv add fastapi

# Ajouter une dépendance de développement
uv add --dev pytest ruff mypy

# Synchroniser l'environnement depuis uv.lock (après un clone ou un pull)
uv sync

# Exécuter une commande dans l'environnement du projet (vérifie uv.lock avant)
uv run python src/main.py
uv run pytest
uv run mypy src/

# Installer une version Python spécifique
uv python install 3.14
uv python install 3.14t   # version free-threaded (sans GIL)

# Mettre à jour une dépendance
uv add fastapi@latest

# Voir les dépendances
uv tree
```

> **Note :** `uv pip install` reste disponible pour une interface compatible pip, mais `uv add` est
> l'approche recommandée pour la gestion de projet car elle maintient `pyproject.toml` et `uv.lock`
> en synchronisation automatique.

### Poetry (Alternative)

```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Initialize project
poetry init

# Install dependencies
poetry install

# Add dependency
poetry add fastapi

# Add dev dependency
poetry add --group dev pytest
```

## Linting and Formatting

### Ruff (Recommended)

Extremely fast Python linter (replaces Flake8, isort, pydocstyle).

```bash
# Install
pip install ruff

# Check code
ruff check src/ tests/

# Auto-fix
ruff check --fix src/ tests/

# Check specific rules
ruff check --select E,F,I src/
```

Configuration in `pyproject.toml`:

```toml
[tool.ruff]
line-length = 88
target-version = "py314"

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
"tests/*" = ["S101"]  # assert allowed in tests
```

### Formatage avec ruff format

`ruff format` remplace Black. La configuration se fait dans `[tool.ruff.format]` dans `pyproject.toml`.

```bash
# Format code (remplace: black src/ tests/)
ruff format src/ tests/

# Check without modifying (remplace: black --check src/)
ruff format --check src/ tests/
```

> **Migration depuis Black/isort :** Black et isort sont désormais **legacy** — remplacés par
> `ruff format` (formatage) et `ruff check --select I` (tri des imports via `[tool.ruff.lint.isort]`).
> Supprimer `black` et `isort` des dépendances et du pre-commit lors de la migration.

### Black (legacy — remplacé par ruff format)

Black reste fonctionnel mais n'est plus recommandé pour les nouveaux projets. La configuration
`[tool.black]` dans `pyproject.toml` peut être migrée vers `[tool.ruff.format]`.

### isort (legacy — remplacé par ruff lint isort)

isort est remplacé par la règle `I` de ruff avec la section `[tool.ruff.lint.isort]`.

## Type Checking

### MyPy

```bash
# Install
pip install mypy

# Type check
mypy src/

# Strict mode
mypy src/ --strict

# Generate HTML report
mypy src/ --html-report coverage/
```

Configuration in `pyproject.toml`:

```toml
[tool.mypy]
python_version = "3.14"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
# mypy 2.0+ : ces options sont désormais activées par défaut
# local_partial_types = true   # default depuis 2.0
# strict_bytes = true          # default depuis 2.0

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

### mypy 2.0 — Breaking Changes

mypy 2.0 (mai 2026) introduit des changements de défauts importants et le parallélisme :

| Changement | Avant 2.0 | Depuis 2.0 |
|------------|-----------|------------|
| `--local-partial-types` | opt-in | **activé par défaut** |
| `--strict-bytes` | opt-in | **activé par défaut** |
| `--allow-redefinition-new` | nom temporaire | renommé `--allow-redefinition` |
| Support Python 3.9 | supporté | **supprimé** — minimum 3.10 |
| Parallélisme | non disponible | `--num-workers N` (jusqu'à 5x plus rapide) |

**Migration :** lancer `uv run mypy --num-workers 4 src/` sur un checkout propre et corriger les
erreurs dues aux nouveaux défauts. Utiliser `--allow-redefinition-old` si besoin de l'ancien comportement.

## Testing

### Pytest

```bash
# Install
pip install pytest pytest-cov pytest-asyncio

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test
pytest tests/unit/test_user.py::test_create_user

# Verbose mode
pytest -vv

# Stop at first failure
pytest -x
```

Configuration:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-ra -q --strict-markers"
markers = [
    "unit: Unit tests",
    "integration: Integration tests",
    "e2e: End-to-end tests",
    "slow: Slow tests",
]
```

## Security Analysis

### Bandit

```bash
# Install
pip install bandit

# Scan for vulnerabilities
bandit -r src/

# JSON output
bandit -r src/ -f json -o bandit-report.json

# Only show high severity
bandit -r src/ -ll
```

### Safety

```bash
# Install
pip install safety

# Check dependencies
safety check

# Against requirements file
safety check -r requirements.txt
```

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
# Lancer: pre-commit autoupdate pour rafraîchir les versions
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/astral-sh/ruff-pre-commit
    # ruff lint (remplace flake8 + isort) + ruff format (remplace black)
    rev: v0.15.16
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v2.1.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests, pydantic]
```

Install:

```bash
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

## Makefile

```makefile
.PHONY: help install lint format type-check test test-cov clean

help:
	@echo "Available commands:"
	@echo "  install       Install dependencies"
	@echo "  lint          Run linter"
	@echo "  format        Format code"
	@echo "  type-check    Run type checker"
	@echo "  test          Run tests"
	@echo "  test-cov      Run tests with coverage"
	@echo "  quality       Run all quality checks"
	@echo "  clean         Clean generated files"

install:
	uv sync

lint:
	ruff check src/ tests/

lint-fix:
	ruff check --fix src/ tests/

format:
	ruff format src/ tests/
	ruff check --fix --select I src/ tests/

format-check:
	ruff format --check src/ tests/
	ruff check --select I src/ tests/

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

## Claude Code LSP Plugin

The LSP plugin gives Claude structural code understanding via the Language Server Protocol: automatic diagnostics after each edit, go-to-definition, find references, and type information on hover.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Automatic diagnostics** | Type errors and warnings detected after each modification |
| **Go to Definition** | Navigate to the exact definition of a symbol |
| **Find References** | All usages of a symbol across the project |
| **Hover** | Type information and documentation |
| **Workspace Symbols** | Search symbols across the entire project |
| **Call Hierarchy** | Trace incoming/outgoing calls |

### Installation

```bash
# 1. Install the language server
pip install pyright

# 2. Install the Claude Code plugin (official marketplace)
/plugins install pyright-lsp@claude-plugins-official
```

### Benefits for Python

- Real-time type checking complementing MyPy strict mode
- Accurate navigation through virtual environments and installed packages
- Pydantic model validation and type inference
- FastAPI route and dependency injection awareness

---

## Checklist

- [ ] Package manager configured (uv or poetry)
- [ ] Ruff configured and integrated (lint + format)
- [ ] ruff format configured (remplace Black)
- [ ] MyPy in strict mode (v2.0+)
- [ ] Pytest with coverage
- [ ] Pre-commit hooks installed
- [ ] Makefile created
- [ ] Security tools configured
- [ ] CI/CD runs all checks
- [ ] Claude Code LSP plugin installed
