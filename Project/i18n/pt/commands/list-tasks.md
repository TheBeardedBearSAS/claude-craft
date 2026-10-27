---
description: Listar Tarefas
argument-hint: [arguments]
---

# Listar Tarefas

Exibir lista de tarefas com filtragem por User Story, Sprint, Tipo ou Status.

## Argumentos

$ARGUMENTS (opcional, formato: [filtro] [valor])
- **us US-XXX**: Filtrar por User Story
- **sprint N**: Filtrar por sprint
- **type TYPE**: Filtrar por tipo (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- **status STATUS**: Filtrar por status (to-do, in-progress, blocked, done)

## Processo

### Etapa 1: Ler Tarefas

1. Escanear diretórios de tarefas:
   - `project-management/sprints/sprint-{N}-{slug}/tasks/`
   - `project-management/backlog/tasks/` (se existir)
2. Ler cada arquivo TASK-XXX.md
3. Extrair os metadados de conteúdo (tipo, descrição, estimativa)
4. Ler o status de cada tarefa em `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`, fonte única de verdade, schema: `.claude/templates/project/sprint-status.md`)

### Etapa 2: Filtrar

Aplicar filtros de acordo com $ARGUMENTS.

### Etapa 3: Calcular

- Total de horas estimadas
- Horas completadas
- Distribuição por tipo
- Distribuição por status

### Etapa 4: Exibir

Gerar tabela formatada.

## Formato de Saída - Por User Story

```
🔧 Tarefas - US-001: Login de usuário

| ID | Tipo | Descrição | Status | Est. | Gasto |
|----|------|-----------|--------|------|-------|
| TASK-001 | [DB] | Entidade User | 🟢 Concluído | 2h | 2h |
| TASK-002 | [BE] | User repository | 🟢 Concluído | 3h | 3.5h |
| TASK-003 | [BE] | Endpoint API login | 🟡 Em Andamento | 4h | 2h |
| TASK-004 | [FE-WEB] | Auth controller | 🔴 A Fazer | 3h | - |
| TASK-005 | [FE-MOB] | Tela de login | ⏸️ Bloqueado | 6h | - |
| TASK-006 | [TEST] | Testes AuthService | 🔴 A Fazer | 3h | - |

───────────────────────────────────────────────────
US-001: 6 tarefas | 21h estimadas | 7.5h completadas (36%)
🔴 2 | 🟡 1 | ⏸️ 1 | 🟢 2
```

## Formato de Saída - Por Sprint

```
🔧 Tarefas - Sprint 1

Por status:
🔴 A Fazer (8 tarefas, 24h)
🟡 Em Andamento (3 tarefas, 10h)
⏸️ Bloqueado (2 tarefas, 8h)
🟢 Concluído (12 tarefas, 35h)

Por tipo:
[DB]     ████████░░ 5 tarefas
[BE]     ██████████ 8 tarefas
[FE-WEB] ██████░░░░ 4 tarefas
[FE-MOB] ████░░░░░░ 3 tarefas
[TEST]   ██████░░░░ 4 tarefas
[DOC]    ██░░░░░░░░ 1 tarefa

───────────────────────────────────────────────────
Sprint 1: 25 tarefas | 77h estimadas | 35h completadas (45%)
```

## Formato de Saída - Bloqueado

```
⏸️ Tarefas Bloqueadas

| ID | US | Tipo | Descrição | Bloqueio |
|----|-----|------|-----------|-----------|
| TASK-005 | US-001 | [FE-MOB] | Tela de login | Aguardando API auth |
| TASK-012 | US-003 | [BE] | Serviço de email | Faltando config SMTP |

───────────────────────────────────────────────────
2 tarefas bloqueadas | 14h aguardando

Ações:
  Resolver TASK-005: Completar TASK-003 primeiro
  Resolver TASK-012: Configurar SMTP em .env
```

## Exemplos

```
# Listar todas as tarefas
/project:list-tasks

# Listar tarefas de uma US
/project:list-tasks us US-001

# Listar tarefas do sprint 1
/project:list-tasks sprint 1

# Listar tarefas backend
/project:list-tasks type BE

# Listar tarefas em andamento
/project:list-tasks status in-progress

# Listar tarefas bloqueadas
/project:list-tasks status blocked
```

## Códigos de Cores de Status

| Ícone | Status | Significado |
|-------|--------|-------------|
| 🔴 | To Do | Não iniciado |
| 🟡 | In Progress | Em andamento |
| ⏸️ | Blocked | Bloqueado |
| 🟢 | Done | Completado |
