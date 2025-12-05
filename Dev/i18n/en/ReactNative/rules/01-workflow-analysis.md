# Workflow Analysis - Mandatory Analysis Before Coding

## Introduction

**ABSOLUTE RULE**: Before any code modification, a MANDATORY analysis phase must be performed. This rule is non-negotiable and guarantees the quality of the code produced.

---

## Fundamental Principle

> "Think First, Code Later"

Each code intervention must be preceded by a methodical analysis to:
- Understand the context
- Identify impacts
- Anticipate problems
- Choose the best solution

---

## Phase 1: Understanding the Need

### 1.1 Request Clarification

**Questions to ask**:
- What is the exact user need?
- What problem are we trying to solve?
- What are the acceptance criteria?
- Are there technical or business constraints?

**Actions**:
```typescript
// BEFORE coding, document:
/**
 * NEED: [Clear description of the need]
 * PROBLEM: [Problem to solve]
 * CRITERIA: [Acceptance criteria]
 * CONSTRAINTS: [Identified constraints]
 */
```

### 1.2 Business Context Analysis

**Understand**:
- The impacted user flow
- Applicable business rules
- Impact on user experience
- Use cases

**Example**:
```typescript
// Feature: Adding a favorites system
//
// BUSINESS CONTEXT:
// - User must be able to mark articles as favorites
// - Favorites must be accessible offline
// - Favorites are synchronized between devices
// - Maximum 100 favorites per user
//
// UX IMPACT:
// - Heart icon on each article
// - Dedicated favorites screen
// - Immediate visual feedback (optimistic update)
```

---

## Phase 2: Technical Analysis

### 2.1 Exploring Existing Code

**Use search tools**:

```bash
# Search for similar patterns
npx expo-search "similar-pattern"

# Search for existing implementation
grep -r "relatedFeature" src/

# Identify dependencies
grep -r "import.*TargetComponent" src/
```

**Exploration checklist**:
- [ ] Reusable existing components
- [ ] Available custom hooks
- [ ] Already implemented API services
- [ ] State management in place
- [ ] Navigation patterns used
- [ ] Consistent styles and theme

### 2.2 Architecture Analysis

**Architecture questions**:
- Where does this feature fit in the architecture?
- Which layers are impacted? (UI, Logic, Data, Navigation)
- Is there an established pattern to follow?
- Should I create a new module or extend existing one?

**Analysis example**:
```typescript
// Feature: Favorites system
//
// IMPACTED LAYERS:
//
// 1. DATA LAYER
//    - New store: stores/favorites.store.ts
//    - API service: services/api/favorites.service.ts
//    - Storage: services/storage/favorites.storage.ts
//    - Types: types/Favorite.types.ts
//
// 2. LOGIC LAYER
//    - Hook: hooks/useFavorites.ts
//    - Hook: hooks/useFavoriteToggle.ts
//    - Utilities: utils/favorites.utils.ts
//
// 3. UI LAYER
//    - Component: components/FavoriteButton.tsx
//    - Screen: screens/FavoritesScreen.tsx
//    - Icon: components/ui/FavoriteIcon.tsx
//
// 4. NAVIGATION
//    - Route: app/(tabs)/favorites.tsx
//    - Deep link: favorites/:id
```

### 2.3 Dependencies Analysis

**Identify**:
- Required external libraries
- Internal dependencies (modules, components)
- Potential circular dependencies
- Compatible versions

**Analysis template**:
```typescript
// REQUIRED DEPENDENCIES:
//
// New libraries:
// - @react-native-async-storage/async-storage (storage)
// - react-query (API sync)
//
// Internal modules:
// - stores/user.store (for userId)
// - services/api/client (for API calls)
// - hooks/useAuth (for authentication)
//
// Checks:
// - No circular dependency with features/articles
// - Compatible with existing architecture
```

---

## Phase 3: Impact Identification

### 3.1 Impact on Existing Code

**Analyze**:
- Which files will be modified?
- Which components will be impacted?
- Are there breaking changes?
- Will existing tests be affected?

**Impact checklist**:
```typescript
// IMPACT ON EXISTING CODE:
//
// MODIFICATIONS:
// - screens/ArticleDetailScreen.tsx (add FavoriteButton)
// - components/ArticleCard.tsx (add favorite icon)
// - navigation/TabNavigator.tsx (add Favorites tab)
//
// NEW FILES:
// - stores/favorites.store.ts
// - screens/FavoritesScreen.tsx
// - hooks/useFavorites.ts
//
// BREAKING CHANGES: None
//
// TESTS TO MODIFY:
// - ArticleCard.test.tsx (new props)
// - ArticleDetailScreen.test.tsx (new button)
```

### 3.2 Performance Impact

