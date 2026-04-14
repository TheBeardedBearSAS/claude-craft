---
description: Paperclip-Testabdeckung und -qualität auditieren
argument-hint: [project-path]
---

# Paperclip-Testing auditieren

## MISSION

Testabdeckung, Adapter-Contract-Tests, Integration-Test-Form und Test-Hygiene überprüfen.

## Vorgehen

### 1. Baseline

- [ ] Vitest am Workspace-Root konfiguriert
- [ ] Coverage-Thresholds ≥ 80 (Zeilen, Funktionen, Statements), ≥ 75 (Branches)
- [ ] `pnpm test --coverage` läuft durch und respektiert die Thresholds

### 2. Coverage pro Bereich

Coverage ausführen, dann pro Bereich reporten:
- `server/src/modules/agents/` : Ziel ≥ 90%
- `server/src/modules/approvals/` : Ziel ≥ 90%
- `server/src/modules/costs/` : Ziel ≥ 90%
- `adapters/**` : Ziel ≥ 85%
- Andere Server-Module: ≥ 80%
- `ui/` : ≥ 70%

Jede Datei unter ihrem Ziel mit 1-Zeilen-Notiz auflisten, was nicht abgedeckt ist.

### 3. Extension-Tests

Built-in Adapter (`packages/adapters/*`):
- [ ] Unit-Tests decken spawn / parse / env-wiring ab
- [ ] `type`, `label`, `models`, `agentConfigurationDoc` sind durch einen Exports-Test abgedeckt
- [ ] E2E-Tests existieren mindestens für den Default-Adapter

Plugins:
- [ ] Tests verwenden `createTestHarness` aus `@paperclipai/plugin-sdk/testing`
- [ ] Happy-Path + ein Failure-Path pro Handler

### 4. Integrationstests

- [ ] Mindestens ein Integrationstest pro Server-Modul
- [ ] Integrationstests verbinden sich mit **echtem** PostgreSQL (testcontainers oder Wegwerf-DB), nicht Mock
- [ ] Jeder Test besitzt seine Daten (Transaktionen + Rollback, oder Truncate zwischen Tests)
- [ ] Ein **mandantenübergreifender Isolationstest** existiert pro Modul (beweisen, dass User von Company A nicht Daten von Company B lesen kann)

### 5. E2E

- [ ] Playwright-Suite deckt ab: Operator-Login, Hiring eines Agents, Approval-Flow, Cost-Dashboard, Adapter-Registrierung
- [ ] E2E läuft gegen ein gebautes Web-Bundle, nicht den Dev-Server

### 6. Hygiene

Greppen und fehlschlagen bei:
- `.only(` in irgendeiner Testdatei auf `main`
- `.skip(` in irgendeiner Testdatei auf `main` (ohne verlinktes Issue)
- `setTimeout` in Tests ohne `vi.useFakeTimers()`
- Gemeinsame veränderliche Fixtures zwischen Tests
- Snapshot-Files (`__snapshots__`) älter als 180 Tage ohne Notiz

### 7. Bug-Fix-Regressionen

Die letzten 5 `fix:`-Commits nehmen. Für jeden prüfen, ob ein entsprechender Test hinzugefügt oder modifiziert wurde. Commits reporten, die das nicht taten.

## Ausgabe

Markdown-Report mit per-Section Pass/Fail, nicht abgedeckten Dateien, fehlschlagenden Adaptern und einem Score /20 für `/paperclip:check-compliance`.
