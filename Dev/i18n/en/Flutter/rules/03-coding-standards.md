# Flutter/Dart Coding Standards

## Core Principle

Follow **Effective Dart**: the official guide for Dart style and best practices.

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

*These standards ensure consistent, readable, and maintainable Flutter code.*
