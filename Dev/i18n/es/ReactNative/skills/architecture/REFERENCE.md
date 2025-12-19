# Arquitectura React Native - Principios y Organización

## Introducción

Este documento define la arquitectura recomendada para aplicaciones React Native con TypeScript y Expo, basada en las mejores prácticas de la industria.

---

## Principios Arquitectónicos

### 1. Arquitectura Limpia

La aplicación está organizada en **capas** con responsabilidades claras:

```
┌─────────────────────────────────────┐
│      CAPA DE PRESENTACIÓN           │  <- Componentes UI, Pantallas
├─────────────────────────────────────┤
│      CAPA DE APLICACIÓN             │  <- Hooks, Gestión de Estado
├─────────────────────────────────────┤
│      CAPA DE DOMINIO                │  <- Lógica de Negocio, Tipos
├─────────────────────────────────────┤
│      CAPA DE DATOS                  │  <- API, Almacenamiento, Servicios
└─────────────────────────────────────┘
```

**Reglas de dependencia**:
- Las capas superiores pueden depender de las capas inferiores
- Las capas inferiores NO DEBEN depender de las capas superiores
- Cada capa tiene una única responsabilidad bien definida

### 2. Organización Basada en Características

Organización por **característica de negocio** en lugar de tipo técnico:

```typescript
// ✅ BUENO: Basado en características
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

// ❌ MALO: Basado en tipos
screens/
components/
hooks/
types/
```

### 3. Separación de Responsabilidades

Cada archivo, función, componente tiene **UNA responsabilidad**:

```typescript
// ✅ BUENO: Separación clara
// Button.tsx - Presentación
export const Button = ({ onPress, children }) => (
  <Pressable onPress={onPress}>{children}</Pressable>
);

// useLogin.ts - Lógica
export const useLogin = () => {
  const login = (credentials) => { /* lógica */ };
  return { login };
};

// ❌ MALO: Todo mezclado
export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const response = await fetch('/api/login');
    // Lógica + UI mezcladas
  };
  return <Pressable onPress={handleLogin}>Login</Pressable>;
};
```

---

## Estructura de Carpetas

### Vista Completa

```
my-app/
├── src/
│   ├── app/                         # Expo Router (App Router)
│   │   ├── (auth)/                  # Grupo auth (layout compartido)
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── _layout.tsx
│   │   ├── (tabs)/                  # Grupo tabs (pestañas de navegación)
│   │   │   ├── index.tsx            # Tab inicio
│   │   │   ├── profile.tsx          # Tab perfil
│   │   │   ├── settings.tsx         # Tab configuración
│   │   │   └── _layout.tsx          # Layout tabs
│   │   ├── article/
│   │   │   └── [id].tsx             # Ruta dinámica
│   │   ├── modal.tsx                # Pantalla modal
│   │   ├── _layout.tsx              # Layout raíz
│   │   └── +not-found.tsx           # Pantalla 404
│   │
│   ├── components/                  # Componentes reutilizables
│   │   ├── ui/                      # Componentes UI base
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── index.ts
│   │   ├── forms/                   # Componentes de formularios
│   │   │   ├── LoginForm/
│   │   │   ├── ProfileForm/
│   │   │   └── index.ts
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── Container/
│   │   │   ├── SafeArea/
│   │   │   └── index.ts
│   │   └── shared/                  # Componentes compartidos
│   │       ├── Header/
│   │       ├── Footer/
│   │       └── index.ts
│   │
│   ├── features/                    # Características por dominio de negocio
│   │   ├── auth/
│   │   │   ├── components/          # Componentes específicos de auth
│   │   │   │   ├── SocialLoginButtons/
│   │   │   │   └── PasswordStrength/
│   │   │   ├── hooks/               # Hooks de auth
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── services/            # Servicios de auth
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── token.service.ts
│   │   │   ├── stores/              # Gestión de estado auth
│   │   │   │   └── auth.store.ts
│   │   │   ├── types/               # Tipos de auth
│   │   │   │   └── Auth.types.ts
│   │   │   └── utils/               # Utilidades auth
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
│   ├── hooks/                       # Hooks globales/compartidos
│   │   ├── useAppState.ts           # Estado de la app (foreground/background)
│   │   ├── useKeyboard.ts           # Estado del teclado
│   │   ├── useOrientation.ts        # Orientación del dispositivo
│   │   ├── useNetworkStatus.ts      # Conectividad de red
│   │   └── index.ts
│   │
│   ├── services/                    # Servicios globales
│   │   ├── api/                     # Servicios API
│   │   │   ├── client.ts            # Cliente API (Axios)
│   │   │   ├── interceptors.ts      # Interceptores Request/Response
│   │   │   ├── endpoints.ts         # Constantes de endpoints API
│   │   │   └── index.ts
│   │   ├── storage/                 # Servicios de almacenamiento
│   │   │   ├── mmkv.storage.ts      # Almacenamiento MMKV
│   │   │   ├── secure.storage.ts    # Almacenamiento seguro
│   │   │   └── index.ts
│   │   ├── analytics/               # Servicio de analytics
│   │   │   ├── analytics.service.ts
│   │   │   └── events.ts
│   │   ├── notifications/           # Servicio de notificaciones
│   │   │   └── push.service.ts
│   │   └── location/                # Servicio de ubicación
│   │       └── location.service.ts
│   │
│   ├── stores/                      # Gestión de estado global
│   │   ├── app.store.ts             # Estado global de la app
│   │   ├── theme.store.ts           # Estado del tema
│   │   └── index.ts
│   │
│   ├── navigation/                  # Configuración de navegación
│   │   ├── types.ts                 # Tipos de navegación
│   │   ├── linking.ts               # Configuración de deep linking
│   │   └── index.ts
│   │
│   ├── utils/                       # Utilidades
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
│   ├── types/                       # Tipos globales
│   │   ├── global.types.ts
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── index.ts
│   │
│   ├── config/                      # Configuración
│   │   ├── env.ts                   # Variables de entorno
│   │   ├── app.config.ts            # Configuración de la app
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
├── __tests__/                       # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .expo/                           # Generado por Expo
├── .husky/                          # Git hooks
├── node_modules/
├── app.json                         # Configuración de la app Expo
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

## Detalles de las Capas

### 1. Capa de Presentación (UI)

#### A. App Router (Expo Router)

**Nueva arquitectura de enrutamiento basada en archivos**:

```typescript
// src/app/_layout.tsx - Layout raíz
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

