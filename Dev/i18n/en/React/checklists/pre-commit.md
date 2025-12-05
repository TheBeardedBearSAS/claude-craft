# Pre-Commit Checklist - React

## Quick Validation Before Each Commit

### Code Quality

- [ ] Code is formatted (`npm run format` or `pnpm format`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] No unused imports or variables
- [ ] No `console.log` or `debugger` statements

### Tests

- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Modified tests reflect changes
- [ ] Test coverage maintained or improved

### Build

- [ ] Application builds successfully (`npm run build`)
- [ ] No build warnings
- [ ] Bundle size is acceptable

### Security

- [ ] No hardcoded secrets or API keys
- [ ] No sensitive data in comments
- [ ] User inputs are validated

### Documentation

- [ ] Code comments are clear and useful
- [ ] Props are documented (JSDoc/TSDoc)
- [ ] README updated if necessary
- [ ] CHANGELOG updated if applicable

### Git

- [ ] Commit message is clear and follows conventions
- [ ] Branch is up to date with main/develop
- [ ] No unnecessary files committed
- [ ] .gitignore is respected

## Automated Validation (Husky + Lint-staged)

### Configuration Example

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## Quick Commands

```bash
# Complete validation
npm run quality    # lint + type-check + test

# Quick fix
npm run lint:fix   # Auto-fix lint errors
npm run format     # Format all files

# Verify build
npm run build      # Production build
```

## Common Issues

### Formatting

```bash
# Format all files
npm run format

# Check formatting without modifying
npm run format:check
```

### Linting

```bash
# Auto-fix errors
npm run lint:fix

# Check specific file
eslint src/components/MyComponent.tsx
```

### TypeScript

```bash
# Check types
npm run type-check

# Watch mode
tsc --noEmit --watch
```

### Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- Button.test.tsx

# Update snapshots
npm test -- -u
```

## Before Push

- [ ] All commits follow conventions
- [ ] Branch is rebased on main/develop
- [ ] Conflicts are resolved
- [ ] CI/CD pipeline will pass

## Notes

- Configure pre-commit hooks with Husky for automatic validation
- Use lint-staged to check only modified files
- Keep commits small and focused
- Write clear commit messages
