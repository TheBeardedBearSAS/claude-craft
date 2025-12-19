---
description: Storybook Story generieren
---

# Storybook Story generieren

Generiere eine umfassende Storybook Story für eine React-Komponente.

## Aufgabe

Erstelle eine vollständige Storybook Story mit:

1. **Meta-Konfiguration**
   - Title und Component
   - Parameters und Decorators
   - Tags (autodocs)
   - ArgTypes-Definitionen

2. **Haupt-Stories**
   - Default/Primary Story
   - Alle Variants
   - Alle States (normal, hover, active, disabled)
   - Verschiedene Sizes

3. **Interactive Stories**
   - Mit Actions
   - Mit Controls
   - Mit State Management
   - User Interaction Examples

4. **Edge Cases**
   - Empty States
   - Loading States
   - Error States
   - Extreme Values (sehr lange Texte, etc.)

5. **Accessibility**
   - A11y Addon aktiviert
   - Contrast Checks
   - Keyboard Navigation
   - Screen Reader Tests

6. **Responsive**
   - Mobile Viewport
   - Tablet Viewport
   - Desktop Viewport
   - Verschiedene Breakpoints

7. **Themes**
   - Light Mode
   - Dark Mode
   - Verschiedene Color Schemes

8. **Dokumentation**
   - Description für jede Story
   - Code Snippets
   - Best Practices
   - Do's and Don'ts

## Parameter

- **Component Name**: [Name der Komponente]
- **Component Path**: [Pfad zur Komponente]
- **Variants**: [Liste der Variants]
- **Props**: [Wichtige Props]
- **Special Features**: [Besondere Features]

## Story-Struktur

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Path/To/ComponentName',
  component: ComponentName,
  // ... configuration
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories...
```

## Anforderungen

1. **Organisation**
   - Logische Gruppierung
   - Klare Naming
   - Kategorisierung
   - Hierarchie

2. **Interaktivität**
   - Actions für Events
   - Controls für Props
   - State Management
   - Dynamic Updates

3. **Dokumentation**
   - Description für Meta
   - Description für Stories
   - Code Examples
   - Usage Guidelines

4. **Visual Testing**
   - Alle Variants sichtbar
   - Vergleichbare Layouts
   - Konsistente Abstände
   - Klar erkennbare Unterschiede

5. **Accessibility**
   - A11y Checks aktiviert
   - ARIA Labels dokumentiert
   - Keyboard Nav getestet
   - Color Contrast geprüft

6. **Performance**
   - Lazy Loading wenn nötig
   - Optimierte Re-Renders
   - Schnelle Load Times
   - Effiziente Updates

## Beispiel-Aufruf

```
Component Name: Button
Component Path: components/atoms/Button
Variants: primary, secondary, outline, ghost, danger
Props:
- size: 'sm' | 'md' | 'lg'
- disabled: boolean
- isLoading: boolean
- leftIcon?: ReactNode
- rightIcon?: ReactNode
Special Features:
- Loading state mit Spinner
- Icon support links und rechts
- Full width option
- Custom className
```

## Zu liefern

1. Vollständige Story-Datei
2. Alle Variants dokumentiert
3. Interactive Examples
4. Accessibility Notes
5. Usage Guidelines
6. Code Snippets