**Consider**:
- Bundle size impact
- Runtime performance (FPS, memory)
- Assets size
- Additional network requests
- Storage used

**Example**:
```typescript
// PERFORMANCE ANALYSIS:
//
// BUNDLE SIZE:
// - Add react-query: +50kb (gzipped)
// - New screen: ~15kb
// - TOTAL: +65kb (acceptable < 100kb)
//
// RUNTIME:
// - Render favorites list: FlatList with optimized windowSize
// - Storage: MMKV (ultra fast)
// - Network: Optimistic updates (no perceived latency)
//
// STORAGE:
// - Max 100 favorites × 1kb = 100kb (negligible)
```

### 3.3 UX/UI Impact

**Evaluate**:
- Consistency with design system
- Accessibility
- Responsive (tablet, phone)
- Animations and transitions
- User feedback

**UX checklist**:
```typescript
// UX/UI ANALYSIS:
//
// DESIGN SYSTEM:
// - Use theme.colors.primary for active icon
// - Use existing Button component
// - Animation: scale + haptic feedback
//
// ACCESSIBILITY:
// - Label: "Add to favorites" / "Remove from favorites"
// - Screen reader compatible
// - Hit slop: 44x44 minimum
//
// RESPONSIVE:
// - Adapted tablet icon (larger)
// - Favorites grid: 2 columns mobile, 3 tablet
//
// FEEDBACK:
// - Haptic feedback on toggle
// - Toast notification on success
// - Heart animation
```

---

## Phase 4: Solution Design

### 4.1 Approach Selection

**Compare options**:

```typescript
// APPROACH 1: Local First with sync
// PROS:
// - Works offline
// - Optimal performance
// - Smooth UX
// CONS:
// - Sync complexity
// - Potential conflicts
//
// APPROACH 2: API Only
// PROS:
// - Simple
// - No sync
// - Single source of truth
// CONS:
// - Requires connection
// - Latency
//
// DECISION: Approach 1 (Local First)
// REASON: Better UX, critical offline feature
```

### 4.2 Design Pattern to Use

**Identify appropriate pattern**:

```typescript
// APPLICABLE PATTERNS:
//
// 1. STATE MANAGEMENT: Zustand
//    - Global store for favorites
//    - Persist with MMKV
//
// 2. DATA FETCHING: React Query
//    - Query favorites with cache
//    - Mutation for toggle
//    - Optimistic updates
//
// 3. COMPONENT PATTERN: Compound Component
//    - FavoriteButton.Toggle
//    - FavoriteButton.Icon
//    - FavoriteButton.Count
//
// 4. HOOK PATTERN: Custom Hook
//    - useFavorites() for data
//    - useFavoriteToggle() for action
```

### 4.3 Data Structure

**Define types**:

```typescript
// DEFINED TYPES:

// Favorite entity
interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
  syncedAt?: Date;
  localOnly?: boolean; // For favorites not yet synced
}

// API Response
interface FavoritesResponse {
  favorites: Favorite[];
  total: number;
}

// Store State
interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addFavorite: (articleId: string) => Promise<void>;
  removeFavorite: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
  sync: () => Promise<void>;
}
```

---

## Phase 5: Implementation Plan

### 5.1 Task Breakdown

**Create detailed plan**:

```typescript
// IMPLEMENTATION PLAN:
//
// STEP 1: Types & Interfaces
// - Create types/Favorite.types.ts
// - Define interfaces
// Duration: 30min
//
// STEP 2: Storage Layer
// - Implement favorites.storage.ts
// - Storage tests
// Duration: 1h
//
// STEP 3: API Service
// - Implement favorites.service.ts
// - Mock API responses
// Duration: 1h
//
// STEP 4: Store
// - Create favorites.store.ts
// - Implement actions
// - Store tests
// Duration: 2h
//
// STEP 5: Hooks
// - Create useFavorites
// - Create useFavoriteToggle
// - Hooks tests
// Duration: 1h30
//
// STEP 6: UI Components
// - FavoriteButton
// - FavoriteIcon
// - Components tests
// Duration: 2h
//
// STEP 7: Screen
// - FavoritesScreen
// - Navigation setup
// - Screen tests
// Duration: 2h
//
// STEP 8: Integration
// - Integrate in ArticleCard
// - Integrate in ArticleDetail
// - E2E tests
// Duration: 2h
//
// TOTAL: ~12h
```

### 5.2 Implementation Order

**Rule**: Always bottom-up

```typescript
// IMPLEMENTATION ORDER:
//
// 1. Foundations (Data Layer)
//    ↓
// 2. Services & Storage
//    ↓
// 3. State Management
//    ↓
// 4. Business Logic (Hooks)
//    ↓
// 5. UI Components (dumb)
//    ↓
// 6. UI Components (smart)
//    ↓
// 7. Screens
//    ↓
// 8. Navigation & Integration
//    ↓
// 9. E2E Tests
```

