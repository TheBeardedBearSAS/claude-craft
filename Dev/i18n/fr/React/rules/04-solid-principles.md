# Principes SOLID en React TypeScript

## Introduction aux Principes SOLID

Les principes SOLID sont des principes de conception orientée objet qui s'appliquent également à React et au développement fonctionnel. Ils permettent de créer du code :

- **Maintenable** : Facile à modifier
- **Testable** : Facile à tester
- **Flexible** : Facile à étendre
- **Réutilisable** : Composants réutilisables

## S - Single Responsibility Principle (SRP)

### Principe

**Une classe/composant/fonction ne devrait avoir qu'une seule raison de changer.**

Chaque composant, hook ou fonction doit avoir une responsabilité unique et bien définie.

### Application en React

#### ❌ Mauvais Exemple - Multiples Responsabilités

```typescript
// UserProfile gère TROP de choses :
// - Récupération des données
// - Gestion du formulaire
// - Validation
// - Affichage UI
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

#### ✅ Bon Exemple - Séparation des Responsabilités

```typescript
// 1. Hook pour la récupération des données
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId)
  });
};

// 2. Hook pour la mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => userService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};

// 3. Schema de validation (Zod)
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
});

type UserFormData = z.infer<typeof userSchema>;

// 4. Hook pour le formulaire
export const useUserForm = (initialData: UserFormData) => {
  return useForm<UserFormData>({
    defaultValues: initialData,
    resolver: zodResolver(userSchema)
  });
};

// 5. Composant de présentation
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

// 6. Composant container (composition)
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

**Avantages** :
- Chaque élément a une responsabilité unique
- Facile à tester individuellement
- Facile à réutiliser
- Facile à modifier

## O - Open/Closed Principle (OCP)

### Principe

**Les entités doivent être ouvertes à l'extension mais fermées à la modification.**

On doit pouvoir ajouter de nouvelles fonctionnalités sans modifier le code existant.

### Application en React

#### ❌ Mauvais Exemple - Modification Constante

```typescript
// À chaque nouveau type, on doit modifier le composant
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
  // À chaque nouveau type, on ajoute un if...
  return <button>{children}</button>;
};
```

#### ✅ Bon Exemple - Extension via Props

```typescript
// 1. Avec class-variance-authority (CVA)
const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      success: 'btn-success',
      // Facile d'ajouter de nouvelles variantes
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

// 3. Extension via render props
interface IconButtonProps extends ButtonProps {
  icon: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  iconPosition = 'left',
  children,
  ...props
}) => {
  return (
    <Button {...props}>
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </Button>
  );
};
```

#### ✅ Exemple avec Strategy Pattern

```typescript
// Définir les stratégies de tri
type SortStrategy<T> = (a: T, b: T) => number;

const sortStrategies = {
  nameAsc: (a: User, b: User) => a.name.localeCompare(b.name),
  nameDesc: (a: User, b: User) => b.name.localeCompare(a.name),
  dateAsc: (a: User, b: User) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  dateDesc: (a: User, b: User) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
} as const;

type SortType = keyof typeof sortStrategies;

// Composant extensible
interface SortableListProps<T> {
  data: T[];
  sortBy: SortType;
  renderItem: (item: T) => ReactNode;
}

export function SortableList<T extends User>({
  data,
  sortBy,
  renderItem
}: SortableListProps<T>) {
  const sortStrategy = sortStrategies[sortBy];
  const sortedData = [...data].sort(sortStrategy);

  return (
    <ul>
      {sortedData.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Ajouter une nouvelle stratégie sans modifier le composant
const extendedSortStrategies = {
  ...sortStrategies,
  emailAsc: (a: User, b: User) => a.email.localeCompare(b.email)
};
```

## L - Liskov Substitution Principle (LSP)

### Principe

**Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le comportement du programme.**

En React : Les composants enfants doivent respecter le contrat de l'interface de leurs parents.

### Application en React

#### ❌ Mauvais Exemple - Violation du Contrat

```typescript
// Interface de base
interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ SubmitButton viole le contrat - onClick ne fait rien
export const SubmitButton: FC<ButtonProps> = ({ children }) => {
  // onClick est ignoré ! Violation de LSP
  return <button type="submit">{children}</button>;
};
```

#### ✅ Bon Exemple - Respect du Contrat

```typescript
// Interface de base claire
interface BaseButtonProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

// Bouton standard avec onClick
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

// Bouton de submit qui respecte son propre contrat
interface SubmitButtonProps extends BaseButtonProps {
  onSubmit?: () => void; // Optionnel car le form gère
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

// Les deux peuvent être utilisés de manière interchangeable
// dans leurs contextes respectifs
```

#### ✅ Exemple avec Polymorphisme

