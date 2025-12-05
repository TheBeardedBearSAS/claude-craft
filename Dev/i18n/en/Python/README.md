# Python Development Rules for Claude Code

This directory contains comprehensive Python development rules for Claude Code.

## Structure

```
Python/
├── CLAUDE.md.template          # Main template for new projects
├── README.md                   # This file
│
├── rules/                      # Development rules
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
├── templates/                  # Code templates
│   ├── service.md
│   ├── repository.md
│   ├── api-endpoint.md
│   ├── test-unit.md
│   └── test-integration.md
│
├── checklists/                 # Process checklists
│   ├── pre-commit.md
│   ├── new-feature.md
│   ├── refactoring.md
│   └── security.md
│
└── examples/                   # Complete code examples
    └── (coming soon)
```

## Usage

### For a New Python Project

1. **Copy CLAUDE.md.template** to the project:
   ```bash
   cp Python/CLAUDE.md.template /path/to/project/CLAUDE.md
   ```

2. **Replace placeholders**:
   - `{{PROJECT_NAME}}` - Project name
   - `{{PROJECT_VERSION}}` - Version (e.g., 0.1.0)
   - `{{TECH_STACK}}` - Technology stack
   - `{{WEB_FRAMEWORK}}` - FastAPI/Django/Flask
   - `{{PYTHON_VERSION}}` - Python version (e.g., 3.11)
   - `{{ORM}}` - SQLAlchemy/Django ORM/etc.
   - `{{TASK_QUEUE}}` - Celery/RQ/arq
   - `{{PACKAGE_MANAGER}}` - poetry/uv
   - etc.

3. **Customize** according to project needs:
   - Add specific rules in `SPECIFIC_RULES` section
   - Adjust Makefile commands if necessary
   - Complete contact information

4. **Copy 00-project-context.md.template** (optional):
   ```bash
   cp Python/rules/00-project-context.md.template /path/to/project/docs/context.md
   ```
   And fill in all specific information.

### For an Existing Project

1. **Add CLAUDE.md** with the rules
2. **Adapt gradually** the existing code
3. **Use checklists** for new features

## Rules Content

### Rules (Fundamental Rules)

#### 01-workflow-analysis.md
**Mandatory Analysis Before Any Modification**

7-step methodology:
1. Understand the need
2. Explore existing code
3. Identify impacts
4. Design the solution
5. Plan the implementation
6. Identify risks
7. Define tests

**Complete examples** for:
- New feature (email notification system)
- Bug fix
- Documentation templates

#### 02-architecture.md
**Clean Architecture & Hexagonal**

- Complete project structure
- Domain/Application/Infrastructure layers
- Entities, Value Objects, Services
- Repository pattern
- Dependency Injection
- Event-Driven Architecture
- CQRS pattern

**200+ annotated code examples**.

#### 03-coding-standards.md
**Python Code Standards**

- Complete PEP 8
- Import organization
- Type hints (PEP 484, 585, 604)
- Google/NumPy style docstrings
- Naming conventions
- Comprehensions
- Context managers
- Exception handling

#### 04-solid-principles.md
**SOLID Principles with Python Examples**

Each principle with:
- Explanation
- Violation example
- Correct example
- Concrete use cases

Plus: Complete example of a notification system.

#### 05-kiss-dry-yagni.md
**Simplicity Principles**

- KISS: Prefer simplicity
- DRY: Avoid duplication
- YAGNI: Implement only what's necessary

With numerous violation and correction examples.

#### 06-tooling.md
**Development Tools**

- Poetry / uv (package management)
- pyenv (version management)
- Docker + docker-compose
- Complete Makefile
- Pre-commit hooks
- Ruff, Black, isort (linting/formatting)
- mypy (type checking)
- Bandit (security)
- CI/CD (GitHub Actions)

Complete configuration provided.

#### 07-testing.md
**Testing Strategy**

