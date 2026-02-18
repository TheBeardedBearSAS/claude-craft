---
description: Análisis de Rendimiento Flutter
argument-hint: [arguments]
---

# Análisis de Rendimiento Flutter

Eres un experto en rendimiento de Flutter. Debes analizar el rendimiento de la aplicación, identificar problemas (jank, memory leaks, rebuilds innecesarios) y proponer optimizaciones.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Enfoque: rendering, memory, network, all

Ejemplo: `/flutter:analyze-performance rendering`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

### Etapa 1: Recopilación de Métricas

```bash
# Ejecutar en modo profile
flutter run --profile

# DevTools
flutter pub global activate devtools
dart devtools

# Analizar el código
dart analyze --fatal-infos
```

### Etapa 2: Análisis del Rendering

#### Identificar Rebuilds Innecesarios

```dart
// Agregar en main.dart para debug
import 'package:flutter/rendering.dart';

void main() {
  debugProfileBuildsEnabled = true;  // Log los builds
  debugPrintRebuildDirtyWidgets = true;  // Log los rebuilds
  runApp(const MyApp());
}
```

#### Problemas Comunes y Soluciones

##### 1. Rebuilds en Cascada

```dart
// ❌ MAL - Todo rebuild en cada cambio
class ParentWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MyModel>(
      builder: (context, model, _) => Column(
        children: [
          HeaderWidget(title: model.title),
          BodyWidget(items: model.items),
          FooterWidget(), // ¡Rebuild innecesario!
        ],
      ),
    );
  }
}

// ✅ BIEN - Granularidad fina
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
        const FooterWidget(), // const = sin rebuild
      ],
    );
  }
}
```

##### 2. ListView No Optimizado

```dart
// ❌ MAL - Crea todos los widgets de una vez
ListView(
  children: items.map((item) => ItemWidget(item: item)).toList(),
)

// ✅ BIEN - Lazy loading
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
  // Optimizaciones adicionales
  cacheExtent: 500, // Pre-render
  addAutomaticKeepAlives: false, // Si no necesita mantener el estado
)

// ✅ AÚN MEJOR - Con tamaño fijo
ListView.builder(
  itemCount: items.length,
  itemExtent: 80, // Altura fija = cálculo optimizado
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
)
```

##### 3. Imágenes No Optimizadas

```dart
// ❌ MAL
Image.network(
  'https://example.com/large_image.jpg',
)

// ✅ BIEN - Con cache y resize
CachedNetworkImage(
  imageUrl: 'https://example.com/large_image.jpg',
  cacheWidth: 300, // Resize en memoria
  cacheHeight: 300,
  memCacheWidth: 300,
  placeholder: (context, url) => const Shimmer(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
)
```

### Etapa 3: Análisis de Memoria

#### Detectar Memory Leaks

```dart
// Verificar dispose() faltantes
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
    _subscription.cancel();  // ✅ ¡Importante!
    _controller.dispose();   // ✅ ¡Importante!
    _timer?.cancel();        // ✅ ¡Importante!
    super.dispose();
  }
}
```

#### Patrones Problemáticos

```dart
// ❌ MAL - Closure captura el context
onPressed: () async {
  await longOperation();
  Navigator.of(context).pop(); // ¡context puede ser inválido!
}

// ✅ BIEN - Verificar el mounted
onPressed: () async {
  await longOperation();
  if (mounted) {
    Navigator.of(context).pop();
  }
}
```

### Etapa 4: Optimizaciones Recomendadas

#### Widget Optimization Checklist

