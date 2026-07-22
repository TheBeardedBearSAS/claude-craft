---
description: Validate build.lib output and vite-plugin-dts .d.ts generation for a Vite library
---

# Vite Library Build Audit

You are an expert in Vite library authoring. Validate that a library project's `build.lib` configuration and `vite-plugin-dts` output are correct and consumable.

> This command is specific to the library shape (Shape 2 in `02-architecture-vite.md`). For app/MPA/worker shapes, use `check-architecture.md` instead.

## MISSION

Confirm the library builds to ES + CJS + `.d.ts`, peer dependencies are correctly externalized, and the published package is actually importable by a consumer under both module systems.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## AUDIT AREAS

### 1. `build.lib` Configuration

```
[ ] build.lib.entry points to the single public entry (src/index.ts)
[ ] build.lib.formats includes both 'es' and 'cjs' (unless the library is genuinely ESM-only by design)
[ ] build.lib.fileName produces predictable, versioned-free output names
[ ] build.lib.name set if a 'umd'/'iife' global build is also required
```

### 2. `vite-plugin-dts` Configuration

```
[ ] vite-plugin-dts included in the plugins array
[ ] rollupTypes: true (or equivalent) used to roll up declarations into a single .d.ts, avoiding leaked internal type paths
[ ] tsconfigPath points at the correct tsconfig (declaration-friendly settings)
[ ] Generated dist/*.d.ts actually matches the runtime public API (no stale/missing exports)
```

### 3. Dependency Externalization

```
[ ] Every peer dependency appears in BOTH package.json "peerDependencies" AND build.rollupOptions.external
[ ] No peer dependency's code is present in the built dist/ bundle (verify by inspecting dist/ output or the bundle-visualizer report)
[ ] Regular (non-peer) dependencies are intentionally bundled, not accidentally externalized
```

### 4. `package.json` Exports Map

```
[ ] "type": "module" set (or intentionally omitted for a CJS-first library)
[ ] "exports" maps both "import" and "require" conditions to the correct files
[ ] "main"/"module"/"types" fields kept in sync with "exports" for older tooling
[ ] "files": ["dist"] restricts the published tarball to build output only
[ ] "sideEffects": false set, unless specific modules have genuine side effects (then list them explicitly)
```

### 5. Consumability Smoke Test

```
[ ] A test (or `npm pack` + local install in a throwaway project) confirms:
    - `import { X } from 'my-lib'` resolves against the ESM build
    - `const { X } = require('my-lib')` resolves against the CJS build
    - TypeScript consumers get correct types with no `any` fallback
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE LIBRARY BUILD AUDIT
══════════════════════════════════════════════════════════════

📊 LIBRARY BUILD SCORE: XX/100

📦 BUILD.LIB CONFIGURATION
──────────────────────────────────────────────────────────────
Status: ✅ CORRECT | ⚠️ ISSUES FOUND

Findings:
[⚠️] formats: ['es'] only — no CJS output
    File: vite.config.ts
    Fix: Add 'cjs' to build.lib.formats unless the library is intentionally ESM-only

📝 VITE-PLUGIN-DTS
──────────────────────────────────────────────────────────────
Status: ✅ CORRECT | ⚠️ ISSUES FOUND

Findings:
[⚠️] rollupTypes not enabled — dist/*.d.ts references internal src/ paths
    Fix: Set rollupTypes: true in the vite-plugin-dts options

📤 DEPENDENCY EXTERNALIZATION
──────────────────────────────────────────────────────────────
Status: ✅ CLEAN | ❌ LEAKS FOUND

Findings:
[🔴 HIGH] "some-peer-lib" bundled into dist/my-lib.js
    Fix: Add to peerDependencies and build.rollupOptions.external

🗂️ PACKAGE.JSON EXPORTS MAP
──────────────────────────────────────────────────────────────
Status: ✅ CORRECT | ⚠️ INCOMPLETE

Findings:
[⚠️] "exports" missing the "require" condition
    Fix: Add "require": "./dist/my-lib.cjs" alongside "import"

🧪 CONSUMABILITY SMOKE TEST
──────────────────────────────────────────────────────────────
Status: ✅ PASS | ❌ FAIL | ⚠️ NOT PRESENT

Findings:
[✗] No test imports from dist/ after build
    Fix: Add test/build-output.test.ts (see 07-testing-vite.md)

📋 ACTION ITEMS
──────────────────────────────────────────────────────────────
1. [CRITICAL] Externalize leaked peer dependency
2. [HIGH] Enable rollupTypes for clean .d.ts output
3. [MEDIUM] Complete the exports map (require condition)
4. [LOW] Add a build-output consumability test

══════════════════════════════════════════════════════════════
```

## COMMANDS

```bash
# Build and inspect output
npm run build
ls -la dist/

# Verify no peer dependency leaked into the bundle
grep -l "some-peer-lib" dist/*.js || echo "clean"

# Verify the published file list before release
npm pack --dry-run

# Smoke test both module systems
node -e "require('./dist/my-lib.cjs')"
node --input-type=module -e "import('./dist/my-lib.js').then(m => console.log(Object.keys(m)))"
```

## REFERENCE CONFIG

```typescript
// vite.config.ts — minimal correct library config
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `my-lib.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['some-peer-lib'],
    },
  },
})
```
