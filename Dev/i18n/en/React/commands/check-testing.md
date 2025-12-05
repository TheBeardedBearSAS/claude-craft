# Testing Strategy Check

Verify that the React application has comprehensive test coverage and follows testing best practices.

## What This Command Does

1. **Testing Analysis**
   - Check test coverage
   - Verify test quality
   - Validate testing patterns
   - Check test organization
   - Analyze test performance

2. **Metrics Measured**
   - Code coverage (lines, functions, branches)
   - Test count by type (unit, integration, e2e)
   - Test execution time
   - Flaky tests detection
   - Untested critical paths

3. **Generated Report**
   - Coverage report
   - Missing tests
   - Test quality score
   - Recommendations

## How to Use

```bash
# Run all tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# E2E tests
npm run test:e2e
```

## Test Coverage Analysis

### Coverage Targets

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

### Check Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Check specific threshold
npm run test:coverage -- --coverage.lines=90
```

## Test Types

### 1. Unit Tests (70% of tests)

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

### 2. Integration Tests (20% of tests)

```typescript
// UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UserManagement } from './UserManagement';

describe('UserManagement Integration', () => {
  it('should complete full user creation flow', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Wait for load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click add button
    await user.click(screen.getByRole('button', { name: /add user/i }));

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Verify
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E Tests (10% of tests)

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

## Test Quality Checks

### 1. AAA Pattern

```typescript
// ✅ GOOD - Arrange, Act, Assert
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

### 2. Test Behavior, Not Implementation

```typescript
// ❌ BAD - Testing implementation
it('should call setState', () => {
  const setStateSpy = vi.spyOn(React, 'useState');
  // ...
});

// ✅ GOOD - Testing behavior
it('should display incremented count', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 3. Descriptive Test Names

```typescript
// ❌ BAD - Vague names
it('works');
it('test 1');
it('should render');

// ✅ GOOD - Descriptive names
it('should display user name when user data is loaded');
it('should show error message when email is invalid');
it('should disable submit button while form is submitting');
```

### 4. Query Priority

```typescript
// ✅ GOOD - Accessible queries (best)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ⚠️ OK - Semantic queries
screen.getByAltText(/profile/i);
screen.getByTitle(/close/i);

// ❌ AVOID - Test IDs (last resort)
screen.getByTestId('custom-element');
```

## Test Organization

### Folder Structure

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx       # Unit tests
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
│   ├── setup.ts                  # Test setup
│   ├── mocks/
│   │   └── handlers.ts           # MSW handlers
│   └── utils/
│       └── test-utils.tsx        # Test utilities
│
└── e2e/                          # E2E tests
    ├── auth.spec.ts
    └── users.spec.ts
```

### Test Utilities

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

## Common Testing Issues

### Issue 1: Flaky Tests

```typescript
// ❌ BAD - Race condition
it('should load data', () => {
  render(<DataComponent />);
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
  // Fails randomly if data loads slowly
});

// ✅ GOOD - Wait for data
it('should load data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Issue 2: Missing Act Warnings

```typescript
// ❌ BAD - State update outside act
it('should update count', () => {
  const { result } = renderHook(() => useCounter());
  result.current.increment(); // Warning!
});

// ✅ GOOD - Wrap in act
it('should update count', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
});
```

### Issue 3: Not Cleaning Up

```typescript
// ✅ GOOD - Automatic cleanup
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

### Usage

```typescript
// test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Performance Testing

```typescript
// Check render performance
it('should render list efficiently', () => {
  const start = performance.now();

  render(<LargeList items={items} />);

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // ms
});
```

## Test Reports

### Coverage Report

```bash
# Generate HTML report
npm run test:coverage

# View report
open coverage/index.html

# CI: Upload to Codecov
bash <(curl -s https://codecov.io/bash)
```

### Test Results in CI

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

## Testing Checklist

- [ ] Unit tests for all components
- [ ] Unit tests for all hooks
- [ ] Unit tests for all utilities
- [ ] Integration tests for features
- [ ] E2E tests for critical flows
- [ ] Coverage > 80%
- [ ] No flaky tests
- [ ] Tests are fast (< 1s each)
- [ ] MSW for API mocking
- [ ] Test utilities extracted
- [ ] Tests follow AAA pattern
- [ ] Tests have descriptive names
- [ ] Tests use accessible queries

## Tools

- **Vitest**: Unit test runner
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking
- **Testing Library User Event**: User interactions
- **Codecov**: Coverage reporting

## Resources

- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
