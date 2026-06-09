# Navegación - Expo Router

## Introducción

Expo Router es el sistema de navegación recomendado para Expo, basado en el enrutamiento por archivos (como Next.js).

---

## Instalación y Configuración

### Instalación

```bash
npx create-expo-app my-app --template blank-typescript
cd my-app
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

### Configuración

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

## Enrutamiento Basado en Archivos

### Estructura Básica

```
app/
├── _layout.tsx              # Root layout
├── index.tsx                # Home screen (/)
├── about.tsx                # About screen (/about)
├── profile.tsx              # Profile screen (/profile)
└── article/
    └── [id].tsx            # Dynamic route (/article/123)
```

### Layout Raíz

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

## Grupos de Rutas

### Navegación por Pestañas

```
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx          # Tabs layout
    ├── index.tsx            # Home tab
    ├── explore.tsx          # Explore tab
    └── profile.tsx          # Profile tab
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Grupo de Autenticación

```
app/
├── _layout.tsx
├── (tabs)/
└── (auth)/
    ├── _layout.tsx          # Auth layout
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
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="login"
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="register"
        options={{ title: 'Register' }}
      />
    </Stack>
  );
}
```

---

## Rutas Dinámicas

### Parámetro Único

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

// Navigate: router.push('/article/123')
// URL: /article/123
```

### Múltiples Parámetros

```typescript
// app/user/[userId]/post/[postId].tsx
import { useLocalSearchParams } from 'expo-router';

export default function PostScreen() {
  const { userId, postId } = useLocalSearchParams<{
    userId: string;
    postId: string;
  }>();

  return <Text>User {userId}, Post {postId}</Text>;
}

// Navigate: router.push('/user/42/post/100')
// URL: /user/42/post/100
```

### Rutas Catch-all

```typescript
// app/blog/[...slug].tsx
import { useLocalSearchParams } from 'expo-router';

export default function BlogScreen() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();

  // slug = ['2024', '01', 'my-article']
  const path = slug.join('/');

  return <Text>{path}</Text>;
}

// Navigate: router.push('/blog/2024/01/my-article')
// URL: /blog/2024/01/my-article
```

---

## API de Navegación

### Navegación Programática

```typescript
import { router } from 'expo-router';

// Push (add to stack)
router.push('/article/123');

// Replace (replace current screen)
router.replace('/login');

// Go back
router.back();

// Can go back?
if (router.canGoBack()) {
  router.back();
} else {
  router.replace('/');
}

// Navigate with params
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

  return <Button onPress={handleNavigate}>Profile</Button>;
};
```

### Hook useNavigation

```typescript
import { useNavigation } from 'expo-router';

const MyComponent = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Custom Title',
      headerRight: () => <Button title="Save" />,
    });
  }, [navigation]);

  return <View />;
};
```

---

## Deep Linking

### Configuración

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

### Manejo de Deep Links

```typescript
// app/article/[id].tsx
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const globalParams = useGlobalSearchParams();

  // Both work:
  // myapp://article/123
  // https://myapp.com/article/123

  return <Text>Article {params.id}</Text>;
}
```

---

## Pantallas Modales

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
      <Text>I'm a modal</Text>
      <Button onPress={() => router.back()}>Close</Button>
    </View>
  );
}

// Open modal
router.push('/modal');
```

---

## Rutas Protegidas

```typescript
// app/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Or per-screen protection
// app/profile.tsx
export default function ProfileScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <View>{/* Profile content */}</View>;
}
```

---

## Navegación Type-safe

```typescript
// types/navigation.types.ts
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'article/[id]': { id: string };
  'user/[userId]/post/[postId]': { userId: string; postId: string };
  modal: { title: string };
};

// Usage
import { router } from 'expo-router';
import type { RootStackParamList } from '@/types/navigation.types';

// Type-safe navigation
const navigateToArticle = (id: string) => {
  router.push({
    pathname: '/article/[id]' as keyof RootStackParamList,
    params: { id },
  });
};
```

---

## Patrones de Navegación

### 1. Pestañas Inferiores con Stack

```
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── home/
    │   ├── _layout.tsx
    │   ├── index.tsx        # Home list
    │   └── [id].tsx         # Home detail
    └── profile/
        ├── _layout.tsx
        ├── index.tsx        # Profile
        └── settings.tsx     # Settings
```

### 2. Navegación por Cajón

```typescript
// Use expo-router with react-navigation drawer
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="home" options={{ title: 'Home' }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
    </Drawer>
  );
}
```

### 3. Flujo de Onboarding

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

## Opciones de Pantalla

```typescript
// Per-screen options
export default function ArticleScreen() {
  return <View />;
}

// Export options
export const options = {
  title: 'Article',
  headerShown: true,
  headerRight: () => <ShareButton />,
  headerBackTitle: 'Back',
};

// Or use useNavigation
const ArticleScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Dynamic Title',
      headerStyle: { backgroundColor: '#007AFF' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  return <View />;
};
```

---

## Mejores Prácticas

### 1. Organizar por Funcionalidad

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

### 2. Usar Grupos de Rutas

```
app/
├── (public)/        # Public routes
├── (protected)/     # Protected routes
└── (modal)/         # Modal screens
```

### 3. Tipar Todos los Parámetros

```typescript
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## React Navigation 7 (bare RN)

> Esta sección cubre proyectos **sin Expo Router**: bare React Native (RN CLI), o proyectos Expo que han optado por navegación manual. Expo Router sigue siendo recomendado para nuevos proyectos Expo. React Navigation 7 es la biblioteca estándar para navegación bare RN.

### Instalación (bare RN)

```bash
# Dependencias core
npm install @react-navigation/native react-native-screens react-native-safe-area-context

# Navegadores
npm install @react-navigation/native-stack          # Stack nativo (recomendado)
npm install @react-navigation/bottom-tabs           # Bottom tabs
npm install @react-navigation/drawer                # Drawer
npm install react-native-gesture-handler react-native-reanimated  # requerido por Drawer

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
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
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

### Navegar desde una pantalla

```typescript
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View>
      <Button
        title="Ver detalle"
        onPress={() =>
          navigation.navigate('Detail', { id: '42', title: 'Mi artículo' })
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
    // GestureHandlerRootView es obligatorio para el Drawer
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      </Drawer.Navigator>
    </GestureHandlerRootView>
  );
}
```

### Stack + Tabs anidados (patrón común)

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

### Novedades de React Navigation 7

| Feature | Descripción |
|---------|-------------|
| **Static API** | Configuración declarativa de navegadores (alternativa a JSX navigators) |
| **TypeScript mejorado** | Inferencia automática de tipos desde `createStaticNavigation` |
| **Native Bottom Tabs** | Wrapping nativo TabView/BottomNavigationView (menos bridge overhead) |
| **Hooks simplificados** | `useNavigation`, `useRoute`, `useFocusEffect` — API estable y ligera |

---

## Checklist de Navegación

- [ ] Expo Router configurado (proyectos Expo)
- [ ] React Navigation 7 instalado (proyectos bare RN)
- [ ] Enrutamiento basado en archivos utilizado (Expo Router)
- [ ] Grupos de rutas organizados
- [ ] Deep linking configurado
- [ ] Rutas protegidas implementadas
- [ ] Tipos de navegación definidos (`RootStackParamList`)
- [ ] Pantallas modales configuradas
- [ ] Navegación por pestañas
- [ ] Navegación hacia atrás gestionada
- [ ] `GestureHandlerRootView` en el root si se usa Drawer

---

**Expo Router: Simple, potente, type-safe.**
