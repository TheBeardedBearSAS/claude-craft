---
description: Gerar Widget Flutter
---

# Gerar Widget Flutter

Gere um widget Flutter com testes e documentação.

## Entrada

- Nome do widget (ex: "CustomButton")
- Tipo: [stateless, stateful, consumer]
- Localização: lib/features/{feature}/presentation/widgets/

## Gerar

### 1. Widget

```dart
// lib/.../widgets/{widget_name}.dart
import 'package:flutter/material.dart';

/// Descrição do widget
class {WidgetName} extends StatelessWidget {
  const {WidgetName}({
    super.key,
    required this.param1,
  });

  final Type param1;

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```

### 2. Teste de Widget

```dart
// test/.../widgets/{widget_name}_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('{WidgetName}', () {
    testWidgets('should render correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: {WidgetName}(param1: testValue),
          ),
        ),
      );

      expect(find.byType({WidgetName}), findsOneWidget);
    });
  });
}
```

## Verificar

- [ ] Widget criado
- [ ] Teste criado
- [ ] Documentação presente
- [ ] Const constructor se stateless
- [ ] Teste passa
