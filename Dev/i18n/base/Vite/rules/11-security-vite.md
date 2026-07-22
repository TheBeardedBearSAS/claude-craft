# Vite Security Guidelines

> For Vite configured as a React/Vue/Angular/Svelte dev-server, see that stack's `11-security-*.md` — this document covers **only** framework-agnostic Vite usage.

## OWASP Top 10:2025 Focus Areas for This Stack

### A05:2025 - Security Misconfiguration — `envPrefix` / `define()` Secret Leakage

Vite inlines any environment variable matching `envPrefix` (default: `VITE_`) directly into the **client** bundle at build time, as plain-text string replacement — there is no runtime secret-fetch, no server boundary. The same is true of anything passed through `define()`. Both are permanent, public leaks once shipped: a value baked into a bundle by `define()` or `VITE_*` is retrievable by anyone who downloads the JS file, forever (until the artifact is rebuilt and redeployed).

```typescript
// ❌ CRITICAL — a private API key, baked into the public bundle
// .env
VITE_STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx

// src/payments.ts
const key = import.meta.env.VITE_STRIPE_SECRET_KEY // shipped to every browser, in plain text
```

```typescript
// ❌ CRITICAL — define() is also a compile-time, public inlining mechanism
export default defineConfig({
  define: {
    __API_SECRET__: JSON.stringify(process.env.API_SECRET), // baked into dist/, not hidden
  },
})
```

```typescript
// ✅ SAFE — only genuinely public values get the VITE_ prefix
// .env
VITE_API_BASE_URL=https://api.example.com   // public endpoint, fine to expose

// Secrets stay server-side only, never referenced from src/ or vite.config.ts's define/envPrefix path
```

**Rule**: before adding a new `VITE_*` variable (or a new `define()` key), ask "would I be comfortable pasting this value in a public GitHub issue?" — if not, it does not belong in the client build. Anything requiring confidentiality belongs in a backend the client calls over HTTPS, never in the bundle.

**Custom `envPrefix`**: if a project sets `envPrefix: ['PUBLIC_', 'APP_']` to move away from the `VITE_` convention, audit the prefix change itself — a broader or misconfigured prefix (e.g. accidentally matching `SECRET_` too) silently starts exposing variables that were previously safe by not matching the default `VITE_` filter.

### A05:2025 - Security Misconfiguration — CSP for Multi-Page Apps

Each HTML entry point in an MPA (Shape 3) is a separate document with its own `<head>` — a CSP `<meta>` tag added to `index.html` does **not** propagate to `admin/index.html` or `about.html`. Either template the CSP meta tag into every HTML entry consistently, or (preferred) set it once via server response headers so it applies uniformly regardless of which entry is served.

```typescript
// vite.config.ts — dev-server headers (production CSP must be set by the actual server/CDN, this only covers `vite dev`/`vite preview`)
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'",
    },
  },
})
```

**Rule**: for a multi-page app, verify the CSP (or its equivalent header configuration on the production host) against *every* entry, not just the root `index.html` — a common gap is a hardened root page next to an `admin/index.html` that was scaffolded later and never got the same treatment.

### A05:2025 - Security Misconfiguration — WASM Sandboxing

A WebAssembly module loaded via the `?init` suffix runs inside the **same** JavaScript sandbox as the rest of the page — it gains no elevated OS-level privileges, but it does share the page's origin and any capabilities explicitly passed to it through the imports object. Two practical implications:

1. **Cross-origin isolation for `SharedArrayBuffer`/threads** — if the WASM module uses threads or `SharedArrayBuffer`, the page must be cross-origin isolated (`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`), otherwise the browser silently disables the required APIs.
2. **CSP `wasm-unsafe-eval`** — a strict CSP without `script-src 'wasm-unsafe-eval'` blocks WebAssembly compilation in some browsers; add it explicitly rather than falling back to a permissive `'unsafe-eval'` for all scripts.

```typescript
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'",
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
```

**Rule**: never grant a WASM module's imports object a host function it doesn't need (e.g. a raw `fetch` or filesystem-like capability) just because it's convenient — the imports object is the module's entire capability surface; treat it like a permissions list, not a utility bag.

### A03:2025 - Injection — Worker Message Contracts

A Web Worker (Shape 4) receiving untrusted `postMessage` payloads (e.g. data forwarded from a third-party iframe, or attacker-influenced input) must validate the message shape before acting on it — `onmessage` has no built-in origin check when the worker is same-document, but if a worker is ever exposed to `postMessage` from other windows/origins, validate `event.origin` before trusting `event.data`.

```typescript
// src/heavy-task.worker.ts
self.onmessage = (e: MessageEvent) => {
  const { cmd } = e.data ?? {}
  if (typeof cmd !== 'string' || !['start', 'stop'].includes(cmd)) {
    console.error('rejected malformed worker message', e.data)
    return
  }
  // ... safe to proceed
}
```

## Build & Deploy

- [ ] Source maps disabled in production builds (`build.sourcemap: false` or `'hidden'`), unless uploaded privately to an error-tracking service
- [ ] `npm audit --omit=dev --audit-level=moderate` passes in CI
- [ ] No `VITE_*` variable or `define()` key holds a secret (see above)
- [ ] CSP verified against every HTML entry point (MPA shape)
- [ ] Cross-origin isolation headers present if any WASM module uses threads/`SharedArrayBuffer`
- [ ] Worker message handlers validate payload shape before acting on it

## Security Checklist

### Development
- [ ] `.env*` files (except `.env.example`) are gitignored
- [ ] No secret ever referenced via `import.meta.env.VITE_*` or `define()`
- [ ] Custom `envPrefix` (if any) reviewed for accidental over-matching

### Runtime
- [ ] CSP includes `wasm-unsafe-eval` if the project loads WebAssembly
- [ ] Worker imports object exposes the minimum capability surface needed
- [ ] Dependencies audited for vulnerabilities before each release
