---
description: Code Quality Analysis
---

# Code Quality Analysis

Run comprehensive code quality analysis on PHP project.

## What This Command Does

1. **Static Analysis**
   - PHPStan level 9 analysis
   - Psalm strict mode check
   - Type coverage verification
   - Dead code detection

2. **Code Style**
   - PSR-12 compliance
   - PHP-CS-Fixer rules
   - Naming convention verification
   - Import organization

3. **Complexity Metrics**
   - Cyclomatic complexity
   - NPath complexity
   - Class length
   - Method length
   - Cognitive complexity

4. **Code Smells Detection**
   - Duplicate code
   - Long methods
   - Large classes
   - Too many parameters
   - Unused code

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Quality Standards

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

    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    checkTooWideReturnTypesInProtectedAndPublicMethods: true
    checkUninitializedProperties: true
    treatPhpDocTypesAsCertain: false
```

### Psalm Configuration

```xml
<?xml version="1.0"?>
<psalm
    errorLevel="1"
    resolveFromConfigFile="true"
    findUnusedBaselineEntry="true"
    findUnusedCode="true"
>
    <projectFiles>
        <directory name="src"/>
        <ignoreFiles>
            <directory name="vendor"/>
        </ignoreFiles>
    </projectFiles>
</psalm>
```

## Code Style Standards

### PHP-CS-Fixer Rules

```php
<?php
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
        'use_arrow_functions' => true,

        // Classes
        'final_class' => true,
        'self_accessor' => true,

        // PHPDoc
        'phpdoc_align' => ['align' => 'left'],
        'no_superfluous_phpdoc_tags' => true,

        // Control structures
        'yoda_style' => false,
        'simplified_if_return' => true,
    ]);
```

## Complexity Thresholds

### Method Metrics

| Metric | Target | Maximum |
|--------|--------|---------|
| Lines of code | < 20 | < 30 |
| Cyclomatic complexity | < 5 | < 10 |
| NPath complexity | < 100 | < 200 |
| Parameters | < 3 | < 5 |
| Cognitive complexity | < 8 | < 15 |

### Class Metrics

| Metric | Target | Maximum |
|--------|--------|---------|
| Lines of code | < 150 | < 250 |
| Methods | < 10 | < 15 |
| Properties | < 10 | < 15 |
| Dependencies | < 5 | < 8 |

## Code Examples

### Method Length

```php
<?php
// ❌ Bad - Method too long (> 30 lines)
public function processOrder(Order $order): void
{
    // Line 1-50: Validation logic
    // Line 51-100: Processing logic
    // Line 101-150: Notification logic
    // Total: 150 lines!
}

// ✅ Good - Short, focused methods
public function processOrder(Order $order): void
{
    $this->validateOrder($order);
    $this->calculateTotals($order);
    $this->applyDiscounts($order);
    $this->saveOrder($order);
    $this->notifyCustomer($order);
}

private function validateOrder(Order $order): void
{
    // 10 lines max
}

private function calculateTotals(Order $order): void
{
    // 10 lines max
}
```

### Cyclomatic Complexity

```php
<?php
// ❌ Bad - High complexity (> 10)
public function calculateDiscount(Order $order): Money
{
    if ($order->isVip()) {
        if ($order->getTotal()->isGreaterThan(Money::of(1000))) {
            if ($order->hasPromoCode()) {
                // ...
            } else {
                // ...
            }
        } else {
            if ($order->isFirstOrder()) {
                // ...
            }
        }
    } else {
        // More nested conditions...
    }
}

// ✅ Good - Low complexity with early returns
public function calculateDiscount(Order $order): Money
{
    if (!$order->isEligibleForDiscount()) {
        return Money::zero();
    }

    return $this->discountCalculator->calculate($order);
}
```

### Too Many Parameters

```php
<?php
// ❌ Bad - Too many parameters
public function createUser(
    string $email,
    string $firstName,
    string $lastName,
    string $password,
    string $phone,
    string $address,
    string $city,
    string $country,
    string $postalCode,
): User {
    // ...
}

