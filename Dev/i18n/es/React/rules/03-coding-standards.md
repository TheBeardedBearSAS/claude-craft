# Estándares de Codificación React TypeScript

## Modo Estricto de TypeScript

### Configuración de tsconfig.json

```json
{
  "compilerOptions": {
    // Opciones de Verificación de Tipos Estricta
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Verificaciones Adicionales
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Resolución de Módulos
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "esModuleInterop": true,

    // Emisión
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,

    // React
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020",
    "module": "ESNext",

    // Rutas
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Reglas TypeScript Estrictas

#### 1. Tipos Explícitos

```typescript
// ❌ Mal - Tipo 'any' implícito
const handleClick = (event) => {
  console.log(event.target);
};

// ✅ Bien - Tipo explícito
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget);
};

// ❌ Mal - Tipo de retorno implícito
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Bien - Tipos explícitos
function calculateTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 2. Seguridad de Nulos

```typescript
// ❌ Mal - Sin verificación de null
function getUserName(user: User) {
  return user.profile.name; // Error si profile es null
}

// ✅ Bien - Optional chaining
function getUserName(user: User): string {
  return user.profile?.name ?? 'Anónimo';
}

// ✅ Bien - Guard clause
function getUserName(user: User): string {
  if (!user.profile) {
    return 'Anónimo';
  }
  return user.profile.name;
}
```

#### 3. Tipos Union y Type Guards

```typescript
// Definir tipos union
type Status = 'idle' | 'loading' | 'success' | 'error';

interface IdleState {
  status: 'idle';
}

interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: User;
}

interface ErrorState {
  status: 'error';
  error: Error;
}

type AsyncState = IdleState | LoadingState | SuccessState | ErrorState;

// Type guards
function isSuccessState(state: AsyncState): state is SuccessState {
  return state.status === 'success';
}

function isErrorState(state: AsyncState): state is ErrorState {
  return state.status === 'error';
}

// Uso
const renderState = (state: AsyncState) => {
  if (isSuccessState(state)) {
    return <div>{state.data.name}</div>; // TypeScript sabe que data existe
  }

  if (isErrorState(state)) {
    return <div>{state.error.message}</div>; // TypeScript sabe que error existe
  }

  return <Spinner />;
};
```

## Configuración de ESLint

