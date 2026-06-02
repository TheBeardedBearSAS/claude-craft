# Flutter 3.44+ / Dart 3.12+ - Quick Reference

## Versions Requises (2026)

| Composant | Version |
|-----------|---------|
| Flutter | 3.44+ |
| Dart | 3.12+ |
| DevTools | 2.42+ |
| Android SDK | 35+ |
| iOS | 15.0+ |
| Xcode | 16.0+ |

**Sources :** [Flutter 3.41 Blog](https://blog.flutter.dev/whats-new-in-flutter-3-41-302ec140e632), [Dart 3.11 Blog](https://blog.dart.dev/announcing-dart-3-11-b6529be4203a)

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

### Dart 3.11 Dot Shorthands & Patterns
```dart
// Avant
if (status == OrderStatus.active) { }

// Dart 3.11+
if (status == .active) { }

// Switch expressions
final label = status switch {
  .pending => 'En attente',
  .active => 'Actif',
  _ => 'Autre',
};

// Lint simplify_variable_pattern (Dart 3.11)
// Avant: switch(value) { case var x: ... }
// Après: switch(value) { case _: ... }
```

### Impeller par défaut (Flutter 3.41)
```yaml
# Activé par défaut sur iOS et Android (−50% rastérisation)
# Désactiver uniquement si nécessaire:
flutter:
  uses-impeller: false  # Déconseillé
```
**Source :** [Impeller performance gains](https://blog.flutter.dev/whats-new-in-flutter-3-41-302ec140e632)

### WebAssembly (Wasm) & dart:js_interop
```bash
# Build Wasm (2-3x plus rapide)
flutter build web --wasm

# Dev avec Wasm
flutter run -d chrome --wasm
```

```dart
// dart:js_util SUPPRIMÉ en Wasm
// Utiliser dart:js_interop
import 'dart:js_interop';

@JS()
external void myJsFunction();
```
**Source :** [Dart 3.11 Wasm](https://blog.dart.dev/announcing-dart-3-11-b6529be4203a)

### Material 3 Modulaire
```dart
// Packages indépendants pour Material 3
import 'package:material_color_utilities/material_color_utilities.dart';
```

### Pub Workspaces avec Globs (Dart 3.11)
```yaml
# pubspec.yaml
workspace:
  - packages/*
  - tools/**  # Glob support
```
**Source :** [Dart 3.11 Blog](https://blog.dart.dev/announcing-dart-3-11-b6529be4203a)

### Unix Domain Sockets (Windows, Dart 3.11)
```dart
// Désormais supporté sur Windows
final socket = await Socket.connect(
  InternetAddress.fromRawAddress([0], type: InternetAddressType.unix),
  0,
);
```

## State Management

```dart
// Riverpod 3.0 Mutations API (recommandé)
@riverpod
class OrderNotifier extends _$OrderNotifier {
  @override
  FutureOr<Order?> build(String id) => fetchOrder(id);
  
  // Mutations: Idle/Pending/Success/Error auto-gérés
  Future<void> updateOrder(Order order) => state.mutation(() async {
    await repository.update(order);
  });
}
```
**Source :** [Riverpod 3.0 Mutations](https://medium.com/@lee645521797/flutter-riverpod-3-0-released-a-major-redesign-of-the-state-management-framework-f7e31f19b179)

```dart
// BLoC v9: mounted safety checks
class OrderBloc extends Bloc<OrderEvent, OrderState> {
  OrderBloc() : super(OrderInitial()) {
    on<LoadOrder>(_onLoadOrder);
  }
  
  // BLoC v9: vérification automatique si le bloc est actif
  Future<void> _onLoadOrder(LoadOrder event, Emitter<OrderState> emit) async {
    if (!emit.isMounted) return;  // Nouveau dans v9
    emit(OrderLoading());
    // ...
  }
}
```
**Source :** BLoC v9 changelog

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
- `coding-standards.md` - Standards Dart 3.12+
- `wasm.md` - WebAssembly
- `mcp-integration.md` - Model Context Protocol
- `web-performance-2026.md` - Performance web

## Checklist Rapide

- [ ] Flutter 3.44+, Dart 3.12+
- [ ] Dot shorthands utilisés (Dart 3.11)
- [ ] Impeller activé (par défaut)
- [ ] dart:js_interop pour Wasm (pas dart:js_util)
- [ ] const partout où possible
- [ ] Trailing commas
- [ ] Tests > 70% coverage
- [ ] Web: Wasm build pour prod
- [ ] BLoC v9: emit.isMounted checks
- [ ] Riverpod 3: Mutations API pour async
