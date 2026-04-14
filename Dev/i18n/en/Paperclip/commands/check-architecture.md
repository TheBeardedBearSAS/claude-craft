---
description: Audit Paperclip Architecture
argument-hint: [project-path]
---

# Audit Paperclip Architecture

## MISSION

Validate the two-layer architecture (control plane + adapters) and module boundaries of a Paperclip project.

## Procedure

### 1. Workspace shape

- [ ] `server/`, `ui/`, `cli/`, `packages/` directories present
- [ ] `packages/` contains `shared/`, `db/`, `adapter-utils/`, `mcp-server/`, `adapters/`, `plugins/`
- [ ] `pnpm-workspace.yaml` lists the workspaces
- [ ] Root `package.json` declares `"packageManager": "pnpm@9.15.x"`
- [ ] `pnpm run preflight:workspace-links` passes
- [ ] No legacy Lerna / npm workspaces config remains

### 2. Control plane modules

Under `server/src/modules/` expect one folder per domain (agents, approvals, costs, companies, goals, activity, secrets). For each module:

- [ ] `routes.ts` — HTTP only, calls services, no DB access
- [ ] `service.ts` — business logic, emits activity events
- [ ] `repository.ts` — parameterized queries, no business rules
- [ ] `types.ts` — re-exported via `shared/`
- [ ] `*.test.ts` colocated
- [ ] No imports crossing into another module's internals (only via its service API)

Flag: any route that reads the DB directly, any service that builds SQL strings, any cross-module import bypassing the service layer.

### 3. Adapters (built-in, `packages/adapters/*`)

- [ ] Each adapter lives under `packages/adapters/<name>/` and is named `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exports `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Optional subpaths (`./server`, `./ui`, `./cli`) are present only when implemented
- [ ] **No governance logic** inside the adapter — the server owns budgets / approvals / permissions
- [ ] Server bootstrap registers it via `registerServerAdapter(...)`

### 3b. Plugins (`@paperclipai/plugin-sdk`)

- [ ] Scaffolded via `create-paperclip-plugin` (or structurally equivalent)
- [ ] `definePlugin({ setup, onHealth })` in the worker entry
- [ ] Manifest declares only necessary capabilities
- [ ] No secrets read from disk; always via `ctx.secrets.resolve(ref)`

### 4. Shared types

- [ ] `shared/types/` contains only `.ts` type declarations
- [ ] No runtime code (no functions, no classes)
- [ ] No framework imports (React, Express, etc.)

### 5. Web UI

- [ ] `ui/src/` API client consumes server types via `@paperclipai/shared` — no hand-rolled `fetch` with untyped responses
- [ ] No governance decisions in components (no "if budget > X then hide button" — server decides, UI renders)

### 6. Activity log coverage

Grep for each DB mutation (`INSERT`, `UPDATE`, `DELETE` not in migrations/seeds). Each must be adjacent to an activity event emission. Report mutations without a matching `activity.emit(...)`.

### 7. OpenAPI spec

- [ ] `server/src/api/openapi.yaml` (or generated) is committed
- [ ] Every route has a matching operation
- [ ] Generated web client is up to date (`pnpm generate:api` produces no diff)

## Output

Markdown report with:
- Pass/fail per checkbox above
- Offending file paths (line numbers when available)
- Severity: Blocker / Major / Minor
- Score /25 for use by `/paperclip:check-compliance`
