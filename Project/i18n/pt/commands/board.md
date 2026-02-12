---
description: Exibir Quadro Kanban
argument-hint: [arguments]
---

# Exibir Quadro Kanban

Exibir o quadro Kanban do sprint atual ou de um sprint específico.

## Argumentos

$ARGUMENTS (opcional, formato: [sprint N])
- **sprint N** (opcional): Número do sprint a exibir
- Se não especificado, exibe o sprint atual

## Processo

### Etapa 1: Identificar sprint

1. Se sprint especificado, usar esse número
2. Caso contrário, encontrar sprint atual (com tarefas não-Done)

### Etapa 2: Ler dados

1. Ler arquivo `project-management/sprints/sprint-XXX/board.md`
2. Ou regenerar a partir dos arquivos de tarefa

### Etapa 3: Agrupar por status

Organizar tarefas por coluna:
- 🔴 To Do
- 🟡 In Progress
- ⏸️ Blocked
- 🟢 Done

### Etapa 4: Calcular métricas

- Número de tarefas por coluna
- Horas estimadas e completadas
- Porcentagem de progresso

## Formato de Saída

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Quadro Kanban                                     ║
║  Objetivo: Walking Skeleton - Auth + Primeira página             ║
║  Período: 2024-01-15 → 2024-01-29                               ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 A FAZER (4)  │ 🟡 EM ANDAMENTO │ ⏸️ BLOQUEADO (1)│ 🟢 CONCLUÍDO (8)│
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ Testes E2E      │ Auth Service    │ Tela Login      │ User Entity ✓   │
│ 4h @US-001      │ 4h @US-001      │ 6h @US-001      │ 2h @US-001      │
│                 │                 │ ⚠️ Aguardando API│                 │
│ TASK-010 [DOC]  │ TASK-006 [WEB]  │                 │ TASK-002 [DB]   │
│ Documentação    │ Auth Controller │                 │ Migration ✓     │
│ 2h @US-001      │ 3h @US-001      │                 │ 1h @US-001      │
│                 │                 │                 │                 │
│ TASK-015 [BE]   │ TASK-012 [MOB]  │                 │ TASK-003 [BE]   │
│ API Produtos    │ Products Bloc   │                 │ Repository ✓    │
│ 4h @US-002      │ 5h @US-002      │                 │ 3h @US-001      │
│                 │                 │                 │                 │
│ TASK-016 [TEST] │                 │                 │ TASK-004 [BE]   │
│ Testes Products │                 │                 │ Login API ✓     │
│ 3h @US-002      │                 │                 │ 4h @US-001      │
│                 │                 │                 │                 │
│                 │                 │                 │ ... +4 mais     │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

══════════════════════════════════════════════════════════════════════════
📊 MÉTRICAS

Tarefas:   ████████████████████░░░░░░░░░░ 8/16 (50%)
Horas:     ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Bloqueado: 1 tarefa (6h)

Por tipo:
[DB]  ██████████ 3/3 concluídas
[BE]  ████████░░ 4/5 (1 em andamento)
[WEB] ████░░░░░░ 1/3 (1 em andamento)
[MOB] ██░░░░░░░░ 0/3 (1 bloqueada, 1 em andamento)
[TEST]░░░░░░░░░░ 0/2

══════════════════════════════════════════════════════════════════════════
📖 USER STORIES

│ US      │ Pontos │ Status          │ Tarefas   │ Progresso   │
├─────────┼────────┼─────────────────┼───────────┼─────────────┤
│ US-001  │ 5      │ 🟡 Em Andamento │ 6/10      │ ██████░░░░  │
│ US-002  │ 5      │ 🔴 A Fazer      │ 2/6       │ ███░░░░░░░  │

Sprint: 10 pontos | Concluídos: 0 pts
══════════════════════════════════════════════════════════════════════════

Ações:
  /project:move-task TASK-XXX in-progress  # Iniciar uma tarefa
  /project:move-task TASK-XXX done         # Concluir uma tarefa
  /sprint:status                   # Ver mais métricas
```

## Formato Compacto

Se muitas tarefas, exibir resumo:

```
📋 Sprint 1 - Kanban (32 tarefas)

🔴 A Fazer (12):       TASK-015, TASK-016, TASK-017, TASK-018...
🟡 Em Andamento (5):   TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Bloqueado (2):      TASK-008 (API), TASK-021 (config)
🟢 Concluído (13):     TASK-001..TASK-004, TASK-007, TASK-009..TASK-014

Progresso: 13/32 (41%) | 45h/98h
```

## Exemplos

```
# Exibir quadro do sprint atual
/project:board

# Exibir quadro do sprint 2
/project:board sprint 2
```

## Atualizar arquivo board.md

Após exibição, o arquivo `board.md` do sprint é atualizado com os dados atuais.
