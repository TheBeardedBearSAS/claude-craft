# Paperclip Architecture — Principles and Organization

> Source of truth: https://docs.paperclip.ing/ and the repo at https://github.com/paperclipai/paperclip.
> Observed version: v2026.609.0 (MIT, April 2026).

## Monorepo Shape (observed in repo)

```
paperclip/
├── server/                          # @paperclipai/server — Node.js + TS HTTP API
│   ├── src/
│   │   ├── routes/                  # HTTP routes (companies, agents, approvals, ...)
│   │   ├── adapters/                # Server-side adapter registry + lookup
│   │   └── ...
│   └── vitest.config.ts
│
├── ui/                              # @paperclipai/ui — React dashboard
│
├── cli/                             # paperclipai CLI (commander.js)
│   ├── src/
│   │   ├── commands/                # onboard, doctor, env, configure, ...
│   │   └── commands/client/         # company, agent, approval, activity, plugin, ...
│   └── esbuild.config.mjs
│
├── packages/
│   ├── shared/                      # @paperclipai/shared — cross-cutting types + schemas
│   ├── db/                          # @paperclipai/db — schema, migrations
│   ├── mcp-server/                  # @paperclipai/mcp-server
│   ├── adapter-utils/               # @paperclipai/adapter-utils — helpers for adapter authors
│   ├── adapters/                    # Built-in adapters
│   │   ├── claude-local/            # @paperclipai/adapter-claude-local
│   │   ├── codex-local/
│   │   ├── cursor-local/
│   │   ├── gemini-local/
│   │   ├── opencode-local/
│   │   ├── openclaw-gateway/
│   │   └── pi-local/
│   └── plugins/
│       ├── sdk/                     # @paperclipai/plugin-sdk — public SDK for external plugins
│       ├── create-paperclip-plugin/ # @paperclipai/create-paperclip-plugin — scaffolder
│       └── examples/                # plugin-hello-world-example, plugin-kitchen-sink-example, ...
│
├── tests/
│   ├── e2e/                         # Playwright
│   └── release-smoke/
│
├── docker/
├── scripts/
└── docs/                            # Mintlify site
```

## Workspaces

Root `package.json` / `pnpm-workspace.yaml` defines the workspaces. Every package is published under the `@paperclipai/*` scope. `packageManager` is pinned (`pnpm@9.15.x`).

## Layers

1. **Server** — HTTP API + governance logic (budgets, approvals, activity log, tenancy).
2. **UI** — React dashboard. Renders, interacts, never decides governance.
3. **CLI** — Operator tooling (onboard, doctor, company/agent/approval management). Adapters can contribute CLI subcommands via their `./cli` export.
4. **Packages** — Reusable libraries: `shared` (types), `db` (schema), `adapter-utils`, `mcp-server`, and two extension families.
5. **Extension points** — See `12-adapter-protocol.md`:
   - **Adapters** (`packages/adapters/*`) — which AI runtime powers an agent
   - **Plugins** (`@paperclipai/plugin-sdk`, scaffolded by `create-paperclip-plugin`) — features, integrations, jobs, UI slots

## Core Domains (server routes observed)

- **Companies** (`/companies/...`) — tenant boundary
- **Agents** (`/agents`, `/companies/:companyId/agents`, `/agent-hires`) — registered workers
- **Approvals** (`/approvals/...`) — human-in-the-loop gates
- **Activity** — append-only audit
- **Issues / Projects / Goals** — product-level constructs. Issues are the unit of work dispatched to agents; the `workMode` field on an agent hire payload controls how the agent processes them (execution mode — consult the instance docs for supported values).
- **Plugin** — plugin management via CLI (`paperclipai plugin ...`)

## Dependency Direction

```
server ─► @paperclipai/shared
server ─► @paperclipai/db
ui     ─► @paperclipai/shared  (types only)
plugins ─► @paperclipai/plugin-sdk ─► @paperclipai/shared
adapters (built-in) ─► @paperclipai/adapter-utils (optional)
```

- `shared` is pure types and schemas. No framework imports, no runtime HTTP clients.
- UI never imports from `server/` directly. Types come from `shared`.
- Plugins depend only on the SDK (and optionally adapter-utils if they care about adapters).
- Adapters (built-in) live in their package; they register themselves into the server registry at boot.

## Architectural Rules

| Rule | Why |
|---|---|
| Governance (budgets, approvals, secrets, tenancy) is server-only | Adapters/plugins can't bypass it |
| Adapters expose `type`, `label`, `models`, `agentConfigurationDoc` | Stable wire contract for agents |
| Plugins use `definePlugin({ setup(ctx) })` and declare capabilities | SDK-mediated sandbox |
| UI consumes typed data from `shared` via server APIs | No direct DB access |
| Activity log is append-only and emitted for every mutation | Auditability non-negotiable |
| Workspace links preflighted before build/typecheck (`preflight:workspace-links`) | Prevents drift between packages |

## Architectural Patterns

- **Modular monorepo** — one deploy, enforced boundaries via workspace packages.
- **Append-only activity log** — every mutation emits an event; dashboards and plugins read from it.
- **Typed schemas everywhere** — Zod at config boundaries, TS types throughout.
- **JSON-RPC 2.0** — host ↔ plugin worker protocol (see `12-adapter-protocol.md`).
- **Adapter registry** — mutable, with `registerServerAdapter` / `unregisterServerAdapter` / `requireServerAdapter`.

## Anti-Patterns

- Governance logic in a plugin or adapter.
- UI computing budget / approval state instead of reading a server-computed flag.
- Adapter that rewrites an agent config to skip platform validation.
- Plugin storing state in a file on disk instead of `ctx.state`.
- Cross-workspace imports that bypass the package's public export.

## Checklist

- [ ] New package lives under `server/`, `ui/`, `cli/`, or `packages/*`
- [ ] Published under the `@paperclipai/*` scope (for new public packages)
- [ ] `pnpm run preflight:workspace-links` passes
- [ ] No governance logic outside `server/`
- [ ] Activity event emitted for every mutation
- [ ] Types consumed from `@paperclipai/shared` when crossing workspace boundaries

---

**Last updated:** 2026-04 | **Version:** 2.0.0 | **Author:** The Bearded CTO
