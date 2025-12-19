# React Native Coding Standards - TypeScript

## Introduction

This document defines coding standards for React Native with TypeScript, ESLint, and Prettier.

---

## TypeScript Standards

### 1. Configuration Strict Mode

**tsconfig.json recommandé**:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-native",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@services/*": ["src/services/*"],
      "@stores/*": ["src/stores/*"],
      "@constants/*": ["src/constants/*"],
      "@theme/*": ["src/theme/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "include": ["src/**/*", "app/**/*", ".expo/types/**/*.ts"],
  "exclude": ["node_modules", "**/*.spec.ts", "**/*.test.ts"]
}
```

### 2. Type Annotations

**Rules**:
- **ALWAYS** typer les props de composants
- **ALWAYS** typer les retours de fonctions publiques
- **ALWAYS** typer les paramètres de fonctions
- **AVOID** `any` (utiliser `unknown` si nécessaire)

```typescript
// ✅ GOOD: Types explicites
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
}: ButtonProps): JSX.Element => {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </Pressable>
  );
};

// ❌ BAD: Pas de types
export const Button = ({ title, onPress, disabled, variant }) => {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </Pressable>
  );
};
```

### 3. Interface vs Type

**Rules**:
- **Interface** pour objects et props de composants
- **Type** pour unions, intersections, primitives

```typescript
// ✅ GOOD: Interface pour objects
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProps {
  user: User;
  onEdit: (user: User) => void;
}

// ✅ GOOD: Type pour unions
type Status = 'idle' | 'loading' | 'success' | 'error';

type Result<T> = { data: T; error: null } | { data: null; error: Error };

// ✅ GOOD: Type pour intersections
type WithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type Article = {
  id: string;
  title: string;
} & WithTimestamps;
```

### 4. Generics

```typescript
// Utility types génériques
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncData<T> = {
  data: Nullable<T>;
  loading: boolean;
  error: Nullable<Error>;
};

// Hook générique
export const useFetch = <T,>(url: string): AsyncData<T> => {
  const [data, setData] = useState<Nullable<T>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Nullable<Error>>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data: T) => setData(data))
      .catch((err: Error) => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};

// Usage
const { data, loading, error } = useFetch<User[]>('/api/users');
```

### 5. Type Guards

```typescript
// Type guard pour vérifier les types
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
};

// Usage
const processData = (data: unknown) => {
  if (isUser(data)) {
    // TypeScript sait que data est User ici
    console.log(data.email);
  }
};

// Type guard pour arrays
export const isArray = <T,>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

// Discriminated unions
type Success<T> = { status: 'success'; data: T };
type Failure = { status: 'error'; error: Error };
type ApiResponse<T> = Success<T> | Failure;

const handleResponse = <T,>(response: ApiResponse<T>) => {
  if (response.status === 'success') {
    // TypeScript sait que response.data existe
    return response.data;
  } else {
    // TypeScript sait que response.error existe
    throw response.error;
  }
};
```

### 6. Utility Types

```typescript
// Built-in utility types
type UserKeys = keyof User; // 'id' | 'name' | 'email'
type PartialUser = Partial<User>; // Tous les champs optionnels
type RequiredUser = Required<User>; // Tous les champs requis
type ReadonlyUser = Readonly<User>; // Tous les champs readonly
type UserName = Pick<User, 'name'>; // { name: string }
type UserWithoutId = Omit<User, 'id'>; // { name: string; email: string }

// Custom utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
```

---

## Component Standards

### 1. Functional Components

**ALWAYS** utiliser les functional components avec hooks:

```typescript
// ✅ GOOD: Functional component
import React from 'react';
import { View, Text } from 'react-native';
import type { FC } from 'react';

interface GreetingProps {
  name: string;
  age?: number;
}

export const Greeting: FC<GreetingProps> = ({ name, age }) => {
  return (
    <View>
      <Text>Hello, {name}!</Text>
      {age && <Text>Age: {age}</Text>}
    </View>
  );
};

