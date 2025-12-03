# Principes KISS, DRY et YAGNI en React

## KISS - Keep It Simple, Stupid

### Principe

**La simplicité doit être un objectif clé de la conception. La complexité doit être évitée.**

Le code simple est :
- Plus facile à comprendre
- Plus facile à maintenir
- Moins sujet aux bugs
- Plus facile à tester

### Application en React

#### ❌ Complexité Inutile

```typescript
// Sur-ingénierie avec abstraction inutile
interface DataFetcherConfig<T> {
  url: string;
  transform?: (data: unknown) => T;
  cache?: boolean;
  retry?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

class DataFetcher<T> {
  private cache: Map<string, T> = new Map();

  constructor(private config: DataFetcherConfig<T>) {}

  async fetch(): Promise<T> {
    if (this.config.cache && this.cache.has(this.config.url)) {
      return this.cache.get(this.config.url)!;
    }

    let attempts = 0;
    const maxAttempts = this.config.retry ?? 1;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(this.config.url);
        const data = await response.json();
        const transformed = this.config.transform
          ? this.config.transform(data)
          : (data as T);

        if (this.config.cache) {
          this.cache.set(this.config.url, transformed);
        }

        this.config.onSuccess?.(transformed);
        return transformed;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          this.config.onError?.(error as Error);
          throw error;
        }
      }
    }

    throw new Error('Failed to fetch data');
  }
}

export const useComplexFetch = <T,>(config: DataFetcherConfig<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetcher = new DataFetcher(config);
    setIsLoading(true);

    fetcher
      .fetch()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [config]);

  return { data, error, isLoading };
};
```

#### ✅ Simplicité et Clarté

```typescript
// Simple et direct avec React Query
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });
};

// Usage
const UserList: FC = () => {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

#### ❌ Abstraction Prématurée

```typescript
// Trop d'abstraction pour un composant simple
interface BaseComponentProps {
  children: ReactNode;
  className?: string;
}

interface WithTheme {
  theme: 'light' | 'dark';
}

interface WithSize {
  size: 'sm' | 'md' | 'lg';
}

const withTheme = <P extends object>(
  Component: FC<P>
): FC<P & WithTheme> => {
  return (props) => {
    const { theme, ...rest } = props;
    return (
      <div className={`theme-${theme}`}>
        <Component {...(rest as P)} />
      </div>
    );
  };
};

const withSize = <P extends object>(Component: FC<P>): FC<P & WithSize> => {
  return (props) => {
    const { size, ...rest } = props;
    return (
      <div className={`size-${size}`}>
        <Component {...(rest as P)} />
      </div>
    );
  };
};

const BaseCard: FC<BaseComponentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

// Composition complexe pour un simple Card
export const Card = withTheme(withSize(BaseCard));
```

#### ✅ Approche Simple

```typescript
// Simple et direct
interface CardProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: FC<CardProps> = ({
  children,
  theme = 'light',
  size = 'md',
  className
}) => {
  return (
    <div className={cn('card', `theme-${theme}`, `size-${size}`, className)}>
      {children}
    </div>
  );
};
```

### Quand la Complexité est Justifiée

```typescript
// ✅ Complexité justifiée : Système de formulaire réutilisable
// Ici, la complexité apporte une vraie valeur (validation, gestion d'état, etc.)
export const useForm = <T extends FieldValues>(
  schema: ZodSchema<T>,
  defaultValues: T
) => {
  return useReactHookForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });
};

// ✅ Complexité justifiée : Virtualisation pour grandes listes
export const VirtualList = <T,>({
  items,
  renderItem,
  itemHeight
}: VirtualListProps<T>) => {
  const { virtualItems, totalHeight } = useVirtual({
    size: items.length,
    estimateSize: () => itemHeight
  });

  return (
    <div style={{ height: totalHeight }}>
      {virtualItems.map((virtualItem) => (
        <div key={virtualItem.index}>
          {renderItem(items[virtualItem.index])}
        </div>
      ))}
    </div>
  );
};
```

## DRY - Don't Repeat Yourself

### Principe

**Chaque connaissance doit avoir une représentation unique, non ambiguë et faisant autorité dans le système.**

Éviter la duplication de code et de logique.

### Application en React

#### ❌ Répétition de Code

```typescript
// Même logique répétée dans plusieurs composants
export const UserProfile: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/user')
      .then((res) => res.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <div>{user?.name}</div>;
};

