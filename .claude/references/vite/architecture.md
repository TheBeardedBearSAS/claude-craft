# Vite Architecture Guidelines (Framework-Agnostic)

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## Architecture Pattern

**Pattern**: Vite is a build tool and dev server, not an application framework. There is no single "correct" project structure — instead there are **four distinct project shapes**, each with its own `vite.config.ts` conventions. A project should commit to exactly one shape; mixing them (e.g. `build.lib` alongside `build.rollupOptions.input` for an app) is a compliance smell (see `check-compliance.md`).

## Shape 1 — Vanilla SPA

`index.html` is the **source entry point** (not a static template copied verbatim). Vite parses it, resolves `<script type="module">` references, and rewrites asset paths at build time.

### Project Structure

```
project/
├── index.html                 # Source entry — Vite parses & transforms this file
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vite-env.d.ts               # /// <reference types="vite/client" />
├── public/                     # Copied as-is to dist/ root (favicon, robots.txt)
│   └── favicon.svg
└── src/
    ├── main.ts                 # Referenced from index.html
    ├── style.css
    ├── modules/
    │   ├── router.ts           # Hand-rolled or micro-router, framework-agnostic
    │   └── state.ts
    └── components/              # Web Components (custom elements) or plain DOM modules
        └── app-header.ts
```

```typescript
// vite.config.ts — vanilla SPA
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
```

## Shape 2 — Library Authoring

`build.lib` compiles a single (or multi-entry) public API into ESM/CJS bundles, paired with `vite-plugin-dts` for `.d.ts` generation. `index.html` is optional — kept only for local demo/dev, never published.

### Project Structure

```
my-lib/
├── index.html                 # Optional — local demo only, not part of the package
├── package.json                # "main"/"module"/"types"/"exports" point into dist/
├── tsconfig.json
├── vite.config.ts               # build.lib + vite-plugin-dts
├── vitest.config.ts
└── src/
    ├── index.ts                 # Single public entry — everything else is an implementation detail
    ├── greet.ts
    ├── greet.test.ts
    └── internal/                 # Not re-exported from index.ts
        └── format.ts

dist/                              # Generated — not committed
├── my-lib.js                     # ESM output
├── my-lib.cjs                    # CJS output
└── my-lib.d.ts                   # Bundled type declarations (vite-plugin-dts rollupTypes: true)
```

```typescript
// vite.config.ts — library
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ include: ['src'], rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `my-lib.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // Peer dependencies must be externalized, never bundled
      external: [],
    },
  },
});
```

## Shape 3 — Multi-Page App (MPA)

`build.rollupOptions.input` maps multiple HTML entries explicitly. Each page gets its own bundle graph; shared modules are automatically deduplicated into common chunks by Rolldown.

### Project Structure

```
project/
├── index.html                   # / (main entry)
├── admin/
│   └── index.html               # /admin/
├── docs/
│   └── index.html               # /docs/
├── vite.config.ts
└── src/
    ├── main.ts                  # Referenced from index.html
    ├── admin/
    │   └── main.ts               # Referenced from admin/index.html
    ├── docs/
    │   └── main.ts               # Referenced from docs/index.html
    └── shared/                   # Deduplicated across pages by the bundler
        └── api-client.ts
```

```typescript
// vite.config.ts — multi-page app
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        docs: resolve(__dirname, 'docs/index.html'),
      },
    },
  },
});
```

**Key rule**: every HTML file under the project root that is meant to be built **must** appear in `rollupOptions.input` — Vite does not auto-discover HTML files outside the configured root.

## Shape 4 — Workers / WASM

Dedicated entries for Web Workers and WebAssembly modules, using Vite's built-in import-suffix conventions rather than ad-hoc bundling.

### Project Structure

```
project/
├── index.html
├── vite.config.ts
└── src/
    ├── main.ts                   # Spawns workers, loads WASM
    ├── workers/
    │   ├── parser.worker.ts       # Imported with `?worker`
    │   └── inline.worker.ts       # Imported with `?worker&inline` (bundled as a string)
    └── wasm/
        ├── compute/
        │   └── compute.wasm       # Imported with `?init`
        └── loadCompute.ts
```

```typescript
// src/main.ts — worker entries
import ParserWorker from './workers/parser.worker?worker';

const worker = new ParserWorker();
worker.postMessage({ type: 'parse', payload: 'raw-input' });
worker.onmessage = (e) => console.log(e.data);
```

```typescript
// src/wasm/loadCompute.ts — WASM entries
import init, { compute } from './compute/compute.wasm?init';

export async function loadCompute() {
  const instance = await init();
  return compute;
}
```

```typescript
// vite.config.ts — workers/WASM
import { defineConfig } from 'vite';

export default defineConfig({
  worker: {
    format: 'es', // ESM workers — required for code-split worker chunks
  },
});
```

## Key Architecture Principles

### 1. One Shape Per Project
A single `vite.config.ts` should express exactly one of the four shapes above. If a repository genuinely needs both a library and a demo app, split them into a monorepo with two independent Vite configs rather than merging `build.lib` and `rollupOptions.input` in one config.

### 2. `index.html` as Source, Not Static Asset
Across every shape except pure libraries, `index.html` is compiled by Vite — script/link tags are resolved, hashed, and injected at build time. Never hand-write a `dist/index.html` post-build; let Vite own it.

### 3. Explicit Entry Points
Multi-page apps and libraries must declare every entry explicitly (`rollupOptions.input`, `build.lib.entry`). Relying on directory scanning/globbing for entries makes the build non-deterministic and harder to audit.

### 4. `public/` vs `src/assets/`
- `public/` — copied byte-for-byte to `dist/` root, referenced by absolute path (`/favicon.svg`), **not** processed or hashed. Use for files that must keep a stable name (robots.txt, manifest.json).
- `src/assets/` (or any path under `src/`) — imported from JS/TS/CSS, processed, hashed, and tree-shaken if unused.

### 5. Type Safety
- `vite-env.d.ts` with `/// <reference types="vite/client" />` for `import.meta.env` typing
- `ImportMetaEnv` extended for every custom `VITE_*` variable
- Library public APIs fully typed; `vite-plugin-dts` output reviewed as part of the build, not an afterthought
