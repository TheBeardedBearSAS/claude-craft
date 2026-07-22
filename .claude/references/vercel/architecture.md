# Vercel Architecture Guidelines

> Vercel is a **deployment platform**, not a framework. This document covers only the platform-level surface: `vercel.json`, Serverless Functions, ISR cache primitives, Cron Jobs, and the compute-model decision. Framework routing/rendering (Next.js, or any `/react:*`, `/vuejs:*`, `/angular:*` app) is out of scope — if a supported claude-craft framework stack is present in the project, defer to that stack's own `06-tooling.md` for its Vercel adapter, and do not duplicate config here.

## Architecture Pattern

**Pattern**: Platform-agnostic-app deployment — Vercel has no component model or rendering runtime of its own; it builds whatever the project's framework (or lack of one) produces, and layers routing, caching, and compute config on top via `vercel.json` and the filesystem-based `api/` convention. Four project shapes are supported; pick the one matching the project and do not mix conventions from the others.

| Shape | When to use |
|-------|-------------|
| **Static + Rewrites** | Prebuilt static site (SPA, docs, marketing) needing URL rewrites/redirects/headers only, no server compute |
| **Serverless Functions** | `api/**` endpoints backing a static or framework frontend — auth callbacks, webhooks, form handlers |
| **ISR-enabled** | Pages that need to be regenerated on a cache interval without a full redeploy |
| **Cron + Scheduled** | Recurring background jobs (cleanup, digest emails, cache warms) triggered by Vercel's scheduler |

A single project can combine shapes (e.g. a static site with a handful of `api/` functions and one cron job), but each shape's core convention below must still be respected.

---

## Shape 1 — Static + Rewrites

