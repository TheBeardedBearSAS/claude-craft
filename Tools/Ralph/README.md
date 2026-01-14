# Ralph Wiggum - Continuous AI Agent Loop

Ralph Wiggum is a methodology and tool for running Claude in a continuous loop until a task is complete. It provides structured completion detection through Definition of Done (DoD) validation, safety mechanisms via circuit breakers, and progress tracking through git checkpoints.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  RALPH LOOP                                                  │
│                                                              │
│  while (iterations < max && !complete) {                     │
│      response = claude("--continue", session_id, prompt)     │
│      complete = checkDoD(response)                           │
│      if (circuitBreaker.triggered()) break                   │
│      createCheckpoint(iteration)                             │
│      prompt = response  // feedback loop                     │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Via CLI

```bash
# Basic usage
npx @the-bearded-bear/claude-craft ralph "Implement user authentication"

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
./Tools/Ralph/ralph.sh --lang=fr --verbose "Corriger le bug de connexion"
```

## Configuration

Create `ralph.yml` in your project root or `.claude/ralph.yml`:

```yaml
version: "1.0"

session:
  max_iterations: 25
  timeout: 600000  # 10 minutes per iteration
  delay_between_iterations: 1000

circuit_breaker:
  enabled: true
  no_file_changes_threshold: 3
  repeated_error_threshold: 5
  output_decline_threshold: 70

checkpointing:
  enabled: true
  async: true
  branch_prefix: "ralph/"

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

## Reliability (v1.1.0)

Ralph v1.1.0 includes 59 reliability improvements for robust long-running sprints:

| Category | Fixes | Description |
|----------|-------|-------------|
| **Atomic Operations** | 12 | Temp-file-then-move pattern prevents file corruption |
| **File Locking** | 8 | mkdir-based locks for safe concurrent access |
| **Error Handling** | 15 | jq operations with fallback values |
| **Validation** | 10 | Numeric parameters, config values |
| **Module Guards** | 6 | Defensive checks for module dependencies |
| **Idempotence** | 5 | Safe to call functions multiple times |
| **Portable Random** | 3 | Fallback if xxd not installed |

## File Structure

```
Tools/Ralph/
├── ralph.sh                        # Main entry point
├── lib/
│   ├── utils.sh                    # Shared helper functions (locking, atomic ops)
│   ├── session.sh                  # Session management
│   ├── loop.sh                     # Core iteration loop
│   ├── dod-validator.sh            # DoD validation
│   ├── circuit-breaker.sh          # Safety mechanism
│   ├── checkpoint.sh               # Git checkpointing
│   ├── context-manager.sh          # Context limit handling
│   ├── sprint-progress.sh          # Sprint progress tracking
│   └── context-reconstruction.sh   # Context reconstruction
├── templates/
│   ├── ralph.yml.template          # Default configuration
│   └── sprint-progress.md.template # Sprint progress file template
└── README.md                       # This file

Tools/i18n/ralph/
├── en.sh                       # English messages
├── fr.sh                       # French messages
├── es.sh                       # Spanish messages
├── de.sh                       # German messages
└── pt.sh                       # Portuguese messages
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
│       └── last_output.txt     # Last Claude response
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
