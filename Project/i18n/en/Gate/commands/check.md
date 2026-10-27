---
description: "Run any quality gate: document gates (PRD, tech spec, backlog, sprint, story, alignment), code gates (commit, merge, release), the full report or a phase checkpoint"
argument-hint: "<prd|spec|backlog|sprint|story|alignment|commit|merge|release|all> [--phase=pre-sprint|pre-impl|post-impl|pre-merge] [target]"
---

# Quality Gate Check

Single entry point for every BMAD quality gate. Document gates score the planning artifacts (PRD, tech spec, backlog, sprint, story, spec-code alignment); code gates verify the repository before a commit, a merge or a release. `all` aggregates the document gates into one report, and `--phase` runs the checks that belong to a lifecycle phase.

## Usage

| Invocation | What it does | Replaces |
|------------|--------------|----------|
| `/gate:check prd [file]` | PRD quality gate (threshold 80%) | `/gate:check prd` |
| `/gate:check spec [file]` | Tech Spec quality gate (threshold 90%) | `/gate:check spec` |
| `/gate:check backlog [story-id] [--no-gate]` | INVEST gate, 6/6 per story | `/gate:check backlog` |
| `/gate:check sprint [N] [--verbose]` | Sprint Ready gate (all required criteria) | `/gate:check sprint` |
| `/gate:check story <story-id>` | Definition of Done gate (100%) | `/gate:check story` |
| `/gate:check alignment [story-id]` | Spec-code alignment gate (threshold 85%) | `/gate:check alignment` |
| `/gate:check commit [--fix] [--staged]` | Pre-commit verification of the modified files | `/gate:check commit` |
| `/gate:check merge [source] [target]` | Pre-merge verification of a branch | `/gate:check merge` |
| `/gate:check release <version> [patch\|minor\|major]` | Release checklist | `/gate:check release` |
| `/gate:check all [--detailed]` | Report of all document gates | `/gate:check all` |
| `/gate:check --phase=<phase> [story-or-sprint]` | Checkpoint of a lifecycle phase: `pre-sprint`, `pre-impl`, `post-impl`, `pre-merge` | `/gate:check --phase` |

## Arguments

$ARGUMENTS (format: `<gate> [target] [flags]` or `--phase=<phase> [target]`)

1. The first positional word selects the gate: `prd`, `spec`, `backlog`, `sprint`, `story`, `alignment`, `commit`, `merge`, `release` or `all`.
2. The remaining positional words are the gate's `target` (a file, a story ID, a sprint number, a branch or a version, see each section); the other flags are documented per gate.
3. `--phase=<phase>` replaces the gate word: run the checkpoint of that phase (see `## --phase`). `pre-sprint` and `post-impl` take a sprint or a story, `pre-impl` takes a story.
4. No argument: show the usage table above and stop. Unknown gate: list the valid gates.

## Shared rules

- **Default paths**: PRD `project-management/prd.md`, tech spec `project-management/tech-spec.md`, stories `project-management/backlog/`, sprints `project-management/sprints/sprint-{N}-{slug}/`, constitution `project-management/constitution.md` (optional). Gate thresholds are configured in `.bmad/gates/*.yaml` (`prd-gate`, `techspec-gate`, `backlog-gate`, `sprint-ready-gate`, `story-gate`).
- **Status source of truth**: `.bmad/sprint-status.yaml` holds the story and task status (`backlog -> ready-for-dev -> in-progress -> review -> done`, any -> `blocked`). Gates read the status from it and never from the markdown files, which only hold content. Schema: `.claude/templates/project/sprint-status.md`.
- **Scoring**: weighted criteria; a passed criterion adds its weight to the score (final score = sum of passed weights). "Required" criteria must all pass for the gate to pass. Symbols: ✅ pass, ⚠️ partial, ❌ missing or failed, ⏳ skipped or not checked.
- **Report**: always list each criterion with what was found or what is missing, the score against the threshold, the verdict (`GATE PASSED` / `GATE FAILED (need X%, got Y%)`), then numbered "Required Actions" with a concrete example for each failure and the command to re-run (`/gate:check <gate>`).
- **Docker**: code gates run the project tools through Docker (`docker compose exec <service> ...` or `docker run --rm ...`), never on the local environment.

