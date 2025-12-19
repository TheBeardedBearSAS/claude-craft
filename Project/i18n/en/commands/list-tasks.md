---
description: List Tasks
argument-hint: [arguments]
---

# List Tasks

Display list of tasks with filtering by User Story, Sprint, Type or Status.

## Arguments

$ARGUMENTS (optional, format: [filter] [value])
- **us US-XXX**: Filter by User Story
- **sprint N**: Filter by sprint
- **type TYPE**: Filter by type (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- **status STATUS**: Filter by status (todo, in-progress, blocked, done)

## Process

### Step 1: Read Tasks

1. Scan task directories:
   - `project-management/sprints/sprint-XXX/tasks/`
   - `project-management/backlog/tasks/` (if exists)
2. Read each file TASK-XXX.md
3. Extract metadata

### Step 2: Filter

Apply filters according to $ARGUMENTS.

### Step 3: Calculate

- Total estimated hours
- Completed hours
- Breakdown by type
- Breakdown by status

### Step 4: Display

Generate formatted table.

## Output Format - By User Story

```
🔧 Tasks - US-001: User login

| ID | Type | Description | Status | Est. | Spent |
|----|------|-------------|--------|------|-------|
| TASK-001 | [DB] | User entity | 🟢 Done | 2h | 2h |
| TASK-002 | [BE] | User repository | 🟢 Done | 3h | 3.5h |
| TASK-003 | [BE] | Login API endpoint | 🟡 In Progress | 4h | 2h |
| TASK-004 | [FE-WEB] | Auth controller | 🔴 To Do | 3h | - |
| TASK-005 | [FE-MOB] | Login screen | ⏸️ Blocked | 6h | - |
| TASK-006 | [TEST] | AuthService tests | 🔴 To Do | 3h | - |

───────────────────────────────────────────────────
US-001: 6 tasks | 21h estimated | 7.5h completed (36%)
🔴 2 | 🟡 1 | ⏸️ 1 | 🟢 2
```

## Output Format - By Sprint

```
🔧 Tasks - Sprint 1

By status:
🔴 To Do (8 tasks, 24h)
🟡 In Progress (3 tasks, 10h)
⏸️ Blocked (2 tasks, 8h)
🟢 Done (12 tasks, 35h)

By type:
[DB]     ████████░░ 5 tasks
[BE]     ██████████ 8 tasks
[FE-WEB] ██████░░░░ 4 tasks
[FE-MOB] ████░░░░░░ 3 tasks
[TEST]   ██████░░░░ 4 tasks
[DOC]    ██░░░░░░░░ 1 task

───────────────────────────────────────────────────
Sprint 1: 25 tasks | 77h estimated | 35h completed (45%)
```

## Output Format - Blocked

```
⏸️ Blocked Tasks

| ID | US | Type | Description | Blocker |
|----|-----|------|-------------|----------|
| TASK-005 | US-001 | [FE-MOB] | Login screen | Waiting for auth API |
| TASK-012 | US-003 | [BE] | Email service | Missing SMTP config |

───────────────────────────────────────────────────
2 blocked tasks | 14h waiting

Actions:
  Resolve TASK-005: Complete TASK-003 first
  Resolve TASK-012: Configure SMTP in .env
```

## Examples

```
# List all tasks
/project:list-tasks

# List tasks of a US
/project:list-tasks us US-001

# List tasks of sprint 1
/project:list-tasks sprint 1

# List backend tasks
/project:list-tasks type BE

# List in-progress tasks
/project:list-tasks status in-progress

# List blocked tasks
/project:list-tasks status blocked
```

## Status Color Codes

| Icon | Status | Meaning |
|-------|--------|---------------|
| 🔴 | To Do | Not started |
| 🟡 | In Progress | In progress |
| ⏸️ | Blocked | Blocked |
| 🟢 | Done | Completed |
