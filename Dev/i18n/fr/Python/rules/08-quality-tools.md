# Outils de qualite du code - Python

## Ruff - Linter et formateur Python rapide

### Installation

```bash
pip install ruff
# Ou avec pipx pour une installation globale
pipx install ruff
```

### Configuration pyproject.toml

```toml
[tool.ruff]
# Version Python cible
target-version = "py312"

# Longueur de ligne
line-length = 88

# Repertoires exclus
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
# Regles activees
select = [
    "E",      # Erreurs pycodestyle
    "W",      # Avertissements pycodestyle
    "F",      # Pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
    "ARG",    # flake8-unused-arguments
    "SIM",    # flake8-simplify
    "PTH",    # flake8-use-pathlib
    "ERA",    # eradicate (code commente)
    "RUF",    # Regles specifiques a Ruff
    "S",      # flake8-bandit (securite)
    "T20",    # flake8-print
    "PL",     # Pylint
    "TRY",    # tryceratops
    "PERF",   # Perflint
    "ASYNC",  # flake8-async
]

# Regles ignorees
ignore = [
    "E501",   # Ligne trop longue (geree par le formateur)
    "S101",   # Utilisation de assert (necessaire pour les tests)
    "PLR0913", # Trop d'arguments
]

# Exceptions par fichier
[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = [
    "S101",   # Autoriser assert dans les tests
    "ARG",    # Autoriser les arguments non utilises dans les fixtures
    "PLR2004", # Valeurs magiques dans les tests
]
"**/migrations/**/*.py" = [
    "ALL",    # Ignorer les migrations
]

[tool.ruff.lint.isort]
# Configuration du tri des imports
known-first-party = ["src", "app"]
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
force-single-line = false
combine-as-imports = true

[tool.ruff.format]
# Options de formatage
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
```

### Commandes CLI

```bash
# Verifier les problemes
ruff check .

# Corriger les problemes auto-corrigeables
ruff check --fix .

# Formater le code
ruff format .

# Verifier le formatage sans modifier
ruff format --check .

# Mode surveillance pour le developpement
ruff check --watch .
```

## mypy - Verification statique des types

### Installation

```bash
pip install mypy
# Avec les stubs courants
pip install types-requests types-python-dateutil types-redis
```

### Configuration pyproject.toml

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

# Surcharges par module
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
disallow_incomplete_defs = false

[[tool.mypy.overrides]]
module = "migrations.*"
ignore_errors = true
```

### Commandes CLI

```bash
# Executer la verification des types
mypy src/

# Generer un rapport
mypy src/ --html-report mypy-report

# Verifier un fichier specifique
mypy src/main.py

# Mode strict
mypy --strict src/
```

## pytest - Framework de test

### Installation

```bash
pip install pytest pytest-cov pytest-asyncio pytest-xdist httpx
```

### Configuration pyproject.toml

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
    "slow: marque les tests comme lents",
    "integration: marque les tests comme tests d'integration",
    "unit: marque les tests comme tests unitaires",
]
filterwarnings = [
    "error",
    "ignore::DeprecationWarning",
]
```

### Commandes CLI

```bash
# Executer tous les tests
pytest

# Executer avec couverture
pytest --cov=src --cov-report=html

# Executer un fichier de test specifique
pytest tests/test_user.py

# Executer les tests correspondant a un motif
pytest -k "test_user"

# Executer en parallele
pytest -n auto

# Executer uniquement les tests echoues
pytest --lf

# Sortie detaillee
pytest -vv
```

## pre-commit - Hooks Git

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

### Commandes CLI

```bash
# Installer les hooks
pre-commit install

# Executer sur tous les fichiers
pre-commit run --all-files

# Mettre a jour les hooks
pre-commit autoupdate

# Ignorer temporairement les hooks
git commit --no-verify -m "message"
```

## Bandit - Linter de securite

### Installation

```bash
pip install bandit[toml]
```

### Configuration pyproject.toml

```toml
[tool.bandit]
exclude_dirs = ["tests", "venv", ".venv"]
skips = ["B101"]  # Ignorer les avertissements assert

[tool.bandit.assert_used]
skips = ["*_test.py", "test_*.py"]
```

### Commandes CLI

```bash
# Executer l'analyse de securite
bandit -r src/

# Sortie vers un fichier
bandit -r src/ -f json -o bandit-report.json

# Filtre par severite
bandit -r src/ -ll  # Uniquement moyen et eleve
```

## Coverage.py - Couverture de code

### Configuration pyproject.toml

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

## Configuration VS Code

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
	@echo "Toutes les verifications de qualite sont passees !"
```

## Liste de verification de la qualite

### Avant chaque commit

- [ ] Code formate avec Ruff
- [ ] Aucune erreur de linting
- [ ] Aucune erreur de type (mypy)
- [ ] Les tests passent
- [ ] Aucun probleme de securite (bandit)
- [ ] Le message de commit suit les Conventional Commits

### Avant chaque push

- [ ] Tous les tests passent
- [ ] Couverture >= 80%
- [ ] Pas de TODO/FIXME dans le code commite
- [ ] Documentation mise a jour

### Objectifs des metriques de qualite

- **Couverture de tests** : >= 80%
- **Couverture des types** : 100%
- **Erreurs de linting** : 0
- **Problemes de securite** : 0
- **Complexite cyclomatique** : < 10 par fonction

## Conclusion

Les outils de qualite permettent :

1. **Coherence** : Code uniforme dans toute l'equipe
2. **Qualite** : Detection precoce des erreurs
3. **Securite** : Detection des vulnerabilites
4. **Maintenabilite** : Code facile a maintenir
5. **Confiance** : Deploiement en toute confiance

**Regle d'or** : La qualite du code doit etre automatisee et non negociable.
