# Paperclip-Architektur — Prinzipien und Organisation

> Quelle der Wahrheit: https://docs.paperclip.ing/ und das Repo unter https://github.com/paperclipai/paperclip.
> Beobachtete Version: v2026.609.0 (MIT, April 2026).

## Monorepo-Form (im Repo beobachtet)

```
paperclip/
├── server/                          # @paperclipai/server — Node.js + TS HTTP API
│   ├── src/
│   │   ├── routes/                  # HTTP-Routen (companies, agents, approvals, ...)
│   │   ├── adapters/                # Serverseitige Adapter-Registry + Lookup
│   │   └── ...
│   └── vitest.config.ts
│
├── ui/                              # @paperclipai/ui — React Dashboard
│
├── cli/                             # paperclipai CLI (commander.js)
│   ├── src/
│   │   ├── commands/                # onboard, doctor, env, configure, ...
│   │   └── commands/client/         # company, agent, approval, activity, plugin, ...
│   └── esbuild.config.mjs
│
├── packages/
│   ├── shared/                      # @paperclipai/shared — übergreifende Typen + Schemas
│   ├── db/                          # @paperclipai/db — Schema, Migrationen
│   ├── mcp-server/                  # @paperclipai/mcp-server
│   ├── adapter-utils/               # @paperclipai/adapter-utils — Helfer für Adapter-Autoren
│   ├── adapters/                    # Eingebaute Adapter
│   │   ├── claude-local/            # @paperclipai/adapter-claude-local
│   │   ├── codex-local/
│   │   ├── cursor-local/
│   │   ├── gemini-local/
│   │   ├── opencode-local/
│   │   ├── openclaw-gateway/
│   │   └── pi-local/
│   └── plugins/
│       ├── sdk/                     # @paperclipai/plugin-sdk — öffentliches SDK für externe Plugins
│       ├── create-paperclip-plugin/ # @paperclipai/create-paperclip-plugin — Scaffolder
│       └── examples/                # plugin-hello-world-example, plugin-kitchen-sink-example, ...
│
├── tests/
│   ├── e2e/                         # Playwright
│   └── release-smoke/
│
├── docker/
├── scripts/
└── docs/                            # Mintlify-Website
```

## Workspaces

Die Root-Dateien `package.json` / `pnpm-workspace.yaml` definieren die Workspaces. Jedes Package wird unter dem `@paperclipai/*`-Scope veröffentlicht. Der `packageManager` ist festgelegt (`pnpm@9.15.x`).

## Schichten

1. **Server** — HTTP-API + Governance-Logik (Budgets, Approvals, Activity-Log, Tenancy).
2. **UI** — React-Dashboard. Rendert, interagiert, entscheidet niemals über Governance.
3. **CLI** — Operator-Tooling (onboard, doctor, company/agent/approval management). Adapter können CLI-Subcommands über ihren `./cli`-Export beitragen.
4. **Packages** — Wiederverwendbare Bibliotheken: `shared` (Typen), `db` (Schema), `adapter-utils`, `mcp-server` und zwei Extension-Familien.
5. **Extension-Points** — Siehe `12-adapter-protocol.md`:
   - **Adapter** (`packages/adapters/*`) — welche AI-Runtime einen Agent antreibt
   - **Plugins** (`@paperclipai/plugin-sdk`, generiert von `create-paperclip-plugin`) — Features, Integrationen, Jobs, UI-Slots

## Kern-Domänen (im Server beobachtete Routen)

- **Companies** (`/companies/...`) — Mandantengrenze
- **Agents** (`/agents`, `/companies/:companyId/agents`, `/agent-hires`) — registrierte Worker
- **Approvals** (`/approvals/...`) — Human-in-the-Loop-Gates
- **Activity** — Append-only Audit
- **Issues / Projects / Goals** — Produktebene-Konstrukte
- **Plugin** — Plugin-Management via CLI (`paperclipai plugin ...`)

## Abhängigkeitsrichtung

```
server ─► @paperclipai/shared
server ─► @paperclipai/db
ui     ─► @paperclipai/shared  (nur Typen)
plugins ─► @paperclipai/plugin-sdk ─► @paperclipai/shared
adapters (built-in) ─► @paperclipai/adapter-utils (optional)
```

- `shared` sind reine Typen und Schemas. Keine Framework-Imports, keine Runtime-HTTP-Clients.
- UI importiert niemals direkt aus `server/`. Typen kommen aus `shared`.
- Plugins hängen nur vom SDK ab (und optional von adapter-utils, falls sie sich um Adapter kümmern).
- Adapter (built-in) leben in ihrem Package; sie registrieren sich beim Boot in der Server-Registry.

## Architekturregeln

| Regel | Warum |
|---|---|
| Governance (Budgets, Approvals, Secrets, Tenancy) ist ausschließlich Server-seitig | Adapter/Plugins können es nicht umgehen |
| Adapter exponieren `type`, `label`, `models`, `agentConfigurationDoc` | Stabiler Wire-Contract für Agents |
| Plugins verwenden `definePlugin({ setup(ctx) })` und deklarieren Capabilities | SDK-vermittelte Sandbox |
| UI konsumiert typisierte Daten aus `shared` via Server-APIs | Kein direkter DB-Zugriff |
| Activity-Log ist append-only und wird für jede Mutation emittiert | Auditierbarkeit ist nicht verhandelbar |
| Workspace-Links werden vor build/typecheck geprüft (`preflight:workspace-links`) | Verhindert Drift zwischen Packages |

## Architektur-Patterns

- **Modulares Monorepo** — ein Deployment, durchgesetzte Grenzen via Workspace-Packages.
- **Append-only Activity-Log** — jede Mutation emittiert ein Event; Dashboards und Plugins lesen daraus.
- **Typisierte Schemas überall** — Zod an Config-Grenzen, TS-Typen durchgängig.
- **JSON-RPC 2.0** — Host ↔ Plugin-Worker-Protokoll (siehe `12-adapter-protocol.md`).
- **Adapter-Registry** — veränderbar, mit `registerServerAdapter` / `unregisterServerAdapter` / `requireServerAdapter`.

## Anti-Patterns

- Governance-Logik in einem Plugin oder Adapter.
- UI berechnet Budget-/Approval-Status, statt ein vom Server berechnetes Flag zu lesen.
- Adapter, der eine Agent-Config umschreibt, um Platform-Validation zu überspringen.
- Plugin speichert Zustand in einer Datei auf Disk statt in `ctx.state`.
- Workspace-übergreifende Imports, die den öffentlichen Export des Packages umgehen.

## Checklist

- [ ] Neues Package liegt unter `server/`, `ui/`, `cli/` oder `packages/*`
- [ ] Veröffentlicht unter dem `@paperclipai/*`-Scope (für neue öffentliche Packages)
- [ ] `pnpm run preflight:workspace-links` läuft erfolgreich durch
- [ ] Keine Governance-Logik außerhalb von `server/`
- [ ] Activity-Event für jede Mutation emittiert
- [ ] Typen aus `@paperclipai/shared` konsumiert, wenn Workspace-Grenzen überschritten werden

---

**Letzte Aktualisierung:** 2026-04 | **Version:** 2.0.0 | **Autor:** The Bearded CTO
