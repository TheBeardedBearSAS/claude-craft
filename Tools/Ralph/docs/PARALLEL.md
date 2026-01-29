# Parallel Processing

The Parallel Manager enables concurrent story processing in the Autonomous Sprint Conductor (ASC), significantly reducing sprint execution time when stories are independent.

## Overview

Located at `Tools/Ralph/lib/parallel-manager.sh`, the parallel manager:

1. Builds dependency graph from sprint stories
2. Identifies stories that can run concurrently
3. Spawns isolated Ralph sessions
4. Monitors resource usage
5. Aggregates results

## Quick Start

```bash
# Process 3 stories in parallel
/common:ralph-sprint "Sprint 3" --parallel 3 --overnight

# Or via CLI
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" -p 3 -o
```

## Dependency Graph

### How Dependencies Are Detected

The parallel manager analyzes stories to detect dependencies:

| Dependency Type | Detection Method |
|-----------------|------------------|
| Explicit `depends_on` | YAML field in story |
| File conflicts | Same files in story scope |
| API dependencies | Story references another's API |
| Database migrations | Migration ordering |
| Feature flags | Shared feature flag usage |

### Graph Building

```yaml
# .bmad/sprint-status.yaml
stories:
  US-001:
    status: ready-for-dev
    scope:
      files: ["src/auth/*"]
    depends_on: []

  US-002:
    status: ready-for-dev
    scope:
      files: ["src/user/*"]
    depends_on: ["US-001"]  # Explicit dependency

  US-003:
    status: ready-for-dev
    scope:
      files: ["src/payment/*"]
    depends_on: []  # Can run parallel with US-001
```

**Resulting graph:**
```
US-001 ──────────────┐
                     ├──▶ US-002
US-003 ──────────────┘
       (parallel)
```

### Cycle Detection

The manager detects and reports circular dependencies:

```
Error: Circular dependency detected
  US-001 → US-002 → US-003 → US-001

Resolution: Break cycle by removing one dependency
```

## Configuration

### Basic Configuration

```yaml
# ralph-autonomous.yml
autonomous:
  parallel:
    enabled: true
    max_concurrent: 3
```

### Advanced Configuration

```yaml
autonomous:
  parallel:
    enabled: true
    max_concurrent: 3

    # Resource limits
    resource_limits:
      cpu_percent: 80       # Max total CPU usage
      mem_percent: 80       # Max total memory usage
      per_session_cpu: 30   # Max CPU per session
      per_session_mem: 2048 # Max memory per session (MB)

    # Scheduling
    scheduling:
      strategy: "priority"  # priority, fifo, shortest_first
      batch_size: 5         # Stories to evaluate per batch
      rebalance_interval: 60  # Seconds between rebalancing

    # Session isolation
    isolation:
      separate_worktrees: true  # Git worktrees for isolation
      shared_node_modules: true # Share node_modules
      shared_vendor: true       # Share vendor (PHP)

    # Monitoring
    monitoring:
      status_interval: 30   # Seconds between status updates
      metrics_file: ".ralph/parallel/metrics.json"
```

## Session Isolation

### Git Worktrees (Recommended)

Each parallel session gets its own git worktree for complete isolation:

```bash
# Session structure
.ralph/
├── parallel/
│   ├── session-US-001/
│   │   └── worktree/      # Git worktree
│   ├── session-US-002/
│   │   └── worktree/
│   └── session-US-003/
│       └── worktree/
```

**Enabling worktrees:**
```yaml
autonomous:
  parallel:
    isolation:
      separate_worktrees: true
```

### Shared Dependencies

To save disk space and install time:

```yaml
autonomous:
  parallel:
    isolation:
      shared_node_modules: true
      shared_vendor: true
      shared_pub_cache: true  # Flutter
```

This creates symlinks to the main project's dependencies.

## Resource Limiting

### CPU Throttling

Monitor and throttle when limits exceeded:

```bash
# Check current usage
cat .ralph/parallel/resources.json
```

```json
{
  "timestamp": "2024-01-15T03:45:12Z",
  "sessions": {
    "US-001": { "cpu": 25, "mem_mb": 1024 },
    "US-002": { "cpu": 30, "mem_mb": 1536 },
    "US-003": { "cpu": 20, "mem_mb": 896 }
  },
  "total": { "cpu": 75, "mem_mb": 3456 },
  "limits": { "cpu": 80, "mem_mb": 8192 },
  "status": "healthy"
}
```

### Automatic Throttling

When limits are approached:

1. **Warning (70%)**: Log warning, continue
2. **Soft limit (80%)**: Pause new session starts
3. **Hard limit (90%)**: Pause lowest-priority session
4. **Critical (95%)**: Stop all but one session

### Memory Management

```yaml
autonomous:
  parallel:
    resource_limits:
      mem_percent: 80
      per_session_mem: 2048
      swap_tolerance: 0  # Don't allow swap usage
```

## Monitoring

### Session Status

```bash
# View all parallel sessions
cat .ralph/parallel/status.yaml
```

