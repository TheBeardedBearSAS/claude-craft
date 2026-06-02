---
description: Verificación de la estrategia de pruebas
---

# Verificación de la Estrategia de Pruebas

Verifica que la aplicación React tenga una cobertura de pruebas completa y siga las mejores prácticas de testing.

## Qué Hace Este Comando

1. **Análisis de Pruebas**
   - Verificar la cobertura de pruebas
   - Comprobar la calidad de las pruebas
   - Validar los patrones de testing
   - Verificar la organización de las pruebas
   - Analizar el rendimiento de las pruebas

2. **Métricas Medidas**
   - Cobertura de código (líneas, funciones, ramas)
   - Recuento de pruebas por tipo (unitarias, integración, e2e)
   - Tiempo de ejecución de las pruebas
   - Detección de pruebas inestables (flaky tests)
   - Rutas críticas sin pruebas

3. **Informe Generado**
   - Informe de cobertura
   - Pruebas faltantes
   - Puntuación de calidad de pruebas
   - Recomendaciones

## Cómo Usar

```bash
# Ejecutar todas las pruebas con cobertura
npm run test:coverage

# Modo observación
npm run test:watch

# Modo UI
npm run test:ui

# Pruebas E2E
npm run test:e2e
```

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## Análisis de Cobertura de Pruebas

### Objetivos de Cobertura

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

### Verificar la Cobertura

```bash
# Generar informe de cobertura
npm run test:coverage

# Ver informe HTML
open coverage/index.html

# Verificar umbral específico
npm run test:coverage -- --coverage.lines=90
```

## Tipos de Pruebas

### 1. Pruebas Unitarias (70% de las pruebas)

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

### 2. Pruebas de Integración (20% de las pruebas)

```typescript
// UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UserManagement } from './UserManagement';

describe('UserManagement Integration', () => {
  it('should complete full user creation flow', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Esperar la carga
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Hacer clic en el botón agregar
    await user.click(screen.getByRole('button', { name: /add user/i }));

    // Rellenar el formulario
    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');

    // Enviar
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Verificar
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });
});
```

### 3. Pruebas E2E (10% de las pruebas)

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

## Verificaciones de Calidad de Pruebas

### 1. Patrón AAA

```typescript
// ✅ BIEN - Arrange, Act, Assert (Preparar, Actuar, Verificar)
it('should increment counter', async () => {
  // Arrange (Preparar)
  const user = userEvent.setup();
  render(<Counter initialCount={0} />);

  // Act (Actuar)
  await user.click(screen.getByRole('button', { name: /increment/i }));

  // Assert (Verificar)
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Probar el Comportamiento, No la Implementación

```typescript
// ❌ MAL - Probar la implementación
it('should call setState', () => {
  const setStateSpy = vi.spyOn(React, 'useState');
  // ...
});

// ✅ BIEN - Probar el comportamiento
it('should display incremented count', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 3. Nombres de Prueba Descriptivos

```typescript
// ❌ MAL - Nombres vagos
it('works');
it('test 1');
it('should render');

// ✅ BIEN - Nombres descriptivos
it('should display user name when user data is loaded');
it('should show error message when email is invalid');
it('should disable submit button while form is submitting');
```

### 4. Prioridad de Consultas

```typescript
// ✅ BIEN - Consultas accesibles (las mejores)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ⚠️ ACEPTABLE - Consultas semánticas
screen.getByAltText(/profile/i);
screen.getByTitle(/close/i);

// ❌ EVITAR - IDs de prueba (último recurso)
screen.getByTestId('custom-element');
```

## Organización de Pruebas

### Estructura de Carpetas

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx       # Pruebas unitarias
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
│       └── UserManagement.integration.test.tsx  # Integración
│
├── test/
│   ├── setup.ts                  # Configuración de pruebas
│   ├── mocks/
│   │   └── handlers.ts           # Manejadores MSW
│   └── utils/
│       └── test-utils.tsx        # Utilidades de prueba
│
└── e2e/                          # Pruebas E2E
    ├── auth.spec.ts
    └── users.spec.ts
```

### Utilidades de Prueba

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

## Problemas Comunes de Pruebas

### Problema 1: Pruebas Inestables (Flaky Tests)

```typescript
// ❌ MAL - Condición de carrera
it('should load data', () => {
  render(<DataComponent />);
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
  // Falla aleatoriamente si los datos tardan en cargar
});

// ✅ BIEN - Esperar los datos
it('should load data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Problema 2: Advertencias de Act Faltante

```typescript
// ❌ MAL - Actualización de estado fuera de act
it('should update count', () => {
  const { result } = renderHook(() => useCounter());
  result.current.increment(); // ¡Advertencia!
});

// ✅ BIEN - Envolver en act
it('should update count', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
});
```

### Problema 3: No Limpiar Después de las Pruebas

```typescript
// ✅ BIEN - Limpieza automática
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

## MSW (Mock Service Worker)

### Configuración

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

### Uso

```typescript
// test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Pruebas de Rendimiento

```typescript
// Verificar el rendimiento de renderizado
it('should render list efficiently', () => {
  const start = performance.now();

  render(<LargeList items={items} />);

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // ms
});
```

## Informes de Pruebas

### Informe de Cobertura

```bash
# Generar informe HTML
npm run test:coverage

# Ver informe
open coverage/index.html

# CI: Subir a Codecov
bash <(curl -s https://codecov.io/bash)
```

### Resultados de Pruebas en CI

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

## Lista de Verificación de Pruebas

- [ ] Pruebas unitarias para todos los componentes
- [ ] Pruebas unitarias para todos los hooks
- [ ] Pruebas unitarias para todas las utilidades
- [ ] Pruebas de integración para las funcionalidades
- [ ] Pruebas E2E para los flujos críticos
- [ ] Cobertura > 80%
- [ ] Sin pruebas inestables (flaky tests)
- [ ] Las pruebas son rápidas (< 1s cada una)
- [ ] MSW para el mocking de API
- [ ] Utilidades de prueba extraídas
- [ ] Las pruebas siguen el patrón AAA
- [ ] Las pruebas tienen nombres descriptivos
- [ ] Las pruebas usan consultas accesibles

## Herramientas

- **Vitest**: Ejecutor de pruebas unitarias
- **React Testing Library**: Pruebas de componentes
- **Playwright**: Pruebas E2E
- **MSW**: Mocking de API
- **Testing Library User Event**: Interacciones de usuario
- **Codecov**: Reportes de cobertura

## Recursos

- [React Testing Library](https://testing-library.com/react)
- [Documentación de Vitest](https://vitest.dev/)
- [Documentación de Playwright](https://playwright.dev/)
- [Documentación de MSW](https://mswjs.io/)
- [Mejores Prácticas de Testing](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
