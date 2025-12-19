---
description: Verificacion de Cumplimiento de Estandares
---

# Verificacion de Cumplimiento de Estandares

Verifica que el proyecto React siga los estandares de codificacion y mejores practicas establecidas.

## Que Hace Este Comando

1. **Verificacion de Estandares**
   - Verificar convenciones de codificacion
   - Verificar convenciones de nomenclatura
   - Validar organizacion de archivos
   - Verificar orden de importaciones
   - Verificar estandares de documentacion

2. **Areas de Cumplimiento**
   - Mejores practicas de TypeScript
   - Patrones de React
   - Convenciones CSS/Estilos
   - Estandares de testing
   - Convenciones de commits Git

3. **Informe Generado**
   - Archivos no conformes
   - Niveles de severidad
   - Recomendaciones de remediacion
   - Puntuacion de cumplimiento

## Estandares de Codificacion

### 1. Convenciones de Nomenclatura

```typescript
// ✅ Componentes: PascalCase
export const UserProfile: FC = () => {};
export const DashboardHeader: FC = () => {};

// ✅ Funciones/variables: camelCase
const getUserData = () => {};
const isAuthenticated = true;

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// ✅ Tipos/Interfaces: PascalCase
interface User {}
type UserRole = 'admin' | 'user';

// ✅ Archivos: kebab-case o PascalCase
// components/user-profile.tsx o UserProfile.tsx
// utils/format-date.ts o formatDate.ts
```

### 2. Organizacion de Archivos

```typescript
// ✅ Bien - Organizacion apropiada
src/
├── features/
│   └── users/
│       ├── components/
│       │   ├── UserList.tsx
│       │   ├── UserList.test.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useUsers.ts
│       │   └── useUsers.test.ts
│       └── types/
│           └── user.types.ts
```

### 3. Orden de Importaciones

```typescript
// ✅ Bien - Importaciones organizadas
// 1. Dependencias externas
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Importaciones absolutas internas
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

// 3. Importaciones relativas
import { UserListItem } from './UserListItem';
import { formatDate } from '../utils';

// 4. Importaciones de tipos
import type { User } from '@/types';

// 5. Importaciones CSS
import './styles.css';
```

### 4. Estructura de Componentes

```typescript
// ✅ Bien - Estructura estandar
import { FC } from 'react';
import type { UserProfileProps } from './types';
import styles from './UserProfile.module.css';

/**
 * Componente UserProfile muestra informacion del usuario
 * @param user - Datos del usuario a mostrar
 * @param onEdit - Callback cuando se hace clic en editar
 */
export const UserProfile: FC<UserProfileProps> = ({ user, onEdit }) => {
  // 1. Hooks
  const [isEditing, setIsEditing] = useState(false);

  // 2. Estado derivado
  const displayName = user.firstName + ' ' + user.lastName;

  // 3. Manejadores de eventos
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.();
  };

  // 4. Efectos
  useEffect(() => {
    // Efectos secundarios
  }, []);

  // 5. Renderizado
  return (
    <div className={styles.container}>
      <h2>{displayName}</h2>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
};
```

## Estandares TypeScript

### 1. Seguridad de Tipos Estricta

```typescript
// ❌ Mal - uso de any
const data: any = fetchData();
const handleClick = (event: any) => {};

// ✅ Bien - Tipos apropiados
interface ApiResponse<T> {
  data: T;
  status: number;
}

const data: ApiResponse<User> = fetchData();
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {};
```

### 2. Definiciones de Tipos

```typescript
// ✅ Bien - Definiciones de tipos apropiadas
// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}
```

### 3. Tipos de Props

```typescript
// ✅ Bien - Tipos de props explicitos
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  return <button {...props}>{children}</button>;
};
```

## Estandares React

### 1. Reglas de Hooks

```typescript
// ✅ Bien - Hooks en nivel superior
export const MyComponent: FC = () => {
  const [state, setState] = useState(0);
  const data = useQuery(/*...*/);

  // ❌ Mal - Hook condicional
  if (condition) {
    const [value] = useState(0); // ERROR!
  }

  return <div>{state}</div>;
};
```

