---
description: "Gerenciar o backlog: adicionar, listar, editar e mover EPICs, User Stories e Tarefas, escolher a próxima story, alterar o status das stories e aplicar as regras de roteamento"
argument-hint: "<add|list|edit|move|next> <epic|story|task> [args] | move story --auto"
---

# Backlog

Ponto de entrada único para gerenciar o backlog do projeto: criar, listar, editar e mover EPICs, User Stories e Tarefas.

## Uso

| Invocação | O que faz | Substitui |
|-----------|-----------|-----------|
| `/project:backlog add epic "Nome" [prioridade]` | Criar um EPIC | `/project:backlog add epic` |
| `/project:backlog add story EPIC-XXX "Nome" [pontos]` | Criar uma User Story em um EPIC | `/project:backlog add story` |
| `/project:backlog add task US-XXX "[TIPO] Descrição" 4h` | Criar uma Tarefa em uma User Story | `/project:backlog add task` |
| `/project:backlog list epic [status] [prioridade]` | Listar os EPICs com status derivado e progresso | `/project:backlog list epic` |
| `/project:backlog list story [epic EPIC-XXX \| sprint N \| status S \| backlog]` | Listar as User Stories | `/project:backlog list story` |
| `/project:backlog list task [us US-XXX \| sprint N \| type T \| status S]` | Listar as Tarefas | `/project:backlog list task` |
| `/project:backlog edit epic EPIC-XXX [campo] [valor]` | Modificar um EPIC | `/project:backlog edit epic` |
| `/project:backlog edit story US-XXX [campo] [valor]` | Modificar uma User Story | `/project:backlog edit story` |
| `/project:backlog move task TASK-XXX <in-progress\|blocked\|done>` | Alterar o status de uma Tarefa | `/project:backlog move task` |
| `/project:backlog next story [--claim]` | Escolher a próxima story `ready-for-dev` por prioridade e dependências (`--claim` a move para `in-progress`) | `/project:backlog next story` |
| `/project:backlog move story US-XXX <backlog\|ready-for-dev\|in-progress\|review\|done\|blocked\|sprint-N> ["motivo"]` | Alterar o status de uma story pela máquina de estados BMAD, com gates | `/project:backlog move story` |
| `/project:backlog move story --auto [--dry-run]` | Avaliar as regras `routing.auto_transitions` de `.bmad/sprint-status.yaml` e aplicar as transições acionadas | `/project:backlog move story --auto` |

Não existem `edit task` nem `move epic`: os status dos EPICs são derivados. Os status das stories são alterados com `move story` (máquina de estados com gates); as regras `routing.auto_transitions` também são aplicadas após cada transição.

## Argumentos

$ARGUMENTS: `<ação> <entidade> [args]`

1. Primeira palavra = ação: `add`, `list`, `edit`, `move` ou `next`
2. Segunda palavra = entidade: `epic`, `story` ou `task` (`move` aceita `task` ou `story`, `next` apenas `story`)
3. O restante é repassado à seção correspondente abaixo
4. Ação ou entidade ausente ou desconhecida: exibir a tabela de Uso e parar. `move epic`: responder que o status do EPIC é derivado

## Regras comuns

### Fonte da verdade do status

- **O status vive somente em `.bmad/sprint-status.yaml`** (fonte única da verdade, schema: `.claude/templates/project/sprint-status.md`). Usar as strings de status exatas do schema.
  - Story: `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`
  - Tarefa (`stories.<US>.tasks.status.<TASK>`): `to-do`, `in-progress`, `blocked`, `done`
- **Os arquivos markdown contêm apenas conteúdo** (nome, descrição, pontos, critérios, estimativa, texto do bloqueio, tempo gasto). Nunca escrever um status em um arquivo de EPIC, US ou tarefa, nem nas tabelas que eles contêm.
- **O status de um EPIC é derivado, nunca armazenado**: todas as stories `backlog` (ou nenhuma story) = não iniciado; todas `done` = concluído; alguma `blocked` e nenhuma em andamento = bloqueado; caso contrário em andamento.
- Os boards (`board.md`) são visões geradas: regenerá-los a partir de `.bmad/sprint-status.yaml`, nunca editá-los à mão.
- Se `.bmad/sprint-status.yaml` não existir, criá-lo a partir do esqueleto de `/workflow:init`.

### Caminhos e templates

