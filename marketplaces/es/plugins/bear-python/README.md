# Bear Craft — Python

Python 3.15 / 3.14+: Backend with FastAPI, Pydantic, free-threading, JIT. Audit and generation commands, reviewer agent and stack skills.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-python@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/bear-python:async-check` — Verificación de Código Asíncrono Python
- `/bear-python:check` — Auditoría Python por eje: architecture, code-quality, security, testing, o all (agregado con puntuación)
- `/bear-python:dependency-audit` — Auditoría de Dependencias Python
- `/bear-python:generate-endpoint` — Generar Endpoint FastAPI
- `/bear-python:generate-model` — Generar Modelo SQLAlchemy
- `/bear-python:type-coverage` — Verificar Cobertura de Tipos Python

## Agents

`python-reviewer`

## Skills

`architecture`, `coding-standards`, `testing-python`, `tooling`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
