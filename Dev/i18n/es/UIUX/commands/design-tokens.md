---
description: Definición de Design Tokens
argument-hint: [arguments]
---

# Definición de Design Tokens

Eres un Lead UI Designer. Debes definir los design tokens para un sistema de diseño coherente y mantenible.

## Argumentos
$ARGUMENTS

Argumentos:
- Tipo de tokens a definir: colors, typography, spacing, shadows, all
- (Opcional) Color primario base: #HEXCODE
- (Opcional) Modo: light, dark, both

Ejemplo: `/uiux:design-tokens all #3B82F6 both`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código afectado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Analizar el contexto

- Stack frontend (React, Vue, Tailwind, CSS vars...)
- ¿Existe un sistema de diseño previo?
- ¿Se han proporcionado directrices de marca?

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

#### Primario (Acción principal)
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| --color-primary-50 | #eff6ff | #1e3a5f | Fondo sutil |
| --color-primary-100 | #dbeafe | #1e40af | Fondo |
| --color-primary-200 | #bfdbfe | #1d4ed8 | Borde |
| --color-primary-300 | #93c5fd | #2563eb | Borde hover |
| --color-primary-400 | #60a5fa | #3b82f6 | Icono |
| --color-primary-500 | #3b82f6 | #60a5fa | Texto |
| --color-primary-600 | #2563eb | #93c5fd | Texto hover |
| --color-primary-700 | #1d4ed8 | #bfdbfe | - |
| --color-primary-800 | #1e40af | #dbeafe | - |
| --color-primary-900 | #1e3a5f | #eff6ff | - |

#### Éxito
| Token | Light | Dark |
|-------|-------|------|
| --color-success-50 | #f0fdf4 | #14532d |
| --color-success-500 | #22c55e | #4ade80 |
| --color-success-700 | #15803d | #86efac |

#### Advertencia
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

#### Neutro (Texto, Fondos)
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| --color-neutral-0 | #ffffff | #0a0a0a | Fondo |
| --color-neutral-50 | #fafafa | #171717 | Fondo sutil |
| --color-neutral-100 | #f5f5f5 | #262626 | Fondo atenuado |
| --color-neutral-200 | #e5e5e5 | #404040 | Borde |
| --color-neutral-300 | #d4d4d4 | #525252 | Borde hover |
| --color-neutral-400 | #a3a3a3 | #737373 | Placeholder |
| --color-neutral-500 | #737373 | #a3a3a3 | Texto atenuado |
| --color-neutral-600 | #525252 | #d4d4d4 | Texto secundario |
| --color-neutral-700 | #404040 | #e5e5e5 | Texto primario |
| --color-neutral-800 | #262626 | #f5f5f5 | Texto enfatizado |
| --color-neutral-900 | #171717 | #fafafa | Texto fuerte |

### Tokens Alias (Semánticos)
```css
/* Fondos */
--color-bg-primary: var(--color-neutral-0);
--color-bg-secondary: var(--color-neutral-50);
--color-bg-tertiary: var(--color-neutral-100);
--color-bg-inverse: var(--color-neutral-900);

/* Texto */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);
--color-text-muted: var(--color-neutral-500);
--color-text-inverse: var(--color-neutral-0);

/* Bordes */
--color-border-default: var(--color-neutral-200);
--color-border-hover: var(--color-neutral-300);
--color-border-focus: var(--color-primary-500);

/* Estados */
--color-state-focus: var(--color-primary-500);
--color-state-error: var(--color-error-500);
--color-state-success: var(--color-success-500);
--color-state-warning: var(--color-warning-500);
```

──────────────────────────────────────────────────────────────
📝 TIPOGRAFÍA
──────────────────────────────────────────────────────────────

