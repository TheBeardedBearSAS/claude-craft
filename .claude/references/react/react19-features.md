# React 19 — Nouvelles Fonctionnalités

**Version :** React 19.2.x (latest: 19.2.7) | React Compiler 1.0 (octobre 2025)

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

**Vite avec `@vitejs/plugin-react` v6+ (Vite 8) :**

> ⚠️ **Rupture depuis `@vitejs/plugin-react` v6 / Vite 8 :** la config `babel.plugins` dans `react({ babel: ... })` ne fonctionne plus pour le React Compiler. Il faut utiliser `@rolldown/plugin-babel` avec `reactCompilerPreset` (recommandé) ou `babel-plugin-react-compiler` directement.

```bash
npm install -D @rolldown/plugin-babel
```

```typescript
// vite.config.ts — @vitejs/plugin-react v6+ (Vite 8)
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    }),
  ],
});
```

**Vite avec `@vitejs/plugin-react` < v6 (Vite 7 et antérieur) :**
```typescript
// vite.config.ts — @vitejs/plugin-react < v6
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

### `cacheSignal` — Fetch annulable dans un Server Component

Disponible depuis **React 19.2** (octobre 2025). `cacheSignal()` retourne un `AbortSignal` lié à la durée de vie du cache d'un Server Component. Lorsque le rendu est abandonné (navigation concurrente, Transition annulée), le signal déclenche l'annulation des requêtes réseau en vol.

```tsx
// server-component.tsx (Server Component)
import { cache, cacheSignal } from 'react';

// cache() déduplique les appels identiques dans un même rendu
const fetchProduct = cache(async (id: string) => {
  const res = await fetch(`/api/products/${id}`, {
    // Le signal est automatiquement aborted quand le cache expire
    signal: cacheSignal(),
  });
  return res.json();
});

const ProductDetail = async ({ id }: { id: string }) => {
  const product = await fetchProduct(id);
  return <h1>{product.name}</h1>;
};
```

**Gestion des erreurs d'annulation :**

```tsx
import { cache, cacheSignal } from 'react';
import { logError } from '@/lib/logger';

const fetchData = cache(async (id: string) => {
  try {
    const res = await fetch(`/api/data/${id}`, { signal: cacheSignal() });
    return await res.json();
  } catch (err) {
    // Ne pas logger les erreurs dues à l'annulation
    if (!cacheSignal()?.aborted) {
      logError(err);
    }
    return null;
  }
});
```

**Règle importante :** `cacheSignal()` doit être appelé **à l'intérieur** de la fonction async (pas en dehors), sinon la requête ne sera pas annulée à la fin du rendu.

```tsx
// 🚩 MAUVAIS : la requête ne sera pas annulée
const promise = fetch(url, { signal: cacheSignal() });
async function Component() {
  await promise; // signal déjà résolu à l'extérieur
}

// ✅ BON : cacheSignal() appelé dans la fonction async
async function Component() {
  await fetch(url, { signal: cacheSignal() });
}
```

**Source :** [react.dev/reference/react/cacheSignal](https://react.dev/reference/react/cacheSignal)

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

## `<Activity>` — Préservation d'état des onglets

Disponible depuis **React 19.2** (octobre 2025). `<Activity>` permet de garder un sous-arbre monté mais masqué (mode `"hidden"`), preserving l'état DOM et le state React entre les navigations.

### API

```tsx
import { Activity } from 'react';

<Activity mode="visible" | "hidden">
  {children}
</Activity>
```

| Mode | Comportement |
|------|-------------|
| `"visible"` | Enfants rendus normalement, effets montés |
| `"hidden"` | Enfants masqués (CSS), effets **démontés**, mises à jour différées |

### Cas d'usage : UI à onglets sans perte d'état

```tsx
import { Activity, useState } from 'react';

const TabView = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');

  return (
    <>
      <button onClick={() => setActiveTab('home')}>Home</button>
      <button onClick={() => setActiveTab('settings')}>Settings</button>

      {/* Les onglets inactifs restent montés mais masqués */}
      <Activity mode={activeTab === 'home' ? 'visible' : 'hidden'}>
        <HomeTab />
      </Activity>
      <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
        <SettingsTab />
      </Activity>
    </>
  );
};
```

**Avantages :**
- Pas de perte d'état (champs de formulaire, scroll position, etc.)
- Pré-rendu des onglets masqués (data fetching en arrière-plan avec Suspense)
- Back-navigation sans re-fetch

**Limitation importante :**
- En mode `"hidden"`, les effets (`useEffect`) sont **démontés** (cleanup exécuté). Les abonnements, intervals et connexions sont coupés. À considérer dans la conception des composants.

**Source :** [react.dev/reference/react/Activity](https://react.dev/reference/react/Activity)

---

## `<ViewTransition>` — Animations de navigation

Disponible depuis **React 19.2** (octobre 2025). `<ViewTransition>` permet de déclarer des animations de page (enter, exit, shared elements) en s'appuyant sur la View Transitions API du navigateur, sans CSS impératif.

### API

```tsx
import { ViewTransition } from 'react';

