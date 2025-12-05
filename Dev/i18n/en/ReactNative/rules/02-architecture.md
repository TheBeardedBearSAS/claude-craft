# React Native Architecture - Principles and Organization

## Introduction

This document defines the recommended architecture for React Native applications with TypeScript and Expo, based on industry best practices.

---

## Architectural Principles

### 1. Clean Architecture

The application is organized in **layers** with clear responsibilities:

```
┌─────────────────────────────────────┐
│      PRESENTATION LAYER             │  <- UI Components, Screens
├─────────────────────────────────────┤
│      APPLICATION LAYER              │  <- Hooks, State Management
├─────────────────────────────────────┤
│      DOMAIN LAYER                   │  <- Business Logic, Types
├─────────────────────────────────────┤
│      DATA LAYER                     │  <- API, Storage, Services
└─────────────────────────────────────┘
```

**Dependency rules**:
- Upper layers can depend on lower layers
- Lower layers MUST NOT depend on upper layers
- Each layer has a single, well-defined responsibility

### 2. Feature-Based Organization

Organization by **business feature** rather than technical type:

```typescript
// ✅ GOOD: Feature-based
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

// ❌ BAD: Type-based
screens/
components/
hooks/
types/
```

### 3. Separation of Concerns

Each file, function, component has **ONE responsibility**:

```typescript
// ✅ GOOD: Clear separation
// Button.tsx - Presentation
export const Button = ({ onPress, children }) => (
  <Pressable onPress={onPress}>{children}</Pressable>
);

// useLogin.ts - Logic
export const useLogin = () => {
  const login = (credentials) => { /* logic */ };
  return { login };
};

// ❌ BAD: Everything mixed
export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const response = await fetch('/api/login');
    // Logic + UI mixed
  };
  return <Pressable onPress={handleLogin}>Login</Pressable>;
};
```

---

## Folder Structure

### Complete Overview

```
my-app/
├── src/
│   ├── app/                         # Expo Router (App Router)
│   │   ├── (auth)/                  # Auth group (shared layout)
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── _layout.tsx
│   │   ├── (tabs)/                  # Tabs group (navigation tabs)
│   │   │   ├── index.tsx            # Home tab
│   │   │   ├── profile.tsx          # Profile tab
│   │   │   ├── settings.tsx         # Settings tab
│   │   │   └── _layout.tsx          # Tabs layout
│   │   ├── article/
│   │   │   └── [id].tsx             # Dynamic route
│   │   ├── modal.tsx                # Modal screen
│   │   ├── _layout.tsx              # Root layout
│   │   └── +not-found.tsx           # 404 screen
│   │
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Base UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── index.ts
│   │   ├── forms/                   # Form components
│   │   │   ├── LoginForm/
│   │   │   ├── ProfileForm/
│   │   │   └── index.ts
│   │   ├── layout/                  # Layout components
│   │   │   ├── Container/
│   │   │   ├── SafeArea/
│   │   │   └── index.ts
│   │   └── shared/                  # Shared components
│   │       ├── Header/
│   │       ├── Footer/
│   │       └── index.ts
│   │
│   ├── features/                    # Features by business domain
│   │   ├── auth/
│   │   │   ├── components/          # Auth-specific components
│   │   │   │   ├── SocialLoginButtons/
│   │   │   │   └── PasswordStrength/
│   │   │   ├── hooks/               # Auth hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── services/            # Auth services
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── token.service.ts
│   │   │   ├── stores/              # Auth state management
│   │   │   │   └── auth.store.ts
│   │   │   ├── types/               # Auth types
│   │   │   │   └── Auth.types.ts
│   │   │   └── utils/               # Auth utils
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
│   ├── hooks/                       # Global/shared hooks
│   │   ├── useAppState.ts           # App state (foreground/background)
│   │   ├── useKeyboard.ts           # Keyboard status
│   │   ├── useOrientation.ts        # Device orientation
│   │   ├── useNetworkStatus.ts      # Network connectivity
│   │   └── index.ts
│   │
│   ├── services/                    # Global services
│   │   ├── api/                     # API services
│   │   │   ├── client.ts            # API client (Axios)
│   │   │   ├── interceptors.ts      # Request/Response interceptors
│   │   │   ├── endpoints.ts         # API endpoints constants
│   │   │   └── index.ts
│   │   ├── storage/                 # Storage services
│   │   │   ├── mmkv.storage.ts      # MMKV storage
│   │   │   ├── secure.storage.ts    # Secure storage
│   │   │   └── index.ts
│   │   ├── analytics/               # Analytics service
│   │   │   ├── analytics.service.ts
│   │   │   └── events.ts
│   │   ├── notifications/           # Notifications service
│   │   │   └── push.service.ts
│   │   └── location/                # Location service
│   │       └── location.service.ts
│   │
│   ├── stores/                      # Global state management
│   │   ├── app.store.ts             # Global app state
│   │   ├── theme.store.ts           # Theme state
│   │   └── index.ts
│   │
│   ├── navigation/                  # Navigation configuration
│   │   ├── types.ts                 # Navigation types
│   │   ├── linking.ts               # Deep linking config
│   │   └── index.ts
│   │
│   ├── utils/                       # Utilities
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   ├── number.utils.ts
│   │   ├── validation.utils.ts
│   │   └── index.ts
│   │
│   ├── constants/                   # Constants
│   │   ├── app.constants.ts
│   │   ├── api.constants.ts
│   │   ├── storage.constants.ts
│   │   └── index.ts
│   │
│   ├── types/                       # Global types
│   │   ├── global.types.ts
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── index.ts
│   │
│   ├── config/                      # Configuration
│   │   ├── env.ts                   # Environment variables
│   │   ├── app.config.ts            # App configuration
│   │   └── index.ts
│   │
│   ├── theme/                       # Theme
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
├── .expo/                           # Expo generated
├── .husky/                          # Git hooks
├── node_modules/
├── app.json                         # Expo app config
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

## Layer Details

### 1. Presentation Layer (UI)

#### A. App Router (Expo Router)

**New file-based routing architecture**:

```typescript
// src/app/_layout.tsx - Root layout
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

