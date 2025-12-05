# State Management Flutter

## Choix du Pattern

```
┌──────────────────────────────────────────────────────────┐
│             DECISION TREE                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ État local + simple ?                                    │
│  ├─ OUI → StatefulWidget ou ValueNotifier              │
│  └─ NON ↓                                               │
│                                                          │
│ État partagé entre quelques widgets ?                   │
│  ├─ OUI → Provider ou InheritedWidget                  │
│  └─ NON ↓                                               │
│                                                          │
│ Logique métier complexe + testabilité ?                 │
│  ├─ OUI → BLoC ou Riverpod                            │
│  └─ NON → Provider                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## StatefulWidget (État local)

```dart
// Pour état simple et local
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
        Text('Count: $_counter'),
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
// État simple mais partagé
class CounterNotifier extends ValueNotifier<int> {
  CounterNotifier() : super(0);

  void increment() {
    value++;
  }

  void decrement() {
    value--;
  }
}

// Usage
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

// App setup
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => Counter(),
      child: MyApp(),
    ),
  );
}

// Usage
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

// Ou avec Selector pour optimisation
Selector<Counter, int>(
  selector: (context, counter) => counter.count,
  builder: (context, count, child) {
    return Text('$count');
  },
)
```

---

## Riverpod (Recommandé)

```dart
// pubspec.yaml
dependencies:
  flutter_riverpod: ^2.4.0

// Provider
final counterProvider = StateProvider<int>((ref) => 0);

// App setup
void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

// Usage
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

// StateNotifierProvider pour logique complexe
class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);

  void increment() => state++;
  void decrement() => state--;
  void reset() => state = 0;
}

final counterNotifierProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

// Usage
final count = ref.watch(counterNotifierProvider);
ref.read(counterNotifierProvider.notifier).increment();
```

---

## BLoC Pattern (Recommandé pour apps complexes)

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

// App setup
void main() {
  runApp(
    BlocProvider(
      create: (_) => CounterBloc(),
      child: MyApp(),
    ),
  );
}

// Usage
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

## Comparaison

| Pattern | Complexité | Testabilité | Boilerplate | Use Case |
|---------|-----------|-------------|-------------|----------|
| StatefulWidget | Faible | Faible | Minimal | État local simple |
| ValueNotifier | Faible | Moyenne | Minimal | État simple partagé |
| Provider | Moyenne | Moyenne | Faible | Apps moyennes |
| Riverpod | Moyenne | Élevée | Faible | Apps moyennes/grandes |
| BLoC | Élevée | Très élevée | Élevé | Apps complexes |

---

## Best Practices

### BLoC

```dart
// ✅ BON - Séparer Events/States
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

// ✅ BON - Use Cases dans BLoC
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
// ✅ BON - FutureProvider pour async
final userProvider = FutureProvider<User>((ref) async {
  final repo = ref.read(userRepositoryProvider);
  return await repo.getCurrentUser();
});

// Usage
ref.watch(userProvider).when(
  data: (user) => Text(user.name),
  loading: () => CircularProgressIndicator(),
  error: (err, stack) => Text('Error: $err'),
);

// ✅ BON - Provider family pour paramètres
final productProvider = FutureProvider.family<Product, String>(
  (ref, id) async {
    final repo = ref.read(productRepositoryProvider);
    return await repo.getProduct(id);
  },
);

// Usage
ref.watch(productProvider('123'));
```

---

## Recommandations

```
SIMPLE APP (< 10 screens):
→ Provider ou Riverpod

MEDIUM APP (10-50 screens):
→ Riverpod

COMPLEX APP (> 50 screens):
→ BLoC + Clean Architecture

TEAM EXPÉRIMENTÉE:
→ BLoC + Riverpod (BLoC pour logique, Riverpod pour DI)

TEAM DÉBUTANTE:
→ Riverpod seul
```

---

*Le choix du state management dépend de la complexité et de l'équipe.*
