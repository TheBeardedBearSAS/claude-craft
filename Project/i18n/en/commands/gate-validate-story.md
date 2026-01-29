---
description: Validate story against Definition of Done
argument-hint: <story-id>
---

# Validate Story Gate (DoD)

Validate a User Story against the Definition of Done criteria.
All criteria must pass for the story to be marked as complete.

## Arguments

$ARGUMENTS (format: <story-id>)
- **story-id** (required): Story identifier (e.g., US-001)

## Definition of Done Criteria

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Tasks Complete | 20% | Yes | All tasks marked as done |
| Tests Passing | 20% | Yes | TDD cycle complete (green/refactor) |
| AC Validated | 20% | Yes | All acceptance criteria validated |
| Code Reviewed | 15% | Yes | Peer review completed |
| No Blockers | 10% | Yes | Not in blocked state |
| Documentation | 10% | No | Docs updated if needed |
| Security Review | 5% | No | Security implications checked |

**Threshold: 100% (all required criteria)**

## Process

### Step 1: Load story

1. Read `.bmad/sprint-status.yaml`
2. Find story by ID
3. Load all story fields

### Step 2: Validate each criterion

Check all DoD criteria:
- Tasks: `tasks.completed == tasks.total`
- Tests: `tdd_phase in ['green', 'refactor', 'done']`
- AC: `acceptance_criteria.validated == acceptance_criteria.total`
- Review: `status == 'review' or review.approved == true`
- Blockers: `blocked_reason == null`

### Step 3: Generate report

Show detailed results with pass/fail status.

## Output Format

### Story Passes DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: Email verification
Status: review → done (pending)

Definition of Done:
──────────────────────────────────────────────────────
✅ Tasks Complete (20%)
   All tasks done: 4/4
   □ TASK-021: Backend endpoint ✓
   □ TASK-022: Email service ✓
   □ TASK-023: Frontend flow ✓
   □ TASK-024: Tests ✓

✅ Tests Passing (20%)
   TDD Phase: refactor
   All tests green

✅ Acceptance Criteria (20%)
   Validated: 3/3
   ✓ AC1: Verification email sent
   ✓ AC2: Link expires after 24h
   ✓ AC3: User status updated

✅ Code Reviewed (15%)
   PR #42 approved by @reviewer
   Review status: approved

✅ No Blockers (10%)
   No blocking issues

✅ Documentation (10%)
   API docs updated

✅ Security Review (5%)
   Token generation reviewed

Score: 100/100
──────────────────────────────────────────────────────

✅ STORY DoD GATE PASSED

Story can be transitioned to 'done'.
Run: /sprint:transition US-005 done
═══════════════════════════════════════════════════════
```

### Story Fails DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: Email verification
Status: in-progress

Definition of Done:
──────────────────────────────────────────────────────
❌ Tasks Complete (20%)
   Tasks done: 2/4
   ✓ TASK-021: Backend endpoint
   ✓ TASK-022: Email service
   □ TASK-023: Frontend flow (in-progress)
   □ TASK-024: Tests (pending)

❌ Tests Passing (20%)
   TDD Phase: red
   Tests are failing

⚠️ Acceptance Criteria (20%)
   Validated: 1/3
   ✓ AC1: Verification email sent
   □ AC2: Link expires after 24h
   □ AC3: User status updated

❌ Code Reviewed (15%)
   No PR created yet

✅ No Blockers (10%)
   No blocking issues

⏳ Documentation (10%)
   Not checked

⏳ Security Review (5%)
   Not checked

Score: 25/100
──────────────────────────────────────────────────────

❌ STORY DoD GATE FAILED

Required Actions:
──────────────────────────────────────────────────────
1. Complete remaining tasks
   - TASK-023: Frontend flow
   - TASK-024: Tests

2. Fix failing tests
   Current TDD phase: red
   Run tests and implement fixes

3. Validate acceptance criteria
   - Test AC2: Link expiration
   - Test AC3: User status update

4. Create pull request for review
   git push && gh pr create

Estimated remaining work:
  Tasks: 2 remaining
  TDD cycles: 2 (for remaining tasks)

Resume work: /sprint:dev US-005
═══════════════════════════════════════════════════════
```

## Example

```
/gate:validate-story US-005
/gate:validate-story US-001
```

## TDD Phase Guide

| Phase | Meaning | Next Step |
|-------|---------|-----------|
| red | Tests failing | Implement code |
| green | Tests passing | Refactor |
| refactor | Cleaning up | Complete or next task |
| done | Cycle complete | Move to review |

Update phase:
```
/sprint:tdd US-005 green
```

## Integration

This gate is checked:
1. Manually via this command
2. In Stop hook (quality-gate.sh)
3. Before `/sprint:transition <id> done`

Gate configuration: `.bmad/gates/story-gate.yaml`
