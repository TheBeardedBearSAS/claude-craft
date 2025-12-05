# Princípios SOLID em Flutter/Dart

## Introdução

Os princípios **SOLID** são 5 princípios de design orientado a objetos que tornam o código mais manutenível, testável e escalável.

**Acrônimo SOLID**:
- **S**ingle Responsibility Principle (Princípio da Responsabilidade Única)
- **O**pen/Closed Principle (Princípio Aberto/Fechado)
- **L**iskov Substitution Principle (Princípio da Substituição de Liskov)
- **I**nterface Segregation Principle (Princípio da Segregação de Interface)
- **D**ependency Inversion Principle (Princípio da Inversão de Dependência)

---

## S - Princípio da Responsabilidade Única (SRP)

### Definição

> Uma classe deve ter apenas um motivo para mudar.

Cada classe deve ter uma única responsabilidade, um único propósito.

### Exemplos Flutter

#### ❌ RUIM: Classe com múltiplas responsabilidades

```dart
// Esta classe faz DEMAIS
class UserManager {
  final Dio _dio;
  final SharedPreferences _prefs;

  UserManager(this._dio, this._prefs);

  // Responsabilidade 1: Buscar dados da API
  Future<User> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return User.fromJson(response.data);
  }

  // Responsabilidade 2: Salvar em cache local
  Future<void> cacheUser(User user) async {
    await _prefs.setString('user_${user.id}', jsonEncode(user.toJson()));
  }

  // Responsabilidade 3: Validar dados
  bool validateUser(User user) {
    return user.email.isNotEmpty && user.name.isNotEmpty;
  }

  // Responsabilidade 4: Formatar para exibição
  String formatUserDisplay(User user) {
    return '${user.name} (${user.email})';
  }

  // MUITOS MOTIVOS PARA MUDAR:
  // - Se a API mudar
  // - Se o sistema de cache mudar
  // - Se as regras de validação mudarem
  // - Se o formato de exibição mudar
}
```

#### ✅ BOM: Responsabilidades separadas

```dart
// Responsabilidade 1: Acesso à API
class UserRemoteDataSource {
  final Dio _dio;

  UserRemoteDataSource(this._dio);

  Future<UserModel> fetchUser(String id) async {
    final response = await _dio.get('/users/$id');
    return UserModel.fromJson(response.data);
  }
}

// Responsabilidade 2: Cache local
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

// Responsabilidade 3: Validação de negócio
class UserValidator {
  ValidationResult validate(User user) {
    final errors = <String>[];

    if (user.email.isEmpty) {
      errors.add('Email é obrigatório');
    } else if (!_isValidEmail(user.email)) {
      errors.add('Formato de email inválido');
    }

    if (user.name.isEmpty) {
      errors.add('Nome é obrigatório');
    }

    return errors.isEmpty
        ? ValidationResult.valid()
        : ValidationResult.invalid(errors);
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
}

// Responsabilidade 4: Formatador de exibição
class UserDisplayFormatter {
  String formatFull(User user) {
    return '${user.name} (${user.email})';
  }

  String formatShort(User user) {
    return user.name;
  }

  String formatWithAge(User user) {
    final age = DateTime.now().year - user.birthDate.year;
    return '${user.name}, $age anos';
  }
}

// Orquestração via Repository
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
      // Fallback para cache
      final cached = await _localDataSource.getCachedUser(id);
      if (cached != null) {
        return Right(cached.toEntity());
      }
      return Left(ServerFailure(e.toString()));
    }
  }
}
```

### Widgets Flutter e SRP

