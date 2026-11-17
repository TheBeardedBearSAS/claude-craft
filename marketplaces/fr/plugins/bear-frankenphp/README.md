# Bear Craft — FrankenPHP

FrankenPHP: PHP application server architecture, deployment setup, security audit and debugging.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-frankenphp@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/bear-frankenphp:architecture` — Concevoir une architecture complete de serving FrankenPHP
- `/bear-frankenphp:debug` — Diagnostiquer les problemes de worker et de Caddyfile FrankenPHP a partir des symptomes
- `/bear-frankenphp:deploy-setup` — Generer les fichiers de deploiement FrankenPHP pour Docker, Kubernetes ou standalone
- `/bear-frankenphp:optimize` — Optimiser la performance des workers FrankenPHP et le debit
- `/bear-frankenphp:security-audit` — Auditer la posture de securite FrankenPHP

## Agents

`frankenphp-architect`, `frankenphp-debug`, `frankenphp-deployment`, `frankenphp-performance`, `frankenphp-security`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
