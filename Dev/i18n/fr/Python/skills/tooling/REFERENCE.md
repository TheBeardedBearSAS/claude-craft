# Outils de Développement Python

## Package Management

### Poetry (Recommandé)

```toml
# pyproject.toml
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = "My Python project"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
sqlalchemy = "^2.0.0"
pydantic = "^2.5.0"
redis = "^5.0.0"
celery = "^5.3.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-cov = "^4.1.0"
pytest-mock = "^3.12.0"
ruff = "^0.1.0"
mypy = "^1.7.0"
black = "^23.11.0"
isort = "^5.12.0"
bandit = "^1.7.5"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

```bash
# Installation
curl -sSL https://install.python-poetry.org | python3 -

# Commandes de base
poetry init                 # Initialiser un nouveau projet
poetry install             # Installer les dépendances
poetry add fastapi         # Ajouter une dépendance
poetry add --group dev pytest  # Ajouter une dépendance dev
poetry remove requests     # Supprimer une dépendance
poetry update              # Mettre à jour les dépendances
poetry lock                # Générer poetry.lock
poetry shell               # Activer l'environnement virtuel
poetry run python script.py  # Exécuter un script
poetry export -f requirements.txt --output requirements.txt  # Export requirements
```

### uv (Alternative Moderne)

```bash
# Installation
curl -LsSf https://astral.sh/uv/install.sh | sh

# Commandes
uv init                    # Initialiser projet
uv add fastapi            # Ajouter dépendance
uv sync                   # Synchroniser dépendances
uv run python script.py   # Exécuter script
uv lock                   # Lock dépendances

# Plus rapide que Poetry, compatible pyproject.toml
```

## Python Version Management

### pyenv

```bash
# Installation (Linux/macOS)
curl https://pyenv.run | bash

# Configuration ~/.bashrc ou ~/.zshrc
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

# Commandes
pyenv install 3.11.6      # Installer Python 3.11.6
pyenv versions            # Lister versions installées
pyenv global 3.11.6       # Version globale
pyenv local 3.11.6        # Version pour projet (créé .python-version)
pyenv shell 3.11.6        # Version pour session shell

# Créer virtual env
pyenv virtualenv 3.11.6 myproject
pyenv activate myproject
pyenv deactivate
```

## Docker + Makefile

### Dockerfile

```dockerfile
# docker/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install poetry==1.7.1

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies (without dev dependencies for prod)
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# Copy application
COPY src/ ./src/

