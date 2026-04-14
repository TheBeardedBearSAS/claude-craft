---
description: Vollständige Paperclip-Compliance prüfen
argument-hint: [project-path]
---

# Vollständige Paperclip-Compliance prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Paperclip-Projekt)

## MISSION

Ein vollständiges Compliance-Audit eines Paperclip-Projekts durchführen, indem die 4 Haupt-Checks orchestriert werden — Architektur, Code-Qualität, Tests, Sicherheit — plus dem **Adapter-Protokoll**-Check, der spezifisch für Paperclip ist. Einen konsolidierten Report mit einem Gesamt-Score von 100 Punkten produzieren.

### Schritt 1: Audit-Vorbereitung

- [ ] Projektpfad identifizieren (`$ARGUMENTS` oder aktuelles Verzeichnis)
- [ ] Bestätigen, dass es ein Paperclip-Workspace ist: auf `server/`, `ui/`, `cli/`, `packages/` (mit `adapters/`, `plugins/sdk/`), `pnpm-workspace.yaml` und `@paperclipai/*`-Einträge prüfen
- [ ] Paperclip-Version notieren (aus installiertem `@paperclipai/plugin-sdk` oder `paperclipai`-CLI-Version)
- [ ] Adapter unter `packages/adapters/*` und Plugins unter `packages/plugins/examples/*` oder externen Plugin-Repos auflisten

### Schritt 2: Architektur-Audit (25 Punkte)

`/paperclip:check-architecture` aufrufen.

Bewertete Kriterien:
- Two-Layer-Trennung (Control-Plane vs. Adapter) — 6 Pkt.
- Modulgrenzen unter `server/src/modules/` — 5 Pkt.
- Keine Governance-Logik in Adaptern — 6 Pkt.
- `shared/types`-Form (reine Typen, keine Runtime) — 3 Pkt.
- Activity-Log bei jeder Mutation emittiert — 3 Pkt.
- OpenAPI-Spec deckt jede Route ab — 2 Pkt.

### Schritt 3: Code-Qualitäts-Audit (20 Punkte)

`/paperclip:check-code-quality` aufrufen.

Bewertete Kriterien:
- TypeScript strict + `noUncheckedIndexedAccess` — 5 Pkt.
- Kein `any`, keine stillen Casts — 4 Pkt.
- ESLint Flat Config + Prettier läuft durch — 3 Pkt.
- Namenskonventionen (kebab-Dateien, PascalCase-Typen, etc.) — 3 Pkt.
- Kognitive Komplexität < 10 pro Funktion — 3 Pkt.
- Strukturierte Logs, kein Secret-Leakage in Logs — 2 Pkt.

### Schritt 4: Testing-Audit (20 Punkte)

`/paperclip:check-testing` aufrufen.

Bewertete Kriterien:
- Coverage ≥ 80% (Zeilen, Funktionen, Statements) — 6 Pkt.
- Adapter-Contract-Tests laufen für jeden ausgelieferten Adapter durch — 6 Pkt.
- Integrationstests treffen echtes PostgreSQL — 4 Pkt.
- Kein `.only` / `.skip` in main — 2 Pkt.
- Factories statt Fixtures verwendet — 2 Pkt.

### Schritt 5: Sicherheits-Audit (20 Punkte)

`/paperclip:check-security` aufrufen.

Bewertete Kriterien:
- Alle Endpoints mandanten-scoped nach `companyId` aus Session — 4 Pkt.
- Secrets verschlüsselt at rest, in Logs redacted — 4 Pkt.
- Approval-Gates nur serverseitig, append-only Events — 3 Pkt.
- Budgets = harte Grenzen (in Tests erzwungen) — 3 Pkt.
- Plugin-Capabilities minimal deklariert (kein over-scoped `network` / `filesystem`) — 3 Pkt.
- CSP + HSTS + COOP + CORP-Header ausgeliefert — 2 Pkt.
- `pnpm audit --audit-level=high` clean — 1 Pkt.

### Schritt 6: Extension-Audit (15 Punkte)

Spezifisch für Paperclip. Betrifft sowohl built-in Adapter (`packages/adapters/*`) als auch Plugins (`@paperclipai/plugin-sdk`).

Built-in Adapter:
- Jeder Adapter exportiert `type`, `label`, `models`, `agentConfigurationDoc` — 3 Pkt.
- `type` ist versionsstabil (kein Rename nach Auslieferung von Agents) — 2 Pkt.
- Server-Registrierung via `registerServerAdapter(...)` — 2 Pkt.
- Keine Governance-Logik im Adapter (kein Budget / Approval / Permission-Rechnen) — 3 Pkt.

Plugins:
- Manifest deklariert minimal notwendige Capabilities — 2 Pkt.
- Verwendet `ctx.secrets.resolve(ref)` statt roher Keys — 2 Pkt.
- State via `ctx.state` (scoped) persistiert, nicht auf Disk — 1 Pkt.

### Schritt 7: Konsolidierter Report

Produzieren:

```
════════════════════════════════════════════════════════════════
📊 PAPERCLIP COMPLIANCE AUDIT — {PROJECT}
════════════════════════════════════════════════════════════════

Architektur         : {NN}/25
Code-Qualität       : {NN}/20
Testing             : {NN}/20
Sicherheit          : {NN}/20
Adapter-Protokoll   : {NN}/15
────────────────────────────────────────────────────────────────
GESAMT              : {NNN}/100   →   {Note}

Notenskala: A (≥ 90), B (≥ 80), C (≥ 70), D (≥ 60), F (< 60)
```

Für jedes nicht erfüllte Kriterium die Datei / das Symbol auflisten und einen 1-Zeilen-Fix angeben. Den Code nicht umschreiben — die Issues an die Oberfläche bringen. Mit **Top-5-Remediation-Prioritäten** enden (höchster Impact / niedrigster Aufwand zuerst).

## Ergebnis

Ein einzelner Markdown-Report. Keine stillen Fehler. Falls ein Schritt nicht ausgeführt werden kann (z.B. keine Adapter im Projekt), "N/A" aufzeichnen und Punkte proportional umverteilen — dies explizit am Anfang des Reports notieren.
