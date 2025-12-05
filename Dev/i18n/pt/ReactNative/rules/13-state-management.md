# Gerenciamento de Estado - React Query, Zustand, MMKV

## Introdução

Estratégia multi-nível para gerenciar o estado em React Native:
1. **Server State**: React Query
2. **Global Client State**: Zustand
3. **Persistent Storage**: MMKV
4. **URL State**: Expo Router
5. **Local State**: useState

---

## React Query (TanStack Query)

### Instalação

```bash
npm install @tanstack/react-query
```

### Setup

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
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
    enabled: !!id, // Somente executar se id existir
  });
};

// Uso
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
      // Invalidar e refazer fetch da lista de artigos
      queryClient.invalidateQueries({ queryKey: ['articles'] });

      // Opcional: Adicionar ao cache diretamente (atualização otimista)
      queryClient.setQueryData(['article', newArticle.id], newArticle);

      // Navegar para novo artigo
      router.push(\`/article/\${newArticle.id}\`);
    },
    onError: (error) => {
      console.error('Falha ao criar artigo:', error);
      // Mostrar toast ou mensagem de erro
    },
  });
};

// Uso
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

### Atualizações Otimistas

```typescript
// hooks/useToggleFavorite.ts
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => favoritesService.toggle(articleId),

    // Atualização otimista
    onMutate: async (articleId) => {
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot do valor anterior
      const previousFavorites = queryClient.getQueryData(['favorites']);

      // Atualizar cache otimisticamente
      queryClient.setQueryData(['favorites'], (old: string[]) => {
        if (old?.includes(articleId)) {
          return old.filter((id) => id !== articleId);
        }
        return [...(old || []), articleId];
      });

      return { previousFavorites };
    },

    // Rollback em erro
    onError: (err, articleId, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
    },

    // Refetch em sucesso
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};
```

### Infinite Queries (Paginação)

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

// Uso
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

### Instalação

```bash
npm install zustand
```

### Store Básica

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

// Uso
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

// Adaptador MMKV para Zustand
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

### Valores Computados (Seletores)

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

// Seletores
export const useCartTotal = () => {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price, 0)
  );
};

export const useCartItemCount = () => {
  return useCartStore((state) => state.items.length);
};

// Uso
const CartScreen = () => {
  const total = useCartTotal();
  const itemCount = useCartItemCount();

  return (
    <View>
      <Text>Itens: {itemCount}</Text>
      <Text>Total: R$ {total}</Text>
    </View>
  );
};
```

---

## MMKV (Armazenamento Rápido)

### Instalação

```bash
npm install react-native-mmkv
```

### Uso Básico

```typescript
// services/storage/mmkv.storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// String
storage.set('username', 'joao_silva');
const username = storage.getString('username');

// Number
storage.set('age', 30);
const age = storage.getNumber('age');

// Boolean
storage.set('isDark', true);
const isDark = storage.getBoolean('isDark');

// Object (JSON)
storage.set('user', JSON.stringify({ name: 'João', age: 30 }));
const user = JSON.parse(storage.getString('user') || '{}');

// Deletar
storage.delete('username');

// Limpar tudo
storage.clearAll();

// Verificar se chave existe
const exists = storage.contains('username');

// Obter todas as chaves
const keys = storage.getAllKeys();
```

### Armazenamento Criptografado

```typescript
import { MMKV } from 'react-native-mmkv';

export const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'sua-chave-criptografia', // Armazenar chave em Keychain/Keystore
});

// Usar como MMKV regular
secureStorage.set('token', accessToken);
```

---

## Árvore de Decisão de Gerenciamento de Estado

```
Dados do servidor?
  → SIM → React Query

Estado global do cliente?
  → SIM → Zustand
    → Precisa persistência? → Zustand + MMKV

Estado de URL (filtros, tabs)?
  → SIM → Expo Router params

Estado local de componente?
  → SIM → useState

Estado de formulário?
  → SIM → React Hook Form
```

---

## Melhores Práticas

### 1. Não Misture Responsabilidades

```typescript
// ❌ RUIM: Dados do servidor no Zustand
const useArticlesStore = create((set) => ({
  articles: [],
  fetchArticles: async () => {
    const data = await api.getArticles();
    set({ articles: data });
  },
}));

// ✅ BOM: Dados do servidor no React Query
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => api.getArticles(),
  });
};
```

### 2. Use Seletores

```typescript
// ❌ RUIM: Inscrever-se na store inteira
const Component = () => {
  const store = useCartStore(); // Re-renderiza em QUALQUER mudança da store
  return <Text>{store.items.length}</Text>;
};

// ✅ BOM: Inscrever-se em valor específico
const Component = () => {
  const itemCount = useCartStore((state) => state.items.length);
  return <Text>{itemCount}</Text>;
};
```

### 3. Normalize Dados do Servidor

```typescript
// ❌ RUIM: Dados duplicados
const articles = [
  { id: 1, title: 'A', author: { id: 1, name: 'João' } },
  { id: 2, title: 'B', author: { id: 1, name: 'João' } }, // Duplicado!
];

// ✅ BOM: Normalizado
const articles = {
  byId: {
    '1': { id: 1, title: 'A', authorId: 1 },
    '2': { id: 2, title: 'B', authorId: 1 },
  },
  allIds: ['1', '2'],
};

const authors = {
  byId: {
    '1': { id: 1, name: 'João' },
  },
};
```

---

## Suporte Offline

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
        // Cache para offline
        await storage.set(cacheKey, JSON.stringify(data));
        return data;
      } else {
        // Carregar do cache
        const cached = storage.getString(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        throw new Error('Nenhum dado em cache disponível');
      }
    },
  });
};
```

---

## Checklist Gerenciamento de Estado

- [ ] React Query para server state
- [ ] Zustand para global client state
- [ ] MMKV para persistência rápida
- [ ] SecureStore para dados sensíveis
- [ ] useState para local state
- [ ] Seletores para otimização
- [ ] Suporte offline se necessário
- [ ] DevTools configurado

---

**Escolha a ferramenta certa para o trabalho certo: Server state ≠ Client state.**
