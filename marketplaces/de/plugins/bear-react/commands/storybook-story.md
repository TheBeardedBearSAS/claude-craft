---
description: Storybook Story generieren
---

# Storybook Story generieren

Eine Storybook-Story für eine bestehende React-Komponente generieren.

## Was dieser Befehl tut

1. **Story-Generierung**
   - Story-Datei für Komponente erstellen
   - Alle Komponentenvarianten generieren
   - Interaktive Steuerungen (Args) hinzufügen
   - Story-Parameter konfigurieren
   - Dokumentation hinzufügen

2. **Verwendete Templates**
   - CSF 3.0-Format (Component Story Format)
   - TypeScript-Typen
   - Args und ArgTypes
   - Story-Varianten

3. **Generierte Datei**
   ```
   src/components/ComponentName/
   └── ComponentName.stories.tsx
   ```

## Verwendung

```bash
# Story für bestehende Komponente generieren
npm run generate:story ComponentName

# Mit benutzerdefiniertem Pfad
npm run generate:story features/users/components/UserCard
```

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Story-Templates

### 1. Grundlegende Story

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
      description: 'Button-Varianten-Stil',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button-Größe',
    },
    disabled: {
      control: 'boolean',
      description: 'Button deaktivieren',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Standard-Story
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

// Alle Varianten
export const Primary: Story = {
  args: {
    children: 'Primärer Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Sekundärer Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Gefährlicher Button',
    variant: 'danger',
  },
};

// Größenvarianten
export const Small: Story = {
  args: {
    children: 'Kleiner Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Großer Button',
    size: 'lg',
  },
};

// Zustandsvarianten
export const Disabled: Story = {
  args: {
    children: 'Deaktivierter Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Ladender Button',
    isLoading: true,
  },
};
```

### 2. Formular-Komponenten-Story

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
    label: 'E-Mail',
    placeholder: 'E-Mail-Adresse eingeben',
  },
};

export const WithError: Story = {
  args: {
    label: 'E-Mail',
    value: 'ungueltige-email',
    error: 'Ungültiges E-Mail-Format',
  },
};

export const Password: Story = {
  args: {
    label: 'Passwort',
    type: 'password',
    placeholder: 'Passwort eingeben',
  },
};

export const Disabled: Story = {
  args: {
    label: 'E-Mail',
    disabled: true,
    value: 'deaktiviert@example.com',
  },
};
```

### 3. Komplexe Komponente mit Actions

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
  name: 'Max Mustermann',
  email: 'max@example.com',
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

### 4. Story mit mehreren Kompositionen

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
    children: 'Karteninhalt',
  },
};

export const WithHeader: Story = {
  render: () => (
    <Card>
      <Card.Header>Kartentitel</Card.Header>
      <Card.Body>Karteninhalt hier</Card.Body>
    </Card>
  ),
};

export const Complete: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <h3>Benutzerprofil</h3>
      </Card.Header>
      <Card.Body>
        <p>Name: Max Mustermann</p>
        <p>E-Mail: max@example.com</p>
      </Card.Body>
      <Card.Footer>
        <button>Bearbeiten</button>
        <button>Löschen</button>
      </Card.Footer>
    </Card>
  ),
};
```

### 5. Story mit MSW (API-Mocking)

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
            { id: '1', name: 'Max Mustermann', email: 'max@example.com' },
            { id: '2', name: 'Anna Schmidt', email: 'anna@example.com' },
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

## Story-Konfiguration

### Globale Parameter

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
        { name: 'hell', value: '#ffffff' },
        { name: 'dunkel', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;
```

### Dekoratoren

```typescript
// Globaler Dekorator
export const decorators = [
  (Story) => (
    <div style={{ padding: '3rem' }}>
      <Story />
    </div>
  ),
];

// Story-spezifischer Dekorator
export const WithPadding: Story = {
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', backgroundColor: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    children: 'Inhalt mit Abstand',
  },
};
```

## Interaktive Steuerungen

### ArgTypes-Konfiguration

```typescript
const meta: Meta<typeof Component> = {
  argTypes: {
    // Auswahl
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Komponentenvariante',
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

    // Zahl
    count: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
    },

    // Bereich
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },

    // Farbe
    color: {
      control: 'color',
    },

    // Datum
    date: {
      control: 'date',
    },

    // Text
    label: {
      control: 'text',
    },

    // Objekt
    user: {
      control: 'object',
    },

    // Funktion (Steuerung deaktivieren)
    onClick: {
      action: 'geklickt',
      table: {
        category: 'Ereignisse',
      },
    },
  },
};
```

## Dokumentation

### MDX-Dokumentation

```mdx
<!-- Button.stories.mdx -->
import { Canvas, Meta, Story } from '@storybook/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

Button-Komponente mit mehreren Varianten und Größen.

## Verwendung

```tsx
import { Button } from '@/components/Button';

<Button variant="primary" onClick={handleClick}>
  Klick mich
</Button>
```

## Varianten

<Canvas of={ButtonStories.Primary} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Danger} />

## Größen

<Canvas of={ButtonStories.Small} />
<Canvas of={ButtonStories.Large} />
```

## Best Practices

1. **Story-Benennung**: Aussagekräftige Namen verwenden (Default, Primary, WithError)
2. **Args**: Sinnvolle Standardwerte bereitstellen
3. **ArgTypes**: Alle Props dokumentieren
4. **Actions**: Für Event-Handler verwenden
5. **Dekoratoren**: Kontext hinzufügen, wenn nötig
6. **MSW**: API-Aufrufe mocken
7. **Barrierefreiheit**: Mit a11y-Addon testen
8. **Dokumentation**: MDX für komplexe Komponenten hinzufügen
9. **Varianten**: Alle visuellen Zustände abdecken
10. **Edge Cases**: Fehler-, Lade- und Leerzustände einschließen

## Tests mit Storybook

### Interaktionstests

```typescript
// Button.stories.tsx
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

export const ClickTest: Story = {
  args: {
    children: 'Klick mich',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};
```

### Visuelle Tests

```typescript
// Chromatic konfigurieren
export const parameters = {
  chromatic: {
    viewports: [320, 768, 1200],
    delay: 300,
  },
};
```

## Generator-Skript

```typescript
// scripts/generate-story.ts
import fs from 'fs/promises';
import path from 'path';

async function generateStory(componentName: string, componentPath: string) {
  const storyPath = path.join(componentPath, `${componentName}.stories.tsx`);

  await fs.writeFile(storyPath, getStoryTemplate(componentName));

  console.log(`✅ Story erstellt: ${storyPath}`);
}

// Ausführen
const [,, name, pathArg] = process.argv;
generateStory(name, pathArg || `src/components/${name}`);
```

## Storybook-Addons

Zu installierende wesentliche Addons:

```bash
npm install -D @storybook/addon-essentials
npm install -D @storybook/addon-interactions
npm install -D @storybook/addon-a11y
npm install -D msw-storybook-addon
```

## Ressourcen

- [Storybook-Dokumentation](https://storybook.js.org/docs/react/get-started/introduction)
- [CSF 3.0](https://storybook.js.org/docs/react/api/csf)
- [Interaktionstests](https://storybook.js.org/docs/react/writing-tests/interaction-testing)
- [MSW-Addon](https://storybook.js.org/addons/msw-storybook-addon)