#### ❌ RUIM: Widget que faz tudo

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
    // Lógica de negócio no widget!
    final response = await http.get('/user/me');
    final user = User.fromJson(jsonDecode(response.body));
    setState(() {
      _user = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Widget ENORME com tudo dentro
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: _isLoading
          ? const CircularProgressIndicator()
          : Column(
              children: [
                CircleAvatar(backgroundImage: NetworkImage(_user!.avatarUrl)),
                Text(_user!.name, style: const TextStyle(fontSize: 24)),
                Text(_user!.email),
                Text('${_user!.followers} seguidores'),
                ElevatedButton(onPressed: _editProfile, child: const Text('Editar')),
                // ... mais código
              ],
            ),
    );
  }

  void _editProfile() {
    // ...
  }
}
```

#### ✅ BOM: Widgets com responsabilidades separadas

```dart
// Widget principal: apenas orquestração
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

// View: exibição e roteamento de estado
class _UserProfileView extends StatelessWidget {
  const _UserProfileView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
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

// Widget: Erro
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
            child: const Text('Tentar Novamente'),
          ),
        ],
      ),
    );
  }
}

// Widget: Conteúdo do perfil
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

// Widget: Informações do usuário
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

// Widget: Estatísticas
class _UserStats extends StatelessWidget {
  const _UserStats({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _StatItem(label: 'Seguidores', value: user.followers.toString()),
        _StatItem(label: 'Seguindo', value: user.following.toString()),
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

// Widget: Botão de edição
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
      label: const Text('Editar Perfil'),
    );
  }
}
```

**Vantagens**:
- Cada widget é testável independentemente
- Reusabilidade (ex: `_StatItem`)
- Fácil de modificar (mudar `_UserAvatar` não afeta o resto)
- Hot reload mais rápido

---

## O - Princípio Aberto/Fechado (OCP)

### Definição

> Entidades de software devem estar abertas para extensão, mas fechadas para modificação.

Você deve poder adicionar funcionalidade sem modificar o código existente.

### Exemplos Flutter

#### ❌ RUIM: Modificação necessária para cada novo tipo

```dart
// Classe que requer modificação para cada novo tipo de pagamento
class PaymentProcessor {
  Future<bool> processPayment(String method, double amount) async {
    if (method == 'credit_card') {
      // Lógica de cartão de crédito
      return await _processCreditCard(amount);
    } else if (method == 'paypal') {
      // Lógica do PayPal
      return await _processPayPal(amount);
    } else if (method == 'apple_pay') {
      // Lógica do Apple Pay
      return await _processApplePay(amount);
    }
    // Precisa MODIFICAR esta classe para adicionar um novo método de pagamento!
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

#### ✅ BOM: Extensão sem modificação

```dart
// Interface (contrato)
abstract class PaymentMethod {
  Future<bool> process(double amount);
  String get displayName;
  IconData get icon;
}

// Implementações (extensões)
class CreditCardPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Lógica de cartão de crédito
    return true;
  }

  @override
  String get displayName => 'Cartão de Crédito';

  @override
  IconData get icon => Icons.credit_card;
}

class PayPalPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Lógica do PayPal
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
    // Lógica do Apple Pay
    return true;
  }

  @override
  String get displayName => 'Apple Pay';

  @override
  IconData get icon => Icons.apple;
}

// Novo método de pagamento? Apenas crie uma nova classe!
class GooglePayPayment implements PaymentMethod {
  @override
  Future<bool> process(double amount) async {
    // Lógica do Google Pay
    return true;
  }

  @override
  String get displayName => 'Google Pay';

  @override
  IconData get icon => Icons.android;
}

// Processador genérico (fechado para modificação)
class PaymentProcessor {
  Future<bool> processPayment(PaymentMethod method, double amount) async {
    return await method.process(amount);
  }
}

// Uso em um widget
class PaymentSelectionWidget extends StatelessWidget {
  const PaymentSelectionWidget({
    super.key,
    required this.amount,
  });

  final double amount;

  // Lista extensível
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
            success ? 'Pagamento realizado com sucesso' : 'Falha no pagamento',
          ),
        ),
      );
    }
  }
}
```

---

*Aplicar princípios SOLID torna o código Flutter mais manutenível, testável e escalável.*
