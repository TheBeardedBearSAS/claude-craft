---
description: Audit Vite project test coverage and quality with Vitest
---

# Vite Testing Audit

You are an expert Vitest/Vite testing specialist. Analyze test coverage and quality for a framework-agnostic Vite project.

> For Vite configured as a React/Vue/Angular/Svelte dev-server, use that stack's `check-testing` command instead for component-testing guidance — this command covers **only** framework-agnostic Vite usage (no component testing libraries, since there is no component model here).

## MISSION

Evaluate test coverage, test quality, and testing best practices for plain TS modules, worker message contracts, WASM wrappers, and (for the library shape) the published build output.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## AUDIT AREAS

### 1. Coverage Analysis

```bash
npx vitest run --coverage
```

Thresholds:
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

### 2. Test Organization

Check for:
- Co-located tests (`*.test.ts` next to source)
- Proper `describe`/`it` structure
- Meaningful test names
- Test isolation (no shared mutable state between tests)

### 3. Vanilla Module Testing

Verify:
- Pure functions and classes have direct unit tests
- Edge cases covered (empty input, boundary values)
- No unnecessary DOM/browser dependency (`environment: 'node'` used unless DOM is genuinely exercised)

### 4. Worker Testing

Check:
- Worker message-handling logic is extracted into a plain, directly testable function (not tested only through the `Worker` runtime)
- Message contract (expected `cmd`/payload shapes) has explicit tests for valid and invalid inputs

### 5. WASM Wrapper Testing

Check:
- The `?init` import is mocked in unit tests (not loading the real binary every run)
- At least one integration test loads the real `.wasm` module to catch drift between the mock and reality

### 6. Library Build-Output Testing (library shape only)

Check:
- A dedicated test (run after `vite build`) imports from `dist/` to confirm the ESM build's public API surface
- The CJS build is confirmed `require()`-able
- `exports` map in `package.json` resolves correctly for both conditions

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE TESTING AUDIT
══════════════════════════════════════════════════════════════

📊 COVERAGE SUMMARY
──────────────────────────────────────────────────────────────
Statements: XX% (target: 80%)
Branches:   XX% (target: 80%)
Functions:  XX% (target: 80%)
Lines:      XX% (target: 80%)

Status: ✅ PASS | ❌ BELOW THRESHOLD

📁 COVERAGE BY AREA
──────────────────────────────────────────────────────────────
src/ (core logic):     XX% ████████░░
vite-plugins/:         XX% ██████████
Worker logic:          XX% ███████░░░
WASM wrappers:         XX% █████████░

🔴 UNCOVERED FILES
──────────────────────────────────────────────────────────────
- src/wasm/image-filter.ts (15%)
- vite-plugins/vite-plugin-inline-svg.ts (0%)

📋 TEST ORGANIZATION
──────────────────────────────────────────────────────────────
Total Test Files: XX
Total Tests: XX
Co-located Tests: XX/XX (XX%)

Issues:
- tests/ directory used instead of co-location
  → Move tests next to source files

⚙️ WORKER TEST QUALITY
──────────────────────────────────────────────────────────────
Workers with extracted, tested handler logic: X/X

Issues:
[✗] heavy-task.worker.ts — logic not extracted, tested only via manual QA
    → Extract handleMessage() into a plain function, add unit tests

🧬 WASM WRAPPER TEST QUALITY
──────────────────────────────────────────────────────────────
WASM wrappers with mocked-import tests: X/X

Issues:
[⚠️] image-filter.ts — no test mocks the ?init import
    → Add vi.mock('./image-filter.wasm?init', ...)

📦 LIBRARY BUILD-OUTPUT TESTS (if library shape)
──────────────────────────────────────────────────────────────
Status: ✅ PRESENT | ❌ MISSING

Issues:
[✗] No test imports from dist/ after build
    → Add test/build-output.test.ts, run via `npm run test:build`

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. [CRITICAL] Add build-output smoke test (library shape)
2. [HIGH] Extract and test worker message-handling logic
3. [MEDIUM] Improve branch coverage on WASM wrappers
4. [LOW] Move tests to co-located structure

══════════════════════════════════════════════════════════════
```

## COMMANDS

```bash
# Run tests with coverage
npx vitest run --coverage

# Run a specific test file
npx vitest run src/counter.test.ts

# Library shape — build then smoke test dist/
npm run build && npx vitest run test/build-output.test.ts
```

## TEST FILE TEMPLATE

```typescript
// module-name.test.ts
import { describe, it, expect, vi } from 'vitest'
import { functionName } from './module-name'

describe('functionName', () => {
  it('handles the expected case', () => {
    expect(functionName('input')).toBe('expected')
  })

  it('handles an edge case', () => {
    expect(functionName('')).toBe('')
  })

  it('throws on invalid input', () => {
    expect(() => functionName(null as unknown as string)).toThrow()
  })
})
```
