# Principios KISS, DRY y YAGNI en React

## KISS - Keep It Simple, Stupid

### Principio

**La simplicidad debe ser un objetivo clave del diseño. La complejidad debe evitarse.**

El código simple es:
- Más fácil de entender
- Más fácil de mantener
- Menos propenso a errores
- Más fácil de probar

### Aplicación en React

#### ❌ Complejidad Innecesaria

```typescript
// Sobre-ingeniería con abstracción innecesaria
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

#### ✅ Simplicidad y Claridad

```typescript
// Simple y directo con React Query
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

// Uso
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

#### ❌ Abstracción Prematura

```typescript
// Demasiada abstracción para un componente simple
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

// Composición compleja para un Card simple
export const Card = withTheme(withSize(BaseCard));
```

#### ✅ Enfoque Simple

```typescript
// Simple y directo
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

## DRY - Don't Repeat Yourself

### Principio

**Cada pieza de conocimiento debe tener una representación única, inequívoca y autorizada dentro de un sistema.**

Evitar la duplicación de código y lógica.

### Aplicación en React

#### ❌ Repetición de Código

```typescript
// Misma lógica repetida en múltiples componentes
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

#### ✅ Extracción en Hook Reutilizable

```typescript
// Lógica centralizada en un hook
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

// O mejor: usar React Query
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

// Componentes simplificados
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

#### ❌ UI Repetitiva

```typescript
// Misma estructura de formulario repetida
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

#### ✅ Componente Reutilizable

```typescript
// Componente FormField reutilizable
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

// Formularios simplificados
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

#### ❌ Lógica de Negocio Duplicada

```typescript
// Validación duplicada
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

#### ✅ Validación Centralizada

```typescript
// Schemas de validación reutilizables con Zod
export const emailSchema = z
  .string()
  .min(1, 'Email required')
  .email('Invalid email');

export const passwordSchema = z
  .string()
  .min(1, 'Password required')
  .min(8, 'Password must be at least 8 characters');

export const nameSchema = z.string().min(1, 'Name required');

// Schemas compuestos
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

// Uso en formularios
export const LoginForm: FC = () => {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  // Validación automática
};

export const RegisterForm: FC = () => {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  });

  // Validación automática
};
```

## YAGNI - You Aren't Gonna Need It

### Principio

**No añadir funcionalidad hasta que realmente se necesite.**

No anticipar necesidades futuras hipotéticas.

### Aplicación en React

#### ❌ Sobre-ingeniería Anticipatoria

```typescript
// Sistema complejo "por si lo necesitamos"
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

// ... 200 líneas de código para un sistema que nunca se usa
```

#### ✅ Enfoque Pragmático

```typescript
// Empezar simple con lo que necesitamos AHORA
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json())
  });
};

// Cuando aparece la necesidad de cache, ENTONCES añadir:
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
    staleTime: 5 * 60 * 1000 // Añadido cuando sea necesario
  });
};
```

#### ❌ Props "Por Si Acaso"

```typescript
// Demasiadas props "por si acaso"
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
  // ... 30 otras props nunca usadas
}
```

#### ✅ Props Esenciales

```typescript
// Solo lo que realmente se usa
interface ButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
}

// Añadir otras props CUANDO aparezca la necesidad
```

## Balance Entre Principios

### Encontrar el Equilibrio Correcto

```typescript
// ❌ Demasiado DRY: Abstracción forzada
const useGenericCRUD = <T,>(endpoint: string) => {
  // Lógica compleja para ser "DRY"
  // pero difícil de entender y mantener
};

// ❌ No suficiente DRY: Duplicación excesiva
const useUsers = () => {
  /* 50 líneas */
};
const useProducts = () => {
  /* 50 líneas idénticas */
};
const useOrders = () => {
  /* 50 líneas idénticas */
};

// ✅ Balance: Reutilización razonable
// React Query maneja la lógica común
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

// Si realmente es necesario, crear un helper simple
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

### Regla de Tres

**Principio**: Duplicar una vez (dos instancias), refactorizar en la tercera.

```typescript
// 1ra instancia
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ...
};

// 2da instancia - Duplicación aceptable
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // ...
};

// 3ra instancia - AHORA refactorizamos
const ResetPasswordForm = () => {
  // Momento de crear un hook reutilizable
};

// Crear hook después de 3 instancias similares
const useFormField = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  return { value, onChange: handleChange };
};
```

## Checklist de Principios

### Antes de Escribir Código

- [ ] **KISS**: ¿Es esta la solución más simple posible?
- [ ] **YAGNI**: ¿Realmente necesito esta funcionalidad ahora?
- [ ] **DRY**: ¿Esta lógica ya existe en otro lugar?

### Durante el Desarrollo

- [ ] **KISS**: ¿Puedo simplificar este código?
- [ ] **YAGNI**: ¿Estas props/opciones serán usadas?
- [ ] **DRY**: ¿He copiado y pegado código más de 2 veces?

### Durante la Revisión

- [ ] **KISS**: ¿El código es fácil de entender?
- [ ] **YAGNI**: ¿Hay código muerto o no utilizado?
- [ ] **DRY**: ¿Hay oportunidades de reutilización?

## Conclusión

Los principios KISS, DRY y YAGNI son complementarios:

1. ✅ **KISS**: Favorecer la simplicidad
2. ✅ **DRY**: Evitar duplicación inteligentemente
3. ✅ **YAGNI**: Solo añadir lo necesario

**Reglas de oro**:
- Empezar simple
- Refactorizar cuando aparezca la necesidad
- No anticipar necesidades hipotéticas
- La duplicación a veces es preferible a una mala abstracción

**Lema**: "Make it work, make it right, make it fast" - Kent Beck
