---
description: React-Komponente generieren
---

# React-Komponente generieren

Eine neue React-Komponente mit TypeScript, Tests und Styling-Boilerplate generieren.

## Was dieser Befehl tut

1. **Komponenten-Generierung**
   - Komponentendatei erstellen
   - TypeScript-Interfaces generieren
   - Testdatei erstellen
   - Stildatei erstellen (CSS Module oder styled-components)
   - Storybook-Story erstellen (optional)
   - index.ts-Barrel-Export erstellen

2. **Verwendete Templates**
   - Funktionale Komponente mit TypeScript
   - Props-Interface
   - Grundlegende Test-Struktur
   - Style-Boilerplate

3. **Generierte Dateien**
   ```
   src/components/ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.test.tsx
   ├── ComponentName.module.css
   ├── ComponentName.stories.tsx (optional)
   └── index.ts
   ```

## Verwendung

```bash
# Komponente generieren
npm run generate:component ComponentName

# Mit benutzerdefiniertem Pfad
npm run generate:component features/users/components/UserCard

# Mit Optionen
npm run generate:component ComponentName --story --styled
```

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Komponenten-Templates

### 1. Grundlegende Komponente

```typescript
// ComponentName.tsx
import { FC } from 'react';
import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  /**
   * Beschreibung der Prop
   */
  children?: React.ReactNode;
  className?: string;
}

/**
 * ComponentName-Komponentenbeschreibung
 *
 * @component
 * @example
 * <ComponentName>Inhalt</ComponentName>
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

### 2. Mit State

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

### 3. Compound-Komponente

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

// Verwendung
<Card>
  <Card.Header>Titel</Card.Header>
  <Card.Body>Inhalt</Card.Body>
  <Card.Footer>Aktionen</Card.Footer>
</Card>
```

## Test-Template

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('sollte Kinder rendern', () => {
    render(<ComponentName>Testinhalt</ComponentName>);

    expect(screen.getByText('Testinhalt')).toBeInTheDocument();
  });

  it('sollte benutzerdefinierten className anwenden', () => {
    const { container } = render(
      <ComponentName className="custom">Inhalt</ComponentName>
    );

    expect(container.firstChild).toHaveClass('custom');
  });

  it('sollte Interaktionen verarbeiten', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<ComponentName onClick={handleClick}>Klick mich</ComponentName>);

    await user.click(screen.getByText('Klick mich'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Stil-Templates

### CSS-Module

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

## Storybook-Template

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
    children: 'Komponenteninhalt'
  }
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primäre Komponente'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Sekundäre Komponente'
  }
};
```

## Index-Barrel-Export

```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Generator-Skript

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

  // Verzeichnis erstellen
  await fs.mkdir(dir, { recursive: true });

  // Komponentendatei generieren
  await fs.writeFile(
    path.join(dir, `${name}.tsx`),
    getComponentTemplate(name)
  );

  // Testdatei generieren
  await fs.writeFile(
    path.join(dir, `${name}.test.tsx`),
    getTestTemplate(name)
  );

  // Stildatei generieren
  await fs.writeFile(
    path.join(dir, `${name}.module.css`),
    getStyleTemplate()
  );

  // Indexdatei generieren
  await fs.writeFile(
    path.join(dir, 'index.ts'),
    getIndexTemplate(name)
  );

  // Story generieren, wenn angefordert
  if (options.withStory) {
    await fs.writeFile(
      path.join(dir, `${name}.stories.tsx`),
      getStoryTemplate(name)
    );
  }

  console.log(`✅ Komponente ${name} erstellt unter ${dir}`);
}

// Ausführen
const [,, name, ...args] = process.argv;
const options = {
  name,
  withStory: args.includes('--story'),
  withStyled: args.includes('--styled')
};

generateComponent(options);
```

## Verwendungsbeispiele

### Einfache Komponente

```bash
npm run generate:component Button
```

Erzeugt:
```
src/components/Button/
├── Button.tsx
├── Button.test.tsx
├── Button.module.css
└── index.ts
```

### Feature-Komponente mit Story

```bash
npm run generate:component features/users/components/UserCard --story
```

Erzeugt:
```
src/features/users/components/UserCard/
├── UserCard.tsx
├── UserCard.test.tsx
├── UserCard.module.css
├── UserCard.stories.tsx
└── index.ts
```

## Best Practices

1. **PascalCase** für Komponentennamen
2. **Ko-Lokation** verwandter Dateien
3. **TypeScript**-Interfaces für Props
4. **JSDoc**-Kommentare für Dokumentation
5. **Default Exports** vermeiden (benannte Exports verwenden)
6. **Props-Interface** separat exportieren
7. **Testdatei** neben Komponente
8. **Barrel Exports** für saubere Imports

## Komponenten-Muster

### Präsentationskomponente

```typescript
// Reine UI, keine Logik
export const UserCard: FC<UserCardProps> = ({ user }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

### Container-Komponente

```typescript
// Logik und Datenabruf
export const UserCardContainer: FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;

  return <UserCard user={user} />;
};
```

### Higher-Order Component (HOC)

```typescript
// Wrapper-Muster
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

- Plop.js für erweiterte Generatoren
- Yeoman für Scaffolding
- Benutzerdefinierte Node.js-Skripte
- VS Code Snippets

## Ressourcen

- [React Komponentenmuster](https://react.dev/learn/your-first-component)
- [TypeScript mit React](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
