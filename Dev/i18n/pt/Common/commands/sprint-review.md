# Preparação da Sprint Review

Você é um Scrum Master experiente. Você deve preparar e facilitar a Sprint Review coletando informações sobre o trabalho realizado.

## Argumentos
$ARGUMENTS

Argumentos:
- Número do sprint

Exemplo: `/common:sprint-review 5`

## MISSÃO

### Etapa 1: Coletar Dados do Sprint

```bash
# Recuperar commits do sprint
git log --since="YYYY-MM-DD" --until="YYYY-MM-DD" --oneline

# PRs mesclados
gh pr list --state merged --search "merged:YYYY-MM-DD..YYYY-MM-DD"

# Issues fechados
gh issue list --state closed --search "closed:YYYY-MM-DD..YYYY-MM-DD"
```

### Etapa 2: Analisar Backlog do Sprint

```
══════════════════════════════════════════════════════════════
🏁 SPRINT REVIEW - Sprint {N}
══════════════════════════════════════════════════════════════

Data: {YYYY-MM-DD}
Meta do Sprint: "{Objetivo}"

──────────────────────────────────────────────────────────────
🎯 ALCANCE DA META DO SPRINT
──────────────────────────────────────────────────────────────

Meta do Sprint alcançada: ✅ SIM / ❌ NÃO / ⚠️ PARCIALMENTE

Justificativa: {Explicação}

──────────────────────────────────────────────────────────────
📦 USER STORIES ENTREGUES
──────────────────────────────────────────────────────────────

| ID | Título | Pontos | Demo | Status |
|----|-------|--------|------|--------|
| US-045 | Registro de usuário | 5 | ✅ | ✅ Entregue |
| US-046 | Login OAuth Google | 8 | ✅ | ✅ Entregue |
| US-047 | Login OAuth GitHub | 5 | ✅ | ✅ Entregue |
| US-048 | Redefinição de senha | 3 | ⚠️ | ⚠️ 80% |

**Entregue: 18/21 pontos (86%)**

──────────────────────────────────────────────────────────────
❌ USER STORIES NÃO CONCLUÍDAS
──────────────────────────────────────────────────────────────

| ID | Título | Pontos | Progresso | Motivo |
|----|-------|--------|------------|--------|
| US-048 | Redefinição de senha | 3 | 80% | API de e-mail indisponível |

Ação: Transferir para Sprint {N+1}

──────────────────────────────────────────────────────────────
📊 MÉTRICAS
──────────────────────────────────────────────────────────────

| Métrica | Valor | Tendência |
|----------|--------|----------|
| Pontos planejados | 21 | - |
| Pontos entregues | 18 | - |
| Velocidade | 18 | ⬆️ (+2 vs S-1) |
| Taxa de conclusão | 86% | ✅ |
| Bugs descobertos | 2 | ✅ |
| Bugs corrigidos | 3 | ⬆️ |

──────────────────────────────────────────────────────────────
🎬 DEMONSTRAÇÃO
──────────────────────────────────────────────────────────────

## Ordem sugerida de demo

1. **US-045: Registro de usuário** (~5 min)
   - Mostrar formulário de registro
   - E-mail de confirmação
   - Ativação de conta
   - Demo por: @dev1

2. **US-046: Login OAuth Google** (~5 min)
   - Botão "Sign in with Google"
   - Fluxo OAuth
   - Criação automática de conta
   - Demo por: @dev2

3. **US-047: Login OAuth GitHub** (~3 min)
   - Mesmo fluxo com GitHub
   - Demo por: @dev1

## Cenário de demo

```gherkin
# Cenário completo para demo
Given Estou na página inicial
When Clico em "Sign up"
And Preencho o formulário
Then Recebo um e-mail de confirmação
And Posso ativar minha conta

