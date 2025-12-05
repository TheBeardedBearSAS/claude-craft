# Princípios SOLID em React TypeScript

## Introdução aos Princípios SOLID

Os princípios SOLID são princípios de design orientado a objetos que também se aplicam ao React e ao desenvolvimento funcional. Eles permitem criar código que é:

- **Manutenível**: Fácil de modificar
- **Testável**: Fácil de testar
- **Flexível**: Fácil de estender
- **Reutilizável**: Componentes reutilizáveis

## S - Princípio da Responsabilidade Única (SRP)

### Princípio

**Uma classe/componente/função deve ter apenas uma razão para mudar.**

Cada componente, hook ou função deve ter uma única responsabilidade bem definida.

### Aplicação em React

#### ❌ Exemplo Ruim - Múltiplas Responsabilidades

```typescript
// UserProfile lida com MUITAS coisas:
// - Busca de dados
// - Gerenciamento de formulário
// - Validação
// - Exibição de UI
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
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
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
          <button type="submit">Salvar</button>
        </form>
      )}
    </div>
  );
};
```

#### ✅ Exemplo Bom - Separação de Responsabilidades

```typescript
// 1. Hook para busca de dados
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId)
  });
};

// 2. Hook para mutação
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => userService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};

// 3. Schema de validação (Zod)
export const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido')
});

type UserFormData = z.infer<typeof userSchema>;

// 4. Hook para formulário
export const useUserForm = (initialData: UserFormData) => {
  return useForm<UserFormData>({
    defaultValues: initialData,
    resolver: zodResolver(userSchema)
  });
};

// 5. Componente de apresentação
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
        label="Nome"
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
        Salvar
      </Button>
    </form>
  );
};

// 6. Componente container (composição)
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

**Benefícios**:
- Cada elemento tem uma única responsabilidade
- Fácil de testar individualmente
- Fácil de reutilizar
- Fácil de modificar

## O - Princípio Aberto/Fechado (OCP)

### Princípio

**Entidades devem estar abertas para extensão, mas fechadas para modificação.**

Você deve poder adicionar novas funcionalidades sem modificar o código existente.

### Aplicação em React

#### ❌ Exemplo Ruim - Modificação Constante

```typescript
// A cada novo tipo, devemos modificar o componente
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
  // A cada novo tipo, adicionamos um if...
  return <button>{children}</button>;
};
```

#### ✅ Exemplo Bom - Extensão via Props

```typescript
// 1. Com class-variance-authority (CVA)
const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      success: 'btn-success',
      // Fácil de adicionar novas variantes
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

// 2. Extensão via composição
export const PrimaryButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const DangerButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);
```

## L - Princípio da Substituição de Liskov (LSP)

### Princípio

**Objetos de uma classe derivada devem poder substituir objetos da classe base sem alterar o comportamento do programa.**

Em React: Componentes filhos devem respeitar o contrato de interface de seus pais.

### Aplicação em React

#### ❌ Exemplo Ruim - Violação do Contrato

```typescript
// Interface base
interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ SubmitButton viola o contrato - onClick não funciona
export const SubmitButton: FC<ButtonProps> = ({ children }) => {
  // onClick é ignorado! Violação do LSP
  return <button type="submit">{children}</button>;
};
```

#### ✅ Exemplo Bom - Respeito ao Contrato

```typescript
// Interface base clara
interface BaseButtonProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

// Botão padrão com onClick
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

// Botão de submit que respeita seu próprio contrato
interface SubmitButtonProps extends BaseButtonProps {
  onSubmit?: () => void; // Opcional pois o form já gerencia
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

// Ambos podem ser usados de forma intercambiável
// em seus respectivos contextos
```

## I - Princípio da Segregação de Interface (ISP)

### Princípio

**Clientes não devem depender de interfaces que não usam.**

Em React: Componentes devem receber apenas as props de que precisam.

### Aplicação em React

#### ❌ Exemplo Ruim - Interface Muito Grande

```typescript
// Interface muito grande com muitas props opcionais
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
  // ... 20 outras props
}

// Componente está sobrecarregado
export const UserCard: FC<UserCardProps> = ({
  user,
  showEmail,
  showPhone,
  // ... muitas props não usadas em alguns contextos
}) => {
  // ...
};
```

#### ✅ Exemplo Bom - Interfaces Segregadas

```typescript
// 1. Separar em interfaces específicas
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

// 2. Criar componentes especializados
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
        {onEdit && <Button onClick={onEdit}>Editar</Button>}
        {onDelete && <Button onClick={onDelete}>Excluir</Button>}
      </div>
    </div>
  );
};
```

## D - Princípio da Inversão de Dependência (DIP)

### Princípio

**Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.**

Em React: Dependa de interfaces/abstrações em vez de implementações concretas.

### Aplicação em React

#### ❌ Exemplo Ruim - Dependência Direta

```typescript
// Componente depende diretamente da implementação do fetch
export const UserList: FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Dependência direta do fetch
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

#### ✅ Exemplo Bom - Dependência de Abstração

```typescript
// 1. Definir abstração (interface)
interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(user: CreateUserInput): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// 2. Implementação concreta (pode ser substituída)
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

// 3. Implementação mock para testes
class MockUserRepository implements UserRepository {
  private users: User[] = [
    { id: '1', name: 'John', email: 'john@example.com' }
  ];

  async getAll(): Promise<User[]> {
    return Promise.resolve(this.users);
  }

  async getById(id: string): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    return Promise.resolve(user);
  }

  async create(user: CreateUserInput): Promise<User> {
    const newUser = { ...user, id: String(this.users.length + 1) };
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    Object.assign(user, data);
    return Promise.resolve(user);
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
    return Promise.resolve();
  }
}

// 4. Serviço usando abstração
class UserService {
  constructor(private repository: UserRepository) {}

  getAllUsers(): Promise<User[]> {
    return this.repository.getAll();
  }

  getUserById(id: string): Promise<User> {
    return this.repository.getById(id);
  }

  // ... outros métodos
}

// 5. Injeção de dependência via Context
interface UserServiceContext {
  userService: UserService;
}

const UserServiceContext = createContext<UserServiceContext | undefined>(
  undefined
);

export const UserServiceProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  // Podemos facilmente trocar a implementação
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
    throw new Error('useUserService deve ser usado dentro de UserServiceProvider');
  }
  return context.userService;
};

// 6. Componente usa abstração
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

## Conclusão

Os princípios SOLID em React permitem criar:

1. ✅ **Código manutenível**: Fácil de modificar e evoluir
2. ✅ **Código testável**: Cada parte pode ser testada isoladamente
3. ✅ **Código reutilizável**: Componentes e hooks reutilizáveis
4. ✅ **Código flexível**: Fácil de adicionar novas funcionalidades
5. ✅ **Código legível**: Estrutura clara e previsível

**Regra de ouro**: Aplique SOLID progressivamente. Não faça over-engineering em componentes pequenos e simples, mas use estes princípios para funcionalidades complexas.
