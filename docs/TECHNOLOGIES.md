# Technologies Guide

Detailed information about rules, patterns, and best practices for each supported technology.

## Overview

| Technology | Rules | Focus Areas |
|------------|-------|-------------|
| Symfony | 21 | Clean Architecture, DDD, API Platform |
| Flutter | 13 | BLoC, State Management, Testing |
| Python | 12 | FastAPI, Async, Type Hints |
| React | 12 | Hooks, Performance, Accessibility |
| React Native | 12 | Navigation, Native Modules, Store |

---

## Symfony

### Architecture

The Symfony rules follow **Clean Architecture** with **Domain-Driven Design** (DDD):

```
src/
├── Domain/           # Business logic (entities, value objects)
│   ├── Model/
│   ├── Repository/   # Interfaces only
│   └── Event/
├── Application/      # Use cases (commands, queries, handlers)
│   ├── Command/
│   ├── Query/
│   └── Handler/
├── Infrastructure/   # External concerns (DB, API, files)
│   ├── Persistence/  # Repository implementations
│   ├── Api/
│   └── Service/
└── Presentation/     # Controllers, CLI, views
    ├── Controller/
    └── Command/
```

### Key Rules

| Rule | Description |
|------|-------------|
| `02-architecture-clean-ddd` | Clean Architecture layers |
| `13-ddd-patterns` | DDD tactical patterns |
| `14-multitenant` | Multi-tenancy support |
| `18-value-objects` | Value Object patterns |
| `19-aggregates` | Aggregate Root design |
| `20-domain-events` | Domain Event handling |
| `21-cqrs` | CQRS implementation |

### Commands

```bash
# Generate CRUD with proper architecture
/symfony:generate-crud Product

# Check architecture compliance
/symfony:check-architecture

# Plan database migration
/symfony:migration-plan "Add user preferences"
```

### Templates

- `aggregate-root.md` - Aggregate root entity
- `value-object.md` - Value object pattern
- `domain-event.md` - Domain event
- `service.md` - Application service

---

## Flutter

### Architecture

Flutter rules follow a **feature-based** architecture with **BLoC** pattern:

```
lib/
├── core/             # Shared utilities
│   ├── constants/
│   ├── errors/
│   ├── network/
│   └── utils/
├── features/         # Feature modules
│   └── auth/
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── bloc/
│           ├── pages/
│           └── widgets/
└── injection/        # Dependency injection
```

### Key Rules

| Rule | Description |
|------|-------------|
| `02-architecture` | Feature-based architecture |
| `07-testing` | Widget and unit testing |
| `12-performance` | Performance optimization |
| `13-state-management` | BLoC/Riverpod patterns |

### Commands

```bash
# Generate feature module
/flutter:generate-feature authentication

# Generate widget with tests
/flutter:generate-widget UserAvatar

# Analyze performance
/flutter:analyze-performance
```

### State Management

BLoC pattern with events and states:

```dart
// Events
abstract class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;
}

// States
abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState {
  final User user;
}
class AuthFailure extends AuthState {
  final String error;
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
  }
}
```

---

## Python

### Architecture

Python rules follow a **layered architecture** suitable for FastAPI/Django:

```
src/
├── api/              # API layer
│   ├── routes/
│   ├── schemas/      # Pydantic models
│   └── dependencies/
├── core/             # Configuration
│   ├── config.py
│   └── security.py
├── domain/           # Business logic
│   ├── models/
│   ├── services/
│   └── repositories/
├── infrastructure/   # External services
│   ├── database/
│   ├── cache/
│   └── external/
└── tests/
```

### Key Rules

| Rule | Description |
|------|-------------|
| `02-architecture` | Layered architecture |
| `07-testing` | Pytest best practices |
| `11-security` | Security guidelines |
| `12-performance` | Async optimization |

### Commands

```bash
# Generate FastAPI endpoint
/python:generate-endpoint users

# Check async code
/python:async-check

# Type coverage analysis
/python:type-coverage
```

### Type Hints

All code should use type hints:

```python
from typing import Optional, List
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

async def create_user(
    user_data: UserCreate,
    db: AsyncSession
) -> User:
    user = User(**user_data.dict())
    db.add(user)
    await db.commit()
    return user
```

---

## React

### Architecture

React rules follow a **feature-based** structure with hooks:

```
src/
├── components/       # Shared components
│   ├── ui/          # Basic UI components
│   └── layout/      # Layout components
├── features/        # Feature modules
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── types/
├── hooks/           # Shared hooks
├── lib/             # Utilities
├── stores/          # State management
└── types/           # Global types
```

### Key Rules

| Rule | Description |
|------|-------------|
| `02-architecture` | Component architecture |
| `07-testing` | Testing Library patterns |
| `11-security` | XSS prevention |
| `12-performance` | Render optimization |

### Commands

```bash
# Generate component with tests
/react:generate-component Button

# Generate custom hook
/react:generate-hook useAuth

# Check accessibility
/react:accessibility-check
```

### Component Pattern

```tsx
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-medium',
        variants[variant],
        sizes[size]
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### Hook Pattern

```tsx
// useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Login logic
  }, []);

  const logout = useCallback(async () => {
    // Logout logic
  }, []);

  return { user, loading, login, logout };
}
```

---

## React Native

### Architecture

React Native rules extend React patterns for mobile:

```
src/
├── components/       # Shared components
├── features/        # Feature modules
├── navigation/      # Navigation setup
│   ├── RootNavigator.tsx
│   └── types.ts
├── screens/         # Screen components
├── services/        # Native services
├── stores/          # State management
└── utils/           # Platform utilities
```

### Key Rules

| Rule | Description |
|------|-------------|
| `02-architecture` | Mobile architecture |
| `07-testing` | Mobile testing |
| `11-security` | Mobile security |
| `12-performance` | Mobile performance |

### Commands

```bash
# Generate screen
/reactnative:generate-screen Profile

# Native module integration
/reactnative:native-module Camera

# Prepare for store
/reactnative:store-prepare
```

### Navigation

React Navigation setup:

```tsx
// RootNavigator.tsx
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
```

### Platform-Specific Code

```tsx
// Component.tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

---

## Cross-Technology Patterns

### Testing

All technologies follow similar testing patterns:

| Technology | Unit | Integration | E2E |
|------------|------|-------------|-----|
| Symfony | PHPUnit | Behat | Cypress |
| Flutter | flutter_test | integration_test | - |
| Python | pytest | pytest | pytest |
| React | Jest | Testing Library | Playwright |
| React Native | Jest | Detox | - |

### Security

Common security practices:

- Input validation
- Output encoding
- Authentication/Authorization
- Secure storage
- HTTPS enforcement
- Dependency auditing

### Performance

Common performance practices:

- Lazy loading
- Caching strategies
- Code splitting
- Image optimization
- Database query optimization
- Memory management

---

## Choosing Technologies

### Web Application

```yaml
modules:
  - path: "frontend"
    tech: react
  - path: "api"
    tech: symfony  # or python
```

### Mobile Application

```yaml
modules:
  - path: "."
    tech: flutter  # Cross-platform
  # OR
  - path: "."
    tech: reactnative  # If team knows React
```

### Full-Stack

```yaml
modules:
  - path: "web"
    tech: react
  - path: "mobile"
    tech: flutter
  - path: "api"
    tech: symfony
  - path: "workers"
    tech: python
```