export const ProductList: FC = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then(setProducts)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {products?.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
};
```

#### ✅ Extraction en Hook Réutilisable

```typescript
// Logique centralisée dans un hook
export const useFetch = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, isLoading, error };
};

// Ou mieux : utiliser React Query
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/user').then((res) => res.json())
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then((res) => res.json())
  });
};

// Composants simplifiés
export const UserProfile: FC = () => {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <div>{user?.name}</div>;
};

export const ProductList: FC = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {products?.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
};
```

#### ❌ UI Répétitive

```typescript
// Même structure de formulaire répétée
export const LoginForm: FC = () => {
  return (
    <form>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export const RegisterForm: FC = () => {
  return (
    <form>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      <button type="submit">Register</button>
    </form>
  );
};
```

#### ✅ Composant Réutilisable

```typescript
// Composant FormField réutilisable
interface FormFieldProps {
  label: string;
  type?: string;
  error?: string;
  register: UseFormRegister<any>;
  name: string;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  type = 'text',
  error,
  register,
  name
}) => {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} {...register(name)} />
      {error && <span className="error">{error}</span>}
    </div>
  );
};

// Formulaires simplifiés
export const LoginForm: FC = () => {
  const { register, formState: { errors } } = useForm<LoginInput>();

  return (
    <form>
      <FormField
        name="email"
        label="Email"
        type="email"
        register={register}
        error={errors.email?.message}
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        register={register}
        error={errors.password?.message}
      />
      <Button type="submit">Login</Button>
    </form>
  );
};

export const RegisterForm: FC = () => {
  const { register, formState: { errors } } = useForm<RegisterInput>();

  return (
    <form>
      <FormField
        name="name"
        label="Name"
        register={register}
        error={errors.name?.message}
      />
      <FormField
        name="email"
        label="Email"
        type="email"
        register={register}
        error={errors.email?.message}
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        register={register}
        error={errors.password?.message}
      />
      <Button type="submit">Register</Button>
    </form>
  );
};
```

#### ❌ Logique Métier Dupliquée

```typescript
// Validation dupliquée
export const LoginForm: FC = () => {
  const validate = (email: string, password: string) => {
    const errors: Record<string, string> = {};

    if (!email) errors.email = 'Email required';
    if (!email.includes('@')) errors.email = 'Invalid email';
    if (!password) errors.password = 'Password required';
    if (password.length < 8) errors.password = 'Password too short';

    return errors;
  };

  // ...
};

export const RegisterForm: FC = () => {
  const validate = (data: RegisterInput) => {
    const errors: Record<string, string> = {};

    if (!data.email) errors.email = 'Email required';
    if (!data.email.includes('@')) errors.email = 'Invalid email';
    if (!data.password) errors.password = 'Password required';
    if (data.password.length < 8) errors.password = 'Password too short';
    if (!data.name) errors.name = 'Name required';

    return errors;
  };

  // ...
};
```

#### ✅ Validation Centralisée

```typescript
// Schémas de validation réutilisables avec Zod
export const emailSchema = z
  .string()
  .min(1, 'Email required')
  .email('Invalid email');

export const passwordSchema = z
  .string()
  .min(1, 'Password required')
  .min(8, 'Password must be at least 8 characters');

export const nameSchema = z.string().min(1, 'Name required');

// Schémas composés
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

// Usage dans les formulaires
export const LoginForm: FC = () => {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  // La validation est automatique
};

export const RegisterForm: FC = () => {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  });

  // La validation est automatique
};
```

### Quand la Répétition est Acceptable

```typescript
// ✅ Répétition acceptable : Logiques différentes qui se ressemblent
export const AdminButton: FC = () => {
  const { user } = useAuth();

  // Logique spécifique admin
  if (user?.role !== 'admin') return null;

  return <Button>Admin Action</Button>;
};

