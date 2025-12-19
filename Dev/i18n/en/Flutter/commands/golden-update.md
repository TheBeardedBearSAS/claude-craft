---
description: Mise à jour Golden Tests
argument-hint: [arguments]
---

# Mise à jour Golden Tests

Tu es un développeur Flutter senior. Tu dois gérer les golden tests du projet, les mettre à jour après des changements visuels intentionnels et vérifier les régressions.

## Arguments
$ARGUMENTS

Arguments :
- Action : update, check, compare
- (Optionnel) Chemin vers un test spécifique

Exemple : `/flutter:golden-update update` ou `/flutter:golden-update check test/widgets/button_test.dart`

## MISSION

### Étape 1 : Comprendre les Golden Tests

Les golden tests comparent le rendu visuel d'un widget avec une image de référence.

```dart
// test/widgets/my_button_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/widgets/my_button.dart';

void main() {
  group('MyButton Golden Tests', () {
    testWidgets('default state', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: MyButton(label: 'Click me'),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType(MyButton),
        matchesGoldenFile('goldens/my_button_default.png'),
      );
    });

    testWidgets('pressed state', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: MyButton(
                label: 'Click me',
                isPressed: true,
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType(MyButton),
        matchesGoldenFile('goldens/my_button_pressed.png'),
      );
    });

    testWidgets('disabled state', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: MyButton(
                label: 'Click me',
                isEnabled: false,
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType(MyButton),
        matchesGoldenFile('goldens/my_button_disabled.png'),
      );
    });
  });
}
```

### Étape 2 : Commandes de Base

```bash
# Vérifier les golden tests (compare avec les références)
flutter test --tags=golden

# Mettre à jour TOUS les golden tests
flutter test --update-goldens

# Mettre à jour un test spécifique
flutter test --update-goldens test/widgets/my_button_test.dart

# Lancer avec un device spécifique (important pour cohérence)
flutter test --update-goldens --device-id=linux

# Ignorer les golden tests lors du CI (si nécessaire)
flutter test --exclude-tags=golden
```

### Étape 3 : Configuration Recommandée

#### flutter_test_config.dart

```dart
// test/flutter_test_config.dart
import 'dart:async';
import 'package:flutter/material.dart';

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  // Configuration des polices pour cohérence
  TestWidgetsFlutterBinding.ensureInitialized();

  // Configurer le golden file comparator
  if (goldenFileComparator is LocalFileComparator) {
    final testUrl = (goldenFileComparator as LocalFileComparator).basedir;
    goldenFileComparator = _CustomGoldenFileComparator(testUrl);
  }

  await testMain();
}

class _CustomGoldenFileComparator extends LocalFileComparator {
  _CustomGoldenFileComparator(Uri basedir) : super(basedir);

  @override
  Future<bool> compare(Uint8List imageBytes, Uri golden) async {
    final result = await super.compare(imageBytes, golden);
    if (!result) {
      // Log plus détaillé en cas d'échec
      print('Golden test failed: $golden');
    }
    return result;
  }
}
```

#### Tags pour les Golden Tests

```dart
// test/widgets/my_button_test.dart
@Tags(['golden'])
library;

import 'package:flutter_test/flutter_test.dart';
// ...
```

### Étape 4 : Bonnes Pratiques

#### Structure des Dossiers

```
test/
├── goldens/
│   ├── widgets/
│   │   ├── my_button_default.png
│   │   ├── my_button_pressed.png
│   │   └── my_button_disabled.png
│   └── screens/
│       ├── home_screen.png
│       └── settings_screen.png
├── widgets/
│   └── my_button_test.dart
└── screens/
    └── home_screen_test.dart
```

#### Wrapper pour Tests Golden

```dart
// test/helpers/golden_test_wrapper.dart
import 'package:flutter/material.dart';

Widget goldenTestWrapper({
  required Widget child,
  ThemeData? theme,
  Size size = const Size(400, 600),
}) {
  return MaterialApp(
    debugShowCheckedModeBanner: false,
    theme: theme ?? ThemeData.light(),
    home: Scaffold(
      body: SizedBox(
        width: size.width,
        height: size.height,
        child: Center(child: child),
      ),
    ),
  );
}

// Utilisation
testWidgets('my widget golden', (tester) async {
  await tester.pumpWidget(
    goldenTestWrapper(
      child: const MyWidget(),
      size: const Size(300, 200),
    ),
  );

  await expectLater(
    find.byType(MyWidget),
    matchesGoldenFile('goldens/my_widget.png'),
  );
});
```

#### Multi-Thème et Multi-Platform

```dart
void main() {
  final themes = {
    'light': ThemeData.light(),
    'dark': ThemeData.dark(),
  };

  for (final entry in themes.entries) {
    testWidgets('MyButton - ${entry.key} theme', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: entry.value,
          home: const Scaffold(
            body: Center(child: MyButton(label: 'Test')),
          ),
        ),
      );

      await expectLater(
        find.byType(MyButton),
        matchesGoldenFile('goldens/my_button_${entry.key}.png'),
      );
    });
  }
}
```

### Étape 5 : Workflow CI/CD

```yaml
# .github/workflows/flutter.yml
name: Flutter Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'

      - name: Install dependencies
        run: flutter pub get

      - name: Run unit tests
        run: flutter test --exclude-tags=golden

      - name: Run golden tests
        run: flutter test --tags=golden
        continue-on-error: true  # Pour voir les diffs

      - name: Upload golden failures
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: golden-failures
          path: '**/failures/*.png'
```

### Étape 6 : Résoudre les Différences

```
══════════════════════════════════════════════════════════════
🖼️ GOLDEN TESTS - RÉSULTAT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RÉSUMÉ
──────────────────────────────────────────────────────────────

| Catégorie | Tests | Passés | Échoués |
|-----------|-------|--------|---------|
| Widgets | 15 | 12 | 3 |
| Screens | 8 | 8 | 0 |
| Components | 10 | 10 | 0 |
| **Total** | 33 | 30 | 3 |

──────────────────────────────────────────────────────────────
❌ TESTS ÉCHOUÉS
──────────────────────────────────────────────────────────────

### 1. my_button_default.png

Différence détectée : 2.3%

Cause probable :
- Changement de padding
- Modification de la police
- Mise à jour du thème

Actions :
- [ ] Vérifier le changement est intentionnel
- [ ] Si oui : `flutter test --update-goldens test/widgets/my_button_test.dart`
- [ ] Si non : reverter les changements

### 2. user_card_avatar.png

Différence détectée : 15.7%

Cause probable :
- Nouveau design de l'avatar
- Changement de border-radius

Actions :
- [ ] Review avec le designer
- [ ] Mettre à jour si validé

──────────────────────────────────────────────────────────────
🔧 COMMANDES
──────────────────────────────────────────────────────────────

# Voir les différences
open test/goldens/failures/

# Mettre à jour les tests échoués
flutter test --update-goldens test/widgets/my_button_test.dart

# Mettre à jour tous les golden tests
flutter test --update-goldens --tags=golden

# Lancer uniquement les golden tests
flutter test --tags=golden

──────────────────────────────────────────────────────────────
⚠️ RAPPELS
──────────────────────────────────────────────────────────────

1. Toujours vérifier visuellement avant de mettre à jour
2. Commiter les nouveaux .png avec le code
3. Utiliser le même environnement pour générer les goldens
4. Documenter les changements visuels dans la PR
```