## prd

Validates a PRD (argument: `[prd-file]`, default `project-management/prd.md`). Threshold: **80%**.

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Problem Statement | 15% | Yes | Clear articulation of the problem |
| Target Users | 15% | Yes | Defined audience/personas |
| Goals/Objectives | 15% | Yes | Measurable goals |
| Success Metrics | 15% | Yes | KPIs and measurements |
| Scope/Boundaries | 10% | Yes | What is in/out of scope |
| User Stories Overview | 10% | Yes | High-level feature list |
| Assumptions | 10% | No | Documented assumptions |
| Risks | 10% | No | Risk identification (with mitigations) |

**Process**: locate and load the file (fail if missing); for each criterion check that the section exists with relevant keywords and a minimum content length; sum the weights of the passed criteria; report.

```
PRD Quality Gate Validation
File: project-management/prd.md   Threshold: 80%
✅ Problem Statement (15%)   Found: clear problem definition in "Overview"
❌ Goals/Objectives (15%)    Missing: no measurable goals found
⚠️ Risks (10%)               Partial: risks listed but no mitigations
Score: 90/100 (90%)
✅ PRD GATE PASSED — Next: /project:generate-tech-spec
```

On failure, suggest an example per gap (e.g. goal "Reduce checkout time by 30%", KPI "Conversion rate > 5%", risk "API rate limits; Mitigation: caching"). The gate is also checked before `/project:generate-tech-spec` and at the BMAD workflow transition.

## spec

Validates a Tech Spec (argument: `[techspec-file]`, default `project-management/tech-spec.md`). Threshold: **90%**.

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Architecture Overview | 12% | Yes | System design description |
| Architecture Diagram | 10% | Yes | Visual representation (mermaid, PNG, SVG) |
| Components | 12% | Yes | Module/service definitions |
| Data Model | 10% | Yes | Database/entity design |
| API Contracts | 10% | Yes | Endpoint specifications with schemas |
| Security | 12% | Yes | Auth and security measures |
| Performance | 8% | No | Performance requirements |
| Error Handling | 8% | No | Error strategy |
| Testing Strategy | 10% | Yes | Test approach |
| Deployment | 8% | No | CI/CD and release |

**Process**: locate and load the file; check sections and keywords, verify that diagrams exist and that the technical depth is sufficient; score; report.

```
Tech Spec Quality Gate Validation
File: project-management/tech-spec.md   Threshold: 90%
❌ Architecture Diagram (10%)  Missing: no diagram found (mermaid, PNG, SVG)
⚠️ API Contracts (10%)         Partial: endpoints listed but no schemas
Score: 68/100 (68%)
❌ TECH SPEC GATE FAILED (need 90%, got 68%)
```

Required actions give a template per gap: a mermaid diagram skeleton, the security strategy (authentication method, authorization model, encryption), request/response schemas with error formats and versioning, CI/CD stages with promotion and rollback. For significant decisions suggest an ADR: `/common:architecture-decision "JWT vs Session-based authentication"`. On pass: next step `/project:generate-backlog`, then `/gate:check backlog`.

## backlog

Validates stories against INVEST (arguments: `[story-id] [--no-gate]`). Default: all stories. `--no-gate` runs the simple INVEST check only (no thresholds, no pass/fail verdict), useful during refinement. Threshold: **6/6 for each story**.

| Letter | Criterion | Check |
|--------|-----------|-------|
| **I** | Independent | `blocked_by` is empty |
| **N** | Negotiable | Has a description of reasonable length, not over-specified (task count) |
| **V** | Valuable | Has acceptance criteria and a benefit statement |
| **E** | Estimable | Story points > 0 |
| **S** | Small | Story points ≤ 8 |
| **T** | Testable | Acceptance criteria count > 0 (Gherkin) |

