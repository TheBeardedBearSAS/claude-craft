---
name: workflow-status
description: "Onde estou + próxima ação: fase do workflow, métricas do sprint, quadro Kanban (--board), fila de lotes (--queue), stand-up (--standup) e gates (--gates)"
argument-hint: "[--board|--queue|--standup|--gates] [--sprint N] [--verbose]"
arguments:
  - name: view
    description: "Visão opcional: --board, --queue, --standup ou --gates (padrão: fase + métricas do sprint + próxima ação)"
    required: false
  - name: sprint
    description: "Número do sprint (--sprint N), por padrão o sprint atual"
    required: false
  - name: verbose
    description: Mostrar status detalhado com todos os artefatos
    required: false
---

# /workflow:status

## Missão

Responder a "onde estou e o que faço em seguida?". Exibe a fase do workflow, as métricas do sprint e a próxima ação recomendada. O mesmo comando também renderiza o quadro Kanban, a fila de lotes, o stand-up diário e o resumo dos gates.

Este comando **atualiza** `project-management/workflow-status.yaml` (`current_phase`, `artifacts`, `next_action`, `next_command`) a cada execução, de modo que o arquivo sempre reflita o que existe em disco.

## Uso

| Modo | O que faz | Substitui |
|------|-----------|-----------|
| `/workflow:status` | Visão padrão: fase do workflow + métricas do sprint + próxima ação | `/workflow:status` |
| `/workflow:status --verbose` | Igual, com todos os artefatos e as verificações de saúde | - |
| `/workflow:status --board` | Quadro Kanban do sprint, regenera `board.md` | `/workflow:status --board` |
| `/workflow:status --queue [--history]` | Fila de lotes (`.bmad/batch-queue.yaml`) e seu histórico | `/workflow:status --queue` |
| `/workflow:status --standup [date]` | Resumo do stand-up diário (ontem / hoje / bloqueios) | `/workflow:status --standup` |
| `/workflow:status --gates` | Resumo dos quality gates, executa/lê `/gate:check all` | - |
| `--sprint N` | Direciona para o sprint N em vez do atual (combina com qualquer visão) | - |

```bash
/workflow:status                   # Fase + métricas do sprint + próxima ação
/workflow:status --verbose         # Visão detalhada com todos os artefatos
/workflow:status --board           # Quadro Kanban do sprint atual
/workflow:status --board --sprint 2
/workflow:status --queue --history
/workflow:status --standup
/workflow:status --gates
```

## Fontes de verdade

| Dado | Fonte |
|------|-------|
| Fase do workflow, artefatos, próxima ação | `project-management/workflow-status.yaml` (atualizado por este comando) |
| Status das stories e tarefas, fase TDD, roteamento | `.bmad/sprint-status.yaml` (fonte única de verdade para o status; esquema em `.claude/templates/project/sprint-status.md`) |
| Conteúdo (títulos, estimativas, tipos, AC) | Arquivos Markdown em `project-management/` (nunca uma fonte de status) |
| Fila de lotes | `.bmad/batch-queue.yaml` |

## Processo (visão padrão)

### Etapa 1: Ler e atualizar o estado do workflow

1. Ler `project-management/workflow-status.yaml`; se estiver ausente, exibir a tela "Nenhum workflow inicializado" abaixo.
2. Verificar quais artefatos existem (`prd.md`, `tech-spec.md`, `backlog/`, `sprints/`, ...) e definir o status de cada artefato.
3. Deduzir `current_phase` e atualizar `artifacts`, `next_action`, `next_command`, `updated_at` no arquivo.

### Etapa 2: Ler as métricas do sprint

1. Identificar o sprint (`--sprint N` ou o atual: o sprint com stories não concluídas) e ler seu `sprint-goal.md`.
2. Ler `.bmad/sprint-status.yaml`: status das stories/tarefas, `tdd_phase`, atribuições, bloqueios.
3. Calcular pontos, tarefas e horas concluídos vs. meta, progresso por story, burndown, bloqueios e riscos.
4. Adicionar o roteamento BMAD: contagens da máquina de estados, fase TDD das stories em andamento, sugestões de roteamento automático (stories cujas tarefas estão todas concluídas estão prontas para `review`).

### Etapa 3: Exibir

Visão da fase, métricas do sprint e, em seguida, a próxima ação e seu comando.

## Formato de Saída

### Visão Padrão