```typescript
// Type de base
interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Props de base
interface BaseNotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

// Composant de base
export const BaseNotification: FC<BaseNotificationProps> = ({
  notification,
  onClose
}) => {
  return (
    <div className={`notification notification-${notification.type}`}>
      <p>{notification.message}</p>
      <button onClick={() => onClose(notification.id)}>×</button>
    </div>
  );
};

// Extensions qui respectent le contrat
export const InfoNotification: FC<BaseNotificationProps> = (props) => {
  return (
    <BaseNotification {...props}>
      <Icon name="info" />
    </BaseNotification>
  );
};

export const ErrorNotification: FC<BaseNotificationProps> = (props) => {
  return (
    <BaseNotification {...props}>
      <Icon name="error" />
    </BaseNotification>
  );
};

// Toutes les variantes peuvent être utilisées de manière interchangeable
const NotificationList: FC<{ notifications: Notification[] }> = ({
  notifications
}) => {
  const handleClose = (id: string) => {
    // ...
  };

  return (
    <div>
      {notifications.map((notification) => {
        const props = { notification, onClose: handleClose };

        switch (notification.type) {
          case 'error':
            return <ErrorNotification key={notification.id} {...props} />;
          case 'info':
            return <InfoNotification key={notification.id} {...props} />;
          default:
            return <BaseNotification key={notification.id} {...props} />;
        }
      })}
    </div>
  );
};
```

## I - Interface Segregation Principle (ISP)

### Principe

**Les clients ne devraient pas dépendre d'interfaces qu'ils n'utilisent pas.**

En React : Les composants ne devraient recevoir que les props dont ils ont besoin.

### Application en React

#### ❌ Mauvais Exemple - Interface Trop Large

```typescript
// Interface trop large avec beaucoup de props optionnelles
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
  // ... 20 autres props
}

// Le composant est surchargé
export const UserCard: FC<UserCardProps> = ({
  user,
  showEmail,
  showPhone,
  // ... beaucoup de props inutilisées dans certains contextes
}) => {
  // ...
};
```

#### ✅ Bon Exemple - Interfaces Ségrégées

```typescript
// 1. Séparer en interfaces spécifiques
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

// 2. Créer des composants spécialisés
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

// 3. Composer selon les besoins
export const FullUserCard: FC<
  BaseUserCardProps &
    UserCardDisplayProps &
    UserCardActionsProps &
    UserCardSocialProps
> = ({ user, ...props }) => {
  return (
    <div>
      <DetailedUserCard user={user} {...props} />
      <ActionableUserCard user={user} {...props} />
      <div>
        {props.onFollow && <Button onClick={props.onFollow}>Follow</Button>}
        {props.onMessage && <Button onClick={props.onMessage}>Message</Button>}
      </div>
    </div>
  );
};
```

#### ✅ Exemple avec Composition

```typescript
// Au lieu d'un composant monolithique, composer des petits composants
interface UserAvatarProps {
  user: Pick<User, 'name' | 'avatar'>;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  return <img src={user.avatar} alt={user.name} className={`avatar-${size}`} />;
};

interface UserNameProps {
  user: Pick<User, 'name'>;
  variant?: 'default' | 'bold' | 'link';
}

export const UserName: FC<UserNameProps> = ({ user, variant = 'default' }) => {
  return <span className={`name-${variant}`}>{user.name}</span>;
};

interface UserEmailProps {
  user: Pick<User, 'email'>;
}

export const UserEmail: FC<UserEmailProps> = ({ user }) => {
  return <a href={`mailto:${user.email}`}>{user.email}</a>;
};

// Composer selon les besoins
export const CompactUserCard: FC<{ user: User }> = ({ user }) => {
  return (
    <div>
      <UserAvatar user={user} size="sm" />
      <UserName user={user} />
    </div>
  );
};

export const FullUserCard: FC<{ user: User }> = ({ user }) => {
  return (
    <div>
      <UserAvatar user={user} size="lg" />
      <UserName user={user} variant="bold" />
      <UserEmail user={user} />
    </div>
  );
};
```

## D - Dependency Inversion Principle (DIP)

### Principe

**Les modules de haut niveau ne devraient pas dépendre des modules de bas niveau. Les deux devraient dépendre d'abstractions.**

En React : Dépendre d'interfaces/abstractions plutôt que d'implémentations concrètes.

### Application en React

#### ❌ Mauvais Exemple - Dépendance Directe

```typescript
// Composant dépend directement de l'implémentation fetch
export const UserList: FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Dépendance directe à fetch
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

#### ✅ Bon Exemple - Dépendance d'Abstraction

```typescript
// 1. Définir l'abstraction (interface)
interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(user: CreateUserInput): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// 2. Implémentation concrète (peut être remplacée)
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

// 3. Implémentation mock pour les tests
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

// 4. Service qui utilise l'abstraction
class UserService {
  constructor(private repository: UserRepository) {}

