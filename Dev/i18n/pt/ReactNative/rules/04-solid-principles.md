# Princípios SOLID em React Native

## Introdução

Os princípios SOLID são essenciais para criar aplicações React Native manuteníveis, testáveis e escaláveis. Este documento adapta esses princípios ao contexto React Native com TypeScript.

---

## S - Single Responsibility Principle (SRP)

### Princípio

> "Uma classe/função/componente deve ter apenas uma razão para mudar"

Cada entidade deve ter uma única responsabilidade bem definida.

### Aplicação em React Native

#### ❌ RUIM: Componente com múltiplas responsabilidades

```typescript
// UserProfile.tsx - Faz MUITAS coisas
export const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Responsabilidade 1: Data fetching
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Responsabilidade 2: Form handling
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Responsabilidade 3: Form submission
  const handleSubmit = async () => {
    try {
      await fetch('/api/user', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Responsabilidade 4: UI rendering
  return (
    <View>
      {loading && <ActivityIndicator />}
      {user && (
        <View>
          <Text>{user.name}</Text>
          <Text>{user.email}</Text>
          {editing ? (
            <View>
              <TextInput
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
              <Button title="Save" onPress={handleSubmit} />
            </View>
          ) : (
            <Button title="Edit" onPress={() => setEditing(true)} />
          )}
        </View>
      )}
    </View>
  );
};
```

#### ✅ BOM: Separação de responsabilidades

```typescript
// 1. Data Layer - Hook para data fetching
// hooks/useUser.ts
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
  });
};

// 2. Logic Layer - Hook para form logic
// hooks/useUserForm.ts
export const useUserForm = (initialUser: User) => {
  const [formData, setFormData] = useState(initialUser);
  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => userService.updateUser(data),
  });

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await updateMutation.mutateAsync(formData);
  };

  return { formData, handleChange, handleSubmit, isSubmitting: updateMutation.isPending };
};

// 3. UI Layer - Componentes de apresentação
// components/UserInfo.tsx
interface UserInfoProps {
  user: User;
  onEditPress: () => void;
}

export const UserInfo: FC<UserInfoProps> = ({ user, onEditPress }) => (
  <View style={styles.container}>
    <Text style={styles.name}>{user.name}</Text>
    <Text style={styles.email}>{user.email}</Text>
    <Button title="Edit" onPress={onEditPress} />
  </View>
);

// components/UserEditForm.tsx
interface UserEditFormProps {
  user: User;
  onSubmit: (data: User) => void;
  onCancel: () => void;
}

export const UserEditForm: FC<UserEditFormProps> = ({ user, onSubmit, onCancel }) => {
  const { formData, handleChange, handleSubmit, isSubmitting } = useUserForm(user);

  return (
    <View style={styles.form}>
      <TextInput
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="Name"
      />
      <TextInput
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        placeholder="Email"
      />
      <View style={styles.actions}>
        <Button title="Cancel" onPress={onCancel} />
        <Button
          title="Save"
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
};

// 4. Container - Monta tudo
// screens/UserProfileScreen.tsx
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage message="User not found" />;

  return (
    <View style={styles.container}>
      {editing ? (
        <UserEditForm
          user={user}
          onSubmit={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <UserInfo user={user} onEditPress={() => setEditing(true)} />
      )}
    </View>
  );
}
```

### Benefícios

- **Testabilidade**: Cada parte testável independentemente
- **Reusabilidade**: Componentes e hooks reutilizáveis
- **Manutenibilidade**: Alterações isoladas
- **Legibilidade**: Código claro e focado

---

## O - Open/Closed Principle (OCP)

### Princípio

> "As entidades devem estar abertas para extensão, mas fechadas para modificação"

Deve ser possível estender o comportamento sem modificar o código existente.

### Aplicação em React Native

#### ❌ RUIM: Modificação do componente para cada variante

```typescript
// Button.tsx - Requer modificação para cada nova variante
export const Button = ({ variant, onPress, children }: ButtonProps) => {
  let backgroundColor = '#007AFF';
  let textColor = '#FFFFFF';

  if (variant === 'secondary') {
    backgroundColor = '#5856D6';
    textColor = '#FFFFFF';
  } else if (variant === 'danger') {
    backgroundColor = '#FF3B30';
    textColor = '#FFFFFF';
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = '#007AFF';
  }
  // Adicionar uma nova variante = modificar este código ❌

  return (
    <Pressable
      style={{ backgroundColor, borderColor: textColor }}
      onPress={onPress}
    >
      <Text style={{ color: textColor }}>{children}</Text>
    </Pressable>
  );
};
```

