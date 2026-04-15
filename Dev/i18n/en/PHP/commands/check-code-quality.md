---
description: PHP Code Quality Analysis
argument-hint: [arguments]
---

# PHP Code Quality Analysis

## Arguments

$ARGUMENTS (optional: path to PHP project to analyze, defaults to current directory)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Analyze the code quality of a native PHP project. Combine static analysis (PHPStan), style checks (PSR-12), modernization hints (Rector), and complexity metrics. Produce an actionable report with a score out of 25.

**Reference rules**: `.claude/rules/php-coding-standards.md`, `.claude/rules/php-quality-tools.md`

### Step 1: Tooling Inventory

- [ ] Read `composer.json` dev dependencies
- [ ] Check for PHPStan (`phpstan.neon` / `phpstan.neon.dist`)
- [ ] Check for PHP-CS-Fixer (`.php-cs-fixer.dist.php`) or PHP_CodeSniffer (`phpcs.xml`)
- [ ] Check for Rector (`rector.php`)
- [ ] Check for Psalm (optional) (`psalm.xml`)

**Expected stack (2026)**:
- PHPStan level 10 (or Psalm level 1)
- PHP-CS-Fixer with PSR-12 + `@PHP85Migration` rules
- Rector with `LevelSetList::UP_TO_PHP_85`

### Step 2: PSR-12 Compliance (5 pts)

```bash
docker compose exec app vendor/bin/php-cs-fixer fix --dry-run --diff --verbose
```

Check:
- [ ] 0 style violations
- [ ] `declare(strict_types=1);` on every file
- [ ] 4-space indentation, LF line endings
- [ ] Class / method / property visibility always explicit

### Step 3: Static Analysis — PHPStan (5 pts)

```bash
docker compose exec app vendor/bin/phpstan analyse --level=max
```

Check:
- [ ] Level 10 (or max) passes with 0 errors
- [ ] No `@phpstan-ignore` without justification comment
- [ ] Generics properly typed (`@template`, `@param T`, `@return T`)
- [ ] No `mixed` return types in public APIs

### Step 4: Type Safety (4 pts)

- [ ] 100% of parameters typed
- [ ] 100% of return types declared
- [ ] Property types declared (PHP 7.4+)
- [ ] Readonly properties used where mutation is forbidden (PHP 8.1+)
- [ ] Property Hooks used for computed properties (PHP 8.4+)
- [ ] Asymmetric visibility used where relevant (PHP 8.4+)

### Step 5: KISS / DRY / YAGNI (4 pts)

- [ ] Cognitive complexity < 7 per method (target), < 10 max
- [ ] Methods < 20 lines
- [ ] Cyclomatic complexity < 10
- [ ] No dead code (verify with `vimeo/psalm --find-dead-code` or `rector`)
- [ ] DRY: business rules in one place (Value Objects for validation)
- [ ] YAGNI: no speculative abstraction — rule of 3 before extracting

**Detection command**:

```bash
docker compose exec app vendor/bin/phpmetrics --report-cli src/
```

### Step 6: Naming & Documentation (4 pts)

- [ ] Class names in `PascalCase`, methods in `camelCase`, constants `UPPER_SNAKE_CASE`
- [ ] Names are explicit (no `getData`, `process`, `manager` without context)
- [ ] PHPDoc on public APIs with complex generics only (types already in signature)
- [ ] No orphan comments describing WHAT (explain WHY only)

### Step 7: Error Handling (3 pts)

- [ ] Exceptions domain-specific, not generic `\Exception`
- [ ] No silenced errors (`@` operator forbidden)
- [ ] Null safety: prefer `Option`/`Maybe` types or explicit nullable + early return
- [ ] Exceptions never caught to be silently ignored

## OUTPUT FORMAT

```
PHP CODE QUALITY AUDIT
======================

SCORE: XX/25

PSR-12 (X/5)
  php-cs-fixer violations: N
  Critical issues:
  - [file:line] description

PHPSTAN (X/5)
  Level achieved: N/10
  Remaining errors: N
  Top blockers:
  - [file:line] description

TYPE SAFETY (X/4)
  Untyped parameters: N
  Untyped returns: N
  Missing property types: N

KISS / DRY / YAGNI (X/4)
  High-complexity methods (>10): N
  Duplicate blocks: N
  Dead code: N

NAMING & DOCS (X/4)
  Non-explicit names: N
  Obsolete PHPDoc: N

ERROR HANDLING (X/3)
  Uses of @: N
  Generic \Exception thrown: N

TOP 3 QUICK WINS:
1. Run `vendor/bin/php-cs-fixer fix` — 0 effort, fixes N violations
2. [...]
3. [...]

TOP 3 LONG-TERM ACTIONS:
1. Reach PHPStan level max — split over 3 sprints
2. [...]
3. [...]
```

## IMPORTANT NOTES

- Always use Docker (`docker compose exec app ...`)
- Never lower PHPStan levels without justification commit message
- Prefer Rector for bulk modernization (PHP 8.5 migration sets)
- Coverage 100% without mutation testing is a false safety net — report mutation score if Infection is configured
