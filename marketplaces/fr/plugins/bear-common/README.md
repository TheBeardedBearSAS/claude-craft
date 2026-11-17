# Bear Craft — Common

Shared agents, skills, rules, checklists and token/CI/ADR utilities (hooks live in bear-hooks).

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-common@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 10.0.0.

## Commands

- `/bear-common:aliases` — CLI aliases for frequently used commands
- `/bear-common:architecture-decision` — Architecture Decision Record (ADR)
- `/bear-common:generate-changelog` — Génération Automatique du Changelog
- `/bear-common:getting-started` — Visite guidée interactive de 10 minutes pour les nouveaux utilisateurs Bear Craft
- `/bear-common:init` — Bootstrap the Bear-Craft structure for a new project, or analyze the codebase and configure the project context (--context)
- `/bear-common:pack-repo` — Pack la codebase en un fichier AI-friendly (Repomix wrapper + fallback shell). Token counting inclus.
- `/bear-common:ralph-run` — Exécuter Claude en boucle continue jusqu'à la complétion de la tâche (Ralph Wiggum v2.0)
- `/bear-common:search` — Search commands, skills and agents by keyword
- `/bear-common:setup-ci` — Configuration CI/CD
- `/bear-common:setup-rtk` — Configurer RTK et l'optimisation des tokens pour Claude Code

## Agents

`accessibility-expert`, `api-designer`, `chaos-engineer`, `cost-optimizer`, `data-analyst`, `database-architect`, `devex-engineer`, `devops-engineer`, `migration-specialist`, `mlops-engineer`, `observability-engineer`, `performance-auditor`, `ralph-conductor`, `refactoring-specialist`, `research-assistant`, `security-auditor`, `tdd-coach`, `ui-designer`, `uiux-orchestrator`, `ux-ergonome`

## Skills

`documentation`, `dynamic-workflows`, `ecosystem-tools`, `git-workflow`, `kiss-dry-yagni`, `parallel-worktrees`, `security`, `solid-principles`, `sub-agents-patterns`, `testing`, `workflow-analysis`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
