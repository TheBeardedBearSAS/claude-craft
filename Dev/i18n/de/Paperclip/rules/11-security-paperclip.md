# Security — Paperclip

> Paperclip orchestriert Agents, die Tokens ausgeben, externe APIs aufrufen und im Namen eines Unternehmens handeln. Sicherheitsfehler sind hier **Governance-Fehler**: stille Budget-Abflüsse, unautorisierte Aktionen, geleakte Secrets. Behandeln Sie sie entsprechend.
>
> Beobachteter Stack: Server + CLI + UI, **Better Auth** für Authentifizierung, PostgreSQL für Persistenz.

## Bedrohungsmodell-Übersicht

| Asset | Primäre Bedrohungen |
|---|---|
| Company Secrets (API-Keys, externe Credentials) | Exfiltration durch Logs, Fehler oder Plugin-Lecks |
| Token-Budgets | Stille Überschreitung, Bypass der Plattform-Durchsetzung |
| Approval Gates | Bypass (Agent führt aus, bevor Approval aufgelöst ist) |
| Activity Log | Manipulation, gefälschte Events |
| Tenancy (Isolation pro Company) | Cross-Company-Reads auf derselben Instanz |
| Agent-Runtime-Isolation | Ein rogue Agent-Prozess entkommt seinem Workspace |
| Plugins | Übermäßig weite Capabilities, Exfil durch deklariertes HTTP |

---

## OWASP Top 10 (2025) — Paperclip-Fokus

| # | Fokus |
|---|---|
| 1 — Broken Access Control | Jeder Endpoint per `companyId` aus Session gescoped. Adapter-/Plugin-Capabilities host-seitig durchgesetzt (`CapabilityDeniedError`). |
| 2 — Cryptographic Failures | Secrets verschlüsselt at rest mit authentifizierter Verschlüsselung. TLS 1.3 für jeden öffentlichen Endpoint. Passwörter — falls verwendet — via Better-Auth-Hashing-Strategie (argon2id-class). |
| 3 — Injection | Nur parametrisierte Queries. Zod-Validierung an Grenzen (Config, RPC, HTTP). Kein Raw-SQL-String-Building. |
| 4 — Insecure Design | Budgets durchgesetzt bei Dispatch, nicht client-seitig. Approvals sind synchrone Gates. |
| 5 — Security Misconfiguration | Keine Default-Admin-Credentials. CSP + HSTS auf der UI. |
| 6 — Software Supply Chain | `pnpm audit`-Gate, `packageManager` gepinnt (`pnpm@9.15.x`), `pnpm-lock.yaml` committed, `pnpm.patchedDependencies` dokumentiert. |
| 7 — Mishandling Exceptions | Domain-Errors als Activity geloggt. Stack-Traces überqueren niemals die API-Grenze in Prod. |

---

## Authentifizierung — Better Auth

