# Git Workflow - Conventional Commits

## Branching Strategy

### Main Branches

\`\`\`
main (production)
├── develop (staging)
    ├── feature/user-authentication
    ├── feature/article-list
    ├── bugfix/login-crash
    └── hotfix/security-patch
\`\`\`

### Branch Naming

\`\`\`bash
# Features
feature/feature-name
feature/auth-social-login
feature/offline-mode

# Bug fixes
bugfix/bug-description
bugfix/profile-image-upload

# Hotfixes
hotfix/critical-fix
hotfix/payment-gateway

# Releases
release/v1.2.0
\`\`\`

---

## Conventional Commits

### Format

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting (no code change)
- **refactor**: Code restructuring
- **perf**: Performance improvement
- **test**: Adding tests
- **chore**: Build/tooling changes
- **ci**: CI/CD changes

### Examples

\`\`\`bash
# Feature
feat(auth): add social login with Google

Implements OAuth2 flow for Google authentication.
Users can now login using their Google account.

Closes #123

# Bug fix
fix(profile): resolve image upload crash on Android

The app was crashing when uploading images larger than 5MB
on Android devices. Added image compression before upload.

Fixes #456

# Performance
perf(articles): optimize FlatList rendering

- Added getItemLayout for better scrolling
- Implemented React.memo for ArticleCard
- Reduced re-renders by 60%

# Breaking change
feat(api)!: migrate to v2 API endpoints

BREAKING CHANGE: All API endpoints now use /v2/ prefix.
Update your API_BASE_URL configuration.

Migration guide: docs/migration-v2.md
\`\`\`

---

## Workflow

### Feature Development

\`\`\`bash
# 1. Create feature branch
git checkout -b feature/article-favorites

# 2. Work on feature
# Make changes...

# 3. Commit changes
git add .
git commit -m "feat(articles): add favorite functionality"

# 4. Push to remote
git push -u origin feature/article-favorites

# 5. Create Pull Request
gh pr create --title "Add article favorites" --body "Implements #123"

# 6. After review, merge to develop
git checkout develop
git merge feature/article-favorites
git push origin develop

# 7. Delete feature branch
git branch -d feature/article-favorites
git push origin --delete feature/article-favorites
\`\`\`

### Hotfix Process

\`\`\`bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-security-fix

# 2. Fix issue
# Make changes...

# 3. Commit
git commit -m "fix(auth): patch security vulnerability"

# 4. Merge to main
git checkout main
git merge hotfix/critical-security-fix
git tag -a v1.2.1 -m "Security hotfix"
git push origin main --tags

# 5. Merge to develop
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# 6. Delete branch
git branch -d hotfix/critical-security-fix
\`\`\`

---

## Pull Request Template

\`\`\`.github/pull_request_template.md
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally

## Screenshots (if applicable)

## Related Issues
Closes #
\`\`\`

---

## Commit Messages Best Practices

### DO

\`\`\`bash
✅ feat(auth): implement biometric authentication
✅ fix(navigation): resolve deep link routing issue
✅ perf(images): add lazy loading for gallery
✅ docs(readme): update setup instructions
\`\`\`

### DON'T

\`\`\`bash
❌ fixed stuff
❌ WIP
❌ updates
❌ changed files
\`\`\`

---

## Useful Git Commands

\`\`\`bash
# Amend last commit
git commit --amend -m "new message"

# Interactive rebase (clean history)
git rebase -i HEAD~3

# Stash changes
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Reset to remote
git reset --hard origin/main

# View history
git log --oneline --graph --all
\`\`\`

---

## Checklist Git Workflow

- [ ] Branches nommées correctement
- [ ] Commits suivent Conventional Commits
- [ ] Messages de commit descriptifs
- [ ] PR template utilisé
- [ ] Code review avant merge
- [ ] Tests passent avant merge
- [ ] Branch supprimée après merge

---

**Un historique Git propre facilite la collaboration et le débogage.**
