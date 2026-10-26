---
name: workflow-implement
description: "Executar a fase de Implementação - desenvolvimento TDD/BDD de um sprint, de um epic, de uma story ou da fila batch (sequencial, ou paralelo via /team:sprint)"
argument-hint: "[<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]"
arguments:
  - name: sprint
    description: Número do sprint, "next" ou "current" (padrão - sprint atual)
    required: false
  - name: epic
    description: "--epic <EPIC> - implementar todas as stories de um epic (ex.: EPIC-001)"
    required: false
  - name: story
    description: "--story <US-ID> - implementar uma única story (ex.: US-001)"
    required: false
  - name: queue
    description: "--queue - processar a fila batch .bmad/batch-queue.yaml"
    required: false
---

# /workflow:implement

## Missão

Executar a fase de Implementação: desenvolvimento sprint a sprint (ou epic / story / fila) com TDD/BDD, seguindo o design técnico das fases anteriores. É o ponto de entrada único da implementação: substitui `/workflow:implement`, `/workflow:implement`, `/workflow:implement --epic` e `/workflow:implement --queue`.

**Sequencial por padrão.** `--parallel N` delega a execução a `/team:sprint` (Agent Teams).

## Uso

```bash
/workflow:implement [<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]
```

| Modo / flag | O que faz | Substitui |
|-------------|-----------|-----------|
| `<N>` / `next` / `current` | Implementa o sprint N, o próximo sprint incompleto ou o ativo (padrão: atual) | `/workflow:implement`, `/workflow:implement` |
| `--epic <EPIC>` | Enfileira e implementa todas as stories de um epic, dependências primeiro | `/workflow:implement --epic <EPIC>` |
| `--story <US-ID>` | Implementa uma única story (laço de tarefas + validação) | (uma story) |
| `--queue` | Processa a fila batch `.bmad/batch-queue.yaml` | `/workflow:implement --queue` |
| `--resume` | Retoma a partir do último checkpoint (sprint interrompido ou fila interrompida) | `/workflow:implement --queue --resume` |
| `--parallel N` | Executa até N stories independentes em paralelo, delegando a `/team:sprint` | `/workflow:implement --queue --parallel N` |
| `--auto` | Começa imediatamente, sem pedir confirmação | `--auto` |
| `--dry-run` | Pré-visualiza o plano de execução; nada é alterado | `--dry-run` |

**Fonte única de verdade:** toda mudança de status é escrita em `.bmad/sprint-status.yaml` (esquema: `.claude/templates/project/sprint-status.md`) - transições de stories, `tdd_phase`, status das tarefas, `tasks.completed` e `history`. Os arquivos markdown carregam apenas conteúdo, nunca o status.

## Quando usar

- Após `/workflow:design` (Standard/Enterprise) e `/workflow:start <N>` (pasta do sprint, tarefas)
- Após `/workflow:init` no track Quick Flow
- Quando estiver pronto para codificar

## Pré-requisitos

Standard/Enterprise:
- Tech Spec em `project-management/tech-spec.md`, backlog em `project-management/backlog/`
- Sprint com tarefas decompostas em `project-management/sprints/sprint-{N}-{slug}/` (`sprint-goal.md`, `board.md`, `tasks/TASK-*.md`) - execute `/workflow:start <N>` (ou `/workflow:start <N> --tasks-only`) se faltarem
- Stories presentes em `.bmad/sprint-status.yaml`

Quick Flow: uma compreensão clara do bug/funcionalidade a implementar.

## Plan Mode

> **O plan mode é obrigatório.** Antes de cada tarefa, o Claude ativa o plan mode para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de qualquer modificação.

## Workflow

### Etapa 1: Selecionar o escopo

