---
description: Pre-Merge Verification
argument-hint: [arguments]
---

# Pre-Merge Verification

You are a code quality assistant. You must perform all necessary checks BEFORE merging a branch, to ensure quality and avoid regressions.

## Arguments
$ARGUMENTS

Expected arguments:
- Source branch (default: current branch)
- Target branch (default: main or master)

Example: `/common:pre-merge-check feature/auth main`

## MISSION

### Step 1: Analyze the Diff

```bash
# Identify branches
SOURCE_BRANCH=$(git branch --show-current)
TARGET_BRANCH=${2:-main}

# Commits to merge
git log $TARGET_BRANCH..$SOURCE_BRANCH --oneline

# Modified files
git diff $TARGET_BRANCH...$SOURCE_BRANCH --stat

# Lines added/removed
git diff $TARGET_BRANCH...$SOURCE_BRANCH --shortstat
```

### Step 2: Quality Checks

#### 2.1 Complete Tests
```bash
# Run ALL tests
# Symfony
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app pytest --cov --cov-report=term

# React/RN
docker compose exec node npm run test -- --coverage
```

#### 2.2 Complete Static Analysis
```bash
# PHPStan (max level)
docker compose exec php vendor/bin/phpstan analyse -l max

# Dart Analyzer
docker run --rm -v $(pwd):/app -w /app dart dart analyze --fatal-infos

# Mypy (strict)
docker compose exec app mypy --strict .

# TypeScript
docker compose exec node npx tsc --noEmit
```

#### 2.3 Dependencies Check
```bash
# Security audit
# PHP
docker compose exec php composer audit

# Python
docker compose exec app pip-audit

# Node
docker compose exec node npm audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated
```

### Step 3: Specific Checks

#### DB Migrations (if present)
```bash
# Check Doctrine migrations
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- migrations/

# If migrations present
docker compose exec php php bin/console doctrine:migrations:diff --no-interaction
docker compose exec php php bin/console doctrine:schema:validate
```

#### API Breaking Changes
```bash
# Compare OpenAPI specs
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- openapi.yaml docs/api/
```

#### Configuration Changes
```bash
# Modified config files
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- config/ .env.example docker-compose*.yml
```

### Step 4: Commit Analysis

```bash
# Check commit messages
git log $TARGET_BRANCH..$SOURCE_BRANCH --pretty=format:"%s" | while read msg; do
    # Conventional pattern: type(scope): description
    if ! echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo "⚠️ Non-conventional message: $msg"
    fi
done
```

### Step 5: Coverage Check

```bash
# Compare coverage before/after
# Coverage should not decrease
```

### Step 6: Generate Report

```
══════════════════════════════════════════════════════════════
🔀 PRE-MERGE CHECK
══════════════════════════════════════════════════════════════

📌 Source: feature/user-auth
📌 Target: main
📅 Date: YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
📊 STATISTICS
──────────────────────────────────────────────────────────────

Commits: 12
Modified files: 45
Lines added: +1,234
Lines removed: -567

──────────────────────────────────────────────────────────────
🧪 TESTS
──────────────────────────────────────────────────────────────

| Suite | Tests | Passed | Failed | Skipped |
|-------|-------|--------|---------|---------|
| Unit  | 234   | 234    | 0       | 0       |
| Integ | 45    | 45     | 0       | 0       |
| E2E   | 12    | 12     | 0       | 0       |

Coverage: 85.2% (previous: 84.8%) ✅ +0.4%

──────────────────────────────────────────────────────────────
🔍 STATIC ANALYSIS
──────────────────────────────────────────────────────────────

| Tool | Errors | Warnings | Status |
|-------|---------|----------|--------|
| PHPStan | 0 | 2 | ✅ |
| ESLint | 0 | 5 | ⚠️ |
| Mypy | 0 | 0 | ✅ |

──────────────────────────────────────────────────────────────
🔒 SECURITY
──────────────────────────────────────────────────────────────

Dependencies audit: ✅ No vulnerabilities
Secrets detected: ✅ None
Sensitive files: ✅ None

──────────────────────────────────────────────────────────────
📦 MIGRATIONS
──────────────────────────────────────────────────────────────

New migrations: 2
  - Version20240115_AddUserRoles.php
  - Version20240116_CreateAuditLog.php

Schema validation: ✅ OK
Rollback possible: ✅ Yes

──────────────────────────────────────────────────────────────
⚠️ ATTENTION POINTS
──────────────────────────────────────────────────────────────

1. [MEDIUM] 5 ESLint warnings to fix
2. [LOW] 2 TODOs added in code
3. [INFO] 2 new migrations - verify in staging first

──────────────────────────────────────────────────────────────
📋 FINAL CHECKLIST
──────────────────────────────────────────────────────────────

- [x] All tests pass
- [x] Coverage maintained or improved
- [x] No static analysis errors
- [x] No security vulnerabilities
- [x] No secrets committed
- [ ] Code review approved (to check manually)
- [ ] Tested in staging (to check manually)

──────────────────────────────────────────────────────────────
🎯 VERDICT
──────────────────────────────────────────────────────────────

Merge authorized: ✅ YES

Recommendations before merge:
1. Resolve 5 ESLint warnings
2. Test migrations in staging
3. Obtain code review approval
```

## Blocking Rules

### Blocking (merge forbidden)
- ❌ Failing tests
- ❌ Significant coverage drop (> 2%)
- ❌ Static analysis errors
- ❌ Critical/high vulnerabilities
- ❌ Secrets in code
- ❌ Non-reversible migrations

### Non-blocking (warning)
- ⚠️ Static analysis warnings
- ⚠️ TODO/FIXME added
- ⚠️ Low/medium vulnerabilities
- ⚠️ Slightly decreased coverage (< 2%)
