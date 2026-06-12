# Code Quality Tools - Python

> **Version de référence :** Python **3.14 (stable, 3.14.6+)** — Python 3.15 en beta (release oct. 2026).
> FastAPI **~0.136.x** — Python 3.10+ minimum, Pydantic v2 obligatoire.
> Pydantic **>=2.9, 2.13.x recommandé**.

## Ruff - Fast Python Linter & Formatter

### Installation

```bash
pip install ruff
# Or with pipx for global installation
pipx install ruff
```

### pyproject.toml Configuration

```toml
[tool.ruff]
# Target Python version
target-version = "py314"

# Line length
line-length = 88

# Exclude directories
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
# Enable rules
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # Pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
    "ARG",    # flake8-unused-arguments
    "SIM",    # flake8-simplify
    "PTH",    # flake8-use-pathlib
    "ERA",    # eradicate (commented-out code)
    "RUF",    # Ruff-specific rules
    "S",      # flake8-bandit (security)
    "T20",    # flake8-print
    "PL",     # Pylint
    "TRY",    # tryceratops
    "PERF",   # Perflint
    "ASYNC",  # flake8-async
]

# Ignore specific rules
ignore = [
    "E501",   # Line too long (handled by formatter)
    "S101",   # Use of assert (needed for tests)
    "PLR0913", # Too many arguments
]

# Per-file ignores
[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = [
    "S101",   # Allow assert in tests
    "ARG",    # Allow unused arguments in fixtures
    "PLR2004", # Magic values in tests
]
"**/migrations/**/*.py" = [
    "ALL",    # Ignore migrations
]

[tool.ruff.lint.isort]
# Import sorting configuration
known-first-party = ["src", "app"]
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
force-single-line = false
combine-as-imports = true

[tool.ruff.format]
# Formatting options
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
```

### CLI Commands

```bash
# Check for issues
ruff check .

# Fix auto-fixable issues
ruff check --fix .

# Format code
ruff format .

# Check formatting without changes
ruff format --check .

# Watch mode for development
ruff check --watch .
```

## mypy - Static Type Checking

### Installation

```bash
pip install mypy
# With common stubs
pip install types-requests types-python-dateutil types-redis
# Ou via uv (recommandé)
uv add --dev mypy types-requests
```

### mypy 2.0 — Breaking Changes

mypy 2.0 (mai 2026) introduit des changements de défauts et le parallélisme expérimental :

| Changement | Avant 2.0 | Depuis 2.0 |
|------------|-----------|------------|
| `--local-partial-types` | opt-in | **activé par défaut** |
| `--strict-bytes` | opt-in | **activé par défaut** |
| `--allow-redefinition-new` | nom temporaire | renommé `--allow-redefinition` |
| Support Python 3.9 | supporté | **supprimé** — minimum `--python-version 3.10` |
| Parallélisme | non disponible | `--num-workers N` (jusqu'à 5x sur gros projets) |

**Migration depuis mypy 1.x :**
1. Mettre à jour `mirrors-mypy` en `v2.1.0` dans `.pre-commit-config.yaml`
2. Lancer `mypy --num-workers 4 src/` et corriger les nouvelles erreurs
3. Si besoin de l'ancien comportement de redéfinition : utiliser `--allow-redefinition-old`

### pyproject.toml Configuration

```toml
[tool.mypy]
python_version = "3.14"
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
# mypy 2.0+ : ces options sont désormais activées par défaut
# local_partial_types = true   # default depuis 2.0
# strict_bytes = true          # default depuis 2.0

# Plugins
plugins = [
    "pydantic.mypy",
    "sqlalchemy.ext.mypy.plugin",
]

# Per-module overrides
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
disallow_incomplete_defs = false

[[tool.mypy.overrides]]
module = "migrations.*"
ignore_errors = true
```

### CLI Commands

```bash
# Run type checking
mypy src/

# Parallel type checking (mypy 2.0+, recommandé sur gros projets)
mypy --num-workers 4 src/

# Generate report
mypy src/ --html-report mypy-report

# Check specific file
mypy src/main.py

# Strict mode
mypy --strict src/
```

## pytest - Testing Framework

### Installation

```bash
pip install pytest pytest-cov pytest-asyncio pytest-xdist httpx
```

### asyncio_mode — choisir le bon mode

`pytest-asyncio` propose deux modes principaux, à choisir selon le profil du projet :

| Mode | Valeur | Quand l'utiliser |
|------|--------|-----------------|
| **`auto`** | `asyncio_mode = "auto"` | Projets **full-async** (FastAPI, SQLAlchemy async) : toutes les coroutines sont automatiquement détectées comme tests async — aucun `@pytest.mark.asyncio` requis. |
| **`strict`** | `asyncio_mode = "strict"` (défaut depuis pytest-asyncio 0.21) | Équipes **mixtes sync/async** : seuls les tests explicitement marqués `@pytest.mark.asyncio` sont traités comme async — évite les effets de bord sur les tests sync. |

> **Recommandation :** utiliser `auto` pour les projets FastAPI/full-async, `strict` (défaut) pour tout autre projet.

### pyproject.toml Configuration

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_functions = ["test_*"]
python_classes = ["Test*"]
asyncio_mode = "auto"  # "strict" pour projets mixtes sync/async
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
    "slow: marks tests as slow",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
]
filterwarnings = [
    "error",
    "ignore::DeprecationWarning",
]
```

### CLI Commands

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_user.py

# Run tests matching pattern
pytest -k "test_user"

# Run in parallel
pytest -n auto

# Run only failed tests
pytest --lf

# Verbose output
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
# Lancer: pre-commit autoupdate pour rafraîchir les versions
repos:
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

### CLI Commands

```bash
# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files

# Update hooks
pre-commit autoupdate

# Skip hooks temporarily
git commit --no-verify -m "message"
```

## Bandit - Security Linter

### Installation

```bash
pip install bandit[toml]
```

### pyproject.toml Configuration

```toml
[tool.bandit]
exclude_dirs = ["tests", "venv", ".venv"]
skips = ["B101"]  # Skip assert warnings

[tool.bandit.assert_used]
skips = ["*_test.py", "test_*.py"]
```

### CLI Commands

```bash
# Run security scan
bandit -r src/

# Output to file
bandit -r src/ -f json -o bandit-report.json

# Severity filter
bandit -r src/ -ll  # Only medium and high
```

## Coverage.py - Code Coverage

### pyproject.toml Configuration

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

## VS Code Configuration

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
          python-version: '3.14'
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
	@echo "All quality checks passed!"
```

## Quality Checklist

### Before Each Commit

- [ ] Code formatted with Ruff
- [ ] No linting errors
- [ ] No type errors (mypy)
- [ ] Tests pass
- [ ] No security issues (bandit)
- [ ] Commit message follows Conventional Commits

### Before Each Push

- [ ] All tests pass
- [ ] Coverage >= 80%
- [ ] No TODO/FIXME in committed code
- [ ] Documentation updated

### Quality Metrics Goals

- **Test Coverage**: >= 80%
- **Type Coverage**: 100%
- **Linting Errors**: 0
- **Security Issues**: 0
- **Cyclomatic Complexity**: < 10 per function

## Conclusion

Quality tools enable:

1. **Consistency**: Uniform code across the team
2. **Quality**: Early error detection
3. **Security**: Vulnerability detection
4. **Maintainability**: Easy-to-maintain code
5. **Confidence**: Deploy with confidence

**Golden rule**: Code quality must be automated and non-negotiable.