**Process**: read `.bmad/sprint-status.yaml` and load the requested story or all stories; evaluate the 6 criteria per story (0-6); report per story and in aggregate (passing 6/6, warnings 4-5/6, failing < 4/6). A criterion that cannot be evaluated (e.g. S without points) is shown with `?`.

```
✅ US-001: User login          Score: 6/6 ✅
⚠️ US-002: User registration   [E] ✗ Estimable - No story points   Score: 4/6 ⚠️
❌ US-003: Rewrite of auth     [I] ✗ blocked by US-001, US-002  [S] ✗ 13 > 8 points   Score: 3/6 ❌
Summary: validated 8 | passing 6 | warnings 1 | failing 1
❌ BACKLOG GATE FAILED
```

Fixing common issues: story too large (S) → `/project:backlog edit story US-003` to reduce the scope and `/project:backlog add story` for the remainder; missing points (E) → `/project:backlog edit story US-002 --points 3`; missing acceptance criteria (V, T) → `/project:backlog edit story US-002 "Given... When... Then..."`. On pass: next `/gate:check sprint`.

## sprint

Validates the sprint readiness (arguments: `[N] [--verbose]`). `N` is the sprint number and accepts `1`, `001` or `sprint-001`; default: `metadata.sprint_id` of `.bmad/sprint-status.yaml`, otherwise the most recent `project-management/sprints/sprint-*/` folder. `--verbose` shows the detailed story breakdown. Threshold: **all required criteria**.

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Sprint Metadata | 20% | Yes | ID, name, dates defined |
| Sprint Goal | 15% | Yes | Clear goal statement (min 10 chars) |
| Stories Ready | 25% | Yes | At least 1 story in `ready-for-dev` (recommended: 3) |
| Stories Estimated | 20% | Yes | All stories have points |
| Capacity Check | 10% | No | Ready points ≤ `metadata.capacity_points` + 20% (skipped if undefined) |
| Dependencies Resolved | 10% | No | No blocked story in ready status |

**Process**
1. Load the sprint status, in this order:
   1. `.bmad/sprint-status.yaml` if it exists and its `metadata.sprint_id` matches sprint `N`: extract the metadata and count stories by status.
   2. Otherwise, markdown fallback from `project-management/sprints/sprint-{N}-*/` (written by `/workflow:start`): metadata, goal and capacity from `sprint-goal.md` (start, end, capacity, goal); stories from the selected US table of `sprint-goal.md` and the `project-management/backlog/user-stories/US-*.md` files (points, status), a planned story not yet started counting as `ready-for-dev`; blocking dependencies from `sprint-dependencies.md`.
   3. Neither found: fail with "No sprint {N}: run `/workflow:start {N}`".
2. Validate the metadata fields `sprint_id`, `name`, `start_date`, `end_date`, `goal`.
3. Validate the stories (ready, estimated, none blocked) and the optional capacity.
4. Report, starting with the source used: `Source: .bmad/sprint-status.yaml` or `Source: markdown (project-management/sprints/sprint-{N}-*/)`.

In fallback mode the gate is still evaluated, but the report adds a non-blocking warning: the `/sprint:*` commands need `.bmad/sprint-status.yaml`, run `/workflow:start {N}`, or `/project:migrate` to create `.bmad/sprint-status.yaml` from an existing backlog.

```
Sprint Ready Gate Validation
Sprint: sprint-3 - User Management   Period: 2026-01-29 → 2026-02-12 (14 days)
✅ Sprint Metadata (20%)  ✅ Sprint Goal (15%)  ✅ Stories Ready (25%): 5 stories, 21 points
✅ Stories Estimated (20%)  ✅ Capacity Check (10%): 21/25 = 84%  ✅ Dependencies Resolved (10%)
Score: 100/100 — ✅ SPRINT READY GATE PASSED
Commands: /workflow:start (start the sprint), /sprint:next-story (pick the first story)
```

