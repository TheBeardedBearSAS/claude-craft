# Laravel Quality Tools

## Static Analysis

### PHPStan/Larastan Configuration

```neon
# phpstan.neon
includes:
    - vendor/larastan/larastan/extension.neon

parameters:
    paths:
        - app
        - database
        - tests

    level: 8

    ignoreErrors:
        - '#Call to an undefined method Illuminate\\Database\\Eloquent\\Builder#'
        - '#Call to an undefined method Illuminate\\Database\\Query\\Builder#'

    excludePaths:
        - app/Console/Kernel.php
        - app/Http/Kernel.php

    checkMissingIterableValueType: false
    checkGenericClassInNonGenericObjectType: false
    treatPhpDocTypesAsCertain: false
    reportUnmatchedIgnoredErrors: false

    # Laravel specific
    checkOctaneCompatibility: true
    noUnnecessaryCollectionCall: true
    checkModelProperties: true
```

### Running Static Analysis

```bash
# Run PHPStan
./vendor/bin/phpstan analyse

# Run with specific level
./vendor/bin/phpstan analyse --level=8

# Generate baseline for legacy projects
./vendor/bin/phpstan analyse --generate-baseline

# Clear cache
./vendor/bin/phpstan clear-result-cache
```

## Code Formatting

### Laravel Pint (PSR-12 + Laravel Style)

```json
// pint.json
{
    "preset": "laravel",
    "rules": {
        "blank_line_before_statement": {
            "statements": ["return", "throw", "try", "if", "foreach", "while"]
        },
        "array_indentation": true,
        "array_syntax": {"syntax": "short"},
        "binary_operator_spaces": {
            "default": "single_space"
        },
        "class_attributes_separation": {
            "elements": {
                "const": "one",
                "method": "one",
                "property": "one",
                "trait_import": "none"
            }
        },
        "concat_space": {"spacing": "one"},
        "declare_strict_types": true,
        "final_class": false,
        "global_namespace_import": {
            "import_classes": true,
            "import_constants": true,
            "import_functions": true
        },
        "method_argument_space": {
            "on_multiline": "ensure_fully_multiline",
            "keep_multiple_spaces_after_comma": false
        },
        "multiline_whitespace_before_semicolons": {
            "strategy": "no_multi_line"
        },
        "no_unused_imports": true,
        "not_operator_with_successor_space": true,
        "ordered_imports": {
            "sort_algorithm": "alpha",
            "imports_order": ["const", "class", "function"]
        },
        "php_unit_method_casing": {"case": "snake_case"},
        "single_quote": true,
        "trailing_comma_in_multiline": {
            "elements": ["arrays", "arguments", "parameters"]
        },
        "void_return": true
    },
    "exclude": [
        "bootstrap",
        "storage",
        "vendor",
        "node_modules"
    ]
}
```

### Running Pint

```bash
# Format all files
./vendor/bin/pint

# Check without fixing (CI mode)
./vendor/bin/pint --test

# Format specific directory
./vendor/bin/pint app/Models

# Format with verbose output
./vendor/bin/pint -v
```

## Code Coverage

### PHPUnit/Pest Coverage Configuration

```xml
<!-- phpunit.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         cacheDirectory=".phpunit.cache"
         executionOrder="depends,defects"
         failOnRisky="true"
         failOnWarning="true"
         requireCoverageMetadata="false"
         beStrictAboutOutputDuringTests="true">
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
        <testsuite name="Architecture">
            <directory>tests/Architecture</directory>
        </testsuite>
    </testsuites>
    <source>
        <include>
            <directory>app</directory>
        </include>
        <exclude>
            <directory>app/Console</directory>
            <directory>app/Exceptions</directory>
            <directory>app/Http/Middleware</directory>
            <directory>app/Providers</directory>
        </exclude>
    </source>
    <coverage>
        <report>
            <clover outputFile="coverage/clover.xml"/>
            <html outputDirectory="coverage/html"/>
            <text outputFile="coverage/coverage.txt"/>
        </report>
    </coverage>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="BCRYPT_ROUNDS" value="4"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
        <env name="MAIL_MAILER" value="array"/>
        <env name="QUEUE_CONNECTION" value="sync"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="TELESCOPE_ENABLED" value="false"/>
    </php>
</phpunit>
```

