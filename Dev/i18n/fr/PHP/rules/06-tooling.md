# Outils de Développement PHP

## Composer - Gestion des Dépendances

### Commandes Essentielles

```bash
# Initialiser un nouveau projet
composer init

# Installer les dépendances
composer install           # Installer depuis composer.lock
composer update            # Mettre à jour vers les dernières versions

# Ajouter des packages
composer require vendor/package
composer require --dev phpunit/phpunit

# Supprimer des packages
composer remove vendor/package

# Rafraîchir l'autoload
composer dump-autoload -o  # Optimisé pour la production

# Vérifier les vulnérabilités
composer audit

# Afficher les packages obsolètes
composer outdated

# Valider composer.json
composer validate
```

### Configuration composer.json

```json
{
    "name": "app/my-project",
    "description": "Mon Application PHP",
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

## PHP-CS-Fixer - Formatage du Code

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

        // Types stricts
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

        // Tableaux
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

        // Opérateurs
        'not_operator_with_successor_space' => true,
        'concat_space' => ['spacing' => 'one'],

        // Structures de contrôle
        'yoda_style' => false,
        'no_alternative_syntax' => true,

        // Espaces
        'blank_line_before_statement' => [
            'statements' => ['return', 'throw', 'try'],
        ],
        'method_chaining_indentation' => true,
    ])
    ->setFinder($finder);
```

### Commandes

```bash
# Vérifier les violations de style
php-cs-fixer fix --dry-run --diff

# Corriger toutes les violations
php-cs-fixer fix

# Corriger un seul fichier
php-cs-fixer fix src/Domain/Entity/User.php
```

## PHPStan - Analyse Statique

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
        # Ignorer des patterns spécifiques si nécessaire
        # - '#Call to an undefined method#'

    reportUnmatchedIgnoredErrors: false
```

### Niveaux Expliqués

| Niveau | Vérifications |
|--------|---------------|
| 0 | Vérifications basiques, classes/fonctions inconnues |
| 1 | Variables, types de propriétés |
| 2 | Méthodes inconnues sur les expressions |
| 3 | Types de retour, types de paramètres |
| 4 | Code mort, instructions inatteignables |
| 5 | Types d'arguments dans les appels de fonction |
| 6 | Signaler les typehints manquants |
| 7 | Types union, types partiellement erronés |
| 8 | Signaler les problèmes de nullable |
| 9 | Type mixed, niveau le plus strict |

### Commandes

```bash
# Exécuter l'analyse
vendor/bin/phpstan analyse

# Analyser un chemin spécifique
vendor/bin/phpstan analyse src/Domain

# Générer une baseline pour le code legacy
vendor/bin/phpstan analyse --generate-baseline

# Exécuter avec limite mémoire
vendor/bin/phpstan analyse --memory-limit=1G
```

## Rector - Refactoring Automatisé

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
        // Ignorer des fichiers ou règles spécifiques
    ]);
```

### Commandes

```bash
# Prévisualiser les changements
vendor/bin/rector process --dry-run

# Appliquer les changements
vendor/bin/rector process

# Traiter un chemin spécifique
vendor/bin/rector process src/Domain
```

## PHPUnit - Tests

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

### Commandes

```bash
# Exécuter tous les tests
vendor/bin/phpunit

# Exécuter une suite de tests spécifique
vendor/bin/phpunit --testsuite=Unit

# Exécuter avec couverture
vendor/bin/phpunit --coverage-html coverage

# Exécuter un seul fichier de test
vendor/bin/phpunit tests/Unit/Domain/Entity/UserTest.php

# Exécuter une seule méthode de test
vendor/bin/phpunit --filter testUserCanBeCreated

# Exécuter avec sortie détaillée
vendor/bin/phpunit -v
```

## Pest - Tests Modernes

### Configuration (pest.php dans tests/)

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

### Commandes

```bash
# Exécuter les tests
vendor/bin/pest

# Exécuter avec couverture
vendor/bin/pest --coverage

# Exécuter en parallèle
vendor/bin/pest --parallel

# Mode watch
vendor/bin/pest --watch
```

## Workflow de Développement

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

### Hook Pre-commit (.git/hooks/pre-commit)

```bash
#!/bin/bash

echo "Exécution des vérifications de qualité..."

# PHP CS Fixer
vendor/bin/php-cs-fixer fix --dry-run --diff
if [ $? -ne 0 ]; then
    echo "❌ PHP CS Fixer a échoué"
    exit 1
fi

# PHPStan
vendor/bin/phpstan analyse
if [ $? -ne 0 ]; then
    echo "❌ PHPStan a échoué"
    exit 1
fi

# PHPUnit
vendor/bin/phpunit --testsuite=Unit
if [ $? -ne 0 ]; then
    echo "❌ Les tests unitaires ont échoué"
    exit 1
fi

echo "✅ Toutes les vérifications sont passées"
```

## Développement Docker

### Dockerfile

```dockerfile
FROM php:8.5-fpm-alpine

# Installer les extensions
RUN apk add --no-cache \
    postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql opcache

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurer PHP
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

## Checklist Outils

- [ ] Composer configuré avec autoload
- [ ] PHP-CS-Fixer configuré (PSR-12 + strict)
- [ ] PHPStan au niveau 10 avec règles strictes
- [ ] PHPUnit/Pest configuré avec couverture
- [ ] Rector configuré pour les mises à jour
- [ ] Makefile avec commandes communes
- [ ] Hooks pre-commit installés
- [ ] Pipeline CI/CD configuré
- [ ] Environnement de développement Docker
