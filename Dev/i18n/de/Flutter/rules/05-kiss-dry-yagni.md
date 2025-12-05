# Principes KISS, DRY et YAGNI en Flutter

## Introduction

Ces trois principes de programmation guident vers un code simple, maintenable et efficace.

- **KISS** : Keep It Simple, Stupid
- **DRY** : Don't Repeat Yourself
- **YAGNI** : You Aren't Gonna Need It

---

## KISS - Keep It Simple, Stupid

### Principle

> La simplicité doit être un objectif clé. La plupart des systèmes fonctionnent mieux s'ils restent simples plutôt que complexes.

**Citation** :
> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

### Examples Flutter

#### ❌ SCHLECHT : Sur-complexification

```dart
// Abstraction inutile pour quelque chose de simple
abstract class StringFormatterStrategy {
  String format(String input);
}

class UpperCaseFormatterStrategy implements StringFormatterStrategy {
  @override
  String format(String input) => input.toUpperCase();
}

class LowerCaseFormatterStrategy implements StringFormatterStrategy {
  @override
  String format(String input) => input.toLowerCase();
}

class StringFormatterContext {
  StringFormatterStrategy? _strategy;

  void setStrategy(StringFormatterStrategy strategy) {
    _strategy = strategy;
  }

  String executeStrategy(String input) {
    if (_strategy == null) {
      throw StateError('Strategy not set');
    }
    return _strategy!.format(input);
  }
}

// Usage complexe pour une tâche simple
final formatter = StringFormatterContext();
formatter.setStrategy(UpperCaseFormatterStrategy());
final result = formatter.executeStrategy('hello'); // HELLO
```

#### ✅ GUT : Solution simple

```dart
// Extension simple et directe
extension StringFormatting on String {
  String toUpper() => toUpperCase();
  String toLower() => toLowerCase();
  String toCapitalized() => isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
}

// Usage simple
final result = 'hello'.toUpper(); // HELLO
final name = 'john'.toCapitalized(); // John
```

### Widgets simples vs complexes

#### ❌ SCHLECHT : Widget sur-ingéniéré

```dart
class CustomButtonBuilder {
  Color? _backgroundColor;
  Color? _textColor;
  double? _fontSize;
  EdgeInsets? _padding;
  VoidCallback? _onPressed;
  String? _text;

  CustomButtonBuilder setBackgroundColor(Color color) {
    _backgroundColor = color;
    return this;
  }

  CustomButtonBuilder setTextColor(Color color) {
    _textColor = color;
    return this;
  }

  CustomButtonBuilder setFontSize(double size) {
    _fontSize = size;
    return this;
  }

  CustomButtonBuilder setPadding(EdgeInsets padding) {
    _padding = padding;
    return this;
  }

  CustomButtonBuilder setOnPressed(VoidCallback callback) {
    _onPressed = callback;
    return this;
  }

  CustomButtonBuilder setText(String text) {
    _text = text;
    return this;
  }

  Widget build() {
    return ElevatedButton(
      onPressed: _onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: _backgroundColor ?? Colors.blue,
        foregroundColor: _textColor ?? Colors.white,
        padding: _padding ?? const EdgeInsets.all(16),
      ),
      child: Text(
        _text ?? '',
        style: TextStyle(fontSize: _fontSize ?? 14),
      ),
    );
  }
}

// Usage verbeux
final button = CustomButtonBuilder()
    .setBackgroundColor(Colors.red)
    .setTextColor(Colors.white)
    .setFontSize(16)
    .setPadding(const EdgeInsets.all(20))
    .setText('Click me')
    .setOnPressed(() => print('Clicked'))
    .build();
```

#### ✅ GUT : Widget simple avec named parameters

```dart
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.backgroundColor,
    this.textColor,
    this.fontSize = 14,
    this.padding = const EdgeInsets.all(16),
  });

  final String text;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? textColor;
  final double fontSize;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? Colors.blue,
        foregroundColor: textColor ?? Colors.white,
        padding: padding,
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: fontSize),
      ),
    );
  }
}

// Usage simple et clair
AppButton(
  text: 'Click me',
  onPressed: () => print('Clicked'),
  backgroundColor: Colors.red,
  fontSize: 16,
  padding: const EdgeInsets.all(20),
)
```

### State Management simple

#### ❌ SCHLECHT : Over-engineering pour état simple

