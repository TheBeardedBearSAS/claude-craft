---
description: "Validate backlog stories against INVEST criteria"
argument-hint: "[story-id] [--no-gate]"
---

# Validate Backlog Gate

Validate User Stories against INVEST criteria.
All stories must pass all 6 INVEST criteria.

## Arguments

$ARGUMENTS (format: [story-id] [--no-gate])
- **story-id** (optional): Specific story to validate (e.g., US-001). If omitted, validates all stories.
- **--no-gate** (optional): Run simple INVEST validation only (skip quality gate enforcement, scoring thresholds, and pass/fail verdict). Useful for quick checks during refinement without blocking on gate criteria.

## INVEST Criteria

| Letter | Criterion | Description | Checks |
|--------|-----------|-------------|--------|
| **I** | Independent | Can be developed alone | No blocking dependencies |
| **N** | Negotiable | Details can be discussed | Has description, not over-specified |
| **V** | Valuable | Delivers user value | Has acceptance criteria, benefit statement |
| **E** | Estimable | Can be estimated | Has story points |
| **S** | Small | Fits in one sprint | ≤ 8 story points |
| **T** | Testable | Can be tested | Has acceptance criteria |

**Threshold: 6/6 for each story**

## Process

### Step 1: Load stories

1. Read `.bmad/sprint-status.yaml`
2. Get specified story or all stories
3. Load story details

### Step 2: Validate INVEST for each story

For each criterion:
- **Independent**: Check `blocked_by` is empty
- **Negotiable**: Check description length, task count
- **Valuable**: Check acceptance criteria exist
- **Estimable**: Check story points > 0
- **Small**: Check story points ≤ 8
- **Testable**: Check acceptance criteria count > 0

### Step 3: Calculate scores

Per-story INVEST score (0-6)

### Step 4: Generate report

Show individual and aggregate results.

## Output Format

### All Stories Pass

```
═══════════════════════════════════════════════════════
          Backlog INVEST Gate Validation
═══════════════════════════════════════════════════════

Validating 8 stories...

Story Results:
──────────────────────────────────────────────────────
✅ US-001: User login
   [I] ✓ Independent - No dependencies
   [N] ✓ Negotiable - Clear description
   [V] ✓ Valuable - 3 acceptance criteria
   [E] ✓ Estimable - 5 story points
   [S] ✓ Small - 5 ≤ 8 points
   [T] ✓ Testable - Gherkin AC defined
   Score: 6/6 ✅

✅ US-002: User registration
   Score: 6/6 ✅

✅ US-003: Password reset
   Score: 6/6 ✅

[... more stories ...]

Summary:
──────────────────────────────────────────────────────
Stories validated: 8
Passing (6/6): 8
Warnings (4-5/6): 0
Failing (<4/6): 0

✅ BACKLOG GATE PASSED

All stories meet INVEST criteria.
Ready for sprint planning.
═══════════════════════════════════════════════════════
```

### Stories Failing

```
═══════════════════════════════════════════════════════
          Backlog INVEST Gate Validation
═══════════════════════════════════════════════════════

Validating 8 stories...

Story Results:
──────────────────────────────────────────────────────
✅ US-001: User login
   Score: 6/6 ✅

⚠️ US-002: User registration
   [I] ✓ Independent
   [N] ✓ Negotiable
   [V] ✓ Valuable
   [E] ✗ Estimable - No story points
   [S] ? Small - Cannot check without points
   [T] ✓ Testable
   Score: 4/6 ⚠️

❌ US-003: Complete rewrite of auth system
   [I] ✗ Independent - Blocked by US-001, US-002
   [N] ✗ Negotiable - 15 tasks (too specified)
   [V] ✓ Valuable
   [E] ✓ Estimable - 13 points
   [S] ✗ Small - 13 > 8 points
   [T] ✓ Testable
   Score: 3/6 ❌

Summary:
──────────────────────────────────────────────────────
Stories validated: 8
Passing (6/6): 6
Warnings (4-5/6): 1
Failing (<4/6): 1

❌ BACKLOG GATE FAILED

Required Actions:
──────────────────────────────────────────────────────
US-002:
  → Add story points estimate
  → Run: /project:update-story US-002 --points 3

US-003:
  → Split into smaller stories (≤8 points each)
  → Remove unnecessary task details
  → Resolve dependencies or reorder
  → Consider: /project:split-story US-003

Re-run after fixes: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

### Single Story Validation

```
═══════════════════════════════════════════════════════
          INVEST Validation: US-005
═══════════════════════════════════════════════════════

📖 US-005: Email verification

INVEST Analysis:
──────────────────────────────────────────────────────
[I] ✓ Independent
    No blocking dependencies

[N] ✓ Negotiable
    Description: 45 words
    Tasks: 4 (reasonable)

[V] ✓ Valuable
    "As a user, I want to verify my email
     so that I can secure my account"
    Acceptance Criteria: 3

[E] ✓ Estimable
    Story Points: 3

[S] ✓ Small
    3 points ≤ 8 points

[T] ✓ Testable
    3 Gherkin scenarios defined

Score: 6/6 ✅
──────────────────────────────────────────────────────

✅ Story meets INVEST criteria

Status: ready-for-dev
═══════════════════════════════════════════════════════
```

## Example

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

## Fixing Common Issues

### Story too large (S)
```
/project:split-story US-003
```

### Missing story points (E)
```
/project:update-story US-002 --points 3
```

### Missing acceptance criteria (V, T)
```
/project:add-ac US-002 "Given... When... Then..."
```

Gate configuration: `.bmad/gates/backlog-gate.yaml`

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  If PASS (≥ threshold):                                  ║
║  → /gate:validate-sprint                                 ║
║    Validate sprint readiness                             ║
║                                                          ║
║  If FAIL (< threshold):                                  ║
║  → Correct the identified issues                         ║
║  → /gate:validate-backlog (re-run after corrections)     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
