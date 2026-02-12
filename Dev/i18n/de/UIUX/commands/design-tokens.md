---
description: Design Tokens Definition
argument-hint: [arguments]
---

# Design Tokens Definition

Du bist ein Lead UI Designer. Du musst Design Tokens für ein kohärentes und wartbares Design System definieren.

## Argumente
$ARGUMENTS

Argumente:
- Art der zu definierenden Tokens: colors, typography, spacing, shadows, all
- (Optional) Basis-Primärfarbe: #HEXCODE
- (Optional) Modus: light, dark, both

Beispiel: `/common:ui-design-tokens all #3B82F6 both`

## MISSION

### Schritt 1: Kontext analysieren

- Frontend-Stack (React, Vue, Tailwind, CSS vars...)
- Bestehendes Design System?
- Markenrichtlinien vorhanden?

### Schritt 2: Tokens definieren

```
══════════════════════════════════════════════════════════════
🎨 DESIGN TOKENS
══════════════════════════════════════════════════════════════

Projekt: {name}
Datum: {datum}
Format: CSS Custom Properties

──────────────────────────────────────────────────────────────
🎨 FARBEN
──────────────────────────────────────────────────────────────

### Semantische Palette

#### Primary (Hauptaktion)
| Token | Light | Dark | Verwendung |
|-------|-------|------|------------|
| --color-primary-50 | #eff6ff | #1e3a5f | Subtiler Hintergrund |
| --color-primary-500 | #3b82f6 | #60a5fa | Text |
| --color-primary-600 | #2563eb | #93c5fd | Text hover |

#### Success / Warning / Error
{Ähnliche Skalen}

#### Neutral (Text, Hintergründe)
| Token | Light | Dark | Verwendung |
|-------|-------|------|------------|
| --color-neutral-0 | #ffffff | #0a0a0a | Hintergrund |
| --color-neutral-500 | #737373 | #a3a3a3 | Gedämpfter Text |
| --color-neutral-900 | #171717 | #fafafa | Starker Text |

### Alias Tokens (Semantisch)
```css
/* Hintergründe */
--color-bg-primary: var(--color-neutral-0);
--color-bg-secondary: var(--color-neutral-50);

/* Texte */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);

/* Borders */
--color-border-default: var(--color-neutral-200);
--color-border-focus: var(--color-primary-500);
```

──────────────────────────────────────────────────────────────
📝 TYPOGRAFIE
──────────────────────────────────────────────────────────────

### Familien
```css
--font-family-sans: 'Inter', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', monospace;
```

### Größen (Basis 16px)
| Token | Größe | Line Height | Verwendung |
|-------|-------|-------------|------------|
| --font-size-xs | 0.75rem | 1rem | Labels |
| --font-size-base | 1rem | 1.5rem | Body |
| --font-size-4xl | 2.25rem | 2.5rem | H1 |

──────────────────────────────────────────────────────────────
📐 ABSTÄNDE
──────────────────────────────────────────────────────────────

### Skala (Basis 4px)
| Token | Wert | Pixel | Verwendung |
|-------|------|-------|------------|
| --spacing-1 | 0.25rem | 4px | XS |
| --spacing-4 | 1rem | 16px | M (Basis) |
| --spacing-8 | 2rem | 32px | XL |

──────────────────────────────────────────────────────────────
🌗 SCHATTEN / ⭕ RADIEN / ⏱️ ÜBERGÄNGE
──────────────────────────────────────────────────────────────

{Ähnliche Tabellen mit Tokens}

```

### Schritt 3: Exportieren

Dateien generieren:
- `tokens.css` - CSS Custom Properties
- `tokens.json` - Style Dictionary Format
- `tailwind.config.js` - Tailwind Erweiterung (falls zutreffend)
