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

**Sources :** [Flutter 3.44 Blog](https://blog.flutter.dev/whats-new-in-flutter-3-44-b0cc1ad3c527), [Dart 3.12 Blog](https://dart.dev/blog/announcing-dart-3-12)

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

### Impeller par défaut (Flutter 3.44)
```yaml
# Activé par défaut sur iOS et Android (−50% rastérisation)
# Désactiver uniquement si nécessaire:
flutter:
  uses-impeller: false  # Déconseillé
```
**Source :** [Impeller performance gains](https://blog.flutter.dev/whats-new-in-flutter-3-44-b0cc1ad3c527)

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
**Source :** [Dart 3.12 Wasm](https://dart.dev/blog/announcing-dart-3-12)

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
**Source :** [Dart 3.11 Blog](https://dart.dev/blog/announcing-dart-3-11)

### Unix Domain Sockets (Windows, Dart 3.11)
```dart
// Désormais supporté sur Windows
final socket = await Socket.connect(
  InternetAddress.fromRawAddress([0], type: InternetAddressType.unix),
  0,
);
```

### Dart 3.12 Features
```dart
// (a) Primary constructors (expérimental)
class Point(final int x, final int y);
// Activer : --enable-experiment=primary-constructors

// (b) Private named parameters
class Hummingbird {
  final String _petName;
  final int _wingbeatsPerSecond;
  Hummingbird({required this._petName, required this._wingbeatsPerSecond});
}
// Appel : Hummingbird(petName: 'Dash', wingbeatsPerSecond: 75)
// Le _ dans le champ → paramètre nommé public à l'appel
```

**Agentic Hot Reload (Dart 3.12):** Le Dart & Flutter MCP Server permet aux agents IA (Claude Code, Cursor) de déclencher automatiquement le hot reload après chaque modification, sans copie manuelle d'URI.
**Source :** [Dart 3.12 Blog](https://dart.dev/blog/announcing-dart-3-12)

## State Management

```dart
// Riverpod 3.0 Mutations API (recommandé)
@riverpod
class OrderNotifier extends _$OrderNotifier {
  @override
  FutureOr<Order?> build(String id) => fetchOrder(id);
  
  // Pas de state.mutation() — les Mutations sont des objets top-level
  // Voir state-management.md pour l'API Riverpod 3.0 Mutations correcte
}
```
**Sources :** [Riverpod — What's New](https://riverpod.dev/docs/whats_new) | [pub.dev/packages/flutter_riverpod](https://pub.dev/packages/flutter_riverpod)

```dart
// BLoC v9: mounted safety checks
class OrderBloc extends Bloc<OrderEvent, OrderState> {
  OrderBloc() : super(OrderInitial()) {
    on<LoadOrder>(_onLoadOrder);
  }
  
  // BLoC v9: vérification automatique si le bloc est actif
  Future<void> _onLoadOrder(LoadOrder event, Emitter<OrderState> emit) async {
    if (emit.isDone) return;  // BLoC v9: Emitter.isDone (isMounted n'existe pas)
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
- [ ] Tests >= 80% coverage
- [ ] Web: Wasm build pour prod
- [ ] BLoC v9: emit.isDone checks (Emitter) / isClosed checks (Cubit)
- [ ] Riverpod 3: Mutations API pour async
