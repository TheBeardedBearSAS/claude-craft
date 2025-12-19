# Regla 06: Herramientas

Herramientas de Python para calidad de código, pruebas y flujo de trabajo de desarrollo.

## Gestión de Paquetes

### UV (Recomendado)

Instalador y resolutor de paquetes Python rápido.

```bash
# Instalar uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Crear entorno virtual
uv venv

# Instalar dependencias
uv pip install -r requirements.txt

# Agregar dependencia
uv pip install fastapi

# Actualizar dependencias
uv pip install --upgrade package-name
```

### Poetry (Alternativa)

```bash
# Instalar Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Inicializar proyecto
poetry init

# Instalar dependencias
poetry install

# Agregar dependencia
poetry add fastapi

# Agregar dependencia de desarrollo
poetry add --group dev pytest
```

## Linting y Formato

### Ruff (Recomendado)

Linter de Python extremadamente rápido (reemplaza Flake8, isort, pydocstyle).

```bash
# Instalar
pip install ruff

# Verificar código
ruff check src/ tests/

# Auto-corrección
ruff check --fix src/ tests/

# Verificar reglas específicas
ruff check --select E,F,I src/
```

Configuración en `pyproject.toml`:

```toml
[tool.ruff]
line-length = 88
target-version = "py312"

select = [
    "E",  # errores pycodestyle
    "F",  # pyflakes
    "I",  # isort
    "N",  # pep8-naming
    "W",  # advertencias pycodestyle
    "UP", # pyupgrade
    "B",  # flake8-bugbear
    "S",  # flake8-bandit
    "C4", # flake8-comprehensions
]

ignore = ["E501"]  # línea demasiado larga

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/*" = ["S101"]  # assert permitido en tests
```

### Black (Formateador de Código)

```bash
# Instalar
pip install black

# Formatear código
black src/ tests/

# Verificar sin modificar
black --check src/

# Configuración
black --line-length 88 src/
```

### isort (Ordenador de Importaciones)

```bash
# Instalar
pip install isort

# Ordenar importaciones
isort src/ tests/

# Solo verificar
isort --check src/

# Configuración con Black
isort --profile black src/
```

## Verificación de Tipos

### MyPy

```bash
# Instalar
pip install mypy

# Verificar tipos
mypy src/

# Modo estricto
mypy src/ --strict

# Generar reporte HTML
mypy src/ --html-report coverage/
```

Configuración en `pyproject.toml`:

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

## Pruebas

### Pytest

```bash
# Instalar
pip install pytest pytest-cov pytest-asyncio

# Ejecutar todos los tests
pytest

# Ejecutar con cobertura
pytest --cov=src --cov-report=html

# Ejecutar test específico
pytest tests/unit/test_user.py::test_create_user

# Modo verbose
pytest -vv

# Detener en primera falla
pytest -x
```

Configuración:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-ra -q --strict-markers"
markers = [
    "unit: Tests unitarios",
    "integration: Tests de integración",
    "e2e: Tests end-to-end",
    "slow: Tests lentos",
]
```

## Análisis de Seguridad

### Bandit

```bash
# Instalar
pip install bandit

# Escanear vulnerabilidades
bandit -r src/

# Salida JSON
bandit -r src/ -f json -o bandit-report.json

# Solo mostrar alta severidad
bandit -r src/ -ll
```

### Safety

```bash
# Instalar
pip install safety

# Verificar dependencias
safety check

# Contra archivo requirements
safety check -r requirements.txt
```

## Hooks Pre-commit

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

Instalar:

```bash
pip install pre-commit
pre-commit install

# Ejecutar manualmente
pre-commit run --all-files
```

## Makefile

```makefile
.PHONY: help install lint format type-check test test-cov clean

help:
	@echo "Comandos disponibles:"
	@echo "  install       Instalar dependencias"
	@echo "  lint          Ejecutar linter"
	@echo "  format        Formatear código"
	@echo "  type-check    Ejecutar verificador de tipos"
	@echo "  test          Ejecutar tests"
	@echo "  test-cov      Ejecutar tests con cobertura"
	@echo "  quality       Ejecutar todas las verificaciones de calidad"
	@echo "  clean         Limpiar archivos generados"

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

## Lista de Verificación

- [ ] Gestor de paquetes configurado (uv o poetry)
- [ ] Ruff configurado e integrado
- [ ] Black configurado
- [ ] MyPy en modo estricto
- [ ] Pytest con cobertura
- [ ] Hooks pre-commit instalados
- [ ] Makefile creado
- [ ] Herramientas de seguridad configuradas
- [ ] CI/CD ejecuta todas las verificaciones