// src/app/(tabs)/_layout.tsx - Tabs layout
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

// src/app/(tabs)/index.tsx - Home screen
export default function HomeScreen() {
  return <HomeView />;
}

// src/app/article/[id].tsx - Dynamic route
import { useLocalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  return <ArticleDetail id={id} />;
}
```

**Expo Router Advantages**:
- File-based routing (like Next.js)
- Type-safe navigation
- Automatic deep linking
- SEO-friendly (Expo Web)
- Shared layouts
- Simplified nested navigation

#### B. Components

**Hierarchical organization**:

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

**Component types**:

1. **UI Components** (dumb/presentational):
   - No business logic
   - Props-driven
   - Highly reusable
   - Easily testable

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

2. **Smart Components** (containers):
   - Connected to state
   - Handle business logic
   - Use hooks

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

3. **Compound Components**:
   - Composed components
   - Intuitive API

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

// Usage:
<Form onSubmit={handleSubmit}>
  <Form.Field label="Email">
    <Input name="email" />
  </Form.Field>
  <Form.Submit>Submit</Form.Submit>
</Form>
```

---

### 2. Application Layer (Logic)

#### A. Custom Hooks

**Encapsulate reusable logic**:

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

// Usage in component:
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

**Common hook patterns**:

```typescript
// 1. Data fetching hook
export const useArticles = (filters?: ArticleFilters) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => articlesService.getAll(filters),
  });
};

// 2. Mutation hook
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: articlesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

// 3. Platform-specific hook
export const usePlatform = () => {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isWeb = Platform.OS === 'web';

  return { isIOS, isAndroid, isWeb };
};

// 4. Device info hook
export const useDeviceInfo = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;
  const isLandscape = width > height;

  return { width, height, isTablet, isLandscape };
};

// 5. Keyboard hook
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

#### B. State Management

**Multi-level architecture**:

```typescript
// 1. Local State (useState, useReducer)
// For state isolated to a component
const [count, setCount] = useState(0);

// 2. URL State (Expo Router)
// For state synchronized with URL
const { id, filter } = useLocalSearchParams<{ id: string; filter: string }>();

// 3. Server State (React Query)
// For server data with cache
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// 4. Global State (Zustand)
// For global client-side state
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

// 5. Persistent State (MMKV)
// For performant storage
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

### 3. Domain Layer (Business Logic)

#### Types & Interfaces

**Type organization**:

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

### 4. Data Layer

#### A. API Services

**API service organization**:

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
  // Request interceptor
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

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Token refresh logic
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await tokenService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Redirect to login
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

#### B. Storage Services

