---
description: Delivery Team - Full sprint lifecycle (writing + implementation) using Agent Teams
argument-hint: <sprint-name|prd-path> [--phase=all|writing|implementation] [--max-workers=3]
---

# Delivery Team - Full Sprint Lifecycle (Writing + Implementation)

Orchestrate the complete sprint cycle using Claude Code Agent Teams (v2.1.32+). Phase 1 writes EPICs, User Stories (INVEST+3C+Gherkin), and tasks with cross-review. Phase 2 implements them in parallel using file domain mapping from Phase 1. The same Delivery Lead (opus) orchestrates both phases, preserving full context across the transition.

## Arguments

$ARGUMENTS

- `<sprint-name|prd-path>`: Sprint name/ID or path to the PRD document
- `--phase=all`: Phase to execute (default: `all`). Options: `all`, `writing`, `implementation`
- `--max-workers=3`: Maximum parallel workers per phase (default: 3, max: 3)
- `--overnight`: Run in overnight mode (bounded, stops at 6am)
- `--supervised`: Pause before each story for human confirmation
- `--max-stories=10`: Maximum stories to process (default: 10)
- `--timeout=16`: Maximum runtime in hours (default: 16)
- `--dry-run`: Show team composition, cost estimate, and story assignments without executing
- `--quality-threshold=6`: Minimum INVEST score for Phase 1 (default: 6/6)
- `--max-rewrites=2`: Maximum rewrite loops per artefact in Phase 1 (default: 2)

## Prerequisites

- Claude Code v2.1.32+ with Agent Teams support
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment variable set
- PRD or tech spec available (for Phase 1) or BMAD sprint backlog with `ready-for-dev` stories (for Phase 2 only)
- Sprint metadata in `.bmad/sprint-status.yaml`
- `Tools/AgentTeams/lib/compatibility-check.sh` available
- `Tools/AgentTeams/lib/cost-estimator.sh` available
- `Tools/AgentTeams/lib/result-aggregator.sh` available

## When to Use (vs. Sequential or Other Teams)

| Condition | Use Team Delivery | Alternative |
|-----------|------------------|-------------|
| Full cycle (plan + code), 3+ stories | **Yes (~2.2x speedup)** | Too slow sequentially |
| < 3 stories | No | `@product-owner` + `/team:sprint --sequential` |
| Single story | No | `/common:ralph-run` |
| 5+ independent stories | **Yes (best ROI)** | Possible but slow sequentially |
| Implementation only (stories exist) | Use `--phase=implementation` | `/team:sprint` |
| Writing only (no coding needed) | Use `--phase=writing` | `@product-owner` manually |
| Budget very constrained | No (+30-40% token overhead) | Sequential workflow |
| Need file domain mapping | **Yes (built-in)** | Manual coordination |

**Break-even**: Rentable starting at 3+ stories to write AND implement.

## Process

### Phase 1: Writing (Quality + Reliability)

#### Phase 1 Team Composition

```
Delivery Lead (opus) — orchestration, validation, shared context
  |
  +-- Writer (sonnet)    : Creates EPICs, US (INVEST+3C+Gherkin), tasks
  +-- Reviewer (sonnet)  : Validates quality (INVEST 6/6, AC coverage, testability, slicing)
  +-- Architect (sonnet) : Validates technical feasibility + file domain mapping
```

#### Step 1.1: Input Validation

The Delivery Lead validates the input:

1. Read PRD or tech spec from the provided path
2. Validate PRD Gate (>=80%) — if score is below threshold, abort with clear message
3. Extract features, requirements, and acceptance criteria scope
4. Create team via `TeamCreate`

#### Step 1.2: Team Spawn (Phase 1)

The Lead spawns 3 Phase 1 workers via `Task` tool:

1. **Writer** (sonnet): Instructed to create EPICs and User Stories following INVEST+3C+Gherkin format
2. **Reviewer** (sonnet): Instructed to validate quality against the checks table below
3. **Architect** (sonnet): Instructed to validate technical feasibility and produce file domain maps

#### Step 1.3: Artefact Pipeline

Pipeline is sequential per artefact, but **pipelined** across artefacts (multiple artefacts in flight at different stages simultaneously):

