---
description: Generar Componente
---

# Generar Componente

Genera un componente React funcional con TypeScript, incluyendo tests y storybook.

## Uso

```bash
# Generar componente basico
generate-component Button

# Generar en ubicacion especifica
generate-component Button --path src/components/ui

# Con variantes
generate-component Button --variants

# Con tests y storybook
generate-component Button --with-tests --with-storybook
```

## Estructura del Componente Generado

```
Button/
├── Button.tsx              # Componente principal
├── Button.test.tsx         # Tests unitarios
├── Button.stories.tsx      # Historias de Storybook
├── Button.module.css       # Estilos (si se usa CSS modules)
├── types.ts                # Definiciones de tipos
└── index.ts                # Exportaciones
```

## Template: Componente Basico

```typescript
// Button.tsx
import { FC, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante visual del boton
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /**
   * Tamano del boton
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Mostrar estado de carga
   */
  isLoading?: boolean;
}

/**
 * Componente Button con multiples variantes y tamanos
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        isLoading && styles.loading,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

## Template: Con Variantes (CVA)

```typescript
// Button.tsx
import { FC, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 hover:bg-gray-100',
        ghost: 'hover:bg-gray-100'
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg'
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
      {isLoading ? <Spinner size={size} /> : children}
    </button>
  );
};
```

## Template: Tests

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('primary');
  });

  it('should show loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

## Template: Storybook

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...'
  }
};
```

## Tipos de Componentes

### Atom (Atomico)

```typescript
// Componente basico, reutilizable, sin logica de negocio
export const Badge: FC<BadgeProps> = ({ children, variant }) => {
  return <span className={cn('badge', variant)}>{children}</span>;
};
```

### Molecule (Molecula)

```typescript
// Combina multiples atomos
export const SearchInput: FC<SearchInputProps> = ({ onSearch }) => {
  return (
    <div className="search-input">
      <Input placeholder="Search..." />
      <Button onClick={onSearch}>
        <SearchIcon />
      </Button>
    </div>
  );
};
```

### Organism (Organismo)

```typescript
// Componente complejo con logica de negocio
export const UserCard: FC<UserCardProps> = ({ user }) => {
  const { updateUser, deleteUser } = useUserActions();

  return (
    <Card>
      <Avatar src={user.avatar} />
      <UserInfo user={user} />
      <UserActions onEdit={updateUser} onDelete={deleteUser} />
    </Card>
  );
};
```

## Index File

```typescript
// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

## Mejores Practicas

### 1. Props Tipadas

```typescript
// ✅ BIEN - Props explicitas
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

// ❌ MAL - Props sin tipo
const Button = (props: any) => {};
```

### 2. Valores Predeterminados

```typescript
// ✅ BIEN - Valores predeterminados claros
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // ...
};
```

### 3. Documentacion

```typescript
/**
 * Componente Button con soporte para multiples variantes
 *
 * @param variant - Estilo visual ('primary' | 'secondary')
 * @param size - Tamano del boton ('sm' | 'md' | 'lg')
 * @param isLoading - Mostrar estado de carga
 */
```

### 4. Accesibilidad

```typescript
<button
  aria-label="Close dialog"
  aria-disabled={isLoading}
  role="button"
>
  {children}
</button>
```

## Comando CLI Personalizado

```typescript
// scripts/generate-component.ts
import fs from 'fs';
import path from 'path';

const componentName = process.argv[2];
const componentPath = process.argv[3] || 'src/components';

const templates = {
  component: `...`,
  test: `...`,
  stories: `...`
};

// Crear directorio
const dir = path.join(componentPath, componentName);
fs.mkdirSync(dir, { recursive: true });

// Generar archivos
Object.entries(templates).forEach(([type, template]) => {
  const fileName = `${componentName}.${type === 'component' ? 'tsx' : `${type}.tsx`}`;
  fs.writeFileSync(path.join(dir, fileName), template);
});

console.log(`✅ Componente ${componentName} generado en ${dir}`);
```

## Recursos

- [React Component Patterns](https://www.patterns.dev/posts/react-component-patterns)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
