# Ferramentas de qualidade de código - Python

> **Versões de referência:** Ruff **0.15+** | pytest **9.x** (remove suporte ao Python 3.9) | alvo `py314`.

## Ruff - Linter e formatador rápido de Python

### Instalacao

```bash
pip install ruff
# Ou com pipx para instalacao global
pipx install ruff
```

### Configuracao pyproject.toml

```toml
[tool.ruff]
# Versao alvo do Python
target-version = "py314"

# Comprimento de linha
line-length = 88

# Diretorios excluidos
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
# Regras habilitadas
select = [
    "E",      # Erros pycodestyle
    "W",      # Avisos pycodestyle
    "F",      # Pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
    "ARG",    # flake8-unused-arguments
    "SIM",    # flake8-simplify
    "PTH",    # flake8-use-pathlib
    "ERA",    # eradicate (codigo comentado)
    "RUF",    # Regras especificas do Ruff
    "S",      # flake8-bandit (seguranca)
    "T20",    # flake8-print
    "PL",     # Pylint
    "TRY",    # tryceratops
    "PERF",   # Perflint
    "ASYNC",  # flake8-async
]

# Regras ignoradas
ignore = [
    "E501",   # Linha muito longa (tratado pelo formatador)
    "S101",   # Uso de assert (necessario para testes)
    "PLR0913", # Muitos argumentos
]

# Excecoes por arquivo
[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = [
    "S101",   # Permitir assert em testes
    "ARG",    # Permitir argumentos nao utilizados em fixtures
    "PLR2004", # Valores magicos em testes
]
"**/migrations/**/*.py" = [
    "ALL",    # Ignorar migracoes
]

[tool.ruff.lint.isort]
# Configuracao de ordenacao de imports
known-first-party = ["src", "app"]
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
force-single-line = false
combine-as-imports = true

[tool.ruff.format]
# Opcoes de formatacao
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
```

### Comandos CLI

```bash
# Verificar problemas
ruff check .

# Corrigir problemas auto-corrigiveis
ruff check --fix .

# Formatar codigo
ruff format .

# Verificar formatacao sem modificar
ruff format --check .

# Modo de vigilancia para desenvolvimento
ruff check --watch .
```

## mypy - Verificacao estatica de tipos

### Instalacao

```bash
pip install mypy
# Com stubs comuns
pip install types-requests types-python-dateutil types-redis
```

### Configuracao pyproject.toml

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

# Plugins
plugins = [
    "pydantic.mypy",
    "sqlalchemy.ext.mypy.plugin",
]

# Sobrescrituras por modulo
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
# Executar verificacao de tipos
mypy src/

# Gerar relatorio
mypy src/ --html-report mypy-report

# Verificar arquivo especifico
mypy src/main.py

# Modo estrito
mypy --strict src/
```

## pytest - Framework de testes

### Instalacao

```bash
pip install pytest pytest-cov pytest-asyncio pytest-xdist httpx
```

### Configuracao pyproject.toml

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
    "slow: marca os testes como lentos",
    "integration: marca os testes como testes de integracao",
    "unit: marca os testes como testes unitarios",
]
filterwarnings = [
    "error",
    "ignore::DeprecationWarning",
]
```

### Comandos CLI

```bash
# Executar todos os testes
pytest

# Executar com cobertura
pytest --cov=src --cov-report=html

# Executar arquivo de teste especifico
pytest tests/test_user.py

# Executar testes que correspondam a um padrao
pytest -k "test_user"

# Executar em paralelo
pytest -n auto

# Executar apenas testes falhados
pytest --lf

# Saida detalhada
pytest -vv
```

## pre-commit - Hooks do Git

### Instalacao

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

# Executar em todos os arquivos
pre-commit run --all-files

# Atualizar hooks
pre-commit autoupdate

# Ignorar hooks temporariamente
git commit --no-verify -m "message"
```

## Bandit - Linter de seguranca

### Instalacao

```bash
pip install bandit[toml]
```

### Configuracao pyproject.toml

```toml
[tool.bandit]
exclude_dirs = ["tests", "venv", ".venv"]
skips = ["B101"]  # Ignorar avisos de assert

[tool.bandit.assert_used]
skips = ["*_test.py", "test_*.py"]
```

### Comandos CLI

```bash
# Executar analise de seguranca
bandit -r src/

# Saida para arquivo
bandit -r src/ -f json -o bandit-report.json

# Filtro por severidade
bandit -r src/ -ll  # Apenas medio e alto
```

## Coverage.py - Cobertura de codigo

### Configuracao pyproject.toml

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

## Configuracao do VS Code

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
	@echo "Todas as verificacoes de qualidade passaram!"
```

## Lista de verificacao de qualidade

### Antes de cada commit

- [ ] Codigo formatado com Ruff
- [ ] Sem erros de linting
- [ ] Sem erros de tipos (mypy)
- [ ] Testes passam
- [ ] Sem problemas de seguranca (bandit)
- [ ] Mensagem de commit segue Conventional Commits

### Antes de cada push

- [ ] Todos os testes passam
- [ ] Cobertura >= 80%
- [ ] Sem TODO/FIXME no codigo commitado
- [ ] Documentacao atualizada

### Objetivos de metricas de qualidade

- **Cobertura de testes**: >= 80%
- **Cobertura de tipos**: 100%
- **Erros de linting**: 0
- **Problemas de seguranca**: 0
- **Complexidade ciclomatica**: < 10 por funcao

## Conclusao

As ferramentas de qualidade permitem:

1. **Consistencia**: Codigo uniforme em toda a equipe
2. **Qualidade**: Deteccao precoce de erros
3. **Seguranca**: Deteccao de vulnerabilidades
4. **Manutenibilidade**: Codigo facil de manter
5. **Confianca**: Deploy com confianca

**Regra de ouro**: A qualidade do codigo deve ser automatizada e nao negociavel.
