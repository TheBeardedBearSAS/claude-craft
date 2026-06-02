---
description: Especificação de Acessibilidade de Componente
argument-hint: [argumentos]
---

# Especificação de Acessibilidade de Componente

Você é um Especialista em Acessibilidade certificado. Você deve produzir especificações completas de acessibilidade para um componente de IU.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do componente
- (Opcional) Tipo: button, input, modal, dropdown, tabs, accordion, tooltip, etc.

Exemplo: `/uiux:a11y-component Modal` ou `/uiux:a11y-component "Date Picker" type:input`

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar a sua validação antes de fazer qualquer alteração.

## MISSÃO

### Etapa 1: Identificar o padrão ARIA

Consultar o Guia de Práticas de Autoria ARIA (APG) para o padrão correspondente.

### Etapa 2: Produzir a especificação

```
══════════════════════════════════════════════════════════════
♿ ESPECIFICAÇÃO DE ACESSIBILIDADE: {NOME_DO_COMPONENTE}
══════════════════════════════════════════════════════════════

Tipo: {Button | Input | Dialog | Listbox | Tabs | ...}
Padrão APG: {link para o padrão oficial}
Data: {data}

──────────────────────────────────────────────────────────────
📋 SEMÂNTICA HTML
──────────────────────────────────────────────────────────────

### Elemento nativo recomendado

```html
<!-- Sempre prefira o elemento nativo -->
<{elemento} ...>
  {conteúdo}
</{elemento}>
```

### Se componente customizado for necessário

```html
<div role="{role}" ...>
  {conteúdo}
</div>
```

### Estrutura completa

```html
<!-- Exemplo completo com ARIA -->
<div
  role="{role}"
  aria-{atributo}="{valor}"
  tabindex="0"
>
  <span id="{id}-label">{Rótulo}</span>
  <div id="{id}-description">{Descrição}</div>
  {conteúdo}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ATRIBUTOS ARIA
──────────────────────────────────────────────────────────────

### Atributos obrigatórios

| Atributo | Valor | Quando | Descrição |
|----------|-------|--------|-----------|
| role | {role} | Sempre (se customizado) | Define o tipo |
| aria-label | "{texto}" | Se sem rótulo visível | Rótulo acessível |
| aria-labelledby | "{id}" | Se rótulo visível | Referência ao rótulo |

### Atributos condicionais

| Atributo | Valor | Quando | Descrição |
|----------|-------|--------|-----------|
| aria-describedby | "{id}" | Se há descrição | Referência à descrição |
| aria-expanded | "true"/"false" | Se expansível | Estado aberto/fechado |
| aria-controls | "{id}" | Se controla outro | ID do elemento controlado |
| aria-owns | "{id}" | Se DOM separado | Relação pai |
| aria-haspopup | "dialog"/"menu"/"listbox" | Se popup | Tipo de popup |
| aria-pressed | "true"/"false" | Se toggle | Estado pressionado |
| aria-selected | "true"/"false" | Se seleção | Estado selecionado |
| aria-checked | "true"/"false"/"mixed" | Se caixa de seleção | Estado marcado |
| aria-disabled | "true" | Se desabilitado | Estado desabilitado |
| aria-invalid | "true" | Se erro | Estado inválido |
| aria-required | "true" | Se obrigatório | Campo obrigatório |
| aria-busy | "true" | Se carregando | Em progresso |
| aria-live | "polite"/"assertive" | Se dinâmico | Anunciar alteração |
| aria-atomic | "true" | Com aria-live | Anunciar tudo |

### Estados por interação

| Estado | Atributos ARIA |
|--------|----------------|
| Padrão | {atributos base} |
| Hover | Sem alteração ARIA |
| Foco | Sem alteração ARIA |
| Expandido | aria-expanded="true" |
| Recolhido | aria-expanded="false" |
| Selecionado | aria-selected="true" |
| Desabilitado | aria-disabled="true" |
| Carregando | aria-busy="true" |
| Erro | aria-invalid="true", aria-errormessage="{id}" |

