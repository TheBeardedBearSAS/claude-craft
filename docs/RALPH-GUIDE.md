# Ralph Wiggum Guide

Complete guide to using Ralph Wiggum, Claude Craft's continuous AI agent loop.

---

## What is Ralph Wiggum?

Ralph Wiggum is a continuous execution system that runs Claude iteratively until a task is complete. Named after the Simpson's character known for his persistence, Ralph keeps working until:

- All Definition of Done (DoD) validators pass
- Maximum iterations reached
- Circuit breaker triggers

---

## Quick Start

### Basic Usage

```bash
# In Claude Code
/common:ralph-run "Implement user authentication"

# Or via CLI
npx @the-bearded-bear/claude-craft ralph "Implement user authentication"
```

### With Full DoD Checks

```bash
/common:ralph-run --full "Fix the login bug"
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     Ralph Wiggum Loop                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Load Task Description                                   │
│         │                                                   │
│         ▼                                                   │
│  2. Execute Claude (1 iteration)                            │
│         │                                                   │
│         ▼                                                   │
│  3. Run DoD Validators ─────────┐                           │
│         │                       │                           │
│         │ All Pass?             │ Any Fail?                 │
│         ▼                       ▼                           │
│  4a. SUCCESS ───────────  4b. Check Iteration Count         │
│      Return result              │                           │
│                                 │ < Max?                    │
│                                 ▼                           │
│                          Go to Step 2                       │
│                                                             │
│                                 │ >= Max?                   │
│                                 ▼                           │
│                          Circuit Breaker                    │
│                          Stop with partial                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration

### ralph.yml

Create a `ralph.yml` in your project root:

```yaml
# Ralph Wiggum Configuration
version: 1

# Maximum iterations before stopping
max_iterations: 10

# Circuit breaker settings
circuit_breaker:
  enabled: true
  # Number of consecutive failures before stopping
  threshold: 3
  # Profile: conservative, moderate, aggressive, learning, custom
  profile: moderate

# Git checkpointing
git:
  enabled: true
  # Create checkpoint commit after each iteration
  checkpoint: true
  # Prefix for checkpoint commits
  prefix: "[ralph]"

# Observability
observability:
  dashboard: true
  metrics:
    format: json  # json, prometheus
    path: .ralph/metrics.json
  health:
    enabled: true
    port: 9090

# Definition of Done validators
dod:
  - type: command
    name: "Tests pass"
    command: "npm test"
    expect_exit_code: 0

  - type: command
    name: "Lint passes"
    command: "npm run lint"
    expect_exit_code: 0

  - type: output_contains
    name: "Implementation complete"
    pattern: "✅ Done|Implementation complete"

  - type: file_changed
    name: "Source modified"
    path: "src/**/*.ts"

# Technology-specific DoD templates
technology: symfony  # symfony, flutter, react, python, etc.
```

---

## DoD Validators

### 1. Command Validator

Runs a shell command and checks the exit code.

```yaml
dod:
  - type: command
    name: "Tests pass"
    command: "npm test"
    expect_exit_code: 0
    timeout: 120000  # 2 minutes
```

**Use for:**
- Running tests
- Linting
- Type checking
- Build verification

---

### 2. Output Contains Validator

Checks if Claude's output contains a specific pattern.

```yaml
dod:
  - type: output_contains
    name: "Task marked complete"
    pattern: "✅ Done"
    case_sensitive: false
```

**Use for:**
- Completion markers
- Success messages
- Specific outputs

---

### 3. File Changed Validator

Verifies that specific files were modified.

```yaml
dod:
  - type: file_changed
    name: "Documentation updated"
    path: "docs/**/*.md"
    since: "last_iteration"  # or "start"
```

**Use for:**
- Ensuring code changes
- Documentation updates
- Config modifications

---

### 4. Hook Validator

Integrates with existing hook scripts.

```yaml
dod:
  - type: hook
    name: "Quality gate"
    script: ".claude/hooks/quality-gate.sh"
    args: ["--strict"]
```

**Use for:**
- Custom validation logic
- External tool integration
- Complex checks

---

### 5. Human Validator

Requires manual approval to continue.

```yaml
dod:
  - type: human
    name: "Manual review"
    prompt: "Does the implementation look correct?"
    options:
      - label: "Yes, continue"
        action: pass
      - label: "No, retry"
        action: fail
      - label: "Stop"
        action: stop
```

**Use for:**
- Critical changes
- UI/UX validation
- Final approval

---

## Technology Templates

Ralph includes pre-configured DoD templates for common technologies.

### Symfony

```yaml
technology: symfony

# Automatically includes:
# - PHPUnit tests
# - PHPStan analysis
# - PHP CS Fixer
# - Doctrine migrations check
```

### Flutter

```yaml
technology: flutter

# Automatically includes:
# - flutter test
# - flutter analyze
# - dart format check
```

### React

```yaml
technology: react

# Automatically includes:
# - npm test
# - eslint
# - typescript check
# - build verification
```

### Python

```yaml
technology: python

# Automatically includes:
# - pytest
# - mypy
# - black --check
# - ruff
```

---

## Circuit Breaker

The circuit breaker prevents infinite loops and wasted resources.

### Profiles

| Profile | Threshold | Behavior |
|---------|-----------|----------|
| `conservative` | 2 failures | Stop quickly |
| `moderate` | 3 failures | Balanced |
| `aggressive` | 5 failures | Keep trying |
| `learning` | Adaptive | Learns from patterns |
| `custom` | User-defined | Full control |

### Configuration

```yaml
circuit_breaker:
  enabled: true
  profile: moderate

  # Custom settings (when profile: custom)
  threshold: 3
  reset_after: 300  # seconds
  half_open_requests: 1
