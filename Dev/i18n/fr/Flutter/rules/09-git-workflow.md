# Git Workflow Flutter

## Conventional Commits

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: Nouvelle fonctionnalité
- **fix**: Correction de bug
- **docs**: Documentation
- **style**: Formatage, points-virgules manquants
- **refactor**: Refactoring de code
- **perf**: Amélioration de performance
- **test**: Ajout ou correction de tests
- **build**: Modifications du build
- **ci**: Modifications CI/CD
- **chore**: Tâches diverses

### Exemples

```bash
feat(auth): add login with Google

Implement OAuth2 flow for Google Sign-In using firebase_auth.

Closes #123

fix(cart): prevent duplicate items

Fixes bug where adding same product twice created duplicate entries.

Fixes #456

docs(readme): update installation instructions

test(user): add unit tests for UserRepository

refactor(api): extract API client to separate class

perf(images): implement lazy loading for product images
```

---

## Branch Strategy

### GitFlow simplifié

```
main
├── develop
│   ├── feature/user-authentication
│   ├── feature/product-catalog
│   └── feature/shopping-cart
├── hotfix/critical-bug-fix
└── release/v1.0.0
```

### Noms de branches

```bash
# Features
feature/login-screen
feature/product-detail-page
feature/payment-integration

# Bugfixes
fix/cart-calculation-error
fix/image-loading-crash

# Hotfixes
hotfix/critical-security-patch

# Releases
release/v1.0.0
release/v1.1.0
```

---

## Pre-commit Hooks

### Husky + lint-staged (avec npm)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.dart": [
      "dart format",
      "flutter analyze",
      "flutter test --no-pub"
    ]
  }
}
```

### Lefthook (alternative pure Dart)

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.dart"
      run: dart format {staged_files}
    analyze:
      run: flutter analyze
    test:
      run: flutter test
```

---

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage
      - uses: codecov/codecov-action@v3
```

---

## Commandes Git utiles

```bash
# Créer une branche feature
git checkout -b feature/my-feature develop

# Commit avec Conventional Commits
git commit -m "feat(auth): add biometric authentication"

# Rebase interactif pour nettoyer l'historique
git rebase -i develop

# Squash commits
git rebase -i HEAD~3

# Cherry-pick
git cherry-pick abc123

# Stash
git stash
git stash pop
git stash list
```

---

*Un workflow Git structuré améliore la collaboration et la traçabilité.*
