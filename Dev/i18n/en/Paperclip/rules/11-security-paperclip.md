# Security — Paperclip

> Paperclip orchestrates agents that spend tokens, call external APIs, and act on behalf of a company. Security failures here are **governance failures**: silent budget drains, unauthorized actions, leaked secrets. Treat them accordingly.
>
> Observed stack: server + CLI + UI, **Better Auth** for authentication, PostgreSQL for persistence.

## Threat Model Overview

| Asset | Primary threats |
|---|---|
| Company secrets (API keys, external credentials) | Exfiltration through logs, errors, or plugin leaks |
| Token budgets | Silent overrun, bypass of platform enforcement |
| Approval gates | Bypass (agent executes before approval resolves) |
| Activity log | Tampering, forged events |
| Tenancy (per-company isolation) | Cross-company reads on the same instance |
| Agent runtime isolation | A rogue agent process escaping its workspace |
| Plugins | Over-scoped capabilities, exfil through declared HTTP |

---

## OWASP Top 10 (2025) — Paperclip focus

| # | Focus |
|---|---|
| 1 — Broken Access Control | Every endpoint scoped by `companyId` derived from session. Adapter / plugin capabilities enforced host-side (`CapabilityDeniedError`). |
| 2 — Cryptographic Failures | Secrets encrypted at rest with authenticated encryption. TLS 1.3 for any public endpoint. Passwords — if used — via the Better Auth hashing strategy (argon2id-class). |
| 3 — Injection | Parameterized queries only. Zod validation at boundaries (config, RPC, HTTP). No raw SQL string building. |
| 4 — Insecure Design | Budgets enforced at dispatch, not client-side. Approvals are synchronous gates. |
| 5 — Security Misconfiguration | No default admin credentials. CSP + HSTS on the UI. |
| 6 — Software Supply Chain | `pnpm audit` gate, `packageManager` pinned (`pnpm@9.15.x`), `pnpm-lock.yaml` committed, `pnpm.patchedDependencies` documented. |
| 7 — Mishandling Exceptions | Domain errors logged as activity. Stack traces never cross the API boundary in prod. |

---

## Authentication — Better Auth

