# Especificação Completa de Componente UI/UX/A11y

Você é o Orquestrador UI/UX. Você deve produzir uma especificação completa de componente envolvendo os 3 especialistas: UX para o comportamento, UI para o visual, A11y para a acessibilidade.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do componente a especificar
- (Opcional) Contexto de uso

Exemplo: `/common:uiux-component-spec Button` ou `/common:uiux-component-spec "Cartão de Viagem" contexto:"SaaS de Turismo"`

## MISSÃO

### Etapa 1: Análise UX (Especialista UX)

Definir comportamento e uso:
- Objetivo do componente
- Casos de uso principais
- Interações esperadas
- Estados funcionais

### Etapa 2: Especificação UI (Especialista UI)

Definir o visual:
- Anatomia e estrutura
- Variantes
- Estados visuais
- Tokens utilizados
- Responsive

### Etapa 3: Especificação A11y (Especialista A11y)

Definir acessibilidade:
- Semântica HTML
- Atributos ARIA
- Navegação por teclado
- Anúncios de leitor de tela

### Etapa 4: Síntese

```
══════════════════════════════════════════════════════════════
📦 ESPECIFICAÇÃO DE COMPONENTE: {NOME}
══════════════════════════════════════════════════════════════

Categoria: Átomo | Molécula | Organismo
Data: {data}
Versão: 1.0

──────────────────────────────────────────────────────────────
🧠 COMPORTAMENTO (UX)
──────────────────────────────────────────────────────────────

### Objetivo
{Descrição do papel e valor para o usuário}

### Casos de Uso
| Caso | Contexto | Comportamento Esperado |
|------|----------|------------------------|
| Principal | {contexto} | {comportamento} |
| Secundário | {contexto} | {comportamento} |

### Estados Funcionais
| Estado | Gatilho | Comportamento |
|--------|---------|---------------|
| default | Inicial | {comportamento} |
| loading | Ação em curso | {comportamento} |
| success | Ação bem-sucedida | {comportamento} |
| error | Falha | {comportamento} |
| empty | Sem dados | {comportamento} |

### Feedback ao Usuário
| Ação | Feedback | Atraso |
|------|----------|--------|
| Clique | {feedback} | Imediato |
| Hover | {feedback} | Imediato |
| Submit | {feedback} | < 200ms |

──────────────────────────────────────────────────────────────
🎨 VISUAL (UI)
──────────────────────────────────────────────────────────────

### Anatomia
```
┌─────────────────────────────────┐
│ [Ícone]  Label          [Ação] │
│          Descrição             │
└─────────────────────────────────┘
```

- **Slot 1**: {descrição}
- **Slot 2**: {descrição}

### Dimensões
| Propriedade | Mobile | Tablet | Desktop |
|-------------|--------|--------|---------|
| min-width | {val} | {val} | {val} |
| height | {val} | {val} | {val} |
| padding | {val} | {val} | {val} |

### Variantes
| Variante | Uso | Diferenças Visuais |
|----------|-----|-------------------|
| primary | CTA principal | {tokens} |
| secondary | Ação secundária | {tokens} |
| ghost | Ação terciária | {tokens} |
| destructive | Exclusão | {tokens} |

### Estados Visuais
| Estado | Fundo | Borda | Texto | Outro |
|--------|-------|-------|-------|-------|
| default | --color-{x} | --color-{x} | --color-{x} | |
| hover | --color-{x} | --color-{x} | --color-{x} | cursor: pointer |
| focus | --color-{x} | --color-{x} | --color-{x} | outline: 2px |
| active | --color-{x} | --color-{x} | --color-{x} | transform |
| disabled | --color-{x} | --color-{x} | --color-{x} | opacity: 0.5 |
| loading | --color-{x} | --color-{x} | --color-{x} | spinner |

### Micro-interações
| Gatilho | Animação | Duração | Easing |
|---------|----------|---------|--------|
| hover | {efeito} | 150ms | ease-out |
| click | {efeito} | 100ms | ease-in |
| focus | {efeito} | 0ms | - |

### Tokens Utilizados
```css
/* Cores */
--color-primary-500
--color-neutral-100
--color-error-500

/* Tipografia */
--font-size-sm
--font-weight-medium

/* Espaçamento */
--spacing-2
--spacing-4

/* Outros */
--radius-md
--shadow-sm
--transition-fast
```

──────────────────────────────────────────────────────────────
♿ ACESSIBILIDADE (A11y)
──────────────────────────────────────────────────────────────

### Semântica HTML
```html
<button type="button" class="{componente}">
  <!-- Usar elemento nativo -->
</button>
```

### Atributos ARIA
| Atributo | Valor | Condição |
|----------|-------|----------|
| aria-label | "{texto}" | Se apenas ícone |
| aria-describedby | "{id}" | Se descrição |
| aria-disabled | "true" | Se desabilitado |
| aria-busy | "true" | Se carregando |

### Navegação por Teclado
| Tecla | Ação |
|-------|------|
| Tab | Foco no elemento |
| Enter | Ativar |
| Space | Ativar |
| Escape | Cancelar (se aplicável) |

### Gerenciamento de Foco
- **Foco inicial**: Automático via tabindex
- **Estilo de foco**: outline 2px solid, offset 2px, ratio ≥ 3:1
- **Trap**: Não aplicável (não é modal)

### Contraste (AAA)
| Elemento | Ratio Requerido | Ratio Atual |
|----------|-----------------|-------------|
| Texto do label | ≥ 7:1 | ✅ {ratio} |
| Ícone | ≥ 3:1 | ✅ {ratio} |
| Borda | ≥ 3:1 | ✅ {ratio} |

### Anúncios do Leitor de Tela
| Momento | Anúncio |
|---------|---------|
| Foco | "{label}, botão" |
| Carregando | "Carregando" |
| Sucesso | "Ação bem-sucedida" |
| Erro | "Erro: {mensagem}" |

### Alvo de Toque
- Tamanho mínimo: 44×44px ✅
- Espaçamento: ≥ 8px ✅

──────────────────────────────────────────────────────────────
💻 IMPLEMENTAÇÃO
──────────────────────────────────────────────────────────────

### Interface Props (TypeScript)
```typescript
interface {Componente}Props {
  /** Variante visual */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Tamanho do componente */
  size?: 'sm' | 'md' | 'lg';
  /** Estado desabilitado */
  disabled?: boolean;
  /** Estado de carregamento */
  loading?: boolean;
  /** Ícone esquerdo */
  leftIcon?: ReactNode;
  /** Ícone direito */
  rightIcon?: ReactNode;
  /** Handler de clique */
  onClick?: () => void;
  /** Conteúdo */
  children: ReactNode;
}
```

### Exemplo de Uso
```tsx
<Button
  variant="primary"
  size="md"
  leftIcon={<PlusIcon />}
  onClick={handleClick}
>
  Adicionar
</Button>
```

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDAÇÃO
──────────────────────────────────────────────────────────────

### UX
- [ ] Objetivo claro definido
- [ ] Todos os estados funcionais documentados
- [ ] Feedback ao usuário especificado

### UI
- [ ] Todas as variantes definidas
- [ ] Todos os estados visuais especificados
- [ ] Responsive documentado
- [ ] Apenas tokens (sem hardcode)

### A11y
- [ ] Semântica HTML correta
- [ ] ARIA mínimo e correto
- [ ] Navegação por teclado completa
- [ ] Contrastes AAA verificados
- [ ] Alvos de toque ≥ 44px
```
