# Flutter App Example

A complete mobile application built with Flutter 3.44, BLoC pattern, and Riverpod, demonstrating Claude Craft best practices.

---

## Overview

This example demonstrates:

- **Clean Architecture** - Presentation, Domain, Data layers
- **BLoC Pattern** - State management
- **Riverpod** - Dependency injection
- **Widget Testing** - Unit and golden tests
- **BMAD** - Project management with Claude Craft

---

## Features

| Feature | Status |
|---------|--------|
| User Authentication | Complete |
| Product Catalog | Complete |
| Shopping Cart | In Progress |
| Checkout Flow | Backlog |
| Order History | Backlog |
| Push Notifications | Backlog |

---

## Project Structure

```
flutter-app/
├── .claude/                    # Claude Craft configuration
├── .bmad/                      # BMAD configuration
├── docs/
│   ├── prd.md
│   └── tech-spec.md
├── lib/
│   ├── core/                   # Core utilities
│   │   ├── error/
│   │   ├── network/
│   │   └── utils/
│   ├── features/               # Feature modules
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── products/
│   │   └── cart/
│   └── main.dart
├── test/
│   ├── unit/
│   ├── widget/
│   └── golden/
└── pubspec.yaml
```

---

## Quick Start

### 1. Clone and Install

```bash
# Clone example
cp -r docs/examples/flutter-app ~/my-app
cd ~/my-app

# Install Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=flutter --lang=en

# Get dependencies
flutter pub get
```

### 2. Run Tests

```bash
flutter test
```

### 3. Start Development

```bash
claude
/workflow:init
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Widgets, BLoCs, Screens, Providers)   │
├─────────────────────────────────────────┤
│             Domain Layer                │
│  (Entities, Use Cases, Repositories)    │
├─────────────────────────────────────────┤
│              Data Layer                 │
│  (Models, Data Sources, Implementations)│
└─────────────────────────────────────────┘
```

---

## State Management

### BLoC Example

```dart
// lib/features/auth/presentation/bloc/auth_bloc.dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;

  AuthBloc(this.loginUseCase) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await loginUseCase(event.email, event.password);
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }
}
```

---

## Development Workflow

### Implement New Feature

```bash
# 1. Get next story
/sprint:next-story --claim

# 2. Generate feature
/flutter:generate-feature ShoppingCart

# 3. Start TDD
@dev Implement cart feature with TDD

# 4. Validate
/gate:validate-story US-003

# 5. Complete
/sprint:transition US-003 done
```

### Quality Checks

```bash
# Architecture
/flutter:check-architecture

# Performance
/flutter:analyze-performance

# Testing
/flutter:check-testing

# Golden tests
/flutter:golden-update
```

---

## Testing

### Unit Tests

```dart
// test/unit/auth_bloc_test.dart
void main() {
  late AuthBloc authBloc;
  late MockLoginUseCase mockLoginUseCase;

  setUp(() {
    mockLoginUseCase = MockLoginUseCase();
    authBloc = AuthBloc(mockLoginUseCase);
  });

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, AuthAuthenticated] when login succeeds',
    build: () => authBloc,
    setUp: () {
      when(() => mockLoginUseCase(any(), any()))
          .thenAnswer((_) async => Right(testUser));
    },
    act: (bloc) => bloc.add(LoginRequested('test@test.com', 'password')),
    expect: () => [AuthLoading(), AuthAuthenticated(testUser)],
  );
}
```

### Golden Tests

```dart
// test/golden/product_card_test.dart
void main() {
  testGoldens('ProductCard renders correctly', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: ProductCard(product: testProduct),
      ),
    );
    await expectLater(
      find.byType(ProductCard),
      matchesGoldenFile('goldens/product_card.png'),
    );
  });
}
```

---

## Commands

```bash
# Run app
flutter run

# Run tests
flutter test

# Run tests with coverage
flutter test --coverage

# Analyze
flutter analyze

# Format
dart format lib test
```

---

## Next Steps

1. Read [WALKTHROUGH.md](WALKTHROUGH.md) for detailed steps
2. Check the [PRD](docs/prd.md) for requirements
3. Review [Tech Spec](docs/tech-spec.md) for architecture
4. Continue with backlog items

---

## See Also

- [Complete Workflow Guide](../../guides/en/10-complete-workflow.md)
- [BMAD Practical Guide](../../BMAD-PRACTICAL-GUIDE.md)
- [Flutter Commands Reference](../../COMMANDS.md#flutter-commands)