```
Writer creates → Reviewer validates quality → Architect validates tech + domains → Lead accepts/returns
     ^                                                                                    |
     └──────────────── Rewrite loop (max 2x, consolidated feedback) ──────────────────────┘
```

The Lead coordinates via `SendMessage`:
1. Assigns an artefact to the Writer via task
2. When Writer completes, sends artefact to Reviewer for quality validation
3. When Reviewer approves, sends to Architect for technical validation + domain mapping
4. When Architect approves, Lead marks artefact as accepted
5. If Reviewer OR Architect rejects, Lead consolidates feedback and returns to Writer (max `--max-rewrites` loops)
6. If artefact still fails after max rewrites, Lead flags it as `needs_human_review` and continues

#### Reviewer Quality Checks

| Check | Threshold | Source |
|-------|-----------|--------|
| INVEST score | 6/6 | `backlog-gate.yaml` |
| Nominal AC | >= 1 | `@product-owner` patterns |
| Alternative AC | >= 2 | `@product-owner` patterns |
| Error AC | >= 2 | `@product-owner` patterns |
| Gherkin format | 100% | Gate validation |
| Vertical slicing | Yes | `@tech-lead` patterns |
| Story points | 1-8 | INVEST "Small" criterion |
| Explicit benefit | Yes | INVEST "Valuable" criterion |

#### Architect File Domain Map Output

The Architect produces a file domain map for each User Story:

```yaml
US-001:
  file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  overlaps_with: []
US-002:
  file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]
  overlaps_with: []
US-003:
  file_domains: [src/Domain/User/, src/App/Auth/]
  overlaps_with: [US-001]  # → sequenced after US-001 in Phase 2
```

This map determines parallelization waves in Phase 2.

#### Step 1.4: Sprint Ready Gate

When all artefacts are processed, the Lead validates the Sprint Ready Gate (100%):

1. All stories have INVEST 6/6 (or are flagged `needs_human_review`)
2. File domain map is complete
3. Parallelization waves are computed
4. Sprint backlog is written to `.bmad/sprint-status.yaml`

#### Phase 1 Output

```
================================================================
DELIVERY TEAM - Phase 1: Writing Summary
================================================================

Sprint: <sprint-name>
Date: YYYY-MM-DD
Team: 1 lead + 3 writers

----------------------------------------------------------------
ARTEFACTS CREATED
----------------------------------------------------------------

| Artefact | Type | INVEST | Rewrites | Status |
|----------|------|--------|----------|--------|
| EPIC-001 | Epic | - | 0 | ACCEPTED |
| US-001 | Story | 6/6 | 0 | ACCEPTED |
| US-002 | Story | 6/6 | 1 | ACCEPTED |
| US-003 | Story | 6/6 | 0 | ACCEPTED |
| US-004 | Story | 4/6 | 2 | NEEDS_HUMAN_REVIEW |

----------------------------------------------------------------
FILE DOMAIN MAP
----------------------------------------------------------------

| Story | Domains | Overlaps |
|-------|---------|----------|
| US-001 | src/Domain/User/, src/App/User/ | - |
| US-002 | src/Domain/Order/, src/App/Order/ | - |
| US-003 | src/Domain/User/, src/App/Auth/ | US-001 |

----------------------------------------------------------------
PARALLELIZATION WAVES
----------------------------------------------------------------

Wave 1: [US-001, US-002] — independent (0 overlap)
Wave 2: [US-003]         — depends on files from US-001

----------------------------------------------------------------
QUALITY METRICS
----------------------------------------------------------------

| Metric | Value |
|--------|-------|
| Avg INVEST score | 5.5/6 |
| AC coverage (nom/alt/err) | 100% / 95% / 90% |
| Stories accepted | 3/4 |
| Stories needing review | 1/4 |
| Total rewrites | 3 |
| File domain overlaps | 1 |
```

### Phase Transition

If `--phase=all`, the Lead performs a team transition:

1. Send `shutdown_request` to Writer, Reviewer, Architect
2. Wait for all workers to shut down (~30s)
3. Lead retains full context from Phase 1 (stories, domain map, waves)
4. Proceed to Phase 2 spawn

### Phase 2: Implementation (Speed + Delegation)

#### Phase 2 Team Composition

