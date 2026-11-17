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

- `/bear-paperclip:check` — Auditoría Paperclip por eje: architecture, code-quality, security, testing, o all (agregado con puntuación)
- `/bear-paperclip:generate-adapter` — Scaffoldear una extensión Paperclip (plugin vía create-paperclip-plugin, o adaptador built-in)
- `/bear-paperclip:generate-agent-config` — Redactar un payload de contratación de agente Paperclip (para la API o el dashboard)
- `/bear-paperclip:setup-company` — Bootstrapear una nueva compañía Paperclip (onboarding + primer agente)

## Agents

`paperclip-reviewer`

## Skills

`adapter-development`, `architecture-paperclip`, `coding-standards-ts`, `paperclip-onboarding`, `security-paperclip`, `testing-paperclip`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
