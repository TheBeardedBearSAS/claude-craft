---
description: Audit Paperclip Security
argument-hint: [project-path]
---

# Audit Paperclip Security

## MISSION

Review tenancy isolation, secrets handling, approval gates, budget enforcement, adapter channel, HTTP headers, and supply chain.

## Procedure

### 1. Tenant isolation

- [ ] No endpoint receives `companyId` from the client body / query string — it always derives from the authenticated session
- [ ] Every repository query filters by `companyId`
- [ ] A cross-tenant isolation integration test exists per module
- [ ] Audit log captures rejected cross-tenant attempts

Grep for suspicious patterns: `req.body.companyId`, `req.query.companyId`, `WHERE company_id = $1` without provenance check.

### 2. Secrets

- [ ] `secrets` table column uses authenticated encryption (AES-256-GCM) with KMS-sourced or env-sourced master key
- [ ] Secrets delivered to adapters at invocation time, not at startup
- [ ] No secret value appears in any log message (regex scan stored log samples)
- [ ] `.env` not in git; `.env.example` is
- [ ] Secret encryption key rotation procedure documented (environment-specific, never reused)

### 3. Approval gates

- [ ] Approval decisions live in `approvals` table, append-only (verify with a DB trigger or migration)
- [ ] No code path allows an adapter to execute an action with `requires_approval` before the control plane returns `approved`
- [ ] No self-approval (the agent requesting cannot be the approver)

### 4. Budgets (hard limits)

- [ ] A test exists that verifies `BUDGET_EXCEEDED` is returned when an agent exceeds its budget
- [ ] No code path increments consumption past `budgetTokens` silently
- [ ] Budget changes emit activity events

### 5. Plugin sandbox & adapter boundaries

- [ ] Every installed plugin declares only the capabilities it actually needs (review the manifest against its code)
- [ ] `ctx.http` calls go through the host-controlled client (no raw `fetch` / `axios` smuggled in)
- [ ] Plugin config values come from `ctx.config.get()`; no reads from `process.env` at runtime
- [ ] Adapters contain no governance logic — spawn + supervise only
- [ ] Public endpoints run behind TLS 1.3 (terminate at a reverse proxy if needed)

### 6. HTTP headers (web UI responses)

Verify shipped headers:
- `Content-Security-Policy` (no `unsafe-inline` for scripts)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy` present

### 7. Authentication

- [ ] Passwords hashed with Argon2id (128 MiB RAM, t=3, p=1)
- [ ] Session cookies `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] JWT (if used) — EdDSA / Ed25519, 15-minute expiry, DPoP on sensitive endpoints

### 8. Supply chain

- [ ] `pnpm audit --audit-level=high` clean
- [ ] `packageManager` pinned in `package.json`
- [ ] `pnpm.onlyBuiltDependencies` allowlist present
- [ ] Adapter SDK releases signed with Sigstore (verify with `cosign`)

### 9. Incident response

- [ ] Company-wide kill switch tested
- [ ] Adapter revocation invalidates signatures immediately
- [ ] Per-company audit export available (JSON + signed manifest)

## Output

Markdown report with per-section pass/fail, severity (Blocker / Major / Minor), CVE references where relevant, and a score /20 for `/paperclip:check-compliance`.
