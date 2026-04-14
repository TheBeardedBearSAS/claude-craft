# Testing — Paperclip

> Meta de cobertura: **80%+**. Testes de contrato adapter: **100% obrigatorio**.
> Framework: **Vitest** (veja `vitest.config.ts` no repositorio Paperclip).

## Piramide

| Camada | Participacao | Velocidade | Onde |
|---|---|---|---|
| Unit | 65% | < 50ms | `server/src/**/*.test.ts`, `ui/src/**/*.test.tsx`, `packages/**/*.test.ts` |
| Integration | 25% | < 2s | `server/src/**/*.integration.test.ts` |
| Plugin harness | 5% | < 5s | Pacotes plugin usando `@paperclipai/plugin-sdk/testing` |
| E2E (UI) | 5% | < 30s | `tests/e2e/` (Playwright) |

---

## Configuracao Vitest

`vitest.config.ts` na raiz do workspace:

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

Web usa um segundo workspace config com `environment: 'jsdom'` ou Vitest Browser Mode.

---

## Testes Unitarios — Server

Servicos e logica de dominio sao os principais alvos de unit test. **Mock o repositorio**, nunca o DB.

```ts
import { describe, it, expect, vi } from 'vitest';
import { ApprovalService } from './approval-service';

describe('ApprovalService.approve', () => {
  it('rejeita aprovacao quando agente esta acima do orcamento', async () => {
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

**Regras:**
- Um comportamento por teste. Sem mega-testes "faz tudo".
- Assevere resultados (atividade emitida, escrita DB, codigo erro) — nao ordem de chamada interna a menos que ordem seja parte do contrato.
- Fakes frescos por teste; sem estado mutavel compartilhado.

---

## Testes de Integracao — Server

Execute contra um **PostgreSQL real** (testcontainers ou DB local descartavel). Nunca mock o DB aqui.

```ts
import { setupTestDb, teardownTestDb } from '../../../tests/helpers/db';

describe('agents module (integration)', () => {
  const ctx = setupTestDb();

  it('contratar um agente emite evento de atividade e reserva orcamento', async () => {
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

**Regras:**
- Testes possuem suas proprias fixtures; sem DB de teste com seed global.
- Envolva cada teste em uma transacao e rollback, OU use `TRUNCATE … RESTART IDENTITY` entre testes.

---

## Testes de Extensao

**Adapters built-in** (`packages/adapters/*`) sao testados como qualquer pacote TypeScript: unit-test logica spawn, wiring env, e quaisquer code paths `./server` / `./cli`. Nao ha "contract suite" central de adapter — correcao e garantida pelo shape do adapter (`type`, `label`, `models`, `agentConfigurationDoc`) e pela tipagem do registro server-side.

**Plugins** usam o harness first-party:

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

**Regra:** Um plugin nao e mergeavel ate que seus testes de harness cubram pelo menos o happy path e um failure path por evento / job declarado.

---

## Testes de UI Web

Use Vitest + React Testing Library para componentes; Playwright para fluxos E2E (aprovacoes, contratacao de agentes, visualizacao de custo).

**Nao** teste logica de governanca na UI — ela vive no server. Testes UI asseveram renderizacao, interacao, e chamadas cliente API.

---

## Dados de Teste

- Factories ao inves de fixtures: `makeAgent({ budgetTokens: 100 })` em vez de arquivos JSON.
- IDs deterministicos (`crypto.randomUUID` em producao, seeded em testes).
- Sem sleeps. Injete o clock. Use `vi.useFakeTimers()` para testes de intervalo de heartbeat.

---

## Proibido

- Sleeping para esperar trabalho async (use `await` ou fake timers).
- Testes que dependem de ordem de execucao.
- Mock da unidade sob teste.
- `.skip` / `.only` merged para main.
- Comparar contra snapshots sem revisao humana — snapshots apodrecem.

---

## Execucao

```bash
pnpm test                    # Tudo
pnpm test --coverage         # Com cobertura
pnpm test --project=server   # Escopo workspace
pnpm test adapters           # Filtro de path
pnpm test:e2e                # Playwright
```

---

## Protocolo Bug-Fix (Regressao)

1. Escreva um teste que falha reproduzindo o bug.
2. Commit o teste que falha (opcional, mas legal).
3. Corrija o codigo.
4. Teste passa. Merge.

Sem correcao sem teste de regressao.

---

## Checklist

- [ ] Vitest configurado, cobertura ≥ 80%
- [ ] Testes de contrato adapter passam para cada adapter
- [ ] Testes de integracao batem em DB real
- [ ] Factories usados ao inves de fixtures
- [ ] Sem sleeps, sem `.only` / `.skip` em main

---

**Ultima atualizacao:** 2026-04 | **Versao:** 1.0.0 | **Autor:** The Bearded CTO
