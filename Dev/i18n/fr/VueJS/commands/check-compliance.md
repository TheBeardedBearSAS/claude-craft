---
description: Audit Vue.js project compliance with coding standards and best practices
---

# Vue.js Compliance Audit

You are an expert Vue.js auditor. Perform a comprehensive compliance check on this project.

## MISSION

Audit the project for compliance with Vue.js 3 best practices, Composition API standards, and TypeScript conventions.

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## AUDIT CHECKLIST

### 1. Project Structure (20 points)

```
[ ] src/components/ - Shared components organized
[ ] src/composables/ - Composition functions present
[ ] src/stores/ - Pinia stores properly structured
[ ] src/router/ - Vue Router configuration
[ ] src/types/ - TypeScript types defined
[ ] src/services/ - API services separated
```

### 2. Component Standards (25 points)

```
[ ] Using <script setup> syntax
[ ] TypeScript with lang="ts"
[ ] Props defined with defineProps<T>()
[ ] Emits defined with defineEmits<T>()
[ ] Components are multi-word named
[ ] Base components use Base prefix
```

### 3. Composition API (20 points)

```
[ ] No Options API in new components
[ ] Composables follow use* naming
[ ] Reactive state properly typed
[ ] Computed properties used correctly
[ ] Watchers cleaned up
```

### 4. Pinia Stores (15 points)

```
[ ] Setup syntax stores (composition style)
[ ] Proper TypeScript typing
[ ] Actions are async when needed
[ ] Getters use computed
[ ] No direct state mutation from components
```

### 5. TypeScript Integration (20 points)

```
[ ] Strict mode enabled
[ ] No implicit any
[ ] Props and emits fully typed
[ ] Interfaces for complex types
[ ] Type-only imports used
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VUE.JS COMPLIANCE AUDIT
══════════════════════════════════════════════════════════════

📊 SUMMARY
──────────────────────────────────────────────────────────────
Total Score: XX/100
Status: ✅ COMPLIANT | ⚠️ NEEDS WORK | ❌ NON-COMPLIANT

📁 PROJECT STRUCTURE: XX/20
──────────────────────────────────────────────────────────────
[✓] Organized component structure
[✗] Missing composables directory
    → Create src/composables/ for reusable logic

🧩 COMPONENT STANDARDS: XX/25
──────────────────────────────────────────────────────────────
[✓] Using <script setup>
[✗] Some components use Options API
    Files: src/components/OldComponent.vue
    → Migrate to Composition API

🔧 COMPOSITION API: XX/20
──────────────────────────────────────────────────────────────
[✓] Composables properly named
[✗] Missing cleanup in watchers
    File: src/composables/useData.ts:45

🏪 PINIA STORES: XX/15
──────────────────────────────────────────────────────────────
[✓] Setup syntax used
[✓] Proper typing

📝 TYPESCRIPT: XX/20
──────────────────────────────────────────────────────────────
[✓] Strict mode enabled
[✗] Implicit any found
    File: src/utils/helpers.ts:12

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. [HIGH] Migrate remaining Options API components
2. [MEDIUM] Add missing type definitions
3. [LOW] Organize composables by feature

══════════════════════════════════════════════════════════════
```

## PROCESS

1. Scan project structure
2. Analyze component files for standards
3. Check composables and stores
4. Verify TypeScript configuration
5. Generate compliance report with score
