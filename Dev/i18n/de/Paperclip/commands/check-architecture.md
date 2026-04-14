---
description: Paperclip-Architektur auditieren
argument-hint: [project-path]
---

# Paperclip-Architektur auditieren

## MISSION

Die Two-Layer-Architektur (Control-Plane + Adapter) und Modulgrenzen eines Paperclip-Projekts validieren.

## Vorgehen

### 1. Workspace-Form

- [ ] `server/`, `ui/`, `cli/`, `packages/`-Verzeichnisse vorhanden
- [ ] `packages/` enthält `shared/`, `db/`, `adapter-utils/`, `mcp-server/`, `adapters/`, `plugins/`
- [ ] `pnpm-workspace.yaml` listet die Workspaces auf
- [ ] Root-`package.json` deklariert `"packageManager": "pnpm@9.15.x"`
- [ ] `pnpm run preflight:workspace-links` läuft durch
- [ ] Keine veraltete Lerna-/npm-Workspaces-Config vorhanden

### 2. Control-Plane-Module

Unter `server/src/modules/` einen Ordner pro Domain erwarten (agents, approvals, costs, companies, goals, activity, secrets). Für jedes Modul:

- [ ] `routes.ts` — nur HTTP, ruft Services auf, kein DB-Zugriff
- [ ] `service.ts` — Business-Logik, emittiert Activity-Events
- [ ] `repository.ts` — parametrisierte Queries, keine Business-Rules
- [ ] `types.ts` — re-exportiert via `shared/`
- [ ] `*.test.ts` co-located
- [ ] Keine Imports, die in Internals eines anderen Moduls greifen (nur via dessen Service-API)

Flaggen: Jede Route, die DB direkt liest, jeder Service, der SQL-Strings baut, jeder cross-modul Import, der die Service-Schicht umgeht.

### 3. Adapter (built-in, `packages/adapters/*`)

- [ ] Jeder Adapter liegt unter `packages/adapters/<name>/` und heißt `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exportiert `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Optionale Subpaths (`./server`, `./ui`, `./cli`) nur vorhanden, wenn implementiert
- [ ] **Keine Governance-Logik** im Adapter — der Server besitzt Budgets / Approvals / Permissions
- [ ] Server-Bootstrap registriert ihn via `registerServerAdapter(...)`

### 3b. Plugins (`@paperclipai/plugin-sdk`)

- [ ] Generiert via `create-paperclip-plugin` (oder strukturell äquivalent)
- [ ] `definePlugin({ setup, onHealth })` im Worker-Entry
- [ ] Manifest deklariert nur notwendige Capabilities
- [ ] Keine Secrets von Disk gelesen; immer via `ctx.secrets.resolve(ref)`

### 4. Shared-Types

- [ ] `shared/types/` enthält nur `.ts`-Typ-Deklarationen
- [ ] Kein Runtime-Code (keine Funktionen, keine Klassen)
- [ ] Keine Framework-Imports (React, Express, etc.)

### 5. Web-UI

- [ ] `ui/src/`-API-Client konsumiert Server-Typen via `@paperclipai/shared` — kein handgerolltes `fetch` mit untypisierten Responses
- [ ] Keine Governance-Entscheidungen in Komponenten (kein "if budget > X then hide button" — Server entscheidet, UI rendert)

### 6. Activity-Log-Abdeckung

Jede DB-Mutation greppen (`INSERT`, `UPDATE`, `DELETE` nicht in Migrations/Seeds). Jede muss benachbart zu einer Activity-Event-Emission sein. Mutationen ohne passendes `activity.emit(...)` reporten.

### 7. OpenAPI-Spec

- [ ] `server/src/api/openapi.yaml` (oder generiert) ist committet
- [ ] Jede Route hat eine passende Operation
- [ ] Generierter Web-Client ist aktuell (`pnpm generate:api` produziert kein Diff)

## Ausgabe

Markdown-Report mit:
- Pass/Fail pro Checkbox oben
- Betroffene Dateipfade (Zeilennummern, falls verfügbar)
- Schweregrad: Blocker / Major / Minor
- Score /25 zur Nutzung durch `/paperclip:check-compliance`
