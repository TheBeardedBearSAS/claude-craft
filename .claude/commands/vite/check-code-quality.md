---
description: Analyze Vite project code quality with ESLint, TypeScript, and build diagnostics
model: haiku

---

# Vite Code Quality Audit

You are an expert build-tooling code quality analyst. Perform comprehensive quality checks on a framework-agnostic Vite project.

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## MISSION

Analyze code quality across `vite.config.ts`, custom plugins, and application/library source with focus on ESLint flat config, TypeScript strictness, and Vite-specific footguns.

## QUALITY CHECKS

### 1. ESLint Analysis

Run and analyze ESLint output:
```bash
npm run lint
```

Key rules to verify:
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/explicit-function-return-type` (recommended for public plugin APIs)
- `import/no-relative-packages`
- `no-restricted-globals` (`process` banned in browser-targeted code)

### 2. TypeScript Analysis

Run type checking:
```bash
tsc --noEmit
```

Verify:
- No implicit any
- `import.meta.env` typed via `vite-env.d.ts` (`/// <reference types="vite/client" />`)
- Ambient types for `?worker`, `?raw`, `?url` import suffixes declared or provided by `vite/client`
- Generic types used appropriately in custom plugins (`Plugin<Options>`)

### 3. Code Complexity

Analyze for:
- Functions > 30 lines
- `vite.config.ts` > 150 lines (extract to `config/*.ts` helpers)
- Cyclomatic complexity > 10
- Deep nesting (> 3 levels) in plugin hooks (`transform`, `resolveId`, `load`)

### 4. Vite-Specific Quality

Check for:
- `import.meta.env.MODE` / `DEV` / `PROD` used instead of hand-rolled `process.env.NODE_ENV` checks
- Dynamic `import()` used for code splitting instead of static barrel imports of the whole app
- No synchronous `fs` reads inside `transform`/`load` hooks blocking the dev server
- `optimizeDeps.include` / `exclude` justified with a comment (not cargo-culted)

### 5. Performance Patterns

Identify:
- Missing `build.target` appropriate for the deployment (avoid over-transpiling to ES5 unless required)
- Barrel files (`index.ts` re-exporting hundreds of modules) that defeat tree-shaking
- Unnecessary `vite-plugin-*` duplicating built-in Vite features (e.g. a manual CSS injector when `?inline` suffix suffices)
- Missing `sideEffects: false` in `package.json` for library builds

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE CODE QUALITY REPORT
══════════════════════════════════════════════════════════════

📊 QUALITY SCORE: XX/100

🔍 ESLINT ANALYSIS
──────────────────────────────────────────────────────────────
Errors: X
Warnings: X
Files with issues: X

Top Issues:
1. @typescript-eslint/no-explicit-any (4 occurrences)
   - src/plugins/injectVersion.ts:18
   - vite.config.ts:32

2. no-restricted-globals (process) (2 occurrences)
   - src/main.ts:5

📝 TYPESCRIPT CHECK
──────────────────────────────────────────────────────────────
Status: ✅ PASS | ❌ FAIL
Type Errors: X

Issues:
- src/main.ts:10
  Property 'VITE_API_URL' does not exist on type 'ImportMetaEnv'
  → Extend ImportMetaEnv in vite-env.d.ts

📏 CODE COMPLEXITY
──────────────────────────────────────────────────────────────
Large Functions (>30 lines): X
Oversized vite.config.ts (>150 lines): Yes/No
High Complexity (>10): X

Files to refactor:
- vite.config.ts (210 lines)
  → Extract build.rollupOptions.input map to config/entries.ts

🎯 VITE-SPECIFIC ISSUES
──────────────────────────────────────────────────────────────
[⚠️] process.env.NODE_ENV used instead of import.meta.env.MODE
     File: src/main.ts:5
     → Replace with import.meta.env.DEV / import.meta.env.PROD

[⚠️] Synchronous fs.readFileSync in a transform hook
     File: src/plugins/injectVersion.ts:12
     → Move to buildStart and cache the result

⚡ PERFORMANCE ISSUES
──────────────────────────────────────────────────────────────
[⚠️] Barrel file re-exporting 80+ modules
     File: src/components/index.ts
     → Import directly from source modules to preserve tree-shaking

[⚠️] Missing sideEffects: false
     File: package.json
     → Add for library builds to enable consumer-side tree-shaking

📋 ACTION ITEMS
──────────────────────────────────────────────────────────────
1. [CRITICAL] Fix TypeScript env typing
2. [HIGH] Replace process.env with import.meta.env
3. [MEDIUM] Split oversized vite.config.ts
4. [LOW] Add sideEffects: false for library packages

══════════════════════════════════════════════════════════════
```

## COMMANDS TO RUN

```bash
# Full quality check
npm run lint && tsc --noEmit

# With auto-fix
npm run lint -- --fix

# Format check (if Prettier configured)
npx prettier --check .
```
