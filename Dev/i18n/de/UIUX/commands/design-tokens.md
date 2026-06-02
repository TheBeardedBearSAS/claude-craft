---
description: Design-Tokens-Definition
argument-hint: [arguments]
---

# Design-Tokens-Definition

Sie sind ein leitender UI-Designer. Sie müssen Design-Tokens für ein kohärentes und wartbares Design-System definieren.

## Argumente
$ARGUMENTS

Argumente:
- Art der zu definierenden Tokens: colors, typography, spacing, shadows, all
- (Optional) Primäre Basisfarbe: #HEXCODE
- (Optional) Modus: light, dark, both

Beispiel: `/uiux:design-tokens all #3B82F6 both`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Bevor Claude mit der Ausführung beginnt, aktiviert es den Plan-Modus, um den betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## AUFTRAG

### Schritt 1: Kontext analysieren

- Frontend-Stack (React, Vue, Tailwind, CSS-Variablen …)
- Bestehendes Design-System vorhanden?
- Markenrichtlinien bereitgestellt?

### Schritt 2: Tokens definieren

```
══════════════════════════════════════════════════════════════
🎨 DESIGN TOKENS
══════════════════════════════════════════════════════════════

Projekt: {name}
Datum: {date}
Format: CSS Custom Properties

──────────────────────────────────────────────────────────────
🎨 FARBEN
──────────────────────────────────────────────────────────────

### Semantische Palette

#### Primär (Hauptaktion)
| Token | Hell | Dunkel | Verwendung |
|-------|------|--------|------------|
| --color-primary-50 | #eff6ff | #1e3a5f | Subtiler Hintergrund |
| --color-primary-100 | #dbeafe | #1e40af | Hintergrund |
| --color-primary-200 | #bfdbfe | #1d4ed8 | Rahmen |
| --color-primary-300 | #93c5fd | #2563eb | Rahmen bei Hover |
| --color-primary-400 | #60a5fa | #3b82f6 | Symbol |
| --color-primary-500 | #3b82f6 | #60a5fa | Text |
| --color-primary-600 | #2563eb | #93c5fd | Text bei Hover |
| --color-primary-700 | #1d4ed8 | #bfdbfe | - |
| --color-primary-800 | #1e40af | #dbeafe | - |
| --color-primary-900 | #1e3a5f | #eff6ff | - |

#### Erfolg
| Token | Hell | Dunkel |
|-------|------|--------|
| --color-success-50 | #f0fdf4 | #14532d |
| --color-success-500 | #22c55e | #4ade80 |
| --color-success-700 | #15803d | #86efac |

#### Warnung
| Token | Hell | Dunkel |
|-------|------|--------|
| --color-warning-50 | #fffbeb | #78350f |
| --color-warning-500 | #f59e0b | #fbbf24 |
| --color-warning-700 | #b45309 | #fcd34d |

#### Fehler
| Token | Hell | Dunkel |
|-------|------|--------|
| --color-error-50 | #fef2f2 | #7f1d1d |
| --color-error-500 | #ef4444 | #f87171 |
| --color-error-700 | #b91c1c | #fca5a5 |

#### Neutral (Text, Hintergründe)
| Token | Hell | Dunkel | Verwendung |
|-------|------|--------|------------|
| --color-neutral-0 | #ffffff | #0a0a0a | Hintergrund |
| --color-neutral-50 | #fafafa | #171717 | Subtiler Hintergrund |
| --color-neutral-100 | #f5f5f5 | #262626 | Gedämpfter Hintergrund |
| --color-neutral-200 | #e5e5e5 | #404040 | Rahmen |
| --color-neutral-300 | #d4d4d4 | #525252 | Rahmen bei Hover |
| --color-neutral-400 | #a3a3a3 | #737373 | Platzhaltertext |
| --color-neutral-500 | #737373 | #a3a3a3 | Gedämpfter Text |
| --color-neutral-600 | #525252 | #d4d4d4 | Sekundärer Text |
| --color-neutral-700 | #404040 | #e5e5e5 | Primärer Text |
| --color-neutral-800 | #262626 | #f5f5f5 | Hervorgehobener Text |
| --color-neutral-900 | #171717 | #fafafa | Starker Text |

### Alias-Tokens (Semantisch)
```css
/* Hintergründe */
--color-bg-primary: var(--color-neutral-0);
--color-bg-secondary: var(--color-neutral-50);
--color-bg-tertiary: var(--color-neutral-100);
--color-bg-inverse: var(--color-neutral-900);

/* Text */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);
--color-text-muted: var(--color-neutral-500);
--color-text-inverse: var(--color-neutral-0);

/* Rahmen */
--color-border-default: var(--color-neutral-200);
--color-border-hover: var(--color-neutral-300);
--color-border-focus: var(--color-primary-500);

