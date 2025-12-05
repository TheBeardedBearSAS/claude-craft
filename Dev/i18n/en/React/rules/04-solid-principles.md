# SOLID Principles in React TypeScript

## Introduction to SOLID Principles

SOLID principles are object-oriented design principles that also apply to React and functional development. They enable creating code that is:

- **Maintainable**: Easy to modify
- **Testable**: Easy to test
- **Flexible**: Easy to extend
- **Reusable**: Reusable components

## S - Single Responsibility Principle (SRP)

### Principle

**A class/component/function should have only one reason to change.**

Each component, hook, or function should have a single, well-defined responsibility.

### Application in React

#### ❌ Bad Example - Multiple Responsibilities

```typescript
// UserProfile handles TOO many things:
// - Data fetching
// - Form management
// - Validation
// - UI display
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

#### ✅ Good Example - Separation of Responsibilities

```typescript
// 1. Hook for data fetching
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId)
  });
};

// 2. Hook for mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => userService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};

// 3. Validation schema (Zod)
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
});

type UserFormData = z.infer<typeof userSchema>;

// 4. Hook for form
export const useUserForm = (initialData: UserFormData) => {
  return useForm<UserFormData>({
    defaultValues: initialData,
    resolver: zodResolver(userSchema)
  });
};

// 5. Presentation component
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

// 6. Container component (composition)
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

**Benefits**:
- Each element has a single responsibility
- Easy to test individually
- Easy to reuse
- Easy to modify

## O - Open/Closed Principle (OCP)

### Principle

**Entities should be open for extension but closed for modification.**

You should be able to add new functionalities without modifying existing code.

### Application in React

#### ❌ Bad Example - Constant Modification

```typescript
// With each new type, we must modify the component
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
  // With each new type, we add an if...
  return <button>{children}</button>;
};
```

#### ✅ Good Example - Extension via Props

```typescript
// 1. With class-variance-authority (CVA)
const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      success: 'btn-success',
      // Easy to add new variants
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

// 2. Extension via composition
export const PrimaryButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const DangerButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);
```

## L - Liskov Substitution Principle (LSP)

### Principle

**Objects of a derived class should be able to replace objects of the base class without altering the program's behavior.**

In React: Child components should respect the interface contract of their parents.

### Application in React

#### ❌ Bad Example - Contract Violation

```typescript
// Base interface
interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ SubmitButton violates the contract - onClick does nothing
export const SubmitButton: FC<ButtonProps> = ({ children }) => {
  // onClick is ignored! LSP violation
  return <button type="submit">{children}</button>;
};
```

#### ✅ Good Example - Contract Respect

```typescript
// Clear base interface
interface BaseButtonProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

// Standard button with onClick
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

// Submit button that respects its own contract
interface SubmitButtonProps extends BaseButtonProps {
  onSubmit?: () => void; // Optional as form handles it
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

// Both can be used interchangeably
// in their respective contexts
```

## I - Interface Segregation Principle (ISP)

### Principle

**Clients should not depend on interfaces they do not use.**

In React: Components should only receive the props they need.

### Application in React

#### ❌ Bad Example - Interface Too Large

```typescript
// Interface too large with many optional props
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
  // ... 20 other props
}

// Component is overloaded
export const UserCard: FC<UserCardProps> = ({
  user,
  showEmail,
  showPhone,
  // ... many props unused in some contexts
}) => {
  // ...
};
```

#### ✅ Good Example - Segregated Interfaces

```typescript
// 1. Separate into specific interfaces
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

// 2. Create specialized components
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

## D - Dependency Inversion Principle (DIP)

### Principle

**High-level modules should not depend on low-level modules. Both should depend on abstractions.**

In React: Depend on interfaces/abstractions rather than concrete implementations.

### Application in React

#### ❌ Bad Example - Direct Dependency

```typescript
// Component directly depends on fetch implementation
export const UserList: FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Direct dependency on fetch
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

#### ✅ Good Example - Abstraction Dependency

```typescript
// 1. Define abstraction (interface)
interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(user: CreateUserInput): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// 2. Concrete implementation (can be replaced)
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

// 3. Mock implementation for tests
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

// 4. Service using abstraction
class UserService {
  constructor(private repository: UserRepository) {}

  getAllUsers(): Promise<User[]> {
    return this.repository.getAll();
  }

  getUserById(id: string): Promise<User> {
    return this.repository.getById(id);
  }

  // ... other methods
}

// 5. Dependency injection via Context
interface UserServiceContext {
  userService: UserService;
}

const UserServiceContext = createContext<UserServiceContext | undefined>(
  undefined
);

export const UserServiceProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  // We can easily change implementation
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

// 6. Component uses abstraction
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

## Conclusion

SOLID principles in React enable creating:

1. ✅ **Maintainable code**: Easy to modify and evolve
2. ✅ **Testable code**: Each part can be tested in isolation
3. ✅ **Reusable code**: Reusable components and hooks
4. ✅ **Flexible code**: Easy to add new functionalities
5. ✅ **Readable code**: Clear and predictable structure

**Golden rule**: Apply SOLID progressively. Don't over-engineer small simple components, but use these principles for complex functionalities.
