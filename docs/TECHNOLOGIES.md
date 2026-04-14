# Technologies Guide

Detailed information about rules, patterns, and best practices for each supported technology.

## Maturity Tiers

Claude Craft classifies its 10 application technology stacks into 3 maturity tiers. This reflects the depth of support: i18n coverage, agent specialization, commands, skills, and reference documentation.

### Tier Overview

| Tier | Label | Technologies | What to Expect |
|------|-------|-------------|----------------|
| **1** | Core | Symfony, React, Python, Flutter | Production-grade support. Deep agent specialization, extensive i18n (25+ files), 8+ commands, 3+ tech-specific skills, full reference docs with examples. |
| **2** | Supported | React Native, PHP | Solid support. Customized reviewer agent, 7+ i18n files, 5+ commands, at least 1 tech-specific skill, full reference docs. |
| **3** | Community | C# / .NET, Angular, Laravel, Vue.js | Basic scaffolding. Generic reviewer template, 2+ i18n files, 3+ commands, shared skills only, basic CLAUDE.md reference. Community contributions welcome. |
| -- | Infra | Docker, Coolify, Kubernetes, OpenTofu, Ansible, Hcloud, PgBouncer, FrankenPHP | Infrastructure tooling, not application stacks. Not tiered. |

### Tier Requirements

| Requirement | Tier 3 (Community) | Tier 2 (Supported) | Tier 1 (Core) |
|---|---|---|---|
| i18n files | >= 2 | >= 7 | >= 25 |
| Agent reviewer | Generic template | Customized | Deep specialization |
| Agent model | haiku | haiku | sonnet |
| Commands | >= 3 | >= 5 | >= 8 |
| Skills | Shared only | 1+ tech-specific | 3+ tech-specific |
| Reference docs | Basic CLAUDE.md | Full reference | Full + examples |

### All Technologies at a Glance

| Technology | Tier | Version | i18n Files | Commands | Status | To Reach Next Tier |
|------------|------|---------|-----------|----------|--------|-------------------|
| Symfony / PHP | 1 (Core) | 8.0 / PHP 8.5 | 58+ | 10+ | Full support | -- |
| React | 1 (Core) | 19.2 + Compiler 1.0 | 30+ | 10+ | Full support | -- |
| Python | 1 (Core) | 3.14+ | 25+ | 10+ | Full support | -- |
| Flutter / Dart | 1 (Core) | 3.41 / Dart 3.11 | 25+ | 10+ | Full support | -- |
| React Native | 2 (Supported) | 0.85 | 39 | 10 | Good coverage | Expand i18n to 25+, deepen agent specialization, add 3+ tech-specific skills |
| PHP | 2 (Supported) | 8.5 | 7+ | 5 | Solid base | Add more i18n files, expand commands to 8+, add tech-specific skills |
| C# / .NET | 3 (Community) | 10 LTS / C# 14 | 2 | 6 | Basic scaffold | Add 5+ i18n files, customize reviewer agent, create tech-specific skill |
| Angular | 3 (Community) | 20 LTS (ou 21) | 2 | 6 | Basic scaffold | Add 5+ i18n files, customize reviewer agent, create tech-specific skill |
| Laravel | 3 (Community) | 13.x / PHP 8.5 | 2 | 6 | Basic scaffold | Add 5+ i18n files, customize reviewer agent, create tech-specific skill |
| Vue.js | 3 (Community) | 3.5+ | 2 | 6 | Basic scaffold | Add 5+ i18n files, customize reviewer agent, create tech-specific skill |
| Paperclip | 2 (Supported) | 2026.403.0 | 29 × 5 langues (en/fr/es/de/pt) | 8 | Full i18n across 5 langs | Expand tests/skills, add audit commands, promote to Tier 1 |

### Upgrade Path

