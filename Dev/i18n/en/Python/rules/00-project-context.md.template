# Contexte du Projet

## Informations Générales

- **Nom du projet** : {{PROJECT_NAME}}
- **Description** : {{PROJECT_DESCRIPTION}}
- **Version** : {{PROJECT_VERSION}}
- **Date de création** : {{PROJECT_DATE}}

## Stack Technique

{{TECH_STACK}}

### Frameworks & Libraries Principaux

- **Framework Web** : {{WEB_FRAMEWORK}} (FastAPI/Django/Flask)
- **Version Python** : {{PYTHON_VERSION}}
- **ORM** : {{ORM}} (SQLAlchemy/Django ORM/Tortoise ORM)
- **Base de données** : {{DATABASE}} (PostgreSQL/MySQL/MongoDB)
- **Cache** : {{CACHE}} (Redis/Memcached)
- **Queue/Tasks** : {{TASK_QUEUE}} (Celery/RQ/arq)
- **Testing** : pytest, pytest-cov, pytest-mock
- **Linting/Formatting** : ruff, mypy, black, isort

## Architecture

{{ARCHITECTURE_TYPE}}

### Structure des dossiers

```
{{PROJECT_NAME}}/
├── src/
│   └── {{PROJECT_NAME}}/
│       ├── domain/              # Entités et logique métier
│       │   ├── entities/
│       │   ├── value_objects/
│       │   ├── repositories/    # Interfaces
│       │   └── services/        # Services métier
│       ├── application/         # Use cases et DTOs
│       │   ├── use_cases/
│       │   ├── dtos/
│       │   └── interfaces/
│       ├── infrastructure/      # Implémentations
│       │   ├── database/
│       │   │   ├── models/
│       │   │   └── repositories/
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   ├── dependencies/
│       │   │   └── schemas/
│       │   ├── cache/
│       │   ├── messaging/
│       │   └── external/
│       └── shared/              # Utilitaires partagés
│           ├── exceptions/
│           ├── validators/
│           └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── scripts/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── pyproject.toml
├── Makefile
├── .env.example
├── .gitignore
├── .pre-commit-config.yaml
└── README.md
```

## Environnements

### Développement
- **URL** : {{DEV_URL}}
- **Base de données** : {{DEV_DATABASE}}
- **Configuration** : `.env.dev`

### Staging
- **URL** : {{STAGING_URL}}
- **Base de données** : {{STAGING_DATABASE}}
- **Configuration** : `.env.staging`

### Production
- **URL** : {{PROD_URL}}
- **Base de données** : {{PROD_DATABASE}}
- **Configuration** : `.env.prod`

## Variables d'Environnement

```bash
# Application
APP_NAME={{PROJECT_NAME}}
APP_ENV={{ENVIRONMENT}}
APP_DEBUG={{DEBUG}}
SECRET_KEY={{SECRET_KEY}}

# Database
DATABASE_URL={{DATABASE_URL}}
DATABASE_POOL_SIZE={{DB_POOL_SIZE}}
DATABASE_MAX_OVERFLOW={{DB_MAX_OVERFLOW}}

# Redis
REDIS_URL={{REDIS_URL}}

# Celery
CELERY_BROKER_URL={{CELERY_BROKER_URL}}
CELERY_RESULT_BACKEND={{CELERY_RESULT_BACKEND}}

# API
API_PREFIX={{API_PREFIX}}
API_VERSION={{API_VERSION}}
CORS_ORIGINS={{CORS_ORIGINS}}

# Security
JWT_SECRET_KEY={{JWT_SECRET_KEY}}
JWT_ALGORITHM={{JWT_ALGORITHM}}
ACCESS_TOKEN_EXPIRE_MINUTES={{TOKEN_EXPIRE}}

# External Services
{{EXTERNAL_SERVICES}}
```

## Commandes Makefile Disponibles

```makefile
# Voir le Makefile du projet pour la liste complète des commandes
make help              # Affiche toutes les commandes disponibles
make setup             # Configuration initiale du projet
make install           # Installation des dépendances
make dev               # Lance l'environnement de développement
make test              # Execute les tests
make lint              # Vérifie le code avec ruff
make format            # Formate le code
make type-check        # Vérification des types avec mypy
make security-check    # Analyse de sécurité avec bandit
```

## Règles de Développement

Ce projet suit les règles de développement Python définies dans :

1. `01-workflow-analysis.md` - Analyse avant toute modification
2. `02-architecture.md` - Architecture hexagonale et clean architecture
3. `03-coding-standards.md` - Standards de code Python
4. `04-solid-principles.md` - Principes SOLID
5. `05-kiss-dry-yagni.md` - Principes de simplicité
6. `06-tooling.md` - Outils de développement
7. `07-testing.md` - Stratégie de tests
8. `08-quality-tools.md` - Outils de qualité
9. `09-git-workflow.md` - Workflow Git
10. `10-documentation.md` - Standards de documentation
11. `11-security.md` - Sécurité
12. `12-async.md` - Programmation asynchrone
13. `13-frameworks.md` - Patterns spécifiques aux frameworks

## Points d'Attention Spécifiques

{{SPECIFIC_CONCERNS}}

### Dépendances Critiques

{{CRITICAL_DEPENDENCIES}}

### Contraintes Techniques

{{TECHNICAL_CONSTRAINTS}}

### Standards Métier

{{BUSINESS_STANDARDS}}

## Contacts

- **Product Owner** : {{PO_NAME}} ({{PO_EMAIL}})
- **Tech Lead** : {{TECH_LEAD_NAME}} ({{TECH_LEAD_EMAIL}})
- **DevOps** : {{DEVOPS_NAME}} ({{DEVOPS_EMAIL}})

## Ressources

- **Documentation** : {{DOCS_URL}}
- **Repository** : {{REPO_URL}}
- **CI/CD** : {{CI_CD_URL}}
- **Monitoring** : {{MONITORING_URL}}
- **Logs** : {{LOGS_URL}}
