---
description: Définition Design Tokens
argument-hint: [arguments]
---

# Définition Design Tokens

Tu es un Lead UI Designer. Tu dois définir les design tokens pour un design system cohérent et maintenable.

## Arguments
$ARGUMENTS

Arguments :
- Type de tokens à définir : colors, typography, spacing, shadows, all
- (Optionnel) Couleur primaire de base : #HEXCODE
- (Optionnel) Mode : light, dark, both

Exemple : `/common:ui-design-tokens all #3B82F6 both`

## MISSION

### Étape 1 : Analyser le contexte

- Stack front (React, Vue, Tailwind, CSS vars...)
- Design system existant ?
- Charte graphique fournie ?

### Étape 2 : Définir les tokens

```
══════════════════════════════════════════════════════════════
🎨 DESIGN TOKENS
══════════════════════════════════════════════════════════════

Projet : {nom}
Date : {date}
Format : CSS Custom Properties

──────────────────────────────────────────────────────────────
🎨 COULEURS
──────────────────────────────────────────────────────────────

### Palette Sémantique

#### Primary (Action principale)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-primary-50 | #eff6ff | #1e3a5f | Background subtle |
| --color-primary-100 | #dbeafe | #1e40af | Background |
| --color-primary-200 | #bfdbfe | #1d4ed8 | Border |
| --color-primary-300 | #93c5fd | #2563eb | Border hover |
| --color-primary-400 | #60a5fa | #3b82f6 | Icon |
| --color-primary-500 | #3b82f6 | #60a5fa | Text |
| --color-primary-600 | #2563eb | #93c5fd | Text hover |
| --color-primary-700 | #1d4ed8 | #bfdbfe | - |
| --color-primary-800 | #1e40af | #dbeafe | - |
| --color-primary-900 | #1e3a5f | #eff6ff | - |

#### Success
| Token | Light | Dark |
|-------|-------|------|
| --color-success-50 | #f0fdf4 | #14532d |
| --color-success-500 | #22c55e | #4ade80 |
| --color-success-700 | #15803d | #86efac |

#### Warning
| Token | Light | Dark |
|-------|-------|------|
| --color-warning-50 | #fffbeb | #78350f |
| --color-warning-500 | #f59e0b | #fbbf24 |
| --color-warning-700 | #b45309 | #fcd34d |

#### Error
| Token | Light | Dark |
|-------|-------|------|
| --color-error-50 | #fef2f2 | #7f1d1d |
| --color-error-500 | #ef4444 | #f87171 |
| --color-error-700 | #b91c1c | #fca5a5 |

#### Neutral (Texte, Backgrounds)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-neutral-0 | #ffffff | #0a0a0a | Background |
| --color-neutral-50 | #fafafa | #171717 | Background subtle |
| --color-neutral-100 | #f5f5f5 | #262626 | Background muted |
| --color-neutral-200 | #e5e5e5 | #404040 | Border |
| --color-neutral-300 | #d4d4d4 | #525252 | Border hover |
| --color-neutral-400 | #a3a3a3 | #737373 | Placeholder |
| --color-neutral-500 | #737373 | #a3a3a3 | Text muted |
| --color-neutral-600 | #525252 | #d4d4d4 | Text secondary |
| --color-neutral-700 | #404040 | #e5e5e5 | Text primary |
| --color-neutral-800 | #262626 | #f5f5f5 | Text emphasis |
| --color-neutral-900 | #171717 | #fafafa | Text strong |

### Tokens Alias (Sémantiques)
```css
/* Backgrounds */
--color-bg-primary: var(--color-neutral-0);
--color-bg-secondary: var(--color-neutral-50);
--color-bg-tertiary: var(--color-neutral-100);
--color-bg-inverse: var(--color-neutral-900);

/* Textes */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);
--color-text-muted: var(--color-neutral-500);
--color-text-inverse: var(--color-neutral-0);

/* Borders */
--color-border-default: var(--color-neutral-200);
--color-border-hover: var(--color-neutral-300);
--color-border-focus: var(--color-primary-500);

/* États */
--color-state-focus: var(--color-primary-500);
--color-state-error: var(--color-error-500);
--color-state-success: var(--color-success-500);
--color-state-warning: var(--color-warning-500);
```

──────────────────────────────────────────────────────────────
📝 TYPOGRAPHIE
──────────────────────────────────────────────────────────────

### Familles
```css
--font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Tailles (base 16px)
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| --font-size-xs | 0.75rem (12px) | 1rem | Labels, badges |
| --font-size-sm | 0.875rem (14px) | 1.25rem | Body small |
| --font-size-base | 1rem (16px) | 1.5rem | Body |
| --font-size-lg | 1.125rem (18px) | 1.75rem | Lead text |
| --font-size-xl | 1.25rem (20px) | 1.75rem | H4 |
| --font-size-2xl | 1.5rem (24px) | 2rem | H3 |
| --font-size-3xl | 1.875rem (30px) | 2.25rem | H2 |
| --font-size-4xl | 2.25rem (36px) | 2.5rem | H1 |
| --font-size-5xl | 3rem (48px) | 1 | Display |

