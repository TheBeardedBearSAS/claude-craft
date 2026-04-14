# Adaptateurs & Plugins — Paperclip

> **Sources autoritaires :**
> - package `@paperclipai/plugin-sdk` (v1.0.0) — exports à `packages/plugins/sdk/`
> - Packages d'adaptateurs à `packages/adapters/*` — ex. `@paperclipai/adapter-claude-local`
> - Docs : https://docs.paperclip.ing/
>
> **Observé dans le dépôt** https://github.com/paperclipai/paperclip **(v2026.403.0).** Les APIs évoluent — en cas de doute, ouvrir le fichier `.d.ts` du package et la documentation officielle.

Paperclip expose **deux points d'extension**. Ne pas les mélanger.

| | **Adaptateurs** | **Plugins** |
|---|---|---|
| Objectif | Choisir quel runtime IA alimente un agent (Claude Code, Codex, Gemini, Cursor, OpenCode, …) | Ajouter des fonctionnalités : intégrations, tableaux de bord, tâches, emplacements UI |
| Fournis à | `packages/adapters/<nom>/` | Packages externes ou `packages/plugins/examples/*` |
| SDK | aucun requis pour les built-ins ; peut utiliser `@paperclipai/adapter-utils` | `@paperclipai/plugin-sdk` |
| Forme d'entrée | `export const type, label, models, agentConfigurationDoc` + sous-chemins `./server`, `./ui`, `./cli` | `definePlugin({ setup(ctx) })` + `runWorker(...)` |
| Transport | En processus + processus enfants générés par exécution | JSON-RPC 2.0 sur stdio entre hôte et worker |
| Échafaudé via | Copier un adaptateur existant (`claude-local`, `pi-local`) comme modèle | `npm create paperclip-plugin@latest` |

---

## 1. Adaptateurs intégrés

Les adaptateurs sont découverts par type. Un package adaptateur minimal expose :

```ts
// packages/adapters/<nom>/src/index.ts
export const type = "<nom>_local";        // identifiant stable utilisé dans les configs d'agent
export const label = "Nom lisible par l'humain";
export const models = [
  { id: "model-id", label: "Nom d'affichage du modèle" },
  // ...
];

export const agentConfigurationDoc = `# configuration d'agent <nom>_local

Adaptateur : <nom>_local

Champs principaux :
- cwd (string, optionnel) : répertoire de travail par défaut
- model (string, optionnel) : id du modèle
- command (string, optionnel) : nom du binaire CLI
- extraArgs (string[], optionnel) : arguments CLI supplémentaires
- env (object, optionnel) : surcharges d'env KEY=VALUE
- workspaceStrategy (object, optionnel) : { type: "git_worktree", ... }

Champs opérationnels :
- timeoutSec (number, optionnel) : timeout d'exécution
- graceSec (number, optionnel) : période de grâce SIGTERM
`;
```

Exports de sous-chemins optionnels :

```
packages/adapters/<nom>/src/
├── index.ts          # partagé (type, label, models, doc)
├── server/index.ts   # hooks côté serveur (spawn, cycle de vie du processus)
├── ui/index.ts       # composants UI contribués au tableau de bord
└── cli/index.ts      # sous-commandes CLI contribuées à `paperclipai`
```

Enregistré via un registre côté serveur mutable :

```ts
// server/src/adapters/registry.ts
registerServerAdapter(adapter);     // ajouter
unregisterServerAdapter(type);      // supprimer
requireServerAdapter(type);         // rechercher (lance une exception si absent)
```

### Règles

- Le `type` est l'identifiant stable sur le réseau ; ne jamais le renommer après que les agents commencent à l'utiliser.
- Les agents référencent l'adaptateur dans leur config : `{ "adapterType": "<nom>_local", ... }`.
- La liste `models` pilote le sélecteur UI. La garder en synchronisation avec ce que le runtime supporte.
- `agentConfigurationDoc` est la référence destinée à l'humain pour tous les champs. La garder véridique et courte.
- **Ne pas ajouter de logique de gouvernance ici.** Budgets, approbations, activité : ceux-ci sont appliqués par la plateforme, pas l'adaptateur.
- Les adaptateurs peuvent injecter des variables d'env bien connues dans le processus de l'agent (Paperclip injecte `PAPERCLIP_WORKSPACE_*` et `PAPERCLIP_RUNTIME_*` pour les outils côté agent).

---

## 2. Plugins (`@paperclipai/plugin-sdk`)

Les plugins ajoutent des **fonctionnalités** — intégrations, tâches de synchronisation, tableaux de bord, lanceurs, outils. Ils s'exécutent comme processus workers qui communiquent avec l'hôte via JSON-RPC 2.0 sur stdio.

### Échafaudage

```bash
npm create paperclip-plugin@latest
# ou
pnpm create paperclip-plugin
```

### Entrée

```ts
// src/worker.ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Votre clé API"),
  workspace: z.string().optional(),
});

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("Démarrage du plugin");

    ctx.events.on("issue.created", async (event) => {
      const config = await ctx.config.get();
      await ctx.http.fetch("https://api.example.com/webhook", {
        method: "POST",
        headers: { Authorization: `Bearer ${await ctx.secrets.resolve(config.apiKeyRef as string)}` },
        body: JSON.stringify({ issueId: event.entityId }),
      });
    });

    ctx.jobs.register("full-sync", async (job) => {
      ctx.logger.info("Synchronisation complète", { runId: job.runId });
      // ...
    });

    ctx.data.register("sync-health", async ({ companyId }) => {
      const last = await ctx.state.get({
        scopeKind: "company",
        scopeId: String(companyId),
        stateKey: "last-sync-at",
      });
      return { lastSync: last };
    });
  },

  async onHealth() {
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
```

