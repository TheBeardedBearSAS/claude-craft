# New Feature Development Checklist - React

## Before Starting

- [ ] Feature has been discussed and validated with the team
- [ ] Technical specifications are clear
- [ ] User stories are written and accepted
- [ ] Design mockups are available (if applicable)
- [ ] API contracts are defined (if applicable)

## Development

### Architecture

- [ ] Component structure is planned
- [ ] Data flow is defined (props, state, context)
- [ ] State management solution is chosen (if needed)
- [ ] Folder structure respects the project architecture

### Code

- [ ] Component follows SOLID principles
- [ ] Component is broken down into smaller components (if necessary)
- [ ] Props are properly typed (TypeScript)
- [ ] Business logic is separated from presentation
- [ ] Custom hooks are created for reusable logic
- [ ] Code is properly formatted (Prettier)
- [ ] Code passes linting without errors (ESLint)

### State Management

- [ ] Local state vs global state choice is justified
- [ ] State is normalized (no duplication)
- [ ] State updates are immutable
- [ ] Side effects are handled correctly (useEffect)

### Performance

- [ ] Components are memoized if necessary (React.memo, useMemo, useCallback)
- [ ] Heavy computations are optimized
- [ ] Lazy loading is implemented for large components
- [ ] Images are optimized
- [ ] API calls are debounced/throttled if necessary

### Accessibility

- [ ] Semantic HTML is used
- [ ] ARIA labels are present where needed
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Screen reader tested (if possible)

### Tests

- [ ] Unit tests are written (components, hooks)
- [ ] Test coverage is sufficient (>80%)
- [ ] Edge cases are tested
- [ ] Integration tests are written (if necessary)
- [ ] E2E tests are written for critical flows

### Security

- [ ] User inputs are validated and sanitized
- [ ] No secrets in the code
- [ ] XSS vulnerabilities are checked
- [ ] CSRF protection is implemented (if applicable)

### Documentation

- [ ] Component is documented (JSDoc/TSDoc)
- [ ] Props are documented
- [ ] Usage examples are provided
- [ ] README is updated (if necessary)
- [ ] Storybook story is created (if applicable)

## Before Committing

- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] No console.log or debugger left behind
- [ ] Build works (`npm run build`)
- [ ] Changes tested locally
- [ ] Commit message is clear and follows conventions

## Code Review

- [ ] PR has a clear description
- [ ] Screenshots/GIFs are provided (if UI changes)
- [ ] Related ticket is referenced
- [ ] Reviewers are assigned
- [ ] CI/CD pipeline passes
- [ ] Changes approved by at least one reviewer

## After Merge

- [ ] Feature deployed to staging
- [ ] Feature tested in staging
- [ ] Feature validated by Product Owner
- [ ] Feature deployed to production
- [ ] Production monitoring checked
- [ ] Documentation updated (if needed)

## Notes

- This checklist is a guide, adapt it to your project
- Some items may not be applicable to all features
- Use your judgment to determine what's important
