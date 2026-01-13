# Vue.js Pre-Commit Checklist

## Quick Checks

Run before every commit:

```bash
pnpm lint && pnpm type-check && pnpm test:unit --run
```

## Checklist

### Code Quality

- [ ] **ESLint passes** - `pnpm lint`
- [ ] **No TypeScript errors** - `pnpm type-check`
- [ ] **Prettier formatted** - `pnpm format:check`
- [ ] **No console.log** (except warn/error)
- [ ] **No debugger statements**

### Component Standards

- [ ] **Multi-word component names** (not `Button.vue` → `BaseButton.vue`)
- [ ] **Using `<script setup>`** with TypeScript
- [ ] **Props typed with `defineProps<T>()`**
- [ ] **Emits typed with `defineEmits<T>()`**
- [ ] **Data-testid attributes** for testable elements

### Vue-Specific

- [ ] **No v-html with user input** (or sanitized with DOMPurify)
- [ ] **v-for has unique :key**
- [ ] **No v-if with v-for** on same element
- [ ] **Computed used for derived state** (not methods)
- [ ] **Watchers have cleanup** if needed

### Testing

- [ ] **Tests pass** - `pnpm test:unit --run`
- [ ] **New code has tests**
- [ ] **Coverage maintained** (>= 80%)

### Security

- [ ] **No hardcoded secrets**
- [ ] **No sensitive data in localStorage**
- [ ] **URLs validated before binding**

## Automated via Husky

```bash
# .husky/pre-commit
pnpm lint-staged
pnpm type-check
```

## Commands

```bash
# Full pre-commit check
pnpm lint && pnpm type-check && pnpm test:unit --run

# Auto-fix issues
pnpm lint:fix && pnpm format

# Check specific file
pnpm eslint src/components/MyComponent.vue --fix
```