// src/app/(tabs)/_layout.tsx - Layout de tabs
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

// src/app/(tabs)/index.tsx - Pantalla de inicio
export default function HomeScreen() {
  return <HomeView />;
}

// src/app/article/[id].tsx - Ruta dinámica
import { useLocalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  return <ArticleDetail id={id} />;
}
```

**Ventajas de Expo Router**:
- Enrutamiento basado en archivos (como Next.js)
- Navegación type-safe
- Deep linking automático
- SEO-friendly (Expo Web)
- Layouts compartidos
- Navegación anidada simplificada

#### B. Componentes

**Organización jerárquica**:

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

1. **Componentes UI** (tontos/presentacionales):
   - Sin lógica de negocio
   - Dirigidos por props
   - Altamente reutilizables
   - Fácilmente testeables

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

2. **Componentes Inteligentes** (contenedores):
   - Conectados al estado
   - Manejan lógica de negocio
   - Usan hooks

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

3. **Componentes Compuestos**:
   - Componentes compuestos
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

### 2. Capa de Aplicación (Lógica)

#### A. Hooks Personalizados

**Encapsular lógica reutilizable**:

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

// Uso en componente:
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

**Patrones comunes de hooks**:

```typescript
// 1. Hook de obtención de datos
export const useArticles = (filters?: ArticleFilters) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => articlesService.getAll(filters),
  });
};

// 2. Hook de mutación
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

// 4. Hook de información del dispositivo
export const useDeviceInfo = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;
  const isLandscape = width > height;

  return { width, height, isTablet, isLandscape };
};

// 5. Hook del teclado
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

#### B. Gestión de Estado

**Arquitectura multi-nivel**:

```typescript
// 1. Estado Local (useState, useReducer)
// Para estado aislado a un componente
const [count, setCount] = useState(0);

// 2. Estado URL (Expo Router)
// Para estado sincronizado con URL
const { id, filter } = useLocalSearchParams<{ id: string; filter: string }>();

// 3. Estado del Servidor (React Query)
// Para datos del servidor con caché
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// 4. Estado Global (Zustand)
// Para estado global del lado del cliente
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

// 5. Estado Persistente (MMKV)
// Para almacenamiento performante
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

### 3. Capa de Dominio (Lógica de Negocio)

#### Tipos e Interfaces

**Organización de tipos**:

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

### 4. Capa de Datos

#### A. Servicios API

**Organización de servicios API**:

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
  // Interceptor de peticiones
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

  // Interceptor de respuestas
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Lógica de renovación de token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await tokenService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Redirigir a login
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

#### B. Servicios de Almacenamiento

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

## Arquitectura de Navegación

### Patrones de Expo Router

```typescript
// 1. Rutas de Grupo (Layouts Compartidos)
app/
├── (auth)/
│   ├── _layout.tsx          # Layout de auth
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/
    ├── _layout.tsx          # Layout de tabs
    ├── index.tsx
    └── profile.tsx

