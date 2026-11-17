# Bear Craft — Python

Python 3.15 / 3.14+: Backend with FastAPI, Pydantic, free-threading, JIT. Audit and generation commands, reviewer agent and stack skills.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-python@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 10.0.0.

## Commands

- `/bear-python:async-check` — Verificação de Async Python
- `/bear-python:check` — Auditoria Python por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)
- `/bear-python:dependency-audit` — Auditoria de Dependências Python
- `/bear-python:generate-endpoint` — Gerar Endpoint FastAPI
- `/bear-python:generate-model` — Gerar Modelo SQLAlchemy
- `/bear-python:type-coverage` — Verificar Cobertura de Tipos Python

## Agents

`python-reviewer`

## Skills

`architecture`, `coding-standards`, `testing-python`, `tooling`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
