# Otimização de Performance - React Native

## Introdução

As performances são críticas para a experiência do usuário móvel. Meta: **60 FPS** em todas as interações.

---

## Hermes Engine

### Ativar Hermes

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

### Benefícios do Hermes

- **Startup time**: 50% mais rápido
- **Memory usage**: 30% menos RAM
- **App size**: Bundle menor
- **Performance**: Bytecode otimizado

---

## Otimização de FlatList

### 1. Configuração Ótima

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  // Props de performance
  initialNumToRender={10} // Renderizar 10 itens inicialmente
  maxToRenderPerBatch={10} // Renderizar 10 itens por lote de rolagem
  updateCellsBatchingPeriod={50} // Atualizar a cada 50ms
  windowSize={5} // Renderizar 5 telas de itens
  removeClippedSubviews={true} // Desmontar views fora da tela (Android)
  // Opcional: getItemLayout para alturas de item conhecidas
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 2. RenderItem Memoizado

```typescript
// ❌ RUIM: Re-renderiza a cada mudança
const ArticlesList = () => {
  const { data: articles } = useArticles();

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
          <Button onPress={() => navigate(item.id)}>Ver</Button>
        </View>
      )}
    />
  );
};

// ✅ BOM: Componente memoizado
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

### 3. getItemLayout para Alturas Fixas

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
  // Permite rolagem instantânea para qualquer posição
/>
```

---

## Otimização de Imagens

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
  blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4', // Blurhash padrão
}) => {
  return (
    <Image
      source={source}
      style={{ width, height }}
      placeholder={blurhash}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk" // Cache em memória e disco
    />
  );
};
```

### 2. Redimensionamento de Imagens

```typescript
// Redimensionar imagens antes do upload
import * as ImageManipulator from 'expo-image-manipulator';

const resizeImage = async (uri: string, maxWidth: number = 1024) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
};

