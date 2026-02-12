---
description: Display Kanban Board
argument-hint: [arguments]
---

# Display Kanban Board

Display the Kanban board of current sprint or a specific sprint.

## Arguments

$ARGUMENTS (optional, format: [sprint N])
- **sprint N** (optional): Sprint number to display
- If not specified, displays current sprint

## Process

### Step 1: Identify sprint

1. If sprint specified, use that number
2. Otherwise, find current sprint (with non-Done tasks)

### Step 2: Read data

1. Read file `project-management/sprints/sprint-XXX/board.md`
2. Or regenerate from task files

### Step 3: Group by status

Organize tasks by column:
- 🔴 To Do
- 🟡 In Progress
- ⏸️ Blocked
- 🟢 Done

### Step 4: Calculate metrics

- Number of tasks per column
- Estimated and completed hours
- Progress percentage

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Kanban Board                                      ║
║  Goal: Walking Skeleton - Auth + First page                      ║
║  Period: 2024-01-15 → 2024-01-29                                ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 TO DO (4)    │ 🟡 IN PROGRESS  │ ⏸️ BLOCKED (1)  │ 🟢 DONE (8)     │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ E2E Tests       │ Auth Service    │ Login Screen    │ User Entity ✓   │
│ 4h @US-001      │ 4h @US-001      │ 6h @US-001      │ 2h @US-001      │
│                 │                 │ ⚠️ Waiting API  │                 │
│ TASK-010 [DOC]  │ TASK-006 [WEB]  │                 │ TASK-002 [DB]   │
│ Documentation   │ Auth Controller │                 │ Migration ✓     │
│ 2h @US-001      │ 3h @US-001      │                 │ 1h @US-001      │
│                 │                 │                 │                 │
│ TASK-015 [BE]   │ TASK-012 [MOB]  │                 │ TASK-003 [BE]   │
│ Products API    │ Products Bloc   │                 │ Repository ✓    │
│ 4h @US-002      │ 5h @US-002      │                 │ 3h @US-001      │
│                 │                 │                 │                 │
│ TASK-016 [TEST] │                 │                 │ TASK-004 [BE]   │
│ Products Tests  │                 │                 │ Login API ✓     │
│ 3h @US-002      │                 │                 │ 4h @US-001      │
│                 │                 │                 │                 │
│                 │                 │                 │ ... +4 more     │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

══════════════════════════════════════════════════════════════════════════
📊 METRICS

Tasks:     ████████████████████░░░░░░░░░░ 8/16 (50%)
Hours:     ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Blocked:   1 task (6h)

By type:
[DB]  ██████████ 3/3 done
[BE]  ████████░░ 4/5 (1 in progress)
[WEB] ████░░░░░░ 1/3 (1 in progress)
[MOB] ██░░░░░░░░ 0/3 (1 blocked, 1 in progress)
[TEST]░░░░░░░░░░ 0/2

══════════════════════════════════════════════════════════════════════════
📖 USER STORIES

│ US      │ Points │ Status          │ Tasks     │ Progress    │
├─────────┼────────┼─────────────────┼───────────┼─────────────┤
│ US-001  │ 5      │ 🟡 In Progress  │ 6/10      │ ██████░░░░  │
│ US-002  │ 5      │ 🔴 To Do        │ 2/6       │ ███░░░░░░░  │

Sprint: 10 points | Done: 0 pts
══════════════════════════════════════════════════════════════════════════

Actions:
  /project:move-task TASK-XXX in-progress  # Start a task
  /project:move-task TASK-XXX done         # Complete a task
  /sprint:status                   # View more metrics
```

## Compact Format

If many tasks, display summary:

```
📋 Sprint 1 - Kanban (32 tasks)

🔴 To Do (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 In Progress (5): TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Blocked (2):     TASK-008 (API), TASK-021 (config)
🟢 Done (13):       TASK-001..TASK-004, TASK-007, TASK-009..TASK-014

Progress: 13/32 (41%) | 45h/98h
```

## Examples

```
# Display current sprint board
/project:board

# Display sprint 2 board
/project:board sprint 2
```

## Update board.md file

After display, the sprint's `board.md` file is updated with current data.