export const ModeratorButton: FC = () => {
  const { user } = useAuth();

  // Logique spécifique moderator (peut évoluer différemment)
  if (user?.role !== 'moderator') return null;

  return <Button>Moderator Action</Button>;
};

// ❌ Sur-abstraction inutile
export const RoleButton: FC<{ role: UserRole }> = ({ role }) => {
  const { user } = useAuth();

  if (user?.role !== role) return null;

  return <Button>{role} Action</Button>;
};
```

## YAGNI - You Aren't Gonna Need It

### Principe

**N'ajoutez pas de fonctionnalités tant que vous n'en avez pas réellement besoin.**

Ne pas anticiper les besoins futurs hypothétiques.

### Application en React

#### ❌ Sur-Ingénierie Anticipée

```typescript
// Système complexe "au cas où on en aurait besoin"
interface DataSource<T> {
  fetch(): Promise<T>;
  cache(): void;
  invalidate(): void;
  subscribe(callback: (data: T) => void): void;
  unsubscribe(callback: (data: T) => void): void;
}

interface CacheStrategy {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  clear(): void;
}

class MemoryCacheStrategy implements CacheStrategy {
  private cache = new Map<string, unknown>();

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: unknown) {
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

class LocalStorageCacheStrategy implements CacheStrategy {
  get(key: string) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  clear() {
    localStorage.clear();
  }
}

// ... 200 lignes de code pour un système qui n'est jamais utilisé
```

#### ✅ Approche Pragmatique

```typescript
// Commencer simple avec ce dont on a besoin MAINTENANT
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json())
  });
};

// Quand le besoin de cache apparaît, ALORS ajouter :
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
    staleTime: 5 * 60 * 1000 // Ajouté quand nécessaire
  });
};
```

#### ❌ Props "Au Cas Où"

```typescript
// Trop de props "au cas où on en aurait besoin"
interface ButtonProps {
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRightClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'square' | 'rounded' | 'circle';
  animation?: 'none' | 'pulse' | 'bounce' | 'shake';
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  badge?: string;
  badgeColor?: string;
  // ... 30 autres props jamais utilisées
}
```

#### ✅ Props Essentielles

```typescript
// Uniquement ce qui est réellement utilisé
interface ButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
}

// Ajouter d'autres props QUAND le besoin apparaît
```

#### ❌ Architecture Prématurée

```typescript
// Micro-frontend architecture pour une petite app
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js',
        app3: 'app3@http://localhost:3003/remoteEntry.js'
      }
      // Configuration complexe pour 3 composants
    })
  ]
};

// Alors qu'on pourrait juste faire :
// src/
//   components/
//     App1.tsx
//     App2.tsx
//     App3.tsx
```

#### ✅ Architecture Adaptée

```typescript
// Structure simple qui répond au besoin actuel
src/
  features/
    auth/
    users/
    dashboard/
  components/
  hooks/

// Quand l'app grandit et que le BESOIN RÉEL apparaît,
// ALORS on peut envisager de découper en modules
```

### Exemples Concrets YAGNI

#### ❌ Configuration Excessive

```typescript
// Config file avec 100 options "au cas où"
export const config = {
  api: {
    baseUrl: process.env.API_URL,
    timeout: process.env.API_TIMEOUT || 30000,
    retries: process.env.API_RETRIES || 3,
    retryDelay: process.env.API_RETRY_DELAY || 1000,
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': process.env.CUSTOM_HEADER
    },
    interceptors: {
      request: [],
      response: []
    },
    cache: {
      enabled: process.env.CACHE_ENABLED === 'true',
      ttl: process.env.CACHE_TTL || 3600,
      storage: process.env.CACHE_STORAGE || 'memory'
    },
    // ... 50 autres options jamais utilisées
  },
  features: {
    // 30 feature flags qui ne sont jamais lus
  }
};
```

#### ✅ Configuration Minimale

```typescript
// Uniquement ce qui est utilisé
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
};

