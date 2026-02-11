# Pre-Commit Checklist - PHP

## Quick Validation Before Each Commit

### Code Quality

- [ ] Code is formatted (`vendor/bin/php-cs-fixer fix`)
- [ ] PHPStan passes (`vendor/bin/phpstan analyse`)
- [ ] Psalm passes (`vendor/bin/psalm`)
- [ ] No unused imports
- [ ] No `var_dump`, `dd()`, or `dump()` statements

### Tests

- [ ] All tests pass (`vendor/bin/phpunit`)
- [ ] New tests added for new features
- [ ] Modified tests reflect changes
- [ ] Test coverage maintained or improved

### Type Safety

- [ ] `declare(strict_types=1)` in new files
- [ ] All parameters typed
- [ ] All return types declared
- [ ] PHPDoc for complex types

### Security

- [ ] No hardcoded secrets or credentials
- [ ] No sensitive data in comments
- [ ] Input validation present
- [ ] Parameterized queries used

### Documentation

- [ ] PHPDoc on new public methods
- [ ] @throws documented
- [ ] CHANGELOG updated if applicable
- [ ] README updated if necessary

### Git

- [ ] Commit message is clear and follows conventions
- [ ] Branch is up to date with main/develop
- [ ] No unnecessary files committed
- [ ] .gitignore is respected

## Automated Validation (GrumPHP)

### Configuration Example

```yaml
# grumphp.yml
grumphp:
  tasks:
    phpcsfixer:
      config: .php-cs-fixer.php
      diff: true
    phpstan:
      configuration: phpstan.neon
      level: 9
    phpunit:
      testsuite: Unit
      always_execute: true
    psalm:
      config: psalm.xml
      show_info: false
    composer:
      no_check_lock: true
```

### With Husky

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "composer quality"
    }
  }
}
```

## Quick Commands

```bash
# Complete validation
composer quality    # cs-fixer + phpstan + tests

# Quick fix
vendor/bin/php-cs-fixer fix           # Fix code style
vendor/bin/rector process             # Apply refactorings

# Static analysis
vendor/bin/phpstan analyse            # PHPStan level 9
vendor/bin/psalm                      # Psalm analysis

# Tests
vendor/bin/phpunit                    # All tests
vendor/bin/phpunit --testsuite=Unit   # Unit tests only
vendor/bin/pest                       # If using Pest
```

## Common Issues

### Formatting

```bash
# Format all files
vendor/bin/php-cs-fixer fix

# Check without modifying
vendor/bin/php-cs-fixer fix --dry-run --diff

# Format specific file
vendor/bin/php-cs-fixer fix src/Domain/Entity/Order.php
```

### PHPStan Errors

```bash
# Generate baseline for existing errors
vendor/bin/phpstan analyse --generate-baseline

# Check specific path
vendor/bin/phpstan analyse src/Domain/

# Increase memory limit
vendor/bin/phpstan analyse --memory-limit=512M
```

### Psalm Errors

```bash
# Generate baseline
vendor/bin/psalm --set-baseline=psalm-baseline.xml

# Show info level messages
vendor/bin/psalm --show-info=true

# Fix issues automatically
vendor/bin/psalm --alter
```

### Tests

```bash
# Run all tests
vendor/bin/phpunit

# Run specific test class
vendor/bin/phpunit tests/Unit/Domain/Entity/OrderTest.php

# Run specific test method
vendor/bin/phpunit --filter=it_can_be_created

# Run with coverage
vendor/bin/phpunit --coverage-html coverage/

# Update snapshots (Pest)
vendor/bin/pest --update-snapshots
```

## Composer Scripts

```json
// composer.json
{
  "scripts": {
    "test": "phpunit",
    "test:coverage": "phpunit --coverage-html coverage",
    "cs:fix": "php-cs-fixer fix",
    "cs:check": "php-cs-fixer fix --dry-run --diff",
    "stan": "phpstan analyse",
    "psalm": "psalm",
    "quality": [
      "@cs:fix",
      "@stan",
      "@test"
    ],
    "ci": [
      "@cs:check",
      "@stan",
      "@psalm",
      "@test:coverage"
    ]
  }
}
```

## Before Push

- [ ] All commits follow conventional format
- [ ] Branch is rebased on main/develop
- [ ] Conflicts are resolved
- [ ] CI pipeline will pass
- [ ] No WIP commits in history

## CI/CD Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit or .git/hooks/pre-commit

# Run quality checks
composer quality

# Check for debug statements
if grep -r "var_dump\|dd(\|dump(" src/; then
    echo "Error: Debug statements found!"
    exit 1
fi

# Check for strict_types
for file in $(git diff --cached --name-only --diff-filter=ACM | grep '\.php$'); do
    if ! head -5 "$file" | grep -q 'declare(strict_types=1)'; then
        echo "Error: Missing strict_types in $file"
        exit 1
    fi
done

exit 0
```

## Notes

- Configure GrumPHP or Husky for automatic validation
- Use `--staged` flag to check only staged files
- Keep commits small and focused
- Write clear commit messages following Conventional Commits
