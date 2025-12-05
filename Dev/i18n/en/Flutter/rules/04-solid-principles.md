# SOLID Principles in Flutter/Dart

## Introduction

The **SOLID** principles are 5 object-oriented design principles that make code more maintainable, testable, and scalable.

**SOLID Acronym**:
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

---

## S - Single Responsibility Principle (SRP)

### Definition

> A class should have only one reason to change.

Each class should have a single responsibility, a single purpose.

### Flutter Examples

#### ❌ BAD: Class with multiple responsibilities

```dart
// This class does TOO MUCH
class UserManager {
  final Dio _dio;
  final SharedPreferences _prefs;

  UserManager(this._dio, this._prefs);

  // Responsibility 1: Fetch data from API
  Future<User> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return User.fromJson(response.data);
  }

  // Responsibility 2: Save to local cache
  Future<void> cacheUser(User user) async {
    await _prefs.setString('user_${user.id}', jsonEncode(user.toJson()));
  }

  // Responsibility 3: Validate data
  bool validateUser(User user) {
    return user.email.isNotEmpty && user.name.isNotEmpty;
  }

  // Responsibility 4: Format for display
  String formatUserDisplay(User user) {
    return '${user.name} (${user.email})';
  }

  // TOO MANY REASONS TO CHANGE:
  // - If the API changes
  // - If the cache system changes
  // - If validation rules change
  // - If display format changes
}
```

#### ✅ GOOD: Separated responsibilities

```dart
// Responsibility 1: API Access
class UserRemoteDataSource {
  final Dio _dio;

  UserRemoteDataSource(this._dio);

  Future<UserModel> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return UserModel.fromJson(response.data);
  }
}

// Responsibility 2: Local Cache
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

// Responsibility 3: Business Validation
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

// Responsibility 4: Display Formatter
class UserDisplayFormatter {
  String formatFull(User user) {
    return '${user.name} (${user.email})';
  }

  String formatShort(User user) {
    return user.name;
  }

  String formatWithAge(User user) {
    final age = DateTime.now().year - user.birthDate.year;
    return '${user.name}, $age years old';
  }
}

// Orchestration via Repository
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
      // Fallback to cache
      final cached = await _localDataSource.getCachedUser(id);
      if (cached != null) {
        return Right(cached.toEntity());
      }
      return Left(ServerFailure(e.toString()));
    }
  }
}
```

### Flutter Widgets and SRP

#### ❌ BAD: Widget that does everything

```dart
class UserProfilePage extends StatefulWidget {
  const UserProfilePage({super.key});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  User? _user;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    setState(() => _isLoading = true);
    // Business logic in widget!
    final response = await http.get('/user/me');
    final user = User.fromJson(jsonDecode(response.body));
    setState(() {
      _user = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // HUGE widget with everything inside
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: _isLoading
          ? const CircularProgressIndicator()
          : Column(
              children: [
                CircleAvatar(backgroundImage: NetworkImage(_user!.avatarUrl)),
                Text(_user!.name, style: const TextStyle(fontSize: 24)),
                Text(_user!.email),
                Text('${_user!.followers} followers'),
                ElevatedButton(onPressed: _editProfile, child: const Text('Edit')),
                // ... more code
              ],
            ),
    );
  }

  void _editProfile() {
    // ...
  }
}
```

#### ✅ GOOD: Widgets with separated responsibilities

