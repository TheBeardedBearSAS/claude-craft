# Project Context - {{PROJECT_NAME}}

## General Information

**Project name** : {{PROJECT_NAME}}

**Tech stack** : {{TECH_STACK}}

**PHP version** : {{PHP_VERSION}}

**Framework** : {{PHP_FRAMEWORK}}

## Project Description

{{PROJECT_DESCRIPTION}}

## Project Goals

{{PROJECT_GOALS}}

## Technical Architecture

### Backend
- **Language** : PHP {{PHP_VERSION}}
- **Framework** : {{PHP_FRAMEWORK}}
- **ORM** : {{ORM_NAME}}
- **Database** : {{DATABASE_TYPE}}
- **Cache** : {{CACHE_SYSTEM}}
- **Queue** : {{QUEUE_SYSTEM}}

### API
- **API Type** : {{API_TYPE}}
- **Base URL** : {{API_BASE_URL}}
- **Authentication** : {{AUTH_METHOD}}

### Infrastructure
- **Hosting** : {{HOSTING_PLATFORM}}
- **CI/CD** : {{CICD_PLATFORM}}
- **Containerization** : {{CONTAINERIZATION}}

## Project Structure

```
{{PROJECT_NAME}}/
├── src/
│   ├── Domain/                    # Core business logic
│   │   ├── Entity/               # Domain entities
│   │   ├── ValueObject/          # Value objects
│   │   ├── Event/                # Domain events
│   │   ├── Exception/            # Domain exceptions
│   │   └── Repository/           # Repository interfaces
│   │
│   ├── Application/               # Use cases
│   │   ├── UseCase/              # Commands & Queries
│   │   │   └── [Feature]/
│   │   │       ├── Command/      # Write operations
│   │   │       └── Query/        # Read operations
│   │   ├── DTO/                  # Data Transfer Objects
│   │   ├── Service/              # Application services
│   │   └── Exception/            # Application exceptions
│   │
│   ├── Infrastructure/            # External concerns
│   │   ├── Persistence/          # Database layer
│   │   │   ├── Repository/       # Repository implementations
│   │   │   ├── Migration/        # Database migrations
│   │   │   └── Mapping/          # ORM mappings
│   │   ├── Service/              # External services
│   │   ├── Messaging/            # Queues, events
│   │   └── Cache/                # Cache implementations
│   │
│   └── Presentation/              # HTTP layer
│       ├── Controller/           # API controllers
│       ├── Request/              # Request DTOs
│       ├── Response/             # Response transformers
│       └── Middleware/           # HTTP middleware
│
├── tests/
│   ├── Unit/                     # Unit tests
│   │   ├── Domain/
│   │   └── Application/
│   ├── Integration/              # Integration tests
│   │   └── Infrastructure/
│   └── Functional/               # Functional tests
│       └── Presentation/
│
├── config/                       # Configuration files
├── public/                       # Web root
├── var/                          # Cache, logs, temp files
├── vendor/                       # Dependencies
├── docker/                       # Docker configuration
└── docs/                         # Documentation
```

## Team and Responsibilities

### Developers
{{TEAM_MEMBERS}}

### Code Owners
{{CODE_OWNERS}}

## Development Workflow

### Branches
- `main` : Production
- `develop` : Development
- `feature/*` : New features
- `fix/*` : Bug fixes
- `refactor/*` : Refactoring
- `hotfix/*` : Urgent fixes

### Review Process
{{REVIEW_PROCESS}}

## Environments

### Local Development
- **URL** : {{DEV_URL}}
- **API** : {{DEV_API_URL}}
- **Database** : {{DEV_DATABASE}}

### Staging
- **URL** : {{STAGING_URL}}
- **API** : {{STAGING_API_URL}}
- **Database** : {{STAGING_DATABASE}}

### Production
- **URL** : {{PRODUCTION_URL}}
- **API** : {{PRODUCTION_API_URL}}
- **Database** : {{PRODUCTION_DATABASE}}

## Main Commands

### Installation
```bash
composer install
```

### Development
```bash
# Symfony
symfony server:start

# Laravel
php artisan serve
```

### Database
```bash
# Migrations
{{MIGRATION_RUN_COMMAND}}

# Create migration
{{MIGRATION_CREATE_COMMAND}}
```

### Tests
```bash
# All tests
vendor/bin/phpunit

# Unit tests
vendor/bin/phpunit --testsuite=Unit

# With coverage
vendor/bin/phpunit --coverage-html coverage/
```

### Quality
```bash
# PHPStan
vendor/bin/phpstan analyse

# Code style
vendor/bin/php-cs-fixer fix

# Full quality check
composer quality
```

## Environment Variables

```env
# Application
APP_ENV={{APP_ENV}}
APP_SECRET={{APP_SECRET}}
APP_DEBUG={{APP_DEBUG}}

# Database
DATABASE_URL={{DATABASE_URL}}

# Cache
REDIS_URL={{REDIS_URL}}

# Messaging
MESSENGER_TRANSPORT_DSN={{MESSENGER_DSN}}

# External APIs
{{EXTERNAL_API_VARS}}
```

## Naming Conventions

### Files
- **Entities** : PascalCase (ex: `Order.php`)
- **Value Objects** : PascalCase (ex: `Money.php`)
- **Repositories** : PascalCase + Interface (ex: `OrderRepositoryInterface.php`)
- **Handlers** : PascalCase + Handler (ex: `CreateOrderHandler.php`)
- **Commands** : PascalCase + Command (ex: `CreateOrderCommand.php`)

### Code
- **Classes** : PascalCase
- **Methods** : camelCase
- **Properties** : camelCase
- **Constants** : UPPER_SNAKE_CASE
- **Interfaces** : PascalCase + Interface suffix

## Project-Specific Rules

{{PROJECT_SPECIFIC_RULES}}

## Main Dependencies

### Production
```json
{
  "php": ">=8.4",
  "{{FRAMEWORK_PACKAGE}}": "{{FRAMEWORK_VERSION}}",
  {{DEPENDENCIES}}
}
```

### Development
```json
{
  "phpstan/phpstan": "^2.0",
  "phpunit/phpunit": "^11.0",
  "friendsofphp/php-cs-fixer": "^3.0",
  {{DEV_DEPENDENCIES}}
}
```

## Resources and Documentation

### Internal Documentation
- **Architecture** : `docs/architecture.md`
- **API Reference** : `docs/api-reference.md`
- **Database Schema** : `docs/database-schema.md`

### External Documentation
- **PHP** : https://www.php.net/docs.php
- **Framework** : {{FRAMEWORK_DOCS_URL}}
- {{EXTERNAL_DOCS}}

## Important Notes

{{IMPORTANT_NOTES}}

## Major Changes History

{{CHANGELOG_HIGHLIGHTS}}

---

**Last update** : {{LAST_UPDATE_DATE}}
**Maintainer** : {{MAINTAINER_NAME}}
