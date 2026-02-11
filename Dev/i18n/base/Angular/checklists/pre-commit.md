# Angular Pre-Commit Checklist

## Before Committing

Run through this checklist before committing code changes.

### 1. Code Quality

- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No ESLint errors: `ng lint`
- [ ] Code is formatted: `npm run format:check`
- [ ] No console.log statements in production code

### 2. Tests

- [ ] All tests pass: `npm run test`
- [ ] New code has tests
- [ ] Coverage maintained: `npm run test:coverage`

### 3. Build

- [ ] Build succeeds: `ng build`
- [ ] No bundle size regressions

### 4. Angular Standards

- [ ] Components are standalone
- [ ] Components use OnPush change detection
- [ ] Signals used for local state
- [ ] Modern control flow (@if, @for)
- [ ] trackBy used in all @for loops

### 5. Security

- [ ] No sensitive data in code
- [ ] No bypassSecurityTrust* with user input
- [ ] Input validation on forms
- [ ] Routes properly protected

### 6. Documentation

- [ ] Complex logic documented
- [ ] Public API has JSDoc comments
- [ ] README updated if needed

## Quick Commands

```bash
# Run all checks
npm run lint && npm run test && ng build

# Fix formatting
npm run format

# Fix linting issues
ng lint --fix
```

## Commit Message Format

```
<type>(<scope>): <subject>

feat(users): add user profile component
fix(auth): handle token refresh error
docs(readme): update installation instructions
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance
