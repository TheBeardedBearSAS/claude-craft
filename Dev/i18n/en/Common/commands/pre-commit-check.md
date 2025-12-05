# Pre-Commit Verification

You are a code quality assistant. You must perform all necessary checks BEFORE creating a commit, to ensure the code meets project standards.

## Arguments
$ARGUMENTS

Options:
- `--fix`: Automatically fix fixable issues
- `--staged`: Check only staged files

## MISSION

### Step 1: Identify Modified Files

```bash
# Staged files
git diff --cached --name-only

# Modified files (unstaged)
git diff --name-only
```

### Step 2: Detect Technology by File

| Extension | Technology | Tools |
|-----------|-------------|--------|
| `.php` | PHP/Symfony | php-cs-fixer, phpstan |
| `.dart` | Flutter | dart format, dart analyze |
| `.py` | Python | ruff, mypy |
| `.ts`, `.tsx` | React/RN | eslint, prettier |
| `.js`, `.jsx` | React/RN | eslint, prettier |

### Step 3: Execute Checks

#### For PHP files
```bash
# Formatting
docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff [files]

# Static analysis
docker compose exec php vendor/bin/phpstan analyse [files]

# Twig syntax (if modified)
docker compose exec php php bin/console lint:twig templates/

# Symfony container
docker compose exec php php bin/console lint:container
```

#### For Dart/Flutter files
```bash
# Formatting
docker run --rm -v $(pwd):/app -w /app dart dart format --set-exit-if-changed [files]

# Analysis
docker run --rm -v $(pwd):/app -w /app dart dart analyze [files]

# Affected tests
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

#### For Python files
```bash
# Linting + formatting
docker compose exec app ruff check [files]
docker compose exec app ruff format --check [files]

# Types
docker compose exec app mypy [files]
```

#### For JS/TS files
```bash
# Linting
docker compose exec node npx eslint [files]

# Formatting
docker compose exec node npx prettier --check [files]

# Types (if TypeScript)
docker compose exec node npx tsc --noEmit
```

### Step 4: Global Checks

#### Secrets
```bash
# Search for secret patterns
grep -rE "(password|secret|api_key|token)\s*[:=]\s*['\"][^'\"]+['\"]" --include="*.{php,py,ts,js,dart}" .
grep -rE "sk_live_|pk_live_|ghp_|gho_|AKIA" .
```

#### Forbidden files
```bash
# Check for no sensitive files
git diff --cached --name-only | grep -E "\.(env|pem|key|p12)$"
```

#### File size
```bash
# Files > 1MB
find . -type f -size +1M -name "*.{php,py,ts,js,dart}"
```

### Step 5: Generate Report

```
══════════════════════════════════════════════════════════════
🔍 PRE-COMMIT CHECK
══════════════════════════════════════════════════════════════

📁 Files checked: X
📅 Date: YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
✅ SUCCESSFUL CHECKS
──────────────────────────────────────────────────────────────

✅ PHP formatting (php-cs-fixer)
✅ PHP static analysis (phpstan)
✅ TypeScript formatting (prettier)
✅ TypeScript linting (eslint)
✅ No secrets detected

──────────────────────────────────────────────────────────────
⚠️ ISSUES DETECTED
──────────────────────────────────────────────────────────────

❌ [PHP] src/Controller/UserController.php:45
   PHPStan: Parameter $id of method __construct() has no type hint

⚠️ [TS] src/components/Button.tsx:12
   ESLint: 'unused' is defined but never used (no-unused-vars)

──────────────────────────────────────────────────────────────
📋 SUMMARY
──────────────────────────────────────────────────────────────

| Category | Status |
|-----------|--------|
| Formatting | ✅ OK |
| Linting   | ⚠️ 1 warning |
| Types     | ❌ 1 error |
| Secrets   | ✅ OK |

──────────────────────────────────────────────────────────────
🎯 REQUIRED ACTIONS
──────────────────────────────────────────────────────────────

1. Fix PHPStan error in UserController.php
2. (Optional) Fix ESLint warning

Commit authorized: ❌ NO (1 blocking error)
```

### --fix Option

If `--fix` is passed as argument:

```bash
# PHP
docker compose exec php vendor/bin/php-cs-fixer fix [files]

# Dart
docker run --rm -v $(pwd):/app -w /app dart dart format [files]

# Python
docker compose exec app ruff check --fix [files]
docker compose exec app ruff format [files]

# JS/TS
docker compose exec node npx eslint --fix [files]
docker compose exec node npx prettier --write [files]
```

## Blocking Rules

### Blocking (commit forbidden)
- ❌ Syntax errors
- ❌ PHPStan/mypy/tsc errors
- ❌ Secrets detected
- ❌ .env files committed
- ❌ Private keys/certificates

### Non-blocking (warning)
- ⚠️ Formatting issues
- ⚠️ ESLint warnings
- ⚠️ Test coverage decreased
- ⚠️ TODO/FIXME added

## Tip

To automate, configure a pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/sh
claude-code "/common:pre-commit-check --staged"
```
