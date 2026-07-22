# Vercel New Feature Checklist

> Covers adding a new Serverless Function, Cron Job, or platform-level config change. For the framework running on top of Vercel (Next.js, etc.), see that stack's own new-feature checklist — this covers **only** the Vercel-platform surface.

## Before Starting

- [ ] **Requirements clear** - expected behavior and acceptance criteria defined
- [ ] **Project shape identified** - static+rewrites / Serverless Functions / ISR-enabled / Cron+Scheduled (see `02-architecture-vercel.md`)
- [ ] **Ownership checked** - if a claude-craft framework stack already owns routing/caching for this concern, defer to it rather than adding a competing `vercel.json` entry (see the decision tree in `02-architecture-vercel.md`)

## Runtime Decision

- [ ] **Node.js runtime (Fluid Compute) chosen by default** - no explicit `runtime` export needed
- [ ] **Edge Runtime only chosen for an explicit, justified reason** - documented in a code comment at the top of the handler (e.g. genuine sub-Node-cold-start geo-routing need); never chosen by default or "for consistency" with older code
- [ ] **If migrating a legacy Edge handler**, treated as a migration-audit task with its own verification pass, not copied as a template for new code

## Caching Decision

- [ ] **ISR/cache-header need identified** - does this route need periodic regeneration, or is a static response sufficient?
- [ ] **If ISR is needed and a framework stack owns the route** - configured via that framework's own primitive, not hand-rolled `Cache-Control` headers in `vercel.json`
- [ ] **If no framework owns the route** - any manual revalidation is implemented as plain HTTP caching via `vercel.json` `headers`, and documented as such (not called "ISR" — that term is reserved for the framework-level primitive)

## Storage Decision

- [ ] **Provider chosen deliberately**: Vercel Blob (native, for file/object storage) vs. a Marketplace integration (Neon for Postgres, Upstash for KV/Redis) - never `@vercel/kv` or `@vercel/postgres` (deprecated native packages)
- [ ] **Connection/credentials sourced from the Marketplace integration's env vars**, not hardcoded or copied from a personal account

## Cron Feature (if applicable)

- [ ] **`crons` entry added to `vercel.json`** with a valid 5-field UTC schedule
- [ ] **Plan's minimum interval and cron cap checked** before committing to a sub-hourly schedule
- [ ] **Secret-guard implemented** in the handler (`Authorization: Bearer ${CRON_SECRET}`), see `templates/function-handler.template.ts`

## Implementation

- [ ] **Handler created** under `api/` (or the project's existing convention), one default export per file
- [ ] **Env var validation guard added** at the top of the handler for any newly required variable
- [ ] **`vercel.json` updated** with only the sections the new feature actually needs (`functions`, `crons`, `headers`) - no invented `regions`/`maxDuration`/`memory` values (YAGNI, rule 05)
- [ ] **No secret hardcoded** - read from `process.env` only

## Testing

### Unit Tests

- [ ] **Handler tested directly** by constructing a `Request` and asserting on the `Response` (or mocking the minimal `VercelRequest`/`VercelResponse` subset for legacy handlers)
- [ ] **Method-not-allowed and malformed-input branches covered**
- [ ] **Handler logic coverage >= 85%**

### Cron Tests (if applicable)

- [ ] **Secret-guard tested at 100%**: missing header, wrong secret, and correct secret — all three branches

### Integration

- [ ] **`vercel dev` smoke test** exercises the new route's `vercel.json` behavior (headers/rewrites/redirects), where applicable

## Documentation

- [ ] **`.env.example` updated** if a new env var was introduced
- [ ] **`vercel.json` changes reviewed like code** - diffed and explained in the PR description, not silently regenerated

## Final Checks

- [ ] **Lint passes** - `npx eslint .`
- [ ] **Types pass** - `tsc --noEmit`
- [ ] **Tests pass** - `npx vitest run`
- [ ] **`vercel.json` validated** - `npm run lint:vercel-config`
- [ ] **`vercel build`** succeeds locally before pushing

## Pull Request

- [ ] **Descriptive title**
- [ ] **Linked to issue/ticket**
- [ ] **Any new deprecated-package or Edge Runtime usage explicitly justified** in the description
- [ ] **Reviewers assigned**
