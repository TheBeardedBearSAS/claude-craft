# Vercel Testing Guidelines

> Vercel is a **deployment platform**, not a framework. This document covers testing for platform-specific surface: Serverless Functions (`api/**`), `vercel.json` behavior, Cron Jobs, and Middleware. It does **not** cover the framework running on top of Vercel (Next.js routing/rendering, etc.) — see that framework's own testing rules for that.

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing for Function handlers, mocking `VercelRequest`/`VercelResponse` or native `Request`/`Response` |
| **@vitest/coverage-v8** | Code coverage |
| **`vercel dev`** | Local integration smoke tests — runs the platform routing/`vercel.json` behavior locally, closest thing to a pre-deploy integration check |
| **Playwright** (optional) | End-to-end smoke test against a Preview Deployment URL |

There is no dedicated "Vercel Functions testing library" — a Function handler is a plain async function; test it like any other Node/Web handler.

## Handler Signature: Two Runtimes

Functions on Vercel expose two handler signatures depending on runtime:

| Runtime | Signature | Status |
|---------|-----------|--------|
| **Node.js runtime (Fluid Compute)** — default | `(req: VercelRequest, res: VercelResponse) => void` **or** `(req: Request) => Response` | Current, recommended |
| **Edge Runtime** | `(req: Request) => Response` | **Deprecated** by Vercel — do not target for new code; only relevant when testing legacy handlers during migration |

Prefer the native `Request`/`Response` signature for new handlers under Fluid Compute — it is portable and trivial to unit test without mocking Vercel-specific types.

## Testing a Node.js Runtime Handler (native `Request`/`Response`)

```typescript
// api/hello.ts
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }
  const name = new URL(req.url).searchParams.get('name') ?? 'world'
  return Response.json({ message: `Hello, ${name}` })
}
```

```typescript
// api/hello.test.ts
import { describe, it, expect } from 'vitest'
import handler from './hello'

describe('GET /api/hello', () => {
  it('greets the provided name', async () => {
    const req = new Request('https://example.com/api/hello?name=Ada')
    const res = await handler(req)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ message: 'Hello, Ada' })
  })

  it('defaults to world when no name is given', async () => {
    const req = new Request('https://example.com/api/hello')
    const res = await handler(req)
    await expect(res.json()).resolves.toEqual({ message: 'Hello, world' })
  })

  it('rejects non-GET methods', async () => {
    const req = new Request('https://example.com/api/hello', { method: 'POST' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })
})
```

## Testing a `VercelRequest`/`VercelResponse` Handler (legacy Node.js style)

When a handler still uses the `@vercel/node` callback-style types, mock the minimal subset actually used — do not import the real Vercel dev server into unit tests.

```typescript
// api/legacy-status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ status: 'ok' })
}
```

```typescript
// api/legacy-status.test.ts
import { describe, it, expect, vi } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from './legacy-status'

function mockResponse() {
  const res = {} as VercelResponse
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('legacy-status handler', () => {
  it('returns 200 with an ok status', () => {
    const req = {} as VercelRequest
    const res = mockResponse()
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' })
  })
})
```

## Testing Cron Endpoints

A Cron Job is a normal Function invoked on a schedule defined in `vercel.json`. Two things must be tested: the handler's business logic, and — critically — that the **secret-header guard** actually rejects unauthenticated calls. Never assume path obscurity is a substitute for this test (see `11-security-vercel.md`).

```typescript
// api/cron/cleanup.ts
export default async function handler(req: Request): Promise<Response> {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // ... cleanup logic
  return Response.json({ ok: true })
}
```

```typescript
// api/cron/cleanup.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import handler from './cleanup'

describe('cron: cleanup', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret'
  })

  it('rejects a call with no authorization header', async () => {
    const req = new Request('https://example.com/api/cron/cleanup')
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('rejects a call with the wrong secret', async () => {
    const req = new Request('https://example.com/api/cron/cleanup', {
      headers: { authorization: 'Bearer wrong' },
    })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('runs the cleanup when the secret matches', async () => {
    const req = new Request('https://example.com/api/cron/cleanup', {
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
  })
})
```

**Rule**: invoke the Cron handler directly in tests (as above) rather than only relying on `vercel dev` — the guard branch must be covered by fast unit tests, not just a manual local check.

## Local Integration Smoke Tests with `vercel dev`

`vercel dev` reproduces the platform's routing, `vercel.json` `headers`/`rewrites`/`redirects`, and Cron trigger registration locally. Use it for a small number of smoke tests that unit tests cannot cover (actual routing resolution, header injection), not for business-logic coverage.

```bash
# package.json
{
  "scripts": {
    "dev": "vercel dev",
    "test:smoke": "start-server-and-test 'vercel dev --listen 3000' http://localhost:3000 'curl -f http://localhost:3000/api/hello'"
  }
}
```

## Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Handler business logic (`api/**`) | 85% |
| Auth / secret-guard branches (Cron, protected endpoints) | 100% |

Exclude from coverage: `vercel.json` (not executable code), generated `.vercel/` output.