| Elemento | Caminho |
|----------|---------|
| EPICs | `project-management/backlog/epics/EPIC-{ID}-{slug}.md` |
| User Stories | `project-management/backlog/user-stories/US-{ID}-{slug}.md` |
| Tarefas (US em um sprint) | `project-management/sprints/sprint-{N}-{slug}/tasks/TASK-{ID}.md` |
| Tarefas (caso contrário) | `project-management/backlog/tasks/TASK-{ID}.md` |
| Índice | `project-management/backlog/index.md` |
| Templates | `.claude/templates/project/{epic,user-story,task}.md` |

### Modo Plano (add, edit, move)

> **O modo plano é obrigatório** para toda ação que escreve (`add`, `edit`, `move`). Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração. `list` é somente leitura.

### Ícones de status (list)

| Ícone | Significado |
|-------|-------------|
| 🔴 | A fazer / backlog (não iniciado) |
| 🟡 | Em andamento |
| ⏸️ | Bloqueado |
| 🟢 | Concluído |

## add epic

`/project:backlog add epic "Nome do EPIC" [prioridade]`

- **Nome** (obrigatório), **Prioridade** (opcional): High, Medium, Low (padrão: Medium)

1. **Gerar o ID**: ler `project-management/backlog/epics/`, encontrar o último `EPIC-XXX`, incrementar
2. **Coletar** (se não fornecidos): descrição, MMF (Minimum Marketable Feature), 2-3 objetivos de negócio, critérios de sucesso
3. **Criar o arquivo** a partir de `.claude/templates/project/epic.md`, substituindo `{ID}`, `{NOM}`, `{PRIORITE}`, `{MINIMUM_MARKETABLE_FEATURE}`, `{DESCRIPTION}`, `{DATE}` (AAAA-MM-DD), `{OBJECTIF_1}`, `{OBJECTIF_2}`, `{CRITERE_1}`, `{CRITERE_2}`. Nenhum status é escrito.
4. **Atualizar o índice**: adicionar o EPIC à tabela de EPICs, atualizar os contadores

```
✅ EPIC criado com sucesso!

📋 EPIC-{ID}: {NOME}
   Status: derivado de suas stories (nenhuma ainda)
   Prioridade: {PRIORIDADE}
   Arquivo: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Próximos passos:
  /project:backlog add story EPIC-{ID} "Nome da User Story"
```

Exemplo: `/project:backlog add epic "Sistema de autenticação" High` cria `project-management/backlog/epics/EPIC-001-sistema-de-autenticacao.md`.

Validação: nome não vazio, prioridade entre High/Medium/Low, `project-management/backlog/epics/` existe, ID único.

## add story

`/project:backlog add story EPIC-XXX "Nome da US" [pontos]`

- **EPIC-ID** (obrigatório), **Nome** (obrigatório), **Pontos** (opcional): Fibonacci (1, 2, 3, 5, 8)

1. **Validar o EPIC**: ele deve existir em `project-management/backlog/epics/`; caso contrário, exibir um erro com os EPICs disponíveis
2. **Gerar o ID**: ler `project-management/backlog/user-stories/`, encontrar o último `US-XXX`, incrementar
3. **Coletar**: persona (P-XXX ou descrição), ação, benefício, pelo menos 2 critérios de aceitação no formato Gherkin, pontos (estimar se não fornecidos)
4. **Criar o arquivo** a partir de `.claude/templates/project/user-story.md`, substituindo `{ID}`, `{NOM}`, `{EPIC_ID}`, `{SPRINT}` ("Backlog" = não atribuída), `{POINTS}`, `{PERSONA}`, `{PERSONA_ID}`, `{ACTION}`, `{BENEFICE}`, `{DATE}`; adicionar os critérios Gherkin
5. **Registrar o status** em `.bmad/sprint-status.yaml`: adicionar `stories.US-{ID}` com `title`, `status: backlog`, `story_points`, `epic_id`, `priority`, `dependencies: []`, `tasks: { total: 0, completed: 0, list: [] }`, `history: []`
6. **Atualizar o EPIC** (adicionar a US à sua tabela de User Stories, sem coluna de status; atualizar o progresso) e o **índice** (seção "Backlog priorizado", contadores)

```
✅ User Story criada com sucesso!

📖 US-{ID}: {NOME}
   EPIC: {EPIC_ID}
   Status: backlog (.bmad/sprint-status.yaml)
   Pontos: {PONTOS}
   Arquivo: project-management/backlog/user-stories/US-{ID}-{slug}.md

Próximos passos:
  /project:backlog move story US-{ID} sprint-X                # Atribuir a um sprint
  /project:backlog add task US-{ID} "[BE] ..." 4h    # Adicionar tarefas
```