On failure, the required actions show the `metadata` block to add to `.bmad/sprint-status.yaml`:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "User Management"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implement core user management features"
  capacity_points: 25  # Optional: team capacity
```

then the missing estimates (`/project:backlog edit story US-010 --points 5`) and the blocked ready stories (remove from sprint, unblock the dependency, or re-order).

## story

Validates a story against the Definition of Done (argument: `<story-id>`, required, e.g. `US-005`). Threshold: **100% (all required criteria)**.

| Criterion | Weight | Required | Check |
|-----------|--------|----------|-------|
| Tasks Complete | 20% | Yes | `tasks.completed == tasks.total` |
| Tests Passing | 20% | Yes | `tdd_phase in ['green', 'refactor', 'done']` |
| AC Validated | 20% | Yes | `acceptance_criteria.validated == acceptance_criteria.total` |
| Code Reviewed | 15% | Yes | `status == 'review'` or `review.approved == true` (PR approved) |
| No Blockers | 10% | Yes | `blocked_reason == null` |
| Documentation | 10% | No | Docs updated if needed |
| Security Review | 5% | No | Security implications checked |

**Process**: read `.bmad/sprint-status.yaml`, find the story by ID and load its fields; check each criterion; list the tasks and ACs with their state; report.

```
Story DoD Gate: US-005 — Email verification   Status: in-progress
❌ Tasks Complete (20%)   2/4 done   ✓ TASK-021 ✓ TASK-022 □ TASK-023 (in-progress) □ TASK-024 (pending)
❌ Tests Passing (20%)    TDD Phase: red
⚠️ Acceptance Criteria    1/3 validated
❌ Code Reviewed (15%)    No PR created yet
Score: 25/100 — ❌ STORY DoD GATE FAILED. Resume work: /sprint:dev US-005
```

On pass: the story can move to `done` with `/sprint:transition US-005 done`. The gate is also checked by the Stop hook (`quality-gate.sh`) and before `/sprint:transition <id> done`.

| TDD phase | Meaning | Next step |
|-----------|---------|-----------|
| red | Tests failing | Implement code |
| green | Tests passing | Refactor |
| refactor | Cleaning up | Complete or next task |
| done | Cycle complete | Move to review |

## alignment

Validates that the implementation matches the specifications, i.e. no spec drift (argument: `[story-id]`, default: all stories of the current sprint). Threshold: **85%**.

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Requirement coverage | 20% | Yes | All FR-xxx of the PRD are covered by stories |
| Story-code mapping | 20% | Yes | All stories have corresponding code references |
| AC-test mapping | 20% | Yes | All acceptance criteria have tests |
| Tech spec adherence | 15% | Yes | Implementation follows the tech spec design |
| Constitution compliance | 15% | Yes | Code respects the project constitution |
| Scope drift detection | 10% | No | No unreferenced code changes |

**Process**
1. Load the PRD (FR-xxx IDs), the stories (`Implements:` references), the tech spec and, if present, `project-management/constitution.md`.
2. Trace forward (spec → code): for each FR-xxx find the stories that implement it, for each story the code files tagged `// Story: US-xxx`, for each AC the matching test.
3. Trace backward (code → spec): verify that each story reference exists in the backlog and belongs to the right sprint; flag code changes without story reference (scope drift).
4. Validate the constitution: technical constraints, design principles, NFR targets.
5. Score and report.

```
SPEC-CODE ALIGNMENT GATE ❌   Story: US-012 | Score: 65%
✅ Requirement coverage   3/3 FR-xxx covered
❌ Story-code mapping     2 files missing references
❌ AC-test mapping        AC-2 has no test
⚠️ Scope drift            3 unreferenced files
Actions: 1. Add // Story: US-012 to ProfileService.ts  2. Write test for AC-2  → Fix issues before merging
```

Related: `/project:trace` (traceability matrix), `/project:trace --gaps` (requirement coverage).

## commit

