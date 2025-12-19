# Gestión de Estado - React Query, Zustand, MMKV

## Introducción

Estrategia multinivel para gestionar el estado en React Native:
1. **Server State**: React Query
2. **Global Client State**: Zustand
3. **Persistent Storage**: MMKV
4. **URL State**: Expo Router
5. **Local State**: useState

---

## React Query (TanStack Query)

### Instalación

```bash
npm install @tanstack/react-query
```

### Configuración

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// app/_layout.tsx
export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack />
    </QueryProvider>
  );
}
```

### Queries (GET)

```typescript
// hooks/useArticles.ts
import { useQuery } from '@tanstack/react-query';
import { articlesService } from '@/services/articles.service';

export const useArticles = (filters?: ArticleFilters) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => articlesService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useArticle = (id: string) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesService.getById(id),
    enabled: !!id, // Only run if id exists
  });
};

// Usage
const ArticlesScreen = () => {
  const { data: articles, isLoading, error, refetch } = useArticles();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => <ArticleCard article={item} />}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
};
```

### Mutations (POST/PUT/DELETE)

```typescript
// hooks/useCreateArticle.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '@/services/articles.service';
import { router } from 'expo-router';

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleDTO) => articlesService.create(data),
    onSuccess: (newArticle) => {
      // Invalidate and refetch articles list
      queryClient.invalidateQueries({ queryKey: ['articles'] });

      // Optionally: Add to cache directly (optimistic update)
      queryClient.setQueryData(['article', newArticle.id], newArticle);

      // Navigate to new article
      router.push(`/article/${newArticle.id}`);
    },
    onError: (error) => {
      console.error('Failed to create article:', error);
      // Show toast or error message
    },
  });
};

// Usage
const CreateArticleScreen = () => {
  const createArticle = useCreateArticle();

  const handleSubmit = (data: CreateArticleDTO) => {
    createArticle.mutate(data);
  };

  return (
    <ArticleForm
      onSubmit={handleSubmit}
      isLoading={createArticle.isPending}
    />
  );
};
```

### Actualizaciones Optimistas

```typescript
// hooks/useToggleFavorite.ts
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => favoritesService.toggle(articleId),

    // Optimistic update
    onMutate: async (articleId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData(['favorites']);

      // Optimistically update cache
      queryClient.setQueryData(['favorites'], (old: string[]) => {
        if (old?.includes(articleId)) {
          return old.filter((id) => id !== articleId);
        }
        return [...(old || []), articleId];
      });

      return { previousFavorites };
    },

    // Rollback on error
    onError: (err, articleId, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
    },

    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};
```

### Consultas Infinitas (Paginación)

```typescript
// hooks/useInfiniteArticles.ts
export const useInfiniteArticles = () => {
  return useInfiniteQuery({
    queryKey: ['articles', 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      articlesService.getAll({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

// Usage
const ArticlesListScreen = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteArticles();

  const articles = data?.pages.flatMap((page) => page.data) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => <ArticleCard article={item} />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <LoadingSpinner /> : null
      }
    />
  );
};
```

---

## Zustand (Estado Global)

### Instalación

```bash
npm install zustand
```

### Store Básico

```typescript
// stores/theme.store.ts
import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  setTheme: (isDark) => set({ isDark }),
}));

// Usage
const SettingsScreen = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <Switch value={isDark} onValueChange={toggleTheme} />
  );
};
```

### Store Persistente (MMKV)

```typescript
// stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// MMKV adapter for Zustand
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

### Valores Computados (Selectores)

```typescript
// stores/cart.store.ts
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
  clearCart: () => set({ items: [] }),
}));

// Selectors
export const useCartTotal = () => {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price, 0)
  );
};

export const useCartItemCount = () => {
  return useCartStore((state) => state.items.length);
};

// Usage
const CartScreen = () => {
  const total = useCartTotal();
  const itemCount = useCartItemCount();

  return (
    <View>
      <Text>Items: {itemCount}</Text>
      <Text>Total: ${total}</Text>
    </View>
  );
};
```

### Patrón de Slices

