# Principes KISS, DRY, YAGNI

## Introduction

Ces trois principes fondamentaux guident vers un code simple, maintenable et pragmatique en React Native.

---

## KISS - Keep It Simple, Stupid

### Principe

> "La simplicité devrait être un objectif clé dans la conception, et toute complexité inutile devrait être évitée"

Le code le plus simple est souvent le meilleur code.

### Application en React Native

#### ❌ SCHLECHT: Sur-ingénierie

```typescript
// Over-engineered solution avec patterns inutiles
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

// Usage complexe pour quelque chose de simple
const factory = new PrimaryButtonFactory();
const button = factory.createButton();
const config = new ButtonBuilder()
  .setVariant('primary')
  .setText('Click me')
  .build();
```

#### ✅ GUT: Solution simple

```typescript
// Simple et direct
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

// Usage simple
<Button variant="primary" onPress={handlePress}>
  Click me
</Button>
```

### Exemples KISS

#### 1. State Management Simple

```typescript
// ❌ COMPLEXE: Redux pour state simple
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

// ✅ SIMPLE: useState pour state local
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
// ❌ COMPLEXE: Action creators, reducers, sagas
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

#### 3. Conditional Rendering Simple

```typescript
// ❌ COMPLEXE: State machine pour UI simple
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

// ✅ SIMPLE: Conditions directes
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataView data={data} />;
```

### Règles KISS

1. **Préférer les solutions natives** avant d'ajouter des librairies
2. **Éviter les abstractions prématurées** - attendre d'avoir 3 cas similaires
3. **Questionner la complexité** - "Est-ce vraiment nécessaire?"
4. **Code explicite > Code clever** - Lisibilité avant tout

```typescript
// ❌ CLEVER mais obscur
const sum = (a: number[]) => a.reduce((p, c) => p + c, 0);

// ✅ SIMPLE et clair
const sum = (numbers: number[]) => {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
};

// Ou simplement
const sum = (numbers: number[]) => numbers.reduce((total, num) => total + num, 0);
```

---

## DRY - Don't Repeat Yourself

### Principe

> "Chaque connaissance doit avoir une représentation unique, non ambiguë et autoritaire dans un système"

Éviter la duplication de code et de logique.

### Application en React Native

#### ❌ SCHLECHT: Code dupliqué

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

// RegisterScreen.tsx - DUPLICATION! ❌
export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Même validation dupliquée
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

  // Même logique dupliquée
  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 8;
    if (isEmailValid && isPasswordValid) {
      // Submit
    }
  };

  // Même UI dupliquée
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

#### ✅ GUT: Code réutilisé

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

    // Validate on change
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

// 5. Screens simplifié - Plus de duplication!
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

### Exemples DRY

#### 1. Styles réutilisables

```typescript
// ❌ Styles dupliqués
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

// ScreenB.styles.ts - DUPLICATION! ❌
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

// ✅ Styles centralisés
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

// Usage
import { commonStyles } from '@/theme/commonStyles';

const styles = StyleSheet.create({
  // Réutiliser les styles communs
  container: commonStyles.container,
  // Ajouter des styles spécifiques
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

#### 2. API calls réutilisables

```typescript
// ❌ Duplication API calls
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

// screens/ArticlesScreen.tsx - DUPLICATION! ❌
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

// ✅ Hook réutilisable
// hooks/useQuery.ts (ou utiliser React Query)
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

// Usage
const { data: users, loading } = useFetch<User[]>('/api/users');
const { data: articles, loading } = useFetch<Article[]>('/api/articles');
```

### Règle des 3

**N'abstraire qu'après la 3ème répétition**:

```typescript
// 1ère occurrence - OK, laisser tel quel
const UserCard = ({ user }) => (
  <View style={styles.card}>
    <Text>{user.name}</Text>
  </View>
);

// 2ème occurrence - Similaire mais attendre
const ArticleCard = ({ article }) => (
  <View style={styles.card}>
    <Text>{article.title}</Text>
  </View>
);

// 3ème occurrence - Pattern clair, abstraire maintenant ✅
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

### Principe

> "N'implémentez pas quelque chose tant que vous n'en avez pas réellement besoin"

N'anticipez pas les besoins futurs, codez pour aujourd'hui.

### Application en React Native

#### ❌ SCHLECHT: Over-engineering pour le futur

```typescript
// Système ultra-flexible "pour le futur"
interface IDataProvider<T> {
  getData(): Promise<T>;
  setData(data: T): Promise<void>;
  subscribe(callback: (data: T) => void): () => void;
}

class LocalStorageProvider<T> implements IDataProvider<T> { ... }
class RemoteStorageProvider<T> implements IDataProvider<T> { ... }
class CachedStorageProvider<T> implements IDataProvider<T> { ... }

// Factory pattern "au cas où"
class DataProviderFactory {
  static create<T>(type: 'local' | 'remote' | 'cached'): IDataProvider<T> {
    // Complex factory logic
  }
}

// Configuration system "pour la flexibilité"
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
  // ... 50 autres options "au cas où"
}

// Besoin réel actuel: Juste stocker un email
const provider = DataProviderFactory.create<string>('local');
await provider.setData('user@example.com');
```

#### ✅ GUT: Solution pour besoin actuel

```typescript
// Besoin actuel: Stocker un email
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Simple et suffit pour maintenant
storage.set('email', 'user@example.com');
const email = storage.getString('email');

// Si besoin complexe émerge plus tard, refactorer ALORS
```

### Exemples YAGNI

#### 1. Pagination "au cas où"

```typescript
// ❌ YAGNI: Pagination complexe pour 10 items
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
  total: 10, // Only 10 items!
  hasMore: false,
  strategy: 'offset',
});