### 5.3 Risk Identification

**Anticipate problems**:

```typescript
// IDENTIFIED RISKS:
//
// RISK 1: Synchronization conflicts
// - Impact: High
// - Probability: Medium
// - Mitigation: Timestamp-based resolution, last-write-wins
//
// RISK 2: 100 favorites limit
// - Impact: Medium
// - Probability: Low
// - Mitigation: Warning UI at 90 favorites, delete oldest
//
// RISK 3: Favorites list performance
// - Impact: Medium
// - Probability: Low
// - Mitigation: Virtualized FlatList, pagination
//
// RISK 4: Storage space
// - Impact: Low
// - Probability: Very low
// - Mitigation: Cleanup old synced favorites
```

---

## Phase 6: Pre-Implementation Validation

### 6.1 Validation Checklist

**Before coding, verify**:

```typescript
// VALIDATION CHECKLIST:
//
// ANALYSIS:
// ✓ Need clearly understood
// ✓ Business context analyzed
// ✓ Architecture studied
// ✓ Dependencies identified
// ✓ Impacts evaluated
//
// DESIGN:
// ✓ Solution chosen and justified
// ✓ Patterns identified
// ✓ Types defined
// ✓ Implementation plan created
//
// RISKS:
// ✓ Risks identified
// ✓ Mitigations planned
//
// QUALITY:
// ✓ Tests planned
// ✓ Performance considered
// ✓ Accessibility provided
// ✓ Documentation prepared
//
// READY TO CODE: YES ✓
```

### 6.2 Design Review

**Review points**:

```typescript
// REVIEW QUESTIONS:
//
// 1. Is the solution KISS (Keep It Simple)?
//    → Yes, standard React Query + Zustand pattern
//
// 2. Does it respect DRY?
//    → Yes, reusable hooks
//
// 3. Does it follow SOLID?
//    → Yes, separated responsibilities
//
// 4. Is it testable?
//    → Yes, each layer independent
//
// 5. Is it performant?
//    → Yes, optimistic updates, FlatList
//
// 6. Is it maintainable?
//    → Yes, clear code, well-typed, documented
//
// 7. Does it respect the architecture?
//    → Yes, follows established patterns
//
// VALIDATION: APPROVED ✓
```

---

## Phase 7: Analysis Documentation

### 7.1 Documentation Template

**Create an ADR (Architecture Decision Record)**:

```markdown
# ADR-XXX: Favorites System

## Status
Proposed

## Context
Users need to mark articles as favorites
to access them quickly, even offline.

## Decision
Implementation of a favorites system with:
- Local-first approach (MMKV storage)
- Background synchronization (React Query)
- Optimistic updates (smooth UX)
- Limit: 100 favorites per user

## Consequences

### Positive
- Works offline
- Optimal performance
- Smooth UX
- Automatic sync

### Negative
- Sync complexity
- Conflict management
- Local storage required

## Alternatives Considered
1. API-only: Rejected (requires connection)
2. AsyncStorage: Rejected (performance)

## Implementation Notes
- Store: Zustand with MMKV persistence
- API: React Query with optimistic updates
- Limit: Warning UI at 90 favorites
```

### 7.2 Inline Documentation

**In the code, document decisions**:

```typescript
/**
 * Favorites Store
 *
 * DECISIONS:
 * - Zustand for state management (simple, performant)
 * - MMKV for persistence (ultra fast)
 * - Optimistic updates (better UX)
 *
 * LIMITS:
 * - Max 100 favorites per user
 * - Sync every 5min in background
 *
 * @see ADR-XXX for architecture details
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Implementation
    }),
    {
      name: 'favorites',
      storage: createMMKVStorage(),
    }
  )
);
```

---

## Complete Examples

### Example 1: Adding a Complex Feature

