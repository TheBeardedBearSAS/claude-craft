# Princípios KISS, DRY, YAGNI

## Introdução

Estes três princípios fundamentais guiam para um código simples, manutenível e pragmático em React Native.

---

## KISS - Keep It Simple, Stupid

### Princípio

> "A simplicidade deve ser um objetivo-chave no design, e toda complexidade desnecessária deve ser evitada"

O código mais simples é frequentemente o melhor código.

### Aplicação em React Native

#### ❌ RUIM: Over-engineering

```typescript
// Solução over-engineered com patterns desnecessários
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

// Uso complexo para algo simples
const factory = new PrimaryButtonFactory();
const button = factory.createButton();
const config = new ButtonBuilder()
  .setVariant('primary')
  .setText('Click me')
  .build();
```

#### ✅ BOM: Solução simples

```typescript
// Simples e direto
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

// Uso simples
<Button variant="primary" onPress={handlePress}>
  Click me
</Button>
```

### Exemplos KISS

#### 1. State Management Simples

```typescript
// ❌ COMPLEXO: Redux para state simples
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

// Componente
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

// ✅ SIMPLES: useState para state local
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

#### 2. Data Fetching Simples

```typescript
// ❌ COMPLEXO: Action creators, reducers, sagas
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

// ✅ SIMPLES: React Query
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

#### 3. Renderização Condicional Simples

```typescript
// ❌ COMPLEXO: State machine para UI simples
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

// ✅ SIMPLES: Condições diretas
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataView data={data} />;
```

### Regras KISS

1. **Preferir soluções nativas** antes de adicionar bibliotecas
2. **Evitar abstrações prematuras** - esperar 3 casos similares
3. **Questionar a complexidade** - "Isso é realmente necessário?"
4. **Código explícito > Código clever** - Legibilidade acima de tudo

```typescript
// ❌ CLEVER mas obscuro
const sum = (a: number[]) => a.reduce((p, c) => p + c, 0);

// ✅ SIMPLES e claro
const sum = (numbers: number[]) => {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
};

// Ou simplesmente
const sum = (numbers: number[]) => numbers.reduce((total, num) => total + num, 0);
```

---

## DRY - Don't Repeat Yourself

### Princípio

> "Cada conhecimento deve ter uma representação única, não ambígua e autoritativa em um sistema"

Evitar duplicação de código e lógica.

### Aplicação em React Native

#### ❌ RUIM: Código duplicado

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

// RegisterScreen.tsx - DUPLICAÇÃO! ❌
export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Mesma validação duplicada
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

  // Mesma lógica duplicada
  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 8;
    if (isEmailValid && isPasswordValid) {
      // Submit
    }
  };

  // Mesma UI duplicada
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

#### ✅ BOM: Código reutilizado

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

// 2. Hook de formulário reutilizável
// hooks/useForm.ts
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, (value: any) => string | undefined>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Validar ao alterar
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

// 3. Componente de campo de formulário reutilizável
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

// 4. Componente de formulário de autenticação reutilizável
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

// 5. Screens simplificados - Sem mais duplicação!
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

### Exemplos DRY

#### 1. Estilos reutilizáveis

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

// ScreenB.styles.ts - DUPLICAÇÃO! ❌
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
  // Reutilizar estilos comuns
  container: commonStyles.container,
  // Adicionar estilos específicos
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

#### 2. Chamadas de API reutilizáveis

```typescript
// ❌ Duplicação de chamadas API
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

// screens/ArticlesScreen.tsx - DUPLICAÇÃO! ❌
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

// ✅ Hook reutilizável
// hooks/useQuery.ts (ou usar React Query)
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

### Regra dos 3

**Abstrair apenas após a 3ª repetição**:

```typescript
// 1ª ocorrência - OK, deixar como está
const UserCard = ({ user }) => (
  <View style={styles.card}>
    <Text>{user.name}</Text>
  </View>
);

// 2ª ocorrência - Similar mas esperar
const ArticleCard = ({ article }) => (
  <View style={styles.card}>
    <Text>{article.title}</Text>
  </View>
);

// 3ª ocorrência - Padrão claro, abstrair agora ✅
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

// Refatorar
const UserCard = ({ user }) => <Card title={user.name} />;
const ArticleCard = ({ article }) => <Card title={article.title} />;
const ProductCard = ({ product }) => <Card title={product.name} />;
```

---

## YAGNI - You Aren't Gonna Need It

### Princípio

> "Não implemente algo até que você realmente precise"

Não antecipe necessidades futuras, codifique para hoje.

### Aplicação em React Native

#### ❌ RUIM: Over-engineering para o futuro

```typescript
// Sistema ultra-flexível "para o futuro"
interface IDataProvider<T> {
  getData(): Promise<T>;
  setData(data: T): Promise<void>;
  subscribe(callback: (data: T) => void): () => void;
}

class LocalStorageProvider<T> implements IDataProvider<T> { ... }
class RemoteStorageProvider<T> implements IDataProvider<T> { ... }
class CachedStorageProvider<T> implements IDataProvider<T> { ... }

// Factory pattern "caso precise"
class DataProviderFactory {
  static create<T>(type: 'local' | 'remote' | 'cached'): IDataProvider<T> {
    // Lógica complexa de factory
  }
}

// Sistema de configuração "para flexibilidade"
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
  // ... 50 outras opções "caso precise"
}

// Necessidade real atual: Apenas armazenar um email
const provider = DataProviderFactory.create<string>('local');
await provider.setData('user@example.com');
```

#### ✅ BOM: Solução para necessidade atual

```typescript
// Necessidade atual: Armazenar um email
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Simples e suficiente por enquanto
storage.set('email', 'user@example.com');
const email = storage.getString('email');

