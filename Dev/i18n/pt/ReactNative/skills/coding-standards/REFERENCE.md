# Padrões de Codificação React Native - TypeScript

## Introdução

Este documento define os padrões de codificação para React Native com TypeScript, ESLint e Prettier.

---

## Padrões TypeScript

### 1. Configuração Modo Strict

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

### 2. Anotações de Tipo

**Regras**:
- **SEMPRE** tipar props de componentes
- **SEMPRE** tipar retornos de funções públicas
- **SEMPRE** tipar parâmetros de funções
- **EVITAR** `any` (usar `unknown` se necessário)

```typescript
// ✅ BOM: Tipos explícitos
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

// ❌ RUIM: Sem tipos
export const Button = ({ title, onPress, disabled, variant }) => {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </Pressable>
  );
};
```

### 3. Interface vs Type

**Regras**:
- **Interface** para objetos e props de componentes
- **Type** para unions, intersections, primitivos

```typescript
// ✅ BOM: Interface para objetos
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProps {
  user: User;
  onEdit: (user: User) => void;
}

// ✅ BOM: Type para unions
type Status = 'idle' | 'loading' | 'success' | 'error';

type Result<T> = { data: T; error: null } | { data: null; error: Error };

// ✅ BOM: Type para intersections
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
// Tipos utilitários genéricos
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
    // TypeScript sabe que data é User aqui
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
// Utility types built-in
type UserKeys = keyof User; // 'id' | 'name' | 'email'
type PartialUser = Partial<User>; // Todos os campos opcionais
type RequiredUser = Required<User>; // Todos os campos obrigatórios
type ReadonlyUser = Readonly<User>; // Todos os campos readonly
type UserName = Pick<User, 'name'>; // { name: string }
type UserWithoutId = Omit<User, 'id'>; // { name: string; email: string }

// Utility types customizados
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

## Padrões de Componentes

### 1. Componentes Funcionais

**SEMPRE** usar componentes funcionais com hooks:

```typescript
// ✅ BOM: Componente funcional
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
      <Text>Olá, {name}!</Text>
      {age && <Text>Idade: {age}</Text>}
    </View>
  );
};

// ❌ RUIM: Componente de classe (deprecado)
class Greeting extends React.Component<GreetingProps> {
  render() {
    return (
      <View>
        <Text>Olá, {this.props.name}!</Text>
      </View>
    );
  }
}
```

### 2. Estrutura do Componente

**Ordem padrão dos elementos em um componente**:

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';

// 2. Tipos
interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
}

// 3. Constantes (se específicas do componente)
const MAX_COUNT = 100;

// 4. Componente
export const Counter: FC<CounterProps> = ({
  initialValue = 0,
  onValueChange,
}) => {
  // 4.1. Hooks - Estado
  const [count, setCount] = useState(initialValue);

  // 4.2. Hooks - Hooks customizados
  const { data } = useQuery({ queryKey: ['count'], queryFn: fetchCount });

  // 4.3. Hooks - Efeitos
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

  // 4.7. Render principal
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

// 5. Estilos (se inline, senão arquivo separado)
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

### 3. Destructuring de Props

```typescript
// ✅ BOM: Destructuring com valores padrão
export const Button: FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  return <Pressable onPress={onPress}>{title}</Pressable>;
};

// ❌ RUIM: Objeto props
export const Button: FC<ButtonProps> = (props) => {
  return <Pressable onPress={props.onPress}>{props.title}</Pressable>;
};
```

### 4. Renderização Condicional

```typescript
// ✅ BOM: Ternário para duas opções
{isLoading ? <LoadingSpinner /> : <Content />}

// ✅ BOM: && para render condicional
{error && <ErrorMessage error={error} />}

// ✅ BOM: Early return para lógica complexa
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <Content />;

// ❌ RUIM: Ternário aninhado
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage />
) : (
  <Content />
)}

// ✅ BOM: Variável intermediária para lógica complexa
const content = (() => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  return <Content data={data} />;
})();

return <View>{content}</View>;
```

### 5. Event Handlers

```typescript
// ✅ BOM: Funções handler nomeadas
const handlePress = () => {
  console.log('Pressionado');
};

const handleSubmit = (data: FormData) => {
  console.log('Enviado:', data);
};

<Button onPress={handlePress} />

// ❌ RUIM: Arrow functions inline (re-render)
<Button onPress={() => console.log('Pressionado')} />

// ✅ BOM: useCallback para handlers complexos
const handlePress = useCallback(() => {
  // Lógica complexa
}, [dependencies]);

// ✅ BOM: Handler com parâmetros
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

## Padrões de Hooks

### 1. Nomenclatura de Hooks Customizados

