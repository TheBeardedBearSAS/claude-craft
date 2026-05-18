---
description: Analyze Vue.js code quality with ESLint, TypeScript, and Prettier checks
model: haiku

---

# Vue.js Code Quality Audit

You are an expert Vue.js code quality analyst. Perform comprehensive quality checks.

## MISSION

Analyze code quality across components, composables, and stores with focus on ESLint rules, TypeScript strictness, and formatting consistency.

## QUALITY CHECKS

### 1. ESLint Analysis

Run and analyze ESLint output:
```bash
pnpm lint
```

Key rules to verify:
- `vue/multi-word-component-names`
- `vue/component-api-style`
- `vue/define-macros-order`
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/explicit-function-return-type`

### 2. TypeScript Analysis

Run type checking:
```bash
pnpm vue-tsc --noEmit
```

Verify:
- No implicit any
- Proper null checks
- Correct type narrowing
- Generic types used appropriately

### 3. Code Complexity

Analyze for:
- Functions > 30 lines
- Components > 300 lines
- Cyclomatic complexity > 10
- Deep nesting (> 3 levels)

### 4. Vue-Specific Quality

Check for:
- Reactive references properly used
- Computed vs methods distinction
- Watch cleanup
- Template complexity

### 5. Performance Patterns

Identify:
- Missing `shallowRef` for large objects
- Unnecessary reactivity
- Expensive computed without memoization
- Missing `v-once` for static content

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VUE.JS CODE QUALITY REPORT
══════════════════════════════════════════════════════════════

📊 QUALITY SCORE: XX/100

🔍 ESLINT ANALYSIS
──────────────────────────────────────────────────────────────
Errors: X
Warnings: X
Files with issues: X

Top Issues:
1. vue/multi-word-component-names (5 occurrences)
   - src/components/Button.vue → BaseButton.vue
   - src/components/Input.vue → BaseInput.vue

2. @typescript-eslint/no-explicit-any (3 occurrences)
   - src/utils/helpers.ts:15
   - src/composables/useFetch.ts:22

📝 TYPESCRIPT CHECK
──────────────────────────────────────────────────────────────
Status: ✅ PASS | ❌ FAIL
Type Errors: X

Issues:
- src/stores/user.store.ts:45
  Type 'string | undefined' is not assignable to type 'string'

📏 CODE COMPLEXITY
──────────────────────────────────────────────────────────────
Large Functions (>30 lines): X
Large Components (>300 lines): X
High Complexity (>10): X

Files to refactor:
- src/components/DataTable.vue (450 lines)
  → Split into smaller components
- src/composables/useForm.ts (validateForm: 45 lines)
  → Extract validation logic

🎯 VUE-SPECIFIC ISSUES
──────────────────────────────────────────────────────────────
[⚠️] Reactive array without shallowRef
     File: src/stores/products.store.ts:12
     → Use shallowRef for large arrays

[⚠️] Watch without cleanup
     File: src/composables/useWebSocket.ts:34
     → Return cleanup function from onUnmounted

⚡ PERFORMANCE ISSUES
──────────────────────────────────────────────────────────────
[⚠️] Expensive computed recalculating
     File: src/components/ProductList.vue:25
     → Add useMemoize or cache result

[⚠️] Large v-for without key optimization
     File: src/components/DataGrid.vue:50
     → Ensure unique, stable keys

📋 ACTION ITEMS
──────────────────────────────────────────────────────────────
1. [CRITICAL] Fix TypeScript errors
2. [HIGH] Rename single-word components
3. [MEDIUM] Refactor large functions
4. [LOW] Add performance optimizations

══════════════════════════════════════════════════════════════
```

## COMMANDS TO RUN

```bash
# Full quality check
pnpm lint && pnpm type-check

# With auto-fix
pnpm lint:fix

# Format check
pnpm format:check
```
