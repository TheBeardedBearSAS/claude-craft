# Testing Svelte 5 — Vitest Browser Mode + Playwright

## Vue d'ensemble

Le testing Svelte 5 privilégie Vitest 4 Browser Mode pour les composants et Playwright pour E2E.

**Principes** :
- ✅ Pyramide : 70% unit, 20% integration, 10% E2E
- ✅ Vitest Browser Mode (Chromium/WebKit) > JSDOM
- ✅ @testing-library/svelte pour composants
- ✅ Playwright pour E2E
- ✅ Coverage ≥ 80%

---

## Configuration Vitest 4

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    test: {
        browser: {
            enabled: true,
            name: 'chromium', // ou 'firefox', 'webkit'
            provider: 'playwright',
            headless: true,
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json'],
            exclude: ['**/*.test.ts', '**/tests/**'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80,
            },
        },
        setupFiles: ['./tests/setup.ts'],
    },
});
```

### tests/setup.ts

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// Cleanup après chaque test
afterEach(() => {
    cleanup();
});
```

---

## Tests Composants

### Test Simple

```ts
// src/lib/components/ui/Button.test.ts
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import Button from './Button.svelte';

test('renders button with text', () => {
    render(Button, { props: { children: 'Click me' } });
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
});

test('calls onclick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(Button, { props: { onclick: handleClick } });

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
});

test('applies variant classes', () => {
    render(Button, { props: { variant: 'primary' } });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
});
```

### Test avec State

```ts
// src/lib/features/cart/components/CartItem.test.ts
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test } from 'vitest';
import CartItem from './CartItem.svelte';

test('increments quantity when + button clicked', async () => {
    const product = { id: '1', name: 'Product', price: 10 };
    render(CartItem, { props: { product, quantity: 1 } });

    expect(screen.getByText('Quantity: 1')).toBeInTheDocument();

    const incrementButton = screen.getByRole('button', { name: /\+/i });
    await userEvent.click(incrementButton);

    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
});
```

### Test avec Props

```ts
// src/lib/components/ProductCard.test.ts
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import ProductCard from './ProductCard.svelte';

test('displays product information', () => {
    const product = {
        id: '1',
        name: 'Test Product',
        description: 'A great product',
        price: 29.99,
    };

    render(ProductCard, { props: { product } });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('A great product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
});
```

---

## Tests Load Functions

```ts
// src/routes/products/[id]/+page.server.test.ts
import { expect, test, vi } from 'vitest';
import { load } from './+page.server';

test('returns product data', async () => {
    const mockDb = {
        products: {
            findById: vi.fn().mockResolvedValue({
                id: '1',
                name: 'Product',
                price: 10,
            }),
            findRelated: vi.fn().mockResolvedValue([]),
        },
    };

    const result = await load({
        params: { id: '1' },
        fetch: global.fetch,
    } as any);

    expect(result.product).toEqual({
        id: '1',
        name: 'Product',
        price: 10,
    });
});

test('throws 404 when product not found', async () => {
    const mockDb = {
        products: {
            findById: vi.fn().mockResolvedValue(null),
        },
    };

    await expect(
        load({
            params: { id: 'nonexistent' },
            fetch: global.fetch,
        } as any)
    ).rejects.toThrow('Product not found');
});
```

---

## Tests Form Actions

```ts
// src/routes/auth/login/+page.server.test.ts
import { expect, test, vi } from 'vitest';
import { actions } from './+page.server';

test('login action returns error for invalid credentials', async () => {
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'wrong');

    const request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
    });

    const result = await actions.default({
        request,
        cookies: {
            set: vi.fn(),
        } as any,
    } as any);

    expect(result).toEqual({
        status: 401,
        data: { message: 'Invalid credentials' },
    });
});

test('login action sets cookie on success', async () => {
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'correct');

    const request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
    });

    const setCookie = vi.fn();

    await actions.default({
        request,
        cookies: { set: setCookie } as any,
    } as any);

    expect(setCookie).toHaveBeenCalledWith('session', expect.any(String), {
        path: '/',
    });
});
```