- pytest configuration
- Unit tests (complete isolation)
- Integration tests (real DB)
- E2E tests (complete flows)
- Advanced fixtures
- Mocking with pytest-mock
- Coverage with pytest-cov

**Numerous test examples**.

#### 09-git-workflow.md
**Git Workflow & Conventional Commits**

- Branch naming convention
- Conventional Commits (types, scope, format)
- Atomic commits
- Pre-commit hooks
- PR template
- Useful Git commands

### Templates (Code Templates)

#### service.md
Complete template to create a Domain Service:
- When to use it
- Complete structure
- Concrete example (PricingService)
- Unit tests
- Checklist

#### repository.md
Complete template for Repository Pattern:
- Interface (Protocol) in domain
- Implementation in infrastructure
- ORM Model
- Concrete example (UserRepository)
- Unit and integration tests
- Checklist

### Checklists (Processes)

#### pre-commit.md
**Checklist Before Each Commit**

12 categories:
1. Code Quality (lint, format, types, security)
2. Tests (unit, integration, coverage)
3. Code Standards (PEP 8, type hints, docstrings)
4. Architecture (Clean, SOLID, KISS/DRY/YAGNI)
5. Security (secrets, validation, passwords)
6. Database (migrations)
7. Performance (N+1, pagination, cache)
8. Logging & Monitoring
9. Documentation
10. Git (message, atomicity)
11. Dependencies
12. Cleanup (dead code, debug)

#### new-feature.md
**New Feature Checklist**

7 complete phases:
1. Analysis (mandatory)
2. Implementation (Domain/Application/Infrastructure)
3. Tests (unit/integration/E2E)
4. Quality (lint, types, review)
5. Documentation
6. Git & PR
7. Deployment

## Key Rules

### 1. MANDATORY Analysis

**NO code modification without prior analysis.**

See `rules/01-workflow-analysis.md`.

### 2. Clean Architecture

```
Domain (pure business logic)
  ↑
Application (use cases)
  ↑
Infrastructure (adapters: API, DB, etc.)
```

Dependencies **always point inward**.

### 3. SOLID

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 4. Tests

- Unit: > 95% domain coverage
- Integration: > 75% infrastructure coverage
- E2E: Critical flows

### 5. Type Hints

**Mandatory** on all public functions.

```python
def my_function(param: str) -> int:
    """Docstring."""
    pass
```

### 6. Docstrings

**Google style** on all public functions/classes.

```python
def function(arg1: str) -> bool:
    """
    Summary.

    Args:
        arg1: Description

    Returns:
        Description

    Raises:
        ValueError: If condition
    """
    pass
```

## Quick Commands

### Project Setup

```bash
# Copy template
cp Python/CLAUDE.md.template myproject/CLAUDE.md

# Edit placeholders
vim myproject/CLAUDE.md

# Setup project
cd myproject
make setup
```

### Development

```bash
make dev          # Launch environment
make test         # All tests
make quality      # Lint + type-check + security
make test-cov     # Tests with coverage
```

### Pre-commit

```bash
# Quick check before commit
make quality && make test-cov

# Or with pre-commit hooks
pre-commit run --all-files
```

## Additional Resources

### External Documentation

- [PEP 8](https://pep8.org/)
- [Type Hints (PEP 484)](https://www.python.org/dev/peps/pep-0484/)
- [Protocols (PEP 544)](https://www.python.org/dev/peps/pep-0544/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### Tools

- [Poetry](https://python-poetry.org/)
- [uv](https://github.com/astral-sh/uv)
- [Ruff](https://github.com/astral-sh/ruff)
- [mypy](https://mypy.readthedocs.io/)
- [pytest](https://docs.pytest.org/)

## Contribution

To improve these rules:

1. Create an issue for discussion
2. Propose concrete examples
3. Submit PR with modifications

## License

These rules are intended for internal use by TheBeardedCTO Tools.

---

**Version**: 1.0.0
**Last updated**: 2025-12-03