Exemplo: `/project:backlog add story EPIC-001 "Login do usuário" 5`.

Verificação INVEST: **I**ndependente, **N**egociável, **V**aliosa, **E**stimável (pontos fornecidos), **S**mall/pequena (≤ 8 pontos, senão sugerir dividir), **T**estável (critérios de aceitação claros).

## add task

`/project:backlog add task US-XXX "[TIPO] Descrição" estimativa`

- **US-ID** (obrigatório), **Descrição** com o tipo entre colchetes (obrigatório), **Estimativa** em horas (obrigatória, ex.: 4h, 2h, 0.5h)

| Tipo | Prefixo | Descrição |
|------|---------|-----------|
| Banco de dados | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Testes | `[TEST]` | Unitários, Integração, E2E |
| Documentação | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revisão | `[REV]` | Code Review |

1. **Validar a US**: ela deve existir em `project-management/backlog/user-stories/`; obter seu sprint (se houver); caso contrário, exibir um erro
2. **Validar a estimativa**: mínimo 0.5h, máximo 8h, ideal 2-4h; se > 8h, sugerir dividir a tarefa
3. **Gerar o ID**: encontrar o último ID de tarefa, incrementar
4. **Criar o arquivo** a partir de `.claude/templates/project/task.md`, substituindo `{ID}`, `{DESCRIPTION}`, `{US_ID}`, `{TYPE}`, `{ESTIMATION}`, `{DATE}`, `{DESCRIPTION_DETAILLEE}`; caminho: diretório de tarefas do sprint se a US estiver em um sprint, senão `project-management/backlog/tasks/`
5. **Registrar a tarefa** em `.bmad/sprint-status.yaml`: adicionar `TASK-{ID}` a `stories.{US_ID}.tasks.list`, definir `stories.{US_ID}.tasks.status.TASK-{ID}: to-do`, atualizar `stories.{US_ID}.tasks.total` (manter `completed` = número de tarefas `done`)
6. **Atualizar a US** (adicionar a tarefa à sua tabela de tarefas, sem coluna de status; atualizar o progresso)
7. **Atualizar o board** se a US estiver em um sprint: regenerar `board.md` a partir de `.bmad/sprint-status.yaml` (a tarefa aparece em `to-do`) e atualizar as métricas

```
✅ Tarefa criada com sucesso!

🔧 TASK-{ID}: {DESCRIÇÃO}
   US: {US_ID}
   Tipo: {TIPO}
   Status: to-do (.bmad/sprint-status.yaml)
   Estimativa: {ESTIMATIVA}h
   Arquivo: {CAMINHO}

Próximos passos:
  /project:backlog move task TASK-{ID} in-progress  # Iniciar a tarefa
  /workflow:status --board                                     # Ver o Kanban
```

Exemplos: `/project:backlog add task US-001 "[BE] Endpoint da API de login" 4h`, `/project:backlog add task US-001 "[TEST] Testes unitários do AuthService" 3h`.

Validação: tipo válido, estimativa entre 0.5h e 8h, a User Story existe, ID único.

## list epic

`/project:backlog list epic [status] [prioridade]`

- **Status** (derivado das stories): todo, in-progress, blocked, done, all (padrão: all)
- **Prioridade**: high, medium, low

1. Percorrer `project-management/backlog/epics/`, ler cada `EPIC-XXX-*.md` para os metadados de conteúdo (nome, prioridade)
2. Ler os status de suas stories em `.bmad/sprint-status.yaml`
3. Aplicar os filtros; para cada EPIC contar o total de US, as US por status e o percentual de progresso (status do EPIC derivado conforme descrito nas Regras comuns)
4. Exibir a tabela

```
📋 EPICs do projeto

| ID | Nome | Status | Prioridade | US | Progresso |
|----|------|--------|------------|-----|-----------|
| EPIC-001 | Autenticação | 🟡 Em andamento | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catálogo | 🔴 A fazer | Medium | 8 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Resumo: 2 EPICs | 🔴 1 A fazer | 🟡 1 Em andamento | 🟢 0 Concluído
```

Com muitos EPICs (ex.: 12), usar o formato compacto: uma linha por grupo de status (`🔴 A fazer (5): EPIC-002, EPIC-003, ...`, `🟡 Em andamento (4): EPIC-001 (40%), ...`, `⏸️ Bloqueado`, `🟢 Concluído`).

Exemplos: `/project:backlog list epic`, `/project:backlog list epic in-progress`, `/project:backlog list epic all high`, `/project:backlog list epic blocked`.

