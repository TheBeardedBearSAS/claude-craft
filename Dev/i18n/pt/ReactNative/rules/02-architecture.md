# Arquitetura React Native - Princípios e Organização

## Introdução

Este documento define a arquitetura recomendada para aplicações React Native com TypeScript e Expo, baseada nas melhores práticas do setor.

---

## Princípios Arquiteturais

### 1. Clean Architecture

A aplicação é organizada em **camadas** com responsabilidades bem definidas:

```
┌─────────────────────────────────────┐
│      CAMADA DE APRESENTAÇÃO         │  <- Componentes UI, Telas
├─────────────────────────────────────┤
│      CAMADA DE APLICAÇÃO            │  <- Hooks, Gerenciamento de Estado
├─────────────────────────────────────┤
│      CAMADA DE DOMÍNIO              │  <- Lógica de Negócio, Tipos
├─────────────────────────────────────┤
│      CAMADA DE DADOS                │  <- API, Armazenamento, Serviços
└─────────────────────────────────────┘
```

**Regras de dependência**:
- Camadas superiores podem depender de camadas inferiores
- Camadas inferiores NÃO DEVEM depender de camadas superiores
- Cada camada tem uma única responsabilidade bem definida

### 2. Organização Baseada em Funcionalidades

Organização por **funcionalidade de negócio** em vez de tipo técnico:

```typescript
// ✅ BOM: Baseado em funcionalidade
features/
├── auth/
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   └── types/
└── profile/
    ├── screens/
    ├── components/
    ├── hooks/
    └── types/

// ❌ RUIM: Baseado em tipo
screens/
components/
hooks/
types/
```

### 3. Separação de Responsabilidades

Cada arquivo, função e componente tem **UMA responsabilidade**:

```typescript
// ✅ BOM: Separação clara
// Button.tsx - Apresentação
export const Button = ({ onPress, children }) => (
  <Pressable onPress={onPress}>{children}</Pressable>
);

// useLogin.ts - Lógica
export const useLogin = () => {
  const login = (credentials) => { /* logic */ };
  return { login };
};

// ❌ RUIM: Tudo misturado
export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const response = await fetch('/api/login');
    // Lógica + UI misturadas
  };
  return <Pressable onPress={handleLogin}>Login</Pressable>;
};
```

---

## Estrutura de Pastas

### Visão Geral Completa

