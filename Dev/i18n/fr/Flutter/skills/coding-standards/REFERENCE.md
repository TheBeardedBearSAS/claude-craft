# Coding Standards Flutter/Dart

## Principe fondamental

Suivre **Effective Dart** : le guide officiel de style et bonnes pratiques Dart.

Références :
- [Effective Dart: Style](https://dart.dev/guides/language/effective-dart/style)
- [Effective Dart: Documentation](https://dart.dev/guides/language/effective-dart/documentation)
- [Effective Dart: Usage](https://dart.dev/guides/language/effective-dart/usage)
- [Effective Dart: Design](https://dart.dev/guides/language/effective-dart/design)

---

## Conventions de nommage

### 1. Fichiers et Dossiers

**Règle** : `snake_case` pour tous les fichiers et dossiers.

```
✅ BON
lib/features/user_profile/presentation/pages/edit_profile_page.dart
lib/core/utils/string_validators.dart
test/features/authentication/auth_bloc_test.dart

❌ MAUVAIS
lib/features/UserProfile/presentation/pages/EditProfilePage.dart
lib/core/utils/StringValidators.dart
test/features/authentication/authBlocTest.dart
```

**Exceptions** :
- README.md, CHANGELOG.md (conventions Markdown)
- Makefile, Dockerfile (conventions Unix)

### 2. Classes, Enums, Typedefs, Extensions

**Règle** : `UpperCamelCase` (PascalCase)

```dart
✅ BON
class UserProfile {}
class HttpClient {}
enum OrderStatus { pending, confirmed, shipped }
typedef ValidationCallback = bool Function(String);
extension StringExtension on String {}
mixin NetworkMixin {}

❌ MAUVAIS
class userProfile {}
class HTTPClient {}  // Sauf si c'est un acronyme standard (HTTP, URL, ID)
enum orderStatus {}
typedef validationCallback = bool Function(String);
```

**Acronymes** : Traiter comme un mot normal

```dart
✅ BON
class HttpRequest {}
class ApiClient {}
class DbHelper {}
class IoUtils {}

❌ MAUVAIS
class HTTPRequest {}
class APIClient {}
class DBHelper {}
class IOUtils {}
```

### 3. Variables, Fonctions, Paramètres

**Règle** : `lowerCamelCase`

```dart
✅ BON
String userName;
int itemCount;
void calculateTotalPrice() {}
final isAuthenticated = true;
const maxRetryAttempts = 3;

❌ MAUVAIS
String user_name;
int ItemCount;
void CalculateTotalPrice() {}
final IsAuthenticated = true;
const MAX_RETRY_ATTEMPTS = 3;
```

### 4. Constantes

**Règle** : `lowerCamelCase` (pas de SCREAMING_CASE)

```dart
✅ BON
const defaultTimeout = Duration(seconds: 30);
const apiBaseUrl = 'https://api.example.com';
const maxFileSize = 5 * 1024 * 1024; // 5 MB

// Dans une classe
class ApiConstants {
  static const baseUrl = 'https://api.example.com';
  static const timeout = Duration(seconds: 30);
}

❌ MAUVAIS
const DEFAULT_TIMEOUT = Duration(seconds: 30);
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

### 5. Membres privés

**Règle** : Préfixer avec underscore `_`

```dart
✅ BON
class MyClass {
  String _privateField;

  void _privateMethod() {}

  String get _privateGetter => _privateField;
}

// Fichiers internes à un package
lib/src/_internal_helper.dart

❌ MAUVAIS
class MyClass {
  String privateField; // Pas privé !

  void privateMethod() {} // Public !
}
```

---

## Formatage et Style

### 1. Longueur des lignes

**Règle** : Maximum 80 caractères par ligne.

```dart
✅ BON
final user = User(
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+33612345678',
);

❌ MAUVAIS
final user = User(id: '123', name: 'John Doe', email: 'john@example.com', phoneNumber: '+33612345678');
```

**Configuration** : `.editorconfig` ou IDE settings

```
[*.dart]
max_line_length = 80
```

### 2. Indentation

**Règle** : 2 espaces (PAS de tabs).

```dart
✅ BON
class MyClass {
  void myMethod() {
    if (condition) {
      doSomething();
    }
  }
}

❌ MAUVAIS
class MyClass {
    void myMethod() {  // 4 espaces
        if (condition) {
            doSomething();
        }
    }
}
```

### 3. Accolades

**Règle** : Toujours utiliser des accolades, même pour une ligne.

```dart
✅ BON
if (condition) {
  doSomething();
}

for (var item in items) {
  print(item);
}

❌ MAUVAIS
if (condition)
  doSomething();

for (var item in items) print(item);
```

### 4. Virgules trailing

**Règle** : Toujours ajouter une virgule finale pour les listes multi-lignes.

```dart
✅ BON
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green,
]; // Virgule finale → formateur Dart organise automatiquement

Widget build(BuildContext context) {
  return Column(
    children: [
      Text('Line 1'),
      Text('Line 2'),
      Text('Line 3'),
    ], // Virgule finale
  );
}

❌ MAUVAIS
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green // Pas de virgule → formateur met tout sur une ligne
];
```

**Pourquoi** : Le formateur Dart utilise la virgule finale pour décider du formatage.

---

## Organisation du Code

### 1. Ordre des membres dans une classe

**Règle recommandée** :

```dart
class MyClass {
  // 1. Constantes statiques
  static const defaultValue = 42;

  // 2. Champs statiques
  static int instanceCount = 0;

  // 3. Champs d'instance (publics puis privés)
  final String id;
  final String name;
  String? _cachedValue;

  // 4. Constructeurs
  MyClass({
    required this.id,
    required this.name,
  }) {
    instanceCount++;
  }

  // 5. Constructeurs nommés
  MyClass.empty() : this(id: '', name: '');

  // 6. Getters/Setters
  String get displayName => name.toUpperCase();

  set value(String val) => _cachedValue = val;

  // 7. Méthodes publiques
  void doSomething() {
    _helperMethod();
  }

  // 8. Méthodes privées
  void _helperMethod() {
    // ...
  }

  // 9. Overrides (toString, hashCode, etc.)
  @override
  String toString() => 'MyClass($id, $name)';
}
```

### 2. Imports

**Règle** : Organiser en 3 groupes séparés par une ligne vide.

```dart
✅ BON
// 1. Dart core
import 'dart:async';
import 'dart:convert';

// 2. Packages externes
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// 3. Imports internes (relatifs)
import '../../core/utils/validators.dart';
import '../domain/entities/user.dart';
import 'widgets/user_card.dart';

❌ MAUVAIS
import 'package:flutter/material.dart';
import '../domain/entities/user.dart';
import 'dart:async';
import 'package:dio/dio.dart';
```

**Automatiser** : `dart format` organise automatiquement.

```bash
dart format lib/
```

### 3. Exports

**Règle** : Créer des fichiers barrel pour exports groupés.

```dart
// lib/features/authentication/authentication.dart
export 'domain/entities/user.dart';
export 'domain/repositories/auth_repository.dart';
export 'domain/usecases/login.dart';
export 'domain/usecases/logout.dart';

export 'presentation/bloc/auth_bloc.dart';
export 'presentation/pages/login_page.dart';

// Usage ailleurs
import 'package:myapp/features/authentication/authentication.dart';

// Au lieu de multiples imports
import 'package:myapp/features/authentication/domain/entities/user.dart';
import 'package:myapp/features/authentication/domain/repositories/auth_repository.dart';
// ...
```

---

## Widgets Flutter

### 1. Préférer `const` constructors

**Règle** : Toujours utiliser `const` quand le widget est immuable.

```dart
✅ BON
class MyWidget extends StatelessWidget {
  const MyWidget({super.key}); // const constructor

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Static text'),
        SizedBox(height: 16),
        Icon(Icons.home),
      ],
    );
  }
}

