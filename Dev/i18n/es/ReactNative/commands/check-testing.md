---
description: Verificación de Testing
---

# Verificación de Testing

Verifica la cobertura y calidad de los tests en React Native.

## 1. Ejecutar Tests

```bash
# Todos los tests
npm test

# En modo watch
npm test -- --watch

# Con cobertura
npm test -- --coverage

# Tests específicos
npm test -- UserProfile
```

## 2. Análisis de Cobertura

```bash
# Generar reporte de cobertura
npm test -- --coverage

# Ver reporte HTML
open coverage/lcov-report/index.html
```

**Objetivos de Cobertura:**
- Statements: > 80%
- Branches: > 80%
- Functions: > 80%
- Lines: > 80%

## 3. Tipos de Tests

### Tests Unitarios

```typescript
// Component.test.tsx
describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });
});
```

**Checklist:**
- [ ] Componentes críticos testeados
- [ ] Hooks personalizados testeados
- [ ] Utils y helpers testeados
- [ ] Edge cases cubiertos

### Tests de Integración

```typescript
// Feature.integration.test.tsx
describe('User Flow', () => {
  it('completes registration', async () => {
    const { getByText, getByPlaceholder } = render(<App />);

    // Navegar a registro
    fireEvent.press(getByText('Sign Up'));

    // Llenar formulario
    fireEvent.changeText(getByPlaceholder('Email'), 'user@test.com');

    // Submit
    fireEvent.press(getByText('Submit'));

    // Verificar
    await waitFor(() => {
      expect(getByText('Welcome')).toBeTruthy();
    });
  });
});
```

**Checklist:**
- [ ] Flujos de usuario críticos testeados
- [ ] Navegación testeada
- [ ] Formularios completos testeados
- [ ] Integración con APIs mockeada

### Tests E2E (Detox)

```typescript
// e2e/login.e2e.ts
describe('Login Flow', () => {
  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

**Checklist:**
- [ ] Flujos críticos E2E
- [ ] Login/Logout
- [ ] Flujos de compra/reserva
- [ ] Configuración Detox correcta

## 4. Calidad de los Tests

### Buenos Tests

```typescript
// ✅ BIEN - Descripción clara, AAA pattern
describe('UserProfile', () => {
  it('displays user name after successful fetch', async () => {
    // Arrange
    const mockUser = { name: 'John Doe' };
    server.use(
      http.get('/api/user', () => HttpResponse.json(mockUser))
    );

    // Act
    const { findByText } = render(<UserProfile />);

    // Assert
    const nameElement = await findByText('John Doe');
    expect(nameElement).toBeTruthy();
  });
});
```

**Checklist:**
- [ ] Nombres descriptivos
- [ ] Patrón AAA (Arrange, Act, Assert)
- [ ] Un solo concepto por test
- [ ] Tests independientes
- [ ] Sin lógica compleja en tests

## 5. Mocking

```typescript
// Mock de módulos
jest.mock('@/services/api', () => ({
  fetchUser: jest.fn()
}));

// Mock de hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn()
  })
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

**Checklist:**
- [ ] APIs mockeadas con MSW
- [ ] AsyncStorage mockeado
- [ ] Navigation mockeada
- [ ] Módulos nativos mockeados

## 6. Snapshot Tests

```typescript
it('matches snapshot', () => {
  const tree = renderer
    .create(<Button variant="primary">Click me</Button>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
```

**Checklist:**
- [ ] Componentes UI críticos con snapshots
- [ ] Snapshots actualizados regularmente
- [ ] Cambios de snapshot revisados
- [ ] No abusar de snapshots

## 7. Tests de Performance

```typescript
it('renders large list efficiently', () => {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

  const start = performance.now();
  render(<ItemList items={items} />);
  const end = performance.now();

  expect(end - start).toBeLessThan(100); // menos de 100ms
});
```

## 8. Reporte de Tests

```bash
# Ver reporte de cobertura
npm test -- --coverage

# Ver tests fallidos
npm test -- --onlyFailures

# Ver tests lentos
npm test -- --verbose
```

## Métricas Clave

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Cobertura Total | > 80% | ___% |
| Tests Unitarios | > 500 | ___ |
| Tests Integración | > 50 | ___ |
| Tests E2E | > 10 | ___ |
| Tiempo Ejecución | < 5 min | ___ |

## Problemas Comunes

### Tests Lentos
```bash
# Identificar tests lentos
npm test -- --verbose

# Usar test.concurrent para paralelizar
it.concurrent('test 1', async () => {});
```

### Tests Flaky
- Usar waitFor para esperas asíncronas
- No usar timeouts arbitrarios
- Mockear APIs correctamente
- Limpiar estado entre tests

### Baja Cobertura
- Identificar archivos sin cobertura
- Priorizar componentes críticos
- Escribir tests antes del código (TDD)
- Refactorizar código no testeable

## Reporte Final

**Estado de Testing:**
- [ ] Cobertura > 80%
- [ ] Todos los tests pasando
- [ ] Sin tests flaky
- [ ] Tests rápidos (< 5 min)
- [ ] CI/CD configurado
- [ ] Tests E2E funcionando