```
my-app/
├── src/
│   ├── app/                         # Expo Router (App Router)
│   │   ├── (auth)/                  # Grupo auth (layout compartilhado)
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── _layout.tsx
│   │   ├── (tabs)/                  # Grupo tabs (abas de navegação)
│   │   │   ├── index.tsx            # Aba inicial
│   │   │   ├── profile.tsx          # Aba de perfil
│   │   │   ├── settings.tsx         # Aba de configurações
│   │   │   └── _layout.tsx          # Layout das abas
│   │   ├── article/
│   │   │   └── [id].tsx             # Rota dinâmica
│   │   ├── modal.tsx                # Tela modal
│   │   ├── _layout.tsx              # Layout raiz
│   │   └── +not-found.tsx           # Tela 404
│   │
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── ui/                      # Componentes UI base
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── index.ts
│   │   ├── forms/                   # Componentes de formulário
│   │   │   ├── LoginForm/
│   │   │   ├── ProfileForm/
│   │   │   └── index.ts
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── Container/
│   │   │   ├── SafeArea/
│   │   │   └── index.ts
│   │   └── shared/                  # Componentes compartilhados
│   │       ├── Header/
│   │       ├── Footer/
│   │       └── index.ts
│   │
│   ├── features/                    # Funcionalidades por domínio de negócio
│   │   ├── auth/
│   │   │   ├── components/          # Componentes específicos de auth
│   │   │   │   ├── SocialLoginButtons/
│   │   │   │   └── PasswordStrength/
│   │   │   ├── hooks/               # Hooks de auth
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── services/            # Serviços de auth
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── token.service.ts
│   │   │   ├── stores/              # Gerenciamento de estado de auth
│   │   │   │   └── auth.store.ts
│   │   │   ├── types/               # Tipos de auth
│   │   │   │   └── Auth.types.ts
│   │   │   └── utils/               # Utilitários de auth
│   │   │       └── validation.ts
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── articles/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   │
│   ├── hooks/                       # Hooks globais/compartilhados
│   │   ├── useAppState.ts           # Estado do app (foreground/background)
│   │   ├── useKeyboard.ts           # Estado do teclado
│   │   ├── useOrientation.ts        # Orientação do dispositivo
│   │   ├── useNetworkStatus.ts      # Conectividade de rede
│   │   └── index.ts
│   │
│   ├── services/                    # Serviços globais
│   │   ├── api/                     # Serviços de API
│   │   │   ├── client.ts            # Cliente da API (Axios)
│   │   │   ├── interceptors.ts      # Interceptadores de requisição/resposta
│   │   │   ├── endpoints.ts         # Constantes de endpoints da API
│   │   │   └── index.ts
│   │   ├── storage/                 # Serviços de armazenamento
│   │   │   ├── mmkv.storage.ts      # Armazenamento MMKV
│   │   │   ├── secure.storage.ts    # Armazenamento seguro
│   │   │   └── index.ts
│   │   ├── analytics/               # Serviço de analytics
│   │   │   ├── analytics.service.ts
│   │   │   └── events.ts
│   │   ├── notifications/           # Serviço de notificações
│   │   │   └── push.service.ts
│   │   └── location/                # Serviço de localização
│   │       └── location.service.ts
│   │
│   ├── stores/                      # Gerenciamento de estado global
│   │   ├── app.store.ts             # Estado global do app
│   │   ├── theme.store.ts           # Estado do tema
│   │   └── index.ts
│   │
│   ├── navigation/                  # Configuração de navegação
│   │   ├── types.ts                 # Tipos de navegação
│   │   ├── linking.ts               # Configuração de deep linking
│   │   └── index.ts
│   │
│   ├── utils/                       # Utilitários
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   ├── number.utils.ts
│   │   ├── validation.utils.ts
│   │   └── index.ts
│   │
│   ├── constants/                   # Constantes
│   │   ├── app.constants.ts
│   │   ├── api.constants.ts
│   │   ├── storage.constants.ts
│   │   └── index.ts
│   │
│   ├── types/                       # Tipos globais
│   │   ├── global.types.ts
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── index.ts
│   │
│   ├── config/                      # Configuração
│   │   ├── env.ts                   # Variáveis de ambiente
│   │   ├── app.config.ts            # Configuração do app
│   │   └── index.ts
│   │
│   ├── theme/                       # Tema
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   │
│   └── assets/                      # Assets
│       ├── images/
│       ├── fonts/
│       ├── icons/
│       └── animations/
│
├── __tests__/                       # Testes
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .expo/                           # Gerado pelo Expo
├── .husky/                          # Git hooks
├── node_modules/
├── app.json                         # Configuração do app Expo
├── babel.config.js
├── tsconfig.json
├── package.json
├── .eslintrc.js
├── .prettierrc.js
├── .env.development
├── .env.production
└── README.md
```

---

## Detalhes das Camadas

### 1. Camada de Apresentação (UI)

#### A. App Router (Expo Router)

**Nova arquitetura de roteamento baseado em arquivos**:

```typescript
// src/app/_layout.tsx - Layout raiz
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}

// src/app/(tabs)/_layout.tsx - Layout das abas
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

// src/app/(tabs)/index.tsx - Tela inicial
export default function HomeScreen() {
  return <HomeView />;
}

// src/app/article/[id].tsx - Rota dinâmica
import { useLocalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  return <ArticleDetail id={id} />;
}
```

**Vantagens do Expo Router**:
- Roteamento baseado em arquivos (como Next.js)
- Navegação com tipagem segura
- Deep linking automático
- Amigável para SEO (Expo Web)
- Layouts compartilhados
- Navegação aninhada simplificada

#### B. Componentes

**Organização hierárquica**:

