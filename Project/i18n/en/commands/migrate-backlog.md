---
description: "Migrate existing backlog to BMAD v6 format"
argument-hint: "[--dry-run] [--force]"
---

# Migrate Backlog

Convert existing backlog to BMAD v6 format with sprint-status.yaml tracking.

## Arguments

$ARGUMENTS (format: [--dry-run] [--force])
- **--dry-run** (optional): Preview changes without applying
- **--force** (optional): Overwrite existing BMAD files

## Prerequisites

Run `/project:analyze-backlog` first to understand current structure.

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Process

### Step 1: Validate prerequisites

1. Check that `.bmad/` directory exists (create if needed)
2. Check for existing `sprint-status.yaml` (warn if exists and no --force)
3. Verify backlog analysis was run

### Step 2: Create BMAD structure

```
.bmad/
├── sprint-status.yaml    # Main tracking file
├── batch-queue.yaml      # Batch processing queue
├── gates/                # Quality gate configs
├── hooks/                # Claude Code hooks
└── lib/                  # Helper scripts
```

### Step 3: Parse existing backlog

For each User Story found:
1. Extract all metadata
2. Parse acceptance criteria (Gherkin format)
3. Identify related tasks
4. Determine current status
5. Calculate completion percentage

### Step 4: Generate sprint-status.yaml

Transform each story to BMAD v6 format:

```yaml
stories:
  US-001:
    title: "User login"
    status: "in-progress"           # Mapped from emoji status
    previous_status: "ready-for-dev"
    assigned_to: ""
    tdd_phase: "red"                # Default for in-progress
    current_task: "TASK-001"
    story_points: 5
    epic_id: "EPIC-001"
    tasks:
      total: 4
      completed: 2
      list:
        - id: "TASK-001"
          title: "Backend auth endpoint"
          status: "in-progress"
          type: "BE"
        - id: "TASK-002"
          title: "Frontend login form"
          status: "done"
          type: "FE"
    acceptance_criteria:
      total: 3
      validated: 1
    history:
      - timestamp: "2026-01-29T10:00:00Z"
        from: "backlog"
        to: "in-progress"
        by: "migration"
        reason: "BMAD v6 migration"
```

### Step 5: Status mapping

Map existing status indicators:
| Original | BMAD v6 Status |
|----------|----------------|
| 🔴 To Do | backlog |
| 🟡 In Progress | in-progress |
| 🟢 Done | done |
| ⏸️ Blocked | blocked |
| Sprint-X assigned | ready-for-dev |

### Step 6: Initialize TDD phase

Set initial TDD phase based on task completion:
- 0% tasks done → `red`
- 1-99% tasks done → `green`
- 100% tasks done → `refactor` or `done`

### Step 7: Create backup (unless --dry-run)

1. Copy existing backlog to `.bmad/backup/`
2. Timestamp the backup
3. Log backup location

### Step 8: Apply migration (unless --dry-run)

1. Write `sprint-status.yaml`
2. Update story files with BMAD metadata comments
3. Create `.bmad/migration-log.md`

## Output Format

```
🔄 BMAD v6 Migration
====================

## Pre-flight Check
✅ Backlog location: project-management/backlog/
✅ BMAD directory: .bmad/ (created)
✅ No existing sprint-status.yaml

## Migration Summary

### Stories Migrated: {COUNT}
| ID | Title | Status | TDD Phase |
|----|-------|--------|-----------|
| US-001 | Login | in-progress | green |
| US-002 | Signup | backlog | - |

### Tasks Migrated: {COUNT}
### Acceptance Criteria: {COUNT}

## Files Created
- .bmad/sprint-status.yaml
- .bmad/batch-queue.yaml
- .bmad/backup/backlog-2026-01-29.tar.gz
- .bmad/migration-log.md

## Next Steps
1. Review sprint-status.yaml
2. Run `/sprint:status` to verify
3. Configure sprint metadata (dates, goals)
4. Set up quality gates with `/gate:configure`
```

## Dry Run Output

```
🔄 BMAD v6 Migration (DRY RUN)
==============================

⚠️ No changes will be made

## Would Create:
- .bmad/sprint-status.yaml (42 KB)
- .bmad/batch-queue.yaml (2 KB)

## Would Migrate:
- 12 User Stories
- 45 Tasks
- 36 Acceptance Criteria

Run without --dry-run to apply changes.
```

## Example

```
/project:migrate-backlog --dry-run
/project:migrate-backlog
/project:migrate-backlog --force
```

## Rollback

If migration fails:
```bash
# Restore from backup
tar -xzf .bmad/backup/backlog-*.tar.gz -C project-management/
rm .bmad/sprint-status.yaml
```
