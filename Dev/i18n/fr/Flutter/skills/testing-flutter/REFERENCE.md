# Testing Flutter - Stratégie Complète

## Types de Tests

```
┌─────────────────────────────────────────────────────────┐
│                  PYRAMIDE DE TESTS                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                      /\                                 │
│                     /  \      Integration Tests         │
│                    /    \     (10%)                     │
│                   /------\                              │
│                  /        \   Widget Tests              │
│                 /          \  (20%)                     │
│                /------------\                           │
│               /              \  Unit Tests              │
│              /                \ (70%)                   │
│             /------------------\                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Unit Tests

### Test d'entités

```dart
// test/unit/domain/entities/user_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:myapp/features/user/domain/entities/user.dart';

void main() {
  group('User Entity', () {
    test('should create user with valid data', () {
      // Arrange & Act
      final user = User(
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      );

      // Assert
      expect(user.id, '123');
      expect(user.name, 'John Doe');
      expect(user.email, 'john@example.com');
      expect(user.age, 30);
    });

    test('should be equal when properties are same', () {
      // Arrange
      final user1 = User(
        id: '123',
        name: 'John',
        email: 'john@example.com',
        age: 30,
      );

      final user2 = User(
        id: '123',
        name: 'John',
        email: 'john@example.com',
        age: 30,
      );

      // Assert
      expect(user1, equals(user2));
    });

    test('should not be equal when properties differ', () {
      // Arrange
      final user1 = User(id: '123', name: 'John', email: 'john@example.com', age: 30);
      final user2 = User(id: '456', name: 'Jane', email: 'jane@example.com', age: 25);

      // Assert
      expect(user1, isNot(equals(user2)));
    });
  });
}
```

### Test de Use Cases

```dart
// test/unit/domain/usecases/login_test.dart

import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:myapp/core/errors/failures.dart';
import 'package:myapp/features/auth/domain/entities/user.dart';
import 'package:myapp/features/auth/domain/repositories/auth_repository.dart';
import 'package:myapp/features/auth/domain/usecases/login.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late Login useCase;
  late MockAuthRepository mockRepository;

  setUp(() {
    mockRepository = MockAuthRepository();
    useCase = Login(mockRepository);
  });

  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  const testUser = User(
    id: '123',
    name: 'Test User',
    email: testEmail,
  );

  group('Login UseCase', () {
    test('should return User when credentials are correct', () async {
      // Arrange
      when(() => mockRepository.login(testEmail, testPassword))
          .thenAnswer((_) async => const Right(testUser));

      // Act
      final result = await useCase(email: testEmail, password: testPassword);

      // Assert
      expect(result, const Right(testUser));
      verify(() => mockRepository.login(testEmail, testPassword)).called(1);
      verifyNoMoreInteractions(mockRepository);
    });

    test('should return ValidationFailure when email is empty', () async {
      // Act
      final result = await useCase(email: '', password: testPassword);

      // Assert
      expect(result, isA<Left>());
      result.fold(
        (failure) => expect(failure, isA<ValidationFailure>()),
        (_) => fail('Should return failure'),
      );
      verifyNever(() => mockRepository.login(any(), any()));
    });

    test('should return ValidationFailure when password is empty', () async {
      // Act
      final result = await useCase(email: testEmail, password: '');

      // Assert
      expect(result, isA<Left>());
      verifyNever(() => mockRepository.login(any(), any()));
    });

    test('should return ServerFailure when repository throws', () async {
      // Arrange
      when(() => mockRepository.login(testEmail, testPassword))
          .thenAnswer((_) async => const Left(ServerFailure('Server error')));

      // Act
      final result = await useCase(email: testEmail, password: testPassword);

      // Assert
      expect(result, const Left(ServerFailure('Server error')));
      verify(() => mockRepository.login(testEmail, testPassword)).called(1);
    });
  });
}
```

### Test de BLoCs

```dart
// test/unit/presentation/bloc/auth_bloc_test.dart

import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:myapp/core/errors/failures.dart';
import 'package:myapp/features/auth/domain/entities/user.dart';
import 'package:myapp/features/auth/domain/usecases/login.dart';
import 'package:myapp/features/auth/presentation/bloc/auth_bloc.dart';

class MockLogin extends Mock implements Login {}

