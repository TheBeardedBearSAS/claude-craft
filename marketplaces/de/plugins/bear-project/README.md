# Bear Craft — Project

Project management: epics, stories, tasks, backlog and sprint tracking with product-owner and tech-lead agents.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-project@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Commands

- `/bear-project:backlog` — Backlog verwalten: EPICs, User Stories und Tasks hinzufügen, auflisten, bearbeiten und verschieben, nächste Story wählen, Story-Status ändern und Routing-Regeln anwenden
- `/bear-project:migrate` — Einmalige Migration eines bestehenden Backlogs nach BMAD v6 (Analyse, Migration, Stories vervollständigen, Resynchronisation)
- `/bear-project:report` — Analyseberichte zum Projekt: Sprint-Burndown, Metrik-Dashboard, Abhängigkeitsgraph der Stories und kritischer Pfad
- `/bear-project:reverse` — Brownfield-Reverse-Engineering-Pipeline: Codebasis scannen, dann einen PRD-Entwurf, User Stories und eine Lückenanalyse Spezifikation vs. Code ableiten
- `/bear-project:trace` — Bidirektionale Traceability-Matrix (Anforderung → Story → Code → Tests); --gaps listet nicht abgedeckte Anforderungen, --by-priority gruppiert nach MoSCoW-Priorität

## Agents

`product-owner`, `tech-lead`

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
