# PHP Development Tools

## Composer - Dependency Management

### Essential Commands

```bash
# Initialize new project
composer init

# Install dependencies
composer install           # Install from composer.lock
composer update            # Update to latest versions

# Add packages
composer require vendor/package
composer require --dev phpunit/phpunit

# Remove packages
composer remove vendor/package

# Autoload refresh
composer dump-autoload -o  # Optimized for production

# Check for vulnerabilities
composer audit

# Show outdated packages
composer outdated

# Validate composer.json
composer validate
```

### composer.json Configuration

```json
{
    "name": "app/my-project",
    "description": "My PHP Application",
    "type": "project",
    "license": "MIT",
    "minimum-stability": "stable",
    "prefer-stable": true,
    "require": {
        "php": ">=8.3",
        "ext-pdo": "*",
        "ext-json": "*",
        "ramsey/uuid": "^4.7",
        "psr/log": "^3.0",
        "psr/container": "^2.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.0",
        "phpstan/phpstan": "^2.0",
        "friendsofphp/php-cs-fixer": "^3.0",
        "rector/rector": "^2.4",
        "pestphp/pest": "^4.7"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "App\\Tests\\": "tests/"
        }
    },
    "config": {
        "optimize-autoloader": true,
        "sort-packages": true,
        "allow-plugins": {
            "pestphp/pest-plugin": true
        }
    },
    "scripts": {
        "test": "phpunit",
        "test:coverage": "phpunit --coverage-html coverage",
        "analyse": "phpstan analyse",
        "cs:check": "php-cs-fixer fix --dry-run --diff",
        "cs:fix": "php-cs-fixer fix",
        "quality": [
            "@cs:check",
            "@analyse",
            "@test"
        ]
    }
}
```

## PHP-CS-Fixer - Code Formatting

### Configuration (.php-cs-fixer.php)

```php
<?php

declare(strict_types=1);

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/src')
    ->in(__DIR__ . '/tests')
    ->exclude('var')
    ->exclude('vendor');

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR12' => true,
        '@PHP85Migration' => true,
        '@Symfony' => true,
        '@Symfony:risky' => true,

        // Strict types
        'declare_strict_types' => true,

        // Imports
        'global_namespace_import' => [
            'import_classes' => true,
            'import_constants' => false,
            'import_functions' => false,
        ],
        'ordered_imports' => [
            'imports_order' => ['class', 'function', 'const'],
            'sort_algorithm' => 'alpha',
        ],
        'no_unused_imports' => true,

        // Arrays
        'array_syntax' => ['syntax' => 'short'],
        'trailing_comma_in_multiline' => [
            'elements' => ['arrays', 'arguments', 'parameters'],
        ],

        // Classes
        'final_class' => true,
        'final_internal_class' => true,
        'self_accessor' => true,

        // PHPDoc
        'phpdoc_align' => ['align' => 'left'],
        'phpdoc_order' => true,
        'phpdoc_separation' => true,
        'phpdoc_to_comment' => false,
        'no_superfluous_phpdoc_tags' => [
            'allow_mixed' => true,
            'remove_inheritdoc' => true,
        ],

        // Operators
        'not_operator_with_successor_space' => true,
        'concat_space' => ['spacing' => 'one'],

        // Control structures
        'yoda_style' => false,
        'no_alternative_syntax' => true,

        // Whitespace
        'blank_line_before_statement' => [
            'statements' => ['return', 'throw', 'try'],
        ],
        'method_chaining_indentation' => true,
    ])
    ->setFinder($finder);
```

### Commands

```bash
# Check style violations
php-cs-fixer fix --dry-run --diff

# Fix all violations
php-cs-fixer fix

# Fix single file
php-cs-fixer fix src/Domain/Entity/User.php
```

## PHPStan - Static Analysis

### Configuration (phpstan.neon)

```neon
includes:
    - vendor/phpstan/phpstan-strict-rules/rules.neon

parameters:
    phpVersion: 80400
    level: 10

    paths:
        - src
        - tests

    excludePaths:
        - src/Kernel.php
        - tests/bootstrap.php

    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    checkTooWideReturnTypesInProtectedAndPublicMethods: true

    ignoreErrors:
        # Ignore specific patterns if needed
        # - '#Call to an undefined method#'

    reportUnmatchedIgnoredErrors: false
```

### Levels Explained

| Level | Checks |
|-------|--------|
| 0 | Basic checks, unknown classes, functions |
| 1 | Variables, properties types |
| 2 | Unknown methods on expressions |
| 3 | Return types, parameter types |
| 4 | Dead code, unreachable statements |
| 5 | Argument types in function calls |
| 6 | Report missing typehints |
| 7 | Union types, partially wrong types |
| 8 | Report nullable issues |
| 9 | Mixed type, strictest level |

### Commands