──────────────────────────────────────────────────────────────
⌨️ NAVEGAÇÃO POR TECLADO
──────────────────────────────────────────────────────────────

### Teclas principais

| Tecla | Ação | Detalhe |
|-------|------|---------|
| Tab | Foco no componente | Entra no componente |
| Shift+Tab | Foco anterior | Sai do componente |
| Enter | Ativar | Ação primária |
| Space | Ativar (toggle) | Para botões de alternância |
| Escape | Fechar/Cancelar | Se popup/modal |
| ↑ Seta para cima | Item anterior | Navegação em lista |
| ↓ Seta para baixo | Próximo item | Navegação em lista |
| ← Seta para esquerda | Item anterior (horizontal) | Abas, slider |
| → Seta para direita | Próximo item (horizontal) | Abas, slider |
| Home | Primeiro item | Navegação rápida |
| End | Último item | Navegação rápida |

### Gestão do foco

| Situação | Comportamento |
|----------|---------------|
| Abertura | Foco no {primeiro elemento focalizável} |
| Fechamento | Foco retorna ao {elemento acionador} |
| Navegação interna | Roving tabindex OU aria-activedescendant |
| Armadilha de foco | {Sim para modal / Não para dropdown} |

### Roving tabindex (se aplicável)

```html
<!-- Apenas um elemento focalizável por vez -->
<div role="tablist">
  <button role="tab" tabindex="0" aria-selected="true">Aba 1</button>
  <button role="tab" tabindex="-1" aria-selected="false">Aba 2</button>
  <button role="tab" tabindex="-1" aria-selected="false">Aba 3</button>
</div>
```

──────────────────────────────────────────────────────────────
🎯 FOCO VISÍVEL
──────────────────────────────────────────────────────────────

### Estilo obrigatório (WCAG 2.4.11 AAA)

```css
.{componente}:focus-visible {
  /* Contorno visível */
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;

  /* Proporção de contraste ≥ 3:1 */
  /* Área de foco ≥ perímetro visível */
}

/* Redefinir para mouse */
.{componente}:focus:not(:focus-visible) {
  outline: none;
}
```

### Verificações

| Critério | Valor | Status |
|----------|-------|--------|
| Espessura do contorno | ≥ 2px | ✅ |
| Contraste do contorno | ≥ 3:1 | ✅ |
| Área visível | ≥ perímetro | ✅ |
| Visível em todos os fundos | Sim | ✅ |

──────────────────────────────────────────────────────────────
🔊 ANÚNCIOS DO LEITOR DE TELA
──────────────────────────────────────────────────────────────

### Ao entrar (foco)

```
"{Rótulo}, {role}, {estado}"

Exemplos:
- "Enviar, botão"
- "Menu principal, menu, recolhido"
- "Nome, campo de texto, obrigatório"
- "Newsletter, caixa de seleção, não marcada"
```

### Durante a interação

| Ação | Anúncio |
|------|---------|
| Expansão | "expandido" / "recolhido" |
| Seleção | "selecionado" |
| Alternância | "ativado" / "desativado" |
| Carregando | "Carregando" |
| Sucesso | "{mensagem de sucesso}" |
| Erro | "Erro: {mensagem}" |

### Conteúdo dinâmico (aria-live)

```html
<!-- Notificações educadas (não urgentes) -->
<div aria-live="polite" aria-atomic="true">
  {mensagem toast}
</div>

<!-- Notificações urgentes (erros) -->
<div aria-live="assertive" aria-atomic="true">
  {mensagem de erro}
</div>
```

──────────────────────────────────────────────────────────────
📏 CONTRASTE (WCAG AAA)
──────────────────────────────────────────────────────────────

### Texto

| Tipo | Proporção requerida | Verificação |
|------|---------------------|-------------|
| Texto normal (< 18px) | ≥ 7:1 | {cor} / {fundo} = {proporção} |
| Texto grande (≥ 18px ou 14px negrito) | ≥ 4,5:1 | {cor} / {fundo} = {proporção} |

