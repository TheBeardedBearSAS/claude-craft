# Rule 09: Git Workflow

Git workflow and best practices for collaboration.

## Branching Strategy

### Main Branches

- **main**: Production code, always deployable
- **develop**: Integration branch for features (optional)

### Feature Branches

Create a branch for each feature or fix:

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# Create fix branch
git checkout -b fix/login-bug

# Create hotfix branch (urgent)
git checkout -b hotfix/critical-security-issue
```

### Branch Naming

```
feature/short-description     # New feature
fix/short-description         # Bug fix
hotfix/short-description      # Urgent fix
refactor/short-description    # Refactoring
docs/short-description        # Documentation
test/short-description        # Tests
chore/short-description       # Maintenance
```

## Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, no code change
- **refactor**: Code refactoring
- **test**: Adding/updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvement
- **ci**: CI/CD changes
- **build**: Build system changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add JWT authentication

Implement JWT-based authentication system with:
- Token generation
- Token validation
- Refresh token mechanism

Closes #123"

# Bug fix
git commit -m "fix(user): handle null email in validation

Add null check before email validation to prevent
NullPointerException.

Fixes #456"

# Breaking change
git commit -m "feat(api)!: change user endpoint response format

BREAKING CHANGE: User API now returns nested object structure
instead of flat fields. Clients must update their parsers.

Migration guide: docs/migrations/v2-user-api.md"

# Multiple changes
git commit -m "chore: update dependencies

- Update FastAPI to 0.109.0
- Update Pydantic to 2.5.0
- Update SQLAlchemy to 2.0.25

All tests passing after updates."
```

## Commit Guidelines

### Atomic Commits

Each commit should be a single logical change.

```bash
# ❌ Bad: Giant commit with multiple unrelated changes
git add .
git commit -m "Updated stuff"

# ✅ Good: Separate atomic commits
git add src/domain/entities/user.py
git commit -m "feat(domain): add User entity with email validation"

git add src/application/use_cases/create_user.py
git commit -m "feat(application): add CreateUser use case"

git add tests/unit/domain/test_user.py
git commit -m "test(domain): add User entity tests"
```

### Commit Often

Commit frequently, even if changes are small.

```bash
# Commit after each meaningful change
git commit -m "feat(auth): add password hashing"
git commit -m "feat(auth): add password validation rules"
git commit -m "test(auth): add password hashing tests"
```

### Good Commit Messages

```bash
# ❌ Bad messages
git commit -m "fix"
git commit -m "updated code"
git commit -m "WIP"
git commit -m "fixes"

# ✅ Good messages
git commit -m "fix(api): validate request body before processing"
git commit -m "refactor(repository): extract query builder logic"
git commit -m "docs(readme): add installation instructions"
git commit -m "test(user): add edge cases for email validation"
```

## Pull Request Workflow

### 1. Create Branch

```bash
git checkout -b feature/user-notifications
```

### 2. Make Changes

```bash
# Make changes
# Write tests
# Commit atomically

git add tests/test_notifications.py
git commit -m "test(notifications): add notification service tests"

git add src/services/notification_service.py
git commit -m "feat(notifications): implement email notification service"
```

### 3. Keep Branch Updated

```bash
# Rebase on main regularly
git fetch origin
git rebase origin/main

# Or merge if conflicts
git merge origin/main
```

### 4. Run Checks

```bash
# Before pushing, ensure quality
make quality  # lint, type-check, test

# Or individually
make lint
make type-check
make test-cov
```

### 5. Push Branch

```bash
git push origin feature/user-notifications
```

### 6. Create Pull Request

PR description template:

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- Change 1: Description
- Change 2: Description
- Change 3: Description

## Type of Change
- [ ] New feature (feat)
- [ ] Bug fix (fix)
- [ ] Refactoring (refactor)
- [ ] Documentation (docs)
- [ ] Tests (test)

## Testing
How this was tested:
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All tests passing locally

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added that prove fix/feature works
- [ ] Dependent changes merged

## Related Issues
Closes #123
Relates to #456

## Screenshots (if applicable)
[Add screenshots for UI changes]
```

### 7. Code Review

Address reviewer comments:

```bash
# Make requested changes
git add .
git commit -m "refactor(user): extract validation to separate method

Address review comment from @reviewer"

git push origin feature/user-notifications
```

### 8. Merge

```bash
# After approval, merge via GitHub/GitLab UI
# Usually "Squash and merge" for clean history

# Delete branch after merge
git checkout main
git pull origin main
git branch -d feature/user-notifications
git push origin --delete feature/user-notifications
```

## Useful Git Commands

### Check Status

```bash
# See what's changed
git status

# See detailed changes
git diff

# See staged changes
git diff --staged

# See commit history
git log --oneline --graph --all
```

### Undo Changes

```bash
# Discard unstaged changes
git checkout -- file.py

# Unstage file
git reset HEAD file.py

# Amend last commit (if not pushed)
git commit --amend

# Reset to previous commit (careful!)
git reset --hard HEAD~1

# Revert commit (safe, creates new commit)
git revert <commit-hash>
```

### Interactive Rebase

```bash
# Clean up commits before PR
git rebase -i HEAD~3

# In editor:
# pick = keep commit
# reword = change message
# squash = combine with previous
# fixup = combine without message
# drop = remove commit
```

### Stash Changes

```bash
# Stash current changes
git stash

# List stashes
git stash list

# Apply latest stash
git stash apply

# Apply and remove stash
git stash pop

# Stash with message
git stash save "WIP: user authentication"
```

## Git Configuration

```bash
# User configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Editor
git config --global core.editor "code --wait"

# Aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg 'log --oneline --graph --all'

# Auto-setup remote branch
git config --global push.default current
```

## .gitignore

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Type checking
.mypy_cache/
.dmypy.json
dmypy.json

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

## Checklist

- [ ] Branch follows naming convention
- [ ] Commits are atomic and follow Conventional Commits
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main
- [ ] All checks pass (lint, type-check, tests)
- [ ] PR description is complete
- [ ] Self-review performed
- [ ] No merge conflicts
- [ ] No temporary/debug code
- [ ] No commented code
- [ ] No secrets committed
