# Laravel 13 Tooling and Development Environment

**Source :** https://laravel.com/docs/13.x/artisan

## Essential Tools

### Artisan CLI

```bash
# Project setup
php artisan key:generate
php artisan storage:link
php artisan optimize

# Development
php artisan serve                          # Start dev server
php artisan tinker                         # Interactive REPL
php artisan route:list                     # List all routes
php artisan route:list --path=api/orders   # Filter routes

# Database
php artisan migrate                        # Run migrations
php artisan migrate:fresh --seed           # Reset and seed
php artisan db:seed --class=OrderSeeder    # Run specific seeder
php artisan migrate:status                 # Check migration status

# Code generation
php artisan make:model Order -mfsc         # Model + migration + factory + seeder + controller
php artisan make:controller OrderController --api --model=Order
php artisan make:request StoreOrderRequest
php artisan make:resource OrderResource
php artisan make:policy OrderPolicy --model=Order
php artisan make:event OrderShipped
php artisan make:listener SendOrderNotification --event=OrderShipped
php artisan make:job ProcessOrder
php artisan make:mail OrderShipped --markdown=emails.orders.shipped
php artisan make:notification OrderShipped
php artisan make:rule ValidCouponCode
php artisan make:cast Money
php artisan make:enum OrderStatus

# Testing
php artisan test                           # Run tests
php artisan test --parallel                # Parallel testing
php artisan test --filter=OrderTest        # Filter tests
php artisan test --coverage                # With coverage

# Cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear                 # Clear all caches

# Queue
php artisan queue:work                     # Process jobs
php artisan queue:listen                   # Listen for jobs
php artisan queue:failed                   # List failed jobs
php artisan queue:retry all                # Retry failed jobs

# Maintenance
php artisan down --secret="bypass-token"   # Maintenance mode
php artisan up                             # Exit maintenance
```

### Composer Scripts

```json
// composer.json
{
    "scripts": {
        "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ],
        "dev": [
            "Composer\\Config::disableProcessTimeout",
            "npx concurrently -k -c \"#93c5fd,#c4b5fd,#86efac\" \"php artisan serve\" \"npm run dev\" \"php artisan queue:listen --tries=1\""
        ],
        "test": "php artisan test",
        "test:coverage": "php artisan test --coverage --min=80",
        "lint": "vendor/bin/pint",
        "lint:test": "vendor/bin/pint --test",
        "analyse": "vendor/bin/phpstan analyse",
        "format": [
            "@lint",
            "npm run format"
        ]
    }
}
```

## Code Quality Tools

### Laravel Pint (Formatter)

```bash
# Install (included in Laravel 10+)
composer require laravel/pint --dev

# Run
./vendor/bin/pint

# Check without fixing
./vendor/bin/pint --test

# Fix specific file
./vendor/bin/pint app/Models/Order.php
```

```json
// pint.json
{
    "preset": "laravel",
    "rules": {
        "blank_line_before_statement": {
            "statements": ["return", "throw", "try"]
        },
        "array_indentation": true,
        "array_syntax": {"syntax": "short"},
        "binary_operator_spaces": {
            "default": "single_space"
        },
        "class_attributes_separation": {
            "elements": {"const": "one", "method": "one", "property": "one"}
        },
        "concat_space": {"spacing": "one"},
        "declare_strict_types": true,
        "final_class": true,
        "global_namespace_import": {
            "import_classes": true,
            "import_constants": true,
            "import_functions": true
        },
        "no_unused_imports": true,
        "ordered_imports": {
            "sort_algorithm": "alpha",
            "imports_order": ["const", "class", "function"]
        },
        "single_quote": true,
        "trailing_comma_in_multiline": true
    },
    "exclude": [
        "bootstrap",
        "storage",
        "vendor"
    ]
}
```

### PHPStan / Larastan (Static Analysis)

```bash
# Install
composer require --dev phpstan/phpstan
composer require --dev larastan/larastan

# Run
./vendor/bin/phpstan analyse
```

```neon
# phpstan.neon
includes:
    - vendor/larastan/larastan/extension.neon

parameters:
    paths:
        - app
        - database

    level: 8

    ignoreErrors:
        - '#Call to an undefined method Illuminate\\Database\\Eloquent\\Builder#'

    excludePaths:
        - app/Console/Kernel.php

    checkMissingIterableValueType: false
    checkGenericClassInNonGenericObjectType: false

    treatPhpDocTypesAsCertain: false

    reportUnmatchedIgnoredErrors: false
```

### IDE Helper

