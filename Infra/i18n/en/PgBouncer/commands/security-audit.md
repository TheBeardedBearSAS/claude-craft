---
description: Audit PgBouncer security posture
argument-hint: [scope]
---

# PgBouncer Security Audit

You are a PgBouncer security specialist. You must perform a comprehensive security audit of the PgBouncer deployment.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Scope: auth, tls, access, admin, network, full (default: full)

Example: `/pgbouncer:security-audit scope:full`

## Plan Mode

> **Plan mode is conditional.** Activates automatically when scope is "full" to present the audit plan before proceeding.

## MISSION

### Step 1: Scope Definition

```
══════════════════════════════════════════════════════════════
PGBOUNCER SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {auth, tls, access, admin, network, full}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────

| Category | Included | Weight |
|----------|----------|--------|
| Authentication | {yes/no} | 25% |
| TLS Encryption | {yes/no} | 25% |
| Access Control | {yes/no} | 20% |
| Admin Security | {yes/no} | 15% |
| Network Security | {yes/no} | 15% |
```

### Step 2: Authentication Audit

```
──────────────────────────────────────────────────────────────
AUTHENTICATION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| auth_type | {scram/md5/trust} | {recommendation} |
| auth_file permissions | {0600/other} | {owner} |
| auth_query used | {yes/no} | {function name} |
| auth_hba_file | {yes/no} | {rules count} |
| Password strength | {strong/weak} | {policy} |
| Credential rotation | {scheduled/none} | {frequency} |
```

### Step 3: TLS Audit

```
──────────────────────────────────────────────────────────────
TLS ENCRYPTION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Client TLS mode | {require/prefer/disable} | {setting} |
| Server TLS mode | {verify-full/require/disable} | {setting} |
| TLS protocol version | {1.3/1.2/1.1} | {recommendation} |
| Certificate validity | {valid/expiring/expired} | {days remaining} |
| Key file permissions | {0600/other} | {owner} |
| Cipher strength | {HIGH/MEDIUM/LOW} | {cipher list} |
```

### Step 4: Access Control Audit

```
──────────────────────────────────────────────────────────────
ACCESS CONTROL
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| auth_hba_file configured | {yes/no} | {path} |
| IP-based restrictions | {yes/no} | {rules} |
| Per-user connection limits | {yes/no} | {max_user_connections} |
| Per-database connection limits | {yes/no} | {max_db_connections} |
| Wildcard database access | {restricted/open} | {config} |
```

### Step 5: Admin Security Audit

```
──────────────────────────────────────────────────────────────
ADMIN SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| admin_users restricted | {yes/no} | {users} |
| stats_users restricted | {yes/no} | {users} |
| Admin on localhost only | {yes/no} | {listen_addr} |
| Admin password strength | {strong/weak} | {assessment} |
| Log connections enabled | {yes/no} | {setting} |
```

### Step 6: Network Security Audit

```
──────────────────────────────────────────────────────────────
NETWORK SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| listen_addr restricted | {yes/no} | {interfaces} |
| Firewall on port 6432 | {yes/no} | {rules} |
| Unix socket available | {yes/no} | {permissions} |
| Process runs as non-root | {yes/no} | {user} |
| Config file permissions | {0600/other} | {owner} |
```

### Step 7: Final Report

```
══════════════════════════════════════════════════════════════
SECURITY AUDIT REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Category | Score | Status |
|----------|-------|--------|
| Authentication | {x}/100 | {pass/warn/fail} |
| TLS Encryption | {x}/100 | {pass/warn/fail} |
| Access Control | {x}/100 | {pass/warn/fail} |
| Admin Security | {x}/100 | {pass/warn/fail} |
| Network Security | {x}/100 | {pass/warn/fail} |
| **Overall** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
CRITICAL FINDINGS
──────────────────────────────────────────────────────────────

1. [ ] {critical finding 1}
2. [ ] {critical finding 2}

──────────────────────────────────────────────────────────────
RECOMMENDATIONS
──────────────────────────────────────────────────────────────

Priority 1 (Immediate):
- [ ] {recommendation}

Priority 2 (This sprint):
- [ ] {recommendation}

Priority 3 (Next quarter):
- [ ] {recommendation}
```