Para o detalhe de um EPIC, sugerir: `cat project-management/backlog/epics/EPIC-001-*.md`.

## list story

`/project:backlog list story [filtro] [valor]`

- `epic EPIC-XXX`: filtrar por EPIC | `sprint N`: filtrar por sprint | `status STATUS`: backlog, ready-for-dev, in-progress, review, done, blocked | `backlog`: somente as US não atribuídas a um sprint

1. Percorrer `project-management/backlog/user-stories/`, ler cada `US-XXX-*.md` para os metadados de conteúdo (título, EPIC, sprint)
2. Ler o status de cada US, os status e as contagens de tarefas em `.bmad/sprint-status.yaml`
3. Aplicar os filtros; por US contar o total de tarefas, as tarefas por status e o percentual de progresso
4. Exibir uma tabela agrupada por EPIC ou por sprint conforme o contexto

```
📖 User Stories - EPIC-001: Autenticação

| ID | Nome | Sprint | Status | Pontos | Tarefas | Progresso |
|----|------|--------|--------|--------|---------|-----------|
| US-001 | Login do usuário | Sprint 1 | 🟡 Em andamento | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Cadastro | Sprint 1 | 🔴 A fazer | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Esqueci a senha | Backlog | 🔴 A fazer | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 pontos | 🔴 2 | 🟡 1 | 🟢 0
```

- Por sprint: colunas `ID | EPIC | Nome | Status | Pontos | Tarefas | Progresso`, rodapé `Sprint 1: 3 US | 13 pontos | Concluído: 5 pts (38%)`
- Backlog (não atribuídas): colunas `ID | EPIC | Nome | Prioridade | Pontos | Status`, rodapé `Backlog: 3 US | 16 pontos a planejar`

Exemplos: `/project:backlog list story`, `... list story epic EPIC-001`, `... list story sprint 1`, `... list story status blocked`, `... list story backlog`.

Ações sugeridas: `/project:backlog move story US-XXX sprint-2` (atribuir a um sprint), `/project:backlog move story US-XXX in-progress` (alterar o status), `/project:backlog add task US-XXX "[BE] ..." 4h`.

## list task

`/project:backlog list task [filtro] [valor]`

- `us US-XXX` | `sprint N` | `type TYPE` (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV) | `status STATUS` (to-do, in-progress, blocked, done)

1. Percorrer `project-management/sprints/sprint-{N}-{slug}/tasks/` e `project-management/backlog/tasks/` (se existir), ler cada `TASK-XXX.md` para os metadados de conteúdo (tipo, descrição, estimativa)
2. Ler o status de cada tarefa em `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`)
3. Aplicar os filtros; calcular o total de horas estimadas, as horas concluídas, a divisão por tipo e por status
4. Exibir

```
🔧 Tarefas - US-001: Login do usuário

| ID | Tipo | Descrição | Status | Est. | Gasto |
|----|------|-----------|--------|------|-------|
| TASK-001 | [DB] | Entidade User | 🟢 Concluído | 2h | 2h |
| TASK-003 | [BE] | Endpoint da API de login | 🟡 Em andamento | 4h | 2h |
| TASK-004 | [FE-WEB] | Controller de auth | 🔴 A fazer | 3h | - |
| TASK-005 | [FE-MOB] | Tela de login | ⏸️ Bloqueado | 6h | - |

───────────────────────────────────────────────────
US-001: 4 tarefas | 15h estimadas | 4h concluídas (27%)
```

- Por sprint: resumo por status (`🔴 A fazer (8 tarefas, 24h)`, ...) e por tipo (uma barra por `[DB]`, `[BE]`, ...), rodapé `Sprint 1: 25 tarefas | 77h estimadas | 35h concluídas (45%)`
- Bloqueadas (`status blocked`): colunas `ID | US | Tipo | Descrição | Bloqueio`, rodapé `2 tarefas bloqueadas | 14h em espera`, depois uma lista `Ações:` indicando como resolver cada bloqueio

Exemplos: `/project:backlog list task`, `... list task us US-001`, `... list task sprint 1`, `... list task type BE`, `... list task status blocked`.

## edit epic

`/project:backlog edit epic EPIC-XXX [campo] [valor]`

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `name` | Nome do EPIC | "Novo nome" |
| `priority` | Prioridade | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "Descrição do MMF" |
| `description` | Descrição | "Nova descrição" |

