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

- `/bear-workflow:auto-sprint` — Orquestador de sprint de extremo a extremo (inicio -> descomposición -> validación -> implementación -> PR -> CI -> revisión -> retro -> merge)
- `/bear-workflow:design` — Ejecutar la fase de Diseño (Solutioning) - generar la especificación técnica (por defecto) o la constitución del proyecto (--constitution)
- `/bear-workflow:implement` — Ejecutar la fase de Implementación - desarrollo TDD/BDD de un sprint, un epic, una story o la cola batch (secuencial, o paralelo vía /bear-team:delivery --phase=implementation)
- `/bear-workflow:init` — Analizar el contexto del proyecto y recomendar el flujo de trabajo de desarrollo optimo
- `/bear-workflow:plan` — Ejecutar la fase de Planificación - investigación (--research), PRD (--only=prd) y backlog SCRUM (--only=backlog)
- `/bear-workflow:retro` — Facilitación de la Retrospectiva
- `/bear-workflow:review` — Preparación de la Sprint Review
- `/bear-workflow:start` — Preparación del inicio de sprint: carpeta del sprint, entradas de sprint-status.yaml y descomposición en tareas
- `/bear-workflow:status` — Dónde estoy + siguiente acción: fase del workflow, métricas del sprint, tablero Kanban (--board), cola de lotes (--queue), daily (--standup) y gates (--gates)

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