// 2. Rutas Dinámicas
app/
└── article/
    └── [id].tsx             # /article/123

// 3. Rutas Catch-all
app/
└── blog/
    └── [...slug].tsx        # /blog/2024/01/article

// 4. Rutas Modal
app/
├── _layout.tsx
└── modal.tsx                # Presentado como modal

// Tipos de navegación
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'article/[id]': { id: string };
  modal: { title: string };
};

type ArticleScreenProps = NativeStackScreenProps<RootStackParamList, 'article/[id]'>;

// Navegación type-safe
import { router } from 'expo-router';

router.push({ pathname: '/article/[id]', params: { id: '123' } });
router.back();
router.replace('/login');
```

---

## Código Específico de Plataforma

### Organización de Código Específico de Plataforma

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

// Método 2: Extensiones de archivo
// Button.ios.tsx
export const Button = () => <IOSButton />;

// Button.android.tsx
export const Button = () => <AndroidButton />;

// Button.tsx (fallback)
export const Button = () => <DefaultButton />;

// Método 3: Verificación de plataforma
if (Platform.OS === 'ios') {
  // Específico de iOS
} else if (Platform.OS === 'android') {
  // Específico de Android
}

// Método 4: Versión de plataforma
if (Platform.Version >= 23) {
  // Android API 23+
}
```

---

## Organización de Módulos Nativos

```typescript
// src/modules/
├── camera/
│   ├── CameraModule.ts          # Wrapper TypeScript
│   ├── CameraModule.ios.ts      # Implementación iOS
│   └── CameraModule.android.ts  # Implementación Android
└── biometrics/
    ├── BiometricsModule.ts
    ├── BiometricsModule.ios.ts
    └── BiometricsModule.android.ts

// Ejemplo de wrapper
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

## Mejores Prácticas de Arquitectura

### 1. Inyección de Dependencias

```typescript
// ✅ BUENO: Inyección de dependencias
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

// ❌ MALO: Dependencia codificada
class UserRepository {
  async getUser() {
    const data = await mmkvStorage.get('user'); // Acoplamiento fuerte
    return data ? JSON.parse(data) : null;
  }
}
```

### 2. Patrón Repository

```typescript
// features/articles/repositories/articles.repository.ts
import { articlesService } from '../services/articles.service';
import { articlesStorage } from '../services/articles.storage';

class ArticlesRepository {
  async getArticles(filters?: ArticleFilters): Promise<Article[]> {
    try {
      // Intentar API primero
      const articles = await articlesService.getAll(filters);
      // Cachear localmente
      await articlesStorage.saveArticles(articles.data);
      return articles.data;
    } catch (error) {
      // Fallback a almacenamiento local
      return await articlesStorage.getArticles();
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
    // Intentar caché primero
    const cached = await articlesStorage.getArticleById(id);
    if (cached) return cached;

    // Obtener de la API
    const article = await articlesService.getById(id);
    await articlesStorage.saveArticle(article);
    return article;
  }
}

export const articlesRepository = new ArticlesRepository();
```

### 3. Patrón Adapter

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

## Ejemplos Completos

### Ejemplo Completo de Característica: Articles

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

// 2. Servicio API
// features/articles/services/articles.service.ts
class ArticlesService {
  async getAll(): Promise<Article[]> {
    const { data } = await apiClient.get('/articles');
    return data;
  }
}
export const articlesService = new ArticlesService();

// 3. Servicio de Almacenamiento
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

// 7. Pantalla
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

## Checklist de Arquitectura

**Antes de implementar una característica**:

- [ ] Carpeta de característica creada en features/
- [ ] Tipos definidos en types/
- [ ] Servicio API creado en services/
- [ ] Servicio de almacenamiento si es necesario
- [ ] Repository si hay lógica compleja
- [ ] Hook personalizado creado en hooks/
- [ ] Componentes UI en components/
- [ ] Pantalla en app/
- [ ] Navegación configurada
- [ ] Tests unitarios
- [ ] Documentación

---

**La arquitectura es la base de la mantenibilidad. Invierte tiempo desde el principio.**
