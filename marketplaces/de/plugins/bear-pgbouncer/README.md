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

- `/bear-pgbouncer:architecture` — Design complete PgBouncer connection pooling architecture
- `/bear-pgbouncer:debug` — Diagnose PgBouncer connection pool issues from symptoms
- `/bear-pgbouncer:deploy-setup` — Setup PgBouncer deployment with Docker, Kubernetes, or systemd
- `/bear-pgbouncer:optimize` — Optimize PgBouncer pool performance and connection utilization
- `/bear-pgbouncer:security-audit` — Audit PgBouncer security posture

## Agents

`pgbouncer-architect`, `pgbouncer-debug`, `pgbouncer-deployment`, `pgbouncer-monitoring`, `pgbouncer-security`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
