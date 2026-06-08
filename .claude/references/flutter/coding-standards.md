# Flutter/Dart Coding Standards - Dart 3.12+ / Flutter 3.44+

## Core Principle

Follow **Effective Dart**: the official guide for Dart style and best practices.

**Versions 2026:**
- Dart 3.12.x+ (dot shorthands, enhanced patterns)
- Flutter 3.44.x+ (WebAssembly, MCP, hot reload web stable)

References:
- [Effective Dart: Style](https://dart.dev/guides/language/effective-dart/style)
- [Effective Dart: Documentation](https://dart.dev/guides/language/effective-dart/documentation)
- [Effective Dart: Usage](https://dart.dev/guides/language/effective-dart/usage)
- [Effective Dart: Design](https://dart.dev/guides/language/effective-dart/design)

---

## Naming Conventions

### 1. Files and Folders

**Rule**: `snake_case` for all files and folders.

```
✅ GOOD
lib/features/user_profile/presentation/pages/edit_profile_page.dart
lib/core/utils/string_validators.dart
test/features/authentication/auth_bloc_test.dart

❌ BAD
lib/features/UserProfile/presentation/pages/EditProfilePage.dart
lib/core/utils/StringValidators.dart
test/features/authentication/authBlocTest.dart
```

**Exceptions**:
- README.md, CHANGELOG.md (Markdown conventions)
- Makefile, Dockerfile (Unix conventions)

### 2. Classes, Enums, Typedefs, Extensions

**Rule**: `UpperCamelCase` (PascalCase)

```dart
✅ GOOD
class UserProfile {}
class HttpClient {}
enum OrderStatus { pending, confirmed, shipped }
typedef ValidationCallback = bool Function(String);
extension StringExtension on String {}
mixin NetworkMixin {}

❌ BAD
class userProfile {}
class HTTPClient {}  // Unless it's a standard acronym (HTTP, URL, ID)
enum orderStatus {}
typedef validationCallback = bool Function(String);
```

**Acronyms**: Treat as normal words

```dart
✅ GOOD
class HttpRequest {}
class ApiClient {}
class DbHelper {}
class IoUtils {}

❌ BAD
class HTTPRequest {}
class APIClient {}
class DBHelper {}
class IOUtils {}
```

### 3. Variables, Functions, Parameters

**Rule**: `lowerCamelCase`

```dart
✅ GOOD
String userName;
int itemCount;
void calculateTotalPrice() {}
final isAuthenticated = true;
const maxRetryAttempts = 3;

❌ BAD
String user_name;
int ItemCount;
void CalculateTotalPrice() {}
final IsAuthenticated = true;
const MAX_RETRY_ATTEMPTS = 3;
```

### 4. Constants

**Rule**: `lowerCamelCase` (no SCREAMING_CASE)

```dart
✅ GOOD
const defaultTimeout = Duration(seconds: 30);
const apiBaseUrl = 'https://api.example.com';
const maxFileSize = 5 * 1024 * 1024; // 5 MB

// In a class
class ApiConstants {
  static const baseUrl = 'https://api.example.com';
  static const timeout = Duration(seconds: 30);
}

❌ BAD
const DEFAULT_TIMEOUT = Duration(seconds: 30);
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

### 5. Private Members

**Rule**: Prefix with underscore `_`

```dart
✅ GOOD
class MyClass {
  String _privateField;

  void _privateMethod() {}

  String get _privateGetter => _privateField;
}

// Internal package files
lib/src/_internal_helper.dart

❌ BAD
class MyClass {
  String privateField; // Not private!

  void privateMethod() {} // Public!
}
```

---

## Formatting and Style

### 1. Line Length

**Rule**: Maximum 80 characters per line.

```dart
✅ GOOD
final user = User(
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+33612345678',
);

❌ BAD
final user = User(id: '123', name: 'John Doe', email: 'john@example.com', phoneNumber: '+33612345678');
```

**Configuration**: `.editorconfig` or IDE settings

```
[*.dart]
max_line_length = 80
```

### 2. Indentation

**Rule**: 2 spaces (NO tabs).

```dart
✅ GOOD
class MyClass {
  void myMethod() {
    if (condition) {
      doSomething();
    }
  }
}

❌ BAD
class MyClass {
    void myMethod() {  // 4 spaces
        if (condition) {
            doSomething();
        }
    }
}
```

### 3. Braces

**Rule**: Always use braces, even for single lines.

```dart
✅ GOOD
if (condition) {
  doSomething();
}

for (var item in items) {
  print(item);
}

❌ BAD
if (condition)
  doSomething();

for (var item in items) print(item);
```

### 4. Trailing Commas

**Rule**: Always add trailing comma for multi-line lists.

```dart
✅ GOOD
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green,
]; // Trailing comma → Dart formatter organizes automatically

Widget build(BuildContext context) {
  return Column(
    children: [
      Text('Line 1'),
      Text('Line 2'),
      Text('Line 3'),
    ], // Trailing comma
  );
}

❌ BAD
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green // No comma → formatter puts everything on one line
];
```

**Why**: The Dart formatter uses trailing commas to decide formatting.

---

## Dart 3.11+ Features

### 1. Dot Shorthands (Nouveau)

**Rule**: Utiliser dot shorthands quand le type est inféré.

```dart
✅ GOOD - Dart 3.11+
enum OrderStatus { pending, active, completed, cancelled }

// Dans un switch
String getLabel(OrderStatus status) => switch (status) {
  .pending => 'En attente',
  .active => 'Actif',
  .completed => 'Terminé',
  .cancelled => 'Annulé',
};

// Dans les conditions
if (status == .active) { }
if (status case .pending || .active) { }

// Avec constructeurs nommés
final color = .fromRGBO(255, 0, 0, 1.0);  // Color.fromRGBO
final duration = .seconds(5);              // Duration.seconds

// Dans les listes
final statuses = [.pending, .active];     // List<OrderStatus>

❌ BAD - Verbeux quand type évident
if (status == OrderStatus.active) { }  // Inutile quand type inféré
```

### 2. Enhanced Pattern Matching

```dart
✅ GOOD - Patterns améliorés
// Object patterns avec dot shorthands
Widget buildForStatus(OrderStatus status) => switch (status) {
  .pending => const PendingWidget(),
  .active => const ActiveWidget(),
  _ => const DefaultWidget(),
};

// Guard clauses avec dot shorthands
String describe(Order order) => switch (order) {
  Order(status: .pending, total: > 100) => 'High-value pending',
  Order(status: .active) => 'Active order',
  _ => 'Other',
};
```

### 3. Web Interop (dart:js_interop)

```dart
✅ GOOD - dart:js_interop (remplace dart:js)
import 'dart:js_interop';

@JS()
external void consoleLog(String message);

extension type JSConsole(JSObject _) implements JSObject {
  external void log(String message);
}

❌ BAD - dart:js (deprecated)
import 'dart:js';  // Deprecated depuis Dart 3.3
```

---

## Dart 3.12+ Features

### 1. Primary Constructors (Expérimental)

Dart 3.12 introduit les primary constructors (expérimental) : déclarer les paramètres directement dans l'en-tête de classe, éliminant le corps de constructeur boilerplate.

```dart
✅ GOOD - Primary constructors (expérimental, activer avec --enable-experiment=primary-constructors)
class Point(final int x, final int y);

// Équivalent à :
class Point {
  final int x;
  final int y;
  Point(this.x, this.y);
}

// Avec valeurs par défaut et méthodes
class Circle(final double radius) {
  double get area => 3.14159 * radius * radius;
}
```

> **Note :** Fonctionnalité expérimentale en Dart 3.12. Activer avec le flag `--enable-experiment=primary-constructors`.

### 2. Private Named Parameters

Les named parameters peuvent désormais initialiser directement des champs privés, sans liste d'initialisation.

```dart
✅ GOOD - Private named parameters (Dart 3.12)
class Hummingbird {
  final String _petName;
  final int _wingbeatsPerSecond;

  // Les paramètres nommés avec _ initialisent les champs privés
  Hummingbird({required this._petName, required this._wingbeatsPerSecond});
}

// À l'appel : les noms publics sont utilisés (sans _)
final bird = Hummingbird(petName: 'Dash', wingbeatsPerSecond: 75);

❌ AVANT (Dart < 3.12) - Boilerplate nécessaire
class Hummingbird {
  final String _petName;
  final int _wingbeatsPerSecond;

  Hummingbird({required String petName, required int wingbeatsPerSecond})
      : _petName = petName,
        _wingbeatsPerSecond = wingbeatsPerSecond;
}
```

### 3. Agentic Hot Reload

Dart 3.12 introduit l'**Agentic Hot Reload** via le Dart & Flutter MCP Server : les agents IA (Claude Code, Cursor, Copilot) peuvent déclencher un hot reload automatique lors de modifications de code, sans copie manuelle d'URI.

```bash
# Activer le Dart & Flutter MCP Server
dart pub global activate dart_mcp_server

# Configurer dans Claude Code / Cursor :
# Le MCP Server expose les outils hot_reload, get_diagnostics, etc.
# L'agent déclenche automatiquement le hot reload après chaque édition.
```

**Source :** [Dart 3.12 Blog](https://dart.dev/blog/announcing-dart-3-12)

---

## Flutter 3.44+ Features

### 1. WebAssembly Compilation

```dart
// Compilation Wasm pour web (2-3x plus rapide)
// flutter build web --wasm

// Vérifier si Wasm disponible
import 'dart:js_interop';

bool get isWasm => const bool.fromEnvironment('dart.tool.dart2wasm');
```

### 2. Live Region Accessibility

```dart
✅ GOOD - Live regions pour accessibilité
Semantics(
  liveRegion: true,
  child: Text('Mise à jour: $status'),
)
```

### 3. Performance Optimizations

```dart
✅ GOOD - const constructors partout où possible
const MyWidget({super.key});

// RepaintBoundary pour widgets complexes
RepaintBoundary(
  child: ComplexAnimatedWidget(),
)

// Keys pour préserver l'état
ListView.builder(
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id),  // Important!
    item: items[index],
  ),
)
```

---

*Ces standards garantissent un code Flutter/Dart cohérent, lisible et performant pour 2026.*
