# Principios SOLID en React TypeScript

## Introducción a los Principios SOLID

Los principios SOLID son principios de diseño orientado a objetos que también se aplican a React y al desarrollo funcional. Permiten crear código que es:

- **Mantenible**: Fácil de modificar
- **Testable**: Fácil de probar
- **Flexible**: Fácil de extender
- **Reutilizable**: Componentes reutilizables

## S - Principio de Responsabilidad Única (SRP)

### Principio

**Una clase/componente/función debe tener solo una razón para cambiar.**

Cada componente, hook o función debe tener una única responsabilidad bien definida.

### Aplicación en React

#### ❌ Mal Ejemplo - Múltiples Responsabilidades

```typescript
// UserProfile gestiona DEMASIADAS cosas:
// - Obtención de datos
// - Gestión de formularios
// - Validación
// - Visualización de UI
export const UserProfile: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      setUser(data);
      setFormData({ name: data.name, email: data.email });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await fetch('/api/user', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <span>{errors.name}</span>}
          <input
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span>{errors.email}</span>}
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
};
```

#### ✅ Buen Ejemplo - Separación de Responsabilidades

```typescript
// 1. Hook para obtención de datos
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId)
  });
};

// 2. Hook para mutación
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => userService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};

// 3. Schema de validación (Zod)
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
});

type UserFormData = z.infer<typeof userSchema>;

// 4. Hook para formulario
export const useUserForm = (initialData: UserFormData) => {
  return useForm<UserFormData>({
    defaultValues: initialData,
    resolver: zodResolver(userSchema)
  });
};

// 5. Componente de presentación
interface UserFormPresenterProps {
  register: UseFormRegister<UserFormData>;
  errors: FieldErrors<UserFormData>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
}

export const UserFormPresenter: FC<UserFormPresenterProps> = ({
  register,
  errors,
  onSubmit,
  isSubmitting
}) => {
  return (
    <form onSubmit={onSubmit}>
      <FormField
        label="Name"
        error={errors.name?.message}
        {...register('name')}
      />
      <FormField
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Save
      </Button>
    </form>
  );
};

// 6. Componente contenedor (composición)
export const UserProfileContainer: FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();

  const form = useUserForm({
    name: user?.name ?? '',
    email: user?.email ?? ''
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await updateUser.mutateAsync(data);
  });

  if (isLoading) return <Spinner />;

  return (
    <UserFormPresenter
      register={form.register}
      errors={form.formState.errors}
      onSubmit={onSubmit}
      isSubmitting={form.formState.isSubmitting}
    />
  );
};
```

**Beneficios**:
- Cada elemento tiene una única responsabilidad
- Fácil de probar individualmente
- Fácil de reutilizar
- Fácil de modificar

## O - Principio Abierto/Cerrado (OCP)

### Principio

**Las entidades deben estar abiertas para extensión pero cerradas para modificación.**

Debe ser posible añadir nuevas funcionalidades sin modificar el código existente.

### Aplicación en React

#### ❌ Mal Ejemplo - Modificación Constante

```typescript
// Con cada nuevo tipo, debemos modificar el componente
export const Button: FC<ButtonProps> = ({ type, children }) => {
  if (type === 'primary') {
    return <button className="btn-primary">{children}</button>;
  }
  if (type === 'secondary') {
    return <button className="btn-secondary">{children}</button>;
  }
  if (type === 'danger') {
    return <button className="btn-danger">{children}</button>;
  }
  // Con cada nuevo tipo, añadimos un if...
  return <button>{children}</button>;
};
```

#### ✅ Buen Ejemplo - Extensión vía Props

```typescript
// 1. Con class-variance-authority (CVA)
const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      success: 'btn-success',
      // Fácil de añadir nuevas variantes
    },
    size: {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg'
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
});

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant,
  size,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
};

// 2. Extensión vía composición
export const PrimaryButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const DangerButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);
```

## L - Principio de Sustitución de Liskov (LSP)

### Principio

**Los objetos de una clase derivada deben poder reemplazar a objetos de la clase base sin alterar el comportamiento del programa.**

En React: Los componentes hijos deben respetar el contrato de interfaz de sus padres.

### Aplicación en React

#### ❌ Mal Ejemplo - Violación del Contrato

```typescript
// Interfaz base
interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ SubmitButton viola el contrato - onClick no hace nada
export const SubmitButton: FC<ButtonProps> = ({ children }) => {
  // onClick es ignorado! Violación de LSP
  return <button type="submit">{children}</button>;
};
```

#### ✅ Buen Ejemplo - Respeto del Contrato

```typescript
// Interfaz base clara
interface BaseButtonProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

// Botón estándar con onClick
interface ClickableButtonProps extends BaseButtonProps {
  onClick: () => void;
}

export const Button: FC<ClickableButtonProps> = ({
  onClick,
  children,
  ...props
}) => {
  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Botón de submit que respeta su propio contrato
interface SubmitButtonProps extends BaseButtonProps {
  onSubmit?: () => void; // Opcional ya que el formulario lo gestiona
}

export const SubmitButton: FC<SubmitButtonProps> = ({
  onSubmit,
  children,
  ...props
}) => {
  return (
    <button type="submit" onClick={onSubmit} {...props}>
      {children}
    </button>
  );
};

// Ambos pueden usarse intercambiablemente
// en sus respectivos contextos
```

## I - Principio de Segregación de Interfaces (ISP)