#### ✅ BOM: Extensão via composição e configuração

```typescript
// 1. Base Button - fechado para modificação
// components/ui/Button/Button.tsx
interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  onPress,
  children,
  style,
  textStyle,
  disabled,
}) => {
  return (
    <Pressable
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </Pressable>
  );
};

// 2. Variantes via composição - aberto para extensão
// components/ui/Button/Button.variants.tsx
export const PrimaryButton: FC<Omit<ButtonProps, 'style' | 'textStyle'>> = (props) => (
  <Button
    {...props}
    style={variantStyles.primary}
    textStyle={variantStyles.primaryText}
  />
);

export const SecondaryButton: FC<Omit<ButtonProps, 'style' | 'textStyle'>> = (props) => (
  <Button
    {...props}
    style={variantStyles.secondary}
    textStyle={variantStyles.secondaryText}
  />
);

export const DangerButton: FC<Omit<ButtonProps, 'style' | 'textStyle'>> = (props) => (
  <Button
    {...props}
    style={variantStyles.danger}
    textStyle={variantStyles.dangerText}
  />
);

// 3. Nova variante = novo componente, sem modificação ✅
export const SuccessButton: FC<Omit<ButtonProps, 'style' | 'textStyle'>> = (props) => (
  <Button
    {...props}
    style={variantStyles.success}
    textStyle={variantStyles.successText}
  />
);

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  dangerText: {
    color: theme.colors.white,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  successText: {
    color: theme.colors.white,
  },
});

// Uso
<PrimaryButton onPress={handlePrimary}>Primary</PrimaryButton>
<SecondaryButton onPress={handleSecondary}>Secondary</SecondaryButton>
<DangerButton onPress={handleDelete}>Delete</DangerButton>
<SuccessButton onPress={handleSuccess}>Success</SuccessButton>
```

#### Exemplo: Abstração de Storage

```typescript
// 1. Interface - fechada para modificação
// services/storage/storage.interface.ts
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// 2. Implementações - abertas para extensão
// services/storage/mmkv.storage.ts
export class MMKVStorage implements IStorage {
  private storage = new MMKV();

  async getItem(key: string): Promise<string | null> {
    return this.storage.getString(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clearAll();
  }
}

// services/storage/async.storage.ts
export class AsyncStorageAdapter implements IStorage {
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}

// 3. Nova implementação sem modificar o existente ✅
// services/storage/secure.storage.ts
export class SecureStorageAdapter implements IStorage {
  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  async clear(): Promise<void> {
    // SecureStore não tem clear, é preciso rastrear as chaves
    // Implementação...
  }
}

// Uso - intercambiável
const storage: IStorage = new MMKVStorage();
// ou
const storage: IStorage = new AsyncStorageAdapter();
// ou
const storage: IStorage = new SecureStorageAdapter();
```

---

## L - Liskov Substitution Principle (LSP)

### Princípio

> "Os objetos de uma classe derivada devem poder substituir os objetos da classe base sem alterar o funcionamento do programa"

### Aplicação em React Native

#### ❌ RUIM: Violação do princípio

```typescript
// Interface base
interface IButton {
  onPress: () => void;
  children: React.ReactNode;
}

// Implementação que viola o contrato
export const IconButton: FC<IButton> = ({ onPress }) => {
  // ❌ Ignora children, viola o contrato IButton
  return (
    <Pressable onPress={onPress}>
      <Icon name="star" />
    </Pressable>
  );
};

// Uso - comportamento inesperado
const renderButton = (Button: FC<IButton>) => {
  return <Button onPress={handlePress}>Click me</Button>; // ❌ "Click me" ignorado por IconButton
};
```

#### ✅ BOM: Respeito ao contrato

