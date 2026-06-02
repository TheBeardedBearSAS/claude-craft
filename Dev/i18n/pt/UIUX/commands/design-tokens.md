---
description: Definição de Design Tokens
argument-hint: [argumentos]
---

# Definição de Design Tokens

Você é um Designer de IU Líder. Você deve definir design tokens para um sistema de design coerente e de fácil manutenção.

## Argumentos
$ARGUMENTS

Argumentos:
- Tipo de tokens a definir: colors, typography, spacing, shadows, all
- (Opcional) Cor primária de base: #HEXCODE
- (Opcional) Modo: light, dark, both

Exemplo: `/uiux:design-tokens all #3B82F6 both`

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar a sua validação antes de fazer qualquer alteração.

## MISSÃO

### Etapa 1: Analisar o contexto

- Stack de front-end (React, Vue, Tailwind, CSS vars...)
- Sistema de design existente?
- Diretrizes de marca fornecidas?

### Etapa 2: Definir os tokens

```
══════════════════════════════════════════════════════════════
🎨 DESIGN TOKENS
══════════════════════════════════════════════════════════════

Projeto: {nome}
Data: {data}
Formato: CSS Custom Properties

──────────────────────────────────────────────────────────────
🎨 CORES
──────────────────────────────────────────────────────────────

### Paleta Semântica

#### Primário (Ação principal)
| Token | Claro | Escuro | Uso |
|-------|-------|--------|-----|
| --color-primary-50 | #eff6ff | #1e3a5f | Fundo sutil |
| --color-primary-100 | #dbeafe | #1e40af | Fundo |
| --color-primary-200 | #bfdbfe | #1d4ed8 | Borda |
| --color-primary-300 | #93c5fd | #2563eb | Borda hover |
| --color-primary-400 | #60a5fa | #3b82f6 | Ícone |
| --color-primary-500 | #3b82f6 | #60a5fa | Texto |
| --color-primary-600 | #2563eb | #93c5fd | Texto hover |
| --color-primary-700 | #1d4ed8 | #bfdbfe | - |
| --color-primary-800 | #1e40af | #dbeafe | - |
| --color-primary-900 | #1e3a5f | #eff6ff | - |

#### Sucesso
| Token | Claro | Escuro |
|-------|-------|--------|
| --color-success-50 | #f0fdf4 | #14532d |
| --color-success-500 | #22c55e | #4ade80 |
| --color-success-700 | #15803d | #86efac |

#### Aviso
| Token | Claro | Escuro |
|-------|-------|--------|
| --color-warning-50 | #fffbeb | #78350f |
| --color-warning-500 | #f59e0b | #fbbf24 |
| --color-warning-700 | #b45309 | #fcd34d |

#### Erro
| Token | Claro | Escuro |
|-------|-------|--------|
| --color-error-50 | #fef2f2 | #7f1d1d |
| --color-error-500 | #ef4444 | #f87171 |
| --color-error-700 | #b91c1c | #fca5a5 |

#### Neutro (Texto, Fundos)
| Token | Claro | Escuro | Uso |
|-------|-------|--------|-----|
| --color-neutral-0 | #ffffff | #0a0a0a | Fundo |
| --color-neutral-50 | #fafafa | #171717 | Fundo sutil |
| --color-neutral-100 | #f5f5f5 | #262626 | Fundo atenuado |
| --color-neutral-200 | #e5e5e5 | #404040 | Borda |
| --color-neutral-300 | #d4d4d4 | #525252 | Borda hover |
| --color-neutral-400 | #a3a3a3 | #737373 | Placeholder |
| --color-neutral-500 | #737373 | #a3a3a3 | Texto atenuado |
| --color-neutral-600 | #525252 | #d4d4d4 | Texto secundário |
| --color-neutral-700 | #404040 | #e5e5e5 | Texto primário |
| --color-neutral-800 | #262626 | #f5f5f5 | Texto de ênfase |
| --color-neutral-900 | #171717 | #fafafa | Texto forte |

### Tokens de Alias (Semânticos)
```css
/* Fundos */
--color-bg-primary: var(--color-neutral-0);
--color-bg-secondary: var(--color-neutral-50);
--color-bg-tertiary: var(--color-neutral-100);
--color-bg-inverse: var(--color-neutral-900);

/* Texto */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);
--color-text-muted: var(--color-neutral-500);
--color-text-inverse: var(--color-neutral-0);