// ✅ GUT: Simple pour maintenant
const [users] = useState(mockUsers); // 10 users

<FlatList data={users} renderItem={...} />

// Ajouter pagination QUAND nécessaire (>100 items par exemple)
```

#### 2. Internationalisation "pour le futur"

```typescript
// ❌ YAGNI: i18n complexe pour app single-language
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
      // ... 10 langues "au cas où"
    },
    lng: Localization.locale,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Usage complexe partout
const { t } = useTranslation();
<Text>{t('common.welcome')}</Text>

// ✅ GUT: Textes directs si une seule langue pour maintenant
<Text>Welcome</Text>

// Ajouter i18n QUAND multi-langue devient requis
```

#### 3. Theme system "ultra-flexible"

```typescript
// ❌ YAGNI: Theme system complexe pour 2 couleurs
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    // ... 50 couleurs "au cas où"
  };
  spacing: Record<string, number>;
  typography: {
    // ... configuration complexe
  };
  shadows: Record<string, any>;
  animations: {
    // ... animations "pour le futur"
  };
  breakpoints: {
    // ... responsive "au cas où"
  };
}

// Context provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  // ... logique complexe
};

// ✅ GUT: Constantes simples pour maintenant
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

// Usage direct
<View style={{ padding: spacing.md, backgroundColor: colors.primary }}>

// Ajouter theme system QUAND dark mode ou themes multiples requis
```

#### 4. Configuration abstraction

```typescript
// ❌ YAGNI: Env management complexe pour 2 variables
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
    // Complex logic
  }

  set(key: string, value: any): void {
    // Complex logic
  }

  validate(): boolean {
    // Complex validation
  }
}

// Usage
const apiUrl = EnvironmentManager.getInstance().get('API_URL');

// ✅ GUT: Simple constants file
// config/env.ts
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  DEBUG: __DEV__,
};

// Usage
import { ENV } from '@/config/env';
const apiUrl = ENV.API_URL;

// Évoluer QUAND configuration devient complexe
```

### Quand YAGNI ne s'applique pas

**OK d'anticiper**:
- Sécurité (encryption, authentication)
- Performance critique (FlatList vs ScrollView)
- Contraintes platform (iOS/Android différences)
- Architecture de base (folder structure)

**PAS OK d'anticiper**:
- Features "nice to have"
- Optimisations prématurées
- Abstractions "au cas où"
- Configuration "pour la flexibilité"

```typescript
// ✅ OK: Anticipation security
// Utiliser SecureStore dès le début pour tokens
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', accessToken);

// ❌ PAS OK: Anticipation feature
// Ajouter share, like, comment alors que besoin = juste afficher
interface ArticleCardProps {
  article: Article;
  onShare?: () => void; // YAGNI
  onLike?: () => void; // YAGNI
  onComment?: () => void; // YAGNI
  // Only onPress actually needed now
}
```

---

## Balance KISS, DRY, YAGNI

Ces principes peuvent parfois se contredire. Voici comment les balancer:

### KISS vs DRY

```typescript
// Situation: 2 composants similaires mais pas identiques

// Option 1: KISS - Dupliquer (simple mais pas DRY)
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

// Option 2: DRY - Abstraire (DRY mais plus complexe)
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

// BALANCE: Si seulement 2 cas et différences minimes, KISS gagne
// Si 5+ cas, DRY devient justifié
```

### DRY vs YAGNI

```typescript
// Situation: Créer abstraction maintenant ou attendre?

// YAGNI dit: Attendre 3ème occurrence
// DRY dit: Abstraire dès 2ème occurrence

// BALANCE: Règle des 3
// 1ère occurrence: Code inline
// 2ème occurrence: Noter le pattern mais ne pas abstraire
// 3ème occurrence: Abstraire maintenant
```

### KISS vs Future-proofing

```typescript
// Situation: Architecture simple vs flexible

// KISS dit: Faire simple maintenant
const API_URL = 'https://api.example.com';

// Future-proofing dit: Préparer pour le futur
const config = {
  api: {
    baseUrl: process.env.API_URL,
    timeout: 10000,
    retries: 3,
  },
};

// BALANCE: Compromis pragmatique
const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  // Ajouter d'autres configs QUAND nécessaire
};
```

---

## Checklist

### KISS
- [ ] Solution la plus simple choisie
- [ ] Pas d'abstractions prématurées
- [ ] Code lisible par un junior
- [ ] Pas de patterns complexes sans raison

### DRY
- [ ] Pas de code dupliqué 3+ fois
- [ ] Logique métier centralisée
- [ ] Styles communs réutilisés
- [ ] Utils pour fonctions répétées

### YAGNI
- [ ] Seulement features actuellement nécessaires
- [ ] Pas de code "au cas où"
- [ ] Pas de configuration inutilisée
- [ ] Évolution possible mais pas anticipée

---

**Simplicité, réutilisation pragmatique, et focus sur le présent: les clés d'un code maintenable.**
