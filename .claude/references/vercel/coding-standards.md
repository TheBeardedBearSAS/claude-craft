# Vercel Coding Standards

> Covers only the platform-level code surface: `api/**` handlers, `middleware.ts`, environment variables, and `vercel.json` formatting. A framework's own route handlers, loaders, or server components follow that stack's own coding standards, not this document.

## `api/**` Handler Conventions

### File Naming and Routing

| Convention | Rule | Example |
|------------|------|---------|
| File path | Mirrors the URL path under `/api` | `api/users/[id].ts` → `/api/users/:id` |
| Dynamic segment | `[param].ts` (single), `[...param].ts` (catch-all) | `api/webhooks/[provider].ts` |
| HTTP method dispatch | One handler per file, branch on `req.method` inside | Do not create `get-user.ts` / `post-user.ts` pairs |
| Export | Single `default` export, no named exports for the handler itself | `export default function handler(...)` |

### Handler Signature — Node.js Runtime (default)

```typescript
// api/users/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { id } = req.query
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid id' })
    return
  }

  // ... fetch and respond
  res.status(200).json({ id })
}
```

**Rule**: type the handler with `VercelRequest`/`VercelResponse` from `@vercel/node`, not bare `Request`/`Response` — those are the Web Fetch API types used by the (deprecated-for-new-code) Edge runtime, and mixing the two signatures across the `api/` tree makes the runtime each function targets ambiguous at a glance.

### Method Dispatch — Guard Clauses, Not Nested Conditionals

```typescript
// ✅ PREFERRED — early return per method, flat structure
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  res.status(405).json({ error: 'Method not allowed' })
}

// ❌ AVOID — nested if/else pyramids for method branching
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // ...
  } else {
    if (req.method === 'POST') {
      // ...
    } else {
      // ...
    }
  }
}
```

### Cron Handler Authentication

A cron-triggered handler must verify the request actually came from Vercel's scheduler, since the endpoint is a plain public URL otherwise:

```typescript
// api/cron/send-digest.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  // ... job logic
  res.status(200).json({ ok: true })
}
```

**Rule**: `CRON_SECRET` is an app-defined env var (set it yourself), not a Vercel system var — never assume Vercel injects an auth token automatically.

---

## `middleware.ts` Matcher Scoping

Middleware runs before routing resolves. Scope it explicitly with `config.matcher` — an unscoped middleware runs on every request, including static assets, which adds latency for no benefit.

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server' // or the equivalent for the framework in use

export function middleware(req: NextRequest) {
  // ... auth check, redirect, header injection
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclude static assets and the favicon explicitly
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

| Matcher pattern | Scope |
|------------------|-------|
| `/api/:path*` | Only API routes |
| `/dashboard/:path*` | Only a specific section |
| `/((?!_next/static\|_next/image\|favicon.ico).*)` | Everything except framework-internal static assets |

**Rule**: never ship `middleware.ts` with no `config.matcher` (defaulting to all routes) unless the middleware's own logic is a true global concern (e.g. a single security header applied everywhere) — the matcher is the first thing to check when middleware-added latency shows up in a performance audit.

---

## Environment Variable Naming

| Category | Convention | Example |
|----------|------------|---------|
| Vercel system vars (reserved, read-only) | `VERCEL_*`, injected automatically | `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_GIT_COMMIT_SHA` |
| App-defined, server-only secrets | `SCREAMING_SNAKE_CASE`, no prefix | `DATABASE_URL`, `CRON_SECRET` |
| App-defined, client-exposed | Framework's own public prefix (never a bare secret name) | `NEXT_PUBLIC_API_URL` (Next.js), `VITE_API_URL` (Vite-based stacks) |
| Marketplace integration vars | Auto-injected by the integration when connected via the dashboard | `UPSTASH_REDIS_REST_URL`, `DATABASE_URL` (Neon) |

**Rule**: never read or set a `VERCEL_*`-prefixed variable in application code — those are reserved for the platform. Application secrets always use an unprefixed (server-only) or framework-prefixed (client-exposed) name, never a name starting with `VERCEL_`.

**Rule**: when adding a storage integration (Blob, or a Marketplace product like Neon/Upstash), do not hardcode connection strings — the integration injects them as env vars once connected in the dashboard; reference them by the name the integration documents (e.g. `BLOB_READ_WRITE_TOKEN`), and do not rename them locally, since Preview/Production env values are managed by the integration, not by hand-edited `.env` files.

---

## `vercel.json` Formatting Conventions

Keep top-level keys in this order for diff-friendliness:

1. `$schema` (if present — see `06-tooling.md`)
2. `rewrites`
3. `redirects`
4. `headers`
5. `regions`
6. `functions`
7. `crons`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/app/:path*", "destination": "/api/app/:path*" }],
  "redirects": [{ "source": "/old", "destination": "/new", "permanent": true }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "X-Frame-Options", "value": "DENY" }]
    }
  ],
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": { "memory": 1024, "maxDuration": 15 }
  },
  "crons": [{ "path": "/api/cron/send-digest", "schedule": "0 8 * * *" }]
}
```

**Rule**: 2-space indentation, keys within each array item in the order shown in the examples above (`source` before `destination`/`headers`, `path` before `schedule`), and no trailing comments (`vercel.json` is strict JSON, not JSON5/JSONC).

---

## Commit Style

This repository's git workflow (rule 09) applies unchanged to Vercel-specific changes — Conventional Commits, scoped to the concern:

```
feat(vercel): add cron job for daily digest
fix(vercel): scope middleware matcher to exclude static assets
chore(vercel): bump functions maxDuration for webhook handler
```

Use the `vercel` scope for changes isolated to `vercel.json`, `api/**`, or `middleware.ts`; use the owning framework's scope (e.g. `feat(react): ...`) when a change is primarily a framework concern that happens to touch a Vercel adapter setting.