```bash
# Run analysis
vendor/bin/phpstan analyse

# Analyse specific path
vendor/bin/phpstan analyse src/Domain

# Generate baseline for legacy code
vendor/bin/phpstan analyse --generate-baseline

# Run with memory limit
vendor/bin/phpstan analyse --memory-limit=1G
```

## Rector - Automated Refactoring

### Configuration (rector.php)

```php
<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Set\ValueObject\SetList;
use Rector\Php83\Rector\ClassMethod\AddOverrideAttributeToOverriddenMethodsRector;
use Rector\TypeDeclaration\Rector\ClassMethod\AddVoidReturnTypeWhereNoReturnRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/src',
        __DIR__ . '/tests',
    ])
    ->withPhpSets(php84: true)
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
        typeDeclarations: true,
        privatization: true,
        earlyReturn: true,
    )
    ->withRules([
        AddVoidReturnTypeWhereNoReturnRector::class,
        AddOverrideAttributeToOverriddenMethodsRector::class,
    ])
    ->withSkip([
        // Skip specific files or rules
    ]);
```

### Commands

```bash
# Preview changes
vendor/bin/rector process --dry-run

# Apply changes
vendor/bin/rector process

# Process specific path
vendor/bin/rector process src/Domain
```

## PHPUnit - Testing

### Configuration (phpunit.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true"
         failOnRisky="true"
         failOnWarning="true"
         cacheDirectory=".phpunit.cache"
         executionOrder="depends,defects"
         requireCoverageMetadata="true"
         beStrictAboutCoverageMetadata="true"
         beStrictAboutOutputDuringTests="true">

    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="Functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>

    <source>
        <include>
            <directory>src</directory>
        </include>
        <exclude>
            <directory>src/Kernel.php</directory>
        </exclude>
    </source>

    <coverage>
        <report>
            <html outputDirectory="coverage"/>
            <clover outputFile="coverage.xml"/>
        </report>
    </coverage>

    <php>
        <env name="APP_ENV" value="test"/>
    </php>
</phpunit>
```

### Commands

```bash
# Run all tests
vendor/bin/phpunit

# Run specific test suite
vendor/bin/phpunit --testsuite=Unit

# Run with coverage
vendor/bin/phpunit --coverage-html coverage

# Run single test file
vendor/bin/phpunit tests/Unit/Domain/Entity/UserTest.php

# Run single test method
vendor/bin/phpunit --filter testUserCanBeCreated

# Run with verbose output
vendor/bin/phpunit -v
```

## Pest - Modern Testing

### Configuration (pest.php in tests/)

```php
<?php

declare(strict_types=1);

pest()
    ->parallel()
    ->in('Unit', 'Integration', 'Functional');

uses()
    ->group('unit')
    ->in('Unit');

uses()
    ->group('integration')
    ->in('Integration');
```

### Commands

```bash
# Run tests
vendor/bin/pest

# Run with coverage
vendor/bin/pest --coverage

# Run in parallel
vendor/bin/pest --parallel

# Watch mode
vendor/bin/pest --watch
```

## Development Workflow

### Makefile

```makefile
.PHONY: install test analyse cs quality

install:
	composer install

test:
	vendor/bin/phpunit

test-coverage:
	vendor/bin/phpunit --coverage-html coverage

analyse:
	vendor/bin/phpstan analyse

cs-check:
	vendor/bin/php-cs-fixer fix --dry-run --diff

cs-fix:
	vendor/bin/php-cs-fixer fix

rector-check:
	vendor/bin/rector process --dry-run

rector-fix:
	vendor/bin/rector process

quality: cs-check analyse test

ci: install quality
```

### Pre-commit Hook (.git/hooks/pre-commit)

```bash
#!/bin/bash

echo "Running quality checks..."

# PHP CS Fixer
vendor/bin/php-cs-fixer fix --dry-run --diff
if [ $? -ne 0 ]; then
    echo "❌ PHP CS Fixer failed"
    exit 1
fi

# PHPStan
vendor/bin/phpstan analyse
if [ $? -ne 0 ]; then
    echo "❌ PHPStan failed"
    exit 1
fi

# PHPUnit
vendor/bin/phpunit --testsuite=Unit
if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed"
    exit 1
fi

echo "✅ All checks passed"
```

## Docker Development

### Dockerfile

```dockerfile
FROM php:8.5-fpm-alpine

# Install extensions
RUN apk add --no-cache \
    postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure PHP
COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini

WORKDIR /var/www/html
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  php:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/var/www/html
    environment:
      - APP_ENV=dev

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - php

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Tooling Checklist

- [ ] Composer configured with autoload
- [ ] PHP-CS-Fixer configured (PSR-12 + strict)
- [ ] PHPStan at level 10 with strict rules
- [ ] PHPUnit/Pest configured with coverage
- [ ] Rector configured for upgrades
- [ ] Makefile with common commands
- [ ] Pre-commit hooks installed
- [ ] CI/CD pipeline configured
- [ ] Docker development environment
