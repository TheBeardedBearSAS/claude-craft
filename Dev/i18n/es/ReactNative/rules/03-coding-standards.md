# Estándares de Codificación React Native - TypeScript

## Introducción

Este documento define los estándares de codificación para React Native con TypeScript, ESLint y Prettier.

---

## Estándares TypeScript

### 1. Configuración de Modo Estricto

**tsconfig.json recomendado**:

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

### 2. Anotaciones de Tipo

**Reglas**:
- **SIEMPRE** tipar las props de componentes
- **SIEMPRE** tipar los retornos de funciones públicas
- **SIEMPRE** tipar los parámetros de funciones
- **EVITAR** `any` (usar `unknown` si es necesario)

```typescript
// ✅ BUENO: Tipos explícitos
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

// ❌ MALO: Sin tipos
export const Button = ({ title, onPress, disabled, variant }) => {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </Pressable>
  );
};
```

### 3. Interface vs Type

**Reglas**:
- **Interface** para objetos y props de componentes
- **Type** para uniones, intersecciones, primitivas

```typescript
// ✅ BUENO: Interface para objetos
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProps {
  user: User;
  onEdit: (user: User) => void;
}

// ✅ BUENO: Type para uniones
type Status = 'idle' | 'loading' | 'success' | 'error';

type Result<T> = { data: T; error: null } | { data: null; error: Error };

// ✅ BUENO: Type para intersecciones
type WithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type Article = {
  id: string;
  title: string;
} & WithTimestamps;
```

### 4. Genéricos

```typescript
// Utility types genéricos
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncData<T> = {
  data: Nullable<T>;
  loading: boolean;
  error: Nullable<Error>;
};

// Hook genérico
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

// Uso
const { data, loading, error } = useFetch<User[]>('/api/users');
```

### 5. Type Guards

```typescript
// Type guard para verificar tipos
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
};

// Uso
const processData = (data: unknown) => {
  if (isUser(data)) {
    // TypeScript sabe que data es User aquí
    console.log(data.email);
  }
};

// Type guard para arrays
export const isArray = <T,>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

// Discriminated unions
type Success<T> = { status: 'success'; data: T };
type Failure = { status: 'error'; error: Error };
type ApiResponse<T> = Success<T> | Failure;

const handleResponse = <T,>(response: ApiResponse<T>) => {
  if (response.status === 'success') {
    // TypeScript sabe que response.data existe
    return response.data;
  } else {
    // TypeScript sabe que response.error existe
    throw response.error;
  }
};
```

### 6. Utility Types

```typescript
// Built-in utility types
type UserKeys = keyof User; // 'id' | 'name' | 'email'
type PartialUser = Partial<User>; // Todos los campos opcionales
type RequiredUser = Required<User>; // Todos los campos requeridos
type ReadonlyUser = Readonly<User>; // Todos los campos readonly
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

## Estándares de Componentes

### 1. Componentes Funcionales

**SIEMPRE** utilizar componentes funcionales con hooks:

```typescript
// ✅ BUENO: Componente funcional
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
      <Text>Hola, {name}!</Text>
      {age && <Text>Edad: {age}</Text>}
    </View>
  );
};

// ❌ MALO: Componente de clase (obsoleto)
class Greeting extends React.Component<GreetingProps> {
  render() {
    return (
      <View>
        <Text>Hola, {this.props.name}!</Text>
      </View>
    );
  }
}
```

### 2. Estructura de Componentes

**Orden estándar de los elementos en un componente**:

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

// 3. Constantes (si son específicas del componente)
const MAX_COUNT = 100;

// 4. Componente
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

  // 4.5. Render helpers (opcional)
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

// 5. Estilos (si inline, sino archivo separado)
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

### 3. Destructuración de Props

```typescript
// ✅ BUENO: Destructuración con default values
export const Button: FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  return <Pressable onPress={onPress}>{title}</Pressable>;
};

// ❌ MALO: Objeto props
export const Button: FC<ButtonProps> = (props) => {
  return <Pressable onPress={props.onPress}>{props.title}</Pressable>;
};
```

### 4. Renderizado Condicional

```typescript
// ✅ BUENO: Ternario para dos opciones
{isLoading ? <LoadingSpinner /> : <Content />}

// ✅ BUENO: && para render condicional
{error && <ErrorMessage error={error} />}

// ✅ BUENO: Early return para lógica compleja
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <Content />;

// ❌ MALO: Ternario anidado
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage />
) : (
  <Content />
)}

// ✅ BUENO: Variable intermedia para lógica compleja
const content = (() => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  return <Content data={data} />;
})();

return <View>{content}</View>;
```

### 5. Event Handlers

```typescript
// ✅ BUENO: Funciones handler nombradas
const handlePress = () => {
  console.log('Pressed');
};

