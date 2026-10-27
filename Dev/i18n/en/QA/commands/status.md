---
description: "Show QA Recette session status and progress, or generate reports (--report)"
argument-hint: "[--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>] [--report] [--format=<md|html|json>] [--output=<path>] [--compare=<id>]"
---

# QA Recette Status - Session Status and Progress

Display status and progress of QA Recette sessions. View individual session details or list all sessions with filtering.

## Arguments

**$ARGUMENTS**

- `--session=<id>`: Show detailed status for a specific session (e.g., REC-20260130-143022)
- `--all`: List all sessions with summary
- `--scope=<type>`: Filter by scope (story, sprint)
- `--status=<status>`: Filter by status (running, completed, paused, failed)
- `--format=<type>`: Output format (table, yaml, json) — default: table
- `--watch`: Live refresh mode (updates every 5 seconds)
- `--report`: Report mode (former `/qa:status --report`): generate a report from a session; requires `--session=<id>`
- `--format=<type>`: with `--report`: md, html, json (default: md)
- `--output=<path>`: with `--report`: custom output path (default: `.recette/reports/`)
- `--include-screenshots`: with `--report`: embed screenshots in the HTML report
- `--compare=<id>`: with `--report`: compare with another session for a regression diff

## Key Features

| Feature | Description |
|---------|-------------|
| **Session Listing** | List all sessions with status, progress, and dates |
| **Detailed View** | Single session with test breakdown, errors, timing |
| **Progress Bars** | Visual progress indicators for running sessions |
| **Filtering** | Filter by scope, status, or date range |
| **Live Mode** | Watch mode for real-time progress monitoring |
| **Fix State** | Shows fix-state.yaml status if recette-fix has been run |

## Process

### 1. Session Discovery

```
┌─────────────────────────────────────────┐
│  1. scan_sessions()                     │
│     - Read .recette/sessions/           │
│     - Load state.yaml for each session  │
│     - Load fix-state.yaml if present    │
│     - Apply filters (scope, status)     │
└─────────────────────────────────────────┘
```

### 2. Session List (--all)

Displays a summary table:

```
┌──────────────────────┬────────┬──────────┬───────────┬──────────┬────────────┐
│ Session ID           │ Scope  │ Target   │ Status    │ Progress │ Date       │
├──────────────────────┼────────┼──────────┼───────────┼──────────┼────────────┤
│ REC-20260130-143022  │ story  │ US-001   │ completed │ 15/15    │ 2026-01-30 │
│ REC-20260131-091500  │ sprint │ Sprint-3 │ paused    │ 8/23     │ 2026-01-31 │
│ REC-20260201-140000  │ story  │ US-005   │ running   │ 3/10     │ 2026-02-01 │
└──────────────────────┴────────┴──────────┴───────────┴──────────┴────────────┘
```

### 3. Single Session Detail (--session=<id>)

Displays comprehensive session information:

```
Session: REC-20260130-143022
Status:  completed
Scope:   story → US-001
Started: 2026-01-30 14:30:22
Ended:   2026-01-30 14:45:10
Duration: 14m 48s

Tests:
  Total:   15
  Passed:  12  ████████████░░░  80%
  Failed:   2  ██░░░░░░░░░░░░░  13%
  Skipped:  1  █░░░░░░░░░░░░░░   7%

Errors:
  - ERR-001: Login form validation not displayed (visual)
  - ERR-002: API timeout on /api/users (api)

Regression Tests Generated: 3
Fix State: completed (2/2 bugs fixed)

Checkpoint:
  Last: TC-015 (step 3)
  Resumable: false (completed)
```

## Usage

| Mode / flag | What it does | Replaces |
|---|---|---|
| `/qa:status --all` / `--session=<id>` | List sessions or show one session in detail | — |
| `/qa:status --report --session=<id>` | Generate a Markdown/HTML/JSON report (`--format`, `--output`, `--include-screenshots`) | `/qa:status --report` |
| `/qa:status --report --session=<id> --compare=<id>` | Compare two sessions to detect regressions | `/qa:status --report --compare` |

## Report Mode (--report)

Generate detailed reports from session data. Multi-format output (Markdown, HTML, JSON), Golden Rule compliance section, screenshot embedding, AC-to-test traceability and pass/fail metrics. Without `--format`, the report is Markdown.

### Report Process

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Read .recette/sessions/{id}/      │
│     - Load state.yaml                   │
│     - Load fix-state.yaml if present    │
│     - Collect screenshots and logs      │
│     - Load regression registry          │
├─────────────────────────────────────────┤
│  2. generate_report(format)             │
│     - Build summary, test results,      │
│       error details, regression tests   │
│     - Build Golden Rule statement       │
│     - Apply format template             │
│     - Write to output path              │
└─────────────────────────────────────────┘
```

### Report Structure

```markdown
# QA Recette Report — REC-20260130-143022

