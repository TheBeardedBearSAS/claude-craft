# KISS, DRY e YAGNI em React TypeScript

## Introdução

Estes três princípios são fundamentais para escrever código limpo e manutenível:

- **KISS** (Keep It Simple, Stupid): Mantenha simples
- **DRY** (Don't Repeat Yourself): Não se repita
- **YAGNI** (You Aren't Gonna Need It): Você não vai precisar disso

## KISS - Keep It Simple, Stupid

### Princípio

**A solução mais simples é geralmente a melhor.**

Evite complexidade desnecessária. Se você pode fazer de forma simples, faça de forma simples.

### Aplicação em React

#### ❌ Exemplo Ruim - Complexidade Desnecessária

```typescript
// Over-engineering para gerenciar um simples estado de toggle
export const useComplexToggle = (initialState = false) => {
  const [state, dispatch] = useReducer(
    (state: ToggleState, action: ToggleAction) => {
      switch (action.type) {
        case 'TOGGLE':
          return { ...state, isOn: !state.isOn, timestamp: Date.now() };
        case 'SET_ON':
          return { ...state, isOn: true, timestamp: Date.now() };
        case 'SET_OFF':
          return { ...state, isOn: false, timestamp: Date.now() };
        case 'RESET':
          return { isOn: initialState, timestamp: Date.now() };
        default:
          return state;
      }
    },
    { isOn: initialState, timestamp: Date.now() }
  );

  const toggle = useCallback(() => dispatch({ type: 'TOGGLE' }), []);
  const setOn = useCallback(() => dispatch({ type: 'SET_ON' }), []);
  const setOff = useCallback(() => dispatch({ type: 'SET_OFF' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { ...state, toggle, setOn, setOff, reset };
};
```

#### ✅ Exemplo Bom - Solução Simples

```typescript
// Solução simples e eficaz
export const useToggle = (initialState = false) => {
  const [isOn, setIsOn] = useState(initialState);

  const toggle = useCallback(() => setIsOn((prev) => !prev), []);
  const setOn = useCallback(() => setIsOn(true), []);
  const setOff = useCallback(() => setIsOn(false), []);

  return { isOn, toggle, setOn, setOff };
};
```

#### Mais Exemplos KISS

```typescript
// ❌ Ruim - Função complexa
const getUserDisplayName = (user: User | null | undefined): string => {
  if (!user) {
    return 'Convidado';
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.lastName) {
    return user.lastName;
  }

  if (user.username) {
    return user.username;
  }

  return 'Usuário Anônimo';
};

// ✅ Bom - Função simples
const getUserDisplayName = (user: User | null | undefined): string => {
  return user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.username || 'Convidado';
};
```

## DRY - Don't Repeat Yourself

### Princípio

**Cada parte do conhecimento deve ter uma representação única, inequívoca e autoritativa no sistema.**

Evite duplicação de código. Extraia lógica comum em funções reutilizáveis.

### Aplicação em React

#### ❌ Exemplo Ruim - Código Repetido

```typescript
// Busca de usuários (repetido em 5 componentes)
export const UserList: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // ...
};

// Mesmo código repetido em ProductList
export const ProductList: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // ...
};
```

#### ✅ Exemplo Bom - Lógica Reutilizada

```typescript
// 1. Hook genérico reutilizável
export const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};

// 2. Uso simples
export const UserList: FC = () => {
  const { data: users, loading, error } = useFetch<User[]>('/api/users');
  // ...
};

export const ProductList: FC = () => {
  const { data: products, loading, error } = useFetch<Product[]>('/api/products');
  // ...
};

// 3. Ou melhor ainda, use React Query
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<User[]>('/users')
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get<Product[]>('/products')
  });
};
```

#### Mais Exemplos DRY

```typescript
// ❌ Ruim - Validação repetida
export const LoginForm: FC = () => {
  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email) errors.email = 'Email é obrigatório';
    if (email && !email.includes('@')) errors.email = 'Email inválido';
    if (!password) errors.password = 'Senha é obrigatória';
    if (password && password.length < 8) errors.password = 'Senha muito curta';
    return errors;
  };
  // ...
};

export const RegisterForm: FC = () => {
  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email) errors.email = 'Email é obrigatório';
    if (email && !email.includes('@')) errors.email = 'Email inválido';
    if (!password) errors.password = 'Senha é obrigatória';
    if (password && password.length < 8) errors.password = 'Senha muito curta';
    return errors;
  };
  // ...
};

// ✅ Bom - Schema reutilizável (Zod)
export const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
});

export const LoginForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(authSchema)
  });
  // ...
};

export const RegisterForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(authSchema)
  });
  // ...
};
```

## YAGNI - You Aren't Gonna Need It

### Princípio

**Não adicione funcionalidade até que seja realmente necessário.**

Não antecipe necessidades futuras. Implemente apenas o que é necessário agora.

### Aplicação em React

#### ❌ Exemplo Ruim - Over-engineering

```typescript
// Hook com MUITAS features "apenas no caso"
export const useAdvancedUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});
  const [userPreferences, setUserPreferences] = useState<Record<string, unknown>>({});
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({});

  // 50 funções que nunca serão usadas...
  const filterByRole = () => { /* ... */ };
  const filterByDepartment = () => { /* ... */ };
  const filterByLocation = () => { /* ... */ };
  const sortByName = () => { /* ... */ };
  const sortByDate = () => { /* ... */ };
  const sortByActivity = () => { /* ... */ };
  // ...

  // Requirement atual: apenas listar usuários!
  return {
    users,
    filteredUsers,
    sortedUsers,
    paginatedUsers,
    selectedUsers,
    userGroups,
    // ... 20 outras coisas não usadas
  };
};
```

#### ✅ Exemplo Bom - Apenas o Necessário

```typescript
// Implementar apenas o que é necessário AGORA
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};

// Adicionar features quando realmente necessário
export const useFilteredUsers = (filter?: UserFilter) => {
  const { data: users } = useUsers();

  return useMemo(() => {
    if (!filter || !users) return users;
    return users.filter((user) => {
      // Apenas os filtros que realmente precisamos
      if (filter.role && user.role !== filter.role) return false;
      return true;
    });
  }, [users, filter]);
};
```

#### Mais Exemplos YAGNI

```typescript
// ❌ Ruim - Antecipando necessidades futuras
interface UserFormProps {
  user?: User;
  mode?: 'create' | 'edit' | 'view' | 'clone' | 'template';
  onSubmit: (user: User) => void;
  onCancel?: () => void;
  onSaveAsDraft?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onShare?: () => void;
  // ... 10 callbacks que nunca serão usados
}

// ✅ Bom - Apenas o que precisamos
interface UserFormProps {
  user?: User;
  onSubmit: (user: User) => void;
  onCancel?: () => void;
}

// Adicione mais tarde SE necessário
```

## Combinando os Três Princípios

### Exemplo Prático

```typescript
// ❌ Ruim - Violando todos os 3 princípios
export const UserManagementPanel: FC = () => {
  // Não KISS - complexo demais
  const [state, dispatch] = useReducer(complexReducer, initialState);

  // Não DRY - validação repetida
  const validateEmail = (email: string) => {
    if (!email) return 'Email é obrigatório';
    if (!email.includes('@')) return 'Email inválido';
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 8) return 'Senha muito curta';
    return null;
  };

  // Não YAGNI - features não necessárias
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xml'>('json');
  const [batchOperations, setBatchOperations] = useState<BatchOp[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);

  // Código complexo e repetitivo...
};

// ✅ Bom - Seguindo KISS, DRY e YAGNI
export const UserManagementPanel: FC = () => {
  // KISS - solução simples
  const { data: users, isLoading } = useUsers();

  // DRY - validação reutilizável via Zod
  const form = useForm({
    resolver: zodResolver(userSchema)
  });

  // YAGNI - apenas o que precisamos agora
  const createUser = useCreateUser();

  const handleSubmit = form.handleSubmit(async (data) => {
    await createUser.mutateAsync(data);
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <UserForm onSubmit={handleSubmit} />
      <UserList users={users} />
    </div>
  );
};
```

## Diretrizes Práticas

### KISS

- ✅ Use ferramentas padrão (React Query, React Hook Form)
- ✅ Prefira composição a configuração complexa
- ✅ Evite abstrações prematuras
- ✅ Se você precisa de um comentário para explicar, simplifique o código

### DRY

- ✅ Extraia lógica duplicada em hooks customizados
- ✅ Use schemas de validação reutilizáveis (Zod, Yup)
- ✅ Crie componentes reutilizáveis
- ✅ Mas não tenha medo de repetir se simplificar o código

### YAGNI

- ✅ Implemente apenas features necessárias AGORA
- ✅ Não adicione configurações "no caso de"
- ✅ Não crie abstrações para um único uso
- ✅ Refatore quando a necessidade surgir, não antes

## Quando Quebrar as Regras

### KISS
Às vezes complexidade é necessária para:
- Performance crítica
- Requisitos de negócio complexos
- Segurança

### DRY
Está OK repetir se:
- São realmente conceitos diferentes
- A abstração seria mais complexa que a repetição
- Repetição temporária durante refatoração

### YAGNI
Está OK antecipar se:
- É um requirement confirmado para próximo sprint
- A mudança posterior seria muito custosa
- É um padrão bem estabelecido no projeto

## Conclusão

| Princípio | O que fazer | O que evitar |
|-----------|-------------|--------------|
| **KISS** | Soluções simples e diretas | Over-engineering e abstrações complexas |
| **DRY** | Reutilizar lógica comum | Copiar e colar código |
| **YAGNI** | Implementar apenas o necessário | Adicionar features "no caso de" |

**Regra de Ouro**: Comece simples (KISS), elimine duplicação quando aparecer (DRY), e adicione funcionalidades quando realmente necessário (YAGNI).
