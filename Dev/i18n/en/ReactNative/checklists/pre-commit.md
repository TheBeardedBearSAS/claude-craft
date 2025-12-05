# Pre-Commit Checklist

This checklist must be validated **before each commit**.

---

## Code Quality

- [ ] Code linted with 0 errors (`npm run lint`)
- [ ] Code formatted with Prettier (`npm run format`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] No forgotten `console.log` (except intentional logs)
- [ ] No `// TODO` or `// FIXME` added without associated issue
- [ ] No commented code (delete or create issue)

---

## Tests

- [ ] Unit tests added for new logic
- [ ] Component tests added for new UI
- [ ] All tests pass (`npm test`)
- [ ] Coverage maintained or improved
- [ ] E2E tests updated if necessary

---

## Code Standards

- [ ] Naming conventions respected
- [ ] Imports organized correctly
- [ ] No code duplication (DRY)
- [ ] JSDoc comments for public functions
- [ ] Complete TypeScript types (no `any`)
- [ ] React.memo components if necessary
- [ ] useCallback/useMemo used correctly

---

## Performance

- [ ] No expensive calculations without memoization
- [ ] Images optimized (size, format)
- [ ] FlatList optimized (if applicable)
- [ ] No inline functions in renders
- [ ] No inline style objects
- [ ] Animations use `useNativeDriver`

---

## Security

- [ ] No secrets/tokens in code
- [ ] Input validation in place
- [ ] Sensitive data in SecureStore
- [ ] API calls use HTTPS
- [ ] No dependency vulnerabilities (`npm audit`)

---

## Architecture

- [ ] Respect established architecture
- [ ] Single responsibility (SRP)
- [ ] Separation of concerns
- [ ] No tight coupling
- [ ] Dependency injection used

---

## Documentation

- [ ] README updated if necessary
- [ ] JSDoc added for new APIs
- [ ] Comments for complex logic
- [ ] CHANGELOG updated
- [ ] Types documented

---

## Git

- [ ] Commit message follows Conventional Commits
- [ ] Atomic commit (single feature/fix)
- [ ] No irrelevant files committed
- [ ] .gitignore respected
- [ ] Branch up to date with main/develop

---

## Final Check

- [ ] Complete diff reviewed
- [ ] Feature tested manually
- [ ] No undocumented breaking changes
- [ ] Ready for code review

---

**If all items are checked ✅ → Commit authorized**
