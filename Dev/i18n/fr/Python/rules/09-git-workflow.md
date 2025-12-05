# Workflow Git & Conventional Commits

## Branches

### Convention de Nommage

```
type/description-courte

Exemples:
feature/user-authentication
fix/payment-validation
refactor/user-service
docs/api-documentation
chore/update-dependencies
```

### Types de Branches

- **feature/** - Nouvelles fonctionnalités
- **fix/** - Corrections de bugs
- **refactor/** - Refactoring
- **docs/** - Documentation
- **chore/** - Maintenance (deps, config, etc.)
- **test/** - Ajout/amélioration de tests
- **perf/** - Optimisations de performance

### Workflow

```bash
# 1. Créer branche depuis main
git checkout main
git pull origin main
git checkout -b feature/user-notifications

# 2. Travailler sur la branche
# ... faire des modifications ...
git add .
git commit -m "feat(notifications): add email notification service"

# 3. Pusher régulièrement
git push origin feature/user-notifications

# 4. Avant merger: rebaser sur main
git checkout main
git pull origin main
git checkout feature/user-notifications
git rebase main

# 5. Créer PR
gh pr create --title "Add user notification system" --body "..."

# 6. Après review: squash et merge
```

## Conventional Commits

### Format

```
type(scope): subject

body (optionnel)

footer (optionnel)
```

### Types

- **feat**: Nouvelle fonctionnalité
- **fix**: Correction de bug
- **docs**: Documentation uniquement
- **style**: Formatting, whitespace (pas de changement de code)
- **refactor**: Refactoring (ni feat ni fix)
- **perf**: Amélioration de performance
- **test**: Ajout/modification de tests
- **build**: Changement build system ou deps
- **ci**: Changement CI/CD
- **chore**: Autres changements (config, etc.)
- **revert**: Revert d'un commit précédent

### Scope (Optionnel)

Le scope indique quelle partie du code est affectée:

```
feat(auth): add JWT authentication
fix(payment): correct tax calculation
refactor(user): simplify user service
test(order): add integration tests
```

Scopes communs:
- Nom de module (auth, payment, order, user)
- Nom de feature (notifications, search, export)
- Type de changement (api, db, cache)

### Subject

- Impératif ("add" pas "added" ou "adds")
- Pas de majuscule au début
- Pas de point final
- Max 50 caractères

```
✅ add user notification system
✅ fix payment validation error
✅ update dependencies to latest versions

❌ Added user notification system
❌ Fix payment validation error.
❌ Updated the dependencies to the latest stable versions available
```

### Body (Optionnel)

- Explique le "pourquoi", pas le "quoi"
- Wrap à 72 caractères
- Séparé du subject par une ligne vide

```
feat(auth): add JWT authentication

Implement JWT-based authentication to replace session-based auth.
This provides better scalability and supports mobile clients.

- Add JWT token generation
- Add token validation middleware
- Update login endpoint to return tokens
```

### Footer (Optionnel)

- Breaking changes
- Issues closes
- Reviewers

```
feat(api): redesign user endpoints

BREAKING CHANGE: User API endpoints now use v2 schema

Closes #123, #456
```

## Exemples Complets

### Feature Simple

```
feat(notifications): add email notification service

Implement EmailService for sending transactional emails via SMTP.
```

### Fix avec Contexte

```
fix(payment): correct tax calculation for EU countries

The tax calculation was using wrong VAT rates for some EU countries.
Now uses the correct rates from the official EU database.

Fixes #789
```

### Breaking Change

```
feat(api): redesign user endpoints

BREAKING CHANGE: User API endpoints changed from /users to /api/v2/users
and now require authentication for all operations.

Migration guide:
- Update all API calls to use /api/v2/users
- Add Authorization header with Bearer token

Closes #234
```

### Refactor

```
refactor(user): extract user validation to separate service

Move validation logic from UserRepository to new UserValidationService
to improve separation of concerns and testability.
```

### Multiple Changes

```
feat(order): add order cancellation feature

- Add cancel_order use case
- Add cancel endpoint to API
- Send cancellation email to customer
- Update order status in database

Closes #456
```

## Commits Best Practices

### Commits Atomiques

Un commit = un changement logique

```bash
# ❌ Mauvais: Tout en un commit
git commit -m "fix bugs and add features and update docs"

# ✅ Bon: Commits séparés
git commit -m "feat(auth): add password reset"
git commit -m "fix(user): correct email validation"
git commit -m "docs(api): update authentication guide"
```

### Fréquence de Commit

```bash
# ✅ Commiter fréquemment
- feat(user): add User entity
- feat(user): add UserRepository interface
- feat(user): implement UserRepositoryImpl
- test(user): add user repository tests

# ❌ Pas de commits géants
- feat(user): complete user module (500 files changed)
```

### Que Commiter

```bash
# ✅ Commiter ensemble
git add src/domain/entities/user.py
git add tests/unit/domain/entities/test_user.py
git commit -m "feat(user): add User entity with tests"

# ❌ Ne pas mélanger
git add src/domain/entities/user.py
git add src/infrastructure/api/routes/orders.py
git commit -m "update code"
```

## .gitignore

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
env/
ENV/
.venv

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Type checking
.mypy_cache/
.dmypy.json
dmypy.json

# Linting
.ruff_cache/

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite3

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# Project specific
temp/
*.tmp
```

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict

  - repo: https://github.com/commitizen-tools/commitizen
    rev: 3.12.0
    hooks:
      - id: commitizen
        stages: [commit-msg]
```

```bash
# Setup
pre-commit install
pre-commit install --hook-type commit-msg

# Run manuellement
pre-commit run --all-files
```

## Pull Requests

### Template PR

```markdown
## Summary
Brief description of what this PR does

## Changes
- Change 1
- Change 2
- Change 3

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (no functional changes)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing done

Describe how you tested the changes.

## Screenshots
If applicable, add screenshots.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added
- [ ] All tests pass
- [ ] Migration created if needed

## Breaking Changes
List any breaking changes and migration steps.

## Related Issues
Closes #123
Related to #456
```

### Review Process

```bash
# 1. Créer PR
gh pr create --title "feat(auth): add JWT authentication" \
  --body "$(cat PR_TEMPLATE.md)"

# 2. Attendre review
# - Adresser les commentaires
# - Pusher les changements

# 3. Squash et merge
gh pr merge --squash --delete-branch
```

## Git Commands Utiles

```bash
# Status
git status
git diff
git diff --staged

# Commits
git commit -m "message"
git commit --amend  # Modifier dernier commit
git commit --amend --no-edit  # Garder message

# Branches
git branch  # Lister
git checkout -b feature/name  # Créer et switch
git branch -d feature/name  # Supprimer

# Rebase
git rebase main
git rebase -i HEAD~3  # Interactive rebase (3 derniers commits)

# Stash
git stash  # Mettre de côté
git stash pop  # Récupérer
git stash list  # Lister

# Reset
git reset --soft HEAD~1  # Annuler commit (garder changes)
git reset --hard HEAD~1  # Annuler commit (perdre changes)

# Remote
git fetch origin
git pull origin main
git push origin feature/name
git push --force-with-lease  # Force push safe

# Logs
git log --oneline
git log --graph --oneline --all
git log --author="name"

# Blame
git blame file.py
git show commit-hash
```

## Workflow Complet - Exemple

```bash
# 1. Synchroniser avec main
git checkout main
git pull origin main

# 2. Créer branche feature
git checkout -b feature/user-notifications

# 3. Travailler
# ... modifications ...

# 4. Commit atomique
git add src/domain/services/notification_service.py
git add tests/unit/domain/services/test_notification_service.py
git commit -m "feat(notifications): add notification service with tests"

# 5. Autre feature dans même branche
# ... modifications ...
git add src/application/use_cases/send_notification.py
git add tests/unit/application/use_cases/test_send_notification.py
git commit -m "feat(notifications): add send notification use case"

# 6. Push
git push origin feature/user-notifications

# 7. Avant PR: rebase sur main
git checkout main
git pull origin main
git checkout feature/user-notifications
git rebase main

# Résoudre conflits si nécessaire
git add .
git rebase --continue

# 8. Force push après rebase
git push --force-with-lease origin feature/user-notifications

# 9. Créer PR
gh pr create \
  --title "feat(notifications): add user notification system" \
  --body "Implements email and SMS notifications for users.

## Changes
- Add NotificationService in domain
- Add SendNotificationUseCase
- Add notification API endpoints
- Add email and SMS providers

## Testing
- Unit tests: 95% coverage
- Integration tests for all providers
- E2E tests for notification flow

Closes #123"

# 10. Après review et approval
gh pr merge --squash --delete-branch

# 11. Cleanup local
git checkout main
git pull origin main
git branch -d feature/user-notifications
```

## Checklist Git

- [ ] Commits suivent Conventional Commits
- [ ] Commits atomiques (un changement logique)
- [ ] Messages clairs et descriptifs
- [ ] Pas de commits "WIP" ou "fix"
- [ ] Branche nommée correctement
- [ ] PR description complète
- [ ] Pas de conflits avec main
- [ ] Tests passent sur CI
- [ ] Review effectuée
