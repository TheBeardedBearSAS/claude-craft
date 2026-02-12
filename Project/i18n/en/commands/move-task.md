---
description: Move a Task
argument-hint: [arguments]
---

# Move a Task

Change a task's status following the strict workflow.

## Arguments

$ARGUMENTS (format: TASK-XXX destination)
- **TASK-ID** (required): Task ID (e.g., TASK-001)
- **Destination** (required):
  - `in-progress`: Start task
  - `blocked`: Mark as blocked
  - `done`: Mark as completed

## Strict Workflow

```
🔴 To Do ──→ 🟡 In Progress ──→ 🟢 Done
     │              │
     │              ↓
     └────→ ⏸️ Blocked ←────┘
                │
                ↓
           🟡 In Progress
```

### Allowed Transitions

| From | To | Allowed |
|--------|------|----------|
| 🔴 To Do | 🟡 In Progress | ✅ |
| 🔴 To Do | ⏸️ Blocked | ✅ |
| 🔴 To Do | 🟢 Done | ❌ **Forbidden** |
| 🟡 In Progress | 🟢 Done | ✅ |
| 🟡 In Progress | ⏸️ Blocked | ✅ |
| 🟡 In Progress | 🔴 To Do | ✅ (rollback) |
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | 🟡 In Progress | ⚠️ (reopening) |

## Process

### Step 1: Validate Task

1. Find task file
2. Read current status
3. Identify associated US and sprint

### Step 2: Validate transition

1. Check that transition is allowed
2. If To Do → Done, block and suggest In Progress

### Step 3: If transition to Blocked

Ask for blocker:
```
What is the blocker for TASK-XXX?
> [Blocker description]
```

### Step 4: If transition to Done

Ask for time spent:
```
Time spent on TASK-XXX? (estimation: 4h)
> [Actual time, e.g., 3.5h]
```

### Step 5: Update Task

1. Modify status in metadata
2. Add blocker if Blocked
3. Update time spent if Done
4. Update modification date

### Step 6: Update Board

1. Read sprint board
2. Move task to new column
3. Update metrics

### Step 7: Update User Story

1. Update task list
2. Recalculate progress
3. If all tasks Done, suggest completing US

### Step 8: Update Index

1. Update global counters

## Output Format

### Successful transition

```
✅ Task moved!

🔧 TASK-003: Login API endpoint
   Before: 🔴 To Do
   After: 🟡 In Progress

📖 US-001: User login
   Progress: 2/6 → 3/6 (50%)

Next steps:
  /project:move-task TASK-003 done       # When completed
  /project:move-task TASK-003 blocked    # If blocked
```

### Task completed

```
✅ Task completed!

🔧 TASK-003: Login API endpoint
   Status: 🟡 In Progress → 🟢 Done
   Estimation: 4h
   Actual time: 3.5h ✓

📖 US-001: User login
   Progress: 4/6 (67%) ████████░░░░

Sprint 1:
   Tasks done: 12/25 (48%)
   Hours: 35h/77h completed
```

### All tasks Done

```
✅ Task completed!

🔧 TASK-006: AuthService tests
   Status: 🟢 Done

🎉 All tasks of US-001 completed!

📖 US-001: User login
   Progress: 6/6 (100%) ██████████

Recommended next step:
  /sprint:transition US-001 done
```

### Workflow error

```
❌ Transition not allowed!

🔧 TASK-004: Auth controller
   Current status: 🔴 To Do
   Requested transition: → 🟢 Done

Rule: A task must go through "In Progress" before "Done"

Correct action:
  /project:move-task TASK-004 in-progress
  # ... work on task ...
  /project:move-task TASK-004 done
```

### Blocked task

```
✅ Task marked as blocked

🔧 TASK-005: Login screen
   Status: 🟡 In Progress → ⏸️ Blocked
   Blocker: Waiting for auth API (TASK-003)

To unblock:
  1. Complete TASK-003
  2. /project:move-task TASK-005 in-progress
```

## Examples

```
# Start a task
/project:move-task TASK-001 in-progress

# Complete a task
/project:move-task TASK-001 done

# Block a task
/project:move-task TASK-001 blocked

# Unblock a task
/project:move-task TASK-001 in-progress
```

## Updated Metrics

At each move:
- Task count by status
- Estimated vs actual hours
- US progress
- Sprint progress
- Kanban board
