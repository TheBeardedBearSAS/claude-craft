# Svelte 5.x + SvelteKit 2.x - Quick Reference

> ⚠️ **Experimental** — This stack is community-maintained and may not be up-to-date.

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Svelte | 5.x | Runes (`$state`, `$derived`, `$effect`, `$props`) |
| SvelteKit | 2.x | File-based routing, form actions, load functions |
| Vite | 6.x | Build tool officiel |
| TypeScript | 5.8+ | First-class support |
| Vitest | 4.1+ | Browser Mode stable (Chromium/WebKit) |

## Architecture Feature-Based

```
src/
├── lib/
│   ├── features/         # Features isolées
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── stores/      # Stores legacy ou state classes
│   │   │   ├── actions/
│   │   │   └── types/
│   │   ├── products/
│   │   └── cart/
│   ├── components/       # Composants partagés
│   │   ├── ui/          # Boutons, inputs, modals
│   │   └── layout/      # Header, footer, navigation
│   ├── types/           # Types TypeScript globaux
│   ├── utils/           # Helpers, formatters
│   └── server/          # Code server-only
├── routes/              # SvelteKit file-based routing
│   ├── +page.svelte
│   ├── +page.server.ts  # Load function SSR
│   ├── auth/
│   │   ├── login/
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   └── register/
│   └── api/            # API routes
│       └── users/
│           └── +server.ts
└── app.html
```

**Règle d'or** : une feature = un dossier autonome (composants + state + types).

## Svelte 5 Runes (Migration depuis Svelte 4)

| Svelte 4 | Svelte 5 |
|----------|----------|
| `let count = 0` | `let count = $state(0)` |
| `$: double = count * 2` | `let double = $derived(count * 2)` |
| `$: { console.log(count) }` | `$effect(() => console.log(count))` |
| `export let name` | `let { name } = $props()` |
| `on:click={handler}` | `onclick={handler}` |
| `bind:value={text}` | `bind:value={text}` (inchangé) |

### Exemples Runes

```svelte
<script lang="ts">
// State réactif
let count = $state(0);

// Computed (dérivé)
let double = $derived(count * 2);

// Props
let { name, age = 18 } = $props<{ name: string; age?: number }>();

// Bindable props (parent peut modifier)
let { value = $bindable(0) } = $props<{ value?: number }>();

// Effect (side effects)
$effect(() => {
    console.log('Count changed:', count);
    // Cleanup
    return () => console.log('cleanup');
});

// Inspect (debug uniquement)
$inspect(count, double);
</script>

<button onclick={() => count++}>
    {count} x 2 = {double}
</button>
```

### State Classes (alternative stores)

```ts
// src/lib/features/cart/cart-state.svelte.ts
class CartState {
    items = $state<CartItem[]>([]);
    
    get total() {
        return $derived(this.items.reduce((sum, item) => sum + item.price, 0));
    }

    addItem(item: CartItem) {
        this.items.push(item);
    }

    clear() {
        this.items = [];
    }
}

export const cart = new CartState();
```

```svelte
<script lang="ts">
import { cart } from '$lib/features/cart/cart-state.svelte';
</script>

<p>Total: {cart.total}</p>
<button onclick={() => cart.addItem({ id: '1', price: 10 })}>
    Add Item
</button>
```

## SvelteKit Routing

### File-Based Routes

```
routes/
├── +page.svelte              # /
├── +page.server.ts           # SSR load function
├── about/
│   └── +page.svelte          # /about
├── products/
│   ├── +page.svelte          # /products
│   ├── +page.server.ts
│   └── [id]/
│       ├── +page.svelte      # /products/123
│       └── +page.server.ts
└── api/
    └── products/
        └── +server.ts        # GET/POST /api/products
```

### Load Functions

```ts
// routes/products/[id]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
    
    return {
        product,
    };
};
```

```svelte
<!-- routes/products/[id]/+page.svelte -->
<script lang="ts">
let { data } = $props();
</script>

<h1>{data.product.name}</h1>
<p>{data.product.price}</p>
```

### Form Actions

```ts
// routes/auth/login/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        // Validation
        if (!email || !password) {
            return fail(400, { message: 'Email and password required' });
        }

        // Auth
        const user = await authenticate(email, password);
        if (!user) {
            return fail(401, { message: 'Invalid credentials' });
        }

        cookies.set('session', user.sessionToken, { path: '/' });
        throw redirect(303, '/dashboard');
    },
};
```

