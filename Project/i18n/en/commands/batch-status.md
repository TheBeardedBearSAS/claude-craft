---
description: Show batch processing queue status
argument-hint: [--history]
---

# Batch Status

Display the current status of the batch processing queue.

## Arguments

$ARGUMENTS (format: [--history])
- **--history** (optional): Show completed/failed stories history

## Process

### Step 1: Load queue

1. Read `.bmad/batch-queue.yaml`
2. Parse queue entries
3. Load checkpoint data

### Step 2: Categorize stories

Group by status:
- `pending` - Waiting to be processed
- `running` - Currently being processed
- `completed` - Successfully finished
- `failed` - Encountered error
- `skipped` - Skipped due to dependency failure

### Step 3: Show queue state

Display current queue status with details.

### Step 4: Show history (if requested)

Display completed and failed stories with timing.

## Output Format

### Active Queue

```
═══════════════════════════════════════════════════════
              Batch Queue Status
═══════════════════════════════════════════════════════

Mode: Sequential
Checkpoint: US-011 (2026-01-29 10:45:00)

Queue Summary:
──────────────────────────────────────────────────────
⏳ Pending:   3
🔄 Running:   1
✅ Completed: 2
❌ Failed:    0
⏭️ Skipped:   0

Total: 6 stories

Running:
──────────────────────────────────────────────────────
🔄 US-012: Profile page
   Priority: 3
   Started: 2026-01-29 10:45:00 (15 min ago)
   TDD Phase: green
   Task: 2/4

Pending:
──────────────────────────────────────────────────────
[4] US-013: Password reset
    Dependencies: US-010 ✅, US-011 ✅

[5] US-014: Email verification
    Dependencies: US-010 ✅

[6] US-015: Settings page
    Dependencies: none

Progress:
──────────────────────────────────────────────────────
██████████░░░░░░░░░░ 50% (3/6 stories)

Estimated completion: ~1h 30m
═══════════════════════════════════════════════════════
```

### With History

```
═══════════════════════════════════════════════════════
              Batch Queue Status
═══════════════════════════════════════════════════════

Mode: Sequential
Last checkpoint: US-014

Queue Summary:
──────────────────────────────────────────────────────
⏳ Pending:   0
🔄 Running:   0
✅ Completed: 5
❌ Failed:    1
⏭️ Skipped:   1

Completed History:
──────────────────────────────────────────────────────
| Story | Started | Completed | Duration |
|-------|---------|-----------|----------|
| US-010 | 10:00 | 10:42 | 42m |
| US-011 | 10:42 | 11:18 | 36m |
| US-012 | 11:18 | 12:05 | 47m |
| US-014 | 12:05 | 12:38 | 33m |
| US-015 | 12:38 | 13:10 | 32m |

Failed:
──────────────────────────────────────────────────────
❌ US-013: Password reset
   Started: 12:05
   Failed: 12:22
   Duration: 17m
   Error: Test assertion failed in PasswordResetTest
   TDD Phase: red

Skipped:
──────────────────────────────────────────────────────
⏭️ US-016: Admin panel
   Reason: Depends on failed US-013

Statistics:
──────────────────────────────────────────────────────
Total time: 3h 10m
Average per story: 38m
Success rate: 83% (5/6)
Points completed: 18/21

Actions:
──────────────────────────────────────────────────────
To retry failed stories:
  /project:queue-retry US-013

To clear queue:
  /project:queue-clear
═══════════════════════════════════════════════════════
```

### Empty Queue

```
═══════════════════════════════════════════════════════
              Batch Queue Status
═══════════════════════════════════════════════════════

Queue is empty.

No stories are currently queued for processing.

To add stories:
  /project:run-epic EPIC-001    Queue an epic
  /project:run-sprint           Queue sprint stories

Or add individual story:
  .bmad/lib/batch-executor.sh add US-001
═══════════════════════════════════════════════════════
```

## Example

```
/project:batch-status
/project:batch-status --history
```

## Queue Management

### Add story to queue
```bash
.bmad/lib/batch-executor.sh add US-001 1
```

### Retry failed story
```
/project:queue-retry US-013
```

### Clear queue
```
/project:queue-clear --force
```

### Resume from checkpoint
```
/project:run-queue --resume
```

## Configuration

Queue file: `.bmad/batch-queue.yaml`

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```
