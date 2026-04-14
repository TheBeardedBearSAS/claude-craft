---
name: testing
description: TDD/BDD testing principles. Use when writing tests, reviewing test coverage, setting up testing, or discussing test strategy and test architecture.
triggers:
  files: ["**/tests/**", "**/test/**", "**/__tests__/**", "**/spec/**", "*.test.*", "*.spec.*", "*Test*.*", "*_test.*"]
  keywords: ["test", "coverage", "TDD", "BDD", "mock", "assert", "unit test", "integration test", "e2e", "end-to-end", "fixture", "factory", "arrange act assert", "given when then", "red green refactor", "test pyramid", "mutation testing", "property-based testing"]
auto_suggest: true
---

# Testing - Principes TDD/BDD (2026)

Principes universels de testing pour toutes les technologies du framework Claude-Craft.

## Principes fondamentaux

- **TDD Cycle**: RED → GREEN → REFACTOR
- **Couverture cible**: >= 80%
- **Pyramide**: Unit (70%) > Integration (20%) > E2E (10%)
- **Pattern**: Arrange-Act-Assert (AAA)
- **Nommage**: Tests descriptifs expliquant le comportement

## Outils recommandés 2026

| Stack | Unit/Composants | E2E/Browser | Mutation Testing |
|-------|-----------------|-------------|------------------|
| **JS/TS/React** | **Vitest 4.1+** (Browser Mode stable) | **Playwright** | **Stryker** |
| **PHP/Laravel/Symfony** | **Pest 4.5+** (PHPUnit 12, Browser Testing) | Playwright via Pest | **Infection** |
| **Python** | **pytest 8.x** + **Ruff 0.8+** | **Playwright** | **Mutmut** |
| **Flutter** | **flutter_test** + **bloc_test 10+** | **Patrol 3.13+** | built-in |
| **React Native** | **RNTL** + **Jest** | **Detox/Maestro** | **Stryker** |

**Sources :** [Vitest 4](https://vitest.dev/blog/vitest-4), [Pest 4](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing), [Stryker Mutator](https://stryker-mutator.io/)

## Stratégies 2026

### Vitest 4 — Browser Mode stable

Abandonner JSDOM lourd. Chromium/Firefox/WebKit natifs.

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium', // ou 'firefox', 'webkit'
      provider: 'playwright',
    },
  },
});
```

**Source :** [Vitest Browser Mode](https://vitest.dev/guide/browser.html)

### Mutation Testing — "Coverage ment, mutation scores disent la vérité"

Tester la qualité des tests. Mutation score >= 80%.

```bash
# Stryker (JS/TS/C#)
npx stryker run

# Infection (PHP)
vendor/bin/infection --min-msi=80

# Mutmut (Python)
mutmut run
```

**Source :** [Stryker Mutator](https://stryker-mutator.io/)

### Property-based Testing

Générer des tests à partir de propriétés invariantes.

```typescript
// fast-check (JS/TS)
import fc from 'fast-check';

test('sorting preserves all elements', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sorted = [...arr].sort();
      return sorted.length === arr.length;
    })
  );
});
```

**Source :** [fast-check](https://fast-check.dev/)

### Pest 4 — Browser Testing intégré

```php
// Pest 4.5+ avec Playwright natif
test('user can login', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/login')
            ->type('email', 'alice@example.com')
            ->type('password', 'secret')
            ->press('Login')
            ->assertPathIs('/dashboard');
    });
});
```

**Source :** [Pest 4 Browser Testing](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing)

### Vitest Workspaces — Monorepos

```typescript
// vitest.workspace.ts
export default defineWorkspace([
  'packages/*/vitest.config.ts', // Unit tests
  {
    test: {
      browser: { enabled: true, name: 'chromium' },
      include: ['e2e/**/*.test.ts'],
    },
  }, // Browser tests
]);
```

**Source :** [Vitest Workspaces](https://vitest.dev/guide/workspace.html)

---

Voir `@.claude/references/base/testing.md` pour documentation complète.
