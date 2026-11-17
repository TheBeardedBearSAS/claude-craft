# Bear Craft — Paperclip

Paperclip 2026.1106.0: Governance-first integration platform (control plane + adapters). Audit and generation commands, reviewer agent and stack skills.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-paperclip@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 10.0.0.

## Commands

- `/bear-paperclip:check` — Audit Paperclip par axe : architecture, code-quality, security, testing, ou all (agrégat noté)
- `/bear-paperclip:generate-adapter` — Échafauder une extension Paperclip (plugin via create-paperclip-plugin, ou adaptateur intégré)
- `/bear-paperclip:generate-agent-config` — Rédiger un payload d'embauche d'agent Paperclip (pour l'API ou le tableau de bord)
- `/bear-paperclip:setup-company` — Initialiser une nouvelle entreprise Paperclip (onboarding + premier agent)

## Agents

`paperclip-reviewer`

## Skills

`adapter-development`, `architecture-paperclip`, `coding-standards-ts`, `paperclip-onboarding`, `security-paperclip`, `testing-paperclip`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
