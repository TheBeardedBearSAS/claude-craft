---
description: Execute all ready stories in the current sprint
argument-hint: [--auto] [--dry-run]
---

# Run Sprint

Queue and execute all stories in the current sprint that are ready for development.

## Arguments

$ARGUMENTS (format: [--auto] [--dry-run])
- **--auto** (optional): Start processing immediately
- **--dry-run** (optional): Preview execution plan without changes

## Plan Mode

> **Plan mode is recommended.** Claude activates plan mode to structure the approach, identify dependencies, and present a generation strategy before creating artifacts.

## Process

### Step 1: Validate sprint

1. Run `/gate:validate-sprint` to ensure sprint is ready
2. If gate fails, show issues and exit
3. Get sprint metadata

### Step 2: Collect ready stories

1. Get all stories with status `ready-for-dev`
2. Sort by priority (if defined) or ID
3. Calculate total story points

### Step 3: Build execution plan

Create ordered queue:
1. Analyze dependencies between stories
2. Build dependency graph
3. Determine execution order
4. Identify parallelizable groups

### Step 4: Queue stories

Add all stories to `.bmad/batch-queue.yaml` with:
- Priority based on dependencies and order
- Dependencies mapped
- Status set to `pending`

### Step 5: Execute (if --auto)

Start queue processing:
- Sequential by default
- Use `--parallel N` for parallel execution
- Checkpoint after each story

## Output Format

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Sprint: sprint-3 (DRY RUN)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - User Management
Period: 2026-01-29 → 2026-02-12

Sprint Gate: ✅ PASSED

Ready Stories: 5
Total Points: 21

Execution Plan:
──────────────────────────────────────────────────────

Phase 1 (no dependencies):
  📖 US-010: User registration (5 pts)

Phase 2 (after US-010):
  📖 US-011: User login (5 pts)
  📖 US-012: Profile page (5 pts)
  📖 US-014: Email verification (3 pts)

Phase 3 (after US-010, US-011):
  📖 US-013: Password reset (3 pts)

Parallel Opportunities:
──────────────────────────────────────────────────────
• Phase 2: US-011, US-012, US-014 can run in parallel
• Maximum parallelism: 3 stories

Estimated Duration:
──────────────────────────────────────────────────────
Sequential: ~3.5 hours (avg 42 min/story)
Parallel (3): ~2 hours

⚠️ DRY RUN - No changes made

To execute:
  /project:run-sprint
  /project:run-sprint --auto
  /project:run-sprint --auto --parallel 3
═══════════════════════════════════════════════════════
```

### Queuing

```
═══════════════════════════════════════════════════════
              Run Sprint: sprint-3
═══════════════════════════════════════════════════════

Sprint: sprint-3 - User Management
Period: 2026-01-29 → 2026-02-12

Validating sprint...
  ✅ Sprint metadata complete
  ✅ Sprint goal defined
  ✅ 5 stories ready
  ✅ All stories estimated

Queuing stories...
──────────────────────────────────────────────────────
✅ US-010: User registration (priority 1)
✅ US-011: User login (priority 2)
✅ US-012: Profile page (priority 3)
✅ US-013: Password reset (priority 4)
✅ US-014: Email verification (priority 5)

Queue Summary:
──────────────────────────────────────────────────────
Stories queued: 5
Total points: 21
Dependencies mapped: 4

Batch queue updated: .bmad/batch-queue.yaml

To start processing:
  /project:run-queue

Or for automatic execution:
  /project:run-sprint --auto
═══════════════════════════════════════════════════════
```

### Auto Execution

```
═══════════════════════════════════════════════════════
              Run Sprint: sprint-3 (AUTO)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - User Management

Validating... ✅
Queuing... ✅
Starting execution...

──────────────────────────────────────────────────────

[1/5] US-010: User registration
      ⏳ Transitioning to in-progress
      🔴 TDD Red: Writing failing tests
      🟢 TDD Green: Implementing code
      🔵 TDD Refactor: Cleaning up
      ✅ Tests passing
      👀 Ready for review
      ✅ Completed

      Progress: ████░░░░░░░░░░░░░░░░ 20%

[2/5] US-011: User login
      ⏳ Transitioning to in-progress
      🔴 TDD Red: Writing failing tests
      ...

Sprint Progress:
──────────────────────────────────────────────────────
█████████░░░░░░░░░░░ 45%

Completed: 2/5 stories (9/21 pts)
Current: US-012 - Profile page
Time elapsed: 1h 23m
Estimated remaining: 1h 45m
═══════════════════════════════════════════════════════
```

### Completion

```
═══════════════════════════════════════════════════════
              Sprint Complete!
═══════════════════════════════════════════════════════

Sprint: sprint-3 - User Management

Results:
──────────────────────────────────────────────────────
✅ Completed: 5/5 stories
📊 Points: 21/21 delivered
⏱️ Duration: 3h 18min

Story Summary:
| Story | Points | Duration | Status |
|-------|--------|----------|--------|
| US-010 | 5 | 45m | ✅ done |
| US-011 | 5 | 38m | ✅ done |
| US-012 | 5 | 52m | ✅ done |
| US-013 | 3 | 28m | ✅ done |
| US-014 | 3 | 35m | ✅ done |

Quality Gates:
──────────────────────────────────────────────────────
✅ All stories passed DoD
✅ All tests passing
✅ Code reviewed

Sprint Status:
──────────────────────────────────────────────────────
📋 Backlog: 3 (next sprint)
✅ Done: 5

🎉 Sprint goal achieved!

Next Steps:
  /sprint:retrospective    Run retrospective
  /sprint:plan            Plan next sprint
═══════════════════════════════════════════════════════
```

## Example

```
/project:run-sprint --dry-run
/project:run-sprint
/project:run-sprint --auto
/project:run-sprint --auto --parallel 3
```

## Configuration

Sprint execution settings in `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
```

## Interruption and Resume

If interrupted (Ctrl+C or error):
```
/project:run-queue --resume
```

Checkpoint is saved after each story completion.

## Integration

Works with:
- `/sprint:status --bmad` - View progress
- `/gate:report` - Quality metrics
- Ralph (if configured) - External orchestration
