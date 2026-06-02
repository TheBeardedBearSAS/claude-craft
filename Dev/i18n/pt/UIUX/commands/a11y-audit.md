---
description: Auditoria de Acessibilidade WCAG 2.2 AAA
argument-hint: [argumentos]
---

# Auditoria de Acessibilidade WCAG 2.2 AAA

Você é um Especialista em Acessibilidade certificado. Você deve realizar uma auditoria completa de acessibilidade de acordo com os critérios WCAG 2.2 nível AAA.

## Argumentos
$ARGUMENTS

Argumentos:
- Caminho para a página/componente a ser auditado
- (Opcional) Nível: AA ou AAA (padrão: AAA)
- (Opcional) Foco: all, keyboard, contrast, aria

Exemplo: `/uiux:a11y-audit src/pages/Home.tsx AAA` ou `/uiux:a11y-audit src/components/Modal.tsx AA keyboard`

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

### Etapa 1: Auditoria automatizada

```bash
# Executar ferramentas automatizadas
npx axe-cli {URL}
npx pa11y {URL} --standard WCAG2AAA
npx lighthouse {URL} --only-categories=accessibility

# Verificar pontuação do Lighthouse
# Objetivo: 100/100 em todas as 4 categorias
```

### Etapa 2: Auditoria manual WCAG 2.2

