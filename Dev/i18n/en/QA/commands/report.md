---
description: Generate QA Recette reports from session data
argument-hint: --session=<session-id> [--format=<md|html|json>] [--output=<path>]
---

# QA Recette Report - Report Generation

Generate detailed reports from QA Recette session data. Supports multiple output formats and session comparison.

## Arguments

**$ARGUMENTS**

- `--session=<id>`: Session ID to generate report from **[required]**
- `--format=<type>`: Output format (md, html, json) — default: md
- `--output=<path>`: Custom output path (default: `.recette/reports/`)
- `--include-screenshots`: Embed screenshots in HTML report
- `--compare=<id>`: Compare with another session for regression diff

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Format** | Generate Markdown, HTML, or JSON reports |
| **Session Comparison** | Compare two runs to detect regressions |
| **Golden Rule Section** | Dedicated compliance section in reports |
| **Screenshot Embedding** | Embed error screenshots in HTML reports |
| **Test Traceability** | Full traceability from AC to test results |
| **Metrics Summary** | Pass/fail rates, timing, error classification |

## Process

### 1. Data Collection

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Read .recette/sessions/{id}/      │
│     - Load state.yaml                   │
│     - Load fix-state.yaml if present    │
│     - Collect screenshots and logs      │
│     - Load regression registry          │
└─────────────────────────────────────────┘
```

### 2. Report Generation

```
┌─────────────────────────────────────────┐
│  2. generate_report(format)             │
│     - Build summary section             │
│     - Build test results section        │
│     - Build error details section       │
│     - Build regression tests section    │
│     - Build Golden Rule statement       │
│     - Apply format template             │
│     - Write to output path              │
└─────────────────────────────────────────┘
```

### 3. Report Structure

**Markdown Report:**

```markdown
# QA Recette Report — REC-20260130-143022

## Summary

| Metric | Value |
|--------|-------|
| Session | REC-20260130-143022 |
| Scope | story → US-001 |
| Date | 2026-01-30 14:30 – 14:45 |
| Duration | 14m 48s |
| Tests | 15 total |
| Passed | 12 (80%) |
| Failed | 2 (13%) |
| Skipped | 1 (7%) |

## Test Results

### Passed Tests (12)
- TC-001: User can access login page ✓
- TC-002: Valid credentials login ✓
...

### Failed Tests (2)
- TC-008: Login validation error display ✗
  Error: ERR-001 — Validation message not visible
- TC-012: API response timeout ✗
  Error: ERR-002 — Timeout after 30s on /api/users

## Error Details

### ERR-001: Login validation not displayed
- Type: visual
- Severity: medium
- Screenshot: screenshots/err-001.png
- Root cause: CSS display:none not toggled

### ERR-002: API timeout on /api/users
- Type: api
- Severity: critical
- Logs: logs/err-002.log

## Regression Tests Generated

| ID | Error | Test Type | Path |
|----|-------|-----------|------|
| REG-001 | ERR-001 | behat | features/auth/login_validation.feature |
| REG-002 | ERR-002 | functional | tests/Functional/Api/UsersTimeoutTest.php |

## Golden Rule Compliance

All detected errors have generated regression tests.
Registry updated: .recette/regression/registry.yaml
```

### 4. Comparison Mode (--compare)

When comparing two sessions:

```
## Comparison: REC-20260130-143022 vs REC-20260201-140000

| Metric | Session 1 | Session 2 | Delta |
|--------|-----------|-----------|-------|
| Tests | 15 | 15 | = |
| Passed | 12 | 14 | +2 |
| Failed | 2 | 0 | -2 |
| Duration | 14m 48s | 12m 15s | -2m 33s |

### Resolved Errors
- ERR-001: Login validation — FIXED
- ERR-002: API timeout — FIXED

### New Errors
(none)

### Regression Status
No Golden Rule violations detected.
```

## Data Sources

| Source | Path | Description |
|--------|------|-------------|
| Session state | `.recette/sessions/{id}/state.yaml` | Test results and progress |
| Fix state | `.recette/sessions/{id}/fix-state.yaml` | Bug fix status |
| Screenshots | `.recette/sessions/{id}/screenshots/` | Error screenshots |
| Logs | `.recette/sessions/{id}/logs/` | Execution logs |
| Registry | `.recette/regression/registry.yaml` | Regression test registry |
| Template | `Tools/Recette/templates/report.md.template` | Report template |

## Examples

```bash
# Generate Markdown report (default)
/qa:recette-report --session=REC-20260130-143022

# Generate HTML report with screenshots
/qa:recette-report --session=REC-20260130-143022 --format=html --include-screenshots

# Generate JSON report for CI integration
/qa:recette-report --session=REC-20260130-143022 --format=json

# Custom output path
/qa:recette-report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Compare two sessions
/qa:recette-report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

## Output Structure

```
.recette/reports/
├── REC-20260130-143022-report.md       # Markdown report
├── REC-20260130-143022-report.html     # HTML report (if --format=html)
├── REC-20260130-143022-report.json     # JSON report (if --format=json)
└── REC-20260201-vs-20260130-diff.md    # Comparison report (if --compare)
```

## Related Commands

| Command | Description |
|---------|-------------|
| `/qa:recette` | Execute acceptance tests |
| `/qa:recette-fix` | Fix bugs from a recette session |
| `/qa:recette-status` | Show session status |
| `/qa:recette-regression` | View regression test registry |

## Error Messages

| Error | Solution |
|-------|----------|
| "Session not found" | Verify session ID in `.recette/sessions/` |
| "No test results" | Session has no completed tests to report on |
| "Template not found" | Verify `Tools/Recette/templates/` exists |
| "Compare session not found" | Verify the comparison session ID |

## Best Practices

1. **Generate after each run**: Create a report immediately after recette execution
2. **Use HTML for stakeholders**: HTML format with screenshots is best for sharing
3. **Use JSON for CI**: Integrate JSON reports into your CI/CD pipeline
4. **Compare runs**: Use --compare to track progress between iterations
5. **Archive reports**: Keep reports in version control for audit trail

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /workflow:review                                      ║
║    Prepare the sprint review                             ║
║                                                          ║
║  See also:                                               ║
║  • /sprint:status — View sprint metrics                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
