---
description: Test-Strategie-Prüfung
---

# Test-Strategie-Prüfung

Überprüfen, ob die React-Anwendung eine umfassende Test-Abdeckung hat und Testing-Best-Practices befolgt.

## Was dieser Befehl tut

1. **Testing-Analyse**
   - Test-Coverage prüfen
   - Test-Qualität verifizieren
   - Testing-Muster validieren
   - Test-Organisation prüfen
   - Test-Performance analysieren

2. **Gemessene Metriken**
   - Code-Coverage (Zeilen, Funktionen, Branches)
   - Test-Anzahl nach Typ (Unit, Integration, E2E)
   - Test-Ausführungszeit
   - Flaky-Test-Erkennung
   - Nicht getestete kritische Pfade

3. **Generierter Bericht**
   - Coverage-Bericht
   - Fehlende Tests
   - Test-Qualitätspunktzahl
   - Empfehlungen

## Verwendung

```bash
# Alle Tests mit Coverage ausführen
npm run test:coverage

# Watch-Modus
npm run test:watch

# UI-Modus
npm run test:ui

# E2E-Tests
npm run test:e2e
```

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Test-Coverage-Analyse

### Coverage-Ziele

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

### Coverage prüfen

```bash
# Coverage-Bericht generieren
npm run test:coverage

# HTML-Bericht ansehen
open coverage/index.html

# Bestimmten Schwellenwert prüfen
npm run test:coverage -- --coverage.lines=90
```

## Test-Typen

### 1. Unit-Tests (70% der Tests)

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('sollte mit Text gerendert werden', () => {
    render(<Button>Klick mich</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Klick mich');
  });

  it('sollte onClick beim Klicken aufrufen', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Klick mich</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('sollte deaktiviert sein, wenn disabled-Prop true ist', () => {
    render(<Button disabled>Klick mich</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Integrationstests (20% der Tests)

```typescript
// UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UserManagement } from './UserManagement';

describe('UserManagement Integration', () => {
  it('sollte vollständigen Benutzererstellungsablauf abschließen', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Auf Laden warten
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Hinzufügen-Schaltfläche klicken
    await user.click(screen.getByRole('button', { name: /benutzer hinzufügen/i }));

    // Formular ausfüllen
    await user.type(screen.getByLabelText(/name/i), 'Neuer Benutzer');
    await user.type(screen.getByLabelText(/email/i), 'neu@example.com');

    // Absenden
    await user.click(screen.getByRole('button', { name: /speichern/i }));

    // Verifizieren
    await waitFor(() => {
      expect(screen.getByText('Neuer Benutzer')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E-Tests (10% der Tests)

```typescript
// auth.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Authentifizierung', () => {
  test('sollte erfolgreich einloggen', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Anmelden');

    await page.fill('input[name="email"]', 'benutzer@example.com');
    await page.fill('input[name="password"]', 'passwort123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Willkommen')).toBeVisible();
  });
});
```

## Test-Qualitätsprüfungen

### 1. AAA-Muster

```typescript
// ✅ GUT - Arrange, Act, Assert
it('sollte Zähler erhöhen', async () => {
  // Arrange (Vorbereiten)
  const user = userEvent.setup();
  render(<Counter initialCount={0} />);

  // Act (Ausführen)
  await user.click(screen.getByRole('button', { name: /erhöhen/i }));

  // Assert (Überprüfen)
  expect(screen.getByText('Anzahl: 1')).toBeInTheDocument();
});
```

### 2. Verhalten, nicht Implementierung testen

```typescript
// ❌ SCHLECHT - Implementierung testen
it('sollte setState aufrufen', () => {
  const setStateSpy = vi.spyOn(React, 'useState');
  // ...
});

// ✅ GUT - Verhalten testen
it('sollte erhöhten Zähler anzeigen', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /erhöhen/i }));

  expect(screen.getByText('Anzahl: 1')).toBeInTheDocument();
});
```

### 3. Aussagekräftige Testnamen

```typescript
// ❌ SCHLECHT - Vage Namen
it('funktioniert');
it('test 1');
it('sollte rendern');

