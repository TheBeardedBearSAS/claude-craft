---
description: Génération Story Storybook
argument-hint: [arguments]
---

# Génération Story Storybook

Tu es un développeur React senior. Tu dois générer une story Storybook complète pour un composant existant, avec toutes les variantes, contrôles interactifs et documentation.

## Arguments
$ARGUMENTS

Arguments :
- Chemin vers le composant (ex: `src/components/Button/Button.tsx`)
- (Optionnel) Template : default, form, layout, complex

Exemple : `/react:storybook-story src/components/Button/Button.tsx`

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## MISSION

### Étape 1 : Analyser le Composant

Lire le composant pour identifier :
- Props et leurs types
- Variantes (variants, sizes, states)
- Comportements interactifs
- Dépendances (context, providers)

### Étape 2 : Structure de la Story

```typescript
// src/components/{Component}/{Component}.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import { {Component} } from './{Component}';

// Configuration Meta
const meta: Meta<typeof {Component}> = {
  title: 'Components/{Category}/{Component}',
  component: {Component},
  // Autodocs génère la documentation automatiquement
  tags: ['autodocs'],
  // Layout : centered, fullscreen, padded
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# {Component}

Description détaillée du composant, son utilisation et ses cas d'usage.

## Usage

\`\`\`tsx
import { {Component} } from '@/components/{Component}';

<{Component} variant="primary">
  Contenu
</{Component}>
\`\`\`
        `,
      },
    },
  },
  // Contrôles ArgTypes
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Variante visuelle du composant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
        category: 'Appearance',
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Taille du composant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
        category: 'Appearance',
      },
    },
    isDisabled: {
      control: 'boolean',
      description: 'Désactive le composant',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    isLoading: {
      control: 'boolean',
      description: 'Affiche un état de chargement',
      table: {
        category: 'State',
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Callback au clic',
      table: {
        category: 'Events',
      },
    },
    children: {
      control: 'text',
      description: 'Contenu du composant',
      table: {
        category: 'Content',
      },
    },
  },
  // Args par défaut
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
    isDisabled: false,
    isLoading: false,
  },
};

export default meta;
type Story = StoryObj<typeof {Component}>;
```

### Étape 3 : Stories de Base

```typescript
// Story par défaut (Playground)
export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

// Stories par variante
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

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};
```

### Étape 4 : Stories par Taille

```typescript
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

// Toutes les tailles ensemble
export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <{Component} {...args} size="sm">Small</{Component}>
      <{Component} {...args} size="md">Medium</{Component}>
      <{Component} {...args} size="lg">Large</{Component}>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparaison de toutes les tailles disponibles.',
      },
    },
  },
};
```

### Étape 5 : Stories d'États

```typescript
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
  parameters: {
    docs: {
      description: {
        story: 'État de chargement avec spinner.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    children: 'Disabled',
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <{Component} {...args}>
      <IconPlus aria-hidden="true" />
      <span>With Icon</span>
    </{Component}>
  ),
};

export const IconOnly: Story = {
  args: {
    'aria-label': 'Add item',
    children: <IconPlus aria-hidden="true" />,
  },
};
```

### Étape 6 : Stories Complexes

```typescript
// Matrice de toutes les variantes
export const VariantsMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <strong style={{ width: '100px' }}>Primary</strong>
        <{Component} variant="primary" size="sm">Small</{Component}>
        <{Component} variant="primary" size="md">Medium</{Component}>
        <{Component} variant="primary" size="lg">Large</{Component}>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <strong style={{ width: '100px' }}>Secondary</strong>
        <{Component} variant="secondary" size="sm">Small</{Component}>
        <{Component} variant="secondary" size="md">Medium</{Component}>
        <{Component} variant="secondary" size="lg">Large</{Component}>
      </div>
      {/* etc. */}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Matrice de toutes les combinaisons variante × taille.',
      },
    },
  },
};

// Avec interaction (play function)
export const WithInteraction: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);

    // Assertions
    await expect(button).toHaveFocus();
  },
};

// Responsive
export const Responsive: Story = {
  render: (args) => (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <{Component} {...args} style={{ width: '100%' }}>
        Full Width Button
      </{Component}>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

### Étape 7 : Stories avec Contexte

```typescript
// Si le composant nécessite un Provider
import { ThemeProvider } from '@/contexts/ThemeContext';

export const WithThemeProvider: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
  args: {
    children: 'Dark Theme',
  },
};

// Decorator global dans preview.ts
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/contexts/ThemeContext';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};
```

### Étape 8 : Documentation Détaillée

```typescript
export const Documentation: Story = {
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />

          <Heading>Variantes</Heading>
          <Stories includePrimary={false} />

          <Heading>Accessibilité</Heading>
          <Markdown>
            {`
Ce composant est accessible par défaut :
- Support complet du clavier (Enter, Space)
- État \`disabled\` avec \`aria-disabled\`
- État \`loading\` avec \`aria-busy\`
- Focus visible
            `}
          </Markdown>

          <Heading>Bonnes Pratiques</Heading>
          <Markdown>
            {`
### À faire
- Toujours fournir un label textuel
- Utiliser \`aria-label\` pour les boutons icône

### À éviter
- Ne pas désactiver le focus
- Ne pas utiliser de couleurs non contrastées
            `}
          </Markdown>
        </>
      ),
    },
  },
};
```

### Étape 9 : Tests Visuels

```typescript
// Tests de snapshot Chromatic / Percy
export const VisualTests: Story = {
  args: {
    children: 'Visual Test',
  },
  parameters: {
    // Chromatic
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
      viewports: [320, 768, 1200],
    },
    // Percy
    percy: {
      skip: false,
    },
  },
};
```

### Résumé

```
══════════════════════════════════════════════════════════════
✅ STORY GÉNÉRÉE - {Component}
══════════════════════════════════════════════════════════════

📁 Fichier créé :
- src/components/{Component}/{Component}.stories.tsx

📝 Stories créées :
- Default (playground avec contrôles)
- Variantes : Primary, Secondary, Outline, Ghost
- Tailles : Small, Medium, Large, AllSizes
- États : Loading, Disabled, WithIcon, IconOnly
- Complexes : VariantsMatrix, WithInteraction, Responsive
- Documentation complète

🔧 Commandes :
# Lancer Storybook
npm run storybook

# Build Storybook statique
npm run build-storybook

# Tests visuels (Chromatic)
npx chromatic --project-token=xxx

📖 URL :
http://localhost:6006/?path=/docs/components-{category}-{component}
```

### Configuration Storybook

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        showName: true,
      },
    },
  },
};

export default preview;
```
