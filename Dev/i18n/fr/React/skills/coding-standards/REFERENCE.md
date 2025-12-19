# Standards de Codage React TypeScript

## TypeScript Strict Mode

### Configuration tsconfig.json

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

### Règles TypeScript Strictes

#### 1. Types Explicites

```typescript
// ❌ Mauvais - Type implicite 'any'
const handleClick = (event) => {
  console.log(event.target);
};

// ✅ Bon - Type explicite
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget);
};

// ❌ Mauvais - Return type implicite
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Bon - Types explicites
function calculateTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 2. Null Safety

```typescript
// ❌ Mauvais - Pas de vérification null
function getUserName(user: User) {
  return user.profile.name; // Erreur si profile est null
}

// ✅ Bon - Optional chaining
function getUserName(user: User): string {
  return user.profile?.name ?? 'Anonymous';
}

// ✅ Bon - Guard clause
function getUserName(user: User): string {
  if (!user.profile) {
    return 'Anonymous';
  }
  return user.profile.name;
}
```

#### 3. Union Types et Type Guards

```typescript
// Définir des union types
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
    return <div>{state.data.name}</div>; // TypeScript sait que data existe
  }

  if (isErrorState(state)) {
    return <div>{state.error.message}</div>; // TypeScript sait que error existe
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

### Configuration .eslintrc.cjs

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

### Configuration .prettierrc

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

## Conventions de Nommage

### 1. Fichiers

```
✅ Composants React : PascalCase
- UserProfile.tsx
- LoginForm.tsx
- DataTable.tsx

✅ Hooks : camelCase avec préfixe 'use'
- useAuth.ts
- useLocalStorage.ts
- useDebounce.ts

✅ Utilitaires : camelCase
- formatDate.ts
- validateEmail.ts
- calculateTotal.ts

✅ Constants : UPPER_SNAKE_CASE
- API_ENDPOINTS.ts
- VALIDATION_RULES.ts
- ERROR_MESSAGES.ts

✅ Types : PascalCase avec suffixe '.types'
- User.types.ts
- Product.types.ts
- api.types.ts

✅ Services : camelCase avec suffixe '.service'
- auth.service.ts
- user.service.ts
- api.service.ts

✅ Tests : même nom + '.test' ou '.spec'
- UserProfile.test.tsx
- useAuth.test.ts
- formatDate.spec.ts
```

### 2. Variables et Fonctions

```typescript
// ✅ Variables : camelCase
const userName = 'John';
const isAuthenticated = true;
const userProfile = { name: 'John' };

// ✅ Constants : UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 10;

// ✅ Fonctions : camelCase, verbe d'action
function getUserById(id: string): User {}
function calculateTotal(items: Product[]): number {}
function validateEmail(email: string): boolean {}

// ✅ Handlers : prefix 'handle'
const handleClick = () => {};
const handleSubmit = (e: FormEvent) => {};
const handleChange = (value: string) => {};

// ✅ Boolean : prefix 'is', 'has', 'should', 'can'
const isLoading = false;
const hasError = false;
const shouldRender = true;
const canEdit = false;
```

### 3. Composants

```typescript
// ✅ Composants : PascalCase
export const UserProfile: FC<UserProfileProps> = (props) => {};

// ✅ Props interface : nom du composant + 'Props'
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// ✅ Hooks : camelCase avec prefix 'use'
export const useUserProfile = (userId: string) => {};

// ✅ Types : PascalCase
type User = {
  id: string;
  name: string;
};

// ✅ Interfaces : PascalCase (optionnel prefix 'I')
interface IUser {
  id: string;
  name: string;
}

// ✅ Enums : PascalCase
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
```

## Patterns de Composants

### 1. Functional Component avec TypeScript

```typescript
import { FC } from 'react';

// Interface des props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Composant fonctionnel avec FC
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

// Export avec displayName pour le debugging
Button.displayName = 'Button';
```

### 2. React.memo pour Performance

```typescript
import { FC, memo } from 'react';

interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
}

// Composant mémoïsé
export const UserCard: FC<UserCardProps> = memo(({ user, onSelect }) => {
  return (
    <div onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// Avec comparaison personnalisée
export const UserCardCustom: FC<UserCardProps> = memo(
  ({ user, onSelect }) => {
    return (
      <div onClick={() => onSelect(user.id)}>
        <h3>{user.name}</h3>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Retourner true si les props sont égales (ne pas re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 3. forwardRef pour Refs

```typescript
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Composant avec forwardRef
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

### 4. Compound Components

```typescript
import { FC, createContext, useContext, ReactNode } from 'react';

// Context pour partager l'état
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
};

// Composant parent
interface TabsProps {
  defaultTab: string;
  children: ReactNode;
}

export const Tabs: FC<TabsProps> & {
  List: typeof TabList;
  Tab: typeof Tab;
  Panel: typeof TabPanel;
} = ({ defaultTab, children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

// Sous-composants
const TabList: FC<{ children: ReactNode }> = ({ children }) => {
  return <div role="tablist">{children}</div>;
};

interface TabProps {
  value: string;
  children: ReactNode;
}

const Tab: FC<TabProps> = ({ value, children }) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabPanelProps {
  value: string;
  children: ReactNode;
}

const TabPanel: FC<TabPanelProps> = ({ value, children }) => {
  const { activeTab } = useTabs();

  if (activeTab !== value) return null;

  return <div role="tabpanel">{children}</div>;
};

// Attachement des sous-composants
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage
const App = () => (
  <Tabs defaultTab="tab1">
    <Tabs.List>
      <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
      <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
    <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
  </Tabs>
);
```

### 5. Render Props Pattern

```typescript
interface RenderPropsProps<T> {
  data: T[];
  isLoading: boolean;
  render: (data: T[]) => ReactNode;
  renderLoading?: () => ReactNode;
}

export function DataRenderer<T>({
  data,
  isLoading,
  render,
  renderLoading
}: RenderPropsProps<T>) {
  if (isLoading) {
    return <>{renderLoading?.() ?? <Spinner />}</>;
  }

  return <>{render(data)}</>;
}

// Usage
const App = () => {
  const { data, isLoading } = useUsers();

  return (
    <DataRenderer
      data={data}
      isLoading={isLoading}
      render={users => (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
      renderLoading={() => <div>Loading users...</div>}
    />
  );
};
```

## Gestion des Props

### 1. Props Destructuring

```typescript
// ✅ Bon - Destructuration dans les paramètres
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...rest
}) => {
  return <button className={`btn-${variant} btn-${size}`} {...rest}>{children}</button>;
};

// ❌ Mauvais - Accès via props.
export const Button: FC<ButtonProps> = (props) => {
  return (
    <button className={`btn-${props.variant}`}>
      {props.children}
    </button>
  );
};
```

### 2. Rest Props

```typescript
// Étendre les props HTML natives
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ variant, children, ...rest }) => {
  return (
    <button className={`btn-${variant}`} {...rest}>
      {children}
    </button>
  );
};

// Usage - tous les attributs HTML standards fonctionnent
<Button variant="primary" onClick={handleClick} disabled aria-label="Submit">
  Submit
</Button>
```

### 3. Required vs Optional Props

```typescript
// Props optionnelles avec '?'
interface UserProfileProps {
  userId: string;           // Required
  showEmail?: boolean;      // Optional
  onUpdate?: (user: User) => void;  // Optional
  className?: string;       // Optional
}

// Avec valeurs par défaut
export const UserProfile: FC<UserProfileProps> = ({
  userId,
  showEmail = false,
  onUpdate,
  className = ''
}) => {
  // ...
};
```

## Structure des Fichiers de Composants

### Composant Simple

```
Button/
├── Button.tsx          # Composant principal
├── Button.test.tsx     # Tests
├── Button.stories.tsx  # Storybook
└── index.ts            # Export
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

### Composant Complexe

```
DataTable/
├── DataTable.tsx              # Composant principal
├── DataTable.test.tsx         # Tests
├── DataTable.stories.tsx      # Storybook
├── DataTable.types.ts         # Types
├── components/                # Sous-composants
│   ├── TableHeader.tsx
│   ├── TableRow.tsx
│   └── TablePagination.tsx
├── hooks/                     # Hooks locaux
│   ├── useTableSort.ts
│   └── useTablePagination.ts
└── index.ts                   # Exports
```

## Documentation avec JSDoc/TSDoc

### Documenter les Composants

```typescript
/**
 * Bouton personnalisé avec différentes variantes visuelles.
 *
 * @remarks
 * Ce composant étend les props natives de HTMLButtonElement,
 * permettant l'utilisation de tous les attributs HTML standards.
 *
 * @example
 * ```tsx
 * // Bouton primaire
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * // Bouton désactivé
 * <Button variant="secondary" disabled>
 *   Disabled
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, children, ...rest }) => {
  return <button className={`btn-${variant}`} {...rest}>{children}</button>;
};
```

### Documenter les Hooks

```typescript
/**
 * Hook personnalisé pour gérer l'authentification utilisateur.
 *
 * @returns Objet contenant l'état d'authentification et les méthodes
 *
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 *
 * const handleLogin = async () => {
 *   await login({ email, password });
 * };
 * ```
 *
 * @throws {AuthError} Si les credentials sont invalides
 */
export const useAuth = (): UseAuthReturn => {
  // Implementation
};
```

### Documenter les Types

```typescript
/**
 * Représente un utilisateur dans le système.
 */
export interface User {
  /** Identifiant unique de l'utilisateur */
  id: string;

  /** Nom complet de l'utilisateur */
  name: string;

  /** Adresse email (doit être unique) */
  email: string;

  /** Rôle de l'utilisateur dans le système */
  role: UserRole;

  /**
   * Date de création du compte
   * @format ISO 8601
   */
  createdAt: string;
}
```

## Bonnes Pratiques Générales

### 1. Un composant = Un fichier

```typescript
// ❌ Mauvais - Plusieurs composants dans un fichier
export const Button = () => {};
export const Input = () => {};
export const Form = () => {};

// ✅ Bon - Un composant par fichier
// Button.tsx
export const Button = () => {};

// Input.tsx
export const Input = () => {};
```

### 2. Éviter les Any

```typescript
// ❌ Mauvais
const handleData = (data: any) => {
  console.log(data.name);
};

// ✅ Bon
interface Data {
  name: string;
}

const handleData = (data: Data) => {
  console.log(data.name);
};

// ✅ Bon - Si vraiment nécessaire, documenter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUnknown = (data: any) => {
  // Raison d'utiliser any...
};
```

### 3. Exports Nommés vs Default

```typescript
// ✅ Préférer les exports nommés
export const Button = () => {};
export const Input = () => {};

// ❌ Éviter les exports default (sauf pour les pages/routes)
export default Button;
```

### 4. Imports Groupés et Ordonnés

```typescript
// 1. React et bibliothèques externes
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports internes absolus
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Imports relatifs
import { UserCard } from './UserCard';

// 4. Types
import type { User } from '@/types/user.types';

// 5. Styles et assets
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

## Conclusion

Les standards de codage assurent :

1. ✅ Cohérence du code dans toute l'équipe
2. ✅ Meilleure maintenabilité
3. ✅ Réduction des bugs
4. ✅ Facilitation des code reviews
5. ✅ Onboarding plus rapide des nouveaux développeurs

**Règle d'or** : Le code doit être écrit pour être lu par des humains, pas seulement exécuté par des machines.
