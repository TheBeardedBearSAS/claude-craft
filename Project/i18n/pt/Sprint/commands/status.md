---
description: Status do Sprint
argument-hint: [arguments]
---

# Status do Sprint

Exibir métricas detalhadas e progresso do sprint.

## Argumentos

$ARGUMENTS (opcional, formato: [sprint N])
- **sprint N** (opcional): Número do sprint
- Se não especificado, exibe o sprint atual

## Processo

### Etapa 1: Identificar sprint

1. Encontrar sprint solicitado ou sprint atual
2. Ler sprint-goal.md

### Etapa 2: Coletar dados

1. Ler todas as User Stories do sprint
2. Ler todas as Tarefas associadas
3. Calcular métricas

### Etapa 3: Gerar relatório

Criar relatório detalhado com:
- Visão geral
- Progresso por US
- Métricas de tempo
- Gráfico burndown (texto)
- Bloqueios
- Riscos

## Formato de Saída

```
╔══════════════════════════════════════════════════════════════════╗
║  📊 SPRINT 1 - RELATÓRIO DE STATUS                               ║
║  Gerado: 2024-01-22 14:30                                        ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│ 🎯 OBJETIVO DO SPRINT                                            │
├──────────────────────────────────────────────────────────────────┤
│ Walking Skeleton - Autenticação completa e primeira página      │
│ Período: 2024-01-15 → 2024-01-29 (Dia 8/14)                    │
└──────────────────────────────────────────────────────────────────┘

══════════════════════════════════════════════════════════════════════════
📈 VISÃO GERAL

Progresso geral:
██████████████░░░░░░░░░░░░░░░░░░ 45%

│ Métrica           │ Atual  │ Meta   │ Status │
├───────────────────┼────────┼────────┼────────┤
│ Pontos concluídos │ 5      │ 10     │ 🟡 50% │
│ Tarefas concluídas│ 8      │ 16     │ 🟡 50% │
│ Horas concluídas  │ 28h    │ 62h    │ 🟡 45% │
│ Dias restantes    │ 6      │ -      │        │

══════════════════════════════════════════════════════════════════════════
📖 PROGRESSO POR USER STORY

│ US      │ Nome               │ Pontos │ Tarefas  │ Status          │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-001  │ Login de usuário   │ 5      │ 6/10     │ 🟡 Em Andamento │
│         │                    │        │ 60%      │ ██████░░░░      │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-002  │ Lista de produtos  │ 5      │ 2/6      │ 🔴 A Fazer      │
│         │                    │        │ 33%      │ ███░░░░░░░      │

══════════════════════════════════════════════════════════════════════════
⏱️ MÉTRICAS DE TEMPO

Estimado vs Real (horas):
│ Tipo    │ Est.   │ Real   │ Diff   │
├─────────┼────────┼────────┼────────┤
│ [DB]    │ 6h     │ 5.5h   │ -0.5h  │ ✅
│ [BE]    │ 20h    │ 12h    │ -      │ 🟡 Em andamento
│ [FE-WEB]│ 12h    │ 3h     │ -      │ 🟡 Em andamento
│ [FE-MOB]│ 14h    │ 0h     │ -      │ ⏸️ Bloqueado
│ [TEST]  │ 10h    │ 7.5h   │ -2.5h  │ ✅ Sub-estimado

Velocidade diária: 4h/dia (meta: 4.4h/dia)

══════════════════════════════════════════════════════════════════════════
📉 BURNDOWN (simplificado)

Horas restantes por dia:
62h │████████████████████████████████████████████████████████████████
    │█████████████████████████████████████████████████████░░░░░░░░░░░
    │██████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ← Ideal
34h │████████████████████████████████████████████████ ← Real
    └───────────────────────────────────────────────────────────────
    D1  D2  D3  D4  D5  D6  D7  D8  D9  D10 D11 D12 D13 D14

Status: 🟡 Ligeiramente atrasado (6h)

══════════════════════════════════════════════════════════════════════════
⚠️ BLOQUEIOS

│ Tarefa   │ US     │ Bloqueio                    │ Desde  │
├──────────┼────────┼─────────────────────────────┼────────┤
│ TASK-008 │ US-001 │ Aguardando API auth         │ 2 dias │
│ TASK-021 │ US-002 │ Faltando config SMTP        │ 1 dia  │

Impacto: 14h bloqueadas (22% do sprint)

══════════════════════════════════════════════════════════════════════════
🚨 RISCOS

│ Nível  │ Descrição                             │ Mitigação               │
├────────┼───────────────────────────────────────┼─────────────────────────┤
│ 🔴 Alto│ Mobile bloqueado há 2 dias            │ Priorizar TASK-005      │
│ 🟡 Méd │ 6h atrasado                           │ Possível hora extra     │
│ 🟢 Baixo│ Testes sub-estimados                 │ Adicionar buffer sprint 2│

══════════════════════════════════════════════════════════════════════════
📋 AÇÕES RECOMENDADAS

1. 🔴 URGENTE: Desbloquear TASK-008 concluindo TASK-005
2. 🟡 Configurar SMTP para desbloquear TASK-021
3. 🟢 Revisar estimativas de testes para futuros sprints

══════════════════════════════════════════════════════════════════════════

Ações:
  /project:board                    # Ver Kanban
  /project:move-task TASK-XXX done  # Concluir uma tarefa
  /project:list-tasks status blocked # Ver todos os bloqueios
```

## Exemplos

```
# Status do sprint atual
/sprint:status

# Status do sprint 2
/sprint:status sprint 2
```

## Geração de Relatório

O relatório também é salvo em:
`project-management/sprints/sprint-XXX/status-YYYY-MM-DD.md`
