# Generate React Component

Generate a new React component with TypeScript, tests, and styling boilerplate.

## What This Command Does

1. **Component Generation**
   - Create component file
   - Generate TypeScript interfaces
   - Create test file
   - Create style file (CSS Module or styled-components)
   - Create Storybook story (optional)
   - Create index.ts barrel export

2. **Templates Used**
   - Functional component with TypeScript
   - Props interface
   - Basic tests structure
   - Style boilerplate

3. **Generated Files**
   ```
   src/components/ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.test.tsx
   ├── ComponentName.module.css
   ├── ComponentName.stories.tsx (optional)
   └── index.ts
   ```

## How to Use

```bash
# Generate component
npm run generate:component ComponentName

# With custom path
npm run generate:component features/users/components/UserCard

# With options
npm run generate:component ComponentName --story --styled
```

## Component Templates

### 1. Basic Component

```typescript
// ComponentName.tsx
import { FC } from 'react';
import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  /**
   * Description of prop
   */
  children?: React.ReactNode;
  className?: string;
}

/**
 * ComponentName component description
 *
 * @component
 * @example
 * <ComponentName>Content</ComponentName>
 */
export const ComponentName: FC<ComponentNameProps> = ({
  children,
  className
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {children}
    </div>
  );
};
```

### 2. With State

```typescript
// ComponentName.tsx
import { FC, useState } from 'react';
import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

export const ComponentName: FC<ComponentNameProps> = ({
  initialValue = '',
  onChange
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={styles.container}>
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};
```

### 3. Compound Component

```typescript
// Card.tsx
import { FC, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const Card: FC<CardProps> & {
  Header: FC<CardHeaderProps>;
  Body: FC<CardBodyProps>;
  Footer: FC<CardFooterProps>;
} = ({ children, className }) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      {children}
    </div>
  );
};

Card.Header = ({ children, className }) => {
  return (
    <div className={`${styles.header} ${className || ''}`}>
      {children}
    </div>
  );
};

Card.Body = ({ children, className }) => {
  return (
    <div className={`${styles.body} ${className || ''}`}>
      {children}
    </div>
  );
};

Card.Footer = ({ children, className }) => {
  return (
    <div className={`${styles.footer} ${className || ''}`}>
      {children}
    </div>
  );
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

## Test Template

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render children', () => {
    render(<ComponentName>Test Content</ComponentName>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ComponentName className="custom">Content</ComponentName>
    );

    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle interactions', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<ComponentName onClick={handleClick}>Click me</ComponentName>);

    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Style Templates

### CSS Modules

```css
/* ComponentName.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.header {
  font-size: 1.5rem;
  font-weight: bold;
}

.body {
  flex: 1;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
```

### Tailwind CSS

```typescript
// ComponentName.tsx
import { FC } from 'react';
import { cn } from '@/utils/cn';

export interface ComponentNameProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = ({
  children,
  variant = 'default',
  className
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 rounded-lg',
        {
          'bg-white': variant === 'default',
          'bg-blue-500 text-white': variant === 'primary',
          'bg-gray-200': variant === 'secondary'
        },
        className
      )}
    >
      {children}
    </div>
  );
};
```

## Storybook Template

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary']
    }
  }
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    children: 'Component Content'
  }
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Component'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Component'
  }
};
```

## Index Barrel Export

```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Generator Script

```typescript
// scripts/generate-component.ts
import fs from 'fs/promises';
import path from 'path';

interface GenerateComponentOptions {
  name: string;
  path?: string;
  withStory?: boolean;
  withStyled?: boolean;
}

async function generateComponent(options: GenerateComponentOptions) {
  const { name, path: componentPath = 'src/components' } = options;
  const dir = path.join(componentPath, name);

  // Create directory
  await fs.mkdir(dir, { recursive: true });

  // Generate component file
  await fs.writeFile(
    path.join(dir, `${name}.tsx`),
    getComponentTemplate(name)
  );

  // Generate test file
  await fs.writeFile(
    path.join(dir, `${name}.test.tsx`),
    getTestTemplate(name)
  );

  // Generate style file
  await fs.writeFile(
    path.join(dir, `${name}.module.css`),
    getStyleTemplate()
  );

  // Generate index file
  await fs.writeFile(
    path.join(dir, 'index.ts'),
    getIndexTemplate(name)
  );

  // Generate story if requested
  if (options.withStory) {
    await fs.writeFile(
      path.join(dir, `${name}.stories.tsx`),
      getStoryTemplate(name)
    );
  }

  console.log(`✅ Component ${name} created at ${dir}`);
}

// Run
const [,, name, ...args] = process.argv;
const options = {
  name,
  withStory: args.includes('--story'),
  withStyled: args.includes('--styled')
};

generateComponent(options);
```

## Usage Examples

### Simple Component

```bash
npm run generate:component Button
```

Generates:
```
src/components/Button/
├── Button.tsx
├── Button.test.tsx
├── Button.module.css
└── index.ts
```

### Feature Component with Story

```bash
npm run generate:component features/users/components/UserCard --story
```

Generates:
```
src/features/users/components/UserCard/
├── UserCard.tsx
├── UserCard.test.tsx
├── UserCard.module.css
├── UserCard.stories.tsx
└── index.ts
```

## Best Practices

1. **PascalCase** for component names
2. **Colocation** of related files
3. **TypeScript** interfaces for props
4. **JSDoc** comments for documentation
5. **Default exports** avoid (use named exports)
6. **Props interface** exported separately
7. **Test file** alongside component
8. **Barrel exports** for clean imports

## Component Patterns

### Presentational Component

```typescript
// Pure UI, no logic
export const UserCard: FC<UserCardProps> = ({ user }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

### Container Component

```typescript
// Logic and data fetching
export const UserCardContainer: FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;

  return <UserCard user={user} />;
};
```

### Higher-Order Component (HOC)

```typescript
// Wrapper pattern
export const withAuth = <P extends object>(
  Component: ComponentType<P>
) => {
  return (props: P) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <Component {...props} />;
  };
};
```

## Tools

- Plop.js for advanced generators
- Yeoman for scaffolding
- Custom Node.js scripts
- VS Code snippets

## Resources

- [React Component Patterns](https://react.dev/learn/your-first-component)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
