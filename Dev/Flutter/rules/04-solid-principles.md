# Principes SOLID en Flutter/Dart

## Introduction

Les principes **SOLID** sont 5 principes de conception orientée objet qui rendent le code plus maintenable, testable et évolutif.

**Acronyme SOLID** :
- **S**ingle Responsibility Principle (Principe de responsabilité unique)
- **O**pen/Closed Principle (Principe ouvert/fermé)
- **L**iskov Substitution Principle (Principe de substitution de Liskov)
- **I**nterface Segregation Principle (Principe de ségrégation des interfaces)
- **D**ependency Inversion Principle (Principe d'inversion des dépendances)

---

## S - Single Responsibility Principle (SRP)

### Définition

> Une classe ne doit avoir qu'une seule raison de changer.

Chaque classe doit avoir une seule responsabilité, un seul objectif.

### Exemples Flutter

#### ❌ MAUVAIS : Classe avec multiples responsabilités

```dart
// Cette classe fait TROP de choses
class UserManager {
  final Dio _dio;
  final SharedPreferences _prefs;

  UserManager(this._dio, this._prefs);

  // Responsabilité 1: Récupérer données depuis API
  Future<User> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return User.fromJson(response.data);
  }

  // Responsabilité 2: Sauvegarder en cache local
  Future<void> cacheUser(User user) async {
    await _prefs.setString('user_${user.id}', jsonEncode(user.toJson()));
  }

  // Responsabilité 3: Valider les données
  bool validateUser(User user) {
    return user.email.isNotEmpty && user.name.isNotEmpty;
  }

  // Responsabilité 4: Formater pour affichage
  String formatUserDisplay(User user) {
    return '${user.name} (${user.email})';
  }

  // TROP DE RAISONS DE CHANGER :
  // - Si l'API change
  // - Si le système de cache change
  // - Si les règles de validation changent
  // - Si le format d'affichage change
}
```

#### ✅ BON : Responsabilités séparées

```dart
// Responsabilité 1: Accès API
class UserRemoteDataSource {
  final Dio _dio;

  UserRemoteDataSource(this._dio);

  Future<UserModel> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return UserModel.fromJson(response.data);
  }
}

// Responsabilité 2: Cache local
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

// Responsabilité 3: Validation métier
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

// Responsabilité 4: Formateur d'affichage
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
      // Fallback au cache
      final cached = await _localDataSource.getCachedUser(id);
      if (cached != null) {
        return Right(cached.toEntity());
      }
      return Left(ServerFailure(e.toString()));
    }
  }
}
```

### Widgets Flutter et SRP

#### ❌ MAUVAIS : Widget qui fait tout

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
    // Logique métier dans le widget !
    final response = await http.get('/user/me');
    final user = User.fromJson(jsonDecode(response.body));
    setState(() {
      _user = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Widget ÉNORME avec tout dedans
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
                // ... plus de code
              ],
            ),
    );
  }

  void _editProfile() {
    // ...
  }
}
```

#### ✅ BON : Widgets avec responsabilités séparées

```dart
// Widget principal : orchestration uniquement
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

// View : affichage et routing des states
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

// Widget : Loading
class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}

// Widget : Error
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

// Widget : Contenu du profil
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

// Widget : Avatar
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

// Widget : Infos utilisateur
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

// Widget : Statistiques
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

// Widget : Bouton édition
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

**Avantages** :
- Chaque widget est testable indépendamment
- Réutilisabilité (ex: `_StatItem`)
- Facile à modifier (changer `_UserAvatar` n'affecte pas le reste)
- Hot reload plus rapide

---

## O - Open/Closed Principle (OCP)

### Définition

> Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.

On doit pouvoir ajouter des fonctionnalités sans modifier le code existant.

### Exemples Flutter

#### ❌ MAUVAIS : Modification pour chaque nouveau type

```dart
// Classe qui nécessite modification à chaque nouveau type de paiement
class PaymentProcessor {
  Future<bool> processPayment(String method, double amount) async {
    if (method == 'credit_card') {
      // Logique carte de crédit
      return await _processCreditCard(amount);
    } else if (method == 'paypal') {
      // Logique PayPal
      return await _processPayPal(amount);
    } else if (method == 'apple_pay') {
      // Logique Apple Pay
      return await _processApplePay(amount);
    }
    // Besoin de MODIFIER cette classe pour ajouter un nouveau moyen de paiement !
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

#### ✅ BON : Extension sans modification

```dart
// Interface (contrat)
abstract class PaymentMethod {
  Future<bool> process(double amount);
  String get displayName;
  IconData get icon;
}

// Implémentations (extensions)
class CreditCardPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Logique carte de crédit
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
    // Logique PayPal
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
    // Logique Apple Pay
    return true;
  }

  @override
  String get displayName => 'Apple Pay';

  @override
  IconData get icon => Icons.apple;
}

