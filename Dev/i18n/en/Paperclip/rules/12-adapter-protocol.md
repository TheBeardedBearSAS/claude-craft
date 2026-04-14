# Adapters & Plugins — Paperclip

> **Authoritative sources:**
> - `@paperclipai/plugin-sdk` package (v1.0.0) — exports at `packages/plugins/sdk/`
> - Adapter packages at `packages/adapters/*` — e.g. `@paperclipai/adapter-claude-local`
> - Docs: https://docs.paperclip.ing/
>
> **Observed in repo at** https://github.com/paperclipai/paperclip **(v2026.403.0).** APIs evolve — when in doubt, open the package `.d.ts` and the official docs.

Paperclip exposes **two extension points**. Don't mix them up.

| | **Adapters** | **Plugins** |
|---|---|---|
| Purpose | Choose which AI runtime powers an agent (Claude Code, Codex, Gemini, Cursor, OpenCode, …) | Add features: integrations, dashboards, jobs, UI slots |
| Shipped at | `packages/adapters/<name>/` | External packages or `packages/plugins/examples/*` |
| SDK | none required for built-ins; can use `@paperclipai/adapter-utils` | `@paperclipai/plugin-sdk` |
| Entry shape | `export const type, label, models, agentConfigurationDoc` + `./server`, `./ui`, `./cli` subpaths | `definePlugin({ setup(ctx) })` + `runWorker(...)` |
| Transport | In-process + spawned child processes per run | JSON-RPC 2.0 over stdio between host and worker |
| Scaffolded via | Copy an existing adapter (`claude-local`, `pi-local`) as template | `npm create paperclip-plugin@latest` |

---

## 1. Built-in Adapters

Adapters are discovered by type. A minimal adapter package exposes:

```ts
// packages/adapters/<name>/src/index.ts
export const type = "<name>_local";        // stable identifier used in agent configs
export const label = "Human-readable name";
export const models = [
  { id: "model-id", label: "Model display name" },
  // ...
];

export const agentConfigurationDoc = `# <name>_local agent configuration

Adapter: <name>_local

Core fields:
- cwd (string, optional): default working directory
- model (string, optional): model id
- command (string, optional): CLI binary name
- extraArgs (string[], optional): extra CLI args
- env (object, optional): KEY=VALUE env overrides
- workspaceStrategy (object, optional): { type: "git_worktree", ... }

Operational fields:
- timeoutSec (number, optional): run timeout
- graceSec (number, optional): SIGTERM grace period
`;
```

Optional subpath exports:

```
packages/adapters/<name>/src/
├── index.ts          # shared (type, label, models, doc)
├── server/index.ts   # server-side hooks (spawning, process lifecycle)
├── ui/index.ts       # UI components contributed to the dashboard
└── cli/index.ts      # CLI subcommands contributed to `paperclipai`
```

Registered via a mutable server-side registry:

```ts
// server/src/adapters/registry.ts
registerServerAdapter(adapter);     // add
unregisterServerAdapter(type);      // remove
requireServerAdapter(type);         // lookup (throws if absent)
```

### Rules

- The `type` is the stable wire identifier; never rename it after agents start using it.
- Agents reference the adapter in their config: `{ "adapterType": "<name>_local", ... }`.
- `models` list drives the UI selector. Keep it in sync with what the runtime supports.
- `agentConfigurationDoc` is the human-facing reference for all fields. Keep it truthful and short.
- **Do not add governance logic here.** Budgets, approvals, activity: those are enforced by the platform, not the adapter.
- Adapters may inject well-known env vars into the agent process (Paperclip injects `PAPERCLIP_WORKSPACE_*` and `PAPERCLIP_RUNTIME_*` for agent-side tooling).

---

## 2. Plugins (`@paperclipai/plugin-sdk`)

Plugins add **features** — integrations, sync jobs, dashboards, launchers, tools. They run as worker processes that talk to the host over JSON-RPC 2.0 on stdio.

### Scaffolding

```bash
npm create paperclip-plugin@latest
# or
pnpm create paperclip-plugin
```

### Entry

