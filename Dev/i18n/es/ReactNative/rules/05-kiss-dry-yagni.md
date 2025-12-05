# Principios KISS, DRY, YAGNI

## Introducción

Estos tres principios fundamentales guían hacia un código simple, mantenible y pragmático en React Native.

---

## KISS - Keep It Simple, Stupid

### Principio

> "La simplicidad debe ser un objetivo clave en el diseño, y cualquier complejidad innecesaria debe evitarse"

El código más simple es a menudo el mejor código.

### Aplicación en React Native

#### ❌ MALO: Sobre-ingeniería

```typescript
// Solución sobre-ingenierizada con patrones innecesarios
class AbstractButtonFactory {
  abstract createButton(): IButton;
}

class PrimaryButtonFactory extends AbstractButtonFactory {
  createButton(): IButton {
    return new ConcreteButtonImplementation('primary');
  }
}

class ButtonBuilder {
  private button: Partial<ButtonConfig> = {};

  setVariant(variant: string): this {
    this.button.variant = variant;
    return this;
  }

  setText(text: string): this {
    this.button.text = text;
    return this;
  }

  build(): ButtonConfig {
    return this.button as ButtonConfig;
  }
}

// Uso complejo para algo simple
const factory = new PrimaryButtonFactory();
const button = factory.createButton();
const config = new ButtonBuilder()
  .setVariant('primary')
  .setText('Click me')
  .build();
```

#### ✅ BUENO: Solución simple

```typescript
// Simple y directo
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  onPress,
  children,
}) => (
  <Pressable
    style={[styles.button, styles[variant]]}
    onPress={onPress}
  >
    <Text style={styles.text}>{children}</Text>
  </Pressable>
);

// Uso simple
<Button variant="primary" onPress={handlePress}>
  Click me
</Button>
```

### Ejemplos KISS

#### 1. State Management Simple

```typescript
// ❌ COMPLEJO: Redux para state simple
// store/actions/counter.actions.ts
export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';

export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });

// store/reducers/counter.reducer.ts
export const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    default:
      return state;
  }
};

// store/selectors/counter.selectors.ts
export const selectCounter = (state) => state.counter;

// Component
const Counter = () => {
  const count = useSelector(selectCounter);
  const dispatch = useDispatch();

  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={() => dispatch(increment())}>+</Button>
    </View>
  );
};

// ✅ SIMPLE: useState para state local
const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={() => setCount(count + 1)}>+</Button>
    </View>
  );
};
```

#### 2. Data Fetching Simple

```typescript
// ❌ COMPLEJO: Action creators, reducers, sagas
// actions/users.actions.ts
export const FETCH_USERS_REQUEST = 'FETCH_USERS_REQUEST';
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS';
export const FETCH_USERS_FAILURE = 'FETCH_USERS_FAILURE';

// sagas/users.saga.ts
function* fetchUsersSaga() {
  try {
    yield put({ type: FETCH_USERS_REQUEST });
    const users = yield call(api.getUsers);
    yield put({ type: FETCH_USERS_SUCCESS, payload: users });
  } catch (error) {
    yield put({ type: FETCH_USERS_FAILURE, error });
  }
}

// ✅ SIMPLE: React Query
const UsersList = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} />}
    />
  );
};
```

#### 3. Renderizado Condicional Simple

```typescript
// ❌ COMPLEJO: State machine para UI simple
type UIState = 'idle' | 'loading' | 'success' | 'error';

const [uiState, setUIState] = useState<UIState>('idle');

const renderContent = () => {
  switch (uiState) {
    case 'idle':
      return <InitialView />;
    case 'loading':
      return <LoadingView />;
    case 'success':
      return <SuccessView />;
    case 'error':
      return <ErrorView />;
    default:
      return null;
  }
};

// ✅ SIMPLE: Condiciones directas
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataView data={data} />;
```

### Reglas KISS

1. **Preferir las soluciones nativas** antes de agregar librerías
2. **Evitar abstracciones prematuras** - esperar a tener 3 casos similares
3. **Cuestionar la complejidad** - "¿Es realmente necesario?"
4. **Código explícito > Código inteligente** - Legibilidad ante todo

```typescript
// ❌ INTELIGENTE pero oscuro
const sum = (a: number[]) => a.reduce((p, c) => p + c, 0);

// ✅ SIMPLE y claro
const sum = (numbers: number[]) => {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
};

// O simplemente
const sum = (numbers: number[]) => numbers.reduce((total, num) => total + num, 0);
```

---

## DRY - Don't Repeat Yourself