// ✅ Good - Use a command object
final readonly class CreateUserCommand
{
    public function __construct(
        public string $email,
        public string $firstName,
        public string $lastName,
        public string $password,
        public Address $address,
    ) {}
}

public function createUser(CreateUserCommand $command): User
{
    // ...
}
```

### Duplicate Code

```php
<?php
// ❌ Bad - Duplicate validation logic
public function createOrder(array $data): Order
{
    if (empty($data['customer_id'])) {
        throw new ValidationException('Customer ID required');
    }
    if (empty($data['items'])) {
        throw new ValidationException('Items required');
    }
    // Create order...
}

public function updateOrder(array $data): Order
{
    if (empty($data['customer_id'])) {
        throw new ValidationException('Customer ID required');
    }
    if (empty($data['items'])) {
        throw new ValidationException('Items required');
    }
    // Update order...
}

// ✅ Good - Extracted validation
private function validateOrderData(array $data): void
{
    if (empty($data['customer_id'])) {
        throw new ValidationException('Customer ID required');
    }
    if (empty($data['items'])) {
        throw new ValidationException('Items required');
    }
}

public function createOrder(array $data): Order
{
    $this->validateOrderData($data);
    // Create order...
}

public function updateOrder(array $data): Order
{
    $this->validateOrderData($data);
    // Update order...
}
```

## Type Safety

### Strict Types

```php
<?php
// ❌ Bad - Missing strict types
namespace App\Service;

class UserService  // Missing declare(strict_types=1)
{
    public function process($data)  // Missing types
    {
        return $data;  // Missing return type
    }
}

// ✅ Good - Full type safety
declare(strict_types=1);

namespace App\Service;

final class UserService
{
    /** @param array<string, mixed> $data */
    public function process(array $data): ProcessingResult
    {
        return new ProcessingResult($data);
    }
}
```

### Generic Types

```php
<?php
// ✅ Good - Proper generic type annotations
/**
 * @template T of object
 */
interface RepositoryInterface
{
    /**
     * @param string $id
     * @return T|null
     */
    public function find(string $id): ?object;

    /**
     * @return array<T>
     */
    public function findAll(): array;

    /**
     * @param T $entity
     */
    public function save(object $entity): void;
}

/**
 * @implements RepositoryInterface<User>
 */
final class UserRepository implements RepositoryInterface
{
    // Implementation
}
```

## Quality Gate Checklist

### Static Analysis
- [ ] PHPStan level 9 passes
- [ ] No Psalm errors at level 1
- [ ] No type errors
- [ ] No dead code detected
- [ ] No deprecated code usage

### Code Style
- [ ] PSR-12 compliant
- [ ] PHP-CS-Fixer passes
- [ ] Imports properly ordered
- [ ] No unused imports
- [ ] Consistent naming

### Complexity
- [ ] Methods < 30 lines
- [ ] Cyclomatic complexity < 10
- [ ] Classes < 250 lines
- [ ] Parameters < 5 per method
- [ ] Dependencies < 8 per class

### Code Smells
- [ ] No duplicate code (< 3%)
- [ ] No god classes
- [ ] No data clumps
- [ ] No feature envy
- [ ] No dead code

### Documentation
- [ ] Public methods documented
- [ ] Complex logic explained
- [ ] @param/@return types accurate
- [ ] @throws documented

## Running Quality Checks

```bash
# Static analysis
vendor/bin/phpstan analyse
vendor/bin/psalm

# Code style
vendor/bin/php-cs-fixer fix --dry-run --diff

# Complexity metrics
vendor/bin/phpmd src text phpmd.xml

# Full quality check
composer quality
```

## CI/CD Integration

```yaml
# GitHub Actions
quality:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.4'

    - name: Install dependencies
      run: composer install

    - name: PHPStan
      run: vendor/bin/phpstan analyse

    - name: PHP-CS-Fixer
      run: vendor/bin/php-cs-fixer fix --dry-run --diff

    - name: Psalm
      run: vendor/bin/psalm --no-progress
```
