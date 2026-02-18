---
description: Analyse Performance Flutter
argument-hint: [arguments]
---

# Analyse Performance Flutter

Tu es un expert performance Flutter. Tu dois analyser les performances de l'application, identifier les problèmes (jank, memory leaks, rebuilds inutiles) et proposer des optimisations.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Focus : rendering, memory, network, all

Exemple : `/flutter:analyze-performance rendering`

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

### Étape 1 : Collecte des Métriques

```bash
# Lancer en mode profile
flutter run --profile

# DevTools
flutter pub global activate devtools
dart devtools

# Analyser le code
dart analyze --fatal-infos
```

### Étape 2 : Analyse du Rendering

#### Identifier les Rebuilds Inutiles

```dart
// Ajouter dans main.dart pour debug
import 'package:flutter/rendering.dart';

void main() {
  debugProfileBuildsEnabled = true;  // Log les builds
  debugPrintRebuildDirtyWidgets = true;  // Log les rebuilds
  runApp(const MyApp());
}
```

#### Problèmes Courants et Solutions

##### 1. Rebuilds en Cascade

```dart
// ❌ MAUVAIS - Tout rebuild à chaque changement
class ParentWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MyModel>(
      builder: (context, model, _) => Column(
        children: [
          HeaderWidget(title: model.title),
          BodyWidget(items: model.items),
          FooterWidget(), // Rebuild inutile!
        ],
      ),
    );
  }
}

// ✅ BON - Granularité fine
class ParentWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Selector<MyModel, String>(
          selector: (_, model) => model.title,
          builder: (_, title, __) => HeaderWidget(title: title),
        ),
        Selector<MyModel, List<Item>>(
          selector: (_, model) => model.items,
          builder: (_, items, __) => BodyWidget(items: items),
        ),
        const FooterWidget(), // const = pas de rebuild
      ],
    );
  }
}
```

##### 2. ListView Non Optimisée

```dart
// ❌ MAUVAIS - Crée tous les widgets d'un coup
ListView(
  children: items.map((item) => ItemWidget(item: item)).toList(),
)

// ✅ BON - Lazy loading
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
  // Optimisations supplémentaires
  cacheExtent: 500, // Pré-render
  addAutomaticKeepAlives: false, // Si pas besoin de garder l'état
)

// ✅ ENCORE MIEUX - Avec taille fixe
ListView.builder(
  itemCount: items.length,
  itemExtent: 80, // Hauteur fixe = calcul optimisé
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
)
```

##### 3. Images Non Optimisées

```dart
// ❌ MAUVAIS
Image.network(
  'https://example.com/large_image.jpg',
)

// ✅ BON - Avec cache et resize
CachedNetworkImage(
  imageUrl: 'https://example.com/large_image.jpg',
  cacheWidth: 300, // Resize en mémoire
  cacheHeight: 300,
  memCacheWidth: 300,
  placeholder: (context, url) => const Shimmer(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
)
```

### Étape 3 : Analyse Mémoire

#### Détecter les Memory Leaks

```dart
// Vérifier les dispose() manquants
class _MyWidgetState extends State<MyWidget> {
  late StreamSubscription _subscription;
  late AnimationController _controller;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _subscription = stream.listen((_) {});
    _controller = AnimationController(vsync: this);
    _timer = Timer.periodic(Duration(seconds: 1), (_) {});
  }

  @override
  void dispose() {
    _subscription.cancel();  // ✅ Important!
    _controller.dispose();   // ✅ Important!
    _timer?.cancel();        // ✅ Important!
    super.dispose();
  }
}
```

#### Patterns Problématiques

```dart
// ❌ MAUVAIS - Closure capture le context
onPressed: () async {
  await longOperation();
  Navigator.of(context).pop(); // context peut être invalide!
}

// ✅ BON - Vérifier le mounted
onPressed: () async {
  await longOperation();
  if (mounted) {
    Navigator.of(context).pop();
  }
}
```

### Étape 4 : Optimisations Recommandées

#### Widget Optimization Checklist

