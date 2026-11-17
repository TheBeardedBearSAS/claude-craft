# Bear Craft — Workflow

BMAD v6 sprint workflow: init, plan, design, start, implement, review, retro and status.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-workflow@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/bear-workflow:auto-sprint` — End-to-End-Sprint-Orchestrator (Start -> Zerlegung -> Validierung -> Implementierung -> PR -> CI -> Review -> Retro -> Merge)
- `/bear-workflow:design` — Die Designphase (Solutioning) durchführen - technische Spezifikation (Standard) oder Projekt-Constitution (--constitution) erzeugen
- `/bear-workflow:implement` — Die Implementierungsphase durchführen - TDD/BDD-Entwicklung eines Sprints, eines Epics, einer Story oder der Batch-Queue (sequenziell oder parallel über /bear-team:delivery --phase=implementation)
- `/bear-workflow:init` — Projektkontext analysieren und den optimalen Entwicklungs-Workflow-Track empfehlen
- `/bear-workflow:plan` — Planungsphase ausführen - Recherche (--research), PRD (--only=prd) und SCRUM-Backlog (--only=backlog)
- `/bear-workflow:retro` — Retrospektiven-Facilitation
- `/bear-workflow:review` — Sprint Review Vorbereitung
- `/bear-workflow:start` — Sprint-Start-Vorbereitung: Sprint-Ordner, sprint-status.yaml-Einträge und Zerlegung in Tasks
- `/bear-workflow:status` — Wo stehe ich + nächste Aktion: Workflow-Phase, Sprint-Metriken, Kanban-Board (--board), Batch-Queue (--queue), Stand-up (--standup) und Gates (--gates)

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
