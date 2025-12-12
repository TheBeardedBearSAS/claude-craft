---
name: sprint-dev
description: Start TDD/BDD development of a sprint with automatic status updates
arguments:
  - name: sprint
    description: Sprint number, "next" for next incomplete sprint, or "current"
    required: true
---

# /project:sprint-dev

## Purpose

Orchestrate complete sprint development in TDD/BDD mode with:
- **Mandatory plan mode** before each task implementation
- **TDD cycle** (RED → GREEN → REFACTOR)
- **Automatic status updates** (Task → User Story → Sprint)
- **Progress tracking** and metrics

## Prerequisites

- Sprint exists with decomposed tasks
- Files present: `sprint-backlog.md`, `tasks/*.md`
- Run `/project:decompose-tasks N` first if needed

## Arguments

```bash
/project:sprint-dev 1        # Sprint 1
/project:sprint-dev next     # Next incomplete sprint
/project:sprint-dev current  # Currently active sprint
```

---

## Workflow

### Phase 1: Initialization

1. Load sprint from `project-management/sprints/sprint-N-*/`
2. Read `sprint-backlog.md` to get User Stories
3. List tasks per US (sorted by dependencies)
4. Display initial board

```
📋 Sprint 1: Walking Skeleton
   Goal: Complete authentication flow end-to-end

   3 User Stories, 17 Tasks

   🔴 To Do: 15 | 🟡 In Progress: 2 | 🟢 Done: 0
```

### Phase 2: User Story Loop

For each User Story in To Do or In Progress status:

1. **Mark US → In Progress** (if To Do)
2. **Display acceptance criteria** (Gherkin format)
3. **Process each task** of this US

```
🎯 US-001: User Authentication (5 pts)
   Status: 🟡 In Progress

   Acceptance Criteria:
   ┌─────────────────────────────────────────────────────┐
   │ GIVEN a registered user with valid credentials     │
   │ WHEN they submit the login form                    │
   │ THEN they should see their dashboard               │
   │ AND a session should be created                    │
   └─────────────────────────────────────────────────────┘

   Tasks:
   └─ TASK-001 [DB] Create User entity .............. 🔴 To Do
   └─ TASK-002 [BE] Authentication service .......... 🔴 To Do
   └─ TASK-003 [FE-WEB] Login form .................. 🔴 To Do
   └─ TASK-004 [TEST] E2E authentication tests ...... 🔴 To Do
```

### Phase 3: Task Loop (TDD Workflow)

For each task in To Do:

#### 3.1 Display Task Details

```
▶️ Starting TASK-001 [DB] Create User entity

   Estimation: 2h
   Description: Create User entity with email, password_hash, roles
   Files to modify: src/Entity/User.php, migrations/

   Definition of Done:
   - [ ] Code written and functional
   - [ ] Tests pass
   - [ ] Code reviewed (if [REV] task exists)
```

#### 3.2 Plan Mode (MANDATORY)

⚠️ **ALWAYS activate plan mode before implementing**

```
⚠️ PLAN MODE ACTIVATED

   Analyzing task TASK-001...

   📁 Files to analyze:
   - src/Entity/ (existing entities pattern)
   - config/packages/doctrine.yaml
   - migrations/ (latest migration)

   🔍 Analysis in progress...
```

The plan mode MUST:
1. **Explore** impacted code and dependencies
2. **Document** analysis findings
3. **Propose** implementation plan with:
   - Files to create/modify
   - Tests to write (TDD)
   - Risks and mitigations
4. **Wait** for user validation before proceeding

```
📋 Implementation Plan for TASK-001

   1. Create User entity with properties:
      - id (UUID)
      - email (unique)
      - password_hash
      - roles (JSON array)
      - created_at, updated_at

   2. Tests to write FIRST (TDD):
      - UserTest::test_user_creation()
      - UserTest::test_email_validation()
      - UserTest::test_password_hashing()

   3. Files to create:
      - src/Entity/User.php
      - tests/Unit/Entity/UserTest.php
      - migrations/VersionXXX.php

   ⏳ Waiting for validation...

   [continue] Proceed with implementation
   [skip] Skip this task
   [block] Mark as blocked
   [stop] Stop sprint-dev
```

#### 3.3 Mark Task → In Progress

After plan validation:
- Update task status to In Progress
- Update board.md
- Update index.md

#### 3.4 TDD Cycle

```
🧪 TDD CYCLE - TASK-001

🔴 RED Phase: Write failing tests
   Creating tests/Unit/Entity/UserTest.php...

   Running tests... FAILED (expected)
   ✗ test_user_creation
   ✗ test_email_validation
   ✗ test_password_hashing

🟢 GREEN Phase: Implement minimum code
   Creating src/Entity/User.php...

   Running tests... PASSED
   ✓ test_user_creation
   ✓ test_email_validation
   ✓ test_password_hashing

🔧 REFACTOR Phase: Improve code quality
   - Extract email validation to ValueObject? [y/n]
   - Add factory method? [y/n]

   Running tests... PASSED (no regression)
```

#### 3.5 Definition of Done Check

```
✅ Definition of Done - TASK-001

- [x] Code written and functional
- [x] Tests pass (3/3)
- [ ] Code reviewed → Handled by TASK-XXX [REV]

All checks passed!
```

#### 3.6 Mark Task → Done

```
📊 Task Completion

TASK-001 [DB] Create User entity
├─ Status: 🟢 Done
├─ Estimated: 2h
├─ Actual: 1.5h
└─ Efficiency: 133%

Enter actual time spent (hours): 1.5
```

