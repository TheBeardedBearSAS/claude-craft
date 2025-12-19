# Rendimiento Flutter

## const Widgets

```dart
//  GOOD - const
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

// L BAD - no const
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
//  GOOD - ListView.builder (lazy loading)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ItemWidget(items[index]);
  },
)

// L BAD - ListView with children (all created at once)
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
  memCacheWidth: 400, // Resize in memory
  maxWidthDiskCache: 400,
)

// Lazy loading with visibility detector
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
//  GOOD - Separate widgets
class MyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const StaticHeader(), // const - never rebuilds
        DynamicContent(), // Rebuilds when necessary
      ],
    );
  }
}

//  GOOD - RepaintBoundary
RepaintBoundary(
  child: ComplexWidget(),
)

//  GOOD - AutomaticKeepAliveClientMixin for TabBar
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
    super.build(context); // Important!
    return ExpensiveWidget();
  }
}
```

---

## DevTools Profiling

```bash
# 1. Run app in profile mode
flutter run --profile

# 2. Open DevTools
# Press 'v' in terminal

# 3. Performance tab
# - Frame rendering chart
# - Timeline
# - CPU profiler
# - Memory profiler
```

### Analyze Performance

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

## Checklist de Rendimiento

```
¡ const widgets everywhere possible
¡ ListView.builder for lists
¡ Image caching enabled
¡ Lazy loading of images
¡ Avoid unnecessary rebuilds
¡ RepaintBoundary for complex widgets
¡ Code splitting for heavy features
¡ Profile mode tested
¡ Frame rate > 60 FPS
¡ Startup time < 2s
```

---

*Optimizing performance improves user experience.*
