# React TypeScript Coding Standards

## TypeScript Strict Mode

### tsconfig.json-Konfiguration

```json
{
  "compilerOptions": {
    // Strikte Typprüfungsoptionen
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Zusätzliche Prüfungen
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Modulauflösung
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "esModuleInterop": true,

    // Ausgabe
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,

    // React
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020",
    "module": "ESNext",

    // Pfade
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Strikte TypeScript-Regeln

#### 1. Explizite Typen

```typescript
// ❌ Schlecht – Impliziter 'any'-Typ
const handleClick = (event) => {
  console.log(event.target);
};

// ✅ Gut – Expliziter Typ
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget);
};

// ❌ Schlecht – Impliziter Rückgabetyp
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Gut – Explizite Typen
function calculateTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 2. Null-Sicherheit

```typescript
// ❌ Schlecht – Keine Null-Prüfung
function getUserName(user: User) {
  return user.profile.name; // Fehler wenn profile null ist
}

// ✅ Gut – Optionales Verketten
function getUserName(user: User): string {
  return user.profile?.name ?? 'Anonym';
}

// ✅ Gut – Guard-Klausel
function getUserName(user: User): string {
  if (!user.profile) {
    return 'Anonym';
  }
  return user.profile.name;
}
```

#### 3. Union-Typen und Type Guards

```typescript
// Union-Typen definieren
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

// Type Guards
function isSuccessState(state: AsyncState): state is SuccessState {
  return state.status === 'success';
}

function isErrorState(state: AsyncState): state is ErrorState {
  return state.status === 'error';
}

// Verwendung
const renderState = (state: AsyncState) => {
  if (isSuccessState(state)) {
    return <div>{state.data.name}</div>; // TypeScript weiß, dass data existiert
  }

  if (isErrorState(state)) {
    return <div>{state.error.message}</div>; // TypeScript weiß, dass error existiert
  }

  return <Spinner />;
};
```

## ESLint-Konfiguration

### Installation

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-plugin-jsx-a11y eslint-plugin-import
npm install -D eslint-config-prettier
```

### .eslintrc.cjs-Konfiguration

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

    // Allgemein
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

## Prettier-Konfiguration

### Installation

```bash
npm install -D prettier
```

### .prettierrc-Konfiguration

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

## Namenskonventionen

### 1. Dateien

```
✅ React-Komponenten: PascalCase
- UserProfile.tsx
- LoginForm.tsx
- DataTable.tsx

✅ Hooks: camelCase mit 'use'-Präfix
- useAuth.ts
- useLocalStorage.ts
- useDebounce.ts

✅ Hilfsfunktionen: camelCase
- formatDate.ts
- validateEmail.ts
- calculateTotal.ts

✅ Konstanten: UPPER_SNAKE_CASE
- API_ENDPOINTS.ts
- VALIDATION_RULES.ts
- ERROR_MESSAGES.ts

✅ Typen: PascalCase mit '.types'-Suffix
- User.types.ts
- Product.types.ts
- api.types.ts

✅ Services: camelCase mit '.service'-Suffix
- auth.service.ts
- user.service.ts
- api.service.ts

✅ Tests: gleicher Name + '.test' oder '.spec'
- UserProfile.test.tsx
- useAuth.test.ts
- formatDate.spec.ts
```

### 2. Variablen und Funktionen

```typescript
// ✅ Variablen: camelCase
const userName = 'John';
const isAuthenticated = true;
const userProfile = { name: 'John' };

// ✅ Konstanten: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 10;

// ✅ Funktionen: camelCase, Aktionsverb
function getUserById(id: string): User {}
function calculateTotal(items: Product[]): number {}
function validateEmail(email: string): boolean {}

// ✅ Handler: 'handle'-Präfix
const handleClick = () => {};
const handleSubmit = (e: FormEvent) => {};
const handleChange = (value: string) => {};

// ✅ Boolesche Werte: 'is'-, 'has'-, 'should'-, 'can'-Präfix
const isLoading = false;
const hasError = false;
const shouldRender = true;
const canEdit = false;
```

### 3. Komponenten

```typescript
// ✅ Komponenten: PascalCase
export const UserProfile: FC<UserProfileProps> = (props) => {};

