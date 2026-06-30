---
description: Vérification de la Stratégie de Tests
---

# Vérification de la Stratégie de Tests

Vérifie que l'application React dispose d'une couverture de tests complète et suit les meilleures pratiques de test.

## Ce que fait cette commande

1. **Analyse des Tests**
   - Vérifier la couverture de tests
   - Valider la qualité des tests
   - Contrôler les patterns de test
   - Vérifier l'organisation des tests
   - Analyser les performances des tests

2. **Métriques Mesurées**
   - Couverture du code (lignes, fonctions, branches)
   - Nombre de tests par type (unitaire, intégration, e2e)
   - Temps d'exécution des tests
   - Détection des tests instables (flaky)
   - Chemins critiques non testés

3. **Rapport Généré**
   - Rapport de couverture
   - Tests manquants
   - Score de qualité des tests
   - Recommandations

## Comment Utiliser

```bash
# Lancer tous les tests avec couverture
npm run test:coverage

# Mode watch
npm run test:watch

# Mode UI
npm run test:ui

# Tests E2E
npm run test:e2e
```

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## Analyse de la Couverture de Tests

### Objectifs de Couverture

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.d.ts',
        'vite.config.ts'
      ]
    }
  }
});
```

### Vérifier la Couverture

```bash
# Générer le rapport de couverture
npm run test:coverage

# Visualiser le rapport HTML
open coverage/index.html

# Vérifier un seuil spécifique
npm run test:coverage -- --coverage.lines=90
```

## Types de Tests

### 1. Tests Unitaires (70% des tests)

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Tests d'Intégration (20% des tests)

```typescript
// UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UserManagement } from './UserManagement';

describe('UserManagement Integration', () => {
  it('should complete full user creation flow', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Attendre le chargement
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Cliquer sur le bouton d'ajout
    await user.click(screen.getByRole('button', { name: /add user/i }));

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');

    // Soumettre
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Vérifier
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });
});
```

### 3. Tests E2E (10% des tests)

```typescript
// auth.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');

    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

## Vérifications de Qualité des Tests

### 1. Pattern AAA

```typescript
// ✅ BON - Arrange, Act, Assert
it('should increment counter', async () => {
  // Arrange
  const user = userEvent.setup();
  render(<Counter initialCount={0} />);

  // Act
  await user.click(screen.getByRole('button', { name: /increment/i }));

  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Tester le Comportement, pas l'Implémentation

```typescript
// ❌ MAUVAIS - Tester l'implémentation
it('should call setState', () => {
  const setStateSpy = vi.spyOn(React, 'useState');
  // ...
});

