# Vite Testing Guidelines (Framework-Agnostic)

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit, module, and plugin testing — shares Vite's config/transform pipeline |
| **Vitest Browser Mode** | Real-browser testing for DOM modules, workers, WASM |
| **Playwright** | End-to-end testing (multi-page apps) |
| **arethetypeswrong** | Validates published library `exports`/`.d.ts` correctness |
| **MSW** | API mocking for modules that call `fetch` |

## Vitest Configuration

Vitest reuses the project's `vite.config.ts` resolve/plugins pipeline by default, so `@/` aliases, `?worker`, `?raw`, and other import suffixes behave identically in tests and in the app.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

## Vitest Browser Mode — Workers & WASM

`jsdom` does not implement real `Worker` or `WebAssembly.instantiateStreaming` semantics. Since Vitest 4, **Browser Mode** (Chromium/Firefox/WebKit via Playwright) is stable and is the recommended way to test worker and WASM entries with real browser behavior instead of mocking them away.

### Installation

```bash
npm install -D @vitest/browser playwright
npx playwright install chromium
```

### Workspace Configuration (jsdom for modules, browser for workers/WASM)

```typescript
// vitest.config.ts — workspace split
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    workspace: [
      {
        // Pure modules, plugins, utils — fast, no browser needed
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.{test,spec}.ts'],
          exclude: ['src/**/*.browser.{test,spec}.ts'],
          environment: 'jsdom',
        },
      },
      {
        // Workers, WASM, real-DOM modules — real browser
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.{test,spec}.ts'],
          browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
          },
        },
      },
    ],
    globals: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### Testing a Worker Entry (Browser Mode)

```typescript
// src/workers/parser.worker.browser.test.ts
import { describe, it, expect } from 'vitest'
import ParserWorker from './parser.worker?worker'

describe('parser.worker (browser)', () => {
  it('parses a payload and posts back a result', async () => {
    const worker = new ParserWorker()

    const result = await new Promise((resolve) => {
      worker.onmessage = (e) => resolve(e.data)
      worker.postMessage({ type: 'parse', payload: '{"a":1}' })
    })

    expect(result).toEqual({ a: 1 })
    worker.terminate()
  })
})
```

### Testing a WASM Module (Browser Mode)

```typescript
// src/wasm/compute.browser.test.ts
import { describe, it, expect } from 'vitest'
import init, { compute } from './compute/compute.wasm?init'

describe('compute.wasm (browser)', () => {
  it('exposes a compute function with the expected signature', async () => {
    await init()
    expect(typeof compute).toBe('function')
    expect(compute(2, 3)).toBe(5)
  })
})
```

## Testing Custom Vite Plugins

Plugin hooks (`transform`, `resolveId`, `load`) are plain functions once extracted from the `Plugin` object — call them directly with the plugin's `this` context stubbed out for unit tests.

```typescript
// build-plugins/vite-plugin-inject-version.test.ts
import { describe, it, expect } from 'vitest'
import injectVersion from './vite-plugin-inject-version'

describe('vite-plugin-inject-version', () => {
  it('has the expected plugin name', () => {
    const plugin = injectVersion({ version: '1.0.0' })
    expect(plugin.name).toBe('inject-version')
  })

  it('replaces the version placeholder in included files', () => {
    const plugin = injectVersion({ version: '2.1.0', include: ['src/main.ts'] })
    const transform = plugin.transform as (code: string, id: string) => { code: string } | null

    const result = transform('const v = __APP_VERSION__', 'src/main.ts')

    expect(result?.code).toContain('"2.1.0"')
  })

  it('declines files outside the include glob', () => {
    const plugin = injectVersion({ version: '2.1.0', include: ['src/main.ts'] })
    const transform = plugin.transform as (code: string, id: string) => unknown

    expect(transform('const v = __APP_VERSION__', 'src/other.ts')).toBeNull()
  })
})
```

### Integration Test: Real `vite build` Against a Fixture

For plugins that interact with the file system (`resolveId`, `load`, emitting assets), a unit test calling the hook directly is not enough — run an actual build against a minimal fixture project.

```typescript
// build-plugins/vite-plugin-copy-assets.integration.test.ts
import { describe, it, expect } from 'vitest'
import { build } from 'vite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import copyAssets from './vite-plugin-copy-assets'

describe('vite-plugin-copy-assets (integration)', () => {
  it('copies declared assets into dist/ during a real build', async () => {
    await build({
      root: resolve(__dirname, '__fixtures__/copy-assets-project'),
      configFile: false,
      plugins: [copyAssets({ patterns: ['assets/*.png'] })],
      build: { write: true, outDir: 'dist' },
      logLevel: 'silent',
    })

    expect(
      existsSync(resolve(__dirname, '__fixtures__/copy-assets-project/dist/logo.png'))
    ).toBe(true)
  })
})
```

## Library Entry-Point Testing

### Public API Smoke Test

```typescript
// src/index.test.ts
import { describe, it, expect } from 'vitest'
import * as publicApi from './index'

describe('public API surface', () => {
  it('exports every documented member', () => {
    expect(Object.keys(publicApi).sort()).toEqual(['default', 'greet', 'GreetOptions'].sort())
  })
})
```

### Dist-Level Smoke Test (post-build)

```typescript
// tests/dist.smoke.test.ts — run only against a built dist/, e.g. in a "test:dist" script
import { describe, it, expect } from 'vitest'

describe('dist/ output', () => {
  it('ESM entry exposes the expected exports', async () => {
    const mod = await import('../dist/my-lib.js')
    expect(typeof mod.greet).toBe('function')
  })

  it('CJS entry exposes the expected exports', async () => {
    const { createRequire } = await import('node:module')
    const require = createRequire(import.meta.url)
    const mod = require('../dist/my-lib.cjs')
    expect(typeof mod.greet).toBe('function')
  })
})
```

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:dist": "npm run build && vitest run tests/dist.smoke.test.ts"
  }
}
```

## Multi-Page App Testing

Each HTML entry should have at least one test exercising its bundled script's behavior, plus an E2E check that the page actually loads and renders.

```typescript
// e2e/admin.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin entry (multi-page app)', () => {
  test('loads and initializes the admin bundle', async ({ page }) => {
    await page.goto('/admin/')
    await expect(page.locator('#admin-root')).not.toBeEmpty()
  })
})
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://localhost:4173' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

## Mocking

### Mocking `fetch` with MSW

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/status', () => HttpResponse.json({ status: 'ok' })),
]
```

```typescript
// src/test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Testing Best Practices

### Test Organization

```
src/
├── index.ts
├── index.test.ts                     # Co-located public API smoke test
├── build-plugins/
│   ├── vite-plugin-inject-version.ts
│   └── vite-plugin-inject-version.test.ts
├── workers/
│   ├── parser.worker.ts
│   └── parser.worker.browser.test.ts   # Browser Mode suffix convention
└── wasm/
    ├── compute/compute.wasm
    └── compute.browser.test.ts
```

### Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Statements | 80% |
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |

### Test Naming Convention

| Suffix | Environment | Used for |
|--------|-------------|----------|
| `*.test.ts` | jsdom (default) | Pure modules, plugin hooks, utils |
| `*.browser.test.ts` | Vitest Browser Mode | Workers, WASM, real-DOM behavior |
| `*.integration.test.ts` | jsdom, calls real `vite build`/`vite.transformWithEsbuild` | Plugins touching the filesystem |
