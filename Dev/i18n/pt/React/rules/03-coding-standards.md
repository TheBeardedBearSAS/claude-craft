# Padrões de Codificação React TypeScript

## Modo Estrito do TypeScript

### Configuração do tsconfig.json

```json
{
  "compilerOptions": {
    // Opções de Verificação de Tipo Estrita
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Verificações Adicionais
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Resolução de Módulos
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "esModuleInterop": true,

    // Emissão
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,

    // React
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020",
    "module": "ESNext",

    // Caminhos
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Regras TypeScript Estritas

#### 1. Tipos Explícitos

```typescript
// ❌ Ruim - Tipo 'any' implícito
const handleClick = (event) => {
  console.log(event.target);
};

// ✅ Bom - Tipo explícito
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget);
};

// ❌ Ruim - Tipo de retorno implícito
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Bom - Tipos explícitos
function calculateTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 2. Segurança com Null

```typescript
// ❌ Ruim - Sem verificação de null
function getUserName(user: User) {
  return user.profile.name; // Erro se profile for null
}

// ✅ Bom - Encadeamento opcional
function getUserName(user: User): string {
  return user.profile?.name ?? 'Anônimo';
}

// ✅ Bom - Cláusula de guarda
function getUserName(user: User): string {
  if (!user.profile) {
    return 'Anônimo';
  }
  return user.profile.name;
}
```

#### 3. Tipos Union e Type Guards

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

## Configuração do ESLint

### Instalação

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-plugin-jsx-a11y eslint-plugin-import
npm install -D eslint-config-prettier
```

### Configuração do .eslintrc.cjs

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

    // Geral
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

## Configuração do Prettier

### Instalação

```bash
npm install -D prettier
```

### Configuração do .prettierrc

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

## Convenções de Nomenclatura

### 1. Arquivos

```
✅ Componentes React: PascalCase
- UserProfile.tsx
- LoginForm.tsx
- DataTable.tsx

✅ Hooks: camelCase com prefixo 'use'
- useAuth.ts
- useLocalStorage.ts
- useDebounce.ts

✅ Utilitários: camelCase
- formatDate.ts
- validateEmail.ts
- calculateTotal.ts

✅ Constantes: UPPER_SNAKE_CASE
- API_ENDPOINTS.ts
- VALIDATION_RULES.ts
- ERROR_MESSAGES.ts

✅ Tipos: PascalCase com sufixo '.types'
- User.types.ts
- Product.types.ts
- api.types.ts

✅ Serviços: camelCase com sufixo '.service'
- auth.service.ts
- user.service.ts
- api.service.ts

✅ Testes: mesmo nome + '.test' ou '.spec'
- UserProfile.test.tsx
- useAuth.test.ts
- formatDate.spec.ts
```

### 2. Variáveis e Funções

```typescript
// ✅ Variáveis: camelCase
const userName = 'João';
const isAuthenticated = true;
const userProfile = { name: 'João' };

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 10;

// ✅ Funções: camelCase, verbo de ação
function getUserById(id: string): User {}
function calculateTotal(items: Product[]): number {}
function validateEmail(email: string): boolean {}

// ✅ Handlers: prefixo 'handle'
const handleClick = () => {};
const handleSubmit = (e: FormEvent) => {};
const handleChange = (value: string) => {};

// ✅ Booleanos: prefixo 'is', 'has', 'should', 'can'
const isLoading = false;
const hasError = false;
const shouldRender = true;
const canEdit = false;
```

### 3. Componentes

```typescript
// ✅ Componentes: PascalCase
export const UserProfile: FC<UserProfileProps> = (props) => {};

// ✅ Interface de props: nome do componente + 'Props'
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// ✅ Hooks: camelCase com prefixo 'use'
export const useUserProfile = (userId: string) => {};

// ✅ Tipos: PascalCase
type User = {
  id: string;
  name: string;
};

// ✅ Interfaces: PascalCase (prefixo 'I' opcional)
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

## Padrões de Componentes

### 1. Componente Funcional com TypeScript

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

// Componente funcional com FC
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

// Exportar com displayName para depuração
Button.displayName = 'Button';
```

### 2. React.memo para Performance

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

// Com comparação personalizada
export const UserCardCustom: FC<UserCardProps> = memo(
  ({ user, onSelect }) => {
    return (
      <div onClick={() => onSelect(user.id)}>
        <h3>{user.name}</h3>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Retornar true se as props forem iguais (sem re-renderização)
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

// Componente com forwardRef
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

  return <Input ref={inputRef} label="Nome" />;
};
```

## Estrutura de Arquivo de Componente

### Componente Simples

```
Button/
├── Button.tsx          # Componente principal
├── Button.test.tsx     # Testes
├── Button.stories.tsx  # Storybook
└── index.ts            # Exportações
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

## Documentação JSDoc/TSDoc

### Documentando Componentes

```typescript
/**
 * Botão personalizado com diferentes variantes visuais.
 *
 * @remarks
 * Este componente estende as props nativas do HTMLButtonElement,
 * permitindo o uso de todos os atributos HTML padrão.
 *
 * @example
 * ```tsx
 * // Botão primário
 * <Button variant="primary" onClick={handleClick}>
 *   Clique em mim
 * </Button>
 *
 * // Botão desabilitado
 * <Button variant="secondary" disabled>
 *   Desabilitado
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, children, ...rest }) => {
  return <button className={`btn-${variant}`} {...rest}>{children}</button>;
};
```

## Melhores Práticas Gerais

### 1. Um Componente = Um Arquivo

```typescript
// ❌ Ruim - Múltiplos componentes em um arquivo
export const Button = () => {};
export const Input = () => {};
export const Form = () => {};

// ✅ Bom - Um componente por arquivo
// Button.tsx
export const Button = () => {};

// Input.tsx
export const Input = () => {};
```

### 2. Evitar Any

```typescript
// ❌ Ruim
const handleData = (data: any) => {
  console.log(data.name);
};

// ✅ Bom
interface Data {
  name: string;
}

const handleData = (data: Data) => {
  console.log(data.name);
};

// ✅ Bom - Se realmente necessário, documente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUnknown = (data: any) => {
  // Razão para usar any...
};
```

### 3. Exportações Nomeadas vs Default

```typescript
// ✅ Preferir exportações nomeadas
export const Button = () => {};
export const Input = () => {};

// ❌ Evitar exportações default (exceto para páginas/rotas)
export default Button;
```

### 4. Imports Agrupados e Ordenados

```typescript
// 1. React e bibliotecas externas
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports internos absolutos
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Imports relativos
import { UserCard } from './UserCard';

// 4. Tipos
import type { User } from '@/types/user.types';

// 5. Estilos e assets
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

## Conclusão

Os padrões de codificação garantem:

1. ✅ Consistência do código em toda a equipe
2. ✅ Melhor manutenibilidade
3. ✅ Redução de bugs
4. ✅ Revisões de código mais fáceis
5. ✅ Integração mais rápida de novos desenvolvedores

**Regra de ouro**: O código deve ser escrito para ser lido por humanos, não apenas executado por máquinas.