  getAllUsers(): Promise<User[]> {
    return this.repository.getAll();
  }

  getUserById(id: string): Promise<User> {
    return this.repository.getById(id);
  }

  // ... autres méthodes
}

// 5. Injection de dépendance via Context
interface UserServiceContext {
  userService: UserService;
}

const UserServiceContext = createContext<UserServiceContext | undefined>(
  undefined
);

export const UserServiceProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  // On peut facilement changer l'implémentation
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

// 6. Composant utilise l'abstraction
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

#### ✅ Exemple Simplifié avec Hooks

```typescript
// 1. Abstraction via hook
interface UseDataSource<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// 2. Implémentation pour API
export const useApiUsers = (): UseDataSource<User> => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json())
  });

  return { data, isLoading, error, refetch };
};

// 3. Implémentation pour données locales
export const useLocalUsers = (): UseDataSource<User> => {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = () => {
    // Charger depuis localStorage
    const stored = localStorage.getItem('users');
    if (stored) {
      setData(JSON.parse(stored));
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
};

// 4. Composant dépend de l'abstraction
interface UserListProps {
  useDataSource: () => UseDataSource<User>;
}

export const UserList: FC<UserListProps> = ({ useDataSource }) => {
  const { data, isLoading, error } = useDataSource();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

// 5. Usage - on injecte l'implémentation
const App = () => {
  return (
    <>
      {/* Version API */}
      <UserList useDataSource={useApiUsers} />

      {/* Version locale - même composant ! */}
      <UserList useDataSource={useLocalUsers} />
    </>
  );
};
```

## Composition de Tous les Principes SOLID

### Exemple Complet : Système de Notifications

```typescript
// ============= S: Single Responsibility =============

// Chaque type a sa responsabilité
interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

type NotificationType = 'info' | 'success' | 'warning' | 'error';

// ============= O: Open/Closed =============

// Ouvert à l'extension via stratégie
interface NotificationStrategy {
  render(notification: Notification): ReactNode;
  getIcon(): ReactNode;
  getClassName(): string;
}

class InfoStrategy implements NotificationStrategy {
  render(notification: Notification): ReactNode {
    return <div className={this.getClassName()}>{notification.message}</div>;
  }

  getIcon(): ReactNode {
    return <Icon name="info" />;
  }

  getClassName(): string {
    return 'notification-info';
  }
}

class ErrorStrategy implements NotificationStrategy {
  render(notification: Notification): ReactNode {
    return (
      <div className={this.getClassName()}>
        <strong>Error:</strong> {notification.message}
      </div>
    );
  }

  getIcon(): ReactNode {
    return <Icon name="error" />;
  }

  getClassName(): string {
    return 'notification-error';
  }
}

// ============= L: Liskov Substitution =============

// Toutes les stratégies respectent le contrat
const strategies: Record<NotificationType, NotificationStrategy> = {
  info: new InfoStrategy(),
  success: new SuccessStrategy(),
  warning: new WarningStrategy(),
  error: new ErrorStrategy()
};

// ============= I: Interface Segregation =============

// Interfaces séparées pour différents besoins
interface NotificationDisplayProps {
  notification: Notification;
}

interface NotificationActionsProps {
  onClose: (id: string) => void;
  onAction?: () => void;
}

// ============= D: Dependency Inversion =============

// Abstraction du store
interface NotificationStore {
  notifications: Notification[];
  add(notification: Omit<Notification, 'id' | 'timestamp'>): void;
  remove(id: string): void;
  clear(): void;
}

// Implémentation avec Zustand
const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  add: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date()
        }
      ]
    })),
  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  clear: () => set({ notifications: [] })
}));

// ============= Composants finaux =============

export const NotificationItem: FC<
  NotificationDisplayProps & NotificationActionsProps
> = ({ notification, onClose }) => {
  const strategy = strategies[notification.type];

  return (
    <div className={strategy.getClassName()}>
      {strategy.getIcon()}
      {strategy.render(notification)}
      <button onClick={() => onClose(notification.id)}>×</button>
    </div>
  );
};

export const NotificationList: FC = () => {
  const { notifications, remove } = useNotificationStore();

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={remove}
        />
      ))}
    </div>
  );
};
```

## Conclusion

Les principes SOLID en React permettent de créer :

1. ✅ **Code maintenable** : Facile à modifier et à faire évoluer
2. ✅ **Code testable** : Chaque partie peut être testée isolément
3. ✅ **Code réutilisable** : Composants et hooks réutilisables
4. ✅ **Code flexible** : Facile d'ajouter de nouvelles fonctionnalités
5. ✅ **Code lisible** : Structure claire et prévisible

**Règle d'or** : Appliquer SOLID progressivement. Ne pas sur-ingéniérer les petits composants simples, mais utiliser ces principes pour les fonctionnalités complexes.
