# Navigation - Expo Router

## Introduction

Expo Router est le système de navigation recommandé pour Expo, basé sur le routing fichier (comme Next.js).

---

## Installation & Setup

### Installation

```bash
npx create-expo-app my-app --template blank-typescript
cd my-app
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

### Configuration

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

## File-based Routing

### Basic Structure

```
app/
├── _layout.tsx              # Root layout
├── index.tsx                # Home screen (/)
├── about.tsx                # About screen (/about)
├── profile.tsx              # Profile screen (/profile)
└── article/
    └── [id].tsx            # Dynamic route (/article/123)
```

### Root Layout

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

## Route Groups

### Tab Navigation

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

### Auth Group

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

## Dynamic Routes

### Single Parameter

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

### Multiple Parameters

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

### Catch-all Routes

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

## Navigation API

### Programmatic Navigation

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

### useRouter Hook

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

### useNavigation Hook

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

### Configuration

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

### Handling Deep Links

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

## Modal Screens

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

## Protected Routes

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

## Type-safe Navigation

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

## Navigation Patterns

### 1. Bottom Tabs with Stack

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

### 2. Drawer Navigation

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

### 3. Onboarding Flow

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

## Screen Options

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

## Best Practices

### 1. Organize by Feature

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

### 2. Use Route Groups

```
app/
├── (public)/        # Public routes
├── (protected)/     # Protected routes
└── (modal)/         # Modal screens
```

### 3. Type All Params

```typescript
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## Checklist Navigation

- [ ] Expo Router configuré
- [ ] File-based routing utilisé
- [ ] Route groups organisés
- [ ] Deep linking configuré
- [ ] Protected routes implémentés
- [ ] Types navigation définis
- [ ] Modal screens configurés
- [ ] Tab navigation
- [ ] Back navigation gérée

---

**Expo Router: Simple, puissant, type-safe.**
