---
description: Security audit for Vercel deployment configuration (env vars, Cron auth, headers, Marketplace credentials)
---

# Vercel Security Audit

You are an expert Vercel platform security auditor. Perform a comprehensive security analysis of the deployment configuration, strictly within the deployment-platform scope of this stack.

> Vercel is a **deployment platform**, not a framework. This command covers **only** env var handling, Cron endpoint auth, `vercel.json` headers, Storage/Marketplace credentials, and Function runtime choice. For framework-level auth/session/input-validation concerns, use that framework's own `check-security` command instead.

## MISSION

Identify security vulnerabilities specific to Vercel's deployment model, mapped to the relevant OWASP Top 10:2025 categories (see `@.claude/rules/11-security.md`).

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## SECURITY CHECKS

### 1. Env Var Handling (OWASP #2 Cryptographic Failures, #5 Security Misconfiguration)

Scan for:
- Secrets logged via `console.log(process.env...)` in any `api/` handler
- `.env.local` present in `.gitignore`
- Preview vs Production env var scoping — production secrets not exposed to Preview Deployments unless deliberate
- Client-bundled vars (`NEXT_PUBLIC_*` or equivalent) that actually hold a secret

```bash
grep -rn "console.log(process.env" api/
grep -n "^\.env" .gitignore || echo "MISSING: .env.local not gitignored"
```

### 2. Cron Endpoint Auth (OWASP #1 Broken Access Control)