```typescript
// components/ui/Button/Button.tsx
import { Pressable, Text } from 'react-native';
import { styles } from './Button.styles';
import type { ButtonProps } from './Button.types';

export const Button = ({
  children,
  variant = 'primary',
  onPress,
  disabled,
}: ButtonProps) => {
  return (
    <Pressable
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
};

// components/ui/Button/Button.styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
  },
});

// components/ui/Button/Button.types.ts
import type { PressableProps } from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

// components/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

**Tipos de componentes**:

1. **Componentes UI** (burros/apresentacionais):
   - Sem lógica de negócio
   - Orientados por props
   - Altamente reutilizáveis
   - Facilmente testáveis

```typescript
// components/ui/Card/Card.tsx
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export const Card = ({ children, onPress }: CardProps) => (
  <Pressable onPress={onPress} style={styles.card}>
    {children}
  </Pressable>
);
```

2. **Componentes Inteligentes** (containers):
   - Conectados ao estado
   - Lidam com lógica de negócio
   - Utilizam hooks

```typescript
// features/articles/components/ArticleList/ArticleList.tsx
export const ArticleList = () => {
  const { data: articles, isLoading } = useArticles();

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => <ArticleCard article={item} />}
      keyExtractor={(item) => item.id}
    />
  );
};
```

3. **Componentes Compostos**:
   - Componentes composicionais
   - API intuitiva

```typescript
// components/ui/Form/Form.tsx
export const Form = ({ children, onSubmit }: FormProps) => (
  <View style={styles.form}>{children}</View>
);

Form.Field = ({ label, children }: FieldProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

Form.Submit = ({ children, ...props }: SubmitProps) => (
  <Button {...props}>{children}</Button>
);

// Uso:
<Form onSubmit={handleSubmit}>
  <Form.Field label="Email">
    <Input name="email" />
  </Form.Field>
  <Form.Submit>Enviar</Form.Submit>
</Form>
```

---

### 2. Camada de Aplicação (Lógica)

#### A. Custom Hooks

**Encapsulam lógica reutilizável**:

```typescript
// hooks/useAuth.ts
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { authService } from '@/features/auth/services/auth.service';

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore();

  const login = async (credentials: Credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    clearUser();
  };

  const isAuthenticated = !!user;

  return {
    user,
    login,
    logout,
    isAuthenticated,
  };
};

// Uso no componente:
const LoginScreen = () => {
  const { login, isAuthenticated } = useAuth();
  const { mutate, isLoading } = useMutation({
    mutationFn: login,
  });

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <LoginForm onSubmit={mutate} isLoading={isLoading} />;
};
```

**Padrões comuns de hooks**:

```typescript
// 1. Hook de busca de dados
export const useArticles = (filters?: ArticleFilters) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => articlesService.getAll(filters),
  });
};

// 2. Hook de mutação
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: articlesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

// 3. Hook específico de plataforma
export const usePlatform = () => {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isWeb = Platform.OS === 'web';

  return { isIOS, isAndroid, isWeb };
};

// 4. Hook de informações do dispositivo
export const useDeviceInfo = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;
  const isLandscape = width > height;

  return { width, height, isTablet, isLandscape };
};

// 5. Hook de teclado
export const useKeyboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setIsVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { isVisible, keyboardHeight };
};
```

#### B. Gerenciamento de Estado

**Arquitetura em múltiplos níveis**:

```typescript
// 1. Estado Local (useState, useReducer)
// Para estado isolado em um componente
const [count, setCount] = useState(0);

// 2. Estado de URL (Expo Router)
// Para estado sincronizado com a URL
const { id, filter } = useLocalSearchParams<{ id: string; filter: string }>();

// 3. Estado do Servidor (React Query)
// Para dados do servidor com cache
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// 4. Estado Global (Zustand)
// Para estado global do lado do cliente
// stores/theme.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createMMKVStorage } from '@/services/storage/mmkv.storage';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme',
      storage: createMMKVStorage(),
    }
  )
);

// 5. Estado Persistido (MMKV)
// Para armazenamento de alto desempenho
// services/storage/mmkv.storage.ts
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    return storage.getString(key) ?? null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const createMMKVStorage = () => ({
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
});
```

---

### 3. Camada de Domínio (Lógica de Negócio)

#### Tipos e Interfaces

**Organização de tipos**:

```typescript
// types/User.types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDTO extends Partial<CreateUserDTO> {
  avatar?: string;
}

// types/Article.types.ts
export interface Article {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
}

export interface ArticleFilters {
  tag?: string;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  errors?: Record<string, string[]>;
}
```

---

### 4. Camada de Dados

#### A. Serviços de API

**Organização do serviço de API**:

```typescript
// services/api/client.ts
import axios from 'axios';
import { setupInterceptors } from './interceptors';
import { ENV } from '@/config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);

export default apiClient;

// services/api/interceptors.ts
import type { AxiosInstance } from 'axios';
import { router } from 'expo-router';
import { tokenService } from '@/features/auth/services/token.service';

