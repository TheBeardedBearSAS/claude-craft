# Vite Quality Tools (Framework-Agnostic)

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## Static Analysis

### TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### `tsc --noEmit` for Type Checking

```bash
# Check types
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### `vite-plugin-checker` (in-dev-server diagnostics)

```bash
npm install -D vite-plugin-checker
```

```typescript
// vite.config.ts
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint . --ext .ts',
      },
    }),
  ],
})
```

Surfaces TypeScript and ESLint errors as dev-server overlays, so type errors are visible without a separate terminal running `tsc --watch`.

## Code Coverage

### Vitest Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.ts',
      ],
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

### Coverage Commands

```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest --coverage"
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx prettier --check .

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

## Pre-commit Hooks

### Husky + lint-staged Configuration

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit  (Husky v9 — no wrapper sourcing needed)
npx lint-staged
```

```bash
# .husky/pre-push
npx tsc --noEmit
npx vitest run
```

## Bundle Analysis

### `rollup-plugin-visualizer` (works with Rolldown output)

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
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

### Bundle Size Limits (Vite 8 / Rolldown)

> **Vite 8 / Rolldown (default)**: the object form of `manualChunks` is **removed**. Use `build.rolldownOptions.output.codeSplitting.groups` instead — see `rolldown.md`.

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

## Library Build Verification

### `arethetypeswrong` (validates `exports` map correctness)

```bash
npx arethetypeswrong --pack .
```

Catches mismatches between `package.json` `exports`, generated `.d.ts` files, and actual runtime module resolution — critical after any `vite-plugin-dts` config change.

### Manual dist/ Smoke Check

```bash
npm run build
node --input-type=module -e "import('./dist/my-lib.js').then(m => console.log(Object.keys(m)))"
```

## Dependency Audit

### npm audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (review the diff before committing)
npm audit fix
```

### Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update
```

## Quality Checklist

### Pre-commit

- [ ] ESLint passes (no errors)
- [ ] Prettier formatting applied
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Tests pass

### Pre-merge

- [ ] All CI checks pass
- [ ] Code coverage >= 80%
- [ ] Bundle size within `chunkSizeWarningLimit`
- [ ] No security vulnerabilities (`npm audit`)
- [ ] (Library) `arethetypeswrong --pack .` passes
- [ ] PR reviewed and approved

### Pre-release (library shapes)

- [ ] `dist/` inventory matches `package.json` "files"
- [ ] ESM and CJS entries both smoke-tested
- [ ] `.d.ts` reviewed for accuracy against the public API
- [ ] No `devDependencies` accidentally bundled

## Metrics to Monitor

| Metric | Target |
|--------|--------|
| Test Coverage | >= 80% |
| Bundle Size (gzip, app shapes) | project-specific budget |
| Type Coverage | 100% on public API |
| ESLint Errors | 0 |
| Build Warnings | 0 |