```typescript
// stores/app.store.ts
import { create } from 'zustand';

// User slice
interface UserSlice {
  user: User | null;
  setUser: (user: User | null) => void;
}

const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
});

// Settings slice
interface SettingsSlice {
  isDark: boolean;
  language: string;
  toggleTheme: () => void;
  setLanguage: (lang: string) => void;
}

const createSettingsSlice = (set: any): SettingsSlice => ({
  isDark: false,
  language: 'en',
  toggleTheme: () => set((state: any) => ({ isDark: !state.isDark })),
  setLanguage: (lang) => set({ language: lang }),
});

// Combined store
type AppState = UserSlice & SettingsSlice;

export const useAppStore = create<AppState>((set) => ({
  ...createUserSlice(set),
  ...createSettingsSlice(set),
}));
```

---

## MMKV (Almacenamiento Rápido)

### Instalación

```bash
npm install react-native-mmkv
```

### Uso Básico

```typescript
// services/storage/mmkv.storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// String
storage.set('username', 'john_doe');
const username = storage.getString('username');

// Number
storage.set('age', 30);
const age = storage.getNumber('age');

// Boolean
storage.set('isDark', true);
const isDark = storage.getBoolean('isDark');

// Object (JSON)
storage.set('user', JSON.stringify({ name: 'John', age: 30 }));
const user = JSON.parse(storage.getString('user') || '{}');

// Delete
storage.delete('username');

// Clear all
storage.clearAll();

// Check if key exists
const exists = storage.contains('username');

// Get all keys
const keys = storage.getAllKeys();
```

### Almacenamiento Encriptado

```typescript
import { MMKV } from 'react-native-mmkv';

export const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'your-encryption-key', // Store key in Keychain/Keystore
});

// Use like regular MMKV
secureStorage.set('token', accessToken);
```

---

## Árbol de Decisión de Gestión de Estado

```
¿Datos del servidor?
  → SÍ → React Query

¿Estado global del cliente?
  → SÍ → Zustand
    → ¿Necesita persistencia? → Zustand + MMKV

¿Estado en URL (filtros, tabs)?
  → SÍ → Parámetros de Expo Router

¿Estado local del componente?
  → SÍ → useState

¿Estado de formularios?
  → SÍ → React Hook Form
```

---

## Mejores Prácticas

### 1. No Mezclar Responsabilidades

```typescript
// ❌ BAD: Server data in Zustand
const useArticlesStore = create((set) => ({
  articles: [],
  fetchArticles: async () => {
    const data = await api.getArticles();
    set({ articles: data });
  },
}));

// ✅ GOOD: Server data in React Query
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => api.getArticles(),
  });
};
```

### 2. Usar Selectores

```typescript
// ❌ BAD: Subscribe to entire store
const Component = () => {
  const store = useCartStore(); // Re-renders on ANY store change
  return <Text>{store.items.length}</Text>;
};

// ✅ GOOD: Subscribe to specific value
const Component = () => {
  const itemCount = useCartStore((state) => state.items.length);
  return <Text>{itemCount}</Text>;
};
```

### 3. Normalizar Datos del Servidor

```typescript
// ❌ BAD: Duplicate data
const articles = [
  { id: 1, title: 'A', author: { id: 1, name: 'John' } },
  { id: 2, title: 'B', author: { id: 1, name: 'John' } }, // Duplicate!
];

// ✅ GOOD: Normalized
const articles = {
  byId: {
    '1': { id: 1, title: 'A', authorId: 1 },
    '2': { id: 2, title: 'B', authorId: 1 },
  },
  allIds: ['1', '2'],
};

const authors = {
  byId: {
    '1': { id: 1, name: 'John' },
  },
};
```

---

## Soporte Offline

```typescript
// hooks/useOfflineQuery.ts
import { useQuery } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';

export const useOfflineQuery = <T,>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  cacheKey: string
) => {
  const netInfo = useNetInfo();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (netInfo.isConnected) {
        const data = await queryFn();
        // Cache for offline
        await storage.set(cacheKey, JSON.stringify(data));
        return data;
      } else {
        // Load from cache
        const cached = storage.getString(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        throw new Error('No cached data available');
      }
    },
  });
};
```

---

## Checklist de Gestión de Estado

- [ ] React Query para server state
- [ ] Zustand para global client state
- [ ] MMKV para persistencia rápida
- [ ] SecureStore para datos sensibles
- [ ] useState para local state
- [ ] Selectores para optimización
- [ ] Soporte offline si es necesario
- [ ] DevTools configurado

---

**Elige la herramienta adecuada para el trabajo adecuado: Server state ≠ Client state.**
