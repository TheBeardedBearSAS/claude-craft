---
description: Génération Composant React
argument-hint: [arguments]
---

# Génération Composant React

Tu es un développeur React senior. Tu dois générer un composant React complet avec TypeScript, tests unitaires, Storybook et documentation.

## Arguments
$ARGUMENTS

Arguments :
- Nom du composant (ex: `Button`, `UserCard`, `Modal`)
- (Optionnel) Type (presentational, container, form, layout)

Exemple : `/react:generate-component UserCard presentational`

## MISSION

### Étape 1 : Structure du Composant

```
src/
└── components/
    └── {ComponentName}/
        ├── index.ts
        ├── {ComponentName}.tsx
        ├── {ComponentName}.types.ts
        ├── {ComponentName}.styles.ts (ou .module.css)
        ├── {ComponentName}.test.tsx
        ├── {ComponentName}.stories.tsx
        └── hooks/ (optionnel)
            └── use{ComponentName}.ts
```

### Étape 2 : Types

```typescript
// src/components/{ComponentName}/{ComponentName}.types.ts
import { ReactNode, HTMLAttributes } from 'react';

export type {ComponentName}Variant = 'primary' | 'secondary' | 'outline';
export type {ComponentName}Size = 'sm' | 'md' | 'lg';

export interface {ComponentName}Props extends HTMLAttributes<HTMLDivElement> {
  /**
   * Le contenu du composant
   */
  children?: ReactNode;

  /**
   * Variante visuelle du composant
   * @default 'primary'
   */
  variant?: {ComponentName}Variant;

  /**
   * Taille du composant
   * @default 'md'
   */
  size?: {ComponentName}Size;

  /**
   * État de chargement
   * @default false
   */
  isLoading?: boolean;

  /**
   * État désactivé
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Callback au clic
   */
  onClick?: () => void;

  /**
   * Classe CSS additionnelle
   */
  className?: string;

  /**
   * ID pour les tests
   */
  testId?: string;
}
```

### Étape 3 : Composant

```tsx
// src/components/{ComponentName}/{ComponentName}.tsx
import { forwardRef, memo } from 'react';
import { clsx } from 'clsx';

import type { {ComponentName}Props } from './{ComponentName}.types';
import styles from './{ComponentName}.module.css';

/**
 * {ComponentName} - Description du composant
 *
 * @example
 * ```tsx
 * <{ComponentName} variant="primary" size="md">
 *   Contenu
 * </{ComponentName}>
 * ```
 */
export const {ComponentName} = memo(
  forwardRef<HTMLDivElement, {ComponentName}Props>(
    (
      {
        children,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        isDisabled = false,
        onClick,
        className,
        testId,
        ...rest
      },
      ref
    ) => {
      const handleClick = () => {
        if (!isDisabled && !isLoading && onClick) {
          onClick();
        }
      };

      return (
        <div
          ref={ref}
          className={clsx(
            styles.root,
            styles[variant],
            styles[size],
            {
              [styles.loading]: isLoading,
              [styles.disabled]: isDisabled,
            },
            className
          )}
          onClick={handleClick}
          data-testid={testId}
          aria-disabled={isDisabled}
          aria-busy={isLoading}
          {...rest}
        >
          {isLoading ? (
            <span className={styles.loader} aria-hidden="true" />
          ) : (
            children
          )}
        </div>
      );
    }
  )
);

{ComponentName}.displayName = '{ComponentName}';
```

### Étape 4 : Styles (CSS Modules)

```css
/* src/components/{ComponentName}/{ComponentName}.module.css */
.root {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

/* Variants */
.primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
}

.primary:hover:not(.disabled) {
  background-color: var(--color-primary-dark);
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.secondary:hover:not(.disabled) {
  background-color: var(--color-secondary-dark);
}

.outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.outline:hover:not(.disabled) {
  background-color: var(--color-primary-light);
}

/* Sizes */
.sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  position: relative;
  pointer-events: none;
}

.loader {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Focus */
.root:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### Étape 5 : Export

```typescript
// src/components/{ComponentName}/index.ts
export { {ComponentName} } from './{ComponentName}';
export type {
  {ComponentName}Props,
  {ComponentName}Variant,
  {ComponentName}Size,
} from './{ComponentName}.types';
```

### Étape 6 : Tests

```tsx
// src/components/{ComponentName}/{ComponentName}.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { {ComponentName} } from './{ComponentName}';

