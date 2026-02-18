---
description: Flutter Performance-Analyse
argument-hint: [arguments]
---

# Flutter Performance-Analyse

Du bist ein Flutter Performance-Experte. Du musst die Performance der Anwendung analysieren, Probleme identifizieren (Jank, Memory Leaks, unnötige Rebuilds) und Optimierungen vorschlagen.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Fokus: rendering, memory, network, all

Beispiel: `/flutter:analyze-performance rendering`

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

### Schritt 1: Metriken Erfassen

```bash
# Im Profile-Modus starten
flutter run --profile

# DevTools
flutter pub global activate devtools
dart devtools

# Code analysieren
dart analyze --fatal-infos
```

### Schritt 2: Rendering-Analyse

#### Unnötige Rebuilds Identifizieren

```dart
// In main.dart für Debugging hinzufügen
import 'package:flutter/rendering.dart';

void main() {
  debugProfileBuildsEnabled = true;  // Build-Logging
  debugPrintRebuildDirtyWidgets = true;  // Rebuild-Logging
  runApp(const MyApp());
}
```

#### Häufige Probleme und Lösungen

##### 1. Kaskadenartige Rebuilds

```dart
// ❌ SCHLECHT - Alles wird bei jeder Änderung neu gebaut
class ParentWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MyModel>(
      builder: (context, model, _) => Column(
        children: [
          HeaderWidget(title: model.title),
          BodyWidget(items: model.items),
          FooterWidget(), // Unnötiger Rebuild!
        ],
      ),
    );
  }
}

// ✅ GUT - Feine Granularität
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
        const FooterWidget(), // const = kein Rebuild
      ],
    );
  }
}
```

##### 2. Nicht Optimierte ListView

```dart
// ❌ SCHLECHT - Erstellt alle Widgets auf einmal
ListView(
  children: items.map((item) => ItemWidget(item: item)).toList(),
)

// ✅ GUT - Lazy Loading
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
  // Zusätzliche Optimierungen
  cacheExtent: 500, // Vor-Rendering
  addAutomaticKeepAlives: false, // Falls Zustand nicht erhalten werden muss
)

// ✅ NOCH BESSER - Mit fester Größe
ListView.builder(
  itemCount: items.length,
  itemExtent: 80, // Feste Höhe = optimierte Berechnung
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
)
```

##### 3. Nicht Optimierte Bilder

```dart
// ❌ SCHLECHT
Image.network(
  'https://example.com/large_image.jpg',
)

// ✅ GUT - Mit Cache und Resize
CachedNetworkImage(
  imageUrl: 'https://example.com/large_image.jpg',
  cacheWidth: 300, // Im Speicher resizen
  cacheHeight: 300,
  memCacheWidth: 300,
  placeholder: (context, url) => const Shimmer(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
)
```

### Schritt 3: Speicher-Analyse

#### Memory Leaks Erkennen

```dart
// Fehlende dispose() prüfen
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
    _subscription.cancel();  // ✅ Wichtig!
    _controller.dispose();   // ✅ Wichtig!
    _timer?.cancel();        // ✅ Wichtig!
    super.dispose();
  }
}
```

#### Problematische Patterns

```dart
// ❌ SCHLECHT - Closure erfasst den Kontext
onPressed: () async {
  await longOperation();
  Navigator.of(context).pop(); // Kontext kann ungültig sein!
}

// ✅ GUT - Mounted prüfen
onPressed: () async {
  await longOperation();
  if (mounted) {
    Navigator.of(context).pop();
  }
}
```

### Schritt 4: Empfohlene Optimierungen

#### Widget Optimization Checklist

```dart
// 1. const überall wo möglich verwenden
const MyWidget(); // ✅

// 2. RepaintBoundary für teure Teile
RepaintBoundary(
  child: ExpensiveWidget(),
)

// 3. Oft ändernde Widgets separieren
class OptimizedWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const StaticHeader(),      // Niemals Rebuild
        const AnimatedCounter(),   // Isoliert
        const StaticFooter(),      // Niemals Rebuild
      ],
    );
  }
}

// 4. Builds in Builds vermeiden
// ❌ SCHLECHT
build(context) {
  final items = generateItems(); // Bei jedem Build aufgerufen!
  return ListView.builder(...);
}

// ✅ GUT
late final items = generateItems(); // Nur einmal

// 5. Keys korrekt verwenden
ListView.builder(
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id), // Stabile Key
    item: items[index],
  ),
)
```

