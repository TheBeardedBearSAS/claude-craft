# Vercel Quality Tools

> Covers quality tooling for the Vercel-specific surface (`api/**`, `vercel.json`, Functions bundle). For the framework running on top of Vercel (Next.js, etc.), see that stack's own `08-quality-tools.md`.

## Linting: ESLint for `api/**`

```javascript
// eslint.config.js (Flat config — ESLint v9+/v10)
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['api/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': typescript },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-globals': [
        'error',
        { name: 'EdgeRuntime', message: 'Edge Runtime is deprecated by Vercel — target the Node.js runtime (Fluid Compute) instead.' },
      ],
    },
  },
  {
    ignores: ['.vercel/**', 'node_modules/**', '*.d.ts'],
  },
]
```

## TypeScript Strict Mode for `api/**`

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "types": ["node", "@vercel/node"],
    "noEmit": true
  },
  "include": ["api/**/*.ts"]
}
```

```bash
# CI type-check
tsc --noEmit
```

## `vercel.json` Schema Linting

`vercel.json` is easy to get subtly wrong (typo'd keys, malformed `headers`/`rewrites` entries silently ignored at deploy time). Validate it against the published schema in CI rather than discovering the mistake in production.

```bash
npm install -D ajv ajv-cli
```

```bash
# Fetch the schema once, commit it, and re-validate in CI (avoids a network dependency at test time)
curl -s https://openapi.vercel.sh/vercel.json -o schemas/vercel.schema.json

# Validate
npx ajv validate -s schemas/vercel.schema.json -d vercel.json --strict=false
```

```json
// package.json
{
  "scripts": {
    "lint:vercel-config": "ajv validate -s schemas/vercel.schema.json -d vercel.json --strict=false"
  }
}
```

**Rule**: re-fetch `schemas/vercel.schema.json` periodically (e.g. quarterly, or when adding a new `vercel.json` key) — Vercel evolves the schema and a stale local copy can pass-through a key that is actually deprecated or renamed.

## Bundle-Size Awareness for Functions

Cold start latency on Serverless Functions correlates with the deployed bundle size — every dependency imported at the top of a handler is loaded on cold start, even if used conditionally. Two concrete practices:

1. **Tree-shake and scope imports** — import only the specific submodule needed (`import { get } from 'lodash-es'` not `import _ from 'lodash'`), and avoid pulling a full SDK into a handler that only calls one endpoint.
2. **Avoid heavy dependencies in the handler's import graph** — a handler that only needs to sign a JWT should not transitively import a full ORM; split heavy, rarely-used code paths into dynamically-imported (`await import(...)`) branches so they are not loaded on every invocation.

```typescript
// ❌ Avoid — pulls the entire SDK into every cold start of this handler
import * as AWS from 'aws-sdk'

// ✅ Prefer — scoped import, smaller bundle, faster cold start
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
```

```bash
# Inspect what actually ships per Function after a build
vercel build
find .vercel/output/functions -name '*.js' -exec du -h {} \; | sort -rh | head -20
```

## CI Gate: `vercel build` as a Pre-Merge Check

Running `vercel build` in CI catches Function bundling errors, `vercel.json` misconfigurations, and missing environment variables **before** a Preview Deployment is even attempted — cheaper and faster feedback than waiting on the platform's own deploy.

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
        run: tsc --noEmit

      - name: Validate vercel.json
        run: npm run lint:vercel-config

      - name: Test with coverage
        run: npm run test:coverage

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: vercel build (pre-merge sanity check)
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
```

## Dependency Audit

```bash
npm audit --omit=dev --audit-level=moderate
npm outdated
```

## Quality Checklist

### Pre-commit
- [ ] ESLint passes (no errors)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Tests pass

### Pre-merge
- [ ] All CI checks pass, including `vercel build`
- [ ] `vercel.json` validated against the platform schema
- [ ] Code coverage >= 85% on handler logic, 100% on auth/secret-guard branches
- [ ] No moderate+ severity vulnerabilities (`npm audit`)
- [ ] No new heavy dependency added to a Function's top-level import graph without justification
- [ ] PR reviewed and approved

## Metrics to Monitor

| Metric | Target |
|--------|--------|
| Handler test coverage | >= 85% |
| Auth/secret-guard branch coverage | 100% |
| Function bundle size (per-function, gzip) | < 1MB (guideline — smaller is faster to cold-start) |
| Type Coverage | 100% (no `any` in `api/**`) |
| ESLint Errors | 0 |