### Familias
```css
--font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Tamaños (base 16px)
| Token | Tamaño | Altura de línea | Uso |
|-------|--------|-----------------|-----|
| --font-size-xs | 0.75rem (12px) | 1rem | Etiquetas, badges |
| --font-size-sm | 0.875rem (14px) | 1.25rem | Cuerpo pequeño |
| --font-size-base | 1rem (16px) | 1.5rem | Cuerpo |
| --font-size-lg | 1.125rem (18px) | 1.75rem | Texto destacado |
| --font-size-xl | 1.25rem (20px) | 1.75rem | H4 |
| --font-size-2xl | 1.5rem (24px) | 2rem | H3 |
| --font-size-3xl | 1.875rem (30px) | 2.25rem | H2 |
| --font-size-4xl | 2.25rem (36px) | 2.5rem | H1 |
| --font-size-5xl | 3rem (48px) | 1 | Display |

### Pesos
| Token | Valor | Uso |
|-------|-------|-----|
| --font-weight-normal | 400 | Cuerpo |
| --font-weight-medium | 500 | Etiquetas, nav |
| --font-weight-semibold | 600 | Subencabezados |
| --font-weight-bold | 700 | Encabezados |

### Alturas de línea
```css
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

### Espaciado entre letras
```css
--letter-spacing-tighter: -0.05em;
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

──────────────────────────────────────────────────────────────
📐 ESPACIADO
──────────────────────────────────────────────────────────────

### Escala (base 4px)
| Token | Valor | Píxeles | Uso |
|-------|-------|---------|-----|
| --spacing-0 | 0 | 0px | - |
| --spacing-px | 1px | 1px | Bordes |
| --spacing-0.5 | 0.125rem | 2px | Ajustado |
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
🌗 SOMBRAS
──────────────────────────────────────────────────────────────

| Token | Valor | Uso |
|-------|-------|-----|
| --shadow-xs | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Sutil |
| --shadow-sm | 0 1px 3px 0 rgb(0 0 0 / 0.1) | Tarjetas |
| --shadow-md | 0 4px 6px -1px rgb(0 0 0 / 0.1) | Desplegables |
| --shadow-lg | 0 10px 15px -3px rgb(0 0 0 / 0.1) | Modales |
| --shadow-xl | 0 20px 25px -5px rgb(0 0 0 / 0.1) | Diálogos |
| --shadow-2xl | 0 25px 50px -12px rgb(0 0 0 / 0.25) | Superposiciones |
| --shadow-inner | inset 0 2px 4px 0 rgb(0 0 0 / 0.05) | Inputs |
| --shadow-none | none | Resetear |

──────────────────────────────────────────────────────────────
⭕ RADIOS (Border Radius)
──────────────────────────────────────────────────────────────

| Token | Valor | Uso |
|-------|-------|-----|
| --radius-none | 0 | Afilado |
| --radius-sm | 0.125rem (2px) | Sutil |
| --radius-md | 0.375rem (6px) | Botones, inputs |
| --radius-lg | 0.5rem (8px) | Tarjetas |
| --radius-xl | 0.75rem (12px) | Modales |
| --radius-2xl | 1rem (16px) | Tarjetas grandes |
| --radius-full | 9999px | Pills, avatares |

──────────────────────────────────────────────────────────────
⏱️ TRANSICIONES
──────────────────────────────────────────────────────────────

### Duraciones
| Token | Valor | Uso |
|-------|-------|-----|
| --duration-75 | 75ms | Micro |
| --duration-100 | 100ms | Rápida |
| --duration-150 | 150ms | Por defecto |
| --duration-200 | 200ms | Normal |
| --duration-300 | 300ms | Lenta |
| --duration-500 | 500ms | Énfasis |

### Curvas de aceleración
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Transiciones compuestas
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

| Token | Valor | Uso |
|-------|-------|-----|
| --z-0 | 0 | Base |
| --z-10 | 10 | Elevado |
| --z-20 | 20 | Desplegables |
| --z-30 | 30 | Sticky |
| --z-40 | 40 | Fijo |
| --z-50 | 50 | Fondo modal |
| --z-60 | 60 | Modal |
| --z-70 | 70 | Popover |
| --z-80 | 80 | Toast |
| --z-90 | 90 | Tooltip |
| --z-max | 9999 | Máximo |
```

### Paso 3: Exportar

Generar los archivos:
- `tokens.css` - CSS Custom Properties
- `tokens.json` - Formato Style Dictionary
- `tailwind.config.js` - Extensión de Tailwind (si aplica)