// ❌ BAD: Class component (deprecated)
class Greeting extends React.Component<GreetingProps> {
  render() {
    return (
      <View>
        <Text>Hello, {this.props.name}!</Text>
      </View>
    );
  }
}
```

### 2. Component Structure

**Ordre standard des éléments dans un composant**:

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';

// 2. Types
interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
}

// 3. Constants (si spécifiques au composant)
const MAX_COUNT = 100;

// 4. Component
export const Counter: FC<CounterProps> = ({
  initialValue = 0,
  onValueChange,
}) => {
  // 4.1. Hooks - State
  const [count, setCount] = useState(initialValue);

  // 4.2. Hooks - Custom hooks
  const { data } = useQuery({ queryKey: ['count'], queryFn: fetchCount });

  // 4.3. Hooks - Effects
  useEffect(() => {
    onValueChange?.(count);
  }, [count, onValueChange]);

  // 4.4. Event handlers
  const handleIncrement = () => {
    if (count < MAX_COUNT) {
      setCount((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount((prev) => prev - 1);
    }
  };

  // 4.5. Render helpers (optional)
  const renderValue = () => <Text style={styles.value}>{count}</Text>;

  // 4.6. Early returns
  if (data === undefined) {
    return <LoadingSpinner />;
  }

  // 4.7. Main render
  return (
    <View style={styles.container}>
      <Pressable onPress={handleDecrement} style={styles.button}>
        <Text>-</Text>
      </Pressable>
      {renderValue()}
      <Pressable onPress={handleIncrement} style={styles.button}>
        <Text>+</Text>
      </Pressable>
    </View>
  );
};

// 5. Styles (si inline, sinon fichier séparé)
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 10,
  },
  value: {
    fontSize: 24,
    marginHorizontal: 20,
  },
});
```

### 3. Props Destructuring

```typescript
// ✅ GOOD: Destructuring avec default values
export const Button: FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  return <Pressable onPress={onPress}>{title}</Pressable>;
};

// ❌ BAD: Props object
export const Button: FC<ButtonProps> = (props) => {
  return <Pressable onPress={props.onPress}>{props.title}</Pressable>;
};
```

### 4. Conditional Rendering

```typescript
// ✅ GOOD: Ternary pour deux options
{isLoading ? <LoadingSpinner /> : <Content />}

// ✅ GOOD: && pour render conditionnel
{error && <ErrorMessage error={error} />}

// ✅ GOOD: Early return pour logique complexe
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <Content />;

// ❌ BAD: Ternaire nested
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage />
) : (
  <Content />
)}

// ✅ GOOD: Variable intermédiaire pour logique complexe
const content = (() => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  return <Content data={data} />;
})();

return <View>{content}</View>;
```

### 5. Event Handlers

```typescript
// ✅ GOOD: Named handler functions
const handlePress = () => {
  console.log('Pressed');
};

const handleSubmit = (data: FormData) => {
  console.log('Submitted:', data);
};

<Button onPress={handlePress} />

// ❌ BAD: Inline arrow functions (re-render)
<Button onPress={() => console.log('Pressed')} />

// ✅ GOOD: useCallback pour handlers complexes
const handlePress = useCallback(() => {
  // Complex logic
}, [dependencies]);

// ✅ GOOD: Handler avec paramètres
const handleItemPress = useCallback(
  (id: string) => {
    navigation.navigate('Detail', { id });
  },
  [navigation]
);

<FlatList
  data={items}
  renderItem={({ item }) => (
    <ItemCard item={item} onPress={() => handleItemPress(item.id)} />
  )}
/>
```

---

## Hooks Standards

### 1. Custom Hooks Naming

**ALWAYS** préfixer avec `use`:

```typescript
// ✅ BON
export const useAuth = () => { ... };
export const useArticles = () => { ... };
export const useDebouncedValue = () => { ... };

// ❌ MAUVAIS
export const getAuth = () => { ... };
export const articles = () => { ... };
```

### 2. Hook Structure

```typescript
// Template de hook custom
export const useFeature = (param: string) => {
  // 1. State
  const [state, setState] = useState<State>(initialState);

  // 2. Refs
  const ref = useRef<HTMLElement>(null);

  // 3. Other hooks
  const { data } = useQuery({ ... });

  // 4. Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 5. Callbacks
  const handleAction = useCallback(() => {
    // Action logic
  }, [dependencies]);

  // 6. Computed values
  const computedValue = useMemo(() => {
    return expensiveComputation(state);
  }, [state]);

  // 7. Return
  return {
    state,
    computedValue,
    handleAction,
  };
};
```