> **O status não é editável aqui.** O status de um EPIC é derivado dos status de suas stories em `.bmad/sprint-status.yaml`. Para alterar o status de uma story use `/project:backlog move story`; para o de uma tarefa, `/project:backlog move task`.

- **Modo interativo** (somente o ID): exibir os campos atuais numerados (Nome, Prioridade, MMF, Descrição) e perguntar qual modificar (`1-4`, ou `q` para sair)
- **Modo direto** (campo e valor): modificar diretamente o campo

Etapas: validar que o EPIC existe, ler o arquivo, modificar o campo, atualizar a data de modificação, salvar, atualizar o índice se necessário.

```
✅ EPIC atualizado!

📋 EPIC-001: Sistema de autenticação

Modificação:
  Prioridade: High → Medium

Arquivo: project-management/backlog/epics/EPIC-001-sistema-de-autenticacao.md
```

Exemplos: `/project:backlog edit epic EPIC-001`, `... edit epic EPIC-001 name "Autenticação e autorização"`, `... edit epic EPIC-001 priority Low`, `... edit epic EPIC-001 mmf "Permitir SSO e 2FA"`.

Validação: o campo deve ser modificável, prioridade High/Medium/Low, nome não vazio.

## edit story

`/project:backlog edit story US-XXX [campo] [valor]`

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `name` | Nome da US | "Novo nome" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | EPIC pai | EPIC-002 |
| `persona` | Persona associada | P-001 |
| `story` | Texto da US | "Como um..." |
| `criteria` | Critérios de aceitação | (modo interativo) |

> **O status não é editável aqui.** Os status vivem em `.bmad/sprint-status.yaml`. Para alterar o status de uma story use `/project:backlog move story`; para o de uma tarefa, `/project:backlog move task`.

- **Modo interativo** (somente o ID): exibir os campos numerados (Nome, EPIC, Pontos, Persona, Story, Critérios de aceitação) e perguntar qual modificar (`1-6`, ou `q`)
- **Modo direto**: por ex. `/project:backlog edit story US-001 points 8`
- **Critérios de aceitação** (interativo): listar os critérios (CA-1, CA-2, ...) e perguntar `(a)dicionar, (m)odificar, (e)xcluir, (s)air`; um novo critério é informado em Gherkin (GIVEN / WHEN / THEN)

Etapas: validar que a US existe, ler o arquivo, modificar o campo, atualizar a data de modificação, salvar, atualizar o EPIC pai se mudou, atualizar o índice.

```
✅ User Story atualizada!

📖 US-001: Login do usuário

Modificação:
  Pontos: 5 → 8

⚠️ Atenção: 8 pontos é o máximo recomendado.
   Considere dividir esta US se estiver complexa demais.

Arquivo: project-management/backlog/user-stories/US-001-login-do-usuario.md
```

Se o EPIC pai mudar (`EPIC: EPIC-001 → EPIC-002`), indicar as atualizações: US removida da lista do EPIC anterior, adicionada à do novo, índice atualizado; atualizar também `epic_id` em `.bmad/sprint-status.yaml`.

Exemplos: `/project:backlog edit story US-001`, `... edit story US-001 points 3`, `... edit story US-001 epic EPIC-002`, `... edit story US-001 name "Login do usuário com SSO"`.

Validação: pontos Fibonacci (1, 2, 3, 5, 8), avisar para dividir se > 8, o EPIC deve existir, a persona deve estar definida em personas.md.

## move task

`/project:backlog move task TASK-XXX <destino>`

- **TASK-ID** (obrigatório); **Destino** (obrigatório): `in-progress` (iniciar), `blocked`, `done`. Para o status de uma **story** use `/project:backlog move story`.

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

| De | Para | Permitido |
|----|------|-----------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Proibido** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (rollback) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (reabertura) |

Processo:

1. **Validar a tarefa**: encontrar o arquivo da tarefa, ler seu status atual em `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), identificar a US e o sprint
2. **Validar a transição** com a tabela; to-do → done é bloqueado e `in-progress` é sugerido
3. **Para blocked**: perguntar o bloqueio (`Qual é o bloqueio de TASK-XXX?`)
4. **Para done**: perguntar o tempo gasto (`Tempo gasto em TASK-XXX? (estimativa: 4h)`)
5. **Atualizar o status**: escrevê-lo em `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), recalcular `stories.<US>.tasks.completed` (= número de tarefas `done`); nunca no arquivo da tarefa. No arquivo da tarefa muda apenas o conteúdo: texto do bloqueio se blocked, tempo gasto se done, data de modificação
6. **Atualizar o board**: regenerar o `board.md` do sprint a partir de `.bmad/sprint-status.yaml` e atualizar as métricas
7. **Atualizar a User Story** (conteúdo da lista de tarefas, progresso recalculado a partir de `.bmad/sprint-status.yaml`); se todas as tarefas estiverem done, sugerir concluir a US
8. **Atualizar o índice** (contadores globais)