# Run
CMD ["uvicorn", "src.myproject.infrastructure.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# docker/Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    make \
    && rm -rf /var/lib/apt/lists/*

RUN pip install poetry==1.7.1

COPY pyproject.toml poetry.lock ./

# Install ALL dependencies (including dev)
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

COPY . .

CMD ["uvicorn", "src.myproject.infrastructure.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - .:/app
      - /app/.venv  # Exclure le venv local
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myproject
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis
    command: uvicorn src.myproject.infrastructure.api.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myproject
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myproject
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis
    command: celery -A src.myproject.infrastructure.messaging.celery_app worker -l info

volumes:
  postgres_data:
```

### Makefile

```makefile
# Makefile
.PHONY: help setup install dev test lint format clean

# Variables
DOCKER_COMPOSE = docker compose
DOCKER_EXEC = $(DOCKER_COMPOSE) exec app
PYTHON = $(DOCKER_EXEC) python
POETRY = $(DOCKER_EXEC) poetry
PYTEST = $(DOCKER_EXEC) pytest

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Configuration initiale du projet
	cp .env.example .env
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up -d
	$(POETRY) install
	$(DOCKER_COMPOSE) exec app alembic upgrade head

install: ## Installation des dépendances
	$(DOCKER_COMPOSE) build
	$(POETRY) install

dev: ## Lance l'environnement de développement
	$(DOCKER_COMPOSE) up

dev-bg: ## Lance l'environnement en background
	$(DOCKER_COMPOSE) up -d

down: ## Arrête les containers
	$(DOCKER_COMPOSE) down

shell: ## Ouvre un shell dans le container
	$(DOCKER_EXEC) bash

logs: ## Affiche les logs
	$(DOCKER_COMPOSE) logs -f app

ps: ## État des containers
	$(DOCKER_COMPOSE) ps

# Tests
test: ## Tous les tests
	$(PYTEST) tests/ -v

test-unit: ## Tests unitaires uniquement
	$(PYTEST) tests/unit/ -v

test-integration: ## Tests d'intégration
	$(PYTEST) tests/integration/ -v

test-e2e: ## Tests end-to-end
	$(PYTEST) tests/e2e/ -v

test-cov: ## Tests avec couverture
	$(PYTEST) tests/ -v --cov=src --cov-report=html --cov-report=term

test-watch: ## Tests en mode watch
	$(PYTEST) tests/ -v --watch

# Qualité de code
lint: ## Linting avec ruff
	$(DOCKER_EXEC) ruff check src/ tests/

lint-fix: ## Linting avec auto-fix
	$(DOCKER_EXEC) ruff check --fix src/ tests/

format: ## Formatage avec black + isort
	$(DOCKER_EXEC) black src/ tests/
	$(DOCKER_EXEC) isort src/ tests/

format-check: ## Vérifie le formatage
	$(DOCKER_EXEC) black --check src/ tests/
	$(DOCKER_EXEC) isort --check-only src/ tests/

type-check: ## Vérification des types avec mypy
	$(DOCKER_EXEC) mypy src/

security-check: ## Analyse de sécurité avec bandit
	$(DOCKER_EXEC) bandit -r src/ -ll

deps-audit: ## Audit des dépendances
	$(POETRY) audit

quality: lint type-check security-check ## Tous les checks de qualité

# Base de données
db-shell: ## Shell PostgreSQL
	$(DOCKER_COMPOSE) exec db psql -U user -d myproject

db-migrate: ## Crée une nouvelle migration
	$(DOCKER_EXEC) alembic revision --autogenerate -m "$(msg)"

db-upgrade: ## Applique les migrations
	$(DOCKER_EXEC) alembic upgrade head

db-downgrade: ## Rollback dernière migration
	$(DOCKER_EXEC) alembic downgrade -1

db-reset: ## Reset complet de la DB
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d db
	sleep 2
	$(DOCKER_EXEC) alembic upgrade head

db-seed: ## Seed data
	$(PYTHON) scripts/seed_data.py

# Nettoyage
clean: ## Nettoyage des fichiers temporaires
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	rm -rf .pytest_cache .mypy_cache .ruff_cache htmlcov .coverage

clean-all: clean down ## Nettoyage complet
	$(DOCKER_COMPOSE) down -v
	rm -rf .venv
```

## Pre-commit Hooks

### Configuration

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
      - id: check-json
      - id: check-toml
      - id: check-merge-conflict
      - id: debug-statements

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
        additional_dependencies: [pydantic, sqlalchemy]

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        args: [-ll, -r, src/]
```

```bash
# Installation
pip install pre-commit

# Setup hooks
pre-commit install

# Run manuellement sur tous les fichiers
pre-commit run --all-files

# Update hooks
pre-commit autoupdate
```

## Linting & Formatting

### Ruff (Recommandé - Rapide)

```toml
# pyproject.toml ou ruff.toml
[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "DTZ", # flake8-datetimez
    "T10", # flake8-debugger
    "EM",  # flake8-errmsg
    "ISC", # flake8-implicit-str-concat
    "ICN", # flake8-import-conventions
    "PIE", # flake8-pie
    "PT",  # flake8-pytest-style
    "Q",   # flake8-quotes
    "RSE", # flake8-raise
    "RET", # flake8-return
    "SIM", # flake8-simplify
    "TID", # flake8-tidy-imports
    "ARG", # flake8-unused-arguments
    "PTH", # flake8-use-pathlib
    "ERA", # eradicate
    "PL",  # pylint
    "RUF", # ruff-specific
]

ignore = [
    "E501",  # line too long (géré par black)
    "PLR0913",  # too many arguments
]

[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = [
    "PLR2004",  # magic values in tests OK
    "S101",     # assert in tests OK
]
```

```bash
# Commandes
ruff check .              # Check
ruff check --fix .        # Fix auto
ruff format .             # Format (comme black)
```

### Black

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
```

```bash
# Commandes
black src/ tests/         # Format
black --check src/        # Check seulement
black --diff src/         # Voir les changements
```

### isort

```toml
# pyproject.toml
[tool.isort]
profile = "black"
line_length = 88
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true
```

```bash
# Commandes
isort src/ tests/         # Sort imports
isort --check src/        # Check seulement
isort --diff src/         # Voir les changements
```

## Type Checking

### mypy

```toml
# mypy.ini ou pyproject.toml
[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false

[[tool.mypy.overrides]]
module = "celery.*"
ignore_missing_imports = true
```

```bash
# Commandes
mypy src/                 # Check types
mypy --strict src/        # Mode strict
mypy --install-types      # Installer stubs manquants
```

## Security

### Bandit

```yaml
# .bandit
[bandit]
exclude_dirs = ["/tests", "/scripts"]
skips = ["B101", "B601"]
```

```bash
# Commandes
bandit -r src/            # Scan
bandit -r src/ -ll        # Seulement high/medium
bandit -r src/ -f json -o report.json  # Format JSON
```

### Safety (Audit Dépendances)

```bash
# Avec Poetry
poetry export -f requirements.txt | safety check --stdin

# Avec pip
pip list --format=freeze | safety check --stdin
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Poetry
        run: |
          curl -sSL https://install.python-poetry.org | python3 -
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Install dependencies
        run: poetry install

      - name: Lint with ruff
        run: poetry run ruff check src/ tests/

      - name: Type check with mypy
        run: poetry run mypy src/

      - name: Security check with bandit
        run: poetry run bandit -r src/ -ll

      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379/0
        run: |
          poetry run pytest tests/ -v --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## Configuration Complète

### pyproject.toml complet

```toml
# pyproject.toml
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = ""
authors = ["Author <author@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
sqlalchemy = "^2.0.0"
alembic = "^1.12.0"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
asyncpg = "^0.29.0"
redis = "^5.0.0"
celery = "^5.3.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.6"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-cov = "^4.1.0"
pytest-mock = "^3.12.0"
pytest-asyncio = "^0.21.0"
ruff = "^0.1.0"
mypy = "^1.7.0"
black = "^23.11.0"
isort = "^5.12.0"
bandit = "^1.7.5"
pre-commit = "^3.5.0"

[tool.black]
line-length = 88
target-version = ['py311']

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.11"
strict = true

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
addopts = "-v --strict-markers"

[tool.coverage.run]
source = ["src"]
omit = ["*/tests/*", "*/migrations/*"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
]

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

## Checklist Tooling

- [ ] Poetry ou uv configuré
- [ ] pyenv pour gestion versions Python
- [ ] Docker + docker-compose setup
- [ ] Makefile avec commandes Docker
- [ ] Pre-commit hooks configurés
- [ ] Ruff pour linting
- [ ] Black pour formatting
- [ ] isort pour imports
- [ ] mypy pour type checking
- [ ] Bandit pour sécurité
- [ ] CI/CD configuré (GitHub Actions)
- [ ] .gitignore Python complet
