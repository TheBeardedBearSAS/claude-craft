# React Architecture - Principles and Organization

## Fundamental Architectural Principles

### 1. Separation of Concerns

Each part of the code should have a single, well-defined responsibility:

- **Components**: Display and user interaction
- **Hooks**: Business logic and state management
- **Services**: API communication
- **Utils**: Pure utility functions
- **Types**: TypeScript definitions

### 2. Modularity

Code should be organized into independent and reusable modules.

### 3. Scalability

Architecture should support project growth without major refactoring.

## Feature-Based Folder Structure

### General Organization

```
src/
├── app/                          # Application configuration
│   ├── App.tsx                   # Root component
│   ├── AppProviders.tsx          # Global providers
│   └── router.tsx                # Routing configuration
│
├── components/                   # Shared components (Atomic Design)
│   ├── atoms/                    # Atomic components
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
│   ├── molecules/                # Molecular components
│   │   ├── FormField/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormField.test.tsx
│   │   │   └── index.ts
│   │   ├── SearchBar/
│   │   ├── Card/
│   │   └── Modal/
│   │
│   ├── organisms/                # Organism components
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ├── components/      # Specific sub-components
│   │   │   │   ├── HeaderNav.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   ├── DataTable/
│   │   └── Form/
│   │
│   └── templates/                # Page templates
│       ├── DashboardTemplate/
│       ├── AuthTemplate/
│       └── SettingsTemplate/
│
├── features/                     # Business features
│   ├── auth/
│   │   ├── components/          # Authentication-specific components
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── RegisterForm/
│   │   │   └── PasswordReset/
│   │   │
│   │   ├── hooks/               # Custom hooks for auth
│   │   │   ├── useAuth.ts
│   │   │   ├── useAuth.test.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   │
│   │   ├── services/            # API services for auth
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/               # TypeScript types
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/               # Specific utilities
│   │   │   ├── tokenStorage.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── store/               # Local state management
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/           # Constants
│   │   │   └── auth.constants.ts
│   │   │
│   │   └── index.ts             # Feature entry point
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
├── hooks/                        # Global reusable hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useOnClickOutside.ts
│   ├── usePagination.ts
│   └── index.ts
│
├── services/                     # Global services
│   ├── api/
│   │   ├── axios.config.ts      # Axios configuration
│   │   ├── apiClient.ts         # API client
│   │   └── interceptors.ts      # Interceptors
│   ├── storage/
│   │   ├── localStorage.service.ts
│   │   └── sessionStorage.service.ts
│   ├── analytics/
│   │   └── analytics.service.ts
│   └── index.ts
│
├── store/                        # Global state management
│   ├── slices/                  # Zustand slices
│   │   ├── uiStore.ts
│   │   ├── themeStore.ts
│   │   └── notificationStore.ts
│   ├── index.ts
│   └── types.ts
│
├── types/                        # Global types
│   ├── global.types.ts
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                        # Global utilities
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
├── styles/                       # Global styles
│   ├── globals.css
│   ├── variables.css
│   ├── theme.ts
│   └── tailwind.config.ts
│
├── config/                       # Configuration
│   ├── env.ts                   # Environment variables
│   ├── constants.ts             # Global constants
│   ├── routes.ts                # Route definitions
│   └── features.ts              # Feature flags
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── lib/                          # Configured third-party libraries
│   ├── react-query/
│   │   └── queryClient.ts
│   ├── router/
│   │   └── router.config.ts
│   └── i18n/
│       └── i18n.config.ts
│
└── pages/                        # Pages (if file-based routing)
    ├── HomePage.tsx
    ├── DashboardPage.tsx
    └── NotFoundPage.tsx
```

## Atomic Design Pattern

### Component Hierarchy

#### 1. Atoms

**Most basic components, not decomposable.**

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

#### 2. Molecules

**Combination of several atoms.**

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

## Container/Presentational Pattern

### Logic/Presentation Separation

#### Container (Smart Component)

**Handles logic, side effects, state.**

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

**Displays only, receives everything via props.**

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
      header: 'Email'
    },
    {
      accessorKey: 'role',
      header: 'Role'
    }
  ], []);

  return (
    <div className="space-y-4">
      <SearchBar onSearch={onSearch} placeholder="Search users..." />

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

## Custom Hooks Organization

### Hook Structure

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
 * Custom hook to manage [description]
 *
 * @param options - Configuration options
 * @returns State and methods to manage [functionality]
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
        // Business logic
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

## Architecture Best Practices

### 1. Index Barrels

**Facilitate imports with index files.**

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

**Usage**:
```typescript
// Instead of multiple imports
import { UserList } from '@/features/users/components/UserList';
import { UserProfile } from '@/features/users/components/UserProfile';

// Single import
import { UserList, UserProfile } from '@/features/users/components';
```

### 2. Absolute Imports

**tsconfig.json configuration**:

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

**Usage**:
```typescript
// ❌ Bad - relative imports
import { Button } from '../../../components/atoms/Button';

// ✅ Good - absolute imports
import { Button } from '@/components/atoms/Button';
```

### 3. Lazy Loading

**Route code splitting**:

```typescript
// app/router.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Spinner } from '@/components/atoms/Spinner';

// Lazy load pages
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

## Conclusion

A well-designed architecture is the foundation of a maintainable and scalable React application. Key principles:

1. ✅ **Feature-based**: Organization by business functionality
2. ✅ **Atomic Design**: Clear component hierarchy
3. ✅ **Separation of concerns**: Container/Presenter, hooks, services
4. ✅ **Modularity**: Reusable components and hooks
5. ✅ **Scalability**: Structure that grows with the project

**Golden rule**: Each file, folder, and component should have a single, clear responsibility.
