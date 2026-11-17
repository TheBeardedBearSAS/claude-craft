# Project Management

This directory contains the project management.

## Structure

```
project-management/
├── backlog/
│   ├── index.md              # Index with all statuses
│   ├── epics/                # Project EPICs
│   ├── user-stories/         # User Stories
│   └── tasks/                # Tasks not assigned to a sprint
├── sprints/
│   └── sprint-{N}-{slug}/
│       ├── sprint-goal.md    # Sprint goal and info
│       ├── board.md          # Kanban board
│       └── tasks/            # Sprint tasks
└── metrics/
    ├── velocity.md           # Velocity per sprint
    └── burndown.md           # Burndown charts
```

## Workflow

1. `/bear-project:backlog add epic` - Create an EPIC
2. `/bear-project:backlog add story` - Add User Stories
3. `/bear-project:backlog move story US-XXX sprint-N` - Plan the sprint
4. `/bear-project:backlog add task` or `/bear-workflow:start` - Create tasks
5. `/bear-workflow:status --board` - Track progress
6. `/bear-project:backlog move task` - Update statuses

## Statuses

| Icon | Status | Description |
|------|--------|-------------|
| 🔴 | To Do | Not started yet |
| 🟡 | In Progress | In progress |
| ⏸️ | Blocked | Blocked |
| 🟢 | Done | Completed |
