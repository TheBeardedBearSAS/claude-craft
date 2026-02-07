---
description: SCRUM Backlog Validation (alias for gate-validate-backlog --no-gate)
---

# SCRUM Backlog Validation

> **ALIAS** — This command redirects to `/gate:validate-backlog --no-gate`. Use `/gate:validate-backlog` directly instead.

## Redirect

This command is an alias for simple (non-gated) backlog validation. Execute the following instead:

```
/gate:validate-backlog --no-gate
```

This runs INVEST validation without enforcing quality gate thresholds, making it suitable for quick checks during backlog refinement.

For full gate validation with pass/fail enforcement, use:

```
/gate:validate-backlog
```

## See Also

- `/gate:validate-backlog` — Full INVEST gate validation with scoring and pass/fail
- `/gate:validate-backlog --no-gate` — Simple INVEST validation without gate enforcement
