# Autonomous Sprint Conductor (ASC)

The Autonomous Sprint Conductor (ASC) enables overnight/unattended sprint execution with minimal human intervention. It orchestrates story processing, handles error recovery, manages escalations, and supports parallel execution.

## Overview

The ASC addresses common friction points in continuous AI development:

| Problem | Solution |
|---------|----------|
| Circuit breaker stops require manual restart | Recovery engine attempts auto-fix before trip |
| Manual story claiming | Auto-claim next ready-for-dev story |
| Quality gates block without retry | Auto-retry with intelligent backoff |
| No autonomous TDD progression | Detect and auto-transition TDD phases |
| Limited parallelization | Dependency-aware parallel execution |
| No error recovery | 4-level error classification with auto-fix |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTONOMOUS SPRINT CONDUCTOR (ASC)                   │
│                  sprint-conductor.sh                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ Orchestration │      │   Recovery    │      │ Parallelization│
│  Controller   │      │    Engine     │      │    Manager     │
│               │      │               │      │                │
│ - Auto-claim  │      │ - Error class │      │ - Dependency   │
│ - Progress    │      │ - Auto-fix    │      │   graph        │
│ - Transitions │      │ - Escalation  │      │ - Multi-session│
└───────────────┘      └───────────────┘      └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ Enhanced      │      │   Quality     │      │  Escalation   │
│ Ralph Loop    │      │   Gates       │      │   Service     │
│               │      │               │      │               │
│ - Smart CB    │      │ - Auto-retry  │      │ - Notifications│
│ - Auto TDD    │      │ - Auto-fix    │      │ - Decision Q  │
│ - Recovery    │      │ - Bypass opt. │      │ - Timeout     │
└───────────────┘      └───────────────┘      └───────────────┘
```

## Quick Start

### Basic Overnight Run

```bash
# Run a sprint overnight (stops at 6am)
/common:ralph-sprint "Sprint 3" --overnight
```

### Supervised Mode (Recommended for First Run)

```bash
# Pause before each story for confirmation
/common:ralph-sprint "Sprint 3" --supervised
```

### Parallel Processing

```bash
# Process up to 3 stories in parallel
/common:ralph-sprint "Sprint 3" --parallel 3 --overnight
```

### Limited Run

```bash
# Process max 5 stories in 4 hours
/common:ralph-sprint "Sprint 3" --max-stories 5 --timeout 4
```

## Components

### 1. Recovery Engine

Located at `Tools/Ralph/lib/recovery-engine.sh`

Classifies errors into 4 levels and applies appropriate recovery strategies:

| Level | Type | Action | Examples |
|-------|------|--------|----------|
| 0 | **Transient** | Auto-retry with exponential backoff | Timeout, rate limit, network errors |
| 1 | **Recoverable** | Auto-fix then retry | Lint errors, test failures, missing deps |
| 2 | **Degraded** | Continue with warning | Documentation incomplete, optional gates |
| 3 | **Blocked** | Escalate to human | Security vulnerabilities, architecture violations |

**Auto-fix strategies:**

- **Lint errors**: Run `npm run lint:fix`, `php-cs-fixer fix`, `black .`
- **Test failures**: Extract failing tests, retry with TDD focus
- **Missing dependencies**: Run `npm install`, `composer install`, `pip install`
- **Syntax/type errors**: Request Claude to fix specific error

### 2. Escalation Service

Located at `Tools/Ralph/lib/escalation-service.sh`

Manages issues that require human decision:

```yaml
# .ralph/escalations/queue/ESC-xxx.yaml
id: "ESC-1704067200-123"
level: "blocked"
error_type: "security"
priority: "critical"
timeout_at: "2024-01-02T10:00:00Z"
default_action: "pause"
details: |
  Security vulnerability detected in authentication module
```

**Resolution options:**
- `proceed` - Continue despite the issue
- `skip` - Skip this story and move on
- `retry` - Retry the failed operation
- `abort` - Stop the entire sprint

**Webhook notifications** (Slack, Teams, Discord):

```yaml
escalation:
  webhook:
    url: "https://hooks.slack.com/services/xxx"
    type: "slack"
  notify_on_create: true
```

### 3. Sprint Conductor

Located at `Tools/Ralph/lib/sprint-conductor.sh`

Main orchestrator that:

1. Initializes autonomous mode
2. Claims stories automatically
3. Spawns Ralph sessions for each story
4. Handles success/failure/escalation outcomes
5. Manages stop conditions
6. Creates checkpoints for recovery

### 4. Parallel Manager

Located at `Tools/Ralph/lib/parallel-manager.sh`

Enables concurrent story processing:

- Builds dependency graph from stories
- Spawns isolated Ralph sessions
- Limits concurrent sessions (default: 3)
- Monitors resource usage (CPU, memory)
- Aggregates results

## Configuration

Create `Tools/Ralph/config/ralph-autonomous.yml` or add to your `ralph.yml`:

```yaml
autonomous:
  enabled: true
  mode: "bounded"  # bounded, continuous, supervised

  schedule:
    stop_window: "06:00"          # Stop at 6am (for overnight)
    max_runtime_hours: 12         # Maximum runtime

  limits:
    max_stories_per_session: 10   # Stories per session
    max_consecutive_failures: 3   # Stop after N failures

  parallel:
    enabled: false
    max_concurrent: 3
    resource_limits:
      cpu_percent: 80
      mem_percent: 80