```ts
// src/worker.ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Your API key"),
  workspace: z.string().optional(),
});

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("Plugin starting");

    ctx.events.on("issue.created", async (event) => {
      const config = await ctx.config.get();
      await ctx.http.fetch("https://api.example.com/webhook", {
        method: "POST",
        headers: { Authorization: `Bearer ${await ctx.secrets.resolve(config.apiKeyRef as string)}` },
        body: JSON.stringify({ issueId: event.entityId }),
      });
    });

    ctx.jobs.register("full-sync", async (job) => {
      ctx.logger.info("Full sync", { runId: job.runId });
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

### PluginContext surface (highlights)

| Client | Use for |
|---|---|
| `ctx.logger` | Structured logs |
| `ctx.config` | Resolved instance config (validated by Zod) |
| `ctx.events` | Subscribe to platform events (`issue.created`, `agent.hired`, …) |
| `ctx.jobs` | Register long-running background jobs |
| `ctx.launchers` | Register launcher UI entries |
| `ctx.http` | Host-controlled HTTP client (respects allowlist / capabilities) |
| `ctx.secrets` | Resolve secret references; never see raw values unless the ref is owned by this plugin |
| `ctx.activity` | Emit activity log entries (`PluginActivityLogEntry`) |
| `ctx.state` | Scoped state store (scope: company, project, issue, …) |
| `ctx.entities`, `ctx.projects`, `ctx.companies`, `ctx.issues`, `ctx.agents`, `ctx.goals` | Typed domain reads |
| `ctx.agentSessions` | Drive an agent session programmatically |
| `ctx.data`, `ctx.actions`, `ctx.streams`, `ctx.tools` | Register provider surfaces |
| `ctx.metrics`, `ctx.telemetry` | Metrics and telemetry |

### Manifest

A plugin ships a `PaperclipPluginManifestV1` describing jobs, webhooks, tools, UI slots, launchers, capabilities. Types are re-exported from `@paperclipai/plugin-sdk`:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
```

Declare only the capabilities you actually need — the host enforces them (`CapabilityDeniedError` otherwise).

### Testing

```ts
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";

const harness = createTestHarness(plugin, { /* options */ });
await harness.emit({ type: "issue.created", /* ... */ });
// assert on harness.logs, harness.jobs, ctx calls
```

### Golden Rules

- **Declare capabilities honestly.** Missing capability → `CapabilityDeniedError`.
- **Never store secrets.** Always go through `ctx.secrets.resolve(ref)`.
- **Never persist host data.** Use `ctx.state` with the right scope.
- **One plugin = one responsibility.** A Linear-sync plugin does Linear; it doesn't also manage GitHub.
- **Respect rate limits** when using `ctx.http`.
- **Log events, not strings**: `ctx.logger.info("issue synced", { issueId, durationMs })`.

---

## 3. Governance: where it actually lives

Neither adapters nor plugins own governance. The **platform** (server) enforces:

- **Budgets** — token and dollar caps. Enforced at agent runtime in the server.
- **Approvals** — gates on sensitive actions. Decided by operators in the UI; adapters/plugins are notified via events.
- **Activity log** — append-only. Adapters contribute activity indirectly; plugins may emit entries via `ctx.activity`.
- **Secrets** — encrypted at rest. Accessed through `ctx.secrets.resolve(ref)`; raw values are never shipped to the plugin.
- **Tenancy** — every resource is scoped by `companyId` server-side.

The adapter/plugin author **MUST NOT** try to enforce these locally. Never cache approval decisions. Never decide budgets. Never compute permission locally.

---

## Anti-Patterns

- A plugin that reads secrets by disk path.
- An adapter that rewrites the agent config to bypass platform validation.
- Plugin code that holds global mutable state across jobs — use `ctx.state`.
- Plugins that open arbitrary outbound connections without declaring the capability.
- Ad-hoc JSON-RPC methods on the plugin side — stick to the protocol exposed by the SDK.

---

## Checklist — New Built-in Adapter

- [ ] Package under `packages/adapters/<name>/` named `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exports `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] `./server`, `./ui`, `./cli` subpaths exported when needed
- [ ] `registerServerAdapter(adapter)` wired at server boot
- [ ] `agentConfigurationDoc` is accurate and minimal
- [ ] Unit tests for the spawn / parse / env logic

## Checklist — New Plugin

- [ ] Scaffolded with `npm create paperclip-plugin@latest`
- [ ] Manifest declares jobs / webhooks / tools / launchers
- [ ] Only the capabilities you need are declared
- [ ] `setup(ctx)` registers handlers, subscribes events, returns synchronously
- [ ] Config validated with `z.object(...)`
- [ ] `onHealth()` implemented
- [ ] Test harness from `@paperclipai/plugin-sdk/testing` covers the happy path + failure paths
- [ ] README describes: purpose, configuration, required capabilities, events it reacts to, jobs it registers

---

**Last updated:** 2026-04 | **Version:** 2.0.0 | **Author:** The Bearded CTO
