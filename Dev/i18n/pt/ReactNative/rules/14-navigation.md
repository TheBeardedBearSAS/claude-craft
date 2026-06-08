# Navegação - Expo Router

## Introdução

Expo Router é o sistema de navegação recomendado para Expo, baseado em roteamento de arquivos (como Next.js).

---

## Instalação & Setup

### Instalação

```bash
npx create-expo-app my-app --template blank-typescript
cd my-app
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

### Configuração

```json
// package.json
{
  "main": "expo-router/entry"
}
```

```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "plugins": ["expo-router"]
  }
}
```

---

## Roteamento Baseado em Arquivos

### Estrutura Básica

```
app/
├── _layout.tsx              # Layout raiz
├── index.tsx                # Tela inicial (/)
├── about.tsx                # Tela sobre (/about)
├── profile.tsx              # Tela perfil (/profile)
└── article/
    └── [id].tsx            # Rota dinâmica (/article/123)
```

### Layout Raiz

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </QueryProvider>
  );
}
```

---

## Grupos de Rotas

### Navegação por Tabs

```
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx          # Layout dos tabs
    ├── index.tsx            # Tab inicial
    ├── explore.tsx          # Tab explorar
    └── profile.tsx          # Tab perfil
```

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Grupo de Autenticação

```
app/
├── _layout.tsx
├── (tabs)/
└── (auth)/
    ├── _layout.tsx          # Layout de autenticação
    ├── login.tsx            # /login
    └── register.tsx         # /register
```

```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen
        name="login"
        options={{ title: 'Entrar' }}
      />
      <Stack.Screen
        name="register"
        options={{ title: 'Cadastrar' }}
      />
    </Stack>
  );
}
```

---

## Rotas Dinâmicas

### Parâmetro Único

```typescript
// app/article/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: article } = useArticle(id);

  return (
    <View>
      <Text>{article?.title}</Text>
    </View>
  );
}

// Navegar: router.push('/article/123')
// URL: /article/123
```

### Múltiplos Parâmetros

```typescript
// app/user/[userId]/post/[postId].tsx
import { useLocalSearchParams } from 'expo-router';

export default function PostScreen() {
  const { userId, postId } = useLocalSearchParams<{
    userId: string;
    postId: string;
  }>();

  return <Text>Usuário {userId}, Post {postId}</Text>;
}

// Navegar: router.push('/user/42/post/100')
// URL: /user/42/post/100
```

### Rotas Catch-all

```typescript
// app/blog/[...slug].tsx
import { useLocalSearchParams } from 'expo-router';

export default function BlogScreen() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();

  // slug = ['2024', '01', 'meu-artigo']
  const path = slug.join('/');

  return <Text>{path}</Text>;
}

// Navegar: router.push('/blog/2024/01/meu-artigo')
// URL: /blog/2024/01/meu-artigo
```

---

## API de Navegação

### Navegação Programática

```typescript
import { router } from 'expo-router';

// Push (adicionar à pilha)
router.push('/article/123');

// Replace (substituir tela atual)
router.replace('/login');

// Voltar
router.back();

// Pode voltar?
if (router.canGoBack()) {
  router.back();
} else {
  router.replace('/');
}

// Navegar com parâmetros
router.push({
  pathname: '/article/[id]',
  params: { id: '123', source: 'home' },
});

// Query params
router.push('/search?q=react&category=tech');
```

### Hook useRouter

```typescript
import { useRouter } from 'expo-router';

const MyComponent = () => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/profile');
  };

  return <Button onPress={handleNavigate}>Perfil</Button>;
};
```

### Hook useNavigation

```typescript
import { useNavigation } from 'expo-router';

const MyComponent = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Título Personalizado',
      headerRight: () => <Button title="Salvar" />,
    });
  }, [navigation]);

  return <View />;
};
```

---

## Deep Linking

### Configuração

```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.myapp",
      "associatedDomains": ["applinks:myapp.com"]
    },
    "android": {
      "package": "com.myapp",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "myapp.com"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Manipulação de Deep Links

```typescript
// app/article/[id].tsx
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const globalParams = useGlobalSearchParams();

  // Ambos funcionam:
  // myapp://article/123
  // https://myapp.com/article/123

  return <Text>Artigo {params.id}</Text>;
}
```

---

## Telas Modais

```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen
    name="modal"
    options={{
      presentation: 'modal',
      animation: 'slide_from_bottom',
      headerShown: true,
      headerTitle: 'Modal',
    }}
  />
</Stack>

// app/modal.tsx
export default function ModalScreen() {
  return (
    <View>
      <Text>Sou um modal</Text>
      <Button onPress={() => router.back()}>Fechar</Button>
    </View>
  );
}

// Abrir modal
router.push('/modal');
```

---

## Rotas Protegidas

```typescript
// app/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Ou proteção por tela
// app/profile.tsx
export default function ProfileScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <View>{/* Conteúdo do perfil */}</View>;
}
```

---

## Navegação Type-safe

```typescript
// types/navigation.types.ts
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'article/[id]': { id: string };
  'user/[userId]/post/[postId]': { userId: string; postId: string };
  modal: { title: string };
};

