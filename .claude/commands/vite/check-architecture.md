---
description: Audit Vite project architecture and build configuration organization
model: haiku

---

# Vite Architecture Audit

You are an expert Vite build architect. Analyze the project architecture for scalability, maintainability, and correct use of Vite's build model.

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## MISSION

Evaluate the project's Vite configuration, entry-point organization, and adherence to one of the four supported project shapes: vanilla SPA, library, multi-page app, or workers/WASM.

## AUDIT AREAS

### 1. Project Shape Detection

```
[ ] Exactly one project shape identified (vanilla SPA | library | multi-page | workers/WASM)
[ ] No mixing of build.lib and build.rollupOptions.input without justification
[ ] index.html present at project root (SPA/MPA) or absent by design (library)
[ ] package.json "type": "module" set
```

### 2. vite.config.ts Organization

```
[ ] Single source of truth: vite.config.ts (no scattered inline overrides)
[ ] resolve.alias used instead of relative "../../../" imports
[ ] envPrefix / import.meta.env usage scoped and documented
[ ] Environment-specific config via defineConfig(({ mode }) => ...) instead of duplicated files
[ ] Plugins ordered correctly (order matters: transform plugins before dts/checker plugins)
```

### 3. Entry Points

```
[ ] SPA: single index.html entry point, no orphaned HTML files
[ ] MPA: build.rollupOptions.input maps each page explicitly (no glob magic without review)
[ ] Library: build.lib.entry points to src/index.ts (or per sub-path exports)
[ ] Workers: worker entries use ?worker / ?worker&inline suffix explicitly, not ad-hoc new Worker(string)
```

### 4. Build Output Structure

```
[ ] dist/ structure matches project shape (nested for MPA, flat ESM+CJS for library)
[ ] Source maps configured deliberately (on for library, opt-in for SPA prod)
[ ] Static assets under public/ vs processed assets under src/assets/ correctly separated
[ ] base path configured for non-root deployments
```

### 5. Plugin Architecture

```
[ ] Custom plugins named vite-plugin-<purpose> (npm convention)
[ ] Plugins implement enforce: 'pre' | 'post' only when required
[ ] No duplicated logic between a custom plugin and an existing official/community plugin
[ ] Plugin options typed (no untyped `any` config objects)
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE ARCHITECTURE AUDIT
══════════════════════════════════════════════════════════════

📊 ARCHITECTURE SCORE: XX/100

🧭 PROJECT SHAPE
──────────────────────────────────────────────────────────────
Detected Shape: Vanilla SPA | Library | Multi-Page | Workers/WASM
Status: ✅ Consistent | ⚠️ Mixed signals | ❌ Ambiguous

Issues:
- build.lib present alongside build.rollupOptions.input
  → Pick one shape; split into two packages if both are genuinely needed

⚙️ VITE.CONFIG.TS ORGANIZATION
──────────────────────────────────────────────────────────────
Status: ✅ Well organized | ⚠️ Needs improvement | ❌ Poor

Current Structure:
vite.config.ts        ✅ Single source of truth
├── resolve.alias      ✅ "@/*" configured
└── plugins[]          ⚠️ 2 plugins duplicate functionality

Issues:
- vite-plugin-html and a hand-rolled HTML transform both rewrite index.html
  → Remove the hand-rolled transform, keep the plugin

🚪 ENTRY POINTS
──────────────────────────────────────────────────────────────
Entries Found: X
Shape-Consistent: ✅ Yes | ❌ No

Issues:
- pages/legacy.html not registered in rollupOptions.input
  → Add it explicitly or delete the orphaned file

📦 BUILD OUTPUT
──────────────────────────────────────────────────────────────
dist/ Structure: ✅ Matches shape | ⚠️ Inconsistent
Sourcemaps: ✅ Deliberate | ⚠️ Default (unreviewed)

Issues:
- Library build emits only ESM, package.json declares "main" (CJS)
  → Add a CJS build target or fix package.json exports

🔌 PLUGIN ARCHITECTURE
──────────────────────────────────────────────────────────────
Custom Plugins: X
Naming Convention: ✅ vite-plugin-* | ❌ Inconsistent

Issues:
- src/plugins/injectVersion.ts not packaged as vite-plugin-inject-version
  → Rename and move to a dedicated plugin file for reuse

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
Priority 1: Resolve project-shape ambiguity (lib vs rollupOptions.input)
Priority 2: Register all HTML entries explicitly for MPA
Priority 3: Align dist/ output with package.json exports

══════════════════════════════════════════════════════════════
```

## PROCESS

1. Detect project shape from package.json + vite.config.ts (lib / index.html count / worker imports)
2. Analyze vite.config.ts structure and plugin ordering
3. Map declared entry points against files on disk
4. Review dist/ output structure and package.json `exports`/`main`/`module`/`types` fields
5. Audit custom plugin naming and responsibility boundaries
6. Generate architecture report