### Schritt 5: Bericht Erstellen

```
══════════════════════════════════════════════════════════════
📊 FLUTTER PERFORMANCE-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 RENDERING-METRIKEN
──────────────────────────────────────────────────────────────

| Seite | Build-Zeit | Raster-Zeit | FPS | Status |
|-------|-----------|-------------|-----|--------|
| Home | 8ms | 12ms | 60 | ✅ |
| Liste | 45ms | 35ms | 45 | ⚠️ |
| Detail | 15ms | 18ms | 58 | ✅ |

Schwellenwerte:
- Build < 16ms : ✅
- Build > 16ms : ⚠️ Möglicher Jank
- Build > 32ms : ❌ Sichtbarer Jank

──────────────────────────────────────────────────────────────
🧠 SPEICHER-METRIKEN
──────────────────────────────────────────────────────────────

| Metrik | Wert | Schwelle | Status |
|--------|------|----------|--------|
| Heap Verwendet | 85MB | < 150MB | ✅ |
| Heap Kapazität | 120MB | < 200MB | ✅ |
| Extern | 25MB | < 50MB | ✅ |
| RSS | 180MB | < 300MB | ✅ |

──────────────────────────────────────────────────────────────
⚠️ ERKANNTE PROBLEME
──────────────────────────────────────────────────────────────

### Kritisch
1. **Excessive Rebuilds** - ProductListPage
   - 150 Rebuilds/Sek erkannt
   - Ursache: Provider auf falscher Ebene
   - Fix: Selector oder granularen Consumer verwenden

### Wichtig
2. **Nicht optimierte ListView** - OrderHistoryPage
   - Kein itemExtent definiert
   - 500+ Items ohne Lazy Loading
   - Fix: ListView.builder mit itemExtent

3. **Bilder ohne Cache** - ProductCard
   - Image.network ohne Cache
   - Fix: cached_network_image verwenden

### Geringfügig
4. **Nicht-const Widgets** - Benutzerdefinierte AppBar
   - 5 Widgets können const sein
   - Fix: const Keyword hinzufügen

──────────────────────────────────────────────────────────────
🔧 VORGESCHLAGENE OPTIMIERUNGEN
──────────────────────────────────────────────────────────────

### 1. ProductListPage - Rebuilds (Impact: Hoch)
```dart
// Vorher
Consumer<CartModel>(
  builder: (_, cart, __) => ProductList(cart: cart),
)

// Nachher
Selector<CartModel, int>(
  selector: (_, cart) => cart.itemCount,
  builder: (_, count, child) => child!,
  child: const ProductList(),
)
```

### 2. OrderHistoryPage - ListView (Impact: Hoch)
```dart
// Vorher
ListView(children: orders.map((o) => OrderTile(o)).toList())

// Nachher
ListView.builder(
  itemCount: orders.length,
  itemExtent: 72,
  itemBuilder: (_, i) => OrderTile(orders[i]),
)
```

### 3. ProductCard - Bilder (Impact: Mittel)
```dart
// Vorher
Image.network(product.imageUrl)

// Nachher
CachedNetworkImage(
  imageUrl: product.imageUrl,
  cacheWidth: 200,
  memCacheWidth: 200,
)
```

──────────────────────────────────────────────────────────────
📈 GESCHÄTZTE AUSWIRKUNG
──────────────────────────────────────────────────────────────

| Optimierung | Vorher | Nachher | Gewinn |
|-------------|--------|---------|--------|
| ProductListPage FPS | 45 | 60 | +33% |
| Bildspeicher | 85MB | 45MB | -47% |
| Time to Interactive | 2.5s | 1.8s | -28% |

──────────────────────────────────────────────────────────────
📋 NÜTZLICHE BEFEHLE
──────────────────────────────────────────────────────────────

# Profiling
flutter run --profile
flutter analyze

# DevTools
flutter pub global activate devtools
dart devtools

# Performance Overlay
MaterialApp(
  showPerformanceOverlay: true,
)
```