```
Delivery Lead (opus) — same leader, Phase 1 context preserved
  |
  +-- dev-worker-1 (sonnet) : US-001 (TDD)
  +-- dev-worker-2 (sonnet) : US-002 (TDD)
  +-- dev-worker-3 (sonnet) : US-003 (TDD)
```

#### Advantages vs team-sprint Alone

1. **File domain map already computed** — assignment is reliable, no heuristic runtime analysis
2. **Higher quality stories** — complete ACs, less rework during implementation
3. **Lead with full context** — better assignment decisions
4. **Pre-computed waves**:
   ```
   Wave 1: [US-001, US-002] — independent (0 overlap)
   Wave 2: [US-003]         — depends on files from US-001
   ```

#### Step 2.1: Worker Spawn

The Lead spawns dev workers (up to `--max-workers`) and assigns stories by wave:

1. Wave 1 stories assigned in parallel (one story per worker)
2. When Wave 1 completes, Wave 2 stories assigned
3. Workers freed from completed stories pick up next available story

The Lead creates one `TaskCreate` per story:

- **Subject**: `Implement US-XXX: <story title>`
- **Description**: Full story content, acceptance criteria, tech spec references, TDD requirements, file domain scope
- **activeForm**: `Implementing US-XXX`

#### Step 2.2: Worker Execution (Per Story)

Each dev worker follows the TDD cycle for its assigned story:

```
1. Read story and acceptance criteria
2. RED: Write failing tests from acceptance criteria
3. GREEN: Implement minimal code to pass tests
4. REFACTOR: Clean up while keeping tests green
5. Run full test suite (docker-based)
6. Write result summary
7. Mark task as completed
```

**Worker TDD commands** (technology-specific):

```bash
# Symfony
docker compose exec php vendor/bin/phpunit
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php php bin/console lint:container

# React
docker compose exec node npm run test
docker compose exec node npm run lint
docker compose exec node npm run build

# Python
docker compose exec app pytest --cov
docker compose exec app ruff check .
docker compose exec app mypy .

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test
docker run --rm -v $(pwd):/app -w /app dart dart analyze
```

#### Step 2.3: Story Transition

As each worker completes, the Lead:

1. Validates Definition of Done (DoD) for the story
2. Transitions story status: `in-progress` -> `review`
3. Assigns the next story (respecting wave order) to the freed worker
4. Repeats until no stories remain or limits are reached

**DoD validation checklist**:
- [ ] All acceptance criteria tests pass
- [ ] No new linting errors introduced
- [ ] Code coverage not decreased
- [ ] No secrets in committed code
- [ ] Story implementation matches tech spec

#### Step 2.4: Error Recovery

The Lead classifies errors per the Ralph recovery engine:

| Level | Type | Action | Examples |
|-------|------|--------|----------|
| 0 | Transient | Auto-retry with backoff | Timeout, rate limit, network |
| 1 | Recoverable | Worker auto-fix + retry | Lint errors, test failures, deps |
| 2 | Degraded | Continue with warning | Docs, optional gates, coverage dip |
| 3 | Blocked | Escalate to human | Security, architecture, auth |

**Worker stuck detection**: If a worker hasn't updated its task in 10 minutes, the Lead sends a status check message. If no response within 2 minutes, the Lead marks the story as blocked and reassigns to another worker or queues for human review.

**File domain conflict detected at runtime**: If a worker reports a file conflict with another worker's scope, the Lead stops the conflicting worker, waits for the first to complete, then re-assigns sequentially.

### BMAD Gate Integration

| Gate | Threshold | When | Validated By |
|------|-----------|------|--------------|
| PRD Gate | >=80% | Before Phase 1 | Lead validates input |
| Backlog Gate | INVEST 6/6 | Phase 1 — per artefact | Reviewer |
| Sprint Ready Gate | 100% | End of Phase 1 | Lead |
| Story DoD Gate | 100% | Phase 2 — per story | Lead after worker |

### Step Final: Sprint Completion

When all stories are processed:

1. Lead generates the full delivery report
2. Updates `.bmad/sprint-status.yaml` via single-writer pattern
3. Sends `shutdown_request` to all dev workers
4. Reports final metrics

## Output

### Full Delivery Report

