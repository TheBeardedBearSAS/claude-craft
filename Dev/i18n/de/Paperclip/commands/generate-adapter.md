---
description: Erstellt ein Paperclip-Extension-Gerüst (Plugin via create-paperclip-plugin oder Built-in-Adapter)
argument-hint: [name] [kind]
---

# Generieren einer Paperclip-Extension

## Argumente

1. `name` (erforderlich) — Kebab-Case-Name (z.B. `linear-sync`, `custom-claude`)
2. `kind` (erforderlich) — eines von `plugin` | `adapter`

## Welches?

| Bedarf | Verwenden Sie |
|---|---|
| Features, Integrationen, Jobs, UI-Slots oder ein neues Dashboard-Widget hinzufügen | **plugin** |
| Eine neue **AI-Runtime**-Option hinzufügen (neuer CLI-Agent, neue Remote-Runtime) | **adapter** |

Im Zweifel: Beginnen Sie mit einem Plugin.

---

## `kind = plugin` (empfohlen)

Paperclip liefert einen First-Party-Scaffolder.

```bash
# In einem leeren Verzeichnis (oder Monorepo-Root)
npm create paperclip-plugin@latest
# oder
pnpm create paperclip-plugin
```

Folgen Sie den Prompts. Output:

```
<plugin-name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts          # definePlugin({ setup(ctx) }) + runWorker
│   ├── manifest.ts        # PaperclipPluginManifestV1
│   └── ui/                # optional — React-Teile für UI-Slots
├── tests/
│   └── worker.test.ts     # createTestHarness aus @paperclipai/plugin-sdk/testing
└── README.md
```

Minimaler Worker:

```ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("API-Key-Referenz (ctx.secrets)"),
});

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info(`${ctx.manifest.name} starting`);

    ctx.events.on("issue.created", async (event) => {
      ctx.logger.info("issue.created", { entityId: event.entityId });
      // ...
    });

    ctx.jobs.register("hello", async (job) => {
      ctx.logger.info("hello job", { runId: job.runId });
    });
  },
  async onHealth() {
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
```

### Manifest-Essentials

Deklarieren Sie **nur** die Capabilities, die Sie benötigen:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

export const manifest: PaperclipPluginManifestV1 = {
  apiVersion: 1,
  id: "acme-linear-sync",
  name: "Acme Linear Sync",
  version: "0.1.0",
  categories: ["integration"],
  capabilities: ["network.http", "events.subscribe"],  // enger Scope!
  instanceConfigSchema: { /* JSON Schema aus zod */ },
  jobs: [{ key: "full-sync", title: "Full sync" }],
  // webhooks, launchers, ui slots, tools — nur hinzufügen, was Sie ausliefern
};
```

### Tests

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("hello plugin", () => {
  it("loggt beim Start", async () => {
    const harness = createTestHarness(plugin, { config: { apiKey: "secret-ref" } });
    await harness.setup();
    expect(harness.logs.some((l) => l.msg.includes("starting"))).toBe(true);
  });
});
```

### Installieren & Aktivieren in einer Paperclip-Instanz

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin list
paperclipai plugin enable <pluginKey>
paperclipai plugin inspect <pluginKey>
```

---

## `kind = adapter` (fortgeschritten)

Built-in-Adapter leben im Paperclip-Monorepo unter `packages/adapters/<name>/`. Einen zu erstellen bedeutet, zum Paperclip-Projekt (oder einem Fork) beizutragen.

Kopieren Sie einen existierenden Adapter (z.B. `packages/adapters/pi-local/`) und passen Sie ihn an. Die Form:

```
packages/adapters/<name>/
├── package.json               # @paperclipai/adapter-<name>
├── src/
│   ├── index.ts               # exports: type, label, models, agentConfigurationDoc
│   ├── server/index.ts        # Process-Lifecycle, Spawn-Logik
│   ├── ui/index.ts            # optionale UI-Beiträge
│   └── cli/index.ts           # optionale CLI-Subcommands
└── CHANGELOG.md
```

Minimales `src/index.ts`:

```ts
export const type = "<name>_local";
export const label = "<Human name> (local)";
export const models = [
  { id: "<model-id>", label: "<Display name>" },
];
export const agentConfigurationDoc = `# ${type} agent configuration
Adapter: ${type}
Core-Felder: cwd, model, command, extraArgs, env, workspaceStrategy, timeoutSec, graceSec
`;
```

Registrieren Sie den Adapter server-seitig beim Boot:

```ts
// server/src/adapters/index.ts
import * as myAdapter from "@paperclipai/adapter-<name>/server";
registerServerAdapter(myAdapter);
```

Adapter berechnen **nicht** Budgets oder Approvals. Governance ist die Aufgabe des Servers — der Adapter spawnt und überwacht nur den Agent-Prozess.

---

## Do / Don't

| Do | Don't |
|---|---|
| Deklarieren Sie das minimale Capability-Set | `network` breit anfordern |
| Lösen Sie Secrets mit `ctx.secrets.resolve(ref)` auf | Rohe Keys in Plugin-Code übergeben |
| Verwenden Sie `ctx.state` für per-Scope-Persistenz | Dateien auf Disk schreiben |
| Registrieren Sie Handler synchron in `setup()` | Async-Work im `setup()`-Return-Pfad durchführen |
| Halten Sie Manifest-Version synchron mit `package.json` | Inkompatible Versionen ausliefern |

## Checklist nach Scaffolding

- [ ] `pnpm install` läuft erfolgreich
- [ ] `pnpm typecheck` + `pnpm test` grün
- [ ] Manifest deklariert nur die erforderlichen Capabilities
- [ ] README deckt ab: Zweck, Config, erforderliche Secrets/Capabilities, behandelte Events
- [ ] Für Adapter: `type` ist stabil, `models` wahrheitsgetreu, `agentConfigurationDoc` entspricht echten Feldern