### Principio

> "Cada conocimiento debe tener una representación única, no ambigua y autoritativa en un sistema"

Evitar la duplicación de código y lógica.

### Aplicación en React Native

#### ❌ MALO: Código duplicado

```typescript
// LoginScreen.tsx
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 8;
    if (isEmailValid && isPasswordValid) {
      // Submit
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      {emailError && <Text style={styles.error}>{emailError}</Text>}

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {passwordError && <Text style={styles.error}>{passwordError}</Text>}

      <Button onPress={handleSubmit}>Login</Button>
    </View>
  );
}

// RegisterScreen.tsx - DUPLICACIÓN! ❌
export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Misma validación duplicada
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Misma lógica duplicada
  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 8;
    if (isEmailValid && isPasswordValid) {
      // Submit
    }
  };

  // Misma UI duplicada
  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      {emailError && <Text style={styles.error}>{emailError}</Text>}

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {passwordError && <Text style={styles.error}>{passwordError}</Text>}

      <Button onPress={handleSubmit}>Register</Button>
    </View>
  );
}
```

#### ✅ BUENO: Código reutilizado

```typescript
// 1. Validation utils
// utils/validation.utils.ts
export const validators = {
  email: (value: string): string | undefined => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return undefined;
  },
};

// 2. Reusable form hook
// hooks/useForm.ts
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, (value: any) => string | undefined>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Validar al cambiar
    const error = validationSchema[field]?.(value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const error = validationSchema[field as keyof T](values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return { values, errors, handleChange, validate };
};

// 3. Reusable form field component
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  placeholder?: string;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  placeholder,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

// 4. Reusable auth form component
// features/auth/components/AuthForm.tsx
interface AuthFormProps {
  onSubmit: (values: { email: string; password: string }) => void;
  submitLabel: string;
}

export const AuthForm: FC<AuthFormProps> = ({ onSubmit, submitLabel }) => {
  const { values, errors, handleChange, validate } = useForm(
    { email: '', password: '' },
    { email: validators.email, password: validators.password }
  );

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(values);
    }
  };

  return (
    <View style={styles.form}>
      <FormField
        label="Email"
        value={values.email}
        onChangeText={(text) => handleChange('email', text)}
        error={errors.email}
        placeholder="Enter your email"
      />

      <FormField
        label="Password"
        value={values.password}
        onChangeText={(text) => handleChange('password', text)}
        error={errors.password}
        placeholder="Enter your password"
        secureTextEntry
      />

      <Button onPress={handleSubmit}>{submitLabel}</Button>
    </View>
  );
};

// 5. Screens simplificados - ¡Sin duplicación!
// screens/LoginScreen.tsx
export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <AuthForm onSubmit={login} submitLabel="Login" />
    </SafeAreaView>
  );
}

// screens/RegisterScreen.tsx
export default function RegisterScreen() {
  const { register } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <AuthForm onSubmit={register} submitLabel="Register" />
    </SafeAreaView>
  );
}
```

### Ejemplos DRY

#### 1. Estilos reutilizables

```typescript
// ❌ Estilos duplicados
// ScreenA.styles.ts
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

// ScreenB.styles.ts - ¡DUPLICACIÓN! ❌
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

// ✅ Estilos centralizados
// theme/commonStyles.ts
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.light,
    ...theme.shadows.md,
  },
});

// Uso
import { commonStyles } from '@/theme/commonStyles';

const styles = StyleSheet.create({
  // Reutilizar estilos comunes
  container: commonStyles.container,
  // Agregar estilos específicos
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

#### 2. API calls reutilizables

```typescript
// ❌ Duplicación de API calls
// screens/UsersScreen.tsx
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);

// screens/ArticlesScreen.tsx - ¡DUPLICACIÓN! ❌
const [articles, setArticles] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchArticles();
}, []);

// ✅ Hook reutilizable
// hooks/useQuery.ts (o usar React Query)
export const useFetch = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

// Uso
const { data: users, loading } = useFetch<User[]>('/api/users');
const { data: articles, loading } = useFetch<Article[]>('/api/articles');
```

### Regla de los 3

**Solo abstraer después de la 3ª repetición**:

```typescript
// 1ª ocurrencia - OK, dejar tal cual
const UserCard = ({ user }) => (
  <View style={styles.card}>
    <Text>{user.name}</Text>
  </View>
);

// 2ª ocurrencia - Similar pero esperar
const ArticleCard = ({ article }) => (
  <View style={styles.card}>
    <Text>{article.title}</Text>
  </View>
);