To promote a stack from one tier to the next, see [CONTRIBUTING.md](../CONTRIBUTING.md#technology-tiers) for detailed requirements and contribution guidelines.

---

## Overview

| Technology | Rules | Focus Areas |
|------------|-------|-------------|
| Symfony | 21 | Clean Architecture, DDD, API Platform |
| Flutter | 13 | BLoC, State Management, Testing |
| Python | 12 | FastAPI, Async, Type Hints |
| React | 12 | Hooks, Performance, Accessibility |
| React Native | 12 | Navigation, Native Modules, Store |
| Paperclip | 7 | Two-Layer Architecture, Adapter Protocol, Governance (budgets/approvals), Audit Trails |

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

## LSP Plugins by Stack

Claude Code LSP plugins provide structural code intelligence. Install the recommended plugin for each technology:

| Technology | Plugin | Language Server | Installation |
|------------|--------|----------------|--------------|
| Symfony | `php-lsp` | Intelephense | `npm install -g intelephense` |
| Laravel | `php-lsp` | Intelephense | `npm install -g intelephense` |
| PHP | `php-lsp` | Intelephense | `npm install -g intelephense` |
| Python | `pyright-lsp` | Pyright | `pip install pyright` |
| React | `typescript-lsp` | vtsls | `npm install -g @vtsls/language-server typescript` |
| Angular | `typescript-lsp` | vtsls | `npm install -g @vtsls/language-server typescript` |
| Vue.js | `typescript-lsp` | vtsls | `npm install -g @vtsls/language-server typescript` |
| React Native | `typescript-lsp` | vtsls | `npm install -g @vtsls/language-server typescript` |
| Flutter | `dart-analyzer` | Dart SDK | Included with Flutter SDK |
| C# / .NET | `csharp-lsp` | csharp-ls | `dotnet tool install -g csharp-ls` |

Install: `/plugins install <name>@claude-plugins-official` (except Flutter: `@claude-code-lsps`)

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

### AI-Workforce Orchestration

```yaml
modules:
  - path: "."
    tech: paperclip   # When the repo IS a Paperclip fork / custom Paperclip adapter
```

---

## Paperclip

> **Paperclip** is an open-source orchestration platform for AI workforces: Node.js + TypeScript + React UI + Vitest + PostgreSQL. It acts as a control plane over adapters (Claude Code, Codex, Gemini, HTTP, process) with budgets, approvals, and audit trails.
> Docs: https://docs.paperclip.ing/ — Repo: https://github.com/paperclipai/paperclip — License: MIT

### Architecture

Two-layer:

```
Control Plane (server + web + DB)   ◄──►   Adapters (claude-local, codex-local, http, process, ...)
```

Adapters **never** hold governance state. They execute, heartbeat, report cost, and forward approval requests. Budgets are hard limits; approvals block execution; every mutation emits an activity event.

### Key Rules

- `02-architecture-paperclip.md` — Two-layer control plane + adapters, modular monolith, append-only activity log
- `03-coding-standards.md` — TypeScript strict, kebab files, no `any`, structured logs
- `06-tooling.md` — pnpm 9.15+, tsx, Vitest, Node 20+, `paperclipai` CLI
- `07-testing-paperclip.md` — Vitest + adapter contract tests + cross-tenant isolation
- `08-quality-tools.md` — ESLint flat config strict-type-checked, complexity limits, coverage thresholds
- `11-security-paperclip.md` — Tenancy, secrets, approval gates, signed adapter channel (ed25519 + TLS 1.3)
- `12-adapter-protocol.md` — Heartbeat, cost reporting, approvals, task envelope, signatures

### Commands

See [`/paperclip:*`](COMMANDS.md#paperclip-commands-paperclip) — 5 audit commands + `generate-adapter`, `generate-agent-config`, `setup-company`.

### Use this stack when

- You are contributing to a Paperclip codebase (server, web, SDK, or a built-in adapter)
- You are building a **custom adapter** that connects Paperclip to a proprietary execution backend
- You are onboarding a company onto Paperclip and want guardrails on agents, budgets, and approvals

### Don't use this stack for

- Generic Node.js / TypeScript apps — use `react` + (`symfony` or `python`) instead
- Replacing a job queue — Paperclip is governance on top of AI execution, not a queue