// Usage
const MyWidget() // const à l'utilisation aussi

❌ MAUVAIS
class MyWidget extends StatelessWidget {
  MyWidget({super.key}); // Pas const

  @override
  Widget build(BuildContext context) {
    return Column( // Pas const
      children: [
        Text('Static text'),
        SizedBox(height: 16),
        Icon(Icons.home),
      ],
    );
  }
}
```

**Pourquoi** : `const` permet à Flutter de réutiliser le widget au lieu de le reconstruire.

### 2. Extract widgets plutôt que méthodes

**Règle** : Créer des widgets séparés plutôt que des méthodes retournant des widgets.

```dart
✅ BON
class MyPage extends StatelessWidget {
  const MyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const _Header(),
        const _Body(),
        const _Footer(),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return const Text('Header');
  }
}

❌ MAUVAIS
class MyPage extends StatelessWidget {
  const MyPage({super.key});

  Widget _buildHeader() { // Méthode
    return const Text('Header');
  }

  Widget _buildBody() {
    return const Text('Body');
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildHeader(),
        _buildBody(),
      ],
    );
  }
}
```

**Pourquoi** :
- Widgets séparés peuvent utiliser `const`
- Meilleures performances (Flutter peut optimiser)
- Plus facile à tester
- Hot reload fonctionne mieux

### 3. Key parameter en premier

**Règle** : Toujours mettre `key` en premier paramètre.

```dart
✅ BON
class MyWidget extends StatelessWidget {
  const MyWidget({
    super.key, // Toujours en premier
    required this.title,
    required this.onTap,
    this.color,
  });