Check every path referenced in `vercel.json` `crons[]`:
- The endpoint validates a shared secret (e.g. `Authorization: Bearer $CRON_SECRET` or Vercel's `x-vercel-cron` signature) before executing
- The endpoint is not otherwise reachable as a normal public route without that same guard
- CRITICAL if a cron target performs a privileged/destructive action with **no** auth check at all

```bash
grep -A3 '"crons"' vercel.json
grep -n "CRON_SECRET\|x-vercel-cron" api/**/*.ts
```

### 3. CORS / CSP Headers in vercel.json (OWASP #1, #5)

Check `headers[]` in `vercel.json`:
- `Access-Control-Allow-Origin` is not a bare `*` on any route handling authenticated requests
- CSP (`Content-Security-Policy`) present and restrictive (`script-src`, `frame-ancestors`, `base-uri`)
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, HSTS present

### 4. Marketplace Credential Handling (OWASP #6 Supply Chain, #2 Cryptographic Failures)

For Storage via Marketplace (Neon/Upstash, etc.):
- Connection strings/API keys stored only as env vars, never committed
- Marketplace integration scoped to least-privilege role (read-only where writes aren't needed)
- Rotate-on-compromise process documented for Marketplace-issued credentials

### 5. Deprecated Storage Package Migration Flags

```bash
grep -rn "@vercel/kv\|@vercel/postgres" package.json api/
```
Flag as a **migration item** (not a live vulnerability, but unsupported surface):
- `@vercel/kv` → migrate to Upstash via Marketplace
- `@vercel/postgres` → migrate to Neon (or another Marketplace Postgres) via Marketplace

### 6. Legacy Edge Runtime Usage

```bash
grep -rn "runtime.*=.*['\"]edge['\"]\|export const runtime = 'edge'" api/ middleware.ts
```
Flag as a **migration item**: Edge Runtime is deprecated. Recommend migrating to the Node.js runtime default (Fluid Compute) — never recommend adopting Edge Runtime in new code.

### 7. Dependency Security

```bash
npm audit --omit=dev --audit-level=moderate
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VERCEL SECURITY AUDIT
══════════════════════════════════════════════════════════════

📊 SECURITY SCORE: XX/100
Risk Level: 🟢 LOW | 🟡 MEDIUM | 🔴 HIGH | ⚫ CRITICAL

🔑 ENV VAR HANDLING (OWASP #2/#5)
──────────────────────────────────────────────────────────────
Status: ✅ SECURE | ⚠️ RISKS FOUND | ❌ VULNERABLE

Findings:
[🔴 HIGH] Secret value logged to stdout
    File: api/webhook.ts:22
    Code: console.log(process.env.STRIPE_SECRET_KEY)
    Fix: Remove; never log secret env vars, even at debug level

⏰ CRON ENDPOINT AUTH (OWASP #1)
──────────────────────────────────────────────────────────────
Status: ✅ GUARDED | ❌ UNGUARDED

Findings:
[⚫ CRITICAL] Cron target has no auth guard
    File: api/cron/purge-db.ts
    Fix: Validate `Authorization: Bearer ${CRON_SECRET}` (or Vercel's cron signature header) before executing; return 401 otherwise

🌐 CORS / CSP HEADERS
──────────────────────────────────────────────────────────────
Status: ✅ CONSISTENT | ⚠️ PARTIAL | ❌ MISSING

Findings:
[🟡 MEDIUM] Access-Control-Allow-Origin: * on an authenticated API route
    File: vercel.json
    Fix: Restrict to explicit allowed origins

🔐 MARKETPLACE CREDENTIALS (OWASP #6/#2)
──────────────────────────────────────────────────────────────
Status: ✅ LEAST PRIVILEGE | ⚠️ OVERSCOPED

Findings:
[🟡 MEDIUM] Neon connection string uses an admin-role credential for read-only queries
    Fix: Issue a scoped read-only role via the Marketplace integration

📦 DEPRECATED STORAGE PACKAGES (migration items)
──────────────────────────────────────────────────────────────
[ℹ️ MIGRATION] @vercel/kv imported in api/cache.ts
    Fix: Migrate to Upstash via Vercel Marketplace

⚙️ LEGACY EDGE RUNTIME (migration items)
──────────────────────────────────────────────────────────────
[ℹ️ MIGRATION] export const runtime = 'edge' in middleware.ts
    Fix: Migrate to the Node.js runtime default (Fluid Compute); Edge Runtime is deprecated

📦 DEPENDENCY AUDIT
──────────────────────────────────────────────────────────────
Total Dependencies: XX
Vulnerabilities Found: X

[🔴 HIGH] some-package < X.Y.Z
    Fix: npm update some-package

📋 ACTION ITEMS
──────────────────────────────────────────────────────────────
Priority 1 (CRITICAL):
  - Add auth guard to every unguarded Cron endpoint

Priority 2 (HIGH):
  - Remove secret logging from handlers
  - Update vulnerable dependencies

Priority 3 (MEDIUM):
  - Restrict CORS/CSP headers
  - Scope Marketplace credentials to least privilege

Priority 4 (MIGRATION, non-blocking):
  - Migrate off @vercel/kv / @vercel/postgres to Marketplace equivalents
  - Migrate off legacy Edge Runtime to Node.js/Fluid Compute

══════════════════════════════════════════════════════════════
```

## COMMANDS

```bash
# Audit dependencies
npm audit --omit=dev --audit-level=moderate

# Check for secret logging
grep -rn "console.log(process.env" api/

# Check Cron auth guards
grep -A3 '"crons"' vercel.json
grep -n "CRON_SECRET\|x-vercel-cron" api/**/*.ts

# Scan for deprecated storage packages and legacy Edge Runtime
grep -rn "@vercel/kv\|@vercel/postgres" package.json api/
grep -rn "runtime.*=.*['\"]edge['\"]" api/ middleware.ts
```

## SECURITY CHECKLIST

```
[ ] No secret env var ever logged (OWASP #2)
[ ] .env.local gitignored, Preview/Production scoping deliberate (OWASP #5)
[ ] Every crons[] target validates a shared secret before executing (OWASP #1)
[ ] No cron target reachable unauthenticated as a public route (OWASP #1)
[ ] CORS restricted to explicit origins on authenticated routes (OWASP #1)
[ ] CSP/HSTS/nosniff/frame-ancestors present in vercel.json headers[] (OWASP #5)
[ ] Marketplace credentials scoped to least privilege (OWASP #6)
[ ] @vercel/kv / @vercel/postgres usage flagged for Marketplace migration
[ ] No new code uses Edge Runtime; existing usage flagged for Fluid Compute migration
[ ] Dependencies audited, no moderate+ vulnerabilities (OWASP #10)
```
