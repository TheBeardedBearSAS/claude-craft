---
description: "Gerenciar o backlog: adicionar, listar, editar e mover EPICs, User Stories e Tarefas"
argument-hint: "<add|list|edit|move> <epic|story|task> [args]"
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

Não existem `edit task` nem `move story`/`move epic`: os status das stories são alterados com `/sprint:transition` e os status dos EPICs são derivados.

## Argumentos

$ARGUMENTS: `<ação> <entidade> [args]`

1. Primeira palavra = ação: `add`, `list`, `edit` ou `move`
2. Segunda palavra = entidade: `epic`, `story` ou `task` (`move` aceita apenas `task`)
3. O restante é repassado à seção correspondente abaixo
4. Ação ou entidade ausente ou desconhecida: exibir a tabela de Uso e parar. `move story` / `move epic`: responder que os status das stories são alterados com `/sprint:transition` e que o status do EPIC é derivado

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
  /sprint:transition US-{ID} sprint-X                # Atribuir a um sprint
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
  /project:board                                     # Ver o Kanban
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

Ações sugeridas: `/sprint:transition US-XXX sprint-2` (atribuir a um sprint), `/sprint:transition US-XXX in-progress` (alterar o status), `/project:backlog add task US-XXX "[BE] ..." 4h`.

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

> **O status não é editável aqui.** O status de um EPIC é derivado dos status de suas stories em `.bmad/sprint-status.yaml`. Para alterar o status de uma story use `/sprint:transition`; para o de uma tarefa, `/project:backlog move task`.

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

> **O status não é editável aqui.** Os status vivem em `.bmad/sprint-status.yaml`. Para alterar o status de uma story use `/sprint:transition`; para o de uma tarefa, `/project:backlog move task`.

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

- **TASK-ID** (obrigatório); **Destino** (obrigatório): `in-progress` (iniciar), `blocked`, `done`. Para o status de uma **story** use `/sprint:transition`.

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
  /sprint:transition US-001 done
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
