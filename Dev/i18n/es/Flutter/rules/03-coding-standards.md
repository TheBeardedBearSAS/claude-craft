# Estándares de Codificación Flutter/Dart

## Principio Central

Seguir **Effective Dart**: la guía oficial para el estilo y las mejores prácticas de Dart.

Referencias:
- [Effective Dart: Style](https://dart.dev/guides/language/effective-dart/style)
- [Effective Dart: Documentation](https://dart.dev/guides/language/effective-dart/documentation)
- [Effective Dart: Usage](https://dart.dev/guides/language/effective-dart/usage)
- [Effective Dart: Design](https://dart.dev/guides/language/effective-dart/design)

---

## Convenciones de Nomenclatura

### 1. Archivos y Carpetas

**Regla**: `snake_case` para todos los archivos y carpetas.

```
✅ BUENO
lib/features/user_profile/presentation/pages/edit_profile_page.dart
lib/core/utils/string_validators.dart
test/features/authentication/auth_bloc_test.dart

❌ MALO
lib/features/UserProfile/presentation/pages/EditProfilePage.dart
lib/core/utils/StringValidators.dart
test/features/authentication/authBlocTest.dart
```

**Excepciones**:
- README.md, CHANGELOG.md (convenciones de Markdown)
- Makefile, Dockerfile (convenciones de Unix)

### 2. Clases, Enums, Typedefs, Extensiones

**Regla**: `UpperCamelCase` (PascalCase)

```dart
✅ BUENO
class UserProfile {}
class HttpClient {}
enum OrderStatus { pending, confirmed, shipped }
typedef ValidationCallback = bool Function(String);
extension StringExtension on String {}
mixin NetworkMixin {}

❌ MALO
class userProfile {}
class HTTPClient {}  // A menos que sea un acrónimo estándar (HTTP, URL, ID)
enum orderStatus {}
typedef validationCallback = bool Function(String);
```

**Acrónimos**: Tratar como palabras normales

```dart
✅ BUENO
class HttpRequest {}
class ApiClient {}
class DbHelper {}
class IoUtils {}

❌ MALO
class HTTPRequest {}
class APIClient {}
class DBHelper {}
class IOUtils {}
```

### 3. Variables, Funciones, Parámetros

**Regla**: `lowerCamelCase`

```dart
✅ BUENO
String userName;
int itemCount;
void calculateTotalPrice() {}
final isAuthenticated = true;
const maxRetryAttempts = 3;

❌ MALO
String user_name;
int ItemCount;
void CalculateTotalPrice() {}
final IsAuthenticated = true;
const MAX_RETRY_ATTEMPTS = 3;
```

### 4. Constantes

**Regla**: `lowerCamelCase` (no SCREAMING_CASE)

```dart
✅ BUENO
const defaultTimeout = Duration(seconds: 30);
const apiBaseUrl = 'https://api.example.com';
const maxFileSize = 5 * 1024 * 1024; // 5 MB

// En una clase
class ApiConstants {
  static const baseUrl = 'https://api.example.com';
  static const timeout = Duration(seconds: 30);
}

❌ MALO
const DEFAULT_TIMEOUT = Duration(seconds: 30);
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

### 5. Miembros Privados

**Regla**: Prefijo con guion bajo `_`

```dart
✅ BUENO
class MyClass {
  String _privateField;

  void _privateMethod() {}

  String get _privateGetter => _privateField;
}

// Archivos internos del paquete
lib/src/_internal_helper.dart

❌ MALO
class MyClass {
  String privateField; // ¡No es privado!

  void privateMethod() {} // ¡Público!
}
```

---

## Formato y Estilo

### 1. Longitud de Línea

**Regla**: Máximo 80 caracteres por línea.

```dart
✅ BUENO
final user = User(
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+33612345678',
);

❌ MALO
final user = User(id: '123', name: 'John Doe', email: 'john@example.com', phoneNumber: '+33612345678');
```

**Configuración**: `.editorconfig` o configuración del IDE

```
[*.dart]
max_line_length = 80
```

### 2. Indentación

**Regla**: 2 espacios (NO tabulaciones).

```dart
✅ BUENO
class MyClass {
  void myMethod() {
    if (condition) {
      doSomething();
    }
  }
}

❌ MALO
class MyClass {
    void myMethod() {  // 4 espacios
        if (condition) {
            doSomething();
        }
    }
}
```

### 3. Llaves

**Regla**: Usar siempre llaves, incluso para líneas simples.

```dart
✅ BUENO
if (condition) {
  doSomething();
}

for (var item in items) {
  print(item);
}

❌ MALO
if (condition)
  doSomething();

for (var item in items) print(item);
```

### 4. Comas Finales

**Regla**: Agregar siempre coma final para listas multi-línea.

```dart
✅ BUENO
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green,
]; // Coma final → El formateador de Dart organiza automáticamente

Widget build(BuildContext context) {
  return Column(
    children: [
      Text('Line 1'),
      Text('Line 2'),
      Text('Line 3'),
    ], // Coma final
  );
}

❌ MALO
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green // Sin coma → el formateador pone todo en una línea
];
```

**Por qué**: El formateador de Dart usa las comas finales para decidir el formato.

---

*Estos estándares aseguran un código Flutter consistente, legible y mantenible.*