1. Analisar os argumentos (modo, depois flags). Sem modo, usar o sprint atual.
2. Ler `.bmad/sprint-status.yaml` e montar a lista de stories elegíveis:
   - `<N>`: as stories do sprint em `ready-for-dev` ou `in-progress`
   - `--epic <EPIC>`: as stories cujo `epic_id` corresponde, não concluídas, não bloqueadas (as bloqueadas são sinalizadas para revisão)
   - `--story <US-ID>`: essa única story
   - `--queue`: as stories com status `pending` em `.bmad/batch-queue.yaml`, ordenadas por prioridade
3. Para um sprint, executar antes `/gate:check sprint`; se o gate falhar, exibir os problemas e parar.

```
Sprint 1: Walking Skeleton
   Goal: Complete authentication flow end-to-end
   3 User Stories, 17 Tasks
   To Do: 15 | In Progress: 2 | Done: 0
```

### Etapa 2: Montar o plano de execução

1. Analisar as dependências entre stories e montar o grafo de dependências.
2. Ordenar as stories: sem dependências primeiro, depois por prioridade, depois o menor ID primeiro.
3. Identificar os grupos que podem rodar em paralelo.
4. Escrever a fila em `.bmad/batch-queue.yaml` (para `--epic` e sprints com várias stories):

```yaml
queue:
  - story_id: "US-010"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-011"
    priority: 2
    status: "pending"
    dependencies: ["US-010"]
```

Com `--dry-run`, exibir o plano e parar:

```
Implement: EPIC-002 (DRY RUN)
Stories: 5 | Total points: 21

[1] US-010: User registration (5 pts)  deps: none
[2] US-011: User login (5 pts)         deps: US-010
[3] US-012: Profile page (5 pts)       deps: US-010
[4] US-013: Password reset (3 pts)     deps: US-010, US-011
[5] US-014: Email verification (3 pts) deps: US-010

Parallelizable after US-010: US-011, US-012, US-014
DRY RUN - no changes made. Run without --dry-run to execute.
```

Sem `--auto`, pedir confirmação antes de executar.

### Etapa 3: Executar

- **Sequencial (padrão):** processar as stories uma a uma com o laço de story abaixo, com um checkpoint após cada story.
- **`--parallel N`:** entregar as stories independentes (sem dependência pendente) a `/team:sprint`, que lança até N colegas em paralelo. `/team:sprint` escreve suas transições no mesmo `.bmad/sprint-status.yaml`; as stories com dependências aguardam seus pré-requisitos ficarem `done`.

```
Mode: Parallel (3 workers)
Worker 1: US-010 - User registration       [running]
Worker 2: (waiting for dependencies)
[10:15] US-010 done -> starting US-011, US-012, US-014 in parallel
[10:30] US-013 done (deps US-010, US-011 satisfied)
```

#### Laço de story

Para cada story em `ready-for-dev` ou `in-progress`:

1. **Mover a story para `in-progress`** (`status`, `previous_status`, `tdd_phase`, entrada `history` no YAML).
2. **Exibir os critérios de aceitação** (Gherkin).
3. **Processar cada tarefa** com o laço de tarefas.

```
US-001: User Authentication (5 pts)  -  in-progress

   GIVEN a registered user with valid credentials
   WHEN they submit the login form
   THEN they should see their dashboard
   AND a session should be created

   TASK-001 [DB] Create User entity .............. to-do
   TASK-002 [BE] Authentication service .......... to-do
   TASK-003 [FE-WEB] Login form .................. to-do
   TASK-004 [TEST] E2E authentication tests ...... to-do
```

#### Laço de tarefas (TDD)

Para cada tarefa em `to-do`, na ordem de processamento abaixo:

**3.1 Exibir a tarefa** (estimativa, descrição, arquivos a modificar, Definition of Done).

**3.2 Plan mode (obrigatório).** Explorar o código impactado e as dependências, documentar as conclusões e propor um plano: arquivos a criar/modificar, testes a escrever primeiro, riscos e mitigações. Aguardar a validação:

```
[continue] Prosseguir   [skip] Pular esta tarefa   [block] Marcar como bloqueada   [stop] Parar (estado salvo)
```

