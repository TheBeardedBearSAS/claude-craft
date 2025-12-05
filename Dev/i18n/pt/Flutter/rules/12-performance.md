# Performance Flutter

## const Widgets

```dart
// BOM - const
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Olá'),
        SizedBox(height: 16),
        Icon(Icons.home),
      ],
    );
  }
}

// RUIM - sem const
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Olá'),
        SizedBox(height: 16),
        Icon(Icons.home),
      ],
    );
  }
}
```

---

## Otimização de ListView

```dart
// BOM - ListView.builder (lazy loading)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ItemWidget(items[index]);
  },
)

// RUIM - ListView com children (todos criados de uma vez)
ListView(
  children: items.map((item) => ItemWidget(item)).toList(),
)

// Paginação
class ProductListPage extends StatefulWidget {
  @override
  State<ProductListPage> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.9) {
      // Carregar mais
      context.read<ProductBloc>().add(LoadMore());
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: items.length,
      itemBuilder: (context, index) => ProductCard(items[index]),
    );
  }
}
```

---

## Imagens

```dart
// Caching
dependencies:
  cached_network_image: ^3.3.0

CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  memCacheWidth: 400, // Redimensionar em memória
  maxWidthDiskCache: 400,
)

// Lazy loading com detector de visibilidade
dependencies:
  visibility_detector: ^0.4.0

VisibilityDetector(
  key: Key('image-$index'),
  onVisibilityChanged: (info) {
    if (info.visibleFraction > 0.1) {
      // Carregar imagem
    }
  },
  child: CachedNetworkImage(imageUrl: url),
)
```

---

## Evitar Rebuilds

```dart
// BOM - Widgets separados
class MyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const StaticHeader(), // const - nunca reconstrói
        DynamicContent(), // Reconstrói quando necessário
      ],
    );
  }
}

// BOM - RepaintBoundary
RepaintBoundary(
  child: ComplexWidget(),
)

// BOM - AutomaticKeepAliveClientMixin para TabBar
class MyTab extends StatefulWidget {
  @override
  State<MyTab> createState() => _MyTabState();
}

class _MyTabState extends State<MyTab>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // Importante!
    return ExpensiveWidget();
  }
}
```

---

## DevTools Profiling

```bash
# 1. Executar app em modo profile
flutter run --profile

# 2. Abrir DevTools
# Pressione 'v' no terminal

# 3. Aba Performance
# - Gráfico de renderização de frames
# - Timeline
# - Profiler de CPU
# - Profiler de memória
```

### Analisar Performance

```dart
// Eventos de timeline
import 'dart:developer';

Timeline.startSync('operacao_cara');
operacaoCara();
Timeline.finishSync();

// Overlay de performance
MaterialApp(
  showPerformanceOverlay: true,
  // ...
)
```

---

## Lazy Loading & Code Splitting

```dart
// Deferred loading
import 'package:myapp/heavy_feature.dart' deferred as heavy;

// Carregar quando necessário
await heavy.loadLibrary();
heavy.showFeature();
```

---

## Checklist de Performance

```
✓ const widgets em todo lugar possível
✓ ListView.builder para listas
✓ Cache de imagens habilitado
✓ Lazy loading de imagens
✓ Evitar rebuilds desnecessários
✓ RepaintBoundary para widgets complexos
✓ Code splitting para features pesadas
✓ Modo profile testado
✓ Frame rate > 60 FPS
✓ Tempo de inicialização < 2s
```

---

*Otimizar a performance melhora a experiência do usuário.*
