# React 19 — Nouvelles Fonctionnalités

**Version :** React 19.2.5+ | React Compiler 1.0 (octobre 2025)

## Vue d'ensemble

React 19 introduit des changements majeurs : Server Components, Actions, nouveaux hooks (`use()`, `useOptimistic`, `useFormStatus`, `useActionState`), et React Compiler 1.0 pour l'auto-memoization.

**Sources :**
- [react.dev/blog/2025/10/07/react-compiler-1](https://react.dev/blog/2025/10/07/react-compiler-1)
- [dev.to/jay_sarvaiya_reactjs/react-19-best-practices-write-clean-modern-and-efficient-react-code-1beb](https://dev.to/jay_sarvaiya_reactjs/react-19-best-practices-write-clean-modern-and-efficient-react-code-1beb)

---

## React Compiler 1.0 — Auto-Memoization

### Principe

Le compilateur analyse le code React et insère automatiquement la memoization où nécessaire. **Plus besoin de `useMemo`, `useCallback`, ou `React.memo` dans 90% des cas.**

### Installation

```bash
npm install babel-plugin-react-compiler
npm install -D eslint-plugin-react-compiler
```

**Vite (vite.config.ts) :**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    })
  ]
});
```

**Next.js (next.config.mjs) :**
```javascript
const nextConfig = {
  experimental: {
    reactCompiler: true
  }
};
export default nextConfig;
```

### Exemple

#### Avant (React 18)
```tsx
// ❌ Memoization manuelle obligatoire
const ProductList = ({ products, category }) => {
  const filteredProducts = useMemo(
    () => products.filter(p => p.category === category),
    [products, category]
  );

  const handleAddToCart = useCallback((productId) => {
    addToCart(productId);
  }, []);

  return (
    <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
  );
};

const ProductGrid = React.memo(({ products, onAddToCart }) => {
  return products.map(p => <ProductCard key={p.id} product={p} onAdd={onAddToCart} />);
});
```

#### Après (React 19 + Compiler 1.0)
```tsx
// ✅ Auto-memoization par le compilateur
const ProductList = ({ products, category }) => {
  // Automatiquement memoïsé
  const filteredProducts = products.filter(p => p.category === category);

  // Automatiquement memoïsé
  const handleAddToCart = (productId) => {
    addToCart(productId);
  };

  return (
    <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
  );
};

// Plus besoin de React.memo (déjà optimisé par le compilateur)
const ProductGrid = ({ products, onAddToCart }) => {
  return products.map(p => <ProductCard key={p.id} product={p} onAdd={onAddToCart} />);
};
```

### Règle de lint

```javascript
// .eslintrc.cjs
module.exports = {
  extends: ['plugin:react-compiler/recommended'],
  // ...
};
```

Le plugin détecte les violations des règles du compilateur (mutations, side effects, etc.).

---

## Hook `use()` — Promises et Context

### Lecture de Promises

Le hook `use()` permet de lire directement une Promise dans un composant. Suspense gère automatiquement le loading state.

```tsx
// ✅ Nouveau pattern React 19
const UserProfile = ({ userPromise }: { userPromise: Promise<User> }) => {
  // use() suspend le composant jusqu'à la résolution
  const user = use(userPromise);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

// Usage avec Suspense
const App = () => {
  const userPromise = fetchUser('123');

  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
};
```

**Avantages vs `useEffect` :**
- Pas de state `[data, setData]` nécessaire
- Suspense gère automatiquement le loading
- Code plus simple et lisible

**Source :** [react.dev/reference/react/use](https://react.dev/reference/react/use)

### Lecture de Context

```tsx
const ThemeContext = createContext<Theme>('light');

const Button = () => {
  // Alternative à useContext
  const theme = use(ThemeContext);

  return <button className={theme}>Click me</button>;
};
```

---

## Hook `useOptimistic` — Optimistic UI

Afficher immédiatement une mise à jour avant la confirmation serveur.

```tsx
const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  const handleAddTodo = async (text: string) => {
    const tempTodo = { id: crypto.randomUUID(), text, completed: false };
    
    // Ajout optimiste immédiat
    addOptimisticTodo(tempTodo);

    // Envoi au serveur
    const savedTodo = await createTodo(text);
    
    // Mise à jour réelle après confirmation
    setTodos(prev => [...prev, savedTodo]);
  };

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id} className={todo.pending ? 'opacity-50' : ''}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
};
```

**Source :** [react.dev/reference/react/useOptimistic](https://react.dev/reference/react/useOptimistic)

---

## Server Components et Actions

### Server Component (défaut)

**Pas de "use client"** → le composant s'exécute côté serveur.

```tsx
// ServerProductList.tsx (Server Component)
import { db } from '@/lib/database';

const ServerProductList = async () => {
  // Query directe depuis le serveur
  const products = await db.product.findMany();

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};

