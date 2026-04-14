# Neue Extension Checklist — Paperclip

Eine "neue Extension" ist entweder ein **built-in Adapter** (AI-Runtime unter `packages/adapters/<name>/`) oder ein **Plugin** (Feature, verteilt via `@paperclipai/plugin-sdk` und `create-paperclip-plugin`). Zuerst einen auswählen.

## 0. Entscheidung

- [ ] Bestätigen: Ist dies eine neue AI-Runtime (**Adapter**) oder ein Feature (**Plugin**)?
- [ ] Die existierenden Paperclip-Adapter prüfen (`claude-local`, `codex-local`, `cursor-local`, `gemini-local`, `opencode-local`, `openclaw-gateway`, `pi-local`) — vielleicht passt bereits einer
- [ ] Einen kebab-case-Namen wählen

---

## Track A — Plugin (am häufigsten)

### 1. Scaffold

```bash
npm create paperclip-plugin@latest
```

- [ ] Output-Verzeichnis enthält `src/worker.ts`, `src/manifest.ts`, `tests/`
- [ ] `pnpm install` erfolgreich

### 2. Manifest

- [ ] `id`, `name`, `version` gesetzt; `version` matcht `package.json`
- [ ] `apiVersion: 1`
- [ ] `capabilities` **minimal** deklariert (nicht breit `network`, `filesystem`, etc. anfordern)
- [ ] `categories` angemessen
- [ ] `instanceConfigSchema` aus einem Zod-Schema generiert mit klarem `.describe(...)` bei jedem Feld

### 3. Worker

- [ ] `definePlugin({ setup(ctx), onHealth })` Default-Export
- [ ] `runWorker(plugin, import.meta.url)` vorhanden
- [ ] `setup(ctx)` registriert Handler synchron (kein Awaiting von Upstream-Calls während Setup)
- [ ] Events abonniert via `ctx.events.on(...)`
- [ ] Jobs registriert via `ctx.jobs.register(...)`
- [ ] Secrets aufgelöst via `ctx.secrets.resolve(ref)` — keine rohen Keys im Code
- [ ] State persistiert via `ctx.state` mit korrektem Scope (company / project / issue)
- [ ] HTTP-Aufrufe verwenden `ctx.http.fetch` (respektiert Capabilities und Allowlist)

### 4. Tests

- [ ] `createTestHarness` aus `@paperclipai/plugin-sdk/testing`
- [ ] Happy-Path abgedeckt
- [ ] Event-Handler-Fehlerfall abgedeckt
- [ ] Health-Check gibt schnell zurück

### 5. Installieren & verifizieren

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
paperclipai plugin list
```

- [ ] Plugin erscheint gesund im Dashboard
- [ ] Events, auf die es lauscht, triggern seine Handler
- [ ] Deinstallation hinterlässt keinen Residual-State, den es nicht behalten sollte

### 6. Docs

- [ ] `README.md` listet auf: Zweck, Config-Felder, erforderliche Capabilities, behandelte Events, exponierte Jobs, bekannte Limits
- [ ] `CHANGELOG.md` beginnt bei `0.1.0`

---

## Track B — Built-in Adapter (AI-Runtime)

Einen built-in Adapter hinzuzufügen bedeutet, zu Paperclip beizutragen (oder es zu forken).

### 1. Package

- [ ] Neuer Ordner `packages/adapters/<name>/`
- [ ] `package.json` benannt als `@paperclipai/adapter-<name>`, im `@paperclipai/*`-Scope
- [ ] Exports: `.`, `./server`, `./ui`, `./cli` (nur diejenigen, die implementiert werden)

### 2. Entry (`src/index.ts`)

- [ ] Exportiert `type` (stabiler Wire-Identifier, z.B. `<name>_local`)
- [ ] Exportiert `label` (human-readable)
- [ ] Exportiert `models` (ID + Label-Liste)
- [ ] Exportiert `agentConfigurationDoc` (Markdown, das alle Felder akkurat beschreibt)

### 3. Server-Surface (`src/server/index.ts`)

- [ ] Process-Spawn + Supervise-Code
- [ ] Timeout + SIGTERM-Grace-Handling
- [ ] Workspace-Strategy-Support (`git_worktree` etc.)
- [ ] Paperclip-Runtime-Umgebungsvariablen (`PAPERCLIP_WORKSPACE_*`, `PAPERCLIP_RUNTIME_*`) zum Child propagiert
- [ ] **Keine** Budget-/Approval-/Permission-Checks hier — der Server besitzt das

### 4. Registrierung

- [ ] Server-Boot registriert den Adapter via `registerServerAdapter(adapter)`
- [ ] Existierende Adapter-Lookup-Helfer (`requireServerAdapter`, etc.) funktionieren damit

### 5. UI-/CLI-Surfaces (optional)

- [ ] `src/ui/index.ts` — React-Bits für das Adapter-Config-Formular
- [ ] `src/cli/index.ts` — Subcommands unter `paperclipai`, falls der Adapter sie benötigt

### 6. Tests

- [ ] Unit-Tests für spawn / parse / env-Logik
- [ ] Adapter wird End-to-End in den E2E-Tests des Repos getestet, falls breit relevant

### 7. Docs

- [ ] `agentConfigurationDoc` ist vollständig und korrekt
- [ ] `CHANGELOG.md` beginnt bei `0.1.0`
- [ ] Eintrag zur Paperclip-Docs-Website unter "Adapters" hinzugefügt
