---
description: Audit Vercel deployment configuration structure and project shape classification
---

# Vercel Architecture Audit

You are an expert Vercel platform architect. Analyze the project's `vercel.json` and deployment configuration for correctness and maintainability, strictly within the deployment-platform scope of this stack.

> Vercel is a **deployment platform**, not a framework. This command covers **only** `vercel.json`, Serverless Functions, ISR, Cron Jobs, Storage, and env/Preview Deployment config. For the framework's own routing/rendering/data-fetching conventions (e.g. Next.js App Router), use that framework's own `check-architecture` command instead.

## MISSION

Validate `vercel.json` schema correctness, classify the project's deployment shape, and flag configuration that duplicates or conflicts with a framework's native Vercel adapter.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## AUDIT AREAS

### 1. Project Shape Detection

```
[ ] Identify shape: static+rewrites | Functions-backed | ISR-enabled | Cron+scheduled (or a combination)
[ ] api/ directory present and mapped to Serverless Functions — Functions-backed shape
[ ] revalidate / `Cache-Control: s-maxage` used on responses — ISR-enabled shape
[ ] crons[] declared in vercel.json — Cron+scheduled shape
[ ] Purely static output with rewrites/redirects only — static+rewrites shape
```

### 2. vercel.json Schema Validity

```
[ ] Valid JSON, conforms to the documented vercel.json schema (no unknown top-level keys)
[ ] "$schema" reference present (editor validation) — optional but recommended
[ ] No deprecated keys (e.g. legacy `routes` mixed with modern `rewrites`/`redirects`/`headers`)
[ ] version field absent or set to 2 (legacy v1 config not used)
```

### 3. rewrites / redirects / headers Correctness

```
[ ] rewrites[] source patterns do not shadow static files unintentionally
[ ] redirects[] use explicit `permanent: true|false` (never left implicit)
[ ] headers[] scoped with precise `source` globs, not a blanket "/(.*)" for sensitive headers
[ ] No conflicting rules where two rewrites/redirects match the same source with different destinations
```

### 4. regions / functions Configuration

```
[ ] functions{} block scopes memory/duration per-function-glob, not globally overbroad
[ ] regions[] declared explicitly if data locality matters (default is auto/global)
[ ] maxDuration set deliberately per function tier (not left at platform default for long-running jobs)
[ ] Node.js runtime used by default; Edge Runtime only present with an explicit migration flag/comment
```

### 5. crons[] Configuration

```
[ ] Each cron entry has a valid path and schedule (standard cron syntax)
[ ] Cron target endpoint exists under api/ and is not also publicly routable without auth (cross-check with check-security)
[ ] No duplicate schedules pointing at the same path
[ ] Cron frequency respects plan limits (documented, not assumed)
```

### 6. Framework Adapter Conflict Detection

```
[ ] No vercel.json rewrites duplicating a Next.js/Nuxt/SvelteKit adapter's own routing output
[ ] No manual functions{} overrides fighting the framework's auto-detected build output
[ ] next.config.js / nuxt.config.ts (or equivalent) is the source of truth for framework routing; vercel.json only for platform-level concerns
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VERCEL ARCHITECTURE AUDIT
══════════════════════════════════════════════════════════════

📊 ARCHITECTURE SCORE: XX/100

🧭 PROJECT SHAPE
──────────────────────────────────────────────────────────────
Detected Shape: [static+rewrites | Functions-backed | ISR-enabled | Cron+scheduled | combination]
Status: ✅ Consistent with conventions | ⚠️ Partial drift | ❌ Non-conforming

Issues:
- api/ directory present but no corresponding functions{} scoping in vercel.json
  → Add explicit memory/duration bounds per function glob

⚙️ VERCEL.JSON SCHEMA
──────────────────────────────────────────────────────────────
Status: ✅ Valid | ⚠️ Needs cleanup | ❌ Invalid

Issues:
- legacy `routes` array present alongside `rewrites`
  → Migrate fully to `rewrites`/`redirects`/`headers`, remove `routes`

🔀 REWRITES / REDIRECTS / HEADERS
──────────────────────────────────────────────────────────────
Rules found: X
Conflicting rules: X

Issues:
- two redirects match "/blog/:slug" with different destinations
  → Consolidate into a single unambiguous rule

🌎 REGIONS / FUNCTIONS
──────────────────────────────────────────────────────────────
Status: ✅ Scoped deliberately | ⚠️ Overbroad | ❌ Missing

Issues:
- functions{} block sets maxDuration: 60 globally via "api/**"
  → Scope duration per function tier; most handlers need far less

⏰ CRON JOBS
──────────────────────────────────────────────────────────────
Crons declared: X
Auth-guarded targets: X/X

Issues:
- crons[] target api/cleanup.ts also reachable as a public route
  → See check-security for the CRITICAL auth-guard finding

🧩 FRAMEWORK ADAPTER CONFLICTS
──────────────────────────────────────────────────────────────
Status: ✅ No conflicts | ⚠️ Overlap detected

Issues:
- vercel.json rewrites duplicate Next.js's own output routing
  → Remove; let the framework's adapter own this concern

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
Priority 1: [Resolve conflicting rewrite/redirect rules]
Priority 2: [Scope functions{} bounds per handler]
Priority 3: [Guard cron endpoints with a secret-header check]

══════════════════════════════════════════════════════════════
```

## PROCESS

1. Parse `vercel.json` and validate against the documented schema
2. Detect project shape from directory layout (`api/`, cron declarations, revalidate usage)
3. Validate rewrites/redirects/headers for conflicts and overbroad globs
4. Review `regions`/`functions` scoping and runtime choice (Node.js default vs legacy Edge Runtime)
5. Validate `crons[]` entries and cross-check target auth (flag for `check-security`)
6. Detect configuration that duplicates or conflicts with a framework's native Vercel adapter
7. Generate architecture report with a score out of 100