```dart
// Main widget: orchestration only
class UserProfilePage extends StatelessWidget {
  const UserProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<UserProfileBloc>()..add(LoadUserProfile()),
      child: const _UserProfileView(),
    );
  }
}

// View: display and state routing
class _UserProfileView extends StatelessWidget {
  const _UserProfileView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: BlocBuilder<UserProfileBloc, UserProfileState>(
        builder: (context, state) {
          if (state is UserProfileLoading) {
            return const _LoadingView();
          }

          if (state is UserProfileError) {
            return _ErrorView(message: state.message);
          }

          if (state is UserProfileLoaded) {
            return _ProfileContent(user: state.user);
          }

          return const SizedBox();
        },
      ),
    );
  }
}

// Widget: Loading
class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}

// Widget: Error
class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text(message),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              context.read<UserProfileBloc>().add(LoadUserProfile());
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

// Widget: Profile content
class _ProfileContent extends StatelessWidget {
  const _ProfileContent({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _UserAvatar(user: user),
          const SizedBox(height: 16),
          _UserInfo(user: user),
          const SizedBox(height: 24),
          _UserStats(user: user),
          const SizedBox(height: 24),
          _EditProfileButton(user: user),
        ],
      ),
    );
  }
}

// Widget: Avatar
class _UserAvatar extends StatelessWidget {
  const _UserAvatar({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: 50,
      backgroundImage: NetworkImage(user.avatarUrl),
    );
  }
}

// Widget: User info
class _UserInfo extends StatelessWidget {
  const _UserInfo({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          user.name,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 4),
        Text(
          user.email,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ],
    );
  }
}

// Widget: Statistics
class _UserStats extends StatelessWidget {
  const _UserStats({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _StatItem(label: 'Followers', value: user.followers.toString()),
        _StatItem(label: 'Following', value: user.following.toString()),
        _StatItem(label: 'Posts', value: user.posts.toString()),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        Text(label),
      ],
    );
  }
}

// Widget: Edit button
class _EditProfileButton extends StatelessWidget {
  const _EditProfileButton({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => EditProfilePage(user: user),
          ),
        );
      },
      icon: const Icon(Icons.edit),
      label: const Text('Edit Profile'),
    );
  }
}
```

**Advantages**:
- Each widget is independently testable
- Reusability (e.g., `_StatItem`)
- Easy to modify (changing `_UserAvatar` doesn't affect the rest)
- Faster hot reload

---

## O - Open/Closed Principle (OCP)

### Definition

> Software entities should be open for extension but closed for modification.

You should be able to add functionality without modifying existing code.

### Flutter Examples

#### ❌ BAD: Modification required for each new type

```dart
// Class that requires modification for each new payment type
class PaymentProcessor {
  Future<bool> processPayment(String method, double amount) async {
    if (method == 'credit_card') {
      // Credit card logic
      return await _processCreditCard(amount);
    } else if (method == 'paypal') {
      // PayPal logic
      return await _processPayPal(amount);
    } else if (method == 'apple_pay') {
      // Apple Pay logic
      return await _processApplePay(amount);
    }
    // Need to MODIFY this class to add a new payment method!
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

#### ✅ GOOD: Extension without modification

```dart
// Interface (contract)
abstract class PaymentMethod {
  Future<bool> process(double amount);
  String get displayName;
  IconData get icon;
}

// Implementations (extensions)
class CreditCardPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Credit card logic
    return true;
  }

  @override
  String get displayName => 'Credit Card';

  @override
  IconData get icon => Icons.credit_card;
}

class PayPalPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // PayPal logic
    return true;
  }

  @override
  String get displayName => 'PayPal';

  @override
  IconData get icon => Icons.account_balance_wallet;
}

class ApplePayPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Apple Pay logic
    return true;
  }

  @override
  String get displayName => 'Apple Pay';

  @override
  IconData get icon => Icons.apple;
}

// New payment method? Just create a new class!
class GooglePayPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Google Pay logic
    return true;
  }

  @override
  String get displayName => 'Google Pay';

  @override
  IconData get icon => Icons.android;
}

// Generic processor (closed to modification)
class PaymentProcessor {
  Future<bool> processPayment(PaymentMethod method, double amount) async {
    return await method.process(amount);
  }
}

// Usage in a widget
class PaymentSelectionWidget extends StatelessWidget {
  const PaymentSelectionWidget({
    super.key,
    required this.amount,
  });

  final double amount;

  // Extensible list
  final List<PaymentMethod> _availableMethods = const [
    CreditCardPayment(),
    PayPalPayment(),
    ApplePayPayment(),
    GooglePayPayment(),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: _availableMethods.length,
      itemBuilder: (context, index) {
        final method = _availableMethods[index];
        return ListTile(
          leading: Icon(method.icon),
          title: Text(method.displayName),
          onTap: () => _selectPayment(context, method),
        );
      },
    );
  }

  Future<void> _selectPayment(
    BuildContext context,
    PaymentMethod method,
  ) async {
    final processor = PaymentProcessor();
    final success = await processor.processPayment(method, amount);

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success ? 'Payment successful' : 'Payment failed',
          ),
        ),
      );
    }
  }
}
```

*[Due to length limits, I'll continue with the remaining SOLID principles in the next part...]*

---

*Applying SOLID principles makes Flutter code more maintainable, testable, and scalable.*
