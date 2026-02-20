---
description: Design complete PgBouncer connection pooling architecture
argument-hint: <Project> [constraints]
---

# PgBouncer Architecture

You are a senior PgBouncer architect. You must design a complete connection pooling architecture from project specifications.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Target workload (e.g., web-application, microservices, multi-tenant)
- Constraints (e.g., pool-mode, max-connections, ha-required)

Example: `/pgbouncer:architecture "E-commerce platform" workload:web-application pg-max-conn:100`

## Plan Mode

> **Plan mode is recommended.** Claude activates plan mode to structure the approach, select pool mode, and present a topology before generating pgbouncer.ini.

## MISSION

### Step 1: Discovery

```
══════════════════════════════════════════════════════════════
PGBOUNCER ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Application Stack
| Component | Technology | Connections |
|-----------|------------|-------------|
| App Server | {framework} | {conn per instance} |
| Instances | {count} | {total connections} |
| ORM Features | {prepared stmts, temp tables} | {compatibility} |

### PostgreSQL Configuration
| Attribute | Value |
|-----------|-------|
| max_connections | {value} |
| Databases | {count} |
| Replication | {primary-only / primary+replica} |
| Auth method | {scram-sha-256 / md5} |
```

### Step 2: Pool Mode Decision

```
──────────────────────────────────────────────────────────────
POOL MODE SELECTION
──────────────────────────────────────────────────────────────

Application uses prepared statements? {yes/no}
Application uses SET/session variables? {yes/no}
Application uses LISTEN/NOTIFY? {yes/no}
Application uses temp tables across queries? {yes/no}

Decision: {transaction / session} mode
Rationale: {explanation}

server_reset_query: {DISCARD ALL / empty}
```

### Step 3: Topology Design

```
──────────────────────────────────────────────────────────────
POOL TOPOLOGY
──────────────────────────────────────────────────────────────

[ASCII diagram: App instances -> PgBouncer -> PostgreSQL]

──────────────────────────────────────────────────────────────
SIZING CALCULATION
──────────────────────────────────────────────────────────────

| Parameter | Value | Formula |
|-----------|-------|---------|
| max_client_conn | {value} | {instances × conn + 20% headroom} |
| default_pool_size | {value} | {PG max_conn / pools × 0.8} |
| min_pool_size | {value} | {50% of default} |
| reserve_pool_size | {value} | {25% of default} |
| reserve_pool_timeout | {value} | {seconds} |
```

### Step 4: Generate pgbouncer.ini

Generate the complete `pgbouncer.ini` configuration file with:
- [databases] section with all database entries
- [pgbouncer] section with all pool settings
- Authentication configuration (auth_type, auth_file or auth_query)
- Timeout settings (server_lifetime, server_idle_timeout, query_wait_timeout)
- Logging configuration
- Admin and stats users

### Step 5: Generate userlist.txt

Generate the authentication file or auth_query SQL function.

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CONFIGURATION SUMMARY
──────────────────────────────────────────────────────────────

| Setting | Value |
|---------|-------|
| Pool mode | {transaction/session} |
| max_client_conn | {value} |
| default_pool_size | {value} |
| Databases | {count} |
| HA | {yes/no} |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review pool sizing against actual traffic
2. [ ] Deploy with /pgbouncer:deploy-setup
3. [ ] Audit security with /pgbouncer:security-audit
4. [ ] Setup monitoring with @pgbouncer-monitoring
5. [ ] Load test to validate pool sizing
```