recovery:
  enabled: true
  max_attempts: 3
  auto_retry_transient: true
  auto_fix_lint: true
  auto_fix_tests: "retry_tdd"    # retry_tdd, skip, false

escalation:
  enabled: true
  timeout_hours: 4
  default_action: "skip"         # skip, proceed, retry, abort
  critical_action: "pause"
  webhook:
    url: ""
    type: "slack"

circuit_breaker:
  adaptive: true
  default_profile: "autonomous"
  profiles:
    autonomous:
      no_changes: 5
      errors: 8
      max_iterations: 50
      recovery_enabled: true
```

## Stop Conditions

The conductor stops when any condition is met:

| Condition | Default | Environment Variable |
|-----------|---------|---------------------|
| Max stories processed | 10 | `ASC_MAX_STORIES` |
| Consecutive failures | 3 | `ASC_MAX_CONSECUTIVE_FAILURES` |
| Runtime exceeded | 12 hours | `ASC_MAX_RUNTIME_HOURS` |
| Stop window reached | 06:00 | `ASC_STOP_WINDOW` |
| Critical escalation pending | N/A | - |

## Monitoring

### Session State

```bash
# View current state
cat .ralph/conductor/state-ASC-*.yaml
```

### Escalation Queue

```bash
# List pending escalations
ls .ralph/escalations/queue/

# Resolve an escalation
./Tools/Ralph/lib/escalation-service.sh resolve ESC-xxx proceed "Approved by team"
```

### Metrics

```bash
# View session metrics
cat .ralph/conductor/metrics-ASC-*.json
```

Output:
```json
{
    "session_id": "ASC-20240101-120000-12345",
    "duration_seconds": 15780,
    "stories": {
        "completed": 7,
        "failed": 1,
        "skipped": 2,
        "total": 10
    },
    "success_rate": 0.70,
    "interventions": 2
}
```

## Integration with BMAD

The ASC integrates with BMAD v6 workflow:

1. **Story Status**: Uses `.bmad/sprint-status.yaml`
2. **Routing Engine**: Auto-transitions via `routing-engine.sh`
3. **Quality Gates**: Respects gate validations
4. **Batch Executor**: Uses `batch-executor.sh` for queue management

## Troubleshooting

### Sprint Doesn't Start

1. Check `.bmad/sprint-status.yaml` exists
2. Verify stories have `ready-for-dev` status
3. Check `yq` is installed

### Stories Fail Immediately

1. Check error classification in `.ralph/recovery/recovery-log.jsonl`
2. Review auto-fix strategies for your stack
3. Ensure test/lint commands are correct

### Too Many Escalations

1. Adjust error patterns in config
2. Increase `recovery.max_attempts`
3. Review blocked patterns - maybe too aggressive

### Parallel Sessions Overwhelm System

1. Reduce `parallel.max_concurrent`
2. Adjust `resource_limits` thresholds
3. Ensure adequate system resources

### Escalations Not Resolving

1. Check timeout configuration
2. Review webhook URL if using notifications
3. Check `.ralph/escalations/audit.jsonl` for history

## Success Metrics

Track these metrics to evaluate ASC effectiveness:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Human interventions/sprint | <5 | Count resolved escalations |
| Stories completed overnight | 3-5 | Check completed count in metrics |
| Auto-recovery success rate | >70% | Recovery attempts vs successes |
| Time to escalation | <15 min | Timestamps in escalation files |
| Parallel efficiency | >60% | Completed / total spawned |

## Best Practices

1. **Start Supervised**: Always run `--supervised` first to validate behavior
2. **Set Realistic Limits**: Don't set `max-stories` too high initially
3. **Monitor Escalations**: Check queue regularly during early runs
4. **Configure Webhooks**: Get notified of critical issues in real-time
5. **Review Metrics**: Analyze session metrics to optimize configuration
6. **Tune Recovery**: Adjust auto-fix strategies based on your codebase
7. **Test Overnight**: Run a small overnight batch before full sprints

## Related Documentation

- [Ralph Wiggum v2.0](../Tools/Ralph/README.md) - Core Ralph loop
- [BMAD v6 Framework](./BMAD-PRACTICAL-GUIDE.md) - Sprint management
- [Commands Reference](./COMMANDS.md) - All available commands
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues
