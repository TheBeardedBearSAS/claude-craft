# PHP Code Quality Tools

## Static Analysis

### PHPStan Configuration

```neon
# phpstan.neon
includes:
    - vendor/phpstan/phpstan-strict-rules/rules.neon
    - vendor/phpstan/phpstan-deprecation-rules/rules.neon

parameters:
    phpVersion: 80400
    level: 9

    paths:
        - src
        - tests

    excludePaths:
        - src/*/Migrations/*
        - var/*
        - vendor/*

    # Strict settings
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    checkTooWideReturnTypesInProtectedAndPublicMethods: true
    checkUninitializedProperties: true

    # Custom rules
    ignoreErrors:
        # Allow mixed in tests
        - '#Parameter \#\d+ \$callback of function array_map expects callable#'

    reportUnmatchedIgnoredErrors: false

    # Bleeding edge features
    treatPhpDocTypesAsCertain: false
```

### PHPStan Extensions

```bash
# Install strict rules
composer require --dev phpstan/phpstan-strict-rules

# Framework-specific
composer require --dev phpstan/phpstan-doctrine
composer require --dev phpstan/phpstan-symfony
composer require --dev phpstan/phpstan-phpunit

# Deprecation rules
composer require --dev phpstan/phpstan-deprecation-rules
```

### Psalm Configuration

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

### Running Static Analysis

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

## Code Style

### PHP-CS-Fixer Configuration

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
        '@PHP84Migration' => true,
        '@Symfony' => true,
        '@Symfony:risky' => true,

        // Strict mode
        'declare_strict_types' => true,
        'strict_comparison' => true,
        'strict_param' => true,

        // Modern PHP
        'modernize_strpos' => true,
        'get_class_to_class_keyword' => true,
        'use_arrow_functions' => true,

        // Arrays
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

        // Methods
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

        // Operators
        'binary_operator_spaces' => [
            'default' => 'single_space',
        ],
        'concat_space' => ['spacing' => 'one'],
        'not_operator_with_successor_space' => true,
        'ternary_to_null_coalescing' => true,

        // Control structures
        'yoda_style' => false,
        'simplified_if_return' => true,
        'simplified_null_return' => true,
    ])
    ->setFinder($finder);
```

### Commands

```bash
# Check violations
vendor/bin/php-cs-fixer fix --dry-run --diff

# Fix all violations
vendor/bin/php-cs-fixer fix

# Fix single file
vendor/bin/php-cs-fixer fix src/Domain/Entity/User.php

# Show rules explanation
vendor/bin/php-cs-fixer describe @PSR12
```

## Architecture Testing

### PHPat (Architecture Testing)

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
            ->because('Domain should be independent of infrastructure');
    }

    public function test_domain_should_not_depend_on_application(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Application'))
            ->because('Domain should not know about application layer');
    }

    public function test_application_should_not_depend_on_infrastructure(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Application'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Infrastructure'))
            ->because('Application should depend on abstractions, not implementations');
    }

    public function test_controllers_should_not_use_doctrine_directly(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Presentation\Controller'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('Doctrine'))
            ->because('Controllers should use application services, not repositories directly');
    }

    public function test_entities_should_be_final(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain\Entity'))
            ->shouldBeFinal()
            ->because('Entities should not be extended');
    }
}
```

### Deptrac (Layer Dependencies)

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
    Domain: []  # Domain depends on nothing
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
# Run deptrac
vendor/bin/deptrac analyse
```

## Code Metrics

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
# Run insights
vendor/bin/phpinsights

# With fix
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

    <description>Project coding rules</description>

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

    <!-- Custom thresholds -->
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
# Run PHPMD
vendor/bin/phpmd src text phpmd.xml
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          coverage: xdebug

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress

      - name: Check code style
        run: vendor/bin/php-cs-fixer fix --dry-run --diff

      - name: Run PHPStan
        run: vendor/bin/phpstan analyse

      - name: Run Psalm
        run: vendor/bin/psalm --no-progress

      - name: Run tests with coverage
        run: vendor/bin/phpunit --coverage-clover coverage.xml

      - name: Check coverage threshold
        run: |
          COVERAGE=$(php -r "echo round(simplexml_load_file('coverage.xml')->project->metrics['coveredstatements'] / simplexml_load_file('coverage.xml')->project->metrics['statements'] * 100);")
          echo "Coverage: $COVERAGE%"
          if [ "$COVERAGE" -lt 80 ]; then
            echo "Coverage is below 80%"
            exit 1
          fi

      - name: Upload coverage
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
  image: php:8.4-cli
  script:
    - composer install --prefer-dist --no-progress
    - vendor/bin/php-cs-fixer fix --dry-run --diff

static-analysis:
  stage: quality
  image: php:8.4-cli
  script:
    - composer install --prefer-dist --no-progress
    - vendor/bin/phpstan analyse
    - vendor/bin/psalm --no-progress

tests:
  stage: test
  image: php:8.4-cli
  script:
    - composer install --prefer-dist --no-progress
    - vendor/bin/phpunit --coverage-text
  coverage: '/^\s*Lines:\s*\d+.\d+\%/'
```

## Quality Gates

### Minimum Thresholds

| Metric | Target | Minimum |
|--------|--------|---------|
| PHPStan Level | 9 | 8 |
| Code Coverage | 85% | 80% |
| Cyclomatic Complexity | < 10 | < 15 |
| Method Length | < 30 lines | < 50 lines |
| Class Length | < 200 lines | < 300 lines |
| PHP Insights Quality | 90 | 80 |

### Quality Checklist

- [ ] PHPStan passes at level 8+
- [ ] No PHP-CS-Fixer violations
- [ ] Code coverage > 80%
- [ ] No critical Psalm issues
- [ ] Architecture tests pass (PHPat/Deptrac)
- [ ] PHPMD rules pass
- [ ] No security vulnerabilities (composer audit)
- [ ] Dependencies up to date