**3.3 Marcar a tarefa `in-progress`.** Em `.bmad/sprint-status.yaml`: definir `stories.<US>.tasks.status.<TASK>: in-progress`; para a primeira tarefa de uma story `ready-for-dev`, mover a story para `in-progress` (`status`, `previous_status`, `tdd_phase`, entrada de histórico). Regenerar `board.md` (visão gerada) e atualizar `index.md`.

**3.4 Ciclo TDD.**

```
RED       Escrever testes que falham        -> FAILED (esperado)
GREEN     Implementar o código mínimo       -> PASSED
REFACTOR  Melhorar a qualidade              -> PASSED (sem regressão)
```

Atualizar `tdd_phase` (`red` -> `green` -> `refactor`) no YAML a cada fase.

**3.5 Verificação da Definition of Done.**

```
- [x] Código escrito e funcional
- [x] Testes passando (3/3)
- [ ] Código revisado -> tratado por TASK-XXX [REV]
```

**3.6 Marcar a tarefa `done`.** Pedir o tempo real gasto e depois atualizar:
- `.bmad/sprint-status.yaml`: `tasks.status.<TASK>: done` e `tasks.completed` (= número de tarefas `done`)
- Metadados de conteúdo do arquivo da tarefa (`time_spent`, `updated_at`; sem status)
- `board.md` (regenerado a partir do YAML), `index.md`, métricas do sprint

**3.7 Commit convencional** com a referência da story:

```
feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add unit tests for User entity

Refs: TASK-001, US-001
```

#### Validação da story

Quando todas as tarefas de uma story estão `done`: verificar cada critério de aceitação, executar os testes E2E se existirem, executar o quality gate (`/gate:check story` quando configurado) e fazer a story transitar (`in-progress` -> `review` -> `done`) no YAML, com `previous_status` e uma entrada `history`. Atualizar o progresso do EPIC (o status do EPIC é derivado).

```
US-001 validation: 4/4 tasks, acceptance criteria met, E2E passed
US-001 -> done  |  EPIC-001: 1/3 stories (33%)
```

Após cada transição, as regras `routing.auto_transitions` se aplicam (ver `/project:backlog move story --auto`).

### Etapa 4: Tratar falhas e bloqueios

- **Tarefa bloqueada:** marcá-la `blocked` com o motivo no YAML e escolher: [1] pular e continuar com a próxima tarefa não bloqueada, [2] tentar resolver o bloqueio, [3] parar.
- **Story com falha (fila / epic):** marcá-la `failed` com o erro, a fase TDD e o último checkpoint; as stories que dependem dela são ignoradas. Aplicar `resume_on_failure` das configurações da fila (continuar ou parar). Corrigir a causa e executar `/workflow:implement --resume`.

### Etapa 5: Checkpoints e retomada

Um checkpoint é salvo após cada story em `.bmad/batch-queue.yaml`:

```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

`--resume` recarrega o checkpoint (ou, para um sprint interrompido, a última tarefa concluída) e continua:

```
Resuming Sprint 1: Walking Skeleton - 8/17 tasks (47%)
Last completed: TASK-008 [BE] JWT Token Service
Next task: TASK-009 [FE-WEB] Login Controller - continue? [y/n]
```

### Etapa 6: Relatório

```
Batch complete: 5 done | 0 failed | 0 skipped
US-010 45 min | US-011 38 min | US-012 52 min | US-013 28 min | US-014 35 min
Total 3h 18min - average 40 min per story
```

Quando todas as stories de um sprint estão `done`:

```
Sprint 1 complete: 5/5 stories, 21 points, velocity 21 pts/sprint
Hours: 38h actual vs 42h estimated | Test coverage: 82% | Commits: 23
sprint-review.md generated, sprint-retro.md template ready
```

Próximas ações: `/workflow:review`, `/workflow:retro`, `/workflow:implement <N+1>` ou `/workflow:status`.

## Ordem de processamento das tarefas

| Ordem | Tipo | Descrição |
|-------|------|-----------|
| 1 | `[DB]` | Banco de dados (entidades, migrações, repositórios) |
| 2 | `[BE]` | Backend (serviços, APIs, lógica de negócio) |
| 3 | `[FE-WEB]` | Frontend Web (controllers, templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (telas, blocs, widgets) |
| 5 | `[TEST]` | Testes adicionais (E2E, desempenho) |
| 6 | `[DOC]` | Documentação |
| 7 | `[REV]` | Revisão de código |

## Comandos de controle

| Comando | Ação |
|---------|------|
| `continue` | Validar o plano e prosseguir |
| `skip` | Pular esta tarefa (continua `to-do`) |
| `block [motivo]` | Marcar a tarefa `blocked` com um motivo |
| `stop` | Parar e salvar o estado atual |
| `status` | Exibir o progresso (`/workflow:status`) |
| `board` | Exibir o quadro Kanban (`/workflow:status --board`) |

## Atualizações automáticas

A cada mudança de status, todos os status vão para `.bmad/sprint-status.yaml`; os arquivos markdown recebem apenas conteúdo.

1. **sprint-status.yaml:** status das tarefas (`to-do | in-progress | done | blocked`), `tasks.completed`, `tdd_phase`, transições de stories (`ready-for-dev` -> `in-progress` -> `review` -> `done`) com `previous_status` e uma entrada `history`
2. **Arquivo de tarefa:** `time_spent`, `updated_at` (sem status)
3. **Arquivo de user story:** exibição do progresso das tarefas (sem status)
4. **Arquivo EPIC:** progresso das stories (status derivado)
5. **board.md:** colunas Kanban regeneradas a partir do YAML
6. **index.md:** métricas globais

## Arquivos atualizados

| Arquivo | Atualizações |
|---------|--------------|
| `.bmad/sprint-status.yaml` | Status das stories, `tdd_phase`, status das tarefas, `tasks.completed`, histórico |
| `.bmad/batch-queue.yaml` | Entradas da fila, status, checkpoints |
| `project-management/backlog/user-stories/US-XXX.md` | Progresso das tarefas (somente conteúdo) |
| `project-management/backlog/epics/EPIC-XXX.md` | Progresso das stories |
| `project-management/sprints/sprint-{N}-{slug}/board.md` | Colunas Kanban (regeneradas) |
| `project-management/sprints/sprint-{N}-{slug}/tasks/*.md` | Tempo gasto (sem status) |
| `project-management/sprints/sprint-{N}-{slug}/sprint-review.md` | Gerado ao final |

## Configuração da fila

Configurações em `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"  # or "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600
settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

Se o Ralph estiver configurado, defina `bmad_integration.batch_queue_file: ".bmad/batch-queue.yaml"` em `ralph.yml` para integrar a execução batch.

## Modo Quick Flow

Para correções de bugs e pequenas funcionalidades, não é necessária estrutura de sprint:
- Correções de bugs: `/qa:tdd` (abordagem TDD)
- Pequenas funcionalidades: os comandos `/{tech}:*` específicos da tecnologia
- Acompanhamento: `/project:backlog add task` e depois `/project:backlog move task done`

## Agentes envolvidos

- **tech-lead**: Decomposição de tarefas, orientação de arquitetura
- **tdd-coach**: Orientação metodológica TDD/BDD
- **{tech}-reviewer**: Revisão de código (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD e implantação

## Comandos relacionados

- `/workflow:design` - Fase anterior; `/workflow:start <N>` - criar o sprint e suas tarefas
- `/workflow:status` - Progresso, board (`--board`), fila (`--queue`), gates (`--gates`)
- `/team:sprint` - Motor paralelo usado por `--parallel N`; `/team:delivery` - Redação + implementação em paralelo
- `/project:backlog move story <US> <status>` - Transição manual de uma story
- `/qa:tdd` - Correções rápidas de bugs
- `/workflow:review` - Cerimônia de sprint review
- `/workflow:retro` - Retrospectiva do sprint
