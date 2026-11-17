# Bear Craft — Paperclip

Paperclip 2026.1106.0: Governance-first integration platform (control plane + adapters). Audit and generation commands, reviewer agent and stack skills.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-paperclip@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/bear-paperclip:check` — Auditoria Paperclip por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)
- `/bear-paperclip:generate-adapter` — Scaffold uma extensao Paperclip (plugin via create-paperclip-plugin, ou adapter built-in)
- `/bear-paperclip:generate-agent-config` — Rascunho de payload hire agente Paperclip (para a API ou o dashboard)
- `/bear-paperclip:setup-company` — Bootstrap uma nova empresa Paperclip (onboarding + primeiro agente)

## Agents

`paperclip-reviewer`

## Skills

`adapter-development`, `architecture-paperclip`, `coding-standards-ts`, `paperclip-onboarding`, `security-paperclip`, `testing-paperclip`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
