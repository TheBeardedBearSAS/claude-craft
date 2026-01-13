# Laravel Pre-Commit Checklist

## Before Committing Code

### 1. Code Quality

- [ ] **Run Laravel Pint**
  ```bash
  ./vendor/bin/pint
  ```

- [ ] **Run PHPStan**
  ```bash
  ./vendor/bin/phpstan analyse
  ```

- [ ] **No debugging statements**
  - No `dd()`, `dump()`, `ray()`, `var_dump()`
  - No `console.log()` in JavaScript

### 2. Tests

- [ ] **All tests pass**
  ```bash
  php artisan test
  ```

- [ ] **New code has tests**
  - Feature tests for new endpoints
  - Unit tests for business logic
  - Minimum 80% coverage for new code

- [ ] **No skipped tests without reason**
  - `->skip()` requires a comment explaining why

### 3. Database

- [ ] **Migrations are reversible**
  ```bash
  php artisan migrate:rollback
  php artisan migrate
  ```

- [ ] **Seeders work correctly**
  ```bash
  php artisan db:seed
  ```

- [ ] **No breaking schema changes**
  - Column renames handled carefully
  - Foreign key constraints preserved

### 4. Security

- [ ] **No secrets in code**
  - API keys in `.env`
  - Passwords in `.env`
  - Tokens in `.env`

- [ ] **Input validation**
  - All user input validated via Form Requests
  - File uploads validated (type, size)

- [ ] **Authorization**
  - New endpoints have proper authorization
  - Policies cover all model actions

### 5. Performance

- [ ] **No N+1 queries**
  - Eager loading used where needed
  - Check Laravel Debugbar in development

- [ ] **Efficient queries**
  - Select only needed columns
  - Proper indexes on filtered columns

### 6. Documentation

- [ ] **PHPDoc on public methods**
  - Parameters documented
  - Return types documented

- [ ] **API changes documented**
  - New endpoints in API docs
  - Breaking changes noted

### 7. Laravel Conventions

- [ ] **Form Requests for validation**
  - No validation in controllers

- [ ] **API Resources for responses**
  - Consistent JSON structure

- [ ] **Events for side effects**
  - Emails sent via listeners
  - Logging via listeners

### 8. Git Hygiene

- [ ] **Meaningful commit message**
  - Describes what and why
  - References issue if applicable

- [ ] **No unrelated changes**
  - One logical change per commit

- [ ] **`.env` not committed**
  - Only `.env.example` tracked

## Quick Commands

```bash
# Full pre-commit check
./vendor/bin/pint && ./vendor/bin/phpstan analyse && php artisan test

# Check for common issues
grep -r "dd(" --include="*.php" app/
grep -r "dump(" --include="*.php" app/
grep -r "env(" --include="*.php" app/ --exclude-dir=config

# Verify migrations
php artisan migrate:fresh --seed
```

## Automated Pre-Commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Run Pint
./vendor/bin/pint --test
if [ $? -ne 0 ]; then
    echo "❌ Pint check failed. Run './vendor/bin/pint' to fix."
    exit 1
fi

# Run PHPStan
./vendor/bin/phpstan analyse --no-progress
if [ $? -ne 0 ]; then
    echo "❌ PHPStan found issues."
    exit 1
fi

# Run tests
php artisan test --no-progress
if [ $? -ne 0 ]; then
    echo "❌ Tests failed."
    exit 1
fi

echo "✅ All checks passed!"
```
