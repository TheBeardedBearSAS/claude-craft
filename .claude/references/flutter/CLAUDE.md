# Flutter 3.38+ / Dart 3.10+ - Quick Reference

## Versions Requises (2026)

| Composant | Version |
|-----------|---------|
| Flutter | 3.38.6+ |
| Dart | 3.10+ |
| DevTools | 2.40+ |
| Android SDK | 34+ |
| iOS | 15.0+ |
| Xcode | 15.0+ |

## Architecture Clean

```
lib/
├── core/               # Constantes, erreurs, utils, theme
├── features/           # Modules métier
│   └── [feature]/
│       ├── data/       # Datasources, models, repos impl
│       ├── domain/     # Entities, repos interface, usecases
│       └── presentation/  # BLoC/Riverpod, pages, widgets
├── dependency_injection.dart
└── main.dart
```

## Nouvelles Features 2026

### Dart 3.10 Dot Shorthands
```dart
// Avant
if (status == OrderStatus.active) { }

// Dart 3.10+
if (status == .active) { }

// Switch expressions
final label = status switch {
  .pending => 'En attente',
  .active => 'Actif',
  _ => 'Autre',
};
```

### WebAssembly (Wasm)
```bash
# Build Wasm (2-3x plus rapide)
flutter build web --wasm

# Dev avec Wasm
flutter run -d chrome --wasm
```
Voir: `wasm.md`

### Model Context Protocol (MCP)
```dart
// Intégration AI assistants
import 'package:mcp_client/mcp_client.dart';
```
Voir: `mcp-integration.md`

### Web Performance 2026
- Hot reload web stable
- WebAssembly GC
- dart:js_interop (remplace dart:js)
Voir: `web-performance-2026.md`

## State Management

```dart
// Riverpod 3.x (recommandé)
@riverpod
class OrderNotifier extends _$OrderNotifier {
  @override
  FutureOr<Order?> build(String id) => fetchOrder(id);
}

// BLoC 9.x
class OrderBloc extends Bloc<OrderEvent, OrderState> {
  OrderBloc() : super(OrderInitial()) {
    on<LoadOrder>(_onLoadOrder);
  }
}
```

## Commandes

```bash
# Build
flutter build apk --release
flutter build ios --release
flutter build web --wasm

# Tests
flutter test
flutter test --coverage

# Analyse
flutter analyze
dart fix --apply

# Code generation
dart run build_runner build -d
```

## Documentation Complète

- `project-context.md` - Contexte projet
- `coding-standards.md` - Standards Dart 3.10+
- `wasm.md` - WebAssembly
- `mcp-integration.md` - Model Context Protocol
- `web-performance-2026.md` - Performance web

## Checklist Rapide

- [ ] Flutter 3.38+, Dart 3.10+
- [ ] Dot shorthands utilisés
- [ ] const partout où possible
- [ ] Trailing commas
- [ ] Tests > 70% coverage
- [ ] Web: Wasm build pour prod
