# Web Performance 2026 - Flutter 3.38+

## Overview

Flutter 3.38+ apporte des améliorations majeures pour les applications web:
- **WebAssembly GC stable** (2-3x plus rapide)
- **Hot Reload web stable**
- **dart:js_interop** (remplace dart:js)
- **Rendering optimisé**

## Métriques Clés

### Core Web Vitals Cibles

| Métrique | Cible | Bon | À améliorer |
|----------|-------|-----|-------------|
| LCP | < 2.5s | < 2.5s | > 4s |
| FID | < 100ms | < 100ms | > 300ms |
| CLS | < 0.1 | < 0.1 | > 0.25 |
| FCP | < 1.8s | < 1.8s | > 3s |
| TTI | < 3.8s | < 3.8s | > 7.3s |

### Flutter Web Benchmarks 2026

| Métrique | JS | Wasm | Amélioration |
|----------|-----|------|--------------|
| First Paint | 1.5s | 0.8s | -47% |
| TTI | 3.0s | 1.5s | -50% |
| Frame Rate | 45 fps | 60 fps | +33% |
| Bundle Size | 2.5 MB | 1.8 MB | -28% |

## Optimisations Initiales

### 1. Lazy Loading des Routes

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Chargement différé des pages
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/reports',
      builder: (context, state) async {
        // Lazy load du module reports
        await Future.delayed(Duration.zero); // Tick pour import
        final reports = await _loadReportsModule();
        return reports.ReportsPage();
      },
    ),
  ],
);

// Import différé
Future<dynamic> _loadReportsModule() async {
  return await import('package:my_app/features/reports/reports.dart');
}
```

### 2. Deferred Components

```dart
// main.dart - Charger les composants à la demande
import 'features/analytics/analytics.dart' deferred as analytics;
import 'features/admin/admin.dart' deferred as admin;

Future<void> loadAnalytics() async {
  await analytics.loadLibrary();
  // Maintenant analytics.* est disponible
}

// Vérifier si chargé
Widget build(BuildContext context) {
  return FutureBuilder(
    future: analytics.loadLibrary(),
    builder: (context, snapshot) {
      if (snapshot.connectionState == .done) {
        return analytics.AnalyticsDashboard();
      }
      return const LoadingIndicator();
    },
  );
}
```

### 3. Code Splitting Automatique

```yaml
# pubspec.yaml
flutter:
  # Activer le code splitting
  deferred-components:
    - name: analytics
      libraries:
        - package:my_app/features/analytics/analytics.dart
    - name: admin
      libraries:
        - package:my_app/features/admin/admin.dart
```

## Optimisation du Rendu

### 1. Const Widgets

```dart
// ✅ BON - Widgets const reconstruits moins souvent
class OptimizedPage extends StatelessWidget {
  const OptimizedPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Optimized')),
      body: Column(
        children: [
          HeaderSection(),      // const implicite
          NavigationBar(),      // const implicite
          ContentArea(),        // const implicite
        ],
      ),
    );
  }
}

// ❌ MAUVAIS - Recréation à chaque build
class UnoptimizedPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Unoptimized')),
      body: Column(
        children: [
          HeaderSection(),      // Recréé à chaque build
          NavigationBar(),
          ContentArea(),
        ],
      ),
    );
  }
}
```

### 2. RepaintBoundary

```dart
// Isoler les parties qui changent fréquemment
class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const HeaderWidget(),  // Static

        // Animation isolée - ne repaint pas le reste
        RepaintBoundary(
          child: AnimatedChart(),
        ),

        const FooterWidget(),  // Static
      ],
    );
  }
}
```

### 3. ListView Optimization

```dart
// ✅ BON - ListView.builder pour grandes listes
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemTile(
    key: ValueKey(items[index].id),  // Key stable
    item: items[index],
  ),
)

// ✅ BON - Avec cacheExtent pour prefetch
ListView.builder(
  cacheExtent: 500,  // Prefetch 500px en avance
  itemCount: items.length,
  itemBuilder: (context, index) => ItemTile(item: items[index]),
)

// ❌ MAUVAIS - ListView avec children (tous créés)
ListView(
  children: items.map((item) => ItemTile(item: item)).toList(),
)
```

## Images et Assets

### 1. Image Optimization

```dart
// Redimensionner côté client
Image.network(
  'https://example.com/large-image.jpg',
  cacheWidth: 300,   // Max largeur
  cacheHeight: 200,  // Max hauteur
  fit: BoxFit.cover,
)

// Utiliser WebP
Image.network(
  'https://example.com/image.webp',  // Format WebP
  loadingBuilder: (context, child, loadingProgress) {
    if (loadingProgress == null) return child;
    return const CircularProgressIndicator();
  },
)
```

### 2. Image Preloading

```dart
class _HomePageState extends State<HomePage> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // Précharger les images critiques
    precacheImage(
      const AssetImage('assets/hero.webp'),
      context,
    );

    precacheImage(
      const NetworkImage('https://example.com/banner.webp'),
      context,
    );
  }
}
```

### 3. SVG pour Icônes

```dart
// Utiliser SVG au lieu de PNG pour les icônes
import 'package:flutter_svg/flutter_svg.dart';

