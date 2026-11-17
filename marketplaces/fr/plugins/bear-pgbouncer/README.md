# Bear Craft — PgBouncer

PgBouncer: connection pooling architecture, deployment setup, security audit and debugging.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-pgbouncer@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 10.0.0.

## Commands

- `/bear-pgbouncer:architecture` — Concevoir une architecture complete de connection pooling PgBouncer
- `/bear-pgbouncer:debug` — Diagnostiquer les problemes de pool de connexions PgBouncer a partir des symptomes
- `/bear-pgbouncer:deploy-setup` — Configurer un deploiement PgBouncer avec Docker, Kubernetes ou systemd
- `/bear-pgbouncer:optimize` — Optimiser les performances du pool PgBouncer et l'utilisation des connexions
- `/bear-pgbouncer:security-audit` — Auditer la posture de securite PgBouncer

## Agents

`pgbouncer-architect`, `pgbouncer-debug`, `pgbouncer-deployment`, `pgbouncer-monitoring`, `pgbouncer-security`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