  final String title;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}

❌ MAUVAIS
class MyWidget extends StatelessWidget {
  const MyWidget({
    required this.title,
    super.key, // Pas en premier
    required this.onTap,
  });

  // ...
}
```

### 4. Required vs Optional parameters

**Règle** :
- `required` pour paramètres obligatoires
- Named parameters pour plus de 2 paramètres
- Optional avec `?` ou valeur par défaut

```dart
✅ BON
class UserCard extends StatelessWidget {
  const UserCard({
    super.key,
    required this.user,
    required this.onTap,
    this.showAvatar = true,
    this.backgroundColor,
  });

  final User user;
  final VoidCallback onTap;
  final bool showAvatar;
  final Color? backgroundColor;

  // ...
}

// Usage
UserCard(
  user: currentUser,
  onTap: () => navigate(),
  backgroundColor: Colors.blue,
)

❌ MAUVAIS
class UserCard extends StatelessWidget {
  UserCard(
    this.user, // Positional
    this.onTap, // Positional
    [this.showAvatar = true], // Optional positional
  );

  final User user;
  final VoidCallback onTap;
  final bool showAvatar;

  // ...
}

// Usage - peu clair
UserCard(currentUser, () => navigate(), false)
```

---

## Types et Inférence

### 1. Type inference

**Règle** : Laisser Dart inférer les types évidents, annoter les types complexes.

```dart
✅ BON
// Inférence évidente
var name = 'John'; // String évident
var count = 42; // int évident
final items = <String>[]; // Type explicite pour collection vide
const timeout = Duration(seconds: 30); // Type évident

// Annotation pour clarté
List<Map<String, dynamic>> complexData = [];
Future<Either<Failure, User>> result = fetchUser();

// Paramètres et retours : toujours annoter
String formatName(String name) {
  return name.toUpperCase();
}

❌ MAUVAIS
String name = 'John'; // Verbeux
int count = 42; // Verbeux
var items = []; // Type obscur
var timeout = Duration(seconds: 30); // OK mais const meilleur

// Pas d'annotation
formatName(name) { // Type de retour manquant
  return name.toUpperCase();
}
```

### 2. Types nullables

**Règle** : Utiliser null safety de manière explicite.

```dart
✅ BON
// Nullable explicite
String? userName; // Peut être null
int? age; // Peut être null

// Non-nullable
String email = 'default@example.com';
int count = 0;