No server compute. The build output (`public/` or a framework's static export) is served from Vercel's CDN, and `vercel.json` handles URL-level concerns only.

```
project-root/
├── public/                     # or the framework's static build output
│   ├── index.html
│   └── assets/
├── vercel.json                  # rewrites, redirects, headers only
└── package.json
```

**Rule**: if the project has zero `api/` functions and zero cron jobs, `vercel.json` should contain only `rewrites`, `redirects`, `headers`, and (rarely) `cleanUrls`/`trailingSlash` — no `functions` block. Adding one signals the project has grown into Shape 2.

---

## Shape 2 — Serverless Functions

Endpoints live under `api/` (or a framework's own functions convention, which supersedes this when present). Each file exports a single default handler running on the **Node.js runtime** (Fluid Compute) unless there's a documented legacy reason to pin the Edge runtime (see the decision tree below).

```
project-root/
├── api/
│   ├── webhook.ts                # POST /api/webhook
│   ├── auth/
│   │   └── callback.ts           # GET /api/auth/callback
│   └── health.ts                 # GET /api/health
├── vercel.json                   # functions block: memory, maxDuration, regions
└── package.json
```

`vercel.json` — `functions` block:
```json
{
  "functions": {
    "api/webhook.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**Rule**: never mix a framework's own API convention (e.g. a React Router loader, or a backend already deployed elsewhere) with a competing `api/` tree in the same project unless the framework stack's tooling doc explicitly documents that combination — pick one source of truth for routing.

---

## Shape 3 — ISR-enabled

Incremental Static Regeneration lets a route serve a cached response and regenerate it in the background after a configured interval, without redeploying. This is a framework-level primitive (the framework's adapter decides how a route opts in) — the platform-level piece owned by Vercel is the cache header contract and the `regions` a stale-while-revalidate response is served from.

```
project-root/
├── (framework routes opting into ISR — see framework's own docs)
├── vercel.json                   # regions (co-locate compute with the cache)
└── package.json
```

`vercel.json` — pinning regions for a stateful/ISR-heavy deployment:
```json
{
  "regions": ["iad1"]
}
```

**Rule**: do not hand-roll a cache-control header scheme that conflicts with a framework's ISR output (e.g. manually setting `Cache-Control: no-store` on a route the framework has configured to revalidate every 60s) — check the owning framework's tooling doc first. If no supported framework stack owns the route, ISR is out of reach at the platform level alone; treat any manual revalidation as plain HTTP caching via `headers` in `vercel.json`, not "ISR".

---

## Shape 4 — Cron + Scheduled

Recurring jobs are declared in `vercel.json` and backed by a normal Serverless Function under `api/`. Vercel invokes the endpoint on the cron schedule; the function must authenticate the invocation itself (see coding standards for the header convention) since cron requests are plain HTTP calls.

```
project-root/
├── api/
│   └── cron/
│       └── send-digest.ts        # invoked by the schedule below
├── vercel.json                   # crons block
└── package.json
```

`vercel.json` — `crons` block:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-digest",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Rule**: cron schedules run in UTC and have a per-plan minimum interval and per-project cap on the number of crons — check the current plan's limits before adding a high-frequency schedule; do not assume sub-hourly crons are available on every plan.

---

## `vercel.json` Schema Reference

| Key | Purpose | Notes |
|-----|---------|-------|
| `rewrites` | Serve a different path/origin without changing the URL | Array of `{ source, destination }`; supports proxying to an external origin |
| `redirects` | HTTP redirect, changes the URL | Array of `{ source, destination, permanent }` |
| `headers` | Attach response headers by path pattern | Array of `{ source, headers: [{ key, value }] }` — security headers (rule 11) belong here for static routes |
| `regions` | Pin Serverless Function execution region(s) | Array of region codes (e.g. `["iad1"]`); co-locate with the primary database |
| `functions` | Per-function runtime config | Keyed by glob path; `memory`, `maxDuration`, `runtime` |
| `crons` | Scheduled invocations | Array of `{ path, schedule }`; standard 5-field cron syntax, UTC |

Example combining several sections:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "redirects": [
    { "source": "/old-docs", "destination": "/docs", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ],
  "functions": {
    "api/**/*.ts": { "memory": 1024, "maxDuration": 15 }
  },
  "regions": ["iad1"],
  "crons": [
    { "path": "/api/cron/send-digest", "schedule": "0 8 * * *" }
  ]
}
```

---

## Decision Tree — `vercel.json` vs. Framework Config

```
Does the project use a supported claude-craft framework stack
(React, Vue.js, Angular, ...) with its own Vercel adapter?
│
├─ YES → Does the concern involve routing, rendering, data-fetching,
│         or a framework-native cache primitive (ISR, streaming)?
│         │
│         ├─ YES → belongs in the framework's own config / that
│         │         stack's `06-tooling.md` — do NOT duplicate in
│         │         vercel.json.
│         │
│         └─ NO (pure platform concern: cron, region pinning,
│              a header not expressible in the framework, a
│              rewrite to an external origin) → vercel.json.
│
└─ NO (no framework, or a framework without a documented adapter)
   → vercel.json owns rewrites/redirects/headers/regions/functions/crons
     directly; api/** is the only server-compute surface available.
```

**Rule**: when in doubt, check whether the framework's adapter already generates or reads a given `vercel.json` key at build time (several frameworks auto-populate `functions` or `regions`) — hand-editing a key the framework's build owns will be silently overwritten on the next deploy.

---

## Compute Model Decision Tree — Fluid Compute vs. Edge Runtime

```
Choosing a runtime for an api/** handler or middleware:
│
├─ New code, no prior runtime pinned?
│   → Default to the Node.js runtime with Fluid Compute.
│     Full Node API access, bytecode caching gives fast cold
│     starts on Node 20+, Active CPU pricing (billed for actual
│     CPU work, not idle wall-clock time).
│
├─ Existing code has `export const runtime = 'edge'`?
│   → Recognize this as LEGACY. Edge Runtime is deprecated by
│     Vercel in favor of Fluid Compute. Do not extend or copy
│     this pattern into new handlers. Flag it during a migration
│     audit; plan removal of the `runtime = 'edge'` export and
│     verification that the handler has no Edge-only API
│     dependency (e.g. no reliance on the restricted Edge subset)
│     before switching it to the Node.js runtime.
│
└─ Unsure whether a specific handler needs Edge-specific behavior
   (true low-latency geo-routing before any Node runtime spins up)?
   → Surface the question rather than assuming — Edge Runtime is
     a narrowing, not a growing, part of the platform.
```

**Rule**: never write `export const runtime = 'edge'` in new code reviewed under this stack. If a task explicitly requires evaluating or migrating existing Edge functions, treat it as a migration-audit task, not a template to replicate.

---

## Key Architecture Principles

### 1. Single Responsibility per Shape
- Do not let a static site accumulate ad hoc `api/` handlers "just in case" — adding the first function is a deliberate move to Shape 2, with the `functions` block and auth conventions (see `03-coding-standards.md`) that come with it.

### 2. Platform Config Stays Platform-Level
- `vercel.json` expresses deployment/routing/compute concerns. Business logic, validation, and data access belong in the handler, not in rewrite rules or function config.

### 3. Defer to the Framework When One Owns the Route
- If a claude-craft framework stack's adapter already manages a routing or caching concern, do not re-implement it via `vercel.json` — see the decision tree above.

### 4. Fluid Compute by Default
- New Serverless Functions target the Node.js runtime. Edge Runtime is a recognized legacy pattern only, never a starting point.

### 5. Config as Data, Reviewed Like Code
- `vercel.json` is checked into version control, reviewed in PRs like any other config, and validated against the schema (see `06-tooling.md`) before merge.