```bash
# Install
composer require --dev barryvdh/laravel-ide-helper

# Generate helpers
php artisan ide-helper:generate      # PHPDoc for facades
php artisan ide-helper:models -M     # Model annotations
php artisan ide-helper:meta          # PhpStorm meta file

# Add to composer.json post-update-cmd
"@php artisan ide-helper:generate",
"@php artisan ide-helper:meta"
```

### Rector (Automated Refactoring)

```bash
# Install
composer require rector/rector --dev

# Run
./vendor/bin/rector process
./vendor/bin/rector process --dry-run
```

```php
// rector.php
use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Laravel\Set\LaravelSetList;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/app',
        __DIR__ . '/database',
        __DIR__ . '/tests',
    ])
    ->withSets([
        LevelSetList::UP_TO_PHP_83,
        LaravelSetList::LARAVEL_110,
    ])
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
        typeDeclarations: true,
    );
```

## Essential Packages

### Development

```json
{
    "require-dev": {
        "barryvdh/laravel-debugbar": "^3.9",
        "barryvdh/laravel-ide-helper": "^3.0",
        "fakerphp/faker": "^1.23",
        "laravel/pint": "^1.13",
        "laravel/sail": "^1.26",
        "larastan/larastan": "^2.9",
        "mockery/mockery": "^1.6",
        "nunomaduro/collision": "^8.0",
        "pestphp/pest": "^4.0",
        "pestphp/pest-plugin-laravel": "^4.0",
        "pestphp/pest-plugin-mutate": "^4.0",
        "phpstan/phpstan": "^2.2",
        "rector/rector": "^2.4",
        "spatie/laravel-ignition": "^2.4"
    }
}
```

### Production

```json
{
    "require": {
        "php": "^8.5",
        "laravel/framework": "^13.0",
        "laravel/sanctum": "^4.0",
        "laravel/horizon": "^5.24",
        "laravel/telescope": "^5.0",
        "spatie/laravel-data": "^4.0",
        "spatie/laravel-permission": "^6.4",
        "spatie/laravel-query-builder": "^6.0",
        "spatie/laravel-medialibrary": "^11.0",
        "spatie/laravel-activitylog": "^4.8"
    }
}
```

## Docker / Laravel Sail

### Versions Infrastructure 2026

| Composant | Version | Usage Laravel |
|-----------|---------|---------------|
| Docker Engine | 29.4.3 | BuildKit par défaut, SBOM natif |
| FrankenPHP | 1.12.1 | Alternative moderne à PHP-FPM (Worker mode Octane) |
| PgBouncer | 1.25.2 | Transaction pooling + prepared statements natifs (CVE-2026-6664/6667 patchées) |

**FrankenPHP + Laravel Octane** : 2-3× gains performance (Worker mode, HTTP/3, max_requests anti-leak).  
**Sources** : https://frankenphp.dev/docs/laravel/ | https://laravel.com/docs/octane

### docker-compose.yml

```yaml
version: '3.8'

services:
    app:
        build:
            context: .
            dockerfile: Dockerfile
        image: laravel-app
        container_name: laravel-app
        restart: unless-stopped
        working_dir: /var/www
        volumes:
            - ./:/var/www
            - ./docker/php/local.ini:/usr/local/etc/php/conf.d/local.ini
        networks:
            - laravel

    nginx:
        image: nginx:alpine
        container_name: laravel-nginx
        restart: unless-stopped
        ports:
            - "8080:80"
        volumes:
            - ./:/var/www
            - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf
        networks:
            - laravel

    pgsql:
        image: postgres:16-alpine
        container_name: laravel-pgsql
        restart: unless-stopped
        environment:
            POSTGRES_USER: ${DB_USERNAME}
            POSTGRES_PASSWORD: ${DB_PASSWORD}
            POSTGRES_DB: ${DB_DATABASE}
        ports:
            - "5432:5432"
        volumes:
            - pgsqldata:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
            interval: 5s
            timeout: 5s
            retries: 5
        networks:
            - laravel

    redis:
        image: redis:7-alpine
        container_name: laravel-redis
        restart: unless-stopped
        ports:
            - "6379:6379"
        volumes:
            - redisdata:/data
        networks:
            - laravel

    mailpit:
        image: axllent/mailpit
        container_name: laravel-mailpit
        restart: unless-stopped
        ports:
            - "1025:1025"
            - "8025:8025"
        networks:
            - laravel

networks:
    laravel:
        driver: bridge

volumes:
    pgsqldata:
    redisdata:
```

### Dockerfile

```dockerfile
FROM php:8.5-fpm

# Arguments
ARG user=www
ARG uid=1000

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user
RUN useradd -G www-data,root -u $uid -d /home/$user $user
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

WORKDIR /var/www

USER $user
```

