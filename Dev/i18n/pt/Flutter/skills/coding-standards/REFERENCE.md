# Padrões de Codificação Flutter/Dart

## Princípio Central

Siga o **Effective Dart**: o guia oficial para estilo e melhores práticas em Dart.

Referências:
- [Effective Dart: Style](https://dart.dev/guides/language/effective-dart/style)
- [Effective Dart: Documentation](https://dart.dev/guides/language/effective-dart/documentation)
- [Effective Dart: Usage](https://dart.dev/guides/language/effective-dart/usage)
- [Effective Dart: Design](https://dart.dev/guides/language/effective-dart/design)

---

## Convenções de Nomenclatura

### 1. Arquivos e Pastas

**Regra**: `snake_case` para todos os arquivos e pastas.

```
✅ BOM
lib/features/user_profile/presentation/pages/edit_profile_page.dart
lib/core/utils/string_validators.dart
test/features/authentication/auth_bloc_test.dart

❌ RUIM
lib/features/UserProfile/presentation/pages/EditProfilePage.dart
lib/core/utils/StringValidators.dart
test/features/authentication/authBlocTest.dart
```

**Exceções**:
- README.md, CHANGELOG.md (convenções Markdown)
- Makefile, Dockerfile (convenções Unix)

### 2. Classes, Enums, Typedefs, Extensions

**Regra**: `UpperCamelCase` (PascalCase)

```dart
✅ BOM
class UserProfile {}
class HttpClient {}
enum OrderStatus { pending, confirmed, shipped }
typedef ValidationCallback = bool Function(String);
extension StringExtension on String {}
mixin NetworkMixin {}

❌ RUIM
class userProfile {}
class HTTPClient {}  // A menos que seja um acrônimo padrão (HTTP, URL, ID)
enum orderStatus {}
typedef validationCallback = bool Function(String);
```

**Acrônimos**: Trate como palavras normais

```dart
✅ BOM
class HttpRequest {}
class ApiClient {}
class DbHelper {}
class IoUtils {}

❌ RUIM
class HTTPRequest {}
class APIClient {}
class DBHelper {}
class IOUtils {}
```

### 3. Variáveis, Funções, Parâmetros

**Regra**: `lowerCamelCase`

```dart
✅ BOM
String userName;
int itemCount;
void calculateTotalPrice() {}
final isAuthenticated = true;
const maxRetryAttempts = 3;

❌ RUIM
String user_name;
int ItemCount;
void CalculateTotalPrice() {}
final IsAuthenticated = true;
const MAX_RETRY_ATTEMPTS = 3;
```

### 4. Constantes

**Regra**: `lowerCamelCase` (sem SCREAMING_CASE)

```dart
✅ BOM
const defaultTimeout = Duration(seconds: 30);
const apiBaseUrl = 'https://api.example.com';
const maxFileSize = 5 * 1024 * 1024; // 5 MB

// Em uma classe
class ApiConstants {
  static const baseUrl = 'https://api.example.com';
  static const timeout = Duration(seconds: 30);
}

❌ RUIM
const DEFAULT_TIMEOUT = Duration(seconds: 30);
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

### 5. Membros Privados

**Regra**: Prefixo com underscore `_`

```dart
✅ BOM
class MyClass {
  String _privateField;

  void _privateMethod() {}

  String get _privateGetter => _privateField;
}

// Arquivos internos do pacote
lib/src/_internal_helper.dart

❌ RUIM
class MyClass {
  String privateField; // Não é privado!

  void privateMethod() {} // Público!
}
```

---

## Formatação e Estilo

### 1. Comprimento de Linha

**Regra**: Máximo de 80 caracteres por linha.

```dart
✅ BOM
final user = User(
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+33612345678',
);

❌ RUIM
final user = User(id: '123', name: 'John Doe', email: 'john@example.com', phoneNumber: '+33612345678');
```

**Configuração**: `.editorconfig` ou configurações da IDE

```
[*.dart]
max_line_length = 80
```

### 2. Indentação

**Regra**: 2 espaços (SEM tabs).

```dart
✅ BOM
class MyClass {
  void myMethod() {
    if (condition) {
      doSomething();
    }
  }
}

❌ RUIM
class MyClass {
    void myMethod() {  // 4 espaços
        if (condition) {
            doSomething();
        }
    }
}
```

### 3. Chaves

**Regra**: Sempre use chaves, mesmo para linhas únicas.

```dart
✅ BOM
if (condition) {
  doSomething();
}

for (var item in items) {
  print(item);
}

❌ RUIM
if (condition)
  doSomething();

for (var item in items) print(item);
```

### 4. Vírgulas Finais

**Regra**: Sempre adicione vírgula final para listas multi-linha.

```dart
✅ BOM
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green,
]; // Vírgula final → Dart formatter organiza automaticamente

Widget build(BuildContext context) {
  return Column(
    children: [
      Text('Line 1'),
      Text('Line 2'),
      Text('Line 3'),
    ], // Vírgula final
  );
}

❌ RUIM
final colors = [
  Colors.red,
  Colors.blue,
  Colors.green // Sem vírgula → formatter coloca tudo em uma linha
];
```

**Por quê**: O Dart formatter usa vírgulas finais para decidir a formatação.

---

*Estes padrões garantem código Flutter consistente, legível e manutenível.*