```dart
// 1. Utiliser const partout possible
const MyWidget(); // ✅

// 2. RepaintBoundary pour les parties coûteuses
RepaintBoundary(
  child: ExpensiveWidget(),
)

// 3. Séparer les widgets qui changent souvent
class OptimizedWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const StaticHeader(),      // Jamais rebuild
        const AnimatedCounter(),   // Isolé
        const StaticFooter(),      // Jamais rebuild
      ],
    );
  }
}

// 4. Éviter les builds dans les builds
// ❌ MAUVAIS
build(context) {
  final items = generateItems(); // Appelé à chaque build!
  return ListView.builder(...);
}

// ✅ BON
late final items = generateItems(); // Une seule fois

// 5. Utiliser les Keys correctement
ListView.builder(
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id), // Stable key
    item: items[index],
  ),
)
```

### Étape 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
📊 RAPPORT PERFORMANCE FLUTTER
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 MÉTRIQUES RENDERING
──────────────────────────────────────────────────────────────

| Page | Build Time | Raster Time | FPS | Status |
|------|------------|-------------|-----|--------|
| Home | 8ms | 12ms | 60 | ✅ |
| List | 45ms | 35ms | 45 | ⚠️ |
| Detail | 15ms | 18ms | 58 | ✅ |

Seuils :
- Build < 16ms : ✅
- Build > 16ms : ⚠️ Jank possible
- Build > 32ms : ❌ Jank visible

──────────────────────────────────────────────────────────────
🧠 MÉTRIQUES MÉMOIRE
──────────────────────────────────────────────────────────────

| Métrique | Valeur | Seuil | Status |
|----------|--------|-------|--------|
| Heap Used | 85MB | < 150MB | ✅ |
| Heap Capacity | 120MB | < 200MB | ✅ |
| External | 25MB | < 50MB | ✅ |
| RSS | 180MB | < 300MB | ✅ |

──────────────────────────────────────────────────────────────
⚠️ PROBLÈMES DÉTECTÉS
──────────────────────────────────────────────────────────────

### Critique
1. **Rebuilds excessifs** - ProductListPage
   - 150 rebuilds/sec détectés
   - Cause: Provider au mauvais niveau
   - Fix: Utiliser Selector ou Consumer granulaire

### Important
2. **ListView non optimisée** - OrderHistoryPage
   - Pas de itemExtent défini
   - 500+ items sans lazy loading
   - Fix: ListView.builder avec itemExtent

3. **Images sans cache** - ProductCard
   - Image.network sans cache
   - Fix: Utiliser cached_network_image

### Mineur
4. **Widgets non const** - AppBar custom
   - 5 widgets peuvent être const
   - Fix: Ajouter const keyword

──────────────────────────────────────────────────────────────
🔧 OPTIMISATIONS SUGGÉRÉES
──────────────────────────────────────────────────────────────

### 1. ProductListPage - Rebuilds (Impact: Haute)
```dart
// Avant
Consumer<CartModel>(
  builder: (_, cart, __) => ProductList(cart: cart),
)

// Après
Selector<CartModel, int>(
  selector: (_, cart) => cart.itemCount,
  builder: (_, count, child) => child!,
  child: const ProductList(),
)
```

### 2. OrderHistoryPage - ListView (Impact: Haute)
```dart
// Avant
ListView(children: orders.map((o) => OrderTile(o)).toList())

// Après
ListView.builder(
  itemCount: orders.length,
  itemExtent: 72,
  itemBuilder: (_, i) => OrderTile(orders[i]),
)
```

### 3. ProductCard - Images (Impact: Moyenne)
```dart
// Avant
Image.network(product.imageUrl)

// Après
CachedNetworkImage(
  imageUrl: product.imageUrl,
  cacheWidth: 200,
  memCacheWidth: 200,
)
```

──────────────────────────────────────────────────────────────
📈 IMPACT ESTIMÉ
──────────────────────────────────────────────────────────────

| Optimisation | Avant | Après | Gain |
|--------------|-------|-------|------|
| ProductListPage FPS | 45 | 60 | +33% |
| Mémoire images | 85MB | 45MB | -47% |
| Time to interactive | 2.5s | 1.8s | -28% |

──────────────────────────────────────────────────────────────
📋 COMMANDES UTILES
──────────────────────────────────────────────────────────────

# Profiling
flutter run --profile
flutter analyze

# DevTools
flutter pub global activate devtools
dart devtools

# Performance overlay
MaterialApp(
  showPerformanceOverlay: true,
)
```
