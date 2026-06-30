# Outils de Qualité de Code PHP

## Analyse Statique

### Configuration PHPStan

```neon
# phpstan.neon
includes:
    - vendor/phpstan/phpstan-strict-rules/rules.neon
    - vendor/phpstan/phpstan-deprecation-rules/rules.neon

parameters:
    phpVersion: 80400
    level: 10

    paths:
        - src
        - tests

    excludePaths:
        - src/*/Migrations/*
        - var/*
        - vendor/*

    # Paramètres stricts
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    checkTooWideReturnTypesInProtectedAndPublicMethods: true
    checkUninitializedProperties: true

    # Règles personnalisées
    ignoreErrors:
        # Autoriser mixed dans les tests
        - '#Parameter \#\d+ \$callback of function array_map expects callable#'

    reportUnmatchedIgnoredErrors: false

    # Fonctionnalités bleeding edge
    treatPhpDocTypesAsCertain: false
```

### Extensions PHPStan

```bash
# Installer les règles strictes
composer require --dev phpstan/phpstan-strict-rules

# Spécifique aux frameworks
composer require --dev phpstan/phpstan-doctrine
composer require --dev phpstan/phpstan-symfony
composer require --dev phpstan/phpstan-phpunit

# Règles de dépréciation
composer require --dev phpstan/phpstan-deprecation-rules
```

### Configuration Psalm

```xml
<!-- psalm.xml -->
<?xml version="1.0"?>
<psalm
    errorLevel="1"
    resolveFromConfigFile="true"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="https://getpsalm.org/schema/config"
    xsi:schemaLocation="https://getpsalm.org/schema/config vendor/vimeo/psalm/config.xsd"
    findUnusedBaselineEntry="true"
    findUnusedCode="true"
    cacheDirectory="var/psalm"
>
    <projectFiles>
        <directory name="src"/>
        <ignoreFiles>
            <directory name="vendor"/>
        </ignoreFiles>
    </projectFiles>

    <plugins>
        <pluginClass class="Psalm\PhpUnitPlugin\Plugin"/>
    </plugins>
</psalm>
```

### Exécution de l'Analyse Statique

```bash
# PHPStan
vendor/bin/phpstan analyse
vendor/bin/phpstan analyse --level=max
vendor/bin/phpstan analyse --generate-baseline

# Psalm
vendor/bin/psalm
vendor/bin/psalm --set-baseline=psalm-baseline.xml
vendor/bin/psalm --show-info=true
```

## Style de Code

### Configuration PHP-CS-Fixer

```php
<?php
// .php-cs-fixer.php

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

        // Mode strict
        'declare_strict_types' => true,
        'strict_comparison' => true,
        'strict_param' => true,

        // PHP moderne
        'modernize_strpos' => true,
        'get_class_to_class_keyword' => true,
        'use_arrow_functions' => true,

        // Tableaux
        'array_syntax' => ['syntax' => 'short'],
        'trailing_comma_in_multiline' => [
            'elements' => ['arrays', 'arguments', 'parameters', 'match'],
        ],
        'no_whitespace_before_comma_in_array' => true,

        // Classes
        'final_class' => true,
        'final_public_method_for_abstract_class' => true,
        'class_definition' => [
            'single_line' => true,
            'inline_constructor_arguments' => false,
        ],

        // Méthodes
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline',
            'keep_multiple_spaces_after_comma' => false,
        ],
        'function_declaration' => [
            'closure_function_spacing' => 'none',
        ],

        // PHPDoc
        'phpdoc_align' => ['align' => 'left'],
        'phpdoc_order' => true,
        'phpdoc_separation' => true,
        'phpdoc_summary' => true,
        'phpdoc_to_comment' => [
            'ignored_tags' => ['todo', 'psalm-suppress'],
        ],
        'no_superfluous_phpdoc_tags' => [
            'allow_mixed' => true,
            'remove_inheritdoc' => true,
        ],

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

        // Opérateurs
        'binary_operator_spaces' => [
            'default' => 'single_space',
        ],
        'concat_space' => ['spacing' => 'one'],
        'not_operator_with_successor_space' => true,
        'ternary_to_null_coalescing' => true,

        // Structures de contrôle
        'yoda_style' => false,
        'simplified_if_return' => true,
        'simplified_null_return' => true,
    ])
    ->setFinder($finder);
```

