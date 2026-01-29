# Flutter Security

## Secure Storage

### flutter_secure_storage

```dart
// pubspec.yaml
dependencies:
  flutter_secure_storage: ^9.0.0

// Usage
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

### L DON'T DO

```dart
// L SharedPreferences for sensitive data
final prefs = await SharedPreferences.getInstance();
prefs.setString('password', password); // NOT ENCRYPTED!

// L Hardcode secrets
const apiKey = 'sk_live_1234567890'; // NEVER!

// L Store in clear text
final file = File('token.txt');
file.writeAsString(token); // NOT ENCRYPTED!
```

---

## API Keys & Secrets

### Environment Variables

```dart
// .env
API_KEY=your_api_key_here
API_SECRET=your_secret_here

// DO NOT commit .env
// .gitignore
.env
*.env

// Load with flutter_dotenv
dependencies:
  flutter_dotenv: ^5.1.0

// main.dart
await dotenv.load();
final apiKey = dotenv.env['API_KEY'];

// Or dart-define
flutter run --dart-define=API_KEY=your_key

// In code
const apiKey = String.fromEnvironment('API_KEY');
```

### Obfuscation

```bash
# Build with obfuscation
flutter build apk --obfuscate --split-debug-info=build/app/outputs/symbols

flutter build ios --obfuscate --split-debug-info=build/ios/symbols
```

---

## HTTPS & Certificate Pinning

```dart
// Certificate pinning with Dio
class SecureApiClient {
  late Dio _dio;

  SecureApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
    ));

    // Add certificate pinning
    (_dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate =
        (client) {
      client.badCertificateCallback = (cert, host, port) {
        // Verify certificate
        return cert.pem == expectedCertificatePem;
      };
      return client;
    };
  }
}
```

---

## Input Validation

```dart
class InputValidator {
  // SQL Injection prevention
  static String sanitize(String input) {
    return input.replaceAll(RegExp(r'[^\w\s]'), '');
  }

  // XSS prevention
  static String escapeHtml(String input) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#x27;');
  }

  // Email validation
  static bool isValidEmail(String email) {
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return regex.hasMatch(email);
  }
}
```

---

## Authentication

```dart
// JWT Token management
class AuthService {
  final SecureStorageService _storage;
  final Dio _dio;

  Future<void> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    final token = response.data['token'];

    // Store securely
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

// Interceptor to add token
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

## Permissions

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

## Security Checklist

```
¡ Sensitive data in flutter_secure_storage
¡ API keys in environment variables
¡ HTTPS only
¡ Certificate pinning implemented
¡ Code obfuscation in production
¡ User input validation
¡ No sensitive logs in production
¡ Minimal permissions
¡ Request timeouts
¡ Secure token management
```

---

*Security must be integrated from the start of development.*
