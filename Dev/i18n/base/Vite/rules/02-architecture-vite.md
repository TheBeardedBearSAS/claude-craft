# Vite Architecture Guidelines

> For Vite configured as a React/Vue/Angular/Svelte dev-server, see that stack's `06-tooling.md` — this document covers **only** framework-agnostic Vite usage: vanilla SPA, library authoring, multi-page apps, and worker/WASM entry points.

## Architecture Pattern

**Pattern**: Framework-agnostic build tool — Vite here is used purely as a dev-server + bundler, with no component model, no JSX, no reactivity system of its own. Four project shapes are supported; pick the one matching the project and do not mix conventions from the others.

| Shape | When to use |
|-------|-------------|
| **Vanilla SPA** | Single HTML page, plain TS/JS app logic, DOM manipulated directly or via a micro-library |
| **Library** | npm package consumed by other projects (ES + CJS builds, `.d.ts`) |
| **Multi-Page App (MPA)** | Several independent HTML entry points sharing build config (marketing site, docs + app, admin + public) |
| **Worker/WASM** | Offloading CPU-heavy work to a Web Worker and/or a WebAssembly module |

A single project can combine shapes (e.g. an MPA that also spawns a worker), but each shape's core convention below must still be respected.

---

## Shape 1 — Vanilla SPA

`index.html` is a **source file at the project root**, not a static asset in `public/`. Vite parses it, resolves `<script type="module" src="/src/main.ts">`, and injects the transformed bundle at build time.

```
project-root/
├── index.html                  # Source file — parsed and transformed by Vite
├── public/                     # Copied as-is to dist/ root, NOT processed
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── main.ts                 # Entry point referenced from index.html
│   ├── style.css
│   ├── counter.ts
│   └── vite-env.d.ts           # /// <reference types="vite/client" />
├── vite.config.ts
├── tsconfig.json
└── package.json
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**Rule**: never move `index.html` into `public/` — Vite would then serve it unprocessed (no module graph, no HMR, no asset hashing).

---

## Shape 2 — Library Authoring

Published as an npm package. Vite bundles `src/index.ts` in **library mode** (`build.lib`), producing ES + CJS outputs plus type declarations via `vite-plugin-dts`. Peer dependencies (e.g. a host framework, if the library happens to wrap one) are excluded from the bundle via `rollupOptions.external`.

```
my-lib/
├── src/
│   ├── index.ts                # Single public entry (build.lib.entry)
│   ├── core/
│   │   └── engine.ts
│   └── utils/
│       └── format.ts
├── dist/                       # Build output — do not commit
│   ├── my-lib.js               # ES build
│   ├── my-lib.cjs              # CJS build
│   ├── my-lib.d.ts             # Rolled-up type declarations
│   └── my-lib.css              # extracted CSS, if any
├── vite.config.ts              # build.lib + vite-plugin-dts
├── tsconfig.json
└── package.json                 # "exports" map, "peerDependencies", "sideEffects": false
```

`package.json` exports map (consumers resolve ESM or CJS correctly):
```json
{
  "name": "my-lib",
  "type": "module",
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "types": "./dist/my-lib.d.ts",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs",
      "types": "./dist/my-lib.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": false
}
```

**Rule**: never bundle a peer dependency into the library output — declare it in both `peerDependencies` and `build.rollupOptions.external`, otherwise consumers end up with duplicate copies (and duplicate global state) of that dependency.

---

## Shape 3 — Multi-Page App (MPA)

Multiple independent HTML entry points, each with its own module graph, sharing one `vite.config.ts`. Configured via `build.rollupOptions.input` — an object mapping a page name to its HTML file.

```
project-root/
├── index.html                  # entry: "main"
├── about.html                  # entry: "about"
├── admin/
│   └── index.html               # entry: "admin"
├── src/
│   ├── main.ts                  # loaded by index.html
│   ├── about.ts                 # loaded by about.html
│   ├── admin/
│   │   └── admin.ts             # loaded by admin/index.html
│   └── shared/
│       └── nav.ts               # code shared across pages
├── vite.config.ts
└── package.json
```

`vite.config.ts` (input map):
```typescript
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
})
```

**Rule**: keep the input map keys stable — they become the chunk/asset names under `dist/assets/`. Renaming a key changes output filenames and can break external links to prebuilt assets (e.g. an email template pointing at `dist/assets/admin-*.js`).

---

## Shape 4 — Worker/WASM Entry Points

Web Workers are declared with the `new URL(..., import.meta.url)` pattern so Vite can statically detect and bundle them as separate chunks. WebAssembly modules are imported with the `?init` suffix, which returns an async factory instead of raw bytes.

```
project-root/
├── index.html
├── src/
│   ├── main.ts                  # spawns the worker, calls the WASM init
│   ├── heavy-task.worker.ts      # runs inside the Worker realm
│   └── wasm/
│       ├── image-filter.wasm
│       └── image-filter.ts       # thin wrapper around the ?init import
├── vite.config.ts
└── package.json
```

Spawning a worker:
```typescript
// src/main.ts
const worker = new Worker(
  new URL('./heavy-task.worker.ts', import.meta.url),
  { type: 'module' }
)
worker.postMessage({ cmd: 'start' })
worker.onmessage = (e) => console.log('result:', e.data)
```

Loading a WASM module:
```typescript
// src/wasm/image-filter.ts
import initImageFilter from './image-filter.wasm?init'

export async function loadImageFilter() {
  const instance = await initImageFilter({
    // imports object, if the module requires host functions
  })
  return instance.exports
}
```

**Rule**: never `new Worker('./heavy-task.worker.ts')` with a bare string — the URL must be built with `import.meta.url` so Vite's static analysis can find, transform, and emit the worker as its own chunk. A bare string works in dev (served raw) but silently fails after `vite build`.

---

## Key Architecture Principles

### 1. Single Responsibility per Shape
- Do not let a "library" project accumulate an `index.html` dev harness inside `src/` — keep a separate `playground/` or `demo/` folder with its own `vite.config.ts` if a local preview is needed.

### 2. Explicit Entry Points
- Every HTML entry, worker, and WASM module must be reachable from the module graph via a static, analyzable reference (`rollupOptions.input`, `new URL(..., import.meta.url)`, `?init`). Dynamic string concatenation defeats Vite's static analysis.

### 3. Externalize What You Don't Own
- Libraries externalize peer dependencies; apps do not — this is the one place library and app configs diverge (see `03-coding-standards.md`).

### 4. One Plugin, One Concern
- Custom Vite plugins (`vite-plugin-*`) each implement one transform/hook family. Compose several small plugins instead of one plugin with many unrelated hooks.

### 5. Config as Code
- `vite.config.ts` is fully typed (`defineConfig`), and environment-dependent behavior is expressed via the `({ mode, command }) => ...` functional form, never via ad hoc `process.env` branching scattered across the file.
