# Arquitetura React - Princípios e Organização

## Princípios Arquiteturais Fundamentais

### 1. Separação de Responsabilidades

Cada parte do código deve ter uma responsabilidade única e bem definida:

- **Componentes**: Exibição e interação do usuário
- **Hooks**: Lógica de negócio e gerenciamento de estado
- **Serviços**: Comunicação com API
- **Utilitários**: Funções utilitárias puras
- **Tipos**: Definições TypeScript

### 2. Modularidade

O código deve ser organizado em módulos independentes e reutilizáveis.

### 3. Escalabilidade

A arquitetura deve suportar o crescimento do projeto sem grandes refatorações.

## Estrutura de Pastas Baseada em Funcionalidades

### Organização Geral

```
src/
├── app/                          # Configuração da aplicação
│   ├── App.tsx                   # Componente raiz
│   ├── AppProviders.tsx          # Provedores globais
│   └── router.tsx                # Configuração de roteamento
│
├── components/                   # Componentes compartilhados (Atomic Design)
│   ├── atoms/                    # Componentes atômicos
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
│   ├── molecules/                # Componentes moleculares
│   │   ├── FormField/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormField.test.tsx
│   │   │   └── index.ts
│   │   ├── SearchBar/
│   │   ├── Card/
│   │   └── Modal/
│   │
│   ├── organisms/                # Componentes organismos
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ├── components/      # Sub-componentes específicos
│   │   │   │   ├── HeaderNav.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   ├── DataTable/
│   │   └── Form/
│   │
│   └── templates/                # Templates de página
│       ├── DashboardTemplate/
│       ├── AuthTemplate/
│       └── SettingsTemplate/
│
├── features/                     # Funcionalidades de negócio
│   ├── auth/
│   │   ├── components/          # Componentes específicos de autenticação
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── RegisterForm/
│   │   │   └── PasswordReset/
│   │   │
│   │   ├── hooks/               # Hooks personalizados para auth
│   │   │   ├── useAuth.ts
│   │   │   ├── useAuth.test.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   │
│   │   ├── services/            # Serviços de API para auth
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/               # Tipos TypeScript
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/               # Utilitários específicos
│   │   │   ├── tokenStorage.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── store/               # Gerenciamento de estado local
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/           # Constantes
│   │   │   └── auth.constants.ts
│   │   │
│   │   └── index.ts             # Ponto de entrada da funcionalidade
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
├── hooks/                        # Hooks reutilizáveis globais
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useOnClickOutside.ts
│   ├── usePagination.ts
│   └── index.ts
│
├── services/                     # Serviços globais
│   ├── api/
│   │   ├── axios.config.ts      # Configuração do Axios
│   │   ├── apiClient.ts         # Cliente de API
│   │   └── interceptors.ts      # Interceptadores
│   ├── storage/
│   │   ├── localStorage.service.ts
│   │   └── sessionStorage.service.ts
│   ├── analytics/
│   │   └── analytics.service.ts
│   └── index.ts
│
├── store/                        # Gerenciamento de estado global
│   ├── slices/                  # Slices do Zustand
│   │   ├── uiStore.ts
│   │   ├── themeStore.ts
│   │   └── notificationStore.ts
│   ├── index.ts
│   └── types.ts
│
├── types/                        # Tipos globais
│   ├── global.types.ts
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                        # Utilitários globais
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
├── styles/                       # Estilos globais
│   ├── globals.css
│   ├── variables.css
│   ├── theme.ts
│   └── tailwind.config.ts
│
├── config/                       # Configuração
│   ├── env.ts                   # Variáveis de ambiente
│   ├── constants.ts             # Constantes globais
│   ├── routes.ts                # Definições de rotas
│   └── features.ts              # Feature flags
│
├── assets/                       # Assets estáticos
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── lib/                          # Bibliotecas de terceiros configuradas
│   ├── react-query/
│   │   └── queryClient.ts
│   ├── router/
│   │   └── router.config.ts
│   └── i18n/
│       └── i18n.config.ts
│
└── pages/                        # Páginas (se roteamento baseado em arquivo)
    ├── HomePage.tsx
    ├── DashboardPage.tsx
    └── NotFoundPage.tsx
```

## Padrão Atomic Design

### Hierarquia de Componentes

#### 1. Átomos

**Componentes mais básicos, não decomponíveis.**

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

#### 2. Moléculas

**Combinação de vários átomos.**

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

## Padrão Container/Presentational

### Separação Lógica/Apresentação

#### Container (Componente Inteligente)

**Gerencia lógica, efeitos colaterais, estado.**

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

#### Presenter (Componente Burro)

**Exibe apenas, recebe tudo via props.**

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
      header: 'Nome'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'role',
      header: 'Função'
    }
  ], []);

  return (
    <div className="space-y-4">
      <SearchBar onSearch={onSearch} placeholder="Buscar usuários..." />

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

## Organização de Hooks Personalizados

### Estrutura de Hook

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
 * Hook personalizado para gerenciar [descrição]
 *
 * @param options - Opções de configuração
 * @returns Estado e métodos para gerenciar [funcionalidade]
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
        // Lógica de negócio
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

## Melhores Práticas de Arquitetura

### 1. Index Barrels

**Facilitar importações com arquivos index.**

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

**Uso**:
```typescript
// Em vez de múltiplas importações
import { UserList } from '@/features/users/components/UserList';
import { UserProfile } from '@/features/users/components/UserProfile';

// Importação única
import { UserList, UserProfile } from '@/features/users/components';
```

### 2. Importações Absolutas

**Configuração do tsconfig.json**:

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

**Uso**:
```typescript
// ❌ Ruim - importações relativas
import { Button } from '../../../components/atoms/Button';

// ✅ Bom - importações absolutas
import { Button } from '@/components/atoms/Button';
```

### 3. Lazy Loading

**Code splitting de rotas**:

```typescript
// app/router.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Spinner } from '@/components/atoms/Spinner';

// Carregamento lazy de páginas
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

## Conclusão

Uma arquitetura bem projetada é a base de uma aplicação React manutenível e escalável. Princípios-chave:

1. ✅ **Baseada em funcionalidades**: Organização por funcionalidade de negócio
2. ✅ **Atomic Design**: Hierarquia clara de componentes
3. ✅ **Separação de responsabilidades**: Container/Presenter, hooks, serviços
4. ✅ **Modularidade**: Componentes e hooks reutilizáveis
5. ✅ **Escalabilidade**: Estrutura que cresce com o projeto

**Regra de ouro**: Cada arquivo, pasta e componente deve ter uma responsabilidade única e clara.
