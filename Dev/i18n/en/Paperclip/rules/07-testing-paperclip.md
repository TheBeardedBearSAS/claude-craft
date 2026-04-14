# Testing — Paperclip

> Coverage target: **80%+**. Adapter contract tests: **100% mandatory**.
> Framework: **Vitest** (see `vitest.config.ts` in the Paperclip repo).

## Pyramid

| Layer | Share | Speed | Where |
|---|---|---|---|
| Unit | 65% | < 50ms | `server/src/**/*.test.ts`, `ui/src/**/*.test.tsx`, `packages/**/*.test.ts` |
| Integration | 25% | < 2s | `server/src/**/*.integration.test.ts` |
| Plugin harness | 5% | < 5s | Plugin packages using `@paperclipai/plugin-sdk/testing` |
| E2E (UI) | 5% | < 30s | `tests/e2e/` (Playwright) |

---

## Vitest Setup

`vitest.config.ts` at the workspace root:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      include: ['server/src/**', 'adapters/**', 'shared/**'],
      exclude: ['**/*.test.ts', '**/*.d.ts', '**/__mocks__/**'],
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
});
```

Web uses a second workspace config with `environment: 'jsdom'` or Vitest Browser Mode.

---

## Unit Tests — Server

Services and domain logic are the primary unit-test targets. **Mock the repository**, never the DB.

```ts
import { describe, it, expect, vi } from 'vitest';
import { ApprovalService } from './approval-service';

describe('ApprovalService.approve', () => {
  it('rejects approval when agent is over budget', async () => {
    const repo = {
      findAgent: vi.fn().mockResolvedValue({ id: 'a1', budgetRemaining: 0 }),
      recordDecision: vi.fn(),
    };
    const activity = { emit: vi.fn() };
    const service = new ApprovalService(repo, activity);

    await expect(service.approve('req-1', 'a1')).rejects.toMatchObject({
      code: 'BUDGET_EXCEEDED',
    });

    expect(repo.recordDecision).not.toHaveBeenCalled();
    expect(activity.emit).toHaveBeenCalledWith(expect.objectContaining({ event: 'approval.rejected' }));
  });
});
```

**Rules:**
- One behavior per test. No "does everything" mega-tests.
- Assert on outcomes (activity emitted, DB write, error code) — not on internal call order unless order is part of the contract.
- Fresh fakes per test; no shared mutable state.

---

## Integration Tests — Server

Run against a **real PostgreSQL** (testcontainers or a local throwaway DB). Never mock the DB here.

```ts
import { setupTestDb, teardownTestDb } from '../../../tests/helpers/db';

describe('agents module (integration)', () => {
  const ctx = setupTestDb();

  it('hiring an agent emits an activity event and reserves budget', async () => {
    const res = await ctx.api.post('/api/agents').json({
      name: 'coder-1',
      role: 'engineer',
      budgetTokens: 50_000,
    });
    expect(res.status).toBe(201);

    const activity = await ctx.db.query('SELECT * FROM activity_log WHERE event = $1', ['agent.hired']);
    expect(activity.rows).toHaveLength(1);
  });
});
```

**Rules:**
- Tests own their fixtures; no globally seeded test DB.
- Wrap each test in a transaction and roll back, OR use `TRUNCATE … RESTART IDENTITY` between tests.

---

## Extension Tests

**Built-in adapters** (`packages/adapters/*`) are tested as any TypeScript package: unit-test spawn logic, env wiring, and any `./server` / `./cli` code paths. There is no central adapter "contract suite" — correctness is guaranteed by the adapter shape (`type`, `label`, `models`, `agentConfigurationDoc`) and by the server-side registry's typing.

**Plugins** use the first-party harness:

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("my plugin", () => {
  it("handles issue.created", async () => {
    const harness = createTestHarness(plugin, {
      config: { apiKeyRef: "demo" },
    });
    await harness.setup();
    await harness.emit({ type: "issue.created", entityId: "iss-1" });
    expect(harness.http.calls).toHaveLength(1);
  });
});
```

**Rule:** A plugin is not mergeable until its harness tests cover at least the happy path and one failure path per declared event / job.

---

## Web UI Tests

Use Vitest + React Testing Library for components; Playwright for E2E flows (approvals, agent hiring, cost visualization).

**Do not** test governance logic in the UI — it lives on the server. UI tests assert rendering, interaction, and API client calls.

---

## Test Data

- Factories over fixtures: `makeAgent({ budgetTokens: 100 })` rather than JSON files.
- Deterministic IDs (`crypto.randomUUID` in production, seeded in tests).
- No sleeps. Inject the clock. Use `vi.useFakeTimers()` for heartbeat interval tests.

---

## Forbidden

- Sleeping to wait for async work (use `await` or fake timers).
- Tests that depend on running order.
- Mocking the unit under test.
- `.skip` / `.only` merged to main.
- Comparing against snapshots without a human review — snapshots rot.

---

## Running

```bash
pnpm test                    # Everything
pnpm test --coverage         # With coverage
pnpm test --project=server   # Workspace scope
pnpm test adapters           # Path filter
pnpm test:e2e                # Playwright
```

---

## Bug-Fix Protocol (Regression)

1. Write a failing test that reproduces the bug.
2. Commit the failing test (optional, but nice).
3. Fix the code.
4. Test passes. Merge.

No fix without a regression test.

---

## Checklist

- [ ] Vitest configured, coverage ≥ 80%
- [ ] Adapter contract tests pass for every adapter
- [ ] Integration tests hit a real DB
- [ ] Factories used instead of fixtures
- [ ] No sleeps, no `.only` / `.skip` in main

---

**Last updated:** 2026-04 | **Version:** 1.0.0 | **Author:** The Bearded CTO
