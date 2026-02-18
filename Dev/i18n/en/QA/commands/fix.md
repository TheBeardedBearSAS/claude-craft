---
description: Automated bug fixing from QA Recette sessions
argument-hint: --session=<session-id> [--dry-run|--skip-fix|--severity=<level>|--auto-commit]
---

# QA Recette Fix - Automated Bug Fixing

Complement to `/qa:recette`. Reads a recette session/report, refines each error to make it actionable, generates project management documents (BMAD bug stories, backlog, sprint), then launches TDD-based fixing for each bug. Implements the **Golden Rule**: A fixed bug should NEVER reappear.

## Arguments

**$ARGUMENTS**

- `--session=<id>`: Recette session ID (e.g., REC-20260130-143022) **[required]**
- `--dry-run`: Refine errors and generate BMAD documents without fixing
- `--severity=<level>`: Filter by minimum severity (critical, high, medium, low)
- `--skip-fix`: Generate documents only, no TDD fixing
- `--auto-commit`: Automatic commit after each bug fix

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Key Features

| Feature | Description |
|---------|-------------|
| **Error Refinement** | Analyzes root cause, reproduces via Chrome if available |
| **Smart Grouping** | Deduplicates errors by common root cause |
| **BMAD Documents** | Generates bug stories, updates backlog and sprint |
| **TDD Fixing** | RED -> GREEN -> REFACTOR workflow for each bug |
| **Regression Tests** | Automatic generation and registry update |
| **Progress Tracking** | fix-state.yaml for resume and monitoring |

## 7-Phase Process

```
Recette session (.recette/sessions/{id}/)
        |
        v
  Phase 1: Load session and errors
        |
        v
  Phase 2: Refine error descriptions
        |     - Reproduce via Chrome if needed
        |     - Identify root cause
        |     - Classify severity
        |
        v
  Phase 3: Group by root cause
        |     - Deduplication
        |     - Prioritization
        |
        v
  Phase 4: Generate BMAD documents
        |     - Bug stories (US-XXX-bug-YYY)
        |     - Update backlog
        |     - Update sprint-status.yaml
        |
        v
  Phase 5: TDD fix per bug
        |     - RED: test reproducing the bug
        |     - GREEN: minimal fix
        |     - REFACTOR: improvement
        |
        v
  Phase 6: Verification
        |     - All tests pass
        |     - Regression tests generated
        |     - Regression registry updated
        |
        v
  Phase 7: Summary report
```

### Phase 1: Session Loading

```
┌─────────────────────────────────────────┐
│  1. load_session(session_id)            │
│     - Read .recette/sessions/{id}/      │
│     - Load state.yaml                   │
│     - Extract errors (failed)           │
│     - Load associated screenshots/logs  │
└─────────────────────────────────────────┘
```

### Phase 2: Error Refinement

For each detected error:

1. Re-read the error screenshot/log from the session
2. If Chrome MCP is available: reproduce the error to confirm
3. Analyze source code to identify root cause
4. Reformulate description with: actual behavior, expected behavior, affected files, suspected root cause

**Severity Matrix:**

| Error Type | User Impact | Frequency | Severity |
|------------|-------------|-----------|----------|
| security | Any | Any | critical |
| logic | Blocking | Any | critical |
| logic | Non-blocking | Frequent | high |
| validation | Blocking | Any | high |
| validation | Non-blocking | Rare | medium |
| interaction | Any | Any | high |
| visual | Major degradation | Any | medium |
| visual | Cosmetic | Any | low |
| api | 5xx error | Any | critical |
| api | Unexpected 4xx | Any | high |

### Phase 3: Root Cause Grouping

Multiple recette errors can share the same root cause:

- Form validation error + message display error = same validation component
- API error on 3 endpoints = same authentication middleware

Grouping creates **one bug story** per root cause instead of one per error.

### Phase 4: BMAD Document Generation

For each grouped bug:

1. Generate bug story from `bug-story.md` template
2. Add to `.bmad/sprint-status.yaml` with status `ready-for-dev`
3. If a sprint is active: add to current sprint
4. Otherwise: add to backlog

### Phase 5: TDD Fixing

For each bug story (by severity order):