```
╔══════════════════════════════════════════════════════════════════╗
║                       STATUS DO WORKFLOW                          ║
╠══════════════════════════════════════════════════════════════════╣
║ Projeto: my-awesome-app                                           ║
║ Track: STANDARD                                                   ║
║ Fase Atual: Implementação ████████░░░░░░░░ 45%                    ║
╠══════════════════════════════════════════════════════════════════╣
║  Fase 1: Análise          ⏭️  Pulada (track Standard)             ║
║  Fase 2: Planejamento     ✅ PRD, backlog (18 stories, 89 pts)    ║
║  Fase 3: Design           ✅ Tech spec, arquitetura, 3 ADRs       ║
║  Fase 4: Implementação    🔄 Sprint 1 (Dia 8/14)                  ║
╠══════════════════════════════════════════════════════════════════╣
║ SPRINT 1 - Walking Skeleton                                       ║
║ Pontos: 5/10 🟡 50%  Tarefas: 8/16  Horas: 28h/62h                ║
║ Estado: [backlog 2] [ready-for-dev 3] [in-progress 2] [review 1]  ║
║         [done 4] [blocked 1]                                      ║
║ Bloqueios: TASK-008 (aguardando API de auth, 2 dias)              ║
╠══════════════════════════════════════════════════════════════════╣
║ PRÓXIMA AÇÃO: Continuar o sprint                                  ║
║ COMANDO: /workflow:implement                                      ║
╚══════════════════════════════════════════════════════════════════╝
```

### Bloco de métricas do sprint

```
Progresso geral: ██████████████░░░░░░░░░░░░░░░░░░ 45%

│ US      │ Nome         │ Pts │ Tarefas │ TDD   │ Status         │
├─────────┼──────────────┼─────┼─────────┼───────┼────────────────┤
│ US-005  │ Login de usuário │ 5   │ 3/5   │ Green │ 🟡 Em Andamento │
│ US-007  │ Redefinição de senha │ 3 │ 0/4 │ Red   │ 🟡 Em Andamento │

Burndown: 34h restantes, ideal 28h → 🟡 ligeiramente atrasado (6h)
Riscos: 🔴 mobile bloqueado há 2 dias → priorizar TASK-005
Roteamento automático: US-008 tem todas as tarefas concluídas → /project:backlog move story US-008 review
```

O relatório também é salvo em `project-management/sprints/sprint-{N}-{slug}/status-YYYY-MM-DD.md`.

### Visão Detalhada (--verbose)

Adiciona, por fase, todos os artefatos com seu caminho, versão e contagens (requisitos do PRD, personas, EPICs e stories por prioridade, sprints planejados, stack da tech spec, diagramas de arquitetura, endpoints de API projetados/restantes, ADRs, revisão de segurança), e depois:

```
║ SAÚDE DO WORKFLOW                                                 ║
║ ✅ PRD alinhado com o backlog                                     ║
║ ✅ Tech spec cobre todos os requisitos                            ║
║ ⚠️  Design da API incompleto (6 endpoints restantes)              ║
║ ⚠️  Revisão de segurança pendente                                 ║
║ PRÓXIMAS AÇÕES                                                    ║
║ 1. Completar o design da API → /workflow:design                   ║
║ 2. Em seguida, iniciar a implementação → /workflow:implement      ║
```

