# Bear Craft — Workflow

BMAD v6 sprint workflow: init, plan, design, start, implement, review, retro and status.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install workflow@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/workflow:auto-sprint` — End-to-end sprint orchestrator (start -> decompose -> validate -> implement -> PR -> CI -> review -> retro -> merge)
- `/workflow:design` — Execute the Design (Solutioning) phase - generate the technical specification (default) or the project constitution (--constitution)
- `/workflow:implement` — Execute the Implementation phase - TDD/BDD development of a sprint, an epic, a story or the batch queue (sequential, or parallel via /team:delivery --phase=implementation)
- `/workflow:init` — Analyze project context and recommend the optimal development workflow track
- `/workflow:plan` — Execute the Planning phase - research (--research), PRD (--only=prd) and SCRUM backlog (--only=backlog)
- `/workflow:retro` — Retrospective Facilitation
- `/workflow:review` — Sprint Review Preparation
- `/workflow:start` — Sprint Start Preparation: sprint folder, sprint-status.yaml entries and task decomposition
- `/workflow:status` — Where am I + next action: workflow phase, sprint metrics, Kanban board (--board), batch queue (--queue), stand-up (--standup) and gates (--gates)

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
