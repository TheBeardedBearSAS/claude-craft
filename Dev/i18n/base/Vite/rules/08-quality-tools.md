# Vite Quality Tools

> For Vite configured as a React/Vue/Angular/Svelte dev-server, see that stack's `08-quality-tools.md` — this document covers **only** framework-agnostic Vite usage.

## Linting: ESLint Flat Config

No framework plugin (`eslint-plugin-vue`, `eslint-plugin-react`, etc.) is needed here — the config is a plain TypeScript flat config.

```javascript
// eslint.config.js (Flat config — ESLint v9+/v10; .eslintrc.* removed in v10)
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'Out of scope for this Vite stack — framework-agnostic only.' },
            { name: 'vue', message: 'Out of scope for this Vite stack — framework-agnostic only.' },
          ],
        },
      ],
    },
  },
  {
    files: ['vite.config.ts', 'vite-plugins/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { project: './tsconfig.node.json' },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.d.ts'],
  },
]
```

The `no-restricted-imports` block is a project-specific guard, not a universal rule: it exists to catch a UI framework accidentally leaking into what should be a framework-agnostic codebase (e.g. a stray `import { useState } from 'react'` pulled in by a copy-pasted snippet). Adjust the banned list to whatever frameworks are genuinely out of scope for the given project.

## TypeScript Project References

Split `tsconfig.json` into an app/lib config and a Node-tooling config, and reference both from a root solution file — this keeps `tsc` from type-checking `vite.config.ts` (which needs `@types/node`) with the same settings as browser-targeted `src/` code (which must not see Node globals).

```json
// tsconfig.json (solution file — no compilerOptions of its own)
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "noEmit": true
  },
  "include": ["vite.config.ts", "vite-plugins/**/*.ts"]
}
```

### `tsc --noEmit` in CI

```bash
# Type-check both project references in one pass
tsc -b --noEmit
```

```json
// package.json
{
  "scripts": {
    "type-check": "tsc -b --noEmit",
    "type-check:watch": "tsc -b --noEmit --watch"
  }
}
```

## CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Test with coverage
        run: npm run test:coverage

      - name: Build
        run: npm run build

      - name: Build-output smoke test (library shape only)
        run: npm run test:build
        if: ${{ hashFiles('package.json') != '' }}
```

## Bundle Analysis

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

### Code Splitting (Vite 8 / Rolldown default)

```typescript
// vite.config.ts — Vite 8 / Rolldown (default)
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500, // KB
  },
})
```

> **Vite 8 / Rolldown (default):** the object form of `manualChunks` is **removed**. Use `build.rolldownOptions.output.codeSplitting.groups`.
> **Legacy Rollup mode (Rolldown explicitly disabled):** use `build.rollupOptions.output.manualChunks` instead — `// Only if Rolldown is explicitly disabled`.

## Dependency Audit

```bash
npm audit --omit=dev --audit-level=moderate
npm outdated
```

## Quality Checklist

### Pre-commit
- [ ] ESLint passes (no errors)
- [ ] No TypeScript errors (`tsc -b --noEmit`)
- [ ] Tests pass

### Pre-merge
- [ ] All CI checks pass
- [ ] Code coverage >= 80%
- [ ] Bundle size within `chunkSizeWarningLimit`
- [ ] No moderate+ severity vulnerabilities (`npm audit`)
- [ ] PR reviewed and approved

### Pre-release (library shape)
- [ ] `npm pack --dry-run` file list matches expectations
- [ ] `dist/*.d.ts` resolves correctly against `exports` map
- [ ] Peer dependencies externalized, not bundled
- [ ] Build-output smoke test passes

## Metrics to Monitor

| Metric | Target |
|--------|--------|
| Test Coverage | >= 80% |
| Bundle Size (gzip, app shape) | < 200KB |
| Type Coverage | 100% (no `any` in `src/`) |
| ESLint Errors | 0 |