## Summary
| Metric | Value |
|--------|-------|
| Session | REC-20260130-143022 |
| Scope | story → US-001 |
| Duration | 14m 48s |
| Passed / Failed / Skipped | 12 (80%) / 2 (13%) / 1 (7%) |

## Test Results
### Failed Tests (2)
- TC-008: Login validation error display ✗ (ERR-001)

## Error Details
### ERR-001: Login validation not displayed
- Type: visual · Severity: medium · Screenshot: screenshots/err-001.png

## Regression Tests Generated
| ID | Error | Test Type | Path |
|----|-------|-----------|------|
| REG-001 | ERR-001 | behat | features/auth/login_validation.feature |

## Golden Rule Compliance
All detected errors have generated regression tests.
Registry updated: .recette/regression/registry.yaml
```

### Comparison (--compare)

Compares two runs: metric deltas, resolved errors, new errors and Golden Rule violations.

```
## Comparison: REC-20260130-143022 vs REC-20260201-140000

| Metric | Session 1 | Session 2 | Delta |
|--------|-----------|-----------|-------|
| Passed | 12 | 14 | +2 |
| Failed | 2 | 0 | -2 |

### Resolved Errors / New Errors / Regression Status
```

### Report data sources

| Source | Path | Description |
|---|---|---|
| Registry | `.recette/regression/registry.yaml` | Regression test registry |
| Template | `Tools/Recette/templates/report.md.template` | Report template |

### Report errors

| Error | Solution |
|---|---|
| "Template not found" | Verify `Tools/Recette/templates/` exists |
| "Compare session not found" | Verify the comparison session ID |
| "No test results" | Session has no completed tests to report on |

### Report Examples

```bash
# Generate Markdown report (default)
/qa:status --report --session=REC-20260130-143022

# Generate HTML report with screenshots
/qa:status --report --session=REC-20260130-143022 --format=html --include-screenshots

# Generate JSON report for CI integration
/qa:status --report --session=REC-20260130-143022 --format=json

# Custom output path
/qa:status --report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Compare two sessions
/qa:status --report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

### Report Output Structure

```
.recette/reports/
├── REC-20260130-143022-report.md       # Markdown report
├── REC-20260130-143022-report.html     # HTML report (if --format=html)
├── REC-20260130-143022-report.json     # JSON report (if --format=json)
└── REC-20260201-vs-20260130-diff.md    # Comparison report (if --compare)
```

## Data Sources

| Source | Path | Description |
|--------|------|-------------|
| Session state | `.recette/sessions/{id}/state.yaml` | Session progress and test results |
| Fix state | `.recette/sessions/{id}/fix-state.yaml` | Bug fixing progress (if applicable) |
| Screenshots | `.recette/sessions/{id}/screenshots/` | Error screenshots |
| Logs | `.recette/sessions/{id}/logs/` | Detailed execution logs |

## Examples

```bash
# List all sessions
/qa:status --all

# Show detailed status for a specific session
/qa:status --session=REC-20260130-143022

# Filter running sessions
/qa:status --all --status=running

# Filter by scope
/qa:status --all --scope=sprint

# Live monitoring of a running session
/qa:status --session=REC-20260130-143022 --watch

# Output as YAML
/qa:status --session=REC-20260130-143022 --format=yaml

# Output as JSON (for scripting)
/qa:status --all --format=json
```

## Output Structure

```
.recette/
├── sessions/
│   ├── REC-20260130-143022/
│   │   ├── state.yaml          # Session state (read by this command)
│   │   ├── fix-state.yaml      # Fix progress (if recette-fix was run)
│   │   ├── screenshots/
│   │   ├── checkpoints/
│   │   └── logs/
│   └── REC-20260131-091500/
│       ├── state.yaml
│       └── ...
```

## Related Commands

| Command | Description |
|---------|-------------|
| `/qa:recette` | Execute acceptance tests |
| `/qa:fix` | Fix bugs from a recette session |
| `/qa:regression` | View regression test registry |
| `/qa:status --report` | Generate report (`--report`) |

## Error Messages

| Error | Solution |
|-------|----------|
| "No sessions found" | Run `/qa:recette` first to create a session |
| "Session not found" | Verify session ID in `.recette/sessions/` |
| "No sessions match filter" | Adjust filter criteria |

## Best Practices

1. **Use --all first**: Get an overview before diving into a specific session
2. **Monitor with --watch**: Use live mode for running sessions
3. **Check fix state**: Verify if bugs were fixed after running recette-fix
4. **Use JSON for automation**: Pipe JSON output to other tools
5. **Filter by status**: Focus on paused/failed sessions that need attention

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  If session has failures:                                ║
║  → /qa:fix                                               ║
║    Fix identified bugs                                   ║
║                                                          ║
║  If session is complete:                                 ║
║  → /qa:status --report                                   ║
║    Generate the recette report                           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
