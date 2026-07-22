# Vite Security Guidelines (Framework-Agnostic)

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## Build-Time Secret Leakage

### `envPrefix` — What Gets Shipped to the Client

By default, Vite only exposes environment variables prefixed with `VITE_` to client code via `import.meta.env`. This is a **security boundary**, not a naming convention — anything matching the prefix is inlined as plaintext into every bundle, fully readable by anyone opening devtools.

```typescript
// vite.config.ts
export default defineConfig({
  envPrefix: 'VITE_', // default — do not widen this without a strong reason
})
```

```bash
# ✅ Safe: public, non-sensitive
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App

# ❌ NEVER prefix secrets with VITE_ — they ship straight to the browser
VITE_DATABASE_URL=postgres://user:pass@host/db
VITE_STRIPE_SECRET_KEY=sk_live_xxx
VITE_JWT_SIGNING_SECRET=xxx
```

**Rule**: any variable containing `SECRET`, `PRIVATE`, `PASSWORD`, `TOKEN` (server-side token, not a public client ID) must **never** carry the `VITE_` prefix. If it's needed at build time only (e.g. a deploy-time API endpoint used to fetch config), read it in `vite.config.ts` via plain `process.env`, not via `import.meta.env`.

```typescript
// vite.config.ts — build-time-only value, never shipped to the client
export default defineConfig({
  build: {
    // process.env is available in vite.config.ts (Node context), never in client code
    outDir: process.env.DEPLOY_TARGET === 'staging' ? 'dist-staging' : 'dist',
  },
})
```

### Widening `envPrefix` (audit carefully)

```typescript
// ⚠️ Only widen envPrefix if every matching variable is genuinely public
export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_'],
})
```

Every variable matching **any** listed prefix is inlined into the client bundle. Treat a prefix change as a security review trigger, not a config tweak.

## `define()` — Compile-Time Constant Injection

`define` performs a literal text replacement at build time — values are inlined as-is into every matching occurrence across the bundle, with **no runtime indirection**. This makes it fundamentally unsuitable for secrets: unlike a server-issued token, a `define`-injected value cannot be rotated without a rebuild, and it is trivially extractable from the shipped JS.

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    // ✅ Public build metadata — safe to inline
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),

    // ❌ NEVER — this is plaintext in the shipped bundle, not a secret
    __API_SIGNING_SECRET__: JSON.stringify(process.env.SIGNING_SECRET),
  },
})
```

**Rules:**
- Always wrap `define` values with `JSON.stringify()` — passing a raw string injects it as literal JavaScript source, which is both a correctness bug and an injection risk if the value is attacker-influenced
- Reserve `define` for version strings, feature flags, and other values safe to be public and immutable until the next build
- Any value that must be rotatable, per-user, or confidential belongs behind an API call at runtime, never in `define`

## Content Security Policy — Multi-Page Apps

Each HTML entry registered in `build.rollupOptions.input` produces an independent page; CSP coverage must be verified **per entry**, not just for the main `index.html`.

```html
<!-- Every HTML entry (index.html, admin/index.html, docs/index.html, ...) -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  worker-src 'self';
  wasm-unsafe-eval 'self';
">
```

**Rules:**
- `worker-src` must explicitly allow `'self'` (or the actual origin) for module workers created via `new Worker(new URL(...))` — the default `script-src` fallback does not always cover worker script loading in every browser
- `wasm-unsafe-eval` (or `'unsafe-eval'` on older CSP levels) is required for WebAssembly compilation in some browsers — audit whether the target browser matrix actually needs it before adding it broadly
- Prefer setting CSP as an HTTP response header (server/CDN level) over a `<meta>` tag when possible — headers apply before any HTML parsing and support `Report-To`/`report-uri` for violation monitoring
- If entries share a CSP, generate the `<meta>` tag from a single template at build time (a small `vite-plugin-html`-style transform) rather than hand-copying it into every HTML file, to prevent drift

### Vite Dev Server Headers (dev-time hardening)

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp', // required if using SharedArrayBuffer
    },
  },
})
```

## Workers / WASM Sandboxing

### Worker Creation Pattern

```typescript
// ✅ Vite's supported pattern — statically analyzable, code-split correctly
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

// ❌ Never construct workers from dynamic strings or eval-based blobs
const worker = new Worker(URL.createObjectURL(new Blob([userSuppliedCode])))
```

Only the `new URL(..., import.meta.url)` form lets Vite statically analyze, bundle, and hash the worker script. Anything else bypasses the build pipeline and CSP `worker-src` protections.

### Minimal `postMessage` Surface

```typescript
// ❌ Passing the entire application state (including auth tokens) into a worker
worker.postMessage({ state: appStore.getState() })

// ✅ Pass only the data the worker actually needs to compute its result
worker.postMessage({ type: 'parse', payload: rawInput })
```

Workers run in a separate global scope but share the page's origin — a compromised or malicious third-party worker script has the same data-exfiltration surface as any other same-origin script. Treat the `postMessage` boundary as a trust boundary: minimize what crosses it.

### WASM Loading and Integrity

```typescript
// ✅ Same-origin WASM, bundled by Vite — integrity guaranteed by the build pipeline
import init, { compute } from './pkg/compute.wasm?init'
await init()

// ⚠️ Remote WASM — verify integrity explicitly, Vite cannot hash a runtime fetch
const resp = await fetch('https://cdn.example.com/compute.wasm', {
  integrity: 'sha384-<base64-hash>', // Subresource Integrity
})
const { instance } = await WebAssembly.instantiateStreaming(resp, imports)
```

**Rules:**
- Prefer bundling WASM modules with the `?init` suffix so Vite hashes and serves them from the same origin as the rest of the build
- If a WASM module must be fetched from a remote CDN, always pass an `integrity` option (Subresource Integrity) to `fetch` — never trust an unpinned remote binary
- If `SharedArrayBuffer` is used (e.g. threaded WASM), document the required `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` headers — `crossOriginIsolated` must be `true` at runtime or the feature silently fails

## Dependency Security

### Audit Commands

```bash
# Check for vulnerabilities
npm audit

# Update vulnerable packages (review the diff)
npm audit fix
```

### Lockfile Integrity

```bash
# Ensure lockfile is used as-is in CI
npm ci
```

## Security Checklist

### Development

- [ ] No secret ever carries the `VITE_` prefix (or custom `envPrefix`)
- [ ] `.env.local` / `.env.*.local` gitignored; `.env.example` committed with placeholder values
- [ ] `define()` only injects public, `JSON.stringify()`-wrapped constants
- [ ] Workers created via `new Worker(new URL(..., import.meta.url))`
- [ ] Remote WASM fetches use Subresource Integrity

### Build & Deploy

- [ ] Every multi-page HTML entry covered by a CSP (meta tag or HTTP header)
- [ ] `worker-src` and `wasm-unsafe-eval` reviewed in CSP if workers/WASM are used
- [ ] Dependencies audited for vulnerabilities (`npm audit`)
- [ ] Source maps disabled or access-restricted in production for proprietary code
- [ ] `crossOriginIsolated` requirements documented if `SharedArrayBuffer` is used

### Runtime

- [ ] `postMessage` payloads to/from workers minimized (no full app state, no tokens)
- [ ] HTTPS enforced for any remote WASM/asset fetch
- [ ] Security headers set on the dev server during local security testing (`server.headers`)
