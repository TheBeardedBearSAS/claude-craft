---
description: Run autonomous sprint conductor for overnight/unattended sprint execution
argument-hint: <sprint-name> [--overnight|--parallel N|--supervised|--max-stories N]
---

# Ralph Sprint - Autonomous Sprint Conductor (ASC)

Execute an entire sprint autonomously with minimal human intervention. The Autonomous Sprint Conductor (ASC) manages story claiming, execution, transitions, recovery from errors, and escalation of blocking issues.

## Arguments

**$ARGUMENTS**

- `<sprint-name>`: Name or ID of the sprint to process
- `--overnight`: Run in overnight mode (bounded, stops at 6am)
- `--parallel N`: Process up to N stories in parallel (default: 1)
- `--supervised`: Pause before each story for confirmation
- `--max-stories N`: Maximum stories to process (default: 10)
- `--timeout H`: Maximum runtime in hours (default: 12)

## Key Features

| Feature | Description |
|---------|-------------|
| **Auto-Claim** | Automatically claims next ready-for-dev story |
| **Auto-Transition** | Transitions stories based on completion state |
| **Recovery Engine** | Auto-recovers from transient/recoverable errors |
| **Escalation Service** | Queues blocking issues for human resolution |
| **Parallel Processing** | Process multiple independent stories concurrently |
| **Bounded Execution** | Time windows, story limits, failure thresholds |

## Process

### 1. Sprint Initialization

1. **Load sprint configuration**:
   - Read sprint metadata from `.bmad/sprint-status.yaml`
   - Load autonomous config from `ralph-autonomous.yml`
   - Initialize recovery engine and escalation service

2. **Enable autonomous mode**:
   - Set circuit breaker to autonomous profile
   - Enable recovery before trip
   - Initialize parallel manager if enabled

### 2. Main Conductor Loop

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTONOMOUS SPRINT CONDUCTOR (ASC)                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────────┐
    ▼                           ▼                               ▼
┌─────────┐              ┌─────────────┐               ┌─────────────┐
│Get Next │──────────────│ Claim Story │───────────────│Execute with │
│  Story  │              │             │               │    Ralph    │
└────┬────┘              └─────────────┘               └──────┬──────┘
     │                                                        │
     │ No stories ──────────────────┐          ┌──────────────┘
     ▼                              ▼          ▼
┌─────────┐                  ┌─────────┐ ┌─────────┐
│  Check  │                  │Finalize │ │Transition│
│Escalate │                  │  Sprint │ │  Story   │
└─────────┘                  └─────────┘ └─────────┘
```

### 3. Error Recovery

The Recovery Engine classifies errors into 4 levels:

| Level | Type | Action | Examples |
|-------|------|--------|----------|
| 0 | **Transient** | Auto-retry with backoff | Timeout, rate limit, network |
| 1 | **Recoverable** | Auto-fix + retry | Lint, tests, deps, syntax |
| 2 | **Degraded** | Continue with warning | Docs, optional gates, coverage |
| 3 | **Blocked** | Escalate to human | Security, architecture, auth |

### 4. Escalation Management

Blocking issues are queued for human resolution:

```yaml
# .ralph/escalations/queue/ESC-xxx.yaml
id: "ESC-1704067200-123"
level: "blocked"
error_type: "security"
priority: "critical"
timeout_at: "2024-01-02T10:00:00Z"
default_action: "pause"
```

**Resolution options**:
- `proceed` - Continue with the task
- `skip` - Skip this story and continue
- `retry` - Retry the failed operation
- `abort` - Stop the sprint

### 5. Stop Conditions

The conductor stops when any condition is met:

| Condition | Default | Description |
|-----------|---------|-------------|
| Max stories | 10 | Maximum stories processed |
| Max failures | 3 | Consecutive failures threshold |
| Max runtime | 12h | Maximum total runtime |
| Stop window | 06:00 | Time-based stop (for overnight) |
| Critical escalation | - | Pauses on critical issues |

## Parallel Processing

When `--parallel N` is specified, the ASC processes stories in parallel waves:

### How It Works

1. **Dependency Graph**: The ASC builds a dependency graph from `blocked_by` relationships
2. **Wave Processing**: Stories are processed in waves based on dependency satisfaction
3. **Slot Management**: Up to N concurrent sessions, limited by CPU/memory thresholds
4. **Sequential Merge**: Git branches are merged sequentially to avoid conflicts

```
Wave 1: [US-001, US-002, US-003]  ← Independent stories (no blockers)
           ↓        ↓        ↓
        Session  Session  Session
           ↓        ↓        ↓
        Complete Complete Complete