```svelte
<!-- routes/auth/login/+page.svelte -->
<script lang="ts">
import { enhance } from '$app/forms';
let { form } = $props();
</script>

<form method="POST" use:enhance>
    <input name="email" type="email" required />
    <input name="password" type="password" required />
    {#if form?.message}
        <p class="error">{form.message}</p>
    {/if}
    <button type="submit">Login</button>
</form>
```

## State Management

### Stores (legacy, compat Svelte 4)

```ts
// src/lib/stores/user.ts
import { writable } from 'svelte/store';

export const user = writable<User | null>(null);
```

```svelte
<script lang="ts">
import { user } from '$lib/stores/user';
</script>

<p>Hello, {$user?.name}</p>
```

### Runes State Classes (recommandé Svelte 5)

```ts
// src/lib/features/auth/auth-state.svelte.ts
class AuthState {
    user = $state<User | null>(null);

    get isAuthenticated() {
        return $derived(this.user !== null);
    }

    login(u: User) {
        this.user = u;
    }

    logout() {
        this.user = null;
    }
}

export const auth = new AuthState();
```

## Testing 2026

### Vitest 4 Browser Mode (recommandé)

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    test: {
        browser: {
            enabled: true,
            name: 'chromium', // ou 'firefox', 'webkit'
            provider: 'playwright',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            thresholds: {
                lines: 80,
            },
        },
    },
});
```

### @testing-library/svelte

```ts
// src/lib/components/Counter.test.ts
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Counter from './Counter.svelte';

test('increments counter on click', async () => {
    render(Counter);
    
    const button = screen.getByRole('button', { name: /increment/i });
    expect(screen.getByText('Count: 0')).toBeInTheDocument();

    await userEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Playwright E2E

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
```

## i18n (inlang/paraglide-sveltekit)

```bash
npm install -D @inlang/paraglide-sveltekit
```

```ts
// src/lib/i18n/messages/en.json
{
    "hello": "Hello, {name}!",
    "products.count": "{count} products"
}
```

```svelte
<script lang="ts">
import * as m from '$lib/paraglide/messages';
import { languageTag } from '$lib/paraglide/runtime';
</script>

<p>{m.hello({ name: 'World' })}</p>
<p>Current language: {languageTag()}</p>
```

## Commandes

```bash
# Dev
npm run dev

# Build
npm run build
npm run preview

# Tests
npm run test          # Vitest
npm run test:e2e      # Playwright

# Qualité
npm run check         # svelte-check (TypeScript)
npm run lint          # ESLint
npm run format        # Prettier
```

## Adapters Déploiement

```ts
// svelte.config.js
import adapter from '@sveltejs/adapter-node';         // Node.js
// import adapter from '@sveltejs/adapter-vercel';    // Vercel
// import adapter from '@sveltejs/adapter-cloudflare'; // Cloudflare Pages
// import adapter from '@sveltejs/adapter-static';    // Static site

export default {
    kit: {
        adapter: adapter(),
    },
};
```

## Best Practices 2026

### TypeScript First-Class

```svelte
<script lang="ts">
interface Props {
    items: Product[];
    onSelect?: (item: Product) => void;
}

let { items, onSelect }: Props = $props();
</script>
```

### Component Composition

```svelte
<!-- Card.svelte -->
<script lang="ts">
let { children } = $props();
</script>

<div class="card">
    {@render children()}
</div>
```

```svelte
<!-- Usage -->
<Card>
    <h2>Title</h2>
    <p>Content</p>
</Card>
```

## Documentation Complète

- `rules/01-architecture.md` - Feature-based structure + patterns
- `rules/02-testing.md` - Vitest Browser Mode + Playwright
- `rules/03-security.md` - CSRF, XSS, CSP, auth

## Checklist Rapide

- [ ] Svelte 5.x + SvelteKit 2.x
- [ ] Runes (`$state`, `$derived`, `$effect`, `$props`)
- [ ] State classes pour global state
- [ ] TypeScript first-class
- [ ] Vitest 4 Browser Mode
- [ ] Playwright E2E
- [ ] Coverage ≥ 80%
- [ ] Form actions pour mutations
- [ ] Load functions SSR
- [ ] i18n (paraglide-sveltekit)
