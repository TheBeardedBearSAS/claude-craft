---
description: Run all stories from an epic in batch
argument-hint: <epic-id> [--dry-run]
---

# Run Epic

Queue and process all stories from an epic in batch mode.

## Arguments

$ARGUMENTS (format: <epic-id> [--dry-run])
- **epic-id** (required): Epic identifier (e.g., EPIC-001)
- **--dry-run** (optional): Preview without executing

## Process

### Step 1: Identify epic stories

1. Read `.bmad/sprint-status.yaml`
2. Find all stories with `epic_id` matching argument
3. Sort by priority or ID

### Step 2: Check story readiness

For each story, verify:
- Story exists and has required fields
- Not already completed
- Not blocked (or flag for review)

### Step 3: Build execution queue

Create prioritized queue:
1. Stories with no dependencies first
2. Lower ID = higher priority
3. Respect explicit priority if set

### Step 4: Add to batch queue

Update `.bmad/batch-queue.yaml`:
```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-002"
    priority: 2
    dependencies: ["US-001"]
```

### Step 5: Execute (unless --dry-run)

For each story in order:
1. Transition to in-progress
2. Execute development workflow
3. Run quality gates
4. Transition through states
5. Checkpoint after each

## Output Format

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Epic: EPIC-002 (DRY RUN)
═══════════════════════════════════════════════════════

Epic: EPIC-002 - User Management
Stories: 5

Execution Plan:
──────────────────────────────────────────────────────
[1] US-010: User registration (5 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencies: none

[2] US-011: User login (5 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencies: US-010

[3] US-012: Profile page (5 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencies: US-010

[4] US-013: Password reset (3 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencies: US-010, US-011

[5] US-014: Email verification (3 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencies: US-010

Total Points: 21

Execution Order (respecting dependencies):
  1. US-010 (no deps)
  2. US-011, US-012, US-014 (parallel after US-010)
  3. US-013 (after US-010, US-011)

Estimated workflow per story:
  • Transition to in-progress
  • TDD cycles (red → green → refactor)
  • Code review
  • Quality gate validation
  • Transition to done

⚠️ DRY RUN - No changes made

Run without --dry-run to execute.
═══════════════════════════════════════════════════════
```

### Execution

```
═══════════════════════════════════════════════════════
              Run Epic: EPIC-002
═══════════════════════════════════════════════════════

Epic: EPIC-002 - User Management
Mode: Sequential
Stories: 5

Queuing stories...
──────────────────────────────────────────────────────
✅ Added US-010 (priority 1)
✅ Added US-011 (priority 2, depends on US-010)
✅ Added US-012 (priority 3, depends on US-010)
✅ Added US-013 (priority 4, depends on US-010, US-011)
✅ Added US-014 (priority 5, depends on US-010)

Queue Status:
──────────────────────────────────────────────────────
⏳ Pending: 5
🔄 Running: 0
✅ Completed: 0
❌ Failed: 0

Next Steps:
──────────────────────────────────────────────────────
Run the queue:
  /project:run-queue

Or process automatically:
  /project:run-queue --auto

Monitor progress:
  /project:batch-status
═══════════════════════════════════════════════════════
```

## Example

```
/project:run-epic EPIC-002 --dry-run
/project:run-epic EPIC-002
```

## Parallel Execution

For independent stories, enable parallel mode:
```
/project:run-queue --parallel 3
```

This processes up to 3 stories simultaneously when they have no dependencies.

## Resuming

If execution is interrupted:
```
/project:run-queue --resume
```

Continues from last checkpoint.

## Integration with Ralph

If Ralph is configured, batch execution integrates:
```yaml
# ralph.yml
bmad_integration:
  enabled: true
  batch_queue_file: ".bmad/batch-queue.yaml"
```
