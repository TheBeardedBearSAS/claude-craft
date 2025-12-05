# Architecture React - Principes et Organisation

## Principes Architecturaux Fondamentaux

### 1. Séparation des Responsabilités (Separation of Concerns)

Chaque partie du code doit avoir une responsabilité unique et bien définie :

- **Composants** : Affichage et interaction utilisateur
- **Hooks** : Logique métier et gestion d'état
- **Services** : Communication avec les APIs
- **Utils** : Fonctions utilitaires pures
- **Types** : Définitions TypeScript

### 2. Modularité

Le code doit être organisé en modules indépendants et réutilisables.

### 3. Scalabilité

L'architecture doit supporter la croissance du projet sans refactoring majeur.

## Structure de Dossiers Feature-Based

### Organisation Générale

```
src/
├── app/                          # Configuration de l'application
│   ├── App.tsx                   # Composant racine
│   ├── AppProviders.tsx          # Providers globaux
│   └── router.tsx                # Configuration du routing
│
├── components/                   # Composants partagés (Atomic Design)
│   ├── atoms/                    # Composants atomiques
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
│   ├── molecules/                # Composants moléculaires
│   │   ├── FormField/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormField.test.tsx
│   │   │   └── index.ts
│   │   ├── SearchBar/
│   │   ├── Card/
│   │   └── Modal/
│   │
│   ├── organisms/                # Composants organismes
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ├── components/      # Sous-composants spécifiques
│   │   │   │   ├── HeaderNav.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   ├── DataTable/
│   │   └── Form/
│   │
│   └── templates/                # Templates de page
│       ├── DashboardTemplate/
│       ├── AuthTemplate/
│       └── SettingsTemplate/
│
├── features/                     # Fonctionnalités métier
│   ├── auth/
│   │   ├── components/          # Composants spécifiques à l'authentification
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── RegisterForm/
│   │   │   └── PasswordReset/
│   │   │
│   │   ├── hooks/               # Hooks custom pour l'auth
│   │   │   ├── useAuth.ts
│   │   │   ├── useAuth.test.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   │
│   │   ├── services/            # Services API pour l'auth
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/               # Types TypeScript
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/               # Utilitaires spécifiques
│   │   │   ├── tokenStorage.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── store/               # State management local
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/           # Constantes
│   │   │   └── auth.constants.ts
│   │   │
│   │   └── index.ts             # Point d'entrée de la feature
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
├── hooks/                        # Hooks globaux réutilisables
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useOnClickOutside.ts
│   ├── usePagination.ts
│   └── index.ts
│
├── services/                     # Services globaux
│   ├── api/
│   │   ├── axios.config.ts      # Configuration Axios
│   │   ├── apiClient.ts         # Client API
│   │   └── interceptors.ts      # Intercepteurs
│   ├── storage/
│   │   ├── localStorage.service.ts
│   │   └── sessionStorage.service.ts
│   ├── analytics/
│   │   └── analytics.service.ts
│   └── index.ts
│
├── store/                        # State management global
│   ├── slices/                  # Slices Zustand
│   │   ├── uiStore.ts
│   │   ├── themeStore.ts
│   │   └── notificationStore.ts
│   ├── index.ts
│   └── types.ts
│
├── types/                        # Types globaux
│   ├── global.types.ts
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                        # Utilitaires globaux
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
├── styles/                       # Styles globaux
│   ├── globals.css
│   ├── variables.css
│   ├── theme.ts
│   └── tailwind.config.ts
│
├── config/                       # Configuration
│   ├── env.ts                   # Variables d'environnement
│   ├── constants.ts             # Constantes globales
│   ├── routes.ts                # Définition des routes
│   └── features.ts              # Feature flags
│
├── assets/                       # Assets statiques
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── lib/                          # Bibliothèques tierces configurées
│   ├── react-query/
│   │   └── queryClient.ts
│   ├── router/
│   │   └── router.config.ts
│   └── i18n/
│       └── i18n.config.ts
│
└── pages/                        # Pages (si routing basé sur fichiers)
    ├── HomePage.tsx
    ├── DashboardPage.tsx
    └── NotFoundPage.tsx
```

## Pattern Atomic Design

### Hiérarchie des Composants

#### 1. Atoms (Atomes)

**Composants les plus basiques, non décomposables.**

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

#### 2. Molecules (Molécules)

