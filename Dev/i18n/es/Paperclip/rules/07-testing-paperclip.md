# Testing — Paperclip

> Objetivo de cobertura: **80%+**. Tests de contrato de adapter: **100% obligatorio**.
> Framework: **Vitest** (ver `vitest.config.ts` en el repo de Paperclip).

## Pirámide

| Capa | Porcentaje | Velocidad | Dónde |
|---|---|---|---|
| Unit | 65% | < 50ms | `server/src/**/*.test.ts`, `ui/src/**/*.test.tsx`, `packages/**/*.test.ts` |
| Integration | 25% | < 2s | `server/src/**/*.integration.test.ts` |
| Plugin harness | 5% | < 5s | Paquetes de plugin usando `@paperclipai/plugin-sdk/testing` |
| E2E (UI) | 5% | < 30s | `tests/e2e/` (Playwright) |

---

## Configuración de Vitest

`vitest.config.ts` en la raíz del workspace:

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

Web usa una segunda config de workspace con `environment: 'jsdom'` o Vitest Browser Mode.

---

## Tests Unitarios — Servidor

Los servicios y lógica de dominio son los objetivos principales de tests unitarios. **Mockear el repositorio**, nunca la DB.

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

**Reglas:**
- Un comportamiento por test. Sin mega-tests que "hacen todo".
- Afirmar sobre resultados (actividad emitida, escritura DB, código de error) — no sobre orden de llamadas internas a menos que el orden sea parte del contrato.
- Fakes frescos por test; sin estado mutable compartido.

---

## Tests de Integración — Servidor

Ejecutar contra un **PostgreSQL real** (testcontainers o una DB local desechable). Nunca mockear la DB aquí.

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

**Reglas:**
- Los tests poseen sus fixtures; sin DB de test sembrada globalmente.
- Envolver cada test en una transacción y hacer rollback, O usar `TRUNCATE … RESTART IDENTITY` entre tests.

---

## Tests de Extensiones

**Adapters integrados** (`packages/adapters/*`) se testean como cualquier paquete TypeScript: test unitario de lógica spawn, cableado env, y cualquier path de código `./server` / `./cli`. No hay una "suite de contrato" de adapter central — la corrección está garantizada por la forma del adapter (`type`, `label`, `models`, `agentConfigurationDoc`) y por el tipado del registro del lado del servidor.

**Plugins** usan el harness de primera parte:

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

**Regla:** Un plugin no es mergeable hasta que sus tests de harness cubran al menos el happy path y un path de fallo por evento / job declarado.

---

## Tests de Web UI

Usar Vitest + React Testing Library para componentes; Playwright para flujos E2E (aprobaciones, contratación de agentes, visualización de costos).

**No** testear lógica de gobernanza en la UI — vive en el servidor. Los tests de UI afirman renderizado, interacción, y llamadas de cliente API.

---

## Datos de Test

- Factories sobre fixtures: `makeAgent({ budgetTokens: 100 })` en lugar de archivos JSON.
- IDs determinísticos (`crypto.randomUUID` en producción, seeded en tests).
- Sin sleeps. Inyectar el reloj. Usar `vi.useFakeTimers()` para tests de intervalo de heartbeat.

---

## Prohibido

- Dormir para esperar trabajo async (usar `await` o fake timers).
- Tests que dependen del orden de ejecución.
- Mockear la unidad bajo test.
- `.skip` / `.only` mergeados a main.
- Comparar contra snapshots sin revisión humana — los snapshots se pudren.

---

## Ejecución

```bash
pnpm test                    # Todo
pnpm test --coverage         # Con cobertura
pnpm test --project=server   # Alcance de workspace
pnpm test adapters           # Filtro de path
pnpm test:e2e                # Playwright
```

---

## Protocolo de Fix de Bug (Regresión)

1. Escribir un test fallido que reproduzca el bug.
2. Commitear el test fallido (opcional, pero bueno).
3. Arreglar el código.
4. Test pasa. Merge.

Sin fix sin test de regresión.

---

## Checklist

- [ ] Vitest configurado, cobertura ≥ 80%
- [ ] Tests de contrato de adapter pasan para cada adapter
- [ ] Tests de integración impactan una DB real
- [ ] Factories usados en lugar de fixtures
- [ ] Sin sleeps, sin `.only` / `.skip` en main

---

**Última actualización:** 2026-04 | **Versión:** 1.0.0 | **Autor:** The Bearded CTO
