---
description: Execute automatic routing rules for story transitions
argument-hint: [--dry-run]
---

# Sprint Auto Route

Execute automatic routing rules to transition stories based on their current state and completion metrics.

## Arguments

$ARGUMENTS (format: [--dry-run])
- **--dry-run** (optional): Preview transitions without applying them

## Process

### Step 1: Load sprint status

1. Read `.bmad/sprint-status.yaml`
2. Load routing rules from `routing.auto_transitions.rules`
3. Get all stories

### Step 2: Evaluate rules

For each story, evaluate all routing rules:

**Rule: all_tasks_complete**
```yaml
when: "tasks.completed == tasks.total && tasks.total > 0"
from: "in-progress"
to: "review"
```

**Rule: review_approved**
```yaml
when: "review.approved == true"
from: "review"
to: "done"
```

**Rule: blocked_detection**
```yaml
when: "blocked_reason != null"
from: "*"
to: "blocked"
```

**Rule: unblocked**
```yaml
when: "blocked_reason == null && previous_status != null"
from: "blocked"
to: "previous_status"
```

### Step 3: Check prerequisites

Before auto-transitioning, verify:
- Gate requirements for target status
- No conflicting rules
- Story is not manually locked

### Step 4: Execute transitions (unless --dry-run)

For each triggered rule:
1. Log the transition
2. Update status
3. Record in history with `by: "auto-route"`
4. Apply side effects (TDD phase, etc.)

### Step 5: Report results

Show:
- Number of rules evaluated
- Transitions made
- Stories unchanged
- Any errors or warnings

## Output Format

### Dry Run

```
═══════════════════════════════════════════════════════
           Auto-Route Preview (DRY RUN)
═══════════════════════════════════════════════════════

Evaluating 4 routing rules against 8 stories...

Would transition:
──────────────────────────────────────────────────────
📖 US-005: User authentication
   Rule: all_tasks_complete
   in-progress → review
   Reason: 5/5 tasks completed

📖 US-008: Email verification
   Rule: all_tasks_complete
   in-progress → review
   Reason: 3/3 tasks completed

📖 US-003: OAuth integration
   Rule: unblocked
   blocked → in-progress
   Reason: blocked_reason cleared

Summary:
──────────────────────────────────────────────────────
Rules evaluated: 4
Stories checked: 8
Would transition: 3
No change needed: 5

Run without --dry-run to apply transitions.
═══════════════════════════════════════════════════════
```

### Applied Transitions

```
═══════════════════════════════════════════════════════
              Auto-Route Results
═══════════════════════════════════════════════════════

Evaluating 4 routing rules against 8 stories...

Transitions applied:
──────────────────────────────────────────────────────
✅ US-005: in-progress → review
   Rule: all_tasks_complete
   Tasks: 5/5 completed

✅ US-008: in-progress → review
   Rule: all_tasks_complete
   Tasks: 3/3 completed

✅ US-003: blocked → in-progress
   Rule: unblocked
   Previous status restored

Summary:
──────────────────────────────────────────────────────
Rules evaluated: 4
Stories checked: 8
Transitioned: 3
No change needed: 5

Sprint status updated. Run /sprint:status --bmad to view.
═══════════════════════════════════════════════════════
```

### No Transitions Needed

```
═══════════════════════════════════════════════════════
              Auto-Route Results
═══════════════════════════════════════════════════════

Evaluating 4 routing rules against 8 stories...

No automatic transitions needed.
──────────────────────────────────────────────────────
All stories are in appropriate states based on their
current completion metrics.

Stories by status:
  📋 Backlog: 2
  🎯 Ready: 3
  🔄 In Progress: 2 (tasks pending)
  ✅ Done: 1
═══════════════════════════════════════════════════════
```

## Example

```
/sprint:auto-route --dry-run
/sprint:auto-route
```

## Custom Rules

Add custom rules to `.bmad/sprint-status.yaml`:

```yaml
routing:
  auto_transitions:
    enabled: true
    rules:
      # Custom rule: story too long in review
      - name: "review_timeout"
        description: "Flag stories in review > 2 days"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify

      # Custom rule: high priority first
      - name: "priority_bump"
        description: "Auto-assign high priority stories"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

## Integration

Auto-route can be triggered:
1. Manually via this command
2. Automatically in Stop hook
3. After task completion
4. On session start (configurable)

Configure in `.bmad/sprint-status.yaml`:
```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
```

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /sprint:next-story                                    ║
║    Pick the next routed story                            ║
║                                                          ║
║  → /sprint:dev                                           ║
║    Start development                                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