### Nenhum Workflow Inicializado

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  Nenhum workflow inicializado para este projeto               ║
║  Para começar, execute:  /workflow:init                           ║
║  • Analisar o contexto do seu projeto                             ║
║  • Recomendar o track (Quick/Standard/Enterprise)                 ║
║  • Inicializar o acompanhamento do workflow                       ║
╚══════════════════════════════════════════════════════════════════╝
```

### Status Quick Flow

Nenhuma fase é necessária. Mostrar a tarefa atual, se rastreada (por exemplo, `TASK-042: Corrigir bug de validação do login, Em Andamento`) e os comandos disponíveis: `/qa:tdd` (continuar com TDD), `/project:backlog move task <TASK> done` (marcar como concluída), `/workflow:init` (iniciar um novo workflow).

## `--board`: quadro Kanban

Exibe o quadro Kanban do sprint atual (ou `--sprint N`).

1. Identificar o sprint (número informado; caso contrário, o sprint atual com tarefas não concluídas).
2. Ler os status em `.bmad/sprint-status.yaml` (`stories.<US>.status`, `stories.<US>.tasks.status.<TASK>`) e o conteúdo (títulos, estimativas, tipos) nos arquivos markdown das US e das tarefas (`tasks/TASK-*.md`).
3. Agrupar as tarefas por coluna: 🔴 A Fazer, 🟡 Em Andamento, ⏸️ Bloqueada, 🟢 Concluída.
4. Calcular tarefas por coluna, horas estimadas e concluídas, porcentagem de progresso, progresso por tipo (`[DB]`, `[BE]`, `[WEB]`, `[MOB]`, `[TEST]`) e por user story.

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Quadro Kanban                                     ║
║  Objetivo: Walking Skeleton - Auth + Primeira página             ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 A FAZER (4)  │ 🟡 EM ANDAMENTO│ ⏸️ BLOQUEADA (1)│ 🟢 CONCLUÍDA (8)│
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ Testes E2E      │ Auth Service    │ Tela de Login   │ User Entity ✓   │
│ 4h @US-001      │ 4h @US-001      │ ⚠️ Aguardando API│ 2h @US-001     │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Tarefas: ████████████████████░░░░░░░░░░ 8/16 (50%)
Horas: ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Bloqueadas: 1 tarefa (6h)
```

Com muitas tarefas, usar o formato compacto:

```
📋 Sprint 1 - Kanban (32 tarefas)
🔴 A Fazer (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 Em Andamento (5):  TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Bloqueadas (2):    TASK-008 (API), TASK-021 (config)
🟢 Concluídas (13):   TASK-001..TASK-004, TASK-007, TASK-009..TASK-014
Progresso: 13/32 (41%) | 45h/98h
```

`board.md` é uma **visão gerada**: após a exibição, o arquivo `board.md` do sprint é regenerado a partir de `.bmad/sprint-status.yaml` (template `.claude/templates/project/board.md`). Nunca é editado manualmente e nunca é a fonte de um status.

Ações: `/project:backlog move task TASK-XXX in-progress` (iniciar), `/project:backlog move task TASK-XXX done` (concluir).

## `--queue`: fila de lotes

Exibe o status da fila de lotes (`/workflow:implement --queue`).

1. Ler `.bmad/batch-queue.yaml`, analisar as entradas e carregar o checkpoint.
2. Agrupar as stories por status: `pending` (aguardando), `running` (em andamento), `completed`, `failed` (erro), `skipped` (uma dependência falhou).
3. Mostrar o estado da fila; com `--history`, também as stories concluídas e com falha, com os tempos.

```
═══════════════════════════════════════════════════════
              Status da Fila de Lotes
═══════════════════════════════════════════════════════
Modo: Sequencial
Checkpoint: US-011 (2026-01-29 10:45:00)

⏳ Pendentes: 3   🔄 Em execução: 1   ✅ Concluídas: 2   ❌ Com falha: 0   ⏭️ Ignoradas: 0

Em execução:
🔄 US-012: Página de perfil
   Iniciada: 2026-01-29 10:45:00 (há 15 min) | Fase TDD: green | Tarefa: 2/4

Pendentes:
[4] US-013: Redefinição de senha (Dependências: US-010 ✅, US-011 ✅)
[5] US-014: Verificação de e-mail (Dependências: US-010 ✅)

██████████░░░░░░░░░░ 50% (3/6 stories) | Conclusão estimada: ~1h 30m
═══════════════════════════════════════════════════════
```

`--history` adiciona a tabela de concluídas (story, início, conclusão, duração), as stories com falha (erro, fase TDD), as ignoradas (motivo, por exemplo "Depende de US-013 com falha") e estatísticas: tempo total, média por story, taxa de sucesso (5/6 = 83%), pontos concluídos.

Uma fila vazia mostra como preenchê-la: `/workflow:implement --queue` ou `/workflow:implement --epic EPIC-001`.

Gerenciamento da fila:

```bash
.bmad/lib/batch-executor.sh add US-001 1   # adicionar uma story (prioridade 1)
# Tentar novamente uma story com falha: .bmad/batch-queue.yaml → US-013: status: pending
/workflow:implement --queue                # executar a fila
/workflow:implement --queue --resume       # retomar a partir do checkpoint
# Limpar a fila:         .bmad/batch-queue.yaml → queue: []
```

