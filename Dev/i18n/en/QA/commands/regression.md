---
description: View and manage QA Recette regression test registry
argument-hint: [--list|--stats|--check] [--status=<active|verified|obsolete>] [--source=<story-id>]
---

# QA Recette Regression - Regression Test Registry

View and manage the regression test registry. Browse registered tests, check stability scores, and detect Golden Rule violations. Implements the **Golden Rule**: A fixed bug should NEVER reappear.

## Arguments

**$ARGUMENTS**

- `--list`: List all regression tests in the registry
- `--stats`: Show stability score and trend analysis
- `--check`: Run regression tests and detect violations
- `--status=<status>`: Filter by status (active, verified, obsolete)
- `--source=<id>`: Filter by source story/sprint (e.g., US-001)
- `--trend`: Show historical trend data
- `--format=<type>`: Output format (table, yaml, json) — default: table

## Key Features

| Feature | Description |
|---------|-------------|
| **Registry Browsing** | List all regression tests with metadata |
| **Stability Scoring** | Score from 0-100 based on test pass rate |
| **Trend Analysis** | Historical trend of regression stability |
| **Golden Rule Check** | Alert on regression test failures (bugs reappearing) |
| **Source Filtering** | Filter tests by originating story or sprint |
| **Status Management** | Track active, verified, and obsolete tests |

## Process

### 1. Registry Loading

```
┌─────────────────────────────────────────┐
│  1. load_registry()                     │
│     - Read .recette/regression/         │
│       registry.yaml                     │
│     - Load test metadata                │
│     - Apply filters (status, source)    │
└─────────────────────────────────────────┘
```

### 2. Registry List (--list)

```
┌──────────┬─────────────────────────────────┬──────────┬──────────────────────────────┬──────────┐
│ ID       │ Error                           │ Source   │ Test Path                    │ Status   │
├──────────┼─────────────────────────────────┼──────────┼──────────────────────────────┼──────────┤
│ REG-001  │ Login validation not displayed  │ US-001   │ tests/Unit/Auth/LoginTest.php │ verified │
│ REG-002  │ API timeout on /api/users       │ US-001   │ tests/Func/Api/UsersTest.php  │ active   │
│ REG-003  │ Cart total miscalculation       │ US-015   │ tests/Unit/Cart/TotalTest.php │ active   │
└──────────┴─────────────────────────────────┴──────────┴──────────────────────────────┴──────────┘
```

### 3. Stability Score (--stats)

```
Regression Stability Score: 94/100

  Breakdown:
    Active tests:    12
    Verified tests:   8
    Obsolete tests:   2
    Total:           22

  Last 5 runs:
    ████████████████████  100% (2026-02-01)
    ████████████████░░░░   88% (2026-01-31)
    ████████████████████  100% (2026-01-30)
    ████████████████████  100% (2026-01-29)
    ██████████████░░░░░░   75% (2026-01-28)

  Trend: ↑ Improving (+6 pts over 5 runs)
```

### 4. Golden Rule Check (--check)

```
Golden Rule Check: 1 VIOLATION DETECTED

  ⚠ REG-002: API timeout on /api/users
    Source:  US-001
    Test:    tests/Functional/Api/UsersTest.php
    Status:  FAILING (was passing on 2026-01-30)
    Action:  Bug has reappeared — immediate fix required

  ✓ REG-001: Login validation — PASSING
  ✓ REG-003: Cart total — PASSING
  ...

  Summary: 11/12 active tests passing (91.7%)
```

## Data Sources

| Source | Path | Description |
|--------|------|-------------|
| Registry | `.recette/regression/registry.yaml` | All registered regression tests |
| Tests | `.recette/regression/tests/` | Generated test files |
| History | `.recette/metrics/history.jsonl` | Historical run data |

## Examples

```bash
# List all regression tests
/qa:recette-regression --list

# Show stability score
/qa:recette-regression --stats

# Run regression check (detect Golden Rule violations)
/qa:recette-regression --check

# Filter by source story
/qa:recette-regression --list --source=US-001

# Filter by status
/qa:recette-regression --list --status=active

# Show historical trend
/qa:recette-regression --stats --trend

# Output as JSON
/qa:recette-regression --list --format=json
```

## Output Structure

```
.recette/regression/
├── registry.yaml          # Regression test registry
└── tests/
    ├── Unit/              # Unit regression tests
    ├── Functional/        # Functional regression tests
    └── Behat/             # Behat regression features

.recette/metrics/
└── history.jsonl          # Historical data for trend analysis
```

## Related Commands

| Command | Description |
|---------|-------------|
| `/qa:recette` | Execute acceptance tests |
| `/qa:recette-fix` | Fix bugs from a recette session |
| `/qa:recette-status` | Show session status |
| `/qa:recette-report` | Generate report |

## Error Messages

| Error | Solution |
|-------|----------|
| "Registry not found" | Run `/qa:recette` first to generate a registry |
| "No regression tests" | No errors have been detected in previous runs |
| "Golden Rule violation" | A bug has reappeared — run `/qa:recette-fix` to fix |
| "History file missing" | Run at least 2 recette sessions for trend data |

## Best Practices

1. **Check regularly**: Run `--check` before each deployment
2. **Monitor trends**: Use `--stats --trend` to track stability over time
3. **Fix violations immediately**: Golden Rule violations indicate re-introduced bugs
4. **Clean obsolete tests**: Mark tests as obsolete when features are removed
5. **Filter by source**: Review regression tests per story for targeted analysis

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Launch a new recette session                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