<ViewTransition
  name?: string           // Nom pour les shared element transitions
  enter?: string          // Classe CSS à l'apparition (défaut: "auto")
  exit?: string           // Classe CSS à la disparition
  update?: string         // Classe CSS lors d'une mutation DOM
  share?: string          // Classe CSS pour les shared elements
  default?: string        // Classe CSS par défaut si non spécifié ci-dessus
  onEnter?: (instance, types) => cleanup
  onExit?: (instance, types) => cleanup
  onUpdate?: (instance, types) => cleanup
  onShare?: (instance, types) => cleanup
>
  {children}
</ViewTransition>
```

**Valeurs de classe :** `"auto"` (comportement navigateur par défaut), `"none"` (désactivé), ou un nom de classe CSS personnalisé.

> `<ViewTransition>` ne s'active **que** lors de mises à jour enveloppées dans `startTransition()`, une boundary `<Suspense>`, ou `useDeferredValue()`.

### Exemple : navigation avec React Router 7

```tsx
// App.tsx — ViewTransition + React Router 7 (Framework/Data mode)
import { ViewTransition } from 'react';
import { Link, Outlet } from 'react-router';

// ① Sur le <Link> : le prop `viewTransition` enveloppe la navigation
//   dans document.startViewTransition() → active <ViewTransition>
const Nav = () => (
  <nav>
    <Link to="/" viewTransition>Accueil</Link>
    <Link to="/about" viewTransition>À propos</Link>
  </nav>
);

// ② Envelopper le contenu changeant dans <ViewTransition>
const Layout = () => (
  <>
    <Nav />
    <ViewTransition>
      <Outlet />
    </ViewTransition>
  </>
);
```

**Shared element transition** (même élément animé entre deux pages) :

```tsx
// Page liste : ViewTransition avec un name unique par item
<ViewTransition name={`product-${product.id}`}>
  <img src={product.image} alt={product.name} />
</ViewTransition>

// Page détail : même name → React interpole l'élément entre les deux pages
<ViewTransition name={`product-${product.id}`}>
  <img src={product.image} alt={product.name} className="hero" />
</ViewTransition>
```

### Accessibilité — `prefers-reduced-motion`

React **ne désactive pas** automatiquement les animations selon les préférences utilisateur. Il faut le gérer explicitement.

**Option 1 — CSS (recommandée) :**

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

**Option 2 — JS (désactivation conditionnelle du prop) :**

```tsx
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<ViewTransition default={prefersReduced ? 'none' : 'auto'}>
  <Outlet />
</ViewTransition>
```

**Sources :**
- [react.dev/reference/react/ViewTransition](https://react.dev/reference/react/ViewTransition)
- [reactrouter.com/how-to/view-transitions](https://reactrouter.com/how-to/view-transitions)

---

## Hook `useEffectEvent` — Dépendances de useEffect

Disponible depuis **React 19.2** (stable, octobre 2025). `useEffectEvent` permet d'extraire la logique « événement » d'un `useEffect` pour éviter les re-synchronisations inutiles.

### Problème résolu

```tsx
// ❌ AVANT : theme dans les deps → reconnexion à chaque changement de thème
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme); // theme lu ici
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, theme]); // theme force une reconnexion inutile
}
```

### Pattern AUTODEPS avec `useEffectEvent`

```tsx
import { useEffect, useEffectEvent } from 'react';