export const setupInterceptors = (instance: AxiosInstance) => {
  // Interceptador de requisição
  instance.interceptors.request.use(
    async (config) => {
      const token = await tokenService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptador de resposta
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Lógica de renovação de token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await tokenService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Redirecionar para login
          router.replace('/(auth)/login');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// features/articles/services/articles.service.ts
import { apiClient } from '@/services/api/client';
import type { Article, ArticleFilters, CreateArticleDTO } from '../types/Article.types';
import type { PaginatedResponse } from '@/types/api.types';

class ArticlesService {
  private readonly endpoint = '/articles';

  async getAll(filters?: ArticleFilters): Promise<PaginatedResponse<Article>> {
    const { data } = await apiClient.get(this.endpoint, { params: filters });
    return data;
  }

  async getById(id: string): Promise<Article> {
    const { data } = await apiClient.get(`${this.endpoint}/${id}`);
    return data;
  }

  async create(dto: CreateArticleDTO): Promise<Article> {
    const { data } = await apiClient.post(this.endpoint, dto);
    return data;
  }

  async update(id: string, dto: Partial<CreateArticleDTO>): Promise<Article> {
    const { data } = await apiClient.patch(`${this.endpoint}/${id}`, dto);
    return data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export const articlesService = new ArticlesService();
```

#### B. Serviços de Armazenamento

```typescript
// services/storage/secure.storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Fallback para web
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
}

export const secureStorage = new SecureStorage();
```

---

## Arquitetura de Navegação

### Padrões do Expo Router

```typescript
// 1. Rotas de Grupo (Layouts Compartilhados)
app/
├── (auth)/
│   ├── _layout.tsx          # Layout de auth
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/
    ├── _layout.tsx          # Layout de abas
    ├── index.tsx
    └── profile.tsx

// 2. Rotas Dinâmicas
app/
└── article/
    └── [id].tsx             # /article/123

// 3. Rotas Catch-all
app/
└── blog/
    └── [...slug].tsx        # /blog/2024/01/article

// 4. Rotas de Modal
app/
├── _layout.tsx
└── modal.tsx                # Apresentado como modal

// Tipos de navegação
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'article/[id]': { id: string };
  modal: { title: string };
};

type ArticleScreenProps = NativeStackScreenProps<RootStackParamList, 'article/[id]'>;

// Navegação com tipagem segura
import { router } from 'expo-router';

router.push({ pathname: '/article/[id]', params: { id: '123' } });
router.back();
router.replace('/login');
```

---

## Código Específico por Plataforma

### Organização de Código Específico por Plataforma

```typescript
// Método 1: Platform.select
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
      android: {
        paddingTop: 0,
      },
      default: {
        paddingTop: 10,
      },
    }),
  },
});

// Método 2: Extensões de arquivo
// Button.ios.tsx
export const Button = () => <IOSButton />;

// Button.android.tsx
export const Button = () => <AndroidButton />;

// Button.tsx (fallback)
export const Button = () => <DefaultButton />;

// Método 3: Verificação de plataforma
if (Platform.OS === 'ios') {
  // Específico para iOS
} else if (Platform.OS === 'android') {
  // Específico para Android
}

// Método 4: Versão da plataforma
if (Platform.Version >= 23) {
  // Android API 23+
}
```

---

## Organização de Módulos Nativos

```typescript
// src/modules/
├── camera/
│   ├── CameraModule.ts          # Wrapper TypeScript
│   ├── CameraModule.ios.ts      # Implementação iOS
│   └── CameraModule.android.ts  # Implementação Android
└── biometrics/
    ├── BiometricsModule.ts
    ├── BiometricsModule.ios.ts
    └── BiometricsModule.android.ts

// Exemplo de wrapper
// modules/camera/CameraModule.ts
import { NativeModules } from 'react-native';

interface CameraInterface {
  takePicture(): Promise<string>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
}

const { CameraModule } = NativeModules;

export default CameraModule as CameraInterface;

// Uso
import CameraModule from '@/modules/camera/CameraModule';

const takePicture = async () => {
  const hasPermission = await CameraModule.hasPermission();
  if (!hasPermission) {
    const granted = await CameraModule.requestPermission();
    if (!granted) return;
  }
  const photoUri = await CameraModule.takePicture();
  return photoUri;
};
```

---

## Boas Práticas de Arquitetura

### 1. Injeção de Dependência

```typescript
// ✅ BOM: Injeção de dependência
interface StorageService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

