---
name: testing
description: TDD/BDD testing principles. Use when writing tests, reviewing test coverage, setting up testing, or discussing test strategy and test architecture.
context: fork
  files: ["**/tests/**", "**/test/**", "**/__tests__/**", "**/spec/**", "*.test.*", "*.spec.*", "*Test*.*", "*_test.*"]
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
| **JS/TS/React** | **Vitest 5** (Browser Mode stable) | **Playwright** | **Stryker** |
| **PHP/Laravel/Symfony** | **Pest 5** (PHPUnit 13, PHP 8.4+, Browser Testing) | Playwright via Pest | **Infection** |
| **Python** | **pytest 9.x** + **Ruff 0.17+** | **Playwright** | **Mutmut** |
| **Flutter** | **flutter_test** + **bloc_test 10+** | **Patrol 4** | built-in |
| **React Native** | **RNTL 14** + **Jest** | **Maestro** (ou Detox) | **Stryker** |

**Sources :** [Vitest Browser Mode](https://vitest.dev/guide/browser/), [Pest 5 Upgrade Guide](https://v5.pestphp.com/docs/upgrade-guide), [Stryker Mutator](https://stryker-mutator.io/)

## Stratégies 2026

### Vitest 5 — Browser Mode stable

Abandonner JSDOM lourd. Chromium/Firefox/WebKit natifs.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }], // ou 'firefox', 'webkit'
    },
  },
});
```

**Source :** [Vitest Browser Mode](https://vitest.dev/guide/browser/)

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

### Pest 5 — Browser Testing intégré

```php
// Pest 5 avec Playwright natif
test('user can login', function () {
    visit('/login')
        ->fill('email', 'alice@example.com')
        ->fill('password', 'secret')
        ->click('Login')
        ->assertPathIs('/dashboard');
});
```

**Source :** [Pest Browser Testing](https://pestphp.com/docs/browser-testing)

### Vitest Projects — Monorepos

`workspace` est déprécié depuis Vitest 3.2 au profit de `projects`.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: [
      'packages/*', // Unit tests (un vitest.config par package)
      {
        test: {
          name: 'browser',
          include: ['e2e/**/*.test.ts'],
          browser: { enabled: true, provider: playwright(), instances: [{ browser: 'chromium' }] },
        },
      },
    ],
  },
});
```

**Source :** [Vitest Projects](https://vitest.dev/guide/projects)

### BDD — un outil Gherkin par écosystème

| Écosystème | Outil |
|------------|-------|
| JS/TS | **Cucumber.js** (`@cucumber/cucumber`) |
| PHP/Symfony | **Behat** 4.x |
| Python | **pytest-bdd** |

Pour l'E2E mobile, **Maestro** (flows YAML) couvre React Native, Flutter et natif ; **Patrol** (Flutter) et **Detox** (React Native) restent des alternatives intégrées à leur framework.

---

Voir `@.claude/references/base/testing.md` pour documentation complète.