### Surface du PluginContext (points clés)

| Client | Utiliser pour |
|---|---|
| `ctx.logger` | Logs structurés |
| `ctx.config` | Config d'instance résolue (validée par Zod) |
| `ctx.events` | S'abonner aux événements de la plateforme (`issue.created`, `agent.hired`, …) |
| `ctx.jobs` | Enregistrer des tâches de fond longues |
| `ctx.launchers` | Enregistrer des entrées de lanceur UI |
| `ctx.http` | Client HTTP contrôlé par l'hôte (respecte allowlist / capacités) |
| `ctx.secrets` | Résoudre les références de secrets ; ne jamais voir les valeurs brutes sauf si la réf appartient à ce plugin |
| `ctx.activity` | Émettre des entrées de journal d'activité (`PluginActivityLogEntry`) |
| `ctx.state` | Magasin d'état scopé (scope : entreprise, projet, issue, …) |
| `ctx.entities`, `ctx.projects`, `ctx.companies`, `ctx.issues`, `ctx.agents`, `ctx.goals` | Lectures de domaine typées |
| `ctx.agentSessions` | Piloter une session d'agent programmatiquement |
| `ctx.data`, `ctx.actions`, `ctx.streams`, `ctx.tools` | Enregistrer des surfaces de fournisseur |
| `ctx.metrics`, `ctx.telemetry` | Métriques et télémétrie |

### Manifeste

Un plugin fournit un `PaperclipPluginManifestV1` décrivant les tâches, webhooks, outils, emplacements UI, lanceurs, capacités. Les types sont ré-exportés depuis `@paperclipai/plugin-sdk` :

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
```

Déclarer uniquement les capacités dont vous avez réellement besoin — l'hôte les applique (`CapabilityDeniedError` sinon).

### Tests

```ts
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";

const harness = createTestHarness(plugin, { /* options */ });
await harness.emit({ type: "issue.created", /* ... */ });
// asserter sur harness.logs, harness.jobs, appels ctx
```

### Règles d'or

- **Déclarer les capacités honnêtement.** Capacité manquante → `CapabilityDeniedError`.
- **Ne jamais stocker de secrets.** Toujours passer par `ctx.secrets.resolve(ref)`.
- **Ne jamais persister les données de l'hôte.** Utiliser `ctx.state` avec le bon scope.
- **Un plugin = une responsabilité.** Un plugin de synchronisation Linear fait du Linear ; il ne gère pas aussi GitHub.
- **Respecter les limites de taux** lors de l'utilisation de `ctx.http`.
- **Logger des événements, pas des chaînes** : `ctx.logger.info("issue synchronisée", { issueId, durationMs })`.

---

## 3. Gouvernance : où elle vit réellement

Ni les adaptateurs ni les plugins ne possèdent la gouvernance. La **plateforme** (serveur) applique :

- **Budgets** — plafonds de tokens et de dollars. Appliqués au runtime de l'agent dans le serveur.
- **Approbations** — barrières sur les actions sensibles. Décidées par les opérateurs dans l'UI ; adaptateurs/plugins sont notifiés via événements.
- **Journal d'activité** — append-only. Les adaptateurs contribuent à l'activité indirectement ; les plugins peuvent émettre des entrées via `ctx.activity`.
- **Secrets** — chiffrés au repos. Accédés via `ctx.secrets.resolve(ref)` ; les valeurs brutes ne sont jamais envoyées au plugin.
- **Tenancy** — chaque ressource est scopée par `companyId` côté serveur.

L'auteur de l'adaptateur/plugin **NE DOIT PAS** essayer d'appliquer ceux-ci localement. Ne jamais mettre en cache les décisions d'approbation. Ne jamais décider des budgets. Ne jamais calculer les permissions localement.

---

## Anti-patterns

- Un plugin qui lit les secrets par chemin de disque.
- Un adaptateur qui réécrit la config de l'agent pour contourner la validation de la plateforme.
- Code de plugin qui maintient un état mutable global entre les tâches — utiliser `ctx.state`.
- Plugins qui ouvrent des connexions sortantes arbitraires sans déclarer la capacité.
- Méthodes JSON-RPC ad-hoc côté plugin — s'en tenir au protocole exposé par le SDK.

---

## Checklist — Nouvel adaptateur intégré

- [ ] Package sous `packages/adapters/<nom>/` nommé `@paperclipai/adapter-<nom>`
- [ ] `src/index.ts` exporte `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Sous-chemins `./server`, `./ui`, `./cli` exportés si nécessaire
- [ ] `registerServerAdapter(adapter)` câblé au démarrage du serveur
- [ ] `agentConfigurationDoc` est précis et minimal
- [ ] Tests unitaires pour la logique spawn / parse / env

## Checklist — Nouveau plugin

- [ ] Échafaudé avec `npm create paperclip-plugin@latest`
- [ ] Le manifeste déclare jobs / webhooks / outils / lanceurs
- [ ] Seules les capacités dont vous avez besoin sont déclarées
- [ ] `setup(ctx)` enregistre les gestionnaires, s'abonne aux événements, retourne de manière synchrone
- [ ] Config validée avec `z.object(...)`
- [ ] `onHealth()` implémenté
- [ ] Harnais de test de `@paperclipai/plugin-sdk/testing` couvre le chemin heureux + chemins d'échec
- [ ] README décrit : objectif, configuration, capacités requises, événements auxquels il réagit, tâches qu'il enregistre

---

**Dernière mise à jour :** 2026-04 | **Version :** 2.0.0 | **Auteur :** The Bearded CTO
