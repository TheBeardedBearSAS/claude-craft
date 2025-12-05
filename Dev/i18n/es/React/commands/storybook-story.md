# Generar Historia de Storybook

Genera historias de Storybook para documentar y probar componentes React de forma aislada.

## Que es Storybook

Storybook es una herramienta para desarrollar componentes de UI de forma aislada. Permite:

- Documentar componentes visualmente
- Probar diferentes estados y props
- Desarrollar componentes independientemente
- Crear una biblioteca de componentes reutilizables

## Instalacion

```bash
# Inicializar Storybook
npx storybook@latest init

# Instalar addons utiles
npm install -D @storybook/addon-a11y @storybook/addon-interactions
```

## Estructura Basica

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * Configuracion del meta objeto
 */
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
      options: ['primary', 'secondary', 'outline']
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Historia por defecto
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button'
  }
};
```

## Historias Avanzadas

### Multiples Variantes

```typescript
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  )
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};
```

### Estados del Componente

```typescript
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...'
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled'
  }
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon /> Button with Icon
      </>
    )
  }
};
```

### Interacciones

```typescript
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export const Clickable: Story = {
  args: {
    children: 'Click me'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(button).toHaveFocus();
  }
};
```

### Con Decoradores

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const meta = {
  title: 'Features/UserList',
  component: UserList,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    }
  ]
} satisfies Meta<typeof UserList>;
```

## Controles y ArgTypes

### Tipos de Controles

```typescript
const meta = {
  argTypes: {
    // Select
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline']
    },

    // Radio
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg']
    },

    // Boolean
    disabled: {
      control: 'boolean'
    },

    // Text
    label: {
      control: 'text'
    },

    // Number
    count: {
      control: { type: 'number', min: 0, max: 100, step: 1 }
    },

    // Color
    backgroundColor: {
      control: 'color'
    },

    // Date
    date: {
      control: 'date'
    },

    // Object
    user: {
      control: 'object'
    },

    // Sin control
    onClick: {
      action: 'clicked',
      control: false
    }
  }
} satisfies Meta<typeof Component>;
```

### Documentacion de ArgTypes

```typescript
const meta = {
  argTypes: {
    variant: {
      description: 'Variante visual del componente',
      table: {
        type: { summary: 'primary | secondary | outline' },
        defaultValue: { summary: 'primary' }
      },
      control: 'select',
      options: ['primary', 'secondary', 'outline']
    }
  }
} satisfies Meta<typeof Component>;
```

## Documentacion

### JSDoc Comments

```typescript
/**
 * El componente Button se usa para desencadenar acciones.
 * Soporta multiples variantes, tamanos y estados.
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Un boton flexible con multiples opciones de estilo'
      }
    }
  }
} satisfies Meta<typeof Button>;
```

### Ejemplos de Codigo

```typescript
export const Example: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Button
  variant="primary"
  size="md"
  onClick={handleClick}
>
  Click me
</Button>
        `
      }
    }
  }
};
```

## Addons Utiles

### Accesibilidad (a11y)

```typescript
// .storybook/main.ts
export default {
  addons: ['@storybook/addon-a11y']
};

// En historias
export const Accessible: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          }
        ]
      }
    }
  }
};
```

### Viewport

```typescript
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
};
```

### Fondos

```typescript
export const OnDark: Story = {
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
};
```

## Organizacion de Historias

### Por Atomic Design

```
stories/
├── atoms/
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   └── Badge.stories.tsx
├── molecules/
│   ├── SearchBar.stories.tsx
│   └── Card.stories.tsx
└── organisms/
    ├── Header.stories.tsx
    └── UserProfile.stories.tsx
```

### Por Features

```
stories/
├── auth/
│   ├── LoginForm.stories.tsx
│   └── RegisterForm.stories.tsx
├── users/
│   ├── UserList.stories.tsx
│   └── UserCard.stories.tsx
└── products/
    ├── ProductGrid.stories.tsx
    └── ProductCard.stories.tsx
```

## Configuracion de Storybook

### main.ts

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};

export default config;
```

### preview.ts

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' }
      ]
    }
  }
};

export default preview;
```

## Scripts NPM

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "storybook:test": "test-storybook"
  }
}
```

## Mejores Practicas

### 1. Una Historia por Estado

```typescript
// ✅ BIEN - Historias separadas
export const Empty: Story = {
  args: { items: [] }
};

export const WithItems: Story = {
  args: { items: mockItems }
};

export const Loading: Story = {
  args: { items: [], isLoading: true }
};
```

### 2. Usar Args

```typescript
// ✅ BIEN - Usar args
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button'
  }
};

// ❌ MAL - Hardcodear props
export const Primary: Story = {
  render: () => <Button variant="primary">Button</Button>
};
```

### 3. Documentar Comportamiento

```typescript
export const WithValidation: Story = {
  args: {
    value: ''
  },
  parameters: {
    docs: {
      description: {
        story: 'El formulario muestra errores de validacion cuando se envia vacio'
      }
    }
  }
};
```

## Testing con Storybook

```typescript
// Button.test.tsx
import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import * as stories from './Button.stories';

const { Primary, Disabled } = composeStories(stories);

describe('Button', () => {
  it('should render primary button', () => {
    render(<Primary />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render disabled button', () => {
    render(<Disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Recursos

- [Documentacion Storybook](https://storybook.js.org/docs/react/)
- [Addons de Storybook](https://storybook.js.org/addons)
- [Storybook Testing](https://storybook.js.org/docs/react/writing-tests/introduction)
- [Design System for Developers](https://www.learnstorybook.com/)