```typescript
// 1. Interface clara
interface BaseButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

// 2. Implementações respeitando o contrato
interface TextButtonProps extends BaseButtonProps {
  children: React.ReactNode;
}

export const TextButton: FC<TextButtonProps> = ({ onPress, children, disabled }) => (
  <Pressable onPress={onPress} disabled={disabled}>
    <Text>{children}</Text>
  </Pressable>
);

interface IconButtonProps extends BaseButtonProps {
  icon: string;
  label?: string; // Opcional, não children
}

export const IconButton: FC<IconButtonProps> = ({ onPress, icon, label, disabled }) => (
  <Pressable onPress={onPress} disabled={disabled}>
    <Icon name={icon} />
    {label && <Text>{label}</Text>}
  </Pressable>
);

// 3. Uso type-safe
const handlePress = () => console.log('Pressed');

// ✅ Cada componente usado de acordo com seu contrato
<TextButton onPress={handlePress}>Click me</TextButton>
<IconButton onPress={handlePress} icon="star" label="Favorite" />
```

#### Exemplo: Componentes de Lista

```typescript
// Interface base para listas
interface IList<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  onEndReached?: () => void;
}

// Implementação FlatList
export const VirtualizedList = <T,>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
}: IList<T>) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => renderItem(item)}
      keyExtractor={(item) => keyExtractor(item)}
      onEndReached={onEndReached}
    />
  );
};

// Implementação ScrollView (para listas pequenas)
export const SimpleList = <T,>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
}: IList<T>) => {
  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isEndReached =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isEndReached && onEndReached) {
      onEndReached();
    }
  };

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={400}>
      {data.map((item) => (
        <View key={keyExtractor(item)}>{renderItem(item)}</View>
      ))}
    </ScrollView>
  );
};

// ✅ Intercambiáveis pois respeitam o contrato
const renderUserList = <T,>(ListComponent: FC<IList<T>>) => (
  <ListComponent
    data={users}
    renderItem={(user) => <UserCard user={user} />}
    keyExtractor={(user) => user.id}
    onEndReached={loadMore}
  />
);
```

---

## I - Interface Segregation Principle (ISP)

### Princípio

> "Os clientes não devem depender de interfaces que não utilizam"

É melhor ter várias interfaces específicas do que uma interface genérica grande.

### Aplicação em React Native

#### ❌ RUIM: Interface "fat" com props inúteis

```typescript
// Interface muito ampla
interface ArticleCardProps {
  article: Article;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
  onComment?: () => void;
  showAuthor?: boolean;
  showDate?: boolean;
  showTags?: boolean;
  showStats?: boolean;
  compact?: boolean;
  // ... ainda mais props
}

// Componente forçado a aceitar todos os props
export const ArticleCard: FC<ArticleCardProps> = ({
  article,
  onPress,
  onEdit,
  onDelete, // ❌ Não usado neste contexto
  onShare, // ❌ Não usado neste contexto
  onFavorite,
  onComment, // ❌ Não usado neste contexto
  showAuthor,
  showDate,
  showTags,
  showStats, // ❌ Não usado neste contexto
  compact,
}) => {
  // Implementação que não usa todos os props
};
```

#### ✅ BOM: Interfaces segregadas

