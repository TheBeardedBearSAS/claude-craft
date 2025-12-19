---
description: Definición de Design Tokens
argument-hint: [arguments]
---

# Definición de Design Tokens

Eres un Lead UI Designer. Debes definir los design tokens para un design system coherente y mantenible.

## Argumentos
$ARGUMENTS

Argumentos:
- Tipo de tokens a definir: colors, typography, spacing, shadows, all
- (Opcional) Color primario base: #HEXCODE
- (Opcional) Modo: light, dark, both

Ejemplo: `/common:ui-design-tokens all #3B82F6 both`

## MISIÓN

### Paso 1: Analizar el contexto

- Stack frontend (React, Vue, Tailwind, CSS vars...)
- ¿Design system existente?
- ¿Guía de marca proporcionada?

### Paso 2: Definir los tokens

```
══════════════════════════════════════════════════════════════
🎨 DESIGN TOKENS
══════════════════════════════════════════════════════════════

Proyecto: {nombre}
Fecha: {fecha}
Formato: CSS Custom Properties

──────────────────────────────────────────────────────────────
🎨 COLORES
──────────────────────────────────────────────────────────────

### Paleta Semántica

#### Primary (Acción principal)
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| --color-primary-50 | #eff6ff | #1e3a5f | Fondo sutil |
| --color-primary-500 | #3b82f6 | #60a5fa | Texto |
| --color-primary-600 | #2563eb | #93c5fd | Texto hover |

#### Success / Warning / Error
{Escalas similares}

#### Neutral (Texto, Fondos)
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| --color-neutral-0 | #ffffff | #0a0a0a | Fondo |
| --color-neutral-500 | #737373 | #a3a3a3 | Texto muted |
| --color-neutral-900 | #171717 | #fafafa | Texto fuerte |

### Tokens Alias (Semánticos)
```css
/* Fondos */
--color-bg-primary: var(--color-neutral-0);
--color-bg-secondary: var(--color-neutral-50);

/* Textos */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);

/* Bordes */
--color-border-default: var(--color-neutral-200);
--color-border-focus: var(--color-primary-500);
```

──────────────────────────────────────────────────────────────
📝 TIPOGRAFÍA
──────────────────────────────────────────────────────────────

### Familias
```css
--font-family-sans: 'Inter', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', monospace;
```

### Tamaños (base 16px)
| Token | Tamaño | Line Height | Uso |
|-------|--------|-------------|-----|
| --font-size-xs | 0.75rem | 1rem | Labels |
| --font-size-base | 1rem | 1.5rem | Body |
| --font-size-4xl | 2.25rem | 2.5rem | H1 |

──────────────────────────────────────────────────────────────
📐 ESPACIADOS
──────────────────────────────────────────────────────────────

### Escala (base 4px)
| Token | Valor | Píxeles | Uso |
|-------|-------|---------|-----|
| --spacing-1 | 0.25rem | 4px | XS |
| --spacing-4 | 1rem | 16px | M (base) |
| --spacing-8 | 2rem | 32px | XL |

──────────────────────────────────────────────────────────────
🌗 SOMBRAS / ⭕ RADIOS / ⏱️ TRANSICIONES
──────────────────────────────────────────────────────────────

{Tablas similares con tokens}

```

### Paso 3: Exportar

Generar archivos:
- `tokens.css` - CSS Custom Properties
- `tokens.json` - Formato Style Dictionary
- `tailwind.config.js` - Extensión Tailwind (si aplica)
