---
description: Run Claude in continuous loop until task completion (Ralph Wiggum v2.0)
argument-hint: <task-description> [--auto-detect|--init|--interactive]
---

# Ralph Run - Continuous AI Agent Loop v2.0

Execute Claude in a continuous loop until the task is complete or the Definition of Done (DoD) criteria are met.

## Arguments

**$ARGUMENTS**

- `<task-description>`: The task for Claude to complete
- `--auto-detect`: Auto-detect project type and configure DoD
- `--init`: Generate configuration without running
- `--interactive`: Interactive configuration wizard

## v2.0 New Features

| Feature | Description |
|---------|-------------|
| **Hooks Integration** | Bidirectional integration with Claude Code 2.1.23+ |
| **Auto-Detection** | Automatic project type detection (Symfony, Flutter, React, etc.) |
| **Dashboard** | Real-time terminal display with progress bar |
| **Metrics Export** | JSON and Prometheus format metrics |
| **Adaptive Circuit Breaker** | 5 profiles with learning from history |
| **Health Monitor** | Stall, error spiral, and context bloat detection |
| **DoD Templates** | Pre-configured templates for 8 technologies |

## Process

### 1. Session Initialization

1. **Check prerequisites**:
   - Verify Claude is available
   - Check for `ralph.yml` configuration
   - Initialize session directory (`.ralph/`)

2. **Auto-detect project** (if `--auto-detect`):
   - Detect project type (Symfony, Flutter, React, Python, .NET, Go, Rust)
   - Load appropriate DoD template
   - Configure test and lint commands

3. **Load configuration**:
   - Read `ralph.yml` or `.claude/ralph.yml`
   - Set max iterations, timeouts, DoD criteria
   - Initialize hooks if enabled

### 2. Main Loop with Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║  RALPH WIGGUM - Session: ralph-xxx           PHASE: GREEN     ║
╠═══════════════════════════════════════════════════════════════╣
║  ITERATION 8/25              ELAPSED: 12:34                   ║
║  PROGRESS ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%  ║
║                                                               ║
║  Circuit Breaker: ░░ (0/4)    Context: ████████░░ 78%        ║
╚═══════════════════════════════════════════════════════════════╝
```

### 3. Definition of Done Validation

The DoD system validates completion through multiple criteria:

| Validator | Description |
|-----------|-------------|
| `command` | Run shell command (tests, lint, build) |
| `output_contains` | Check for pattern in Claude output |
| `file_changed` | Verify files were modified |
| `hook` | Run existing Claude hook |
| `human` | Interactive human validation |

### 4. Adaptive Circuit Breaker (v2.0)

Automatically selects profile based on task keywords:

| Profile | Keywords | No Changes | Errors | Max Iter |
|---------|----------|------------|--------|----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

### 5. Hooks Integration (Claude Code 2.1.23+)

```
SessionStart → session-restore.sh → Inject Ralph context
     ↓
PreToolUse (once) → status-injector.sh → Inject DoD status
     ↓
Claude works...
     ↓
Stop → stop-dod-gate.sh → Block if DoD not satisfied (exit 2)
```

## Quick Start Examples

```bash
# Basic usage
ralph.sh "Implement user authentication"

# Auto-detect project and generate config
ralph.sh --auto-detect --init

# Interactive configuration wizard
ralph.sh --interactive

# With configuration file
ralph.sh --config=ralph.yml "Fix the login bug"

# Resume session
ralph.sh --continue=ralph-1704067200-a1b2
```

## Configuration (v2.0)

```yaml
version: "2.0"

# Hooks integration
hooks:
  enabled: true
  mode: "advanced"  # simple or advanced

# Auto-detection
auto_detect:
  enabled: true
  interactive: false

# Real-time dashboard
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# Metrics export
metrics:
  enabled: true
  format: "both"  # json, prometheus, both

# Health monitoring
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true

# Adaptive circuit breaker
circuit_breaker:
  adaptive: true
  default_profile: "medium_feature"
  learning:
    enabled: true
    min_samples: 5

# Definition of Done
definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "docker compose exec app npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## DoD Templates by Technology

| Technology | Test Command | Lint Command |
|------------|--------------|--------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Output

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Continuous AI Agent Loop v2.0        ║
╚════════════════════════════════════════════════════════════╝

✓ Detected: react-typescript (HIGH confidence)
✓ Session created: ralph-1704067200-a1b2
✓ Hooks initialized (advanced mode)

ℹ Starting Ralph loop...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration 1 of 25 (Profile: medium_feature)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Invoking Claude...
ℹ Checking DoD criteria...
  ✓ [tests] All tests pass - PASS
  ✓ [lint] No lint errors - PASS
  ✓ [completion] Claude signals completion - PASS

  All required criteria passed!

✓ DoD PASSED

╔════════════════════════════════════════════════════════════╗
║     📊 Session Summary                                      ║
╚════════════════════════════════════════════════════════════╝

  Session ID:        ralph-1704067200-a1b2
  Profile:           medium_feature
  Total iterations:  3
  Duration:          45s
  DoD status:        PASSED
  Exit reason:       dod_complete
  Metrics exported:  .ralph/sessions/.../metrics-export.json
```

## Best Practices

1. **Use auto-detect**: Let Ralph configure DoD for your stack
2. **Clear task description**: Provide specific, actionable tasks
3. **Use TDD**: Write tests first, let Ralph implement
4. **Monitor dashboard**: Watch progress in real-time
5. **Review metrics**: Analyze session metrics for optimization

## Related

- `@ralph-conductor` - Agent for Ralph orchestration
- `/common:fix-bug-tdd` - TDD-based bug fixing
- `/project:sprint-dev` - Sprint development with TDD