```
══════════════════════════════════════════════════════════════
♿ AUDITORIA DE ACESSIBILIDADE WCAG 2.2 AAA
══════════════════════════════════════════════════════════════

Página/Componente: {nome}
Data: {data}
Auditor: Claude (Especialista A11y)
Nível alvo: AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 PONTUAÇÕES
──────────────────────────────────────────────────────────────

### Lighthouse
| Categoria | Pontuação | Objetivo | Status |
|-----------|-----------|----------|--------|
| Desempenho | /100 | 100 | ✅/❌ |
| Acessibilidade | /100 | 100 | ✅/❌ |
| Boas Práticas | /100 | 100 | ✅/❌ |
| SEO | /100 | 100 | ✅/❌ |

### WCAG 2.2
| Nível | Critérios | Conformes | Não conformes |
|-------|-----------|-----------|---------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ PERCEPTÍVEL
──────────────────────────────────────────────────────────────

### 1.1 Alternativas em Texto

#### 1.1.1 Conteúdo não textual (A)
| Elemento | Texto alternativo | Status | Ação |
|----------|-------------------|--------|------|
| img.logo | "Logo {nome}" | ✅ | - |
| img.hero | "" (ausente) | ❌ | Adicionar alt descritivo |
| img.icon | aria-hidden="true" | ✅ | - |

### 1.3 Adaptável

#### 1.3.1 Informações e Relações (A)
| Verificação | Status | Detalhe |
|-------------|--------|---------|
| Estrutura de títulos | ✅/❌ | h1 → h2 → h3 sequencial |
| Marcos ARIA | ✅/❌ | header, nav, main, footer |
| Listas semânticas | ✅/❌ | ul/ol/dl apropriados |
| Tabelas | ✅/❌ | th, scope, caption |
| Formulários | ✅/❌ | label + fieldset/legend |

### 1.4 Distinguível

#### 1.4.3 Contraste Mínimo (AA) / 1.4.6 Contraste Aprimorado (AAA)
| Elemento | Cores | Proporção | Requerido | Status |
|----------|-------|-----------|-----------|--------|
| Texto do corpo | #333 / #fff | 12,6:1 | 7:1 | ✅ |
| Texto atenuado | #666 / #fff | 5,7:1 | 7:1 | ❌ |
| Botão primário | #fff / #3B82F6 | 4,5:1 | 4,5:1 | ✅ |
| Placeholder | #9CA3AF / #fff | 2,9:1 | 4,5:1 | ❌ |

#### 1.4.10 Redistribuição (AA)
| Teste | Status | Problema |
|-------|--------|----------|
| Largura 320px | ✅/❌ | {rolagem horizontal?} |
| Zoom 400% | ✅/❌ | {conteúdo cortado?} |

#### 1.4.11 Contraste de Componentes Não Textuais (AA)
| Elemento de IU | Proporção | Status |
|----------------|-----------|--------|
| Borda do campo | 3:1 | ✅/❌ |
| Borda do botão | 3:1 | ✅/❌ |
| Ícone de ação | 3:1 | ✅/❌ |
| Anel de foco | 3:1 | ✅/❌ |

──────────────────────────────────────────────────────────────
2️⃣ OPERÁVEL
──────────────────────────────────────────────────────────────

### 2.1 Acessível por Teclado

#### 2.1.1 Teclado (A) / 2.1.3 Teclado Sem Exceção (AAA)
| Elemento | Tab | Enter | Escape | Setas | Status |
|----------|-----|-------|--------|-------|--------|
| Links | ✅ | ✅ | - | - | ✅ |
| Botões | ✅ | ✅ | - | - | ✅ |
| Campos | ✅ | ✅ | - | - | ✅ |
| Dropdown | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modal | ✅ | ✅ | ✅ | - | ✅ |
| div customizada | ❌ | ❌ | - | - | ❌ |

#### 2.1.2 Sem Armadilha de Teclado (A)
| Zona | Entrada | Saída | Status |
|------|---------|-------|--------|
| Modal | Armadilha de foco OK | Escape OK | ✅ |
| Dropdown | Tab OK | Tab/Escape OK | ✅ |
| Barra lateral | Tab OK | Tab OK | ✅ |

### 2.4 Navegável

#### 2.4.1 Ignorar Blocos (A)
| Link de salto | Destino | Status |
|---------------|---------|--------|
| "Ir para o conteúdo" | #main-content | ✅/❌ |
| "Ir para a navegação" | #nav | ✅/❌ |

#### 2.4.3 Ordem do Foco (A)
| Sequência | Esperado | Atual | Status |
|-----------|----------|-------|--------|
| 1 | Link de salto | Link de salto | ✅ |
| 2 | Logo | Logo | ✅ |
| 3 | Item de nav 1 | Item de nav 1 | ✅ |
| ... | ... | ... | ... |

#### 2.4.7 Foco Visível (AA) / 2.4.11 Foco Aprimorado (AA)
| Elemento | Contorno | Deslocamento | Proporção | Status |
|----------|----------|--------------|-----------|--------|
| Links | 2px solid | 2px | 3:1 | ✅ |
| Botões | 2px solid | 2px | 3:1 | ✅ |
| Campos | 2px solid | 0 | 3:1 | ✅ |
| Cards | ❌ | - | - | ❌ |

#### 2.5.5 Tamanho do Alvo (AAA)
| Elemento | Tamanho | Mínimo requerido | Status |
|----------|---------|------------------|--------|
| Botões | 44×40px | 44×44px | ❌ |
| Links do menu | 120×48px | 44×44px | ✅ |
| Botões com ícone | 32×32px | 44×44px | ❌ |
| Caixas de seleção | 24×24px | 44×44px | ❌ |

──────────────────────────────────────────────────────────────
3️⃣ COMPREENSÍVEL
──────────────────────────────────────────────────────────────

### 3.1 Legível

#### 3.1.1 Idioma da Página (A)
```html
<html lang="pt-BR"> <!-- ✅ Presente -->
```

#### 3.1.2 Idioma das Partes (AA)
| Elemento | Idioma | atributo lang | Status |
|----------|--------|---------------|--------|
| Citação estrangeira | Francês | ❌ | ❌ |
| Termo técnico | Francês | ❌ | ⚠️ |

### 3.3 Assistência de Entrada

#### 3.3.1 Identificação de Erros (A)
| Campo | Mensagem de erro | Em texto | Status |
|-------|-----------------|----------|--------|
| E-mail | "E-mail inválido" | ✅ | ✅ |
| Senha | Somente borda vermelha | ❌ | ❌ |

#### 3.3.2 Rótulos ou Instruções (A)
| Campo | Rótulo | Associação | Status |
|-------|--------|------------|--------|
| E-mail | "E-mail" | htmlFor OK | ✅ |
| Busca | ❌ | Sem rótulo | ❌ |
| Telefone | Somente placeholder | Sem rótulo | ❌ |

──────────────────────────────────────────────────────────────
4️⃣ ROBUSTO
──────────────────────────────────────────────────────────────

### 4.1.2 Nome, Função, Valor (A)
| Componente | role | aria-* | Status |
|------------|------|--------|--------|
| Modal | dialog | aria-modal, aria-labelledby | ✅ |
| Dropdown | listbox | aria-expanded, aria-activedescendant | ✅ |
| Abas | tablist/tab | aria-selected, aria-controls | ❌ |
| Acordeão | - | aria-expanded | ❌ |

### 4.1.3 Mensagens de Status (AA)
| Mensagem | aria-live | aria-atomic | Status |
|----------|-----------|-------------|--------|
| Toast sucesso | polite | true | ✅ |
| Toast erro | assertive | true | ✅ |
| Carregando | polite | false | ❌ |
| Erros de formulário | assertive | - | ❌ |

──────────────────────────────────────────────────────────────
❌ VIOLAÇÕES CRÍTICAS (Bloqueantes)
──────────────────────────────────────────────────────────────

| # | Critério | Elemento | Descrição | Correção |
|---|----------|----------|-----------|----------|
| 1 | 1.4.6 | .text-muted | Contraste 5,7:1 < 7:1 | color: #595959 |
| 2 | 2.5.5 | .btn-icon | Tamanho 32px < 44px | min-width: 44px |
| 3 | 3.3.2 | input[type="search"] | Sem rótulo | Adicionar rótulo |

──────────────────────────────────────────────────────────────
⚠️ VIOLAÇÕES MAIORES
──────────────────────────────────────────────────────────────

| # | Critério | Elemento | Descrição | Correção |
|---|----------|----------|-----------|----------|
| 4 | 2.1.1 | .card-clickable | div não focalizável | Usar button |
| 5 | 4.1.2 | .tabs | ARIA incorreto | Adicionar role="tablist" |

──────────────────────────────────────────────────────────────
ℹ️ VIOLAÇÕES MENORES
──────────────────────────────────────────────────────────────

| # | Critério | Elemento | Descrição | Correção |
|---|----------|----------|-----------|----------|
| 6 | 3.1.2 | blockquote | Texto em inglês sem lang | lang="en" |

──────────────────────────────────────────────────────────────
✅ PONTOS DE CONFORMIDADE NOTÁVEIS
──────────────────────────────────────────────────────────────

- Estrutura semântica correta (títulos, marcos)
- Link de salto presente e funcional
- Armadilha de foco correta nos modais
- Mensagens de erro em texto claras

──────────────────────────────────────────────────────────────
🎯 PLANO DE CORREÇÃO
──────────────────────────────────────────────────────────────

### Prioridade 1 — Crítico (esta semana)
1. [ ] Corrigir contraste de .text-muted → #595959
2. [ ] Ampliar alvos de toque para mínimo de 44px
3. [ ] Adicionar rótulos aos campos sem rótulo

### Prioridade 2 — Maior (esta sprint)
4. [ ] Substituir divs clicáveis por button
5. [ ] Corrigir ARIA no componente de Abas
6. [ ] Adicionar aria-live nos estados de carregamento

### Prioridade 3 — Menor (backlog)
7. [ ] Adicionar lang="en" nos textos em inglês
```

### Etapa 3: Teste com leitor de tela

- VoiceOver (macOS): navegação completa
- NVDA (Windows): verificação de anúncios
- TalkBack (Android): se aplicativo móvel

### Etapa 4: Teste somente com teclado

Navegue pela interface completa usando somente o teclado.
