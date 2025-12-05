# Template: Componente Funcional React

## Estrutura Basica

```typescript
// ComponentName.tsx
import { FC } from 'react';
import { cn } from '@/utils/classnames';

/**
 * Descricao e proposito do componente.
 *
 * @component
 * @example
 * ```tsx
 * <ComponentName
 *   prop1="valor"
 *   prop2={42}
 *   onAction={handleAction}
 * />
 * ```
 */

interface ComponentNameProps {
  /**
   * Descricao da prop
   */
  prop1: string;

  /**
   * Descricao da prop
   * @default 0
   */
  prop2?: number;

  /**
   * Callback chamado durante acao
   */
  onAction?: () => void;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = ({
  prop1,
  prop2 = 0,
  onAction,
  className
}) => {
  // Estado local se necessario
  // const [state, setState] = useState();

  // Hooks personalizados se necessario
  // const { data } = useCustomHook();

  // Handlers
  const handleClick = () => {
    onAction?.();
  };

  return (
    <div className={cn('classes-base', className)}>
      <h2>{prop1}</h2>
      <button onClick={handleClick}>Acao</button>
    </div>
  );
};

// Exportar tipo para reutilizacao
export type { ComponentNameProps };
```

## Com Variantes (class-variance-authority)

```typescript
import { FC } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/classnames';

const componentVariants = cva('classes-base', {
  variants: {
    variant: {
      default: 'classes-variant-default',
      primary: 'classes-variant-primary',
      secondary: 'classes-variant-secondary'
    },
    size: {
      sm: 'classes-size-sm',
      md: 'classes-size-md',
      lg: 'classes-size-lg'
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

## Com forwardRef

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
      className={cn('classes-base', `variant-${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
});

ComponentName.displayName = 'ComponentName';
```

## Padrao Container/Presenter

```typescript
// ComponentNameContainer.tsx (Componente Inteligente)
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

// ComponentNamePresenter.tsx (Componente Burro)
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
      <button onClick={onAction}>Acao</button>
    </div>
  );
};
```

## Testes Associados

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('deve renderizar corretamente', () => {
    render(<ComponentName prop1="teste" />);

    expect(screen.getByText('teste')).toBeInTheDocument();
  });

  it('deve chamar onAction quando botao clicado', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();

    render(<ComponentName prop1="teste" onAction={handleAction} />);

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
    prop1: 'Valor padrao',
    prop2: 42
  }
};

export const WithAction: Story = {
  args: {
    prop1: 'Com acao',
    onAction: () => alert('Acao clicada')
  }
};
```

## Arquivo Index

```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Organizacao Completa

```
ComponentName/
├── ComponentName.tsx          # Componente principal
├── ComponentName.test.tsx     # Testes
├── ComponentName.stories.tsx  # Storybook
├── hooks/                     # Hooks locais (se necessario)
│   └── useCustomLogic.ts
├── components/                # Sub-componentes (se necessario)
│   └── SubComponent.tsx
└── index.ts                   # Exports
```
