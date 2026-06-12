# Vue.js Quality Tools

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

### vue-tsc for Type Checking

```bash
# Check types
pnpm vue-tsc --noEmit

# Watch mode
pnpm vue-tsc --noEmit --watch
```

## Code Coverage

### Vitest Coverage Configuration

```typescript
// vitest.config.ts
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
        '**/types/**',
        'src/main.ts',
        'src/App.vue',
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

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:coverage

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

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

### GitLab CI Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - build
  - deploy

variables:
  NODE_VERSION: '20'

.node_template: &node_template
  image: node:${NODE_VERSION}
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
      - .pnpm-store/
  before_script:
    - corepack enable
    - corepack prepare pnpm@latest --activate
    - pnpm config set store-dir .pnpm-store
    - pnpm install --frozen-lockfile

lint:
  <<: *node_template
  stage: validate
  script:
    - pnpm lint
    - pnpm format:check

type-check:
  <<: *node_template
  stage: validate
  script:
    - pnpm type-check

test:
  <<: *node_template
  stage: test
  script:
    - pnpm test:coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  <<: *node_template
  stage: build
  script:
    - pnpm build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - main
    - develop
```

## Pre-commit Hooks

### Husky + lint-staged Configuration

```bash
# Install
pnpm add -D husky lint-staged
pnpm exec husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
pnpm lint-staged
```

```bash
# .husky/pre-push
pnpm type-check
pnpm test:unit --run
```

## Bundle Analysis

### Vite Bundle Visualizer

```bash
pnpm add -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

### Bundle Size Limits

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // ⚠️ Vite 8 (Rolldown): manualChunks is deprecated when Rolldown is the active bundler.
        // Remove or condition to build.rolldown !== true for Vite 8+ projects.
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // KB
  },
})
```

## Dependency Audit

### npm audit

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically
pnpm audit --fix
```

### Dependency Updates

```bash
# Check outdated packages
pnpm outdated

# Update all dependencies
pnpm update

# Interactive update
pnpm update -i
```

## Performance Monitoring

### Web Vitals

```typescript
// src/utils/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

type ReportHandler = (metric: {
  name: string
  value: number
  id: string
}) => void

export function reportWebVitals(onReport: ReportHandler) {
  onCLS(onReport)
  onFID(onReport)
  onFCP(onReport)
  onLCP(onReport)
  onTTFB(onReport)
}
```

```typescript
// src/main.ts
import { reportWebVitals } from './utils/webVitals'

reportWebVitals((metric) => {
  console.log(metric)
  // Send to analytics
})
```

## Quality Checklist

### Pre-commit

- [ ] ESLint passes (no errors)
- [ ] Prettier formatting applied
- [ ] No TypeScript errors
- [ ] Tests pass

### Pre-merge

- [ ] All CI checks pass
- [ ] Code coverage >= 80%
- [ ] Bundle size within limits
- [ ] No security vulnerabilities
- [ ] PR reviewed and approved

### Pre-release

- [ ] All tests pass (unit, integration, e2e)
- [ ] Performance benchmarks acceptable
- [ ] No console errors in production build
- [ ] Accessibility audit passed
- [ ] SEO meta tags verified

## Metrics to Monitor

| Metric | Target |
|--------|--------|
| Test Coverage | >= 80% |
| Bundle Size (gzip) | < 200KB |
| Lighthouse Performance | >= 90 |
| Lighthouse Accessibility | >= 90 |
| Type Coverage | 100% |
| ESLint Errors | 0 |
