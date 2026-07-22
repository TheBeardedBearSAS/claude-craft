// api/{{handler-name}}.ts
//
// Minimal Serverless Function handler skeleton — Node.js runtime, Fluid Compute
// (the platform default; do not set `export const runtime = 'edge'` — see the
// migration note at the bottom of this file). Uses the native `Request`/
// `Response` signature, which is the current Vercel-recommended typing for
// Node.js runtime handlers: portable, and trivially unit-testable without
// mocking `@vercel/node`'s `VercelRequest`/`VercelResponse` (see
// 07-testing-vercel.md for the legacy callback-style alternative).

// ============================================================================
// Env var validation guard — fail fast, before any handler logic runs.
// Never let a missing required var surface as a confusing downstream error.
// ============================================================================
const REQUIRED_ENV_VARS = ['{{REQUIRED_ENV_VAR}}'] as const

function assertRequiredEnvVars(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`)
  }
}

export default async function handler(req: Request): Promise<Response> {
  assertRequiredEnvVars()

  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // {{HANDLER_LOGIC}} — business logic goes here, not in vercel.json rewrites
  // or function config. Keep this function's own responsibility narrow
  // (SOLID SRP, rule 04) — extract non-trivial logic into a plain,
  // directly unit-testable function imported here.

  return Response.json({ ok: true })
}

// ============================================================================
// {{IF_CRON_ENDPOINT}} — secret-guard for a Cron-invoked handler.
// Delete this block entirely if this handler is not registered under
// vercel.json's `crons` section. A cron path is a plain HTTP endpoint
// reachable by anyone who guesses the URL — the guard is not optional.
// ============================================================================
//
// const auth = req.headers.get('authorization')
// if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
//   return new Response('Unauthorized', { status: 401 })
// }
// // Test all three branches (missing header / wrong secret / correct
// // secret) at 100% coverage — see 07-testing-vercel.md.

// ============================================================================
// Edge Runtime migration notes (placeholder only — do NOT implement Edge
// Runtime code here; Edge Runtime is deprecated by Vercel).
//
// If this handler is being converted FROM a legacy `export const runtime =
// 'edge'` file:
//   1. Confirm no Edge-only API dependency remains (the restricted Edge
//      subset — check for any API the Node.js runtime doesn't expose the
//      same way).
//   2. Remove the `export const runtime = 'edge'` line entirely; Fluid
//      Compute is the default, no explicit runtime export is needed.
//   3. Re-run the handler's full test suite (see 07-testing-vercel.md) —
//      an Edge-to-Node migration must not silently change response shape.
//   4. Do NOT copy this pattern into any new handler — it exists only to
//      guide migration of pre-existing code.
// ============================================================================