### Running Coverage

```bash
# Run tests with coverage
php artisan test --coverage

# Minimum coverage threshold
php artisan test --coverage --min=80

# Generate HTML report
XDEBUG_MODE=coverage php artisan test --coverage-html=coverage/html

# Generate Clover XML (for CI)
XDEBUG_MODE=coverage php artisan test --coverage-clover=coverage/clover.xml
```

## Rector (Automated Refactoring)

### Configuration

```php
<?php
// rector.php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Laravel\Set\LaravelSetList;
use Rector\TypeDeclaration\Rector\ClassMethod\ReturnTypeFromStrictNativeCallRector;
use Rector\TypeDeclaration\Rector\ClassMethod\ReturnTypeFromStrictTypedPropertyRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/app',
        __DIR__ . '/database',
        __DIR__ . '/tests',
    ])
    ->withSkip([
        __DIR__ . '/app/Console/Kernel.php',
        __DIR__ . '/app/Http/Kernel.php',
    ])
    ->withSets([
        LevelSetList::UP_TO_PHP_83,
        LaravelSetList::LARAVEL_110,
        LaravelSetList::LARAVEL_CODE_QUALITY,
        LaravelSetList::LARAVEL_FACADE_ALIASES_TO_FULL_NAMES,
    ])
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
        typeDeclarations: true,
        privatization: true,
        earlyReturn: true,
        strictBooleans: true,
    )
    ->withRules([
        ReturnTypeFromStrictNativeCallRector::class,
        ReturnTypeFromStrictTypedPropertyRector::class,
    ]);
```

### Running Rector

```bash
# Preview changes
./vendor/bin/rector process --dry-run

# Apply changes
./vendor/bin/rector process

# Process specific directory
./vendor/bin/rector process app/Models
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/quality.yml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, dom, pdo, pgsql, redis, xdebug
          coverage: xdebug

      - name: Cache Composer
        uses: actions/cache@v4
        with:
          path: vendor
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: |
            ${{ runner.os }}-composer-

      - name: Install Dependencies
        run: composer install --prefer-dist --no-progress

      - name: Check Code Style
        run: ./vendor/bin/pint --test

      - name: Static Analysis
        run: ./vendor/bin/phpstan analyse --error-format=github

      - name: Run Tests
        run: php artisan test --parallel --coverage-clover=coverage.xml
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: ':memory:'

      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
          fail_ci_if_error: false

  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Security Check
        run: composer audit

      - name: Check for Vulnerabilities
        uses: symfonycorp/security-checker-action@v5
```

### GitLab CI Configuration

```yaml
# .gitlab-ci.yml
stages:
  - quality
  - test
  - security

variables:
  PHP_VERSION: "8.3"
  COMPOSER_HOME: "$CI_PROJECT_DIR/.composer"

cache:
  paths:
    - vendor/
    - .composer/

code-style:
  stage: quality
  image: php:${PHP_VERSION}-cli
  before_script:
    - apt-get update && apt-get install -y git unzip
    - curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    - composer install --prefer-dist --no-progress
  script:
    - ./vendor/bin/pint --test
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

static-analysis:
  stage: quality
  image: php:${PHP_VERSION}-cli
  before_script:
    - apt-get update && apt-get install -y git unzip
    - curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    - composer install --prefer-dist --no-progress
  script:
    - ./vendor/bin/phpstan analyse
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

tests:
  stage: test
  image: php:${PHP_VERSION}-cli
  services:
    - postgres:16
    - redis:7
  variables:
    DB_CONNECTION: pgsql
    DB_HOST: postgres
    DB_DATABASE: testing
    DB_USERNAME: postgres
    DB_PASSWORD: secret
    POSTGRES_DB: testing
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: secret
  before_script:
    - apt-get update && apt-get install -y git unzip libpq-dev
    - docker-php-ext-install pdo pdo_pgsql
    - curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    - composer install --prefer-dist --no-progress
    - cp .env.example .env
    - php artisan key:generate
  script:
    - php artisan test --parallel
  coverage: '/^\s*Lines:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      junit: coverage/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura.xml

security-audit:
  stage: security
  image: php:${PHP_VERSION}-cli
  before_script:
    - apt-get update && apt-get install -y git unzip
    - curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
  script:
    - composer audit
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
```

