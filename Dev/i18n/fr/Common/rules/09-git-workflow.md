# Git Workflow

## Vue d'ensemble

Le workflow Git est basé sur **GitHub Flow** avec des **Conventional Commits** obligatoires.

**Principes:**
- ✅ Branche `main` toujours déployable
- ✅ Feature branches courtes (< 3 jours)
- ✅ Pull Requests obligatoires
- ✅ Code review avant merge
- ✅ CI doit passer (tests + qualité)

---

## Table des matières

1. [GitHub Flow](#github-flow)
2. [Conventional Commits](#conventional-commits)
3. [Branches](#branches)
4. [Pull Requests](#pull-requests)
5. [Code Review](#code-review)
6. [Checklist PR](#checklist-pr)

---

## GitHub Flow

### Workflow

```
main (production-ready)
  │
  ├─> feature/add-user-authentication
  │   │
  │   ├─ commit: feat: add login form
  │   ├─ commit: feat: add auth service
  │   ├─ commit: test: add auth tests
  │   │
  │   └─> Pull Request → Code Review → Merge
  │
  └─> main (updated)
```

### Règles

1. **`main` est toujours déployable**
2. **Nouvelle fonctionnalité = nouvelle branche**
3. **Commits atomiques et testés**
4. **PR + Review obligatoires**
5. **CI doit passer avant merge**
6. **Squash merge pour historique propre**

---

## Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

La spec Conventional Commits 1.0.0 n'impose que `feat` et `fix` ; les autres types sont une convention d'équipe (`@commitlint/config-conventional`).

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(auth): add login endpoint` |
| `fix` | Correction de bug | `fix(cart): correct total calculation` |
| `docs` | Documentation uniquement | `docs(readme): update installation steps` |
| `style` | Formatage (pas de changement code) | `style: apply formatter` |
| `refactor` | Refactoring (ni feat ni fix) | `refactor(user): extract validation logic` |
| `perf` | Amélioration performance | `perf(query): add index on created_at` |
| `test` | Ajout/correction tests | `test(auth): add edge cases` |
| `build` | Build system, deps externes | `build: upgrade framework to v2.0` |
| `ci` | CI/CD configuration | `ci: add lint step to pipeline` |
| `chore` | Autres (pas de code prod) | `chore: update .gitignore` |

### Breaking changes

Ajouter `!` avant les deux-points (`feat(api)!: remove v1 endpoints`) et/ou un footer `BREAKING CHANGE: <description>` (majuscules, deux-points). Correspond à un bump MAJOR SemVer.

### Scopes recommandés

Utilisez les bounded contexts ou modules de votre projet:
- `auth` - Authentification
- `user` - Gestion utilisateurs
- `order` - Commandes
- `payment` - Paiements
- `notification` - Notifications
- `infra` - Infrastructure

### Exemples de commits

#### ✅ BON

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

#### ❌ MAUVAIS

```bash
# ❌ Trop vague
git commit -m "fix bug"

# ❌ Pas de type
git commit -m "add new feature"

# ❌ Pas de scope
git commit -m "feat: stuff"

# ❌ Trop long (> 72 chars)
git commit -m "feat(user): implement the complete user management system with registration, login, password reset and email notifications"

# ❌ Plusieurs changements non liés
git commit -m "feat: add login + fix email + update docs"
```

### Outils de validation

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

### Nomenclature

```
<type>/<description-courte>
```

**Types:**
- `feature/` - Nouvelle fonctionnalité
- `fix/` - Correction de bug
- `refactor/` - Refactoring
- `docs/` - Documentation
- `chore/` - Maintenance

### Exemples

```bash
# ✅ BON
feature/add-user-registration
feature/payment-integration
fix/login-validation-error
refactor/extract-auth-service
docs/update-api-documentation
chore/upgrade-dependencies

# ❌ MAUVAIS
dev-branch
my-work
bug-fix
feature123
```

### Création de branche

```bash
# Toujours partir de main à jour
git checkout main
git pull origin main

# Créer la feature branch
git checkout -b feature/add-user-registration

# Travailler sur la feature
# ... commits ...

# Push de la branche
git push -u origin feature/add-user-registration
```

### Durée de vie

- ⏱️ **Maximum 3 jours** de développement
- Si > 3 jours → **découper** en plusieurs PRs
- Merge dès que fonctionnel (même si incomplet)
- Utiliser **feature flags** si nécessaire

---

## Pull Requests

### Template PR

```markdown
## Description

<!-- Décrivez les changements de cette PR -->

Closes #[numéro_issue]

## Type de changement

- [ ] 🚀 Nouvelle fonctionnalité (feat)
- [ ] 🐛 Correction de bug (fix)
- [ ] 📝 Documentation (docs)
- [ ] ♻️ Refactoring (refactor)
- [ ] ⚡ Performance (perf)
- [ ] ✅ Tests (test)

## Checklist

### Code

- [ ] Le code suit les standards du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté les parties complexes
- [ ] Linter passe sans erreur
- [ ] Formatter appliqué

### Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration si nécessaire
- [ ] Couverture de code ≥ 80%
- [ ] Tous les tests passent

### Documentation

- [ ] README mis à jour si nécessaire
- [ ] Documentation API à jour
- [ ] CHANGELOG.md mis à jour

### Architecture

- [ ] Principes SOLID appliqués
- [ ] DRY respecté (pas de duplication)
- [ ] YAGNI respecté (pas de code inutile)

### Sécurité

- [ ] Pas de données sensibles en clair
- [ ] Validation des inputs
- [ ] Pas de secrets dans le code

## Screenshots

<!-- Si changement UI, ajouter des screenshots -->

## Notes pour les reviewers

<!-- Indiquer les points à vérifier particulièrement -->
```

### Labels

| Label | Utilisation |
|-------|-------------|
| `enhancement` | Nouvelle fonctionnalité |
| `bug` | Correction de bug |
| `documentation` | Documentation uniquement |
| `refactoring` | Refactoring |
| `performance` | Amélioration performance |
| `security` | Sécurité |
| `breaking-change` | Changement cassant |
| `needs-review` | En attente de review |
| `work-in-progress` | WIP |
| `ready-to-merge` | Prêt pour merge |

---

## Code Review

### Checklist Reviewer

#### Architecture
- [ ] Principes SOLID respectés
- [ ] Couches bien séparées
- [ ] Pas de dépendances inversées

#### Code Quality
- [ ] KISS / DRY / YAGNI appliqués
- [ ] Nommage explicite
- [ ] Pas de duplication de code
- [ ] Complexité acceptable (< 10)
- [ ] Méthodes courtes (< 20 lignes)

#### Tests
- [ ] Tests pour la logique métier
- [ ] Couverture ≥ 80%
- [ ] Tous les tests passent
- [ ] Pas de tests commentés

#### Sécurité
- [ ] Pas de secrets en dur
- [ ] Validation des inputs
- [ ] Protection XSS/CSRF

#### Performance
- [ ] Pas de N+1 queries
- [ ] Indexes appropriés
- [ ] Pagination si nécessaire

### Process de review

1. **Auto-review** (auteur)
   - Relire son propre code
   - Vérifier la checklist PR
   - Tester manuellement

2. **Première passe** (reviewer)
   - Architecture globale
   - Logique métier
   - Tests

3. **Deuxième passe** (reviewer)
   - Détails d'implémentation
   - Nommage
   - Optimisations

4. **Commentaires**
   - Constructifs et bienveillants
   - Suggérer des solutions
   - Expliquer le "pourquoi"

5. **Approbation**
   - ✅ Approve → Prêt pour merge
   - 💬 Comment → Suggestions non bloquantes
   - 🔴 Request changes → Corrections nécessaires

### Exemples de commentaires

#### ✅ BON (constructif)

```
Suggestion: Cette méthode fait plusieurs choses (calcul + validation).
Que penses-tu de la découper en deux méthodes distinctes pour respecter SRP ?

Exemple:
- validate(data)
- calculate(data)
```

#### ❌ MAUVAIS (non constructif)

```
Ce code est nul, il faut tout refaire.
```

---

## Checklist PR

### Avant de créer la PR

```bash
# 1. Tests passent
make test

# 2. Couverture OK
make test-coverage
# Vérifier: ≥ 80%

# 3. Qualité OK
make quality
# Linter: 0 erreur
# Formatter: appliqué

# 4. Self-review
git diff main...HEAD
```

### Pendant la review

```bash
# Appliquer les suggestions reviewer
git add .
git commit -m "fix: apply code review suggestions"
git push

# Rebaser si nécessaire
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Avant le merge

```bash
# 1. Branch à jour
git fetch origin
git rebase origin/main

# 2. CI passe
# → Vérifier pipeline CI/CD

# 3. Review approuvée
# → Au moins 1 approve

# 4. Merge
# → Squash and merge (historique propre)
```

---

## Workflow complet

### Feature

```bash
# 1. Créer branche
git checkout main
git pull
git checkout -b feature/add-payment-integration

# 2. TDD: Test d'abord (RED)
git add tests/
git commit -m "test(payment): add integration tests"

# 3. Implémentation (GREEN)
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
# 1. Créer branche depuis main
git checkout main
git pull
git checkout -b fix/critical-auth-bug

# 2. Fix + test
git add src/ tests/
git commit -m "fix(auth): correct token validation

Token expiry check was using wrong timezone.
Added test to prevent regression.

Fixes #789"

# 3. Push + PR express
git push -u origin fix/critical-auth-bug
gh pr create --fill --label "bug,urgent"

# 4. Review rapide + merge

# 5. Cleanup
git checkout main
git pull
git branch -d fix/critical-auth-bug
```

---

## Ressources

- **GitHub Flow:** [Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Specification](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentation](https://commitlint.js.org/)
- **Git Best Practices:** [Atlassian Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Date de dernière mise à jour:** 2025-01
**Version:** 1.0.0
**Auteur:** The Bearded CTO
