---
description: Análise de Performance Flutter
argument-hint: [arguments]
---

# Análise de Performance Flutter

Você é um especialista em performance Flutter. Você deve analisar o desempenho da aplicação, identificar problemas (jank, vazamentos de memória, rebuilds desnecessários) e propor otimizações.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Foco: rendering, memory, network, all

Exemplo: `/flutter:analyze-performance rendering`

## Plan Mode

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer uma investigação transversal.

## MISSÃO

### Etapa 1: Coleta de Métricas

```bash
# Executar em modo profile
flutter run --profile

# DevTools
flutter pub global activate devtools
dart devtools

# Analisar o código
dart analyze --fatal-infos
```

### Etapa 2: Análise de Renderização

#### Identificar Rebuilds Desnecessários

```dart
// Adicionar no main.dart para debug
import 'package:flutter/rendering.dart';

void main() {
  debugProfileBuildsEnabled = true;  // Log dos builds
  debugPrintRebuildDirtyWidgets = true;  // Log dos rebuilds
  runApp(const MyApp());
}
```

#### Problemas Comuns e Soluções

##### 1. Rebuilds em Cascata

```dart
// ❌ BAD - Tudo reconstrói a cada mudança
class ParentWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MyModel>(
      builder: (context, model, _) => Column(
        children: [
          HeaderWidget(title: model.title),
          BodyWidget(items: model.items),
          FooterWidget(), // Rebuild desnecessário!
        ],
      ),
    );
  }
}

// ✅ GOOD - Granularidade fina
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
        const FooterWidget(), // const = sem rebuild
      ],
    );
  }
}
```

##### 2. ListView Não Otimizada

```dart
// ❌ BAD - Cria todos os widgets de uma vez
ListView(
  children: items.map((item) => ItemWidget(item: item)).toList(),
)

// ✅ GOOD - Lazy loading
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
  // Otimizações adicionais
  cacheExtent: 500, // Pré-renderização
  addAutomaticKeepAlives: false, // Se não precisar manter o estado
)

// ✅ AINDA MELHOR - Com tamanho fixo
ListView.builder(
  itemCount: items.length,
  itemExtent: 80, // Altura fixa = cálculo otimizado
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
)
```

##### 3. Imagens Não Otimizadas

```dart
// ❌ BAD
Image.network(
  'https://example.com/large_image.jpg',
)

// ✅ GOOD - Com cache e redimensionamento
CachedNetworkImage(
  imageUrl: 'https://example.com/large_image.jpg',
  cacheWidth: 300, // Redimensionamento em memória
  cacheHeight: 300,
  memCacheWidth: 300,
  placeholder: (context, url) => const Shimmer(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
)
```

### Etapa 3: Análise de Memória

#### Detectar Vazamentos de Memória

```dart
// Verificar os dispose() ausentes
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
    _subscription.cancel();  // ✅ Importante!
    _controller.dispose();   // ✅ Importante!
    _timer?.cancel();        // ✅ Importante!
    super.dispose();
  }
}
```

#### Padrões Problemáticos

```dart
// ❌ BAD - Closure captura o context
onPressed: () async {
  await longOperation();
  Navigator.of(context).pop(); // context pode ser inválido!
}

// ✅ GOOD - Verificar o mounted
onPressed: () async {
  await longOperation();
  if (mounted) {
    Navigator.of(context).pop();
  }
}
```

### Etapa 4: Otimizações Recomendadas

#### Checklist de Otimização de Widgets

```dart
// 1. Usar const sempre que possível
const MyWidget(); // ✅

// 2. RepaintBoundary para partes custosas
RepaintBoundary(
  child: ExpensiveWidget(),
)

// 3. Separar os widgets que mudam com frequência
class OptimizedWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const StaticHeader(),      // Nunca reconstrói
        const AnimatedCounter(),   // Isolado
        const StaticFooter(),      // Nunca reconstrói
      ],
    );
  }
}

// 4. Evitar builds dentro de builds
// ❌ BAD
build(context) {
  final items = generateItems(); // Chamado a cada build!
  return ListView.builder(...);
}

// ✅ GOOD
late final items = generateItems(); // Apenas uma vez

// 5. Usar Keys corretamente
ListView.builder(
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id), // Key estável
    item: items[index],
  ),
)
```

### Etapa 5: Gerar o Relatório

```
══════════════════════════════════════════════════════════════
📊 RELATÓRIO DE PERFORMANCE FLUTTER
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 MÉTRICAS DE RENDERIZAÇÃO
──────────────────────────────────────────────────────────────

| Página  | Build Time | Raster Time | FPS | Status |
|---------|------------|-------------|-----|--------|
| Home    | 8ms        | 12ms        | 60  | ✅     |
| List    | 45ms       | 35ms        | 45  | ⚠️     |
| Detail  | 15ms       | 18ms        | 58  | ✅     |

Limites:
- Build < 16ms : ✅
- Build > 16ms : ⚠️ Jank possível
- Build > 32ms : ❌ Jank visível

──────────────────────────────────────────────────────────────
🧠 MÉTRICAS DE MEMÓRIA
──────────────────────────────────────────────────────────────

| Métrica        | Valor  | Limite   | Status |
|----------------|--------|----------|--------|
| Heap Used      | 85MB   | < 150MB  | ✅     |
| Heap Capacity  | 120MB  | < 200MB  | ✅     |
| External       | 25MB   | < 50MB   | ✅     |
| RSS            | 180MB  | < 300MB  | ✅     |

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS DETECTADOS
──────────────────────────────────────────────────────────────

### Crítico
1. **Rebuilds excessivos** - ProductListPage
   - 150 rebuilds/seg detectados
   - Causa: Provider no nível errado
   - Correção: Usar Selector ou Consumer granular

### Importante
2. **ListView não otimizada** - OrderHistoryPage
   - Sem itemExtent definido
   - 500+ itens sem lazy loading
   - Correção: ListView.builder com itemExtent

3. **Imagens sem cache** - ProductCard
   - Image.network sem cache
   - Correção: Usar cached_network_image

### Menor
4. **Widgets não const** - AppBar customizada
   - 5 widgets podem ser const
   - Correção: Adicionar a palavra-chave const

──────────────────────────────────────────────────────────────
🔧 OTIMIZAÇÕES SUGERIDAS
──────────────────────────────────────────────────────────────

### 1. ProductListPage - Rebuilds (Impacto: Alto)
```dart
// Antes
Consumer<CartModel>(
  builder: (_, cart, __) => ProductList(cart: cart),
)

// Depois
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

// Depois
ListView.builder(
  itemCount: orders.length,
  itemExtent: 72,
  itemBuilder: (_, i) => OrderTile(orders[i]),
)
```

### 3. ProductCard - Imagens (Impacto: Médio)
```dart
// Antes
Image.network(product.imageUrl)

// Depois
CachedNetworkImage(
  imageUrl: product.imageUrl,
  cacheWidth: 200,
  memCacheWidth: 200,
)
```

──────────────────────────────────────────────────────────────
📈 IMPACTO ESTIMADO
──────────────────────────────────────────────────────────────

| Otimização               | Antes | Depois | Ganho |
|--------------------------|-------|--------|-------|
| ProductListPage FPS      | 45    | 60     | +33%  |
| Memória de imagens       | 85MB  | 45MB   | -47%  |
| Time to interactive      | 2.5s  | 1.8s   | -28%  |

──────────────────────────────────────────────────────────────
📋 COMANDOS ÚTEIS
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