// Gestion du null
void displayUser(String? name) {
  // 1. Null check
  if (name != null) {
    print(name.toUpperCase());
  }

  // 2. Null-aware operator
  print(name?.toUpperCase());

  // 3. Null coalescing
  print(name ?? 'Anonymous');

  // 4. Null assertion (dangereux - éviter)
  print(name!.toUpperCase()); // ⚠️ Crash si null
}

❌ MAUVAIS
// Type nullable sans raison
String? email = 'test@example.com'; // Devrait être non-nullable

// Null assertion abusif
void displayUser(String? name) {
  print(name!.toUpperCase()); // ⚠️ Mauvaise pratique
}
```

### 3. Collections

**Règle** : Spécifier le type pour collections vides, inférer pour collections initialisées.

```dart
✅ BON
// Collections vides : type explicite
final List<String> names = [];
final Map<String, int> scores = {};
final Set<int> uniqueIds = {};

// Collections initialisées : inférence
final names = ['Alice', 'Bob', 'Charlie'];
final scores = {'Alice': 100, 'Bob': 90};
final uniqueIds = {1, 2, 3};

// Avec const
const emptyList = <String>[];
const colors = [Colors.red, Colors.blue];

❌ MAUVAIS
// Type manquant pour collection vide
final names = []; // Type dynamic !
final scores = {}; // Map<dynamic, dynamic> !

// Type verbeux quand inférence suffisante
final List<String> names = ['Alice', 'Bob'];
```

---

## Documentation et Commentaires

### 1. Dartdoc pour APIs publiques

**Règle** : Documenter toutes les classes, méthodes, et propriétés publiques.

```dart
✅ BON
/// Gère l'authentification des utilisateurs.
///
/// Cette classe fournit des méthodes pour connecter, déconnecter,
/// et gérer l'état de session de l'utilisateur.
///
/// Exemple :
/// ```dart
/// final authService = AuthService();
/// final user = await authService.login('email@example.com', 'password');
/// ```
class AuthService {
  /// Connecte un utilisateur avec email et mot de passe.
  ///
  /// Retourne un [User] en cas de succès.
  ///
  /// Throws [AuthException] si les credentials sont invalides.
  Future<User> login(String email, String password) async {
    // Implementation
  }

  /// Déconnecte l'utilisateur actuel.
  ///
  /// Efface le token de session et redirige vers l'écran de login.
  Future<void> logout() async {
    // Implementation
  }
}

❌ MAUVAIS
// Pas de documentation
class AuthService {
  Future<User> login(String email, String password) async {
    // ...
  }
}

// Commentaire mal formaté
// This method logs in the user
Future<User> login(String email, String password) async {
  // ...
}
```

**Format Dartdoc** :
- `///` pour documentation (pas `//` ou `/* */`)
- Première ligne = résumé court
- Détails après ligne vide
- Code examples avec ` ```dart ... ``` `
- Références avec `[ClassName]` ou `[methodName]`

### 2. Commentaires internes

**Règle** : Expliquer le "pourquoi", pas le "quoi".

```dart
✅ BON
// Utiliser SHA-256 car MD5 est déprécié pour raisons de sécurité
final hash = sha256.convert(utf8.encode(password));

// Retry en cas d'échec car l'API peut être temporairement indisponible
for (var i = 0; i < maxRetries; i++) {
  try {
    return await apiCall();
  } catch (e) {
    if (i == maxRetries - 1) rethrow;
  }
}

❌ MAUVAIS
// Créer un hash du password
final hash = sha256.convert(utf8.encode(password));

// Boucle 3 fois
for (var i = 0; i < 3; i++) {
  // Appeler l'API
  apiCall();
}
```

### 3. TODO et FIXME

**Règle** : Utiliser des tags standard avec contexte.

