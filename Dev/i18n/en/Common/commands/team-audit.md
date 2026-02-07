---
description: Full Audit Team - Parallel multi-technology audit using Agent Teams
argument-hint: [--techs=auto|tech1,tech2] [--max-workers=4]
---

# Full Audit Team - Parallel Multi-Technology Audit

Orchestrate a parallel full-audit across multiple technology stacks using Claude Code Agent Teams (v2.1.32+). Spawns a lead agent (opus) plus N stack-auditor workers (haiku), one per detected technology stack, up to a configurable maximum.

## Arguments

$ARGUMENTS

- `--techs=auto`: Auto-detect technologies (default). Or specify comma-separated: `--techs=symfony,react`
- `--max-workers=4`: Maximum parallel auditor workers (default: 4, max: 4)
- `--output-dir=<path>`: Custom output directory for audit results
- `--dry-run`: Show team composition and estimated cost without executing
- `--skip-aggregation`: Output per-stack results without merging
- `--sequential`: Run audits sequentially instead of in parallel (no Agent Teams overhead, equivalent to `/common:full-audit` but with team-audit reporting format). Useful for single-technology projects or when Agent Teams is not available.

## Prerequisites

- Claude Code v2.1.32+ with Agent Teams support
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment variable set
- Project with 2+ detected technology stacks (single-stack projects should use sequential `/common:full-audit`)
- `Tools/AgentTeams/lib/compatibility-check.sh` available
- `Tools/AgentTeams/lib/result-aggregator.sh` available
- `Tools/AgentTeams/lib/cost-estimator.sh` available

## When to Use (vs. Sequential Audit)

| Condition | Use Team Audit | Use Sequential `/common:full-audit` |
|-----------|---------------|--------------------------------------|
| 1 technology stack | No | Yes |
| 2+ technology stacks | Yes | Also valid (simpler, cheaper) |
| Time-sensitive | Yes (2-3x speedup) | No |
| Budget-constrained | No (+20-35% token overhead) | Yes |

**Break-even**: Parallelization benefits emerge at 2+ stacks. For a single stack, coordination overhead exceeds time saved.

## Process

### Step 1: Technology Detection

```
Audit Leader (opus)
  |
  v
Scan project root for technology markers:
  composer.json + symfony/*      -> Symfony
  pubspec.yaml + flutter:        -> Flutter
  pyproject.toml / requirements  -> Python
  package.json + react           -> React
  package.json + react-native    -> React Native
  package.json + @angular/core   -> Angular
  package.json + vue             -> Vue.js
  artisan + laravel/*            -> Laravel
  *.csproj + dotnet              -> C#/.NET
  composer.json (no symfony)     -> PHP
```

If `--techs=auto`, detect all. If explicit, validate specified stacks exist.

**Decision gate**: If only 1 technology detected, fall back to sequential `/common:full-audit` (no team overhead needed).

### Step 2: Compatibility Check

Before spawning workers, validate each auditor agent against role requirements:

```bash
# For each detected stack, verify the reviewer agent has required tools
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash \
  --require-model haiku
```

If any agent fails compatibility, log a warning and exclude that stack from parallel execution (fall back to leader handling it sequentially).

### Step 3: Cost Estimation

Before spawning the team, estimate token costs:

```bash
Tools/AgentTeams/lib/cost-estimator.sh \
  --team-size <N+1> \
  --lead-model opus \
  --worker-model haiku \
  --task-type audit \
  --stacks <detected_count>
```

Display estimated cost to user. In `--dry-run` mode, stop here.

### Step 4: Team Spawn (Fan-Out)

```
Audit Leader (opus) — coordinates via TaskCreate/SendMessage
  |
  +-- [Parallel Workers - max 4] --------+
  |   stack-auditor-1 (haiku): Symfony     |
  |   stack-auditor-2 (haiku): React       |
  |   stack-auditor-3 (haiku): Python      |
  |   stack-auditor-4 (haiku): Angular     |
  +---------------------------------------+
```

**Team creation pattern:**

1. Leader creates isolated output directories per worker (one per stack)
2. Leader creates tasks via `TaskCreate` for each stack audit:
   - Task subject: `Audit <TechName> stack`
   - Task description: includes check-architecture, check-code-quality, check-testing, check-security, check-compliance instructions
   - Each task specifies its isolated output path
3. Workers claim tasks via `TaskUpdate` (status: in_progress)
4. Workers write results to their isolated directory only

**Worker instructions** (per stack):

Each worker executes the 4 audit categories sequentially within its stack:

| Category | Points | What to Check |
|----------|--------|---------------|
| Architecture (25pts) | Layer separation, dependency direction, folder conventions, no framework coupling |
| Code Quality (25pts) | Naming standards, linting, type hints, documentation, complexity < 10 |
| Testing (25pts) | Coverage >= 80%, unit tests, integration tests, E2E tests, test pyramid |
| Security (25pts) | No secrets, input validation, OWASP, encryption, dependency CVEs |

