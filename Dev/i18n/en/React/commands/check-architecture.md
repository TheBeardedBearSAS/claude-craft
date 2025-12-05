# Architecture Compliance Check

Verify that the project follows established architectural patterns and best practices.

## What This Command Does

1. **Architecture Analysis**
   - Verify folder structure
   - Check separation of concerns
   - Validate component organization
   - Check dependency directions
   - Verify design patterns

2. **Verification Points**
   - Feature-based structure
   - Component hierarchy
   - State management
   - API layer separation
   - Type definitions

3. **Generated Report**
   - Architecture violations
   - Recommendations
   - Refactoring opportunities
   - Compliance score

## Expected Architecture

### Folder Structure

```
src/
├── app/                    # App configuration
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── features/              # Features (business logic)
│   └── users/
│       ├── components/    # Feature-specific components
│       ├── hooks/         # Feature-specific hooks
│       ├── services/      # API calls
│       ├── stores/        # State management
│       ├── types/         # TypeScript types
│       └── utils/         # Utility functions
│
├── components/            # Shared components
│   ├── ui/               # UI primitives (Button, Input)
│   ├── layout/           # Layout components
│   └── common/           # Common components
│
├── hooks/                 # Shared hooks
├── services/             # Shared services
├── stores/               # Global state
├── types/                # Global types
├── utils/                # Utility functions
├── constants/            # Constants
└── config/               # Configuration
```

## What to Check

### 1. Component Organization

```typescript
// ❌ Bad - Everything in one file
src/components/UserList.tsx (1000 lines)

// ✅ Good - Proper organization
src/features/users/
  ├── components/
  │   ├── UserList/
  │   │   ├── UserList.tsx
  │   │   ├── UserList.test.tsx
  │   │   ├── UserListItem.tsx
  │   │   └── index.ts
  │   └── UserForm/
  │       ├── UserForm.tsx
  │       └── UserForm.test.tsx
  ├── hooks/
  │   └── useUsers.ts
  └── services/
      └── user.service.ts
```

### 2. Separation of Concerns

```typescript
// ❌ Bad - Mixed concerns
export const UserList: FC = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

// ✅ Good - Separated concerns
// hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};

// services/user.service.ts
export const userService = {
  getAll: () => apiClient.get<User[]>('/users')
};

// components/UserList.tsx
export const UserList: FC = () => {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {users?.map(user => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  );
};
```

### 3. Dependency Direction

```typescript
// ✅ Good - Dependencies flow inward
features/users/
  └── components/     → Can use hooks/
      └── hooks/      → Can use services/
          └── services/ → Can use utils/

// ❌ Bad - Circular dependencies
services/user.service.ts imports from components/
```

### 4. Component Types

```typescript
// Presentational Components (UI only)
export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};

// Container Components (logic)
export const UserListContainer: FC = () => {
  const { data: users } = useUsers();
  const deleteUser = useDeleteUser();

  return <UserListPresenter users={users} onDelete={deleteUser} />;
};

// Page Components (routing)
export const UsersPage: FC = () => {
  return (
    <MainLayout>
      <PageHeader title="Users" />
      <UserListContainer />
    </MainLayout>
  );
};
```

### 5. State Management

```typescript
// ❌ Bad - State in multiple places
const [users, setUsers] = useState([]);
// Same data in 5 different components

// ✅ Good - Centralized state
// stores/userStore.ts
export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users })
}));

// Or React Query for server state
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};
```

## Architecture Patterns

### 1. Feature-Based Structure

```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── stores/
├── users/
└── products/
```

### 2. Clean Architecture Layers

```
Presentation Layer (Components)
    ↓
Business Logic Layer (Hooks, Services)
    ↓
Data Layer (API, Store)
```

### 3. Atomic Design

```
src/components/
├── atoms/        # Button, Input, Label
├── molecules/    # FormField, SearchBar
├── organisms/    # UserForm, Header
├── templates/    # PageLayout, DashboardLayout
└── pages/        # HomePage, UsersPage
```

## Validation Rules

### Rule 1: No Business Logic in Components

```typescript
// ❌ Bad
export const UserForm: FC = () => {
  const [email, setEmail] = useState('');

  const validate = () => {
    return email.includes('@') && email.length > 5;
  };

  // ... complex validation logic
};

// ✅ Good
export const UserForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(userSchema)
  });

  // Validation in schema, logic in hook
};
```

### Rule 2: API Calls Through Services

```typescript
// ❌ Bad - Direct fetch in component
const response = await fetch('/api/users');

// ✅ Good - Through service
const users = await userService.getAll();
```

### Rule 3: Types Are Centralized

```typescript
// ✅ Good structure
src/features/users/types/
  ├── user.types.ts
  ├── dto.types.ts
  └── index.ts
```

## Automated Checks

### ESLint Rules for Architecture

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["../**/features/*"],
            "message": "Features should not import from other features"
          },
          {
            "group": ["**/components/**/services/*"],
            "message": "Components should not import services directly"
          }
        ]
      }
    ]
  }
}
```

### Custom Script

```typescript
// scripts/check-architecture.ts
import { glob } from 'glob';
import { readFile } from 'fs/promises';

const checkImports = async () => {
  const files = await glob('src/**/*.{ts,tsx}');
  const violations = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');

    // Check for violations
    if (file.includes('/components/') && content.includes('fetch(')) {
      violations.push({
        file,
        rule: 'No direct API calls in components',
        line: content.split('\n').findIndex(l => l.includes('fetch('))
      });
    }
  }

  return violations;
};
```

## Best Practices

1. **Feature isolation**: Each feature is self-contained
2. **Clear boundaries**: Presentation, logic, data layers
3. **Dependency injection**: Services through hooks/context
4. **Type safety**: TypeScript everywhere
5. **Consistent naming**: Follow conventions
6. **Single responsibility**: One component, one job
7. **Composition over inheritance**: Use composition
8. **Documentation**: Document architecture decisions

## Common Violations

### Violation 1: God Components

**Problem**: Component does too much
**Solution**: Break down into smaller components

### Violation 2: Circular Dependencies

**Problem**: A imports B, B imports A
**Solution**: Extract common code or rethink structure

### Violation 3: Prop Drilling

**Problem**: Passing props through many levels
**Solution**: Use Context or state management

### Violation 4: Mixed Concerns

**Problem**: UI and business logic mixed
**Solution**: Separate into presenter and container

## Tools

- ESLint with custom rules
- Dependency cruiser
- Madge (dependency graph)
- SonarQube
- Custom scripts

## Resources

- [React Architecture Best Practices](https://react.dev/learn/thinking-in-react)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
