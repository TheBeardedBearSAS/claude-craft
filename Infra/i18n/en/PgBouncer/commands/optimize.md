---
description: Optimize PgBouncer pool performance and connection utilization
argument-hint: [target]
---

# PgBouncer Optimize

You are a PgBouncer optimization specialist. You must analyze pool utilization metrics and provide actionable recommendations for performance tuning, timeout optimization, and transaction mode migration assessment.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Target: pool-sizing, timeouts, txn-mode-migration, full (default: full)

Example: `/pgbouncer:optimize target:pool-sizing`

## Plan Mode

> **Plan mode is recommended.** Claude analyzes current pool metrics before proposing optimizations.

## MISSION

### Step 1: Collect Metrics

```
══════════════════════════════════════════════════════════════
PGBOUNCER OPTIMIZATION
══════════════════════════════════════════════════════════════

Target: {pool-sizing/timeouts/txn-mode-migration/full}

──────────────────────────────────────────────────────────────
CURRENT POOL PROFILE
──────────────────────────────────────────────────────────────

| Database | Pool Mode | Pool Size | cl_active | cl_waiting | sv_active | sv_idle | Utilization |
|----------|-----------|-----------|-----------|------------|-----------|---------|-------------|
| {db} | {mode} | {size} | {n} | {n} | {n} | {n} | {%} |
```

Collect metrics via SHOW commands:
```sql
SHOW POOLS;
SHOW STATS;
SHOW CONFIG;
SHOW LISTS;
```

### Step 2: Pool Utilization Analysis

```
──────────────────────────────────────────────────────────────
POOL UTILIZATION
──────────────────────────────────────────────────────────────

| Database | Current Size | Peak sv_active | Avg Utilization | Recommendation | Action |
|----------|-------------|----------------|-----------------|----------------|--------|
| {db} | {size} | {peak} | {%} | {new size} | {increase/decrease/keep} |

──────────────────────────────────────────────────────────────
SIZING RECOMMENDATIONS
──────────────────────────────────────────────────────────────

| Parameter | Current | Recommended | Impact |
|-----------|---------|-------------|--------|
| default_pool_size | {current} | {new} | {description} |
| min_pool_size | {current} | {new} | {description} |
| reserve_pool_size | {current} | {new} | {description} |
| max_client_conn | {current} | {new} | {description} |
| max_db_connections | {current} | {new} | {description} |
```

### Step 3: Timeout Tuning

```
──────────────────────────────────────────────────────────────
TIMEOUT ANALYSIS
──────────────────────────────────────────────────────────────

| Timeout | Current | Recommended | Rationale |
|---------|---------|-------------|-----------|
| server_lifetime | {current} | {new} | {reason} |
| server_idle_timeout | {current} | {new} | {reason} |
| client_idle_timeout | {current} | {new} | {reason} |
| query_wait_timeout | {current} | {new} | {reason} |
| client_login_timeout | {current} | {new} | {reason} |
| server_connect_timeout | {current} | {new} | {reason} |
| reserve_pool_timeout | {current} | {new} | {reason} |
```

### Step 4: Transaction Mode Migration Assessment

```
──────────────────────────────────────────────────────────────
TRANSACTION MODE MIGRATION
──────────────────────────────────────────────────────────────

Current mode: {session/transaction}

| Compatibility Check | Status | Details |
|--------------------|--------|---------|
| Prepared statements | {compatible/needs-fix} | {details} |
| SET commands | {compatible/needs-fix} | {details} |
| LISTEN/NOTIFY | {compatible/incompatible} | {details} |
| Temp tables | {compatible/incompatible} | {details} |
| Advisory locks | {compatible/needs-session} | {details} |

Migration possible: {yes/no/partial}
Estimated multiplexing gain: {x}× connection reduction
server_reset_query needed: {DISCARD ALL / custom}
```

### Step 5: Performance Statistics

```
──────────────────────────────────────────────────────────────
PERFORMANCE METRICS
──────────────────────────────────────────────────────────────

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| avg_wait_time | {ms} | < 100ms | {ok/high} |
| avg_xact_time | {ms} | < 500ms | {ok/high} |
| avg_query_time | {ms} | < 100ms | {ok/high} |
| xact/s throughput | {n} | {target} | {ok/low} |
| Connection reuse ratio | {x}:1 | > 10:1 | {ok/low} |
```

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Optimization | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| {optimization 1} | {high/med/low} | {high/med/low} | 1 |
| {optimization 2} | {high/med/low} | {high/med/low} | 2 |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Apply pool sizing recommendations (RELOAD, no restart)
2. [ ] Tune timeouts for application profile
3. [ ] Evaluate transaction mode migration (if session mode)
4. [ ] Setup monitoring with @pgbouncer-monitoring
5. [ ] Re-evaluate after 1 week of production traffic
```
