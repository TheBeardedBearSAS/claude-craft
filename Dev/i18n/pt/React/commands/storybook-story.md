# Gerar Story Storybook

Gerar uma story Storybook para um componente React existente.

## O Que Este Comando Faz

1. **Geracao de Story**
   - Criar arquivo de story para componente
   - Gerar todas as variantes do componente
   - Adicionar controles interativos (args)
   - Configurar parametros da story
   - Adicionar documentacao

2. **Templates Usados**
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
# Gerar story para componente existente
npm run generate:story ComponentName

# Com caminho personalizado
npm run generate:story features/users/components/UserCard
```

## Template de Story Basica

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
      description: 'Estilo da variante do botao',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamanho do botao',
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilitar o botao',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Story padrao
export const Default: Story = {
  args: {
    children: 'Botao',
    variant: 'primary',
    size: 'md',
  },
};

// Todas as variantes
export const Primary: Story = {
  args: {
    children: 'Botao Primario',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Botao Secundario',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Botao de Perigo',
    variant: 'danger',
  },
};

// Variantes de estado
export const Disabled: Story = {
  args: {
    children: 'Botao Desabilitado',
    disabled: true,
  },
};
```

## Melhores Praticas

1. **Nomenclatura de Story**: Usar nomes descritivos (Default, Primary, WithError)
2. **Args**: Fornecer padroes sensiveis
3. **ArgTypes**: Documentar todas as props
4. **Actions**: Usar para manipuladores de eventos
5. **Decorators**: Adicionar contexto quando necessario
6. **MSW**: Mockar chamadas de API
7. **Acessibilidade**: Testar com addon a11y
8. **Documentacao**: Adicionar MDX para componentes complexos
9. **Variantes**: Cobrir todos os estados visuais
10. **Casos Extremos**: Incluir estados de erro, carregamento, vazio

## Recursos

- [Documentacao Storybook](https://storybook.js.org/docs/react/get-started/introduction)
- [CSF 3.0](https://storybook.js.org/docs/react/api/csf)
- [Testes de Interacao](https://storybook.js.org/docs/react/writing-tests/interaction-testing)
- [Addon MSW](https://storybook.js.org/addons/msw-storybook-addon)
