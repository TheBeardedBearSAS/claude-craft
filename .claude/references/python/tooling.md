# Rule 06: Tooling

Python tooling for code quality, testing, and development workflow.

## Package Management

### UV (Recommended)

Fast Python package installer and resolver.

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
uv venv

# Install dependencies
uv pip install -r requirements.txt

# Add dependency
uv pip install fastapi

# Update dependencies
uv pip install --upgrade package-name
```

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
"tests/*" = ["S101"]  # assert allowed in tests
```

### Black (Code Formatter)

```bash
# Install
pip install black

# Format code
black src/ tests/

# Check without modifying
black --check src/

# Configuration
black --line-length 88 src/
```

### isort (Import Sorter)

```bash
# Install
pip install isort

# Sort imports
isort src/ tests/

# Check only
isort --check src/

# Configuration with Black
isort --profile black src/
```

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

## Checklist

- [ ] Package manager configured (uv or poetry)
- [ ] Ruff configured and integrated
- [ ] Black configured
- [ ] MyPy in strict mode
- [ ] Pytest with coverage
- [ ] Pre-commit hooks installed
- [ ] Makefile created
- [ ] Security tools configured
- [ ] CI/CD runs all checks