// Uso
import { router } from 'expo-router';
import type { RootStackParamList } from '@/types/navigation.types';

// Navegação type-safe
const navigateToArticle = (id: string) => {
  router.push({
    pathname: '/article/[id]' as keyof RootStackParamList,
    params: { id },
  });
};
```

---

## Padrões de Navegação

### 1. Tabs com Stack

```
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── home/
    │   ├── _layout.tsx
    │   ├── index.tsx        # Lista home
    │   └── [id].tsx         # Detalhe home
    └── profile/
        ├── _layout.tsx
        ├── index.tsx        # Perfil
        └── settings.tsx     # Configurações
```

### 2. Navegação por Drawer

```typescript
// Usar expo-router com drawer do react-navigation
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="home" options={{ title: 'Início' }} />
      <Drawer.Screen name="settings" options={{ title: 'Configurações' }} />
    </Drawer>
  );
}
```

### 3. Fluxo de Onboarding

```
app/
├── _layout.tsx
└── (onboarding)/
    ├── _layout.tsx
    ├── step1.tsx
    ├── step2.tsx
    └── step3.tsx
```

---

## Opções de Tela

```typescript
// Opções por tela
export default function ArticleScreen() {
  return <View />;
}

// Exportar opções
export const options = {
  title: 'Artigo',
  headerShown: true,
  headerRight: () => <ShareButton />,
  headerBackTitle: 'Voltar',
};

// Ou usar useNavigation
const ArticleScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Título Dinâmico',
      headerStyle: { backgroundColor: '#007AFF' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  return <View />;
};
```

---

## Melhores Práticas

### 1. Organizar por Feature

```
app/
├── (tabs)/
│   ├── home/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── articles/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   └── profile/
│       ├── index.tsx
│       └── settings.tsx
```

### 2. Usar Grupos de Rotas

```
app/
├── (public)/        # Rotas públicas
├── (protected)/     # Rotas protegidas
└── (modal)/         # Telas modais
```

### 3. Tipar Todos os Parâmetros

```typescript
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## React Navigation 7 (bare RN)

> Esta seção cobre projetos **sem Expo Router**: bare React Native (RN CLI) ou projetos Expo que optaram por navegação manual. O Expo Router continua recomendado para novos projetos Expo. React Navigation 7 é a biblioteca padrão para navegação bare RN.

### Instalação (bare RN)

```bash
# Dependências core
npm install @react-navigation/native react-native-screens react-native-safe-area-context

# Navegadores
npm install @react-navigation/native-stack          # Stack nativo (recomendado)
npm install @react-navigation/bottom-tabs           # Bottom tabs
npm install @react-navigation/drawer                # Drawer
npm install react-native-gesture-handler react-native-reanimated  # requerido pelo Drawer

# iOS
cd ios && pod install
```

### Stack Navigator (nativo)

```typescript
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Detail: { id: string; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Navegar a partir de uma tela

```typescript
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View>
      <Button
        title="Ver detalhe"
        onPress={() =>
          navigation.navigate('Detail', { id: '42', title: 'Meu artigo' })
        }
      />
    </View>
  );
}
```

### Bottom Tab Navigator

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'home', Search: 'search', Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

### Drawer Navigator

```typescript
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Drawer = createDrawerNavigator();

export function DrawerNavigator() {
  return (
    // GestureHandlerRootView é obrigatório para o Drawer
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
        <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      </Drawer.Navigator>
    </GestureHandlerRootView>
  );
}
```

### Stack + Tabs aninhadas (padrão comum)

```typescript
const RootStack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={TabNavigator} />
        <RootStack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ headerShown: true, presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

### Novidades do React Navigation 7

| Feature | Descrição |
|---------|-----------|
| **Static API** | Configuração declarativa de navegadores (alternativa aos JSX navigators) |
| **TypeScript aprimorado** | Inferência automática de tipos com `createStaticNavigation` |
| **Native Bottom Tabs** | Wrapping nativo TabView/BottomNavigationView (menos bridge overhead) |
| **Hooks simplificados** | `useNavigation`, `useRoute`, `useFocusEffect` — API estável e leve |

---

## Checklist Navegação

- [ ] Expo Router configurado (projetos Expo)
- [ ] React Navigation 7 instalado (projetos bare RN)
- [ ] Roteamento baseado em arquivos utilizado (Expo Router)
- [ ] Grupos de rotas organizados
- [ ] Deep linking configurado
- [ ] Rotas protegidas implementadas
- [ ] Tipos de navegação definidos (`RootStackParamList`)
- [ ] Telas modais configuradas
- [ ] Navegação por tabs
- [ ] Navegação de volta gerenciada
- [ ] `GestureHandlerRootView` no root se Drawer for usado

---

**Expo Router: Simples, poderoso, type-safe.**