// Uso
const handleImagePick = async () => {
  const result = await ImagePicker.launchImageLibraryAsync();
  if (!result.canceled) {
    const resizedUri = await resizeImage(result.assets[0].uri);
    uploadImage(resizedUri);
  }
};
```

### 3. Carregamento Lazy de Imagens

```typescript
const ArticleCard = ({ article }: ArticleCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View
      onLayout={(e) => {
        // Carregar imagem quando o componente se torna visível
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

## Memoização

### 1. React.memo

```typescript
// Prevenir re-renderizações desnecessárias
export const ExpensiveComponent = React.memo(
  ({ data }: Props) => {
    return <View>{/* Renderização custosa */}</View>;
  },
  (prevProps, nextProps) => {
    // Comparação personalizada
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 2. useMemo

```typescript
// Memoizar cálculos custosos
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
// Memoizar funções de callback
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

## Performance de Animações

### 1. Native Driver

```typescript
// ✅ BOM: useNativeDriver
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Executa na thread nativa
}).start();

// ❌ RUIM: Sem native driver
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false, // Executa na thread JS (lento)
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
      <Button onPress={handlePress}>Mover</Button>
    </View>
  );
};
```

### 3. LayoutAnimation

```typescript
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Habilitar no Android
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
        <Text>Alternar</Text>
      </Pressable>
      {expanded && <View style={styles.content}>{/* Conteúdo */}</View>}
    </View>
  );
};
```

---

## Otimização do Tamanho do Bundle

### 1. Analisar Bundle

```bash
# Analisar tamanho do bundle
npx react-native-bundle-visualizer

# Ou com Expo
npx expo export --clear
```

### 2. Code Splitting

```typescript
// Carregamento lazy de telas
import { lazy, Suspense } from 'react';

const ArticleDetailScreen = lazy(() => import('./screens/ArticleDetailScreen'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <ArticleDetailScreen />
  </Suspense>
);
```

### 3. Remover Dependências Não Utilizadas

```bash
# Encontrar dependências não utilizadas
npx depcheck

# Remover
npm uninstall unused-package
```

---

## Performance de Rede

### 1. Agrupamento de Requisições

```typescript
// Agrupar múltiplas requisições
const fetchUserData = async (userId: string) => {
  const [user, posts, followers] = await Promise.all([
    api.getUser(userId),
    api.getUserPosts(userId),
    api.getUserFollowers(userId),
  ]);

  return { user, posts, followers };
};
```

### 2. Cache de Requisições (React Query)

```typescript
// Cache de respostas da API
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => api.getArticles(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};
```

### 3. Paginação

```typescript
// Scroll infinito com paginação
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

## Performance JavaScript

### 1. Evitar Funções Inline

```typescript
// ❌ RUIM: Cria nova função a cada renderização
<Button onPress={() => console.log('Pressionado')}>Pressionar</Button>

// ✅ BOM: Referência de função
const handlePress = () => console.log('Pressionado');
<Button onPress={handlePress}>Pressionar</Button>

// ✅ BOM: useCallback para dependências
const handlePress = useCallback(() => {
  console.log('Pressionado', someValue);
}, [someValue]);
<Button onPress={handlePress}>Pressionar</Button>
```

### 2. Evitar Estilos Inline

```typescript
// ❌ RUIM: Cria novo objeto a cada renderização
<View style={{ flex: 1, padding: 16 }}>

// ✅ BOM: StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
<View style={styles.container}>
```

### 3. Debounce de Operações Pesadas

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

// Uso: Busca com debounce
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
        placeholder="Buscar..."
      />
      <ResultsList results={results} />
    </View>
  );
};
```

---

## Gerenciamento de Memória

### 1. Limpeza de Effects

```typescript
useEffect(() => {
  const subscription = api.subscribe();

  // Limpeza ao desmontar
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 2. Cancelar Operações Assíncronas

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
    cancelled = true; // Prevenir atualização de estado em componente desmontado
  };
}, []);
```

### 3. Evitar Vazamentos de Memória

```typescript
// ❌ RUIM: Vazamento de memória
useEffect(() => {
  setInterval(() => {
    console.log('Executando');
  }, 1000);
}, []); // Nunca limpo!

// ✅ BOM: Limpar intervalo
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Executando');
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

---

## Ferramentas de Profiling

### 1. React DevTools Profiler

```typescript
// Envolver componente no Profiler
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

### 2. Monitor de Performance

```typescript
// Habilitar monitor de performance em dev
import { Platform } from 'react-native';

if (__DEV__ && Platform.OS !== 'web') {
  const DevMenu = require('react-native-dev-menu');
  DevMenu.addItem('Alternar Perf Monitor', () => {
    // Mostrar FPS, uso de RAM, CPU
  });
}
```

---

## Checklist de Performance

### Imagens
- [ ] expo-image utilizado
- [ ] Imagens redimensionadas
- [ ] Placeholders blurhash
- [ ] Lazy loading implementado

### Listas
- [ ] FlatList otimizado (windowSize, etc.)
- [ ] getItemLayout se altura fixa
- [ ] renderItem memoizado
- [ ] Paginação para listas grandes

### Animações
- [ ] useNativeDriver: true
- [ ] Reanimated para animações complexas
- [ ] LayoutAnimation para mudanças de layout

### Código
- [ ] React.memo para componentes custosos
- [ ] useMemo para cálculos custosos
- [ ] useCallback para funções
- [ ] Sem funções/estilos inline
- [ ] Debounce para inputs

### Rede
- [ ] React Query com cache
- [ ] Agrupamento de requisições
- [ ] Paginação
- [ ] Lógica de retry

### Bundle
- [ ] Hermes ativado
- [ ] Code splitting
- [ ] Dependências mínimas
- [ ] Bundle < 10MB

---

## Métricas de Performance

### Métricas Alvo

- **Startup time**: < 3s
- **FPS**: 60 FPS constante
- **Memory**: < 200MB
- **Bundle size**: < 10MB (JS)
- **API response**: < 500ms

### Monitoramento

```typescript
// Rastrear tempo de carregamento de tela
const StartupTime = () => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`Tempo de carregamento da tela: ${endTime - startTime}ms`);
    };
  }, []);
};
```

---

**Performance é uma funcionalidade. Otimize cedo, otimize frequentemente.**