// ✅ BON - Tester le comportement
it('should display incremented count', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 3. Noms de Tests Descriptifs

```typescript
// ❌ MAUVAIS - Noms vagues
it('works');
it('test 1');
it('should render');

// ✅ BON - Noms descriptifs
it('should display user name when user data is loaded');
it('should show error message when email is invalid');
it('should disable submit button while form is submitting');
```

### 4. Priorité des Requêtes

```typescript
// ✅ BON - Requêtes accessibles (meilleures)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ⚠️ ACCEPTABLE - Requêtes sémantiques
screen.getByAltText(/profile/i);
screen.getByTitle(/close/i);

// ❌ ÉVITER - Test IDs (en dernier recours)
screen.getByTestId('custom-element');
```

## Organisation des Tests

### Structure des Dossiers

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx       # Tests unitaires
│       └── Button.stories.tsx    # Storybook
│
├── features/
│   └── users/
│       ├── components/
│       │   └── UserList/
│       │       ├── UserList.tsx
│       │       └── UserList.test.tsx
│       ├── hooks/
│       │   └── useUsers.test.ts
│       └── UserManagement.integration.test.tsx  # Intégration
│
├── test/
│   ├── setup.ts                  # Configuration des tests
│   ├── mocks/
│   │   └── handlers.ts           # Handlers MSW
│   └── utils/
│       └── test-utils.tsx        # Utilitaires de test
│
└── e2e/                          # Tests E2E
    ├── auth.spec.ts
    └── users.spec.ts
```

### Utilitaires de Test

```typescript
// test/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
```

## Problèmes de Test Courants

### Problème 1 : Tests Instables (Flaky)

```typescript
// ❌ MAUVAIS - Condition de course
it('should load data', () => {
  render(<DataComponent />);
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
  // Échoue de façon aléatoire si les données chargent lentement
});

// ✅ BON - Attendre les données
it('should load data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Problème 2 : Avertissements Act Manquants

```typescript
// ❌ MAUVAIS - Mise à jour d'état en dehors de act
it('should update count', () => {
  const { result } = renderHook(() => useCounter());
  result.current.increment(); // Avertissement !
});

// ✅ BON - Envelopper dans act
it('should update count', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
});
```

### Problème 3 : Nettoyage Non Effectué

```typescript
// ✅ BON - Nettoyage automatique
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

## MSW (Mock Service Worker)

### Configuration

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' }
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json({ id: '3', ...newUser }, { status: 201 });
  })
];

// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Utilisation

```typescript
// test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Tests de Performance

```typescript
// Vérifier les performances de rendu
it('should render list efficiently', () => {
  const start = performance.now();

  render(<LargeList items={items} />);

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // ms
});
```

## Rapports de Tests

### Rapport de Couverture

```bash
# Générer le rapport HTML
npm run test:coverage

# Visualiser le rapport
open coverage/index.html

# CI : Upload vers Codecov
bash <(curl -s https://codecov.io/bash)
```

### Rapport de Conformité

```
═══════════════════════════════════════════════════
🧪 AUDIT TESTING REACT
═══════════════════════════════════════════════════

📊 SCORE GLOBAL : XX/25

🔧 INFRASTRUCTURE DE TEST : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

⚙️  CONFIGURATION COVERAGE : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

📈 COVERAGE GLOBAL : XX/7

Métriques actuelles :
• Statements  : XX% (objectif ≥80%)
• Branches    : XX% (objectif ≥75%)
• Functions   : XX% (objectif ≥80%)
• Lines       : XX% (objectif ≥80%)

Fichiers non couverts ou sous le seuil :
• src/features/user/UserProfile.tsx : 45% (critique)
• src/utils/formatDate.ts : 60% (important)
• ...

✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

✨ QUALITÉ DES TESTS : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Problèmes détectés :
• XX tests skipped sans justification
• XX tests flaky identifiés
• XX fichiers sans tests

🎯 REACT TESTING LIBRARY : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Anti-patterns détectés :
• Usage excessif de getByTestId dans UserCard.test.tsx
• Tests basés sur l'implémentation dans useAuth.test.ts
• ...

📊 STATISTIQUES
• Total tests : XXX
• Tests réussis : XXX
• Tests en échec : XX
• Tests skipped : XX
• Temps d'exécution : XXs

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES
═══════════════════════════════════════════════════

1. [Priorité HAUTE] Augmenter le coverage de XX% à 80%
   → Ajouter tests pour : UserProfile, Dashboard, ...
   → Effort estimé : X jours

2. [Priorité HAUTE] Corriger les XX tests en échec
   → Tests identifiés : ...
   → Effort estimé : X heures

3. [Priorité MOYENNE] Améliorer les pratiques RTL
   → Remplacer getByTestId par getByRole
   → Effort estimé : X heures

═══════════════════════════════════════════════════
📚 RÉFÉRENCES
═══════════════════════════════════════════════════

• rules/07-testing.md - Standards de testing
• rules/06-tooling.md - Configuration des outils
• https://testing-library.com/docs/queries/about/#priority
```

### Résultats de Tests en CI

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Checklist de Tests

- [ ] Tests unitaires pour tous les composants
- [ ] Tests unitaires pour tous les hooks
- [ ] Tests unitaires pour tous les utilitaires
- [ ] Tests d'intégration pour les features
- [ ] Tests E2E pour les parcours critiques
- [ ] Couverture > 80%
- [ ] Pas de tests instables (flaky)
- [ ] Tests rapides (< 1s chacun)
- [ ] MSW pour le mocking des API
- [ ] Utilitaires de test extraits
- [ ] Tests suivent le pattern AAA
- [ ] Tests ont des noms descriptifs
- [ ] Tests utilisent les requêtes accessibles

## Outils

- **Vitest** : Exécuteur de tests unitaires
- **React Testing Library** : Test de composants
- **Playwright** : Tests E2E
- **MSW** : Mocking des API
- **Testing Library User Event** : Interactions utilisateur
- **Codecov** : Rapport de couverture

## Ressources

- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
