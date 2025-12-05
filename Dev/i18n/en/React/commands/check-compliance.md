# Standards Compliance Check

Verify that the React project follows established coding standards and best practices.

## What This Command Does

1. **Standards Verification**
   - Check coding conventions
   - Verify naming conventions
   - Validate file organization
   - Check import order
   - Verify documentation standards

2. **Compliance Areas**
   - TypeScript best practices
   - React patterns
   - CSS/Styling conventions
   - Testing standards
   - Git commit conventions

3. **Generated Report**
   - Non-compliant files
   - Severity levels
   - Remediation recommendations
   - Compliance score

## Coding Standards

### 1. Naming Conventions

```typescript
// ✅ Components: PascalCase
export const UserProfile: FC = () => {};
export const DashboardHeader: FC = () => {};

// ✅ Functions/variables: camelCase
const getUserData = () => {};
const isAuthenticated = true;

// ✅ Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// ✅ Types/Interfaces: PascalCase
interface User {}
type UserRole = 'admin' | 'user';

// ✅ Files: kebab-case or PascalCase
// components/user-profile.tsx or UserProfile.tsx
// utils/format-date.ts or formatDate.ts
```

### 2. File Organization

```typescript
// ✅ Good - Proper organization
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

### 3. Import Order

```typescript
// ✅ Good - Organized imports
// 1. External dependencies
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { UserListItem } from './UserListItem';
import { formatDate } from '../utils';

// 4. Type imports
import type { User } from '@/types';

// 5. CSS imports
import './styles.css';
```

### 4. Component Structure

```typescript
// ✅ Good - Standard structure
import { FC } from 'react';
import type { UserProfileProps } from './types';
import styles from './UserProfile.module.css';

/**
 * UserProfile component displays user information
 * @param user - User data to display
 * @param onEdit - Callback when edit button is clicked
 */
export const UserProfile: FC<UserProfileProps> = ({ user, onEdit }) => {
  // 1. Hooks
  const [isEditing, setIsEditing] = useState(false);

  // 2. Derived state
  const displayName = user.firstName + ' ' + user.lastName;

  // 3. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.();
  };

  // 4. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 5. Render
  return (
    <div className={styles.container}>
      <h2>{displayName}</h2>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
};
```

## TypeScript Standards

### 1. Strict Type Safety

```typescript
// ❌ Bad - any usage
const data: any = fetchData();
const handleClick = (event: any) => {};

// ✅ Good - Proper types
interface ApiResponse<T> {
  data: T;
  status: number;
}

const data: ApiResponse<User> = fetchData();
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {};
```

### 2. Type Definitions

```typescript
// ✅ Good - Proper type definitions
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

### 3. Prop Types

```typescript
// ✅ Good - Explicit prop types
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

## React Standards

### 1. Hooks Rules

```typescript
// ✅ Good - Hooks at top level
export const MyComponent: FC = () => {
  const [state, setState] = useState(0);
  const data = useQuery(/*...*/);

  // ❌ Bad - Conditional hook
  if (condition) {
    const [value] = useState(0); // ERROR!
  }

  return <div>{state}</div>;
};
```

### 2. Key Prop

```typescript
// ❌ Bad - Index as key
{items.map((item, index) => (
  <div key={index}>{item}</div>
))}

// ✅ Good - Stable unique ID
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

### 3. Event Handlers

```typescript
// ❌ Bad - Inline arrow function
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Good - Memoized callback
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);

<button onClick={handleButtonClick}>Click</button>
```

## Testing Standards

### 1. Test File Naming

```
UserProfile.tsx
UserProfile.test.tsx    ✅
UserProfile.spec.tsx    ✅
```

### 2. Test Structure

```typescript
// ✅ Good - AAA Pattern
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

### 3. Test Coverage

```typescript
// Minimum coverage targets
{
  "coverage": {
    "lines": 80,
    "functions": 80,
    "branches": 75,
    "statements": 80
  }
}
```

## CSS/Styling Standards

### 1. CSS Modules

```typescript
// ✅ Good - CSS Modules
import styles from './Component.module.css';

export const Component = () => {
  return <div className={styles.container}>{/*...*/}</div>;
};
```

### 2. Tailwind CSS

```typescript
// ✅ Good - Organized classes
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  {/*...*/}
</div>

// ✅ Good - Use cn utility
import { cn } from '@/utils/cn';

<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-800'
)}>
  {children}
</button>
```

## Git Standards

### 1. Commit Messages

```bash
# ✅ Good - Conventional Commits
feat: add user profile page
fix: resolve authentication bug
docs: update README
chore: update dependencies
test: add tests for UserList component

# Format: <type>(<scope>): <subject>
feat(auth): implement login flow
fix(users): fix pagination bug
```

### 2. Branch Naming

```bash
# ✅ Good - Descriptive names
feature/user-authentication
bugfix/fix-login-error
hotfix/security-patch
refactor/simplify-user-service
```

## Documentation Standards

### 1. JSDoc Comments

```typescript
/**
 * Formats a date string into a readable format
 * @param date - The date to format
 * @param format - The desired format (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'DD/MM/YYYY') // '25/12/2024'
 */
export const formatDate = (date: Date, format = 'YYYY-MM-DD'): string => {
  // Implementation
};
```

### 2. Component Documentation

```typescript
/**
 * Button component with multiple variants
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

## Automated Compliance

### ESLint Configuration

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

### Prettier Configuration

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

## Compliance Checklist

- [ ] Naming conventions followed
- [ ] Files properly organized
- [ ] Imports properly ordered
- [ ] TypeScript strict mode enabled
- [ ] No `any` types used
- [ ] All props properly typed
- [ ] React Hooks rules followed
- [ ] Tests follow AAA pattern
- [ ] Test coverage > 80%
- [ ] CSS organized (modules/Tailwind)
- [ ] Commits follow conventions
- [ ] Components documented
- [ ] ESLint passes without errors
- [ ] Prettier formatting applied

## Tools

- ESLint for code linting
- Prettier for formatting
- TypeScript for type checking
- Husky for pre-commit hooks
- Commitlint for commit messages

## Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)