// 3ª ocurrencia - Patrón claro, abstraer ahora ✅
interface CardProps {
  title: string;
  children?: React.ReactNode;
}

const Card: FC<CardProps> = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {children}
  </View>
);

// Refactor
const UserCard = ({ user }) => <Card title={user.name} />;
const ArticleCard = ({ article }) => <Card title={article.title} />;
const ProductCard = ({ product }) => <Card title={product.name} />;
```

---

## YAGNI - You Aren't Gonna Need It

### Principio

> "No implementes algo hasta que realmente lo necesites"

No anticipes necesidades futuras, codifica para hoy.

### Aplicación en React Native

#### ❌ MALO: Sobre-ingeniería para el futuro

```typescript
// Sistema ultra-flexible "para el futuro"
interface IDataProvider<T> {
  getData(): Promise<T>;
  setData(data: T): Promise<void>;
  subscribe(callback: (data: T) => void): () => void;
}

class LocalStorageProvider<T> implements IDataProvider<T> { ... }
class RemoteStorageProvider<T> implements IDataProvider<T> { ... }
class CachedStorageProvider<T> implements IDataProvider<T> { ... }

// Factory pattern "por si acaso"
class DataProviderFactory {
  static create<T>(type: 'local' | 'remote' | 'cached'): IDataProvider<T> {
    // Lógica compleja de factory
  }
}

// Sistema de configuración "para flexibilidad"
interface DataConfig {
  provider: 'local' | 'remote' | 'cached';
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  sync: {
    enabled: boolean;
    interval: number;
    strategy: 'merge' | 'replace' | 'custom';
  };
  // ... 50 opciones más "por si acaso"
}

// Necesidad real actual: Solo almacenar un email
const provider = DataProviderFactory.create<string>('local');
await provider.setData('user@example.com');
```

#### ✅ BUENO: Solución para necesidad actual

```typescript
// Necesidad actual: Almacenar un email
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Simple y suficiente por ahora
storage.set('email', 'user@example.com');
const email = storage.getString('email');

// Si surge necesidad compleja más tarde, refactorizar ENTONCES
```

### Ejemplos YAGNI

#### 1. Paginación "por si acaso"

```typescript
// ❌ YAGNI: Paginación compleja para 10 items
interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  strategy: 'offset' | 'cursor';
}

const [pagination, setPagination] = useState<PaginationConfig>({
  page: 1,
  limit: 20,
  total: 10, // ¡Solo 10 items!
  hasMore: false,
  strategy: 'offset',
});

// ✅ BUENO: Simple por ahora
const [users] = useState(mockUsers); // 10 usuarios

<FlatList data={users} renderItem={...} />

// Agregar paginación CUANDO sea necesario (>100 items por ejemplo)
```

#### 2. Internacionalización "para el futuro"

```typescript
// ❌ YAGNI: i18n complejo para app de un solo idioma
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en.json') },
      fr: { translation: require('./locales/fr.json') },
      es: { translation: require('./locales/es.json') },
      // ... 10 idiomas "por si acaso"
    },
    lng: Localization.locale,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Uso complejo en todas partes
const { t } = useTranslation();
<Text>{t('common.welcome')}</Text>

// ✅ BUENO: Textos directos si solo un idioma por ahora
<Text>Welcome</Text>

// Agregar i18n CUANDO el multi-idioma se vuelva requerido
```

#### 3. Sistema de theme "ultra-flexible"

```typescript
// ❌ YAGNI: Sistema de theme complejo para 2 colores
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    // ... 50 colores "por si acaso"
  };
  spacing: Record<string, number>;
  typography: {
    // ... configuración compleja
  };
  shadows: Record<string, any>;
  animations: {
    // ... animaciones "para el futuro"
  };
  breakpoints: {
    // ... responsive "por si acaso"
  };
}

// Context provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  // ... lógica compleja
};

// ✅ BUENO: Constantes simples por ahora
export const colors = {
  primary: '#007AFF',
  white: '#FFFFFF',
  text: '#000000',
};

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
};

// Uso directo
<View style={{ padding: spacing.md, backgroundColor: colors.primary }}>

// Agregar sistema de theme CUANDO dark mode o temas múltiples sean requeridos
```

#### 4. Abstracción de configuración

```typescript
// ❌ YAGNI: Gestión de env compleja para 2 variables
class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: Map<string, any>;

  static getInstance(): EnvironmentManager {
    if (!this.instance) {
      this.instance = new EnvironmentManager();
    }
    return this.instance;
  }

  get<T>(key: string, defaultValue?: T): T {
    // Lógica compleja
  }

  set(key: string, value: any): void {
    // Lógica compleja
  }

  validate(): boolean {
    // Validación compleja
  }
}