### 3. Rules of Hooks

```typescript
// ✅ GOOD: Hooks au top level
export const Component = () => {
  const [count, setCount] = useState(0);
  const { data } = useQuery({ ... });

  return <View />;
};

// ❌ BAD: Hooks conditionnels
export const Component = ({ condition }) => {
  if (condition) {
    const [count, setCount] = useState(0); // ❌ Erreur!
  }
  return <View />;
};

// ✅ GOOD: Condition dans le hook
export const Component = ({ condition }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (condition) {
      // Logic conditionnelle ici
    }
  }, [condition]);

  return <View />;
};
```

### 4. Dependencies Arrays

```typescript
// ✅ GOOD: Dependencies explicites
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ BAD: Empty deps avec dépendances
useEffect(() => {
  fetchData(userId); // ❌ userId pas dans deps
}, []);

// ✅ GOOD: useCallback pour functions
const fetchData = useCallback(() => {
  api.get(userId);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ GOOD: Exhaustive deps avec ESLint
// .eslintrc.js
{
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}
```

---

## Styling Standards

### 1. StyleSheet

**ALWAYS** utiliser `StyleSheet.create`:

```typescript
import { StyleSheet } from 'react-native';

// ✅ GOOD: StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

// ❌ BAD: Inline styles object
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
};
```

### 2. Styles Organization

```typescript
// Option 1: Fichier séparé
// Button.tsx
import { styles } from './Button.styles';

export const Button = () => (
  <Pressable style={styles.button}>
    <Text style={styles.text}>Press</Text>
  </Pressable>
);

// Button.styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
  },
});

// Option 2: Bottom of file (composants simples)
// Button.tsx
export const Button = () => (
  <Pressable style={styles.button}>
    <Text style={styles.text}>Press</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: { ... },
  text: { ... },
});
```

### 3. Dynamic Styles

```typescript
// ✅ GOOD: Array syntax
<View style={[styles.base, isActive && styles.active]} />

// ✅ GOOD: Conditional styles
<View
  style={[
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    disabled && styles.disabled,
  ]}
/>

// ✅ GOOD: Platform specific
<View
  style={[
    styles.container,
    Platform.OS === 'ios' && styles.ios,
    Platform.OS === 'android' && styles.android,
  ]}
/>

// ❌ BAD: Inline object
<View style={{ backgroundColor: isActive ? 'blue' : 'gray' }} />
```

### 4. Theme Integration

```typescript
// theme/index.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',
    light: '#F2F2F7',
    dark: '#1C1C1E',
    white: '#FFFFFF',
    black: '#000000',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#8E8E93',
      disabled: '#C7C7CC',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;

// Usage
import { theme } from '@/theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
});
```

---

## Platform-Specific Code Standards

### 1. Platform.select

```typescript
// ✅ GOOD: Platform.select pour styles
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

// ✅ GOOD: Platform.select pour valeurs
const HEADER_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
  default: 50,
});
```

### 2. File Extensions

```typescript
// Button.ios.tsx
export const Button = () => <IOSSpecificButton />;

// Button.android.tsx
export const Button = () => <AndroidSpecificButton />;

// Button.tsx (fallback)
export const Button = () => <DefaultButton />;

// Import (automatique)
import { Button } from './Button'; // Charge le bon fichier
```

### 3. Platform Checks

```typescript
// ✅ GOOD: Platform check
if (Platform.OS === 'ios') {
  // iOS specific
} else if (Platform.OS === 'android') {
  // Android specific
}

// ✅ GOOD: Version check
if (Platform.Version >= 23) {
  // Android API 23+
}

// ✅ GOOD: isPad
import { Platform } from 'react-native';

const isTablet = Platform.isPad || Platform.isTV;
```

---

## Imports Organization

### 1. Import Order

```typescript
// 1. React & React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// 3. Internal - Absolute imports (alphabétique)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/theme';
import type { User } from '@/types/User.types';

// 4. Relative imports
import { Header } from './components/Header';
import { styles } from './Screen.styles';
import { SCREEN_NAME } from './constants';

// 5. Assets
import logo from '@/assets/logo.png';
```

