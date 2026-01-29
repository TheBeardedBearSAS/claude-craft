# WebAssembly (Wasm) - Flutter 3.38+

## Overview

Flutter 3.38+ offre un support WebAssembly stable, permettant des performances 2-3x supérieures au JavaScript traditionnel pour les applications web.

**Avantages:**
- Performance 2-3x plus rapide
- Temps de chargement réduit
- Garbage Collection Wasm natif
- Exécution plus prévisible

## Prérequis

### Versions Minimales

| Composant | Version |
|-----------|---------|
| Flutter | 3.38.6+ |
| Dart | 3.10+ |
| Chrome | 120+ |
| Edge | 120+ |
| Firefox | 120+ |
| Safari | 18+ |

### Vérification

```bash
# Vérifier la version Flutter
flutter --version

# Vérifier le support Wasm
flutter doctor -v

# Activer le web
flutter config --enable-web
```

## Build Wasm

### Production

```bash
# Build WebAssembly optimisé
flutter build web --wasm

# Build avec source maps (debug)
flutter build web --wasm --source-maps

# Build avec base href personnalisée
flutter build web --wasm --base-href /my-app/
```

### Développement

```bash
# Run en mode Wasm dev
flutter run -d chrome --wasm

# Run avec hot reload (stable dans 3.38+)
flutter run -d chrome --wasm --hot
```

## Configuration

### pubspec.yaml

```yaml
name: my_app
description: A Flutter Wasm application.

publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.10.0 <4.0.0'
  flutter: '>=3.38.0'

dependencies:
  flutter:
    sdk: flutter

# Dépendances Wasm-compatibles
dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.0
```

### web/index.html

```html
<!DOCTYPE html>
<html>
<head>
  <base href="$FLUTTER_BASE_HREF">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <script>
    // Feature detection pour Wasm
    const wasmSupported = (() => {
      try {
        if (typeof WebAssembly === 'object' &&
            typeof WebAssembly.instantiate === 'function') {
          const module = new WebAssembly.Module(
            Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
          );
          if (module instanceof WebAssembly.Module) {
            return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
          }
        }
      } catch (e) {}
      return false;
    })();

    if (!wasmSupported) {
      document.body.innerHTML = '<h1>WebAssembly non supporté</h1><p>Veuillez mettre à jour votre navigateur.</p>';
    }
  </script>
  <script src="flutter_bootstrap.js" async></script>
</body>
</html>
```

## Interopérabilité JavaScript

### dart:js_interop (Recommandé)

```dart
import 'dart:js_interop';

// Déclarer une fonction JS externe
@JS('console.log')
external void consoleLog(String message);

// Extension type pour objets JS
extension type JSWindow(JSObject _) implements JSObject {
  external String get location;
  external void alert(String message);
}

// Utilisation
void logMessage(String msg) {
  consoleLog('Flutter Wasm: $msg');
}
```

### Appeler du JavaScript depuis Dart

```dart
import 'dart:js_interop';

// Fonction JS
@JS()
external JSPromise<JSString> fetchData(String url);

// Wrapper async Dart
Future<String> getData(String url) async {
  final jsPromise = fetchData(url);
  final jsResult = await jsPromise.toDart;
  return jsResult.toDart;
}
```

### Exposer des fonctions Dart au JavaScript

```dart
import 'dart:js_interop';

// Fonction exportée vers JS
@JSExport()
void handleCallback(String data) {
  print('Received from JS: $data');
}

// Enregistrer l'export
void registerCallbacks() {
  final global = globalContext;
  global['flutterCallback'] = handleCallback.toJS;
}
```

## Optimisations Performance

### 1. Tree Shaking Agressif

```dart
// ✅ BON - Import spécifique
import 'package:my_lib/feature.dart' show SpecificClass;

// ❌ MAUVAIS - Import complet
import 'package:my_lib/my_lib.dart';
```

### 2. Lazy Loading

```dart
// Chargement différé pour réduire le bundle initial
import 'package:my_app/features/reports/reports.dart' deferred as reports;

Future<void> loadReports() async {
  await reports.loadLibrary();
  reports.showReportsPage();
}
```

