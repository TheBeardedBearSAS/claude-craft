---
description: Audit Hetzner Cloud security posture
argument-hint: [scope]
---

# Hcloud Security Audit

You are a Hetzner Cloud security specialist. You must perform a comprehensive security audit of the Hetzner Cloud infrastructure.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Scope: firewall, ssh, network, tokens, certificates, full (default: full)

Example: `/hcloud:security-audit scope:full`

## Plan Mode

> **Plan mode is conditional.** Activates automatically when scope is "full" to present the audit plan before proceeding.

## MISSION

### Step 1: Scope Definition

```
══════════════════════════════════════════════════════════════
HCLOUD SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {firewall, ssh, network, tokens, certificates, full}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────

| Category | Included | Weight |
|----------|----------|--------|
| Firewalls | {yes/no} | 25% |
| SSH & Access | {yes/no} | 20% |
| Network Isolation | {yes/no} | 20% |
| API Tokens | {yes/no} | 20% |
| TLS & Certificates | {yes/no} | 15% |
```

### Step 2: Firewall Audit

```
──────────────────────────────────────────────────────────────
FIREWALL ANALYSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| All servers have firewalls | {yes/no} | {unprotected servers} |
| SSH restricted to known IPs | {yes/no} | {open to 0.0.0.0/0?} |
| DB ports private-only | {yes/no} | {exposed ports} |
| Label selectors used | {yes/no} | {static vs dynamic} |
| Deny-by-default | {yes/no} | {overly permissive rules} |
| IPv6 rules match IPv4 | {yes/no} | {missing rules} |
```

Scan all firewalls, check for servers without firewall protection, and identify overly permissive rules.

### Step 3: SSH & Access Audit

```
──────────────────────────────────────────────────────────────
SSH & ACCESS SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| SSH key algorithm | {ed25519/rsa} | {recommendation} |
| Password auth disabled | {yes/no} | {cloud-init check} |
| fail2ban configured | {yes/no} | {on which servers} |
| Root login policy | {prohibit-password/yes/no} | {setting} |
| SSH port | {22/custom} | {firewall protection} |
| Key rotation | {scheduled/none} | {last rotation} |
```

### Step 4: Network Isolation Audit

```
──────────────────────────────────────────────────────────────
NETWORK ISOLATION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Private network used | {yes/no} | {network name} |
| Subnet segmentation | {yes/no} | {web/app/data tiers} |
| DB has no public IP | {yes/no} | {exposed databases} |
| Bastion host pattern | {yes/no} | {access method} |
| Inter-service via private net | {yes/no} | {public IP usage} |
```

### Step 5: API Token Audit

```
──────────────────────────────────────────────────────────────
API TOKEN SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Tokens per environment | {yes/no} | {shared tokens?} |
| Read-only tokens for CI | {yes/no} | {scope} |
| Token in CI secrets | {yes/no} | {storage method} |
| Token rotation schedule | {yes/no} | {frequency} |
| No tokens in code | {yes/no} | {leaked tokens} |
```

### Step 6: TLS & Certificate Audit

```
──────────────────────────────────────────────────────────────
TLS & CERTIFICATES
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| TLS on load balancer | {yes/no} | {protocol} |
| Managed certificates | {yes/no} | {auto-renewal} |
| HTTP redirect to HTTPS | {yes/no} | {configured} |
| Certificate expiry | {ok/warning} | {days remaining} |
| Internal traffic encrypted | {yes/no/private-net} | {method} |
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
| Firewalls | {x}/100 | {pass/warn/fail} |
| SSH & Access | {x}/100 | {pass/warn/fail} |
| Network Isolation | {x}/100 | {pass/warn/fail} |
| API Tokens | {x}/100 | {pass/warn/fail} |
| TLS & Certificates | {x}/100 | {pass/warn/fail} |
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
