# Architecture Svelte 5 — Feature-Based + Runes

## Vue d'ensemble

L'architecture Svelte 5 privilégie une organisation feature-based avec runes pour le state management.

**Principes** :
- ✅ Features isolées (composants + state + types)
- ✅ Runes (`$state`, `$derived`) > stores legacy
- ✅ TypeScript obligatoire
- ✅ Server/client code séparé
- ✅ Form actions > endpoints API pour mutations

---

## Structure Projet Recommandée

```
my-app/
├── src/
│   ├── lib/
│   │   ├── features/         # Features isolées
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoginForm.svelte
│   │   │   │   │   └── RegisterForm.svelte
│   │   │   │   ├── auth-state.svelte.ts  # State class
│   │   │   │   ├── auth-actions.ts       # Actions helpers
│   │   │   │   └── types.ts
│   │   │   ├── products/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProductCard.svelte
│   │   │   │   │   └── ProductList.svelte
│   │   │   │   ├── product-state.svelte.ts
│   │   │   │   └── types.ts
│   │   │   └── cart/
│   │   │       ├── components/
│   │   │       ├── cart-state.svelte.ts
│   │   │       └── types.ts
│   │   │
│   │   ├── components/       # Composants partagés
│   │   │   ├── ui/          # Design System
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   └── Modal.svelte
│   │   │   └── layout/
│   │   │       ├── Header.svelte
│   │   │       ├── Footer.svelte
│   │   │       └── Navigation.svelte
│   │   │
│   │   ├── types/           # Types TypeScript globaux
│   │   │   ├── index.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── utils/           # Helpers, formatters
│   │   │   ├── format.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── server/          # Code server-only
│   │       ├── db.ts
│   │       └── auth.ts
│   │
│   ├── routes/              # SvelteKit file-based routing
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── +page.server.ts
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.server.ts
│   │   │   └── register/
│   │   │       ├── +page.svelte
│   │   │       └── +page.server.ts
│   │   ├── products/
│   │   │   ├── +page.svelte
│   │   │   ├── +page.server.ts
│   │   │   └── [id]/
│   │   │       ├── +page.svelte
│   │   │       └── +page.server.ts
│   │   └── api/
│   │       └── products/
│   │           └── +server.ts
│   │
│   ├── hooks.server.ts      # Server hooks (auth, errors)
│   └── app.html
│
├── static/                  # Fichiers statiques
├── tests/
│   ├── unit/
│   └── e2e/
└── svelte.config.js
```

---

## Runes State Management

### State Local (composant)

```svelte
<script lang="ts">
// State réactif local
let count = $state(0);

// Computed (dérivé)
let double = $derived(count * 2);
let isEven = $derived(count % 2 === 0);

// Effect (side effects)
$effect(() => {
    console.log('Count changed:', count);
    
    // Cleanup
    return () => {
        console.log('Effect cleanup');
    };
});

function increment() {
    count++;
}
</script>

<button onclick={increment}>
    {count} (double: {double}, even: {isEven})
</button>
```

### State Global (State Class)

```ts
// src/lib/features/cart/cart-state.svelte.ts
import type { Product } from '$lib/types';

interface CartItem {
    product: Product;
    quantity: number;
}

class CartState {
    items = $state<CartItem[]>([]);

    get total() {
        return $derived(
            this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        );
    }

    get itemCount() {
        return $derived(this.items.reduce((sum, item) => sum + item.quantity, 0));
    }

    addItem(product: Product) {
        const existing = this.items.find(i => i.product.id === product.id);
        
        if (existing) {
            existing.quantity++;
        } else {
            this.items.push({ product, quantity: 1 });
        }
    }

    removeItem(productId: string) {
        this.items = this.items.filter(i => i.product.id !== productId);
    }

    clear() {
        this.items = [];
    }
}

export const cart = new CartState();
```

```svelte
<!-- Usage -->
<script lang="ts">
import { cart } from '$lib/features/cart/cart-state.svelte';
import type { Product } from '$lib/types';

let { product }: { product: Product } = $props();
</script>

<div>
    <h2>{product.name}</h2>
    <p>${product.price}</p>
    <button onclick={() => cart.addItem(product)}>
        Add to Cart
    </button>
</div>

<aside>
    Cart: {cart.itemCount} items, Total: ${cart.total}
</aside>
```

---

## SvelteKit Load Functions

### Server Load (SSR)

```ts
// routes/products/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const product = await db.products.findById(params.id);

    if (!product) {
        throw error(404, 'Product not found');
    }

    // Fetch related products
    const relatedProducts = await db.products.findRelated(product.categoryId, { limit: 4 });

    return {
        product,
        relatedProducts,
    };
};
```

```svelte
<!-- routes/products/[id]/+page.svelte -->
<script lang="ts">
let { data } = $props();
</script>

<h1>{data.product.name}</h1>
<p>{data.product.description}</p>
<p>${data.product.price}</p>

<h2>Related Products</h2>
{#each data.relatedProducts as product}
    <ProductCard {product} />
{/each}
```

