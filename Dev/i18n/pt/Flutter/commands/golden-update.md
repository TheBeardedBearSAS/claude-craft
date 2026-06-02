---
description: Atualização dos Golden Tests
argument-hint: [arguments]
---

# Atualização dos Golden Tests

Você é um desenvolvedor Flutter sênior. Você deve gerenciar os golden tests do projeto, atualizá-los após mudanças visuais intencionais e verificar regressões.

## Argumentos
$ARGUMENTS

Argumentos:
- Ação: update, check, compare
- (Opcional) Caminho para um teste específico

Exemplo: `/flutter:golden-update update` ou `/flutter:golden-update check test/widgets/button_test.dart`

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar a sua validação antes de realizar qualquer alteração.

## MISSÃO

### Etapa 1: Compreender os Golden Tests

Os golden tests comparam o renderizado visual de um widget com uma imagem de referência.

```dart
// test/widgets/my_button_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/widgets/my_button.dart';

void main() {
  group('MyButton Golden Tests', () {
    testWidgets('estado padrão', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: MyButton(label: 'Clique aqui'),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType(MyButton),
        matchesGoldenFile('goldens/my_button_default.png'),
      );
    });

    testWidgets('estado pressionado', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: MyButton(
                label: 'Clique aqui',
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

    testWidgets('estado desabilitado', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: MyButton(
                label: 'Clique aqui',
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

### Etapa 2: Comandos Básicos

```bash
# Verificar os golden tests (comparar com as referências)
flutter test --tags=golden

# Atualizar TODOS os golden tests
flutter test --update-goldens

# Atualizar um teste específico
flutter test --update-goldens test/widgets/my_button_test.dart

# Executar com um device específico (importante para consistência)
flutter test --update-goldens --device-id=linux

# Ignorar os golden tests no CI (se necessário)
flutter test --exclude-tags=golden
```

### Etapa 3: Configuração Recomendada

#### flutter_test_config.dart

```dart
// test/flutter_test_config.dart
import 'dart:async';
import 'package:flutter/material.dart';

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  // Configuração de fontes para consistência
  TestWidgetsFlutterBinding.ensureInitialized();

  // Configurar o comparador de golden files
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
      // Log mais detalhado em caso de falha
      print('Golden test falhou: $golden');
    }
    return result;
  }
}
```

#### Tags para os Golden Tests

```dart
// test/widgets/my_button_test.dart
@Tags(['golden'])
library;

import 'package:flutter_test/flutter_test.dart';
// ...
```

### Etapa 4: Boas Práticas

#### Estrutura de Pastas

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

#### Wrapper para Golden Tests

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

// Uso
testWidgets('golden do meu widget', (tester) async {
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

#### Multi-Tema e Multi-Plataforma

```dart
void main() {
  final themes = {
    'light': ThemeData.light(),
    'dark': ThemeData.dark(),
  };

  for (final entry in themes.entries) {
    testWidgets('MyButton - tema ${entry.key}', (tester) async {
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

### Etapa 5: Workflow CI/CD

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

      - name: Instalar dependências
        run: flutter pub get

      - name: Executar testes unitários
        run: flutter test --exclude-tags=golden

      - name: Executar golden tests
        run: flutter test --tags=golden
        continue-on-error: true  # Para visualizar as diferenças

      - name: Fazer upload das falhas dos golden tests
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: golden-failures
          path: '**/failures/*.png'
```

### Etapa 6: Resolver as Diferenças

```
══════════════════════════════════════════════════════════════
🖼️ GOLDEN TESTS - RESULTADO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RESUMO
──────────────────────────────────────────────────────────────

| Categoria   | Testes | Aprovados | Reprovados |
|-------------|--------|-----------|------------|
| Widgets     | 15     | 12        | 3          |
| Screens     | 8      | 8         | 0          |
| Components  | 10     | 10        | 0          |
| **Total**   | 33     | 30        | 3          |

──────────────────────────────────────────────────────────────
❌ TESTES REPROVADOS
──────────────────────────────────────────────────────────────

### 1. my_button_default.png

Diferença detectada: 2,3%

Causa provável:
- Mudança de padding
- Modificação da fonte
- Atualização do tema

Ações:
- [ ] Verificar se a mudança é intencional
- [ ] Se sim: `flutter test --update-goldens test/widgets/my_button_test.dart`
- [ ] Se não: reverter as mudanças

### 2. user_card_avatar.png

Diferença detectada: 15,7%

Causa provável:
- Novo design do avatar
- Mudança de border-radius

Ações:
- [ ] Revisar com o designer
- [ ] Atualizar se validado

──────────────────────────────────────────────────────────────
🔧 COMANDOS
──────────────────────────────────────────────────────────────

# Ver as diferenças
open test/goldens/failures/

# Atualizar os testes reprovados
flutter test --update-goldens test/widgets/my_button_test.dart

# Atualizar todos os golden tests
flutter test --update-goldens --tags=golden

# Executar somente os golden tests
flutter test --tags=golden

──────────────────────────────────────────────────────────────
⚠️ LEMBRETES
──────────────────────────────────────────────────────────────

1. Sempre verificar visualmente antes de atualizar
2. Commitar os novos .png junto com o código
3. Usar o mesmo ambiente para gerar os goldens
4. Documentar as mudanças visuais na PR
```
