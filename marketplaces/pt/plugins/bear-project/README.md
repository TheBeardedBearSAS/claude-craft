# Bear Craft — Project

Project management: epics, stories, tasks, backlog and sprint tracking with product-owner and tech-lead agents.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-project@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 10.0.0.

## Commands

- `/bear-project:backlog` — Gerenciar o backlog: adicionar, listar, editar e mover EPICs, User Stories e Tarefas, escolher a próxima story, alterar o status das stories e aplicar as regras de roteamento
- `/bear-project:migrate` — Migração pontual de um backlog existente para BMAD v6 (análise, migração, completar stories, ressincronização)
- `/bear-project:report` — Relatórios analíticos do projeto: burndown do sprint, painel de métricas, grafo de dependências das histórias e caminho crítico
- `/bear-project:reverse` — Pipeline de engenharia reversa brownfield: escanear o código e derivar um PRD rascunho, user stories e uma análise de lacunas spec vs código
- `/bear-project:trace` — Matriz de rastreabilidade bidirecional (requisito → story → código → testes); --gaps lista os requisitos não cobertos, --by-priority agrupa por prioridade MoSCoW

## Agents

`product-owner`, `tech-lead`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