Formato do arquivo da fila:

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```

## `--standup`: stand-up diário

Gera um resumo da atividade de desenvolvimento para o stand-up diário. Argumento opcional: um período (padrão: desde ontem).

1. Coletar os dados (comandos executados via Docker quando dependem do ambiente do projeto):

```bash
git log --since="yesterday" --oneline --all   # commits desde ontem
git branch -a --sort=-committerdate | head -10
gh pr list --state open                       # PRs abertos
gh issue list --assignee @me --state open     # issues atuais
git status --short                            # alterações locais
```

2. Ler o bloco do sprint em `.bmad/sprint-status.yaml`: número do sprint, dia X/10, pontos restantes, burndown (📉 no prazo / 📈 adiantado / 📊 atrasado).
3. Gerar o resumo: concluído (commits, PRs mergeados, issues fechadas), planejado (em andamento por branch/issue/responsável/status, a iniciar), bloqueios/riscos (bloqueio, impacto, ação), pull requests ativos (idade, revisões), notas.
4. Formato curto para Slack/Teams:

```markdown
**📅 Daily - {YYYY-MM-DD}**
**Ontem:** • PR #123 mergeado (Google OAuth) • 5 commits em feature/auth
**Hoje:** • Finalizar PR #125 (GitHub OAuth) • Iniciar Issue #50 (Redefinição de senha)
**Bloqueios:** • ⚠️ Revisão pendente do PR #125 (@dev3)
**PRs para revisar:** • PR #127 - Corrigir perfil do usuário (0/2)
```

5. Métricas da equipe em 7 dias (commits, PRs, revisões, issues por membro) e velocidade atual (pontos entregues por dia, acumulado vs. ideal, por exemplo "📈 Adiantado em 1,6 ponto").

Regras do stand-up: 15 minutos no máximo para toda a equipe, em pé, no mesmo horário todos os dias, sem resolução de problemas (parking lot), foco no objetivo do sprint. Anti-padrões: reportar ao Scrum Master, longas discussões técnicas, "trabalhei em X" vago. Formato alternativo "walk the board": Concluído → Em Andamento → A Fazer, com foco no que bloqueia o progresso.

Para um resumo diário, uma GitHub Action agendada (cron `0 7 * * 1-5`) pode executar os mesmos comandos git/gh e publicar o resultado no Slack.

## `--gates`: resumo dos gates

Resume os quality gates executando (ou lendo o último resultado de) `/gate:check all`.

| Gate | Limite |
|------|--------|
| PRD | >= 80% |
| Tech spec | >= 90% |
| INVEST | 6/6 |
| Sprint ready | 100% |
| Story DoD | 100% |
| Spec alignment | >= 85% |

```
GATES
✅ prd 86%   ✅ tech-spec 92%   ✅ invest 6/6
⚠️ sprint-ready 80%   ⏳ story-dod (US-005 em andamento)   ✅ spec-alignment 88%
Próximo: corrigir os bloqueios de sprint-ready → /gate:check sprint-ready
```

Para um único gate, usar `/gate:check <gate>` diretamente.

## Estrutura do arquivo de status

O status do workflow é lido de, e gravado em, `project-management/workflow-status.yaml`:

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Track Standard - análise não necessária"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
  implementation:
    status: pending
    sprints:
      - name: sprint-1-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Completar o design da API"
next_command: "/workflow:design"
```

Os status de stories e tarefas NÃO são armazenados aqui: vivem apenas em `.bmad/sprint-status.yaml`.

## Comandos Relacionados

- `/workflow:init` - Inicializar o workflow
- `/workflow:plan` - Fase de planejamento (`--research`, `--only=prd`, `--only=backlog`)
- `/workflow:design` - Fase de design
- `/workflow:start` - Preparação do sprint
- `/workflow:implement` - Fase de implementação
- `/project:backlog` - Adicionar, listar, editar, mover stories e tarefas
- `/gate:check` - Quality gates

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║  Com base na fase atual:                                 ║
║                                                          ║
║  • init      → /workflow:plan                            ║
║  • plan      → /workflow:design                          ║
║  • design    → /workflow:start {N}                       ║
║  • start     → /workflow:implement                       ║
║  • implement → /workflow:review                          ║
║  • review    → /workflow:retro                           ║
║  • retro     → /workflow:start {N+1}                     ║
║                                                          ║
║  A qualquer momento: /workflow:status                    ║
╚══════════════════════════════════════════════════════════╝
```