```typescript
// 1. Interface base
interface BaseArticleCardProps {
  article: Article;
}

// 2. Interfaces específicas componíveis
interface InteractiveArticleCardProps extends BaseArticleCardProps {
  onPress: () => void;
}

interface FavoriteArticleCardProps extends BaseArticleCardProps {
  onFavorite: () => void;
  isFavorited: boolean;
}

interface AdminArticleCardProps extends BaseArticleCardProps {
  onEdit: () => void;
  onDelete: () => void;
}

interface DisplayOptionsProps {
  showAuthor?: boolean;
  showDate?: boolean;
  showTags?: boolean;
}

// 3. Componentes específicos com apenas os props necessários
export const SimpleArticleCard: FC<BaseArticleCardProps> = ({ article }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{article.title}</Text>
    <Text style={styles.excerpt}>{article.excerpt}</Text>
  </View>
);

export const InteractiveArticleCard: FC<
  InteractiveArticleCardProps & DisplayOptionsProps
> = ({ article, onPress, showAuthor, showDate, showTags }) => (
  <Pressable onPress={onPress} style={styles.card}>
    <Text style={styles.title}>{article.title}</Text>
    <Text style={styles.excerpt}>{article.excerpt}</Text>
    {showAuthor && <Text style={styles.author}>{article.author}</Text>}
    {showDate && <Text style={styles.date}>{article.date}</Text>}
    {showTags && <Tags tags={article.tags} />}
  </Pressable>
);

export const FavoriteArticleCard: FC<FavoriteArticleCardProps> = ({
  article,
  onFavorite,
  isFavorited,
}) => (
  <View style={styles.card}>
    <Text style={styles.title}>{article.title}</Text>
    <Pressable onPress={onFavorite}>
      <Icon name={isFavorited ? 'heart-filled' : 'heart-outline'} />
    </Pressable>
  </View>
);

export const AdminArticleCard: FC<AdminArticleCardProps> = ({
  article,
  onEdit,
  onDelete,
}) => (
  <View style={styles.card}>
    <Text style={styles.title}>{article.title}</Text>
    <View style={styles.actions}>
      <Button title="Edit" onPress={onEdit} />
      <Button title="Delete" onPress={onDelete} />
    </View>
  </View>
);

// Uso - cada contexto usa o componente apropriado
// Lista simples
<SimpleArticleCard article={article} />

// Lista interativa
<InteractiveArticleCard
  article={article}
  onPress={() => navigate(article.id)}
  showAuthor
  showDate
/>

// Seção de favoritos
<FavoriteArticleCard
  article={article}
  onFavorite={handleFavorite}
  isFavorited={isFavorited}
/>

// Painel admin
<AdminArticleCard
  article={article}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### Exemplo: Componentes de Formulário

```typescript
// Interfaces segregadas para formulários
interface BaseFormFieldProps {
  name: string;
  label: string;
}

interface ValidationProps {
  required?: boolean;
  validate?: (value: any) => string | undefined;
  errorMessage?: string;
}

interface TextInputFieldProps extends BaseFormFieldProps, ValidationProps {
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

interface SelectFieldProps extends BaseFormFieldProps, ValidationProps {
  options: Array<{ label: string; value: string }>;
}

interface DateFieldProps extends BaseFormFieldProps, ValidationProps {
  minimumDate?: Date;
  maximumDate?: Date;
}

// Componentes usando apenas os props necessários
export const TextInputField: FC<TextInputFieldProps> = ({
  name,
  label,
  placeholder,
  required,
  validate,
  secureTextEntry,
  keyboardType,
}) => {
  // Implementação
};

export const SelectField: FC<SelectFieldProps> = ({
  name,
  label,
  options,
  required,
  validate,
}) => {
  // Implementação
};

export const DateField: FC<DateFieldProps> = ({
  name,
  label,
  minimumDate,
  maximumDate,
  required,
  validate,
}) => {
  // Implementação
};
```

---

## D - Dependency Inversion Principle (DIP)

### Princípio

> "Os módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."

### Aplicação em React Native

#### ❌ RUIM: Dependência direta às implementações

```typescript
// Screen depende diretamente da implementação concreta
export default function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // ❌ Dependência direta à API
    const fetchArticles = async () => {
      const response = await fetch('https://api.example.com/articles');
      const data = await response.json();
      setArticles(data);
    };
    fetchArticles();
  }, []);

  // ❌ Dependência direta ao storage
  const handleFavorite = async (articleId: string) => {
    const favorites = await AsyncStorage.getItem('favorites');
    const favoritesArray = favorites ? JSON.parse(favorites) : [];
    favoritesArray.push(articleId);
    await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
  };

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => (
        <ArticleCard article={item} onFavorite={() => handleFavorite(item.id)} />
      )}
    />
  );
}
```

#### ✅ BOM: Dependência às abstrações

```typescript
// 1. Abstrações (interfaces)
// services/articles/articles.repository.interface.ts
export interface IArticlesRepository {
  getAll(): Promise<Article[]>;
  getById(id: string): Promise<Article>;
  create(article: CreateArticleDTO): Promise<Article>;
  update(id: string, article: UpdateArticleDTO): Promise<Article>;
  delete(id: string): Promise<void>;
}

// services/storage/storage.interface.ts
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// 2. Implementações concretas
// services/articles/articles.repository.ts
export class ArticlesRepository implements IArticlesRepository {
  constructor(private apiClient: AxiosInstance) {}

  async getAll(): Promise<Article[]> {
    const { data } = await this.apiClient.get('/articles');
    return data;
  }

  async getById(id: string): Promise<Article> {
    const { data } = await this.apiClient.get(`/articles/${id}`);
    return data;
  }

