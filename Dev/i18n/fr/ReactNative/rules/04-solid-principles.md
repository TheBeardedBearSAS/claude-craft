# Principes SOLID en React Native

## Introduction

Les principes SOLID sont essentiels pour créer des applications React Native maintenables, testables et évolutives. Ce document adapte ces principes au contexte React Native avec TypeScript.

---

## S - Single Responsibility Principle (SRP)

### Principe

> "Une classe/fonction/composant ne devrait avoir qu'une seule raison de changer"

Chaque entité doit avoir une seule responsabilité bien définie.

### Application en React Native

#### ❌ MAUVAIS: Composant avec multiples responsabilités

```typescript
// UserProfile.tsx - Fait TROP de choses
export const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Responsabilité 1: Data fetching
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

  // Responsabilité 2: Form handling
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Responsabilité 3: Form submission
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

  // Responsabilité 4: UI rendering
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

#### ✅ BON: Séparation des responsabilités

```typescript
// 1. Data Layer - Hook pour data fetching
// hooks/useUser.ts
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
  });
};

// 2. Logic Layer - Hook pour form logic
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

// 3. UI Layer - Composants de présentation
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

// 4. Container - Assemble tout
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

### Bénéfices

- **Testabilité**: Chaque partie testable indépendamment
- **Réutilisabilité**: Composants et hooks réutilisables
- **Maintenabilité**: Changements isolés
- **Lisibilité**: Code clair et focalisé

---

## O - Open/Closed Principle (OCP)

### Principe

> "Les entités doivent être ouvertes à l'extension mais fermées à la modification"

On doit pouvoir étendre le comportement sans modifier le code existant.

### Application en React Native

#### ❌ MAUVAIS: Modification du composant pour chaque variant

```typescript
// Button.tsx - Nécessite modification pour chaque nouveau variant
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
  // Ajouter un nouveau variant = modifier ce code ❌

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

#### ✅ BON: Extension via composition et configuration

```typescript
// 1. Base Button - fermé à la modification
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

// 2. Variants via composition - ouvert à l'extension
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

// 3. Nouveau variant = nouveau composant, pas de modification ✅
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

// Usage
<PrimaryButton onPress={handlePrimary}>Primary</PrimaryButton>
<SecondaryButton onPress={handleSecondary}>Secondary</SecondaryButton>
<DangerButton onPress={handleDelete}>Delete</DangerButton>
<SuccessButton onPress={handleSuccess}>Success</SuccessButton>
```

#### Exemple: Storage abstraction

```typescript
// 1. Interface - fermée à la modification
// services/storage/storage.interface.ts
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// 2. Implémentations - ouvertes à l'extension
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

// 3. Nouvelle implémentation sans modifier l'existant ✅
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
    // SecureStore n'a pas de clear, on doit tracker les keys
    // Implementation...
  }
}

// Usage - interchangeable
const storage: IStorage = new MMKVStorage();
// ou
const storage: IStorage = new AsyncStorageAdapter();
// ou
const storage: IStorage = new SecureStorageAdapter();
```

---

## L - Liskov Substitution Principle (LSP)

### Principe

> "Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le fonctionnement du programme"

### Application en React Native

#### ❌ MAUVAIS: Violation du principe

```typescript
// Base interface
interface IButton {
  onPress: () => void;
  children: React.ReactNode;
}

// Implementation qui viole le contrat
export const IconButton: FC<IButton> = ({ onPress }) => {
  // ❌ Ignore children, viole le contrat IButton
  return (
    <Pressable onPress={onPress}>
      <Icon name="star" />
    </Pressable>
  );
};

// Usage - comportement inattendu
const renderButton = (Button: FC<IButton>) => {
  return <Button onPress={handlePress}>Click me</Button>; // ❌ "Click me" ignoré par IconButton
};
```

#### ✅ BON: Respect du contrat

```typescript
// 1. Interface claire
interface BaseButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

// 2. Implémentations respectant le contrat
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
  label?: string; // Optionnel, pas children
}

export const IconButton: FC<IconButtonProps> = ({ onPress, icon, label, disabled }) => (
  <Pressable onPress={onPress} disabled={disabled}>
    <Icon name={icon} />
    {label && <Text>{label}</Text>}
  </Pressable>
);

// 3. Usage type-safe
const handlePress = () => console.log('Pressed');

// ✅ Chaque composant utilisé selon son contrat
<TextButton onPress={handlePress}>Click me</TextButton>
<IconButton onPress={handlePress} icon="star" label="Favorite" />
```

#### Exemple: Liste components

```typescript
// Base interface pour lists
interface IList<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  onEndReached?: () => void;
}

// Implementation FlatList
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

// Implementation ScrollView (pour petites listes)
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

// ✅ Interchangeables car respectent le contrat
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

