# Segurança Flutter

## Armazenamento Seguro

### flutter_secure_storage

```dart
// pubspec.yaml
dependencies:
  flutter_secure_storage: ^9.0.0

// Uso
class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

### NÃO FAÇA

```dart
// SharedPreferences para dados sensíveis
final prefs = await SharedPreferences.getInstance();
prefs.setString('password', password); // NÃO CRIPTOGRAFADO!

// Hardcode de secrets
const apiKey = 'sk_live_1234567890'; // NUNCA!

// Armazenar em texto claro
final file = File('token.txt');
file.writeAsString(token); // NÃO CRIPTOGRAFADO!
```

---

## API Keys & Secrets

### Variáveis de Ambiente

```dart
// .env
API_KEY=sua_api_key_aqui
API_SECRET=seu_secret_aqui

// NÃO commitar .env
// .gitignore
.env
*.env

// Carregar com flutter_dotenv
dependencies:
  flutter_dotenv: ^5.1.0

// main.dart
await dotenv.load();
final apiKey = dotenv.env['API_KEY'];

// Ou dart-define
flutter run --dart-define=API_KEY=sua_key

// No código
const apiKey = String.fromEnvironment('API_KEY');
```

### Ofuscação

```bash
# Build com ofuscação
flutter build apk --obfuscate --split-debug-info=build/app/outputs/symbols

flutter build ios --obfuscate --split-debug-info=build/ios/symbols
```

---

## HTTPS & Certificate Pinning

```dart
// Certificate pinning com Dio
class SecureApiClient {
  late Dio _dio;

  SecureApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
    ));

    // Adicionar certificate pinning
    (_dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate =
        (client) {
      client.badCertificateCallback = (cert, host, port) {
        // Verificar certificado
        return cert.pem == expectedCertificatePem;
      };
      return client;
    };
  }
}
```

---

## Validação de Entrada

```dart
class InputValidator {
  // Prevenção de SQL Injection
  static String sanitize(String input) {
    return input.replaceAll(RegExp(r'[^\w\s]'), '');
  }

  // Prevenção de XSS
  static String escapeHtml(String input) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#x27;');
  }

  // Validação de email
  static bool isValidEmail(String email) {
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return regex.hasMatch(email);
  }
}
```

---

## Autenticação

```dart
// Gerenciamento de JWT Token
class AuthService {
  final SecureStorageService _storage;
  final Dio _dio;

  Future<void> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    final token = response.data['token'];

    // Armazenar de forma segura
    await _storage.saveToken(token);
  }

  Future<void> refreshToken() async {
    final token = await _storage.getToken();

    final response = await _dio.post('/auth/refresh', data: {
      'token': token,
    });

    final newToken = response.data['token'];
    await _storage.saveToken(newToken);
  }
}

// Interceptor para adicionar token
class AuthInterceptor extends Interceptor {
  final SecureStorageService _storage;

  AuthInterceptor(this._storage);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.getToken();

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }
}
```

---

## Permissões

```dart
// permission_handler
dependencies:
  permission_handler: ^11.0.0

class PermissionService {
  Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  Future<bool> requestLocationPermission() async {
    final status = await Permission.location.request();
    return status.isGranted;
  }

  Future<bool> checkPermission(Permission permission) async {
    final status = await permission.status;
    return status.isGranted;
  }
}
```

---

## Checklist de Segurança

```
✓ Dados sensíveis em flutter_secure_storage
✓ API keys em variáveis de ambiente
✓ Apenas HTTPS
✓ Certificate pinning implementado
✓ Ofuscação de código em produção
✓ Validação de entrada do usuário
✓ Sem logs sensíveis em produção
✓ Permissões mínimas
✓ Timeouts de requisição
✓ Gerenciamento seguro de tokens
```

---

*A segurança deve ser integrada desde o início do desenvolvimento.*
