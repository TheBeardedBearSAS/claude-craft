---
description: Optimize Kubernetes resource usage and costs
argument-hint: [namespace] [target]
---

# Kubernetes Optimize

You are a Kubernetes optimization specialist. You must analyze resource usage and provide actionable recommendations for right-sizing, autoscaling, and cost reduction.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Namespace to optimize (default: all namespaces)
- (Optional) Target: resources, autoscaling, costs, full (default: full)

Example: `/kubernetes:optimize namespace:app-prod target:resources`

## Plan Mode

> **Plan mode is recommended.** Claude analyzes current resource usage before proposing changes.

## MISSION

### Step 1: Resource Analysis

```
══════════════════════════════════════════════════════════════
KUBERNETES OPTIMIZATION
══════════════════════════════════════════════════════════════

Namespace: {namespace}
Target: {resources/autoscaling/costs/full}

──────────────────────────────────────────────────────────────
CURRENT RESOURCE USAGE
──────────────────────────────────────────────────────────────
```

Analyze with:
```bash
kubectl top pods -n {namespace}
kubectl top nodes
kubectl get hpa -n {namespace}
kubectl get pdb -n {namespace}
kubectl get vpa -n {namespace}
```

### Step 2: Right-Sizing Analysis

```
──────────────────────────────────────────────────────────────
RIGHT-SIZING RECOMMENDATIONS
──────────────────────────────────────────────────────────────

| Workload | Current Req | Current Limit | Actual Usage | Recommended |
|----------|-------------|---------------|--------------|-------------|
| api | 500m/512Mi | 1/1Gi | 120m/200Mi | 200m/300Mi |
| worker | 250m/256Mi | 500m/512Mi | 50m/100Mi | 100m/150Mi |

Potential savings: {estimate}
```

### Step 3: Autoscaling Configuration

```
──────────────────────────────────────────────────────────────
AUTOSCALING RECOMMENDATIONS
──────────────────────────────────────────────────────────────

| Workload | Current | Recommended HPA | VPA Suggestion |
|----------|---------|-----------------|----------------|
| api | 3 fixed | 2-10, CPU 70% | mode: Auto |
| worker | 2 fixed | 1-5, queue length | mode: Auto |
```

Generate HPA manifests:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

### Step 4: PodDisruptionBudget

```
──────────────────────────────────────────────────────────────
PDB RECOMMENDATIONS
──────────────────────────────────────────────────────────────

| Workload | Replicas | PDB | Recommendation |
|----------|----------|-----|----------------|
| api | 3 | none | minAvailable: 2 |
| worker | 2 | none | minAvailable: 1 |
```

Generate PDB manifests.

### Step 5: Cost Optimization

```
──────────────────────────────────────────────────────────────
COST ANALYSIS
──────────────────────────────────────────────────────────────

| Area | Current | Optimized | Savings |
|------|---------|-----------|---------|
| Compute (CPU) | {x} cores | {y} cores | {z}% |
| Memory | {x} Gi | {y} Gi | {z}% |
| Storage | {x} Gi | {y} Gi | {z}% |
| Spot/Preemptible | {no} | {recommended} | {z}% |
```

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
| Right-size requests | High | Low | 1 |
| Add HPA | High | Medium | 2 |
| Add PDB | Medium | Low | 3 |
| Spot instances | High | Medium | 4 |

──────────────────────────────────────────────────────────────
GENERATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| {file} | {description} |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Apply right-sizing in staging first
2. [ ] Enable HPA and monitor for 24h
3. [ ] Add PDBs before next maintenance window
4. [ ] Configure monitoring with @kubernetes-monitoring
```
