# React TypeScript Coding Standards

## TypeScript Strict Mode

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    // Strict Type-Checking Options
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Module Resolution
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "esModuleInterop": true,

    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,

    // React
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020",
    "module": "ESNext",

    // Paths
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Strict TypeScript Rules

#### 1. Explicit Types

```typescript
// ❌ Bad - Implicit 'any' type
const handleClick = (event) => {
  console.log(event.target);
};

// ✅ Good - Explicit type
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget);
};

// ❌ Bad - Implicit return type
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good - Explicit types
function calculateTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 2. Null Safety

```typescript
// ❌ Bad - No null check
function getUserName(user: User) {
  return user.profile.name; // Error if profile is null
}

// ✅ Good - Optional chaining
function getUserName(user: User): string {
  return user.profile?.name ?? 'Anonymous';
}

// ✅ Good - Guard clause
function getUserName(user: User): string {
  if (!user.profile) {
    return 'Anonymous';
  }
  return user.profile.name;
}
```

#### 3. Union Types and Type Guards

```typescript
// Define union types
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

// Usage
const renderState = (state: AsyncState) => {
  if (isSuccessState(state)) {
    return <div>{state.data.name}</div>; // TypeScript knows data exists
  }

  if (isErrorState(state)) {
    return <div>{state.error.message}</div>; // TypeScript knows error exists
  }

  return <Spinner />;
};
```

## ESLint Configuration

### Installation

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-plugin-jsx-a11y eslint-plugin-import
npm install -D eslint-config-prettier
```

### .eslintrc.cjs Configuration

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

## Prettier Configuration

### Installation

```bash
npm install -D prettier
```

### .prettierrc Configuration

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

## Naming Conventions

### 1. Files

```
✅ React Components: PascalCase
- UserProfile.tsx
- LoginForm.tsx
- DataTable.tsx

✅ Hooks: camelCase with 'use' prefix
- useAuth.ts
- useLocalStorage.ts
- useDebounce.ts

✅ Utilities: camelCase
- formatDate.ts
- validateEmail.ts
- calculateTotal.ts

✅ Constants: UPPER_SNAKE_CASE
- API_ENDPOINTS.ts
- VALIDATION_RULES.ts
- ERROR_MESSAGES.ts

✅ Types: PascalCase with '.types' suffix
- User.types.ts
- Product.types.ts
- api.types.ts

✅ Services: camelCase with '.service' suffix
- auth.service.ts
- user.service.ts
- api.service.ts

✅ Tests: same name + '.test' or '.spec'
- UserProfile.test.tsx
- useAuth.test.ts
- formatDate.spec.ts
```

### 2. Variables and Functions

```typescript
// ✅ Variables: camelCase
const userName = 'John';
const isAuthenticated = true;
const userProfile = { name: 'John' };

// ✅ Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 10;

// ✅ Functions: camelCase, action verb
function getUserById(id: string): User {}
function calculateTotal(items: Product[]): number {}
function validateEmail(email: string): boolean {}

// ✅ Handlers: 'handle' prefix
const handleClick = () => {};
const handleSubmit = (e: FormEvent) => {};
const handleChange = (value: string) => {};

// ✅ Booleans: 'is', 'has', 'should', 'can' prefix
const isLoading = false;
const hasError = false;
const shouldRender = true;
const canEdit = false;
```

### 3. Components

```typescript
// ✅ Components: PascalCase
export const UserProfile: FC<UserProfileProps> = (props) => {};

// ✅ Props interface: component name + 'Props'
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// ✅ Hooks: camelCase with 'use' prefix
export const useUserProfile = (userId: string) => {};

// ✅ Types: PascalCase
type User = {
  id: string;
  name: string;
};

// ✅ Interfaces: PascalCase (optional 'I' prefix)
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

## Component Patterns

### 1. Functional Component with TypeScript

```typescript
import { FC } from 'react';

// Props interface
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Functional component with FC
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

// Export with displayName for debugging
Button.displayName = 'Button';
```

### 2. React.memo for Performance

```typescript
import { FC, memo } from 'react';

interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
}

// Memoized component
export const UserCard: FC<UserCardProps> = memo(({ user, onSelect }) => {
  return (
    <div onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// With custom comparison
export const UserCardCustom: FC<UserCardProps> = memo(
  ({ user, onSelect }) => {
    return (
      <div onClick={() => onSelect(user.id)}>
        <h3>{user.name}</h3>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (no re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 3. forwardRef for Refs

```typescript
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Component with forwardRef
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

// Usage
const MyForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return <Input ref={inputRef} label="Name" />;
};
```

## Component File Structure

### Simple Component

```
Button/
├── Button.tsx          # Main component
├── Button.test.tsx     # Tests
├── Button.stories.tsx  # Storybook
└── index.ts            # Exports
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

## JSDoc/TSDoc Documentation

### Documenting Components

```typescript
/**
 * Custom button with different visual variants.
 *
 * @remarks
 * This component extends the native HTMLButtonElement props,
 * allowing the use of all standard HTML attributes.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * // Disabled button
 * <Button variant="secondary" disabled>
 *   Disabled
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, children, ...rest }) => {
  return <button className={`btn-${variant}`} {...rest}>{children}</button>;
};
```

## General Best Practices

### 1. One Component = One File

```typescript
// ❌ Bad - Multiple components in one file
export const Button = () => {};
export const Input = () => {};
export const Form = () => {};

// ✅ Good - One component per file
// Button.tsx
export const Button = () => {};

// Input.tsx
export const Input = () => {};
```

### 2. Avoid Any

```typescript
// ❌ Bad
const handleData = (data: any) => {
  console.log(data.name);
};

// ✅ Good
interface Data {
  name: string;
}

const handleData = (data: Data) => {
  console.log(data.name);
};

// ✅ Good - If really necessary, document it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUnknown = (data: any) => {
  // Reason for using any...
};
```

### 3. Named Exports vs Default

```typescript
// ✅ Prefer named exports
export const Button = () => {};
export const Input = () => {};

// ❌ Avoid default exports (except for pages/routes)
export default Button;
```

### 4. Grouped and Ordered Imports

```typescript
// 1. React and external libraries
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Absolute internal imports
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { UserCard } from './UserCard';

// 4. Types
import type { User } from '@/types/user.types';

// 5. Styles and assets
import './styles.css';
```

## NPM Scripts

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

## Conclusion

Coding standards ensure:

1. ✅ Code consistency across the team
2. ✅ Better maintainability
3. ✅ Bug reduction
4. ✅ Easier code reviews
5. ✅ Faster onboarding for new developers

**Golden rule**: Code should be written to be read by humans, not just executed by machines.