---

## Tests State Classes

```ts
// src/lib/features/cart/cart-state.test.ts
import { expect, test } from 'vitest';
import { CartState } from './cart-state.svelte';

test('adds item to cart', () => {
    const cart = new CartState();
    const product = { id: '1', name: 'Product', price: 10 };

    cart.addItem(product);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].product).toEqual(product);
    expect(cart.items[0].quantity).toBe(1);
});

test('increments quantity for existing item', () => {
    const cart = new CartState();
    const product = { id: '1', name: 'Product', price: 10 };

    cart.addItem(product);
    cart.addItem(product);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
});

test('calculates total correctly', () => {
    const cart = new CartState();
    
    cart.addItem({ id: '1', name: 'Product 1', price: 10 });
    cart.addItem({ id: '2', name: 'Product 2', price: 20 });

    expect(cart.total).toBe(30);
});
```

---

## Tests E2E (Playwright)

### Configuration

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
    },
});
```

### Test E2E

```ts
// tests/e2e/auth.spec.ts
import { expect, test } from '@playwright/test';

test('user can login', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
});

test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
});
```

### Test E2E avec User Flow

```ts
// tests/e2e/shopping.spec.ts
import { expect, test } from '@playwright/test';

test('user can add product to cart and checkout', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Browse products
    await page.goto('/products');
    await page.click('text=Test Product');

    // Add to cart
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('text=1 item')).toBeVisible();

    // Go to cart
    await page.click('a:has-text("Cart")');
    await expect(page.locator('text=Test Product')).toBeVisible();

    // Checkout
    await page.click('button:has-text("Checkout")');
    await page.fill('input[name="address"]', '123 Main St');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+/);
    await expect(page.locator('text=Order confirmed')).toBeVisible();
});
```

---

## Visual Regression Testing

```ts
// tests/e2e/visual.spec.ts
import { expect, test } from '@playwright/test';

test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
});

test('product page matches snapshot', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page).toHaveScreenshot('product-page.png');
});
```

```bash
# Générer snapshots de référence
npx playwright test --update-snapshots

# Comparer avec snapshots
npx playwright test
```

---

## Coverage

```bash
# Coverage Vitest
npm run test -- --coverage

# Seuil minimum
npm run test -- --coverage --coverage.thresholds.lines=80
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Best Practices

### Test Isolation

```ts
test('each test creates its own state', () => {
    // Setup
    const cart = new CartState();
    const product = { id: '1', name: 'Product', price: 10 };

    // Execute
    cart.addItem(product);

    // Assert
    expect(cart.items).toHaveLength(1);

    // Cleanup automatique (nouveau cart au prochain test)
});
```

### Mock Fetch

```ts
// tests/utils/mocks.ts
export function mockFetch(data: any) {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => data,
    });
}
```

```ts
// Usage
import { mockFetch } from '../utils/mocks';

test('loads products from API', async () => {
    mockFetch([{ id: '1', name: 'Product' }]);

    const result = await load({ fetch: global.fetch } as any);

    expect(result.products).toHaveLength(1);
});
```

### Test Accessibility

```ts
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/svelte';

expect.extend(toHaveNoViolations);

test('component has no accessibility violations', async () => {
    const { container } = render(Button);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
});
```

---

## Checklist Testing

- [ ] Vitest 4 Browser Mode configuré
- [ ] @testing-library/svelte pour composants
- [ ] Tests unitaires pour logique métier
- [ ] Tests load functions
- [ ] Tests form actions
- [ ] Tests state classes
- [ ] Playwright E2E pour user flows
- [ ] Coverage ≥ 80%
- [ ] Visual regression (snapshots Playwright)
- [ ] Tests accessibilité (jest-axe)

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
