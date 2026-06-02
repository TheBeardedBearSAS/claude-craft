---
name: testing-flutter
description: Testing Flutter 3.44 / BLoC v9 / Riverpod 3 - Stratégie Complète. Use when writing tests, reviewing test coverage, or setting up testing.
context: fork
---

# Testing Flutter 3.44+ - Stratégie Complète

**Versions :** Flutter 3.44+ | Dart 3.12+ | BLoC v9 | Riverpod 3.0

## Patterns de test 2026

### BLoC v9 Tests avec bloc_test

```dart
// pubspec.yaml
dev_dependencies:
  bloc_test: ^10.0.0
  mocktail: ^1.0.0

// Test avec emit.isMounted checks (BLoC v9)
blocTest<UserBloc, UserState>(
  'emits [loading, loaded] when FetchUser is added',
  build: () {
    when(() => mockUseCase.call('123'))
        .thenAnswer((_) async => User(id: '123', name: 'Alice'));
    return UserBloc(getUserUseCase: mockUseCase);
  },
  act: (bloc) => bloc.add(const FetchUser('123')),
  expect: () => [
    const UserState(status: UserStatus.loading),
    const UserState(status: UserStatus.loaded, user: User(id: '123', name: 'Alice')),
  ],
  verify: (bloc) {
    // Vérifier que le bloc respecte isMounted (v9)
    verify(() => mockUseCase.call('123')).called(1);
  },
);
```

### Riverpod 3.0 Mutations Tests

```dart
// Test Riverpod 3.0 Mutations API
test('Mutation updates state correctly', () async {
  final container = ProviderContainer();
  
  // Initial state
  final notifier = container.read(orderNotifierProvider('123').notifier);
  expect(container.read(orderNotifierProvider('123')).value?.id, '123');
  
  // Mutation
  await notifier.updateOrder(Order(id: '123', name: 'Updated'));
  
  // Verify state après mutation
  expect(
    container.read(orderNotifierProvider('123')).value?.name,
    'Updated',
  );
  
  container.dispose();
});
```

**Source :** [Riverpod 3.0 Testing](https://medium.com/@lee645521797/flutter-riverpod-3-0-released-a-major-redesign-of-the-state-management-framework-f7e31f19b179)

---

This skill provides guidelines and best practices.

See ../../rules/07-testing-flutter.md for detailed documentation.
