# Regras de Desenvolvimento Python para Claude Code

Este diretório contém as regras completas de desenvolvimento Python para Claude Code.

## Estrutura

```
Python/
├── CLAUDE.md.template          # Template principal para novos projetos
├── README.md                   # Este arquivo
│
├── rules/                      # Regras de desenvolvimento
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-async.md
│   └── 13-frameworks.md
│
├── templates/                  # Templates de código
│   ├── service.md
│   ├── repository.md
│   ├── api-endpoint.md
│   ├── test-unit.md
│   └── test-integration.md
│
├── checklists/                 # Checklists de processo
│   ├── pre-commit.md
│   ├── new-feature.md
│   ├── refactoring.md
│   └── security.md
│
└── examples/                   # Exemplos de código completos
    └── (em breve)
```

## Uso

### Para um Novo Projeto Python

1. **Copiar CLAUDE.md.template** para o projeto:
   ```bash
   cp Python/CLAUDE.md.template /path/to/project/CLAUDE.md
   ```

2. **Substituir os placeholders**:
   - `{{PROJECT_NAME}}` - Nome do projeto
   - `{{PROJECT_VERSION}}` - Versão (ex: 0.1.0)
   - `{{TECH_STACK}}` - Stack tecnológica
   - `{{WEB_FRAMEWORK}}` - FastAPI/Django/Flask
   - `{{PYTHON_VERSION}}` - Versão Python (ex: 3.11)
   - `{{ORM}}` - SQLAlchemy/Django ORM/etc.
   - `{{TASK_QUEUE}}` - Celery/RQ/arq
   - `{{PACKAGE_MANAGER}}` - poetry/uv
   - etc.

3. **Personalizar** conforme as necessidades do projeto:
   - Adicionar regras específicas na seção `SPECIFIC_RULES`
   - Ajustar comandos do Makefile se necessário
   - Completar informações de contato

4. **Copiar 00-project-context.md.template** (opcional):
   ```bash
   cp Python/rules/00-project-context.md.template /path/to/project/docs/context.md
   ```
   E preencher todas as informações específicas.

### Para um Projeto Existente

1. **Adicionar CLAUDE.md** com as regras
2. **Adaptar progressivamente** o código existente
3. **Usar as checklists** para novas features

## Conteúdo das Regras

### Rules (Regras Fundamentais)

#### 01-workflow-analysis.md
**Análise Obrigatória Antes de Qualquer Modificação**

Metodologia em 7 etapas:
1. Compreender a necessidade
2. Explorar o código existente
3. Identificar impactos
4. Projetar a solução
5. Planejar a implementação
6. Identificar riscos
7. Definir testes

**Exemplos completos** para:
- Nova feature (sistema de notificação por email)
- Correção de bug
- Templates de documentação

#### 02-architecture.md
**Clean Architecture & Hexagonal**

- Estrutura completa do projeto
- Camadas Domain/Application/Infrastructure
- Entidades, Value Objects, Services
- Padrão Repository
- Injeção de Dependência
- Arquitetura Orientada a Eventos
- Padrão CQRS

**200+ exemplos de código** anotados.

#### 03-coding-standards.md
**Padrões de Código Python**

- PEP 8 completo
- Organização de imports
- Type hints (PEP 484, 585, 604)
- Docstrings estilo Google/NumPy
- Convenções de nomenclatura
- Comprehensions
- Context managers
- Tratamento de exceções

#### 04-solid-principles.md
**Princípios SOLID com Exemplos Python**

Cada princípio com:
- Explicação
- Exemplo de violação
- Exemplo correto
- Casos de uso concretos

Mais: Exemplo completo de um sistema de notificação.

#### 05-kiss-dry-yagni.md
**Princípios de Simplicidade**

- KISS: Preferir simplicidade
- DRY: Evitar duplicação
- YAGNI: Implementar apenas o necessário

Com muitos exemplos de violações e correções.

#### 06-tooling.md
**Ferramentas de Desenvolvimento**

- Poetry / uv (gerenciamento de pacotes)
- pyenv (gerenciamento de versão)
- Docker + docker-compose
- Makefile completo
- Pre-commit hooks
- Ruff, Black, isort (linting/formatação)
- mypy (verificação de tipos)
- Bandit (segurança)
- CI/CD (GitHub Actions)

Configuração completa fornecida.

#### 07-testing.md
**Estratégia de Testes**

