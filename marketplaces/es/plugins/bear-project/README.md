# Bear Craft — Project

Project management: epics, stories, tasks, backlog and sprint tracking with product-owner and tech-lead agents.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-project@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/bear-project:backlog` — Gestionar el backlog: añadir, listar, editar y mover EPICs, User Stories y Tareas, elegir la próxima story, cambiar el estado de las stories y aplicar las reglas de enrutamiento
- `/bear-project:migrate` — Migración puntual de un backlog existente a BMAD v6 (análisis, migración, completar stories, resincronización)
- `/bear-project:report` — Informes analíticos del proyecto: burndown del sprint, panel de métricas, grafo de dependencias de historias y ruta crítica
- `/bear-project:reverse` — Pipeline de ingeniería inversa brownfield: escanear el código y derivar un PRD borrador, historias de usuario y un análisis de brechas spec vs código
- `/bear-project:trace` — Matriz de trazabilidad bidireccional (requisito → historia → código → pruebas); --gaps lista los requisitos no cubiertos, --by-priority agrupa por prioridad MoSCoW

## Agents

`product-owner`, `tech-lead`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
