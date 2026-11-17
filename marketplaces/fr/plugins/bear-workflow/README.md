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

- `/bear-workflow:auto-sprint` — Orchestrateur de sprint de bout en bout (démarrage -> décomposition -> validation -> implémentation -> PR -> CI -> revue -> rétro -> merge)
- `/bear-workflow:design` — Exécuter la phase de Conception (Solutioning) - générer la spécification technique (défaut) ou la constitution du projet (--constitution)
- `/bear-workflow:implement` — Exécuter la phase d'Implémentation - développement TDD/BDD d'un sprint, d'un epic, d'une story ou de la file batch (séquentiel, ou parallèle via /bear-team:delivery --phase=implementation)
- `/bear-workflow:init` — Analyser le contexte du projet et recommander le track de workflow optimal
- `/bear-workflow:plan` — Exécuter la phase de Planification - recherche (--research), PRD (--only=prd) et backlog SCRUM (--only=backlog)
- `/bear-workflow:retro` — Facilitation Rétrospective
- `/bear-workflow:review` — Préparation Sprint Review
- `/bear-workflow:start` — Préparation du début de sprint : dossier de sprint, entrées sprint-status.yaml et décomposition en tâches
- `/bear-workflow:status` — Où en suis-je + prochaine action : phase du workflow, métriques du sprint, tableau Kanban (--board), file d'attente batch (--queue), daily stand-up (--standup) et gates (--gates)

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
