---
description: Adicionar uma Tarefa
argument-hint: [arguments]
---

# Adicionar uma Tarefa

Criar uma nova tarefa técnica e associá-la a uma User Story.

## Argumentos

$ARGUMENTS (formato: US-XXX "[TIPO] Descrição" estimativa)
- **US-ID** (obrigatório): ID da User Story pai (ex: US-001)
- **Descrição** (obrigatório): Descrição com tipo entre colchetes
- **Estimativa** (obrigatório): Estimativa em horas (ex: 4h, 2h, 0.5h)

## Modo Plano

> **O modo plano é obrigatório.** Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Tipos de Tarefa

| Tipo | Prefixo | Descrição |
|------|---------|-------------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, Integration, E2E |
| Documentation | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

## Processo

### Etapa 1: Analisar argumentos

Extrair de $ARGUMENTS:
- ID da User Story
- Tipo (entre colchetes)
- Descrição
- Estimativa em horas

### Etapa 2: Validar User Story

1. Verificar se US existe em `project-management/backlog/user-stories/`
2. Obter sprint atribuído (se aplicável)
3. Se US não encontrada, exibir erro

### Etapa 3: Validar estimativa

- Mínimo: 0.5h
- Máximo: 8h
- Ideal: 2-4h
- Se > 8h, sugerir divisão da tarefa

### Etapa 4: Gerar ID

1. Encontrar último ID de tarefa usado
2. Incrementar para obter novo ID

### Etapa 5: Criar o arquivo

1. Usar template `.claude/templates/project/task.md`
2. Substituir placeholders:
   - `{ID}`: ID gerado
   - `{DESCRIPTION}`: Descrição curta
   - `{US_ID}`: ID da User Story
   - `{TYPE}`: Tipo da tarefa
   - `{ESTIMATION}`: Estimativa em horas
   - `{DATE}`: Data atual (YYYY-MM-DD)
   - `{DESCRIPTION_DETAILLEE}`: Descrição detalhada

3. Determinar caminho:
   - Se US em sprint: `project-management/sprints/sprint-{N}-{slug}/tasks/TASK-{ID}.md`
   - Caso contrário: `project-management/backlog/tasks/TASK-{ID}.md`

### Etapa 5b: Registrar a tarefa em `.bmad/sprint-status.yaml`

O arquivo da tarefa contém apenas conteúdo. O status fica em `.bmad/sprint-status.yaml` (fonte única de verdade), seguindo o schema de `.claude/templates/project/sprint-status.md`:

1. Criar `.bmad/sprint-status.yaml` a partir do esqueleto de `/workflow:init` se ele não existir
2. Adicionar `TASK-{ID}` a `stories.{US_ID}.tasks.list`
3. Definir `stories.{US_ID}.tasks.status.TASK-{ID}: to-do`
4. Atualizar `stories.{US_ID}.tasks.total` (e manter `completed` = número de tarefas `done`)

### Etapa 6: Atualizar User Story

1. Ler arquivo da US
2. Adicionar tarefa à tabela de Tarefas (sem coluna de status)
3. Atualizar progresso
4. Salvar

### Etapa 7: Atualizar board (se sprint)

Se US está em um sprint:
1. Ler `project-management/sprints/sprint-{N}-{slug}/board.md`
2. Regenerá-lo a partir de `.bmad/sprint-status.yaml` (o board é uma visão gerada; a tarefa aparece no estado `to-do`)
3. Atualizar métricas
4. Salvar

## Formato de Saída

```
✅ Tarefa criada com sucesso!

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Tipo: {TYPE}
   Status: to-do (.bmad/sprint-status.yaml)
   Estimativa: {ESTIMATION}h
   Arquivo: {PATH}

Próximas etapas:
  /project:move-task TASK-{ID} in-progress  # Iniciar tarefa
  /project:board                             # Ver Kanban
```

## Exemplos

```
# Tarefa backend
/project:add-task US-001 "[BE] Endpoint API de login" 4h

# Tarefa database
/project:add-task US-001 "[DB] Entidade User com campos email/password" 2h

# Tarefa frontend mobile
/project:add-task US-001 "[FE-MOB] Tela de login com validação" 6h

# Tarefa de teste
/project:add-task US-001 "[TEST] Testes unitários AuthService" 3h
```

## Validação

- [ ] Tipo é válido (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- [ ] Estimativa está entre 0.5h e 8h
- [ ] User Story existe
- [ ] ID é único
