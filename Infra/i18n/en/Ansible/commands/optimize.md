---
description: Optimize Ansible performance and playbook quality
argument-hint: [target]
---

# Ansible Optimize

You are an Ansible optimization specialist. You must analyze playbook performance and provide actionable recommendations for speed, quality, and maintainability improvements.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Target: performance, quality, both (default: both)

Example: `/ansible:optimize target:performance`

## Plan Mode

> **Plan mode is recommended.** Claude analyzes current playbook structure and execution patterns before proposing optimizations.

## MISSION

### Step 1: Performance Analysis

```
══════════════════════════════════════════════════════════════
ANSIBLE OPTIMIZATION
══════════════════════════════════════════════════════════════

Target: {performance/quality/both}

──────────────────────────────────────────────────────────────
CURRENT PERFORMANCE PROFILE
──────────────────────────────────────────────────────────────

| Setting | Current | Recommended | Impact |
|---------|---------|-------------|--------|
| forks | {value} | 20-50 | Parallelism |
| pipelining | {enabled/disabled} | enabled | SSH roundtrips |
| fact_caching | {none/jsonfile/redis} | jsonfile/redis | Fact gathering |
| gather_facts | {yes/no/smart} | smart | Startup time |
| strategy | {linear/free/host_pinned} | free (where safe) | Execution order |
| SSH multiplexing | {enabled/disabled} | enabled | Connection reuse |
```

Profile with `ANSIBLE_CALLBACKS_ENABLED=timer,profile_tasks` and measure connection overhead with `ansible.builtin.ping`.

### Step 2: Connection Optimization

```
──────────────────────────────────────────────────────────────
CONNECTION TUNING
──────────────────────────────────────────────────────────────
```

Generate optimized `ansible.cfg` connection settings:

```ini
[defaults]
forks = 25
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout = 86400
callbacks_enabled = timer, profile_tasks

[ssh_connection]
pipelining = True
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
control_path_dir = ~/.ansible/cp
```

| Optimization | Before | After | Improvement |
|-------------|--------|-------|-------------|
| Pipelining | disabled | enabled | ~2x faster per task |
| ControlMaster | disabled | auto | Reuse SSH connections |
| Fact caching | none | jsonfile | Skip gather_facts |
| Forks | 5 | 25 | 5x parallelism |

### Step 3: Playbook Optimization

```
──────────────────────────────────────────────────────────────
PLAYBOOK TUNING
──────────────────────────────────────────────────────────────

| Pattern | Current | Recommendation | Impact |
|---------|---------|----------------|--------|
| gather_facts | always | smart / per-play | Reduce startup |
| import vs include | {mixed} | import for static, include for dynamic | Predictability |
| serial batching | {value} | serial: "30%" for rolling | Availability |
| async tasks | {count} | Use for long-running tasks (>30s) | Parallelism |
| free strategy | {used/unused} | Use for independent tasks | Execution time |
| tags | {used/unused} | Tag all tasks for selective runs | Flexibility |
```

Key optimization patterns:
- **Async** for tasks >30s: `async: 300, poll: 10`
- **Free strategy** for independent hosts: `strategy: free`
- **Selective facts**: `gather_subset: [network]` instead of full gather
- **Batch module calls**: pass list to `ansible.builtin.apt name:` instead of looping

### Step 4: Quality Analysis

```
──────────────────────────────────────────────────────────────
QUALITY AUDIT
──────────────────────────────────────────────────────────────

| Check | Score | Details |
|-------|-------|---------|
| ansible-lint compliance | {x}/100 | {violations count} |
| FQCN usage | {x}% | {non-FQCN tasks} |
| Idempotence | {pass/fail} | {non-idempotent tasks} |
| Role design | {good/needs work} | {monolithic roles} |
| Variable naming | {consistent/inconsistent} | {convention violations} |
| Handler usage | {proper/missing} | {restart without handler} |
| Tag coverage | {x}% | {untagged tasks} |
| Molecule coverage | {x}% | {untested roles} |
```

Run `ansible-lint`, check for non-idempotent shell/command tasks missing `changed_when`/`creates`/`removes`, and verify FQCN compliance.

### Step 5: Final Report

```
══════════════════════════════════════════════════════════════
OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Optimization | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Enable pipelining | High | Low | 1 |
| Enable fact caching | High | Low | 2 |
| Increase forks | Medium | Low | 3 |
| Optimize loops | Medium | Medium | 4 |
| Add async for long tasks | Medium | Medium | 5 |
| Fix ansible-lint violations | Medium | Medium | 6 |
| Add Molecule tests | High | High | 7 |

──────────────────────────────────────────────────────────────
GENERATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| ansible.cfg | Optimized Ansible configuration |
| .ansible-lint | Updated lint configuration |
| {playbook} | Refactored playbook with optimizations |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Apply ansible.cfg tuning to all environments
2. [ ] Run molecule tests to validate no regressions
3. [ ] Setup CI pipeline with /ansible:deploy-setup
4. [ ] Audit security posture with /ansible:security-audit
5. [ ] Monitor execution times with callback profiling
```