// ✅ Props-Interface: Komponentenname + 'Props'
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// ✅ Hooks: camelCase mit 'use'-Präfix
export const useUserProfile = (userId: string) => {};

// ✅ Typen: PascalCase
type User = {
  id: string;
  name: string;
};

// ✅ Interfaces: PascalCase (optionales 'I'-Präfix)
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

## Komponentenmuster

### 1. Funktionale Komponente mit TypeScript

```typescript
import { FC } from 'react';

// Props-Interface
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Funktionale Komponente mit FC
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

// Export mit displayName zum Debuggen
Button.displayName = 'Button';
```

### 2. React.memo für Performance

```typescript
import { FC, memo } from 'react';

interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
}

// Memoisierte Komponente
export const UserCard: FC<UserCardProps> = memo(({ user, onSelect }) => {
  return (
    <div onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// Mit benutzerdefiniertem Vergleich
export const UserCardCustom: FC<UserCardProps> = memo(
  ({ user, onSelect }) => {
    return (
      <div onClick={() => onSelect(user.id)}>
        <h3>{user.name}</h3>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // true zurückgeben, wenn Props gleich sind (kein Re-Render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 3. forwardRef für Refs

```typescript
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Komponente mit forwardRef
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

// Verwendung
const MyForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return <Input ref={inputRef} label="Name" />;
};
```

## Dateistruktur von Komponenten

### Einfache Komponente

```
Button/
├── Button.tsx          # Hauptkomponente
├── Button.test.tsx     # Tests
├── Button.stories.tsx  # Storybook
└── index.ts            # Exporte
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

## JSDoc/TSDoc-Dokumentation

### Komponenten dokumentieren

```typescript
/**
 * Benutzerdefinierter Button mit verschiedenen visuellen Varianten.
 *
 * @remarks
 * Diese Komponente erweitert die nativen HTMLButtonElement-Props,
 * sodass alle Standard-HTML-Attribute verwendet werden können.
 *
 * @example
 * ```tsx
 * // Primärer Button
 * <Button variant="primary" onClick={handleClick}>
 *   Klick mich
 * </Button>
 *
 * // Deaktivierter Button
 * <Button variant="secondary" disabled>
 *   Deaktiviert
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, children, ...rest }) => {
  return <button className={`btn-${variant}`} {...rest}>{children}</button>;
};
```

## Allgemeine bewährte Praktiken

### 1. Eine Komponente = Eine Datei

```typescript
// ❌ Schlecht – Mehrere Komponenten in einer Datei
export const Button = () => {};
export const Input = () => {};
export const Form = () => {};

// ✅ Gut – Eine Komponente pro Datei
// Button.tsx
export const Button = () => {};

// Input.tsx
export const Input = () => {};
```

### 2. Any vermeiden

```typescript
// ❌ Schlecht
const handleData = (data: any) => {
  console.log(data.name);
};

// ✅ Gut
interface Data {
  name: string;
}

const handleData = (data: Data) => {
  console.log(data.name);
};

// ✅ Gut – Falls wirklich nötig, dokumentieren
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUnknown = (data: any) => {
  // Grund für die Verwendung von any...
};
```

### 3. Benannte Exporte vs. Default

```typescript
// ✅ Benannte Exporte bevorzugen
export const Button = () => {};
export const Input = () => {};

// ❌ Default-Exporte vermeiden (außer bei Seiten/Routen)
export default Button;
```

### 4. Gruppierte und geordnete Imports

```typescript
// 1. React und externe Bibliotheken
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Absolute interne Imports
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative Imports
import { UserCard } from './UserCard';

// 4. Typen
import type { User } from '@/types/user.types';

// 5. Stile und Assets
import './styles.css';
```

## NPM-Skripte

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

## Fazit

Coding Standards gewährleisten:

1. ✅ Code-Konsistenz im gesamten Team
2. ✅ Bessere Wartbarkeit
3. ✅ Weniger Fehler
4. ✅ Einfachere Code-Reviews
5. ✅ Schnelleres Onboarding für neue Entwickler

**Goldene Regel**: Code sollte so geschrieben werden, dass er von Menschen gelesen werden kann – nicht nur von Maschinen ausgeführt.