```dart
// BLoC complet pour un simple compteur
abstract class CounterEvent {}
class IncrementPressed extends CounterEvent {}
class DecrementPressed extends CounterEvent {}
class ResetPressed extends CounterEvent {}

abstract class CounterState {
  final int value;
  CounterState(this.value);
}
class CounterInitial extends CounterState {
  CounterInitial() : super(0);
}
class CounterUpdated extends CounterState {
  CounterUpdated(super.value);
}

class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(CounterInitial()) {
    on<IncrementPressed>((event, emit) {
      emit(CounterUpdated(state.value + 1));
    });
    on<DecrementPressed>((event, emit) {
      emit(CounterUpdated(state.value - 1));
    });
    on<ResetPressed>((event, emit) {
      emit(CounterInitial());
    });
  }
}

// Usage complexe
BlocProvider(
  create: (_) => CounterBloc(),
  child: BlocBuilder<CounterBloc, CounterState>(
    builder: (context, state) {
      return Column(
        children: [
          Text('${state.value}'),
          ElevatedButton(
            onPressed: () => context.read<CounterBloc>().add(IncrementPressed()),
            child: const Text('+'),
          ),
        ],
      );
    },
  ),
)
```

#### ✅ GUT : ValueNotifier pour état simple

```dart
class CounterNotifier extends ValueNotifier<int> {
  CounterNotifier() : super(0);

  void increment() => value++;
  void decrement() => value--;
  void reset() => value = 0;
}

// Usage simple
final counterNotifier = CounterNotifier();

ValueListenableBuilder<int>(
  valueListenable: counterNotifier,
  builder: (context, count, child) {
    return Column(
      children: [
        Text('$count'),
        ElevatedButton(
          onPressed: counterNotifier.increment,
          child: const Text('+'),
        ),
      ],
    );
  },
)

// Ou encore plus simple avec StatefulWidget si local
class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _count = 0;

  void _increment() => setState(() => _count++);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$_count'),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('+'),
        ),
      ],
    );
  }
}
```

**Règle KISS** :
- État local et simple → `StatefulWidget` ou `ValueNotifier`
- État partagé entre widgets → `Provider` ou `Riverpod`
- Logique métier complexe → `BLoC`

---

## DRY - Don't Repeat Yourself

### Principle

> Chaque connaissance doit avoir une représentation unique, non ambiguë et autoritaire dans un système.

Éviter la duplication de code et de logique.

### Examples Flutter

#### ❌ SCHLECHT : Code dupliqué

```dart
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Champ email
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey),
            ),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Email',
                border: InputBorder.none,
              ),
            ),
          ),

          // Champ password - CODE DUPLIQUÉ
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey),
            ),
            child: TextField(
              obscureText: true,
              decoration: InputDecoration(
                hintText: 'Password',
                border: InputBorder.none,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class RegisterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // MÊME CODE DUPLIQUÉ ENCORE
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey),
            ),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Email',
                border: InputBorder.none,
              ),
            ),
          ),
          // ... encore plus de duplication
        ],
      ),
    );
  }
}
```

#### ✅ GUT : Widget réutilisable

```dart
// Widget réutilisable
class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.hintText,
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
  });

  final String hintText;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          hintText: hintText,
          border: InputBorder.none,
        ),
      ),
    );
  }
}

// Usage - DRY
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          AppTextField(hintText: 'Email', keyboardType: TextInputType.emailAddress),
          AppTextField(hintText: 'Password', obscureText: true),
        ],
      ),
    );
  }
}

class RegisterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          AppTextField(hintText: 'Email', keyboardType: TextInputType.emailAddress),
          AppTextField(hintText: 'Password', obscureText: true),
          AppTextField(hintText: 'Confirm Password', obscureText: true),
        ],
      ),
    );
  }
}
```

### Logique métier dupliquée

#### ❌ SCHLECHT : Validation dupliquée

```dart
class LoginPage extends StatelessWidget {
  bool _validateEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  bool _validatePassword(String password) {
    return password.length >= 8;
  }

  void _login(String email, String password) {
    if (!_validateEmail(email)) {
      // Error
      return;
    }
    if (!_validatePassword(password)) {
      // Error
      return;
    }
    // Login logic
  }
}

class RegisterPage extends StatelessWidget {
  // DUPLICATION - même code de validation
  bool _validateEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  bool _validatePassword(String password) {
    return password.length >= 8;
  }

  void _register(String email, String password) {
    if (!_validateEmail(email)) {
      // Error
      return;
    }
    if (!_validatePassword(password)) {
      // Error
      return;
    }
    // Register logic
  }
}
```

