---
description: Move a User Story
argument-hint: [arguments]
---

# Move a User Story

Change a User Story's status or assign it to a sprint.

## Arguments

$ARGUMENTS (format: US-XXX destination)
- **US-ID** (required): User Story ID (e.g., US-001)
- **Destination** (required):
  - `sprint-N`: Assign to sprint N
  - `backlog`: Remove from current sprint
  - `in-progress`: Start US
  - `blocked`: Mark as blocked
  - `done`: Mark as completed

## Strict Workflow

Status transitions follow a strict workflow:

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
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | * | ❌ (manual reopening) |

## Process

### Step 1: Validate User Story

1. Check that US exists
2. Read current status
3. Identify current sprint (if applicable)

### Step 2: Validate transition

**If status change:**
1. Check that transition is allowed
2. If not allowed, display error with possible transitions

**If sprint assignment:**
1. Check that sprint exists
2. Create sprint directory if necessary

### Step 3: If transition to Blocked

Ask for blocker:
```
What is the blocker for US-XXX?
> [Blocker description]
```

### Step 4: Update User Story

1. Modify status in metadata
2. Modify sprint if applicable
3. Add blocker if Blocked
4. Update modification date

### Step 5: Update related files

1. **Index** (`backlog/index.md`): Update counters
2. **Parent EPIC**: Update progress
3. **Sprint board** (if applicable): Move tasks

### Step 6: Cascade to Tasks

**If US moves to In Progress:**
- Tasks remain To Do (will be started individually)

**If US moves to Done:**
- Check that all tasks are Done
- If not, display warning

**If US moves to Blocked:**
- Mark all In Progress tasks as Blocked

## Output Format

### Status change

```
✅ User Story moved!

📖 US-001: User login
   Before: 🔴 To Do
   After: 🟡 In Progress

Next steps:
  /project:move-task TASK-001 in-progress  # Start a task
  /project:board                            # View Kanban
```

### Sprint assignment

```
✅ User Story assigned to Sprint 2!

📖 US-003: Forgot password
   Sprint: Backlog → Sprint 2
   Status: 🔴 To Do

Sprint 2 updated:
  - 8 US | 34 points

Next steps:
  /project:decompose-tasks 2  # Create tasks
  /project:board              # View Kanban
```

### Workflow error

```
❌ Transition not allowed!

📖 US-001: User login
   Current status: 🔴 To Do
   Requested transition: → 🟢 Done

Rule: A US must go through "In Progress" before "Done"

Possible transitions:
  /project:move-story US-001 in-progress
  /project:move-story US-001 blocked
```

## Examples

```
# Start a US
/project:move-story US-001 in-progress

# Complete a US
/project:move-story US-001 done

# Block a US
/project:move-story US-001 blocked

# Assign to sprint 2
/project:move-story US-003 sprint-2

# Remove from sprint
/project:move-story US-003 backlog
```

## Validation before Done

Before marking US as Done, check:
- [ ] All tasks are Done
- [ ] Tests pass
- [ ] Code reviewed
- [ ] Acceptance criteria validated

If not met:
```
⚠️ Warning: US-001 still has unfinished tasks!

Remaining tasks:
  🔴 TASK-004 [FE-WEB] Auth controller
  🔴 TASK-006 [TEST] AuthService tests

Confirm anyway? (not recommended)
```