  // ... outros métodos
}

// services/storage/mmkv.storage.ts
export class MMKVStorage implements IStorage {
  private storage = new MMKV();

  async getItem(key: string): Promise<string | null> {
    return this.storage.getString(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

// 3. Service layer usando as abstrações
// services/favorites/favorites.service.ts
export class FavoritesService {
  constructor(
    private storage: IStorage,
    private repository: IArticlesRepository
  ) {}

  async getFavorites(): Promise<Article[]> {
    const favoritesJson = await this.storage.getItem('favorites');
    const favoriteIds: string[] = favoritesJson ? JSON.parse(favoritesJson) : [];

    const articles = await Promise.all(
      favoriteIds.map((id) => this.repository.getById(id))
    );

    return articles;
  }

  async addFavorite(articleId: string): Promise<void> {
    const favoritesJson = await this.storage.getItem('favorites');
    const favorites: string[] = favoritesJson ? JSON.parse(favoritesJson) : [];

    if (!favorites.includes(articleId)) {
      favorites.push(articleId);
      await this.storage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  async removeFavorite(articleId: string): Promise<void> {
    const favoritesJson = await this.storage.getItem('favorites');
    const favorites: string[] = favoritesJson ? JSON.parse(favoritesJson) : [];

    const filtered = favorites.filter((id) => id !== articleId);
    await this.storage.setItem('favorites', JSON.stringify(filtered));
  }
}

// 4. Dependency Injection
// config/dependencies.ts
import { apiClient } from '@/services/api/client';
import { ArticlesRepository } from '@/services/articles/articles.repository';
import { MMKVStorage } from '@/services/storage/mmkv.storage';
import { FavoritesService } from '@/services/favorites/favorites.service';

// Criar instâncias com dependências injetadas
export const articlesRepository = new ArticlesRepository(apiClient);
export const storage = new MMKVStorage();
export const favoritesService = new FavoritesService(storage, articlesRepository);

// 5. Hooks abstraem os serviços
// hooks/useArticles.ts
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesRepository.getAll(),
  });
};

// hooks/useFavorites.ts
export const useFavorites = () => {
  const queryClient = useQueryClient();

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
  });

  const addFavorite = useMutation({
    mutationFn: (articleId: string) => favoritesService.addFavorite(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: (articleId: string) => favoritesService.removeFavorite(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    favorites,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
  };
};

// 6. Screen depende das abstrações (hooks)
export default function ArticlesScreen() {
  const { data: articles, isLoading } = useArticles();
  const { addFavorite } = useFavorites();

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => (
        <ArticleCard
          article={item}
          onFavorite={() => addFavorite(item.id)}
        />
      )}
    />
  );
}
```

### Benefícios do DIP

1. **Testabilidade**: Injeção de mocks fácil
2. **Flexibilidade**: Mudança de implementação sem impacto
3. **Desacoplamento**: Componentes independentes dos detalhes de implementação

```typescript
// Testes com mocks
describe('FavoritesService', () => {
  it('should add favorite', async () => {
    // Mock dependencies
    const mockStorage: IStorage = {
      getItem: jest.fn().mockResolvedValue('[]'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    const mockRepository: IArticlesRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Injetar mocks
    const service = new FavoritesService(mockStorage, mockRepository);

    // Testar
    await service.addFavorite('123');

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'favorites',
      JSON.stringify(['123'])
    );
  });
});
```

---

## Resumo SOLID

| Princípio | Definição | Benefício Principal |
|----------|-----------|-------------------|
| **SRP** | Uma única responsabilidade | Manutenibilidade |
| **OCP** | Aberto/Fechado | Extensibilidade |
| **LSP** | Substituição | Confiabilidade |
| **ISP** | Interfaces segregadas | Simplicidade |
| **DIP** | Inversão de dependências | Testabilidade |

---

## Checklist SOLID

- [ ] Cada componente/função tem UMA responsabilidade
- [ ] Extensão possível sem modificação
- [ ] Os subtipos respeitam os contratos
- [ ] Sem props/métodos não utilizados
- [ ] Dependências via interfaces/abstrações
- [ ] Injeção de dependências utilizada
- [ ] Código testável com mocks
- [ ] Separação clara das camadas

---

**SOLID não é uma restrição, é um guia para código de qualidade.**
