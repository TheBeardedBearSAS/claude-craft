# React-Architektur

## Projekt-Struktur

### Feature-basierte Organisation

```
src/
├── components/           # Wiederverwendbare Komponenten (Atomic Design)
│   ├── atoms/           # Grundlegende Bausteine
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Badge/
│   │   └── Spinner/
│   ├── molecules/       # Kombinationen von Atoms
│   │   ├── FormField/
│   │   ├── SearchBar/
│   │   └── Card/
│   └── organisms/       # Komplexe Komponenten
│       ├── Header/
│       ├── Sidebar/
│       └── DataTable/
│
├── features/            # Business-Features
│   ├── auth/
│   │   ├── components/  # Feature-spezifische Komponenten
│   │   ├── hooks/       # Feature-spezifische Hooks
│   │   ├── services/    # API-Calls
│   │   ├── types/       # TypeScript-Types
│   │   └── utils/       # Utilities
│   ├── users/
│   └── dashboard/
│
├── hooks/               # Geteilte Custom Hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── services/            # Geteilte API-Services
│   ├── api.service.ts
│   ├── auth.service.ts
│   └── storage.service.ts
│
├── utils/               # Geteilte Utilities
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── types/               # Geteilte TypeScript-Types
│   ├── api.types.ts
│   ├── user.types.ts
│   └── common.types.ts
│
├── config/              # Konfigurationsdateien
│   ├── constants.ts
│   ├── routes.ts
│   └── api.config.ts
│
├── styles/              # Globale Styles
│   ├── globals.css
│   └── tailwind.css
│
├── App.tsx              # Root-Komponente
├── main.tsx             # Entry-Point
└── routes.tsx           # Routing-Konfiguration
```

## Atomic Design-Prinzipien

### Atoms (Atome)

Grundlegende UI-Bausteine, nicht weiter zerlegbar.

```typescript
// components/atoms/Button/Button.tsx
import { FC, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-white hover:bg-secondary/90',
        outline: 'border border-input hover:bg-accent'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: FC<ButtonProps> = ({
  variant,
  size,
  className,
  ...props
}) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
};
```

### Molecules (Moleküle)

Kombinationen von mehreren Atoms.

```typescript
// components/molecules/FormField/FormField.tsx
import { FC, InputHTMLAttributes } from 'react';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  id,
  ...inputProps
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};
```

### Organisms (Organismen)

Komplexe Komponenten aus Molecules und Atoms.

```typescript
// components/organisms/LoginForm/LoginForm.tsx
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben')
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="E-Mail"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormField
        label="Passwort"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
      </Button>
    </form>
  );
};
```

## Feature-basierte Architektur

### Feature-Organisation

Jedes Feature ist selbständig mit eigenen Komponenten, Hooks und Services.

```typescript
// features/users/index.ts
export { UserList } from './components/UserList';
export { UserForm } from './components/UserForm';
export { useUsers, useCreateUser } from './hooks/useUsers';
export type { User, CreateUserInput } from './types';
```

### Feature-Komponente mit Container/Presenter

```typescript
// features/users/components/UserList/UserListContainer.tsx
import { FC } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { UserListPresenter } from './UserListPresenter';
import { Spinner } from '@/components/atoms/Spinner';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';

export const UserListContainer: FC = () => {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!users) return null;

  return <UserListPresenter users={users} />;
};

// features/users/components/UserList/UserListPresenter.tsx
import { FC } from 'react';
import type { User } from '../../types';
import { Card } from '@/components/molecules/Card';

interface UserListPresenterProps {
  users: User[];
}

export const UserListPresenter: FC<UserListPresenterProps> = ({ users }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </Card>
      ))}
    </div>
  );
};
```

## State Management

### Lokaler State (useState)

Für Komponenten-spezifischen State.

```typescript
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);
```

### Server State (TanStack Query)

Für API-Daten und Caching.

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
```

### Globaler State (Zustand)

Für App-weiten State (Theme, Auth, etc.).

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'auth-storage'
    }
  )
);
```

## Routing-Architektur

### Route-Konfiguration

```typescript
// routes.tsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Lazy Loading für Code-Splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./features/users/pages/UsersPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        )
      }
    ]
  }
]);
```

## Dependency Injection Pattern

### Service Layer

```typescript
// services/api.service.ts
import axios, { AxiosInstance } from 'axios';

export class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000
    });
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }
}

export const apiService = new ApiService(
  import.meta.env.VITE_API_BASE_URL
);
```

## Best Practices

### 1. Komponenten-Aufteilung

```typescript
// ✅ Gut - Kleine, fokussierte Komponenten
export const UserCard: FC<{ user: User }> = ({ user }) => {
  return (
    <Card>
      <UserAvatar user={user} />
      <UserInfo user={user} />
      <UserActions user={user} />
    </Card>
  );
};

// ❌ Schlecht - Monolithische Komponente
export const UserCard: FC<{ user: User }> = ({ user }) => {
  return (
    <Card>
      {/* 200 Zeilen Code... */}
    </Card>
  );
};
```

### 2. Absolute Imports

```typescript
// ✅ Gut - Absolute Imports
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

// ❌ Schlecht - Relative Imports
import { Button } from '../../../components/atoms/Button';
import { useAuth } from '../../hooks/useAuth';
```

### 3. Barrel Exports

```typescript
// components/atoms/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Badge } from './Badge';

// Nutzung
import { Button, Input, Badge } from '@/components/atoms';
```

## Fazit

Eine gute Architektur ermöglicht:

1. ✅ **Wartbarkeit**: Leicht zu verstehen und zu ändern
2. ✅ **Skalierbarkeit**: Wächst mit dem Projekt
3. ✅ **Wiederverwendbarkeit**: DRY-Prinzip
4. ✅ **Testbarkeit**: Einfach zu testen
5. ✅ **Team-Kollaboration**: Klare Struktur für alle

**Goldene Regel**: Architektur sollte dem Team dienen, nicht umgekehrt.
