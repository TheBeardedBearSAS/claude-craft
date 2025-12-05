# Coding-Standards für React

## Namenskonventionen

### Komponenten

```typescript
// ✅ GUT - PascalCase für Komponenten
export const UserProfile: FC = () => { };
export const LoginForm: FC = () => { };

// ❌ SCHLECHT
export const userProfile: FC = () => { };
export const login_form: FC = () => { };
```

### Hooks

```typescript
// ✅ GUT - camelCase mit "use"-Präfix
export const useAuth = () => { };
export const useLocalStorage = () => { };

// ❌ SCHLECHT
export const Auth = () => { };
export const localStorage = () => { };
```

### Constants

```typescript
// ✅ GUT - SCREAMING_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com';
export const MAX_RETRY_ATTEMPTS = 3;

// ❌ SCHLECHT
export const apiBaseUrl = 'https://api.example.com';
export const maxRetryAttempts = 3;
```

### Files und Ordner

```typescript
// Komponenten: PascalCase
Button.tsx
UserProfile.tsx

// Hooks: camelCase
useAuth.ts
useLocalStorage.ts

// Utils: camelCase
formatDate.ts
validators.ts

// Konstanten: camelCase oder kebab-case
constants.ts
api-config.ts
```

## TypeScript Best Practices

### Strikte Typisierung

```typescript
// ✅ GUT - Explizite Typen
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};

// ❌ SCHLECHT - any oder fehlende Typen
const fetchUser = async (id) => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};
```

### Type vs Interface

```typescript
// ✅ Interface für Objekt-Shapes (erweiterbar)
interface User {
  id: string;
  name: string;
}

interface Employee extends User {
  department: string;
}

// ✅ Type für Unions, Intersections, Primitives
type Status = 'pending' | 'approved' | 'rejected';
type ID = string | number;
type UserWithRole = User & { role: string };

// ❌ SCHLECHT - Inkonsistente Nutzung
type User = {  // Sollte interface sein
  id: string;
};
```

### Generics

```typescript
// ✅ GUT - Wiederverwendbare generische Funktionen
function useAsync<T>(
  asyncFn: () => Promise<T>
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
} {
  // Implementation
}

// Nutzung
const { data, error, isLoading } = useAsync<User[]>(fetchUsers);
```

## Komponenten-Standards

### Props-Definitionen

```typescript
// ✅ GUT - Interface mit Dokumentation
/**
 * User-Karten-Komponente zur Anzeige von Benutzerinformationen
 */
interface UserCardProps {
  /**
   * Anzuzeigender Benutzer
   */
  user: User;

  /**
   * Callback bei Klick auf Bearbeiten
   */
  onEdit?: (user: User) => void;

  /**
   * Zusätzliche CSS-Klassen
   */
  className?: string;
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit, className }) => {
  // Implementation
};
```

### Default Props

```typescript
// ✅ GUT - Default-Werte in Destrukturierung
export const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  disabled = false,
  children
}) => {
  // Implementation
};

// ❌ VERMEIDEN - defaultProps (veraltet)
Button.defaultProps = {
  variant: 'default',
  size: 'md'
};
```

### Event Handler

```typescript
// ✅ GUT - Konsistente Benennung
const handleClick = () => { };
const handleSubmit = () => { };
const handleChange = () => { };

// Props
interface Props {
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
  onChange?: (value: string) => void;
}
```

## Hooks-Standards

### Hook-Reihenfolge

```typescript
export const MyComponent: FC = () => {
  // 1. State Hooks
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // 2. Context Hooks
  const { user } = useAuth();
  const theme = useTheme();

  // 3. Custom Hooks
  const { data, isLoading } = useUsers();

  // 4. Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 5. useMemo / useCallback
  const expensiveValue = useMemo(() => computeExpensiveValue(count), [count]);
  const handleClick = useCallback(() => {}, []);

  // 6. useEffect
  useEffect(() => {
    // Side effects
  }, []);

  // Render
  return <div>{count}</div>;
};
```

### Custom Hooks

```typescript
// ✅ GUT - Klare API, mit TypeScript
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
};

// Nutzung
const [user, setUser] = useLocalStorage<User>('user', null);
```

## Code-Organisation

### Imports-Reihenfolge

```typescript
// 1. React imports
import { FC, useState, useEffect } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Interne absolute imports
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

// 4. Relative imports
import { helper } from './utils';

// 5. Types
import type { User } from '@/types/user.types';

// 6. Styles (falls nötig)
import styles from './Component.module.css';
```