### 2. Named vs Default Exports

```typescript
// ✅ GOOD: Named exports (préféré)
export const Button = () => { ... };
export const Card = () => { ... };

// Usage
import { Button, Card } from '@/components/ui';

// ✅ ACCEPTABLE: Default export pour screens/pages
// app/(tabs)/index.tsx
export default function HomeScreen() { ... }

// ❌ ÉVITER: Mix des deux
export const Button = () => { ... };
export default Button; // Confusing
```

### 3. Type Imports

```typescript
// ✅ GOOD: Type imports explicites
import type { User } from '@/types/User.types';
import type { FC } from 'react';

// ✅ GOOD: Import avec types
import { type User, fetchUser } from '@/services/user.service';

// Configuration TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

---

## Error Handling Standards

### 1. Try-Catch

```typescript
// ✅ GOOD: Try-catch avec error typing
const fetchData = async () => {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};

// ✅ GOOD: Custom error types
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch data',
        response.status,
        'FETCH_ERROR'
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API error
      console.error(`API Error ${error.statusCode}: ${error.message}`);
    } else {
      // Handle other errors
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
```

### 2. Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Log to error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Button title="Try Again" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Performance Standards

### 1. Memoization

```typescript
// ✅ GOOD: React.memo pour composants
export const ExpensiveComponent = React.memo(
  ({ data }: Props) => {
    return <View>{/* Expensive render */}</View>;
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id;
  }
);

// ✅ GOOD: useMemo pour calculs coûteux
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// ✅ GOOD: useCallback pour fonctions
const handlePress = useCallback(() => {
  console.log('Pressed');
}, []);
```

### 2. FlatList Optimization

```typescript
// ✅ GOOD: FlatList optimisé
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  // Performance props
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5}
  removeClippedSubviews={true}
  // Optimization
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## Naming Conventions

### 1. Variables

```typescript
// ✅ GOOD: camelCase
const userName = 'John';
const isLoading = false;
const totalCount = 100;

// ❌ MAUVAIS
const user_name = 'John';
const UserName = 'John';
```

### 2. Constants

```typescript
// ✅ GOOD: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
```

### 3. Components

```typescript
// ✅ GOOD: PascalCase
export const UserProfile = () => { ... };
export const ArticleCard = () => { ... };

// ❌ MAUVAIS
export const userProfile = () => { ... };
export const article_card = () => { ... };
```

### 4. Files

```typescript
// ✅ GOOD: PascalCase pour composants
Button.tsx
UserProfile.tsx
ArticleCard.tsx

// ✅ GOOD: camelCase pour utils/services
formatDate.ts
apiClient.ts
userService.ts

// ✅ GOOD: kebab-case acceptable aussi
format-date.ts
api-client.ts
user-service.ts
```

---

## Comments & Documentation

### 1. JSDoc

```typescript
/**
 * Fetches user data from the API
 * @param userId - The ID of the user to fetch
 * @returns Promise resolving to User object
 * @throws {ApiError} When the API request fails
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export const fetchUser = async (userId: string): Promise<User> => {
  // Implementation
};

/**
 * Button component with multiple variants
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" onPress={() => console.log('Pressed')}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, onPress, children }) => {
  // Implementation
};
```

### 2. Inline Comments

```typescript
// ✅ GOOD: Explique le "pourquoi"
// Workaround for Android shadow bug on API < 28
if (Platform.OS === 'android' && Platform.Version < 28) {
  // Use elevation instead of shadow
}

// ❌ BAD: Explique le "quoi" (déjà évident)
// Set count to 0
setCount(0);
```

---

## Coding Standards Checklist

- [ ] TypeScript strict mode activé
- [ ] Tous les props typés
- [ ] Tous les retours de fonctions typés
- [ ] Pas d'utilisation de `any`
- [ ] Functional components utilisés
- [ ] Hooks au top level
- [ ] Dependencies arrays correctes
- [ ] StyleSheet.create utilisé
- [ ] Theme intégré
- [ ] Imports organisés
- [ ] Named exports (sauf screens)
- [ ] Error handling en place
- [ ] Memoization si nécessaire
- [ ] JSDoc pour APIs publiques
- [ ] Naming conventions respectées

---

**Quality code is typed, structured, and documented.**
