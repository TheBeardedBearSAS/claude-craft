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

- `/bear-project:backlog` — Gérer le backlog : ajouter, lister, modifier et déplacer EPICs, User Stories et Tâches, choisir la prochaine story, changer le statut des stories et appliquer les règles de routage
- `/bear-project:migrate` — Migration ponctuelle d'un backlog existant vers BMAD v6 (analyse, migration, complétion des stories, resynchronisation)
- `/bear-project:report` — Rapports analytiques du projet : burndown du sprint, tableau de bord de métriques, graphe de dépendances des stories et chemin critique
- `/bear-project:reverse` — Pipeline de rétro-ingénierie brownfield : scanner le code, puis dériver un PRD brouillon, des user stories et une analyse d'écarts spec vs code
- `/bear-project:trace` — Matrice de traçabilité bidirectionnelle (exigence → story → code → tests) ; --gaps liste les exigences non couvertes, --by-priority regroupe par priorité MoSCoW

## Agents

`product-owner`, `tech-lead`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
