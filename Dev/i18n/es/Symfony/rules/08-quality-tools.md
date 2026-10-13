# Herramientas de Calidad - Atoll Tourisme

## Descripción general

El uso de herramientas de calidad es **OBLIGATORIO** para garantizar un código mantenible, seguro y eficiente.

**Objetivos:**
- ✅ PHPStan nivel máximo (cero errores tolerados)
- ✅ PHP-CS-Fixer automático
- ✅ Rector para modernización del código
- ✅ Deptrac para validación de arquitectura
- ✅ Infection para mutation testing

> **Referencias:**
> - `03-coding-standards.md` - Estándares de código
> - `07-testing-tdd-bdd.md` - Tests y cobertura
> - `02-architecture-clean-ddd.md` - Arquitectura validada

---

## Tabla de contenidos

1. [PHPStan - Análisis estático](#phpstan---análisis-estático)
2. [PHP-CS-Fixer - Code style](#php-cs-fixer---code-style)
3. [Rector - Refactoring automático](#rector---refactoring-automático)
4. [Deptrac - Architecture boundaries](#deptrac---architecture-boundaries)
5. [Infection - Mutation testing](#infection---mutation-testing)
6. [PHPCPD - Detección de duplicación](#phpcpd---detección-de-duplicación)
7. [PHPMetrics - Métricas](#phpmetrics---métricas)
8. [Pipeline de calidad](#pipeline-de-calidad)

---

## PHPStan - Análisis estático

### Configuración phpstan.neon

```neon
# phpstan.neon - Configuración estricta para Atoll Tourisme

parameters:
    # ✅ OBLIGATORIO: Nivel máximo
    level: max

    paths:
        - src
        - tests

    # Exclusiones justificadas
    excludePaths:
        - src/Kernel.php
        - tests/bootstrap.php

    # ✅ Checks adicionales estrictos
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

    # ✅ Reglas Doctrine estrictas
    doctrine:
        repositoryClass: App\Infrastructure\Persistence\Doctrine\Repository\DoctrineReservationRepository
        objectManagerLoader: tests/object-manager.php

    # ✅ Reglas Symfony estrictas
    symfony:
        containerXmlPath: var/cache/dev/App_KernelDevDebugContainer.xml
        consoleApplicationLoader: tests/console-application.php

    # Baseline para migración progresiva (a eliminar)
    # includes:
    #     - phpstan-baseline.neon

    # ✅ Extensiones obligatorias
    # (instaladas via composer)
    # - phpstan/phpstan-doctrine
    # - phpstan/phpstan-symfony
    # - phpstan/phpstan-phpunit
    # - phpstan/phpstan-strict-rules
    # - phpstan/phpstan-deprecation-rules

    # Ignorar ciertos patterns temporalmente
    ignoreErrors:
        # Ejemplo: errores legacy (a corregir progresivamente)
        # - '#Call to an undefined method.*Repository::findCustom#'

    # Reportar errores no coincidentes (detecta baseline obsoleto)
    reportUnmatchedIgnoredErrors: true

    # Paralelización
    parallel:
        jobSize: 20
        maximumNumberOfProcesses: 4
        minimumNumberOfJobsPerProcess: 2
```

### Extensiones PHPStan obligatorias

```bash
# Instalación via Composer
make composer-require-dev PKG="phpstan/phpstan"
make composer-require-dev PKG="phpstan/extension-installer"
make composer-require-dev PKG="phpstan/phpstan-doctrine"
make composer-require-dev PKG="phpstan/phpstan-symfony"
make composer-require-dev PKG="phpstan/phpstan-phpunit"
make composer-require-dev PKG="phpstan/phpstan-strict-rules"
make composer-require-dev PKG="phpstan/phpstan-deprecation-rules"
```

### Uso

```bash
# Análisis completo
make phpstan

# Generación baseline (ÚNICAMENTE para migración)
make phpstan-baseline

# ⚠️ El baseline debe eliminarse progresivamente
# Objetivo: 0 errores sin baseline
```

### Ejemplos de errores detectados

#### ❌ Tipo mixto no documentado

```php
<?php

class ReservationService
{
    // ❌ PHPStan error: Missing return type
    public function calculate($reservation)
    {
        return $reservation->getTotal();
    }
}
```

#### ✅ Corrección: Tipos explícitos

```php
<?php

final readonly class ReservationService
{
    // ✅ Tipos explícitos
    public function calculate(Reservation $reservation): Money
    {
        return $reservation->getTotal();
    }
}
```

#### ❌ Property no inicializada

```php
<?php

class Reservation
{
    // ❌ PHPStan error: Property not initialized
    private Money $montantTotal;

    public function __construct()
    {
        // Olvido de inicialización
    }
}
```

#### ✅ Corrección: Inicialización obligatoria

```php
<?php

final class Reservation
{
    // ✅ Inicializado en el constructor
    private Money $montantTotal;

    public function __construct(Money $montantTotal)
    {
        $this->montantTotal = $montantTotal;
    }
}

// O con readonly property (PHP 8.2+)
final readonly class Reservation
{
    // ✅ readonly fuerza la inicialización
    public function __construct(
        private Money $montantTotal,
    ) {}
}
```

### Métricas PHPStan

| Estado | Errores | Acción |
|------|---------|--------|
| 🔴 BLOQUEANTE | > 0 | Corregir inmediatamente |
| 🟢 OK | 0 | Mantener |

**Regla de oro: CERO errores PHPStan nivel máximo**

---

## PHP-CS-Fixer - Code style

### Configuración .php-cs-fixer.dist.php

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
        '@PER-CS3x0' => true,

        // ✅ Reglas estrictas adicionales
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

        // ✅ Type hints estrictos
        'fully_qualified_strict_types' => true,

        // ✅ Trailing comma en arrays multilínea
        'trailing_comma_in_multiline' => [
            'elements' => ['arrays', 'arguments', 'parameters'],
        ],

        // ✅ Visibilidad obligatoria
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

### Uso

```bash
# Dry-run (verificación sin modificación)
make cs-fixer-dry

# Aplicación de correcciones
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

### Ejemplos de correcciones automáticas

#### Antes de PHP-CS-Fixer

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

#### Después de PHP-CS-Fixer

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

## Rector - Refactoring automático

### Configuración rector.php

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

### Uso

```bash
# Dry-run (vista previa de cambios)
make rector-dry

# Aplicación de modificaciones
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

### Ejemplos de refactoring Rector

#### Antes de Rector

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
        // ❌ No hay tipo de retorno explícito
        return $this->repository->find($id);
    }
}
```

#### Después de Rector

```php
<?php

final readonly class ReservationService
{
    // ✅ Constructor injection
    public function __construct(
        private ReservationRepository $repository,
    ) {}

    // ✅ Tipo de retorno explícito
    public function find(string $id): ?Reservation
    {
        return $this->repository->find($id);
    }
}
```

---

## Deptrac - Architecture boundaries

### Configuración deptrac.yaml

```yaml
# deptrac.yaml - Validación arquitectura DDD

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
        # ✅ Domain no depende de NADA
        Domain: []

        # ✅ Application depende únicamente de Domain
        Application:
            - Domain

        # ✅ Infrastructure depende de Domain y Application
        Infrastructure:
            - Domain
            - Application

        # ✅ Presentation depende de Application, Infrastructure y Domain
        Presentation:
            - Application
            - Infrastructure
            - Domain

    # Formateadores para los reportes
    formatters:
        graphviz:
            hidden_layers: []
            groups: []
            pointToGroups: false

    # Analizar vendors si es necesario
    analyser:
        types:
            - class
            - class_superglobal
            - function
            - function_superglobal
```

### Uso

```bash
# Validación de arquitectura
make deptrac

# Output esperado (éxito):
# ✅ Domain layer: 0 violations
# ✅ Application layer: 0 violations
# ✅ Infrastructure layer: 0 violations
# ✅ Presentation layer: 0 violations
#
# All rules validated successfully!

# Output (violación detectada):
# ❌ Domain layer: 1 violation
#
# src/Domain/Reservation/Entity/Reservation.php:5
# Domain must not depend on Infrastructure
# Doctrine\ORM\Mapping\Entity
```

### Ejemplos de violaciones

#### ❌ VIOLACIÓN: Domain depende de Doctrine

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM; // ❌ VIOLACIÓN

#[ORM\Entity]
class Reservation
{
    // ...
}
```

#### ✅ CORRECCIÓN: Mapping XML separado (Infrastructure)

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ Sin dependencia de Doctrine
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

### Configuración infection.json5

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

        // ✅ Mutadores adicionales estrictos
        "@function_signature": true,
        "@number": true,
        "@operator": true,
        "@regex": true,
        "@unwrap": true,
        "@cast": true,

        // Ignorar ciertos mutadores si es necesario
        "MethodCallRemoval": {
            "ignore": [
                // "Symfony\\Component\\HttpFoundation\\Response::setStatusCode"
            ]
        }
    },

    // ✅ Puntajes mínimos OBLIGATORIOS
    "minMsi": 80,
    "minCoveredMsi": 90,

    // Paralelización
    "threads": 4,

    // Bootstrap para tests
    "bootstrap": "tests/bootstrap.php",

    // Ignorar ciertos archivos
    "ignore": {
        "sourceFiles": []
    },

    // Usar PHPUnit
    "testFramework": "phpunit",
    "testFrameworkOptions": "--configuration=phpunit.xml.dist"
}
```

### Uso

```bash
# Mutation testing completo
make infection

# Con filtro en archivos
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

### Análisis de mutaciones

#### Mutación eliminada (✅ BUENO)

```php
// Código original
if ($amount > 0) {
    return true;
}

// Mutación: Operador cambiado
if ($amount >= 0) {  // ✅ KILLED por el test
    return true;
}

// Test que elimina la mutación:
public function testAmountMustBeStrictlyPositive(): void
{
    self::assertTrue(Money::fromEuros(1)->isPositive());
    self::assertFalse(Money::fromEuros(0)->isPositive()); // ✅ Detecta >= en lugar de >
}
```

#### Mutación escapada (❌ MALO)

```php
// Código original
public function add(Money $other): Money
{
    return new Money($this->amount + $other->amount);
}

// Mutación: Operador cambiado
public function add(Money $other): Money
{
    return new Money($this->amount - $other->amount); // ❌ ESCAPED
}

// ❌ No hay test verificando la suma correcta!
// ✅ CORRECCIÓN: Agregar este test
public function testAddTwoMoneyAmounts(): void
{
    $money1 = Money::fromEuros(100);
    $money2 = Money::fromEuros(50);

    $result = $money1->add($money2);

    self::assertEquals(150, $result->getAmountEuros());
}
```

---

## PHPCPD - Detección de duplicación

### Uso

```bash
# Detección de duplicación de código
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

### Umbrales aceptables

| Duplicación | Estado | Acción |
|-------------|------|--------|
| 0% | 🟢 EXCELENTE | Mantener |
| < 3% | 🟡 ACEPTABLE | Vigilar |
| 3-5% | 🟠 ATENCIÓN | Refactorizar |
| > 5% | 🔴 BLOQUEANTE | Corregir inmediatamente |

---

## PHPMetrics - Métricas

### Uso

```bash
# Generación de métricas
make phpmetrics

# Abre: var/phpmetrics/index.html
```

### Métricas rastreadas

| Métrica | Objetivo | Límite |
|----------|-------|--------|
| Complejidad ciclomática | < 5 | < 10 |
| Mantenibilidad (0-100) | > 80 | > 60 |
| LOC por clase | < 150 | < 200 |
| Acoplamiento (aferente) | < 5 | < 10 |
| Acoplamiento (eferente) | < 5 | < 10 |

---

## Pipeline de calidad

### Makefile: make quality

```makefile
quality: phpstan cs-fixer-dry rector-dry deptrac phpcpd
	@echo "✅ All quality checks passed"

quality-fix: cs-fixer rector
	@echo "✅ Code automatically fixed"
```

### Uso

```bash
# Verificación (dry-run)
make quality

# Correcciones automáticas
make quality-fix

# Pipeline completo CI
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

## Checklist de validación

### Antes de cada commit

- [ ] **PHPStan:** `make phpstan` → 0 errores
- [ ] **CS-Fixer:** `make cs-fixer-dry` → 0 violaciones
- [ ] **Rector:** `make rector-dry` → 0 sugerencias
- [ ] **Deptrac:** `make deptrac` → 0 violaciones de arquitectura
- [ ] **PHPCPD:** Duplicación < 3%
- [ ] **Tests:** Cobertura > 80%
- [ ] **Infection:** MSI > 80%

### Comandos rápidos

```bash
# ✅ Pipeline completo de calidad
make quality

# ✅ Correcciones automáticas
make quality-fix

# ✅ Tests + calidad
make ci
```

---

## Recursos

- **PHPStan:** [Documentación](https://phpstan.org/user-guide/getting-started)
- **PHP-CS-Fixer:** [Documentación](https://cs.symfony.com/)
- **Rector:** [Documentación](https://getrector.org/documentation)
- **Deptrac:** [Documentación](https://qossmic.github.io/deptrac/)
- **Infection:** [Documentación](https://infection.github.io/guide/)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