### Principe

> "Les clients ne devraient pas dépendre d'interfaces qu'ils n'utilisent pas"

Mieux vaut plusieurs interfaces spécifiques qu'une grosse interface générique.

### Application en React Native

#### ❌ MAUVAIS: Interface "fat" avec props inutiles

```typescript
// Interface trop large
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
  // ... encore plus de props
}

// Composant forcé d'accepter tous les props
export const ArticleCard: FC<ArticleCardProps> = ({
  article,
  onPress,
  onEdit,
  onDelete, // ❌ Pas utilisé dans ce contexte
  onShare, // ❌ Pas utilisé dans ce contexte
  onFavorite,
  onComment, // ❌ Pas utilisé dans ce contexte
  showAuthor,
  showDate,
  showTags,
  showStats, // ❌ Pas utilisé dans ce contexte
  compact,
}) => {
  // Implementation qui n'utilise pas tous les props
};
```

#### ✅ BON: Interfaces ségrégées

```typescript
// 1. Interface de base
interface BaseArticleCardProps {
  article: Article;
}

// 2. Interfaces spécifiques composables
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

// 3. Composants spécifiques avec uniquement les props nécessaires
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

// Usage - chaque contexte utilise le composant approprié
// Liste simple
<SimpleArticleCard article={article} />

// Liste interactive
<InteractiveArticleCard
  article={article}
  onPress={() => navigate(article.id)}
  showAuthor
  showDate
/>

// Section favoris
<FavoriteArticleCard
  article={article}
  onFavorite={handleFavorite}
  isFavorited={isFavorited}
/>

// Admin panel
<AdminArticleCard
  article={article}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### Exemple: Form components

```typescript
// Interfaces ségrégées pour forms
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

// Composants utilisant uniquement les props nécessaires
export const TextInputField: FC<TextInputFieldProps> = ({
  name,
  label,
  placeholder,
  required,
  validate,
  secureTextEntry,
  keyboardType,
}) => {
  // Implementation
};

export const SelectField: FC<SelectFieldProps> = ({
  name,
  label,
  options,
  required,
  validate,
}) => {
  // Implementation
};

export const DateField: FC<DateFieldProps> = ({
  name,
  label,
  minimumDate,
  maximumDate,
  required,
  validate,
}) => {
  // Implementation
};
```

---

## D - Dependency Inversion Principle (DIP)

### Principe

> "Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions."

### Application en React Native

#### ❌ MAUVAIS: Dépendance directe aux implémentations

```typescript
// Screen dépend directement de l'implémentation concrète
export default function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // ❌ Dépendance directe à l'API
    const fetchArticles = async () => {
      const response = await fetch('https://api.example.com/articles');
      const data = await response.json();
      setArticles(data);
    };
    fetchArticles();
  }, []);

  // ❌ Dépendance directe au storage
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

#### ✅ BON: Dépendance aux abstractions

```typescript
// 1. Abstractions (interfaces)
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

// 2. Implémentations concrètes
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

  // ... autres méthodes
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

// 3. Service layer utilisant les abstractions
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

// Create instances with injected dependencies
export const articlesRepository = new ArticlesRepository(apiClient);
export const storage = new MMKVStorage();
export const favoritesService = new FavoritesService(storage, articlesRepository);

// 5. Hooks abstraient les services
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

// 6. Screen dépend des abstractions (hooks)
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

### Bénéfices de DIP

1. **Testabilité**: Injection de mocks facile
2. **Flexibilité**: Changement d'implémentation sans impact
3. **Découplage**: Composants indépendants des détails d'implémentation

```typescript
// Tests avec mocks
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

    // Inject mocks
    const service = new FavoritesService(mockStorage, mockRepository);

    // Test
    await service.addFavorite('123');

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'favorites',
      JSON.stringify(['123'])
    );
  });
});
```

---

## Résumé SOLID

| Principe | Définition | Bénéfice Principal |
|----------|-----------|-------------------|
| **SRP** | Une seule responsabilité | Maintenabilité |
| **OCP** | Ouvert/Fermé | Extensibilité |
| **LSP** | Substitution | Fiabilité |
| **ISP** | Interfaces ségrégées | Simplicité |
| **DIP** | Inversion de dépendances | Testabilité |

---

## Checklist SOLID

- [ ] Chaque composant/fonction a UNE responsabilité
- [ ] Extension possible sans modification
- [ ] Les sous-types respectent les contrats
- [ ] Pas de props/méthodes inutilisées
- [ ] Dépendances via interfaces/abstractions
- [ ] Injection de dépendances utilisée
- [ ] Code testable avec mocks
- [ ] Séparation claire des layers

---

**SOLID n'est pas une contrainte, c'est une guide vers un code de qualité.**
