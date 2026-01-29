---
description: Transition story to a new status
argument-hint: <story-id> <target-status>
---

# Sprint Transition

Transition a story to a new status with validation and history tracking.

## Arguments

$ARGUMENTS (format: <story-id> <target-status>)
- **story-id** (required): Story identifier (e.g., US-001)
- **target-status** (required): Target status

Valid statuses:
- `backlog` - Story in product backlog
- `ready-for-dev` - Refined and ready for development
- `in-progress` - Currently being developed
- `review` - Code complete, awaiting review
- `done` - Definition of Done met
- `blocked` - Blocked by external factor

## Process

### Step 1: Validate story exists

1. Read `.bmad/sprint-status.yaml`
2. Find story by ID
3. Get current status

### Step 2: Validate transition

Check state machine rules:
```
Allowed transitions:
  backlog → ready-for-dev
  ready-for-dev → in-progress
  in-progress → review
  review → done
  review → in-progress (changes requested)
  * → blocked (any state can be blocked)
  blocked → previous_status (resume)
```

### Step 3: Check gate requirements

Before transitioning, verify gate requirements:

**→ ready-for-dev**
- [ ] Acceptance criteria defined
- [ ] Story points estimated
- [ ] Tasks decomposed

**→ in-progress**
- [ ] No blocking dependencies
- [ ] Developer assigned (optional)

**→ review**
- [ ] All tasks completed
- [ ] Tests passing (TDD green or refactor)
- [ ] Code pushed

**→ done**
- [ ] Code reviewed
- [ ] All AC validated
- [ ] DoD checklist complete

**→ blocked**
- Provide blocked_reason

### Step 4: Execute transition

1. Store previous status
2. Update status field
3. Set timestamps
4. Update TDD phase if applicable
5. Record in history

### Step 5: Side effects

Based on transition:

**→ in-progress**
- Set `tdd_phase` to `red`
- Set `current_task` to first task

**→ review**
- Set `tdd_phase` to `refactor`
- Clear `current_task`

**→ done**
- Clear `tdd_phase`
- Record completion time

**→ blocked**
- Store `blocked_reason`
- Store `previous_status` for resume

### Step 6: Update history

Add entry:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "All tasks complete"
```

## Output Format

### Successful Transition

```
═══════════════════════════════════════════════════════
              Story Transition
═══════════════════════════════════════════════════════

📖 US-005: User authentication

Status: in-progress → review ✅

Gate checks:
──────────────────────────────────────────────────────
✅ All tasks completed (5/5)
✅ Tests passing
✅ Code pushed

History updated:
──────────────────────────────────────────────────────
• 2026-01-29 10:00 - in-progress → review (manual)
• 2026-01-27 09:00 - ready-for-dev → in-progress
• 2026-01-25 14:00 - backlog → ready-for-dev

Next steps:
──────────────────────────────────────────────────────
Story is now in review. Assign reviewer or run:
  /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Gate Failed

```
═══════════════════════════════════════════════════════
              Transition Blocked
═══════════════════════════════════════════════════════

📖 US-005: User authentication

Requested: in-progress → review ❌

Gate failures:
──────────────────────────────────────────────────────
❌ Tasks incomplete: 3/5
❌ TDD phase is 'red' - tests should pass first

Required actions:
──────────────────────────────────────────────────────
1. Complete remaining tasks:
   □ TASK-015: Implement JWT validation
   □ TASK-016: Add refresh token support

2. Move TDD to green phase:
   /sprint:tdd green

Then retry: /sprint:transition US-005 review
═══════════════════════════════════════════════════════
```

### Invalid Transition

```
═══════════════════════════════════════════════════════
              Invalid Transition
═══════════════════════════════════════════════════════

📖 US-005: User authentication

Current: in-progress
Requested: done ❌

Invalid: Cannot transition directly from 'in-progress' to 'done'

Valid transitions from 'in-progress':
──────────────────────────────────────────────────────
• review - Code complete, ready for review
• blocked - Story is blocked

State machine:
  backlog → ready-for-dev → in-progress → review → done
═══════════════════════════════════════════════════════
```

## Example

```
/sprint:transition US-005 review
/sprint:transition US-003 blocked "Waiting for API credentials"
/sprint:transition US-003 in-progress  # Resume from blocked
```

## Special Cases

### Blocking a story
```
/sprint:transition US-003 blocked "Waiting for external API"
```
Stores the reason and preserves previous status for resume.

### Unblocking a story
```
/sprint:transition US-003 in-progress
```
When transitioning from blocked, returns to previous status.

### Requesting changes in review
```
/sprint:transition US-005 in-progress
```
Valid reverse transition from review to address feedback.