### Elementos de IU

| Elemento | Proporção requerida | Verificação |
|----------|---------------------|-------------|
| Bordas | ≥ 3:1 | {cor} / {fundo} = {proporção} |
| Ícones | ≥ 3:1 | {cor} / {fundo} = {proporção} |
| Contorno de foco | ≥ 3:1 | {cor} / {fundo} = {proporção} |

### Estados

| Estado | Verificação de contraste |
|--------|--------------------------|
| Padrão | ✅ {proporção} |
| Hover | ✅ {proporção} |
| Foco | ✅ {proporção} |
| Desabilitado | ⚠️ Não obrigatório, mas recomendado |

──────────────────────────────────────────────────────────────
📐 ALVOS DE TOQUE (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

### Dimensões mínimas

| Critério | Valor | Status |
|----------|-------|--------|
| Tamanho mínimo | 44 × 44 pixels CSS | ✅/❌ |
| Espaçamento entre alvos | ≥ 8px | ✅/❌ |

### Implementação

```css
.{componente} {
  min-width: 44px;
  min-height: 44px;
  /* OU padding para atingir 44px */
  padding: 10px 16px; /* se altura do texto ~24px */
}

/* Botões com ícone */
.{componente}-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

──────────────────────────────────────────────────────────────
🧪 TESTES A REALIZAR
──────────────────────────────────────────────────────────────

### Automatizados

- [ ] axe DevTools: 0 violações
- [ ] Lighthouse Accessibility: 100/100
- [ ] ESLint jsx-a11y: 0 erros

### Manuais

- [ ] Navegação completa por teclado
- [ ] Foco visível em cada etapa
- [ ] Sem armadilha de teclado
- [ ] Ordem de foco lógica

### Leitor de tela

- [ ] VoiceOver (macOS/iOS): anúncios corretos
- [ ] NVDA (Windows): navegação em listas/tabelas
- [ ] TalkBack (Android): se móvel

### Casos extremos

- [ ] Zoom 400%: sem perda de conteúdo
- [ ] Modo de alto contraste: visível
- [ ] Movimento reduzido: animações respeitadas

──────────────────────────────────────────────────────────────
💻 EXEMPLO DE IMPLEMENTAÇÃO
──────────────────────────────────────────────────────────────

```tsx
// {Componente}.tsx
import { forwardRef, useId } from 'react';

interface {Componente}Props {
  label: string;
  description?: string;
  disabled?: boolean;
  // ...outras props
}

export const {Componente} = forwardRef<HTML{Elemento}Element, {Componente}Props>(
  ({ label, description, disabled, ...props }, ref) => {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <{elemento}
        ref={ref}
        id={id}
        role="{role}"
        aria-label={label}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {/* Conteúdo */}

        {description && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </{elemento}>
    );
  }
);

{Componente}.displayName = '{Componente}';
```

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDAÇÃO
──────────────────────────────────────────────────────────────

### Semântica
- [ ] Elemento HTML nativo utilizado quando possível
- [ ] Role ARIA correto se customizado
- [ ] Estrutura DOM lógica

### ARIA
- [ ] Atributos obrigatórios presentes
- [ ] Atributos condicionais corretos
- [ ] Sem sobrecarga de ARIA (nativo > ARIA)

### Teclado
- [ ] Focalizável (tabindex apropriado)
- [ ] Todas as ações via teclado
- [ ] Sem armadilha de teclado
- [ ] Foco visível conforme

### Anúncios
- [ ] Rótulo anunciado ao focar
- [ ] Estados anunciados na mudança
- [ ] Erros com aria-live assertive

### Contraste
- [ ] Texto ≥ 7:1 (AAA)
- [ ] IU ≥ 3:1
- [ ] Foco ≥ 3:1

### Toque
- [ ] Alvos ≥ 44×44px
- [ ] Espaçamento ≥ 8px
```