// Ajouter d'autres options quand le besoin apparaît
```

#### ❌ Abstraction Générique

```typescript
// Système générique pour gérer "tous les cas possibles"
interface GenericRepository<T, CreateDTO, UpdateDTO> {
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  findById(id: string | number): Promise<T>;
  create(data: CreateDTO): Promise<T>;
  update(id: string | number, data: UpdateDTO): Promise<T>;
  delete(id: string | number): Promise<void>;
  bulkCreate(data: CreateDTO[]): Promise<T[]>;
  bulkUpdate(updates: Array<{ id: string | number; data: UpdateDTO }>): Promise<T[]>;
  bulkDelete(ids: Array<string | number>): Promise<void>;
  search(query: string, fields?: string[]): Promise<T[]>;
  paginate(page: number, limit: number): Promise<PaginatedResult<T>>;
  count(filters?: Record<string, unknown>): Promise<number>;
  // ... alors qu'on utilise uniquement findAll et create
}
```

#### ✅ Interface Pragmatique

```typescript
// Interface simple qui répond au besoin actuel
interface UserService {
  getAll(): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
}

// Ajouter d'autres méthodes QUAND nécessaire
```

## Équilibre entre les Principes

### Trouver le Juste Milieu

```typescript
// ❌ Trop DRY : Abstraction forcée
const useGenericCRUD = <T,>(endpoint: string) => {
  // Logique complexe pour être "DRY"
  // mais difficile à comprendre et à maintenir
};

// ❌ Pas assez DRY : Duplication excessive
const useUsers = () => {
  /* 50 lignes */
};
const useProducts = () => {
  /* 50 lignes identiques */
};
const useOrders = () => {
  /* 50 lignes identiques */
};

// ✅ Équilibre : Réutilisation raisonnable
// React Query gère la logique commune
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll()
  });
};

// Si vraiment nécessaire, créer un helper simple
const createEntityHook = <T,>(
  key: string,
  fetcher: () => Promise<T[]>
) => {
  return () =>
    useQuery({
      queryKey: [key],
      queryFn: fetcher
    });
};

export const useUsers = createEntityHook('users', userService.getAll);
export const useProducts = createEntityHook('products', productService.getAll);
```

### Règle des Trois

**Principe** : Dupliquer une fois (deux instances), refactoriser à la troisième.

```typescript
// 1ère instance
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ...
};

// 2ème instance - Duplication acceptable
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // ...
};

// 3ème instance - MAINTENANT on refactorise
const ResetPasswordForm = () => {
  // Temps de créer un hook réutilisable
};

// Création du hook après 3 instances similaires
const useFormField = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  return { value, onChange: handleChange };
};
```

## Checklist des Principes

### Avant d'écrire du code

- [ ] **KISS** : Cette solution est-elle la plus simple possible ?
- [ ] **YAGNI** : Ai-je réellement besoin de cette fonctionnalité maintenant ?
- [ ] **DRY** : Cette logique existe-t-elle déjà ailleurs ?

### Pendant le développement

- [ ] **KISS** : Puis-je simplifier ce code ?
- [ ] **YAGNI** : Ces props/options seront-elles utilisées ?
- [ ] **DRY** : Ai-je copié-collé du code plus de 2 fois ?

### Lors de la review

- [ ] **KISS** : Le code est-il facile à comprendre ?
- [ ] **YAGNI** : Y a-t-il du code mort ou inutilisé ?
- [ ] **DRY** : Y a-t-il des opportunités de réutilisation ?

## Conclusion

Les principes KISS, DRY et YAGNI sont complémentaires :

1. ✅ **KISS** : Privilégier la simplicité
2. ✅ **DRY** : Éviter la duplication intelligemment
3. ✅ **YAGNI** : N'ajouter que ce qui est nécessaire

**Règles d'or** :
- Commencer simple
- Refactoriser quand le besoin apparaît
- Ne pas anticiper des besoins hypothétiques
- La duplication est parfois préférable à la mauvaise abstraction

**Devise** : "Make it work, make it right, make it fast" - Kent Beck
