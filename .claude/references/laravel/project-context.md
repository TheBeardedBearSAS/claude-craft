# {{PROJECT_NAME}} - Project Context

## Overview

{{PROJECT_DESCRIPTION}}

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Laravel | 13.x |
| Language | PHP | 8.3+ (8.5 recommandé) |
| Database | {{DATABASE_TYPE}} | {{DATABASE_VERSION}} |
| Cache | Redis | {{REDIS_VERSION}} |
| Queue | {{QUEUE_DRIVER}} | - |

## Architecture Pattern

**Pattern**: {{ARCHITECTURE_PATTERN}}

### Layer Structure

```
app/
├── Domain/                    # Core business logic
│   ├── {{MODULE}}/
│   │   ├── Models/            # Eloquent models
│   │   ├── ValueObjects/      # Immutable value types
│   │   ├── Events/            # Domain events
│   │   └── Contracts/         # Repository interfaces
│
├── Application/               # Use cases
│   ├── {{MODULE}}/
│   │   ├── Actions/           # Single-purpose actions
│   │   └── DTOs/              # Data Transfer Objects
│
├── Infrastructure/            # External concerns
│   ├── Persistence/           # Repository implementations
│   └── Services/              # External service integrations
│
└── Http/                      # Presentation
    ├── Controllers/
    ├── Requests/
    └── Resources/
```

## Coding Standards

### PHP Standards
- **Strict Types**: `declare(strict_types=1);` in all files
- **PHP Version**: {{PHP_VERSION}}+
- **Features**: Constructor promotion, readonly, enums, match

### Laravel Standards
- **Validation**: Via Form Requests only
- **Responses**: Via API Resources
- **Authorization**: Via Policies
- **Events**: For cross-cutting concerns

### Code Quality
- **Formatter**: Laravel Pint
- **Static Analysis**: PHPStan level 8
- **Coverage**: Minimum 80%

## Key Modules

### {{MODULE_1}}
{{MODULE_1_DESCRIPTION}}

### {{MODULE_2}}
{{MODULE_2_DESCRIPTION}}

## External Integrations

| Service | Purpose | Documentation |
|---------|---------|---------------|
| {{SERVICE_1}} | {{PURPOSE_1}} | {{DOC_URL_1}} |
| {{SERVICE_2}} | {{PURPOSE_2}} | {{DOC_URL_2}} |

## Development Workflow

### Git Flow
- **Main**: Production-ready code
- **Develop**: Integration branch
- **Feature**: `feature/{ticket}-{description}`
- **Hotfix**: `hotfix/{ticket}-{description}`

### Pull Request Requirements
- [ ] All tests pass
- [ ] PHPStan level 8 passes
- [ ] Pint formatting passes
- [ ] Coverage >= 80%
- [ ] Documentation updated

## Environment Configuration

### Required Environment Variables
```env
APP_NAME={{PROJECT_NAME}}
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION={{DATABASE_TYPE}}
DB_HOST=127.0.0.1
DB_DATABASE={{PROJECT_NAME}}

CACHE_DRIVER=redis
QUEUE_CONNECTION={{QUEUE_DRIVER}}
SESSION_DRIVER=redis
```

## Commands Reference

### Development
```bash
php artisan serve           # Start dev server
php artisan tinker          # Interactive REPL
php artisan queue:work      # Process jobs
```

### Testing
```bash
php artisan test                    # Run all tests
php artisan test --parallel         # Run in parallel
php artisan test --coverage --min=80 # With coverage
```

### Database
```bash
php artisan migrate                 # Run migrations
php artisan migrate:fresh --seed    # Fresh with seeds
php artisan db:seed                 # Run seeders
```

### Quality
```bash
./vendor/bin/pint                   # Format code
./vendor/bin/phpstan analyse        # Static analysis
composer audit                      # Security check
```
