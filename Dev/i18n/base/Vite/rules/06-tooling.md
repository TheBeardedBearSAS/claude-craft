# Vite Tooling

> For Vite configured as a React/Vue/Angular/Svelte dev-server, see that stack's `06-tooling.md` — this document covers **only** framework-agnostic Vite usage.

## Scaffolding: `npm create vite@latest`

Only the framework-agnostic templates are relevant to this stack. Do not scaffold with `react`, `vue`, `svelte`, `angular`, `preact`, `solid`, or `qwik` templates here — those belong to their own stack's tooling doc.

| Template | Use case |
|----------|----------|
| `vanilla` | Plain JavaScript SPA, no build-time types |
| `vanilla-ts` | Plain TypeScript SPA (**default recommendation**) |
| `lit` | Web Components via Lit, JavaScript |
| `lit-ts` | Web Components via Lit, TypeScript |

```bash
# Interactive
npm create vite@latest

# Non-interactive — recommended for scripting/CI
npm create vite@latest my-app -- --template vanilla-ts

# Other relevant templates
npm create vite@latest my-app -- --template vanilla
npm create vite@latest my-app -- --template lit-ts
npm create vite@latest my-app -- --template lit
```

After scaffolding a **library**, discard the generated `index.html`/dev harness pattern in favor of the library layout described in `02-architecture-vite.md` — `create vite` templates always scaffold an app shape, never a library shape, so library projects need manual `vite.config.ts` adjustments (`build.lib`, `vite-plugin-dts`, `rollupOptions.external`).

## Environment API (Vite 6+)

Vite's **Environment API** decouples the dev server from a single fixed "browser" target: a project can define multiple named *environments* (e.g. `client`, `ssr`, `worker`), each with its own module graph, transform pipeline, and resolve conditions. For the framework-agnostic shapes covered here, the default `client` environment is almost always sufficient — reach for a custom environment only when a build genuinely needs a second, differently-resolved module graph in the same dev server process (for example, building both a browser bundle and a Node-targeted worker bundle from one `vite dev` session). Most vanilla-SPA, library, MPA, and worker/WASM projects never need to touch this API directly; it is documented here so its existence doesn't cause a project to reach for a heavier multi-config workaround when one `vite.config.ts` and the default environment already cover the need.

## Plugin System Basics

A Vite plugin is a plain object (or a function returning one) implementing a subset of Rollup's plugin hooks plus Vite-specific ones. The hooks used most often outside of a framework integration:

| Hook | Purpose |
|------|---------|
| `config` | Mutate/merge the resolved config before it's finalized |
| `configResolved` | Read the final, merged config (read-only) |
| `configureServer` | Attach middleware to the dev server (`server.middlewares.use(...)`) |
| `resolveId` | Customize module resolution (virtual modules, aliases) |
| `load` | Provide the source for a module id (commonly paired with `resolveId` for virtual modules) |
| `transform` | Rewrite a module's code (codegen, source-to-source transforms) |
| `buildStart` / `buildEnd` | Build lifecycle hooks (both dev and build) |
| `generateBundle` | Inspect/modify the final bundle (build only, Rollup/Rolldown hook) |

```typescript
// Minimal virtual-module plugin
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:app-version'
const RESOLVED_ID = '\0' + VIRTUAL_ID // \0 prefix = "don't let other plugins touch this"

export function appVersionPlugin(version: string): Plugin {
  return {
    name: 'vite-plugin-app-version',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(version)}`
    },
  }
}
```

`enforce: 'pre' | 'post'` controls ordering relative to core/user plugins; `apply: 'build' | 'serve'` restricts a plugin to one mode only.

## Hot Module Replacement (HMR)

Vite's dev server keeps a module's state alive across edits via `import.meta.hot`. For framework-agnostic code, HMR must be wired manually (no framework runtime does it automatically):

```typescript
// src/counter.ts
export function setupCounter(el: HTMLButtonElement) {
  let count = 0
  const render = () => (el.textContent = `count is ${count}`)
  el.addEventListener('click', () => {
    count++
    render()
  })
  render()
}

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // re-run setup with the updated module, without a full page reload
  })
  import.meta.hot.dispose(() => {
    // cleanup: remove listeners, clear intervals, close workers
  })
}
```

- `import.meta.hot.accept()` (no args) — self-accept; the module's own new version replaces the old one.
- `import.meta.hot.accept(deps, cb)` — accept updates to specific dependencies.
- `import.meta.hot.dispose(cb)` — run cleanup before a module is replaced (critical for workers, WebSocket connections, `setInterval`).
- `import.meta.hot.invalidate()` — force the update to propagate up (full reload) when a module cannot safely self-accept.
- Guard all of the above behind `if (import.meta.hot)` — it is `undefined` in a production build, and dead-code elimination strips the block entirely.

## Rolldown (Vite 8 default bundler)

As of Vite 8, the **Rolldown**-powered bundler is the default build engine (previously an opt-in `rolldown-vite` package in Vite 6/7). Practical consequences for framework-agnostic projects:

- `build.rollupOptions` config keys still work for the parts of the API Rolldown re-implements (e.g. `input`, `external`), but some Rollup-specific output options changed shape — notably `output.manualChunks` as an **object** is removed; use `build.rolldownOptions.output.codeSplitting.groups` instead (see `08-quality-tools.md` for a full example).
- Library builds (`build.lib`) and `vite-plugin-dts` both work unchanged under Rolldown.
- If a project depends on a Rollup-only plugin that hasn't been ported, Rolldown can be disabled per-project (consult the current Vite release notes for the opt-out flag, since this is expected to be phased out over time) — treat this as a temporary escape hatch, not a long-term config.

## Vite Server / Preview Basics

```bash
npm run dev              # vite — dev server with HMR
npm run build             # vite build — production bundle to dist/
npm run preview           # vite preview — serves the dist/ build locally, close to production
```

`vite preview` is the closest local approximation of the production static output — use it (not `vite dev`) to sanity-check build-time-only behavior (`import.meta.env.PROD`, minified output, asset hashing) before deploying.