class UserRepository {
  constructor(private storage: StorageService) {}

  async getUser(): Promise<User | null> {
    const data = await this.storage.get('user');
    return data ? JSON.parse(data) : null;
  }
}

// Uso
const repository = new UserRepository(mmkvStorage);

// ❌ RUIM: Dependência hard-coded
class UserRepository {
  async getUser() {
    const data = await mmkvStorage.get('user'); // Acoplamento forte
    return data ? JSON.parse(data) : null;
  }
}
```

### 2. Padrão Repository

```typescript
// features/articles/repositories/articles.repository.ts
import { articlesService } from '../services/articles.service';
import { articlesStorage } from '../services/articles.storage';

class ArticlesRepository {
  async getArticles(filters?: ArticleFilters): Promise<Article[]> {
    try {
      // Tenta a API primeiro
      const articles = await articlesService.getAll(filters);
      // Salva em cache local
      await articlesStorage.saveArticles(articles.data);
      return articles.data;
    } catch (error) {
      // Fallback para armazenamento local
      return await articlesStorage.getArticles();
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
    // Tenta o cache primeiro
    const cached = await articlesStorage.getArticleById(id);
    if (cached) return cached;

    // Busca da API
    const article = await articlesService.getById(id);
    await articlesStorage.saveArticle(article);
    return article;
  }
}

export const articlesRepository = new ArticlesRepository();
```

### 3. Padrão Adapter

```typescript
// Para adaptar APIs externas
interface ArticleDTO {
  id: number;
  post_title: string;
  post_content: string;
  author_name: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
}

class ArticleAdapter {
  static toArticle(dto: ArticleDTO): Article {
    return {
      id: String(dto.id),
      title: dto.post_title,
      content: dto.post_content,
      author: dto.author_name,
    };
  }

  static toDTO(article: Article): ArticleDTO {
    return {
      id: Number(article.id),
      post_title: article.title,
      post_content: article.content,
      author_name: article.author,
    };
  }
}
```

---

## Exemplos Completos

### Exemplo Completo de Funcionalidade: Artigos

```typescript
// 1. Tipos
// features/articles/types/Article.types.ts
export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  publishedAt: Date;
}

// 2. Serviço de API
// features/articles/services/articles.service.ts
class ArticlesService {
  async getAll(): Promise<Article[]> {
    const { data } = await apiClient.get('/articles');
    return data;
  }
}
export const articlesService = new ArticlesService();

// 3. Serviço de Armazenamento
// features/articles/services/articles.storage.ts
class ArticlesStorage {
  async saveArticles(articles: Article[]): Promise<void> {
    await mmkvStorage.setItem('articles', JSON.stringify(articles));
  }

  async getArticles(): Promise<Article[]> {
    const data = await mmkvStorage.getItem('articles');
    return data ? JSON.parse(data) : [];
  }
}
export const articlesStorage = new ArticlesStorage();

// 4. Repository
// features/articles/repositories/articles.repository.ts
class ArticlesRepository {
  async getArticles(): Promise<Article[]> {
    try {
      const articles = await articlesService.getAll();
      await articlesStorage.saveArticles(articles);
      return articles;
    } catch {
      return await articlesStorage.getArticles();
    }
  }
}
export const articlesRepository = new ArticlesRepository();

// 5. Hook
// features/articles/hooks/useArticles.ts
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesRepository.getArticles(),
  });
};

// 6. Componente
// features/articles/components/ArticleCard/ArticleCard.tsx
interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Card onPress={() => router.push(`/article/${article.id}`)}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.content}>{article.content}</Text>
    </Card>
  );
};

// 7. Tela
// app/(tabs)/articles.tsx
export default function ArticlesScreen() {
  const { data: articles, isLoading } = useArticles();

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => <ArticleCard article={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

## Checklist de Arquitetura

**Antes de implementar uma funcionalidade**:

- [ ] Pasta da funcionalidade criada em features/
- [ ] Tipos definidos em types/
- [ ] Serviço de API criado em services/
- [ ] Serviço de armazenamento se necessário
- [ ] Repository se houver lógica complexa
- [ ] Custom hook criado em hooks/
- [ ] Componentes UI em components/
- [ ] Tela em app/
- [ ] Navegação configurada
- [ ] Testes unitários
- [ ] Documentação

---

**A arquitetura é a base da manutenibilidade. Invista tempo desde o início.**
