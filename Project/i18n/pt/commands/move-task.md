---
description: Mover uma Tarefa
argument-hint: [arguments]
---

# Mover uma Tarefa

Alterar o status de uma tarefa seguindo o workflow rigoroso.

## Argumentos

$ARGUMENTS (formato: TASK-XXX destino)
- **TASK-ID** (obrigatório): ID da Tarefa (ex: TASK-001)
- **Destino** (obrigatório):
  - `in-progress`: Iniciar tarefa
  - `blocked`: Marcar como bloqueada
  - `done`: Marcar como concluída

## Workflow Rigoroso

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

### Transições Permitidas

| De | Para | Permitido |
|--------|------|----------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Proibido** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (rollback) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (reabertura) |

> Os status das tarefas são armazenados somente em `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), seguindo `.claude/templates/project/sprint-status.md`. Os arquivos markdown de tarefa e de US não contêm status.

## Processo

### Etapa 1: Validar Tarefa

1. Encontrar arquivo da tarefa
2. Ler o status atual em `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`)
3. Identificar US e sprint associados

### Etapa 2: Validar transição

1. Verificar se transição é permitida
2. Se To Do → Done, bloquear e sugerir In Progress

### Etapa 3: Se transição para Blocked

Perguntar pelo bloqueio:
```
Qual é o bloqueio para TASK-XXX?
> [Descrição do bloqueio]
```

### Etapa 4: Se transição para Done

Perguntar pelo tempo gasto:
```
Tempo gasto em TASK-XXX? (estimativa: 4h)
> [Tempo real, ex: 3.5h]
```

### Etapa 5: Atualizar Tarefa

1. Escrever o novo status em `.bmad/sprint-status.yaml`: `stories.<US>.tasks.status.<TASK>` (schema: `.claude/templates/project/sprint-status.md`); nunca no arquivo da tarefa
2. Recalcular `stories.<US>.tasks.completed` (= número de tarefas `done`)
3. Apenas conteúdo no arquivo da tarefa: adicionar o texto do bloqueio se Blocked, atualizar o tempo gasto se Done, atualizar a data de modificação

### Etapa 6: Atualizar Board

1. Regenerar o `board.md` do sprint a partir de `.bmad/sprint-status.yaml` (visão gerada, nunca editada manualmente)
2. Atualizar métricas

### Etapa 7: Atualizar User Story

1. Atualizar lista de tarefas (apenas conteúdo)
2. Recalcular progresso a partir de `.bmad/sprint-status.yaml`
3. Se todas as tarefas Done, sugerir concluir US

### Etapa 8: Atualizar Índice

1. Atualizar contadores globais

## Formato de Saída

### Transição bem-sucedida

```
✅ Tarefa movida!

🔧 TASK-003: Endpoint API de login
   Antes: to-do
   Depois: in-progress

📖 US-001: Login de usuário
   Progresso: 2/6 → 3/6 (50%)

Próximas etapas:
  /project:move-task TASK-003 done       # Quando concluída
  /project:move-task TASK-003 blocked    # Se bloqueada
```

### Tarefa concluída

```
✅ Tarefa concluída!

🔧 TASK-003: Endpoint API de login
   Status: in-progress → done
   Estimativa: 4h
   Tempo real: 3.5h ✓

📖 US-001: Login de usuário
   Progresso: 4/6 (67%) ████████░░░░

Sprint 1:
   Tarefas concluídas: 12/25 (48%)
   Horas: 35h/77h completadas
```

### Todas as tarefas Done

```
✅ Tarefa concluída!

🔧 TASK-006: Testes AuthService
   Status: done

🎉 Todas as tarefas de US-001 concluídas!

📖 US-001: Login de usuário
   Progresso: 6/6 (100%) ██████████

Próxima etapa recomendada:
  /sprint:transition US-001 done
```

### Erro de workflow

```
❌ Transição não permitida!

🔧 TASK-004: Auth controller
   Status atual: to-do
   Transição solicitada: → done

Regra: Uma tarefa deve passar por "In Progress" antes de "Done"

Ação correta:
  /project:move-task TASK-004 in-progress
  # ... trabalhar na tarefa ...
  /project:move-task TASK-004 done
```

### Tarefa bloqueada

```
✅ Tarefa marcada como bloqueada

🔧 TASK-005: Tela de login
   Status: in-progress → blocked
   Bloqueio: Aguardando API auth (TASK-003)

Para desbloquear:
  1. Concluir TASK-003
  2. /project:move-task TASK-005 in-progress
```

## Exemplos

```
# Iniciar uma tarefa
/project:move-task TASK-001 in-progress

# Concluir uma tarefa
/project:move-task TASK-001 done

# Bloquear uma tarefa
/project:move-task TASK-001 blocked

# Desbloquear uma tarefa
/project:move-task TASK-001 in-progress
```

## Métricas Atualizadas

A cada movimentação:
- Contagem de tarefas por status
- Horas estimadas vs reais
- Progresso da US
- Progresso do Sprint
- Quadro Kanban
