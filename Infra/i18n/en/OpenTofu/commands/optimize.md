---
description: OpenTofu cost optimization and resource analysis
argument-hint: [Target]
---

# OpenTofu Optimize

You are an OpenTofu cost optimization specialist. You must analyze infrastructure configurations and provide actionable cost reduction recommendations.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Target: resources, costs, tags, full (default: full)
- (Optional) Path to configuration directory

Example: `/opentofu:optimize target:full path:infra/`

## Plan Mode

> **Plan mode is recommended.** Claude analyzes current configurations before proposing optimizations.

## MISSION

### Step 1: Resource Analysis

```
══════════════════════════════════════════════════════════════
OPENTOFU OPTIMIZATION
══════════════════════════════════════════════════════════════

Target: {resources/costs/tags/full}
Path: {configuration path}

──────────────────────────────────────────────────────────────
RESOURCE INVENTORY
──────────────────────────────────────────────────────────────
```

Analyze with:
```bash
tofu state list | sort
infracost breakdown --path=. --format=table
```

### Step 2: Cost Breakdown

```
──────────────────────────────────────────────────────────────
COST ANALYSIS
──────────────────────────────────────────────────────────────

| Resource Type | Count | Monthly Cost | % Total |
|---------------|-------|-------------|---------|
| Compute | {n} | ${x} | {y}% |
| Database | {n} | ${x} | {y}% |
| Storage | {n} | ${x} | {y}% |
| Network | {n} | ${x} | {y}% |
| **Total** | | **${x}** | **100%** |
```

### Step 3: Right-Sizing Recommendations

```
──────────────────────────────────────────────────────────────
RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Resource | Current | Recommended | Savings |
|----------|---------|-------------|---------|
| {resource} | {type} | {type} | {x}% |
```

### Step 4: Tag Compliance

```
──────────────────────────────────────────────────────────────
TAG COMPLIANCE
──────────────────────────────────────────────────────────────

| Required Tag | Coverage | Missing Resources |
|-------------|----------|-------------------|
| CostCenter | {x}% | {list} |
| Environment | {x}% | {list} |
| Project | {x}% | {list} |
```

### Step 5: Optimization Actions

Generate specific OpenTofu configuration changes:
- Right-sized resource definitions
- Spot/preemptible instance configurations
- Storage tier optimization
- Default tags on provider
- OPA cost policies

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Optimization | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Right-size instances | High | Low | 1 |
| Enable spot instances | High | Medium | 2 |
| Tag compliance | Medium | Low | 3 |
| Infracost CI gate | Medium | Medium | 4 |

──────────────────────────────────────────────────────────────
ESTIMATED SAVINGS
──────────────────────────────────────────────────────────────

| Area | Current | Optimized | Monthly Savings |
|------|---------|-----------|-----------------|
| Compute | ${x} | ${y} | ${z} |
| Database | ${x} | ${y} | ${z} |
| Storage | ${x} | ${y} | ${z} |
| **Total** | **${x}** | **${y}** | **${z}** |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Apply right-sizing in dev first
2. [ ] Integrate Infracost in CI/CD
3. [ ] Enforce tag compliance via OPA
4. [ ] Review reserved instance opportunities
5. [ ] Schedule monthly cost review
```
