---
description: List User Stories
argument-hint: [arguments]
---

# List User Stories

Display list of User Stories with filtering by EPIC, Sprint or Status.

## Arguments

$ARGUMENTS (optional, format: [filter] [value])
- **epic EPIC-XXX**: Filter by EPIC
- **sprint N**: Filter by sprint
- **status STATUS**: Filter by status (todo, in-progress, blocked, done)
- **backlog**: Display only USs not assigned to a sprint

## Process

### Step 1: Read User Stories

1. Scan directory `project-management/backlog/user-stories/`
2. Read each file US-XXX-*.md
3. Extract metadata from each US

### Step 2: Filter

Apply filters according to $ARGUMENTS:
- By parent EPIC
- By assigned sprint
- By status
- Unassigned (backlog)

### Step 3: Calculate statistics

For each US:
- Count total tasks
- Count tasks by status
- Calculate progress percentage

### Step 4: Display

Generate formatted table grouped by EPIC or Sprint depending on context.

## Output Format - By EPIC

```
📖 User Stories - EPIC-001: Authentication

| ID | Name | Sprint | Status | Points | Tasks | Progress |
|----|-----|--------|--------|--------|-------|-------------|
| US-001 | User login | Sprint 1 | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Registration | Sprint 1 | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Forgot password | Backlog | 🔴 To Do | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 points | 🔴 2 | 🟡 1 | 🟢 0
```

## Output Format - By Sprint

```
📖 User Stories - Sprint 1

| ID | EPIC | Name | Status | Points | Tasks | Progress |
|----|------|-----|--------|--------|-------|-------------|
| US-001 | EPIC-001 | User login | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | EPIC-001 | Registration | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-005 | EPIC-002 | Product list | 🟢 Done | 5 | 6/6 | ██████████ 100% |

───────────────────────────────────────────────────
Sprint 1: 3 US | 13 points | Done: 5 pts (38%)
```

## Output Format - Backlog

```
📖 Backlog (Unassigned USs)

| ID | EPIC | Name | Priority | Points | Status |
|----|------|-----|----------|--------|--------|
| US-003 | EPIC-001 | Forgot password | High | 3 | 🔴 To Do |
| US-006 | EPIC-002 | Product detail | Medium | 5 | 🔴 To Do |
| US-007 | EPIC-002 | Search | Low | 8 | 🔴 To Do |

───────────────────────────────────────────────────
Backlog: 3 US | 16 points to plan
```

## Examples

```
# List all USs
/project:list-stories

# List USs of an EPIC
/project:list-stories epic EPIC-001

# List USs of current sprint
/project:list-stories sprint 1

# List in-progress USs
/project:list-stories status in-progress

# List blocked USs
/project:list-stories status blocked

# List backlog (unassigned)
/project:list-stories backlog
```

## Suggested Actions

Depending on context, suggest:
```
Actions:
  /sprint:transition US-XXX sprint-2     # Assign to sprint
  /sprint:transition US-XXX in-progress  # Change status
  /project:add-task US-XXX "[BE] ..." 4h  # Add task
```
