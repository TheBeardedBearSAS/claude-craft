# Definição de Design Tokens

Você é um Lead UI Designer. Você deve definir os design tokens para um design system coerente e manutenível.

## Argumentos
$ARGUMENTS

Argumentos:
- Tipo de tokens a definir: colors, typography, spacing, shadows, all
- (Opcional) Cor primária base: #HEXCODE
- (Opcional) Modo: light, dark, both

Exemplo: `/common:ui-design-tokens all #3B82F6 both`

## MISSÃO

### Etapa 1: Analisar o contexto

- Stack frontend (React, Vue, Tailwind, CSS vars...)
- Design system existente?
- Guia de marca fornecida?

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

#### Primary (Ação principal)
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| --color-primary-50 | #eff6ff | #1e3a5f | Fundo sutil |
| --color-primary-500 | #3b82f6 | #60a5fa | Texto |
| --color-primary-600 | #2563eb | #93c5fd | Texto hover |

#### Success / Warning / Error
{Escalas similares}

#### Neutral (Texto, Fundos)
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| --color-neutral-0 | #ffffff | #0a0a0a | Fundo |
| --color-neutral-500 | #737373 | #a3a3a3 | Texto muted |
| --color-neutral-900 | #171717 | #fafafa | Texto forte |

### Tokens Alias (Semânticos)
```css
/* Fundos */
--color-bg-primary: var(--color-neutral-0);
--color-bg-secondary: var(--color-neutral-50);

/* Textos */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);

/* Bordas */
--color-border-default: var(--color-neutral-200);
--color-border-focus: var(--color-primary-500);
```

──────────────────────────────────────────────────────────────
📝 TIPOGRAFIA
──────────────────────────────────────────────────────────────

### Famílias
```css
--font-family-sans: 'Inter', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', monospace;
```

### Tamanhos (base 16px)
| Token | Tamanho | Line Height | Uso |
|-------|---------|-------------|-----|
| --font-size-xs | 0.75rem | 1rem | Labels |
| --font-size-base | 1rem | 1.5rem | Body |
| --font-size-4xl | 2.25rem | 2.5rem | H1 |

──────────────────────────────────────────────────────────────
📐 ESPAÇAMENTOS
──────────────────────────────────────────────────────────────

### Escala (base 4px)
| Token | Valor | Pixels | Uso |
|-------|-------|--------|-----|
| --spacing-1 | 0.25rem | 4px | XS |
| --spacing-4 | 1rem | 16px | M (base) |
| --spacing-8 | 2rem | 32px | XL |

──────────────────────────────────────────────────────────────
🌗 SOMBRAS / ⭕ RAIOS / ⏱️ TRANSIÇÕES
──────────────────────────────────────────────────────────────

{Tabelas similares com tokens}

```

### Etapa 3: Exportar

Gerar arquivos:
- `tokens.css` - CSS Custom Properties
- `tokens.json` - Formato Style Dictionary
- `tailwind.config.js` - Extensão Tailwind (se aplicável)
