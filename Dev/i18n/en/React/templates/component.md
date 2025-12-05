# Template: Functional React Component

## Basic Structure

```typescript
// ComponentName.tsx
import { FC } from 'react';
import { cn } from '@/utils/classnames';

/**
 * Component description and purpose.
 *
 * @component
 * @example
 * ```tsx
 * <ComponentName
 *   prop1="value"
 *   prop2={42}
 *   onAction={handleAction}
 * />
 * ```
 */

interface ComponentNameProps {
  /**
   * Prop description
   */
  prop1: string;

  /**
   * Prop description
   * @default 0
   */
  prop2?: number;

  /**
   * Callback called during action
   */
  onAction?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = ({
  prop1,
  prop2 = 0,
  onAction,
  className
}) => {
  // Local state if needed
  // const [state, setState] = useState();

  // Custom hooks if needed
  // const { data } = useCustomHook();

  // Handlers
  const handleClick = () => {
    onAction?.();
  };

  return (
    <div className={cn('base-classes', className)}>
      <h2>{prop1}</h2>
      <button onClick={handleClick}>Action</button>
    </div>
  );
};

// Export type for reuse
export type { ComponentNameProps };
```

## With Variants (class-variance-authority)

```typescript
import { FC } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/classnames';

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'variant-default-classes',
      primary: 'variant-primary-classes',
      secondary: 'variant-secondary-classes'
    },
    size: {
      sm: 'size-sm-classes',
      md: 'size-md-classes',
      lg: 'size-lg-classes'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
});

interface ComponentNameProps
  extends VariantProps<typeof componentVariants> {
  children: React.ReactNode;
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = ({
  variant,
  size,
  children,
  className
}) => {
  return (
    <div className={componentVariants({ variant, size, className })}>
      {children}
    </div>
  );
};
```

## With forwardRef

```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/classnames';

interface ComponentNameProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const ComponentName = forwardRef<
  HTMLButtonElement,
  ComponentNameProps
>(({ variant = 'primary', className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn('base-classes', `variant-${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
});

ComponentName.displayName = 'ComponentName';
```

## Container/Presenter Pattern

```typescript
// ComponentNameContainer.tsx (Smart Component)
import { FC } from 'react';
import { useCustomLogic } from './hooks/useCustomLogic';
import { ComponentNamePresenter } from './ComponentNamePresenter';

export const ComponentNameContainer: FC = () => {
  const {
    data,
    isLoading,
    error,
    handleAction
  } = useCustomLogic();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <ComponentNamePresenter
      data={data}
      onAction={handleAction}
    />
  );
};

// ComponentNamePresenter.tsx (Dumb Component)
import { FC } from 'react';
import type { Data } from './types';

interface ComponentNamePresenterProps {
  data: Data;
  onAction: () => void;
}

export const ComponentNamePresenter: FC<ComponentNamePresenterProps> = ({
  data,
  onAction
}) => {
  return (
    <div>
      <h2>{data.title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

## Associated Tests

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop1="test" />);

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should call onAction when button clicked', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();

    render(<ComponentName prop1="test" onAction={handleAction} />);

    await user.click(screen.getByRole('button'));

    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
```

## Storybook

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prop1: 'Default value',
    prop2: 42
  }
};

export const WithAction: Story = {
  args: {
    prop1: 'With action',
    onAction: () => alert('Action clicked')
  }
};
```

## Index File

```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Complete Organization

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.test.tsx     # Tests
├── ComponentName.stories.tsx  # Storybook
├── hooks/                     # Local hooks (if needed)
│   └── useCustomLogic.ts
├── components/                # Sub-components (if needed)
│   └── SubComponent.tsx
└── index.ts                   # Exports
```