#### ✅ GUT : Validation centralisée

```dart
// lib/core/utils/validators.dart

class Validators {
  static final RegExp _emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');

  static String? email(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    if (!_emailRegex.hasMatch(value)) {
      return 'Invalid email format';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }
    return null;
  }

  static String? required(String? value, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? 'Field'} is required';
    }
    return null;
  }

  static String? minLength(String? value, int min, {String? fieldName}) {
    if (value == null || value.length < min) {
      return '${fieldName ?? 'Field'} must be at least $min characters';
    }
    return null;
  }
}

// Usage partout
class LoginPage extends StatelessWidget {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            decoration: const InputDecoration(labelText: 'Email'),
            validator: Validators.email, // Réutilisé
          ),
          TextFormField(
            decoration: const InputDecoration(labelText: 'Password'),
            validator: Validators.password, // Réutilisé
            obscureText: true,
          ),
        ],
      ),
    );
  }
}
```

### Thèmes et styles

#### ❌ SCHLECHT : Styles en dur partout

```dart
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Title',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF333333),
          ),
        ),
        Text(
          'Subtitle',
          style: TextStyle(
            fontSize: 16,
            color: Color(0xFF666666),
          ),
        ),
      ],
    );
  }
}

class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // DUPLICATION des mêmes styles
        Text(
          'Profile',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF333333),
          ),
        ),
        Text(
          'Bio',
          style: TextStyle(
            fontSize: 16,
            color: Color(0xFF666666),
          ),
        ),
      ],
    );
  }
}
```

#### ✅ GUT : Theme centralisé

```dart
// lib/core/theme/app_theme.dart

class AppTheme {
  static const Color primaryColor = Color(0xFF2196F3);
  static const Color textDark = Color(0xFF333333);
  static const Color textMedium = Color(0xFF666666);
  static const Color textLight = Color(0xFF999999);

  static ThemeData lightTheme = ThemeData(
    primaryColor: primaryColor,
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: textDark,
      ),
      headlineMedium: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: textDark,
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        color: textMedium,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        color: textMedium,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        color: textLight,
      ),
    ),
  );
}

// lib/main.dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: AppTheme.lightTheme,
      home: HomePage(),
    );
  }
}

// Usage - styles réutilisés automatiquement
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Text('Title', style: theme.textTheme.headlineMedium),
        Text('Subtitle', style: theme.textTheme.bodyLarge),
      ],
    );
  }
}

class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Text('Profile', style: theme.textTheme.headlineMedium),
        Text('Bio', style: theme.textTheme.bodyLarge),
      ],
    );
  }
}
```

---

## YAGNI - You Aren't Gonna Need It

### Principle

> N'implémentez pas quelque chose tant que vous n'en avez pas besoin.

Ne pas coder des fonctionnalités "au cas où" elles seraient utiles un jour.

### Examples Flutter

#### ❌ SCHLECHT : Over-engineering précoce

```dart
// Abstraction complexe pour un besoin simple actuel
abstract class DataCacheStrategy {
  Future<void> cache(String key, dynamic value);
  Future<dynamic> retrieve(String key);
  Future<void> invalidate(String key);
  Future<void> clear();
}

abstract class DataCompressionStrategy {
  List<int> compress(String data);
  String decompress(List<int> data);
}

abstract class DataEncryptionStrategy {
  String encrypt(String data);
  String decrypt(String data);
}

class AdvancedCacheManager {
  final DataCacheStrategy cacheStrategy;
  final DataCompressionStrategy? compressionStrategy;
  final DataEncryptionStrategy? encryptionStrategy;
  final Duration? ttl;
  final int? maxSize;
  final bool? enableCompression;
  final bool? enableEncryption;

  AdvancedCacheManager({
    required this.cacheStrategy,
    this.compressionStrategy,
    this.encryptionStrategy,
    this.ttl,
    this.maxSize,
    this.enableCompression = false,
    this.enableEncryption = false,
  });

  Future<void> store(String key, String value) async {
    var data = value;

    // Compression (pas encore nécessaire)
    if (enableCompression == true && compressionStrategy != null) {
      final compressed = compressionStrategy!.compress(data);
      data = String.fromCharCodes(compressed);
    }

    // Encryption (pas encore nécessaire)
    if (enableEncryption == true && encryptionStrategy != null) {
      data = encryptionStrategy!.encrypt(data);
    }

    // TTL tracking (pas encore nécessaire)
    if (ttl != null) {
      // Complex TTL logic
    }

    // Size limit (pas encore nécessaire)
    if (maxSize != null) {
      // Complex size management
    }

    await cacheStrategy.cache(key, data);
  }

  // ... beaucoup de code inutilisé
}

// Besoin ACTUEL : juste sauver une valeur
// Tout le reste est YAGNI (You Aren't Gonna Need It)
```

