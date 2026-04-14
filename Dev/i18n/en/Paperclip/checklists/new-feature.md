# New Feature Checklist — Paperclip

A feature in Paperclip typically touches one or more **modules** (`server/src/modules/*`) and sometimes an **adapter**. Use this checklist end-to-end.

## 0. Analysis (before writing code)

- [ ] Identify the domain(s) affected (agents / approvals / costs / …)
- [ ] Determine if governance is impacted (budgets, approvals, activity log)
- [ ] List the data migration, if any
- [ ] Check for cross-tenant implications
- [ ] Write a 5-line design note: what changes, why, which files

## 1. Schema (if applicable)

- [ ] Migration file under `server/src/db/migrations/` (forward + down)
- [ ] New columns nullable OR backfilled in the same migration
- [ ] Indexes on any column used in WHERE clauses
- [ ] Activity log table untouched (it's append-only)
- [ ] `pnpm db:migrate` succeeds locally

## 2. Types (`shared/types`)

- [ ] New domain types added in `shared/types/<domain>.ts`
- [ ] No runtime code in `shared/types/`
- [ ] Discriminated unions used for variant types
- [ ] Re-export path updated if necessary

## 3. Service (`server/src/modules/<domain>/service.ts`)

- [ ] Business logic lives here
- [ ] Returns typed results or throws `DomainError`
- [ ] Emits an activity event on every mutation
- [ ] Enforces budget / approval gates where relevant
- [ ] Tenancy: derives `companyId` from session, filters accordingly
- [ ] Unit tests with mocked repository

## 4. Repository (`server/src/modules/<domain>/repository.ts`)

- [ ] Parameterized queries only
- [ ] No business logic
- [ ] Integration tests against a real Postgres

## 5. Routes (`server/src/modules/<domain>/routes.ts`)

- [ ] One route per operation
- [ ] Input validated via zod (or equivalent)
- [ ] Responses typed; errors mapped to `DomainError` codes
- [ ] No direct DB access
- [ ] OpenAPI spec updated

## 6. Web UI (if applicable)

- [ ] API client regenerated from OpenAPI (`pnpm generate:api`)
- [ ] New UI under `ui/src/` (follow the existing routing convention)
- [ ] Governance flags come from the server, not client-computed
- [ ] Loading and error states handled
- [ ] Accessibility: keyboard + screen-reader paths verified

## 7. Extension surface (if the feature requires changes)

### Built-in adapter (AI runtime)

- [ ] `packages/adapters/<name>/src/index.ts` — `type` / `label` / `models` / `agentConfigurationDoc` still accurate
- [ ] Server-side registry entry updated (`registerServerAdapter`)
- [ ] Existing agent configs still validate (no breaking field rename)

### Plugin (feature)

- [ ] Manifest capabilities remain minimal (add only what this feature requires)
- [ ] `definePlugin({ setup })` wiring for new events / jobs / data providers
- [ ] Config schema (zod) updated with clear descriptions
- [ ] Plugin test harness from `@paperclipai/plugin-sdk/testing` still passes

## 8. Tests

- [ ] Unit: service logic + error paths
- [ ] Integration: module routes + DB with real Postgres
- [ ] Cross-tenant isolation: user A of company X cannot touch company Y data
- [ ] Budget enforcement: over-limit attempt returns `BUDGET_EXCEEDED`
- [ ] Approval gating: action blocks until approved or times out
- [ ] Adapter contract: re-run the shared suite
- [ ] Coverage thresholds still green (≥ 80 global, ≥ 90 for agents/approvals/costs)

## 9. Documentation

- [ ] CHANGELOG entry under `## Unreleased`
- [ ] OpenAPI spec committed
- [ ] Adapter README updated if the supported actions changed
- [ ] Runbook updated if the feature impacts incident response (kill switch, revocation, export)

## 10. Review

- [ ] Self-review: `git diff main...HEAD`
- [ ] Run `/paperclip:check-compliance` locally
- [ ] PR description: what, why, migration plan, rollback plan
- [ ] Adapter contract tests green for every touched adapter

## 11. Rollout

- [ ] Deploy plan: migrate forward, deploy code, verify health
- [ ] Kill switch still functional after deploy
- [ ] Activity log visibly captures the new feature's events
