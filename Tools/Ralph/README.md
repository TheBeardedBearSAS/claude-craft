# Ralph Wiggum v2.0 - Continuous AI Agent Loop

Ralph Wiggum is a methodology and tool for running Claude in a continuous loop until a task is complete. It provides structured completion detection through Definition of Done (DoD) validation, safety mechanisms via adaptive circuit breakers, and progress tracking through git checkpoints.

**v2.0 Features:**
- 🔌 **Claude Code 2.1.23+ Hooks** - Bidirectional integration
- 🔍 **Auto-Detection** - Intelligent project type detection
- 📊 **Observability** - Real-time dashboard, metrics, health monitoring
- 🎚️ **Adaptive Circuit Breaker** - Profile-based thresholds with learning

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  RALPH LOOP v2.0                                             │
│                                                              │
│  profile = detectProfile(prompt)  // v2.0 adaptive           │
│  project = autoDetect()           // v2.0 auto-detection     │
│                                                              │
│  while (iterations < max && !complete) {                     │
│      renderDashboard()            // v2.0 real-time          │
│      response = claude("--continue", session_id, prompt)     │
│      complete = checkDoD(response)                           │
│      checkHealth()                // v2.0 health monitor     │
│      if (circuitBreaker.triggered()) break                   │
│      createCheckpoint(iteration)                             │
│      exportMetrics()              // v2.0 observability      │
│      prompt = response  // feedback loop                     │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Via CLI

```bash
# Basic usage
npx @the-bearded-bear/claude-craft ralph "Implement user authentication"

# With auto-detection (v2.0)
npx @the-bearded-bear/claude-craft ralph --auto-detect "Implement user authentication"

# Interactive configuration (v2.0)
npx @the-bearded-bear/claude-craft ralph --interactive "Fix the login bug"

# Generate config only (v2.0)
npx @the-bearded-bear/claude-craft ralph --init "Fix the login bug"

# With configuration
npx @the-bearded-bear/claude-craft ralph --config=ralph.yml "Fix the login bug"

# Resume session
npx @the-bearded-bear/claude-craft ralph --continue=ralph-1704067200-a1b2
```

### Via Command in Claude Code

```bash
/common:ralph-run "Implement user authentication"
```

### Direct Script

```bash
./Tools/Ralph/ralph.sh "Implement user authentication"
./Tools/Ralph/ralph.sh --auto-detect "Implement user authentication"
./Tools/Ralph/ralph.sh --lang=fr --verbose "Corriger le bug de connexion"
```

## Configuration

Create `ralph.yml` in your project root or `.claude/ralph.yml`:

```yaml
version: "2.0"

session:
  max_iterations: 25
  timeout: 600000  # 10 minutes per iteration
  delay_between_iterations: 1000

# v2.0: Adaptive Circuit Breaker
circuit_breaker:
  enabled: true
  adaptive: true  # Enable profile-based thresholds
  default_profile: "medium_feature"
  learning:
    enabled: true
    min_samples: 5
  # Legacy static thresholds (used when adaptive: false)
  no_file_changes_threshold: 3
  repeated_error_threshold: 5
  output_decline_threshold: 70

checkpointing:
  enabled: true
  async: true
  branch_prefix: "ralph/"

# v2.0: Claude Code Hooks
hooks:
  enabled: true
  mode: "advanced"  # simple or advanced

# v2.0: Auto-detection
auto_detect:
  enabled: true
  interactive: false

# v2.0: Metrics & Dashboard
metrics:
  enabled: true
  format: "both"  # json, prometheus, both
  realtime:
    enabled: true
    interval_ms: 1000

dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# v2.0: Health Monitoring
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true

definition_of_done:
  checklist:
    - id: tests
      name: "All tests pass"
      type: command
      command: "docker compose exec app npm test"
      required: true

    - id: lint
      name: "No lint errors"
      type: command
      command: "docker compose exec app npm run lint"
      required: true

    - id: completion
      name: "Claude signals completion"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Definition of Done (DoD)

The key improvement over simple completion markers. DoD validates task completion through multiple criteria:

### Validator Types

| Type | Description | Example |
|------|-------------|---------|
| `command` | Run shell command, check exit code | `npm test` |
| `output_contains` | Check Claude output for pattern | `<promise>COMPLETE</promise>` |
| `file_changed` | Check if files matching pattern changed | `*.md` |
| `hook` | Run existing Claude hook script | `quality-gate.sh` |
| `human` | Prompt user for confirmation | Interactive gate |

### Example Checklist

```yaml
definition_of_done:
  checklist:
    # Automated tests
    - id: tests
      name: "All tests pass"
      type: command
      command: "docker compose exec app npm test"
      required: true

    # Code quality
    - id: lint
      name: "No lint errors"
      type: command
      command: "docker compose exec app npm run lint"
      required: true

    # Completion signal
    - id: completion
      name: "Claude signals completion"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true

    # Integration with existing hooks
    - id: quality_gate
      name: "Quality gate passes"
      type: hook
      script: ".claude/hooks/quality-gate.sh"
      required: true

    # Documentation (optional)
    - id: docs
      name: "Documentation updated"
      type: file_changed
      pattern: "*.md"
      required: false

    # Human approval (optional)
    - id: review
      name: "Manual review approved"
      type: human
      prompt: "Does the implementation look correct? (y/n):"
      required: false
```

## Circuit Breaker

Safety mechanism to prevent infinite loops:

| Trigger | Default Threshold | Description |
|---------|-------------------|-------------|
| No file changes | 3 iterations | Stops if no files modified |
| Repeated errors | 5 iterations | Stops on error loops |
| Output decline | 70% | Stops if output shrinks significantly |
| Max iterations | 25 | Hard limit |

### Adaptive Profiles (v2.0)

Ralph v2.0 introduces adaptive circuit breaker profiles that adjust thresholds based on task complexity:

| Profile | Keywords | no_changes | errors | max_iterations |
|---------|----------|------------|--------|----------------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

The profile is automatically detected from the prompt keywords.

### Learning Mode (v2.0)

When learning is enabled, Ralph adjusts thresholds based on historical outcomes:
- Stores session history in `.ralph/history/circuit-breaker-history.json`
- Requires minimum 5 samples before making adjustments
- Tightens thresholds for profiles with high failure rates
- Relaxes thresholds for profiles with consistent successes

## Auto-Detection (v2.0)

Ralph can automatically detect your project type and load appropriate DoD templates:

| Technology | Detection | Confidence |
|------------|-----------|------------|
| Symfony | `composer.json` + symfony/framework-bundle | HIGH |
| Laravel | `composer.json` + laravel/framework | HIGH |
| Flutter | `pubspec.yaml` | HIGH |
| React | `package.json` + react dependency | HIGH |
| Vue | `package.json` + vue dependency | HIGH |
| Angular | `angular.json` | HIGH |
| Next.js | `package.json` + next dependency | HIGH |
| .NET | `*.csproj` or `*.sln` | HIGH |
| Python | `pyproject.toml` or `requirements.txt` | MEDIUM |
| Go | `go.mod` | HIGH |
| Rust | `Cargo.toml` | HIGH |

Usage:

```bash
# Auto-detect and apply template
ralph.sh --auto-detect "Implement user authentication"

# Generate config from detection (dry run)
ralph.sh --init "Implement user authentication"

# Interactive mode with confirmations
ralph.sh --interactive "Implement user authentication"
```

## Claude Code Hooks Integration (v2.0)

Ralph integrates with Claude Code 2.1.23+ hooks for bidirectional communication:

### Hook Types

| Hook | Trigger | Purpose |
|------|---------|---------|
| `SessionStart` | Session begins | Inject Ralph context |
| `PreToolUse` (once) | Before first tool | Inject DoD status |
| `Stop` | Session end | Gate on DoD satisfaction |

### Exit Codes

| Code | Meaning | Behavior |
|------|---------|----------|
| 0 | Allow | Proceed normally |
| 2 | Block | Prevent action (Stop only) |

### Hook Files

```
.ralph/hooks/
├── session-restore.sh     # SessionStart - injects Ralph context
├── status-injector.sh     # PreToolUse - injects DoD status
├── pre-tool-context.sh    # PreToolUse - tool-specific context
└── stop-dod-gate.sh       # Stop - blocks if DoD not satisfied
```

Configuration:

```yaml
hooks:
  enabled: true
  mode: "advanced"  # simple or advanced
```

## Dashboard & Metrics (v2.0)

### Real-time Dashboard

Ralph displays a real-time terminal dashboard during execution:

```
╔═══════════════════════════════════════════════════════════════╗
║  RALPH WIGGUM v2.0 - Session: ralph-xxx      PHASE: GREEN     ║
╠═══════════════════════════════════════════════════════════════╣
║  ITERATION 8/25              ELAPSED: 12:34                   ║
║  PROGRESS ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%  ║
║                                                               ║
║  Circuit Breaker: ░░ (0/4)    Context: ████████░░ 78%        ║
╚═══════════════════════════════════════════════════════════════╝
```

Configuration:

```yaml
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless
```

### Metrics Export

Ralph exports session metrics in JSON and Prometheus formats:

**JSON format** (`.ralph/sessions/<id>/metrics-export.json`):

```json
{
  "session": { "id": "...", "duration_seconds": 2700, "status": "completed" },
  "iterations": { "total": 15, "successful": 14, "average_duration_ms": 42000 },
  "circuit_breaker": { "triggered": false, "peak_no_progress_streak": 1 },
  "context": { "compacts_performed": 2, "peak_usage_percent": 87 },
  "dod": { "passed": true, "checks_performed": 15 },
  "performance": { "p95_response_time_ms": 55000 }
}
```

**Prometheus format** (`.ralph/sessions/<id>/metrics.prom`):

```prometheus
ralph_session_duration_seconds 2700
ralph_iterations_total 15
ralph_iterations_successful 14
ralph_dod_passed 1
```

Configuration:

```yaml
metrics:
  enabled: true
  format: "both"  # json, prometheus, both
  realtime:
    enabled: true
    interval_ms: 1000
```

## Health Monitoring (v2.0)

Ralph monitors session health and detects degradation patterns:

| Pattern | Description | Action |
|---------|-------------|--------|
| Stall Detection | No progress for N iterations | Warning + recommendation |
| Error Spiral | Increasing error rate | Early circuit breaker |
| Context Bloat | High context usage | Recommend compact |

Configuration:

```yaml
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true
```

## DoD Templates (v2.0)

Ralph includes pre-configured DoD templates for common technologies:

| Technology | Test Framework | Lint Tool |
|------------|----------------|-----------|
| Symfony | PHPUnit | PHPStan |
| Flutter | flutter_test | flutter_lints |
| React | Jest/Vitest | ESLint |
| Python | pytest | ruff |
| .NET | xUnit | Analyzers |
| Go | go test | golangci-lint |
| Rust | cargo test | clippy |

Templates are located in `Tools/Ralph/templates/dod/` and automatically applied when using `--auto-detect`.

## Context Management

Ralph includes advanced context management to handle long-running sprints without interruption.

### Auto-Compact

When Claude's context limit is reached, Ralph automatically:
1. Saves sprint progress to `.ralph/sprint-progress.md`
2. Runs `/compact` to compress conversation history
3. Reconstructs context from progress file
4. Continues the task

### Strategic Compact (Recommended)

Rather than waiting for context limits, Ralph can compact at natural workflow boundaries:

```
SPRINT START --> compact (clean slate)
|
+-- TASK: RED --> GREEN --> REFACTOR
|   +-- compact after REFACTOR (task complete)
|
+-- TASK: RED --> GREEN --> REFACTOR
|   +-- compact after REFACTOR
|
+-- US COMPLETE --> checkpoint (+ optional compact)
```

Configuration:

```yaml
sprint:
  # Compact at sprint start for clean context
  compact_on_start: true

  # Compact after each task completes (REFACTOR -> IDLE transition)
  # This is the MOST IMPORTANT strategic compact point
  compact_on_task_complete: true

  # Compact after US completes (optional)
  compact_on_us_complete: false
```

### Overflow Strategy

When max compacts (default: 3) is reached:

| Strategy | Behavior |
|----------|----------|
| `new_session` | Create continuation session (recommended) |
| `extend` | Increase max_compacts by 2 |
| `fail` | Stop execution |

```yaml
context:
  auto_compact: true
  max_compacts: 3
  overflow_strategy: "new_session"
  preventive_threshold: 90  # Fallback safety net
  smart_reconstruction: true
  max_continuation_sessions: 5
```

### Sprint Progress File

Ralph maintains `.ralph/sprint-progress.md` to track:
- Current sprint and US
- Current task and TDD phase
- Completed tasks
- Key architectural decisions
- Modified files
- Test status

This file survives context compacts and enables seamless continuation.

## Git Checkpointing

Automatic git commits after each iteration:

- **Recovery**: Restore to previous state if needed
- **History**: Track progress through iterations
- **Review**: Inspect what changed at each step

Configuration:

```yaml
checkpointing:
  enabled: true
  async: true  # Non-blocking
  branch_prefix: "ralph/"
  commit_message_template: "checkpoint: Ralph iteration {iteration}"
```

## Reliability

Ralph includes 59+ reliability improvements for robust long-running sprints:

| Category | Fixes | Description |
|----------|-------|-------------|
| **Atomic Operations** | 12 | Temp-file-then-move pattern prevents file corruption |
| **File Locking** | 8 | mkdir-based locks for safe concurrent access |
| **Error Handling** | 15 | jq operations with fallback values |
| **Validation** | 10 | Numeric parameters, config values |
| **Module Guards** | 6 | Defensive checks for module dependencies |
| **Idempotence** | 5 | Safe to call functions multiple times |
| **Portable Random** | 3 | Fallback if xxd not installed |

**v2.0 additions:**
- Health monitoring with pattern detection
- Adaptive circuit breaker with learning
- Metrics export for external monitoring

## File Structure

```
Tools/Ralph/
├── ralph.sh                        # Main entry point (v2.0)
├── lib/
│   ├── utils.sh                    # Shared helper functions (locking, atomic ops)
│   ├── session.sh                  # Session management (v2.0: hooks export)
│   ├── loop.sh                     # Core iteration loop
│   ├── dod-validator.sh            # DoD validation (v2.0: hook exit codes)
│   ├── circuit-breaker.sh          # Safety mechanism (v2.0: adaptive profiles)
│   ├── checkpoint.sh               # Git checkpointing
│   ├── context-manager.sh          # Context limit handling
│   ├── sprint-progress.sh          # Sprint progress tracking
│   ├── context-reconstruction.sh   # Context reconstruction
│   ├── metrics-exporter.sh         # v2.0: Metrics JSON/Prometheus export
│   ├── project-detector.sh         # v2.0: Auto-detection
│   ├── dod-templates.sh            # v2.0: DoD template loading
│   ├── config-generator.sh         # v2.0: Config generation
│   ├── dashboard.sh                # v2.0: Real-time terminal dashboard
│   ├── health-monitor.sh           # v2.0: Degradation pattern detection
│   └── hooks-generator.sh          # v2.0: Claude Code hooks config
├── .ralph/hooks/
│   ├── session-restore.sh          # v2.0: SessionStart hook
│   ├── status-injector.sh          # v2.0: PreToolUse hook
│   ├── pre-tool-context.sh         # v2.0: PreToolUse context hook
│   └── stop-dod-gate.sh            # v2.0: Stop gate hook
├── templates/
│   ├── ralph.yml.template          # Default configuration (v2.0)
│   ├── sprint-progress.md.template # Sprint progress file template
│   └── dod/                        # v2.0: DoD templates by technology
│       ├── symfony.yml
│       ├── flutter.yml
│       ├── react.yml
│       ├── python.yml
│       ├── dotnet.yml
│       ├── go.yml
│       ├── rust.yml
│       └── generic.yml
└── README.md                       # This file

Tools/i18n/ralph/
├── en.sh                       # English messages (v2.0)
├── fr.sh                       # French messages (v2.0)
├── es.sh                       # Spanish messages (v2.0)
├── de.sh                       # German messages (v2.0)
└── pt.sh                       # Portuguese messages (v2.0)
```

## CLI Options

```
ralph.sh [options] <prompt>

Options:
  --config=<file>       Path to ralph.yml configuration
  --continue=<id>       Resume existing session
  --max-iterations=<n>  Maximum iterations (default: 25)
  --timeout=<ms>        Timeout per iteration (default: 600000)
  --verbose             Enable verbose output
  --dry-run             Show what would be done without executing
  --lang=<code>         Language (en, fr, es, de, pt)
  --help                Show help message

v2.0 Options:
  --auto-detect         Auto-detect project type and load DoD template
  --init                Generate ralph.yml from detection without running
  --interactive         Interactive mode with confirmations
```

## Integration

### With Existing Hooks

Ralph can leverage existing Claude hooks:

```yaml
definition_of_done:
  checklist:
    - id: quality_gate
      type: hook
      script: ".claude/hooks/quality-gate.sh"
      required: true
```

### With Sprint Development

```bash
# In sprint workflow
/project:sprint-dev 1
# Ralph handles each task until DoD passes
```

### With TDD Coach

Ralph follows TDD principles:
1. Write failing test (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor while keeping tests green (REFACTOR)

## Session Files

Ralph creates a `.ralph/` directory in your project:

```
.ralph/
├── sessions/
│   └── ralph-1704067200-a1b2/
│       ├── state.json          # Session state
│       ├── metrics.json        # Iteration metrics
│       ├── session.log         # Execution log
│       ├── last_output.txt     # Last Claude response
│       ├── metrics-export.json # v2.0: Exported metrics (JSON)
│       ├── metrics.prom        # v2.0: Exported metrics (Prometheus)
│       └── health-status.json  # v2.0: Health monitoring status
├── hooks/                      # v2.0: Hook scripts
│   ├── session-restore.sh
│   ├── status-injector.sh
│   ├── pre-tool-context.sh
│   └── stop-dod-gate.sh
└── history/                    # v2.0: Learning data
    └── circuit-breaker-history.json
```

## Best Practices

1. **Clear task description**: Provide specific, actionable tasks
2. **Configure DoD**: Define completion criteria in `ralph.yml`
3. **Use TDD**: Write tests first, let Ralph implement
4. **Monitor progress**: Watch iteration output for issues
5. **Set reasonable limits**: Adjust max_iterations for task complexity
6. **Use Docker**: Run commands in Docker for consistency

## Troubleshooting

### Ralph stops immediately
- Check if prompt is provided
- Verify `ralph.yml` is valid YAML

### Circuit breaker triggers too early
- Increase thresholds in configuration
- Check if task is making actual progress

### DoD never passes
- Verify commands work manually
- Check required vs optional criteria
- Ensure completion marker is output by Claude

## Related

- `/common:ralph-run` - Command to start Ralph from Claude Code
- `@ralph-conductor` - Agent for Ralph orchestration
- `/common:fix-bug-tdd` - TDD-based bug fixing
- `/project:sprint-dev` - Sprint development with TDD

## Credits

The "Ralph Wiggum" technique was created by Geoffrey Huntley. This implementation is inspired by:

- [ghuntley/how-to-ralph-wiggum](https://github.com/ghuntley/how-to-ralph-wiggum) - Original technique by Geoffrey Huntley
- [anthropics/claude-code/plugins/ralph-wiggum](https://github.com/anthropics/claude-code) - Official Claude Code plugin
- [frankbria/ralph-claude-code](https://github.com/frankbria/ralph-claude-code)
- [mikeyobrien/ralph-orchestrator](https://github.com/mikeyobrien/ralph-orchestrator)