- Configuração pytest
- Testes unitários (isolamento completo)
- Testes de integração (DB real)
- Testes E2E (fluxos completos)
- Fixtures avançadas
- Mocking com pytest-mock
- Cobertura com pytest-cov

**Muitos exemplos** de testes.

#### 09-git-workflow.md
**Workflow Git & Conventional Commits**

- Convenção de nomenclatura de branches
- Conventional Commits (types, scope, formato)
- Commits atômicos
- Pre-commit hooks
- Template de PR
- Comandos Git úteis

### Templates (Templates de Código)

#### service.md
Template completo para Domain Service:
- Quando usar
- Estrutura completa
- Exemplo concreto (PricingService)
- Testes unitários
- Checklist

#### repository.md
Template completo para Repository Pattern:
- Interface (Protocol) no domain
- Implementação na infrastructure
- Modelo ORM
- Exemplo concreto (UserRepository)
- Testes unitários e de integração
- Checklist

### Checklists (Processos)

#### pre-commit.md
**Checklist Antes de Cada Commit**

12 categorias:
1. Qualidade de Código (lint, format, types, segurança)
2. Testes (unitários, integração, cobertura)
3. Padrões de Código (PEP 8, type hints, docstrings)
4. Arquitetura (Clean, SOLID, KISS/DRY/YAGNI)
5. Segurança (secrets, validação, senhas)
6. Banco de Dados (migrações)
7. Performance (N+1, paginação, cache)
8. Logging & Monitoramento
9. Documentação
10. Git (mensagem, atomicidade)
11. Dependências
12. Limpeza (código morto, debug)

#### new-feature.md
**Checklist Nova Feature**

7 fases completas:
1. Análise (obrigatória)
2. Implementação (Domain/Application/Infrastructure)
3. Testes (unitários/integração/E2E)
4. Qualidade (lint, types, review)
5. Documentação
6. Git & PR
7. Deploy

## Regras Chave

### 1. Análise OBRIGATÓRIA

**NENHUMA modificação de código sem análise prévia.**

Veja `rules/01-workflow-analysis.md`.

### 2. Clean Architecture

```
Domain (lógica de negócio pura)
  ↑
Application (use cases)
  ↑
Infrastructure (adapters: API, DB, etc.)
```

Dependências apontam **sempre para dentro**.

### 3. SOLID

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 4. Testes

- Unitários: > 95% cobertura do domain
- Integração: > 75% cobertura da infrastructure
- E2E: Fluxos críticos

### 5. Type Hints

**Obrigatórios** em todas as funções públicas.

```python
def my_function(param: str) -> int:
    """Docstring."""
    pass
```

### 6. Docstrings

**Estilo Google** em todas as funções/classes públicas.

```python
def function(arg1: str) -> bool:
    """
    Resumo.

    Args:
        arg1: Descrição

    Returns:
        Descrição

    Raises:
        ValueError: Se condição
    """
    pass
```

## Comandos Rápidos

### Setup do Projeto

```bash
# Copiar template
cp Python/CLAUDE.md.template myproject/CLAUDE.md

# Editar placeholders
vim myproject/CLAUDE.md

# Configurar projeto
cd myproject
make setup
```

### Desenvolvimento

```bash
make dev          # Inicia ambiente
make test         # Todos os testes
make quality      # Lint + type-check + segurança
make test-cov     # Testes com cobertura
```

### Pre-commit

```bash
# Verificação rápida antes do commit
make quality && make test-cov

# Ou com pre-commit hooks
pre-commit run --all-files
```

## Recursos Adicionais

### Documentação Externa

- [PEP 8](https://pep8.org/)
- [Type Hints (PEP 484)](https://www.python.org/dev/peps/pep-0484/)
- [Protocols (PEP 544)](https://www.python.org/dev/peps/pep-0544/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Princípios SOLID](https://en.wikipedia.org/wiki/SOLID)

### Ferramentas

- [Poetry](https://python-poetry.org/)
- [uv](https://github.com/astral-sh/uv)
- [Ruff](https://github.com/astral-sh/ruff)
- [mypy](https://mypy.readthedocs.io/)
- [pytest](https://docs.pytest.org/)

## Contribuição

Para melhorar estas regras:

1. Criar uma issue para discussão
2. Propor exemplos concretos
3. Enviar PR com modificações

## Licença

Estas regras são destinadas ao uso interno para TheBeardedCTO Tools.

---

**Versão**: 1.0.0
**Última atualização**: 2025-12-03
