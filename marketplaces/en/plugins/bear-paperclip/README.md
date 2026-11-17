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

- `/bear-paperclip:check` — Paperclip audit by axis: architecture, code-quality, security, testing, or all (scored aggregate)
- `/bear-paperclip:generate-adapter` — Scaffold a Paperclip extension (plugin via create-paperclip-plugin, or built-in adapter)
- `/bear-paperclip:generate-agent-config` — Draft a Paperclip agent-hire payload (for the API or the dashboard)
- `/bear-paperclip:setup-company` — Bootstrap a new Paperclip company (onboarding + first agent)

## Agents

`paperclip-reviewer`

## Skills

`adapter-development`, `architecture-paperclip`, `coding-standards-ts`, `paperclip-onboarding`, `security-paperclip`, `testing-paperclip`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