Workers run Docker-based diagnostic commands per stack:

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text
docker compose exec php composer audit

# React
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
docker compose exec node npm audit

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov
docker compose exec app pip-audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

Each worker writes `result.json` to its isolated output directory:

```json
{
  "tech": "symfony",
  "score": 82,
  "architecture": { "score": 22, "findings": [...] },
  "code_quality": { "score": 20, "findings": [...] },
  "testing": { "score": 18, "findings": [...] },
  "security": { "score": 22, "findings": [...] }
}
```

### Step 5: Sync Barrier

Leader waits for all worker tasks to reach `completed` status via `TaskList` polling. If a worker exceeds its timeout (5 minutes per stack), leader marks it as failed and proceeds with partial results.

### Step 6: Result Aggregation

Leader runs the result aggregator:

```bash
Tools/AgentTeams/lib/result-aggregator.sh \
  --input-dir <isolated-output-root> \
  --output-file audit-report.json
```

The aggregator:
- Collects all `result.json` files from isolated directories
- Deduplicates findings (same file + same message = duplicate)
- Resolves score conflicts via weighted average
- Produces unified report

### Step 7: Report Generation

Leader generates the formatted multi-technology audit report:

```
================================================================
MULTI-TECHNOLOGY AUDIT (Agent Teams) - Global Score: XX/100
================================================================

Detected technologies: [list]
Team size: 1 leader + N workers
Execution mode: Parallel
Date: YYYY-MM-DD

----------------------------------------------------------------
SYMFONY - Score: XX/100
----------------------------------------------------------------

Architecture (XX/25)
  [PASS] Clean Architecture respected
  [PASS] CQRS implemented correctly
  [WARN] 2 services directly access Repository

Code Quality (XX/25)
  [PASS] PHPStan level 8 - 0 errors
  [WARN] 5 methods > 20 lines

Testing (XX/25)
  [PASS] Coverage: 85%
  [WARN] No Panther E2E tests

Security (XX/25)
  [PASS] No secrets in code
  [WARN] Dependency with minor CVE

----------------------------------------------------------------
REACT - Score: XX/100
----------------------------------------------------------------

[Same structure per technology]

================================================================
GLOBAL SUMMARY
================================================================

| Technology | Architecture | Code | Tests | Security | Total |
|------------|-------------|------|-------|----------|-------|
| Symfony    | XX/25       | XX/25| XX/25 | XX/25    | XX/100|
| React      | XX/25       | XX/25| XX/25 | XX/25    | XX/100|
| AVERAGE    | XX/25       | XX/25| XX/25 | XX/25    | XX/100|

================================================================
TOP 5 PRIORITY ACTIONS
================================================================

1. [CRITICAL] Action description
   -> Impact: +X points | Effort: Low/Medium/High

2. [HIGH] Action description
   -> Impact: +X points | Effort: Low/Medium/High

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Total time | Xs (vs ~Ys sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Token overhead vs sequential | +XX% |
| Workers spawned | N |
| Workers completed | N |
| Workers failed | 0 |
```

### Step 8: Cleanup

Leader sends `shutdown_request` to all workers and cleans up isolated output directories (unless `--keep-artifacts` is specified).

## Scoring Rules

Same as `/common:full-audit`:

| Violation | Points Lost |
|-----------|-------------|
| Architectural pattern violated | -5 |
| Framework/domain coupling | -3 |
| Critical linting error | -2 |
| Linting warning | -1 |
| Method > 30 lines | -1 |
| Coverage < 80% | -5 |
| No domain unit tests | -5 |
| Secret in code | -10 |
| Critical CVE vulnerability | -10 |
| High CVE vulnerability | -5 |

## Performance Expectations

| Stacks | Sequential Estimate | Team Estimate | Speedup | Token Overhead |
|--------|--------------------|--------------:|---------|----------------|
| 2 | ~4 min | ~2.5 min | ~1.6x | +20% |
| 3 | ~6 min | ~3 min | ~2x | +25% |
| 4 | ~8 min | ~3.5 min | ~2.3x | +30% |
| 5+ | ~10+ min | ~4 min | ~2.5x | +35% |

**Note**: These are realistic estimates accounting for coordination overhead (agent spawn ~5-10s, task assignment, result aggregation). Do not expect linear speedup.

## Error Handling

| Error | Recovery |
|-------|----------|
| Worker timeout (>5min) | Leader marks failed, proceeds with partial results |
| Worker crash | Leader logs error, excludes stack from report |
| Docker not available | Worker reports error, leader falls back to source-only analysis |
| No technologies detected | Abort with clear message |
| Single technology only | Fall back to sequential `/common:full-audit` |
| Compatibility check fails | Exclude stack from parallel, leader handles sequentially |

## Limitations

- Maximum 4 parallel workers (coordination overhead dominates beyond this)
- Token cost is ~20-35% higher than sequential due to context duplication per worker
- Requires Agent Teams Research Preview (API may change)
- Each worker loads project context independently (~10-20K tokens overhead each)