void main() {
  late AuthBloc bloc;
  late MockLogin mockLogin;

  setUp(() {
    mockLogin = MockLogin();
    bloc = AuthBloc(loginUseCase: mockLogin);
  });

  tearDown(() {
    bloc.close();
  });

  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  const testUser = User(id: '123', name: 'Test', email: testEmail);

  group('AuthBloc', () {
    test('initial state is AuthInitial', () {
      expect(bloc.state, AuthInitial());
    });

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] when LoginSubmitted succeeds',
      build: () {
        when(() => mockLogin(email: testEmail, password: testPassword))
            .thenAnswer((_) async => const Right(testUser));
        return bloc;
      },
      act: (bloc) => bloc.add(
        const LoginSubmitted(email: testEmail, password: testPassword),
      ),
      expect: () => [
        AuthLoading(),
        const AuthAuthenticated(testUser),
      ],
      verify: (_) {
        verify(() => mockLogin(email: testEmail, password: testPassword)).called(1);
      },
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthError] when LoginSubmitted fails',
      build: () {
        when(() => mockLogin(email: testEmail, password: testPassword))
            .thenAnswer((_) async => const Left(ServerFailure('Login failed')));
        return bloc;
      },
      act: (bloc) => bloc.add(
        const LoginSubmitted(email: testEmail, password: testPassword),
      ),
      expect: () => [
        AuthLoading(),
        const AuthError('Login failed'),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthUnauthenticated] when LogoutPressed',
      build: () => bloc,
      seed: () => const AuthAuthenticated(testUser),
      act: (bloc) => bloc.add(LogoutPressed()),
      expect: () => [AuthUnauthenticated()],
    );
  });
}
```

---

## Widget Tests

### Test de widgets simples

```dart
// test/widget/presentation/widgets/user_card_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:myapp/features/user/domain/entities/user.dart';
import 'package:myapp/features/user/presentation/widgets/user_card.dart';

void main() {
  const testUser = User(
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
  );

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: Scaffold(
        body: UserCard(user: testUser),
      ),
    );
  }

  group('UserCard Widget', () {
    testWidgets('displays user name', (tester) async {
      // Arrange & Act
      await tester.pumpWidget(createWidgetUnderTest());

      // Assert
      expect(find.text('John Doe'), findsOneWidget);
    });

    testWidgets('displays user email', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());

      // Assert
      expect(find.text('john@example.com'), findsOneWidget);
    });

    testWidgets('displays avatar', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());

      // Assert
      final avatarFinder = find.byType(CircleAvatar);
      expect(avatarFinder, findsOneWidget);

      final avatar = tester.widget<CircleAvatar>(avatarFinder);
      expect(avatar.backgroundImage, isA<NetworkImage>());
    });

    testWidgets('calls onTap when card is tapped', (tester) async {
      // Arrange
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserCard(
              user: testUser,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      // Act
      await tester.tap(find.byType(UserCard));
      await tester.pump();

      // Assert
      expect(tapped, isTrue);
    });
  });
}
```

### Test avec BLoC

```dart
// test/widget/presentation/pages/login_page_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:myapp/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:myapp/features/auth/presentation/pages/login_page.dart';

class MockAuthBloc extends Mock implements AuthBloc {}

void main() {
  late AuthBloc mockAuthBloc;

  setUp(() {
    mockAuthBloc = MockAuthBloc();
  });

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: BlocProvider<AuthBloc>.value(
        value: mockAuthBloc,
        child: const LoginPage(),
      ),
    );
  }

  group('LoginPage', () {
    testWidgets('displays email and password fields', (tester) async {
      // Arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());
      when(() => mockAuthBloc.stream).thenAnswer((_) => const Stream.empty());

      // Act
      await tester.pumpWidget(createWidgetUnderTest());

      // Assert
      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
    });

    testWidgets('displays login button', (tester) async {
      // Arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());
      when(() => mockAuthBloc.stream).thenAnswer((_) => const Stream.empty());

      // Act
      await tester.pumpWidget(createWidgetUnderTest());

      // Assert
      expect(find.widgetWithText(ElevatedButton, 'Login'), findsOneWidget);
    });

    testWidgets('shows loading indicator when AuthLoading', (tester) async {
      // Arrange
      when(() => mockAuthBloc.state).thenReturn(AuthLoading());
      when(() => mockAuthBloc.stream).thenAnswer((_) => const Stream.empty());

      // Act
      await tester.pumpWidget(createWidgetUnderTest());

      // Assert
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('dispatches LoginSubmitted when login button pressed', (tester) async {
      // Arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());
      when(() => mockAuthBloc.stream).thenAnswer((_) => const Stream.empty());

      await tester.pumpWidget(createWidgetUnderTest());

      // Act
      await tester.enterText(find.byType(TextFormField).first, 'test@example.com');
      await tester.enterText(find.byType(TextFormField).last, 'password123');
      await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));
      await tester.pump();

      // Assert
      verify(
        () => mockAuthBloc.add(
          const LoginSubmitted(
            email: 'test@example.com',
            password: 'password123',
          ),
        ),
      ).called(1);
    });
  });
}
```

---

## Integration Tests

```dart
// integration_test/app_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:myapp/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {
    testWidgets('login flow', (tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to login
      final loginButton = find.text('Login');
      expect(loginButton, findsOneWidget);
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      // Enter credentials
      final emailField = find.byKey(const Key('email_field'));
      final passwordField = find.byKey(const Key('password_field'));

      await tester.enterText(emailField, 'test@example.com');
      await tester.enterText(passwordField, 'password123');
      await tester.pumpAndSettle();

      // Submit
      final submitButton = find.text('Submit');
      await tester.tap(submitButton);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify navigation to home
      expect(find.text('Welcome'), findsOneWidget);
    });

    testWidgets('complete product purchase flow', (tester) async {
      // 1. Start app
      app.main();
      await tester.pumpAndSettle();

      // 2. Browse products
      expect(find.text('Products'), findsOneWidget);
      await tester.pumpAndSettle();

      // 3. Select a product
      final productCard = find.byKey(const Key('product_1'));
      await tester.tap(productCard);
      await tester.pumpAndSettle();

      // 4. Add to cart
      final addToCartButton = find.text('Add to Cart');
      await tester.tap(addToCartButton);
      await tester.pumpAndSettle();

      // 5. Go to cart
      final cartIcon = find.byIcon(Icons.shopping_cart);
      await tester.tap(cartIcon);
      await tester.pumpAndSettle();

      // 6. Proceed to checkout
      final checkoutButton = find.text('Checkout');
      await tester.tap(checkoutButton);
      await tester.pumpAndSettle();

      // 7. Verify checkout page
      expect(find.text('Order Summary'), findsOneWidget);
    });
  });
}
```

---

## Golden Tests (Screenshot Tests)

```dart
// test/golden/widgets/user_card_golden_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:myapp/features/user/domain/entities/user.dart';
import 'package:myapp/features/user/presentation/widgets/user_card.dart';

