# Tests — Paperclip

> Cible de couverture : **80%+**. Tests de contrat adaptateur : **100% obligatoires**.
> Framework : **Vitest** (voir `vitest.config.ts` dans le dépôt Paperclip).

## Pyramide

| Couche | Part | Vitesse | Où |
|---|---|---|---|
| Unit | 65% | < 50ms | `server/src/**/*.test.ts`, `ui/src/**/*.test.tsx`, `packages/**/*.test.ts` |
| Integration | 25% | < 2s | `server/src/**/*.integration.test.ts` |
| Plugin harness | 5% | < 5s | Packages plugin utilisant `@paperclipai/plugin-sdk/testing` |
| E2E (UI) | 5% | < 30s | `tests/e2e/` (Playwright) |

---

## Configuration Vitest

`vitest.config.ts` à la racine de l'espace de travail :

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

Web utilise une seconde config workspace avec `environment: 'jsdom'` ou Vitest Browser Mode.

---

## Tests unitaires — Serveur

Les services et la logique domaine sont les cibles principales des tests unitaires. **Mocker le repository**, jamais la DB.

```ts
import { describe, it, expect, vi } from 'vitest';
import { ApprovalService } from './approval-service';

describe('ApprovalService.approve', () => {
  it('rejette l\'approbation quand l\'agent dépasse le budget', async () => {
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

**Règles :**
- Un comportement par test. Pas de méga-tests « fait tout ».
- Asserter sur les résultats (activité émise, écriture DB, code erreur) — pas sur l'ordre d'appel interne sauf si l'ordre fait partie du contrat.
- Fakes frais par test ; pas d'état mutable partagé.

---

## Tests d'intégration — Serveur

Exécuter contre une **vraie PostgreSQL** (testcontainers ou DB jetable locale). Ne jamais mocker la DB ici.

```ts
import { setupTestDb, teardownTestDb } from '../../../tests/helpers/db';

describe('agents module (integration)', () => {
  const ctx = setupTestDb();

  it('embaucher un agent émet un événement d\'activité et réserve le budget', async () => {
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

**Règles :**
- Les tests possèdent leurs fixtures ; pas de DB de test globalement seedée.
- Envelopper chaque test dans une transaction et rollback, OU utiliser `TRUNCATE … RESTART IDENTITY` entre tests.

---

## Tests d'extensions

**Adaptateurs intégrés** (`packages/adapters/*`) sont testés comme tout package TypeScript : tests unitaires de la logique spawn, câblage env, et tous chemins de code `./server` / `./cli`. Il n'y a pas de « suite de contrat » d'adaptateur centrale — la correction est garantie par la forme de l'adaptateur (`type`, `label`, `models`, `agentConfigurationDoc`) et par le typage du registre côté serveur.

**Plugins** utilisent le harness first-party :

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("my plugin", () => {
  it("gère issue.created", async () => {
    const harness = createTestHarness(plugin, {
      config: { apiKeyRef: "demo" },
    });
    await harness.setup();
    await harness.emit({ type: "issue.created", entityId: "iss-1" });
    expect(harness.http.calls).toHaveLength(1);
  });
});
```

**Règle :** Un plugin n'est pas fusionnable tant que ses tests harness ne couvrent pas au moins le happy path et un failure path par événement / job déclaré.

---

## Tests Web UI

Utiliser Vitest + React Testing Library pour composants ; Playwright pour flux E2E (approbations, embauche agent, visualisation coûts).

**Ne pas** tester la logique de gouvernance dans l'UI — elle vit sur le serveur. Les tests UI assertent le rendu, l'interaction, et les appels clients API.

---

## Données de test

- Factories plutôt que fixtures : `makeAgent({ budgetTokens: 100 })` plutôt que fichiers JSON.
- IDs déterministes (`crypto.randomUUID` en production, seedé en tests).
- Pas de sleeps. Injecter l'horloge. Utiliser `vi.useFakeTimers()` pour tests d'intervalles heartbeat.

---

## Interdit

- Dormir pour attendre du travail async (utiliser `await` ou fake timers).
- Tests dépendant de l'ordre d'exécution.
- Mocker l'unité testée.
- `.skip` / `.only` fusionnés dans main.
- Comparer contre des snapshots sans revue humaine — les snapshots pourrissent.

---

## Exécution

```bash
pnpm test                    # Tout
pnpm test --coverage         # Avec couverture
pnpm test --project=server   # Scope workspace
pnpm test adapters           # Filtre de chemin
pnpm test:e2e                # Playwright
```

---

## Protocole de correction de bug (Régression)

1. Écrire un test qui échoue et reproduit le bug.
2. Committer le test qui échoue (optionnel, mais bien).
3. Corriger le code.
4. Le test passe. Fusionner.

Pas de correction sans test de régression.

---

## Checklist

- [ ] Vitest configuré, couverture ≥ 80%
- [ ] Les tests de contrat adaptateur passent pour chaque adaptateur
- [ ] Les tests d'intégration touchent une vraie DB
- [ ] Factories utilisées au lieu de fixtures
- [ ] Pas de sleeps, pas de `.only` / `.skip` dans main

---

**Dernière mise à jour :** 2026-04 | **Version :** 1.0.0 | **Auteur :** The Bearded CTO
