# Regra 06: Ferramentas

Ferramentas Python para qualidade de código, testes e fluxo de desenvolvimento.

## Gerenciamento de Pacotes

### UV (Recomendado)

Instalador e resolvedor de pacotes Python rápido.

```bash
# Instalar uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Criar ambiente virtual
uv venv

# Instalar dependências
uv pip install -r requirements.txt

# Adicionar dependência
uv pip install fastapi

# Atualizar dependências
uv pip install --upgrade package-name
```

### Poetry (Alternativa)

```bash
# Instalar Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Inicializar projeto
poetry init

# Instalar dependências
poetry install

# Adicionar dependência
poetry add fastapi

# Adicionar dependência de dev
poetry add --group dev pytest
```

## Linting e Formatação

### Ruff (Recomendado)

Linter Python extremamente rápido (substitui Flake8, isort, pydocstyle).

```bash
# Instalar
pip install ruff

# Verificar código
ruff check src/ tests/

# Auto-correção
ruff check --fix src/ tests/

# Verificar regras específicas
ruff check --select E,F,I src/
```

Configuração em `pyproject.toml`:

```toml
[tool.ruff]
line-length = 88
target-version = "py312"

select = [
    "E",  # erros pycodestyle
    "F",  # pyflakes
    "I",  # isort
    "N",  # pep8-naming
    "W",  # avisos pycodestyle
    "UP", # pyupgrade
    "B",  # flake8-bugbear
    "S",  # flake8-bandit
    "C4", # flake8-comprehensions
]

ignore = ["E501"]  # linha muito longa

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/*" = ["S101"]  # assert permitido em testes
```

### Black (Formatador de Código)

```bash
# Instalar
pip install black

# Formatar código
black src/ tests/

# Verificar sem modificar
black --check src/

# Configuração
black --line-length 88 src/
```

### isort (Ordenador de Imports)

```bash
# Instalar
pip install isort

# Ordenar imports
isort src/ tests/

# Verificar apenas
isort --check src/

# Configuração com Black
isort --profile black src/
```

## Verificação de Tipos

### MyPy

```bash
# Instalar
pip install mypy

# Verificar tipos
mypy src/

# Modo strict
mypy src/ --strict

# Gerar relatório HTML
mypy src/ --html-report coverage/
```

Configuração em `pyproject.toml`:

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

## Testes

### Pytest

```bash
# Instalar
pip install pytest pytest-cov pytest-asyncio

# Executar todos os testes
pytest

# Executar com cobertura
pytest --cov=src --cov-report=html

# Executar teste específico
pytest tests/unit/test_user.py::test_create_user

# Modo verbose
pytest -vv

# Parar na primeira falha
pytest -x
```

Configuração:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-ra -q --strict-markers"
markers = [
    "unit: Testes unitários",
    "integration: Testes de integração",
    "e2e: Testes end-to-end",
    "slow: Testes lentos",
]
```

## Análise de Segurança

### Bandit

```bash
# Instalar
pip install bandit

# Escanear vulnerabilidades
bandit -r src/

# Saída JSON
bandit -r src/ -f json -o bandit-report.json

# Mostrar apenas alta severidade
bandit -r src/ -ll
```

### Safety

```bash
# Instalar
pip install safety

# Verificar dependências
safety check

# Contra arquivo requirements
safety check -r requirements.txt
```

## Hooks de Pre-commit

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

# Executar manualmente
pre-commit run --all-files
```

## Makefile

```makefile
.PHONY: help install lint format type-check test test-cov clean

help:
	@echo "Comandos disponíveis:"
	@echo "  install       Instalar dependências"
	@echo "  lint          Executar linter"
	@echo "  format        Formatar código"
	@echo "  type-check    Executar verificador de tipos"
	@echo "  test          Executar testes"
	@echo "  test-cov      Executar testes com cobertura"
	@echo "  quality       Executar todas as verificações de qualidade"
	@echo "  clean         Limpar arquivos gerados"

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

- [ ] Gerenciador de pacotes configurado (uv ou poetry)
- [ ] Ruff configurado e integrado
- [ ] Black configurado
- [ ] MyPy em modo strict
- [ ] Pytest com cobertura
- [ ] Hooks de pre-commit instalados
- [ ] Makefile criado
- [ ] Ferramentas de segurança configuradas
- [ ] CI/CD executa todas as verificações
