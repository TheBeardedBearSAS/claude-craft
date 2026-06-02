---
description: Geração de Widget Flutter com Testes
argument-hint: [arguments]
---

# Geração de Widget Flutter com Testes

Você é um desenvolvedor Flutter sênior. Você deve gerar um widget reutilizável com documentação, testes unitários e widget tests.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do widget (ex: `CustomButton`, `UserCard`)
- (Opcional) Tipo (stateless, stateful, hook)

Exemplo: `/flutter:generate-widget UserCard stateless`

## Plan Mode

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## MISSÃO

### Etapa 1: Criar o Widget

#### StatelessWidget
```dart
// lib/shared/widgets/{widget_name}.dart
import 'package:flutter/material.dart';

/// Um widget que exibe {description}.
///
/// Exemplo de uso:
/// ```dart
/// {WidgetName}(
///   title: 'Meu título',
///   onTap: () => print('Tapped'),
/// )
/// ```
class {WidgetName} extends StatelessWidget {
  /// O título exibido no widget.
  final String title;

  /// O subtítulo opcional.
  final String? subtitle;

  /// O ícone exibido à esquerda.
  final IconData? leadingIcon;

  /// Callback chamado ao tocar.
  final VoidCallback? onTap;

  /// Indica se o widget está habilitado.
  final bool isEnabled;

  /// Cria um novo [{WidgetName}].
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

#### StatefulWidget (com animação)
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

### Etapa 2: Testes

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

      // Verificar que o widget utiliza as cores do tema
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

### Etapa 3: Exportação

```dart
// lib/shared/widgets/widgets.dart
export '{widget_name}.dart';
// Adicionar os outros widgets...
```

### Etapa 4: Documentação Storybook (opcional)

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

### Resumo

```
══════════════════════════════════════════════════════════════
✅ WIDGET GERADO - {WidgetName}
══════════════════════════════════════════════════════════════

📁 Arquivos criados:
- lib/shared/widgets/{widget_name}.dart
- test/shared/widgets/{widget_name}_test.dart
- test/shared/widgets/goldens/{widget_name}_light.png (a gerar)
- test/shared/widgets/goldens/{widget_name}_dark.png (a gerar)

🔧 Comandos úteis:
# Executar os testes
flutter test test/shared/widgets/{widget_name}_test.dart

# Atualizar os golden tests
flutter test --update-goldens

📖 Props disponíveis:
- title (String, required)
- subtitle (String?)
- leadingIcon (IconData?)
- onTap (VoidCallback?)
- isEnabled (bool, default: true)
```
