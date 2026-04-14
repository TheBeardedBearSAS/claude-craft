# Checklist für neue Features — Paperclip

Ein Feature in Paperclip berührt typischerweise ein oder mehrere **Module** (`server/src/modules/*`) und manchmal einen **Adapter**. Verwenden Sie diese Checklist End-to-End.

## 0. Analyse (vor dem Schreiben von Code)

- [ ] Identifizieren Sie die betroffenen Domänen (agents / approvals / costs / …)
- [ ] Bestimmen Sie, ob Governance betroffen ist (Budgets, Approvals, Activity-Log)
- [ ] Listen Sie die Datenmigration auf, falls vorhanden
- [ ] Prüfen Sie auf Cross-Tenant-Implikationen
- [ ] Schreiben Sie eine 5-Zeilen-Design-Notiz: was ändert sich, warum, welche Dateien

## 1. Schema (falls zutreffend)

- [ ] Migrationsdatei unter `server/src/db/migrations/` (forward + down)
- [ ] Neue Spalten nullable ODER in derselben Migration backfilled
- [ ] Indizes auf allen Spalten, die in WHERE-Klauseln verwendet werden
- [ ] Activity-Log-Tabelle unberührt (ist Append-only)
- [ ] `pnpm db:migrate` läuft lokal erfolgreich

## 2. Typen (`shared/types`)

- [ ] Neue Domain-Typen in `shared/types/<domain>.ts` hinzugefügt
- [ ] Kein Runtime-Code in `shared/types/`
- [ ] Diskriminierte Unions für Variant-Typen verwendet
- [ ] Re-Export-Pfad bei Bedarf aktualisiert

## 3. Service (`server/src/modules/<domain>/service.ts`)

- [ ] Business-Logik lebt hier
- [ ] Gibt typisierte Ergebnisse zurück oder wirft `DomainError`
- [ ] Emittiert ein Activity-Event bei jeder Mutation
- [ ] Setzt Budget- / Approval-Gates durch, wo relevant
- [ ] Tenancy: leitet `companyId` aus Session ab, filtert entsprechend
- [ ] Unit-Tests mit gemocktem Repository

## 4. Repository (`server/src/modules/<domain>/repository.ts`)

- [ ] Nur parametrisierte Queries
- [ ] Keine Business-Logik
- [ ] Integration-Tests gegen echtes Postgres

## 5. Routes (`server/src/modules/<domain>/routes.ts`)

- [ ] Eine Route pro Operation
- [ ] Input via Zod (oder äquivalent) validiert
- [ ] Responses typisiert; Errors auf `DomainError`-Codes gemappt
- [ ] Kein direkter DB-Zugriff
- [ ] OpenAPI-Spec aktualisiert

## 6. Web-UI (falls zutreffend)

- [ ] API-Client aus OpenAPI regeneriert (`pnpm generate:api`)
- [ ] Neue UI unter `ui/src/` (folgt der existierenden Routing-Konvention)
- [ ] Governance-Flags kommen vom Server, nicht client-computed
- [ ] Loading- und Error-States behandelt
- [ ] Accessibility: Keyboard- + Screen-Reader-Pfade verifiziert

## 7. Extension-Surface (falls das Feature Änderungen erfordert)

### Built-in-Adapter (AI-Runtime)

- [ ] `packages/adapters/<name>/src/index.ts` — `type` / `label` / `models` / `agentConfigurationDoc` weiterhin akkurat
- [ ] Serverseitiger Registry-Eintrag aktualisiert (`registerServerAdapter`)
- [ ] Existierende Agent-Configs validieren weiterhin (kein Breaking-Field-Rename)

### Plugin (Feature)

- [ ] Manifest-Capabilities bleiben minimal (nur hinzufügen, was dieses Feature benötigt)
- [ ] `definePlugin({ setup })`-Wiring für neue Events / Jobs / Data-Provider
- [ ] Config-Schema (Zod) mit klaren Beschreibungen aktualisiert
- [ ] Plugin-Test-Harness aus `@paperclipai/plugin-sdk/testing` läuft weiterhin durch

## 8. Tests

- [ ] Unit: Service-Logik + Error-Pfade
- [ ] Integration: Modul-Routes + DB mit echtem Postgres
- [ ] Cross-Tenant-Isolation: User A von Company X kann Company-Y-Daten nicht berühren
- [ ] Budget-Enforcement: Über-Limit-Versuch gibt `BUDGET_EXCEEDED` zurück
- [ ] Approval-Gating: Aktion blockiert, bis genehmigt oder Timeout
- [ ] Adapter-Vertrag: Shared-Suite erneut ausführen
- [ ] Coverage-Schwellenwerte weiterhin grün (≥ 80 global, ≥ 90 für agents/approvals/costs)

## 9. Dokumentation

- [ ] CHANGELOG-Eintrag unter `## Unreleased`
- [ ] OpenAPI-Spec committed
- [ ] Adapter-README aktualisiert, falls unterstützte Aktionen sich geändert haben
- [ ] Runbook aktualisiert, falls Feature Incident-Response betrifft (Kill-Switch, Revocation, Export)

## 10. Review

- [ ] Self-Review: `git diff main...HEAD`
- [ ] `/paperclip:check-compliance` lokal ausführen
- [ ] PR-Beschreibung: was, warum, Migrationsplan, Rollback-Plan
- [ ] Adapter-Vertragstests grün für jeden berührten Adapter

## 11. Rollout

- [ ] Deploy-Plan: Migrate forward, Code deployen, Health verifizieren
- [ ] Kill-Switch nach Deploy weiterhin funktional
- [ ] Activity-Log fängt sichtbar die Events des neuen Features ein
