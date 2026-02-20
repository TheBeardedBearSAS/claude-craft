---
description: Diagnose FrankenPHP worker and Caddyfile issues from symptoms
argument-hint: <Symptom> [context]
---

# FrankenPHP Debug

You are a FrankenPHP troubleshooting specialist. You must systematically diagnose and resolve FrankenPHP issues from the given symptoms.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "worker crashes", "memory leak", "Caddyfile error", "503 errors")
- (Optional) Framework: symfony, laravel, php
- (Optional) Mode: worker, classic

Example: `/frankenphp:debug "worker memory keeps growing, RSS at 2GB after 1 hour"`

## Plan Mode

> **Plan mode is not required.** This is a diagnostic command that proceeds immediately with investigation.

## MISSION

### Step 1: Gather Information

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Framework: {symfony/laravel/php}
Mode: {worker/classic}

──────────────────────────────────────────────────────────────
SYSTEM STATUS
──────────────────────────────────────────────────────────────
```

Run diagnostic commands:
```bash
# Process status
ps aux | grep frankenphp

# Recent logs
docker logs frankenphp-app --tail 50
# or: journalctl -u frankenphp --since "10 minutes ago"

# Caddyfile validation
frankenphp validate --config /etc/caddy/Caddyfile

# Memory usage
ps -o pid,rss,vsz -p $(pidof frankenphp)

# PHP extensions
frankenphp php-cli -m
```

### Step 2: Root Cause Analysis

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| FrankenPHP running | {yes/no} | {pid, uptime} |
| Worker mode active | {yes/no} | {thread count} |
| Caddyfile valid | {yes/no} | {errors} |
| Memory stable | {yes/no} | {RSS trend} |
| Framework integration | {ok/failing} | {Runtime/Octane} |
| TLS status | {ok/failing} | {auto/proxy} |

──────────────────────────────────────────────────────────────
DECISION TREE
──────────────────────────────────────────────────────────────

Symptom: {symptom}
  ├── Worker crash? → Check PHP errors, memory, segfaults
  ├── Memory leak? → Set max_requests, audit global state
  ├── Caddyfile error? → Validate syntax, check directive order
  ├── TLS failure? → Check auto_https, proxy config
  ├── Framework issue? → Verify Runtime/Octane installation
  └── Performance? → Profile code, check OPcache, benchmark

Root Cause: {explanation}
```

### Step 3: Resolution

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Provide:
1. **Immediate fix** -- Configuration changes or commands to resolve now
2. **Explanation** -- Why this happened, FrankenPHP-specific behavior
3. **Prevention** -- Configuration tuning, monitoring alerts

### Step 4: Verification

```bash
# Verify FrankenPHP is healthy
frankenphp validate --config /etc/caddy/Caddyfile
curl -f http://localhost/healthz
ps -o pid,rss -p $(pidof frankenphp)
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
- [ ] Document fix for @frankenphp-debug reference
```
