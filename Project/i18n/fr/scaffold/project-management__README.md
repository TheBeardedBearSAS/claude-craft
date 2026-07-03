# Gestion de Projet

Ce répertoire contient la gestion de projet.

## Structure

```
project-management/
├── backlog/
│   ├── index.md              # Index avec tous les statuts
│   ├── epics/                # EPICs du projet
│   ├── user-stories/         # User Stories
│   └── tasks/                # Tasks non assignées à un sprint
├── sprints/
│   └── sprint-XXX/
│       ├── sprint-goal.md    # Objectif et infos du sprint
│       ├── board.md          # Kanban board
│       └── tasks/            # Tasks du sprint
└── metrics/
    ├── velocity.md           # Vélocité par sprint
    └── burndown.md           # Burndown charts
```

## Workflow

1. `/project:add-epic` - Créer un EPIC
2. `/project:add-story` - Ajouter des User Stories
3. `/sprint:transition US-XXX sprint-N` - Planifier le sprint
4. `/project:add-task` ou `/project:decompose-tasks` - Créer les tâches
5. `/project:board` - Suivre l'avancement
6. `/project:move-task` - Mettre à jour les statuts

## Statuts

| Icône | Statut | Description |
|-------|--------|-------------|
| 🔴 | To Do | Pas encore commencé |
| 🟡 | In Progress | En cours |
| ⏸️ | Blocked | Bloqué |
| 🟢 | Done | Terminé |