#### ✅ GUT : Implémentation minimale pour besoin actuel

```dart
// Solution simple pour le besoin ACTUEL
class SimpleCacheManager {
  final SharedPreferences _prefs;

  SimpleCacheManager(this._prefs);

  Future<void> save(String key, String value) async {
    await _prefs.setString(key, value);
  }

  String? get(String key) {
    return _prefs.getString(key);
  }

  Future<void> remove(String key) async {
    await _prefs.remove(key);
  }
}

// SI on a besoin de compression/encryption plus tard, on refactorera
// Principe: Implement when needed, not when anticipated
```

### Feature flags et configurations inutiles

#### ❌ SCHLECHT : Configuration "future-proof" inutile

```dart
class AppConfig {
  // Actuellement utilisé
  final String apiBaseUrl;

  // YAGNI - pas encore de support multi-langue
  final String defaultLanguage;
  final List<String> supportedLanguages;

  // YAGNI - pas de thèmes multiples
  final String defaultTheme;
  final Map<String, ThemeData> themes;

  // YAGNI - pas de A/B testing
  final bool enableABTesting;
  final Map<String, dynamic> abTestingConfig;

  // YAGNI - analytics pas encore intégré
  final bool enableAnalytics;
  final String analyticsKey;

  // YAGNI - pas de feature flags
  final Map<String, bool> featureFlags;

  // ... 20 autres configs "au cas où"

  AppConfig({
    required this.apiBaseUrl,
    this.defaultLanguage = 'en',
    this.supportedLanguages = const ['en', 'fr', 'es'],
    this.defaultTheme = 'light',
    this.themes = const {},
    this.enableABTesting = false,
    this.abTestingConfig = const {},
    this.enableAnalytics = false,
    this.analyticsKey = '',
    this.featureFlags = const {},
  });
}
```

#### ✅ GUT : Configuration pour besoins actuels

```dart
class AppConfig {
  final String apiBaseUrl;
  final Duration apiTimeout;

  const AppConfig({
    required this.apiBaseUrl,
    this.apiTimeout = const Duration(seconds: 30),
  });

  // Configuration pour l'environnement actuel
  factory AppConfig.production() {
    return const AppConfig(
      apiBaseUrl: 'https://api.production.com',
    );
  }

  factory AppConfig.development() {
    return const AppConfig(
      apiBaseUrl: 'http://localhost:3000',
      apiTimeout: Duration(seconds: 60),
    );
  }
}

// Ajouter d'autres configs QUAND nécessaire
```

### Abstraction prématurée

#### ❌ SCHLECHT : Abstraction sans besoin réel

```dart
// Abstraction pour UN SEUL provider actuellement
abstract class AuthProvider {
  Future<User> login(String email, String password);
  Future<void> logout();
}

class EmailAuthProvider implements AuthProvider {
  @override
  Future<User> login(String email, String password) async {
    // Email/password login
  }

  @override
  Future<void> logout() async {
    // Logout
  }
}

// On crée des interfaces "au cas où" on voudrait OAuth, etc.
// Mais actuellement on n'a besoin QUE d'email/password !
abstract class OAuthProvider extends AuthProvider {
  Future<User> loginWithGoogle();
  Future<User> loginWithFacebook();
  Future<User> loginWithApple();
}

// Implémentations vides car pas encore nécessaire
class GoogleAuthProvider implements OAuthProvider {
  @override
  Future<User> login(String email, String password) {
    throw UnimplementedError();
  }

  @override
  Future<void> logout() {
    throw UnimplementedError();
  }

  @override
  Future<User> loginWithGoogle() {
    throw UnimplementedError(); // Pas encore implémenté
  }

  @override
  Future<User> loginWithFacebook() {
    throw UnimplementedError();
  }

  @override
  Future<User> loginWithApple() {
    throw UnimplementedError();
  }
}
```