// Se surgir necessidade complexa mais tarde, refatorar ENTÃO
```

### Exemplos YAGNI

#### 1. Paginação "caso precise"

```typescript
// ❌ YAGNI: Paginação complexa para 10 itens
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
  total: 10, // Apenas 10 itens!
  hasMore: false,
  strategy: 'offset',
});

// ✅ BOM: Simples por enquanto
const [users] = useState(mockUsers); // 10 usuários

<FlatList data={users} renderItem={...} />

// Adicionar paginação QUANDO necessário (>100 itens por exemplo)
```

#### 2. Internacionalização "para o futuro"

```typescript
// ❌ YAGNI: i18n complexo para app mono-idioma
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
      // ... 10 idiomas "caso precise"
    },
    lng: Localization.locale,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Uso complexo em todo lugar
const { t } = useTranslation();
<Text>{t('common.welcome')}</Text>

// ✅ BOM: Textos diretos se um único idioma por enquanto
<Text>Welcome</Text>

// Adicionar i18n QUANDO multi-idioma se tornar necessário
```

#### 3. Sistema de tema "ultra-flexível"

```typescript
// ❌ YAGNI: Sistema de tema complexo para 2 cores
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    // ... 50 cores "caso precise"
  };
  spacing: Record<string, number>;
  typography: {
    // ... configuração complexa
  };
  shadows: Record<string, any>;
  animations: {
    // ... animações "para o futuro"
  };
  breakpoints: {
    // ... responsive "caso precise"
  };
}

// Context provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  // ... lógica complexa
};

// ✅ BOM: Constantes simples por enquanto
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

// Uso direto
<View style={{ padding: spacing.md, backgroundColor: colors.primary }}>

// Adicionar sistema de tema QUANDO dark mode ou temas múltiplos forem necessários
```

#### 4. Abstração de configuração

```typescript
// ❌ YAGNI: Gerenciamento de env complexo para 2 variáveis
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
    // Lógica complexa
  }

  set(key: string, value: any): void {
    // Lógica complexa
  }

  validate(): boolean {
    // Validação complexa
  }
}

// Uso
const apiUrl = EnvironmentManager.getInstance().get('API_URL');

// ✅ BOM: Arquivo de constantes simples
// config/env.ts
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  DEBUG: __DEV__,
};

// Uso
import { ENV } from '@/config/env';
const apiUrl = ENV.API_URL;

// Evoluir QUANDO a configuração se tornar complexa
```

### Quando YAGNI não se aplica

**OK antecipar**:
- Segurança (criptografia, autenticação)
- Performance crítica (FlatList vs ScrollView)
- Restrições de plataforma (diferenças iOS/Android)
- Arquitetura base (estrutura de pastas)

**NÃO OK antecipar**:
- Features "nice to have"
- Otimizações prematuras
- Abstrações "caso precise"
- Configuração "para flexibilidade"

```typescript
// ✅ OK: Antecipação de segurança
// Usar SecureStore desde o início para tokens
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', accessToken);

// ❌ NÃO OK: Antecipação de feature
// Adicionar share, like, comment quando a necessidade = apenas exibir
interface ArticleCardProps {
  article: Article;
  onShare?: () => void; // YAGNI
  onLike?: () => void; // YAGNI
  onComment?: () => void; // YAGNI
  // Apenas onPress realmente necessário agora
}
```

---

## Balanceamento KISS, DRY, YAGNI

Estes princípios podem às vezes se contradizer. Aqui está como equilibrá-los:

### KISS vs DRY

```typescript
// Situação: 2 componentes similares mas não idênticos

// Opção 1: KISS - Duplicar (simples mas não DRY)
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

// Opção 2: DRY - Abstrair (DRY mas mais complexo)
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

// EQUILÍBRIO: Se apenas 2 casos e diferenças mínimas, KISS vence
// Se 5+ casos, DRY se torna justificado
```

### DRY vs YAGNI

```typescript
// Situação: Criar abstração agora ou esperar?

// YAGNI diz: Esperar 3ª ocorrência
// DRY diz: Abstrair na 2ª ocorrência

// EQUILÍBRIO: Regra dos 3
// 1ª ocorrência: Código inline
// 2ª ocorrência: Notar o padrão mas não abstrair
// 3ª ocorrência: Abstrair agora
```

### KISS vs Future-proofing

```typescript
// Situação: Arquitetura simples vs flexível

// KISS diz: Fazer simples agora
const API_URL = 'https://api.example.com';

// Future-proofing diz: Preparar para o futuro
const config = {
  api: {
    baseUrl: process.env.API_URL,
    timeout: 10000,
    retries: 3,
  },
};

// EQUILÍBRIO: Compromisso pragmático
const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  // Adicionar outras configs QUANDO necessário
};
```

---

## Checklist

### KISS
- [ ] Solução mais simples escolhida
- [ ] Sem abstrações prematuras
- [ ] Código legível por um júnior
- [ ] Sem padrões complexos sem razão

### DRY
- [ ] Sem código duplicado 3+ vezes
- [ ] Lógica de negócio centralizada
- [ ] Estilos comuns reutilizados
- [ ] Utils para funções repetidas

### YAGNI
- [ ] Apenas features atualmente necessárias
- [ ] Sem código "caso precise"
- [ ] Sem configuração não utilizada
- [ ] Evolução possível mas não antecipada

---

**Simplicidade, reutilização pragmática e foco no presente: as chaves para código manutenível.**