// Nouveau moyen de paiement ? Juste créer une nouvelle classe !
class GooglePayPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Logique Google Pay
    return true;
  }

  @override
  String get displayName => 'Google Pay';

  @override
  IconData get icon => Icons.android;
}

// Processeur générique (fermé à la modification)
class PaymentProcessor {
  Future<bool> processPayment(PaymentMethod method, double amount) async {
    return await method.process(amount);
  }
}

// Usage dans un widget
class PaymentSelectionWidget extends StatelessWidget {
  const PaymentSelectionWidget({
    super.key,
    required this.amount,
  });

  final double amount;

  // Liste extensible
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

### Widgets et OCP

```dart
// Base widget (fermé à modification)
abstract class BaseButton extends StatelessWidget {
  const BaseButton({
    super.key,
    required this.onPressed,
    required this.child,
  });

  final VoidCallback? onPressed;
  final Widget child;

  // Template method pattern
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: getButtonStyle(context),
      child: child,
    );
  }

  // Extension point
  ButtonStyle getButtonStyle(BuildContext context);
}

// Extensions
class PrimaryButton extends BaseButton {
  const PrimaryButton({
    super.key,
    required super.onPressed,
    required super.child,
  });

  @override
  ButtonStyle getButtonStyle(BuildContext context) {
    return ElevatedButton.styleFrom(
      backgroundColor: Theme.of(context).colorScheme.primary,
      foregroundColor: Colors.white,
    );
  }
}

class SecondaryButton extends BaseButton {
  const SecondaryButton({
    super.key,
    required super.onPressed,
    required super.child,
  });

  @override
  ButtonStyle getButtonStyle(BuildContext context) {
    return ElevatedButton.styleFrom(
      backgroundColor: Theme.of(context).colorScheme.secondary,
      foregroundColor: Colors.white,
    );
  }
}

class DangerButton extends BaseButton {
  const DangerButton({
    super.key,
    required super.onPressed,
    required super.child,
  });

  @override
  ButtonStyle getButtonStyle(BuildContext context) {
    return ElevatedButton.styleFrom(
      backgroundColor: Colors.red,
      foregroundColor: Colors.white,
    );
  }
}

// Nouveau style ? Créer nouvelle classe sans toucher aux autres
class GradientButton extends BaseButton {
  const GradientButton({
    super.key,
    required super.onPressed,
    required super.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue, Colors.purple],
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
        ),
        child: child,
      ),
    );
  }

  @override
  ButtonStyle getButtonStyle(BuildContext context) {
    return ElevatedButton.styleFrom();
  }
}
```

---

## L - Liskov Substitution Principle (LSP)

### Définition

> Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le bon fonctionnement du programme.

Si `B` hérite de `A`, on doit pouvoir utiliser `B` partout où `A` est attendu.

### Exemples Flutter

#### ❌ MAUVAIS : Violation de LSP

```dart
// Classe de base
abstract class Bird {
  void fly();
}

class Sparrow extends Bird {
  @override
  void fly() {
    print('Sparrow flies');
  }
}

// Violation : Penguin ne peut pas voler !
class Penguin extends Bird {
  @override
  void fly() {
    throw UnsupportedError('Penguins cannot fly');
  }
}

// Problème : on ne peut pas substituer
void makeBirdFly(Bird bird) {
  bird.fly(); // ⚠️ Crash si bird est un Penguin !
}

void main() {
  makeBirdFly(Sparrow()); // OK
  makeBirdFly(Penguin()); // ❌ Crash !
}
```

#### ✅ BON : Respect de LSP

```dart
// Classe de base plus générale
abstract class Bird {
  void move();
}

// Interface pour oiseaux volants
abstract class FlyingBird extends Bird {
  @override
  void move() => fly();

  void fly();
}

// Moineau vole
class Sparrow extends FlyingBird {
  @override
  void fly() {
    print('Sparrow flies');
  }
}

// Pingouin ne vole pas
class Penguin extends Bird {
  @override
  void move() => swim();

  void swim() {
    print('Penguin swims');
  }
}

// Fonctionne pour tous les oiseaux
void makeBirdMove(Bird bird) {
  bird.move(); // Toujours valide
}

// Fonction spécifique pour oiseaux volants
void makeBirdFly(FlyingBird bird) {
  bird.fly(); // Garanti de fonctionner
}

void main() {
  makeBirdMove(Sparrow()); // ✅ Vole
  makeBirdMove(Penguin()); // ✅ Nage

  makeBirdFly(Sparrow()); // ✅ Vole
  // makeBirdFly(Penguin()); // ✅ Erreur de compilation (type safety)
}
```

### Cas concret Flutter : Data Sources

#### ❌ MAUVAIS

```dart
abstract class DataSource {
  Future<List<Item>> getItems();
  Future<void> cacheItems(List<Item> items);
}

class RemoteDataSource implements DataSource {
  @override
  Future<List<Item>> getItems() async {
    // Récupère depuis API
    return await api.fetchItems();
  }

  @override
  Future<void> cacheItems(List<Item> items) {
    throw UnsupportedError('Remote data source cannot cache');
  }
}

class LocalDataSource implements DataSource {
  @override
  Future<List<Item>> getItems() async {
    // Récupère depuis cache
    return await cache.getItems();
  }

  @override
  Future<void> cacheItems(List<Item> items) async {
    await cache.saveItems(items);
  }
}

// Problème : RemoteDataSource viole le contrat
void processDataSource(DataSource source, List<Item> items) {
  source.cacheItems(items); // ⚠️ Crash si RemoteDataSource
}
```

#### ✅ BON

```dart
// Interface séparées selon responsabilités
abstract class ReadableDataSource {
  Future<List<Item>> getItems();
}

abstract class WritableDataSource {
  Future<void> cacheItems(List<Item> items);
}

// Remote : lecture seule
class RemoteDataSource implements ReadableDataSource {
  @override
  Future<List<Item>> getItems() async {
    return await api.fetchItems();
  }
}

// Local : lecture + écriture
class LocalDataSource implements ReadableDataSource, WritableDataSource {
  @override
  Future<List<Item>> getItems() async {
    return await cache.getItems();
  }

  @override
  Future<void> cacheItems(List<Item> items) async {
    await cache.saveItems(items);
  }
}

// Fonctions type-safe
Future<void> readData(ReadableDataSource source) async {
  final items = await source.getItems();
  // ✅ Fonctionne pour Remote ET Local
}

Future<void> cacheData(WritableDataSource source, List<Item> items) async {
  await source.cacheItems(items);
  // ✅ Fonctionne uniquement pour Local (type safety)
}
```

---

## I - Interface Segregation Principle (ISP)

### Définition

> Les clients ne doivent pas dépendre d'interfaces qu'ils n'utilisent pas.

Mieux vaut plusieurs interfaces spécifiques qu'une interface générale.

### Exemples Flutter

#### ❌ MAUVAIS : Interface trop large

```dart
// Interface "fat" qui fait tout
abstract class UserService {
  Future<User> getUser(String id);
  Future<void> updateUser(User user);
  Future<void> deleteUser(String id);
  Future<List<User>> searchUsers(String query);
  Future<void> sendEmail(String userId, String message);
  Future<void> uploadAvatar(String userId, File image);
  Future<void> changePassword(String userId, String newPassword);
  Future<void> exportUserData(String userId);
  // ... 20 autres méthodes
}

// Classe qui n'a besoin que de lire
class UserDisplayWidget implements UserService {
  // Obligé d'implémenter TOUTES les méthodes alors qu'on veut juste getUser !

  @override
  Future<User> getUser(String id) async {
    // Implementation
  }

  @override
  Future<void> updateUser(User user) {
    throw UnimplementedError('Not needed');
  }

  @override
  Future<void> deleteUser(String id) {
    throw UnimplementedError('Not needed');
  }

  // ... implémenter 20 méthodes inutilisées !
}
```

#### ✅ BON : Interfaces ségrégées

```dart
// Interfaces spécifiques
abstract class UserReader {
  Future<User> getUser(String id);
  Future<List<User>> searchUsers(String query);
}

abstract class UserWriter {
  Future<void> updateUser(User user);
  Future<void> deleteUser(String id);
}

abstract class UserEmailService {
  Future<void> sendEmail(String userId, String message);
}

abstract class UserAvatarService {
  Future<void> uploadAvatar(String userId, File image);
}

abstract class UserSecurityService {
  Future<void> changePassword(String userId, String newPassword);
}

abstract class UserDataExporter {
  Future<void> exportUserData(String userId);
}

// Implémentation complète
class UserRepository
    implements
        UserReader,
        UserWriter,
        UserEmailService,
        UserAvatarService,
        UserSecurityService,
        UserDataExporter {
  // Implémente tout
}

// Widget qui ne lit que les données
class UserDisplayWidget {
  final UserReader userReader;

  UserDisplayWidget(this.userReader); // Dépend uniquement de UserReader

  Future<void> display(String userId) async {
    final user = await userReader.getUser(userId);
    print(user.name);
  }
}

// Service qui modifie les données
class UserEditService {
  final UserWriter userWriter;

  UserEditService(this.userWriter); // Dépend uniquement de UserWriter

  Future<void> edit(User user) async {
    await userWriter.updateUser(user);
  }
}

// Service de notification
class NotificationService {
  final UserEmailService emailService;

  NotificationService(this.emailService); // Dépend uniquement de UserEmailService

  Future<void> notifyUser(String userId, String message) async {
    await emailService.sendEmail(userId, message);
  }
}
```

### Cas concret : BLoC Events

#### ❌ MAUVAIS

```dart
// Event fourre-tout
abstract class ProductEvent {}

class LoadProducts extends ProductEvent {}
class SearchProducts extends ProductEvent {
  final String query;
  SearchProducts(this.query);
}
class FilterByCategory extends ProductEvent {
  final String category;
  FilterByCategory(this.category);
}
class SortProducts extends ProductEvent {
  final SortOrder order;
  SortProducts(this.order);
}
class AddToCart extends ProductEvent {
  final Product product;
  AddToCart(this.product);
}
class RemoveFromCart extends ProductEvent {
  final String productId;
  RemoveFromCart(this.productId);
}
class Checkout extends ProductEvent {}
class ApplyPromoCode extends ProductEvent {
  final String code;
  ApplyPromoCode(this.code);
}

// ProductBloc fait TOUT
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  // Gère produits ET panier ET checkout !
  // Viole SRP et ISP
}
```

#### ✅ BON : BLoCs séparés

```dart
// BLoC pour liste produits
abstract class ProductListEvent {}
class LoadProducts extends ProductListEvent {}
class SearchProducts extends ProductListEvent {
  final String query;
  SearchProducts(this.query);
}
class FilterByCategory extends ProductListEvent {
  final String category;
  FilterByCategory(this.category);
}

class ProductListBloc extends Bloc<ProductListEvent, ProductListState> {
  // Gère uniquement l'affichage de produits
}

// BLoC pour panier
abstract class CartEvent {}
class AddToCart extends CartEvent {
  final Product product;
  AddToCart(this.product);
}
class RemoveFromCart extends CartEvent {
  final String productId;
  RemoveFromCart(this.productId);
}
class ApplyPromoCode extends CartEvent {
  final String code;
  ApplyPromoCode(this.code);
}

class CartBloc extends Bloc<CartEvent, CartState> {
  // Gère uniquement le panier
}

// BLoC pour checkout
abstract class CheckoutEvent {}
class StartCheckout extends CheckoutEvent {}
class SelectPaymentMethod extends CheckoutEvent {
  final PaymentMethod method;
  SelectPaymentMethod(this.method);
}
class ConfirmOrder extends CheckoutEvent {}

class CheckoutBloc extends Bloc<CheckoutEvent, CheckoutState> {
  // Gère uniquement le checkout
}

// Dans le widget : composer les BLoCs nécessaires
class ProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => ProductListBloc()),
        BlocProvider(create: (_) => CartBloc()),
      ],
      child: ProductView(),
    );
  }
}
```

---

## D - Dependency Inversion Principle (DIP)

### Définition

> Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.

> Les abstractions ne doivent pas dépendre des détails. Les détails doivent dépendre des abstractions.

### Exemples Flutter

#### ❌ MAUVAIS : Dépendance directe vers implémentation concrète

```dart
// Implémentation concrète
class HttpApiClient {
  Future<Map<String, dynamic>> get(String url) async {
    final response = await http.get(Uri.parse(url));
    return jsonDecode(response.body);
  }
}

// UseCase dépend de l'implémentation concrète
class GetUserUseCase {
  final HttpApiClient apiClient; // ❌ Dépend de l'implémentation

  GetUserUseCase(this.apiClient);

  Future<User> execute(String id) async {
    final json = await apiClient.get('/users/$id');
    return User.fromJson(json);
  }
}

// Problèmes :
// 1. Impossible de tester sans vraie requête HTTP
// 2. Impossible de changer d'implémentation (ex: GraphQL)
// 3. Couplage fort
```

#### ✅ BON : Dépendance vers abstraction

```dart
// Abstraction (interface)
abstract class ApiClient {
  Future<Map<String, dynamic>> get(String url);
  Future<Map<String, dynamic>> post(String url, Map<String, dynamic> body);
}

// Implémentation HTTP
class HttpApiClient implements ApiClient {
  final Dio _dio;

  HttpApiClient(this._dio);

  @override
  Future<Map<String, dynamic>> get(String url) async {
    final response = await _dio.get(url);
    return response.data;
  }

  @override
  Future<Map<String, dynamic>> post(String url, Map<String, dynamic> body) async {
    final response = await _dio.post(url, data: body);
    return response.data;
  }
}

// Implémentation GraphQL (alternative)
class GraphQLApiClient implements ApiClient {
  final GraphQLClient _client;

  GraphQLApiClient(this._client);

  @override
  Future<Map<String, dynamic>> get(String url) async {
    // Convertir en query GraphQL
    final result = await _client.query(/* ... */);
    return result.data;
  }

  @override
  Future<Map<String, dynamic>> post(String url, Map<String, dynamic> body) async {
    final result = await _client.mutate(/* ... */);
    return result.data;
  }
}

// Mock pour tests
class MockApiClient implements ApiClient {
  @override
  Future<Map<String, dynamic>> get(String url) async {
    return {'id': '123', 'name': 'Test User'};
  }

  @override
  Future<Map<String, dynamic>> post(String url, Map<String, dynamic> body) async {
    return {'success': true};
  }
}

// UseCase dépend de l'abstraction
class GetUserUseCase {
  final ApiClient apiClient; // ✅ Dépend de l'interface

  GetUserUseCase(this.apiClient);

  Future<User> execute(String id) async {
    final json = await apiClient.get('/users/$id');
    return User.fromJson(json);
  }
}

// Dependency Injection
void configureDependencies() {
  final dio = Dio();

  // En production : HTTP
  getIt.registerLazySingleton<ApiClient>(() => HttpApiClient(dio));

  // En test : Mock
  // getIt.registerLazySingleton<ApiClient>(() => MockApiClient());

  // UseCase reçoit l'abstraction
  getIt.registerLazySingleton(() => GetUserUseCase(getIt<ApiClient>()));
}

// Test facile
void main() {
  test('GetUserUseCase returns user', () async {
    final mockClient = MockApiClient();
    final useCase = GetUserUseCase(mockClient);

    final user = await useCase.execute('123');

    expect(user.id, '123');
    expect(user.name, 'Test User');
  });
}
```

### Architecture Flutter et DIP

```dart
// ===== DOMAIN LAYER (Haut niveau) =====

// Entité
class Product {
  final String id;
  final String name;
  final double price;

  Product({required this.id, required this.name, required this.price});
}

// Abstraction du repository (définie dans domain)
abstract class ProductRepository {
  Future<List<Product>> getProducts();
  Future<Product> getProductById(String id);
}

// Use Case dépend de l'abstraction
class GetProducts {
  final ProductRepository repository; // Abstraction

  GetProducts(this.repository);

  Future<List<Product>> call() async {
    return await repository.getProducts();
  }
}

// ===== DATA LAYER (Bas niveau) =====

// Implémentation concrète dépend de l'abstraction du domain
class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;
  final ProductLocalDataSource localDataSource;

  ProductRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<List<Product>> getProducts() async {
    try {
      final models = await remoteDataSource.fetchProducts();
      await localDataSource.cacheProducts(models);
      return models.map((m) => m.toEntity()).toList();
    } catch (e) {
      final cached = await localDataSource.getCachedProducts();
      return cached.map((m) => m.toEntity()).toList();
    }
  }

  @override
  Future<Product> getProductById(String id) async {
    final model = await remoteDataSource.fetchProduct(id);
    return model.toEntity();
  }
}

// ===== PRESENTATION LAYER (Haut niveau) =====

// BLoC dépend du Use Case (abstraction)
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final GetProducts getProducts; // Use Case

  ProductBloc({required this.getProducts}) : super(ProductInitial()) {
    on<LoadProducts>(_onLoadProducts);
  }

  Future<void> _onLoadProducts(
    LoadProducts event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());

    try {
      final products = await getProducts();
      emit(ProductLoaded(products));
    } catch (e) {
      emit(ProductError(e.toString()));
    }
  }
}

// ===== DEPENDENCY INJECTION =====

void configureDependencies() {
  // Data layer
  getIt.registerLazySingleton(() => Dio());
  getIt.registerLazySingleton(() => ProductRemoteDataSourceImpl(getIt()));
  getIt.registerLazySingleton(() => ProductLocalDataSourceImpl());

  // Injection de l'implémentation pour l'interface
  getIt.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
    ),
  );

  // Domain layer
  getIt.registerLazySingleton(() => GetProducts(getIt<ProductRepository>()));

  // Presentation layer
  getIt.registerFactory(() => ProductBloc(getProducts: getIt()));
}

/*
DIAGRAMME DE DÉPENDANCES :

ProductBloc (Presentation)
    ↓ dépend de
GetProducts (Domain)
    ↓ dépend de
ProductRepository (Domain - ABSTRACTION)
    ↑ implémenté par
ProductRepositoryImpl (Data)
    ↓ dépend de
DataSources (Data)

INVERSION :
- Presentation dépend de Domain (abstraction)
- Data dépend de Domain (abstraction)
- Domain ne dépend de RIEN

Avant DIP :
Presentation → Domain → Data
(flux de dépendance normal)

Après DIP :
Presentation → Domain ← Data
(Data dépend de l'abstraction définie dans Domain)
*/
```

---

## Récapitulatif SOLID

```
┌─────────────────────────────────────────────────────────┐
│ S - Single Responsibility Principle                    │
├─────────────────────────────────────────────────────────┤
│ ✅ Une classe = une responsabilité                      │
│ ✅ Séparer les widgets par fonction                     │
│ ✅ BLoC pour logique, Widget pour UI                    │
│ ❌ Éviter les "God classes"                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ O - Open/Closed Principle                              │
├─────────────────────────────────────────────────────────┤
│ ✅ Utiliser interfaces et héritage                      │
│ ✅ Extension par nouvelles classes                      │
│ ✅ Strategy pattern pour variations                     │
│ ❌ Éviter les if/else pour types                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ L - Liskov Substitution Principle                      │
├─────────────────────────────────────────────────────────┤
│ ✅ Sous-classes substituables                           │
│ ✅ Respecter les contrats des interfaces                │
│ ✅ Pas d'exceptions dans overrides                      │
│ ❌ Éviter de violer les préconditions                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ I - Interface Segregation Principle                    │
├─────────────────────────────────────────────────────────┤
│ ✅ Interfaces petites et spécifiques                    │
│ ✅ Composer plusieurs interfaces                        │
│ ✅ BLoCs séparés par fonctionnalité                     │
│ ❌ Éviter les interfaces "fat"                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ D - Dependency Inversion Principle                     │
├─────────────────────────────────────────────────────────┤
│ ✅ Dépendre d'abstractions                              │
│ ✅ Injection de dépendances                             │
│ ✅ Repository pattern                                   │
│ ❌ Éviter dépendances vers implémentations concrètes    │
└─────────────────────────────────────────────────────────┘
```

---

*L'application des principes SOLID rend le code Flutter plus maintenable, testable et évolutif.*