Wave 2: [US-004, US-005]  ← Depend on US-001/US-002 (now done)
           ↓        ↓
        Session  Session
           ↓        ↓
        Complete Complete
```

### Dependency Handling

Stories are only scheduled when their dependencies are satisfied:

```yaml
# sprint-status.yaml
stories:
  US-001:
    status: ready-for-dev
    blocked_by: []            # ✓ Can start immediately
  US-002:
    status: ready-for-dev
    blocked_by: []            # ✓ Can start immediately
  US-003:
    status: ready-for-dev
    blocked_by: [US-001]      # ✗ Waits for US-001 completion
```

### Resource Limits

```yaml
# ralph-autonomous.yml
parallel:
  enabled: true
  max_concurrent: 3
  resource_limits:
    cpu_percent: 80      # Don't spawn if CPU > 80%
    mem_percent: 80      # Don't spawn if memory > 80%
```

## Quick Start Examples

```bash
# Overnight sprint run
/common:ralph-sprint "Sprint 3" --overnight

# Parallel processing with 3 sessions
/common:ralph-sprint "Sprint 3" --parallel 3

# Combined: parallel overnight
/common:ralph-sprint "Sprint 3" --parallel 3 --overnight

# Supervised mode (confirm each story)
/common:ralph-sprint "Sprint 3" --supervised

# Limited run (5 stories, 4 hours)
/common:ralph-sprint "Sprint 3" --max-stories 5 --timeout 4
```

## Configuration

The ASC uses `Tools/Ralph/config/ralph-autonomous.yml`:

```yaml
autonomous:
  enabled: true
  mode: "bounded"
  schedule:
    stop_window: "06:00"
    max_runtime_hours: 12
  limits:
    max_stories_per_session: 10
    max_consecutive_failures: 3
  parallel:
    enabled: false
    max_concurrent: 3

recovery:
  enabled: true
  max_attempts: 3
  auto_retry_transient: true
  auto_fix_lint: true
  auto_fix_tests: "retry_tdd"

escalation:
  enabled: true
  timeout_hours: 4
  default_action: "skip"
  critical_action: "pause"
  webhook:
    url: ""
    type: "slack"
```

## Output

```
╔════════════════════════════════════════════════════════════╗
║     Autonomous Sprint Conductor (ASC)                       ║
║     Sprint 3                                                ║
╚════════════════════════════════════════════════════════════╝

ℹ [ASC] Initialized Sprint Conductor
ℹ [ASC]   Session: ASC-20240101-120000-12345
ℹ [ASC]   Mode: bounded
ℹ [ASC]   Max stories: 10
ℹ [ASC]   Max runtime: 12h

ℹ [ASC] Processing story: US-001
ℹ [ASC] Claimed story: US-001
ℹ [ASC] Spawning Ralph for story: US-001
✓ [ASC] Story completed: US-001
ℹ [ASC] Transitioned US-001 to review

ℹ [ASC] Processing story: US-002
⚠ Error classified as Level 1 (recoverable): test_fail
ℹ Attempting auto-fix for: test_fail
ℹ TDD retry: extracting failing tests...
✓ [ASC] Story completed: US-002

ℹ [ASC] Processing story: US-003
⚠ Error classified as Level 3 (blocked): security
⚠ Escalation created: ESC-1704067200-123 (blocked - security)
ℹ [ASC] Story escalated: US-003

════════════════════════════════════════
    Sprint Conductor Summary
════════════════════════════════════════

Session: ASC-20240101-120000-12345
Duration: 4h 23m

Stories:
  Completed: 7
  Failed:    1
  Skipped:   2

Escalations:
  created: 3
  resolved: 2

Recovery attempts: 8
```

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Human interventions/sprint | ~15 | <5 |
| Stories completed overnight | 0 | 3-5 |
| Auto-recovery success rate | N/A | >70% |
| Time to escalation | N/A | <15 min |
| Parallel efficiency | N/A | >60% |

## Best Practices

1. **Start supervised**: Use `--supervised` first to validate behavior
2. **Set realistic limits**: Don't set max-stories too high initially
3. **Monitor escalations**: Check `.ralph/escalations/queue/` regularly
4. **Review metrics**: Analyze `metrics-*.json` after each run
5. **Configure webhooks**: Set up Slack/Teams notifications for critical issues

## Related

- `/common:ralph-run` - Single task continuous loop
- `/project:run-sprint` - Standard sprint execution
- `/sprint:next-story` - Get next ready story
- `@ralph-conductor` - Ralph orchestration agent