Saídas:

```
✅ Tarefa movida!

🔧 TASK-003: Endpoint da API de login
   Antes: to-do
   Depois: in-progress

📖 US-001: Login do usuário
   Progresso: 2/6 → 3/6 (50%)

Próximos passos:
  /project:backlog move task TASK-003 done       # Ao concluir
  /project:backlog move task TASK-003 blocked    # Se bloqueada
```

Para `done`, exibir também a estimativa versus o tempo real (`Estimativa: 4h`, `Tempo real: 3.5h ✓`), a barra de progresso da US e os totais do sprint (tarefas concluídas, horas realizadas). Quando todas as tarefas da US estiverem done:

```
🎉 Todas as tarefas de US-001 concluídas!

Próximo passo recomendado:
  /project:backlog move story US-001 done
```

Erro de workflow:

```
❌ Transição não permitida!

🔧 TASK-004: Controller de auth
   Status atual: to-do
   Transição solicitada: → done

Regra: Uma tarefa deve passar por "In Progress" antes de "Done"

Ação correta:
  /project:backlog move task TASK-004 in-progress
  # ... trabalhar na tarefa ...
  /project:backlog move task TASK-004 done
```

Para `blocked`, exibir `Status: in-progress → blocked`, o texto do bloqueio e como desbloquear (concluir a tarefa que bloqueia e depois `/project:backlog move task TASK-005 in-progress`).

Exemplos: `/project:backlog move task TASK-001 in-progress`, `... move task TASK-001 done`, `... move task TASK-001 blocked`, `... move task TASK-001 in-progress` (desbloquear).

Métricas atualizadas a cada movimentação: número de tarefas por status, horas estimadas vs reais, progresso da US, progresso do sprint, board Kanban.

## next story

`/project:backlog next story [--claim]`

- **--claim** (opcional): move automaticamente a story para `in-progress`

1. **Carregar**: ler `.bmad/sprint-status.yaml`, coletar as stories com status `ready-for-dev`, ordená-las por prioridade (se definida) ou por ID
2. **Verificar os pré-requisitos** de cada story pronta: sem dependências bloqueantes (todas as stories `Depends on` estão em `done` ou `review`; caso contrário, indicar quais bloqueiam), pontos de story estimados, tarefas decompostas, critérios de aceitação definidos
3. **Selecionar**, nesta ordem: todas as dependências resolvidas, sem dependências bloqueantes, menor ID de story (mais cedo no backlog), menos pontos de story (as mais simples primeiro)
4. **Exibir** a story: ID e título, pontos, EPIC, critérios de aceitação, lista de tarefas, pré-requisitos, dependências, notas
5. **Reservar** (somente com `--claim`): mesmo efeito de `/project:backlog move story US-XXX in-progress` (gates, histórico): status `in-progress`, `tdd_phase` em `red`, `current_task` na primeira tarefa, entrada adicionada a `history`
6. **Orientar**: primeira tarefa a trabalhar e lembrete de TDD

```
═══════════════════════════════════════════════════════
         Próxima story pronta para desenvolvimento
═══════════════════════════════════════════════════════

📖 US-012: Implementar a página de perfil do usuário
   Epic: EPIC-003 (Gestão de usuários)
   Pontos: 5
   Prioridade: High

Critérios de aceitação (3):
□ AC1: O usuário pode ver as informações do seu perfil
□ AC2: O usuário pode editar seu nome e seu email
□ AC3: As alterações são validadas antes de salvar

Tarefas (4):
□ TASK-031 [BE] Criar o endpoint de API do perfil
□ TASK-033 [FE] Criar o componente de perfil

Pré-requisitos:
✅ Sem dependências bloqueantes
✅ Pontos de story estimados
✅ Tarefas decompostas
✅ Critérios de aceitação definidos

Dependências:
✅ US-001 (Página de login) — done

Para começar:
  /project:backlog move story US-012 in-progress
Ou usar: /project:backlog next story --claim
═══════════════════════════════════════════════════════
```