**Combinaison de plusieurs atomes.**

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

```typescript
// components/molecules/SearchBar/SearchBar.tsx
import { FC, useState, ChangeEvent } from 'react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="relative flex items-center">
      <Icon name="search" className="absolute left-3 text-gray-400" />
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
        fullWidth
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-2"
        >
          <Icon name="x" />
        </Button>
      )}
    </div>
  );
};
```

#### 3. Organisms (Organismes)

**Composants complexes combinant molecules et atoms.**

```typescript
// components/organisms/DataTable/DataTable.tsx
import { FC, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender
} from '@tanstack/react-table';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({
  data,
  columns,
  pageSize = 10,
  onRowClick
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize
      }
    }
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-2'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <Icon
                            name={
                              header.column.getIsSorted() === 'asc'
                                ? 'arrow-up'
                                : 'arrow-down'
                            }
                          />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### 4. Templates

**Layouts de pages.**

```typescript
// components/templates/DashboardTemplate/DashboardTemplate.tsx
import { FC, ReactNode } from 'react';
import { Header } from '@/components/organisms/Header';
import { Sidebar } from '@/components/organisms/Sidebar';

export interface DashboardTemplateProps {
  children: ReactNode;
  title: string;
}

export const DashboardTemplate: FC<DashboardTemplateProps> = ({
  children,
  title
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};
```

## Pattern Container/Presentational

### Séparation Logique/Présentation

#### Container (Smart Component)

**Gère la logique, les effets de bord, le state.**

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

**Affiche uniquement, reçoit tout via props.**

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

## Organisation des Hooks Custom

### Structure des Hooks

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
 * Hook personnalisé pour gérer [description]
 *
 * @param options - Options de configuration
 * @returns État et méthodes pour gérer [fonctionnalité]
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
        // Logique métier
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

### Hooks par Catégorie

#### 1. Data Fetching Hooks

```typescript
// features/users/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { User } from '../types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id
  });
};
```

#### 2. Mutation Hooks

```typescript
// features/users/hooks/useUserMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { User, CreateUserInput } from '../types';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
```

#### 3. State Management Hooks

```typescript
// features/users/hooks/useUserFilters.ts
import { useState, useCallback } from 'react';
import { UserFilters } from '../types';

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: null,
    status: null
  });

  const updateFilter = useCallback(
    <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      role: null,
      status: null
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters
  };
};
```

## Bonnes Pratiques d'Architecture

### 1. Index Barrels

**Faciliter les imports avec des fichiers index.**

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

**Usage** :
```typescript
// Au lieu de multiples imports
import { UserList } from '@/features/users/components/UserList';
import { UserProfile } from '@/features/users/components/UserProfile';

// Un seul import
import { UserList, UserProfile } from '@/features/users/components';
```

### 2. Absolute Imports

**Configuration tsconfig.json** :

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

**Usage** :
```typescript
// ❌ Mauvais - imports relatifs
import { Button } from '../../../components/atoms/Button';

// ✅ Bon - imports absolus
import { Button } from '@/components/atoms/Button';
```

### 3. Lazy Loading

**Code splitting des routes** :

```typescript
// app/router.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Spinner } from '@/components/atoms/Spinner';

// Lazy load des pages
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

### 4. Feature Flags

```typescript
// config/features.ts
export const features = {
  newDashboard: import.meta.env.VITE_FEATURE_NEW_DASHBOARD === 'true',
  betaFeatures: import.meta.env.VITE_FEATURE_BETA === 'true',
  analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true'
} as const;

// Usage dans un composant
import { features } from '@/config/features';

export const Dashboard: FC = () => {
  if (features.newDashboard) {
    return <NewDashboard />;
  }

  return <LegacyDashboard />;
};
```

## Conclusion

Une architecture bien pensée est la fondation d'une application React maintenable et scalable. Les principes clés :

1. ✅ **Feature-based** : Organisation par fonctionnalité métier
2. ✅ **Atomic Design** : Hiérarchie claire des composants
3. ✅ **Séparation des responsabilités** : Container/Presenter, hooks, services
4. ✅ **Modularité** : Composants et hooks réutilisables
5. ✅ **Scalabilité** : Structure qui grandit avec le projet

**Règle d'or** : Chaque fichier, dossier et composant doit avoir une responsabilité unique et claire.
