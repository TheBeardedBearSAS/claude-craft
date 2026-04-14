---
description: Scaffold a Paperclip extension (plugin via create-paperclip-plugin, or built-in adapter)
argument-hint: [name] [kind]
---

# Generate a Paperclip Extension

## Arguments

1. `name` (required) — kebab-case name (e.g. `linear-sync`, `custom-claude`)
2. `kind` (required) — one of `plugin` | `adapter`

## Which one?

| Need | Use |
|---|---|
| Add features, integrations, jobs, UI slots, or a new dashboard widget | **plugin** |
| Add a new **AI runtime** option (new CLI agent, new remote runtime) | **adapter** |

If in doubt: start with a plugin.

---

## `kind = plugin` (recommended)

Paperclip ships a first-party scaffolder.

```bash
# In an empty directory (or monorepo root)
npm create paperclip-plugin@latest
# or
pnpm create paperclip-plugin
```

Follow the prompts. Output:

```
<plugin-name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts          # definePlugin({ setup(ctx) }) + runWorker
│   ├── manifest.ts        # PaperclipPluginManifestV1
│   └── ui/                # optional — React pieces for UI slots
├── tests/
│   └── worker.test.ts     # createTestHarness from @paperclipai/plugin-sdk/testing
└── README.md
```

Minimal worker:

```ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("API key reference (ctx.secrets)"),
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

### Manifest essentials

Declare **only** the capabilities you need:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

export const manifest: PaperclipPluginManifestV1 = {
  apiVersion: 1,
  id: "acme-linear-sync",
  name: "Acme Linear Sync",
  version: "0.1.0",
  categories: ["integration"],
  capabilities: ["network.http", "events.subscribe"],  // narrow scope!
  instanceConfigSchema: { /* JSON Schema from zod */ },
  jobs: [{ key: "full-sync", title: "Full sync" }],
  // webhooks, launchers, ui slots, tools — add only what you ship
};
```

### Tests

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("hello plugin", () => {
  it("logs on startup", async () => {
    const harness = createTestHarness(plugin, { config: { apiKey: "secret-ref" } });
    await harness.setup();
    expect(harness.logs.some((l) => l.msg.includes("starting"))).toBe(true);
  });
});
```

### Install & enable in a Paperclip instance

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin list
paperclipai plugin enable <pluginKey>
paperclipai plugin inspect <pluginKey>
```

---

## `kind = adapter` (advanced)

Built-in adapters live in the Paperclip monorepo under `packages/adapters/<name>/`. Creating one means contributing to the Paperclip project (or a fork).

Copy an existing adapter (e.g. `packages/adapters/pi-local/`) and adapt it. The shape:

```
packages/adapters/<name>/
├── package.json               # @paperclipai/adapter-<name>
├── src/
│   ├── index.ts               # exports: type, label, models, agentConfigurationDoc
│   ├── server/index.ts        # process lifecycle, spawn logic
│   ├── ui/index.ts            # optional UI contributions
│   └── cli/index.ts           # optional CLI subcommands
└── CHANGELOG.md
```

Minimal `src/index.ts`:

```ts
export const type = "<name>_local";
export const label = "<Human name> (local)";
export const models = [
  { id: "<model-id>", label: "<Display name>" },
];
export const agentConfigurationDoc = `# ${type} agent configuration
Adapter: ${type}
Core fields: cwd, model, command, extraArgs, env, workspaceStrategy, timeoutSec, graceSec
`;
```

Register the adapter server-side at boot:

```ts
// server/src/adapters/index.ts
import * as myAdapter from "@paperclipai/adapter-<name>/server";
registerServerAdapter(myAdapter);
```

Adapters do **not** compute budgets or approvals. Governance is the server's job — the adapter just spawns and supervises the agent process.

---

## Do / Don't

| Do | Don't |
|---|---|
| Declare the minimal capability set | Request `network` broadly |
| Resolve secrets with `ctx.secrets.resolve(ref)` | Pass raw keys into plugin code |
| Use `ctx.state` for per-scope persistence | Write files to disk |
| Register handlers synchronously in `setup()` | Do async work inside `setup()` return path |
| Keep manifest version in sync with `package.json` | Ship mismatched versions |

## Post-scaffold checklist

- [ ] `pnpm install` succeeds
- [ ] `pnpm typecheck` + `pnpm test` green
- [ ] Manifest declares only the required capabilities
- [ ] README covers: purpose, config, required secrets/capabilities, events handled
- [ ] For adapters: `type` is stable, `models` truthful, `agentConfigurationDoc` matches real fields
