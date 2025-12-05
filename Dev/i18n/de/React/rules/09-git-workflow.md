# Git Workflow and Version Management

## Branching Strategy - Git Flow

### Main Branches

```
main (production)
  └── develop (integration)
      ├── feature/* (new features)
      ├── fix/* (bug fixes)
      ├── refactor/* (refactoring)
      └── hotfix/* (urgent fixes)
```

### Branch Structure

#### 1. Main (Production)

- **Purpose**: Production code
- **Protection**: Protected branch, no direct push
- **Merge**: Only via Pull Request from `develop` or `hotfix/*`
- **Tags**: All merges are tagged with a version

```bash
# Merge from develop
git checkout main
git merge --no-ff develop -m "Release v1.2.0"
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags
```

#### 2. Develop (Development)

- **Purpose**: Feature integration
- **Base**: Starting branch for all features
- **Protection**: Protected branch, merge via PR only

#### 3. Feature Branches

- **Naming**: `feature/TICKET-description`
- **Base**: Created from `develop`
- **Merge**: To `develop` via Pull Request

```bash
# Create a feature branch
git checkout develop
git pull origin develop
git checkout -b feature/USER-123-add-login-form

# Work on the feature
git add .
git commit -m "feat(auth): add login form component"

# Push the branch
git push -u origin feature/USER-123-add-login-form

# Create a Pull Request on GitHub/GitLab
```

#### 4. Fix Branches

- **Naming**: `fix/TICKET-description`
- **Base**: Created from `develop`
- **Merge**: To `develop` via Pull Request

```bash
# Create a fix branch
git checkout develop
git pull origin develop
git checkout -b fix/BUG-456-fix-user-validation

# Fix the bug
git add .
git commit -m "fix(validation): resolve email validation issue"

# Push and create PR
git push -u origin fix/BUG-456-fix-user-validation
```

#### 5. Hotfix Branches

- **Naming**: `hotfix/v1.2.1-description`
- **Base**: Created from `main` (production)
- **Merge**: To `main` AND `develop`

```bash
# Create a hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1-critical-security-fix

# Apply the hotfix
git add .
git commit -m "fix(security): patch XSS vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/v1.2.1-critical-security-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1 - Security patch"
git push origin main --tags

# Merge to develop
git checkout develop
git merge --no-ff hotfix/v1.2.1-critical-security-fix
git push origin develop

# Delete the hotfix branch
git branch -d hotfix/v1.2.1-critical-security-fix
git push origin --delete hotfix/v1.2.1-critical-security-fix
```

#### 6. Refactor Branches

- **Naming**: `refactor/description`
- **Base**: Created from `develop`
- **Merge**: To `develop` via Pull Request

```bash
git checkout -b refactor/optimize-user-hooks
git commit -m "refactor(hooks): extract common user logic"
git push -u origin refactor/optimize-user-hooks
```

## Conventional Commits

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code refactoring
- **perf**: Performance improvement
- **test**: Adding tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes (dependencies, etc.)
- **revert**: Revert a previous commit

### Scopes (Examples)

- **auth**: Authentication
- **user**: User management
- **product**: Products
- **api**: API
- **ui**: User interface
- **hooks**: Custom hooks
- **utils**: Utilities
- **config**: Configuration

### Commit Examples

