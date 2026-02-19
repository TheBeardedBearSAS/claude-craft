---
description: Diagnose Kubernetes issues from symptoms
argument-hint: <Symptom> [namespace]
---

# Kubernetes Debug

You are a Kubernetes troubleshooting specialist. You must systematically diagnose and resolve issues from the given symptoms.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "pods stuck in CrashLoopBackOff", "service not reachable")
- (Optional) Namespace
- (Optional) Pod name or deployment name

Example: `/kubernetes:debug "CrashLoopBackOff on api pods" namespace:app-prod`

## Plan Mode

> **Plan mode is not required.** This is a diagnostic command that proceeds immediately with investigation.

## MISSION

### Step 1: Gather Information

```
══════════════════════════════════════════════════════════════
KUBERNETES DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Namespace: {namespace}

──────────────────────────────────────────────────────────────
CLUSTER STATUS
──────────────────────────────────────────────────────────────
```

Run diagnostic commands:
```bash
# Cluster overview
kubectl get nodes
kubectl get pods -n {namespace}
kubectl get events -n {namespace} --sort-by='.lastTimestamp' | tail -20

# Problem resource details
kubectl describe pod {pod} -n {namespace}
kubectl logs {pod} -n {namespace} --tail=50
kubectl logs {pod} -n {namespace} --previous --tail=50
```

### Step 2: Root Cause Analysis

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Pod status | {status} | {details} |
| Events | {normal/warning} | {details} |
| Logs | {error/clean} | {details} |
| Resources | {ok/exhausted} | {details} |
| Network | {ok/issue} | {details} |
| Storage | {ok/issue} | {details} |

Root Cause: {explanation}
```

### Step 3: Resolution

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Provide:
1. **Immediate fix** -- Commands or manifest changes to resolve now
2. **Explanation** -- Why this happened
3. **Prevention** -- How to prevent recurrence

### Step 4: Verification

```bash
# Verify fix
kubectl get pods -n {namespace}
kubectl describe pod {pod} -n {namespace}
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

- [ ] {prevention measure 1}
- [ ] {prevention measure 2}
- [ ] {monitoring recommendation}
```
