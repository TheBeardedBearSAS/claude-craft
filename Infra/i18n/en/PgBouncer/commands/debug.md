---
description: Diagnose PgBouncer connection pool issues from symptoms
argument-hint: <Symptom> [resource]
---

# PgBouncer Debug

You are a PgBouncer troubleshooting specialist. You must systematically diagnose and resolve connection pool issues from the given symptoms.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "clients waiting", "authentication failed", "prepared statement error")
- (Optional) Database name
- (Optional) Pool mode

Example: `/pgbouncer:debug "clients waiting for connections, cl_waiting=50"`

## Plan Mode

> **Plan mode is not required.** This is a diagnostic command that proceeds immediately with investigation.

## MISSION

### Step 1: Gather Information

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Database: {database}
Pool mode: {transaction/session}

──────────────────────────────────────────────────────────────
POOL STATUS
──────────────────────────────────────────────────────────────
```

Run diagnostic commands via PgBouncer admin console:
```sql
SHOW POOLS;
SHOW CLIENTS;
SHOW SERVERS;
SHOW STATS;
SHOW CONFIG;
SHOW DATABASES;
```

### Step 2: Root Cause Analysis

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| PgBouncer running | {yes/no} | {pid, uptime} |
| Pool utilization | {x}% | {sv_active/pool_size} |
| Clients waiting | {count} | {max wait time} |
| Auth status | {ok/failing} | {method} |
| Server connectivity | {ok/failing} | {PG reachable} |
| Transaction mode compat | {ok/issues} | {prepared stmts, SET} |

──────────────────────────────────────────────────────────────
DECISION TREE
──────────────────────────────────────────────────────────────

Symptom: {symptom}
  ├── Pool exhaustion? (cl_waiting > 0)
  │   ├── All server conns busy → Increase pool_size or optimize queries
  │   ├── Server connections stuck → Check PostgreSQL load
  │   └── Too many pools → Consolidate databases
  ├── Authentication failure?
  │   ├── SCRAM mismatch → Match auth_type to PG
  │   ├── Wrong credentials → Update userlist.txt
  │   └── auth_query error → Check lookup function
  ├── Transaction mode error?
  │   ├── Prepared statement → DISCARD ALL or disable in ORM
  │   ├── SET/session vars → Use server_reset_query
  │   └── LISTEN/NOTIFY → Switch to session mode
  └── Server connectivity?
      ├── PG max_connections reached → Reduce pool_size
      ├── Network/DNS issue → Check connectivity
      └── TLS failure → Check certificates

Root Cause: {explanation}
```

### Step 3: Resolution

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Provide:
1. **Immediate fix** -- PgBouncer admin commands or config changes to resolve now
2. **Explanation** -- Why this happened, PgBouncer-specific behavior
3. **Prevention** -- Configuration tuning, monitoring alerts

### Step 4: Verification

```sql
-- Verify pool health
SHOW POOLS;
-- cl_waiting should be 0

-- Verify connectivity
SHOW SERVERS;
-- sv_active should be < pool_size

-- Verify statistics
SHOW STATS;
-- avg_wait_time should be < 100ms
```

### Step 5: Final Report

```
══════════════════════════════════════════════════════════════
DEBUG REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Item | Value |
|------|-------|
| Symptom | {symptom} |
| Root cause | {cause} |
| Fix applied | {fix} |
| Status | Resolved / Needs action |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] Add monitoring alert for {condition}
- [ ] Tune {parameter} to prevent {issue}
- [ ] Document fix for @pgbouncer-debug reference
```