```yaml
sessions:
  US-001:
    status: running
    started_at: "2024-01-15T03:00:00Z"
    iteration: 5
    phase: GREEN
    last_activity: "2024-01-15T03:45:00Z"

  US-002:
    status: waiting
    blocked_by: ["US-001"]
    queue_position: 1

  US-003:
    status: completed
    started_at: "2024-01-15T03:00:00Z"
    completed_at: "2024-01-15T03:30:00Z"
    result: success
```

### Real-time Monitoring

```bash
# Watch parallel status (updates every 30s)
watch -n 30 'cat .ralph/parallel/status.yaml'

# View resource usage
watch -n 5 'cat .ralph/parallel/resources.json | jq .'

# Tail combined logs
tail -f .ralph/parallel/combined.log
```

### Metrics

```bash
cat .ralph/parallel/metrics.json
```

```json
{
  "session_id": "ASC-20240115-120000-12345",
  "parallel_config": {
    "max_concurrent": 3,
    "strategy": "priority"
  },
  "execution": {
    "total_stories": 8,
    "parallel_batches": 4,
    "max_parallelism_achieved": 3,
    "average_parallelism": 2.4
  },
  "efficiency": {
    "sequential_time_estimate": 14400,
    "actual_time": 7200,
    "speedup_factor": 2.0,
    "parallel_efficiency": 0.67
  },
  "resources": {
    "peak_cpu_percent": 78,
    "peak_mem_percent": 65,
    "throttle_events": 2
  }
}
```

## Scheduling Strategies

### Priority-Based (Default)

Process highest-priority stories first:

```yaml
autonomous:
  parallel:
    scheduling:
      strategy: "priority"
```

Priority determined by:
1. Story priority field (P0 > P1 > P2)
2. Story points (lower first)
3. Dependency count (fewer deps first)

### FIFO

Process in backlog order:

```yaml
autonomous:
  parallel:
    scheduling:
      strategy: "fifo"
```

### Shortest First

Process quickest stories first (based on estimate):

```yaml
autonomous:
  parallel:
    scheduling:
      strategy: "shortest_first"
```

## Handling Conflicts

### File Conflicts

When parallel stories modify the same file:

```yaml
# Detected conflict
conflict:
  file: "src/shared/utils.ts"
  stories: ["US-001", "US-003"]
  resolution: "serialize"
```

**Resolution strategies:**
- `serialize`: Run one after the other
- `merge`: Attempt automatic merge after both complete
- `escalate`: Pause and ask for human decision

### Database Conflicts

```yaml
autonomous:
  parallel:
    conflict_handling:
      database:
        strategy: "separate_schemas"  # Each session gets own schema
        cleanup: true
```

### API Conflicts

When stories use the same mock server:

```yaml
autonomous:
  parallel:
    conflict_handling:
      api_mocks:
        strategy: "port_per_session"
        base_port: 3000
```

## Troubleshooting

### Sessions Not Starting

1. **Check resource availability:**
   ```bash
   cat .ralph/parallel/resources.json
   ```

2. **Check dependency graph:**
   ```bash
   cat .ralph/parallel/dependency-graph.json
   ```

3. **Verify worktree creation:**
   ```bash
   git worktree list
   ```

### Sessions Stuck

1. **Check session logs:**
   ```bash
   tail -100 .ralph/parallel/session-US-001/ralph.log
   ```

2. **Check for deadlocks:**
   ```bash
   grep -r "waiting\|blocked" .ralph/parallel/status.yaml
   ```

3. **Force session restart:**
   ```bash
   ./Tools/Ralph/lib/parallel-manager.sh restart-session US-001
   ```

### Resource Exhaustion

1. **Reduce parallelism:**
   ```yaml
   autonomous:
     parallel:
       max_concurrent: 2  # Reduce from 3
   ```

2. **Increase limits:**
   ```yaml
   autonomous:
     parallel:
       resource_limits:
         mem_percent: 90  # If you have headroom
   ```

3. **Disable worktrees:**
   ```yaml
   autonomous:
     parallel:
       isolation:
         separate_worktrees: false  # Share working directory
   ```

### Merge Conflicts

1. **Check conflict details:**
   ```bash
   cat .ralph/parallel/conflicts/
   ```

2. **Resolution options:**
   - Manual merge after sessions complete
   - Abort conflicting session
   - Retry with serialized execution

## Best Practices

1. **Start Small**: Begin with `--parallel 2` before scaling up
2. **Monitor Resources**: Watch CPU/memory during first parallel runs
3. **Define Dependencies**: Explicit `depends_on` is better than implicit detection
4. **Isolate Tests**: Ensure tests don't share state
5. **Use Worktrees**: Prevents most merge conflicts
6. **Review Metrics**: Check parallel efficiency and adjust

## Related Documentation

- [Autonomous Sprint Guide](../../../docs/AUTONOMOUS-SPRINT.md)
- [Recovery Engine](./RECOVERY.md)
- [Ralph Wiggum](../README.md)