**SEMPRE** prefixar com `use`:

```typescript
// ✅ BOM
export const useAuth = () => { ... };
export const useArticles = () => { ... };
export const useDebouncedValue = () => { ... };

// ❌ RUIM
export const getAuth = () => { ... };
export const articles = () => { ... };
```

### 2. Estrutura de Hook

```typescript
// Template de hook customizado
export const useFeature = (param: string) => {
  // 1. Estado
  const [state, setState] = useState<State>(initialState);

  // 2. Refs
  const ref = useRef<HTMLElement>(null);

  // 3. Outros hooks
  const { data } = useQuery({ ... });

  // 4. Efeitos
  useEffect(() => {
    // Lógica de efeito
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 5. Callbacks
  const handleAction = useCallback(() => {
    // Lógica de ação
  }, [dependencies]);

  // 6. Valores computados
  const computedValue = useMemo(() => {
    return expensiveComputation(state);
  }, [state]);

  // 7. Retorno
  return {
    state,
    computedValue,
    handleAction,
  };
};
```

### 3. Regras dos Hooks

```typescript
// ✅ BOM: Hooks no top level
export const Component = () => {
  const [count, setCount] = useState(0);
  const { data } = useQuery({ ... });

  return <View />;
};

// ❌ RUIM: Hooks condicionais
export const Component = ({ condition }) => {
  if (condition) {
    const [count, setCount] = useState(0); // ❌ Erro!
  }
  return <View />;
};

// ✅ BOM: Condição dentro do hook
export const Component = ({ condition }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (condition) {
      // Lógica condicional aqui
    }
  }, [condition]);

  return <View />;
};
```

### 4. Arrays de Dependências

```typescript
// ✅ BOM: Dependências explícitas
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ RUIM: Deps vazias com dependências
useEffect(() => {
  fetchData(userId); // ❌ userId não está em deps
}, []);

// ✅ BOM: useCallback para funções
const fetchData = useCallback(() => {
  api.get(userId);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ BOM: Deps exaustivas com ESLint
// .eslintrc.js
{
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}
```

---

## Padrões de Estilo

### 1. StyleSheet

**SEMPRE** usar `StyleSheet.create`:

```typescript
import { StyleSheet } from 'react-native';

// ✅ BOM: StyleSheet.create
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

// ❌ RUIM: Objeto de estilos inline
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
};
```

### 2. Organização de Estilos

```typescript
// Opção 1: Arquivo separado
// Button.tsx
import { styles } from './Button.styles';

export const Button = () => (
  <Pressable style={styles.button}>
    <Text style={styles.text}>Pressionar</Text>
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

// Opção 2: Final do arquivo (componentes simples)
// Button.tsx
export const Button = () => (
  <Pressable style={styles.button}>
    <Text style={styles.text}>Pressionar</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: { ... },
  text: { ... },
});
```

### 3. Estilos Dinâmicos

```typescript
// ✅ BOM: Sintaxe de array
<View style={[styles.base, isActive && styles.active]} />

// ✅ BOM: Estilos condicionais
<View
  style={[
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    disabled && styles.disabled,
  ]}
/>

// ✅ BOM: Específico de plataforma
<View
  style={[
    styles.container,
    Platform.OS === 'ios' && styles.ios,
    Platform.OS === 'android' && styles.android,
  ]}
/>

// ❌ RUIM: Objeto inline
<View style={{ backgroundColor: isActive ? 'blue' : 'gray' }} />
```

### 4. Integração com Tema

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

## Padrões de Código Específicos de Plataforma

### 1. Platform.select

```typescript
// ✅ BOM: Platform.select para estilos
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

// ✅ BOM: Platform.select para valores
const HEADER_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
  default: 50,
});
```

### 2. Extensões de Arquivo

```typescript
// Button.ios.tsx
export const Button = () => <IOSSpecificButton />;

// Button.android.tsx
export const Button = () => <AndroidSpecificButton />;

// Button.tsx (fallback)
export const Button = () => <DefaultButton />;

// Import (automático)
import { Button } from './Button'; // Carrega o arquivo correto
```

### 3. Verificações de Plataforma

```typescript
// ✅ BOM: Verificação de plataforma
if (Platform.OS === 'ios') {
  // Específico de iOS
} else if (Platform.OS === 'android') {
  // Específico de Android
}

// ✅ BOM: Verificação de versão
if (Platform.Version >= 23) {
  // Android API 23+
}

// ✅ BOM: isPad
import { Platform } from 'react-native';

const isTablet = Platform.isPad || Platform.isTV;
```

---

## Organização de Imports

### 1. Ordem de Imports