```dart
✅ BON
// TODO(john): Implémenter validation email côté client
// Issue: https://github.com/org/repo/issues/123

// FIXME: Race condition possible si deux requêtes simultanées
// Besoin d'ajouter un mutex ou queue

// HACK: Workaround temporaire pour bug dans package xxx v1.2.3
// Supprimer quand package sera fixé

❌ MAUVAIS
// TODO fix this
// fixme
// This doesn't work properly
```

---

## Gestion des Erreurs

### 1. Exceptions spécifiques

**Règle** : Créer des exceptions custom plutôt que throw String.

```dart
✅ BON
class ValidationException implements Exception {
  final String message;
  final String field;

  ValidationException(this.message, {required this.field});

  @override
  String toString() => 'ValidationException: $message (field: $field)';
}

// Usage
if (email.isEmpty) {
  throw ValidationException('Email cannot be empty', field: 'email');
}

// Catch spécifique
try {
  validate(email);
} on ValidationException catch (e) {
  print('Validation error on ${e.field}: ${e.message}');
} catch (e) {
  print('Unexpected error: $e');
}

❌ MAUVAIS
if (email.isEmpty) {
  throw 'Email cannot be empty'; // throw String
}

// Catch générique
try {
  validate(email);
} catch (e) {
  // Impossible de différencier les types d'erreurs
  print('Error: $e');
}
```

### 2. Either<Failure, Success> pattern

**Règle** : Pour logique métier, préférer Either plutôt que throw.

```dart
✅ BON
import 'package:dartz/dartz.dart';

// Définir Failures
abstract class Failure {
  final String message;
  const Failure(this.message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

// Use Case retourne Either
Future<Either<Failure, User>> login(String email, String password) async {
  if (email.isEmpty) {
    return const Left(ValidationFailure('Email cannot be empty'));
  }

  try {
    final user = await api.login(email, password);
    return Right(user);
  } on NetworkException {
    return const Left(NetworkFailure('No internet connection'));
  } catch (e) {
    return Left(ServerFailure('Unexpected error: $e'));
  }
}

// Usage
final result = await login(email, password);
result.fold(
  (failure) => showError(failure.message),
  (user) => navigateToHome(user),
);

❌ MAUVAIS
Future<User> login(String email, String password) async {
  if (email.isEmpty) {
    throw Exception('Email cannot be empty'); // Exception générique
  }

  return await api.login(email, password); // Exception non catchée
}

// Usage - pas de distinction entre types d'erreurs
try {
  final user = await login(email, password);
  navigateToHome(user);
} catch (e) {
  // Tous les cas traités pareil
  showError(e.toString());
}
```

---

## Extensions Dart

**Règle** : Utiliser extensions pour ajouter des méthodes utilitaires.

```dart
✅ BON
// lib/core/extensions/string_extension.dart

extension StringExtension on String {
  /// Vérifie si la chaîne est un email valide
  bool get isValidEmail {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(this);
  }

  /// Capitalise la première lettre
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Tronque à une longueur max avec ellipsis
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength - ellipsis.length)}$ellipsis';
  }
}

// Usage
final email = 'test@example.com';
if (email.isValidEmail) {
  print('Valid!');
}

final name = 'john'.capitalize; // 'John'
final long = 'Very long text'.truncate(10); // 'Very lo...'

❌ MAUVAIS
// Classe avec méthodes statiques
class StringUtils {
  static bool isValidEmail(String value) {
    // ...
  }

  static String capitalize(String value) {
    // ...
  }
}

// Usage moins ergonomique
if (StringUtils.isValidEmail(email)) {
  // ...
}

final name = StringUtils.capitalize('john');
```

**Extensions sur BuildContext** :

