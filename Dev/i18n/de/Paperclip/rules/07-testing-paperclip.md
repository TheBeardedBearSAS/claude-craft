# Testing — Paperclip

> Coverage-Ziel: **80%+**. Adapter-Vertragstests: **100% verpflichtend**.
> Framework: **Vitest** (siehe `vitest.config.ts` im Paperclip-Repo).

## Pyramide

| Schicht | Anteil | Geschwindigkeit | Wo |
|---|---|---|---|
| Unit | 65% | < 50ms | `server/src/**/*.test.ts`, `ui/src/**/*.test.tsx`, `packages/**/*.test.ts` |
| Integration | 25% | < 2s | `server/src/**/*.integration.test.ts` |
| Plugin harness | 5% | < 5s | Plugin-Pakete mit `@paperclipai/plugin-sdk/testing` |
| E2E (UI) | 5% | < 30s | `tests/e2e/` (Playwright) |

---

## Vitest-Setup

`vitest.config.ts` im Workspace-Root:

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

Web verwendet eine zweite Workspace-Config mit `environment: 'jsdom'` oder Vitest Browser Mode.

---

## Unit-Tests — Server

Services und Domain-Logik sind die primären Unit-Test-Ziele. **Mocken Sie das Repository**, niemals die DB.

```ts
import { describe, it, expect, vi } from 'vitest';
import { ApprovalService } from './approval-service';

describe('ApprovalService.approve', () => {
  it('lehnt Genehmigung ab, wenn Agent über Budget ist', async () => {
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

**Regeln:**
- Ein Verhalten pro Test. Keine „macht alles"-Mega-Tests.
- Assertieren Sie Ergebnisse (Activity emittiert, DB-Write, Error-Code) — nicht die interne Aufruf-Reihenfolge, es sei denn, die Reihenfolge ist Teil des Vertrags.
- Frische Fakes pro Test; kein geteilter veränderlicher Zustand.

---

## Integration-Tests — Server

Laufen gegen ein **echtes PostgreSQL** (Testcontainers oder eine lokale Wegwerf-DB). Niemals die DB hier mocken.

```ts
import { setupTestDb, teardownTestDb } from '../../../tests/helpers/db';

describe('agents module (integration)', () => {
  const ctx = setupTestDb();

  it('das Einstellen eines Agents emittiert ein Activity-Event und reserviert Budget', async () => {
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

**Regeln:**
- Tests besitzen ihre Fixtures; keine global geseedete Test-DB.
- Wickeln Sie jeden Test in eine Transaktion ein und rollen Sie zurück, ODER verwenden Sie `TRUNCATE … RESTART IDENTITY` zwischen Tests.

---

## Extension-Tests

**Built-in-Adapter** (`packages/adapters/*`) werden wie jedes TypeScript-Paket getestet: Unit-Test der Spawn-Logik, Env-Wiring und aller `./server` / `./cli`-Code-Pfade. Es gibt keine zentrale Adapter-„Contract-Suite" — Korrektheit wird durch die Adapter-Form (`type`, `label`, `models`, `agentConfigurationDoc`) und durch das serverseitige Registry-Typing garantiert.

**Plugins** verwenden das First-Party-Harness:

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("my plugin", () => {
  it("behandelt issue.created", async () => {
    const harness = createTestHarness(plugin, {
      config: { apiKeyRef: "demo" },
    });
    await harness.setup();
    await harness.emit({ type: "issue.created", entityId: "iss-1" });
    expect(harness.http.calls).toHaveLength(1);
  });
});
```

**Regel:** Ein Plugin ist nicht mergeable, bis seine Harness-Tests mindestens den Happy Path und einen Failure-Path pro deklariertem Event / Job abdecken.

---

## Web-UI-Tests

Verwenden Sie Vitest + React Testing Library für Komponenten; Playwright für E2E-Flows (Approvals, Agent-Hiring, Cost-Visualisierung).

Testen Sie **nicht** Governance-Logik in der UI — sie lebt auf dem Server. UI-Tests assertieren Rendering, Interaktion und API-Client-Aufrufe.

---

## Test-Daten

- Factories statt Fixtures: `makeAgent({ budgetTokens: 100 })` statt JSON-Dateien.
- Deterministische IDs (`crypto.randomUUID` in Produktion, geseeded in Tests).
- Keine Sleeps. Injizieren Sie die Clock. Verwenden Sie `vi.useFakeTimers()` für Heartbeat-Interval-Tests.

---

## Verboten

- Schlafen, um auf async Work zu warten (verwenden Sie `await` oder Fake-Timer).
- Tests, die von der Ausführungsreihenfolge abhängen.
- Mocken der Unit under Test.
- `.skip` / `.only` in main gemerged.
- Vergleich gegen Snapshots ohne Human Review — Snapshots verrotten.

---

## Ausführen

```bash
pnpm test                    # Alles
pnpm test --coverage         # Mit Coverage
pnpm test --project=server   # Workspace-Scope
pnpm test adapters           # Pfad-Filter
pnpm test:e2e                # Playwright
```

---

## Bug-Fix-Protokoll (Regression)

1. Schreiben Sie einen fehlschlagenden Test, der den Bug reproduziert.
2. Committen Sie den fehlschlagenden Test (optional, aber nett).
3. Fixen Sie den Code.
4. Test läuft durch. Merge.

Kein Fix ohne Regressions-Test.

---

## Checklist

- [ ] Vitest konfiguriert, Coverage ≥ 80%
- [ ] Adapter-Vertragstests laufen für jeden Adapter durch
- [ ] Integration-Tests treffen eine echte DB
- [ ] Factories statt Fixtures verwendet
- [ ] Keine Sleeps, keine `.only` / `.skip` in main

---

**Zuletzt aktualisiert:** 2026-04 | **Version:** 1.0.0 | **Autor:** The Bearded CTO
