---
description: Audit Vite project compliance with framework-agnostic best practices
model: haiku

---

# Vite Compliance Audit

You are an expert Vite auditor. Perform a comprehensive compliance check on this project, restricted to **framework-agnostic** Vite usage (vanilla JS/TS SPA, library authoring, multi-page apps, workers/WASM).

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## MISSION

Audit the project for compliance with Vite 8 best practices, TypeScript conventions, testing coverage, and build output correctness. Score across 4 fixed categories totaling 100 points.

## AUDIT CHECKLIST

### 1. Config & Architecture Vite (30 points)

```
[ ] Single vite.config.ts, no duplicated/conflicting config files
[ ] Project shape unambiguous (vanilla SPA / library / multi-page / workers-wasm)
[ ] resolve.alias used instead of deep relative imports
[ ] envPrefix respected — no secrets exposed via VITE_ prefix
[ ] Entry points (index.html, build.lib.entry, rollupOptions.input) match files on disk
[ ] Custom plugins named vite-plugin-<purpose> and typed
```

### 2. TypeScript & Qualité (20 points)

```
[ ] strict: true in tsconfig.json
[ ] vite-env.d.ts present with /// <reference types="vite/client" />
[ ] ImportMetaEnv extended for custom VITE_* variables
[ ] No implicit any in vite.config.ts or custom plugins
[ ] ESLint flat config (eslint.config.js) present and passing
```

### 3. Tests (25 points)

```
[ ] Vitest configured (vitest.config.ts or test block in vite.config.ts)
[ ] Coverage thresholds set (>= 80% statements/branches/functions/lines)
[ ] Library entry points covered by at least one smoke test
[ ] Custom Vite plugins have unit tests (transform/resolveId/load hooks)
[ ] Worker/WASM entries tested via Vitest Browser Mode or dedicated worker harness
```

### 4. Build Output & Performance (25 points)

```
[ ] npm run build succeeds without warnings
[ ] dist/ output matches package.json exports/main/module/types
[ ] Library: vite-plugin-dts generates accurate .d.ts alongside JS output
[ ] Bundle size within declared budget (chunkSizeWarningLimit respected)
[ ] Source maps configured deliberately (not accidentally shipped/omitted)
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE COMPLIANCE AUDIT
══════════════════════════════════════════════════════════════

📊 SUMMARY
──────────────────────────────────────────────────────────────
Total Score: XX/100
Status: ✅ COMPLIANT | ⚠️ NEEDS WORK | ❌ NON-COMPLIANT

⚙️ CONFIG & ARCHITECTURE VITE: XX/30
──────────────────────────────────────────────────────────────
[✓] Single vite.config.ts
[✗] Project shape ambiguous — build.lib and rollupOptions.input both set
    → Split into a library package and a demo app, or document the intent

📝 TYPESCRIPT & QUALITÉ: XX/20
──────────────────────────────────────────────────────────────
[✓] strict mode enabled
[✗] ImportMetaEnv not extended for VITE_FEATURE_FLAGS
    File: src/vite-env.d.ts

🧪 TESTS: XX/25
──────────────────────────────────────────────────────────────
[✓] Vitest configured with 80% thresholds
[✗] Custom plugin vite-plugin-inject-version has no tests
    File: src/plugins/injectVersion.ts

📦 BUILD OUTPUT & PERFORMANCE: XX/25
──────────────────────────────────────────────────────────────
[✓] Build succeeds without warnings
[✗] vite-plugin-dts output missing for src/utils/index.ts
    → Verify dts.entryRoot / include glob covers all public exports

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. [HIGH] Resolve project-shape ambiguity
2. [MEDIUM] Extend ImportMetaEnv typings
3. [MEDIUM] Add tests for custom plugins
4. [LOW] Verify vite-plugin-dts coverage for all entry points

══════════════════════════════════════════════════════════════
```

## PROCESS

1. Detect project shape (vanilla SPA / library / multi-page / workers-wasm) from package.json + vite.config.ts
2. Score Config & Architecture Vite (30 pts)
3. Score TypeScript & Qualité (20 pts)
4. Score Tests (25 pts)
5. Score Build Output & Performance (25 pts)
6. Generate compliance report with total score and prioritized recommendations