```typescript
// ========================================
// ANALYSIS: Feature "Push Notifications"
// ========================================

// PHASE 1: UNDERSTANDING
// -----------------------
// NEED: Receive push notifications for new articles
// CRITERIA:
// - Notifications on iOS and Android
// - Opt-in (user permission)
// - Silent notifications for data sync
// - Deep links to articles

// PHASE 2: TECHNICAL ANALYSIS
// ---------------------------
// EXPLORATION:
// - Expo Notifications already installed
// - Push service: FCM (Firebase Cloud Messaging)
// - Deep linking: Expo Router compatible
//
// ARCHITECTURE:
// - Service: services/notifications/push.service.ts
// - Store: stores/notifications.store.ts
// - Hook: hooks/useNotifications.ts
// - Provider: providers/NotificationsProvider.tsx

// PHASE 3: IMPACTS
// ----------------
// CODE:
// - New notifications/ module
// - Modify App.tsx (provider)
// - Update app.json (config)
//
// PERFORMANCE:
// - Bundle: +80kb (expo-notifications)
// - Background task: Minimal impact
//
// UX:
// - Permission prompt (iOS/Android)
// - Settings screen update
// - Toast for received notifications

// PHASE 4: DESIGN
// -------------------
// APPROACH: Native Expo Notifications
// PATTERN: Provider + Hook
// TYPES:
interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: {
    type: 'article' | 'system';
    articleId?: string;
  };
}

// PHASE 5: PLAN
// -------------
// 1. Setup Firebase (2h)
// 2. Config app.json (30min)
// 3. Notifications service (2h)
// 4. Store + Hook (1h30)
// 5. Provider (1h)
// 6. Settings UI (2h)
// 7. Deep links (1h)
// 8. Tests (2h)
// TOTAL: 12h

// PHASE 6: VALIDATION
// -------------------
// ✓ Complete analysis
// ✓ Solution validated
// ✓ Detailed plan
// ✓ Risks identified
// → READY TO CODE
```

### Example 2: Bug Fix

```typescript
// ========================================
// ANALYSIS: Bug "Images not cached"
// ========================================

// PHASE 1: UNDERSTANDING
// -----------------------
// PROBLEM: Images reload on each visit
// SYMPTOMS:
// - Flicker on scroll
// - High data consumption
// - Degraded performance
//
// REPRODUCTION:
// 1. Scroll articles list
// 2. Navigate elsewhere
// 3. Return to list
// 4. Images reload

// PHASE 2: INVESTIGATION
// ----------------------
// CURRENT CODE:
<Image source={{ uri: article.imageUrl }} />

// IDENTIFIED PROBLEM:
// - No cache configured
// - react-native Image default cache weak
//
// POSSIBLE SOLUTIONS:
// 1. expo-image (new, performant)
// 2. react-native-fast-image (proven)
// 3. Manual cache with FileSystem

// PHASE 3: IMPACTS
// ----------------
// CHANGE:
// - Replace Image with expo-image
// - Migration ~50 files
//
// PERFORMANCE:
// - Bundle: +40kb
// - Disk cache: ~100MB max
// - FPS improvement: +15-20%

// PHASE 4: DECISION
// -----------------
// CHOICE: expo-image
// REASON:
// - Native Expo integration
// - Automatic cache
// - Blurhash support
// - Better performance

// PHASE 5: PLAN
// -------------
// 1. Install expo-image (15min)
// 2. Create CachedImage component (30min)
// 3. Migration Image → CachedImage (2h)
// 4. Tests (1h)
// 5. Performance validation (30min)
// TOTAL: 4h15

// PHASE 6: VALIDATION
// -------------------
// ✓ Root cause identified
// ✓ Solution tested
// ✓ Clear migration plan
// → READY TO FIX
```

---

## Anti-Patterns to Avoid

### ❌ Coding Without Analyzing

```typescript
// BAD: Code directly
const handleFavorite = () => {
  // I code without thinking...
  fetch('/api/favorites', { ... });
};

// GOOD: Analyze then code
// 1. Analyze: Need offline sync?
// 2. Design: React Query + optimistic update
// 3. Code:
const { mutate } = useMutation({
  mutationFn: addFavorite,
  onMutate: optimisticUpdate,
});
```

### ❌ Ignoring Existing Code

```typescript
// BAD: Recreate what exists
const MyCustomButton = () => { ... };

// GOOD: Reuse
import { Button } from '@/components/ui/Button';
```

### ❌ Over-Engineering

```typescript
// BAD: Unnecessary complexity
class FavoriteManager extends AbstractManager
  implements IFavoriteService, IObservable { ... }

// GOOD: Simple and effective
export function useFavorites() { ... }
```

---

## Final Checklist

**Before each code intervention**:

```typescript
// PRE-CODE ANALYSIS CHECKLIST
//
// □ Need clearly defined
// □ Business context understood
// □ Existing code explored
// □ Architecture analyzed
// □ Dependencies identified
// □ Impacts evaluated
// □ Solution designed
// □ Pattern chosen
// □ Types defined
// □ Detailed plan created
// □ Risks identified
// □ Tests planned
// □ Documentation prepared
//
// IF ALL CHECKED → CODE
// ELSE → CONTINUE ANALYSIS
```

---

## Conclusion

Pre-code analysis is NOT a waste of time, it's an INVESTMENT that:

- **Avoids costly errors**
- **Guarantees code quality**
- **Accelerates development** (less refactoring)
- **Facilitates maintenance**
- **Improves collaboration**

> "Hours of analysis save days of debugging"

---

**Golden rule**: Spend as much time analyzing as coding (1:1 ratio minimum).
