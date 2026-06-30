---
description: "Échafauder une extension Paperclip (plugin via create-paperclip-plugin, ou adaptateur intégré)"
argument-hint: "[nom] [kind]"
---

# Générer une extension Paperclip

## Arguments

1. `name` (requis) — nom en kebab-case (ex. `linear-sync`, `custom-claude`)
2. `kind` (requis) — l'un de `plugin` | `adapter`

## Lequel choisir ?

| Besoin | Utiliser |
|---|---|
| Ajouter des fonctionnalités, intégrations, tâches, emplacements UI, ou un nouveau widget de tableau de bord | **plugin** |
| Ajouter une nouvelle option de **runtime IA** (nouvel agent CLI, nouveau runtime distant) | **adapter** |

En cas de doute : commencer par un plugin.

---

## `kind = plugin` (recommandé)

Paperclip fournit un échafaudeur officiel.

```bash
# Dans un répertoire vide (ou racine de monorepo)
npm create paperclip-plugin@latest
# ou
pnpm create paperclip-plugin
```

Suivre les invites. Sortie :

```
<nom-plugin>/
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts          # definePlugin({ setup(ctx) }) + runWorker
│   ├── manifest.ts        # PaperclipPluginManifestV1
│   └── ui/                # optionnel — morceaux React pour emplacements UI
├── tests/
│   └── worker.test.ts     # createTestHarness de @paperclipai/plugin-sdk/testing
└── README.md
```

Worker minimal :

```ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Référence de clé API (ctx.secrets)"),
});

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info(`${ctx.manifest.name} démarre`);

    ctx.events.on("issue.created", async (event) => {
      ctx.logger.info("issue.created", { entityId: event.entityId });
      // ...
    });

    ctx.jobs.register("hello", async (job) => {
      ctx.logger.info("tâche hello", { runId: job.runId });
    });
  },
  async onHealth() {
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
```

### Essentiels du manifeste

Déclarer **uniquement** les capacités dont vous avez besoin :

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

export const manifest: PaperclipPluginManifestV1 = {
  apiVersion: 1,
  id: "acme-linear-sync",
  name: "Acme Linear Sync",
  version: "0.1.0",
  categories: ["integration"],
  capabilities: ["network.http", "events.subscribe"],  // scope étroit !
  instanceConfigSchema: { /* JSON Schema depuis zod */ },
  jobs: [{ key: "full-sync", title: "Synchronisation complète" }],
  // webhooks, lanceurs, emplacements ui, outils — ajouter uniquement ce que vous fournissez
};
```

### Tests

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("plugin hello", () => {
  it("logge au démarrage", async () => {
    const harness = createTestHarness(plugin, { config: { apiKey: "secret-ref" } });
    await harness.setup();
    expect(harness.logs.some((l) => l.msg.includes("démarre"))).toBe(true);
  });
});
```

### Installer & activer dans une instance Paperclip

```bash
paperclipai plugin install ./<nom-plugin>
paperclipai plugin list
paperclipai plugin enable <pluginKey>
paperclipai plugin inspect <pluginKey>
```

---

## `kind = adapter` (avancé)

Les adaptateurs intégrés vivent dans le monorepo Paperclip sous `packages/adapters/<nom>/`. En créer un signifie contribuer au projet Paperclip (ou un fork).

Copier un adaptateur existant (ex. `packages/adapters/pi-local/`) et l'adapter. La forme :

```
packages/adapters/<nom>/
├── package.json               # @paperclipai/adapter-<nom>
├── src/
│   ├── index.ts               # exports : type, label, models, agentConfigurationDoc
│   ├── server/index.ts        # cycle de vie du processus, logique de spawn
│   ├── ui/index.ts            # contributions UI optionnelles
│   └── cli/index.ts           # sous-commandes CLI optionnelles
└── CHANGELOG.md
```

`src/index.ts` minimal :

```ts
export const type = "<nom>_local";
export const label = "<Nom humain> (local)";
export const models = [
  { id: "<model-id>", label: "<Nom d'affichage>" },
];
export const agentConfigurationDoc = `# configuration d'agent ${type}
Adaptateur : ${type}
Champs principaux : cwd, model, command, extraArgs, env, workspaceStrategy, timeoutSec, graceSec
`;
```

Enregistrer l'adaptateur côté serveur au démarrage :

```ts
// server/src/adapters/index.ts
import * as myAdapter from "@paperclipai/adapter-<nom>/server";
registerServerAdapter(myAdapter);
```

Les adaptateurs ne calculent **pas** les budgets ou approbations. La gouvernance est le travail du serveur — l'adaptateur génère et supervise simplement le processus de l'agent.

---

## À faire / À ne pas faire

| À faire | À ne pas faire |
|---|---|
| Déclarer l'ensemble minimal de capacités | Demander `network` largement |
| Résoudre les secrets avec `ctx.secrets.resolve(ref)` | Passer des clés brutes dans le code du plugin |
| Utiliser `ctx.state` pour la persistence par scope | Écrire des fichiers sur le disque |
| Enregistrer les gestionnaires de manière synchrone dans `setup()` | Faire du travail async dans le chemin de retour de `setup()` |
| Garder la version du manifeste synchronisée avec `package.json` | Fournir des versions désynchronisées |

## Checklist post-échafaudage

- [ ] `pnpm install` réussit
- [ ] `pnpm typecheck` + `pnpm test` verts
- [ ] Le manifeste ne déclare que les capacités requises
- [ ] Le README couvre : objectif, config, secrets/capacités requis, événements gérés
- [ ] Pour les adaptateurs : `type` est stable, `models` véridiques, `agentConfigurationDoc` correspond aux champs réels
