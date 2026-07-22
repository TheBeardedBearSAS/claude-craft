# Vercel Pre-Commit Checklist

> Covers the platform-specific surface only (`vercel.json`, `api/**`, `middleware.ts`). For the framework running on top of Vercel (Next.js, etc.), see that stack's own pre-commit checklist.

## Quick Checks

Run before every commit:

```bash
npx eslint . && tsc --noEmit && npx vitest run && npm run lint:vercel-config
```

## Checklist

### `vercel.json`

- [ ] **Validated against the platform schema** - `npx ajv validate -s schemas/vercel.schema.json -d vercel.json --strict=false`
- [ ] **No key duplicated from a framework's own config** - check the decision tree in `02-architecture-vercel.md` before adding `headers`/`regions`/`functions`
- [ ] **No invented `regions` or `functions.maxDuration`/`memory` value** - every non-default value has a concrete, documented reason (YAGNI, rule 05)
- [ ] **Existing `vercel.json` never silently overwritten** - a regenerated file was diffed and confirmed against the previous version, not blindly replaced

### Handler Code

- [ ] **No secrets in handler code** - all secrets read from `process.env`, none hardcoded
- [ ] **Env vars documented in `.env.example`** - every `process.env.X` referenced by a handler has a matching (empty/placeholder) entry
- [ ] **Env var validation guard present** for any handler with a required var (see `templates/function-handler.template.ts`)
- [ ] **No `console.log`** left in (warn/error only)

### Cron Endpoints

- [ ] **Secret-guard present** on every handler registered under `vercel.json`'s `crons` section - rejects requests missing or mismatching `Authorization: Bearer ${CRON_SECRET}`
- [ ] **Guard is not the only line of defense** - path is not assumed to be secret/obscure

### Deprecated Patterns

- [ ] **No new `@vercel/kv` or `@vercel/postgres` import** - these native storage packages are deprecated; use Vercel Blob (native) or the Marketplace integrations (Neon for Postgres, Upstash for KV/Redis) instead
- [ ] **No new `runtime: 'edge'` declaration** without an explicit migration comment - Edge Runtime is deprecated in favor of Fluid Compute; a legacy handler being touched must carry a comment explaining why it still targets Edge (see the migration note in `templates/function-handler.template.ts`)

### Testing

- [ ] **Tests pass** - `npx vitest run`
- [ ] **New handler has tests**
- [ ] **Coverage maintained** (>= 85% handler logic, 100% secret-guard branches)

## Commands

```bash
# Full pre-commit check
npx eslint . && tsc --noEmit && npx vitest run

# Validate vercel.json against the platform schema
npx ajv validate -s schemas/vercel.schema.json -d vercel.json --strict=false

# Check for deprecated storage packages
grep -rn "@vercel/kv\|@vercel/postgres" api/ package.json

# Check for un-annotated Edge Runtime declarations
grep -rn "runtime.*=.*['\"]edge['\"]" api/ middleware.ts 2>/dev/null
```
