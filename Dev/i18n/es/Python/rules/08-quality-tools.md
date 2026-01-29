# Herramientas de calidad de codigo - Python

## Ruff - Linter y formateador rapido de Python

### Instalacion

```bash
pip install ruff
# O con pipx para instalacion global
pipx install ruff
```

### Configuracion pyproject.toml

```toml
[tool.ruff]
# Version de Python objetivo
target-version = "py312"

# Longitud de linea
line-length = 88

# Directorios excluidos
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
# Reglas habilitadas
select = [
    "E",      # Errores pycodestyle
    "W",      # Advertencias pycodestyle
    "F",      # Pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
    "ARG",    # flake8-unused-arguments
    "SIM",    # flake8-simplify
    "PTH",    # flake8-use-pathlib
    "ERA",    # eradicate (codigo comentado)
    "RUF",    # Reglas especificas de Ruff
    "S",      # flake8-bandit (seguridad)
    "T20",    # flake8-print
    "PL",     # Pylint
    "TRY",    # tryceratops
    "PERF",   # Perflint
    "ASYNC",  # flake8-async
]

# Reglas ignoradas
ignore = [
    "E501",   # Linea demasiado larga (manejado por el formateador)
    "S101",   # Uso de assert (necesario para pruebas)
    "PLR0913", # Demasiados argumentos
]

# Excepciones por archivo
[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = [
    "S101",   # Permitir assert en pruebas
    "ARG",    # Permitir argumentos no utilizados en fixtures
    "PLR2004", # Valores magicos en pruebas
]
"**/migrations/**/*.py" = [
    "ALL",    # Ignorar migraciones
]

[tool.ruff.lint.isort]
# Configuracion de ordenamiento de imports
known-first-party = ["src", "app"]
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
force-single-line = false
combine-as-imports = true

[tool.ruff.format]
# Opciones de formateo
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
```

### Comandos CLI

```bash
# Verificar problemas
ruff check .

# Corregir problemas auto-corregibles
ruff check --fix .

# Formatear codigo
ruff format .

# Verificar formateo sin modificar
ruff format --check .

# Modo vigilancia para desarrollo
ruff check --watch .
```

## mypy - Verificacion estatica de tipos

### Instalacion

```bash
pip install mypy
# Con stubs comunes
pip install types-requests types-python-dateutil types-redis
```

### Configuracion pyproject.toml

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

# Sobreescrituras por modulo
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
disallow_incomplete_defs = false

[[tool.mypy.overrides]]
module = "migrations.*"
ignore_errors = true
```

### Comandos CLI

```bash
# Ejecutar verificacion de tipos
mypy src/

# Generar informe
mypy src/ --html-report mypy-report

# Verificar archivo especifico
mypy src/main.py

# Modo estricto
mypy --strict src/
```

## pytest - Framework de pruebas

### Instalacion

```bash
pip install pytest pytest-cov pytest-asyncio pytest-xdist httpx
```

### Configuracion pyproject.toml

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
    "slow: marca las pruebas como lentas",
    "integration: marca las pruebas como pruebas de integracion",
    "unit: marca las pruebas como pruebas unitarias",
]
filterwarnings = [
    "error",
    "ignore::DeprecationWarning",
]
```

### Comandos CLI

```bash
# Ejecutar todas las pruebas
pytest

# Ejecutar con cobertura
pytest --cov=src --cov-report=html

# Ejecutar archivo de prueba especifico
pytest tests/test_user.py

# Ejecutar pruebas que coincidan con un patron
pytest -k "test_user"

# Ejecutar en paralelo
pytest -n auto

# Ejecutar solo pruebas fallidas
pytest --lf

# Salida detallada
pytest -vv
```

## pre-commit - Hooks de Git

### Instalacion

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

### Comandos CLI

```bash
# Instalar hooks
pre-commit install

# Ejecutar en todos los archivos
pre-commit run --all-files

# Actualizar hooks
pre-commit autoupdate

# Omitir hooks temporalmente
git commit --no-verify -m "message"
```

## Bandit - Linter de seguridad

### Instalacion

```bash
pip install bandit[toml]
```

### Configuracion pyproject.toml

```toml
[tool.bandit]
exclude_dirs = ["tests", "venv", ".venv"]
skips = ["B101"]  # Omitir advertencias de assert

[tool.bandit.assert_used]
skips = ["*_test.py", "test_*.py"]
```

### Comandos CLI

```bash
# Ejecutar analisis de seguridad
bandit -r src/

# Salida a archivo
bandit -r src/ -f json -o bandit-report.json

# Filtro por severidad
bandit -r src/ -ll  # Solo medio y alto
```

## Coverage.py - Cobertura de codigo

### Configuracion pyproject.toml

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

## Configuracion de VS Code

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
	@echo "Todas las verificaciones de calidad pasaron!"
```

## Lista de verificacion de calidad

### Antes de cada commit

- [ ] Codigo formateado con Ruff
- [ ] Sin errores de linting
- [ ] Sin errores de tipos (mypy)
- [ ] Pruebas pasan
- [ ] Sin problemas de seguridad (bandit)
- [ ] Mensaje de commit sigue Conventional Commits

### Antes de cada push

- [ ] Todas las pruebas pasan
- [ ] Cobertura >= 80%
- [ ] Sin TODO/FIXME en codigo comprometido
- [ ] Documentacion actualizada

### Objetivos de metricas de calidad

- **Cobertura de pruebas**: >= 80%
- **Cobertura de tipos**: 100%
- **Errores de linting**: 0
- **Problemas de seguridad**: 0
- **Complejidad ciclomatica**: < 10 por funcion

## Conclusion

Las herramientas de calidad permiten:

1. **Consistencia**: Codigo uniforme en todo el equipo
2. **Calidad**: Deteccion temprana de errores
3. **Seguridad**: Deteccion de vulnerabilidades
4. **Mantenibilidad**: Codigo facil de mantener
5. **Confianza**: Despliegue con confianza

**Regla de oro**: La calidad del codigo debe ser automatizada y no negociable.
