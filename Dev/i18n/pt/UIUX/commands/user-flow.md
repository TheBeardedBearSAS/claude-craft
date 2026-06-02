---
description: Design de Fluxo de Usuário
argument-hint: [argumentos]
---

# Design de Fluxo de Usuário

Você é um Especialista em UX/Ergonomia. Você deve projetar um fluxo de usuário completo e otimizado.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do fluxo a projetar
- (Opcional) Persona-alvo
- (Opcional) Restrições específicas

Exemplo: `/uiux:user-flow "Cadastro de usuário"` ou `/uiux:user-flow "Checkout" persona:"Usuário mobile" constraint:"< 30 segundos"`

## Modo de Planejamento

> **O modo de planejamento é recomendado.** Claude ativa o modo de planejamento para estruturar a abordagem, identificar dependências e apresentar uma estratégia de geração antes de criar os artefatos.

## MISSÃO

### Etapa 1: Definir o contexto

- Objetivo do usuário
- Persona-alvo
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
| Função | {função} |
| Nível técnico | Iniciante / Intermediário / Avançado |
| Dispositivo principal | Mobile / Desktop / Ambos |
| Contexto | {ambiente de uso} |

### Objetivo do usuário
> "{O que o usuário quer realizar}"

### Objetivo de negócio
> "{O que a empresa quer alcançar}"

### Restrições
- Tempo máximo: {X segundos/minutos}
- Etapas máximas: {Y}
- Dispositivo: {restrições técnicas}
- Offline: Sim / Não

──────────────────────────────────────────────────────────────
🗺️ VISÃO GERAL
──────────────────────────────────────────────────────────────

```
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│Início│───▶│Etapa1│───▶│Etapa2│───▶│Etapa3│───▶│ Fim  │
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘
                │            │
                ▼            ▼
           ┌────────┐   ┌────────┐
           │Erro A  │   │Erro B  │
           └────────┘   └────────┘
```

──────────────────────────────────────────────────────────────
📋 FLUXO DETALHADO
──────────────────────────────────────────────────────────────

### Etapa 0: Gatilho

**Ponto de entrada**: {Como o usuário chega}
- Via: {menu / link / CTA / deep link}
- Estado anterior: {autenticado / anônimo / dados existentes}
- Pré-condições: {o que deve ser verdadeiro}

---

### Etapa 1: {Nome da etapa}

**Tela**: {Nome da tela}
**Objetivo**: {O que o usuário deve fazer}

#### Ações disponíveis
| Ação | Elemento de IU | Resultado |
|------|----------------|-----------|
| Primária | {botão/link} | Avança para a etapa 2 |
| Secundária | {botão/link} | {alternativa} |
| Terciária | {link} | {outra opção} |

#### Dados necessários
| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| {campo} | {tipo} | {regras} | Sim/Não |

#### Feedback do sistema
| Evento | Feedback | Tipo |
|--------|----------|------|
| Foco no campo | {feedback} | Visual |
| Erro de validação | {mensagem} | Inline |
| Sucesso | {feedback} | Toast/inline |

#### Pontos de atenção
- ⚠️ {possível ponto de atrito}
- 💡 {oportunidade de melhoria}

---

### Etapa 2: {Nome da etapa}

{Mesma estrutura...}

---

### Etapa N: Confirmação (Fim)

**Tela**: {Confirmação / Sucesso}
**Estado final**: {O que foi realizado}

#### Conteúdo
- Mensagem de sucesso
- Resumo da ação
- Próximos passos sugeridos

#### Próximas ações
| Ação | Destino |
|------|---------|
| CTA Primário | {próximo fluxo} |
| Voltar | {painel/lista} |
| Compartilhar | {se aplicável} |

──────────────────────────────────────────────────────────────
⚠️ CAMINHOS ALTERNATIVOS
──────────────────────────────────────────────────────────────

### Erro: {Tipo de erro}

**Gatilho**: {O que causa o erro}
**Tela**: {Inline / Modal / Página dedicada}

#### Mensagem de erro
```
Título: {Título claro}
Descrição: {Explicação do problema}
Ação: {Como resolver}
```

#### Opções do usuário
- Tentar novamente: {comportamento}
- Modificar: {retornar à etapa X}
- Abandonar: {estado salvo?}

---

### Abandono: Salvamento de estado

**Comportamento**:
- Rascunho salvo automaticamente
- Duração de retenção: {X dias}
- Notificação de lembrete: Sim / Não

---

### Caso extremo: {Descrição}

**Situação**: {Contexto particular}
**Comportamento**: {Adaptação do fluxo}

──────────────────────────────────────────────────────────────
📊 MÉTRICAS E KPIs
──────────────────────────────────────────────────────────────

### Objetivos quantitativos

| Métrica | Objetivo | Medição |
|---------|----------|---------|
| Tempo de conclusão | < {X} seg | Time-on-task |
| Taxa de conclusão | > {Y}% | Funil analítico |
| Taxa de erro | < {Z}% | Error rate |
| Número de cliques | ≤ {N} | Click tracking |
| Pontuação de satisfação | > {S}/5 | Pesquisa pós-tarefa |

### Pontos de medição

| Etapa | Evento a rastrear |
|-------|-------------------|
| Entrada | `flow_started` |
| Etapa 1 | `step_1_completed` |
| Etapa 2 | `step_2_completed` |
| Sucesso | `flow_completed` |
| Abandono | `flow_abandoned` com `last_step` |
| Erro | `flow_error` com `error_type` |

──────────────────────────────────────────────────────────────
🧠 ERGONOMIA
──────────────────────────────────────────────────────────────

### Carga cognitiva

| Etapa | Complexidade | Justificativa |
|-------|-------------|---------------|
| 1 | Baixa | {1-2 ações simples} |
| 2 | Média | {formulário curto} |
| 3 | Baixa | {somente confirmação} |

### Princípios aplicados

| Princípio | Aplicação |
|-----------|-----------|
| Divulgação progressiva | {como} |
| Valores padrão | {quais} |
| Validação inline | {quando} |
| Salvamento automático | {frequência} |

──────────────────────────────────────────────────────────────
♿ ACESSIBILIDADE
──────────────────────────────────────────────────────────────

### Navegação por teclado
- Ordem de tabulação: {sequência lógica}
- Links de salto: {se formulário longo}
- Gestão do foco: {na mudança de etapa}

### Leitor de tela
- Anúncio de etapa: "Etapa X de Y"
- Erros: aria-live="assertive"
- Progresso: aria-describedby

### Tempo
- Sem limite de tempo automático
- Se houver atraso: extensível ou desativável

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDAÇÃO
──────────────────────────────────────────────────────────────

### UX
- [ ] Objetivo do usuário claro
- [ ] Mínimo de etapas necessárias
- [ ] Feedback em cada ação
- [ ] Caminhos de erro documentados
- [ ] Abandono com salvamento

### Mensurabilidade
- [ ] KPIs definidos
- [ ] Eventos de rastreamento listados
- [ ] Objetivos quantificados

### Acessibilidade
- [ ] Navegação por teclado
- [ ] Anúncios para leitor de tela
- [ ] Sem limites de tempo
```

### Etapa 3: Validação

- Revisão com as partes interessadas
- Teste com usuários (mínimo 5 usuários)
- Iteração com base no feedback
