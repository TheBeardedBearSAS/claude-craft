# Mover uma User Story

Alterar o status de uma User Story ou atribuí-la a um sprint.

## Argumentos

$ARGUMENTS (formato: US-XXX destino)
- **US-ID** (obrigatório): ID da User Story (ex: US-001)
- **Destino** (obrigatório):
  - `sprint-N`: Atribuir ao sprint N
  - `backlog`: Remover do sprint atual
  - `in-progress`: Iniciar US
  - `blocked`: Marcar como bloqueada
  - `done`: Marcar como concluída

## Workflow Rigoroso

As transições de status seguem um workflow rigoroso:

```
🔴 To Do ──→ 🟡 In Progress ──→ 🟢 Done
     │              │
     │              ↓
     └────→ ⏸️ Blocked ←────┘
                │
                ↓
           🟡 In Progress
```

### Transições Permitidas

| De | Para | Permitido |
|--------|------|----------|
| 🔴 To Do | 🟡 In Progress | ✅ |
| 🔴 To Do | ⏸️ Blocked | ✅ |
| 🔴 To Do | 🟢 Done | ❌ **Proibido** |
| 🟡 In Progress | 🟢 Done | ✅ |
| 🟡 In Progress | ⏸️ Blocked | ✅ |
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | * | ❌ (reabertura manual) |

## Processo

### Etapa 1: Validar User Story

1. Verificar se US existe
2. Ler status atual
3. Identificar sprint atual (se aplicável)

### Etapa 2: Validar transição

**Se mudança de status:**
1. Verificar se transição é permitida
2. Se não permitida, exibir erro com transições possíveis

**Se atribuição de sprint:**
1. Verificar se sprint existe
2. Criar diretório do sprint se necessário

### Etapa 3: Se transição para Blocked

Perguntar pelo bloqueio:
```
Qual é o bloqueio para US-XXX?
> [Descrição do bloqueio]
```

### Etapa 4: Atualizar User Story

1. Modificar status nos metadados
2. Modificar sprint se aplicável
3. Adicionar bloqueio se Blocked
4. Atualizar data de modificação

### Etapa 5: Atualizar arquivos relacionados

1. **Índice** (`backlog/index.md`): Atualizar contadores
2. **EPIC pai**: Atualizar progresso
3. **Sprint board** (se aplicável): Mover tarefas

### Etapa 6: Cascata para Tarefas

**Se US move para In Progress:**
- Tarefas permanecem To Do (serão iniciadas individualmente)

**Se US move para Done:**
- Verificar se todas as tarefas estão Done
- Se não, exibir aviso

**Se US move para Blocked:**
- Marcar todas as tarefas In Progress como Blocked

## Formato de Saída

### Mudança de status

```
✅ User Story movida!

📖 US-001: Login de usuário
   Antes: 🔴 To Do
   Depois: 🟡 In Progress

Próximas etapas:
  /project:move-task TASK-001 in-progress  # Iniciar uma tarefa
  /project:board                            # Ver Kanban
```

### Atribuição de sprint

```
✅ User Story atribuída ao Sprint 2!

📖 US-003: Esqueci senha
   Sprint: Backlog → Sprint 2
   Status: 🔴 To Do

Sprint 2 atualizado:
  - 8 US | 34 pontos

Próximas etapas:
  /project:decompose-tasks 2  # Criar tarefas
  /project:board              # Ver Kanban
```

### Erro de workflow

```
❌ Transição não permitida!

📖 US-001: Login de usuário
   Status atual: 🔴 To Do
   Transição solicitada: → 🟢 Done

Regra: Uma US deve passar por "In Progress" antes de "Done"

Transições possíveis:
  /project:move-story US-001 in-progress
  /project:move-story US-001 blocked
```

## Exemplos

```
# Iniciar uma US
/project:move-story US-001 in-progress

# Concluir uma US
/project:move-story US-001 done

# Bloquear uma US
/project:move-story US-001 blocked

# Atribuir ao sprint 2
/project:move-story US-003 sprint-2

# Remover do sprint
/project:move-story US-003 backlog
```

## Validação antes de Done

Antes de marcar US como Done, verificar:
- [ ] Todas as tarefas estão Done
- [ ] Testes passam
- [ ] Código revisado
- [ ] Critérios de aceitação validados

Se não atendido:
```
⚠️ Aviso: US-001 ainda tem tarefas não concluídas!

Tarefas restantes:
  🔴 TASK-004 [FE-WEB] Auth controller
  🔴 TASK-006 [TEST] Testes AuthService

Confirmar mesmo assim? (não recomendado)
```