### Commandes

```bash
# Vérifier les violations
vendor/bin/php-cs-fixer fix --dry-run --diff

# Corriger toutes les violations
vendor/bin/php-cs-fixer fix

# Corriger un seul fichier
vendor/bin/php-cs-fixer fix src/Domain/Entity/User.php

# Afficher l'explication des règles
vendor/bin/php-cs-fixer describe @PSR12
```

## Tests d'Architecture

### PHPat (Tests d'Architecture)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Architecture;

use PHPat\Selector\Selector;
use PHPat\Test\Builder\Rule;
use PHPat\Test\PHPat;

final class ArchitectureTest
{
    public function test_domain_should_not_depend_on_infrastructure(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Infrastructure'))
            ->because('Le Domain doit être indépendant de l\'infrastructure');
    }

    public function test_domain_should_not_depend_on_application(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Application'))
            ->because('Le Domain ne doit pas connaître la couche application');
    }

    public function test_application_should_not_depend_on_infrastructure(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Application'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Infrastructure'))
            ->because('L\'Application doit dépendre d\'abstractions, pas d\'implémentations');
    }

    public function test_controllers_should_not_use_doctrine_directly(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Presentation\Controller'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('Doctrine'))
            ->because('Les contrôleurs doivent utiliser les services applicatifs, pas les repositories directement');
    }

    public function test_entities_should_be_final(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain\Entity'))
            ->shouldBeFinal()
            ->because('Les entités ne doivent pas être étendues');
    }
}
```

### Deptrac (Dépendances entre Couches)

```yaml
# deptrac.yaml
deptrac:
  paths:
    - ./src

  layers:
    - name: Domain
      collectors:
        - type: className
          regex: ^App\\Domain\\.*

    - name: Application
      collectors:
        - type: className
          regex: ^App\\Application\\.*

    - name: Infrastructure
      collectors:
        - type: className
          regex: ^App\\Infrastructure\\.*

    - name: Presentation
      collectors:
        - type: className
          regex: ^App\\Presentation\\.*

  ruleset:
    Domain: []  # Le Domain ne dépend de rien
    Application:
      - Domain
    Infrastructure:
      - Domain
      - Application
    Presentation:
      - Application
      - Domain
```

```bash
# Exécuter deptrac
vendor/bin/deptrac analyse
```

## Métriques de Code

### PHP Insights

```php
<?php
// phpinsights.php

declare(strict_types=1);

return [
    'preset' => 'default',
    'ide' => 'phpstorm',
    'exclude' => [
        'var',
        'vendor',
        'tests',
    ],
    'add' => [],
    'remove' => [],
    'config' => [
        \NunoMaduro\PhpInsights\Domain\Insights\ForbiddenDefineFunctions::class => [
            'ignore' => ['src/Kernel.php'],
        ],
        \PHP_CodeSniffer\Standards\Generic\Sniffs\Files\LineLengthSniff::class => [
            'lineLimit' => 120,
            'absoluteLineLimit' => 160,
        ],
        \SlevomatCodingStandard\Sniffs\Functions\FunctionLengthSniff::class => [
            'maxLinesLength' => 50,
        ],
    ],
    'requirements' => [
        'min-quality' => 80,
        'min-complexity' => 80,
        'min-architecture' => 80,
        'min-style' => 80,
    ],
];
```

```bash
# Exécuter insights
vendor/bin/phpinsights