## IDE Configuration

### VS Code Settings

```json
// .vscode/settings.json
{
    "editor.formatOnSave": true,
    "php.validate.executablePath": "/usr/bin/php",
    "[php]": {
        "editor.defaultFormatter": "open-phpstorm.open-phpstorm"
    },
    "intelephense.files.maxSize": 5000000,
    "intelephense.environment.phpVersion": "8.3.0",
    "phpstan.binPath": "vendor/bin/phpstan",
    "phpstan.configFile": "phpstan.neon",
    "php-cs-fixer.executablePath": "vendor/bin/pint",
    "php-cs-fixer.onsave": true
}
```

### VS Code Extensions

```json
// .vscode/extensions.json
{
    "recommendations": [
        "bmewburn.vscode-intelephense-client",
        "xdebug.php-debug",
        "recca0120.vscode-phpunit",
        "shufo.vscode-blade-formatter",
        "onecentlin.laravel-blade",
        "amiralizadeh9480.laravel-extra-intellisense",
        "codingyu.laravel-goto-view",
        "absszero.vscode-laravel-goto",
        "open-phpstorm.open-phpstorm",
        "sanderronde.phpstan-vscode"
    ]
}
```

## CI/CD Configuration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: laravel
          POSTGRES_PASSWORD: secret
          POSTGRES_DB: laravel_test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, dom, pdo, pgsql, redis
          coverage: xdebug

      - name: Cache Composer
        uses: actions/cache@v4
        with:
          path: vendor
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}

      - name: Install Dependencies
        run: composer install --prefer-dist --no-progress

      - name: Copy .env
        run: cp .env.example .env

      - name: Generate Key
        run: php artisan key:generate

      - name: Run Pint
        run: ./vendor/bin/pint --test

      - name: Run PHPStan
        run: ./vendor/bin/phpstan analyse

      - name: Run Tests
        run: php artisan test --parallel --coverage-clover coverage.xml
        env:
          DB_CONNECTION: pgsql
          DB_HOST: 127.0.0.1
          DB_PORT: 5432
          DB_DATABASE: laravel_test
          DB_USERNAME: laravel
          DB_PASSWORD: secret
          REDIS_HOST: 127.0.0.1

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
```

## Debugging

### Laravel Debugbar

```php
// Enable via .env
DEBUGBAR_ENABLED=true

// Usage in code
\Debugbar::info($data);
\Debugbar::warning('Watch out!');
\Debugbar::addMessage($message, 'mylabel');
\Debugbar::startMeasure('render', 'Time for rendering');
\Debugbar::stopMeasure('render');
```

### Laravel Telescope

```bash
# Install
composer require laravel/telescope --dev

# Publish
php artisan telescope:install
php artisan migrate
```

```php
// app/Providers/TelescopeServiceProvider.php
protected function gate(): void
{
    Gate::define('viewTelescope', function ($user) {
        return in_array($user->email, [
            'admin@example.com',
        ]);
    });
}
```

## Claude Code LSP Plugin

The LSP plugin gives Claude structural code understanding via the Language Server Protocol: automatic diagnostics after each edit, go-to-definition, find references, and type information on hover.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Automatic diagnostics** | Errors and warnings detected after each modification |
| **Go to Definition** | Navigate to the exact definition of a symbol |
| **Find References** | All usages of a symbol across the project |
| **Hover** | Type information and documentation |
| **Workspace Symbols** | Search symbols across the entire project |
| **Call Hierarchy** | Trace incoming/outgoing calls |

### Installation

```bash
# 1. Install the language server
npm install -g intelephense

# 2. Install the Claude Code plugin (official marketplace)
/plugins install php-lsp@claude-plugins-official
```

### Benefits for Laravel

- Real-time detection of type errors, undefined methods, and missing imports
- Navigation through Eloquent models, facades, and service providers
- PHPDoc type inference including IDE Helper generated stubs
- Larastan-compatible diagnostics for Laravel-specific patterns

---

## Tooling Checklist

- [ ] Laravel Pint configured
- [ ] PHPStan/Larastan at level 10 (PHPStan 2.0)
- [ ] Pest 4 + Mutation Testing configured
- [ ] IDE Helper generated
- [ ] Docker/Sail configured
- [ ] CI/CD pipeline set up
- [ ] Debugbar installed (dev)
- [ ] Telescope installed (dev)
- [ ] VS Code extensions installed
- [ ] Git hooks configured
- [ ] Claude Code LSP plugin installed
- [ ] AI SDK configured (Laravel 13)
- [ ] Vector Search / pgvector configured (si RAG)
