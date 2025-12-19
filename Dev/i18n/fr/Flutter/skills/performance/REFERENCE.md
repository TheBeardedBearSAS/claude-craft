# Performance Flutter

## const Widgets

```dart
// ✅ BON - const
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Hello'),
        SizedBox(height: 16),
        Icon(Icons.home),
      ],
    );
  }
}

// ❌ MAUVAIS - pas de const
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Hello'),
        SizedBox(height: 16),
        Icon(Icons.home),
      ],
    );
  }
}
```

---

## ListView Optimization

```dart
// ✅ BON - ListView.builder (lazy loading)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ItemWidget(items[index]);
  },
)

// ❌ MAUVAIS - ListView avec children (tous créés d'un coup)
ListView(
  children: items.map((item) => ItemWidget(item)).toList(),
)

// Pagination
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
      // Load more
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

## Images

```dart
// Caching
dependencies:
  cached_network_image: ^3.3.0

CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  memCacheWidth: 400, // Resize en mémoire
  maxWidthDiskCache: 400,
)

// Lazy loading avec visibility detector
dependencies:
  visibility_detector: ^0.4.0

VisibilityDetector(
  key: Key('image-$index'),
  onVisibilityChanged: (info) {
    if (info.visibleFraction > 0.1) {
      // Load image
    }
  },
  child: CachedNetworkImage(imageUrl: url),
)
```

---

## Avoid Rebuilds

```dart
// ✅ BON - Séparer widgets
class MyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const StaticHeader(), // const - jamais rebuild
        DynamicContent(), // Rebuild quand nécessaire
      ],
    );
  }
}

// ✅ BON - RepaintBoundary
RepaintBoundary(
  child: ComplexWidget(),
)

// ✅ BON - AutomaticKeepAliveClientMixin pour TabBar
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
    super.build(context); // Important !
    return ExpensiveWidget();
  }
}
```

---

## DevTools Profiling

```bash
# 1. Lancer app en profile mode
flutter run --profile

# 2. Ouvrir DevTools
# Presser 'v' dans le terminal

# 3. Performance tab
# - Frame rendering chart
# - Timeline
# - CPU profiler
# - Memory profiler
```

### Analyser les performances

```dart
// Timeline events
import 'dart:developer';

Timeline.startSync('expensive_operation');
expensiveOperation();
Timeline.finishSync();

// Performance overlay
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

// Load when needed
await heavy.loadLibrary();
heavy.showFeature();
```

---

## Checklist Performance

```
□ const widgets partout où possible
□ ListView.builder pour listes
□ Image caching activé
□ Lazy loading des images
□ Éviter rebuilds inutiles
□ RepaintBoundary pour widgets complexes
□ Code splitting pour features lourdes
□ Profile mode testé
□ Frame rate > 60 FPS
□ Temps de démarrage < 2s
```

---

*Optimiser les performances améliore l'expérience utilisateur.*
