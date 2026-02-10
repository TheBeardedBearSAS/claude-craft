# Git Workflow

## Overview

The Git workflow is based on **GitHub Flow** with **Conventional Commits** mandatory.

**Principles:**
- `main` branch always deployable
- Short-lived feature branches (< 3 days)
- Pull Requests mandatory
- Code review before merge
- CI must pass (tests + quality)

---

## Table of Contents

1. [GitHub Flow](#github-flow)
2. [Conventional Commits](#conventional-commits)
3. [Branches](#branches)
4. [Pull Requests](#pull-requests)
5. [Code Review](#code-review)
6. [PR Checklist](#pr-checklist)

---

## GitHub Flow

### Workflow

```
main (production-ready)
  |
  +-> feature/add-user-authentication
  |   |
  |   +- commit: feat: add login form
  |   +- commit: feat: add auth service
  |   +- commit: test: add auth tests
  |   |
  |   +-> Pull Request -> Code Review -> Merge
  |
  +-> main (updated)
```

### Rules

1. **`main` is always deployable**
2. **New feature = new branch**
3. **Atomic and tested commits**
4. **PR + Review mandatory**
5. **CI must pass before merge**
6. **Squash merge for clean history**

---

## Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Mandatory Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add login endpoint` |
| `fix` | Bug fix | `fix(cart): correct total calculation` |
| `docs` | Documentation only | `docs(readme): update installation steps` |
| `style` | Formatting (no code change) | `style: apply formatter` |
| `refactor` | Refactoring (neither feat nor fix) | `refactor(user): extract validation logic` |
| `perf` | Performance improvement | `perf(query): add index on created_at` |
| `test` | Add/fix tests | `test(auth): add edge cases` |
| `build` | Build system, external deps | `build: upgrade framework to v2.0` |
| `ci` | CI/CD configuration | `ci: add lint step to pipeline` |
| `chore` | Other (no prod code) | `chore: update .gitignore` |

### Recommended Scopes

Use the bounded contexts or modules of your project:
- `auth` - Authentication
- `user` - User management
- `order` - Orders
- `payment` - Payments
- `notification` - Notifications
- `infra` - Infrastructure

### Commit Examples

#### GOOD

```bash
# Feature
git commit -m "feat(auth): add JWT token generation

Implement JWT token generation with:
- Access token (15min expiry)
- Refresh token (7 days expiry)
- Token validation middleware

Closes #123"

# Fix
git commit -m "fix(cart): correct discount calculation

Discount was applied before tax calculation,
causing incorrect total. Now applies tax first,
then discount on the subtotal.

Fixes #456"

# Test
git commit -m "test(user): add email validation tests

Add edge cases:
- Empty email
- Invalid format
- Already existing email"

# Refactor
git commit -m "refactor(payment): extract gateway interface

Extract payment logic into separate gateway classes
following Strategy pattern:
- StripeGateway
- PayPalGateway
- BankTransferGateway"
```

#### BAD

```bash
# Too vague
git commit -m "fix bug"

# No type
git commit -m "add new feature"

# No scope
git commit -m "feat: stuff"

# Too long (> 72 chars)
git commit -m "feat(user): implement the complete user management system with registration, login, password reset and email notifications"

# Multiple unrelated changes
git commit -m "feat: add login + fix email + update docs"
```

### Validation Tools

#### Commitlint

```json
// .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore"
    ]],
    "subject-max-length": [2, "always", 72]
  }
}
```

#### Git hooks

```bash
# .husky/commit-msg
#!/bin/sh
npx --no-install commitlint --edit "$1"
```

---

## Branches

### Naming Convention

```
<type>/<short-description>
```

**Types:**
- `feature/` - New feature
- `fix/` - Bug fix
- `refactor/` - Refactoring
- `docs/` - Documentation
- `chore/` - Maintenance

### Examples

```bash
# GOOD
feature/add-user-registration
feature/payment-integration
fix/login-validation-error
refactor/extract-auth-service
docs/update-api-documentation
chore/upgrade-dependencies

# BAD
dev-branch
my-work
bug-fix
feature123
```

### Branch Creation

```bash
# Always start from an up-to-date main
git checkout main
git pull origin main

# Create the feature branch
git checkout -b feature/add-user-registration

# Work on the feature
# ... commits ...

# Push the branch
git push -u origin feature/add-user-registration
```

### Lifetime

- **Maximum 3 days** of development
- If > 3 days -> **split** into multiple PRs
- Merge as soon as functional (even if incomplete)
- Use **feature flags** if necessary

---

## Pull Requests

### PR Template

```markdown
## Description

<!-- Describe the changes in this PR -->

Closes #[issue_number]

## Type of Change

- [ ] New feature (feat)
- [ ] Bug fix (fix)
- [ ] Documentation (docs)
- [ ] Refactoring (refactor)
- [ ] Performance (perf)
- [ ] Tests (test)

## Checklist

### Code

- [ ] Code follows project standards
- [ ] I have performed a self-review of my code
- [ ] I have commented complex parts
- [ ] Linter passes without errors
- [ ] Formatter applied

### Tests

- [ ] Unit tests added/updated
- [ ] Integration tests if needed
- [ ] Code coverage >= 80%
- [ ] All tests pass

### Documentation

- [ ] README updated if needed
- [ ] API documentation up to date
- [ ] CHANGELOG.md updated

### Architecture

- [ ] SOLID principles applied
- [ ] DRY respected (no duplication)
- [ ] YAGNI respected (no unnecessary code)

### Security

- [ ] No sensitive data in plain text
- [ ] Input validation
- [ ] No secrets in the code

## Screenshots

<!-- If UI change, add screenshots -->

## Notes for Reviewers

<!-- Indicate points to pay special attention to -->
```

### Labels

| Label | Usage |
|-------|-------|
| `enhancement` | New feature |
| `bug` | Bug fix |
| `documentation` | Documentation only |
| `refactoring` | Refactoring |
| `performance` | Performance improvement |
| `security` | Security |
| `breaking-change` | Breaking change |
| `needs-review` | Awaiting review |
| `work-in-progress` | WIP |
| `ready-to-merge` | Ready for merge |

---

## Code Review

### Reviewer Checklist

#### Architecture
- [ ] SOLID principles respected
- [ ] Layers well separated
- [ ] No inverted dependencies

#### Code Quality
- [ ] KISS / DRY / YAGNI applied
- [ ] Explicit naming
- [ ] No code duplication
- [ ] Acceptable complexity (< 10)
- [ ] Short methods (< 20 lines)

#### Tests
- [ ] Tests for business logic
- [ ] Coverage >= 80%
- [ ] All tests pass
- [ ] No commented-out tests

#### Security
- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] XSS/CSRF protection

#### Performance
- [ ] No N+1 queries
- [ ] Appropriate indexes
- [ ] Pagination if needed

### Review Process

1. **Self-review** (author)
   - Re-read your own code
   - Verify the PR checklist
   - Test manually

2. **First pass** (reviewer)
   - Overall architecture
   - Business logic
   - Tests

3. **Second pass** (reviewer)
   - Implementation details
   - Naming
   - Optimizations

4. **Comments**
   - Constructive and kind
   - Suggest solutions
   - Explain the "why"

5. **Approval**
   - Approve -> Ready for merge
   - Comment -> Non-blocking suggestions
   - Request changes -> Corrections needed

### Comment Examples

#### GOOD (constructive)

```
Suggestion: This method does multiple things (calculation + validation).
What do you think about splitting it into two separate methods to respect SRP?

Example:
- validate(data)
- calculate(data)
```

#### BAD (non-constructive)

```
This code is terrible, it all needs to be redone.
```

---

## PR Checklist

### Before creating the PR

```bash
# 1. Tests pass
make test

# 2. Coverage OK
make test-coverage
# Verify: >= 80%

# 3. Quality OK
make quality
# Linter: 0 errors
# Formatter: applied

# 4. Self-review
git diff main...HEAD
```

### During the review

```bash
# Apply reviewer suggestions
git add .
git commit -m "fix: apply code review suggestions"
git push

# Rebase if needed
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Before the merge

```bash
# 1. Branch up to date
git fetch origin
git rebase origin/main

# 2. CI passes
# -> Check CI/CD pipeline

# 3. Review approved
# -> At least 1 approval

# 4. Merge
# -> Squash and merge (clean history)
```

---

## Complete Workflow

### Feature

```bash
# 1. Create branch
git checkout main
git pull
git checkout -b feature/add-payment-integration

# 2. TDD: Test first (RED)
git add tests/
git commit -m "test(payment): add integration tests"

# 3. Implementation (GREEN)
git add src/
git commit -m "feat(payment): add Stripe gateway"

# 4. Refactor
git add src/
git commit -m "refactor(payment): extract gateway interface"

# 5. Documentation
git add docs/
git commit -m "docs(payment): document payment flow"

# 6. Push + PR
git push -u origin feature/add-payment-integration
gh pr create --fill

# 7. Review + corrections
git add .
git commit -m "fix: apply review suggestions"
git push

# 8. Merge via UI (Squash and merge)

# 9. Cleanup
git checkout main
git pull
git branch -d feature/add-payment-integration
```

### Hotfix

```bash
# 1. Create branch from main
git checkout main
git pull
git checkout -b fix/critical-auth-bug

# 2. Fix + test
git add src/ tests/
git commit -m "fix(auth): correct token validation

Token expiry check was using wrong timezone.
Added test to prevent regression.

Fixes #789"

# 3. Push + express PR
git push -u origin fix/critical-auth-bug
gh pr create --fill --label "bug,urgent"

# 4. Quick review + merge

# 5. Cleanup
git checkout main
git pull
git branch -d fix/critical-auth-bug
```

---

## Resources

- **GitHub Flow:** [Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Specification](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentation](https://commitlint.js.org/)
- **Git Best Practices:** [Atlassian Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Last updated:** 2025-01
**Version:** 1.0.0
**Author:** The Bearded CTO
