# React-Architektur – Prinzipien und Organisation

## Grundlegende Architekturprinzipien

### 1. Trennung der Zuständigkeiten

Jeder Teil des Codes sollte eine einzige, klar definierte Verantwortung haben:

- **Komponenten**: Anzeige und Benutzerinteraktion
- **Hooks**: Geschäftslogik und Zustandsverwaltung
- **Services**: API-Kommunikation
- **Utils**: Reine Hilfsfunktionen
- **Types**: TypeScript-Definitionen

### 2. Modularität

Der Code sollte in unabhängige und wiederverwendbare Module gegliedert werden.

### 3. Skalierbarkeit

Die Architektur sollte das Projektwachstum ohne größeres Refactoring unterstützen.

## Feature-basierte Ordnerstruktur

### Allgemeine Organisation

```
src/
├── app/                          # Anwendungskonfiguration
│   ├── App.tsx                   # Root-Komponente
│   ├── AppProviders.tsx          # Globale Provider
│   └── router.tsx                # Routing-Konfiguration
│
├── components/                   # Gemeinsame Komponenten (Atomic Design)
│   ├── atoms/                    # Atomare Komponenten
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Label/
│   │   ├── Icon/
│   │   └── Spinner/
│   │
│   ├── molecules/                # Molekulare Komponenten
│   │   ├── FormField/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormField.test.tsx
│   │   │   └── index.ts
│   │   ├── SearchBar/
│   │   ├── Card/
│   │   └── Modal/
│   │
│   ├── organisms/                # Organismus-Komponenten
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ├── components/      # Spezifische Unterkomponenten
│   │   │   │   ├── HeaderNav.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   ├── DataTable/
│   │   └── Form/
│   │
│   └── templates/                # Seiten-Templates
│       ├── DashboardTemplate/
│       ├── AuthTemplate/
│       └── SettingsTemplate/
│
├── features/                     # Geschäftliche Features
│   ├── auth/
│   │   ├── components/          # Authentifizierungsspezifische Komponenten
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── RegisterForm/
│   │   │   └── PasswordReset/
│   │   │
│   │   ├── hooks/               # Custom Hooks für Auth
│   │   │   ├── useAuth.ts
│   │   │   ├── useAuth.test.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   │
│   │   ├── services/            # API-Services für Auth
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/               # TypeScript-Typen
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/               # Spezifische Hilfsfunktionen
│   │   │   ├── tokenStorage.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── store/               # Lokale Zustandsverwaltung
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/           # Konstanten
│   │   │   └── auth.constants.ts
│   │   │
│   │   └── index.ts             # Feature-Einstiegspunkt
│   │
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserList/
│   │   │   ├── UserProfile/
│   │   │   └── UserForm/
│   │   ├── hooks/
│   │   │   ├── useUsers.ts
│   │   │   ├── useUserMutations.ts
│   │   │   └── useUserFilters.ts
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── products/
│   ├── orders/
│   └── dashboard/
│
├── hooks/                        # Globale wiederverwendbare Hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useOnClickOutside.ts
│   ├── usePagination.ts
│   └── index.ts
│
├── services/                     # Globale Services
│   ├── api/
│   │   ├── axios.config.ts      # Axios-Konfiguration
│   │   ├── apiClient.ts         # API-Client
│   │   └── interceptors.ts      # Interceptors
│   ├── storage/
│   │   ├── localStorage.service.ts
│   │   └── sessionStorage.service.ts
│   ├── analytics/
│   │   └── analytics.service.ts
│   └── index.ts
│
├── store/                        # Globale Zustandsverwaltung
│   ├── slices/                  # Zustand-Slices
│   │   ├── uiStore.ts
│   │   ├── themeStore.ts
│   │   └── notificationStore.ts
│   ├── index.ts
│   └── types.ts
│
├── types/                        # Globale Typen
│   ├── global.types.ts
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                        # Globale Hilfsfunktionen
│   ├── formatters/
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   └── number.ts
│   ├── validators/
│   │   ├── email.ts
│   │   └── phone.ts
│   ├── helpers/
│   │   ├── array.ts
│   │   ├── object.ts
│   │   └── string.ts
│   └── index.ts
│
├── styles/                       # Globale Stile
│   ├── globals.css
│   ├── variables.css
│   ├── theme.ts
│   └── tailwind.config.ts
│
├── config/                       # Konfiguration
│   ├── env.ts                   # Umgebungsvariablen
│   ├── constants.ts             # Globale Konstanten
│   ├── routes.ts                # Routen-Definitionen
│   └── features.ts              # Feature-Flags
│
├── assets/                       # Statische Assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── lib/                          # Konfigurierte Drittanbieter-Bibliotheken
│   ├── react-query/
│   │   └── queryClient.ts
│   ├── router/
│   │   └── router.config.ts
│   └── i18n/
│       └── i18n.config.ts
│
└── pages/                        # Seiten (bei dateibasiertem Routing)
    ├── HomePage.tsx
    ├── DashboardPage.tsx
    └── NotFoundPage.tsx
```

## Atomic-Design-Pattern

### Komponentenhierarchie

#### 1. Atoms (Atome)

**Grundlegendste Komponenten, nicht weiter zerlegbar.**

```typescript
// components/atoms/Button/Button.tsx
import { FC, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-8 text-lg'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant,
  size,
  isLoading,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
};
```

```typescript
// components/atoms/Input/Input.tsx
import { FC, InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/classnames';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, fullWidth, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'px-3 py-2 border rounded-md outline-none transition-colors',
          'focus:ring-2 focus:ring-blue-500',
          error && 'border-red-500 focus:ring-red-500',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
```

