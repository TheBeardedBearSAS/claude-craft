---
description: Especificação de Acessibilidade de Componente
argument-hint: [arguments]
---

# Especificação de Acessibilidade de Componente

Você é um Especialista em Acessibilidade certificado. Você deve produzir as especificações de acessibilidade completas para um componente UI.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do componente
- (Opcional) Tipo: button, input, modal, dropdown, tabs, accordion, tooltip, etc.

Exemplo: `/common:a11y-component Modal` ou `/common:a11y-component "Seletor de Data" tipo:input`

## MISSÃO

### Etapa 1: Identificar o padrão ARIA

Consultar o ARIA Authoring Practices Guide (APG) para o padrão correspondente.

### Etapa 2: Produzir a especificação

```
══════════════════════════════════════════════════════════════
♿ ESPECIFICAÇÃO ACESSIBILIDADE: {NOME_COMPONENTE}
══════════════════════════════════════════════════════════════

Tipo: {Button | Input | Dialog | Listbox | Tabs | ...}
Padrão APG: {link para o padrão oficial}
Data: {data}

──────────────────────────────────────────────────────────────
📋 SEMÂNTICA HTML
──────────────────────────────────────────────────────────────

### Elemento nativo recomendado
```html
<!-- Sempre preferir elemento nativo -->
<{elemento} ...>
  {conteúdo}
</{elemento}>
```

### Estrutura completa
```html
<!-- Exemplo completo com ARIA -->
<div
  role="{role}"
  aria-{atributo}="{valor}"
  tabindex="0"
>
  <span id="{id}-label">{Label}</span>
  {conteúdo}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ATRIBUTOS ARIA
──────────────────────────────────────────────────────────────

### Atributos requeridos
| Atributo | Valor | Quando | Descrição |
|----------|-------|--------|-----------|
| role | {role} | Sempre (se custom) | Define o tipo |
| aria-label | "{texto}" | Se não há label visível | Label acessível |

### Atributos condicionais
| Atributo | Valor | Quando | Descrição |
|----------|-------|--------|-----------|
| aria-expanded | "true"/"false" | Se expansível | Estado aberto/fechado |
| aria-disabled | "true" | Se desabilitado | Estado desabilitado |

──────────────────────────────────────────────────────────────
⌨️ NAVEGAÇÃO POR TECLADO
──────────────────────────────────────────────────────────────

| Tecla | Ação | Detalhe |
|-------|------|---------|
| Tab | Foco no componente | Entra no componente |
| Enter | Ativar | Ação principal |
| Space | Ativar (toggle) | Para botões toggle |
| Escape | Fechar/Cancelar | Se popup/modal |
| Setas | Navegação interna | Em listas |

──────────────────────────────────────────────────────────────
🔊 ANÚNCIOS DO LEITOR DE TELA
──────────────────────────────────────────────────────────────

### Ao entrar (foco)
```
"{Label}, {papel}, {estado}"
Exemplos:
- "Enviar, botão"
- "Menu principal, menu, recolhido"
```

### Durante interação
| Ação | Anúncio |
|------|---------|
| Expansão | "expandido" / "recolhido" |
| Erro | "Erro: {mensagem}" |

──────────────────────────────────────────────────────────────
📐 ALVOS DE TOQUE (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

| Critério | Valor | Status |
|----------|-------|--------|
| Tamanho mínimo | 44 × 44 pixels CSS | ✅/❌ |
| Espaçamento entre alvos | ≥ 8px | ✅/❌ |

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDAÇÃO
──────────────────────────────────────────────────────────────

### Semântica
- [ ] Elemento HTML nativo usado se possível
- [ ] Role ARIA correto se custom
- [ ] Estrutura DOM lógica

### ARIA
- [ ] Atributos requeridos presentes
- [ ] Sem excesso de ARIA (nativo > ARIA)

### Teclado
- [ ] Focável (tabindex apropriado)
- [ ] Todas as ações via teclado
- [ ] Sem armadilha de teclado
- [ ] Foco visível conforme

### Contraste
- [ ] Texto ≥ 7:1 (AAA)
- [ ] UI ≥ 3:1
```
