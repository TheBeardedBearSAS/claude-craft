---
description: Analyze Vercel Serverless Functions code quality with ESLint, TypeScript, and bundle-size checks
---

# Vercel Code Quality Audit

You are an expert Vercel Functions code quality analyst. Perform comprehensive quality checks on `api/**` handlers and `middleware.ts`, strictly within the deployment-platform scope of this stack.

> Vercel is a **deployment platform**, not a framework. This command covers **only** Serverless Function handlers and middleware code quality. For the framework's own component/route code quality (e.g. Next.js pages/components), use that framework's own `check-code-quality` command instead.

## MISSION

Analyze code quality across `api/` and `middleware.ts` with focus on ESLint rules, TypeScript strictness, handler signature conventions, and bundle-size awareness for Functions.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## QUALITY CHECKS

### 1. ESLint Analysis

```bash
npx eslint api/ middleware.ts
```

Key rules to verify:
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unused-vars`
- `no-console` (allow warn/error only — handler logs are visible in platform log drains)
- `no-restricted-imports` (guards against importing deprecated `@vercel/kv`/`@vercel/postgres`)

### 2. TypeScript Analysis

```bash
tsc --noEmit --strict
```

Verify:
- No implicit `any` in handler signatures
- `@vercel/node` types (`VercelRequest`, `VercelResponse`) or Web-standard `Request`/`Response` used consistently, not mixed
- `strict: true` set in `tsconfig.json`

### 3. Handler Signature Conventions

Check every file under `api/`:
```
[ ] Request and response are explicitly typed (VercelRequest/VercelResponse or Request/Response)
[ ] Required env vars validated at the TOP of the handler, before any business logic runs
[ ] Handler returns early (guard clauses) on invalid method/missing env/invalid payload
[ ] No env var read deep inside nested logic — read once at the top, pass down
```

### 4. Bundle-Size Awareness (Functions)

```bash
npx @vercel/ncc build api/heavy-handler.ts --out /tmp-bundle-check 2>&1 | tail -20
```

Flag:
- Heavy dependencies imported at the top of a handler file when only used in one rare branch (prefer dynamic `import()` inside the branch)
- Full SDK imports (`import * as aws from 'aws-sdk'`) instead of scoped submodule imports
- Node built-ins bundled unnecessarily (check `externals` config for `@vercel/ncc`/build output)

### 5. Middleware Quality

Check `middleware.ts`:
```
[ ] matcher config scoped precisely (not a blanket "/(.*)" unless deliberate)
[ ] No heavy synchronous work in middleware (runs on every matched request)
[ ] No dynamic imports of Node-only packages incompatible with the middleware runtime
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VERCEL CODE QUALITY REPORT
══════════════════════════════════════════════════════════════

📊 QUALITY SCORE: XX/100

🔍 ESLINT ANALYSIS
──────────────────────────────────────────────────────────────
Errors: X
Warnings: X
Files with issues: X

Top Issues:
1. @typescript-eslint/no-explicit-any (3 occurrences)
   - api/webhook.ts:14

2. no-restricted-imports (1 occurrence)
   - api/cache.ts:2 — `import { kv } from '@vercel/kv'`
     → Deprecated; migrate to Marketplace Upstash/Neon integration

📝 TYPESCRIPT CHECK
──────────────────────────────────────────────────────────────
Status: ✅ PASS | ❌ FAIL
Type Errors: X

Issues:
- api/webhook.ts:8
  Parameter 'req' implicitly has an 'any' type

🎯 HANDLER SIGNATURE CONVENTIONS
──────────────────────────────────────────────────────────────
Handlers reviewed: X
Env validated at top: X/X
Explicitly typed: X/X

Issues:
- api/orders.ts: process.env.DATABASE_URL read inside a nested try block on line 40
  → Validate and read once at the top of the handler; fail fast if missing

📦 BUNDLE-SIZE AWARENESS
──────────────────────────────────────────────────────────────
Handlers checked: X
Heavy imports flagged: X

Issues:
- api/report.ts imports the full 'aws-sdk' package for one S3 call
  → Use '@aws-sdk/client-s3' scoped submodule import instead

⚙️ MIDDLEWARE QUALITY
──────────────────────────────────────────────────────────────
Status: ✅ Scoped | ⚠️ Overbroad matcher | ❌ Blocking work found

Issues:
- middleware.ts matcher is "/(.*)" — runs on every single request
  → Scope matcher to the specific paths that need it

📋 ACTION ITEMS
──────────────────────────────────────────────────────────────
1. [CRITICAL] Migrate off deprecated @vercel/kv / @vercel/postgres imports
2. [HIGH] Fix TypeScript errors in handler signatures
3. [MEDIUM] Validate env vars at handler top, not nested
4. [LOW] Trim heavy imports flagged for bundle size

══════════════════════════════════════════════════════════════
```

## COMMANDS TO RUN

```bash
# Full quality check
npx eslint api/ middleware.ts && tsc --noEmit --strict

# With auto-fix
npx eslint api/ middleware.ts --fix

# Deprecated storage package scan
grep -rn "@vercel/kv\|@vercel/postgres" api/
```
