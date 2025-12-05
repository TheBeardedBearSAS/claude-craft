# Comando: Gerar Screen

Gere uma nova screen React Native com Expo Router seguindo as melhores práticas e padrões do projeto.

---

## Uso

```bash
npx generate-screen <nome-da-screen> [opções]
```

**Opções:**
- `--type`: tipo de screen (stack, tab, modal)
- `--feature`: feature a qual pertence
- `--with-test`: gerar arquivo de teste
- `--with-form`: incluir componentes de formulário

**Exemplos:**

```bash
# Screen simples
npx generate-screen UserProfile

# Screen em feature específica
npx generate-screen CreatePost --feature=posts

# Screen com teste
npx generate-screen Settings --with-test

# Modal screen
npx generate-screen ShareModal --type=modal
```

---

## Templates Gerados

### 1. Screen Básica

**app/user-profile.tsx:**

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>User Profile</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
```

### 2. Screen com Data Fetching

**app/article/[id].tsx:**

```typescript
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useArticle } from '@/features/articles/hooks/useArticle';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: article, isLoading, error } = useArticle(id);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro ao carregar artigo</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.body}>{article.content}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#f00',
  },
});
```

### 3. Screen com Formulário

**app/create-post.tsx:**

```typescript
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCreatePost } from '@/features/posts/hooks/useCreatePost';
import { PostForm } from '@/features/posts/components/PostForm';
import type { CreatePostDTO } from '@/features/posts/types/Post.types';

export default function CreatePostScreen() {
  const { mutate: createPost, isPending } = useCreatePost();

  const handleSubmit = (data: CreatePostDTO) => {
    createPost(data, {
      onSuccess: (post) => {
        router.push(`/post/${post.id}`);
      },
      onError: (error) => {
        Alert.alert('Erro', 'Não foi possível criar o post');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Criar Novo Post</Text>
          <PostForm
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});
```

### 4. Modal Screen

**app/modal.tsx:**

```typescript
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Text style={styles.title}>Modal</Text>

        <Pressable
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Fechar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 5. List Screen

**app/users.tsx:**

```typescript
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUsers } from '@/features/users/hooks/useUsers';
import { UserCard } from '@/features/users/components/UserCard';
import type { User } from '@/features/users/types/User.types';

export default function UsersScreen() {
  const { data: users, isLoading, error, refetch } = useUsers();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro ao carregar usuários</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item: User) => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#f00',
  },
});
```

---

## Arquivo de Teste

**app/user-profile.test.tsx:**

```typescript
import { render, screen } from '@testing-library/react-native';
import UserProfileScreen from './user-profile';

describe('UserProfileScreen', () => {
  it('should render correctly', () => {
    render(<UserProfileScreen />);
    expect(screen.getByText('User Profile')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(<UserProfileScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
```

---

## Melhores Práticas

### 1. Naming
- Arquivos: kebab-case (user-profile.tsx)
- Componentes: PascalCase (UserProfileScreen)
- Rotas dinâmicas: [param].tsx

### 2. Estrutura
- SafeAreaView para gerenciar safe areas
- ScrollView para conteúdo que pode rolar
- FlatList para listas longas
- StatusBar configurada apropriadamente

### 3. Estados
- Loading state
- Error state
- Empty state
- Success state

### 4. Navegação
- useLocalSearchParams para parâmetros de rota
- router.push para navegação
- router.back para voltar

### 5. Tipagem
- Todas as props tipadas
- Parâmetros de rota tipados
- Data fetching tipado

---

## Checklist

- [ ] Screen criada na estrutura de app/
- [ ] SafeAreaView implementada
- [ ] Estados de loading/error tratados
- [ ] Tipagem TypeScript completa
- [ ] Estilos com StyleSheet.create
- [ ] Navegação implementada
- [ ] Teste criado
- [ ] Documentação adicionada

---

**Screens bem estruturadas são a base de uma boa UX. Siga os padrões consistentemente.**
