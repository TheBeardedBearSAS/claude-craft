# Vite Testing Guidelines

> For Vite configured as a React/Vue/Angular/Svelte dev-server, see that stack's `07-testing-*.md` for component-testing guidance — this document covers **only** framework-agnostic Vite usage (no component testing libraries, since there is no component model here).

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing for plain TS/JS modules, workers, WASM wrappers, and library builds |
| **@vitest/coverage-v8** | Code coverage |
| **Playwright** (optional) | Smoke-testing the built `dist/` output end-to-end, if the project ships a UI |

There is no `@testing-library/*` or `@vue/test-utils`-equivalent here — this stack has no component model to mount. Test plain functions, classes, worker message contracts, and the shape of the library's public API instead.

## Vitest Configuration

Vitest reuses `vite.config.ts` resolution (aliases, plugins) automatically when the `test` block is co-located in the same file — no separate `vitest.config.ts` is needed unless the project requires a workspace (e.g. splitting `node` vs `browser` test environments).

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // 'jsdom' only if DOM APIs are exercised directly
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/*.config.*', 'src/main.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
```

`environment: 'node'` is the correct default for framework-agnostic logic — reserve `'jsdom'` for code that directly touches `document`/`window` (e.g. the vanilla-SPA's DOM-manipulation entry code).

## Testing Vanilla TS Modules

```typescript
// src/counter.ts
export function createCounter(initial = 0) {
  let count = initial
  return {
    get value() { return count },
    increment: () => ++count,
    reset: () => (count = initial),
  }
}
```

```typescript
// src/counter.test.ts
import { describe, it, expect } from 'vitest'
import { createCounter } from './counter'

describe('createCounter', () => {
  it('starts at the initial value', () => {
    expect(createCounter(5).value).toBe(5)
  })

  it('increments', () => {
    const counter = createCounter(0)
    counter.increment()
    expect(counter.value).toBe(1)
  })

  it('resets to the initial value', () => {
    const counter = createCounter(10)
    counter.increment()
    counter.reset()
    expect(counter.value).toBe(10)
  })
})
```

## Testing Workers

Vitest does not execute `new Worker(new URL(...))` inside its default Node environment. Test the worker's **message contract** by extracting the handler logic into a plain function, and reserve an actual `Worker` instantiation for a Playwright-driven smoke test against the built app.

```typescript
// src/heavy-task.worker-logic.ts — pure function, imported by both the worker entry and the test
export function handleMessage(cmd: string): string {
  if (cmd === 'start') return 'started'
  throw new Error(`unknown command: ${cmd}`)
}
```

```typescript
// src/heavy-task.worker.ts — thin worker entry, not unit tested directly
import { handleMessage } from './heavy-task.worker-logic'

self.onmessage = (e) => {
  self.postMessage(handleMessage(e.data.cmd))
}
```

```typescript
// src/heavy-task.worker-logic.test.ts
import { describe, it, expect } from 'vitest'
import { handleMessage } from './heavy-task.worker-logic'

describe('handleMessage', () => {
  it('handles the start command', () => {
    expect(handleMessage('start')).toBe('started')
  })

  it('throws on an unknown command', () => {
    expect(() => handleMessage('bogus')).toThrow('unknown command')
  })
})
```

## Testing WASM Wrappers

Mock the `?init` import at the module boundary rather than loading the real `.wasm` binary in every unit test — reserve real WASM execution for a small number of integration tests.

```typescript
// src/wasm/image-filter.ts
import initImageFilter from './image-filter.wasm?init'

export async function loadImageFilter() {
  const instance = await initImageFilter({})
  return instance.exports as { grayscale(ptr: number, len: number): void }
}
```

```typescript
// src/wasm/image-filter.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('./image-filter.wasm?init', () => ({
  default: vi.fn().mockResolvedValue({
    exports: { grayscale: vi.fn() },
  }),
}))

import { loadImageFilter } from './image-filter'

describe('loadImageFilter', () => {
  it('exposes the grayscale export', async () => {
    const exports = await loadImageFilter()
    expect(exports.grayscale).toBeDefined()
  })
})
```

## Testing Library Build Output

A library's unit tests exercise the **source** (`src/`); a separate smoke test confirms the **published build** (`dist/`) is actually importable and shaped correctly — this catches `rollupOptions.external` misconfigurations and broken `exports` maps that source-level tests cannot see.

```typescript
// test/build-output.test.ts — run AFTER `vite build`, not part of the regular unit suite
import { describe, it, expect } from 'vitest'

describe('published build', () => {
  it('the ESM build exposes the public API', async () => {
    const mod = await import('../dist/my-lib.js')
    expect(mod.default).toBeTypeOf('function')
  })

  it('the CJS build is requireable', () => {
    const mod = require('../dist/my-lib.cjs')
    expect(mod).toBeDefined()
  })
})
```

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:build": "npm run build && vitest run test/build-output.test.ts"
  }
}
```

## Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Statements | 80% |
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |

Exclude from coverage: `vite.config.ts`, `*.d.ts`, `src/main.ts` (thin bootstrap, exercised by the build-output/smoke test instead of unit coverage).
