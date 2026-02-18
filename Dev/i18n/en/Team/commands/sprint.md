---
description: Sprint Development Team - Parallel story implementation using Agent Teams
argument-hint: <sprint-name> [--max-workers=3] [--overnight]
---

# Sprint Development Team - Parallel Story Implementation

Orchestrate parallel sprint execution using Claude Code Agent Teams (v2.1.32+). Spawns a sprint conductor (opus) plus 2-3 developer workers (sonnet), each taking an independent story from the backlog.

## Arguments

$ARGUMENTS

- `<sprint-name>`: Name or ID of the sprint to process
- `--max-workers=3`: Maximum parallel dev workers (default: 2, max: 3)
- `--overnight`: Run in overnight mode (bounded, stops at 6am)
- `--supervised`: Pause before each story for human confirmation
- `--max-stories=10`: Maximum stories to process (default: 10)
- `--timeout=12`: Maximum runtime in hours (default: 12)
- `--dry-run`: Show team composition and story assignments without executing
- `--max-cost=<dollars>`: Maximum budget in dollars. If the estimated parallel cost exceeds this threshold, execution is blocked with an OVER BUDGET message
- `--ralph-mode`: Enable Ralph recovery engine (error classification, auto-retry, escalation service) alongside Agent Teams parallelism.

## Prerequisites

- Claude Code v2.1.32+ with Agent Teams support
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment variable set
- BMAD sprint backlog with stories in `ready-for-dev` status
- Sprint metadata in `.bmad/sprint-status.yaml`
- At least 2 independent stories (single-story sprints use sequential Ralph)
- `Tools/AgentTeams/lib/ralph-teams-adapter.sh` available
- `Tools/AgentTeams/lib/compatibility-check.sh` available
- `Tools/AgentTeams/lib/cost-estimator.sh` available

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Fast Mode Guard (Blocking Confirmation)

**MANDATORY**: Before launching the team, the conductor MUST:

1. Detect if Fast Mode is active (lightning bolt indicator in terminal)
2. If Fast Mode is active:
   - Display the comparative dashboard standard vs fast via `cost-estimator.sh --fast-mode`
   - **Display a blocking warning** with cost comparison:
     ```
     ⚠️  FAST MODE DETECTED — Opus costs 6x higher!

     | Mode     | Input ($/M) | Output ($/M) | Estimated cost this sprint |
     |----------|-------------|--------------|---------------------------|
     | Standard | $5.00       | $25.00       | ~$X.XX                    |
     | Fast     | $30.00      | $150.00      | ~$Y.YY                    |

     Do you want to continue in Fast Mode? (yes/no)
     Recommendation: type /fast to disable before continuing.
     ```
   - **Wait for explicit user confirmation** before proceeding
   - If the user refuses, abort with a message suggesting `/fast` to disable

## When to Use (vs. Sequential Sprint)

| Condition | Use Team Sprint (parallel) | Use `--sequential` or single story |
|-----------|---------------------------|-------------------------------------|
| 1 story remaining | No | Yes |
| 2+ independent stories | Yes (~2x speedup) | Also valid (simpler) |
| Stories with shared files | No (write conflicts) | Yes |
| Overnight unattended | Yes (with `--overnight`) | Also valid |
| Budget-constrained | No (+25-35% token overhead) | Yes |

**Critical**: Stories must be fully independent (no shared file domains). If stories modify overlapping files, the conductor assigns them sequentially to the same worker.

## Process

### Step 1: Sprint Initialization

The sprint conductor loads sprint state:

1. Read `.bmad/sprint-status.yaml` for story list and statuses
2. Filter stories with status `ready-for-dev`
3. Analyze story independence (check for file domain overlap)
4. Partition stories into parallelizable groups
5. Estimate costs via `cost-estimator.sh --task-type sprint --techs <worker_count>`
6. **Budget guard**: If `--max-cost` is specified, check that estimated cost <= max_cost. If exceeded: display `OVER BUDGET`, abort, suggest reducing the number of stories or using `--sequential`

**Independence check**: Two stories are independent if their acceptance criteria and implementation scope do not reference the same source files. The conductor reviews each story's description and tech spec references to determine this.

### Step 2: Story Assignment

```
Sprint Conductor (opus) — coordinates via TaskCreate/SendMessage
  |
  +-- [Parallel Workers - max 3] --------+
  |   dev-worker-1 (sonnet): US-001       |
  |   dev-worker-2 (sonnet): US-002       |
  |   dev-worker-3 (sonnet): US-003       |
  +---------------------------------------+
  |
  v (sync barrier - all stories complete)
  |
  +-- [Sequential Review] ---------------+
  |   Conductor validates each story DoD   |
  +---------------------------------------+
```

**Lean context per worker**: Each worker only receives the project's technology reference (not all technologies). The conductor passes only `@.claude/references/<project-tech>/CLAUDE.md` in context.

**Shared file detection (B2)**: During independence analysis, explicitly detect shared directories (`**/Shared/**`, `**/Common/**`, `**/Utils/**`, `**/Helpers/**`). Stories touching files in these directories automatically receive an `overlaps_with` marker and are sequenced in the same worker.

The conductor creates one `TaskCreate` per story:

**Structured spawn template (TaskCreate)**:
```
Subject: "Implement US-XXX: <story title>"
Description:
  Project: <project-name>
  Technology: <project-tech>
  Story: <full story content>
  Acceptance criteria: <complete ACs with Gherkin>
  File domain: <expected source directories>
  Out-of-bounds: <directories NOT to modify>
  TDD commands: <docker-specific tech commands>
  Success criteria: All AC tests pass, lint clean, coverage not reduced
  Reference: @.claude/references/<tech>/CLAUDE.md
activeForm: "Implementing US-XXX"
```

### Step 3: Worker Execution (Per Story)

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

### Step 4: Story Transition

As each worker completes, the conductor:

1. Validates Definition of Done (DoD) for the story
2. Transitions story status: `in-progress` -> `review`
3. Assigns the next `ready-for-dev` story to the now-free worker
4. Repeats until no stories remain or limits are reached

**DoD validation checklist**:
- [ ] All acceptance criteria tests pass
- [ ] No new linting errors introduced
- [ ] Code coverage not decreased
- [ ] No secrets in committed code
- [ ] Story implementation matches tech spec

### Step 5: Error Recovery

The conductor classifies errors per the Ralph recovery engine:

| Level | Type | Action | Examples |
|-------|------|--------|----------|
| 0 | Transient | Auto-retry with backoff | Timeout, rate limit, network |
| 1 | Recoverable | Worker auto-fix + retry | Lint errors, test failures, deps |
| 2 | Degraded | Continue with warning | Docs, optional gates, coverage dip |
| 3 | Blocked | Escalate to human | Security, architecture, auth |

**Polling cadence (B5)**: The conductor polls `TaskList` every 30 seconds. After 3 consecutive polls without change, reduce to 60 seconds. Use `TeammateIdle`/`TaskCompleted` hooks (v2.1.33+) if available.

**Completion message verbosity (B4)**: Workers MUST limit their completion messages to < 50 tokens. Format: `DONE: US-XXX tests pass, +X files`. Write details in the task summary, not the message.

**Conductor context recovery (A6)**: To mitigate context compaction bug (#23620), the conductor MUST re-read `TaskList` every 5 worker completions to refresh its awareness of team state.

**Worker stuck detection**: If a worker hasn't updated its task in 10 minutes, the conductor sends a status check message. If no response within 2 minutes, the conductor marks the story as blocked and reassigns to another worker or queues for human review.

### Step 6: Sprint Completion

When all stories are processed:

1. Conductor generates sprint summary report
2. Updates `.bmad/sprint-status.yaml` via single-writer pattern
3. Sends `shutdown_request` to all workers
4. Reports final metrics

## Output

### Sprint Summary Report

```
================================================================
SPRINT DEVELOPMENT TEAM - Summary
================================================================

Sprint: <sprint-name>
Date: YYYY-MM-DD
Mode: Parallel (Agent Teams)
Team: 1 conductor + N dev workers

----------------------------------------------------------------
STORIES COMPLETED
----------------------------------------------------------------

| Story | Title | Worker | Time | DoD |
|-------|-------|--------|------|-----|
| US-001 | Login feature | dev-1 | 12m | PASS |
| US-002 | User profile | dev-2 | 18m | PASS |
| US-003 | Dashboard | dev-3 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOCKED
----------------------------------------------------------------

| Story | Title | Reason | Escalation |
|-------|-------|--------|------------|
| US-004 | Payment | Architecture dependency | Queued for human |

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Stories completed | X / Y |
| Stories blocked | Z |
| Total time | Xm (vs ~Ym sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Workers spawned | N |
| Avg time per story | Xm |
```

## Performance Expectations

| Workers | Stories | Sequential Est. | Team Est. | Speedup | Token Overhead |
|---------|---------|----------------|-----------|---------|----------------|
| 2 | 4 | ~60 min | ~35 min | ~1.7x | +25% |
| 2 | 6 | ~90 min | ~50 min | ~1.8x | +25% |
| 3 | 6 | ~90 min | ~40 min | ~2.2x | +30% |
| 3 | 9 | ~135 min | ~55 min | ~2.5x | +35% |

**Note**: Speedup depends on story independence and comparable complexity. If one story takes 3x longer than others, the bottleneck story limits overall speedup.

## Integration with Ralph Recovery Engine

When `--ralph-mode` is enabled, the Ralph Teams adapter (`Tools/AgentTeams/lib/ralph-teams-adapter.sh`) handles:

1. Error classification and auto-retry for transient failures
2. Bridging checkpoint/recovery with Agent Teams
3. Ensuring sprint-status.yaml updates follow single-writer pattern
4. Mapping Ralph error levels to Agent Teams recovery actions

## Error Handling

| Error | Recovery |
|-------|----------|
| Worker timeout (>15min per story) | Conductor reassigns story |
| Worker crash | Story returns to `ready-for-dev`, another worker picks up |
| All workers stuck | Conductor escalates to human |
| Sprint-status.yaml conflict | Single-writer pattern via file locking |
| Story has file overlap with another | Conductor assigns sequentially to same worker |
| Docker not available | Worker reports error, conductor tries source-only |

## Limitations

- Maximum 3 parallel dev workers (4 total including conductor)
- Stories must be independent (no shared file domains)
- Token cost is ~25-35% higher than sequential due to context duplication
- Requires Agent Teams Research Preview (API may change)
- Overnight mode depends on conductor agent stability (orphan risk exists)
- Not suitable for stories requiring interactive human decisions mid-implementation