/* Zustände */
--color-state-focus: var(--color-primary-500);
--color-state-error: var(--color-error-500);
--color-state-success: var(--color-success-500);
--color-state-warning: var(--color-warning-500);
```

──────────────────────────────────────────────────────────────
📝 TYPOGRAFIE
──────────────────────────────────────────────────────────────

### Schriftfamilien
```css
--font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Größen (Basis 16px)
| Token | Größe | Zeilenhöhe | Verwendung |
|-------|-------|------------|------------|
| --font-size-xs | 0.75rem (12px) | 1rem | Beschriftungen, Abzeichen |
| --font-size-sm | 0.875rem (14px) | 1.25rem | Kleiner Fließtext |
| --font-size-base | 1rem (16px) | 1.5rem | Fließtext |
| --font-size-lg | 1.125rem (18px) | 1.75rem | Einleitungstext |
| --font-size-xl | 1.25rem (20px) | 1.75rem | H4 |
| --font-size-2xl | 1.5rem (24px) | 2rem | H3 |
| --font-size-3xl | 1.875rem (30px) | 2.25rem | H2 |
| --font-size-4xl | 2.25rem (36px) | 2.5rem | H1 |
| --font-size-5xl | 3rem (48px) | 1 | Display |

### Schriftstärken
| Token | Wert | Verwendung |
|-------|------|------------|
| --font-weight-normal | 400 | Fließtext |
| --font-weight-medium | 500 | Beschriftungen, Navigation |
| --font-weight-semibold | 600 | Unterüberschriften |
| --font-weight-bold | 700 | Überschriften |

### Zeilenhöhen
```css
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

### Buchstabenabstand
```css
--letter-spacing-tighter: -0.05em;
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

──────────────────────────────────────────────────────────────
📐 ABSTÄNDE
──────────────────────────────────────────────────────────────

### Skala (Basis 4px)
| Token | Wert | Pixel | Verwendung |
|-------|------|-------|------------|
| --spacing-0 | 0 | 0px | - |
| --spacing-px | 1px | 1px | Rahmen |
| --spacing-0.5 | 0.125rem | 2px | Eng |
| --spacing-1 | 0.25rem | 4px | XS |
| --spacing-1.5 | 0.375rem | 6px | - |
| --spacing-2 | 0.5rem | 8px | S |
| --spacing-2.5 | 0.625rem | 10px | - |
| --spacing-3 | 0.75rem | 12px | - |
| --spacing-4 | 1rem | 16px | M (Basis) |
| --spacing-5 | 1.25rem | 20px | - |
| --spacing-6 | 1.5rem | 24px | L |
| --spacing-8 | 2rem | 32px | XL |
| --spacing-10 | 2.5rem | 40px | - |
| --spacing-12 | 3rem | 48px | 2XL |
| --spacing-16 | 4rem | 64px | 3XL |
| --spacing-20 | 5rem | 80px | - |
| --spacing-24 | 6rem | 96px | 4XL |

──────────────────────────────────────────────────────────────
🌗 SCHATTEN
──────────────────────────────────────────────────────────────

| Token | Wert | Verwendung |
|-------|------|------------|
| --shadow-xs | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Subtil |
| --shadow-sm | 0 1px 3px 0 rgb(0 0 0 / 0.1) | Karten |
| --shadow-md | 0 4px 6px -1px rgb(0 0 0 / 0.1) | Dropdowns |
| --shadow-lg | 0 10px 15px -3px rgb(0 0 0 / 0.1) | Modale |
| --shadow-xl | 0 20px 25px -5px rgb(0 0 0 / 0.1) | Dialoge |
| --shadow-2xl | 0 25px 50px -12px rgb(0 0 0 / 0.25) | Überlagerungen |
| --shadow-inner | inset 0 2px 4px 0 rgb(0 0 0 / 0.05) | Eingabefelder |
| --shadow-none | none | Zurücksetzen |

──────────────────────────────────────────────────────────────
⭕ RADIEN (Rahmen-Radius)
──────────────────────────────────────────────────────────────

| Token | Wert | Verwendung |
|-------|------|------------|
| --radius-none | 0 | Scharf |
| --radius-sm | 0.125rem (2px) | Subtil |
| --radius-md | 0.375rem (6px) | Schaltflächen, Eingabefelder |
| --radius-lg | 0.5rem (8px) | Karten |
| --radius-xl | 0.75rem (12px) | Modale |
| --radius-2xl | 1rem (16px) | Große Karten |
| --radius-full | 9999px | Pillen, Avatare |

──────────────────────────────────────────────────────────────
⏱️ ÜBERGÄNGE
──────────────────────────────────────────────────────────────

### Dauern
| Token | Wert | Verwendung |
|-------|------|------------|
| --duration-75 | 75ms | Mikro |
| --duration-100 | 100ms | Schnell |
| --duration-150 | 150ms | Standard |
| --duration-200 | 200ms | Normal |
| --duration-300 | 300ms | Langsam |
| --duration-500 | 500ms | Betonung |

### Beschleunigungskurven
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Zusammengesetzte Übergänge
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

| Token | Wert | Verwendung |
|-------|------|------------|
| --z-0 | 0 | Basis |
| --z-10 | 10 | Erhöht |
| --z-20 | 20 | Dropdowns |
| --z-30 | 30 | Klebend |
| --z-40 | 40 | Fest |
| --z-50 | 50 | Modaler Hintergrund |
| --z-60 | 60 | Modal |
| --z-70 | 70 | Popover |
| --z-80 | 80 | Toast |
| --z-90 | 90 | Tooltip |
| --z-max | 9999 | Maximum |
```

### Schritt 3: Export

Folgende Dateien generieren:
- `tokens.css` - CSS Custom Properties
- `tokens.json` - Style-Dictionary-Format
- `tailwind.config.js` - Tailwind-Erweiterung (falls zutreffend)
