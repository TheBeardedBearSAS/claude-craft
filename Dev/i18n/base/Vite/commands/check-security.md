---
description: Security audit for Vite build configuration (env leakage, CSP, WASM sandboxing)
---

# Vite Security Audit

You are an expert Vite security auditor. Perform a comprehensive security analysis of a framework-agnostic Vite project's build configuration.

> For Vite configured as a React/Vue/Angular/Svelte dev-server, use that stack's `check-security` command instead — this command covers **only** framework-agnostic Vite usage.

## MISSION

Identify security vulnerabilities specific to Vite's build/env model: `envPrefix`/`define()` secret leakage, CSP gaps across multi-page entries, WASM sandboxing, and worker message handling.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## SECURITY CHECKS

### 1. Env / `define()` Secret Leakage

Scan for:
- Any `.env*` key matching `VITE_` (or a custom `envPrefix`) that looks like a secret (key, token, password, private)
- `define()` entries built from `process.env.*` without confirming the value is meant to be public
- Hardcoded secrets in `src/` or `vite.config.ts`

```bash
grep -rniE "VITE_.*_(SECRET|KEY|TOKEN|PASSWORD)" .env* 2>&1 || true
grep -rn "define:" vite.config.ts
```

### 2. CSP Coverage Across Entries (multi-page shape)

Verify:
- Every HTML entry point (`index.html`, `admin/index.html`, `about.html`, ...) has equivalent CSP protection
- CSP is enforced at the server/CDN level for production, not only via the dev-server `server.headers`
- `frame-ancestors`, `base-uri`, `script-src` are explicitly restrictive (no bare `*`)

### 3. WASM Sandboxing

Check:
- Cross-origin isolation headers (`COOP`/`COEP`) present if the WASM module uses threads/`SharedArrayBuffer`
- CSP includes `wasm-unsafe-eval` if WebAssembly compilation is used
- The imports object passed to the WASM instance exposes only the minimum required host functions

### 4. Worker Message Validation

Check:
- `onmessage` handlers validate the shape/type of incoming data before acting on it
- No `eval`/`Function()` constructed from worker message payloads
- Cross-origin `postMessage` (if any) checks `event.origin`

### 5. Dependency Security

```bash
npm audit --omit=dev --audit-level=moderate
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE SECURITY AUDIT
══════════════════════════════════════════════════════════════

📊 SECURITY SCORE: XX/25
Risk Level: 🟢 LOW | 🟡 MEDIUM | 🔴 HIGH | ⚫ CRITICAL

🔑 ENV / DEFINE() LEAKAGE
──────────────────────────────────────────────────────────────
Status: ✅ SECURE | ⚠️ RISKS FOUND | ❌ VULNERABLE

Findings:
[⚫ CRITICAL] Secret exposed via VITE_ prefix
    File: .env
    Code: VITE_STRIPE_SECRET_KEY=sk_live_xxx
    Fix: Rename without VITE_ prefix and move usage server-side; never reference from src/

🌐 CSP COVERAGE (multi-page)
──────────────────────────────────────────────────────────────
Status: ✅ CONSISTENT | ⚠️ PARTIAL | ❌ MISSING

Findings:
[🟡 MEDIUM] admin/index.html missing CSP meta tag present on index.html
    Fix: Apply CSP uniformly via server headers, not per-page meta tags

🧬 WASM SANDBOXING
──────────────────────────────────────────────────────────────
Status: ✅ SECURE | ⚠️ RISKS FOUND | ❌ MISCONFIGURED

Findings:
[🟡 MEDIUM] SharedArrayBuffer used without COOP/COEP headers
    File: vite.config.ts
    Fix: Add Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp

⚙️ WORKER MESSAGE VALIDATION
──────────────────────────────────────────────────────────────
Status: ✅ VALIDATED | ⚠️ RISKS FOUND

Findings:
[🟡 MEDIUM] onmessage handler trusts payload without shape validation
    File: src/heavy-task.worker.ts:5
    Fix: Validate `cmd` against an allow-list before acting on it

📦 DEPENDENCY AUDIT
──────────────────────────────────────────────────────────────
Total Dependencies: XX
Vulnerabilities Found: X

[🔴 HIGH] some-package < X.Y.Z
    Fix: npm update some-package

📋 ACTION ITEMS
──────────────────────────────────────────────────────────────
Priority 1 (CRITICAL):
  - Remove secrets from VITE_-prefixed env vars / define()

Priority 2 (HIGH):
  - Update vulnerable dependencies

Priority 3 (MEDIUM):
  - Apply CSP consistently across all HTML entries
  - Add COOP/COEP if WASM threads are used

Priority 4 (LOW):
  - Harden worker message validation

══════════════════════════════════════════════════════════════
```

## COMMANDS

```bash
# Audit dependencies
npm audit --omit=dev --audit-level=moderate

# Check for secrets in env-exposed variables
grep -rniE "VITE_.*_(SECRET|KEY|TOKEN|PASSWORD)" .env*

# Check for define() usage
grep -n "define:" vite.config.ts
```

## SECURITY CHECKLIST

```
[ ] No secret referenced via import.meta.env.VITE_* or define()
[ ] Custom envPrefix (if any) reviewed for over-matching
[ ] CSP applied consistently across every HTML entry (MPA)
[ ] COOP/COEP present if WASM uses threads/SharedArrayBuffer
[ ] CSP includes wasm-unsafe-eval if WebAssembly is used
[ ] Worker onmessage handlers validate payload shape
[ ] Dependencies audited, no moderate+ vulnerabilities
[ ] Source maps disabled or private in production builds
```
