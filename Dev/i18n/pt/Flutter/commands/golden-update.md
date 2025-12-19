---
description: Atualizar Golden Tests
---

# Atualizar Golden Tests

Atualize os arquivos golden (screenshots de referência) para testes visuais de widgets.

## Uso

```bash
# Atualizar todos os goldens
flutter test --update-goldens

# Atualizar goldens específicos
flutter test test/golden/ --update-goldens

# Executar apenas golden tests
flutter test --tags=golden
```

## Workflow

### 1. Modificação de UI

Quando você modifica a aparência de um widget:

```bash
# 1. Executar testes (vão falhar)
flutter test test/golden/

# 2. Revisar diferenças visuais
# Verificar que mudanças são intencionais

# 3. Atualizar goldens
flutter test test/golden/ --update-goldens

# 4. Verificar novos goldens
git diff test/golden/
```

### 2. Novos Golden Tests

```dart
testWidgets('my widget golden', (tester) async {
  await tester.pumpWidget(
    MaterialApp(home: MyWidget()),
  );

  await expectLater(
    find.byType(MyWidget),
    matchesGoldenFile('goldens/my_widget_default.png'),
  );
});
```

### 3. Diferentes Temas/Tamanhos

```dart
// Dark mode
testWidgets('dark theme golden', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      theme: ThemeData.dark(),
      home: MyWidget(),
    ),
  );

  await expectLater(
    find.byType(MyWidget),
    matchesGoldenFile('goldens/my_widget_dark.png'),
  );
});
```

## Atenção

- [ ] Revisar mudanças visuais antes de atualizar
- [ ] Commitar novos goldens
- [ ] Documentar mudanças no PR
- [ ] CI deve ter goldens atualizados
