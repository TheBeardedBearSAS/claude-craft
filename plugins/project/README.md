# Bear Craft — Project

Project management: epics, stories, tasks, backlog and sprint tracking with product-owner and tech-lead agents.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install project@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/project:backlog` — Manage the backlog: add, list, edit and move EPICs, User Stories and Tasks, pick the next story, move story statuses and apply routing rules
- `/project:migrate` — One-shot migration of an existing backlog to BMAD v6 (analyze, migrate, fill stories, resync)
- `/project:report` — Project analytics reports: sprint burndown, metrics dashboard, story dependency graph and critical path
- `/project:reverse` — Brownfield reverse-engineering pipeline: scan the codebase, then derive a draft PRD, user stories and a spec-vs-code gap analysis
- `/project:trace` — Bidirectional traceability matrix (requirement → story → code → tests); --gaps lists uncovered requirements, --by-priority groups by MoSCoW

## Agents

`product-owner`, `tech-lead`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
