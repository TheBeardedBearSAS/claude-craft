---
description: Audit Paperclip Code Quality
argument-hint: [project-path]
---

# Audit Paperclip Code Quality

## MISSION

Measure TypeScript strictness, lint compliance, naming, complexity, and logging hygiene in a Paperclip project.

## Procedure

### 1. TypeScript baseline

- [ ] `tsconfig.base.json` has `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- [ ] `pnpm typecheck` succeeds (no `tsc` errors across workspaces)
- [ ] No per-package tsconfig loosens the baseline

### 2. Forbidden patterns

Grep and report:
- `: any` annotations
- `as any` / `as unknown as` casts
- `// @ts-ignore`, `// @ts-expect-error` without a linked GitHub issue in the same line comment
- `!.` non-null assertions on DB-returned values

### 3. Lint & format

- [ ] `pnpm lint` exits 0, zero warnings
- [ ] `pnpm format --check` reports no diff
- [ ] ESLint config uses `strict-type-checked`
- [ ] The non-negotiable ESLint rules from `rules/08-quality-tools.md` are enabled

### 4. Naming

Sample 20 files. Verify:
- Files are kebab-case (`agent-service.ts`, not `AgentService.ts` or `agent_service.ts`)
- Types are PascalCase
- Functions / vars are camelCase
- Constants are UPPER_SNAKE
- Env vars read via a parsed config module, prefixed `PAPERCLIP_`

### 5. Cognitive complexity

Run `eslint-plugin-sonarjs` (or equivalent). Flag any function with cognitive complexity ≥ 10. Flag any file > 300 lines.

### 6. Logging hygiene

- [ ] Logs use a structured logger (pino or equivalent), never `console.log` in runtime code
- [ ] No field whose name matches `/key|token|secret|password|authorization/i` is logged as a value
- [ ] No full request body logging

### 7. Async correctness

- [ ] `@typescript-eslint/no-floating-promises` = error, passes
- [ ] No `.then()` chains (grep `.then(`)
- [ ] All timeouts use `AbortController`

### 8. Error modeling

- [ ] Server services throw `DomainError` subclasses, not plain `Error`
- [ ] Every domain error has a stable `code` field
- [ ] No `throw` of strings or literals

## Output

Markdown report with per-section pass/fail, offending files/symbols, severity, and a score /20 for `/paperclip:check-compliance`.