```typescript
// 1. React & React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// 2. Bibliotecas externas
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
// ✅ BOM: Named exports (preferido)
export const Button = () => { ... };
export const Card = () => { ... };

// Uso
import { Button, Card } from '@/components/ui';

// ✅ ACEITÁVEL: Default export para screens/pages
// app/(tabs)/index.tsx
export default function HomeScreen() { ... }

// ❌ EVITAR: Mix dos dois
export const Button = () => { ... };
export default Button; // Confuso
```

### 3. Imports de Tipo

```typescript
// ✅ BOM: Imports de tipo explícitos
import type { User } from '@/types/User.types';
import type { FC } from 'react';

// ✅ BOM: Import com tipos
import { type User, fetchUser } from '@/services/user.service';

// Configuração TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

---

## Padrões de Tratamento de Erro

### 1. Try-Catch

```typescript
// ✅ BOM: Try-catch com tipagem de erro
const fetchData = async () => {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
    } else {
      console.error('Erro desconhecido:', error);
    }
    throw error;
  }
};

// ✅ BOM: Tipos de erro customizados
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
        'Falha ao buscar dados',
        response.status,
        'FETCH_ERROR'
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      // Tratar erro da API
      console.error(`Erro da API ${error.statusCode}: ${error.message}`);
    } else {
      // Tratar outros erros
      console.error('Erro inesperado:', error);
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
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    // Log para serviço de relatório de erros
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
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Button title="Tentar Novamente" onPress={this.handleReset} />
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

## Padrões de Performance

### 1. Memoização

```typescript
// ✅ BOM: React.memo para componentes
export const ExpensiveComponent = React.memo(
  ({ data }: Props) => {
    return <View>{/* Renderização cara */}</View>;
  },
  (prevProps, nextProps) => {
    // Comparação customizada
    return prevProps.data.id === nextProps.data.id;
  }
);

// ✅ BOM: useMemo para cálculos caros
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// ✅ BOM: useCallback para funções
const handlePress = useCallback(() => {
  console.log('Pressionado');
}, []);
```

### 2. Otimização de FlatList

```typescript
// ✅ BOM: FlatList otimizada
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
  // Otimização
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## Convenções de Nomenclatura

### 1. Variáveis

```typescript
// ✅ BOM: camelCase
const userName = 'João';
const isLoading = false;
const totalCount = 100;

// ❌ RUIM
const user_name = 'João';
const UserName = 'João';
```

### 2. Constantes

```typescript
// ✅ BOM: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
```

### 3. Componentes

```typescript
// ✅ BOM: PascalCase
export const UserProfile = () => { ... };
export const ArticleCard = () => { ... };

// ❌ RUIM
export const userProfile = () => { ... };
export const article_card = () => { ... };
```

### 4. Arquivos

```typescript
// ✅ BOM: PascalCase para componentes
Button.tsx
UserProfile.tsx
ArticleCard.tsx

// ✅ BOM: camelCase para utils/services
formatDate.ts
apiClient.ts
userService.ts

// ✅ BOM: kebab-case também aceitável
format-date.ts
api-client.ts
user-service.ts
```

---

## Comentários & Documentação

### 1. JSDoc

```typescript
/**
 * Busca dados do usuário da API
 * @param userId - O ID do usuário a buscar
 * @returns Promise resolvendo para objeto User
 * @throws {ApiError} Quando a requisição API falha
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export const fetchUser = async (userId: string): Promise<User> => {
  // Implementação
};

/**
 * Componente de botão com múltiplas variantes
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" onPress={() => console.log('Pressionado')}>
 *   Clique em mim
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, onPress, children }) => {
  // Implementação
};
```

### 2. Comentários Inline

```typescript
// ✅ BOM: Explica o "porquê"
// Workaround para bug de sombra do Android na API < 28
if (Platform.OS === 'android' && Platform.Version < 28) {
  // Usar elevation em vez de sombra
}

// ❌ RUIM: Explica o "o quê" (já é óbvio)
// Definir count para 0
setCount(0);
```

---

## Checklist de Padrões de Codificação

- [ ] Modo strict do TypeScript ativado
- [ ] Todas as props tipadas
- [ ] Todos os retornos de função tipados
- [ ] Não usa `any`
- [ ] Componentes funcionais usados
- [ ] Hooks no top level
- [ ] Arrays de dependências corretos
- [ ] StyleSheet.create usado
- [ ] Tema integrado
- [ ] Imports organizados
- [ ] Named exports (exceto screens)
- [ ] Tratamento de erro em vigor
- [ ] Memoização se necessário
- [ ] JSDoc para APIs públicas
- [ ] Convenções de nomenclatura respeitadas

---

**Código de qualidade é tipado, estruturado e documentado.**