### Exports

```typescript
// ✅ GUT - Named exports (bevorzugt)
export const Button: FC = () => { };
export const Input: FC = () => { };

// ✅ Barrel exports
// components/atoms/index.ts
export { Button } from './Button';
export { Input } from './Input';

// ❌ VERMEIDEN - Default exports (außer für Pages)
export default Button;
```

## Code-Formatierung

### Prettier-Konfiguration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 90,
  "trailingComma": "none",
  "arrowParens": "avoid"
}
```

### ESLint-Regeln

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

## Kommentare und Dokumentation

### JSDoc für Public APIs

```typescript
/**
 * Berechnet das Alter basierend auf dem Geburtsdatum
 *
 * @param birthDate - Geburtsdatum des Benutzers
 * @returns Alter in Jahren
 *
 * @example
 * \`\`\`ts
 * const age = calculateAge(new Date('1990-01-01'));
 * console.log(age); // 34
 * \`\`\`
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
```

### Inline-Kommentare

```typescript
// ✅ GUT - Erklärt das "Warum"
// Verwende requestAnimationFrame um Layout-Thrashing zu vermeiden
const optimizedScroll = () => {
  requestAnimationFrame(() => {
    updateScrollPosition();
  });
};

// ❌ SCHLECHT - Erklärt das "Was" (offensichtlich)
// Inkrementiere den Zähler um 1
count++;
```

## Best Practices

### 1. Komponenten klein halten

```typescript
// ✅ GUT - Einzelne Verantwortlichkeit
export const UserAvatar: FC<{ user: User }> = ({ user }) => (
  <img src={user.avatar} alt={user.name} />
);

export const UserInfo: FC<{ user: User }> = ({ user }) => (
  <div>
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </div>
);

// ❌ SCHLECHT - Zu viel in einer Komponente
export const UserCard: FC<{ user: User }> = ({ user }) => (
  <div>
    <img src={user.avatar} alt={user.name} />
    <h3>{user.name}</h3>
    <p>{user.email}</p>
    {/* Noch 100 weitere Zeilen... */}
  </div>
);
```

### 2. Early Returns

```typescript
// ✅ GUT - Guard Clauses
export const UserProfile: FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return <div>{user.name}</div>;
};

// ❌ SCHLECHT - Verschachtelte Conditionals
export const UserProfile: FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading, error } = useUser(userId);

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : user ? (
        <div>{user.name}</div>
      ) : (
        <NotFound />
      )}
    </div>
  );
};
```

### 3. Destructuring

```typescript
// ✅ GUT - Props destrukturieren
export const Button: FC<ButtonProps> = ({ variant, size, children }) => {
  return <button className={\`btn-\${variant} btn-\${size}\`}>{children}</button>;
};

// ❌ SCHLECHT
export const Button: FC<ButtonProps> = (props) => {
  return (
    <button className={\`btn-\${props.variant} btn-\${props.size}\`}>
      {props.children}
    </button>
  );
};
```

## Checkliste

```markdown
## Code-Qualität
- [ ] Keine ESLint-Fehler oder -Warnungen
- [ ] Alle Dateien mit Prettier formatiert
- [ ] TypeScript strict mode aktiviert
- [ ] Keine `any`-Types

## Namenskonventionen
- [ ] Komponenten in PascalCase
- [ ] Hooks mit "use"-Präfix in camelCase
- [ ] Konstanten in SCREAMING_SNAKE_CASE
- [ ] Dateien konsistent benannt

## Dokumentation
- [ ] JSDoc für öffentliche APIs
- [ ] Props dokumentiert
- [ ] Komplexe Logik kommentiert
- [ ] README aktuell

## Best Practices
- [ ] Komponenten klein und fokussiert
- [ ] Early returns verwendet
- [ ] Props destrukturiert
- [ ] Imports organisiert
```

## Fazit

Konsistente Coding-Standards ermöglichen:

1. ✅ **Lesbarkeit**: Code ist leicht zu verstehen
2. ✅ **Wartbarkeit**: Änderungen sind einfach
3. ✅ **Teamwork**: Einheitlicher Code-Stil
4. ✅ **Qualität**: Weniger Bugs
5. ✅ **Onboarding**: Neue Entwickler schneller produktiv

**Goldene Regel**: Code wird öfter gelesen als geschrieben.
