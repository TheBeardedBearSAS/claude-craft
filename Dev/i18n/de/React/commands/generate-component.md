# Komponente generieren

Generiere eine neue React-Komponente mit allen zugehörigen Dateien.

## Aufgabe

Erstelle eine vollständige React-Komponente mit:

1. **Hauptkomponente** (`ComponentName.tsx`)
   - TypeScript mit strikter Typisierung
   - Functional Component mit Props Interface
   - JSDoc-Dokumentation
   - Exported types

2. **Tests** (`ComponentName.test.tsx`)
   - Unit-Tests mit Vitest und React Testing Library
   - Alle Props und Variants testen
   - User-Interaktionen testen
   - Accessibility-Tests

3. **Storybook** (`ComponentName.stories.tsx`)
   - Alle Variants dokumentiert
   - Interactive Controls
   - Usage-Examples
   - Accessibility-Addon

4. **Styles** (falls nötig)
   - Tailwind CSS Classes
   - Oder CSS Module
   - Responsive Design
   - Dark Mode Support

5. **Index** (`index.ts`)
   - Named Exports
   - Type Exports
   - Barrel File

## Parameter

- **Component Name**: [Name der Komponente]
- **Component Type**: [Atom/Molecule/Organism]
- **Props**: [Liste der Props mit Typen]
- **Features**: [Spezielle Features oder Variants]

## Template-Struktur

```
components/
└── [ComponentName]/
    ├── ComponentName.tsx
    ├── ComponentName.test.tsx
    ├── ComponentName.stories.tsx
    └── index.ts
```

## Anforderungen

1. **TypeScript**
   - Strikte Typisierung
   - Interface für Props
   - Keine `any` Types
   - Exported Types

2. **Accessibility**
   - Semantisches HTML
   - ARIA-Attribute wo nötig
   - Tastaturnavigation
   - Focus Management

3. **Performance**
   - Memoization wo sinnvoll
   - Optimierte Re-Renders
   - Lazy Loading wenn groß
   - Keine unnötigen Dependencies

4. **Stil**
   - Konsistent mit Design System
   - Responsive
   - Dark Mode Support
   - Customizable mit className

5. **Tests**
   - >80% Coverage
   - Alle Props getestet
   - Alle Variants getestet
   - User Interactions getestet

6. **Dokumentation**
   - JSDoc-Kommentare
   - Usage-Examples in Storybook
   - Props dokumentiert
   - Variants erklärt

## Beispiel-Aufruf

```
Component Name: Button
Component Type: Atom
Props:
- variant: 'primary' | 'secondary' | 'outline' | 'ghost'
- size: 'sm' | 'md' | 'lg'
- disabled: boolean
- isLoading: boolean
- onClick: () => void
- children: ReactNode
Features:
- Loading state mit Spinner
- Disabled state
- Icon support
- Full width option
```

## Zu liefern

1. Vollständige Komponente mit allen Dateien
2. Umfassende Tests
3. Storybook-Stories
4. Verwendungsbeispiele
5. Dokumentation