# Avec correction
vendor/bin/phpinsights --fix
```

### PHPMD (Mess Detector)

```xml
<!-- phpmd.xml -->
<?xml version="1.0"?>
<ruleset name="Project Rules"
         xmlns="http://pmd.sf.net/ruleset/1.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://pmd.sf.net/ruleset/1.0.0
                             http://pmd.sf.net/ruleset_xml_schema.xsd"
         xsi:noNamespaceSchemaLocation="http://pmd.sf.net/ruleset_xml_schema.xsd">

    <description>Règles de codage du projet</description>

    <rule ref="rulesets/cleancode.xml">
        <exclude name="StaticAccess"/>
    </rule>
    <rule ref="rulesets/codesize.xml">
        <exclude name="ExcessivePublicCount"/>
    </rule>
    <rule ref="rulesets/controversial.xml"/>
    <rule ref="rulesets/design.xml"/>
    <rule ref="rulesets/naming.xml">
        <exclude name="ShortVariable"/>
    </rule>
    <rule ref="rulesets/unusedcode.xml"/>

    <!-- Seuils personnalisés -->
    <rule ref="rulesets/codesize.xml/CyclomaticComplexity">
        <properties>
            <property name="reportLevel" value="10"/>
        </properties>
    </rule>
    <rule ref="rulesets/codesize.xml/NPathComplexity">
        <properties>
            <property name="minimum" value="200"/>
        </properties>
    </rule>
</ruleset>
```

```bash
# Exécuter PHPMD
vendor/bin/phpmd src text phpmd.xml
```

## Intégration CI/CD

### GitHub Actions

```yaml
# .github/workflows/quality.yml
name: Qualité du Code

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.5'
          coverage: xdebug

      - name: Installer les dépendances
        run: composer install --prefer-dist --no-progress

      - name: Vérifier le style de code
        run: vendor/bin/php-cs-fixer fix --dry-run --diff

      - name: Exécuter PHPStan
        run: vendor/bin/phpstan analyse

      - name: Exécuter Psalm
        run: vendor/bin/psalm --no-progress

      - name: Exécuter les tests avec couverture
        run: vendor/bin/phpunit --coverage-clover coverage.xml

      - name: Vérifier le seuil de couverture
        run: |
          COVERAGE=$(php -r "echo round(simplexml_load_file('coverage.xml')->project->metrics['coveredstatements'] / simplexml_load_file('coverage.xml')->project->metrics['statements'] * 100);")
          echo "Couverture: $COVERAGE%"
          if [ "$COVERAGE" -lt 80 ]; then
            echo "La couverture est inférieure à 80%"
            exit 1
          fi

      - name: Uploader la couverture
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - quality
  - test

variables:
  COMPOSER_CACHE_DIR: "$CI_PROJECT_DIR/.composer-cache"

cache:
  paths:
    - .composer-cache/

code-style:
  stage: quality
  image: php:8.5-cli
  script:
    - composer install --prefer-dist --no-progress
    - vendor/bin/php-cs-fixer fix --dry-run --diff

static-analysis:
  stage: quality
  image: php:8.5-cli
  script:
    - composer install --prefer-dist --no-progress
    - vendor/bin/phpstan analyse
    - vendor/bin/psalm --no-progress

tests:
  stage: test
  image: php:8.5-cli
  script:
    - composer install --prefer-dist --no-progress
    - vendor/bin/phpunit --coverage-text
  coverage: '/^\s*Lines:\s*\d+.\d+\%/'
```

## Portes de Qualité

### Seuils Minimums

| Métrique | Objectif | Minimum |
|----------|----------|---------|
| Niveau PHPStan | 10 | 9 |
| Couverture de Code | 85% | 80% |
| Complexité Cyclomatique | < 10 | < 15 |
| Longueur de Méthode | < 30 lignes | < 50 lignes |
| Longueur de Classe | < 200 lignes | < 300 lignes |
| Qualité PHP Insights | 90 | 80 |

### Checklist de Qualité

- [ ] PHPStan passe au niveau 10
- [ ] Pas de violations PHP-CS-Fixer
- [ ] Couverture de code > 80%
- [ ] Pas de problèmes critiques Psalm
- [ ] Tests d'architecture passent (PHPat/Deptrac)
- [ ] Règles PHPMD passent
- [ ] Pas de vulnérabilités de sécurité (composer audit)
- [ ] Dépendances à jour