#### 2. Molecules (Moleküle)

**Kombination mehrerer Atome.**

```typescript
// components/molecules/FormField/FormField.tsx
import { FC, ReactNode } from 'react';
import { Input, InputProps } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';

export interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  ...inputProps
}) => {
  const inputId = id || `field-${label.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="space-y-1">
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <Input
        id={inputId}
        error={!!error}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
```

## Container/Presenter-Pattern

### Trennung von Logik und Präsentation

#### Container (Smart Component)

**Verwaltet Logik, Nebeneffekte und Zustand.**

```typescript
// features/users/components/UserList/UserListContainer.tsx
import { FC } from 'react';
import { useUsers } from '@/features/users/hooks/useUsers';
import { UserListPresenter } from './UserListPresenter';

export const UserListContainer: FC = () => {
  const {
    users,
    isLoading,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    handleSort
  } = useUsers();

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <UserListPresenter
      users={users}
      isLoading={isLoading}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      onSort={handleSort}
    />
  );
};
```

#### Presenter (Dumb Component)

**Nur Anzeige, empfängt alles über Props.**

```typescript
// features/users/components/UserList/UserListPresenter.tsx
import { FC } from 'react';
import { User } from '@/features/users/types';
import { DataTable } from '@/components/organisms/DataTable';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Pagination } from '@/components/molecules/Pagination';

export interface UserListPresenterProps {
  users: User[];
  isLoading: boolean;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onSort: (field: string) => void;
}

export const UserListPresenter: FC<UserListPresenterProps> = ({
  users,
  isLoading,
  pagination,
  onPageChange,
  onSearch,
  onSort
}) => {
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'email',
      header: 'E-Mail'
    },
    {
      accessorKey: 'role',
      header: 'Rolle'
    }
  ], []);

  return (
    <div className="space-y-4">
      <SearchBar onSearch={onSearch} placeholder="Benutzer suchen..." />

      {isLoading ? (
        <Skeleton />
      ) : (
        <DataTable data={users} columns={columns} />
      )}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
```

## Organisation von Custom Hooks

### Hook-Struktur

```typescript
// hooks/useExample/useExample.ts
import { useState, useEffect, useCallback } from 'react';

export interface UseExampleOptions {
  initialValue?: string;
  onSuccess?: (data: string) => void;
}

export interface UseExampleReturn {
  value: string;
  isLoading: boolean;
  error: Error | null;
  update: (newValue: string) => void;
  reset: () => void;
}

/**
 * Custom Hook zur Verwaltung von [Beschreibung]
 *
 * @param options - Konfigurationsoptionen
 * @returns Zustand und Methoden zur Verwaltung von [Funktionalität]
 *
 * @example
 * ```tsx
 * const { value, update } = useExample({ initialValue: 'test' });
 * ```
 */
export const useExample = (
  options: UseExampleOptions = {}
): UseExampleReturn => {
  const { initialValue = '', onSuccess } = options;

  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (newValue: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Geschäftslogik
        setValue(newValue);
        onSuccess?.(newValue);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    isLoading,
    error,
    update,
    reset
  };
};
```

## Bewährte Architekturpraktiken

### 1. Index-Barrel-Dateien

**Imports mit Index-Dateien vereinfachen.**

```typescript
// features/users/components/index.ts
export { UserList } from './UserList';
export { UserProfile } from './UserProfile';
export { UserForm } from './UserForm';

// features/users/hooks/index.ts
export { useUsers, useUser } from './useUsers';
export { useCreateUser, useUpdateUser, useDeleteUser } from './useUserMutations';
export { useUserFilters } from './useUserFilters';

// features/users/index.ts
export * from './components';
export * from './hooks';
export * from './types';
```

**Verwendung**:
```typescript
// Statt mehrerer Imports
import { UserList } from '@/features/users/components/UserList';
import { UserProfile } from '@/features/users/components/UserProfile';

// Ein einzelner Import
import { UserList, UserProfile } from '@/features/users/components';
```

### 2. Absolute Imports

**tsconfig.json-Konfiguration**:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

**Verwendung**:
```typescript
// ❌ Schlecht – relative Imports
import { Button } from '../../../components/atoms/Button';

// ✅ Gut – absolute Imports
import { Button } from '@/components/atoms/Button';
```

### 3. Lazy Loading

**Code-Splitting nach Route**:

```typescript
// app/router.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { Spinner } from '@/components/atoms/Spinner';

// Seiten lazy laden
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Spinner />}>
        <HomePage />
      </Suspense>
    )
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<Spinner />}>
        <DashboardPage />
      </Suspense>
    )
  },
  {
    path: '/users',
    element: (
      <Suspense fallback={<Spinner />}>
        <UsersPage />
      </Suspense>
    )
  }
]);
```

## Fazit

Eine gut durchdachte Architektur ist die Grundlage einer wartbaren und skalierbaren React-Anwendung. Wichtigste Prinzipien:

1. ✅ **Feature-basiert**: Organisation nach geschäftlichen Funktionalitäten
2. ✅ **Atomic Design**: Klare Komponentenhierarchie
3. ✅ **Trennung der Zuständigkeiten**: Container/Presenter, Hooks, Services
4. ✅ **Modularität**: Wiederverwendbare Komponenten und Hooks
5. ✅ **Skalierbarkeit**: Struktur, die mit dem Projekt wächst

**Goldene Regel**: Jede Datei, jeder Ordner und jede Komponente sollte eine einzige, klare Verantwortung haben.