void main() {
  group('UserCard Golden Tests', () {
    testWidgets('default appearance', (tester) async {
      const user = User(
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserCard(user: user),
          ),
        ),
      );

      await expectLater(
        find.byType(UserCard),
        matchesGoldenFile('goldens/user_card_default.png'),
      );
    });

    testWidgets('dark mode', (tester) async {
      const user = User(
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      );

      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: Scaffold(
            body: UserCard(user: user),
          ),
        ),
      );

      await expectLater(
        find.byType(UserCard),
        matchesGoldenFile('goldens/user_card_dark.png'),
      );
    });
  });
}
```

---

## Mocking avec Mocktail

```dart
// test/helpers/mocks.dart

import 'package:mocktail/mocktail.dart';
import 'package:myapp/features/auth/domain/repositories/auth_repository.dart';
import 'package:myapp/features/user/domain/repositories/user_repository.dart';

// Repositories
class MockAuthRepository extends Mock implements AuthRepository {}
class MockUserRepository extends Mock implements UserRepository {}

// Use Cases
class MockLogin extends Mock implements Login {}
class MockLogout extends Mock implements Logout {}

// BLoCs
class MockAuthBloc extends Mock implements AuthBloc {}
class MockUserBloc extends Mock implements UserBloc {}

// Register fallback values for complex types
void registerFallbackValues() {
  registerFallbackValue(const User(id: '123', name: 'Test', email: 'test@test.com'));
  registerFallbackValue(FakeAuthEvent());
}

class FakeAuthEvent extends Fake implements AuthEvent {}
```

---

## Test Coverage

### Configuration

```yaml
# pubspec.yaml
dev_dependencies:
  test: ^1.24.0
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.0
  bloc_test: ^9.1.0
  integration_test:
    sdk: flutter
```

### Commandes

```bash
# Générer coverage
flutter test --coverage

# Filtrer fichiers générés
lcov --remove coverage/lcov.info \
  '**/*.g.dart' \
  '**/*.freezed.dart' \
  '**/main.dart' \
  -o coverage/lcov.info

# Voir le rapport HTML
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

### Makefile targets

```makefile
test-coverage: ## Tests avec coverage
	flutter test --coverage
	lcov --remove coverage/lcov.info \
		'**/*.g.dart' \
		'**/*.freezed.dart' \
		'**/main.dart' \
		-o coverage/lcov_cleaned.info
	genhtml coverage/lcov_cleaned.info -o coverage/html
	@echo "📊 Coverage report: coverage/html/index.html"

test-coverage-check: test-coverage ## Vérifier seuil de coverage
	@COVERAGE=$$(lcov --summary coverage/lcov_cleaned.info | grep lines | awk '{print $$2}' | sed 's/%//'); \
	if [ $$COVERAGE -lt 80 ]; then \
		echo "❌ Coverage $$COVERAGE% < 80%"; \
		exit 1; \
	else \
		echo "✅ Coverage $$COVERAGE% >= 80%"; \
	fi
```

---

## Bonnes pratiques

```
ARRANGE, ACT, ASSERT (AAA Pattern) :

1. ARRANGE : Préparer les données et mocks
2. ACT : Exécuter l'action à tester
3. ASSERT : Vérifier le résultat

✅ Tests isolés (pas de dépendances entre tests)
✅ Tests rapides
✅ Tests déterministes (même résultat à chaque fois)
✅ Un concept testé par test
✅ Noms de tests descriptifs

❌ Tests flaky (instables)
❌ Tests qui dépendent de l'ordre d'exécution
❌ Tests qui testent trop de choses
❌ Tests qui testent l'implémentation au lieu du comportement
```

---

*Une stratégie de test complète garantit la qualité et la fiabilité de l'application Flutter.*
