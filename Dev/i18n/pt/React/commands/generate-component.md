---
description: Gerar Componente React
---

# Gerar Componente React

Gere um novo componente React com TypeScript, testes e boilerplate de estilização.

## O Que Este Comando Faz

1. **Geração de Componente**
   - Criar arquivo de componente
   - Gerar interfaces TypeScript
   - Criar arquivo de teste
   - Criar arquivo de estilo (CSS Module ou styled-components)
   - Criar story do Storybook (opcional)
   - Criar exportação barrel index.ts

2. **Templates Utilizados**
   - Componente funcional com TypeScript
   - Interface de Props
   - Estrutura básica de testes
   - Boilerplate de estilo

3. **Arquivos Gerados**
   ```
   src/components/ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.test.tsx
   ├── ComponentName.module.css
   ├── ComponentName.stories.tsx (opcional)
   └── index.ts
   ```

## Como Usar

```bash
# Gerar componente
npm run generate:component ComponentName

# Com caminho personalizado
npm run generate:component features/users/components/UserCard

# Com opções
npm run generate:component ComponentName --story --styled
```

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Templates de Componente

### 1. Componente Básico

```typescript
// ComponentName.tsx
import { FC } from 'react';
import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  /**
   * Descrição da prop
   */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Descrição do componente ComponentName
 *
 * @component
 * @example
 * <ComponentName>Conteúdo</ComponentName>
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

### 2. Com Estado

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

### 3. Componente Composto

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

// Uso
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Conteúdo</Card.Body>
  <Card.Footer>Ações</Card.Footer>
</Card>
```

## Template de Teste

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

## Templates de Estilo

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

## Template Storybook

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

## Exportação Barrel Index

```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Script Gerador

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

  // Criar diretório
  await fs.mkdir(dir, { recursive: true });

  // Gerar arquivo do componente
  await fs.writeFile(
    path.join(dir, `${name}.tsx`),
    getComponentTemplate(name)
  );

  // Gerar arquivo de teste
  await fs.writeFile(
    path.join(dir, `${name}.test.tsx`),
    getTestTemplate(name)
  );

  // Gerar arquivo de estilo
  await fs.writeFile(
    path.join(dir, `${name}.module.css`),
    getStyleTemplate()
  );

  // Gerar arquivo index
  await fs.writeFile(
    path.join(dir, 'index.ts'),
    getIndexTemplate(name)
  );

  // Gerar story se solicitado
  if (options.withStory) {
    await fs.writeFile(
      path.join(dir, `${name}.stories.tsx`),
      getStoryTemplate(name)
    );
  }

  console.log(`✅ Component ${name} created at ${dir}`);
}

// Executar
const [,, name, ...args] = process.argv;
const options = {
  name,
  withStory: args.includes('--story'),
  withStyled: args.includes('--styled')
};

generateComponent(options);
```

## Exemplos de Uso

### Componente Simples

```bash
npm run generate:component Button
```

Gera:
```
src/components/Button/
├── Button.tsx
├── Button.test.tsx
├── Button.module.css
└── index.ts
```

### Componente de Feature com Story

```bash
npm run generate:component features/users/components/UserCard --story
```

Gera:
```
src/features/users/components/UserCard/
├── UserCard.tsx
├── UserCard.test.tsx
├── UserCard.module.css
├── UserCard.stories.tsx
└── index.ts
```

## Boas Práticas

1. **PascalCase** para nomes de componentes
2. **Colocation** de arquivos relacionados
3. Interfaces **TypeScript** para props
4. Comentários **JSDoc** para documentação
5. **Evitar exports padrão** (usar exports nomeados)
6. **Interface de Props** exportada separadamente
7. **Arquivo de teste** ao lado do componente
8. **Exportações barrel** para imports limpos

## Padrões de Componente

### Componente Presentacional

```typescript
// Interface pura, sem lógica
export const UserCard: FC<UserCardProps> = ({ user }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

### Componente Container

```typescript
// Lógica e busca de dados
export const UserCardContainer: FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;

  return <UserCard user={user} />;
};
```

### Higher-Order Component (HOC)

```typescript
// Padrão wrapper
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

## Ferramentas

- Plop.js para geradores avançados
- Yeoman para scaffolding
- Scripts Node.js personalizados
- Snippets do VS Code

## Recursos

- [React Component Patterns](https://react.dev/learn/your-first-component)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