Given Estou na página de login
When Clico em "Google"
Then Sou redirecionado para o Google
And Após autenticação, estou logado
```

──────────────────────────────────────────────────────────────
💬 FEEDBACK A COLETAR
──────────────────────────────────────────────────────────────

Perguntas para stakeholders:

1. "O fluxo de registro está claro?"
2. "Estamos faltando algum provedor OAuth?" (Apple, Microsoft, etc.)
3. "O design atende às expectativas?"
4. "Prioridade para o próximo sprint?"

──────────────────────────────────────────────────────────────
📝 NOTAS DA SESSÃO
──────────────────────────────────────────────────────────────

Feedback recebido:
- {Feedback 1}
- {Feedback 2}

Novas solicitações:
- {Solicitação 1} → Criar US-XXX
- {Solicitação 2} → Adicionar ao backlog

Decisões tomadas:
- {Decisão 1}
- {Decisão 2}
```

### Etapa 3: Preparar Materiais

#### 3.1 Gráfico Burndown

```
Pontos |
  21   |████████████████████████████████
  18   |████████████████████████████████
  15   |████████████████████████████████
  12   |████████████████████████████████
   9   |████████████████████████████████
   6   |████████████████████████████████
   3   |████████████████████████████████ (ideal)
   3   |████████████████████████████████ (real)
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10

Legenda: ▓▓ Real  ░░ Ideal
```

#### 3.2 Fluxo Cumulativo

```
US |
 4 |                    ████████████████
 3 |            ████████████████████████
 2 |    ████████████████████████████████
 1 |████████████████████████████████████
   |________________________________
   D1  D2  D3  D4  D5  D6  D7  D8  D9  D10

▓▓ Concluído  ▒▒ Em Progresso  ░░ A Fazer
```

### Etapa 4: Agenda da Sprint Review

```
══════════════════════════════════════════════════════════════
📅 AGENDA DA SPRINT REVIEW
══════════════════════════════════════════════════════════════

Duração total: 2h

00:00 - 00:10 | Introdução & Contexto
               - Lembrete da Meta do Sprint
               - Participantes presentes
               - Agenda

00:10 - 01:00 | Demonstração de US entregues
               - US por US
               - Perguntas/feedback após cada demo

01:00 - 01:20 | Métricas & Resultados
               - Gráfico burndown
               - Velocidade
               - Pontos não entregues

01:20 - 01:40 | Discussão & Feedback
               - Reações dos stakeholders
               - Novas ideias
               - Priorização

01:40 - 02:00 | Próximos passos
               - Impacto no Product Backlog
               - Visão do próximo sprint
               - Perguntas

══════════════════════════════════════════════════════════════
```

### Etapa 5: Template sprint-review.md

```markdown
# Sprint Review - Sprint {N}

## Informações

| Atributo | Valor |
|----------|--------|
| Data | {YYYY-MM-DD} |
| Duração | 2h |
| Facilitador | {Nome} |

## Participantes

- [ ] Product Owner
- [ ] Scrum Master
- [ ] Dev Team
- [ ] Stakeholder 1
- [ ] Stakeholder 2

## Meta do Sprint

> "{Objetivo}"

**Alcançada: ✅ / ❌ / ⚠️**

## Demonstração

### US-XXX: Título
- **Demo por**: @membro
- **Feedback**: {notas}

### US-XXX: Título
- **Demo por**: @membro
- **Feedback**: {notas}

## Métricas

| Métrica | Valor |
|----------|--------|
| Planejado | X pts |
| Entregue | Y pts |
| Velocidade | Y pts |
| Taxa | Z% |

## Feedback dos Stakeholders

### Positivo
- {Feedback positivo 1}
- {Feedback positivo 2}

### A melhorar
- {Ponto de melhoria 1}
- {Ponto de melhoria 2}

### Novas ideias
- {Ideia 1} → US-XXX criada
- {Ideia 2} → A refinar

## Impacto no Backlog

| Ação | US | Descrição |
|--------|-----|-------------|
| Adicionada | US-XXX | {Título} |
| Repriorizada | US-XXX | {Motivo} |
| Removida | US-XXX | {Motivo} |

## Próximos passos

1. {Ação 1}
2. {Ação 2}
3. {Ação 3}
```

## Dicas para Sprint Review

### O que é
- Uma inspeção do incremento
- Um momento de feedback
- Uma colaboração com stakeholders

### O que NÃO é
- Uma reunião de status
- Uma demo técnica
- Um relatório para gerência

### Melhores práticas
- Demo em ambiente real (staging/prod)
- Equipe demonstra, não apenas SM
- Coletar feedback ativamente
- Adaptar backlog em tempo real
