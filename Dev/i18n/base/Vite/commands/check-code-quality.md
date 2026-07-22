---
description: Analyze Vite project code quality with ESLint, TypeScript, and build diagnostics
---

# Vite Code Quality Audit

You are an expert Vite/TypeScript code quality analyst. Perform comprehensive quality checks on a framework-agnostic Vite project (vanilla SPA, library, multi-page app, or worker/WASM).

> For Vite configured as a React/Vue/Angular/Svelte dev-server, use that stack's `check-code-quality` command instead — this command covers **only** framework-agnostic Vite usage.

## MISSION

Analyze code quality across `src/`, `vite-plugins/`, and `vite.config.ts` with focus on ESLint rules, TypeScript strictness, and absence of accidental framework coupling.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## QUALITY CHECKS

### 1. ESLint Analysis

```bash
npx eslint .
```

Key rules to verify:
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unused-vars`
- `no-restricted-imports` (guards against stray React/Vue/Angular/Svelte imports)
- `no-console` (allow warn/error only)

### 2. TypeScript Analysis

```bash
tsc -b --noEmit
```

Verify:
- No implicit `any`
- `moduleResolution: "bundler"` set correctly
- Project references (`tsconfig.app.json` / `tsconfig.node.json`) resolve without overlap errors
- `vite/client` types available (`import.meta.env`, `import.meta.hot`, asset imports)

### 3. Framework Leakage Check

Because this stack is explicitly framework-agnostic, scan for accidental coupling:
```bash
grep -rE "from 'react'|from 'vue'|from '@angular|from 'svelte'" src/
grep -rl "\.jsx\|\.tsx\|\.vue\|\.svelte" src/
```
Any hit is a scope violation for a project declared framework-agnostic.

### 4. Code Complexity

Analyze for:
- Functions > 30 lines
- Files > 300 lines
- Cyclomatic complexity > 10
- Deep nesting (> 3 levels)

### 5. Vite-Specific Quality

Check for:
- `vite.config.ts` uses the functional `(mode, command)` form for env-dependent logic
- Custom plugins extracted to `vite-plugins/`, not inlined
- `import.meta.env.VITE_*` accessed only where genuinely public (cross-check with `check-security`)
- Worker/WASM entries use the static `new URL(...)` / `?init` patterns (required for Vite's static analysis)

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VITE CODE QUALITY REPORT
══════════════════════════════════════════════════════════════

📊 QUALITY SCORE: XX/20

🔍 ESLINT ANALYSIS
──────────────────────────────────────────────────────────────
Errors: X
Warnings: X
Files with issues: X

Top Issues:
1. @typescript-eslint/no-explicit-any (4 occurrences)
   - src/utils/format.ts:12

2. no-restricted-imports (1 occurrence)
   - src/legacy/widget.ts:3 — `import { useState } from 'react'`
     → Remove; out of scope for this framework-agnostic stack

📝 TYPESCRIPT CHECK
──────────────────────────────────────────────────────────────
Status: ✅ PASS | ❌ FAIL
Type Errors: X

Issues:
- src/wasm/image-filter.ts:8
  Property 'exports' does not exist on type 'unknown'

⚠️ FRAMEWORK LEAKAGE
──────────────────────────────────────────────────────────────
Status: ✅ CLEAN | ❌ VIOLATIONS FOUND

Findings:
- src/legacy/widget.tsx present — .tsx implies JSX/React, out of scope

📏 CODE COMPLEXITY
──────────────────────────────────────────────────────────────
Large Functions (>30 lines): X
Large Files (>300 lines): X
High Complexity (>10): X

Files to refactor:
- src/wasm/image-filter.ts (processImage: 55 lines)
  → Split into smaller pure functions

⚙️ VITE-SPECIFIC ISSUES
──────────────────────────────────────────────────────────────
[⚠️] process.env branching scattered across vite.config.ts
     → Consolidate via functional (mode, command) form

[⚠️] Worker instantiated with a bare string URL
     File: src/main.ts:20
     → Use new Worker(new URL('./x.worker.ts', import.meta.url), { type: 'module' })

📋 ACTION ITEMS
──────────────────────────────────────────────────────────────
1. [CRITICAL] Remove out-of-scope framework import
2. [HIGH] Fix TypeScript errors
3. [MEDIUM] Refactor large functions
4. [LOW] Consolidate env branching in vite.config.ts

══════════════════════════════════════════════════════════════
```

## COMMANDS TO RUN

```bash
# Full quality check
npx eslint . && tsc -b --noEmit

# With auto-fix
npx eslint . --fix

# Framework-leakage scan
grep -rE "from 'react'|from 'vue'|from '@angular|from 'svelte'" src/
```