```bash
# Feature
feat(auth): add OAuth2 authentication flow

Implement Google and Facebook OAuth2 authentication.
- Add OAuth2 provider configuration
- Create authentication callback handlers
- Implement token exchange logic

Closes #USER-123

# Fix
fix(validation): resolve email validation regex issue

The email regex was not accepting valid TLDs like .technology
Updated regex pattern to allow longer TLDs

Fixes #BUG-456

# Breaking Change
feat(api)!: change user API response structure

BREAKING CHANGE: User API now returns { data: User, meta: Metadata }
instead of just User object.

Migration guide:
- Update all API calls to access response.data
- Handle pagination with response.meta

Closes #API-789

# Refactoring
refactor(hooks): extract common data fetching logic

Extract useQuery patterns into reusable hooks to reduce code duplication

# Performance
perf(list): implement virtual scrolling for large lists

Improve performance with react-window for lists > 100 items

# Documentation
docs(readme): add installation instructions

Add step-by-step installation guide for new developers

# Tests
test(auth): add unit tests for login component

Increase test coverage from 65% to 85%

# Build
build(deps): upgrade react to v18.3

# CI
ci(github): add automated E2E tests workflow

# Chore
chore(deps): update dependencies

# Revert
revert: feat(auth): add OAuth2 authentication flow

This reverts commit abc123def456.
Reason: OAuth2 integration causing production issues
```

### Commit Message Guidelines

#### Subject Line

```bash
# ✅ Good
feat(auth): add login form validation

# ❌ Bad
Added some stuff

# ✅ Good - Imperative
fix(api): resolve timeout issue

# ❌ Bad - Past tense
fixed the timeout issue

# ✅ Good - Concise
refactor(hooks): simplify useAuth

# ❌ Bad - Too long
refactor(hooks): simplify the useAuth hook by extracting the validation logic and removing duplicate code
```

#### Body (Optional but Recommended)

```bash
feat(user): add user profile editing

Implement complete user profile editing functionality including:
- Profile picture upload with preview
- Form validation using Zod
- Optimistic updates with React Query
- Error handling and rollback

The implementation follows the established patterns in the codebase
and includes comprehensive unit and integration tests.

Closes #USER-123
```

#### Footer

```bash
# Reference issues
Closes #123
Fixes #456
Resolves #789

# Multiple issues
Closes #123, #456, #789

# Breaking changes
BREAKING CHANGE: API response structure changed
```

## Pull Request Workflow

### Creating a Pull Request

```bash
# 1. Ensure branch is up to date
git checkout develop
git pull origin develop

# 2. Rebase the feature branch
git checkout feature/USER-123-add-login-form
git rebase develop

# 3. Resolve conflicts if necessary
# 4. Push changes
git push origin feature/USER-123-add-login-form --force-with-lease

# 5. Create PR on GitHub/GitLab
```

### Pull Request Template

```markdown
## Description

Brief description of the changes in this PR.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## Related Issues

Closes #123
Related to #456

## Changes Made

- Added user authentication flow
- Implemented JWT token validation
- Created login and registration forms
- Added unit tests for auth components

## Screenshots (if applicable)

[Add screenshots here]

## Testing

### How Has This Been Tested?

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

### Test Configuration

- Node version: 20.x
- Browser: Chrome 120

## Checklist

- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Performance Impact

- [ ] No performance impact
- [ ] Minor performance improvement
- [ ] Significant performance improvement
- [ ] Performance regression (explain why acceptable)

## Security Considerations

- [ ] No security impact
- [ ] Security improvement
- [ ] Potential security concern (explained below)

## Additional Notes

Any additional information that reviewers should know.
```

### Code Review Process

#### For the Reviewer

```bash
# 1. Fetch the branch
git fetch origin
git checkout feature/USER-123-add-login-form

# 2. Test locally
pnpm install
pnpm dev

# 3. Check tests
pnpm test
pnpm lint
pnpm type-check

# 4. Review the code
# - Check code quality
# - Check tests
# - Check documentation
# - Manual testing

# 5. Approve or request changes
```

#### Reviewer Checklist

- [ ] Code follows project standards
- [ ] Tests are complete and passing
- [ ] No duplicate code
- [ ] No hard-coded values
- [ ] Documentation is up to date
- [ ] No leftover console.log
- [ ] Acceptable performance
- [ ] Security respected
- [ ] Accessibility respected
- [ ] Responsive design (if UI)

## Conflict Management

### Resolving Conflicts During Rebase

