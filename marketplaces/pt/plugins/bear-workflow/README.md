# Bear Craft — Workflow

BMAD v6 sprint workflow: init, plan, design, start, implement, review, retro and status.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-workflow@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 10.0.0.

## Commands

- `/bear-workflow:auto-sprint` — Orquestrador de sprint completo de ponta a ponta (início -> decomposição -> validação -> implementação -> PR -> CI -> revisão -> retro -> merge)
- `/bear-workflow:design` — Executar a fase de Design (Solutioning) - gerar a especificação técnica (padrão) ou a constituição do projeto (--constitution)
- `/bear-workflow:implement` — Executar a fase de Implementação - desenvolvimento TDD/BDD de um sprint, de um epic, de uma story ou da fila batch (sequencial, ou paralelo via /bear-team:delivery --phase=implementation)
- `/bear-workflow:init` — Analisar o contexto do projeto e recomendar o track de desenvolvimento ideal
- `/bear-workflow:plan` — Executar a fase de Planejamento - pesquisa (--research), PRD (--only=prd) e backlog SCRUM (--only=backlog)
- `/bear-workflow:retro` — Facilitação de Retrospectiva
- `/bear-workflow:review` — Preparação da Sprint Review
- `/bear-workflow:start` — Preparação do início de sprint: pasta do sprint, entradas do sprint-status.yaml e decomposição em tarefas
- `/bear-workflow:status` — Onde estou + próxima ação: fase do workflow, métricas do sprint, quadro Kanban (--board), fila de lotes (--queue), stand-up (--standup) e gates (--gates)

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
