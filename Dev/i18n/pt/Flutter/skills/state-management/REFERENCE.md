# Gerenciamento de Estado Flutter

## Seleção de Padrão

```

             ÁRVORE DE DECISÃO


 Estado local + simples?
    SIM → StatefulWidget ou ValueNotifier
    NÃO →

 Estado compartilhado entre poucos widgets?
    SIM → Provider ou InheritedWidget
    NÃO →

 Lógica de negócio complexa + testabilidade?
    SIM → BLoC ou Riverpod
    NÃO → Provider


```

---

## StatefulWidget (Estado Local)

```dart
// Para estado simples e local
class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _counter = 0;

  void _increment() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Contagem: $_counter'),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('+'),
        ),
      ],
    );
  }
}
```

---

## ValueNotifier

```dart
// Estado simples mas compartilhado
class CounterNotifier extends ValueNotifier<int> {
  CounterNotifier() : super(0);

  void increment() {
    value++;
  }

  void decrement() {
    value--;
  }
}

// Uso
class CounterPage extends StatelessWidget {
  final counterNotifier = CounterNotifier();

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
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
    );
  }
}
```

---

## Provider

```dart
// pubspec.yaml
dependencies:
  provider: ^6.1.0

// Model
class Counter extends ChangeNotifier {
  int _count = 0;

  int get count => _count;

  void increment() {
    _count++;
    notifyListeners();
  }

  void decrement() {
    _count--;
    notifyListeners();
  }
}

// Configuração do app
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => Counter(),
      child: MyApp(),
    ),
  );
}

// Uso
class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Consumer<Counter>(
          builder: (context, counter, child) {
            return Text('${counter.count}');
          },
        ),
        ElevatedButton(
          onPressed: () => context.read<Counter>().increment(),
          child: const Text('+'),
        ),
      ],
    );
  }
}

// Ou com Selector para otimização
Selector<Counter, int>(
  selector: (context, counter) => counter.count,
  builder: (context, count, child) {
    return Text('$count');
  },
)
```

---

## Riverpod (Recomendado)

```dart
// pubspec.yaml
dependencies:
  flutter_riverpod: ^2.4.0

// Provider
final counterProvider = StateProvider<int>((ref) => 0);

// Configuração do app
void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

// Uso
class CounterPage extends ConsumerWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);

    return Column(
      children: [
        Text('$count'),
        ElevatedButton(
          onPressed: () => ref.read(counterProvider.notifier).state++,
          child: const Text('+'),
        ),
      ],
    );
  }
}

// StateNotifierProvider para lógica complexa
class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);

  void increment() => state++;
  void decrement() => state--;
  void reset() => state = 0;
}

final counterNotifierProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

// Uso
final count = ref.watch(counterNotifierProvider);
ref.read(counterNotifierProvider.notifier).increment();
```

---

## Padrão BLoC (Recomendado para apps complexos)

```dart
// pubspec.yaml
dependencies:
  flutter_bloc: ^8.1.0

// Events
abstract class CounterEvent {}
class Increment extends CounterEvent {}
class Decrement extends CounterEvent {}

// States
class CounterState {
  final int count;
  const CounterState(this.count);
}

// BLoC
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(const CounterState(0)) {
    on<Increment>((event, emit) {
      emit(CounterState(state.count + 1));
    });

    on<Decrement>((event, emit) {
      emit(CounterState(state.count - 1));
    });
  }
}

// Configuração do app
void main() {
  runApp(
    BlocProvider(
      create: (_) => CounterBloc(),
      child: MyApp(),
    ),
  );
}

// Uso
class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CounterBloc, CounterState>(
      builder: (context, state) {
        return Column(
          children: [
            Text('${state.count}'),
            ElevatedButton(
              onPressed: () => context.read<CounterBloc>().add(Increment()),
              child: const Text('+'),
            ),
          ],
        );
      },
    );
  }
}
```

---

## Comparação

| Padrão | Complexidade | Testabilidade | Boilerplate | Caso de Uso |
|---------|-----------|-------------|-------------|----------|
| StatefulWidget | Baixa | Baixa | Mínimo | Estado local simples |
| ValueNotifier | Baixa | Média | Mínimo | Estado compartilhado simples |
| Provider | Média | Média | Baixo | Apps médios |
| Riverpod | Média | Alta | Baixo | Apps médios/grandes |
| BLoC | Alta | Muito Alta | Alto | Apps complexos |

---

## Melhores Práticas

### BLoC

```dart
// BOM - Events/States separados
abstract class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email, password;
  LoginRequested(this.email, this.password);
}

abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated(this.user);
}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}

// BOM - Use Cases no BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase _loginUseCase;

  AuthBloc(this._loginUseCase) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final result = await _loginUseCase(
      email: event.email,
      password: event.password,
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }
}
```

### Riverpod

```dart
// BOM - FutureProvider para async
final userProvider = FutureProvider<User>((ref) async {
  final repo = ref.read(userRepositoryProvider);
  return await repo.getCurrentUser();
});

// Uso
ref.watch(userProvider).when(
  data: (user) => Text(user.name),
  loading: () => CircularProgressIndicator(),
  error: (err, stack) => Text('Erro: $err'),
);

// BOM - Provider family para parâmetros
final productProvider = FutureProvider.family<Product, String>(
  (ref, id) async {
    final repo = ref.read(productRepositoryProvider);
    return await repo.getProduct(id);
  },
);

// Uso
ref.watch(productProvider('123'));
```

---

## Recomendações

```
APP SIMPLES (< 10 telas):
→ Provider ou Riverpod

APP MÉDIO (10-50 telas):
→ Riverpod

APP COMPLEXO (> 50 telas):
→ BLoC + Clean Architecture

EQUIPE EXPERIENTE:
→ BLoC + Riverpod (BLoC para lógica, Riverpod para DI)

EQUIPE INICIANTE:
→ Riverpod sozinho
```

---

*A escolha do gerenciamento de estado depende da complexidade e da equipe.*
