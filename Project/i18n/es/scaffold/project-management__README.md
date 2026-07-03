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
│   └── sprint-XXX/
│       ├── sprint-goal.md    # Sprint goal and info
│       ├── board.md          # Kanban board
│       └── tasks/            # Sprint tasks
└── metrics/
    ├── velocity.md           # Velocity per sprint
    └── burndown.md           # Burndown charts
```

## Workflow

1. `/project:add-epic` - Create an EPIC
2. `/project:add-story` - Add User Stories
3. `/sprint:transition US-XXX sprint-N` - Plan the sprint
4. `/project:add-task` or `/project:decompose-tasks` - Create tasks
5. `/project:board` - Track progress
6. `/project:move-task` - Update statuses

## Statuses

| Icon | Status | Description |
|------|--------|-------------|
| 🔴 | To Do | Not started yet |
| 🟡 | In Progress | In progress |
| ⏸️ | Blocked | Blocked |
| 🟢 | Done | Completed |