// Uso
const apiUrl = EnvironmentManager.getInstance().get('API_URL');

// ✅ BUENO: Archivo de constantes simple
// config/env.ts
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  DEBUG: __DEV__,
};

// Uso
import { ENV } from '@/config/env';
const apiUrl = ENV.API_URL;

// Evolucionar CUANDO la configuración se vuelva compleja
```

### Cuándo YAGNI no se aplica

**OK anticipar**:
- Seguridad (encriptación, autenticación)
- Performance crítico (FlatList vs ScrollView)
- Restricciones de plataforma (diferencias iOS/Android)
- Arquitectura base (estructura de carpetas)

**NO OK anticipar**:
- Features "nice to have"
- Optimizaciones prematuras
- Abstracciones "por si acaso"
- Configuración "para flexibilidad"

```typescript
// ✅ OK: Anticipación de seguridad
// Usar SecureStore desde el principio para tokens
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', accessToken);

// ❌ NO OK: Anticipación de feature
// Agregar share, like, comment cuando la necesidad = solo mostrar
interface ArticleCardProps {
  article: Article;
  onShare?: () => void; // YAGNI
  onLike?: () => void; // YAGNI
  onComment?: () => void; // YAGNI
  // Solo onPress realmente necesario ahora
}
```

---

## Equilibrio KISS, DRY, YAGNI

Estos principios a veces pueden contradecirse. Aquí cómo equilibrarlos:

### KISS vs DRY

```typescript
// Situación: 2 componentes similares pero no idénticos

// Opción 1: KISS - Duplicar (simple pero no DRY)
const UserCard = ({ user }) => (
  <View style={styles.card}>
    <Image source={{ uri: user.avatar }} />
    <Text>{user.name}</Text>
    <Text>{user.email}</Text>
  </View>
);

const ProductCard = ({ product }) => (
  <View style={styles.card}>
    <Image source={{ uri: product.image }} />
    <Text>{product.name}</Text>
    <Text>{product.price}</Text>
  </View>
);

// Opción 2: DRY - Abstraer (DRY pero más complejo)
interface CardProps<T> {
  item: T;
  getImage: (item: T) => string;
  getTitle: (item: T) => string;
  getSubtitle: (item: T) => string;
}

const Card = <T,>({ item, getImage, getTitle, getSubtitle }: CardProps<T>) => (
  <View style={styles.card}>
    <Image source={{ uri: getImage(item) }} />
    <Text>{getTitle(item)}</Text>
    <Text>{getSubtitle(item)}</Text>
  </View>
);

// EQUILIBRIO: Si solo 2 casos y diferencias mínimas, KISS gana
// Si 5+ casos, DRY se justifica
```

### DRY vs YAGNI

```typescript
// Situación: ¿Crear abstracción ahora o esperar?

// YAGNI dice: Esperar 3ª ocurrencia
// DRY dice: Abstraer desde 2ª ocurrencia

// EQUILIBRIO: Regla de los 3
// 1ª ocurrencia: Código inline
// 2ª ocurrencia: Notar el patrón pero no abstraer
// 3ª ocurrencia: Abstraer ahora
```

### KISS vs Future-proofing

```typescript
// Situación: Arquitectura simple vs flexible

// KISS dice: Hacer simple ahora
const API_URL = 'https://api.example.com';

// Future-proofing dice: Preparar para el futuro
const config = {
  api: {
    baseUrl: process.env.API_URL,
    timeout: 10000,
    retries: 3,
  },
};

// EQUILIBRIO: Compromiso pragmático
const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  // Agregar otras configs CUANDO sea necesario
};
```

---

## Checklist

### KISS
- [ ] Solución más simple elegida
- [ ] Sin abstracciones prematuras
- [ ] Código legible por un junior
- [ ] Sin patrones complejos sin razón

### DRY
- [ ] Sin código duplicado 3+ veces
- [ ] Lógica de negocio centralizada
- [ ] Estilos comunes reutilizados
- [ ] Utils para funciones repetidas

### YAGNI
- [ ] Solo features actualmente necesarias
- [ ] Sin código "por si acaso"
- [ ] Sin configuración no utilizada
- [ ] Evolución posible pero no anticipada

---

**Simplicidad, reutilización pragmática, y enfoque en el presente: las claves de un código mantenible.**