```dart
// lib/core/extensions/build_context_extension.dart

extension BuildContextExtension on BuildContext {
  /// Retourne le ThemeData
  ThemeData get theme => Theme.of(this);

  /// Retourne le ColorScheme
  ColorScheme get colorScheme => theme.colorScheme;

  /// Retourne les MediaQuery data
  MediaQueryData get mediaQuery => MediaQuery.of(this);

  /// Retourne la largeur de l'écran
  double get screenWidth => mediaQuery.size.width;

  /// Retourne la hauteur de l'écran
  double get screenHeight => mediaQuery.size.height;

  /// Vérifie si le mode sombre est actif
  bool get isDarkMode => theme.brightness == Brightness.dark;

  /// Navigation
  void push(Widget page) {
    Navigator.of(this).push(
      MaterialPageRoute(builder: (_) => page),
    );
  }

  void pop<T>([T? result]) {
    Navigator.of(this).pop(result);
  }

  /// Afficher un SnackBar
  void showSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

// Usage
Widget build(BuildContext context) {
  return Container(
    color: context.colorScheme.primary,
    width: context.screenWidth * 0.8,
    child: ElevatedButton(
      onPressed: () {
        context.showSnackBar('Success!');
        context.push(const NextPage());
      },
      child: const Text('Continue'),
    ),
  );
}
```

---

## Asynchrone et Futures

### 1. async/await plutôt que then/catchError

**Règle** : Préférer async/await pour lisibilité.

```dart
✅ BON
Future<User> fetchUser(String id) async {
  try {
    final response = await http.get('/users/$id');
    final user = User.fromJson(response.data);
    return user;
  } catch (e) {
    print('Error: $e');
    rethrow;
  }
}

// Usage
try {
  final user = await fetchUser('123');
  print(user.name);
} catch (e) {
  print('Failed to fetch user');
}

❌ MAUVAIS
Future<User> fetchUser(String id) {
  return http.get('/users/$id').then((response) {
    return User.fromJson(response.data);
  }).catchError((e) {
    print('Error: $e');
    throw e;
  });
}

// Usage
fetchUser('123').then((user) {
  print(user.name);
}).catchError((e) {
  print('Failed to fetch user');
});
```

### 2. FutureOr pour flexibilité

**Règle** : Utiliser `FutureOr<T>` quand résultat peut être sync ou async.

```dart
✅ BON
import 'dart:async';

FutureOr<String> getData(bool fromCache) {
  if (fromCache) {
    return 'cached data'; // Synchrone
  } else {
    return Future.delayed(
      const Duration(seconds: 1),
      () => 'fresh data',
    ); // Asynchrone
  }
}

// Usage unifié
final data = await getData(false);
```

---

## Récapitulatif des Linters

**Configuration recommandée** : `analysis_options.yaml`

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

  errors:
    invalid_annotation_target: ignore

  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true

linter:
  rules:
    # Style
    - always_declare_return_types
    - always_put_control_body_on_new_line
    - always_put_required_named_parameters_first
    - always_use_package_imports
    - avoid_print
    - avoid_returning_null_for_void
    - avoid_unnecessary_containers
    - avoid_web_libraries_in_flutter
    - prefer_const_constructors
    - prefer_const_constructors_in_immutables
    - prefer_const_declarations
    - prefer_const_literals_to_create_immutables
    - prefer_final_fields
    - prefer_final_in_for_each
    - prefer_final_locals
    - prefer_single_quotes
    - require_trailing_commas
    - sort_child_properties_last
    - use_key_in_widget_constructors

    # Errors
    - avoid_dynamic_calls
    - avoid_slow_async_io
    - avoid_type_to_string
    - cancel_subscriptions
    - close_sinks
    - valid_regexps

    # Best practices
    - always_declare_return_types
    - avoid_bool_literals_in_conditional_expressions
    - avoid_catching_errors
    - avoid_field_initializers_in_const_classes
    - avoid_returning_null_for_future
    - prefer_collection_literals
    - prefer_constructors_over_static_methods
    - prefer_if_null_operators
    - prefer_null_aware_operators
    - use_build_context_synchronously
```

**Vérification** :

```bash
# Analyser le code
flutter analyze

# Formater automatiquement
dart format lib/ test/

# Fixer les problèmes auto-corrigeables
dart fix --apply
```

---

*Ces standards assurent un code cohérent, lisible et maintenable dans tout projet Flutter.*