- User-facing Auth wird von [Better Auth](https://better-auth.com) gehandhabt. Konfigurieren Sie ein starkes `BETTER_AUTH_SECRET` (mindestens 32 Bytes Entropie) pro Umgebung. Verwenden Sie **niemals** Secrets umgebungsübergreifend wieder.
- Sessions: HTTP-only Cookies, `Secure`, `SameSite=Strict` in Produktion. Idle + absolute Expiration per Better-Auth-Defaults — bei Bedarf verschärfen.
- CEO-Bootstrap: `paperclipai auth-bootstrap-ceo` erstellt den initialen Operator. Nach Onboarding widerrufen.

---

## Secrets

- Secrets leben in einem dedizierten Store und werden per **Secret-Referenz** (`secretRef`) in Configs referenziert, nicht per Wert.
- Plugins / Adapter sehen niemals rohe Secret-Werte — sie rufen `ctx.secrets.resolve(ref)` (Plugins) auf oder verlassen sich auf runtime-injected Env (Adapter für Agent-Prozesse).
- Log-Redaction: Jedes Feld, dessen Key zu `/key|token|secret|password|authorization|cookie/i` passt, wird vor dem Logging redaktiert.
- Committen Sie niemals `.env`-Dateien. Nur `.env.example`.

---

## Approval Gates

- Approval-Records sind First-Class-Domain-Entities (`/approvals`-Routes).
- Eine Agent-Aktion, die Approval erfordert, **muss** auf eine Plattform-Entscheidung warten. Der Server ist der Schiedsrichter.
- Approval-Entscheidungen sind Append-only-Events; kein Update-in-Place auf einem entschiedenen Approval.
- Keine Selbstgenehmigung (der anfragende Agent ist niemals der Approver).
- Plugins können auf Approval-Events via `ctx.events.on("approval.decided", ...)` reagieren, aber keine Approvals selbst entscheiden.

---

## Budgets

- Budgets sind **harte Grenzen**, die vom Server bei Dispatch durchgesetzt werden.
- Wenn ein Budget erreicht ist, lehnt der Server die nächste Aktion mit einem Domain-Error ab. Adapter sehen den Error; sie berechnen den Check nicht.
- Jedes Cost-Event wird persistiert und ist im Activity-Log und Dashboard sichtbar.

---

## Tenancy

- Jede Ressource ist per `companyId` gescoped. Endpoints leiten `companyId` aus der Session oder dem URL-Pfad (`/companies/:companyId/...`) ab, **niemals** aus einem vertrauenswürdigen Client-Body.
- Cross-Company-Reads werden abgelehnt und geloggt.
- Plugins erhalten Entities, die auf die Company gescoped sind, für die sie autorisiert sind.

---

## Plugins — Capabilities

- Plugins deklarieren erforderliche Capabilities im Manifest (`PaperclipPluginCapability`).
- Der Host setzt Capabilities durch. Fehlende Capability → `CapabilityDeniedError` zur Call-Zeit.
- Fordern Sie nur die Capabilities an, die Sie benötigen. `network` oder `filesystem` breit anzufordern ist ein Red Flag im Review.

---

## HTTP-Security-Header (UI)

Ausgeliefert auf UI-Responses:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

Passen Sie CSP-Script-/Style-Sources an, falls die UI spezifische CDNs benötigt; ansonsten nur `'self'` behalten.

---

## Supply Chain

- `pnpm install --frozen-lockfile` in CI.
- `pnpm audit --audit-level=high` in CI; Build bei high / critical fehlschlagen lassen.
- `packageManager` in `package.json` gepinnt.
- `pnpm.patchedDependencies` synchron mit `patches/` gehalten und reviewed, wenn das Basis-Paket sich ändert.
- Erwägen Sie SBOM-Generierung (CycloneDX) und Sigstore-Signing von publizierten Paketen (`@paperclipai/plugin-sdk`, Adapter-Pakete).

---

## Logging & Audit

- **Loggen Sie** (als strukturierte Activity-Events): Agent-Hiring, Approvals, Budget-Änderungen, Cost-Events, Plugin-Installs/Upgrades, Secret-Writes (nur Metadaten, niemals Werte).
- **Loggen Sie niemals**: Secret-Werte, volle Request-Bodies mit Secrets, volle Session-Tokens.
- Activity-Log ist Append-only. Setzen Sie es auf DB-Layer durch, wenn möglich (Triggers, Permissions).

---

## Incident Response

- **Kill Switch pro Company** — alle Agents für diese Company pausieren (in CLI + UI angezeigt).
- **Plugin-Disable** — `paperclipai plugin disable <id>` stoppt ein misbehavendes Plugin, ohne es zu deinstallieren.
- **Audit-Export** — Pro-Company-Export von Activity + Approvals + Costs für Post-Incident-Review.

---

## Checklist

- [ ] Alle Endpoints per `companyId` aus Session oder Pfad gescoped — niemals aus Client-Body
- [ ] `BETTER_AUTH_SECRET` einzigartig pro Umgebung, ≥ 32 Bytes Entropie
- [ ] Secrets niemals geloggt, über `ctx.secrets.resolve(ref)` zugegriffen (Plugins)
- [ ] Approval-Gates nur server-seitig durchgesetzt
- [ ] Budgets sind harte Grenzen (CI-Test setzt Denial an Grenze durch)
- [ ] Plugin-Manifest deklariert nur die Capabilities, die es tatsächlich braucht
- [ ] CSP + HSTS + COOP + CORP Header auf UI ausgeliefert
- [ ] `pnpm audit` `high` sauber
- [ ] Activity-Log Append-only, DB-enforced wo möglich
- [ ] Kill Switch + Plugin-Disable getestet

---

**Zuletzt aktualisiert:** 2026-04 | **Version:** 2.0.0 | **Autor:** The Bearded CTO
