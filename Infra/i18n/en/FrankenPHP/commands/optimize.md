---
description: Optimize FrankenPHP worker performance and throughput
argument-hint: [target]
---

# FrankenPHP Optimize

You are a FrankenPHP optimization specialist. You must analyze worker performance metrics and provide actionable recommendations for thread tuning, OPcache optimization, Early Hints configuration, and Mercure performance.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Target: worker-tuning, opcache, early-hints, mercure, full (default: full)

Example: `/frankenphp:optimize target:worker-tuning`

## Plan Mode

> **Plan mode is recommended.** Claude analyzes current performance profile before proposing optimizations.

## MISSION

### Step 1: Collect Profile

```
══════════════════════════════════════════════════════════════
FRANKENPHP OPTIMIZATION
══════════════════════════════════════════════════════════════

Target: {worker-tuning/opcache/early-hints/mercure/full}

──────────────────────────────────────────────────────────────
CURRENT PROFILE
──────────────────────────────────────────────────────────────

| Setting | Value |
|---------|-------|
| FrankenPHP version | {version} |
| PHP version | {version} |
| Mode | {worker/classic} |
| Threads | {auto/count} |
| max_requests | {value} |
| CPU count | {n} |
| Available memory | {GB} |
```

Collect metrics:
```bash
nproc && free -h
ps -o pid,rss,vsz -p $(pidof frankenphp)
frankenphp php-cli -i | grep -E "opcache|memory_limit"
grep -E "worker|thread" /etc/caddy/Caddyfile
```

### Step 2: Benchmark Baseline

```
──────────────────────────────────────────────────────────────
BASELINE BENCHMARK
──────────────────────────────────────────────────────────────

| Metric | Value | Method |
|--------|-------|--------|
| RPS | {n} | wrk -t4 -c100 -d30s |
| p50 latency | {ms} | wrk --latency |
| p99 latency | {ms} | wrk --latency |
| Memory (RSS) | {MB} | ps -o rss |
| TTFB | {ms} | curl timing |
```

### Step 3: Worker Tuning Analysis

```
──────────────────────────────────────────────────────────────
WORKER ANALYSIS
──────────────────────────────────────────────────────────────

| Parameter | Current | Recommended | Impact |
|-----------|---------|-------------|--------|
| Mode | {worker/classic} | {recommendation} | {description} |
| Threads | {current} | {auto/count} | {description} |
| max_requests | {current} | {500} | {description} |
| Memory per thread | {MB} | {target} | {description} |
```

### Step 4: OPcache Analysis

```
──────────────────────────────────────────────────────────────
OPCACHE OPTIMIZATION
──────────────────────────────────────────────────────────────

| Setting | Current | Recommended | Rationale |
|---------|---------|-------------|-----------|
| opcache.enable | {value} | 1 | {reason} |
| opcache.memory_consumption | {value} | 256 | {reason} |
| opcache.max_accelerated_files | {value} | 20000 | {reason} |
| opcache.validate_timestamps | {value} | 0 (prod) | {reason} |
| opcache.preload | {value} | /app/config/preload.php | {reason} |
| opcache.jit | {value} | 1255 | {reason} |
| opcache.jit_buffer_size | {value} | 128M | {reason} |
```

### Step 5: Early Hints & Network

```
──────────────────────────────────────────────────────────────
EARLY HINTS & NETWORK
──────────────────────────────────────────────────────────────

| Feature | Status | Recommendation |
|---------|--------|----------------|
| Early Hints (103) | {enabled/disabled} | {action} |
| HTTP/2 | {enabled/disabled} | {action} |
| HTTP/3 | {enabled/disabled} | {action} |
| Compression | {enabled/disabled} | {action} |
| Push directive | {configured/missing} | {action} |
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
| {optimization 1} | {high/med/low} | {high/med/low} | 1 |
| {optimization 2} | {high/med/low} | {high/med/low} | 2 |

──────────────────────────────────────────────────────────────
EXPECTED IMPROVEMENT
──────────────────────────────────────────────────────────────

| Metric | Before | Expected After | Change |
|--------|--------|----------------|--------|
| RPS | {n} | {n} | +{x}% |
| p99 latency | {ms} | {ms} | -{x}% |
| Memory | {MB} | {MB} | {stable} |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Apply worker tuning (thread count, max_requests)
2. [ ] Configure OPcache preloading and JIT
3. [ ] Enable Early Hints for critical resources
4. [ ] Re-benchmark after each change
5. [ ] Monitor memory stability over 24 hours
```
