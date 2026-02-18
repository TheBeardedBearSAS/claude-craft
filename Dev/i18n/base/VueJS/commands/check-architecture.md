---
description: Audit Vue.js project architecture and module organization
---

# Vue.js Architecture Audit

You are an expert Vue.js architect. Analyze the project architecture for scalability and maintainability.

## MISSION

Evaluate the project's architectural patterns, module organization, and adherence to Vue.js best practices.

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## AUDIT AREAS

### 1. Module Organization

```
[ ] Feature-based organization (modules/)
[ ] Clear separation of concerns
[ ] Minimal cross-module dependencies
[ ] Proper module exports (index.ts)
```

### 2. Component Architecture

```
[ ] Smart vs Dumb component separation
[ ] Base components properly abstracted
[ ] Layout components isolated
[ ] No prop drilling (use provide/inject or stores)
```

### 3. State Management

```
[ ] Pinia for global state
[ ] Local state in components when appropriate
[ ] No redundant state duplication
[ ] Proper store organization
```

### 4. Routing Architecture

```
[ ] Lazy-loaded routes
[ ] Route guards properly implemented
[ ] Meta fields for authorization
[ ] Nested routes for layouts
```

### 5. API Layer

```
[ ] Centralized API client
[ ] Request/response interceptors
[ ] Error handling abstracted
[ ] Type-safe API calls
```

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VUE.JS ARCHITECTURE AUDIT
══════════════════════════════════════════════════════════════

📊 ARCHITECTURE SCORE: XX/100

🏗️ MODULE ORGANIZATION
──────────────────────────────────────────────────────────────
Status: ✅ Well organized | ⚠️ Needs improvement | ❌ Poor

Current Structure:
src/
├── components/     ✅ Properly organized
├── modules/        ⚠️ Some cross-dependencies
└── stores/         ✅ Feature-based stores

Issues:
- modules/auth imports from modules/user directly
  → Use events or shared store instead

🧩 COMPONENT ARCHITECTURE
──────────────────────────────────────────────────────────────
Smart Components: 15
Dumb Components: 45
Ratio: 3:1 ✅ Good

Issues:
- ProductList.vue has too much logic
  → Extract to composable useProductList

🏪 STATE MANAGEMENT
──────────────────────────────────────────────────────────────
Pinia Stores: 8
Store Health: ✅ Good

Issues:
- Duplicate user data in auth.store and user.store
  → Consolidate into single source of truth

🛣️ ROUTING
──────────────────────────────────────────────────────────────
Total Routes: 25
Lazy-loaded: 23/25 (92%) ✅

Issues:
- HomeView and AboutView not lazy-loaded
  → Add dynamic imports

🔌 API LAYER
──────────────────────────────────────────────────────────────
Centralized Client: ✅ Yes
Error Handling: ⚠️ Inconsistent
Type Safety: ✅ Full coverage

Issues:
- Some API calls don't use centralized client
  Files: src/modules/legacy/api.ts

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
Priority 1: Fix cross-module dependencies
Priority 2: Extract large component logic
Priority 3: Consolidate duplicate state

══════════════════════════════════════════════════════════════
```

## PROCESS

1. Analyze directory structure
2. Map component relationships
3. Review store organization
4. Check router configuration
5. Evaluate API layer
6. Generate architecture report
