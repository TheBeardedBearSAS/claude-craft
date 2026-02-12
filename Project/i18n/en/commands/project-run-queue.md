---
description: Process the batch queue of stories
argument-hint: [--parallel N] [--auto] [--resume]
---

# Run Queue

Process stories in the batch queue sequentially or in parallel.

## Arguments

$ARGUMENTS (format: [--parallel N] [--auto] [--resume])
- **--parallel N** (optional): Process N stories in parallel. Default: 1 (sequential)
- **--auto** (optional): Start processing immediately without confirmation
- **--resume** (optional): Resume from last checkpoint

## Process

### Step 1: Load queue

1. Read `.bmad/batch-queue.yaml`
2. Get all stories with status `pending`
3. Sort by priority

### Step 2: Check dependencies

For each story:
- Check if dependencies are completed
- Skip if blocked by pending story
- Flag if blocked by failed story

### Step 3: Process stories

For each eligible story:
1. Mark as `running`
2. Set `started_at` timestamp
3. Execute development workflow:
   - Transition to in-progress
   - TDD cycle (red → green → refactor)
   - Run tests
   - Code review
   - Quality gate validation
4. Mark as `completed` or `failed`
5. Update checkpoint

### Step 4: Handle failures

If a story fails:
- Mark as `failed` with error message
- Check `resume_on_failure` setting
- Continue or stop based on config

### Step 5: Report results

Show final status and metrics.

## Output Format

### Processing

```
═══════════════════════════════════════════════════════
              Processing Batch Queue
═══════════════════════════════════════════════════════

Mode: Sequential
Queue: 5 pending

Processing:
──────────────────────────────────────────────────────

[1/5] US-010: User registration
      Starting... ✅
      TDD Red → Green → Refactor ✅
      Tests passing ✅
      Quality gate ✅
      Completed in 45 min

      Checkpoint saved.

[2/5] US-011: User login
      Starting... ✅
      TDD Red → Green → Refactor ✅
      Tests passing ✅
      Quality gate ✅
      Completed in 38 min

      Checkpoint saved.

[3/5] US-012: Profile page
      Starting... ✅
      TDD Red... 🔄 in progress

      (Ctrl+C to pause, will resume from checkpoint)
```

### Completed

```
═══════════════════════════════════════════════════════
              Batch Queue Complete
═══════════════════════════════════════════════════════

Results:
──────────────────────────────────────────────────────
✅ Completed: 5
❌ Failed: 0
⏭️ Skipped: 0

Stories Processed:
| Story | Status | Duration |
|-------|--------|----------|
| US-010 | ✅ done | 45 min |
| US-011 | ✅ done | 38 min |
| US-012 | ✅ done | 52 min |
| US-013 | ✅ done | 28 min |
| US-014 | ✅ done | 35 min |

Total Time: 3h 18min
Average per Story: 40 min

Sprint Status:
──────────────────────────────────────────────────────
📋 Backlog: 2
🎯 Ready: 0
🔄 In Progress: 0
👀 Review: 0
✅ Done: 8

Commands:
  /sprint:status --bmad    View updated status
  /gate:report          Run quality report
═══════════════════════════════════════════════════════
```

### With Failures

```
═══════════════════════════════════════════════════════
              Batch Queue Interrupted
═══════════════════════════════════════════════════════

Results:
──────────────────────────────────────────────────────
✅ Completed: 3
❌ Failed: 1
⏭️ Skipped: 1 (dependency failed)

Failure Details:
──────────────────────────────────────────────────────
❌ US-012: Profile page
   Error: Tests failing in ProfileController
   TDD Phase: red
   Last checkpoint: TASK-033

   Stack trace:
   AssertionError: Expected 200, got 401
   at ProfileControllerTest.testGetProfile

Actions:
──────────────────────────────────────────────────────
1. Fix the failing test
2. Resume processing:
   /project:run-queue --resume

Or reset and retry:
   /project:queue-reset US-012
   /project:run-queue
═══════════════════════════════════════════════════════
```

### Parallel Mode

```
═══════════════════════════════════════════════════════
              Processing Batch Queue
═══════════════════════════════════════════════════════

Mode: Parallel (3 workers)
Queue: 5 pending

Processing:
──────────────────────────────────────────────────────

Worker 1: US-010 - User registration 🔄
Worker 2: (waiting for dependencies)
Worker 3: (waiting for dependencies)

[10:05] US-010 started
[10:08] US-010: TDD Green phase
[10:12] US-010: Tests passing
[10:15] US-010 completed ✅

[10:15] Dependencies resolved, starting parallel batch:
Worker 1: US-011 - User login 🔄
Worker 2: US-012 - Profile page 🔄
Worker 3: US-014 - Email verification 🔄

[10:20] US-014 completed ✅
[10:22] US-011 completed ✅
Worker 3: US-013 - Password reset 🔄 (deps: US-010, US-011 ✅)
[10:25] US-012 completed ✅
[10:30] US-013 completed ✅

All workers finished.
═══════════════════════════════════════════════════════
```

## Example

```
/project:run-queue
/project:run-queue --auto
/project:run-queue --parallel 3
/project:run-queue --resume
```

## Configuration

Queue settings in `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"  # or "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600

settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

## Checkpoints

Checkpoints are saved after each story:
```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

Resume from checkpoint:
```
/project:run-queue --resume
```