```typescript
// services/storage/secure.storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Fallback for web
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

## Navigation Architecture

### Expo Router Patterns

```typescript
// 1. Group Routes (Shared Layouts)
app/
├── (auth)/
│   ├── _layout.tsx          # Auth layout
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/
    ├── _layout.tsx          # Tabs layout
    ├── index.tsx
    └── profile.tsx

// 2. Dynamic Routes
app/
└── article/
    └── [id].tsx             # /article/123

// 3. Catch-all Routes
app/
└── blog/
    └── [...slug].tsx        # /blog/2024/01/article

// 4. Modal Routes
app/
├── _layout.tsx
└── modal.tsx                # Presented as modal

// Navigation types
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'article/[id]': { id: string };
  modal: { title: string };
};

type ArticleScreenProps = NativeStackScreenProps<RootStackParamList, 'article/[id]'>;

// Type-safe navigation
import { router } from 'expo-router';

router.push({ pathname: '/article/[id]', params: { id: '123' } });
router.back();
router.replace('/login');
```

---

## Platform-Specific Code

### Platform-Specific Code Organization

```typescript
// Method 1: Platform.select
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

// Method 2: File extensions
// Button.ios.tsx
export const Button = () => <IOSButton />;

// Button.android.tsx
export const Button = () => <AndroidButton />;

// Button.tsx (fallback)
export const Button = () => <DefaultButton />;

// Method 3: Platform check
if (Platform.OS === 'ios') {
  // iOS specific
} else if (Platform.OS === 'android') {
  // Android specific
}

// Method 4: Platform version
if (Platform.Version >= 23) {
  // Android API 23+
}
```

---

## Native Modules Organization

```typescript
// src/modules/
├── camera/
│   ├── CameraModule.ts          # TypeScript wrapper
│   ├── CameraModule.ios.ts      # iOS implementation
│   └── CameraModule.android.ts  # Android implementation
└── biometrics/
    ├── BiometricsModule.ts
    ├── BiometricsModule.ios.ts
    └── BiometricsModule.android.ts

// Example wrapper
// modules/camera/CameraModule.ts
import { NativeModules } from 'react-native';

interface CameraInterface {
  takePicture(): Promise<string>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
}

const { CameraModule } = NativeModules;

export default CameraModule as CameraInterface;

// Usage
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

## Architecture Best Practices

### 1. Dependency Injection

```typescript
// ✅ GOOD: Dependency injection
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

// Usage
const repository = new UserRepository(mmkvStorage);

// ❌ BAD: Hard-coded dependency
class UserRepository {
  async getUser() {
    const data = await mmkvStorage.get('user'); // Tight coupling
    return data ? JSON.parse(data) : null;
  }
}
```

### 2. Repository Pattern

```typescript
// features/articles/repositories/articles.repository.ts
import { articlesService } from '../services/articles.service';
import { articlesStorage } from '../services/articles.storage';

class ArticlesRepository {
  async getArticles(filters?: ArticleFilters): Promise<Article[]> {
    try {
      // Try API first
      const articles = await articlesService.getAll(filters);
      // Cache locally
      await articlesStorage.saveArticles(articles.data);
      return articles.data;
    } catch (error) {
      // Fallback to local storage
      return await articlesStorage.getArticles();
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
    // Try cache first
    const cached = await articlesStorage.getArticleById(id);
    if (cached) return cached;

    // Fetch from API
    const article = await articlesService.getById(id);
    await articlesStorage.saveArticle(article);
    return article;
  }
}

export const articlesRepository = new ArticlesRepository();
```

### 3. Adapter Pattern

```typescript
// For adapting external APIs
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

## Complete Examples

### Complete Feature Example: Articles

```typescript
// 1. Types
// features/articles/types/Article.types.ts
export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  publishedAt: Date;
}

// 2. API Service
// features/articles/services/articles.service.ts
class ArticlesService {
  async getAll(): Promise<Article[]> {
    const { data } = await apiClient.get('/articles');
    return data;
  }
}
export const articlesService = new ArticlesService();

// 3. Storage Service
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

// 6. Component
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

// 7. Screen
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

## Architecture Checklist

**Before implementing a feature**:

- [ ] Feature folder created in features/
- [ ] Types defined in types/
- [ ] API service created in services/
- [ ] Storage service if needed
- [ ] Repository if complex logic
- [ ] Custom hook created in hooks/
- [ ] UI components in components/
- [ ] Screen in app/
- [ ] Navigation configured
- [ ] Unit tests
- [ ] Documentation

---

**Architecture is the foundation of maintainability. Invest time from the beginning.**