### 3. Const Constructors

```dart
// ✅ BON - Widgets const pour Wasm
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Static text'),
        Icon(Icons.star),
      ],
    );
  }
}
```

### 4. Image Optimization

```dart
// Utiliser le cache d'images
Image.network(
  'https://example.com/image.webp',
  cacheWidth: 300,  // Redimensionner côté client
  cacheHeight: 300,
)

// Précharger les images critiques
void precacheImages(BuildContext context) {
  precacheImage(
    const NetworkImage('https://example.com/hero.webp'),
    context,
  );
}
```

## Gestion des Assets

### Chunking

```yaml
# pubspec.yaml - Assets organisés par feature
flutter:
  assets:
    - assets/common/
    - assets/feature_home/
    - assets/feature_profile/
```

### Fonts Subsetting

```yaml
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

## Debugging Wasm

### DevTools

```bash
# Lancer avec DevTools
flutter run -d chrome --wasm --start-paused

# Ouvrir DevTools manuellement
flutter attach --debug-uri <uri>
```

### Source Maps

```bash
# Build avec source maps
flutter build web --wasm --source-maps

# Les source maps permettent le debugging dans Chrome DevTools
```

### Logging

```dart
// Logger compatible Wasm
import 'dart:developer' as developer;

void log(String message) {
  developer.log(message, name: 'MyApp');
}
```

## Fallback JavaScript

### Détection et Fallback

```html
<!-- web/index.html -->
<script>
  const loadApp = async () => {
    const wasmSupported = typeof WebAssembly !== 'undefined';

    if (wasmSupported) {
      // Charger la version Wasm
      await import('./main.dart.wasm.js');
    } else {
      // Fallback JavaScript
      await import('./main.dart.js');
    }
  };

  loadApp();
</script>
```

### Build Dual

```bash
# Build Wasm + JS fallback
flutter build web --wasm
flutter build web --output=build/web-js
```

## Métriques Performance

### Comparaison JS vs Wasm

| Métrique | JavaScript | WebAssembly |
|----------|------------|-------------|
| First Paint | 1.5s | 0.8s |
| TTI | 3.0s | 1.5s |
| Bundle Size | 2.5 MB | 1.8 MB |
| Memory Usage | 150 MB | 100 MB |
| Frame Rate | 45 FPS | 60 FPS |

### Mesurer

```dart
import 'dart:developer' as developer;

void measurePerformance() {
  final stopwatch = Stopwatch()..start();

  // Code à mesurer
  heavyComputation();

  stopwatch.stop();
  developer.log(
    'Computation took ${stopwatch.elapsedMilliseconds}ms',
    name: 'Performance',
  );
}
```

## Limitations Actuelles

### Non supporté en Wasm

| Feature | Statut | Alternative |
|---------|--------|-------------|
| dart:mirrors | Non supporté | build_runner |
| dart:io | Non supporté | dart:html, package:http |
| Isolates | Limité | Web Workers |
| FFI | Non supporté | dart:js_interop |

### Workarounds

```dart
// Vérifier l'environnement
import 'dart:js_interop';

bool get isWasm => const bool.fromEnvironment('dart.tool.dart2wasm');

// Comportement conditionnel
if (isWasm) {
  // Code optimisé Wasm
} else {
  // Fallback JS
}
```

## CI/CD

### GitHub Actions

```yaml
name: Build Flutter Web Wasm

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.38.6'
          channel: 'stable'

      - name: Get dependencies
        run: flutter pub get

      - name: Build Wasm
        run: flutter build web --wasm --release

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-wasm
          path: build/web
```

## Ressources

- [Flutter Wasm Documentation](https://docs.flutter.dev/platform-integration/web/wasm)
- [Dart JS Interop](https://dart.dev/interop/js-interop)
- [WebAssembly GC](https://github.com/nicolo-ribaudo/webassembly-proposals)
- [Flutter Web Performance](https://docs.flutter.dev/perf/best-practices)

---

**Date de dernière mise à jour:** 2026-01-29
**Version:** 1.0.0