Quando nenhuma story está pronta, exibir o estado do backlog (stories no backlog a refinar, em andamento, bloqueadas) e sugestões: refinar as stories do backlog (`/project:migrate --stories`), ajudar nas stories em andamento, desbloquear uma story bloqueada (exibir seu `blocked_reason`), ver o grafo de dependências (`/project:report deps`), ver o sprint (`/workflow:status`) e verificar a prontidão das stories (`/gate:check backlog`).

Depois de reservar uma story, seguir o TDD: 🔴 RED (teste que falha para o primeiro AC/tarefa), 🟢 GREEN (código mínimo para passar), 🔵 REFACTOR (limpar, os testes continuam verdes), e repetir para cada tarefa. `tdd_phase` em `.bmad/sprint-status.yaml` acompanha a fase.

Exemplos: `/project:backlog next story`, `/project:backlog next story --claim`.

## move story

`/project:backlog move story US-XXX <status> ["motivo"]`

- **US-ID** (obrigatório); **Status** (obrigatório): `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`, ou `sprint-N` (atribui a story ao sprint N, p. ex. `sprint-2`)
- **motivo** (obrigatório para `blocked`): armazenado em `blocked_reason`

```
backlog → ready-for-dev → in-progress → review → done
                              ↑            │
                              └────────────┘  (alterações solicitadas)
qualquer status → blocked → previous_status (retomar)
```

| De | Para | Permitido |
|----|------|-----------|
| backlog | ready-for-dev | ✅ |
| ready-for-dev | in-progress | ✅ |
| in-progress | review | ✅ |
| review | done | ✅ |
| review | in-progress | ✅ (alterações solicitadas) |
| qualquer | blocked | ✅ (motivo obrigatório) |
| blocked | previous_status | ✅ (retomar) |
| in-progress | done | ❌ **Proibido** (passar por `review`) |

Processo:

1. **Validar a story**: ler `.bmad/sprint-status.yaml`, encontrar a story pelo ID, obter seu status atual
2. **Validar a transição** conforme a tabela acima; caso contrário, exibir as transições válidas a partir do status atual
3. **Verificar as gates** do status de destino; uma gate com falha bloqueia a transição e lista as ações necessárias:

| → Destino | Exigências da gate |
|-----------|--------------------|
| `ready-for-dev` | Critérios de aceitação definidos, pontos de story estimados, tarefas decompostas |
| `in-progress` | Sem dependências bloqueantes, desenvolvedor atribuído (opcional) |
| `review` | Todas as tarefas concluídas, testes verdes (TDD green ou refactor), código enviado |
| `done` | Código revisado, todos os AC validados, checklist DoD completa |
| `blocked` | `blocked_reason` informado |

4. **Executar a transição**: tudo é escrito em `.bmad/sprint-status.yaml` (fonte única de verdade do status, esquema em `.claude/templates/project/sprint-status.md`); os arquivos Markdown de US/EPIC contêm apenas conteúdo e nunca recebem um status:
   1. Armazenar `previous_status` em `stories.<US>`
   2. Atualizar `stories.<US>.status`
   3. Definir os timestamps
   4. Atualizar `stories.<US>.tdd_phase` se aplicável
   5. Adicionar uma entrada a `stories.<US>.history` (`timestamp`, `from`, `to`, `by`, `reason`)
5. **Aplicar os efeitos colaterais**: `→ in-progress`: `tdd_phase: red`, `current_task` = primeira tarefa | `→ review`: `tdd_phase: refactor`, limpar `current_task` | `→ done`: limpar `tdd_phase`, registrar a hora de conclusão | `→ blocked`: armazenar `blocked_reason` e `previous_status`
6. **Aplicar as regras de roteamento**: após cada transição, avaliar `routing.auto_transitions` (ver `move story --auto` abaixo) para encadear as transições dependentes

```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "All tasks complete"
```

Transição bem-sucedida:

```
📖 US-005: Autenticação de usuário

Status: in-progress → review ✅

Verificação das gates:
✅ Todas as tarefas concluídas (5/5)
✅ Testes verdes
✅ Código enviado

Histórico atualizado:
• 2026-01-29 10:00 - in-progress → review (manual)
• 2026-01-27 09:00 - ready-for-dev → in-progress
```

Gate com falha:

```
📖 US-005: Autenticação de usuário

Solicitado: in-progress → review ❌

Gates com falha:
❌ Tarefas incompletas: 3/5
❌ A fase TDD é 'red' - os testes precisam passar primeiro

Ações necessárias:
1. Concluir as tarefas restantes (TASK-015, TASK-016)
2. Passar o TDD para a fase green: .bmad/sprint-status.yaml → US-005: tdd_phase: green

Depois tentar novamente: /project:backlog move story US-005 review
```