### Principio

**Los clientes no deben depender de interfaces que no usan.**

En React: Los componentes deben recibir solo las props que necesitan.

### Aplicación en React

#### ❌ Mal Ejemplo - Interfaz Demasiado Grande

```typescript
// Interfaz demasiado grande con muchas props opcionales
interface UserCardProps {
  user: User;
  showEmail?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showBio?: boolean;
  showAvatar?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
  onBlock?: () => void;
  // ... 20 otras props
}

// Componente sobrecargado
export const UserCard: FC<UserCardProps> = ({
  user,
  showEmail,
  showPhone,
  // ... muchas props no utilizadas en algunos contextos
}) => {
  // ...
};
```

#### ✅ Buen Ejemplo - Interfaces Segregadas

```typescript
// 1. Separar en interfaces específicas
interface BaseUserCardProps {
  user: User;
}

interface UserCardDisplayProps {
  showEmail?: boolean;
  showPhone?: boolean;
  showAvatar?: boolean;
}

interface UserCardActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

interface UserCardSocialProps {
  onFollow?: () => void;
  onMessage?: () => void;
}

// 2. Crear componentes especializados
export const SimpleUserCard: FC<BaseUserCardProps> = ({ user }) => {
  return (
    <div>
      <h3>{user.name}</h3>
    </div>
  );
};

export const DetailedUserCard: FC<
  BaseUserCardProps & UserCardDisplayProps
> = ({ user, showEmail, showPhone }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      {showEmail && <p>{user.email}</p>}
      {showPhone && <p>{user.phone}</p>}
    </div>
  );
};

export const ActionableUserCard: FC<
  BaseUserCardProps & UserCardActionsProps
> = ({ user, onEdit, onDelete }) => {
  return (
    <div>
      <SimpleUserCard user={user} />
      <div>
        {onEdit && <Button onClick={onEdit}>Edit</Button>}
        {onDelete && <Button onClick={onDelete}>Delete</Button>}
      </div>
    </div>
  );
};
```

## D - Principio de Inversión de Dependencias (DIP)

### Principio

**Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.**

En React: Depender de interfaces/abstracciones en lugar de implementaciones concretas.

### Aplicación en React

#### ❌ Mal Ejemplo - Dependencia Directa

```typescript
// Componente depende directamente de la implementación fetch
export const UserList: FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Dependencia directa de fetch
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

#### ✅ Buen Ejemplo - Dependencia de Abstracción

```typescript
// 1. Definir abstracción (interfaz)
interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(user: CreateUserInput): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// 2. Implementación concreta (puede ser reemplazada)
class ApiUserRepository implements UserRepository {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<User[]> {
    return this.apiClient.get<User[]>('/users');
  }

  async getById(id: string): Promise<User> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  async create(user: CreateUserInput): Promise<User> {
    return this.apiClient.post<User>('/users', user);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    return this.apiClient.put<User>(`/users/${id}`, user);
  }

  async delete(id: string): Promise<void> {
    return this.apiClient.delete(`/users/${id}`);
  }
}

// 3. Implementación mock para tests
class MockUserRepository implements UserRepository {
  private users: User[] = [
    { id: '1', name: 'John', email: 'john@example.com' }
  ];

  async getAll(): Promise<User[]> {
    return Promise.resolve(this.users);
  }

  async getById(id: string): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return Promise.resolve(user);
  }

  async create(user: CreateUserInput): Promise<User> {
    const newUser = { ...user, id: String(this.users.length + 1) };
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    Object.assign(user, data);
    return Promise.resolve(user);
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
    return Promise.resolve();
  }
}

// 4. Servicio usando abstracción
class UserService {
  constructor(private repository: UserRepository) {}

  getAllUsers(): Promise<User[]> {
    return this.repository.getAll();
  }

  getUserById(id: string): Promise<User> {
    return this.repository.getById(id);
  }

  // ... otros métodos
}

// 5. Inyección de dependencias vía Context
interface UserServiceContext {
  userService: UserService;
}

const UserServiceContext = createContext<UserServiceContext | undefined>(
  undefined
);

export const UserServiceProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  // Podemos cambiar fácilmente la implementación
  const apiClient = useApiClient();
  const repository = useMemo(
    () => new ApiUserRepository(apiClient),
    [apiClient]
  );
  const userService = useMemo(() => new UserService(repository), [repository]);

  return (
    <UserServiceContext.Provider value={{ userService }}>
      {children}
    </UserServiceContext.Provider>
  );
};

export const useUserService = (): UserService => {
  const context = useContext(UserServiceContext);
  if (!context) {
    throw new Error('useUserService must be used within UserServiceProvider');
  }
  return context.userService;
};

// 6. Componente usa abstracción
export const UserList: FC = () => {
  const userService = useUserService();
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers()
  });

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

## Conclusión

Los principios SOLID en React permiten crear:

1. ✅ **Código mantenible**: Fácil de modificar y evolucionar
2. ✅ **Código testable**: Cada parte puede probarse aisladamente
3. ✅ **Código reutilizable**: Componentes y hooks reutilizables
4. ✅ **Código flexible**: Fácil de añadir nuevas funcionalidades
5. ✅ **Código legible**: Estructura clara y predecible

**Regla de oro**: Aplicar SOLID progresivamente. No sobre-ingeniería en componentes pequeños y simples, pero usar estos principios para funcionalidades complejas.