Updates:
- Task file metadata (status, time_spent, updated_at)
- board.md
- index.md
- Sprint metrics

#### 3.7 Conventional Commit

```
📝 Creating commit...

feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add UUID primary key strategy
- Add timestamps (created_at, updated_at)
- Add unit tests for User entity

Refs: TASK-001, US-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Phase 4: User Story Validation

When all tasks of a US are Done:

```
🎯 US-001 Validation

All tasks completed (4/4)

Checking acceptance criteria:
┌─────────────────────────────────────────────────────┐
│ ✓ GIVEN a registered user with valid credentials   │
│ ✓ WHEN they submit the login form                  │
│ ✓ THEN they should see their dashboard             │
│ ✓ AND a session should be created                  │
└─────────────────────────────────────────────────────┘

Running E2E tests if present...
✓ tests/E2E/AuthenticationTest.php passed

US-001 → 🟢 Done

Updating EPIC-001 progress: 1/3 US completed (33%)
```

### Phase 5: Sprint Completion

When all User Stories are Done:

```
🏁 Sprint 1 Complete!

📊 Summary
├─ Duration: 8 days (planned: 10)
├─ Velocity: 15 points
├─ Tasks: 17/17 completed
└─ Hours: 38h actual vs 42h estimated (110% efficiency)

📈 Metrics by Type
├─ [DB]: 4 tasks, 6h
├─ [BE]: 5 tasks, 12h
├─ [FE-WEB]: 4 tasks, 10h
├─ [TEST]: 3 tasks, 8h
└─ [DOC]: 1 task, 2h

📝 Generating sprint-review.md...
📝 Generating sprint-retro.md template...

Next: Run /project:sprint-dev 2 or /project:sprint-dev next
```

---

## Task Processing Order

Tasks are processed by type to respect dependencies:

| Order | Type | Description |
|-------|------|-------------|
| 1 | `[DB]` | Database (entities, migrations, repositories) |
| 2 | `[BE]` | Backend (services, APIs, business logic) |
| 3 | `[FE-WEB]` | Frontend Web (controllers, templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (screens, blocs, widgets) |
| 5 | `[TEST]` | Additional tests (E2E, performance) |
| 6 | `[DOC]` | Documentation |
| 7 | `[REV]` | Code Review |

---

## Control Commands

During sprint-dev execution:

| Command | Action |
|---------|--------|
| `continue` | Validate plan and proceed with implementation |
| `skip` | Skip this task (remains To Do) |
| `block [reason]` | Mark task as Blocked with reason |
| `stop` | Stop sprint-dev (saves current state) |
| `status` | Display current progress |
| `board` | Show Kanban board |

---

## Blocking Handling

```
⚠️ Task Blocked

TASK-003 cannot proceed.
Reason: Waiting for API specification from backend team

Options:
[1] Skip and continue with next unblocked task
[2] Try to resolve the blocker
[3] Stop sprint-dev

Choice: 1

Marking TASK-003 as Blocked...
Moving to TASK-004...
```

---

## Automatic Updates

At each status change:

1. **Task file**: Update status, time_spent, updated_at
2. **User Story file**: Update task progress, status if all done
3. **EPIC file**: Update US progress
4. **board.md**: Refresh Kanban columns
5. **index.md**: Update global metrics
6. **sprint-status**: Recalculate metrics

---

## Resume After Stop

```bash
/project:sprint-dev current

📋 Resuming Sprint 1: Walking Skeleton

Progress: 8/17 tasks (47%)

Last completed: TASK-008 [BE] JWT Token Service
Next task: TASK-009 [FE-WEB] Login Controller

Continue from TASK-009? [y/n]
```

---

## Example Session

```bash
> /project:sprint-dev 1

📋 Sprint 1: Walking Skeleton
   3 US, 17 tasks
   🔴 To Do: 17 | 🟡 In Progress: 0 | 🟢 Done: 0

🎯 Starting US-001: User Authentication (5 pts)
   Marking as In Progress...

▶️ TASK-001 [DB] Create User entity

⚠️ PLAN MODE ACTIVATED
   Analyzing...

   [Plan details displayed]

> continue

   Marking TASK-001 as In Progress...

🧪 TDD CYCLE

🔴 RED: Writing tests...
   [Test code created]
   Tests: 0/3 passing (expected)

🟢 GREEN: Implementing...
   [Implementation code]
   Tests: 3/3 passing

🔧 REFACTOR: Any improvements? [skip]

✅ Definition of Done: PASSED

   Enter actual time (estimated 2h): 1.5

📝 Commit created: feat(entity): create User entity

▶️ TASK-002 [BE] Authentication service

⚠️ PLAN MODE ACTIVATED
   ...
```

---

## Files Updated

| File | Updates |
|------|---------|
| `project-management/backlog/user-stories/US-XXX.md` | Status, task progress |
| `project-management/backlog/epics/EPIC-XXX.md` | US progress |
| `project-management/sprints/sprint-N-*/board.md` | Kanban columns |
| `project-management/sprints/sprint-N-*/tasks/*.md` | Task status, time |
| `project-management/backlog/index.md` | Global metrics |
| `project-management/sprints/sprint-N-*/sprint-review.md` | Generated at end |

---

## Related Commands

| Command | Use |
|---------|-----|
| `/project:decompose-tasks N` | Create tasks before sprint-dev |
| `/project:board N` | View Kanban board |
| `/project:sprint-status N` | View sprint metrics |
| `/project:move-task` | Manually change task status |
| `/project:move-story` | Manually change US status |
