# Vercel Security Guidelines

> Covers security concerns specific to the Vercel **platform surface**: Functions, `vercel.json`, environment variables, Cron, Middleware, and Marketplace storage. For the framework running on top of Vercel, see that stack's own `11-security-*.md`. This document extends `.claude/rules/11-security.md` (OWASP Top 10:2025 baseline) with Vercel-specific detail — it does not repeat the full OWASP category list.

## Environment Variable Handling

- **Never log secrets.** A handler that logs `req.headers` or a full config object can leak an env var value into Vercel's log drain, which may have broader retention/access than the secret's intended scope.
- `.env.local` (and any `.env*` used for local secret values) **must** be gitignored — only `.env.example` (no real values) is committed.
- **Preview vs Production scoping**: the Vercel dashboard lets an environment variable be scoped to Production, Preview, and Development independently. Use this deliberately — a Production database credential should not also be exposed to every Preview Deployment (which can be triggered by any branch/PR, including from external contributors on public repos).

```bash
# ❌ Avoid — same secret exposed to Preview and Production
# (dashboard: DATABASE_URL scoped to "All Environments")

# ✅ Prefer — separate values per environment
# Production:  DATABASE_URL = <prod-credential>, scoped to Production only
# Preview:     DATABASE_URL = <staging-or-branch-db-credential>, scoped to Preview only
```

```typescript
// ❌ CRITICAL — leaks env values into logs
console.log('Request received', { headers: req.headers, env: process.env })

// ✅ SAFE — log only what's needed for debugging, never full env/headers
console.log('Request received', { path: req.url, method: req.method })
```

## Cron Endpoint Authentication — CRITICAL if Missing

A Cron Job's URL is just a normal Function route. **Path obscurity is not a control** — anyone who discovers or guesses the route (via a leaked deploy log, a public GitHub Action, or a wordlist scan) can invoke it directly unless the handler itself verifies the invocation.

```typescript
// ❌ CRITICAL — no auth check, relies purely on the URL being "hidden"
export default async function handler(req: Request): Promise<Response> {
  await runNightlyCleanup()
  return new Response('ok')
}

// ✅ SAFE — verifies Vercel's cron invocation secret before doing any work
export default async function handler(req: Request): Promise<Response> {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  await runNightlyCleanup()
  return new Response('ok')
}
```

```json
// vercel.json — register the schedule; the handler above still MUST check the secret
{
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }
  ]
}
```

**Rule**: every Cron endpoint must have a test asserting it rejects requests without (or with the wrong) `CRON_SECRET` — see `07-testing-vercel.md`. This is a 100%-coverage branch, not optional.

## `middleware.ts` Must Not Leak Internal State

Middleware runs on every matched request and can rewrite/set response headers. Two concrete failure modes to avoid:

1. **Leaking internal routing decisions** — do not echo internal rewrite targets, feature-flag names, or upstream service URLs into response headers for debugging; strip any temporary debug header before it reaches production traffic.
2. **Leaking secrets through headers** — never set a response header from a raw secret or token value (e.g. forwarding an internal auth token to the client "to save a lookup").

```typescript
// ❌ Avoid — internal implementation detail exposed to every client
export function middleware(req: Request) {
  const res = NextResponse.next()
  res.headers.set('x-debug-rewrite-target', internalUpstreamUrl)
  return res
}

// ✅ Prefer — no internal state in response headers
export function middleware(req: Request) {
  return NextResponse.next()
}
```

## CORS / CSP via `vercel.json` `headers`

Security headers can be set platform-wide through `vercel.json`'s `headers` block, applying uniformly regardless of which Function or static route serves the request. Align these with the header baseline in `.claude/rules/11-security.md` (CSP Level 3, `X-Content-Type-Options`, `X-Frame-Options`, HSTS, `Referrer-Policy`, COOP, COEP, CORP, `Permissions-Policy`).

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://example.com" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" }
      ]
    }
  ]
}
```

**Rule**: never set `Access-Control-Allow-Origin: *` on a route that reads authenticated/sensitive data — scope CORS to known origins explicitly, as shown above.

## Marketplace Storage Credential Handling

Native `@vercel/kv` and `@vercel/postgres` packages are **deprecated** — current practice is Marketplace-provisioned storage (e.g. Neon for Postgres, Upstash for Redis/KV), connected through the Vercel dashboard's Storage tab.

- **Auto-injected env vars**: connecting a Marketplace integration auto-populates connection-string env vars (e.g. `DATABASE_URL`, `KV_REST_API_URL`) scoped per environment (Production/Preview/Development) — treat these exactly like any other secret: never log them, never expose them to client-side code (no `NEXT_PUBLIC_`/framework-public prefix).
- **Least privilege per environment**: where the Marketplace provider supports it (e.g. Neon branch-per-preview), scope Preview Deployments to a restricted/branch database rather than the Production database — a Preview Deployment can be built from any branch, including external PRs on public repos.

```typescript
// ❌ CRITICAL — a Marketplace-injected connection string exposed to the client
// NEXT_PUBLIC_DATABASE_URL=postgres://...   (any "public"-prefixed env convention is client-exposed)

// ✅ SAFE — server-only env var, never referenced from client code
// DATABASE_URL=postgres://...   (no public-exposure prefix)
```

## Edge Runtime Legacy-Code Security Gap

Edge Runtime is **deprecated** by Vercel in favor of Fluid Compute on the Node.js runtime — it should not be targeted for new code. When auditing existing handlers still running on Edge Runtime, treat its reduced API surface as a **security-relevant gap**, not just a compatibility one: the historical absence of Node's `crypto` and `fs` modules on Edge Runtime pushed some codebases toward insecure workarounds (hand-rolled or under-vetted crypto implementations, non-constant-time comparisons for secret/signature checks, or fetching data that should have stayed server-side because a Node-only library couldn't run).

**Rule**: if a Function still targets Edge Runtime and its diff/history shows a custom crypto or signature-comparison routine, treat it as a migration priority — moving it to the Node.js runtime (Fluid Compute) restores access to Node's `crypto` module (`crypto.timingSafeEqual`, etc.) and removes the reason the workaround existed in the first place.

## Security Checklist

### Development
- [ ] `.env.local` (and all real-value `.env*`) gitignored
- [ ] No secret ever logged (`console.log` of headers/full env objects)
- [ ] Preview vs Production env var scoping reviewed in the Vercel dashboard

### Cron & Auth
- [ ] Every Cron endpoint verifies `CRON_SECRET` (or equivalent) before doing work
- [ ] Cron secret-guard branch has a test asserting 401 on missing/wrong secret
- [ ] `middleware.ts` sets no header that leaks internal routing or secrets

### Headers & Storage
- [ ] `vercel.json` `headers` block matches this repo's `.claude/rules/11-security.md` baseline
- [ ] No route serving authenticated data uses a wildcard CORS origin
- [ ] Marketplace-injected storage credentials are server-only, never client-exposed
- [ ] Preview Deployments use a scoped/branch database where the provider supports it

### Legacy
- [ ] No new Function targets Edge Runtime
- [ ] Existing Edge Runtime handlers audited for insecure crypto/workaround patterns before migration
