---
description: List EPICs
argument-hint: [arguments]
---

# List EPICs

Display the list of all EPICs with their status and progress.

## Arguments

$ARGUMENTS (optional, format: [status] [priority])
- **Status** (optional, derived from stories): todo, in-progress, blocked, done, all (default: all)
- **Priority** (optional): high, medium, low

## Process

### Step 1: Read EPICs

1. Scan directory `project-management/backlog/epics/`
2. Read each file EPIC-XXX-*.md
3. Extract content metadata from each EPIC (name, priority)
4. Read the statuses of its stories from `.bmad/sprint-status.yaml` (single source of truth, schema: `.claude/templates/project/sprint-status.md`)

### Step 2: Filter (if arguments)

Apply requested filters:
- By status
- By priority

### Step 3: Calculate statistics

**EPIC status is derived, never stored**: all stories `backlog` (or no story) = not started; all `done` = done; any `blocked` and none in progress = blocked; otherwise in progress.

For each EPIC:
- Count total USs
- Count USs by status
- Calculate progress percentage

### Step 4: Display

Generate formatted table with results.

## Output Format

```
📋 Project EPICs

| ID | Name | Status | Priority | US | Progress |
|----|-----|--------|----------|-----|-------------|
| EPIC-001 | Authentication | 🟡 In Progress | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catalog | 🔴 To Do | Medium | 8 | ░░░░░░░░░░ 0% |
| EPIC-003 | Cart | 🔴 To Do | High | 6 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Summary: 3 EPICs | 🔴 2 To Do | 🟡 1 In Progress | 🟢 0 Done
```

## Compact Format (if many EPICs)

```
📋 EPICs (12 total)

🔴 To Do (5):
   EPIC-002, EPIC-003, EPIC-004, EPIC-007, EPIC-010

🟡 In Progress (4):
   EPIC-001 (40%), EPIC-005 (60%), EPIC-008 (25%), EPIC-011 (80%)

⏸️ Blocked (1):
   EPIC-006 - Blocked by external dependency

🟢 Done (2):
   EPIC-009 ✓, EPIC-012 ✓
```

## Examples

```
# List all EPICs
/project:list-epics

# List in-progress EPICs
/project:list-epics in-progress

# List high priority EPICs
/project:list-epics all high

# List blocked EPICs
/project:list-epics blocked
```

## EPIC Details

To view details of a specific EPIC, suggest:
```
View details: cat project-management/backlog/epics/EPIC-001-*.md
```
