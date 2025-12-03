# Git Workflow et Gestion de Version

## Stratégie de Branching - Git Flow

### Branches Principales

```
main (production)
  └── develop (intégration)
      ├── feature/* (nouvelles fonctionnalités)
      ├── fix/* (corrections de bugs)
      ├── refactor/* (refactoring)
      └── hotfix/* (corrections urgentes)
```

### Structure des Branches

#### 1. Main (Production)

- **Objectif** : Code en production
- **Protection** : Branche protégée, pas de push direct
- **Merge** : Uniquement via Pull Request depuis `develop` ou `hotfix/*`
- **Tags** : Tous les merges sont taggés avec une version

```bash
# Merge depuis develop
git checkout main
git merge --no-ff develop -m "Release v1.2.0"
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags
```

#### 2. Develop (Développement)

- **Objectif** : Intégration des features
- **Base** : Branche de départ pour toutes les features
- **Protection** : Branche protégée, merge via PR uniquement

#### 3. Feature Branches

- **Naming** : `feature/TICKET-description`
- **Base** : Créée depuis `develop`
- **Merge** : Vers `develop` via Pull Request

```bash
# Créer une feature branch
git checkout develop
git pull origin develop
git checkout -b feature/USER-123-add-login-form

# Travailler sur la feature
git add .
git commit -m "feat(auth): add login form component"

# Pousser la branch
git push -u origin feature/USER-123-add-login-form

# Créer une Pull Request sur GitHub/GitLab
```

#### 4. Fix Branches

- **Naming** : `fix/TICKET-description`
- **Base** : Créée depuis `develop`
- **Merge** : Vers `develop` via Pull Request

```bash
# Créer une fix branch
git checkout develop
git pull origin develop
git checkout -b fix/BUG-456-fix-user-validation

# Corriger le bug
git add .
git commit -m "fix(validation): resolve email validation issue"

# Pousser et créer PR
git push -u origin fix/BUG-456-fix-user-validation
```

#### 5. Hotfix Branches

- **Naming** : `hotfix/v1.2.1-description`
- **Base** : Créée depuis `main` (production)
- **Merge** : Vers `main` ET `develop`

```bash
# Créer une hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1-critical-security-fix

# Appliquer le hotfix
git add .
git commit -m "fix(security): patch XSS vulnerability"

# Merge vers main
git checkout main
git merge --no-ff hotfix/v1.2.1-critical-security-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1 - Security patch"
git push origin main --tags

# Merge vers develop
git checkout develop
git merge --no-ff hotfix/v1.2.1-critical-security-fix
git push origin develop

# Supprimer la hotfix branch
git branch -d hotfix/v1.2.1-critical-security-fix
git push origin --delete hotfix/v1.2.1-critical-security-fix
```

#### 6. Refactor Branches

- **Naming** : `refactor/description`
- **Base** : Créée depuis `develop`
- **Merge** : Vers `develop` via Pull Request

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

- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation
- **style** : Formatage, point-virgules manquants, etc.
- **refactor** : Refactoring du code
- **perf** : Amélioration de performance
- **test** : Ajout de tests
- **build** : Changements du système de build
- **ci** : Changements CI/CD
- **chore** : Autres changements (dépendances, etc.)
- **revert** : Annulation d'un commit précédent

### Scopes (Examples)

- **auth** : Authentification
- **user** : Gestion des utilisateurs
- **product** : Produits
- **api** : API
- **ui** : Interface utilisateur
- **hooks** : Hooks custom
- **utils** : Utilitaires
- **config** : Configuration

### Exemples de Commits

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
# ✅ Bon
feat(auth): add login form validation

# ❌ Mauvais
Added some stuff

# ✅ Bon - Impératif
fix(api): resolve timeout issue

# ❌ Mauvais - Passé
fixed the timeout issue

# ✅ Bon - Concis
refactor(hooks): simplify useAuth

# ❌ Mauvais - Trop long
refactor(hooks): simplify the useAuth hook by extracting the validation logic and removing duplicate code
```

#### Body (Optionnel mais Recommandé)

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
# Référencer des issues
Closes #123
Fixes #456
Resolves #789

# Multiples issues
Closes #123, #456, #789

# Breaking changes
BREAKING CHANGE: API response structure changed
```

## Pull Request Workflow

### Créer une Pull Request