// ✅ GUT - Aussagekräftige Namen
it('sollte Benutzernamen anzeigen, wenn Benutzerdaten geladen sind');
it('sollte Fehlermeldung anzeigen, wenn E-Mail ungültig ist');
it('sollte Absenden-Schaltfläche deaktivieren, während Formular abgesendet wird');
```

### 4. Query-Priorität

```typescript
// ✅ GUT - Barrierefreie Queries (beste Wahl)
screen.getByRole('button', { name: /absenden/i });
screen.getByLabelText(/email/i);
screen.getByText(/willkommen/i);

// ⚠️ OK - Semantische Queries
screen.getByAltText(/profil/i);
screen.getByTitle(/schließen/i);

// ❌ VERMEIDEN - Test-IDs (letzter Ausweg)
screen.getByTestId('custom-element');
```

## Test-Organisation

### Ordnerstruktur

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx       # Unit-Tests
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
│       └── UserManagement.integration.test.tsx  # Integration
│
├── test/
│   ├── setup.ts                  # Test-Setup
│   ├── mocks/
│   │   └── handlers.ts           # MSW-Handler
│   └── utils/
│       └── test-utils.tsx        # Test-Utilities
│
└── e2e/                          # E2E-Tests
    ├── auth.spec.ts
    └── users.spec.ts
```

### Test-Utilities

```typescript
// test/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

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

## Häufige Testing-Probleme

### Problem 1: Flaky Tests

```typescript
// ❌ SCHLECHT - Race Condition
it('sollte Daten laden', () => {
  render(<DataComponent />);
  expect(screen.getByText('Daten geladen')).toBeInTheDocument();
  // Schlägt zufällig fehl, wenn Daten langsam laden
});

// ✅ GUT - Auf Daten warten
it('sollte Daten laden', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Daten geladen')).toBeInTheDocument();
  });
});
```

### Problem 2: Fehlende Act-Warnungen

```typescript
// ❌ SCHLECHT - State-Update außerhalb von act
it('sollte Zähler aktualisieren', () => {
  const { result } = renderHook(() => useCounter());
  result.current.increment(); // Warnung!
});

// ✅ GUT - In act einschließen
it('sollte Zähler aktualisieren', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
});
```

### Problem 3: Fehlende Bereinigung

```typescript
// ✅ GUT - Automatische Bereinigung
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

## MSW (Mock Service Worker)

### Setup

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

### Verwendung

```typescript
// test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Performance-Tests

```typescript
// Render-Performance prüfen
it('sollte Liste effizient rendern', () => {
  const start = performance.now();

  render(<LargeList items={items} />);

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // ms
});
```

## Test-Berichte

### Coverage-Bericht

```bash
# HTML-Bericht generieren
npm run test:coverage

# Bericht anzeigen
open coverage/index.html

# CI: Zu Codecov hochladen
bash <(curl -s https://codecov.io/bash)
```

### Testergebnisse in CI

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

      - name: Abhängigkeiten installieren
        run: npm ci

      - name: Tests ausführen
        run: npm run test:coverage

      - name: Coverage hochladen
        uses: codecov/codecov-action@v3
```

## Testing-Checkliste

- [ ] Unit-Tests für alle Komponenten
- [ ] Unit-Tests für alle Hooks
- [ ] Unit-Tests für alle Utilities
- [ ] Integrationstests für Features
- [ ] E2E-Tests für kritische Abläufe
- [ ] Coverage > 80%
- [ ] Keine Flaky Tests
- [ ] Tests sind schnell (< 1s je Test)
- [ ] MSW für API-Mocking
- [ ] Test-Utilities extrahiert
- [ ] Tests befolgen AAA-Muster
- [ ] Tests haben aussagekräftige Namen
- [ ] Tests verwenden barrierefreie Queries

## Tools

- **Vitest**: Unit-Test-Runner
- **React Testing Library**: Komponenten-Testing
- **Playwright**: E2E-Testing
- **MSW**: API-Mocking
- **Testing Library User Event**: Benutzerinteraktionen
- **Codecov**: Coverage-Reporting

## Ressourcen

- [React Testing Library](https://testing-library.com/react)
- [Vitest-Dokumentation](https://vitest.dev/)
- [Playwright-Dokumentation](https://playwright.dev/)
- [MSW-Dokumentation](https://mswjs.io/)
- [Testing-Best-Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