```
┌──────────────────────────────────────────────┐
│  BUG-001 (critical)                          │
│                                              │
│  1. RED   : Write test reproducing the bug   │
│             → Execute → MUST fail            │
│                                              │
│  2. GREEN : Minimal code fix                 │
│             → Execute → MUST pass            │
│             → All tests → non-regression     │
│                                              │
│  3. REFACTOR : Improve if necessary          │
│             → Generate regression test       │
│             → Update registry                │
│             → Update fix-state.yaml          │
│                                              │
│  4. COMMIT (if --auto-commit)                │
│     fix({module}): {desc} [recette:{session}]│
└──────────────────────────────────────────────┘
```

**Test types generated by classification:**

| Error Type | Unit Test | Functional Test | Behat Feature |
|------------|:---------:|:---------------:|:-------------:|
| logic | X | | |
| validation | X | X | |
| api | | X | |
| interaction | | | X |
| visual | | | X |
| security | X | X | |

### Phase 6: Verification

1. Run all project tests
2. Verify generated regression tests are in `.recette/regression/tests/`
3. Verify `.recette/regression/registry.yaml` is up to date
4. Verify fix-state.yaml reflects correct state

### Phase 7: Summary Report

Generates a summary report with:

- Total number of errors processed
- Number of grouped bugs (after deduplication)
- Successful / failed / skipped fixes
- Regression tests generated
- Commits made (if `--auto-commit`)

## Progress State (fix-state.yaml)

```yaml
# .recette/sessions/{id}/fix-state.yaml
session_id: "REC-20260130-143022"
started_at: "2026-01-31T10:00:00"
status: "in-progress"  # pending | in-progress | completed | paused

errors:
  total: 8
  grouped: 5
  refined: 5
  fixed: 3
  skipped: 0
  remaining: 2

bugs:
  - id: "BUG-001"
    error_ids: ["ERR-001", "ERR-003"]
    severity: critical
    title: "Authentication fails after session timeout"
    story_id: "US-042-bug-001"
    status: "fixed"  # pending | refining | documented | fixing | fixed | skipped
    tdd_phase: "refactor"
    fix_commit: "abc1234"
    regression_test: "tests/Functional/Auth/SessionTimeoutTest.php"

  - id: "BUG-002"
    error_ids: ["ERR-002"]
    severity: high
    title: "Contact form does not display validation errors"
    story_id: "US-042-bug-002"
    status: "fixing"
    tdd_phase: "green"
    fix_commit: null
    regression_test: null

current_bug: "BUG-002"
resume_from:
  bug_id: "BUG-002"
  phase: "green"
```

## Examples

```bash
# Fix all bugs from a recette session
/qa:recette-fix --session=REC-20260130-143022

# Dry run: refine and document without fixing
/qa:recette-fix --session=REC-20260130-143022 --dry-run

# Fix only critical and high severity bugs
/qa:recette-fix --session=REC-20260130-143022 --severity=high

# Generate BMAD documents without launching TDD
/qa:recette-fix --session=REC-20260130-143022 --skip-fix

# Fix with automatic commits
/qa:recette-fix --session=REC-20260130-143022 --auto-commit
```

## Output Structure

```
.recette/sessions/{session-id}/
├── state.yaml              # Recette session state
├── fix-state.yaml          # Fix progress state
├── screenshots/            # Error screenshots
└── logs/                   # Detailed logs

.bmad/stories/
├── US-042-bug-001.md       # BMAD bug story
├── US-042-bug-002.md
└── ...

.recette/regression/
├── registry.yaml           # Updated registry
└── tests/
    ├── Unit/
    ├── Functional/
    └── Behat/
```

## Related Commands

| Command | Description |
|---------|-------------|
| `/qa:recette` | Execute acceptance tests |
| `/qa:recette-status` | Show session status |
| `/qa:recette-regression` | View regression tests |
| `/qa:recette-report` | Generate report |

## Error Messages

| Error | Solution |
|-------|----------|
| "Session not found" | Verify session ID in `.recette/sessions/` |
| "No errors in session" | Session has no errors to fix |
| "sprint-status.yaml not found" | Initialize BMAD with `/bmad:init` |
| "RED test does not fail" | Bug may no longer exist, check manually |

## Best Practices

1. **Start with dry-run**: Verify refined errors and documents before fixing
2. **Prioritize by severity**: Start with critical bugs
3. **Validate groupings**: Verify grouped errors truly share the same cause
4. **Review stories**: Check generated bug stories before launching TDD
5. **Use auto-commit**: To keep a clean history of fixes

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Re-test after corrections                             ║
║                                                          ║
║  See also:                                               ║
║  • /qa:regression — Check regression tests               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
