---
description: Audit Vite project architecture and build configuration organization
---

# Vite Architecture Audit

You are an expert Vite architect. Analyze the project's build configuration and structure for correctness and maintainability, strictly within the framework-agnostic scope of this stack (vanilla SPA, library, multi-page app, worker/WASM).

> For Vite configured as a React/Vue/Angular/Svelte dev-server, use that stack's `check-architecture` command instead — this command covers **only** framework-agnostic Vite usage.

## MISSION

Detect which of the four project shapes the codebase implements, and validate it against the conventions for that shape.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## AUDIT AREAS

### 1. Project Shape Detection

```
[ ] Identify shape: vanilla-spa | library | multi-page | worker-wasm (or a combination)
[ ] index.html present at project root as a SOURCE file (not under public/) — vanilla-spa/multi-page
[ ] src/index.ts as the single public entry — library shape
[ ] build.rollupOptions.input is an object map — multi-page shape
[ ] worker/WASM entry points use import.meta.url / ?init — worker-wasm shape
```

### 2. vite.config.ts Structure

```
[ ] defineConfig used (typed config)
[ ] Functional form `({ mode, command }) => ({...})` used for env-dependent behavior
[ ] Key ordering follows convention (plugins, resolve, define, server, build, test)
[ ] No ad hoc process.env branching scattered across the file
```

### 3. Entry Points Configuration

```
[ ] Vanilla SPA: single index.html, <script type="module" src="/src/main.ts">
[ ] Library: build.lib.entry points to src/index.ts, formats include 'es' and 'cjs'
[ ] MPA: build.rollupOptions.input keys are stable, kebab-case, match folder/file names
[ ] Worker/WASM: `new Worker(new URL('./x.worker.ts', import.meta.url), { type: 'module' })` pattern used (no bare string URLs)
```

### 4. Custom Plugin Organization

```
[ ] Plugins live in vite-plugins/, named vite-plugin-{purpose}.ts
[ ] Each plugin implements one hook family / one concern
[ ] No unrelated logic inlined directly in vite.config.ts beyond ~15 lines
```

### 5. Dependency Externalization (library shape)

```
[ ] Peer dependencies declared in package.json AND in build.rollupOptions.external
[ ] package.json "exports" map covers both import and require conditions
[ ] "sideEffects": false set, unless the library genuinely has side-effectful modules
```

### 6. Output Structure Validation

```
[ ] dist/ is gitignored
[ ] Library output includes ES + CJS + .d.ts (vite-plugin-dts)
[ ] MPA output preserves stable chunk/asset names across builds
[ ] No framework (React/Vue/Angular/Svelte) code present in a project declared framework-agnostic
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE ARCHITECTURE AUDIT
══════════════════════════════════════════════════════════════

📊 ARCHITECTURE SCORE: XX/30

🧭 PROJECT SHAPE
──────────────────────────────────────────────────────────────
Detected Shape: [vanilla-spa | library | multi-page | worker-wasm | combination]
Status: ✅ Consistent with conventions | ⚠️ Partial drift | ❌ Non-conforming

Issues:
- index.html found under public/ instead of project root
  → Move to project root; Vite must parse and transform it

⚙️ VITE.CONFIG.TS STRUCTURE
──────────────────────────────────────────────────────────────
Status: ✅ Typed & ordered | ⚠️ Needs cleanup

Issues:
- process.env.NODE_ENV checked in 3 different places
  → Consolidate via the (mode, command) functional form

🎯 ENTRY POINTS
──────────────────────────────────────────────────────────────
Entries found: X
Correctly declared: X/X

Issues:
- worker instantiated with a bare string URL (`new Worker('./x.worker.ts')`)
  → Use `new Worker(new URL('./x.worker.ts', import.meta.url), { type: 'module' })`

🧩 CUSTOM PLUGINS
──────────────────────────────────────────────────────────────
Plugins found: X
Following naming convention: X/X

Issues:
- inline 40-line transform hook directly in vite.config.ts
  → Extract to vite-plugins/vite-plugin-{purpose}.ts

📦 DEPENDENCY EXTERNALIZATION (if library)
──────────────────────────────────────────────────────────────
Peer deps declared: X
Externalized in rollupOptions.external: X/X

Issues:
- "some-peer-lib" bundled into dist/ instead of externalized
  → Add to peerDependencies AND build.rollupOptions.external

📤 OUTPUT STRUCTURE
──────────────────────────────────────────────────────────────
Status: ✅ Clean | ⚠️ Issues found

Issues:
- dist/ tracked in git
  → Add to .gitignore

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
Priority 1: [Fix entry point declaration]
Priority 2: [Extract inline plugin logic]
Priority 3: [Externalize peer dependency]

══════════════════════════════════════════════════════════════
```

## PROCESS

1. Detect project shape from `vite.config.ts` and directory layout
2. Validate `vite.config.ts` structure and key ordering
3. Validate entry point declarations against the detected shape's convention
4. Review custom plugin organization
5. Review dependency externalization (library shape only)
6. Validate output structure
7. Generate architecture report with a score out of 30
