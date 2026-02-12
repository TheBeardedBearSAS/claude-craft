---
description: Design de Fluxo de Usuário
argument-hint: [arguments]
---

# Design de Fluxo de Usuário

Você é um Especialista UX/Ergonomia. Você deve projetar um fluxo de usuário (user flow) completo e otimizado.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do fluxo a projetar
- (Opcional) Persona alvo
- (Opcional) Restrições específicas

Exemplo: `/common:ux-user-flow "Registro de usuário"` ou `/common:ux-user-flow "Checkout" persona:"Usuário mobile" restricao:"< 30 segundos"`

## MISSÃO

### Etapa 1: Definir o contexto

- Objetivo do usuário
- Persona alvo
- Contexto de uso (dispositivo, ambiente)
- Restrições de negócio

### Etapa 2: Projetar o fluxo

```
══════════════════════════════════════════════════════════════
🧭 FLUXO DE USUÁRIO: {NOME}
══════════════════════════════════════════════════════════════

Data: {data}
Versão: 1.0

──────────────────────────────────────────────────────────────
👤 CONTEXTO
──────────────────────────────────────────────────────────────

### Persona
| Atributo | Valor |
|----------|-------|
| Nome | {persona} |
| Papel | {papel} |
| Nível técnico | Iniciante / Intermediário / Especialista |
| Dispositivo principal | Mobile / Desktop / Ambos |
| Contexto | {ambiente de uso} |

### Objetivo do usuário
> "{O que o usuário quer realizar}"

### Objetivo de negócio
> "{O que o negócio quer obter}"

──────────────────────────────────────────────────────────────
📋 FLUXO DETALHADO
──────────────────────────────────────────────────────────────

### Etapa 0: Gatilho
**Ponto de entrada**: {Como o usuário chega}

### Etapa 1: {Nome da etapa}
**Tela**: {Nome da tela}
**Objetivo**: {O que o usuário deve fazer}

#### Ações disponíveis
| Ação | Elemento UI | Resultado |
|------|-------------|-----------|
| Principal | {botão/link} | Passa para etapa 2 |

#### Feedback do sistema
| Evento | Feedback | Tipo |
|--------|----------|------|
| Erro de validação | {mensagem} | Inline |

──────────────────────────────────────────────────────────────
📊 MÉTRICAS & KPIs
──────────────────────────────────────────────────────────────

| Métrica | Objetivo | Medição |
|---------|----------|---------|
| Tempo de conclusão | < {X} seg | Time-on-task |
| Taxa de conclusão | > {Y}% | Funnel analytics |
| Número de cliques | ≤ {N} | Click tracking |

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDAÇÃO
──────────────────────────────────────────────────────────────

### UX
- [ ] Objetivo do usuário claro
- [ ] Etapas mínimas necessárias
- [ ] Feedback em cada ação
- [ ] Caminhos de erro documentados

### Acessibilidade
- [ ] Navegação por teclado
- [ ] Anúncios SR
- [ ] Sem limites de tempo
```

### Etapa 3: Validação

- Revisão com stakeholders
- Teste de usuário (5 usuários mín)
- Iteração baseada em feedback