expect.extend(toHaveNoViolations);

describe('{ComponentName}', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<{ComponentName}>Test Content</{ComponentName}>);

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      render(<{ComponentName} testId="test-component">Content</{ComponentName}>);

      const component = screen.getByTestId('test-component');
      expect(component).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <{ComponentName} className="custom-class" testId="test-component">
          Content
        </{ComponentName}>
      );

      expect(screen.getByTestId('test-component')).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it.each(['primary', 'secondary', 'outline'] as const)(
      'renders %s variant correctly',
      (variant) => {
        const { container } = render(
          <{ComponentName} variant={variant}>Content</{ComponentName}>
        );

        expect(container.firstChild).toHaveClass(variant);
      }
    );
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)(
      'renders %s size correctly',
      (size) => {
        const { container } = render(
          <{ComponentName} size={size}>Content</{ComponentName}>
        );

        expect(container.firstChild).toHaveClass(size);
      }
    );
  });

  describe('States', () => {
    it('shows loading state', () => {
      render(<{ComponentName} isLoading>Content</{ComponentName}>);

      expect(screen.getByRole('generic')).toHaveAttribute('aria-busy', 'true');
    });

    it('shows disabled state', () => {
      render(<{ComponentName} isDisabled>Content</{ComponentName}>);

      expect(screen.getByRole('generic')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<{ComponentName} onClick={handleClick}>Click me</{ComponentName}>);

      await user.click(screen.getByText('Click me'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <{ComponentName} onClick={handleClick} isDisabled>
          Click me
        </{ComponentName}>
      );

      await user.click(screen.getByText('Click me'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <{ComponentName} onClick={handleClick} isLoading>
          Click me
        </{ComponentName}>
      );

      await user.click(screen.getByRole('generic'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <{ComponentName}>Accessible content</{ComponentName}>
      );

      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <{ComponentName} onClick={handleClick} tabIndex={0}>
          Content
        </{ComponentName}>
      );

      await user.tab();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null };

      render(<{ComponentName} ref={ref}>Content</{ComponentName}>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
```

### Étape 7 : Storybook

```tsx
// src/components/{ComponentName}/{ComponentName}.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import { {ComponentName} } from './{ComponentName}';

const meta: Meta<typeof {ComponentName}> = {
  title: 'Components/{ComponentName}',
  component: {ComponentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description du composant {ComponentName}.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'La variante visuelle du composant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'La taille du composant',
    },
    isLoading: {
      control: 'boolean',
      description: 'État de chargement',
    },
    isDisabled: {
      control: 'boolean',
      description: 'État désactivé',
    },
    onClick: {
      action: 'clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof {ComponentName}>;

// Stories de base
export const Default: Story = {
  args: {
    children: 'Default {ComponentName}',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// Tailles
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

// États
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading',
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    children: 'Disabled',
  },
};

// Playground - toutes les variantes
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <{ComponentName} variant="primary">Primary</{ComponentName}>
      <{ComponentName} variant="secondary">Secondary</{ComponentName}>
      <{ComponentName} variant="outline">Outline</{ComponentName}>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <{ComponentName} size="sm">Small</{ComponentName}>
      <{ComponentName} size="md">Medium</{ComponentName}>
      <{ComponentName} size="lg">Large</{ComponentName}>
    </div>
  ),
};
```

### Résumé

```
══════════════════════════════════════════════════════════════
✅ COMPOSANT GÉNÉRÉ - {ComponentName}
══════════════════════════════════════════════════════════════

📁 Fichiers créés :
- src/components/{ComponentName}/index.ts
- src/components/{ComponentName}/{ComponentName}.tsx
- src/components/{ComponentName}/{ComponentName}.types.ts
- src/components/{ComponentName}/{ComponentName}.module.css
- src/components/{ComponentName}/{ComponentName}.test.tsx
- src/components/{ComponentName}/{ComponentName}.stories.tsx

📝 Features :
- TypeScript strict
- Props documentées avec JSDoc
- Forwarded ref
- Memoized
- Variants : primary, secondary, outline
- Sizes : sm, md, lg
- States : loading, disabled
- Accessible (ARIA)

🔧 Commandes :
# Lancer les tests
npm test {ComponentName}

# Lancer Storybook
npm run storybook

# Build
npm run build
```
