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

- `/bear-paperclip:check` — Paperclip-Audit nach Achse: architecture, code-quality, security, testing oder all (bewertete Gesamtauswertung)
- `/bear-paperclip:generate-adapter` — Erstellt ein Paperclip-Extension-Gerüst (Plugin via create-paperclip-plugin oder Built-in-Adapter)
- `/bear-paperclip:generate-agent-config` — Einen Paperclip-Agent-Hire-Payload entwerfen (für die API oder das Dashboard)
- `/bear-paperclip:setup-company` — Bootstrapped eine neue Paperclip-Company (Onboarding + erster Agent)

## Agents

`paperclip-reviewer`

## Skills

`adapter-development`, `architecture-paperclip`, `coding-standards-ts`, `paperclip-onboarding`, `security-paperclip`, `testing-paperclip`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