const handleSubmit = (data: FormData) => {
  console.log('Submitted:', data);
};

<Button onPress={handlePress} />

// ❌ MALO: Funciones arrow inline (re-render)
<Button onPress={() => console.log('Pressed')} />

// ✅ BUENO: useCallback para handlers complejos
const handlePress = useCallback(() => {
  // Lógica compleja
}, [dependencies]);

// ✅ BUENO: Handler con parámetros
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

## Estándares de Hooks

### 1. Naming de Custom Hooks

**SIEMPRE** prefijar con `use`:

```typescript
// ✅ BUENO
export const useAuth = () => { ... };
export const useArticles = () => { ... };
export const useDebouncedValue = () => { ... };

// ❌ MALO
export const getAuth = () => { ... };
export const articles = () => { ... };
```

### 2. Estructura de Hook

```typescript
// Template de hook custom
export const useFeature = (param: string) => {
  // 1. State
  const [state, setState] = useState<State>(initialState);

  // 2. Refs
  const ref = useRef<HTMLElement>(null);

  // 3. Otros hooks
  const { data } = useQuery({ ... });

  // 4. Effects
  useEffect(() => {
    // Lógica del effect
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 5. Callbacks
  const handleAction = useCallback(() => {
    // Lógica de la acción
  }, [dependencies]);

  // 6. Valores computados
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

### 3. Reglas de Hooks

```typescript
// ✅ BUENO: Hooks en el nivel superior
export const Component = () => {
  const [count, setCount] = useState(0);
  const { data } = useQuery({ ... });

  return <View />;
};

// ❌ MALO: Hooks condicionales
export const Component = ({ condition }) => {
  if (condition) {
    const [count, setCount] = useState(0); // ❌ Error!
  }
  return <View />;
};

// ✅ BUENO: Condición dentro del hook
export const Component = ({ condition }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (condition) {
      // Lógica condicional aquí
    }
  }, [condition]);

  return <View />;
};
```

### 4. Arrays de Dependencias

```typescript
// ✅ BUENO: Dependencias explícitas
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ MALO: Empty deps con dependencias
useEffect(() => {
  fetchData(userId); // ❌ userId no está en deps
}, []);