SvgPicture.asset(
  'assets/icons/menu.svg',
  width: 24,
  height: 24,
  colorFilter: ColorFilter.mode(Colors.black, BlendMode.srcIn),
)
```

## État et Données

### 1. Optimistic Updates

```dart
class OrderBloc extends Bloc<OrderEvent, OrderState> {
  Future<void> _onDeleteOrder(
    DeleteOrder event,
    Emitter<OrderState> emit,
  ) async {
    // 1. Mise à jour optimiste immédiate
    final previousOrders = state.orders;
    emit(state.copyWith(
      orders: state.orders.where((o) => o.id != event.orderId).toList(),
    ));

    try {
      // 2. Appel API en arrière-plan
      await _repository.deleteOrder(event.orderId);
    } catch (e) {
      // 3. Rollback si erreur
      emit(state.copyWith(orders: previousOrders));
      emit(state.copyWith(error: 'Échec suppression'));
    }
  }
}
```

### 2. Pagination Infinie

```dart
class InfiniteListView extends StatefulWidget {
  @override
  State<InfiniteListView> createState() => _InfiniteListViewState();
}

class _InfiniteListViewState extends State<InfiniteListView> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_isBottom) {
      context.read<ItemsBloc>().add(LoadMoreItems());
    }
  }

  bool get _isBottom {
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);  // 90% scrollé
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: items.length + 1,  // +1 pour loader
      itemBuilder: (context, index) {
        if (index >= items.length) {
          return const LoadingIndicator();
        }
        return ItemTile(item: items[index]);
      },
    );
  }
}
```

## Fonts et Texte

### 1. Font Subsetting

```yaml
# pubspec.yaml - Fonts avec subset
flutter:
  fonts:
    - family: Roboto
      fonts:
        - asset: fonts/Roboto-Regular.ttf
        - asset: fonts/Roboto-Bold.ttf
          weight: 700
```

```bash
# Build avec font subsetting automatique
flutter build web --wasm
```

### 2. System Fonts Fallback

```dart
// Utiliser les fonts système en premier
const textStyle = TextStyle(
  fontFamily: 'Roboto',
  fontFamilyFallback: ['Helvetica', 'Arial', 'sans-serif'],
);
```

## Mesure et Monitoring

### 1. Performance Overlay

```dart
// En développement
MaterialApp(
  showPerformanceOverlay: kDebugMode,
  // ...
)
```

### 2. Custom Timing

```dart
import 'dart:developer' as developer;

class PerformanceTracker {
  static void measure(String name, VoidCallback action) {
    final stopwatch = Stopwatch()..start();

    action();

    stopwatch.stop();
    developer.log(
      '$name: ${stopwatch.elapsedMilliseconds}ms',
      name: 'Performance',
    );

    // Reporter aux analytics
    _analytics.timing(name, stopwatch.elapsedMilliseconds);
  }

  static Future<T> measureAsync<T>(
    String name,
    Future<T> Function() action,
  ) async {
    final stopwatch = Stopwatch()..start();

    try {
      return await action();
    } finally {
      stopwatch.stop();
      developer.log(
        '$name: ${stopwatch.elapsedMilliseconds}ms',
        name: 'Performance',
      );
    }
  }
}

// Usage
PerformanceTracker.measure('build_list', () {
  buildLargeList();
});
```

### 3. Web Vitals

```dart
import 'dart:js_interop';

// Mesurer LCP
@JS('PerformanceObserver')
extension type PerformanceObserver(JSObject _) implements JSObject {
  external factory PerformanceObserver(JSFunction callback);
  external void observe(JSObject options);
}

void measureWebVitals() {
  final lcpObserver = PerformanceObserver(((JSArray entries) {
    for (final entry in entries.toDart) {
      print('LCP: ${entry.startTime}ms');
    }
  }).toJS);

  lcpObserver.observe({'entryTypes': ['largest-contentful-paint'].toJS}.toJS);
}
```

## Checklist Performance

### Build Time

- [ ] WebAssembly build activé
- [ ] Deferred components configurés
- [ ] Assets optimisés (WebP, SVG)
- [ ] Font subsetting activé

### Runtime

- [ ] Const widgets partout où possible
- [ ] ListView.builder pour listes
- [ ] RepaintBoundary pour animations
- [ ] Keys stables sur les listes

### Network

- [ ] Images avec cacheWidth/cacheHeight
- [ ] Preloading images critiques
- [ ] Pagination infinie
- [ ] Optimistic updates

### Monitoring

- [ ] Performance overlay en dev
- [ ] Web Vitals tracking
- [ ] Custom timing pour opérations critiques

## Ressources

- [Flutter Web Performance](https://docs.flutter.dev/perf/web-performance)
- [Core Web Vitals](https://web.dev/vitals/)
- [Flutter DevTools](https://docs.flutter.dev/tools/devtools)

---

**Date de dernière mise à jour:** 2026-01-29
**Version:** 1.0.0
