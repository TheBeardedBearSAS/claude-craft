---
description: Verificacion de Testing
---

# Verificacion de Testing

Analiza la cobertura de tests y la calidad de las pruebas en la aplicacion React.

## Que Hace Este Comando

1. **Analisis de Cobertura**
   - Medir cobertura de lineas
   - Medir cobertura de funciones
   - Medir cobertura de ramas
   - Medir cobertura de sentencias
   - Identificar codigo no cubierto

2. **Calidad de Tests**
   - Validar estructura de tests
   - Verificar patron AAA
   - Detectar tests flakey
   - Verificar assertions
   - Analizar tiempo de ejecucion

3. **Reporte Generado**
   - Cobertura por archivo
   - Archivos sin tests
   - Recomendaciones
   - Tendencias en el tiempo

## Ejecutar Tests

### Modo Desarrollo

```bash
# Modo watch
npm run test

# Ejecutar todos los tests
npm run test:run

# Con UI
npm run test:ui
```

### Generar Cobertura

```bash
# Cobertura basica
npm run test:coverage

# Cobertura con HTML
npm run test:coverage -- --reporter=html

# Cobertura solo para archivos modificados
npm run test:coverage -- --changed
```

## Objetivos de Cobertura

### Niveles Minimos

```typescript
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
        '**/types.ts'
      ]
    }
  }
});
```

### Por Categoria

- **Utilidades**: 95%+
- **Hooks**: 90%+
- **Componentes**: 85%+
- **Paginas**: 70%+
- **Configuracion**: 50%+

## Tipos de Tests

### Tests Unitarios

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Tests de Integracion

```typescript
// UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UserManagement } from './UserManagement';

describe('UserManagement Integration', () => {
  it('should complete full user creation flow', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Esperar carga inicial
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Hacer clic en agregar usuario
    await user.click(screen.getByRole('button', { name: /add user/i }));

    // Llenar formulario
    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');

    // Enviar
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Verificar que se agrego el usuario
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });
});
```

### Tests E2E

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });
});
```

## Mejores Practicas

### Patron AAA

```typescript
// Arrange (Preparar), Act (Actuar), Assert (Afirmar)
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

### Prioridad de Queries

```typescript
// 1. Queries accesibles (mejores)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByPlaceholderText(/search/i);
screen.getByText(/welcome/i);

// 2. Queries semanticas
screen.getByAltText(/profile picture/i);
screen.getByTitle(/close/i);

// 3. Test IDs (ultimo recurso)
screen.getByTestId('custom-element');
```

### Mocking

```typescript
// Mockear servicios
vi.mock('@/services/user.service');

// Mockear hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User' },
    isAuthenticated: true
  })
}));

// Mockear componentes
vi.mock('@/components/ComplexComponent', () => ({
  ComplexComponent: () => <div>Mocked Component</div>
}));
```

## Analisis de Calidad

### Tests Flakey

```typescript
// ❌ MAL - Test flakey
it('should load data', () => {
  render(<DataComponent />);

  // No espera la carga asincrona
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ✅ BIEN - Test estable
it('should load data', async () => {
  render(<DataComponent />);

  // Espera la carga asincrona
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Tests Lentos

```typescript
// ❌ MAL - Multiples re-renders
it('should update state', () => {
  const { rerender } = render(<Component value={1} />);
  rerender(<Component value={2} />);
  rerender(<Component value={3} />);
  rerender(<Component value={4} />);
});

// ✅ BIEN - Test directo
it('should update state', async () => {
  render(<Component />);

  await userEvent.click(screen.getByRole('button'));

  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

## Tests de Hooks

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## Tests con MSW

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' }
    ]);
  })
];

// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Uso en tests
describe('UserList', () => {
  it('should display users', async () => {
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## Integracion CI/CD

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
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Lista de Verificacion

- [ ] Cobertura > 80% para codigo critico
- [ ] Tests siguen patron AAA
- [ ] Sin tests flakey
- [ ] Mocks apropiados para APIs
- [ ] Tests rapidos (< 5s por suite)
- [ ] Queries accesibles usadas
- [ ] Tests de integracion para flujos criticos
- [ ] Tests E2E para journeys de usuario
- [ ] CI/CD ejecuta tests automaticamente
- [ ] Cobertura monitoreada en el tiempo

## Herramientas

- **Vitest** - Framework de testing
- **React Testing Library** - Testing de componentes
- **Playwright** - Tests E2E
- **MSW** - Mocking de API
- **Codecov** - Reporte de cobertura

## Recursos

- [Documentacion Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Documentacion Playwright](https://playwright.dev/)
- [Guia de Testing de Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