## Pre-commit Hooks

### Husky + lint-staged Configuration

```json
// package.json
{
    "scripts": {
        "prepare": "husky"
    },
    "lint-staged": {
        "*.php": [
            "./vendor/bin/pint"
        ],
        "*.{js,ts,vue}": [
            "eslint --fix",
            "prettier --write"
        ]
    }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

# Run PHP static analysis on staged files
./vendor/bin/phpstan analyse --no-progress
```

### Git Hooks (Alternative)

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run Pint on staged PHP files
STAGED_PHP_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.php$')

if [ -n "$STAGED_PHP_FILES" ]; then
    echo "Running Laravel Pint..."
    ./vendor/bin/pint $STAGED_PHP_FILES

    # Add fixed files back to staging
    git add $STAGED_PHP_FILES

    echo "Running PHPStan..."
    ./vendor/bin/phpstan analyse $STAGED_PHP_FILES --no-progress

    if [ $? -ne 0 ]; then
        echo "PHPStan found issues. Please fix them before committing."
        exit 1
    fi
fi

exit 0
```

## IDE Integration

### VS Code Settings

```json
// .vscode/settings.json
{
    "editor.formatOnSave": true,
    "[php]": {
        "editor.defaultFormatter": "open-phpstorm.open-phpstorm",
        "editor.formatOnSave": false
    },
    "intelephense.files.maxSize": 5000000,
    "intelephense.environment.phpVersion": "8.3.0",
    "phpstan.binPath": "vendor/bin/phpstan",
    "phpstan.configFile": "phpstan.neon",
    "phpstan.enabled": true,
    "phpstan.analysisDelay": 1000,
    "php-cs-fixer.executablePath": "vendor/bin/pint",
    "php-cs-fixer.onsave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll": "explicit"
    }
}
```

### PhpStorm Settings

```xml
<!-- .idea/php.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="PhpProjectSharedConfiguration" php_language_level="8.3">
    <option name="suggestChangeDefaultLanguageLevel" value="false" />
  </component>
  <component name="PhpStanOptionsConfiguration">
    <option name="transferred" value="true" />
    <option name="configurationFilePath" value="$PROJECT_DIR$/phpstan.neon" />
  </component>
</project>
```

## Quality Metrics

### Minimum Requirements

| Metric | Threshold | Tool |
|--------|-----------|------|
| Code Coverage | ≥ 80% | PHPUnit/Pest |
| PHPStan Level | 8 | PHPStan |
| Cyclomatic Complexity | ≤ 10 | PHPStan |
| Method Length | ≤ 20 lines | Pint rules |
| Class Length | ≤ 200 lines | Review |
| Dependencies per Class | ≤ 5 | Architecture tests |

### Architecture Tests for Quality

```php
<?php
// tests/Architecture/QualityTest.php

arch('classes should be final or abstract')
    ->expect('App')
    ->classes()
    ->toExtendNothing()
    ->or()
    ->toBeFinal()
    ->ignoring([
        'App\Models',
        'App\Http\Controllers',
        'App\Exceptions',
    ]);

arch('no debugging statements')
    ->expect(['dd', 'dump', 'ray', 'var_dump', 'print_r'])
    ->not->toBeUsed();

arch('no env() calls outside config')
    ->expect('env')
    ->not->toBeUsed()
    ->ignoring('config');

arch('strict types declared')
    ->expect('App')
    ->toUseStrictTypes();

arch('actions are final')
    ->expect('App\Actions')
    ->toBeFinal();

arch('DTOs are readonly')
    ->expect('App\DTOs')
    ->toBeReadonly();
```

## Quality Checklist

- [ ] PHPStan level 8 passing
- [ ] Laravel Pint passing
- [ ] Code coverage ≥ 80%
- [ ] No debugging statements
- [ ] Strict types declared
- [ ] Architecture tests passing
- [ ] No security vulnerabilities (composer audit)
- [ ] Pre-commit hooks configured
- [ ] CI/CD pipeline green