### Client Load (CSR)

```ts
// routes/dashboard/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    // Fetch côté client
    const stats = await fetch('/api/stats').then(r => r.json());

    return {
        stats,
    };
};
```

---

## Form Actions (mutations)

### Form Action Server

```ts
// routes/products/new/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';

const productSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10),
    price: z.number().positive(),
    categoryId: z.string().uuid(),
});

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: Number(formData.get('price')),
            categoryId: formData.get('categoryId'),
        };

        // Validation
        const result = productSchema.safeParse(data);
        if (!result.success) {
            return fail(400, {
                errors: result.error.flatten().fieldErrors,
                data,
            });
        }

        // Save
        const product = await db.products.create(result.data);

        throw redirect(303, `/products/${product.id}`);
    },
};
```

```svelte
<!-- routes/products/new/+page.svelte -->
<script lang="ts">
import { enhance } from '$app/forms';

let { form } = $props();
</script>

<form method="POST" action="?/create" use:enhance>
    <label>
        Name
        <input 
            name="name" 
            value={form?.data?.name ?? ''} 
            required 
        />
        {#if form?.errors?.name}
            <span class="error">{form.errors.name[0]}</span>
        {/if}
    </label>

    <label>
        Description
        <textarea 
            name="description" 
            required
        >{form?.data?.description ?? ''}</textarea>
        {#if form?.errors?.description}
            <span class="error">{form.errors.description[0]}</span>
        {/if}
    </label>

    <label>
        Price
        <input 
            name="price" 
            type="number" 
            step="0.01" 
            value={form?.data?.price ?? ''} 
            required 
        />
        {#if form?.errors?.price}
            <span class="error">{form.errors.price[0]}</span>
        {/if}
    </label>

    <button type="submit">Create Product</button>
</form>
```

---

## Component Patterns

### Props (TypeScript)

```svelte
<script lang="ts">
interface Props {
    title: string;
    description?: string;
    count?: number;
    onSubmit?: (value: string) => void;
}

let { 
    title, 
    description = 'Default description', 
    count = 0,
    onSubmit,
}: Props = $props();
</script>

<h1>{title}</h1>
<p>{description}</p>
<p>Count: {count}</p>
```

### Bindable Props

```svelte
<!-- Counter.svelte -->
<script lang="ts">
let { value = $bindable(0) } = $props<{ value?: number }>();
</script>

<button onclick={() => value++}>
    Increment: {value}
</button>
```

```svelte
<!-- Parent.svelte -->
<script lang="ts">
import Counter from './Counter.svelte';

let count = $state(0);
</script>

<Counter bind:value={count} />
<p>Parent count: {count}</p>
```

### Slots (children)

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
    <p>Content goes here</p>
</Card>
```

### Named Slots

```svelte
<!-- Modal.svelte -->
<script lang="ts">
let { header, footer, children } = $props();
</script>

<div class="modal">
    <header>
        {@render header?.()}
    </header>
    
    <main>
        {@render children()}
    </main>
    
    <footer>
        {@render footer?.()}
    </footer>
</div>
```

```svelte
<!-- Usage -->
<Modal>
    {#snippet header()}
        <h2>Modal Title</h2>
    {/snippet}

    <p>Modal content</p>

    {#snippet footer()}
        <button>Close</button>
    {/snippet}
</Modal>
```

---

## Hooks (server/client)

### hooks.server.ts

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleAuth: Handle = async ({ event, resolve }) => {
    const sessionToken = event.cookies.get('session');

    if (sessionToken) {
        event.locals.user = await getUserFromSession(sessionToken);
    }

    return resolve(event);
};

const handleErrors: Handle = async ({ event, resolve }) => {
    try {
        return await resolve(event);
    } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const handle = sequence(handleAuth, handleErrors);
```

### app.d.ts (types locaux)

```ts
// src/app.d.ts
declare global {
    namespace App {
        interface Locals {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }

        interface PageData {
            user?: App.Locals['user'];
        }
    }
}

export {};
```

---

## API Routes

```ts
// routes/api/products/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string(),
    price: z.number().positive(),
});

export const GET: RequestHandler = async ({ url }) => {
    const limit = Number(url.searchParams.get('limit')) || 10;
    const products = await db.products.findMany({ limit });

    return json(products);
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();

    const result = productSchema.safeParse(body);
    if (!result.success) {
        throw error(400, result.error.message);
    }

    const product = await db.products.create(result.data);

    return json(product, { status: 201 });
};
```

---

## Checklist Architecture

- [ ] Structure feature-based (`lib/features/`)
- [ ] Runes (`$state`, `$derived`) pour state local
- [ ] State classes pour state global
- [ ] TypeScript first-class (types strictes)
- [ ] Load functions SSR pour données
- [ ] Form actions pour mutations
- [ ] hooks.server.ts pour auth/errors
- [ ] app.d.ts pour types locaux
- [ ] Components UI partagés (`lib/components/ui/`)
- [ ] Server code isolé (`lib/server/`)

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