```dart
// 1. Usar const donde sea posible
const MyWidget(); // ✅

// 2. RepaintBoundary para partes costosas
RepaintBoundary(
  child: ExpensiveWidget(),
)

// 3. Separar los widgets que cambian frecuentemente
class OptimizedWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const StaticHeader(),      // Nunca rebuild
        const AnimatedCounter(),   // Aislado
        const StaticFooter(),      // Nunca rebuild
      ],
    );
  }
}

// 4. Evitar builds dentro de builds
// ❌ MAL
build(context) {
  final items = generateItems(); // ¡Llamado en cada build!
  return ListView.builder(...);
}

// ✅ BIEN
late final items = generateItems(); // Una sola vez

// 5. Usar Keys correctamente
ListView.builder(
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id), // Key estable
    item: items[index],
  ),
)
```

### Etapa 5: Generar el Reporte

```
══════════════════════════════════════════════════════════════
📊 REPORTE DE RENDIMIENTO FLUTTER
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 MÉTRICAS DE RENDERING
──────────────────────────────────────────────────────────────

| Página | Build Time | Raster Time | FPS | Estado |
|------|------------|-------------|-----|--------|
| Home | 8ms | 12ms | 60 | ✅ |
| List | 45ms | 35ms | 45 | ⚠️ |
| Detail | 15ms | 18ms | 58 | ✅ |

Umbrales:
- Build < 16ms: ✅
- Build > 16ms: ⚠️ Jank posible
- Build > 32ms: ❌ Jank visible

──────────────────────────────────────────────────────────────
🧠 MÉTRICAS DE MEMORIA
──────────────────────────────────────────────────────────────

| Métrica | Valor | Umbral | Estado |
|----------|--------|-------|--------|
| Heap Used | 85MB | < 150MB | ✅ |
| Heap Capacity | 120MB | < 200MB | ✅ |
| External | 25MB | < 50MB | ✅ |
| RSS | 180MB | < 300MB | ✅ |

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS DETECTADOS
──────────────────────────────────────────────────────────────

### Crítico
1. **Rebuilds excesivos** - ProductListPage
   - 150 rebuilds/sec detectados
   - Causa: Provider en el nivel incorrecto
   - Fix: Usar Selector o Consumer granular

### Importante
2. **ListView no optimizado** - OrderHistoryPage
   - Sin itemExtent definido
   - 500+ items sin lazy loading
   - Fix: ListView.builder con itemExtent

3. **Imágenes sin cache** - ProductCard
   - Image.network sin cache
   - Fix: Usar cached_network_image

### Menor
4. **Widgets no const** - AppBar personalizado
   - 5 widgets pueden ser const
   - Fix: Agregar const keyword

──────────────────────────────────────────────────────────────
🔧 OPTIMIZACIONES SUGERIDAS
──────────────────────────────────────────────────────────────

### 1. ProductListPage - Rebuilds (Impacto: Alto)
```dart
// Antes
Consumer<CartModel>(
  builder: (_, cart, __) => ProductList(cart: cart),
)

// Después
Selector<CartModel, int>(
  selector: (_, cart) => cart.itemCount,
  builder: (_, count, child) => child!,
  child: const ProductList(),
)
```

### 2. OrderHistoryPage - ListView (Impacto: Alto)
```dart
// Antes
ListView(children: orders.map((o) => OrderTile(o)).toList())

// Después
ListView.builder(
  itemCount: orders.length,
  itemExtent: 72,
  itemBuilder: (_, i) => OrderTile(orders[i]),
)
```

### 3. ProductCard - Imágenes (Impacto: Medio)
```dart
// Antes
Image.network(product.imageUrl)

// Después
CachedNetworkImage(
  imageUrl: product.imageUrl,
  cacheWidth: 200,
  memCacheWidth: 200,
)
```

──────────────────────────────────────────────────────────────
📈 IMPACTO ESTIMADO
──────────────────────────────────────────────────────────────

| Optimización | Antes | Después | Ganancia |
|--------------|-------|-------|------|
| ProductListPage FPS | 45 | 60 | +33% |
| Memoria imágenes | 85MB | 45MB | -47% |
| Time to interactive | 2.5s | 1.8s | -28% |

──────────────────────────────────────────────────────────────
📋 COMANDOS ÚTILES
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
