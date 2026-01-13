---
description: Run Claude in continuous loop until task completion (Ralph Wiggum)
argument-hint: <task-description> [--auto|--full]
---

# Ralph Run - Continuous AI Agent Loop

Execute Claude in a continuous loop until the task is complete or the Definition of Done (DoD) criteria are met.

## Arguments

**$ARGUMENTS**

- `<task-description>`: The task for Claude to complete
- `--auto`: Maximum auto-detection, minimal questions
- `--full`: Comprehensive mode with all DoD checks

## Process

### 1. Session Initialization

1. **Check prerequisites**:
   - Verify Claude is available
   - Check for `ralph.yml` configuration
   - Initialize session directory (`.ralph/`)

2. **Load configuration**:
   - Read `ralph.yml` or `.claude/ralph.yml`
   - Set max iterations, timeouts, DoD criteria

### 2. Main Loop

```
┌─────────────────────────────────────────────────────────────┐
│  RALPH LOOP                                                  │
│                                                              │
│  while (iterations < max && !DoD_passed) {                   │
│      1. Check circuit breaker                                │
│      2. Invoke Claude with current prompt                    │
│      3. Process output                                       │
│      4. Validate Definition of Done                          │
│      5. Create checkpoint (git commit)                       │
│      6. If DoD not met, feed response as next prompt         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
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

Example DoD from `ralph.yml`:

```yaml
definition_of_done:
  checklist:
    - id: tests
      name: "All tests pass"
      type: command
      command: "docker compose exec app npm test"
      required: true

    - id: completion
      name: "Claude signals completion"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

### 4. Circuit Breaker

Safety mechanism to prevent infinite loops:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| No file changes | 3 iterations | Stop |
| Repeated errors | 5 iterations | Stop |
| Output decline | 70% | Stop |
| Max iterations | 25 (default) | Stop |

### 5. Checkpointing

Git checkpoints are created after each iteration for:
- **Recovery**: Restore to previous state if needed
- **History**: Track progress through iterations
- **Review**: Inspect what changed at each step

## Output

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Continuous AI Agent Loop              ║
╚════════════════════════════════════════════════════════════╝

✓ Session created: ralph-1704067200-a1b2

ℹ Starting Ralph loop...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration 1 of 25
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
  Total iterations:  3
  Duration:          45s
  DoD status:        PASSED
  Exit reason:       dod_complete
```

## Configuration

Create `ralph.yml` in your project root:

```yaml
version: "1.0"

session:
  max_iterations: 25
  timeout: 600000

circuit_breaker:
  enabled: true
  no_file_changes_threshold: 3

definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Best Practices

1. **Clear task description**: Provide specific, actionable tasks
2. **Configure DoD**: Define completion criteria in `ralph.yml`
3. **Use TDD**: Write tests first, let Ralph implement
4. **Monitor progress**: Watch iteration output for issues
5. **Set reasonable limits**: Adjust max_iterations for task complexity

## Related

- `@ralph-conductor` - Agent for Ralph orchestration
- `/common:fix-bug-tdd` - TDD-based bug fixing
- `/project:sprint-dev` - Sprint development with TDD