### 2. Prop Key

```typescript
// ❌ Mal - Indice como key
{items.map((item, index) => (
  <div key={index}>{item}</div>
))}

// ✅ Bien - ID unico estable
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

### 3. Manejadores de Eventos

```typescript
// ❌ Mal - Funcion flecha en linea
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Bien - Callback memorizado
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);

<button onClick={handleButtonClick}>Click</button>
```

## Estandares de Testing

### 1. Nomenclatura de Archivos de Test

```
UserProfile.tsx
UserProfile.test.tsx    ✅
UserProfile.spec.tsx    ✅
```

### 2. Estructura de Tests

```typescript
// ✅ Bien - Patron AAA
describe('UserProfile', () => {
  it('should display user name', () => {
    // Arrange
    const user = { id: '1', name: 'John Doe' };

    // Act
    render(<UserProfile user={user} />);

    // Assert
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 3. Cobertura de Tests

```typescript
// Objetivos minimos de cobertura
{
  "coverage": {
    "lines": 80,
    "functions": 80,
    "branches": 75,
    "statements": 80
  }
}
```

## Estandares CSS/Estilos

### 1. Modulos CSS

```typescript
// ✅ Bien - Modulos CSS
import styles from './Component.module.css';

export const Component = () => {
  return <div className={styles.container}>{/*...*/}</div>;
};
```

### 2. Tailwind CSS

```typescript
// ✅ Bien - Clases organizadas
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  {/*...*/}
</div>

// ✅ Bien - Usar utilidad cn
import { cn } from '@/utils/cn';

<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-800'
)}>
  {children}
</button>
```

## Estandares Git

### 1. Mensajes de Commit

```bash
# ✅ Bien - Conventional Commits
feat: add user profile page
fix: resolve authentication bug
docs: update README
chore: update dependencies
test: add tests for UserList component

# Formato: <type>(<scope>): <subject>
feat(auth): implement login flow
fix(users): fix pagination bug
```

### 2. Nomenclatura de Ramas

```bash
# ✅ Bien - Nombres descriptivos
feature/user-authentication
bugfix/fix-login-error
hotfix/security-patch
refactor/simplify-user-service
```

## Estandares de Documentacion

### 1. Comentarios JSDoc

```typescript
/**
 * Formatea una cadena de fecha en un formato legible
 * @param date - La fecha a formatear
 * @param format - El formato deseado (predeterminado: 'YYYY-MM-DD')
 * @returns Cadena de fecha formateada
 * @example
 * formatDate(new Date(), 'DD/MM/YYYY') // '25/12/2024'
 */
export const formatDate = (date: Date, format = 'YYYY-MM-DD'): string => {
  // Implementacion
};
```

### 2. Documentacion de Componentes

```typescript
/**
 * Componente Button con multiples variantes
 * @component
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};
```

## Cumplimiento Automatizado

### Configuracion ESLint

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/jsx-key": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

### Configuracion Prettier

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

## Lista de Verificacion de Cumplimiento

- [ ] Convenciones de nomenclatura seguidas
- [ ] Archivos organizados apropiadamente
- [ ] Importaciones ordenadas apropiadamente
- [ ] Modo estricto de TypeScript habilitado
- [ ] No se usan tipos `any`
- [ ] Todas las props tienen tipos apropiados
- [ ] Reglas de React Hooks seguidas
- [ ] Tests siguen patron AAA
- [ ] Cobertura de tests > 80%
- [ ] CSS organizado (modulos/Tailwind)
- [ ] Commits siguen convenciones
- [ ] Componentes documentados
- [ ] ESLint pasa sin errores
- [ ] Formato Prettier aplicado

## Herramientas

- ESLint para linting de codigo
- Prettier para formato
- TypeScript para verificacion de tipos
- Husky para hooks pre-commit
- Commitlint para mensajes de commit

## Recursos

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Guia de Estilo React de Airbnb](https://github.com/airbnb/javascript/tree/master/react)
