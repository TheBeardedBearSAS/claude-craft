# BMAD Autonomous Mode

This document describes how BMAD v6 integrates with the Autonomous Sprint Conductor (ASC) to enable unattended sprint execution.

## Overview

BMAD Autonomous Mode enables:

- **Auto-claim**: Automatically claims next ready story
- **Auto-transition**: Transitions stories through statuses
- **Auto-routing**: Routes work to appropriate agents
- **TDD Integration**: Auto-detects and transitions TDD phases

## Routing Engine Integration

### Story Status Flow

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

### Autonomous Routing Rules

Located at `.bmad/routing-engine.yaml`:

```yaml
autonomous:
  enabled: true

  # Auto-claim configuration
  claim:
    enabled: true
    strategy: "priority"  # priority, fifo, round_robin
    filters:
      status: "ready-for-dev"
      max_points: 8        # Skip stories > 8 points
      required_labels: []
      excluded_labels: ["needs-discussion", "blocked"]

  # Auto-transition configuration
  transitions:
    enabled: true
    rules:
      - from: "ready-for-dev"
        to: "in-progress"
        trigger: "claim"

      - from: "in-progress"
        to: "review"
        trigger: "tests_pass"
        conditions:
          - "all_tests_green"
          - "lint_clean"
          - "coverage_met"

      - from: "review"
        to: "done"
        trigger: "gates_pass"
        conditions:
          - "quality_gate_pass"
          - "no_blocking_issues"

      - from: "*"
        to: "blocked"
        trigger: "escalation_created"
        conditions:
          - "escalation_level >= 3"
```

## Auto-Claim Workflow

### Claim Process

1. **Query available stories:**
   ```bash
   yq '.stories | to_entries | .[] | select(.value.status == "ready-for-dev")' \
     .bmad/sprint-status.yaml
   ```

2. **Apply filters:**
   - Status = `ready-for-dev`
   - Points <= max_points
   - No excluded labels
   - No unresolved blockers

3. **Select by strategy:**
   - `priority`: Highest priority first
   - `fifo`: Oldest first
   - `round_robin`: Distribute evenly

4. **Claim and transition:**
   ```yaml
   # Update story status
   stories:
     US-042:
       status: in-progress
       claimed_at: "2024-01-15T03:00:00Z"
       claimed_by: "ASC-20240115-120000"
   ```

### Claim Configuration

```yaml
# .bmad/routing-engine.yaml
autonomous:
  claim:
    enabled: true
    strategy: "priority"

    # Story filters
    filters:
      status: "ready-for-dev"
      max_points: 8
      required_labels: []
      excluded_labels:
        - "needs-discussion"
        - "needs-design"
        - "blocked"
        - "spike"

    # Priority ordering
    priority_order:
      - field: "priority"
        direction: "asc"  # P0 before P1
      - field: "points"
        direction: "asc"  # Smaller first
      - field: "created_at"
        direction: "asc"  # Older first
```

## TDD Auto-Transition

### TDD Phase Detection

The routing engine detects TDD phase completion:

| Phase | Detection | Transition |
|-------|-----------|------------|
| RED | Failing test exists | Start GREEN |
| GREEN | All tests pass | Start REFACTOR |
| REFACTOR | Lint clean + tests pass | Complete cycle |

### Phase Markers

```yaml
# In story metadata
stories:
  US-042:
    status: in-progress
    tdd:
      phase: GREEN
      cycle: 2
      red_at: "2024-01-15T03:00:00Z"
      green_at: "2024-01-15T03:15:00Z"
      tests:
        total: 5
        passing: 5
        failing: 0
```

### Auto-Transition Rules

```yaml
autonomous:
  tdd:
    enabled: true
    auto_transition: true

    # RED → GREEN
    red_to_green:
      trigger: "tests_pass"
      conditions:
        - "new_test_exists"
        - "implementation_changed"

    # GREEN → REFACTOR
    green_to_refactor:
      trigger: "all_tests_pass"
      conditions:
        - "coverage_threshold_met"
        - "no_new_failures"

    # REFACTOR → COMPLETE
    refactor_complete:
      trigger: "lint_pass"
      conditions:
        - "tests_still_pass"
        - "no_code_smells"  # Optional
```

### TDD Cycle Tracking

```bash
# View TDD progress
yq '.stories["US-042"].tdd' .bmad/sprint-status.yaml
```

Output:
```yaml
phase: REFACTOR
cycle: 2
history:
  - cycle: 1
    red: { at: "...", test: "should_create_user" }
    green: { at: "...", impl: "UserService.create" }
    refactor: { at: "...", changes: ["extract method"] }
  - cycle: 2
    red: { at: "...", test: "should_validate_email" }
    green: { at: "...", impl: "EmailValidator" }
    refactor: { at: "...", changes: ["inline variable"] }
```

## Sprint Conductor Integration

### Initialization

When ASC starts:

1. Load `.bmad/sprint-status.yaml`
2. Initialize routing engine
3. Load autonomous configuration
4. Start orchestration loop

```yaml
# .bmad/sprint-status.yaml (auto-managed)
sprint:
  name: "Sprint 3"
  started_at: "2024-01-15T00:00:00Z"
  autonomous:
    enabled: true
    session_id: "ASC-20240115-120000"
    mode: "bounded"

stories:
  US-042:
    status: ready-for-dev
    priority: P1
    points: 3
    # ...
```

### Event Processing

The conductor processes events from Ralph sessions:

| Event | Routing Action |
|-------|----------------|
| `session_started` | Transition to `in-progress` |
| `tests_pass` | Update TDD phase |
| `iteration_complete` | Check DoD progress |
| `dod_complete` | Transition to `review` |
| `gate_pass` | Transition to `done` |
| `error_blocked` | Transition to `blocked` |
| `escalation_created` | Log and continue or pause |