### Instalación

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-plugin-jsx-a11y eslint-plugin-import
npm install -D eslint-config-prettier
```

### Configuración .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jsx-a11y', 'import'],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true
      }
    ],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports'
      }
    ],

    // React
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-curly-brace-presence': [
      'error',
      {
        props: 'never',
        children: 'never'
      }
    ],
    'react/self-closing-comp': 'error',
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-fragments': ['error', 'syntax'],

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'error',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

## Configuración de Prettier

### Instalación

```bash
npm install -D prettier
```

### Configuración .prettierrc

```json
{
  "printWidth": 90,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "none",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### .prettierignore

```
node_modules
dist
build
.next
coverage
*.min.js
*.min.css
package-lock.json
yarn.lock
pnpm-lock.yaml
```

## Convenciones de Nomenclatura

### 1. Archivos

```
✅ Componentes React: PascalCase
- UserProfile.tsx
- LoginForm.tsx
- DataTable.tsx

✅ Hooks: camelCase con prefijo 'use'
- useAuth.ts
- useLocalStorage.ts
- useDebounce.ts

✅ Utilidades: camelCase
- formatDate.ts
- validateEmail.ts
- calculateTotal.ts

✅ Constantes: UPPER_SNAKE_CASE
- API_ENDPOINTS.ts
- VALIDATION_RULES.ts
- ERROR_MESSAGES.ts

✅ Tipos: PascalCase con sufijo '.types'
- User.types.ts
- Product.types.ts
- api.types.ts

✅ Servicios: camelCase con sufijo '.service'
- auth.service.ts
- user.service.ts
- api.service.ts

✅ Tests: mismo nombre + '.test' o '.spec'
- UserProfile.test.tsx
- useAuth.test.ts
- formatDate.spec.ts
```

### 2. Variables y Funciones

```typescript
// ✅ Variables: camelCase
const userName = 'Juan';
const isAuthenticated = true;
const userProfile = { name: 'Juan' };

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.ejemplo.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 10;

// ✅ Funciones: camelCase, verbo de acción
function getUserById(id: string): User {}
function calculateTotal(items: Product[]): number {}
function validateEmail(email: string): boolean {}

// ✅ Handlers: prefijo 'handle'
const handleClick = () => {};
const handleSubmit = (e: FormEvent) => {};
const handleChange = (value: string) => {};

// ✅ Booleanos: prefijo 'is', 'has', 'should', 'can'
const isLoading = false;
const hasError = false;
const shouldRender = true;
const canEdit = false;
```

### 3. Componentes

```typescript
// ✅ Componentes: PascalCase
export const UserProfile: FC<UserProfileProps> = (props) => {};

// ✅ Props interface: nombre del componente + 'Props'
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// ✅ Hooks: camelCase con prefijo 'use'
export const useUserProfile = (userId: string) => {};

// ✅ Types: PascalCase
type User = {
  id: string;
  name: string;
};

// ✅ Interfaces: PascalCase (prefijo 'I' opcional)
interface IUser {
  id: string;
  name: string;
}

// ✅ Enums: PascalCase
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
```

## Patrones de Componentes

### 1. Componente Funcional con TypeScript

```typescript
import { FC } from 'react';

// Interface de props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Componente funcional con FC
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Exportar con displayName para debugging
Button.displayName = 'Button';
```

### 2. React.memo para Rendimiento

```typescript
import { FC, memo } from 'react';

interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
}

// Componente memoizado
export const UserCard: FC<UserCardProps> = memo(({ user, onSelect }) => {
  return (
    <div onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// Con comparación personalizada
export const UserCardCustom: FC<UserCardProps> = memo(
  ({ user, onSelect }) => {
    return (
      <div onClick={() => onSelect(user.id)}>
        <h3>{user.name}</h3>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Devolver true si los props son iguales (sin re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 3. forwardRef para Refs

```typescript
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Componente con forwardRef
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
        {error && <span>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Uso
const MyForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return <Input ref={inputRef} label="Nombre" />;
};
```

## Estructura de Archivos de Componentes

### Componente Simple

```
Button/
├── Button.tsx          # Componente principal
├── Button.test.tsx     # Tests
├── Button.stories.tsx  # Storybook
└── index.ts            # Exportaciones
```

```typescript
// Button.tsx
import { FC, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/classnames';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  return <button className={cn('btn', `btn-${variant}`)} {...props} />;
};
```

```typescript
// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

## Documentación JSDoc/TSDoc

### Documentar Componentes

```typescript
/**
 * Botón personalizado con diferentes variantes visuales.
 *
 * @remarks
 * Este componente extiende los props nativos de HTMLButtonElement,
 * permitiendo el uso de todos los atributos HTML estándar.
 *
 * @example
 * ```tsx
 * // Botón primario
 * <Button variant="primary" onClick={handleClick}>
 *   Haz clic
 * </Button>
 *
 * // Botón deshabilitado
 * <Button variant="secondary" disabled>
 *   Deshabilitado
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, children, ...rest }) => {
  return <button className={`btn-${variant}`} {...rest}>{children}</button>;
};
```

## Mejores Prácticas Generales

### 1. Un Componente = Un Archivo

```typescript
// ❌ Mal - Múltiples componentes en un archivo
export const Button = () => {};
export const Input = () => {};
export const Form = () => {};

// ✅ Bien - Un componente por archivo
// Button.tsx
export const Button = () => {};

// Input.tsx
export const Input = () => {};
```

### 2. Evitar Any

```typescript
// ❌ Mal
const handleData = (data: any) => {
  console.log(data.name);
};

// ✅ Bien
interface Data {
  name: string;
}

const handleData = (data: Data) => {
  console.log(data.name);
};

// ✅ Bien - Si realmente es necesario, documentarlo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUnknown = (data: any) => {
  // Razón para usar any...
};
```

### 3. Exportaciones con Nombre vs Por Defecto

```typescript
// ✅ Preferir exportaciones con nombre
export const Button = () => {};
export const Input = () => {};

// ❌ Evitar exportaciones por defecto (excepto para páginas/rutas)
export default Button;
```

### 4. Importaciones Agrupadas y Ordenadas

```typescript
// 1. React y librerías externas
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Importaciones internas absolutas
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Importaciones relativas
import { UserCard } from './UserCard';

// 4. Tipos
import type { User } from '@/types/user.types';

// 5. Estilos y assets
import './styles.css';
```

## Scripts NPM

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Conclusión

Los estándares de codificación aseguran:

1. ✅ Consistencia del código en todo el equipo
2. ✅ Mejor mantenibilidad
3. ✅ Reducción de bugs
4. ✅ Revisiones de código más fáciles
5. ✅ Incorporación más rápida de nuevos desarrolladores

**Regla de oro**: El código debe escribirse para ser leído por humanos, no solo ejecutado por máquinas.
