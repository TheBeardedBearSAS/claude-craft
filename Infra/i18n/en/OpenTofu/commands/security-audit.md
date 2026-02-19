---
description: Audit OpenTofu security posture
argument-hint: [Scope]
---

# OpenTofu Security Audit

You are an OpenTofu security specialist. You must perform a comprehensive security audit of the IaC configuration.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Scope: encryption, secrets, iam, policies, full (default: full)
- (Optional) Path to configuration directory

Example: `/opentofu:security-audit scope:full path:infra/`

## Plan Mode

> **Plan mode is conditional.** Activates automatically when scope is "full" or spans multiple environments.

## MISSION

### Step 1: Scope Definition

```
══════════════════════════════════════════════════════════════
OPENTOFU SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {full / encryption / secrets / iam / policies}
Path: {configuration path}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────
```

### Step 2: State Encryption Audit

```
──────────────────────────────────────────────────────────────
STATE ENCRYPTION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Native encryption (v1.7+) | {enabled/disabled} | {method} |
| Backend encryption | {enabled/disabled} | {type} |
| Plan encryption | {enabled/disabled} | {details} |
| Key management | {KMS/PBKDF2/none} | {details} |
```

### Step 3: Secrets Audit

```
──────────────────────────────────────────────────────────────
SECRETS MANAGEMENT
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Hardcoded secrets | {count} | {files} |
| Sensitive variables | {%} | {missing list} |
| Ephemeral values | {used/not} | {v1.11+} |
| .tfvars in VCS | {yes/no} | {files} |
| CI/CD credentials | {OIDC/static} | {details} |
```

### Step 4: IAM & Access Audit

```
──────────────────────────────────────────────────────────────
ACCESS CONTROL
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| IAM least privilege | {yes/no} | {overly broad policies} |
| State backend ACL | {scoped/open} | {details} |
| CI/CD separation | {plan/apply roles} | {details} |
| Manual apply disabled | {yes/no} | {details} |
```

### Step 5: Policy & Compliance Audit

```
──────────────────────────────────────────────────────────────
POLICY ENFORCEMENT
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| tfsec/checkov | {integrated/no} | {findings} |
| OPA policies | {yes/no} | {count} |
| Provider lock file | {committed/missing} | {details} |
| Tag compliance | {enforced/no} | {details} |
```

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
SECURITY AUDIT REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Category | Score | Status |
|----------|-------|--------|
| State Encryption | {x}/100 | {pass/warn/fail} |
| Secrets Management | {x}/100 | {pass/warn/fail} |
| Access Control | {x}/100 | {pass/warn/fail} |
| Policy Enforcement | {x}/100 | {pass/warn/fail} |
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
