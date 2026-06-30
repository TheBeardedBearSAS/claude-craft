---
description: "Kubernetes security posture audit"
argument-hint: "[namespace] [scope]"
---

# Kubernetes Security Audit

You are a Kubernetes security specialist. You must perform a comprehensive security audit of the cluster or namespace.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Namespace to audit (default: all namespaces)
- (Optional) Scope: rbac, network, pods, secrets, images, full (default: full)

Example: `/kubernetes:security-audit namespace:app-prod scope:full`

## Plan Mode

> **Plan mode is conditional.** Activates automatically when scope is "full" or spans multiple namespaces.

## MISSION

### Step 1: Scope Definition

```
══════════════════════════════════════════════════════════════
KUBERNETES SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {namespace or cluster-wide}
Categories: {rbac, network, pods, secrets, images}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────
```

### Step 2: RBAC Audit

```
──────────────────────────────────────────────────────────────
RBAC ANALYSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| cluster-admin bindings | {count} | {details} |
| Overly permissive roles | {count} | {details} |
| Unused ServiceAccounts | {count} | {details} |
| Token auto-mount | {enabled/disabled} | {details} |
```

### Step 3: Pod Security Audit

```
──────────────────────────────────────────────────────────────
POD SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| PSS enforcement | {restricted/baseline/none} | {details} |
| Root containers | {count} | {pod list} |
| Privileged containers | {count} | {pod list} |
| Read-only rootfs | {%} | {details} |
| Capabilities dropped | {%} | {details} |
| Seccomp profiles | {%} | {details} |
```

### Step 4: Network Security Audit

```
──────────────────────────────────────────────────────────────
NETWORK SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Default deny policies | {yes/no per ns} | {details} |
| Exposed services | {count} | {service list} |
| Ingress TLS | {%} | {details} |
| Internal service exposure | {count} | {details} |
```

### Step 5: Secrets Audit

```
──────────────────────────────────────────────────────────────
SECRETS MANAGEMENT
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Secrets in env vars | {count} | {details} |
| External secrets | {yes/no} | {tool} |
| Encryption at rest | {enabled/disabled} | {details} |
| Secret rotation | {automated/manual/none} | {details} |
```

### Step 6: Image Security

```
──────────────────────────────────────────────────────────────
IMAGE SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Latest tags | {count} | {images} |
| Unsigned images | {count} | {images} |
| Known vulnerabilities | {count} | {severity breakdown} |
| Trusted registries | {%} | {details} |
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
| RBAC | {x}/100 | {pass/warn/fail} |
| Pod Security | {x}/100 | {pass/warn/fail} |
| Network | {x}/100 | {pass/warn/fail} |
| Secrets | {x}/100 | {pass/warn/fail} |
| Images | {x}/100 | {pass/warn/fail} |
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
