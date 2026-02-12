---
description: Show QA Recette session status and progress
argument-hint: [--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>]
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
/qa:recette-status --all

# Show detailed status for a specific session
/qa:recette-status --session=REC-20260130-143022

# Filter running sessions
/qa:recette-status --all --status=running

# Filter by scope
/qa:recette-status --all --scope=sprint

# Live monitoring of a running session
/qa:recette-status --session=REC-20260130-143022 --watch

# Output as YAML
/qa:recette-status --session=REC-20260130-143022 --format=yaml

# Output as JSON (for scripting)
/qa:recette-status --all --format=json
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
| `/qa:recette-fix` | Fix bugs from a recette session |
| `/qa:recette-regression` | View regression test registry |
| `/qa:recette-report` | Generate report |

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
