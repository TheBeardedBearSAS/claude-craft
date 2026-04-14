---
description: Paperclip-Sicherheit auditieren
argument-hint: [project-path]
---

# Paperclip-Sicherheit auditieren

## MISSION

Tenancy-Isolation, Secrets-Handling, Approval-Gates, Budget-Enforcement, Adapter-Channel, HTTP-Header und Supply-Chain überprüfen.

## Vorgehen

### 1. Mandanten-Isolation

- [ ] Kein Endpoint empfängt `companyId` aus Client-Body / Query-String — es leitet sich immer aus der authentifizierten Session ab
- [ ] Jede Repository-Query filtert nach `companyId`
- [ ] Ein mandantenübergreifender Isolations-Integrationstest existiert pro Modul
- [ ] Audit-Log erfasst abgelehnte mandantenübergreifende Versuche

Greppen nach verdächtigen Patterns: `req.body.companyId`, `req.query.companyId`, `WHERE company_id = $1` ohne Provenance-Check.

### 2. Secrets

- [ ] `secrets`-Tabellenspalte verwendet authentifizierte Verschlüsselung (AES-256-GCM) mit KMS- oder env-gesourctem Master-Key
- [ ] Secrets werden Adaptern zur Invocation-Zeit geliefert, nicht beim Startup
- [ ] Kein Secret-Wert erscheint in irgendeiner Log-Nachricht (Regex-Scan gespeicherter Log-Samples)
- [ ] `.env` nicht in Git; `.env.example` ist es
- [ ] Secret-Encryption-Key-Rotationsprozedur dokumentiert (umgebungsspezifisch, niemals wiederverwendet)

### 3. Approval-Gates

- [ ] Approval-Entscheidungen leben in `approvals`-Tabelle, append-only (mit DB-Trigger oder Migration verifizieren)
- [ ] Kein Code-Pfad erlaubt einem Adapter, eine Aktion mit `requires_approval` auszuführen, bevor die Control-Plane `approved` zurückgibt
- [ ] Keine Selbst-Approval (der anfragende Agent kann nicht der Approver sein)

### 4. Budgets (harte Grenzen)

- [ ] Ein Test existiert, der verifiziert, dass `BUDGET_EXCEEDED` zurückgegeben wird, wenn ein Agent sein Budget überschreitet
- [ ] Kein Code-Pfad erhöht den Verbrauch über `budgetTokens` hinaus stillschweigend
- [ ] Budget-Änderungen emittieren Activity-Events

### 5. Plugin-Sandbox & Adapter-Grenzen

- [ ] Jedes installierte Plugin deklariert nur die Capabilities, die es tatsächlich benötigt (Manifest gegen Code reviewen)
- [ ] `ctx.http`-Aufrufe gehen durch den host-kontrollierten Client (kein rohes `fetch` / `axios` eingeschmuggelt)
- [ ] Plugin-Config-Werte kommen aus `ctx.config.get()`; keine Reads aus `process.env` zur Runtime
- [ ] Adapter enthalten keine Governance-Logik — nur spawn + supervise
- [ ] Öffentliche Endpoints laufen hinter TLS 1.3 (bei Bedarf an Reverse-Proxy terminieren)

### 6. HTTP-Header (Web-UI-Responses)

Versendete Header verifizieren:
- `Content-Security-Policy` (kein `unsafe-inline` für Scripts)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy` vorhanden

### 7. Authentifizierung

- [ ] Passwörter gehasht mit Argon2id (128 MiB RAM, t=3, p=1)
- [ ] Session-Cookies `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] JWT (falls verwendet) — EdDSA / Ed25519, 15-Minuten-Expiry, DPoP auf sensiblen Endpoints

### 8. Supply-Chain

- [ ] `pnpm audit --audit-level=high` clean
- [ ] `packageManager` in `package.json` gepinnt
- [ ] `pnpm.onlyBuiltDependencies`-Allowlist vorhanden
- [ ] Adapter-SDK-Releases mit Sigstore signiert (mit `cosign` verifizieren)

### 9. Incident-Response

- [ ] Company-weiter Kill-Switch getestet
- [ ] Adapter-Revocation invalidiert Signaturen sofort
- [ ] Per-Company-Audit-Export verfügbar (JSON + signiertes Manifest)

## Ausgabe

Markdown-Report mit per-Section Pass/Fail, Schweregrad (Blocker / Major / Minor), CVE-Referenzen wo relevant und einem Score /20 für `/paperclip:check-compliance`.
