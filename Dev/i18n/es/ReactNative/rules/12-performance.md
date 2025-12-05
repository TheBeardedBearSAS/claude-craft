# Optimización de Rendimiento - React Native

## Introducción

El rendimiento es crítico para la experiencia del usuario móvil. Objetivo: **60 FPS** en todas las interacciones.

---

## Motor Hermes

### Activar Hermes

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes",
    "android": {
      "enableHermes": true
    },
    "ios": {
      "jsEngine": "hermes"
    }
  }
}
```

### Beneficios de Hermes

- **Startup time**: 50% más rápido
- **Memory usage**: 30% menos RAM
- **App size**: Bundle más pequeño
- **Performance**: Bytecode optimizado

---

## Optimización de FlatList

### 1. Configuración Óptima

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  // Performance props
  initialNumToRender={10} // Render 10 items initially
  maxToRenderPerBatch={10} // Render 10 items per scroll batch
  updateCellsBatchingPeriod={50} // Update every 50ms
  windowSize={5} // Render 5 screens worth of items
  removeClippedSubviews={true} // Unmount off-screen views (Android)
  // Optional: getItemLayout for known item heights
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 2. RenderItem Memoizado

```typescript
// ❌ BAD: Re-renders on every change
const ArticlesList = () => {
  const { data: articles } = useArticles();

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
          <Button onPress={() => navigate(item.id)}>View</Button>
        </View>
      )}
    />
  );
};

// ✅ GOOD: Memoized component
const ArticleCard = React.memo(({ article, onPress }: ArticleCardProps) => {
  return (
    <Pressable onPress={onPress}>
      <Text>{article.title}</Text>
    </Pressable>
  );
});

const ArticlesList = () => {
  const { data: articles } = useArticles();
  const navigation = useNavigation();

  const handlePress = useCallback(
    (id: string) => {
      navigation.navigate('ArticleDetail', { id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <ArticleCard article={item} onPress={() => handlePress(item.id)} />
    ),
    [handlePress]
  );

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### 3. getItemLayout para Alturas Fijas

```typescript
const ITEM_HEIGHT = 100;

const getItemLayout = (data: any, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

<FlatList
  data={items}
  renderItem={renderItem}
  getItemLayout={getItemLayout}
  // Enables instant scroll to any position
/>
```

---

## Optimización de Imágenes

### 1. expo-image (Recomendado)

```bash
npx expo install expo-image
```

```typescript
// components/OptimizedImage.tsx
import { Image } from 'expo-image';

interface OptimizedImageProps {
  source: { uri: string };
  width?: number;
  height?: number;
  blurhash?: string;
}

export const OptimizedImage: FC<OptimizedImageProps> = ({
  source,
  width,
  height,
  blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4', // Default blurhash
}) => {
  return (
    <Image
      source={source}
      style={{ width, height }}
      placeholder={blurhash}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk" // Cache in memory and disk
    />
  );
};
```

### 2. Redimensionamiento de Imágenes

```typescript
// Resize images before upload
import * as ImageManipulator from 'expo-image-manipulator';

const resizeImage = async (uri: string, maxWidth: number = 1024) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
};

// Usage
const handleImagePick = async () => {
  const result = await ImagePicker.launchImageLibraryAsync();
  if (!result.canceled) {
    const resizedUri = await resizeImage(result.assets[0].uri);
    uploadImage(resizedUri);
  }
};
```

### 3. Carga Perezosa de Imágenes

```typescript
const ArticleCard = ({ article }: ArticleCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View
      onLayout={(e) => {
        // Load image when component becomes visible
        setIsVisible(true);
      }}
    >
      {isVisible ? (
        <Image source={{ uri: article.imageUrl }} />
      ) : (
        <View style={{ height: 200, backgroundColor: '#f0f0f0' }} />
      )}
    </View>
  );
};
```

---

## Memoización

### 1. React.memo

```typescript
// Prevent unnecessary re-renders
export const ExpensiveComponent = React.memo(
  ({ data }: Props) => {
    return <View>{/* Expensive render */}</View>;
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 2. useMemo

```typescript
// Memoize expensive calculations
const FilteredArticles = ({ articles, filter }: Props) => {
  const filteredArticles = useMemo(() => {
    return articles.filter((article) =>
      article.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [articles, filter]);

  return <ArticlesList articles={filteredArticles} />;
};
```

### 3. useCallback

```typescript
// Memoize callback functions
const ArticlesList = ({ articles }: Props) => {
  const navigation = useNavigation();

  const handlePress = useCallback(
    (id: string) => {
      navigation.navigate('ArticleDetail', { id });
    },
    [navigation]
  );

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => (
        <ArticleCard article={item} onPress={() => handlePress(item.id)} />
      )}
    />
  );
};
```

---

## Rendimiento de Animaciones

### 1. Native Driver

```typescript
// ✅ GOOD: useNativeDriver
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Runs on native thread
}).start();

// ❌ BAD: Sans native driver
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false, // Runs on JS thread (laggy)
}).start();
```

### 2. React Native Reanimated

```bash
npx expo install react-native-reanimated
```

```typescript
// hooks/useAnimatedValue.ts
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export const AnimatedBox = () => {
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(offset.value * 255) }],
    };
  });

  const handlePress = () => {
    offset.value = offset.value === 0 ? 1 : 0;
  };

  return (
    <View>
      <Animated.View style={[styles.box, animatedStyles]} />
      <Button onPress={handlePress}>Move</Button>
    </View>
  );
};
```

### 3. LayoutAnimation

```typescript
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const MyComponent = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View>
      <Pressable onPress={toggleExpand}>
        <Text>Toggle</Text>
      </Pressable>
      {expanded && <View style={styles.content}>{/* Content */}</View>}
    </View>
  );
};
```

---

## Optimización del Tamaño del Bundle

### 1. Analizar Bundle

```bash
# Analyze bundle size
npx react-native-bundle-visualizer

