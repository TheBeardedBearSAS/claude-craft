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

- `/bear-python:async-check` — Python Async Check
- `/bear-python:check` — Python audit by axis: architecture, code-quality, security, testing, or all (scored aggregate)
- `/bear-python:dependency-audit` — Python Dependency Audit
- `/bear-python:generate-endpoint` — Generate FastAPI Endpoint
- `/bear-python:generate-model` — Generate SQLAlchemy Model
- `/bear-python:type-coverage` — Check Python Type Coverage

## Agents

`python-reviewer`

## Skills

`architecture`, `coding-standards`, `testing-python`, `tooling`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