#### ✅ GUT : Implémentation directe

```dart
// Implémentation simple pour le besoin actuel
class AuthService {
  final Dio _dio;

  AuthService(this._dio);

  Future<User> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    return User.fromJson(response.data);
  }

  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }
}

// SI on ajoute Google/Facebook login plus tard :
// 1. Créer l'abstraction À CE MOMENT-LÀ
// 2. Refactorer pour utiliser l'abstraction
// 3. Implémenter les nouveaux providers

// Principe : Code simple maintenant, refactor quand besoin réel
```

---

## Équilibre entre DRY et KISS

### Le piège : DRY extrême

#### ❌ SCHLECHT : Abstraction excessive pour économiser 2 lignes

```dart
// Fonction "générique" pour économiser la duplication
Widget buildStyledContainer({
  required Widget child,
  Color? backgroundColor,
  double? width,
  double? height,
  EdgeInsets? padding,
  EdgeInsets? margin,
  Border? border,
  BorderRadius? borderRadius,
  List<BoxShadow>? boxShadow,
  Gradient? gradient,
  AlignmentGeometry? alignment,
  // ... 20 autres paramètres optionnels
}) {
  return Container(
    width: width,
    height: height,
    padding: padding,
    margin: margin,
    alignment: alignment,
    decoration: BoxDecoration(
      color: backgroundColor,
      border: border,
      borderRadius: borderRadius,
      boxShadow: boxShadow,
      gradient: gradient,
    ),
    child: child,
  );
}

// Usage devient aussi verbeux que l'original
final widget = buildStyledContainer(
  child: Text('Hello'),
  backgroundColor: Colors.blue,
  padding: EdgeInsets.all(16),
  // ...
);
```

#### ✅ GUT : Duplication acceptable pour simplicité

```dart
// Parfois, un peu de duplication est OK si le code reste simple

class ProfileCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: // ... content
    );
  }
}

class ProductCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: // ... content
    );
  }
}

// Un peu de duplication, mais chaque widget reste simple et compréhensible
// Si vraiment beaucoup de cards similaires, ALORS créer un widget réutilisable
```

---

## Checklist KISS/DRY/YAGNI

### Avant d'écrire du code

```
KISS :
□ La solution la plus simple possible ?
□ Peut-on utiliser des widgets Flutter standard ?
□ Éviter l'abstraction prématurée ?
□ Le code est-il facile à comprendre ?

DRY :
□ Ce code existe-t-il déjà ailleurs ?
□ Cette logique peut-elle être réutilisée ?
□ Les styles/thèmes sont-ils centralisés ?
□ Les validations sont-elles mutualisées ?

YAGNI :
□ Cette fonctionnalité est-elle VRAIMENT nécessaire maintenant ?
□ Y a-t-il une demande concrète pour cela ?
□ Peut-on l'ajouter plus tard si besoin ?
□ Suis-je en train de coder "au cas où" ?
```

### Pendant la code review

```
Questions à se poser :
- Ce code est-il simple à comprendre ?
- Y a-t-il de la duplication ?
- Y a-t-il du code inutilisé ?
- Les abstractions sont-elles justifiées ?
- Peut-on simplifier ?
```

---

## Récapitulatif

```
┌─────────────────────────────────────────────────────────┐
│ KISS - Keep It Simple, Stupid                          │
├─────────────────────────────────────────────────────────┤
│ ✅ Solution la plus simple qui fonctionne               │
│ ✅ Code facile à comprendre                             │
│ ✅ Éviter sur-engineering                               │
│ ❌ Abstractions inutilement complexes                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DRY - Don't Repeat Yourself                            │
├─────────────────────────────────────────────────────────┤
│ ✅ Mutualiser code/logique dupliqué                     │
│ ✅ Widgets réutilisables                                │
│ ✅ Utilitaires et helpers                               │
│ ❌ Abstraction excessive                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ YAGNI - You Aren't Gonna Need It                       │
├─────────────────────────────────────────────────────────┤
│ ✅ Coder pour besoins actuels                           │
│ ✅ Refactorer quand nécessaire                          │
│ ✅ Itératif et incrémental                              │
│ ❌ Features "au cas où"                                 │
│ ❌ Configurations inutilisées                           │
└─────────────────────────────────────────────────────────┘
```

**Citation finale** :
> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry

---

*Ces trois principes travaillent ensemble pour produire un code Flutter efficace, maintenable et évolutif.*