```
================================================================
DELIVERY TEAM - Full Report
================================================================

Sprint: <sprint-name>
Date: YYYY-MM-DD
Mode: Full Lifecycle (Writing + Implementation)
Team: 1 lead + 3 writers (Phase 1) + N dev workers (Phase 2)

================================================================
PHASE 1: WRITING SUMMARY
================================================================

| Artefact | Type | INVEST | Rewrites | Status |
|----------|------|--------|----------|--------|
| US-001 | Story | 6/6 | 0 | ACCEPTED |
| US-002 | Story | 6/6 | 1 | ACCEPTED |
| US-003 | Story | 6/6 | 0 | ACCEPTED |

Parallelization waves:
  Wave 1: [US-001, US-002]
  Wave 2: [US-003]

================================================================
PHASE 2: IMPLEMENTATION SUMMARY
================================================================

| Story | Title | Worker | Wave | Time | DoD |
|-------|-------|--------|------|------|-----|
| US-001 | Login feature | dev-1 | 1 | 12m | PASS |
| US-002 | User profile | dev-2 | 1 | 18m | PASS |
| US-003 | Dashboard | dev-1 | 2 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOCKED
----------------------------------------------------------------

| Story | Title | Phase | Reason | Escalation |
|-------|-------|-------|--------|------------|
| US-004 | Payment | Writing | INVEST 4/6 after 2 rewrites | needs_human_review |

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Stories written | X |
| Stories implemented | Y / Z |
| Stories blocked | W |
| Phase 1 time | Xm |
| Phase 2 time | Ym |
| Total time | Zm (vs ~Wm sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Avg INVEST score | X.X/6 |
| Workers spawned | N (Phase 1) + M (Phase 2) |
```

## Cost Analysis

For 1 EPIC, 5 US, ~25 tasks:

| Metric | Sequential | Team Delivery | Delta |
|--------|-----------|---------------|-------|
| Phase 1 tokens | ~350K | ~475K | +36% |
| Phase 2 tokens | ~500K | ~650K | +30% |
| Phase 1 time | ~45 min | ~20 min | -56% |
| Phase 2 time | ~75 min | ~35 min | -53% |
| **Total time** | **~120 min** | **~55 min** | **~2.2x** |
| Cost total* | ~$28 | ~$17 | **-38%** |

*Cost savings because Sonnet ($3/$15/M) handles most work vs Opus ($15/$75/M) in sequential mode.

## Performance Expectations

| Workers | Stories | Sequential Est. | Team Est. | Speedup | Token Overhead |
|---------|---------|----------------|-----------|---------|----------------|
| 3 (writing) + 2 (impl) | 4 | ~80 min | ~40 min | ~2.0x | +30% |
| 3 (writing) + 2 (impl) | 6 | ~120 min | ~55 min | ~2.2x | +32% |
| 3 (writing) + 3 (impl) | 6 | ~120 min | ~50 min | ~2.4x | +35% |
| 3 (writing) + 3 (impl) | 9 | ~180 min | ~75 min | ~2.4x | +37% |

**Note**: Speedup depends on story independence and comparable complexity. Phase transition adds ~30s overhead.

## Error Handling

| Error | Recovery |
|-------|----------|
| Artefact invalid after max rewrites | Flag `needs_human_review`, continue with next artefact |
| Architect timeout (>5min/US) | Proceed with partial domain map, stories marked `sequential-only` |
| Worker Phase 1 crash | Lead reassigns to remaining worker |
| Worker Phase 2 crash | Story returns to `ready-for-dev`, another worker picks up |
| File domain conflict detected at impl | Lead stops conflicting worker, sequences the stories |
| Sprint-status.yaml conflict | Single-writer pattern (Lead only) |
| PRD Gate fails (<80%) | Abort with clear message, suggest PRD improvement |
| All workers stuck | Lead escalates to human |

## Limitations

- Maximum 5 agents total (1 lead + 3 per phase, transition between phases ~30s)
- Quality depends on the quality of the PRD/tech spec input
- File domain mapping is heuristic (shared utilities may be missed)
- +30-40% token overhead vs sequential
- Requires Agent Teams Research Preview (API may change)
- Not suitable for EPICs/US requiring interactive human decisions mid-process
- Phase transition requires shutdown + respawn (~30s latency)