// ✅ BUENO: useCallback para funciones
const fetchData = useCallback(() => {
  api.get(userId);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ BUENO: Exhaustive deps con ESLint
// .eslintrc.js
{
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}
```

---

## Estándares de Estilos

### 1. StyleSheet

**SIEMPRE** utilizar `StyleSheet.create`:

```typescript
import { StyleSheet } from 'react-native';

// ✅ BUENO: StyleSheet.create
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

// ❌ MALO: Objeto de estilos inline
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
};
```

### 2. Organización de Estilos

```typescript
// Opción 1: Archivo separado
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

// Opción 2: Al final del archivo (componentes simples)
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

### 3. Estilos Dinámicos

```typescript
// ✅ BUENO: Sintaxis de array
<View style={[styles.base, isActive && styles.active]} />

// ✅ BUENO: Estilos condicionales
<View
  style={[
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    disabled && styles.disabled,
  ]}
/>

// ✅ BUENO: Específicos de plataforma
<View
  style={[
    styles.container,
    Platform.OS === 'ios' && styles.ios,
    Platform.OS === 'android' && styles.android,
  ]}
/>

// ❌ MALO: Objeto inline
<View style={{ backgroundColor: isActive ? 'blue' : 'gray' }} />
```

### 4. Integración con Tema

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

// Uso
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

## Estándares de Código Específico de Plataforma

### 1. Platform.select

```typescript
// ✅ BUENO: Platform.select para estilos
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

// ✅ BUENO: Platform.select para valores
const HEADER_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
  default: 50,
});
```

### 2. Extensiones de Archivo

```typescript
// Button.ios.tsx
export const Button = () => <IOSSpecificButton />;

// Button.android.tsx
export const Button = () => <AndroidSpecificButton />;

// Button.tsx (fallback)
export const Button = () => <DefaultButton />;

// Import (automático)
import { Button } from './Button'; // Carga el archivo correcto
```

### 3. Verificaciones de Plataforma

```typescript
// ✅ BUENO: Verificación de plataforma
if (Platform.OS === 'ios') {
  // Específico de iOS
} else if (Platform.OS === 'android') {
  // Específico de Android
}

// ✅ BUENO: Verificación de versión
if (Platform.Version >= 23) {
  // Android API 23+
}

// ✅ BUENO: isPad
import { Platform } from 'react-native';

const isTablet = Platform.isPad || Platform.isTV;
```

---

## Organización de Imports

### 1. Orden de Imports

```typescript
// 1. React & React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// 2. Librerías externas
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// 3. Internos - Imports absolutos (alfabético)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/theme';
import type { User } from '@/types/User.types';

// 4. Imports relativos
import { Header } from './components/Header';
import { styles } from './Screen.styles';
import { SCREEN_NAME } from './constants';

// 5. Assets
import logo from '@/assets/logo.png';
```

### 2. Named vs Default Exports

```typescript
// ✅ BUENO: Named exports (preferido)
export const Button = () => { ... };
export const Card = () => { ... };

// Uso
import { Button, Card } from '@/components/ui';

// ✅ ACEPTABLE: Default export para screens/pages
// app/(tabs)/index.tsx
export default function HomeScreen() { ... }

// ❌ EVITAR: Mezcla de ambos
export const Button = () => { ... };
export default Button; // Confuso
```

### 3. Type Imports

```typescript
// ✅ BUENO: Type imports explícitos
import type { User } from '@/types/User.types';
import type { FC } from 'react';

// ✅ BUENO: Import con types
import { type User, fetchUser } from '@/services/user.service';

// Configuración de TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

---

## Estándares de Manejo de Errores

### 1. Try-Catch

```typescript
// ✅ BUENO: Try-catch con tipado de error
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

// ✅ BUENO: Tipos de error personalizados
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
      // Manejar error de API
      console.error(`API Error ${error.statusCode}: ${error.message}`);
    } else {
      // Manejar otros errores
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
    // Registrar en servicio de reporte de errores
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
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Button title="Intentar de nuevo" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

// Uso
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Estándares de Performance

### 1. Memoización

```typescript
// ✅ BUENO: React.memo para componentes
export const ExpensiveComponent = React.memo(
  ({ data }: Props) => {
    return <View>{/* Renderizado costoso */}</View>;
  },
  (prevProps, nextProps) => {
    // Comparación personalizada
    return prevProps.data.id === nextProps.data.id;
  }
);

// ✅ BUENO: useMemo para cálculos costosos
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// ✅ BUENO: useCallback para funciones
const handlePress = useCallback(() => {
  console.log('Pressed');
}, []);
```

### 2. Optimización de FlatList

```typescript
// ✅ BUENO: FlatList optimizado
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  // Props de performance
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5}
  removeClippedSubviews={true}
  // Optimización
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## Convenciones de Nombres

### 1. Variables

```typescript
// ✅ BUENO: camelCase
const userName = 'John';
const isLoading = false;
const totalCount = 100;

// ❌ MALO
const user_name = 'John';
const UserName = 'John';
```

### 2. Constantes

```typescript
// ✅ BUENO: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
```

### 3. Componentes

```typescript
// ✅ BUENO: PascalCase
export const UserProfile = () => { ... };
export const ArticleCard = () => { ... };

// ❌ MALO
export const userProfile = () => { ... };
export const article_card = () => { ... };
```

### 4. Archivos

```typescript
// ✅ BUENO: PascalCase para componentes
Button.tsx
UserProfile.tsx
ArticleCard.tsx

// ✅ BUENO: camelCase para utils/services
formatDate.ts
apiClient.ts
userService.ts

// ✅ BUENO: kebab-case también aceptable
format-date.ts
api-client.ts
user-service.ts
```

---

## Comentarios y Documentación

### 1. JSDoc

```typescript
/**
 * Obtiene datos de usuario desde la API
 * @param userId - El ID del usuario a obtener
 * @returns Promise que resuelve al objeto User
 * @throws {ApiError} Cuando la solicitud a la API falla
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export const fetchUser = async (userId: string): Promise<User> => {
  // Implementación
};

/**
 * Componente de botón con múltiples variantes
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" onPress={() => console.log('Pressed')}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, onPress, children }) => {
  // Implementación
};
```

### 2. Comentarios Inline

```typescript
// ✅ BUENO: Explica el "por qué"
// Workaround para bug de sombra en Android API < 28
if (Platform.OS === 'android' && Platform.Version < 28) {
  // Usar elevation en lugar de shadow
}

// ❌ MALO: Explica el "qué" (ya es evidente)
// Establecer count a 0
setCount(0);
```

---

## Checklist de Estándares de Codificación

- [ ] Modo estricto de TypeScript activado
- [ ] Todas las props tipadas
- [ ] Todos los retornos de funciones tipados
- [ ] No se usa `any`
- [ ] Componentes funcionales utilizados
- [ ] Hooks en el nivel superior
- [ ] Arrays de dependencias correctos
- [ ] StyleSheet.create utilizado
- [ ] Tema integrado
- [ ] Imports organizados
- [ ] Named exports (excepto screens)
- [ ] Manejo de errores implementado
- [ ] Memoización si es necesario
- [ ] JSDoc para APIs públicas
- [ ] Convenciones de nombres respetadas

---

**El código de calidad está tipado, estructurado y documentado.**
