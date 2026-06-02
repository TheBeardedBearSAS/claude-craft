---
description: Gerar Story do Storybook
---

# Gerar Story do Storybook

Gere uma story do Storybook para um componente React existente.

## O Que Este Comando Faz

1. **Geração de Story**
   - Criar arquivo de story para o componente
   - Gerar todas as variantes do componente
   - Adicionar controles interativos (args)
   - Configurar parâmetros da story
   - Adicionar documentação

2. **Templates Utilizados**
   - Formato CSF 3.0 (Component Story Format)
   - Tipos TypeScript
   - Args e argTypes
   - Variantes de story

3. **Arquivo Gerado**
   ```
   src/components/ComponentName/
   └── ComponentName.stories.tsx
   ```

## Como Usar

```bash
# Gerar story para um componente existente
npm run generate:story ComponentName

# Com caminho personalizado
npm run generate:story features/users/components/UserCard
```

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Templates de Story

### 1. Story Básica

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'Estilo da variante do botão',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamanho do botão',
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilitar o botão',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Story padrão
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

// Todas as variantes
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

// Variantes de tamanho
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// Variantes de estado
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    isLoading: true,
  },
};
```

### 2. Story de Componente de Formulário

```typescript
// Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
    error: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Digite seu e-mail',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    error: 'Formato de e-mail inválido',
  },
};

export const Password: Story = {
  args: {
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite a senha',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    disabled: true,
    value: 'disabled@example.com',
  },
};
```

### 3. Componente Complexo com Actions

```typescript
// UserCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { UserCard } from './UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Features/UserCard',
  component: UserCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserCard>;

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'admin' as const,
};

export const Default: Story = {
  args: {
    user: mockUser,
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const WithoutAvatar: Story = {
  args: {
    user: { ...mockUser, avatar: undefined },
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

### 4. Story com Múltiplas Composições

```typescript
// Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'Conteúdo do card',
  },
};

export const WithHeader: Story = {
  render: () => (
    <Card>
      <Card.Header>Título do Card</Card.Header>
      <Card.Body>Conteúdo do card aqui</Card.Body>
    </Card>
  ),
};

export const Complete: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <h3>Perfil do Usuário</h3>
      </Card.Header>
      <Card.Body>
        <p>Nome: John Doe</p>
        <p>Email: john@example.com</p>
      </Card.Body>
      <Card.Footer>
        <button>Editar</button>
        <button>Excluir</button>
      </Card.Footer>
    </Card>
  ),
};
```

### 5. Story com MSW (Mock de API)

```typescript
// UserList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { UserList } from './UserList';

const meta: Meta<typeof UserList> = {
  title: 'Features/UserList',
  component: UserList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserList>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return HttpResponse.json([
            { id: '1', name: 'John Doe', email: 'john@example.com' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          ]);
        }),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};
```

## Configuração de Story

### Parâmetros Globais

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
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;
```

### Decorators

```typescript
// Decorator global
export const decorators = [
  (Story) => (
    <div style={{ padding: '3rem' }}>
      <Story />
    </div>
  ),
];

// Decorator específico de story
export const WithPadding: Story = {
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', backgroundColor: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    children: 'Conteúdo com padding',
  },
};
```

## Controles Interativos

### Configuração de ArgTypes

```typescript
const meta: Meta<typeof Component> = {
  argTypes: {
    // Select
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Variante do componente',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },

    // Radio
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },

    // Boolean
    disabled: {
      control: 'boolean',
    },

    // Number
    count: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
    },

    // Range
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },

    // Color
    color: {
      control: 'color',
    },

    // Date
    date: {
      control: 'date',
    },

    // Text
    label: {
      control: 'text',
    },

    // Object
    user: {
      control: 'object',
    },

    // Function (desabilitar controle)
    onClick: {
      action: 'clicked',
      table: {
        category: 'Events',
      },
    },
  },
};
```

## Documentação

### Documentação MDX

```mdx
<!-- Button.stories.mdx -->
import { Canvas, Meta, Story } from '@storybook/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

Componente de botão com múltiplas variantes e tamanhos.

## Uso

```tsx
import { Button } from '@/components/Button';

<Button variant="primary" onClick={handleClick}>
  Clique aqui
</Button>
```

## Variantes

<Canvas of={ButtonStories.Primary} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Danger} />

## Tamanhos

<Canvas of={ButtonStories.Small} />
<Canvas of={ButtonStories.Large} />
```

## Boas Práticas

1. **Nomenclatura de Story**: Use nomes descritivos (Default, Primary, WithError)
2. **Args**: Forneça valores padrão sensatos
3. **ArgTypes**: Documente todas as props
4. **Actions**: Use para manipuladores de eventos
5. **Decorators**: Adicione contexto quando necessário
6. **MSW**: Simule chamadas de API
7. **Acessibilidade**: Teste com o addon a11y
8. **Documentação**: Adicione MDX para componentes complexos
9. **Variantes**: Cubra todos os estados visuais
10. **Casos Extremos**: Inclua estados de erro, carregamento e vazio

## Testes com Storybook

### Teste de Interação

```typescript
// Button.stories.tsx
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

export const ClickTest: Story = {
  args: {
    children: 'Clique aqui',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};
```

### Teste Visual

```typescript
// Configurar Chromatic
export const parameters = {
  chromatic: {
    viewports: [320, 768, 1200],
    delay: 300,
  },
};
```

## Script de Geração

```typescript
// scripts/generate-story.ts
import fs from 'fs/promises';
import path from 'path';

async function generateStory(componentName: string, componentPath: string) {
  const storyPath = path.join(componentPath, `${componentName}.stories.tsx`);

  await fs.writeFile(storyPath, getStoryTemplate(componentName));

  console.log(`✅ Story criada: ${storyPath}`);
}

// Executar
const [,, name, pathArg] = process.argv;
generateStory(name, pathArg || `src/components/${name}`);
```

## Addons do Storybook

Addons essenciais para instalar:

```bash
npm install -D @storybook/addon-essentials
npm install -D @storybook/addon-interactions
npm install -D @storybook/addon-a11y
npm install -D msw-storybook-addon
```

## Recursos

- [Documentação do Storybook](https://storybook.js.org/docs/react/get-started/introduction)
- [CSF 3.0](https://storybook.js.org/docs/react/api/csf)
- [Teste de Interação](https://storybook.js.org/docs/react/writing-tests/interaction-testing)
- [MSW Addon](https://storybook.js.org/addons/msw-storybook-addon)