# Or with Expo
npx expo export --clear
```

### 2. División de Código

```typescript
// Lazy load screens
import { lazy, Suspense } from 'react';

const ArticleDetailScreen = lazy(() => import('./screens/ArticleDetailScreen'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <ArticleDetailScreen />
  </Suspense>
);
```

### 3. Eliminar Dependencias No Utilizadas

```bash
# Find unused dependencies
npx depcheck

# Remove
npm uninstall unused-package
```

---

## Rendimiento de Red

### 1. Agrupación de Peticiones

```typescript
// Batch multiple requests
const fetchUserData = async (userId: string) => {
  const [user, posts, followers] = await Promise.all([
    api.getUser(userId),
    api.getUserPosts(userId),
    api.getUserFollowers(userId),
  ]);

  return { user, posts, followers };
};
```

### 2. Caché de Peticiones (React Query)

```typescript
// Cache API responses
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => api.getArticles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 3. Paginación

```typescript
// Infinite scroll with pagination
export const useInfiniteArticles = () => {
  return useInfiniteQuery({
    queryKey: ['articles'],
    queryFn: ({ pageParam = 1 }) => api.getArticles({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

const ArticlesList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteArticles();

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const articles = data?.pages.flatMap((page) => page.articles) ?? [];

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
    />
  );
};
```

---

## Rendimiento de JavaScript

### 1. Evitar Funciones Inline

```typescript
// ❌ BAD: Creates new function on every render
<Button onPress={() => console.log('Pressed')}>Press</Button>

// ✅ GOOD: Function reference
const handlePress = () => console.log('Pressed');
<Button onPress={handlePress}>Press</Button>

// ✅ GOOD: useCallback for dependencies
const handlePress = useCallback(() => {
  console.log('Pressed', someValue);
}, [someValue]);
<Button onPress={handlePress}>Press</Button>
```

### 2. Evitar Estilos Inline

```typescript
// ❌ BAD: Creates new object on every render
<View style={{ flex: 1, padding: 16 }}>

// ✅ GOOD: StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
<View style={styles.container}>
```

### 3. Debounce para Operaciones Pesadas

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage: Search with debounce
const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: results } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.search(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  return (
    <View>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search..."
      />
      <ResultsList results={results} />
    </View>
  );
};
```

---

## Gestión de Memoria

### 1. Limpieza de Efectos

```typescript
useEffect(() => {
  const subscription = api.subscribe();

  // Cleanup on unmount
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 2. Cancelar Operaciones Asíncronas

```typescript
useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    const data = await api.getData();
    if (!cancelled) {
      setData(data);
    }
  };

  fetchData();

  return () => {
    cancelled = true; // Prevent state update on unmounted component
  };
}, []);
```

### 3. Evitar Fugas de Memoria

```typescript
// ❌ BAD: Memory leak
useEffect(() => {
  setInterval(() => {
    console.log('Running');
  }, 1000);
}, []); // Never cleaned up!

// ✅ GOOD: Cleanup interval
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Running');
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

---

## Herramientas de Profiling

### 1. React DevTools Profiler

```typescript
// Wrap component in Profiler
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) => {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
};

<Profiler id="ArticlesList" onRender={onRenderCallback}>
  <ArticlesList />
</Profiler>
```

### 2. Monitor de Rendimiento

```typescript
// Enable performance monitor in dev
import { Platform } from 'react-native';

if (__DEV__ && Platform.OS !== 'web') {
  const DevMenu = require('react-native-dev-menu');
  DevMenu.addItem('Toggle Perf Monitor', () => {
    // Show FPS, RAM, CPU usage
  });
}
```

---

## Checklist de Rendimiento

### Imágenes
- [ ] expo-image utilizado
- [ ] Imágenes redimensionadas
- [ ] Blurhash placeholders
- [ ] Lazy loading implementado

### Listas
- [ ] FlatList optimizado (windowSize, etc.)
- [ ] getItemLayout si altura fija
- [ ] renderItem memoizado
- [ ] Paginación para listas grandes

### Animaciones
- [ ] useNativeDriver: true
- [ ] Reanimated para animaciones complejas
- [ ] LayoutAnimation para cambios de layout

### Código
- [ ] React.memo para componentes costosos
- [ ] useMemo para cálculos costosos
- [ ] useCallback para funciones
- [ ] Sin funciones/estilos inline
- [ ] Debounce para inputs

### Red
- [ ] React Query con caché
- [ ] Agrupación de peticiones
- [ ] Paginación
- [ ] Lógica de reintentos

### Bundle
- [ ] Hermes activado
- [ ] División de código
- [ ] Dependencias mínimas
- [ ] Bundle < 10MB

---

## Métricas de Rendimiento

### Métricas Objetivo

- **Startup time**: < 3s
- **FPS**: 60 FPS constante
- **Memory**: < 200MB
- **Bundle size**: < 10MB (JS)
- **API response**: < 500ms

### Monitoreo

```typescript
// Track screen load time
const StartupTime = () => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`Screen load time: ${endTime - startTime}ms`);
    };
  }, []);
};
```

---

**El rendimiento es una característica. Optimiza temprano, optimiza a menudo.**