```

### States

1. **Closed** (normal) - All requests pass through
2. **Open** (tripped) - Requests blocked
3. **Half-Open** (testing) - Limited requests to test recovery

---

## Git Checkpointing

Ralph can create Git commits after each iteration for easy rollback.

```yaml
git:
  enabled: true
  checkpoint: true
  prefix: "[ralph]"
  branch: null  # Use current branch
```

### Recovery

```bash
# View Ralph commits
git log --oneline --grep="[ralph]"

# Rollback to before Ralph
git reset --hard HEAD~5  # Undo last 5 Ralph commits

# Cherry-pick specific iteration
git cherry-pick abc123
```

---

## Observability

### Dashboard

Enable real-time monitoring:

```yaml
observability:
  dashboard: true
```

View at: `http://localhost:9090/ralph`

### Metrics

```yaml
observability:
  metrics:
    format: json
    path: .ralph/metrics.json
```

**Exported metrics:**
- `ralph_iterations_total`
- `ralph_dod_pass_rate`
- `ralph_duration_seconds`
- `ralph_circuit_breaker_state`

### Health Check

```yaml
observability:
  health:
    enabled: true
    port: 9090
```

Endpoint: `http://localhost:9090/health`

---

## Advanced Usage

### TDD Mode

Combine Ralph with TDD phases:

```bash
/common:ralph-run --tdd "Implement user registration"
```

This enforces:
1. 🔴 Red - Write failing test first
2. 🟢 Green - Implement to pass
3. 🔵 Refactor - Clean up

### Batch Mode

Run Ralph on multiple tasks:

```bash
# Queue tasks
echo "Task 1: Add validation" >> .ralph/queue.txt
echo "Task 2: Add error handling" >> .ralph/queue.txt

# Process queue
npx @the-bearded-bear/claude-craft ralph --batch .ralph/queue.txt
```

### Interactive Mode

Get prompts between iterations:

```bash
/common:ralph-run --interactive "Refactor the payment module"
```

---

## Best Practices

### 1. Start with Simple DoD

Begin with basic validators:

```yaml
dod:
  - type: command
    command: "npm test"
    expect_exit_code: 0
```

Add more as needed.

### 2. Use Reasonable Iteration Limits

```yaml
# For bug fixes
max_iterations: 5

# For features
max_iterations: 10

# For complex refactoring
max_iterations: 15
```

### 3. Enable Git Checkpointing

Always enable for production work:

```yaml
git:
  enabled: true
  checkpoint: true
```

### 4. Monitor with Dashboard

Enable for long-running tasks:

```yaml
observability:
  dashboard: true
```

### 5. Use Technology Templates

Leverage pre-built DoD:

```yaml
technology: symfony  # Instead of custom validators
```

---

## Troubleshooting

### Ralph Never Completes

**Symptoms:** Keeps iterating without passing DoD

**Solutions:**

1. Check DoD validators are achievable:
   ```bash
   # Run manually
   npm test
   npm run lint
   ```

2. Reduce complexity of the task

3. Add `output_contains` validator for completion marker

### Circuit Breaker Trips Too Early

**Solutions:**

1. Switch to aggressive profile:
   ```yaml
   circuit_breaker:
     profile: aggressive
   ```

2. Increase threshold:
   ```yaml
   circuit_breaker:
     threshold: 5
   ```

### File Changed Validator Fails

**Solutions:**

1. Check path pattern:
   ```yaml
   path: "src/**/*.ts"  # Use glob patterns
   ```

2. Use correct `since`:
   ```yaml
   since: "start"  # Since Ralph started
   # or
   since: "last_iteration"  # Since last iteration
   ```

### Command Validator Timeout

**Solutions:**

1. Increase timeout:
   ```yaml
   timeout: 300000  # 5 minutes
   ```

2. Use Docker for isolation:
   ```yaml
   command: "docker compose exec app npm test"
   ```

---

## Example Configurations

### Bug Fix

```yaml
version: 1
max_iterations: 5
circuit_breaker:
  profile: conservative

dod:
  - type: command
    name: "Tests pass"
    command: "npm test"
    expect_exit_code: 0

  - type: output_contains
    name: "Bug fixed"
    pattern: "fix|Fixed|resolved"
```

### Feature Implementation

```yaml
version: 1
max_iterations: 10
circuit_breaker:
  profile: moderate

technology: react

dod:
  - type: command
    name: "Tests pass"
    command: "npm test"

  - type: command
    name: "Lint passes"
    command: "npm run lint"

  - type: file_changed
    name: "Component created"
    path: "src/components/**/*.tsx"

  - type: file_changed
    name: "Tests created"
    path: "src/components/**/*.test.tsx"
```

### Full TDD Cycle

```yaml
version: 1
max_iterations: 15
circuit_breaker:
  profile: aggressive

technology: symfony

git:
  enabled: true
  checkpoint: true
  prefix: "[ralph-tdd]"

dod:
  - type: command
    name: "PHPUnit"
    command: "docker compose exec app ./vendor/bin/phpunit"

  - type: command
    name: "PHPStan"
    command: "docker compose exec app ./vendor/bin/phpstan"

  - type: command
    name: "PHP CS Fixer"
    command: "docker compose exec app ./vendor/bin/php-cs-fixer fix --dry-run"

  - type: file_changed
    name: "Tests written"
    path: "tests/**/*.php"

  - type: output_contains
    name: "TDD complete"
    pattern: "🔵 Refactor.*complete|refactoring done"
```

---

## See Also

- [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md)
- [Commands Reference](COMMANDS.md)
- [Troubleshooting](TROUBLESHOOTING.md)
