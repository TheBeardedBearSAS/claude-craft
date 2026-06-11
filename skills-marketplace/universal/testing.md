---
name: testing
description: TDD/BDD testing principles with 2026 best practices — mutation testing, browser mode, property-based testing
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [testing, tdd, bdd, coverage, mutation, vitest, playwright, jest]
category: quality
license: MIT
repository: https://github.com/TheBeardedBearSAS/claude-craft
---

# Testing — TDD/BDD Principles (2026)

Universal testing principles for any technology stack.

## Fundamentals

- **TDD Cycle:** RED → GREEN → REFACTOR
- **Target Coverage:** >= 80%
- **Pyramid:** Unit (70%) > Integration (20%) > E2E (10%)
- **Pattern:** Arrange-Act-Assert (AAA)
- **Naming:** Descriptive tests explaining behavior

## Recommended Tools 2026

| Stack | Unit/Components | E2E/Browser | Mutation Testing |
|-------|-----------------|-------------|------------------|
| **JS/TS/React** | **Vitest 4.1+** (Browser Mode) | **Playwright** | **Stryker** |
| **PHP/Laravel/Symfony** | **Pest 4.5+** (Browser Testing) | Playwright | **Infection** |
| **Python** | **pytest 8.x** + **Ruff 0.8+** | **Playwright** | **Mutmut** |
| **Flutter** | **flutter_test** + **bloc_test 10+** | **Patrol 3.13+** | built-in |

## Key Strategies

### Vitest 4 — Browser Mode
Drop heavy JSDOM. Use native Chromium/Firefox/WebKit.

### Mutation Testing
"Coverage lies, mutation scores tell the truth."
Target mutation score >= 80%.

```bash
# Stryker (JS/TS)
npx stryker run

# Infection (PHP)
vendor/bin/infection --min-msi=80

# Mutmut (Python)
mutmut run
```

### Property-Based Testing
Test invariants instead of examples.

```typescript
// fast-check (JS/TS)
test('sorting preserves length', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sorted = [...arr].sort();
      return sorted.length === arr.length;
    })
  );
});
```

## Best Practices

- **AAA Pattern:** Arrange-Act-Assert in every test
- **Naming:** `test "calculateTotal returns zero for empty cart"`
- **Independence:** Each test creates its own data (factories)
- **Test behavior, not implementation**

## Anti-patterns

- Tests that test implementation (excessive mocks)
- Flaky tests (inject time, no sleep)
- Commented tests → fix or delete
- Tests without assertions
- 100% coverage without mutation testing (false confidence)

## Bug Fix = Regression Test

1. Write test that reproduces bug (fails before fix)
2. Implement fix
3. Test passes after fix
4. Keep test forever

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