```bash
# 1. S'assurer que la branch est à jour
git checkout develop
git pull origin develop

# 2. Rebaser la feature branch
git checkout feature/USER-123-add-login-form
git rebase develop

# 3. Résoudre les conflits si nécessaire
# 4. Pousser les changements
git push origin feature/USER-123-add-login-form --force-with-lease

# 5. Créer la PR sur GitHub/GitLab
```

### Template de Pull Request

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

#### Pour le Reviewer

```bash
# 1. Récupérer la branch
git fetch origin
git checkout feature/USER-123-add-login-form

# 2. Tester localement
pnpm install
pnpm dev

# 3. Vérifier les tests
pnpm test
pnpm lint
pnpm type-check

# 4. Review le code
# - Vérifier la qualité du code
# - Vérifier les tests
# - Vérifier la documentation
# - Tester manuellement

# 5. Approuver ou demander des changements
```

#### Checklist du Reviewer

- [ ] Le code respecte les standards du projet
- [ ] Les tests sont complets et passent
- [ ] Pas de code dupliqué
- [ ] Pas de hard-coded values
- [ ] Documentation à jour
- [ ] Pas de console.log oubliés
- [ ] Performance acceptable
- [ ] Sécurité respectée
- [ ] Accessibilité respectée
- [ ] Responsive design (si UI)

## Gestion des Conflits

### Résoudre un Conflit lors d'un Rebase

```bash
# 1. Commencer le rebase
git checkout feature/my-feature
git rebase develop

# 2. Si conflit, Git s'arrête
# Éditer les fichiers en conflit

# 3. Marquer comme résolu
git add <fichiers-résolus>
git rebase --continue

# 4. Si trop de conflits, annuler
git rebase --abort

# 5. Pousser (force with lease)
git push --force-with-lease origin feature/my-feature
```

### Résoudre un Conflit lors d'un Merge

```bash
# 1. Merger develop dans la feature
git checkout feature/my-feature
git merge develop

# 2. Résoudre les conflits
# Éditer les fichiers

# 3. Commit la résolution
git add <fichiers-résolus>
git commit -m "merge: resolve conflicts with develop"

# 4. Pousser
git push origin feature/my-feature
```

## Git Hooks (Automatisation)

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Lint staged files
npx lint-staged

# Type check
npm run type-check

# Si tout passe, le commit continue
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

## Versioning Sémantique

### Format : MAJOR.MINOR.PATCH

- **MAJOR** : Breaking changes (1.0.0 → 2.0.0)
- **MINOR** : New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH** : Bug fixes (1.0.0 → 1.0.1)

### Exemples

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

### Changelog Automatique

```bash
# Installer standard-version
npm install -D standard-version

# Ajouter au package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}

# Générer un release
npm run release
# Génère automatiquement:
# - Version bump dans package.json
# - Tag Git
# - CHANGELOG.md mis à jour

git push --follow-tags origin main
```

## Best Practices Git

### 1. Commits Atomiques

```bash
# ✅ Bon - Commits séparés
git commit -m "feat(auth): add login form"
git commit -m "test(auth): add login form tests"
git commit -m "docs(auth): document login flow"

# ❌ Mauvais - Tout en un commit
git commit -m "Add login feature with tests and docs"
```

### 2. Branches Courtes

- Feature branches : < 3 jours
- Merger rapidement et souvent
- Éviter les branches longue durée

### 3. Rebase vs Merge

```bash
# Rebase pour feature branches (history linéaire)
git checkout feature/my-feature
git rebase develop

# Merge pour intégrer dans develop (preserve history)
git checkout develop
git merge --no-ff feature/my-feature
```

### 4. Force Push Sécurisé

```bash
# ❌ Dangereux
git push --force

# ✅ Sécurisé
git push --force-with-lease
```

### 5. Garder develop et main à jour

```bash
# Sync régulièrement
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

## Git Aliases Utiles

```bash
# Ajouter au ~/.gitconfig
[alias]
  # Status court
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

Un bon workflow Git permet :

1. ✅ **Collaboration** : Travail d'équipe fluide
2. ✅ **Qualité** : Code review systématique
3. ✅ **Traçabilité** : Historique clair
4. ✅ **Sécurité** : Protection des branches principales
5. ✅ **Automatisation** : Hooks et CI/CD

**Règle d'or** : Commiter souvent, pusher régulièrement, merger rapidement.