// ✅ APRÈS : onConnected lit toujours le theme à jour sans être une dépendance
function ChatRoom({ roomId, theme }) {
  // useEffectEvent wrapping = logique "event", jamais une dépendance
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected(); // toujours le theme à jour
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ theme n'est plus une dépendance
}
```

### Règles d'utilisation

- `useEffectEvent` n'est **pas réactif** : il lit toujours les valeurs les plus récentes
- Ne pas l'appeler en dehors du `useEffect` où il est utilisé
- Ne pas le passer comme dépendance à d'autres hooks
- Alternative aux dépendances manuelles dans les `useEffect` complexes

**Source :** [react.dev/reference/react/useEffectEvent](https://react.dev/reference/react/useEffectEvent)

---

## Écosystème React 19 (2026)

| Bibliothèque | Version | Usage |
|--------------|---------|-------|
| **React** | 19.2.x (latest: 19.2.7) | Core |
| **React Compiler** | 1.0+ | Auto-memoization |
| **Zustand** | 5.0.12 | State management |
| **TanStack Query** | 5.99.0 | Server state (cache, revalidation) |
| **React Router** | 7.17.0 | Routing |
| **Zod** | 4.4.3 | Schema validation (v4 — breaking: import `z` from `zod/v4`) |
| **Vitest** | 4.1+ | Tests (Browser Mode) |
| **Playwright** | 1.60.0 | Tests E2E |

**Source :** [TanStack Query v5](https://tanstack.com/query/latest), [Zustand v5](https://zustand-demo.pmnd.rs/)

### Migration Zod v3 → v4

Zod 4 (4.4.x) introduit des changements de rupture. L'import `from 'zod'` redirige vers Zod v3 pour compatibilité ; pour utiliser Zod v4 :

```typescript
// Zod v4 — import explicite
import { z } from 'zod/v4';

// Changements breaking Zod v4 :
// - z.string().email() → z.email() (top-level)
// - z.union() plus performant via z.discriminatedUnion()
// - z.infer<> remplacé par z.output<> pour les types de sortie transformés
// - Erreurs i18n : z.setErrorMap() remplacé par z.config({ error: customErrorMap })
```

**Source :** [Zod v4 Migration](https://zod.dev/v4/changelog)

### ESLint v10 — Flat Config obligatoire

ESLint v10 supprime définitivement le format legacy (`.eslintrc.cjs`, `.eslintrc.json`). Migrer vers `eslint.config.mjs` :

```javascript
// eslint.config.mjs (ESLint v10 — flat config)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
```

> `.eslintrc.cjs` / `.eslintrc.json` / `.eslintignore` sont **supprimés** en ESLint v10. Utiliser uniquement `eslint.config.mjs`.

**Source :** [ESLint v10 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)

---

## React Performance Tracks — Chrome DevTools

Disponible depuis **React 19.2**. Les Performance Tracks sont des entrées personnalisées dans le panneau **Performance** de Chrome DevTools qui visualisent les événements React sur la même timeline que le réseau, le JS et l'event loop.

> Disponibles uniquement en **builds de développement** (automatique) et **profiling** (`react-dom/profiling`). Désactivées en production.

### Pistes disponibles

| Piste | Contenu |
|-------|---------|
| **Scheduler › Blocking** | Mises à jour synchrones (interactions utilisateur) |
| **Scheduler › Transition** | Travail non-bloquant via `startTransition()` |
| **Scheduler › Suspense** | Travail lié aux boundaries Suspense |
| **Scheduler › Idle** | Travail de priorité la plus basse |
| **Components** | Flamegraph des durées de rendu et d'effets par composant |
| **Server Requests** | Promises fetch / I/O dans les Server Components (dev uniquement) |
| **Server Components** | Durées de rendu serveur et Promises attendues (dev uniquement) |

### Comment utiliser

1. Ouvrir Chrome DevTools → onglet **Performance**
2. Cliquer **Record**, interagir avec l'application, puis **Stop**
3. Les pistes React apparaissent dans la timeline sous les pistes navigateur standard

**Cascading updates** : détecter les mises à jour déclenchées pendant un rendu (React abandonne et relance — régression de performance visible dans la piste Scheduler).

**Profiling build** (pour la CI ou le staging) :

```ts
// Activer react-dom/profiling au lieu de react-dom/client
import ReactDOM from 'react-dom/profiling';
```

Ou via alias bundler :
```ts
// vite.config.ts
resolve: {
  alias: { 'react-dom/client': 'react-dom/profiling' }
}
```

**Source :** [react.dev/reference/dev-tools/react-performance-tracks](https://react.dev/reference/dev-tools/react-performance-tracks)

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
- [ ] Vérifier les performances avec React DevTools Profiler et Chrome Performance Tracks
- [ ] Tester les Server Components avec bundle analyzer (< 200KB initial)

---

**Dernière mise à jour :** 2026-06-08
**Version :** 1.1.0
**Auteur :** The Bearded CTO