Verifies the code before a commit (flags: `--fix` fixes the fixable issues, `--staged` checks only staged files).

1. **Identify the modified files**: `git diff --cached --name-only` (staged) and `git diff --name-only` (unstaged).
2. **Detect the technology** by extension: `.php` → php-cs-fixer, phpstan; `.dart` → dart format, dart analyze; `.py` → ruff, mypy; `.ts/.tsx/.js/.jsx` → eslint, prettier (+ `tsc --noEmit`).
3. **Run the checks in Docker**: PHP (`docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff`, `vendor/bin/phpstan analyse`, `lint:twig`, `lint:container`), Dart (`dart format --set-exit-if-changed`, `dart analyze`, `flutter test --coverage`), Python (`ruff check`, `ruff format --check`, `mypy`), JS/TS (`npx eslint`, `npx prettier --check`, `npx tsc --noEmit`).
4. **Global checks**: secret patterns (`password|secret|api_key|token` assignments, `sk_live_`, `pk_live_`, `ghp_`, `gho_`, `AKIA`), forbidden staged files (`.env`, `.pem`, `.key`, `.p12`), source files larger than 1 MB.
5. **Report**: successful checks, issues (`file:line`, tool, message), summary table (formatting, linting, types, secrets), required actions and `Commit authorized: ✅ YES / ❌ NO`.
6. **`--fix`**: run the fixers instead of the dry-run checks (`php-cs-fixer fix`, `dart format`, `ruff check --fix` + `ruff format`, `eslint --fix` + `prettier --write`).

| Blocking (commit forbidden) | Non-blocking (warning) |
|-----------------------------|------------------------|
| Syntax errors, PHPStan/mypy/tsc errors, secrets detected, `.env` files, private keys/certificates | Formatting issues, ESLint warnings, decreased test coverage, TODO/FIXME added |

To automate it, call it from a pre-commit hook: `claude-code "/gate:check commit --staged"`.

## merge

Verifies a branch before merging (arguments: `[source] [target]`; source default: current branch, target default: `main` or `master`). Example: `/gate:check merge feature/auth main`.

1. **Analyze the diff**: commits to merge (`git log target..source --oneline`), modified files (`--stat`), lines added/removed (`--shortstat`).
2. **Quality checks** (in Docker): the complete test suite with coverage (phpunit, `flutter test --coverage`, `pytest --cov`, `npm run test -- --coverage`); complete static analysis (`phpstan analyse -l max`, `dart analyze --fatal-infos`, `mypy --strict .`, `tsc --noEmit`); dependency audit (`composer audit`, `pip-audit`, `npm audit`, `dart pub outdated`).
3. **Specific checks**: DB migrations (`doctrine:migrations:diff`, `doctrine:schema:validate`, reversibility), API breaking changes (diff of `openapi.yaml` / `docs/api/`), configuration changes (`config/`, `.env.example`, `docker-compose*.yml`).
4. **Commit analysis**: every message follows Conventional Commits `type(scope): description`, otherwise warn.
5. **Coverage**: compare before/after; coverage must not decrease.
6. **Spec checks**: run the `pre-merge` checkpoint (see `## --phase`).
7. **Report**: statistics, tests table (suite, passed, failed, skipped, coverage delta), static analysis table, security (audit, secrets, sensitive files), migrations, attention points ranked HIGH/MEDIUM/LOW/INFO, final checklist (code review approved and staging tests are manual items) and `Merge authorized: ✅ YES / ❌ NO`.

| Blocking (merge forbidden) | Non-blocking (warning) |
|----------------------------|------------------------|
| Failing tests, coverage drop > 2%, static analysis errors, critical/high vulnerabilities, secrets in code, non-reversible migrations | Static analysis warnings, TODO/FIXME added, low/medium vulnerabilities, coverage drop < 2% |

## release

Guides the team through a release (arguments: `<version> [patch|minor|major]`, e.g. `1.2.0 minor` or `2.0.0-beta.1`). Example: `/gate:check release 1.2.0 minor`.

