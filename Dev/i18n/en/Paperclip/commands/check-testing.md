---
description: Audit Paperclip Test Coverage and Quality
argument-hint: [project-path]
---

# Audit Paperclip Testing

## MISSION

Verify test coverage, adapter contract tests, integration-test shape, and test hygiene.

## Procedure

### 1. Baseline

- [ ] Vitest configured at workspace root
- [ ] Coverage thresholds ≥ 80 (lines, functions, statements), ≥ 75 (branches)
- [ ] `pnpm test --coverage` completes and respects the thresholds

### 2. Coverage by area

Run coverage, then report per area:
- `server/src/modules/agents/` : target ≥ 90%
- `server/src/modules/approvals/` : target ≥ 90%
- `server/src/modules/costs/` : target ≥ 90%
- `adapters/**` : target ≥ 85%
- Other server modules: ≥ 80%
- `ui/` : ≥ 70%

List any file below its target with a 1-line note on what's uncovered.

### 3. Extension tests

Built-in adapters (`packages/adapters/*`):
- [ ] Unit tests cover spawn / parse / env wiring
- [ ] `type`, `label`, `models`, `agentConfigurationDoc` are covered by an exports test
- [ ] E2E tests exist for at least the default adapter

Plugins:
- [ ] Tests use `createTestHarness` from `@paperclipai/plugin-sdk/testing`
- [ ] Happy path + one failure path per handler

### 4. Integration tests

- [ ] At least one integration test per server module
- [ ] Integration tests connect to a **real** PostgreSQL (testcontainers or a throwaway DB), not a mock
- [ ] Each test owns its data (transactions + rollback, or truncate between tests)
- [ ] A **cross-tenant isolation** test exists per module (prove a user of company A cannot read data of company B)

### 5. E2E

- [ ] Playwright suite covers: operator login, hiring an agent, approval flow, cost dashboard, adapter registration
- [ ] E2E runs against a built web bundle, not the dev server

### 6. Hygiene

Grep for and fail on:
- `.only(` in any test file on `main`
- `.skip(` in any test file on `main` (without a linked issue)
- `setTimeout` in tests without `vi.useFakeTimers()`
- Shared mutable fixtures between tests
- Snapshot files (`__snapshots__`) older than 180 days without a note

### 7. Bug-fix regressions

Pick the last 5 `fix:` commits. For each, verify a corresponding test was added or modified. Report commits that did not.

## Output

Markdown report with per-section pass/fail, uncovered files, failing adapters, and a score /20 for `/paperclip:check-compliance`.