### Poids
| Token | Value | Usage |
|-------|-------|-------|
| --font-weight-normal | 400 | Body |
| --font-weight-medium | 500 | Labels, nav |
| --font-weight-semibold | 600 | Subheadings |
| --font-weight-bold | 700 | Headings |

### Line Heights
```css
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

### Letter Spacing
```css
--letter-spacing-tighter: -0.05em;
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

──────────────────────────────────────────────────────────────
📐 ESPACEMENTS
──────────────────────────────────────────────────────────────

### Échelle (base 4px)
| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| --spacing-0 | 0 | 0px | - |
| --spacing-px | 1px | 1px | Borders |
| --spacing-0.5 | 0.125rem | 2px | Tight |
| --spacing-1 | 0.25rem | 4px | XS |
| --spacing-1.5 | 0.375rem | 6px | - |
| --spacing-2 | 0.5rem | 8px | S |
| --spacing-2.5 | 0.625rem | 10px | - |
| --spacing-3 | 0.75rem | 12px | - |
| --spacing-4 | 1rem | 16px | M (base) |
| --spacing-5 | 1.25rem | 20px | - |
| --spacing-6 | 1.5rem | 24px | L |
| --spacing-8 | 2rem | 32px | XL |
| --spacing-10 | 2.5rem | 40px | - |
| --spacing-12 | 3rem | 48px | 2XL |
| --spacing-16 | 4rem | 64px | 3XL |
| --spacing-20 | 5rem | 80px | - |
| --spacing-24 | 6rem | 96px | 4XL |

──────────────────────────────────────────────────────────────
🌗 OMBRES
──────────────────────────────────────────────────────────────

| Token | Value | Usage |
|-------|-------|-------|
| --shadow-xs | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Subtle |
| --shadow-sm | 0 1px 3px 0 rgb(0 0 0 / 0.1) | Cards |
| --shadow-md | 0 4px 6px -1px rgb(0 0 0 / 0.1) | Dropdowns |
| --shadow-lg | 0 10px 15px -3px rgb(0 0 0 / 0.1) | Modals |
| --shadow-xl | 0 20px 25px -5px rgb(0 0 0 / 0.1) | Dialogs |
| --shadow-2xl | 0 25px 50px -12px rgb(0 0 0 / 0.25) | Overlays |
| --shadow-inner | inset 0 2px 4px 0 rgb(0 0 0 / 0.05) | Inputs |
| --shadow-none | none | Reset |

──────────────────────────────────────────────────────────────
⭕ RAYONS (Border Radius)
──────────────────────────────────────────────────────────────

| Token | Value | Usage |
|-------|-------|-------|
| --radius-none | 0 | Sharp |
| --radius-sm | 0.125rem (2px) | Subtle |
| --radius-md | 0.375rem (6px) | Buttons, inputs |
| --radius-lg | 0.5rem (8px) | Cards |
| --radius-xl | 0.75rem (12px) | Modals |
| --radius-2xl | 1rem (16px) | Large cards |
| --radius-full | 9999px | Pills, avatars |

──────────────────────────────────────────────────────────────
⏱️ TRANSITIONS
──────────────────────────────────────────────────────────────

### Durées
| Token | Value | Usage |
|-------|-------|-------|
| --duration-75 | 75ms | Micro |
| --duration-100 | 100ms | Fast |
| --duration-150 | 150ms | Default |
| --duration-200 | 200ms | Normal |
| --duration-300 | 300ms | Slow |
| --duration-500 | 500ms | Emphasis |

### Easings
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Transitions composées
```css
--transition-none: none;
--transition-all: all 150ms ease-out;
--transition-colors: color, background-color, border-color 150ms ease-out;
--transition-opacity: opacity 150ms ease-out;
--transition-shadow: box-shadow 150ms ease-out;
--transition-transform: transform 150ms ease-out;
```

──────────────────────────────────────────────────────────────
📦 Z-INDEX
──────────────────────────────────────────────────────────────

| Token | Value | Usage |
|-------|-------|-------|
| --z-0 | 0 | Base |
| --z-10 | 10 | Elevated |
| --z-20 | 20 | Dropdowns |
| --z-30 | 30 | Sticky |
| --z-40 | 40 | Fixed |
| --z-50 | 50 | Modal backdrop |
| --z-60 | 60 | Modal |
| --z-70 | 70 | Popover |
| --z-80 | 80 | Toast |
| --z-90 | 90 | Tooltip |
| --z-max | 9999 | Maximum |
```

### Étape 3 : Export

Générer les fichiers :
- `tokens.css` - CSS Custom Properties
- `tokens.json` - Format Style Dictionary
- `tailwind.config.js` - Extension Tailwind (si applicable)
