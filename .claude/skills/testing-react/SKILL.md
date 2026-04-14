---
name: testing-react
description: Stratégie de Tests React 19 + Compiler 1.0. Use when writing tests, reviewing test coverage, or setting up testing.
---

# Stratégie de Tests React 19 + Compiler 1.0

**Versions :** React 19.2+ | React Compiler 1.0 | Vitest 4.1+ | Playwright

## Compatibilité React Compiler 1.0

**React Compiler 1.0** (auto-memoization) est compatible avec tous les outils de tests React :
- **Vitest** + **React Testing Library / Browser Mode** : aucun changement requis
- **Playwright** : aucun changement requis
- **MSW** : aucun changement requis

Les tests restent **comportementaux** (pas d'implémentation testée), donc l'optimisation automatique du compilateur est transparente.

**Note :** Ne pas tester les optimisations du compilateur (memoization). Tester uniquement le comportement visible (UI, interactions, états).

Source : [react.dev/blog/2025/10/07/react-compiler-1](https://react.dev/blog/2025/10/07/react-compiler-1)

---

## Stack recommandée 2026

| Type | Outil | Usage |
|------|-------|-------|
| **Unit/Composants** | **Vitest 4.1+** Browser Mode | Chromium/Firefox/WebKit natif |
| **E2E** | **Playwright** | Flows utilisateur complets |
| **Mutation** | **Stryker** | Qualité des tests (score >= 80%) |

**Abandonner :** JSDOM (lourd, incomplet) et React Testing Library (remplacé par Playwright component testing).

**Sources :** [Vitest 4](https://vitest.dev/blog/vitest-4), [Playwright Component Testing](https://playwright.dev/docs/test-components), [Stryker Mutator](https://stryker-mutator.io/)

## Configuration Vitest 4 Browser Mode

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      name: 'chromium', // ou 'firefox', 'webkit'
      provider: 'playwright',
    },
    globals: true,
  },
});
```

## Tests composants avec Vitest Browser Mode

```typescript
// Button.test.tsx
import { render, screen, userEvent } from '@vitest/browser/context';
import { Button } from './Button';

test('handles click events', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await userEvent.click(screen.getByText('Click me'));
  
  expect(handleClick).toHaveBeenCalledOnce();
});
```

**Source :** [Vitest Browser Mode Guide](https://vitest.dev/guide/browser.html)

## Playwright Component Testing

Alternative supérieure à React Testing Library — browser réel, debugging visuel.

```typescript
// Button.test.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test('handles click events', async ({ mount }) => {
  let clicked = false;
  
  const component = await mount(
    <Button onClick={() => { clicked = true; }}>
      Click me
    </Button>
  );
  
  await component.click();
  expect(clicked).toBe(true);
});
```

**Source :** [Playwright Component Testing](https://playwright.dev/docs/test-components)

## Mutation Testing avec Stryker

```bash
# Installation
npm install -D @stryker-mutator/core @stryker-mutator/vitest-runner

# stryker.config.json
{
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/**/*.ts", "src/**/*.tsx"],
  "thresholds": { "high": 80, "low": 60, "break": 50 }
}

# Exécution
npx stryker run
```

**Philosophie :** "Coverage = quantité de code testé. Mutation score = qualité des tests."

**Source :** [Stryker Mutator](https://stryker-mutator.io/)

## React Server Components — Tests

```typescript
// ProductList.test.tsx (RSC)
import { test, expect } from 'vitest';
import { ProductList } from './ProductList';

test('renders product list server component', async () => {
  const html = await ProductList({ category: 'books' });
  
  expect(html).toContain('Books');
  // RSC retourne du HTML, pas de DOM
});
```

## Vitest Workspaces — Monorepo

```typescript
// vitest.workspace.ts
export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  },
  {
    test: {
      name: 'browser',
      browser: { enabled: true, name: 'chromium' },
      include: ['src/**/*.browser.test.{ts,tsx}'],
    },
  },
]);
```

**Source :** [Vitest Workspaces](https://vitest.dev/guide/workspace.html)

## Property-based Testing

```typescript
// fast-check pour générer des cas de test
import fc from 'fast-check';

test('calculateTotal is always positive', () => {
  fc.assert(
    fc.property(fc.array(fc.nat()), (prices) => {
      const total = calculateTotal(prices);
      return total >= 0;
    })
  );
});
```

**Source :** [fast-check](https://fast-check.dev/)

---

Voir `@.claude/rules/07-testing.md` pour principes transverses.