Transição inválida: exibir o status atual e o solicitado, o motivo (`Não é possível passar diretamente de 'in-progress' para 'done'`), as transições válidas a partir do status atual e a máquina de estados.

Casos particulares:

- **Bloquear**: `/project:backlog move story US-003 blocked "Aguardando credenciais da API"` armazena o motivo e preserva o status anterior para retomada
- **Desbloquear**: `/project:backlog move story US-003 in-progress` volta ao status anterior
- **Alterações solicitadas** (review): `/project:backlog move story US-005 in-progress`
- **Atribuir a um sprint**: `/project:backlog move story US-003 sprint-2` atribui a story ao sprint 2, cria o diretório do sprint se necessário; o status da story é preservado
- **Cascata para as tarefas**: `→ in-progress` mantém as tarefas no status atual (iniciadas individualmente); `→ done` verifica se todas as tarefas estão `done` e avisa caso contrário; `→ blocked` marca como `blocked` todas as tarefas em andamento

Próximos passos conforme o status de destino: `→ in-progress`: `/workflow:implement --story US-XXX` | `→ review`: `/gate:check story` (validar a DoD) | `→ done`: `/project:backlog next story` (e `/workflow:review` quando o sprint terminar) | `→ blocked`: resolver o bloqueio e depois `/project:backlog move story US-XXX in-progress`.

### move story --auto

`/project:backlog move story --auto [--dry-run]`

Avalia as regras de roteamento e faz as stories transitarem de acordo (sem ID de story). **--dry-run** pré-visualiza as transições sem aplicá-las. As mesmas regras também são aplicadas após cada transição `move story` e, conforme as configurações de `routing.auto_transitions`, no hook Stop, após a conclusão de uma tarefa e ao iniciar a sessão.

1. **Carregar**: ler `.bmad/sprint-status.yaml`, carregar `routing.auto_transitions.rules`, obter todas as stories
2. **Avaliar** cada regra para cada story:

| Regra | `when` | De → Para |
|-------|--------|-----------|
| `all_tasks_complete` | `tasks.completed == tasks.total && tasks.total > 0` | `in-progress` → `review` |
| `review_approved` | `review.approved == true` | `review` → `done` |
| `blocked_detection` | `blocked_reason != null` | `*` → `blocked` |
| `unblocked` | `blocked_reason == null && previous_status != null` | `blocked` → `previous_status` |

3. **Verificar os pré-requisitos** antes da transição automática: exigências de gate do status de destino (como em `move story`), nenhuma regra em conflito, story não bloqueada manualmente
4. **Executar** (exceto com `--dry-run`): registrar a transição, atualizar o status, anotá-la em `history` com `by: "auto-route"`, aplicar os efeitos colaterais (fase TDD, etc.)
5. **Relatar**: regras avaliadas, stories verificadas, transições realizadas, stories inalteradas, erros ou avisos

```
═══════════════════════════════════════════════════════
         Prévia do roteamento automático (DRY RUN)
═══════════════════════════════════════════════════════
Avaliando 4 regras de roteamento em 8 stories...

Transições previstas:
📖 US-005: Autenticação de usuário
   Regra: all_tasks_complete
   in-progress → review
   Motivo: 5/5 tarefas concluídas

📖 US-003: Integração OAuth
   Regra: unblocked
   blocked → in-progress
   Motivo: blocked_reason limpo

Resumo:
Regras avaliadas: 4 | Stories verificadas: 8
Transições previstas: 2 | Sem alteração: 6

Executar sem --dry-run para aplicar as transições.
═══════════════════════════════════════════════════════
```

Sem `--dry-run`, o relatório lista `✅ US-005: in-progress → review` com a regra e os detalhes, depois `Transições realizadas: N`. Quando nada é acionado: `Nenhuma transição automática necessária.` seguido das stories por status.

As regras personalizadas e os gatilhos são configurados em `.bmad/sprint-status.yaml`:

```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
    rules:
      - name: "review_timeout"
        description: "Sinalizar as stories em review há mais de 2 dias"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify
      - name: "priority_bump"
        description: "Notificar as stories prontas de alta prioridade"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

Próximos passos: `/project:backlog next story` (escolher a próxima story roteada), `/workflow:implement` (iniciar o desenvolvimento).

Exemplos: `/project:backlog move story US-005 review`, `/project:backlog move story US-003 blocked "Aguardando uma API externa"`, `/project:backlog move story --auto --dry-run`, `/project:backlog move story --auto`.