### State Synchronization

```bash
# Sprint state file
.bmad/sprint-status.yaml

# Conductor state file
.ralph/conductor/state-ASC-*.yaml

# Sync interval: 30 seconds
```

## Quality Gates in Autonomous Mode

### Gate Configuration

```yaml
# .bmad/quality-gates.yaml
gates:
  story_complete:
    autonomous:
      auto_retry: true
      max_retries: 3
      on_failure: "escalate"

    checks:
      - name: "tests_pass"
        command: "npm test"
        required: true

      - name: "lint_clean"
        command: "npm run lint"
        required: true
        auto_fix: true

      - name: "coverage_met"
        command: "npm run coverage"
        threshold: 80
        required: false  # Warning only

      - name: "security_scan"
        command: "npm audit"
        required: true
        on_failure: "block"  # Always escalate
```

### Automatic Gate Handling

| Gate Result | Auto-Action |
|-------------|-------------|
| Pass | Continue to next phase |
| Fail (recoverable) | Auto-fix and retry |
| Fail (required) | Escalate |
| Fail (optional) | Log warning, continue |

## Batch Processing

### Batch Executor Integration

```yaml
# .bmad/batch-config.yaml
batch:
  enabled: true

  # Process stories in batches
  stories:
    batch_size: 5
    parallel: true
    max_concurrent: 3

  # Process gates in sequence
  gates:
    batch_size: 1
    parallel: false
```

### Batch Commands

```bash
# Process next batch
./Tools/Ralph/lib/batch-executor.sh process-batch

# View batch status
cat .bmad/batch-status.yaml
```

## Escalation Integration

### BMAD-Specific Escalations

```yaml
# Escalation patterns
escalation:
  patterns:
    # PRD/Tech Spec issues
    - pattern: "acceptance criteria unclear"
      level: 2  # Degraded
      route_to: "@po"

    - pattern: "architecture decision required"
      level: 3  # Blocked
      route_to: "@architect"

    # Sprint issues
    - pattern: "scope creep detected"
      level: 2
      route_to: "@sm"

    - pattern: "security vulnerability"
      level: 3
      route_to: "@dev"
      priority: "critical"
```

### Agent Escalation

When escalation occurs, it's routed to appropriate BMAD agent:

```yaml
escalation:
  US-042:
    id: "ESC-20240115-001"
    level: 3
    type: "architecture"
    routed_to: "@architect"
    message: "Breaking change to API contract detected"
    context:
      file: "src/api/users.ts"
      change: "Response schema modified"
```

## Configuration Reference

### Complete Autonomous Configuration

```yaml
# .bmad/autonomous-config.yaml
autonomous:
  enabled: true
  mode: "bounded"  # bounded, continuous, supervised

  # Routing
  routing:
    enabled: true
    engine: ".bmad/routing-engine.yaml"

  # Claiming
  claim:
    enabled: true
    strategy: "priority"
    filters:
      max_points: 8
      excluded_labels: ["spike", "needs-discussion"]

  # Transitions
  transitions:
    enabled: true
    auto_transition: true

  # TDD
  tdd:
    enabled: true
    auto_transition: true
    track_cycles: true

  # Quality gates
  gates:
    auto_retry: true
    max_retries: 3
    auto_fix_lint: true

  # Escalation
  escalation:
    enabled: true
    timeout_hours: 4
    default_action: "skip"

  # Integration
  integration:
    sprint_conductor: true
    batch_executor: true
    parallel_manager: true
```

## Monitoring

### Sprint Progress

```bash
# View sprint status
yq '.stories | to_entries | group_by(.value.status) |
  map({status: .[0].value.status, count: length})' \
  .bmad/sprint-status.yaml
```

### Autonomous Metrics

```bash
# View autonomous session metrics
cat .bmad/autonomous-metrics.json
```

```json
{
  "session_id": "ASC-20240115-120000",
  "sprint": "Sprint 3",
  "stories": {
    "claimed": 8,
    "completed": 6,
    "blocked": 1,
    "skipped": 1
  },
  "tdd_cycles": 24,
  "gate_passes": 18,
  "gate_failures": 4,
  "escalations": 2,
  "auto_recoveries": 6
}
```

## Troubleshooting

### Stories Not Being Claimed

1. **Check filters:**
   ```bash
   yq '.autonomous.claim.filters' .bmad/routing-engine.yaml
   ```

2. **Verify story status:**
   ```bash
   yq '.stories | to_entries | .[] | select(.value.status == "ready-for-dev")' \
     .bmad/sprint-status.yaml
   ```

3. **Check excluded labels:**
   ```bash
   yq '.stories["US-042"].labels' .bmad/sprint-status.yaml
   ```

### TDD Transitions Not Working

1. **Check TDD config:**
   ```yaml
   autonomous:
     tdd:
       enabled: true
       auto_transition: true
   ```

2. **Verify test detection:**
   ```bash
   grep -l "test\|spec" src/**/*.ts
   ```

### Gates Failing Repeatedly

1. **Check gate configuration:**
   ```bash
   yq '.gates.story_complete' .bmad/quality-gates.yaml
   ```

2. **Review auto-fix settings:**
   ```yaml
   gates:
     story_complete:
       checks:
         - name: "lint_clean"
           auto_fix: true  # Ensure enabled
   ```

## Related Documentation

- [BMAD v6 Framework](../../docs/BMAD-PRACTICAL-GUIDE.md)
- [Autonomous Sprint Guide](../../docs/AUTONOMOUS-SPRINT.md)
- [Recovery Engine](../../Tools/Ralph/docs/RECOVERY.md)
- [Parallel Processing](../../Tools/Ralph/docs/PARALLEL.md)
