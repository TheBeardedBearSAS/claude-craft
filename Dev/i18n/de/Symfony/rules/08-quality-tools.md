# Qualitätswerkzeuge - Atoll Tourisme

## Überblick

Die Verwendung von Qualitätswerkzeugen ist **OBLIGATORISCH**, um wartbaren, sicheren und performanten Code zu gewährleisten.

**Ziele:**
- ✅ PHPStan Level max (keine Fehler toleriert)
- ✅ PHP-CS-Fixer automatisch
- ✅ Rector für Code-Modernisierung
- ✅ Deptrac zur Architekturvalidierung
- ✅ Infection für Mutation Testing

> **Referenzen:**
> - `03-coding-standards.md` - Code-Standards
> - `07-testing-tdd-bdd.md` - Tests und Coverage
> - `02-architecture-clean-ddd.md` - Validierte Architektur

---

## Inhaltsverzeichnis

1. [PHPStan - Statische Analyse](#phpstan---statische-analyse)
2. [PHP-CS-Fixer - Code-Style](#php-cs-fixer---code-style)
3. [Rector - Automatisches Refactoring](#rector---automatisches-refactoring)
4. [Deptrac - Architektur-Boundaries](#deptrac---architektur-boundaries)
5. [Infection - Mutation Testing](#infection---mutation-testing)
6. [PHPCPD - Duplikaterkennung](#phpcpd---duplikaterkennung)
7. [PHPMetrics - Metriken](#phpmetrics---metriken)
8. [Qualitäts-Pipeline](#qualitäts-pipeline)

---

## PHPStan - Statische Analyse

### Konfiguration phpstan.neon

```neon
# phpstan.neon - Strenge Konfiguration für Atoll Tourisme

parameters:
    # ✅ OBLIGATORISCH: Maximales Level
    level: max

    paths:
        - src
        - tests

    # Begründete Ausschlüsse
    excludePaths:
        - src/Kernel.php
        - tests/bootstrap.php

    # ✅ Zusätzliche strenge Checks
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

    # ✅ Strenge Doctrine-Regeln
    doctrine:
        repositoryClass: App\Infrastructure\Persistence\Doctrine\Repository\DoctrineReservationRepository
        objectManagerLoader: tests/object-manager.php

    # ✅ Strenge Symfony-Regeln
    symfony:
        containerXmlPath: var/cache/dev/App_KernelDevDebugContainer.xml
        consoleApplicationLoader: tests/console-application.php

    # Baseline für schrittweise Migration (zu eliminieren)
    # includes:
    #     - phpstan-baseline.neon

    # ✅ Obligatorische Extensions
    # (installiert via composer)
    # - phpstan/phpstan-doctrine
    # - phpstan/phpstan-symfony
    # - phpstan/phpstan-phpunit
    # - phpstan/phpstan-strict-rules
    # - phpstan/phpstan-deprecation-rules

    # Bestimmte Patterns temporär ignorieren
    ignoreErrors:
        # Beispiel: Legacy-Fehler (schrittweise beheben)
        # - '#Call to an undefined method.*Repository::findCustom#'

    # Nicht übereinstimmende Fehler melden (erkennt veraltete Baseline)
    reportUnmatchedIgnoredErrors: true

    # Parallelisierung
    parallel:
        jobSize: 20
        maximumNumberOfProcesses: 4
        minimumNumberOfJobsPerProcess: 2
```

### Obligatorische PHPStan-Extensions

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

### Verwendung

```bash
# Vollständige Analyse
make phpstan

# Baseline generieren (NUR für Migration)
make phpstan-baseline

# ⚠️ Die Baseline muss schrittweise eliminiert werden
# Ziel: 0 Fehler ohne Baseline
```

### Beispiele erkannter Fehler

#### ❌ Undokumentierter gemischter Typ

```php
<?php

class ReservationService
{
    // ❌ PHPStan-Fehler: Fehlender Rückgabetyp
    public function calculate($reservation)
    {
        return $reservation->getTotal();
    }
}
```

#### ✅ Korrektur: Explizite Typen

```php
<?php

final readonly class ReservationService
{
    // ✅ Explizite Typen
    public function calculate(Reservation $reservation): Money
    {
        return $reservation->getTotal();
    }
}
```

#### ❌ Nicht initialisierte Property

```php
<?php

class Reservation
{
    // ❌ PHPStan-Fehler: Property nicht initialisiert
    private Money $montantTotal;

    public function __construct()
    {
        // Vergessene Initialisierung
    }
}
```

#### ✅ Korrektur: Obligatorische Initialisierung

```php
<?php

final class Reservation
{
    // ✅ Im Konstruktor initialisiert
    private Money $montantTotal;

    public function __construct(Money $montantTotal)
    {
        $this->montantTotal = $montantTotal;
    }
}

// Oder mit readonly Property (PHP 8.2+)
final readonly class Reservation
{
    // ✅ readonly erzwingt Initialisierung
    public function __construct(
        private Money $montantTotal,
    ) {}
}
```

### PHPStan-Metriken

| Status | Fehler | Aktion |
|--------|--------|--------|
| 🔴 BLOCKIEREND | > 0 | Sofort korrigieren |
| 🟢 OK | 0 | Beibehalten |

**Goldene Regel: NULL Fehler PHPStan Level max**

---

## PHP-CS-Fixer - Code-Style

### Konfiguration .php-cs-fixer.dist.php

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

        // ✅ Zusätzliche strenge Regeln
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

        // ✅ Void-Rückgabetyp
        'void_return' => true,

        // ✅ Strenge Type-Hints
        'fully_qualified_strict_types' => true,

        // ✅ Trailing Comma in mehrzeiligen Arrays
        'trailing_comma_in_multiline' => [
            'elements' => ['arrays', 'arguments', 'parameters'],
        ],

        // ✅ Obligatorische Sichtbarkeit
        'visibility_required' => [
            'elements' => ['const', 'method', 'property'],
        ],

        // ✅ Readonly Properties (PHP 8.1+)
        'readonly_property' => true,
    ])
    ->setFinder($finder)
    ->setRiskyAllowed(true)
    ->setUsingCache(true)
    ->setCacheFile(__DIR__ . '/var/.php-cs-fixer.cache');
```

### Verwendung

```bash
# Dry-run (Überprüfung ohne Änderung)
make cs-fixer-dry

# Korrekturen anwenden
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

### Beispiele automatischer Korrekturen

#### Vor PHP-CS-Fixer

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

#### Nach PHP-CS-Fixer

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

## Rector - Automatisches Refactoring

### Konfiguration rector.php

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
    ->withPhpSets(php82: true)
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
        // ✅ Symfony 6.4
        SymfonyLevelSetList::UP_TO_SYMFONY_64,
        SymfonySetList::SYMFONY_CODE_QUALITY,
        SymfonySetList::SYMFONY_CONSTRUCTOR_INJECTION,

        // ✅ Doctrine 2.17
        DoctrineSetList::DOCTRINE_CODE_QUALITY,
        DoctrineSetList::DOCTRINE_ORM_214,

        // ✅ PHPUnit 10
        PHPUnitSetList::PHPUNIT_100,
        PHPUnitSetList::PHPUNIT_CODE_QUALITY,

        // ✅ PHP 8.2
        LevelSetList::UP_TO_PHP_82,
        SetList::PHP_82,
    ])
    ->withImportNames(
        importNames: true,
        importDocBlockNames: true,
        importShortClasses: false,
        removeUnusedImports: true,
    );
```

### Verwendung

```bash
# Dry-run (Vorschau der Änderungen)
make rector-dry

# Änderungen anwenden
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

### Beispiele für Rector-Refactoring

#### Vor Rector

```php
<?php

class ReservationService
{
    private ReservationRepository $repository;

    // ❌ Setter Injection
    public function setRepository(ReservationRepository $repository): void
    {
        $this->repository = $repository;
    }

    public function find(string $id): ?Reservation
    {
        // ❌ Kein expliziter Rückgabetyp
        return $this->repository->find($id);
    }
}
```

#### Nach Rector

```php
<?php

final readonly class ReservationService
{
    // ✅ Constructor Injection
    public function __construct(
        private ReservationRepository $repository,
    ) {}

    // ✅ Expliziter Rückgabetyp
    public function find(string $id): ?Reservation
    {
        return $this->repository->find($id);
    }
}
```

---

## Deptrac - Architektur-Boundaries

### Konfiguration deptrac.yaml

```yaml
# deptrac.yaml - DDD-Architekturvalidierung

deptrac:
    paths:
        - ./src

    exclude_files:
        - '#.*test.*#'

    layers:
        - name: Domain
          collectors:
              - type: directory
                value: src/Domain/.*

        - name: Application
          collectors:
              - type: directory
                value: src/Application/.*

        - name: Infrastructure
          collectors:
              - type: directory
                value: src/Infrastructure/.*

        - name: Presentation
          collectors:
              - type: directory
                value: src/Presentation/.*

    ruleset:
        # ✅ Domain hängt von NICHTS ab
        Domain: []

        # ✅ Application hängt nur von Domain ab
        Application:
            - Domain

        # ✅ Infrastructure hängt von Domain und Application ab
        Infrastructure:
            - Domain
            - Application

        # ✅ Presentation hängt von Application, Infrastructure und Domain ab
        Presentation:
            - Application
            - Infrastructure
            - Domain

    # Formatter für Berichte
    formatters:
        graphviz:
            hidden_layers: []
            groups: []
            pointToGroups: false

    # Vendor analysieren falls nötig
    analyser:
        types:
            - class
            - class_superglobal
            - function
            - function_superglobal
```

### Verwendung

```bash
# Architektur validieren
make deptrac

# Erwartete Ausgabe (Erfolg):
# ✅ Domain layer: 0 violations
# ✅ Application layer: 0 violations
# ✅ Infrastructure layer: 0 violations
# ✅ Presentation layer: 0 violations
#
# All rules validated successfully!

# Ausgabe (erkannte Verletzung):
# ❌ Domain layer: 1 violation
#
# src/Domain/Reservation/Entity/Reservation.php:5
# Domain must not depend on Infrastructure
# Doctrine\ORM\Mapping\Entity
```

### Beispiele für Verletzungen

#### ❌ VERLETZUNG: Domain hängt von Doctrine ab

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM; // ❌ VERLETZUNG

#[ORM\Entity]
class Reservation
{
    // ...
}
```

#### ✅ KORREKTUR: Separates XML-Mapping (Infrastructure)

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ Keine Doctrine-Abhängigkeit
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

## Infection - Mutation Testing

### Konfiguration infection.json5

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

        // ✅ Zusätzliche strenge Mutatoren
        "@function_signature": true,
        "@number": true,
        "@operator": true,
        "@regex": true,
        "@unwrap": true,
        "@cast": true,

        // Bestimmte Mutatoren ignorieren falls nötig
        "MethodCallRemoval": {
            "ignore": [
                // "Symfony\\Component\\HttpFoundation\\Response::setStatusCode"
            ]
        }
    },

    // ✅ OBLIGATORISCHE Mindestscores
    "minMsi": 80,
    "minCoveredMsi": 90,

    // Parallelisierung
    "threads": 4,

    // Bootstrap für Tests
    "bootstrap": "tests/bootstrap.php",

    // Bestimmte Dateien ignorieren
    "ignore": {
        "sourceFiles": []
    },

    // PHPUnit verwenden
    "testFramework": "phpunit",
    "testFrameworkOptions": "--configuration=phpunit.xml.dist"
}
```

### Verwendung

```bash
# Vollständiges Mutation Testing
make infection

# Mit Filter auf Dateien
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

### Mutation-Analyse

#### Getötete Mutation (✅ GUT)

```php
// Original-Code
if ($amount > 0) {
    return true;
}

// Mutation: Operator geändert
if ($amount >= 0) {  // ✅ KILLED durch Test
    return true;
}

// Test, der die Mutation tötet:
public function testAmountMustBeStrictlyPositive(): void
{
    self::assertTrue(Money::fromEuros(1)->isPositive());
    self::assertFalse(Money::fromEuros(0)->isPositive()); // ✅ Erkennt >= statt >
}
```

#### Entwichene Mutation (❌ SCHLECHT)

```php
// Original-Code
public function add(Money $other): Money
{
    return new Money($this->amount + $other->amount);
}

// Mutation: Operator geändert
public function add(Money $other): Money
{
    return new Money($this->amount - $other->amount); // ❌ ESCAPED
}

// ❌ Kein Test, der korrekte Addition überprüft!
// ✅ KORREKTUR: Diesen Test hinzufügen
public function testAddTwoMoneyAmounts(): void
{
    $money1 = Money::fromEuros(100);
    $money2 = Money::fromEuros(50);

    $result = $money1->add($money2);

    self::assertEquals(150, $result->getAmountEuros());
}
```

---

## PHPCPD - Duplikaterkennung

### Verwendung

```bash
# Code-Duplikate erkennen
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

### Akzeptable Schwellenwerte

| Duplikation | Status | Aktion |
|-------------|--------|--------|
| 0% | 🟢 EXZELLENT | Beibehalten |
| < 3% | 🟡 AKZEPTABEL | Überwachen |
| 3-5% | 🟠 ACHTUNG | Refactoren |
| > 5% | 🔴 BLOCKIEREND | Sofort korrigieren |

---

## PHPMetrics - Metriken

### Verwendung

```bash
# Metriken generieren
make phpmetrics

# Öffnet: var/phpmetrics/index.html
```

### Verfolgte Metriken

| Metrik | Ziel | Limit |
|--------|------|-------|
| Zyklomatische Komplexität | < 5 | < 10 |
| Wartbarkeit (0-100) | > 80 | > 60 |
| LOC pro Klasse | < 150 | < 200 |
| Kopplung (afferent) | < 5 | < 10 |
| Kopplung (efferent) | < 5 | < 10 |

---

## Qualitäts-Pipeline

### Makefile: make quality

```makefile
quality: phpstan cs-fixer-dry rector-dry deptrac phpcpd
	@echo "✅ All quality checks passed"

quality-fix: cs-fixer rector
	@echo "✅ Code automatically fixed"
```

### Verwendung

```bash
# Überprüfung (Dry-run)
make quality

# Automatische Korrekturen
make quality-fix

# Vollständige CI-Pipeline
make ci
```

### CI-Pipeline (.github/workflows/ci.yml)

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

## Validierungs-Checklist

### Vor jedem Commit

- [ ] **PHPStan:** `make phpstan` → 0 Fehler
- [ ] **CS-Fixer:** `make cs-fixer-dry` → 0 Verletzungen
- [ ] **Rector:** `make rector-dry` → 0 Vorschläge
- [ ] **Deptrac:** `make deptrac` → 0 Architektur-Verletzungen
- [ ] **PHPCPD:** Duplikation < 3%
- [ ] **Tests:** Coverage > 80%
- [ ] **Infection:** MSI > 80%

### Schnelle Befehle

```bash
# ✅ Vollständige Qualitäts-Pipeline
make quality

# ✅ Automatische Korrekturen
make quality-fix

# ✅ Tests + Qualität
make ci
```

---

## Ressourcen

- **PHPStan:** [Dokumentation](https://phpstan.org/user-guide/getting-started)
- **PHP-CS-Fixer:** [Dokumentation](https://cs.symfony.com/)
- **Rector:** [Dokumentation](https://getrector.org/documentation)
- **Deptrac:** [Dokumentation](https://qossmic.github.io/deptrac/)
- **Infection:** [Dokumentation](https://infection.github.io/guide/)

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
