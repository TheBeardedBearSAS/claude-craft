# Règles de Développement Python pour Claude Code

Ce répertoire contient les règles de développement Python complètes pour Claude Code.

## Structure

```
Python/
├── CLAUDE.md.template          # Template principal pour nouveaux projets
├── README.md                   # Ce fichier
│
├── rules/                      # Règles de développement
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
├── templates/                  # Templates de code
│   ├── service.md
│   ├── repository.md
│   ├── api-endpoint.md
│   ├── test-unit.md
│   └── test-integration.md
│
├── checklists/                 # Checklists de process
│   ├── pre-commit.md
│   ├── new-feature.md
│   ├── refactoring.md
│   └── security.md
│
└── examples/                   # Exemples de code complets
    └── (à venir)
```

## Utilisation

### Pour un Nouveau Projet Python

1. **Copier CLAUDE.md.template** dans le projet:
   ```bash
   cp Python/CLAUDE.md.template /path/to/project/CLAUDE.md
   ```

2. **Remplacer les placeholders**:
   - `{{PROJECT_NAME}}` - Nom du projet
   - `{{PROJECT_VERSION}}` - Version (ex: 0.1.0)
   - `{{TECH_STACK}}` - Stack technique
   - `{{WEB_FRAMEWORK}}` - FastAPI/Django/Flask
   - `{{PYTHON_VERSION}}` - Version Python (ex: 3.11)
   - `{{ORM}}` - SQLAlchemy/Django ORM/etc.
   - `{{TASK_QUEUE}}` - Celery/RQ/arq
   - `{{PACKAGE_MANAGER}}` - poetry/uv
   - etc.

3. **Personnaliser** selon les besoins du projet:
   - Ajouter règles spécifiques dans section `SPECIFIC_RULES`
   - Ajuster commandes Makefile si nécessaire
   - Compléter informations de contact

4. **Copier 00-project-context.md.template** (optionnel):
   ```bash
   cp Python/rules/00-project-context.md.template /path/to/project/docs/context.md
   ```
   Et remplir toutes les informations spécifiques.

### Pour un Projet Existant

1. **Ajouter CLAUDE.md** avec les règles
2. **Adapter progressivement** le code existant
3. **Utiliser les checklists** pour les nouvelles features

## Contenu des Règles

### Rules (Règles Fondamentales)

#### 01-workflow-analysis.md
**Analyse Obligatoire Avant Toute Modification**

Méthodologie en 7 étapes:
1. Comprendre le besoin
2. Explorer le code existant
3. Identifier les impacts
4. Concevoir la solution
5. Planifier l'implémentation
6. Identifier les risques
7. Définir les tests

**Exemples complets** pour:
- Nouvelle feature (système de notification email)
- Fix de bug
- Templates de documentation

#### 02-architecture.md
**Clean Architecture & Hexagonale**

- Structure de projet complète
- Domain/Application/Infrastructure layers
- Entités, Value Objects, Services
- Repository pattern
- Dependency Injection
- Event-Driven Architecture
- CQRS pattern

**200+ exemples de code** annotés.

#### 03-coding-standards.md
**Standards de Code Python**

- PEP 8 complet
- Organisation des imports
- Type hints (PEP 484, 585, 604)
- Docstrings Google/NumPy style
- Naming conventions
- Comprehensions
- Context managers
- Exception handling

#### 04-solid-principles.md
**Principes SOLID avec Exemples Python**

Chaque principe avec:
- Explication
- Exemple de violation
- Exemple correct
- Cas d'usage concrets

Plus: Exemple complet d'un système de notification.

#### 05-kiss-dry-yagni.md
**Principes de Simplicité**

- KISS: Préférer la simplicité
- DRY: Éviter la duplication
- YAGNI: Implémenter seulement le nécessaire

Avec nombreux exemples de violations et corrections.

#### 06-tooling.md
**Outils de Développement**

- Poetry / uv (package management)
- pyenv (version management)
- Docker + docker-compose
- Makefile complet
- Pre-commit hooks
- Ruff, Black, isort (linting/formatting)
- mypy (type checking)
- Bandit (security)
- CI/CD (GitHub Actions)

Configuration complète fournie.

