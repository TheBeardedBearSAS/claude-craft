---
description: Audit FrankenPHP security posture
argument-hint: [scope]
---

# FrankenPHP Security Audit

You are a FrankenPHP security specialist. You must perform a comprehensive security audit of the FrankenPHP deployment.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Scope: tls, headers, caddyfile, container, php, admin, full (default: full)

Example: `/frankenphp:security-audit scope:full`

## Plan Mode

> **Plan mode is conditional.** Activates automatically when scope is "full" to present the audit plan before proceeding.

## MISSION

### Step 1: Scope Definition

```
══════════════════════════════════════════════════════════════
FRANKENPHP SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {tls, headers, caddyfile, container, php, admin, full}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────

| Category | Included | Weight |
|----------|----------|--------|
| TLS Configuration | {yes/no} | 25% |
| Security Headers | {yes/no} | 20% |
| Caddyfile Hardening | {yes/no} | 20% |
| Container Security | {yes/no} | 15% |
| PHP Hardening | {yes/no} | 10% |
| Admin API | {yes/no} | 10% |
```

### Step 2: TLS Audit

```
──────────────────────────────────────────────────────────────
TLS CONFIGURATION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Auto-HTTPS enabled | {yes/no/proxy} | {configuration} |
| TLS protocol version | {1.3/1.2} | {recommendation} |
| HSTS header | {set/missing} | {max-age, preload} |
| Certificate validity | {valid/expiring/expired} | {days remaining} |
| HTTP/3 enabled | {yes/no} | {UDP 443 status} |
| ECH support | {yes/no} | {v1.6+ feature} |
| PQC support | {yes/no} | {v1.6+ feature} |
```

### Step 3: Security Headers Audit

```
──────────────────────────────────────────────────────────────
SECURITY HEADERS
──────────────────────────────────────────────────────────────

| Header | Status | Value |
|--------|--------|-------|
| Strict-Transport-Security | {set/missing} | {value} |
| X-Content-Type-Options | {set/missing} | {value} |
| X-Frame-Options | {set/missing} | {value} |
| Content-Security-Policy | {set/missing} | {value} |
| Referrer-Policy | {set/missing} | {value} |
| Permissions-Policy | {set/missing} | {value} |
| Server header removed | {yes/no} | {value} |
```

### Step 4: Caddyfile Audit

```
──────────────────────────────────────────────────────────────
CADDYFILE HARDENING
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Rate limiting configured | {yes/no} | {limits} |
| IP filtering (if needed) | {yes/no} | {rules} |
| Debug endpoints disabled | {yes/no} | {paths} |
| Error pages customized | {yes/no} | {no info leak} |
| Secrets via env vars | {yes/no} | {not hardcoded} |
```

### Step 5: Container Audit

```
──────────────────────────────────────────────────────────────
CONTAINER SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Non-root user | {yes/no} | {user} |
| Minimal capabilities | {yes/no} | {capabilities} |
| Read-only filesystem | {yes/no} | {writable paths} |
| No secrets in layers | {yes/no} | {assessment} |
| Image vulnerability scan | {pass/fail} | {CVE count} |
```

### Step 6: PHP Audit

```
──────────────────────────────────────────────────────────────
PHP SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| disable_functions | {set/empty} | {functions} |
| open_basedir | {set/empty} | {paths} |
| expose_php | {off/on} | {recommendation} |
| Session cookies secure | {yes/no} | {httpOnly, secure, sameSite} |
| allow_url_include | {off/on} | {recommendation} |
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
| TLS Configuration | {x}/100 | {pass/warn/fail} |
| Security Headers | {x}/100 | {pass/warn/fail} |
| Caddyfile Hardening | {x}/100 | {pass/warn/fail} |
| Container Security | {x}/100 | {pass/warn/fail} |
| PHP Hardening | {x}/100 | {pass/warn/fail} |
| Admin API | {x}/100 | {pass/warn/fail} |
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