1. **Pre-release validation**: correct branch (`main`/`master` or `release/*`), no uncommitted changes, all tests pass; `CHANGELOG.md` up to date (changes since the last tag with `git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"`); version files updated (`composer.json`, `pyproject.toml`/`__version__.py`, `package.json`, `pubspec.yaml`, `Info.plist`, `build.gradle`).
2. **Exhaustive tests**: unit, integration, E2E, performance, security.
3. **Documentation**: README, generated API docs, migration guide if there are breaking changes.
4. **Generate the interactive checklist** `RELEASE CHECKLIST - v{VERSION}` (type, date, branch) with the sections below, each item a `- [ ]` box:
   - **Pre-release**: code quality (tests pass, coverage ≥ 80%, no static analysis errors, all PRs reviewed, no blocking TODO/FIXME), security (no critical CVEs, no secrets, OWASP tests, valid SSL certificates), documentation (CHANGELOG, README, API docs, migration guide, release notes), versioning (version incremented, tags prepared, release branches).
   - **Build & package**: backend (production build, assets, migrations, environment variables documented), frontend (bundle optimized, CDN, service worker, sourcemaps not deployed), mobile if applicable (iOS/Android builds signed, store screenshots and metadata).
   - **Staging validation**: deployment, migrations, smoke tests, regression tests, performance, monitoring, rollback tested.
   - **Production deployment**: pre-deploy (maintenance mode, database backup, support communication, deployment window), deploy (launch, migrations, health checks), post-deploy (smoke tests, monitoring, performance, git tag pushed, GitHub/GitLab release).
   - **Communication**: release notes, support, clients, public documentation, announcement.
   - **Rollback plan**: identify the problem (logs, alerts), decision threshold (e.g. > 5% 5xx for 5 min) and decision maker, rollback command, DB rollback (migrations down), communication (team, incident, post-mortem).
   - **Final validation**: all boxes checked, validated by, release date/time, notes.

Useful commands: `git tag -a v{VERSION} -m "Release v{VERSION}"` + `git push origin v{VERSION}`; `gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md`; `git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md`.

| SemVer type | When | Example |
|-------------|------|---------|
| MAJOR | Breaking changes | 1.0.0 → 2.0.0 |
| MINOR | New feature | 1.0.0 → 1.1.0 |
| PATCH | Bug fix | 1.0.0 → 1.0.1 |

## all

Aggregated report of the document gates (argument: `[--detailed]`, which includes the validation details of each gate).

1. **Identify the applicable gates**: PRD gate if `project-management/prd.md` exists, Tech Spec gate if `project-management/tech-spec.md` exists, Backlog gate if stories exist in `.bmad/sprint-status.yaml`, Sprint Ready gate if the sprint metadata exists, Story gates for each `in-progress` / `review` story.
2. **Run each applicable gate** (`prd`, `spec`, `backlog`, `sprint`, then `story` per story) and collect the scores.
3. **Aggregate** into the summary, then **recommend** prioritized actions based on the failures.

```
BMAD Quality Gates Report   Project: claude-craft   Sprint: sprint-3 - User Management
| Gate | Threshold | Score | Status |
| PRD | 80% | 90% | ✅ PASS |
| Tech Spec | 90% | 92% | ✅ PASS |
| Backlog | 6/6 | 5.8/6 avg | ⚠️ WARN |
| Sprint Ready | 100% | 100% | ✅ PASS |
| Story DoD | 100% | varies | 📊 |
Story DoD Status: US-010 in-progress 45% ⏳ | US-012 review 85% ⚠️ | US-013 done 100% ✅
Overall Health: 🟢 Good — 4/5 gates passing, 8/10 stories on track
Recommendations: 1. ⚠️ US-002 missing story points → /project:backlog edit story US-002 --points 3
```

