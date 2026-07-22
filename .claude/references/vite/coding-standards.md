# Vite Coding Standards (Framework-Agnostic)

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## TypeScript Configuration

### Required Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "vite.config.ts"]
}
```

### `vite-env.d.ts` — Environment Typing

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_FEATURE_FLAGS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Rule**: every custom `VITE_*` variable used in application code must be declared here. `tsc --noEmit` then catches typos in `import.meta.env.VITE_*` access at compile time.

## `vite.config.ts` Conventions

### Structure and Ordering

```typescript
// vite.config.ts
// 1. Node/Vite imports
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// 2. Official/community plugins
import checker from 'vite-plugin-checker'

// 3. Local custom plugins (last, so they run after upstream transforms by default)
import injectVersion from './build-plugins/vite-plugin-inject-version'

export default defineConfig(({ mode }) => ({
  plugins: [
    checker({ typescript: true }),
    injectVersion({ version: process.env.npm_package_version ?? '0.0.0' }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: mode !== 'production',
  },
}))
```

**Rules:**
- Prefer the **function form** `defineConfig(({ mode, command }) => ({ ... }))` over static object export as soon as any option varies by `mode` or `command` — avoids duplicated config files (`vite.config.prod.ts`, etc.)
- One `vite.config.ts` per package. Do not split config across `vite.config.ts` + ad-hoc runtime patches.
- Keep `vite.config.ts` under ~150 lines; extract entry maps, plugin factories, or alias tables into `config/*.ts` helper modules when it grows.

### Environment Variables

```bash
# .env                 — committed, no secrets
VITE_APP_TITLE=My App

# .env.production      — committed, no secrets
VITE_API_URL=https://api.example.com

# .env.local           — gitignored, machine-specific overrides
VITE_API_URL=http://localhost:8000
```

```typescript
// Usage
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

**Rule**: only values safe to ship in client-readable plaintext may use the `VITE_` prefix (or a custom `envPrefix`). See `security.md` for the full `envPrefix`/`define()` threat model.

## Custom Plugin Naming and Structure

### Naming Convention

| Element | Convention | Example |
|---------|------------|---------|
| Published plugin package | `vite-plugin-<purpose>` | `vite-plugin-inject-version` |
| Local/internal plugin file | `vite-plugin-<purpose>.ts` | `build-plugins/vite-plugin-copy-assets.ts` |
| Plugin factory function | camelCase, matches purpose | `export default function injectVersion(options)` |
| Plugin `name` field | kebab-case, matches package name minus prefix | `name: 'inject-version'` |

### Plugin Skeleton

```typescript
// build-plugins/vite-plugin-inject-version.ts
import type { Plugin } from 'vite'

export interface InjectVersionOptions {
  version: string
  include?: string[]
}

export default function injectVersion(options: InjectVersionOptions): Plugin {
  const include = options.include ?? ['src/main.ts']

  return {
    name: 'inject-version',
    transform(code, id) {
      if (!include.some((pattern) => id.endsWith(pattern))) return null
      if (!code.includes('__APP_VERSION__')) return null

      return {
        code: code.replace(/__APP_VERSION__/g, JSON.stringify(options.version)),
        map: null,
      }
    },
  }
}
```

**Rules:**
- Every plugin option interface is exported and typed — no untyped `any` options object
- `transform`/`resolveId`/`load` hooks return `null` (not `undefined` inconsistently) when they decline to handle a module, per the Rollup plugin contract
- Plugins that only need to run once at build start use `buildStart`/`configResolved`, not a check re-run inside every `transform` call
- `enforce: 'pre' | 'post'` set explicitly only when hook ordering actually matters — omit otherwise

## Import Organization

```typescript
// 1. Node built-ins
import { readFileSync } from 'node:fs'

// 2. Vite core
import { defineConfig, type Plugin } from 'vite'

// 3. Third-party plugins/libraries
import dts from 'vite-plugin-dts'

// 4. Internal — config helpers
import { buildEntries } from './config/entries'

// 5. Internal — local plugins
import injectVersion from './build-plugins/vite-plugin-inject-version'

// 6. Types (import type)
import type { InjectVersionOptions } from './build-plugins/vite-plugin-inject-version'
```

## Import Suffix Reference

Vite provides several import-suffix conventions that must be used as-is rather than reimplemented:

| Suffix | Effect | Example |
|--------|--------|---------|
| `?worker` | Imports as a Worker constructor | `import W from './w.ts?worker'` |
| `?worker&inline` | Worker bundled as a base64 string, no network request | `import W from './w.ts?worker&inline'` |
| `?init` | WASM module wrapped in an async init function | `import init from './m.wasm?init'` |
| `?raw` | Imports file contents as a raw string | `import txt from './readme.md?raw'` |
| `?url` | Imports the resolved public URL of an asset | `import url from './logo.svg?url'` |
| `?inline` | Forces inlining (e.g. CSS as a string) regardless of size threshold | `import css from './c.css?inline'` |

**Rule**: never hand-roll equivalents of these suffixes with a custom plugin unless the built-in behavior is proven insufficient — check `tooling.md` and the official plugin registry first.

## Style Standards (CSS in Vite)

```typescript
// vite.config.ts — CSS Modules convention
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    devSourcemap: true,
  },
})
```

```typescript
// src/main.ts — CSS Modules usage (framework-agnostic)
import styles from './app.module.css'

document.querySelector('#app')!.className = styles.container
```

**Rule**: `*.module.css` for scoped styles, plain `*.css` for global styles imported once from the entry point. Avoid injecting `<style>` tags manually — let Vite's CSS pipeline own extraction/injection.