/* Bordas */
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
📝 TIPOGRAFIA
──────────────────────────────────────────────────────────────

### Famílias
```css
--font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Tamanhos (base 16px)
| Token | Tamanho | Altura da linha | Uso |
|-------|---------|-----------------|-----|
| --font-size-xs | 0.75rem (12px) | 1rem | Rótulos, badges |
| --font-size-sm | 0.875rem (14px) | 1.25rem | Corpo pequeno |
| --font-size-base | 1rem (16px) | 1.5rem | Corpo |
| --font-size-lg | 1.125rem (18px) | 1.75rem | Texto de destaque |
| --font-size-xl | 1.25rem (20px) | 1.75rem | H4 |
| --font-size-2xl | 1.5rem (24px) | 2rem | H3 |
| --font-size-3xl | 1.875rem (30px) | 2.25rem | H2 |
| --font-size-4xl | 2.25rem (36px) | 2.5rem | H1 |
| --font-size-5xl | 3rem (48px) | 1 | Display |

### Pesos
| Token | Valor | Uso |
|-------|-------|-----|
| --font-weight-normal | 400 | Corpo |
| --font-weight-medium | 500 | Rótulos, nav |
| --font-weight-semibold | 600 | Subtítulos |
| --font-weight-bold | 700 | Títulos |

### Alturas de Linha
```css
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

### Espaçamento entre Letras
```css
--letter-spacing-tighter: -0.05em;
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

──────────────────────────────────────────────────────────────
📐 ESPAÇAMENTO
──────────────────────────────────────────────────────────────

### Escala (base 4px)
| Token | Valor | Pixels | Uso |
|-------|-------|--------|-----|
| --spacing-0 | 0 | 0px | - |
| --spacing-px | 1px | 1px | Bordas |
| --spacing-0.5 | 0.125rem | 2px | Compacto |
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
| --shadow-sm | 0 1px 3px 0 rgb(0 0 0 / 0.1) | Cards |
| --shadow-md | 0 4px 6px -1px rgb(0 0 0 / 0.1) | Dropdowns |
| --shadow-lg | 0 10px 15px -3px rgb(0 0 0 / 0.1) | Modais |
| --shadow-xl | 0 20px 25px -5px rgb(0 0 0 / 0.1) | Diálogos |
| --shadow-2xl | 0 25px 50px -12px rgb(0 0 0 / 0.25) | Sobreposições |
| --shadow-inner | inset 0 2px 4px 0 rgb(0 0 0 / 0.05) | Campos |
| --shadow-none | none | Redefinir |

──────────────────────────────────────────────────────────────
⭕ RAIOS (Border Radius)
──────────────────────────────────────────────────────────────

| Token | Valor | Uso |
|-------|-------|-----|
| --radius-none | 0 | Arestas vivas |
| --radius-sm | 0.125rem (2px) | Sutil |
| --radius-md | 0.375rem (6px) | Botões, campos |
| --radius-lg | 0.5rem (8px) | Cards |
| --radius-xl | 0.75rem (12px) | Modais |
| --radius-2xl | 1rem (16px) | Cards grandes |
| --radius-full | 9999px | Pílulas, avatares |

──────────────────────────────────────────────────────────────
⏱️ TRANSIÇÕES
──────────────────────────────────────────────────────────────

### Durações
| Token | Valor | Uso |
|-------|-------|-----|
| --duration-75 | 75ms | Micro |
| --duration-100 | 100ms | Rápido |
| --duration-150 | 150ms | Padrão |
| --duration-200 | 200ms | Normal |
| --duration-300 | 300ms | Lento |
| --duration-500 | 500ms | Ênfase |

### Easings
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Transições Compostas
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
| --z-20 | 20 | Dropdowns |
| --z-30 | 30 | Fixo ao rolar |
| --z-40 | 40 | Fixo |
| --z-50 | 50 | Fundo do modal |
| --z-60 | 60 | Modal |
| --z-70 | 70 | Popover |
| --z-80 | 80 | Toast |
| --z-90 | 90 | Tooltip |
| --z-max | 9999 | Máximo |
```

### Etapa 3: Exportar

Gerar os arquivos:
- `tokens.css` — CSS Custom Properties
- `tokens.json` — formato Style Dictionary
- `tailwind.config.js` — extensão do Tailwind (se aplicável)