The `--detailed` report adds, per gate, the file, threshold, score, status and every criterion, the stories with issues (backlog), the DoD breakdown of each story, and the action items by priority (1 blocking, 2 should fix, 3 nice to have). The report can be generated on demand, included in the sprint retrospective, used for project health monitoring or exported for stakeholders. The code gates (`commit`, `merge`, `release`) and `alignment` are not part of it: run them separately.

## --phase

Runs automated checkpoints at the critical phases of the lifecycle to ensure the specs are coherent, complete and aligned with the implementation.

**Prerequisites**: `project-management/prd.md` with FR-xxx IDs, `project-management/backlog/` with user stories, `.bmad/sprint-status.yaml` for the sprint context; optional `project-management/constitution.md`.

**Plan mode is mandatory**: before executing, analyze the impacted code, propose a plan and wait for validation before any change.

| Phase | When | Target |
|-------|------|--------|
| `pre-sprint` | Before starting a sprint (after `/workflow:start`) | sprint |
| `pre-impl` | Before coding a story (after `/sprint:next-story --claim`) | story |
| `post-impl` | After completing a story (before `/sprint:transition US-xxx review`) | story |
| `pre-merge` | Before merging to main (called by `merge`) | story or sprint |

**pre-sprint**: load the stories assigned to the sprint.

| Check | Required |
|-------|----------|
| Story AC completeness: every story has Gherkin AC | Yes |
| Story estimation: all stories have points | Yes |
| PRD traceability: `Implements:` references valid FR-xxx IDs | Yes |
| Task decomposition: at least 1 task per story | Yes |
| Dependency check: no circular or unresolved `Depends on:` | Yes |
| Constitution alignment: no contradictions | No |

**pre-impl**: load the story and its tech spec sections (`Tech Spec:` reference).

| Check | Required |
|-------|----------|
| Tech spec coverage: every FR-xxx of the story is covered | Yes |
| AC testability: each AC has a GIVEN/WHEN/THEN structure | Yes |
| Dependencies resolved: all `Depends on` stories are `done` | Yes |
| Task clarity: tasks have clear descriptions | Yes |
| NFR alignment: respects the NFRs of the constitution | No |

**post-impl**: load the story and its tasks.

| Check | Required |
|-------|----------|
| Code traceability: code files reference `// Story: US-xxx` (or `# Story: US-xxx`) | Yes |
| Test coverage: tests exist for each AC | Yes |
| All tasks done | Yes |
| TDD phase: `refactor` or `done` | Yes |
| No regressions: the test suite still passes | Yes |
| Spec drift: implemented scope matches the spec (no scope creep) | No |

**pre-merge**: run all the previous checkpoints, then:

| Check | Required |
|-------|----------|
| AC validation: all acceptance criteria validated | Yes |
| Code review done | Yes |
| Test suite green (full suite) | Yes |
| Constitution respect | Yes |
| Traceability complete: FR → US → Code → Test, using `/project:trace` | Yes |
| Documentation updated | No |

```
CHECKPOINT FAILED ❌   Phase: pre-impl   Story: US-012   Score: 60% (3/5 checks passed)
✅ AC testability  3/3   ✅ Dependencies resolved   ✅ Task clarity  4/4
❌ Tech spec coverage  Missing FR-003 mapping   ❌ NFR alignment  Perf target undefined
Actions required: 1. Add FR-003 coverage to tech spec section 3.2  2. Define performance targets
→ Fix issues before proceeding
```

Example: `/gate:check --phase=pre-sprint Sprint-3` → "Score: 83% (5/6 passed) — WARNING: US-015 has no tasks yet". Integration: `/workflow:start` triggers `pre-sprint`, `/sprint:next-story` suggests `pre-impl`, `/sprint:transition` triggers `post-impl`, and `merge` triggers `pre-merge`.

## Related Commands

- `/project:trace` — traceability matrix and requirement coverage (`--gaps`)
- `/project:generate-tech-spec`, `/project:generate-backlog` — produce the artifacts the gates validate
- `/workflow:start` — start the sprint (includes the pre-sprint checkpoint)
- `/sprint:transition` — move a story to the next status