- User-facing auth is handled by [Better Auth](https://better-auth.com). Configure a strong `BETTER_AUTH_SECRET` (at least 32 bytes of entropy) per environment. **Never** reuse secrets across environments.
- Sessions: HTTP-only cookies, `Secure`, `SameSite=Strict` in production. Idle + absolute expiration per Better Auth defaults — tighten if needed.
- CEO bootstrap: `paperclipai auth-bootstrap-ceo` creates the initial operator. Revoke after onboarding.

---

## Secrets

- Secrets live in a dedicated store and are referenced by **secret reference** (`secretRef`) in configs, not by value.
- Plugins / adapters never see raw secret values — they call `ctx.secrets.resolve(ref)` (plugins) or rely on runtime-injected env (adapters for agent processes).
- Log redaction: any field whose key matches `/key|token|secret|password|authorization|cookie/i` is redacted before logging.
- Never commit `.env` files. `.env.example` only.

---

## Approval Gates

- Approval records are first-class domain entities (`/approvals` routes).
- An agent action that requires approval **must** wait for a platform decision. The server is the arbiter.
- Approval decisions are append-only events; no update-in-place on a decided approval.
- No self-approval (the agent requesting is never the approver).
- Plugins can react to approval events via `ctx.events.on("approval.decided", ...)` but cannot decide approvals themselves.

---

## Budgets

- Budgets are **hard limits** enforced by the server at dispatch.
- When a budget is reached, the server rejects the next action with a domain error. Adapters see the error; they do not compute the check.
- Every cost event is persisted and visible in the activity log and dashboard.

---

## Tenancy

- Every resource is scoped by `companyId`. Endpoints derive `companyId` from the session or URL path (`/companies/:companyId/...`), **never** from a trusted client body.
- Cross-company reads are rejected and logged.
- Plugins receive entities scoped to the company they are authorized for.

---

## Plugins — Capabilities

- Plugins declare required capabilities in the manifest (`PaperclipPluginCapability`).
- The host enforces capabilities. Missing a capability → `CapabilityDeniedError` at call time.
- Only request the capabilities you need. Requesting `network` or `filesystem` broadly is a red flag in review.

---

## HTTP Security Headers (UI)

Ship on UI responses:

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

Adjust CSP script/style sources if the UI requires specific CDNs; otherwise keep `'self'` only.

---

## Supply Chain

- `pnpm install --frozen-lockfile` in CI.
- `pnpm audit --audit-level=high` in CI; fail the build on high / critical.
- `packageManager` pinned in `package.json`.
- `pnpm.patchedDependencies` kept in sync with `patches/` and reviewed when the base package changes.
- Consider SBOM generation (CycloneDX) and Sigstore signing of published packages (`@paperclipai/plugin-sdk`, adapter packages).

---

## Logging & Audit

- **Do log** (as structured activity events): agent hiring, approvals, budget changes, cost events, plugin installs/upgrades, secret writes (metadata only, never values).
- **Never log**: secret values, full request bodies that contain secrets, full session tokens.
- Activity log is append-only. Enforce it at the DB layer if possible (triggers, permissions).

---

## Incident Response

- **Kill switch per company** — pause all agents for that company (surfaced in CLI + UI).
- **Plugin disable** — `paperclipai plugin disable <id>` stops a misbehaving plugin without uninstalling it.
- **Audit export** — per-company export of activity + approvals + costs for post-incident review.

---

## Checklist

- [ ] All endpoints scoped by `companyId` from session or path — never from client body
- [ ] `BETTER_AUTH_SECRET` unique per environment, ≥ 32 bytes entropy
- [ ] Secrets never logged, accessed through `ctx.secrets.resolve(ref)` (plugins)
- [ ] Approval gates enforced server-side only
- [ ] Budgets are hard limits (CI test enforces denial at boundary)
- [ ] Plugin manifest declares only the capabilities it actually needs
- [ ] CSP + HSTS + COOP + CORP headers shipped on UI
- [ ] `pnpm audit` `high` clean
- [ ] Activity log append-only, DB-enforced where possible
- [ ] Kill switch + plugin disable tested

## Upgrade Notes: Breaking Changes (2026.916.0 to 2026.1012.0)

Verified against the official GitHub release notes (paperclipai/paperclip).

- **2026.916.0**: agent APIs no longer return plaintext credentials (`plain` bindings are redacted: use `secretRef`, never read secrets back); "cheap model profiles" removed (migration `0236` strips stored `modelProfiles`); `X-Forwarded-Host` is honored only when the immediate peer passes `TRUST_PROXY` (set it behind a reverse proxy, otherwise the raw `Host` header is used); the legacy Anthropic REST connection option is removed (REST tool connections are validated as REST).
- **2026.1001.0**: the legacy Composio broker is retired (no automated migration; replacement: Composio Connect behind the `enableMcpAggregators` flag). Execution harnesses now default to **full auto**: ACPX/Claude `approve-all`, OpenCode `allow`, Codex `never` (no approval pauses). To keep provider-side approval gates, set an explicit restrictive mode per agent: `acpxPermissionMode` (`approve-paperclip`, `approve-reads` or `deny-all`) or `opencodePermissionMode` (`ask` or `deny`). Paperclip's own governed approvals still apply.
- **2026.1005.0**: `PAPERCLIP_CLOUD_UI_SNIPPET` / `PAPERCLIP_CLOUD_UI_SNIPPET_B64` no longer inject HTML (move the integration to a plugin UI contribution); an @-mention in a task comment is context only and no longer starts a run (only explicit assignment or review requests do).
- **2026.1012.0**: workspace restore locks are now SQLite file locks under `<instance root>/locks/directory-merge/`: stop all old server and worker processes before upgrading or rolling back; tool grants with unknown selectors or malformed restrictions now deny access (review custom grants).

---

**Last updated:** 2026-04 | **Version:** 2.0.0 | **Author:** The Bearded CTO
