# Performance Optimization - React Native

## Introduction

Les performances sont critiques pour l'expérience utilisateur mobile. Target: **60 FPS** sur toutes les interactions.

---

## Hermes Engine

### Activer Hermes

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

### Bénéfices Hermes

- **Startup time**: 50% plus rapide
- **Memory usage**: 30% moins de RAM
- **App size**: Bundle plus petit
- **Performance**: Bytecode optimisé

---

## FlatList Optimization

### 1. Configuration Optimale

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

### 2. Memoized RenderItem

```typescript
// ❌ MAUVAIS: Re-renders on every change
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

// ✅ BON: Memoized component
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

### 3. getItemLayout for Fixed Heights

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

## Image Optimization

### 1. expo-image (Recommandé)

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

### 2. Image Resizing

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

### 3. Lazy Loading Images

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

## Memoization

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

## Animations Performance

### 1. Native Driver

```typescript
// ✅ BON: useNativeDriver
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Runs on native thread
}).start();

// ❌ MAUVAIS: Sans native driver
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

## Bundle Size Optimization

### 1. Analyze Bundle

```bash
# Analyze bundle size
npx react-native-bundle-visualizer

# Or with Expo
npx expo export --clear
```

### 2. Code Splitting

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

### 3. Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Remove
npm uninstall unused-package
```

---

## Network Performance

### 1. Request Batching

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

### 2. Request Caching (React Query)

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

### 3. Pagination

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

## JavaScript Performance

### 1. Avoid Inline Functions

```typescript
// ❌ MAUVAIS: Creates new function on every render
<Button onPress={() => console.log('Pressed')}>Press</Button>

// ✅ BON: Function reference
const handlePress = () => console.log('Pressed');
<Button onPress={handlePress}>Press</Button>

// ✅ BON: useCallback for dependencies
const handlePress = useCallback(() => {
  console.log('Pressed', someValue);
}, [someValue]);
<Button onPress={handlePress}>Press</Button>
```

### 2. Avoid Inline Styles

```typescript
// ❌ MAUVAIS: Creates new object on every render
<View style={{ flex: 1, padding: 16 }}>

// ✅ BON: StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
<View style={styles.container}>
```

### 3. Debounce Heavy Operations

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

## Memory Management

### 1. Cleanup Effects

```typescript
useEffect(() => {
  const subscription = api.subscribe();

  // Cleanup on unmount
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 2. Cancel Async Operations

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

### 3. Avoid Memory Leaks

```typescript
// ❌ MAUVAIS: Memory leak
useEffect(() => {
  setInterval(() => {
    console.log('Running');
  }, 1000);
}, []); // Never cleaned up!

// ✅ BON: Cleanup interval
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

## Profiling Tools

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

### 2. Performance Monitor

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

## Performance Checklist

### Images
- [ ] expo-image utilisé
- [ ] Images redimensionnées
- [ ] Blurhash placeholders
- [ ] Lazy loading implémenté

### Lists
- [ ] FlatList optimisé (windowSize, etc.)
- [ ] getItemLayout si hauteur fixe
- [ ] renderItem memoized
- [ ] Pagination pour grandes listes

### Animations
- [ ] useNativeDriver: true
- [ ] Reanimated pour animations complexes
- [ ] LayoutAnimation pour layout changes

### Code
- [ ] React.memo pour composants coûteux
- [ ] useMemo pour calculs coûteux
- [ ] useCallback pour fonctions
- [ ] Pas de inline functions/styles
- [ ] Debounce pour inputs

### Network
- [ ] React Query avec cache
- [ ] Request batching
- [ ] Pagination
- [ ] Retry logic

### Bundle
- [ ] Hermes activé
- [ ] Code splitting
- [ ] Dependencies minimales
- [ ] Bundle < 10MB

---

## Performance Metrics

### Target Metrics

- **Startup time**: < 3s
- **FPS**: 60 FPS constant
- **Memory**: < 200MB
- **Bundle size**: < 10MB (JS)
- **API response**: < 500ms

### Monitoring

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

**Performance is a feature. Optimize early, optimize often.**
