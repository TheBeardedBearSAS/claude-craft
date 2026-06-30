# Adapter & Plugins — Paperclip

> **Maßgebliche Quellen:**
> - `@paperclipai/plugin-sdk`-Paket (v1.0.0) — Exports bei `packages/plugins/sdk/`
> - Adapter-Pakete bei `packages/adapters/*` — z.B. `@paperclipai/adapter-claude-local`
> - Docs: https://docs.paperclip.ing/
>
> **Beobachtet im Repo unter** https://github.com/paperclipai/paperclip **(v2026.609.0).** APIs entwickeln sich — im Zweifel das Paket `.d.ts` und die offiziellen Docs öffnen.

Paperclip bietet **zwei Erweiterungspunkte**. Verwechseln Sie sie nicht.

| | **Adapters** | **Plugins** |
|---|---|---|
| Zweck | Wählen Sie, welche AI-Runtime einen Agent antreibt (Claude Code, Codex, Gemini, Cursor, OpenCode, …) | Features hinzufügen: Integrationen, Dashboards, Jobs, UI-Slots |
| Ausgeliefert bei | `packages/adapters/<name>/` | Externe Pakete oder `packages/plugins/examples/*` |
| SDK | keines für Built-ins erforderlich; kann `@paperclipai/adapter-utils` verwenden | `@paperclipai/plugin-sdk` |
| Entry-Shape | `export const type, label, models, agentConfigurationDoc` + `./server`, `./ui`, `./cli` Subpaths | `definePlugin({ setup(ctx) })` + `runWorker(...)` |
| Transport | In-process + gespawnte Child-Prozesse pro Run | JSON-RPC 2.0 über stdio zwischen Host und Worker |
| Scaffolded via | Kopieren Sie einen existierenden Adapter (`claude-local`, `pi-local`) als Template | `npm create paperclip-plugin@latest` |

---

## 1. Built-in-Adapter

Adapter werden per Type entdeckt. Ein minimales Adapter-Paket bietet:

```ts
// packages/adapters/<name>/src/index.ts
export const type = "<name>_local";        // stabiler Identifier in Agent-Configs verwendet
export const label = "Human-readable name";
export const models = [
  { id: "model-id", label: "Model display name" },
  // ...
];

export const agentConfigurationDoc = `# <name>_local agent configuration

Adapter: <name>_local

Core-Felder:
- cwd (string, optional): Standard-Arbeitsverzeichnis
- model (string, optional): Modell-ID
- command (string, optional): CLI-Binärname
- extraArgs (string[], optional): Extra-CLI-Args
- env (object, optional): KEY=VALUE Env-Overrides
- workspaceStrategy (object, optional): { type: "git_worktree", ... }

Operational-Felder:
- timeoutSec (number, optional): Run-Timeout
- graceSec (number, optional): SIGTERM-Grace-Period
`;
```

Optionale Subpath-Exports:

```
packages/adapters/<name>/src/
├── index.ts          # shared (type, label, models, doc)
├── server/index.ts   # serverseitige Hooks (Spawning, Process-Lifecycle)
├── ui/index.ts       # UI-Komponenten, die zum Dashboard beitragen
└── cli/index.ts      # CLI-Subcommands, die zu `paperclipai` beitragen
```

Registriert via mutierbarer serverseitiger Registry:

```ts
// server/src/adapters/registry.ts
registerServerAdapter(adapter);     // add
unregisterServerAdapter(type);      // remove
requireServerAdapter(type);         // lookup (wirft, falls absent)
```

### Regeln

- Der `type` ist der stabile Wire-Identifier; niemals umbenennen, nachdem Agents ihn nutzen.
- Agents referenzieren den Adapter in ihrer Config: `{ "adapterType": "<name>_local", ... }`.
- Die `models`-Liste treibt den UI-Selector an. Halten Sie sie synchron mit dem, was die Runtime unterstützt.
- `agentConfigurationDoc` ist die menschenlesbare Referenz für alle Felder. Halten Sie sie wahrheitsgetreu und kurz.
- **Fügen Sie hier keine Governance-Logik hinzu.** Budgets, Approvals, Activity: diese werden von der Plattform durchgesetzt, nicht vom Adapter.
- Adapter können wohlbekannte Env-Vars in den Agent-Prozess injizieren (Paperclip injiziert `PAPERCLIP_WORKSPACE_*` und `PAPERCLIP_RUNTIME_*` für agent-seitiges Tooling).

---

## 2. Plugins (`@paperclipai/plugin-sdk`)

Plugins fügen **Features** hinzu — Integrationen, Sync-Jobs, Dashboards, Launcher, Tools. Sie laufen als Worker-Prozesse, die mit dem Host über JSON-RPC 2.0 auf stdio kommunizieren.

### Scaffolding

```bash
npm create paperclip-plugin@latest
# oder
pnpm create paperclip-plugin
```

### Entry

```ts
// src/worker.ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Ihr API-Key"),
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

### PluginContext-Oberfläche (Highlights)

| Client | Verwendung für |
|---|---|
| `ctx.logger` | Strukturierte Logs |
| `ctx.config` | Aufgelöste Instanz-Config (via Zod validiert) |
| `ctx.events` | Plattform-Events abonnieren (`issue.created`, `agent.hired`, …) |
| `ctx.jobs` | Langläufige Background-Jobs registrieren |
| `ctx.launchers` | Launcher-UI-Einträge registrieren |
| `ctx.http` | Host-kontrollierter HTTP-Client (respektiert Allowlist / Capabilities) |
| `ctx.secrets` | Secret-Referenzen auflösen; sehen niemals rohe Werte, außer die Ref gehört diesem Plugin |
| `ctx.activity` | Activity-Log-Einträge emittieren (`PluginActivityLogEntry`) |
| `ctx.state` | Gescoped State-Store (Scope: company, project, issue, …) |
| `ctx.entities`, `ctx.projects`, `ctx.companies`, `ctx.issues`, `ctx.agents`, `ctx.goals` | Typisierte Domain-Reads |
| `ctx.agentSessions` | Agent-Session programmatisch steuern |
| `ctx.data`, `ctx.actions`, `ctx.streams`, `ctx.tools` | Provider-Oberflächen registrieren |
| `ctx.metrics`, `ctx.telemetry` | Metriken und Telemetrie |

### Manifest

Ein Plugin liefert ein `PaperclipPluginManifestV1` aus, das Jobs, Webhooks, Tools, UI-Slots, Launcher, Capabilities beschreibt. Typen sind aus `@paperclipai/plugin-sdk` re-exportiert:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
```

Deklarieren Sie nur die Capabilities, die Sie tatsächlich benötigen — der Host setzt sie durch (`CapabilityDeniedError` sonst).

### Testing

```ts
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";

const harness = createTestHarness(plugin, { /* options */ });
await harness.emit({ type: "issue.created", /* ... */ });
// assertieren auf harness.logs, harness.jobs, ctx calls
```

### Goldene Regeln

- **Deklarieren Sie Capabilities ehrlich.** Fehlende Capability → `CapabilityDeniedError`.
- **Speichern Sie niemals Secrets.** Gehen Sie immer über `ctx.secrets.resolve(ref)`.
- **Persistieren Sie niemals Host-Daten.** Verwenden Sie `ctx.state` mit dem richtigen Scope.
- **Ein Plugin = eine Verantwortlichkeit.** Ein Linear-Sync-Plugin macht Linear; es managed nicht auch GitHub.
- **Respektieren Sie Rate-Limits** bei Verwendung von `ctx.http`.
- **Loggen Sie Events, nicht Strings**: `ctx.logger.info("issue synced", { issueId, durationMs })`.

---

## 3. Governance: wo sie tatsächlich lebt

Weder Adapter noch Plugins besitzen Governance. Die **Plattform** (Server) setzt durch:

- **Budgets** — Token- und Dollar-Caps. Durchgesetzt zur Agent-Runtime im Server.
- **Approvals** — Gates auf sensiblen Aktionen. Entschieden von Operators in der UI; Adapter/Plugins werden via Events benachrichtigt.
- **Activity-Log** — Append-only. Adapter tragen indirekt Activity bei; Plugins können Einträge via `ctx.activity` emittieren.
- **Secrets** — verschlüsselt at rest. Zugriff über `ctx.secrets.resolve(ref)`; rohe Werte werden niemals zum Plugin geschickt.
- **Tenancy** — jede Ressource ist server-seitig per `companyId` gescoped.

Der Adapter-/Plugin-Autor **DARF NICHT** versuchen, diese lokal durchzusetzen. Niemals Approval-Entscheidungen cachen. Niemals Budgets entscheiden. Niemals Permissions lokal berechnen.

---

## Anti-Patterns

- Ein Plugin, das Secrets per Disk-Pfad liest.
- Ein Adapter, der die Agent-Config umschreibt, um Plattform-Validierung zu umgehen.
- Plugin-Code, der globalen mutierbaren State über Jobs hält — verwenden Sie `ctx.state`.
- Plugins, die beliebige Outbound-Connections öffnen, ohne die Capability zu deklarieren.
- Ad-hoc-JSON-RPC-Methoden auf der Plugin-Seite — bleiben Sie beim Protokoll, das vom SDK exponiert wird.

---

## Checklist — Neuer Built-in-Adapter

- [ ] Paket unter `packages/adapters/<name>/` benannt `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exportiert `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] `./server`, `./ui`, `./cli` Subpaths exportiert, wenn benötigt
- [ ] `registerServerAdapter(adapter)` beim Server-Boot verdrahtet
- [ ] `agentConfigurationDoc` ist akkurat und minimal
- [ ] Unit-Tests für die Spawn- / Parse- / Env-Logik

## Checklist — Neues Plugin

- [ ] Scaffolded mit `npm create paperclip-plugin@latest`
- [ ] Manifest deklariert Jobs / Webhooks / Tools / Launcher
- [ ] Nur die Capabilities, die Sie benötigen, sind deklariert
- [ ] `setup(ctx)` registriert Handler, abonniert Events, kehrt synchron zurück
- [ ] Config validiert mit `z.object(...)`
- [ ] `onHealth()` implementiert
- [ ] Test-Harness aus `@paperclipai/plugin-sdk/testing` deckt Happy Path + Failure-Paths ab
- [ ] README beschreibt: Zweck, Konfiguration, erforderliche Capabilities, Events, auf die es reagiert, Jobs, die es registriert

---

**Zuletzt aktualisiert:** 2026-04 | **Version:** 2.0.0 | **Autor:** The Bearded CTO