```bash
# 1. Start the rebase
git checkout feature/my-feature
git rebase develop

# 2. If conflict, Git stops
# Edit conflicting files

# 3. Mark as resolved
git add <resolved-files>
git rebase --continue

# 4. If too many conflicts, abort
git rebase --abort

# 5. Push (force with lease)
git push --force-with-lease origin feature/my-feature
```

### Resolving Conflicts During Merge

```bash
# 1. Merge develop into feature
git checkout feature/my-feature
git merge develop

# 2. Resolve conflicts
# Edit files

# 3. Commit the resolution
git add <resolved-files>
git commit -m "merge: resolve conflicts with develop"

# 4. Push
git push origin feature/my-feature
```

## Git Hooks (Automation)

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Lint staged files
npx lint-staged

# Type check
npm run type-check

# If everything passes, commit continues
exit 0
```

### Commit-msg Hook

```bash
#!/bin/sh
# .husky/commit-msg

# Validate commit message
npx --no -- commitlint --edit ${1}
```

### Pre-push Hook

```bash
#!/bin/sh
# .husky/pre-push

# Run tests before push
npm run test:run

# Build to ensure no build errors
npm run build

exit 0
```

## Semantic Versioning

### Format: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)

### Examples

```bash
# Patch release (bug fix)
git tag -a v1.0.1 -m "Fix: resolve user validation issue"

# Minor release (new feature)
git tag -a v1.1.0 -m "Feature: add dark mode support"

# Major release (breaking change)
git tag -a v2.0.0 -m "Breaking: new API structure"

# Push tags
git push origin --tags
```

### Automatic Changelog

```bash
# Install standard-version
npm install -D standard-version

# Add to package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}

# Generate a release
npm run release
# Automatically generates:
# - Version bump in package.json
# - Git tag
# - Updated CHANGELOG.md

git push --follow-tags origin main
```

## Git Best Practices

### 1. Atomic Commits

```bash
# ✅ Good - Separate commits
git commit -m "feat(auth): add login form"
git commit -m "test(auth): add login form tests"
git commit -m "docs(auth): document login flow"

# ❌ Bad - Everything in one commit
git commit -m "Add login feature with tests and docs"
```

### 2. Short Branches

- Feature branches: < 3 days
- Merge quickly and often
- Avoid long-lived branches

### 3. Rebase vs Merge

```bash
# Rebase for feature branches (linear history)
git checkout feature/my-feature
git rebase develop

# Merge to integrate into develop (preserve history)
git checkout develop
git merge --no-ff feature/my-feature
```

### 4. Safe Force Push

```bash
# ❌ Dangerous
git push --force

# ✅ Safe
git push --force-with-lease
```

### 5. Keep develop and main up to date

```bash
# Sync regularly
git checkout develop
git pull origin develop

git checkout main
git pull origin main
```

## Gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
dist/
build/
.next/
out/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary files
*.log
tmp/
temp/

# Build info
.tsbuildinfo
```

## Useful Git Aliases

```bash
# Add to ~/.gitconfig
[alias]
  # Short status
  st = status -sb

  # Commit
  cm = commit -m
  ca = commit --amend

  # Checkout
  co = checkout
  cob = checkout -b

  # Branch
  br = branch
  brd = branch -d

  # Pull/Push
  pl = pull
  ps = push
  pf = push --force-with-lease

  # Log
  lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
  last = log -1 HEAD

  # Rebase
  rb = rebase
  rbc = rebase --continue
  rba = rebase --abort

  # Stash
  st = stash
  stp = stash pop

  # Undo
  undo = reset --soft HEAD^
  unstage = reset HEAD --
```

## Conclusion

A good Git workflow enables:

1. ✅ **Collaboration**: Smooth teamwork
2. ✅ **Quality**: Systematic code review
3. ✅ **Traceability**: Clear history
4. ✅ **Security**: Protection of main branches
5. ✅ **Automation**: Hooks and CI/CD

**Golden rule**: Commit often, push regularly, merge quickly.
