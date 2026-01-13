# Vue.js New Feature Checklist

## Before Starting

- [ ] **Requirements clear** - User story or acceptance criteria defined
- [ ] **Scope defined** - Components, stores, and APIs identified
- [ ] **Dependencies checked** - Required libraries available

## Component Development

### Structure

- [ ] **Feature module created** (if new feature)
  ```
  src/modules/{feature}/
  ├── components/
  ├── composables/
  ├── stores/
  ├── views/
  ├── types/
  └── index.ts
  ```

- [ ] **Component files created**
  ```
  ComponentName/
  ├── ComponentName.vue
  ├── ComponentName.test.ts
  ├── ComponentName.types.ts
  └── index.ts
  ```

### Component Quality

- [ ] **TypeScript strict** - No `any` types
- [ ] **Props typed** with `defineProps<T>()`
- [ ] **Emits typed** with `defineEmits<T>()`
- [ ] **Slots documented** (if used)
- [ ] **Data-testid** on interactive elements

### Composition API

- [ ] **Using `<script setup>`**
- [ ] **Composables extracted** for reusable logic
- [ ] **Reactive state properly typed**
- [ ] **Watchers cleaned up** on unmount

## State Management

### Pinia Store

- [ ] **Store created** (if needed)
  ```typescript
  export const useFeatureStore = defineStore('feature', () => {
    // Setup syntax
  })
  ```

- [ ] **Actions are async** when calling APIs
- [ ] **Getters use computed**
- [ ] **Types defined** for state shape

## Routing

- [ ] **Route added** to router config
- [ ] **Lazy-loaded** with dynamic import
- [ ] **Meta defined** (title, auth requirements)
- [ ] **Guard added** if protected

```typescript
{
  path: '/feature',
  name: 'feature',
  component: () => import('@/modules/feature/views/FeatureView.vue'),
  meta: { requiresAuth: true, title: 'Feature' },
}
```

## Testing

### Unit Tests

- [ ] **Component renders** correctly
- [ ] **Props work** as expected
- [ ] **Events emit** properly
- [ ] **Edge cases** covered
- [ ] **Coverage >= 80%**

### Integration Tests

- [ ] **Store integration** works
- [ ] **Router navigation** works
- [ ] **API calls** mocked and tested

## Accessibility

- [ ] **Keyboard navigation** works
- [ ] **ARIA attributes** present
- [ ] **Focus management** correct
- [ ] **Color contrast** sufficient
- [ ] **Screen reader** friendly

## Performance

- [ ] **Lazy loading** for heavy components
- [ ] **`shallowRef`** for large objects
- [ ] **`v-once`** for static content
- [ ] **Computed memoized** properly
- [ ] **No memory leaks** (cleanup in onUnmounted)

## Documentation

- [ ] **Component JSDoc** comments
- [ ] **README updated** (if significant feature)
- [ ] **Types exported** from index.ts

## Final Checks

- [ ] **Lint passes** - `pnpm lint`
- [ ] **Types pass** - `pnpm type-check`
- [ ] **Tests pass** - `pnpm test:unit --run`
- [ ] **Build works** - `pnpm build`
- [ ] **Manual testing** in browser

## Pull Request

- [ ] **Descriptive title**
- [ ] **Linked to issue/ticket**
- [ ] **Screenshots** (for UI changes)
- [ ] **Breaking changes** documented
- [ ] **Reviewers assigned**
