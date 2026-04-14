# New Extension Checklist — Paperclip

A "new extension" is either a **built-in adapter** (AI runtime under `packages/adapters/<name>/`) or a **plugin** (feature, distributed via `@paperclipai/plugin-sdk` and `create-paperclip-plugin`). Pick one first.

## 0. Decision

- [ ] Confirm: is this a new AI runtime (**adapter**) or a feature (**plugin**)?
- [ ] Check the existing Paperclip adapters (`claude-local`, `codex-local`, `cursor-local`, `gemini-local`, `opencode-local`, `openclaw-gateway`, `pi-local`) — maybe one already fits
- [ ] Pick a kebab-case name

---

## Track A — Plugin (most common)

### 1. Scaffold

```bash
npm create paperclip-plugin@latest
```

- [ ] Output directory contains `src/worker.ts`, `src/manifest.ts`, `tests/`
- [ ] `pnpm install` succeeds

### 2. Manifest

- [ ] `id`, `name`, `version` set; `version` matches `package.json`
- [ ] `apiVersion: 1`
- [ ] `capabilities` declared **minimally** (don't broadly request `network`, `filesystem`, etc.)
- [ ] `categories` appropriate
- [ ] `instanceConfigSchema` generated from a Zod schema with clear `.describe(...)` on every field

### 3. Worker

- [ ] `definePlugin({ setup(ctx), onHealth })` default export
- [ ] `runWorker(plugin, import.meta.url)` present
- [ ] `setup(ctx)` registers handlers synchronously (no awaiting upstream calls during setup)
- [ ] Events subscribed via `ctx.events.on(...)`
- [ ] Jobs registered via `ctx.jobs.register(...)`
- [ ] Secrets resolved via `ctx.secrets.resolve(ref)` — no raw keys in code
- [ ] State persisted via `ctx.state` with proper scope (company / project / issue)
- [ ] HTTP calls use `ctx.http.fetch` (respects capabilities and allowlist)

### 4. Tests

- [ ] `createTestHarness` from `@paperclipai/plugin-sdk/testing`
- [ ] Happy path covered
- [ ] Event handler failure case covered
- [ ] Health check returns quickly

### 5. Install & verify

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
paperclipai plugin list
```

- [ ] Plugin appears healthy in the dashboard
- [ ] Events it listens to trigger its handlers
- [ ] Uninstall leaves no residual state it shouldn't keep

### 6. Docs

- [ ] `README.md` lists: purpose, config fields, required capabilities, events handled, jobs exposed, known limits
- [ ] `CHANGELOG.md` starts at `0.1.0`

---

## Track B — Built-in adapter (AI runtime)

Adding a built-in adapter means contributing to (or forking) Paperclip.

### 1. Package

- [ ] New folder `packages/adapters/<name>/`
- [ ] `package.json` named `@paperclipai/adapter-<name>`, in the `@paperclipai/*` scope
- [ ] Exports: `.`, `./server`, `./ui`, `./cli` (only those you implement)

### 2. Entry (`src/index.ts`)

- [ ] Exports `type` (stable wire identifier, e.g. `<name>_local`)
- [ ] Exports `label` (human-readable)
- [ ] Exports `models` (id + label list)
- [ ] Exports `agentConfigurationDoc` (markdown describing all fields accurately)

### 3. Server surface (`src/server/index.ts`)

- [ ] Process spawn + supervise code
- [ ] Timeout + SIGTERM grace handling
- [ ] Workspace strategy support (`git_worktree` etc.)
- [ ] Paperclip runtime env vars (`PAPERCLIP_WORKSPACE_*`, `PAPERCLIP_RUNTIME_*`) propagated to the child
- [ ] **No** budget / approval / permission checks here — server owns that

### 4. Registration

- [ ] Server boot registers the adapter via `registerServerAdapter(adapter)`
- [ ] Existing adapter lookup helpers (`requireServerAdapter`, etc.) work with it

### 5. UI / CLI surfaces (optional)

- [ ] `src/ui/index.ts` — React bits for the adapter config form
- [ ] `src/cli/index.ts` — subcommands under `paperclipai` if the adapter needs them

### 6. Tests

- [ ] Unit tests for spawn / parse / env logic
- [ ] Adapter is exercised end-to-end in the repo's e2e tests if it's broadly relevant

### 7. Docs

- [ ] `agentConfigurationDoc` is complete and correct
- [ ] `CHANGELOG.md` starts at `0.1.0`
- [ ] Entry added to the Paperclip docs site under "Adapters"
