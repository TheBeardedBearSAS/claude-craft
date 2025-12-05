# Principios SOLID en Flutter/Dart

## Introducción

Los principios **SOLID** son 5 principios de diseño orientado a objetos que hacen el código más mantenible, testeable y escalable.

**Acrónimo SOLID**:
- **S**ingle Responsibility Principle (Principio de Responsabilidad Única)
- **O**pen/Closed Principle (Principio Abierto/Cerrado)
- **L**iskov Substitution Principle (Principio de Sustitución de Liskov)
- **I**nterface Segregation Principle (Principio de Segregación de Interfaces)
- **D**ependency Inversion Principle (Principio de Inversión de Dependencias)

---

## S - Single Responsibility Principle (SRP)

### Definición

> Una clase debe tener solo una razón para cambiar.

Cada clase debe tener una única responsabilidad, un único propósito.

### Ejemplos Flutter

#### ❌ MALO: Clase con múltiples responsabilidades

```dart
// Esta clase hace DEMASIADO
class UserManager {
  final Dio _dio;
  final SharedPreferences _prefs;

  UserManager(this._dio, this._prefs);

  // Responsabilidad 1: Obtener datos de la API
  Future<User> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return User.fromJson(response.data);
  }

  // Responsabilidad 2: Guardar en caché local
  Future<void> cacheUser(User user) async {
    await _prefs.setString('user_${user.id}', jsonEncode(user.toJson()));
  }

  // Responsabilidad 3: Validar datos
  bool validateUser(User user) {
    return user.email.isNotEmpty && user.name.isNotEmpty;
  }

  // Responsabilidad 4: Formatear para visualización
  String formatUserDisplay(User user) {
    return '${user.name} (${user.email})';
  }

  // DEMASIADAS RAZONES PARA CAMBIAR:
  // - Si la API cambia
  // - Si el sistema de caché cambia
  // - Si las reglas de validación cambian
  // - Si el formato de visualización cambia
}
```

#### ✅ BUENO: Responsabilidades separadas

```dart
// Responsabilidad 1: Acceso a la API
class UserRemoteDataSource {
  final Dio _dio;

  UserRemoteDataSource(this._dio);

  Future<UserModel> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return UserModel.fromJson(response.data);
  }
}

// Responsabilidad 2: Caché Local
class UserLocalDataSource {
  final SharedPreferences _prefs;

  UserLocalDataSource(this._prefs);

  Future<void> cacheUser(UserModel user) async {
    await _prefs.setString('user_${user.id}', jsonEncode(user.toJson()));
  }

  Future<UserModel?> getCachedUser(String id) async {
    final json = _prefs.getString('user_$id');
    if (json == null) return null;
    return UserModel.fromJson(jsonDecode(json));
  }
}

// Responsabilidad 3: Validación de Negocio
class UserValidator {
  ValidationResult validate(User user) {
    final errors = <String>[];

    if (user.email.isEmpty) {
      errors.add('Email is required');
    } else if (!_isValidEmail(user.email)) {
      errors.add('Invalid email format');
    }

    if (user.name.isEmpty) {
      errors.add('Name is required');
    }

    return errors.isEmpty
        ? ValidationResult.valid()
        : ValidationResult.invalid(errors);
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
}

// Responsabilidad 4: Formateador de Visualización
class UserDisplayFormatter {
  String formatFull(User user) {
    return '${user.name} (${user.email})';
  }

  String formatShort(User user) {
    return user.name;
  }

  String formatWithAge(User user) {
    final age = DateTime.now().year - user.birthDate.year;
    return '${user.name}, $age años';
  }
}

// Orquestación mediante Repository
class UserRepository {
  final UserRemoteDataSource _remoteDataSource;
  final UserLocalDataSource _localDataSource;

  UserRepository(this._remoteDataSource, this._localDataSource);

  Future<Either<Failure, User>> getUser(String id) async {
    try {
      final userModel = await _remoteDataSource.fetchUser(id);
      await _localDataSource.cacheUser(userModel);
      return Right(userModel.toEntity());
    } catch (e) {
      // Fallback a caché
      final cached = await _localDataSource.getCachedUser(id);
      if (cached != null) {
        return Right(cached.toEntity());
      }
      return Left(ServerFailure(e.toString()));
    }
  }
}
```

*[Continuación del archivo con los otros principios SOLID...]*

---

## O - Open/Closed Principle (OCP)

### Definición

> Las entidades de software deben estar abiertas para extensión pero cerradas para modificación.

Debes poder agregar funcionalidad sin modificar el código existente.

### Ejemplos Flutter

#### ❌ MALO: Modificación requerida para cada nuevo tipo

```dart
// Clase que requiere modificación para cada nuevo tipo de pago
class PaymentProcessor {
  Future<bool> processPayment(String method, double amount) async {
    if (method == 'credit_card') {
      // Lógica de tarjeta de crédito
      return await _processCreditCard(amount);
    } else if (method == 'paypal') {
      // Lógica de PayPal
      return await _processPayPal(amount);
    } else if (method == 'apple_pay') {
      // Lógica de Apple Pay
      return await _processApplePay(amount);
    }
    // ¡Necesita MODIFICAR esta clase para agregar un nuevo método de pago!
    return false;
  }

  Future<bool> _processCreditCard(double amount) async {
    // ...
  }

  Future<bool> _processPayPal(double amount) async {
    // ...
  }

  Future<bool> _processApplePay(double amount) async {
    // ...
  }
}
```

#### ✅ BUENO: Extensión sin modificación

```dart
// Interfaz (contrato)
abstract class PaymentMethod {
  Future<bool> process(double amount);
  String get displayName;
  IconData get icon;
}

// Implementaciones (extensiones)
class CreditCardPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Lógica de tarjeta de crédito
    return true;
  }

  @override
  String get displayName => 'Tarjeta de Crédito';

  @override
  IconData get icon => Icons.credit_card;
}

class PayPalPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Lógica de PayPal
    return true;
  }

  @override
  String get displayName => 'PayPal';

  @override
  IconData get icon => Icons.account_balance_wallet;
}

// ¿Nuevo método de pago? ¡Solo crear una nueva clase!
class GooglePayPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Lógica de Google Pay
    return true;
  }

  @override
  String get displayName => 'Google Pay';

  @override
  IconData get icon => Icons.android;
}

// Procesador genérico (cerrado a modificación)
class PaymentProcessor {
  Future<bool> processPayment(PaymentMethod method, double amount) async {
    return await method.process(amount);
  }
}
```

---

*La aplicación de los principios SOLID hace que el código Flutter sea más mantenible, testeable y escalable.*
