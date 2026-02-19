---
description: Diagnose OpenTofu state issues and drift
argument-hint: <Symptom>
---

# OpenTofu Debug

You are an OpenTofu troubleshooting specialist. You must systematically diagnose and resolve issues from the given symptoms.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "state lock conflict", "drift detected", "import failing")
- (Optional) Error message
- (Optional) Resource address

Example: `/opentofu:debug "state lock conflict on prod environment"`

## Plan Mode

> **Plan mode is not required.** This is a diagnostic command that proceeds immediately with investigation.

## MISSION

### Step 1: Gather Information

```
══════════════════════════════════════════════════════════════
OPENTOFU DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}

──────────────────────────────────────────────────────────────
ENVIRONMENT INFO
──────────────────────────────────────────────────────────────
```

Run diagnostic commands:
```bash
tofu version
tofu providers
tofu state list
tofu validate
TF_LOG=DEBUG tofu plan 2> debug.log
```

### Step 2: Root Cause Analysis

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| State health | {ok/corrupted} | {details} |
| Lock status | {free/locked} | {details} |
| Provider auth | {ok/failed} | {details} |
| Backend connectivity | {ok/failed} | {details} |
| Resource drift | {none/detected} | {details} |
| Config validity | {ok/errors} | {details} |

Root Cause: {explanation}
```

### Step 3: Resolution

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Provide:
1. **Immediate fix** -- Commands to resolve now
2. **Explanation** -- Why this happened
3. **Prevention** -- How to prevent recurrence

### Step 4: Verification

```bash
# Verify fix
tofu validate
tofu plan
tofu state list
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
