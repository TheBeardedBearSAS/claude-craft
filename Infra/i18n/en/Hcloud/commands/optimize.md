---
description: Optimize Hetzner Cloud cost and performance
argument-hint: [target]
---

# Hcloud Optimize

You are a Hetzner Cloud optimization specialist. You must analyze infrastructure resource utilization and provide actionable recommendations for cost savings and performance improvements.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Target: cost, performance, both (default: both)

Example: `/hcloud:optimize target:cost`

## Plan Mode

> **Plan mode is recommended.** Claude analyzes current resource utilization before proposing optimizations.

## MISSION

### Step 1: Resource Inventory

```
══════════════════════════════════════════════════════════════
HCLOUD OPTIMIZATION
══════════════════════════════════════════════════════════════

Target: {cost/performance/both}

──────────────────────────────────────────────────────────────
CURRENT RESOURCE PROFILE
──────────────────────────────────────────────────────────────

| Resource | Count | Monthly Cost | Details |
|----------|-------|-------------|---------|
| Servers | {n} | {cost}€ | {types breakdown} |
| Volumes | {n} | {cost}€ | {total GB} |
| Load Balancers | {n} | {cost}€ | {types} |
| Floating IPs | {n} | {cost}€ | {assigned/unassigned} |
| Snapshots | {n} | {cost}€ | {total GB} |
| **Total** | | **{total}€** | |
```

Inventory all resources using hcloud CLI and calculate current monthly costs.

### Step 2: Server Right-Sizing

```
──────────────────────────────────────────────────────────────
SERVER RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Server | Current Type | CPU Avg | RAM Avg | Recommendation | Savings |
|--------|-------------|---------|---------|----------------|---------|
| {name} | {type} | {x}% | {x}% | {new type} | {x}€/mo |
```

Check server metrics and identify:
- **Oversized servers** (CPU < 20%): downsize or switch to shared (CX)
- **ARM candidates** (compatible workloads): switch to CAX for 30-50% savings
- **Undersized servers** (CPU > 80%): upgrade or scale horizontally

### Step 3: ARM Migration Assessment

```
──────────────────────────────────────────────────────────────
ARM (CAX) MIGRATION OPPORTUNITIES
──────────────────────────────────────────────────────────────

| Server | Current | Proposed ARM | Monthly Savings | Compatible |
|--------|---------|-------------|-----------------|------------|
| {name} | {type} ({cost}€) | {cax type} ({cost}€) | {savings}€ | {yes/no} |
```

Evaluate each server for ARM compatibility (Go, Node.js, Python, Java, .NET 8+, PostgreSQL, MySQL, Redis all support ARM).

### Step 4: Resource Cleanup

```
──────────────────────────────────────────────────────────────
UNUSED RESOURCES
──────────────────────────────────────────────────────────────

| Resource | Name | Status | Cost | Action |
|----------|------|--------|------|--------|
| Server | {name} | Stopped | {cost}€/mo | Snapshot + delete |
| Volume | {name} | Unattached | {cost}€/mo | Archive or delete |
| Floating IP | {ip} | Unassigned | {cost}€/mo | Delete |
| Snapshot | {name} | > 30 days | {cost}€ | Delete |
```

Identify stopped servers, unattached volumes, unassigned floating IPs, and old snapshots.

### Step 5: Performance Optimization

```
──────────────────────────────────────────────────────────────
PERFORMANCE TUNING
──────────────────────────────────────────────────────────────

| Setting | Current | Recommended | Impact |
|---------|---------|-------------|--------|
| Placement groups | {used/unused} | Used for HA | Spread across hosts |
| Private network | {used/unused} | Used for all internal | Lower latency, free |
| Load balancer type | {lb11/lb21} | {recommendation} | Throughput |
| Volume I/O | {standard} | Consider local SSD | IOPS improvement |
| Server location | {location} | {recommendation} | Latency |
```

Key optimization patterns:
- **Private network** for inter-server traffic (free, lower latency)
- **Placement groups** with spread policy for high availability
- **Local SSD** over block volumes for ephemeral high-IOPS workloads
- **CDN** for static assets to reduce outbound bandwidth

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Optimization | Impact | Effort | Monthly Savings | Priority |
|-------------|--------|--------|-----------------|----------|
| Right-size servers | High | Low | {x}€ | 1 |
| Migrate to ARM (CAX) | High | Medium | {x}€ | 2 |
| Delete unused resources | Medium | Low | {x}€ | 3 |
| Clean old snapshots | Low | Low | {x}€ | 4 |
| Optimize networking | Medium | Medium | {x}€ | 5 |

**Total potential savings: {total}€/month ({percentage}% reduction)**

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Apply server right-sizing recommendations
2. [ ] Test ARM compatibility for identified servers
3. [ ] Delete unused resources after team confirmation
4. [ ] Setup snapshot cleanup automation
5. [ ] Audit security posture with /hcloud:security-audit
```