#### 07-testing.md
**Stratégie de Tests**

- pytest configuration
- Tests unitaires (isolation complète)
- Tests d'intégration (DB réelle)
- Tests E2E (flux complets)
- Fixtures avancées
- Mocking avec pytest-mock
- Couverture avec pytest-cov

**Nombreux exemples** de tests.

#### 09-git-workflow.md
**Workflow Git & Conventional Commits**

- Convention de nommage des branches
- Conventional Commits (types, scope, format)
- Commits atomiques
- Pre-commit hooks
- Template PR
- Git commands utiles

### Templates (Templates de Code)

#### service.md
Template complet pour créer un Domain Service:
- Quand l'utiliser
- Structure complète
- Exemple concret (PricingService)
- Tests unitaires
- Checklist

#### repository.md
Template complet pour Repository Pattern:
- Interface (Protocol) dans domain
- Implémentation dans infrastructure
- ORM Model
- Exemple concret (UserRepository)
- Tests unitaires et intégration
- Checklist

### Checklists (Processus)

#### pre-commit.md
**Checklist Avant Chaque Commit**

12 catégories:
1. Code Quality (lint, format, types, security)
2. Tests (unitaires, intégration, couverture)
3. Code Standards (PEP 8, type hints, docstrings)
4. Architecture (Clean, SOLID, KISS/DRY/YAGNI)
5. Sécurité (secrets, validation, passwords)
6. Base de données (migrations)
7. Performance (N+1, pagination, cache)
8. Logging & Monitoring
9. Documentation
10. Git (message, atomicité)
11. Dependencies
12. Cleanup (code mort, debug)

#### new-feature.md
**Checklist Nouvelle Feature**

7 phases complètes:
1. Analyse (obligatoire)
2. Implémentation (Domain/Application/Infrastructure)
3. Tests (unitaires/intégration/E2E)
4. Qualité (lint, types, review)
5. Documentation
6. Git & PR
7. Deployment

## Règles Clés

### 1. Analyse OBLIGATOIRE

**AUCUNE modification de code sans analyse préalable.**

Voir `rules/01-workflow-analysis.md`.

### 2. Clean Architecture

```
Domain (logique métier pure)
  ↑
Application (use cases)
  ↑
Infrastructure (adapters: API, DB, etc.)
```

Les dépendances pointent **toujours vers l'intérieur**.

### 3. SOLID

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 4. Tests

- Unitaires: > 95% couverture domain
- Intégration: > 75% couverture infrastructure
- E2E: Flux critiques

### 5. Type Hints

**Obligatoires** sur toutes les fonctions publiques.

```python
def my_function(param: str) -> int:
    """Docstring."""
    pass
```

### 6. Docstrings

**Google style** sur toutes fonctions/classes publiques.

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

## Commandes Rapides

### Setup Projet

```bash
# Copier template
cp Python/CLAUDE.md.template myproject/CLAUDE.md

# Éditer placeholders
vim myproject/CLAUDE.md

# Setup projet
cd myproject
make setup
```

### Développement

```bash
make dev          # Lance environnement
make test         # Tous les tests
make quality      # Lint + type-check + security
make test-cov     # Tests avec couverture
```

### Pre-commit

```bash
# Quick check avant commit
make quality && make test-cov

# Ou avec pre-commit hooks
pre-commit run --all-files
```

## Ressources Additionnelles

### Documentation Externe

- [PEP 8](https://pep8.org/)
- [Type Hints (PEP 484)](https://www.python.org/dev/peps/pep-0484/)
- [Protocols (PEP 544)](https://www.python.org/dev/peps/pep-0544/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### Outils

- [Poetry](https://python-poetry.org/)
- [uv](https://github.com/astral-sh/uv)
- [Ruff](https://github.com/astral-sh/ruff)
- [mypy](https://mypy.readthedocs.io/)
- [pytest](https://docs.pytest.org/)

## Contribution

Pour améliorer ces règles:

1. Créer une issue pour discussion
2. Proposer des exemples concrets
3. Soumettre PR avec modifications

## Licence

Ces règles sont destinées à un usage interne pour TheBeardedCTO Tools.

---

**Version**: 1.0.0
**Dernière mise à jour**: 2025-12-03