export default ServerProductList;
```

**Avantages :**
- Bundle JS -40% (pas de code client)
- Accès direct aux bases de données
- Secrets serveur sécurisés

### Client Component

**"use client"** → le composant s'exécute côté client (hooks, événements).

```tsx
// InteractiveCounter.tsx (Client Component)
"use client";

import { useState } from 'react';

const InteractiveCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
};

export default InteractiveCounter;
```

### Server Actions

Fonctions serveur appelées depuis le client (alternative à API REST).

```tsx
// actions/user.ts (Server Action)
"use server";

import { db } from '@/lib/database';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  const user = await db.user.create({
    data: { name, email }
  });

  return user;
}
```

**Usage depuis un Client Component :**
```tsx
"use client";

import { createUser } from '@/actions/user';

const UserForm = () => {
  const handleSubmit = async (formData: FormData) => {
    const user = await createUser(formData);
    console.log('User created:', user);
  };

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  );
};
```

**Source :** [react.dev/reference/rsc/server-actions](https://react.dev/reference/rsc/server-actions)

---

## Hook `useFormStatus` — Statut de soumission

Obtenir l'état de soumission d'un formulaire parent.

```tsx
"use client";

import { useFormStatus } from 'react-dom';

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
};

const UserForm = () => {
  return (
    <form action={createUser}>
      <input name="name" required />
      <SubmitButton />
    </form>
  );
};
```

**Source :** [react.dev/reference/react-dom/hooks/useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)

---

## Hook `useActionState` — État d'action

Gérer l'état d'une Server Action avec reducers.

```tsx
"use client";

import { useActionState } from 'react';
import { createUser } from '@/actions/user';

const UserForm = () => {
  const [state, formAction] = useActionState(createUser, {
    error: null,
    success: false
  });

  return (
    <form action={formAction}>
      <input name="name" required />
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">User created!</p>}
      <button type="submit">Create</button>
    </form>
  );
};
```

**Source :** [react.dev/reference/react/useActionState](https://react.dev/reference/react/useActionState)

---

## Suspense — Patterns avancés

### Prévention des waterfalls

```tsx
// ❌ MAUVAIS : waterfall (séquentiel)
const Dashboard = () => {
  const user = use(fetchUser());
  const posts = use(fetchPosts(user.id)); // Attend fetchUser
  const comments = use(fetchComments(user.id)); // Attend fetchPosts

  return <div>...</div>;
};

// ✅ BON : parallélisation
const Dashboard = () => {
  const userPromise = fetchUser();
  const user = use(userPromise);

  // Démarrer en parallèle
  const postsPromise = fetchPosts(user.id);
  const commentsPromise = fetchComments(user.id);

  const posts = use(postsPromise);
  const comments = use(commentsPromise);

  return <div>...</div>;
};
```

### Suspense boundaries multiples

```tsx
const App = () => (
  <div>
    <Suspense fallback={<HeaderSkeleton />}>
      <Header />
    </Suspense>

    <Suspense fallback={<MainSkeleton />}>
      <MainContent />
    </Suspense>

    <Suspense fallback={<SidebarSkeleton />}>
      <Sidebar />
    </Suspense>
  </div>
);
```

Chaque section charge indépendamment (progressive rendering).

**Source :** [react.dev/reference/react/Suspense](https://react.dev/reference/react/Suspense)

---

## Error Boundaries

Capturer les erreurs de rendu dans les Server et Client Components.

```tsx
// ErrorBoundary.tsx (Client Component)
"use client";

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Usage :**
```tsx
const App = () => (
  <ErrorBoundary fallback={<ErrorPage />}>
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  </ErrorBoundary>
);
```

**Source :** [react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

## Écosystème React 19 (2026)

| Bibliothèque | Version | Usage |
|--------------|---------|-------|
| **React** | 19.2.5 | Core |
| **React Compiler** | 1.0+ | Auto-memoization |
| **Zustand** | 5.0.12 | State management |
| **TanStack Query** | 5.99.0 | Server state (cache, revalidation) |
| **React Router** | 7.8.0 | Routing |
| **Zod** | 3.24.2 | Schema validation |
| **Vitest** | 4.1+ | Tests (Browser Mode) |
| **Playwright** | 1.52.0 | Tests E2E |

**Source :** [TanStack Query v5](https://tanstack.com/query/latest), [Zustand v5](https://zustand-demo.pmnd.rs/)

---

## Checklist React 19

### Avant migration

- [ ] Vérifier compatibilité des bibliothèques tierces
- [ ] Lire les breaking changes ([react.dev/blog/2024/04/25/react-19-upgrade-guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide))
- [ ] Activer React Compiler 1.0
- [ ] Installer `eslint-plugin-react-compiler`

### Après migration

- [ ] Supprimer `useMemo` / `useCallback` / `React.memo` redondants
- [ ] Remplacer `useEffect` async par `use(promise)`
- [ ] Vérifier les performances avec React DevTools Profiler
- [ ] Tester les Server Components avec bundle analyzer (< 200KB initial)

---

**Dernière mise à jour :** 2026-04-14
**Version :** 1.0.0
**Auteur :** The Bearded CTO
