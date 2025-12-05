# KISS, DRY, and YAGNI Principles in React

## KISS - Keep It Simple, Stupid

### Principle

**Simplicity should be a key design goal. Complexity should be avoided.**

Simple code is:
- Easier to understand
- Easier to maintain
- Less prone to bugs
- Easier to test

### Application in React

#### ❌ Unnecessary Complexity

```typescript
// Over-engineering with unnecessary abstraction
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

#### ✅ Simplicity and Clarity

```typescript
// Simple and direct with React Query
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

#### ❌ Premature Abstraction

```typescript
// Too much abstraction for a simple component
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

// Complex composition for a simple Card
export const Card = withTheme(withSize(BaseCard));
```

#### ✅ Simple Approach

```typescript
// Simple and direct
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

### Principle

**Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.**

Avoid code and logic duplication.

### Application in React

#### ❌ Code Repetition

```typescript
// Same logic repeated in multiple components
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

#### ✅ Extraction into Reusable Hook

```typescript
// Logic centralized in a hook
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

// Or better: use React Query
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

// Simplified components
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

#### ❌ Repetitive UI

```typescript
// Same form structure repeated
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

#### ✅ Reusable Component

```typescript
// Reusable FormField component
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

// Simplified forms
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

#### ❌ Duplicated Business Logic

```typescript
// Duplicated validation
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

#### ✅ Centralized Validation

```typescript
// Reusable validation schemas with Zod
export const emailSchema = z
  .string()
  .min(1, 'Email required')
  .email('Invalid email');

export const passwordSchema = z
  .string()
  .min(1, 'Password required')
  .min(8, 'Password must be at least 8 characters');

export const nameSchema = z.string().min(1, 'Name required');

// Composed schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

// Usage in forms
export const LoginForm: FC = () => {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  // Validation is automatic
};

export const RegisterForm: FC = () => {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  });

  // Validation is automatic
};
```

## YAGNI - You Aren't Gonna Need It

### Principle

**Don't add functionality until you actually need it.**

Don't anticipate hypothetical future needs.

### Application in React

#### ❌ Anticipatory Over-Engineering

```typescript
// Complex system "in case we need it"
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

// ... 200 lines of code for a system that's never used
```

#### ✅ Pragmatic Approach

```typescript
// Start simple with what we need NOW
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json())
  });
};

// When the cache need appears, THEN add:
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
    staleTime: 5 * 60 * 1000 // Added when necessary
  });
};
```

#### ❌ "Just in Case" Props

```typescript
// Too many "just in case" props
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
  // ... 30 other props never used
}
```

#### ✅ Essential Props

```typescript
// Only what is actually used
interface ButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
}

// Add other props WHEN the need appears
```

## Balance Between Principles

### Finding the Right Balance

```typescript
// ❌ Too DRY: Forced abstraction
const useGenericCRUD = <T,>(endpoint: string) => {
  // Complex logic to be "DRY"
  // but difficult to understand and maintain
};

// ❌ Not DRY enough: Excessive duplication
const useUsers = () => {
  /* 50 lines */
};
const useProducts = () => {
  /* 50 identical lines */
};
const useOrders = () => {
  /* 50 identical lines */
};

// ✅ Balance: Reasonable reuse
// React Query handles common logic
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

// If really necessary, create a simple helper
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

### Rule of Three

**Principle**: Duplicate once (two instances), refactor on the third.

```typescript
// 1st instance
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ...
};

// 2nd instance - Acceptable duplication
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // ...
};

// 3rd instance - NOW we refactor
const ResetPasswordForm = () => {
  // Time to create a reusable hook
};

// Create hook after 3 similar instances
const useFormField = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  return { value, onChange: handleChange };
};
```

## Principles Checklist

### Before Writing Code

- [ ] **KISS**: Is this the simplest possible solution?
- [ ] **YAGNI**: Do I really need this functionality now?
- [ ] **DRY**: Does this logic already exist elsewhere?

### During Development

- [ ] **KISS**: Can I simplify this code?
- [ ] **YAGNI**: Will these props/options be used?
- [ ] **DRY**: Have I copy-pasted code more than 2 times?

### During Review

- [ ] **KISS**: Is the code easy to understand?
- [ ] **YAGNI**: Is there dead or unused code?
- [ ] **DRY**: Are there opportunities for reuse?

## Conclusion

KISS, DRY, and YAGNI principles are complementary:

1. ✅ **KISS**: Favor simplicity
2. ✅ **DRY**: Avoid duplication intelligently
3. ✅ **YAGNI**: Only add what is necessary

**Golden rules**:
- Start simple
- Refactor when the need appears
- Don't anticipate hypothetical needs
- Duplication is sometimes preferable to bad abstraction

**Motto**: "Make it work, make it right, make it fast" - Kent Beck
