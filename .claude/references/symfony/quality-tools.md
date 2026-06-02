# Outils de qualité - Symfony 8.x / PHP 8.4+

## Overview

L'utilisation des outils de qualité est **OBLIGATOIRE** pour garantir un code maintenable, sûr et performant.

**Versions 2026:**
- PHP 8.4+ (Symfony 8.1 requiert PHP 8.4+, recommandé pour Property Hooks et Lazy Objects)
- Symfony 8.1.x stable 8.1 (mai 2026, recommandée) ou 7.4 LTS — https://symfony.com/releases/8.1
- PHPStan 2.2.x
- Rector 2.4.x
- Deptrac v4.x

**Objectifs:**
- ✅ PHPStan niveau max (aucune erreur tolérée)
- ✅ PHP-CS-Fixer automatique
- ✅ Rector 2.x pour modernisation du code (PHPStan 2 + PHP-Parser 5)
- ✅ Deptrac v4 pour validation architecture (PSR-4 natif)
- ✅ Infection pour mutation testing

> **Références:**
> - `03-coding-standards.md` - Standards de code
> - `07-testing-tdd-bdd.md` - Tests et couverture
> - `02-architecture-clean-ddd.md` - Architecture validée

---

## Table des matières

1. [PHPStan - Analysis statique](#phpstan---analyse-statique)
2. [PHP-CS-Fixer - Code style](#php-cs-fixer---code-style)
3. [Rector - Refactoring automatique](#rector---refactoring-automatique)
4. [Deptrac - Architecture boundaries](#deptrac---architecture-boundaries)
5. [Infection - Mutation testing](#infection---mutation-testing)
6. [PHPCPD - Détection duplication](#phpcpd---détection-duplication)
7. [PHPMetrics - Métriques](#phpmetrics---métriques)
8. [Pipeline de qualité](#pipeline-de-qualité)

---

## PHPStan - Analysis statique

### Configuration phpstan.neon

```neon
# phpstan.neon - Configuration stricte pour Atoll Tourisme

parameters:
    # ✅ OBLIGATOIRE: Niveau maximum
    level: max

    paths:
        - src
        - tests

    # Exclusions justifiées
    excludePaths:
        - src/Kernel.php
        - tests/bootstrap.php

    # ✅ Checks supplémentaires stricts
    checkAlwaysTrueCheckTypeFunctionCall: true
    checkAlwaysTrueInstanceof: true
    checkAlwaysTrueStrictComparison: true
    checkExplicitMixedMissingReturn: true
    checkFunctionNameCase: true
    checkInternalClassCaseSensitivity: true
    checkMissingIterableValueType: true
    checkMissingVarTagTypehint: true
    checkTooWideReturnTypesInProtectedAndPublicMethods: true
    checkUninitializedProperties: true
    checkDynamicProperties: true

    # ✅ Règles Doctrine strictes
    doctrine:
        repositoryClass: App\Infrastructure\Persistence\Doctrine\Repository\DoctrineReservationRepository
        objectManagerLoader: tests/object-manager.php

    # ✅ Règles Symfony strictes
    symfony:
        containerXmlPath: var/cache/dev/App_KernelDevDebugContainer.xml
        consoleApplicationLoader: tests/console-application.php

    # Baseline pour migration progressive (à éliminer)
    # includes:
    #     - phpstan-baseline.neon

    # ✅ Extensions obligatoires
    # (installées via composer)
    # - phpstan/phpstan-doctrine
    # - phpstan/phpstan-symfony
    # - phpstan/phpstan-phpunit
    # - phpstan/phpstan-strict-rules
    # - phpstan/phpstan-deprecation-rules

    # Ignorer certains patterns temporairement
    ignoreErrors:
        # Exemple: erreurs legacy (à corriger progressivement)
        # - '#Call to an undefined method.*Repository::findCustom#'

    # Report des erreurs non matchées (détecte baseline obsolète)
    reportUnmatchedIgnoredErrors: true

    # Parallélisation
    parallel:
        jobSize: 20
        maximumNumberOfProcesses: 4
        minimumNumberOfJobsPerProcess: 2
```

### Extensions PHPStan obligatoires

```bash
# Installation via Composer
make composer-require-dev PKG="phpstan/phpstan"
make composer-require-dev PKG="phpstan/extension-installer"
make composer-require-dev PKG="phpstan/phpstan-doctrine"
make composer-require-dev PKG="phpstan/phpstan-symfony"
make composer-require-dev PKG="phpstan/phpstan-phpunit"
make composer-require-dev PKG="phpstan/phpstan-strict-rules"
make composer-require-dev PKG="phpstan/phpstan-deprecation-rules"
```

### Usage

```bash
# Analyse complète
make phpstan

# Génération baseline (UNIQUEMENT pour migration)
make phpstan-baseline

# ⚠️ La baseline doit être éliminée progressivement
# Objectif: 0 erreur sans baseline
```

### Examples d'erreurs détectées

#### ❌ Type mixte non documenté

```php
<?php

class ReservationService
{
    // ❌ PHPStan erreur: Missing return type
    public function calculate($reservation)
    {
        return $reservation->getTotal();
    }
}
```

#### ✅ Correction: Types explicites

```php
<?php

final readonly class ReservationService
{
    // ✅ Types explicites
    public function calculate(Reservation $reservation): Money
    {
        return $reservation->getTotal();
    }
}
```

#### ❌ Property non initialisée

```php
<?php

class Reservation
{
    // ❌ PHPStan erreur: Property not initialized
    private Money $montantTotal;

    public function __construct()
    {
        // Oubli d'initialisation
    }
}
```

#### ✅ Correction: Initialisation obligatoire

```php
<?php

final class Reservation
{
    // ✅ Initialisé dans le constructeur
    private Money $montantTotal;

    public function __construct(Money $montantTotal)
    {
        $this->montantTotal = $montantTotal;
    }
}

// Ou avec readonly property (PHP 8.2+)
final readonly class Reservation
{
    // ✅ readonly force l'initialisation
    public function __construct(
        private Money $montantTotal,
    ) {}
}
```

### Métriques PHPStan

| État | Erreurs | Action |
|------|---------|--------|
| 🔴 BLOQUANT | > 0 | Corriger immédiatement |
| 🟢 OK | 0 | Maintenir |

**Règle d'or: ZERO erreur PHPStan niveau max**

---

## PHP-CS-Fixer - Code style

### Configuration .php-cs-fixer.dist.php

```php
<?php

// .php-cs-fixer.dist.php

declare(strict_types=1);

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

$finder = Finder::create()
    ->in(__DIR__ . '/src')
    ->in(__DIR__ . '/tests')
    ->exclude('var')
    ->exclude('vendor')
    ->name('*.php')
    ->notName('*.blade.php')
    ->ignoreDotFiles(true)
    ->ignoreVCS(true);

return (new Config())
    ->setRules([
        '@Symfony' => true,
        '@PSR12' => true,

        // ✅ Règles strictes supplémentaires
        'array_syntax' => ['syntax' => 'short'],
        'declare_strict_types' => true,
        'final_class' => true,
        'final_internal_class' => true,
        'global_namespace_import' => [
            'import_classes' => true,
            'import_constants' => true,
            'import_functions' => true,
        ],
        'no_unused_imports' => true,
        'ordered_imports' => [
            'imports_order' => ['class', 'function', 'const'],
            'sort_algorithm' => 'alpha',
        ],
        'php_unit_test_class_requires_covers' => false,
        'phpdoc_align' => ['align' => 'left'],
        'phpdoc_order' => true,
        'phpdoc_to_comment' => false,
        'strict_comparison' => true,
        'strict_param' => true,

        // ✅ Void return type
        'void_return' => true,

        // ✅ Type hints stricts
        'fully_qualified_strict_types' => true,

        // ✅ Trailing comma dans les tableaux multilignes
        'trailing_comma_in_multiline' => [
            'elements' => ['arrays', 'arguments', 'parameters'],
        ],

        // ✅ Visibilité obligatoire
        'visibility_required' => [
            'elements' => ['const', 'method', 'property'],
        ],

        // ✅ Readonly properties (PHP 8.1+)
        'readonly_property' => true,
    ])
    ->setFinder($finder)
    ->setRiskyAllowed(true)
    ->setUsingCache(true)
    ->setCacheFile(__DIR__ . '/var/.php-cs-fixer.cache');
```

### Usage

```bash
# Dry-run (vérification sans modification)
make cs-fixer-dry

# Application des corrections
make cs-fixer

# Output:
# Loaded config default.
# Using cache file ".php-cs-fixer.cache".
#
# Legend: ?-unknown, I-invalid file syntax, file ignored, S-skipped, .-no changes, F-fixed, E-error
#
# ................F.F........F...
#
# Fixed 3 files in 2.5 seconds
```

### Examples de corrections automatiques

#### Before PHP-CS-Fixer

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationId;

class Reservation {

    private $id;
    private $montantTotal;

    function __construct(ReservationId $id, Money $montantTotal) {
        $this->id = $id;
        $this->montantTotal = $montantTotal;
    }

    public function getId()
    {
        return $this->id;
    }
}
```

#### After PHP-CS-Fixer

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationId;

final class Reservation
{
    private ReservationId $id;
    private Money $montantTotal;

    public function __construct(ReservationId $id, Money $montantTotal)
    {
        $this->id = $id;
        $this->montantTotal = $montantTotal;
    }

    public function getId(): ReservationId
    {
        return $this->id;
    }
}
```

---

## Rector - Refactoring automatique

### Configuration rector.php

```php
<?php

// rector.php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Doctrine\Set\DoctrineSetList;
use Rector\Symfony\Set\SymfonySetList;
use Rector\Symfony\Set\SymfonyLevelSetList;
use Rector\PHPUnit\Set\PHPUnitSetList;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Set\ValueObject\SetList;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/src',
        __DIR__ . '/tests',
    ])
    ->withSkip([
        __DIR__ . '/src/Kernel.php',
    ])
    ->withPhpSets(php85: true)
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
        codingStyle: true,
        typeDeclarations: true,
        privatization: true,
        naming: true,
        instanceOf: true,
        earlyReturn: true,
        strictBooleans: true,
    )
    ->withSets([
        // ✅ Symfony 8.1
        SymfonyLevelSetList::UP_TO_SYMFONY_81,
        SymfonySetList::SYMFONY_CODE_QUALITY,
        SymfonySetList::SYMFONY_CONSTRUCTOR_INJECTION,

        // ✅ Doctrine 3.x
        DoctrineSetList::DOCTRINE_CODE_QUALITY,
        DoctrineSetList::DOCTRINE_ORM_30,

        // ✅ PHPUnit 12 (Pest 4.7 requiert PHPUnit ^12.5)
        PHPUnitSetList::PHPUNIT_120,
        PHPUnitSetList::PHPUNIT_CODE_QUALITY,

        // ✅ PHP 8.4 (8.5 en beta, ne pas utiliser en prod)
        LevelSetList::UP_TO_PHP_84,
        SetList::PHP_84,
    ])
    ->withImportNames(
        importNames: true,
        importDocBlockNames: true,
        importShortClasses: false,
        removeUnusedImports: true,
    );
```

### Usage

```bash
# Dry-run (preview des changements)
make rector-dry

# Application des modifications
make rector

# Output:
# [OK] Rector is done! 25 files changed
#
# Changes:
# - src/Domain/Reservation/Entity/Reservation.php:15
#   Array to readonly property
# - src/Application/UseCase/CreateReservation.php:23
#   Constructor injection instead of setter injection
```

### Examples de refactoring Rector

#### Before Rector

```php
<?php

class ReservationService
{
    private ReservationRepository $repository;

    // ❌ Setter injection
    public function setRepository(ReservationRepository $repository): void
    {
        $this->repository = $repository;
    }

    public function find(string $id): ?Reservation
    {
        // ❌ Pas de type de retour explicite
        return $this->repository->find($id);
    }
}
```

#### After Rector

```php
<?php

final readonly class ReservationService
{
    // ✅ Constructor injection
    public function __construct(
        private ReservationRepository $repository,
    ) {}

    // ✅ Type de retour explicite
    public function find(string $id): ?Reservation
    {
        return $this->repository->find($id);
    }
}
```

---

## Deptrac v4 - Architecture boundaries

> **Note:** Deptrac v4 apporte support PSR-4 natif, configuration YAML modernisée et meilleure performance.

### Configuration deptrac.yaml (v4)

```yaml
# deptrac.yaml - Validation architecture DDD (Deptrac v4)

deptrac:
    # ✅ Deptrac v4: Support PSR-4 natif
    paths:
        - ./src

    exclude_files:
        - '#.*test.*#'

    # ✅ v4: Collectors modernisés
    layers:
        - name: Domain
          collectors:
              - type: classLike
                value: ^App\\Domain\\.*

        - name: Application
          collectors:
              - type: classLike
                value: ^App\\Application\\.*

        - name: Infrastructure
          collectors:
              - type: classLike
                value: ^App\\Infrastructure\\.*

        - name: Presentation
          collectors:
              - type: classLike
                value: ^App\\Presentation\\.*

    ruleset:
        # ✅ Domain ne dépend de RIEN
        Domain: []

        # ✅ Application dépend uniquement de Domain
        Application:
            - Domain

        # ✅ Infrastructure dépend de Domain et Application
        Infrastructure:
            - Domain
            - Application

        # ✅ Presentation dépend de Application, Infrastructure et Domain
        Presentation:
            - Application
            - Infrastructure
            - Domain

    # ✅ v4: Formatters améliorés
    formatters:
        graphviz:
            hidden_layers: []
            groups: []
            pointToGroups: false
        codeclimate:
            output: deptrac-report.json

    # ✅ v4: Analyser options étendues
    analyser:
        types:
            - class
            - class_superglobal
            - function
            - function_superglobal
            - use  # Nouveau dans v4
```

### Usage

```bash
# Validation architecture
make deptrac

# Output attendu (succès):
# ✅ Domain layer: 0 violations
# ✅ Application layer: 0 violations
# ✅ Infrastructure layer: 0 violations
# ✅ Presentation layer: 0 violations
#
# All rules validated successfully!

# Output (violation détectée):
# ❌ Domain layer: 1 violation
#
# src/Domain/Reservation/Entity/Reservation.php:5
# Domain must not depend on Infrastructure
# Doctrine\ORM\Mapping\Entity
```

### Examples de violations

#### ❌ VIOLATION: Domain dépend de Doctrine

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM; // ❌ VIOLATION

#[ORM\Entity]
class Reservation
{
    // ...
}
```

#### ✅ CORRECTION: Mapping XML séparé (Infrastructure)

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ Pas de dépendance Doctrine
final class Reservation
{
    private ReservationId $id;
    // ...
}
```

```xml
<!-- Infrastructure/Persistence/Doctrine/Mapping/Reservation.orm.xml -->
<doctrine-mapping>
    <entity name="App\Domain\Reservation\Entity\Reservation" table="reservation">
        <id name="id" type="reservation_id"/>
    </entity>
</doctrine-mapping>
```

---

## Infection - Mutation testing

### Configuration infection.json5

```json5
{
    "$schema": "vendor/infection/infection/resources/schema.json",

    "source": {
        "directories": ["src"],
        "excludes": [
            "Kernel.php",
            "DataFixtures"
        ]
    },

    "timeout": 10,

    "logs": {
        "text": "var/infection/infection.log",
        "html": "var/infection/index.html",
        "summary": "var/infection/summary.log",
        "json": "var/infection/infection.json",
        "github": true,
        "badge": {
            "branch": "main"
        }
    },

    "tmpDir": "var/infection",

    "mutators": {
        "@default": true,

        // ✅ Mutateurs supplémentaires stricts
        "@function_signature": true,
        "@number": true,
        "@operator": true,
        "@regex": true,
        "@unwrap": true,
        "@cast": true,

        // Ignorer certains mutateurs si nécessaire
        "MethodCallRemoval": {
            "ignore": [
                // "Symfony\\Component\\HttpFoundation\\Response::setStatusCode"
            ]
        }
    },

    // ✅ Scores minimums OBLIGATOIRES
    "minMsi": 80,
    "minCoveredMsi": 90,

    // Parallélisation
    "threads": 4,

    // Bootstrap pour tests
    "bootstrap": "tests/bootstrap.php",

    // Ignorer certains fichiers
    "ignore": {
        "sourceFiles": []
    },

    // Utiliser PHPUnit
    "testFramework": "phpunit",
    "testFrameworkOptions": "--configuration=phpunit.xml.dist"
}
```

### Usage

```bash
# Mutation testing complet
make infection

# Avec filtre sur fichiers
docker-compose exec php vendor/bin/infection \
    --filter=src/Domain/Reservation/ValueObject/Money.php

# Output:
# Infection - PHP Mutation Testing Framework
#
# You are running Infection with xdebug enabled.
#
# Running mutation tests...
#
#  150/150 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% 2 mins
#
# Metrics:
#     Mutation Score Indicator (MSI): 82%
#     Mutation Code Coverage: 95%
#     Covered Code MSI: 92%
#
# Mutations:
#     Total: 150
#     Killed: 123 (82%)
#     Errors: 5 (3.3%)
#     Escaped: 15 (10%)
#     Timed Out: 7 (4.7%)
#     Not Covered: 0 (0%)
```

### Analysis des mutations

#### Mutation tuée (✅ BON)

```php
// Code original
if ($amount > 0) {
    return true;
}

// Mutation: Opérateur changé
if ($amount >= 0) {  // ✅ KILLED par le test
    return true;
}

// Test qui tue la mutation:
public function testAmountMustBeStrictlyPositive(): void
{
    self::assertTrue(Money::fromEuros(1)->isPositive());
    self::assertFalse(Money::fromEuros(0)->isPositive()); // ✅ Détecte >= au lieu de >
}
```

#### Mutation échappée (❌ MAUVAIS)

```php
// Code original
public function add(Money $other): Money
{
    return new Money($this->amount + $other->amount);
}

// Mutation: Opérateur changé
public function add(Money $other): Money
{
    return new Money($this->amount - $other->amount); // ❌ ESCAPED
}

// ❌ Pas de test vérifiant l'addition correcte!
// ✅ CORRECTION: Ajouter ce test
public function testAddTwoMoneyAmounts(): void
{
    $money1 = Money::fromEuros(100);
    $money2 = Money::fromEuros(50);

    $result = $money1->add($money2);

    self::assertEquals(150, $result->getAmountEuros());
}
```

---

## PHPCPD - Détection duplication

### Usage

```bash
# Détection duplication de code
make phpcpd

# Output:
# phpcpd 6.0.3 by Sebastian Bergmann.
#
# Found 2 clones with 45 duplicated lines in 4 files:
#
#   - src/Domain/Reservation/Service/PricingService.php:23-35
#     src/Domain/Sejour/Service/PricingService.php:28-40
#
# 0.50% duplicated lines out of 9000 total lines of code.
```

### Seuils acceptables

| Duplication | État | Action |
|-------------|------|--------|
| 0% | 🟢 EXCELLENT | Maintenir |
| < 3% | 🟡 ACCEPTABLE | Surveiller |
| 3-5% | 🟠 ATTENTION | Refactorer |
| > 5% | 🔴 BLOQUANT | Corriger immédiatement |

---

## PHPMetrics - Métriques

### Usage

```bash
# Génération des métriques
make phpmetrics

# Ouvre: var/phpmetrics/index.html
```

### Métriques suivies

| Métrique | Cible | Limite |
|----------|-------|--------|
| Complexité cyclomatique | < 5 | < 10 |
| Maintenabilité (0-100) | > 80 | > 60 |
| LOC par classe | < 150 | < 200 |
| Couplage (afferent) | < 5 | < 10 |
| Couplage (efferent) | < 5 | < 10 |

---

## Pipeline de qualité

### Makefile: make quality

```makefile
quality: phpstan cs-fixer-dry rector-dry deptrac phpcpd
	@echo "✅ All quality checks passed"

quality-fix: cs-fixer rector
	@echo "✅ Code automatically fixed"
```

### Usage

```bash
# Vérification (dry-run)
make quality

# Corrections automatiques
make quality-fix

# Pipeline complète CI
make ci
```

### Pipeline CI (.github/workflows/ci.yml)

```yaml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker
        run: make build

      - name: Start services
        run: make up

      - name: Install dependencies
        run: make composer-install

      - name: PHPStan
        run: make phpstan

      - name: CS-Fixer (dry-run)
        run: make cs-fixer-dry

      - name: Rector (dry-run)
        run: make rector-dry

      - name: Deptrac
        run: make deptrac

      - name: PHPCPD
        run: make phpcpd

  tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker
        run: make build

      - name: Start services
        run: make up

      - name: Install dependencies
        run: make composer-install

      - name: Reset database
        run: make db-reset

      - name: PHPUnit
        run: make test-coverage

      - name: Infection
        run: make infection

      - name: Behat
        run: make behat
```

---

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

### Benefits for Symfony

- Real-time detection of type errors, undefined services, and missing imports
- Navigation through Symfony container services and Doctrine entities
- DDD layer boundary awareness (Domain, Application, Infrastructure)
- API Platform resource and operation type inference

---

## Checklist de validation

### Before chaque commit

- [ ] **PHPStan:** `make phpstan` → 0 erreur
- [ ] **CS-Fixer:** `make cs-fixer-dry` → 0 violation
- [ ] **Rector:** `make rector-dry` → 0 suggestion
- [ ] **Deptrac:** `make deptrac` → 0 violation architecture
- [ ] **PHPCPD:** Duplication < 3%
- [ ] **Tests:** Coverage > 80%
- [ ] **Infection:** MSI > 80%
- [ ] **Claude Code LSP:** plugin installed

### Commands rapides

```bash
# ✅ Pipeline qualité complète
make quality

# ✅ Corrections automatiques
make quality-fix

# ✅ Tests + qualité
make ci
```

---

## Ressources

- **PHPStan:** [Documentation](https://phpstan.org/user-guide/getting-started)
- **PHP-CS-Fixer:** [Documentation](https://cs.symfony.com/)
- **Rector:** [Documentation](https://getrector.org/documentation)
- **Deptrac:** [Documentation](https://qossmic.github.io/deptrac/)
- **Infection:** [Documentation](https://infection.github.io/guide/)

---

**Date de dernière mise à jour:** 2026-01-29
**Version:** 2.0.0
**Auteur:** The Bearded CTO

## Versions Requises

| Outil | Version Minimale | Commande Installation |
|-------|-----------------|----------------------|
| PHP | 8.5.x | - |
| PHPStan | 2.2.x | `composer require --dev phpstan/phpstan:^2.2` |
| Rector | 2.4.x | `composer require --dev rector/rector:^2.4` |
| Deptrac | 4.x | `composer require --dev qossmic/deptrac-shim:^4.0` |
| PHP-CS-Fixer | 3.x | `composer require --dev friendsofphp/php-cs-fixer:^3.0` |
| Infection | 0.29.x | `composer require --dev infection/infection:^0.29` |
| PHPUnit | 11.x | `composer require --dev phpunit/phpunit:^11.0` |
