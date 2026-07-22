---
description: Audit test coverage for Vercel Function handlers, middleware, and Cron secret-guards
---

# Vercel Testing Audit

You are an expert Vitest/Vercel testing specialist. Analyze test coverage and quality for the platform-specific surface of a Vercel deployment.

> Vercel is a **deployment platform**, not a framework. This command covers only `api/**` Function handlers, `middleware.ts` logic, and Cron secret-guards — it does **not** cover the framework running on top (Next.js routing/rendering, etc.). Use that framework's own `check-testing` command for that layer.

## MISSION

Evaluate test coverage, test quality, and testing best practices for Serverless Function handlers, `middleware.ts` request logic, and scheduled Cron endpoints, with special attention to the secret-guard branch that authenticates Cron invocations.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple `api/` directories or requires cross-cutting investigation.

## AUDIT AREAS

### 1. Coverage Analysis

```bash
npx vitest run --coverage
```

Thresholds:
- Handler business logic (`api/**`): 85%
- Auth / secret-guard branches (Cron, protected endpoints): 100%
- Branches, functions, lines (project-wide floor): 80%

### 2. Test Organization

Check for:
- Co-located tests (`*.test.ts` next to the handler)
- Proper `describe`/`it` structure
- Meaningful test names (method + expected outcome)
- Test isolation (no shared mutable `process.env` between tests without `beforeEach` reset)

### 3. Function Handler Testing

Verify:
- Every `api/**` handler has a direct unit test invoking it as a plain function — no dependency on a live `vercel dev` server for logic coverage
- Native `Request`/`Response` handlers are tested by constructing a real `Request` and asserting on the returned `Response` (status, JSON body)
- Legacy `VercelRequest`/`VercelResponse` handlers mock only the minimal subset actually used (`res.status`, `res.json`, ...) — never import the real dev server into a unit test
- Method-not-allowed and malformed-input branches are covered, not just the happy path

### 4. Middleware Testing

Check:
- `middleware.ts` matcher config is covered by a test asserting which paths it does/doesn't apply to
- Redirect/rewrite logic inside middleware is extracted into a plain, directly testable function where feasible
- Middleware does not silently swallow errors — error branches have explicit tests

### 5. Cron Secret-Guard Testing (mandatory, 100%)

Check, for every endpoint declared under `vercel.json`'s `crons` block:
- A test asserts the handler returns 401 with **no** `authorization` header
- A test asserts the handler returns 401 with the **wrong** secret
- A test asserts the handler proceeds (200, or the expected success path) with the **correct** `Bearer ${CRON_SECRET}` header
- The guard is tested by invoking the handler directly, not only via a manual `vercel dev` smoke check

### 6. `vercel dev` Smoke-Test Coverage

Check:
- At least one smoke test (via `vercel dev` + a local `curl`/`fetch`, or `start-server-and-test`) exercises real `vercel.json` `headers`/`rewrites`/`redirects` resolution
- Smoke tests are scoped to routing/config concerns that unit tests cannot cover — not a substitute for handler-logic unit tests

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VERCEL TESTING AUDIT
══════════════════════════════════════════════════════════════

📊 COVERAGE SUMMARY
──────────────────────────────────────────────────────────────
Handler logic (api/**):        XX% (target: 85%)
Secret-guard branches (Cron):  XX% (target: 100%)
Branches (project floor):      XX% (target: 80%)
Functions:                     XX% (target: 80%)
Lines:                         XX% (target: 80%)

Status: ✅ PASS | ❌ BELOW THRESHOLD

📁 COVERAGE BY AREA
──────────────────────────────────────────────────────────────
api/ (handlers):        XX% ████████░░
api/cron/ (scheduled):  XX% ██████████
middleware.ts:          XX% ███████░░░

🔴 UNCOVERED FILES
──────────────────────────────────────────────────────────────
- api/webhooks/stripe.ts (20%)
- middleware.ts (0%)

📋 TEST ORGANIZATION
──────────────────────────────────────────────────────────────
Total Test Files: XX
Total Tests: XX
Co-located Tests: XX/XX (XX%)

Issues:
- tests/ directory used instead of co-location
  → Move tests next to the handler file

⚙️ FUNCTION HANDLER TEST QUALITY
──────────────────────────────────────────────────────────────
Handlers with direct unit tests: X/X

Issues:
[✗] api/health.ts — no test invokes the handler directly
    → Add api/health.test.ts constructing a Request and asserting the Response

🔒 CRON SECRET-GUARD COVERAGE (must be 100%)
──────────────────────────────────────────────────────────────
Cron endpoints with all 3 guard branches tested: X/X

Issues:
[✗] api/cron/send-digest.ts — only the "correct secret" branch is tested
    → Add tests for missing header and wrong-secret cases (401 expected)

🧭 MIDDLEWARE TEST QUALITY
──────────────────────────────────────────────────────────────
Status: ✅ COVERED | ❌ MISSING

Issues:
[⚠️] middleware.ts — matcher config has no test asserting scope
    → Add a test enumerating paths that should/shouldn't be intercepted

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. [CRITICAL] Bring all Cron secret-guard branches to 100% coverage
2. [HIGH] Add direct unit tests for uncovered api/** handlers
3. [MEDIUM] Extract middleware redirect logic into a testable function
4. [LOW] Move tests to co-located structure

══════════════════════════════════════════════════════════════
```

## COMMANDS

```bash
# Run tests with coverage
npx vitest run --coverage

# Run a specific handler's test
npx vitest run api/cron/send-digest.test.ts

# Local integration smoke test (routing/vercel.json only, not logic coverage)
vercel dev --listen 3000 &
curl -f http://localhost:3000/api/health
```

## TEST FILE TEMPLATE

```typescript
// api/cron/send-digest.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import handler from './send-digest'

describe('cron: send-digest', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret'
  })

  it('rejects a call with no authorization header', async () => {
    const req = new Request('https://example.com/api/cron/send-digest')
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('rejects a call with the wrong secret', async () => {
    const req = new Request('https://example.com/api/cron/send-digest', {
      headers: { authorization: 'Bearer wrong' },
    })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('runs when the secret matches', async () => {
    const req = new Request('https://example.com/api/cron/send-digest', {
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
  })
})
```
