---
description: Generación Widget Flutter con Tests
argument-hint: [arguments]
---

# Generación Widget Flutter con Tests

Tu es un développeur Flutter senior. Tu dois générer un widget réutilisable avec documentation, tests unitaires et widget tests.

## Argumentos
$ARGUMENTS

Arguments :
- Nom du widget (ex: `CustomButton`, `UserCard`)
- (Optionnel) Type (stateless, stateful, hook)

Exemple : `/flutter:generate-widget UserCard stateless`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Étape 1 : Créer le Widget

#### StatelessWidget
```dart
// lib/shared/widgets/{widget_name}.dart
import 'package:flutter/material.dart';

/// Un widget qui affiche {description}.
///
/// Exemple d'utilisation :
/// ```dart
/// {WidgetName}(
///   title: 'Mon titre',
///   onTap: () => print('Tapped'),
/// )
/// ```
class {WidgetName} extends StatelessWidget {
  /// Le titre affiché dans le widget.
  final String title;

  /// Le sous-titre optionnel.
  final String? subtitle;

  /// L'icône affichée à gauche.
  final IconData? leadingIcon;

  /// Callback appelé lors du tap.
  final VoidCallback? onTap;

  /// Indique si le widget est activé.
  final bool isEnabled;

  /// Crée un nouveau [{WidgetName}].
  const {WidgetName}({
    super.key,
    required this.title,
    this.subtitle,
    this.leadingIcon,
    this.onTap,
    this.isEnabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Semantics(
      button: onTap != null,
      enabled: isEnabled,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? onTap : null,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                if (leadingIcon != null) ...[
                  Icon(
                    leadingIcon,
                    color: isEnabled
                        ? theme.colorScheme.primary
                        : theme.disabledColor,
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: isEnabled ? null : theme.disabledColor,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          subtitle!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color
                                ?.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (onTap != null)
                  Icon(
                    Icons.chevron_right,
                    color: isEnabled
                        ? theme.colorScheme.onSurface.withOpacity(0.5)
                        : theme.disabledColor,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

#### StatefulWidget (avec animation)
```dart
// lib/shared/widgets/{widget_name}.dart
import 'package:flutter/material.dart';

class {WidgetName} extends StatefulWidget {
  final String title;
  final bool isExpanded;
  final Widget child;
  final ValueChanged<bool>? onExpansionChanged;

  const {WidgetName}({
    super.key,
    required this.title,
    this.isExpanded = false,
    required this.child,
    this.onExpansionChanged,
  });

  @override
  State<{WidgetName}> createState() => _{WidgetName}State();
}

class _{WidgetName}State extends State<{WidgetName}>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _heightFactor;
  late Animation<double> _iconTurns;

  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _isExpanded = widget.isExpanded;

    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    _heightFactor = _controller.drive(CurveTween(curve: Curves.easeIn));
    _iconTurns = _controller.drive(
      Tween<double>(begin: 0.0, end: 0.5).chain(
        CurveTween(curve: Curves.easeIn),
      ),
    );

    if (_isExpanded) {
      _controller.value = 1.0;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
      widget.onExpansionChanged?.call(_isExpanded);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            InkWell(
              onTap: _handleTap,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.title,
                        style: theme.textTheme.titleMedium,
                      ),
                    ),
                    RotationTransition(
                      turns: _iconTurns,
                      child: const Icon(Icons.expand_more),
                    ),
                  ],
                ),
              ),
            ),
            ClipRect(
              child: Align(
                heightFactor: _heightFactor.value,
                child: child,
              ),
            ),
          ],
        );
      },
      child: widget.child,
    );
  }
}
```

### Étape 2 : Tests

#### Widget Test
```dart
// test/shared/widgets/{widget_name}_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:app/shared/widgets/{widget_name}.dart';

void main() {
  group('{WidgetName}', () {
    testWidgets('renders correctly with required props', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: {WidgetName}(
              title: 'Test Title',
            ),
          ),
        ),
      );

      expect(find.text('Test Title'), findsOneWidget);
    });

    testWidgets('renders subtitle when provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: {WidgetName}(
              title: 'Test Title',
              subtitle: 'Test Subtitle',
            ),
          ),
        ),
      );

      expect(find.text('Test Subtitle'), findsOneWidget);
    });

    testWidgets('renders leading icon when provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: {WidgetName}(
              title: 'Test Title',
              leadingIcon: Icons.person,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.person), findsOneWidget);
    });

    testWidgets('calls onTap when tapped', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: {WidgetName}(
              title: 'Test Title',
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType({WidgetName}));
      await tester.pump();

      expect(tapped, isTrue);
    });

    testWidgets('does not call onTap when disabled', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: {WidgetName}(
              title: 'Test Title',
              onTap: () => tapped = true,
              isEnabled: false,
            ),
          ),
        ),
      );

      await tester.tap(find.byType({WidgetName}));
      await tester.pump();

      expect(tapped, isFalse);
    });

    testWidgets('has correct semantics', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: {WidgetName}(
              title: 'Test Title',
              onTap: () {},
            ),
          ),
        ),
      );

      final semantics = tester.getSemantics(find.byType({WidgetName}));
      expect(semantics.hasFlag(SemanticsFlag.isButton), isTrue);
      expect(semantics.hasFlag(SemanticsFlag.isEnabled), isTrue);
    });

    testWidgets('applies theme correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: const Scaffold(
            body: {WidgetName}(
              title: 'Test Title',
            ),
          ),
        ),
      );

      // Vérifier que le widget utilise les couleurs du thème
      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType({WidgetName}),
          matching: find.byType(Container),
        ).first,
      );

      expect(container.decoration, isNotNull);
    });
  });

  group('{WidgetName} Golden Tests', () {
    testWidgets('matches golden - light theme', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: const Scaffold(
            body: Center(
              child: SizedBox(
                width: 300,
                child: {WidgetName}(
                  title: 'Test Title',
                  subtitle: 'Test Subtitle',
                  leadingIcon: Icons.person,
                ),
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType({WidgetName}),
        matchesGoldenFile('goldens/{widget_name}_light.png'),
      );
    });

    testWidgets('matches golden - dark theme', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: const Scaffold(
            body: Center(
              child: SizedBox(
                width: 300,
                child: {WidgetName}(
                  title: 'Test Title',
                  subtitle: 'Test Subtitle',
                  leadingIcon: Icons.person,
                ),
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType({WidgetName}),
        matchesGoldenFile('goldens/{widget_name}_dark.png'),
      );
    });
  });
}
```

### Étape 3 : Export

```dart
// lib/shared/widgets/widgets.dart
export '{widget_name}.dart';
// Ajouter les autres widgets...
```

### Étape 4 : Documentation Storybook (optionnel)

```dart
// lib/shared/widgets/{widget_name}_stories.dart
import 'package:flutter/material.dart';
import '{widget_name}.dart';

class {WidgetName}Stories extends StatelessWidget {
  const {WidgetName}Stories({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('{WidgetName} Stories')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildStory(
            'Default',
            const {WidgetName}(title: 'Default Title'),
          ),
          _buildStory(
            'With Subtitle',
            const {WidgetName}(
              title: 'With Subtitle',
              subtitle: 'This is a subtitle',
            ),
          ),
          _buildStory(
            'With Icon',
            const {WidgetName}(
              title: 'With Icon',
              leadingIcon: Icons.star,
            ),
          ),
          _buildStory(
            'Disabled',
            const {WidgetName}(
              title: 'Disabled',
              isEnabled: false,
            ),
          ),
          _buildStory(
            'Full Example',
            {WidgetName}(
              title: 'Full Example',
              subtitle: 'All props enabled',
              leadingIcon: Icons.person,
              onTap: () {},
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStory(String name, Widget widget) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          name,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        widget,
        const SizedBox(height: 24),
      ],
    );
  }
}
```

### Résumé

```
══════════════════════════════════════════════════════════════
✅ WIDGET GÉNÉRÉ - {WidgetName}
══════════════════════════════════════════════════════════════

📁 Fichiers créés :
- lib/shared/widgets/{widget_name}.dart
- test/shared/widgets/{widget_name}_test.dart
- test/shared/widgets/goldens/{widget_name}_light.png (à générer)
- test/shared/widgets/goldens/{widget_name}_dark.png (à générer)

🔧 Commandes utiles :
# Lancer les tests
flutter test test/shared/widgets/{widget_name}_test.dart

# Mettre à jour les golden tests
flutter test --update-goldens

📖 Props disponibles :
- title (String, required)
- subtitle (String?)
- leadingIcon (IconData?)
- onTap (VoidCallback?)
- isEnabled (bool, default: true)
```
