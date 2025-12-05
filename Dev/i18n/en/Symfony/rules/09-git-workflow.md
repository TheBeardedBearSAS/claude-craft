# Git Workflow - Atoll Tourisme

## Overview

Le workflow Git est basé sur **GitHub Flow** avec des **Conventional Commits** obligatoires.

**Principes:**
- ✅ Branche `main` toujours déployable
- ✅ Feature branches courtes (< 3 jours)
- ✅ Pull Requests obligatoires
- ✅ Code review avant merge
- ✅ CI doit passer (tests + qualité)

> **Références:**
> - `08-quality-tools.md` - Pipeline CI
> - `07-testing-tdd-bdd.md` - Tests obligatoires

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
  ├─> feature/add-reservation-pricing
  │   │
  │   ├─ commit: feat: add Money value object
  │   ├─ commit: feat: add pricing service
  │   ├─ commit: test: add pricing service tests
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

### Types obligatoires

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(reservation): add discount calculation` |
| `fix` | Correction de bug | `fix(pricing): correct family discount rate` |
| `docs` | Documentation uniquement | `docs(readme): update installation steps` |
| `style` | Formatage (pas de changement code) | `style: apply php-cs-fixer` |
| `refactor` | Refactoring (ni feat ni fix) | `refactor(reservation): extract pricing logic` |
| `perf` | Amélioration performance | `perf(query): add index on reservation_date` |
| `test` | Ajout/correction tests | `test(reservation): add edge cases` |
| `build` | Build system, deps externes | `build: upgrade to symfony 6.4.2` |
| `ci` | CI/CD configuration | `ci: add phpstan to github actions` |
| `chore` | Autres (pas de code prod) | `chore: update .gitignore` |

### Scopes recommandés

- `reservation` - Bounded Context Réservation
- `catalog` - Bounded Context Catalogue
- `notification` - Bounded Context Notification
- `pricing` - Sous-domaine Pricing
- `infrastructure` - Couche Infrastructure
- `domain` - Couche Domain
- `application` - Couche Application

### Examples de commits

#### ✅ BON

```bash
# Feature
git commit -m "feat(reservation): add Money value object

Implement immutable Money value object with:
- Creation from euros (float to cents conversion)
- Addition and multiplication operations
- Currency validation (EUR only for now)

Closes #123"

# Fix
git commit -m "fix(pricing): correct family discount calculation

Family discount was applied before age discount,
causing incorrect total. Now applies age discount first,
then family discount on the subtotal.

Fixes #456"

# Test
git commit -m "test(reservation): add participant age validation tests

Add edge cases:
- Age = 0 (valid)
- Age = -1 (invalid)
- Age = 121 (invalid)"

# Refactor
git commit -m "refactor(pricing): extract discount policies

Extract discount calculation logic into separate
policy classes following Strategy pattern:
- FamilyDiscountPolicy
- EarlyBookingDiscountPolicy
- LoyaltyDiscountPolicy"
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
git commit -m "feat(reservation): implement the complete reservation system with pricing, discounts, participants management and email notifications"

# ❌ Plusieurs changements non liés
git commit -m "feat: add reservation + fix email + update docs"
```

### Outils de validation

#### Commitlint

```bash
# Installation
npm install --save-dev @commitlint/{cli,config-conventional}

# Configuration (.commitlintrc.json)
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore"
    ]],
    "scope-enum": [2, "always", [
      "reservation", "catalog", "notification",
      "pricing", "domain", "infrastructure", "application"
    ]],
    "subject-max-length": [2, "always", 72]
  }
}
```

#### Git hooks (Husky)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0",
    "husky": "^8.0.0"
  }
}
```

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

### Examples

```bash
# ✅ BON
feature/add-reservation-pricing
feature/participant-age-validation
fix/discount-calculation-error
refactor/extract-pricing-policies
docs/update-readme-installation
chore/upgrade-symfony-6.4

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
git checkout -b feature/add-reservation-pricing

# Travailler sur la feature
# ... commits ...

# Push de la branche
git push -u origin feature/add-reservation-pricing
```

### Durée de vie

- ⏱️ **Maximum 3 jours** de développement
- Si > 3 jours → **découper** en plusieurs PRs
- Merge dès que fonctionnel (même si incomplet)
- Utiliser **feature flags** si nécessaire

---

## Pull Requests

### Template PR (.github/pull_request_template.md)

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

- [ ] Le code suit les standards du projet (PSR-12, Symfony)
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté les parties complexes
- [ ] PHPStan niveau max passe (0 erreur)
- [ ] PHP-CS-Fixer appliqué
- [ ] Rector suggestions appliquées
- [ ] Deptrac validation passée

### Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés si nécessaire
- [ ] Tests fonctionnels ajoutés si nécessaire
- [ ] Behat scenarios ajoutés pour features métier
- [ ] Couverture de code ≥ 80%
- [ ] Mutation score (Infection) ≥ 80%
- [ ] Tous les tests passent

### Documentation

- [ ] README mis à jour si nécessaire
- [ ] PHPDoc à jour
- [ ] CHANGELOG.md mis à jour
- [ ] ADR créé si décision architecturale

### Architecture

- [ ] Respect Clean Architecture (Domain → Application → Infrastructure)
- [ ] Principes SOLID appliqués
- [ ] DRY respecté (pas de duplication)
- [ ] YAGNI respecté (pas de code inutile)
- [ ] Value Objects utilisés pour les valeurs métier
- [ ] Domain Events pour les événements métier

### Sécurité

- [ ] Pas de données sensibles en clair
- [ ] Validation des inputs
- [ ] Protection CSRF si formulaires
- [ ] Pas de secrets dans le code

### Performance

- [ ] Pas de N+1 queries
- [ ] Indexes DB créés si nécessaire
- [ ] Cache utilisé si pertinent

## Impacts

### Base de données

- [ ] Migration créée
- [ ] Migration testée (up + down)
- [ ] Rollback plan documenté

### API

- [ ] Breaking changes documentés
- [ ] Backward compatibility maintenue
- [ ] Versioning API respecté

## Screenshots

<!-- Si changement UI, ajouter des screenshots -->

## Commandes de test

```bash
# Tests
make test
make test-coverage

# Qualité
make quality

# Migration
make migration-diff
make migration-migrate
```

## Notes pour les reviewers

<!-- Indiquer les points à vérifier particulièrement -->
```

### Création PR

```bash
# Via GitHub CLI (recommandé)
gh pr create \
  --title "feat(reservation): add pricing calculation" \
  --body "Implement Money value object and pricing service" \
  --base main \
  --head feature/add-reservation-pricing

# Via interface GitHub
# → New Pull Request
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

- [ ] Respect de Clean Architecture + DDD
- [ ] Couches bien séparées (Domain/Application/Infrastructure)
- [ ] Pas de dépendances inversées
- [ ] Value Objects pour valeurs métier
- [ ] Aggregates bien définis

#### Code Quality

- [ ] Principes SOLID respectés
- [ ] KISS / DRY / YAGNI appliqués
- [ ] Nommage explicite (variables, méthodes, classes)
- [ ] Pas de duplication de code
- [ ] Complexité cyclomatique acceptable (< 10)
- [ ] Méthodes courtes (< 20 lignes)

#### Tests

- [ ] Tests unitaires pour logique métier
- [ ] Tests d'intégration pour repositories
- [ ] Tests fonctionnels pour use cases
- [ ] Behat pour scénarios métier
- [ ] Couverture ≥ 80%
- [ ] Tous les tests passent
- [ ] Pas de tests commentés

#### Security

- [ ] Pas de secrets en dur
- [ ] Validation des inputs
- [ ] Protection XSS
- [ ] Protection CSRF
- [ ] Données sensibles chiffrées (RGPD)

#### Performance

- [ ] Pas de N+1 queries
- [ ] Eager loading si nécessaire
- [ ] Indexes DB appropriés
- [ ] Cache utilisé si pertinent
- [ ] Pagination pour grandes listes

#### Documentation

- [ ] PHPDoc complet
- [ ] README à jour
- [ ] CHANGELOG mis à jour
- [ ] ADR si décision architecturale

### Process de review

1. **Auto-review** (auteur)
   - Relire son propre code
   - Check la checklist PR
   - Tester manuellement

2. **Première passe** (reviewer)
   - Architecture globale
   - Logique métier
   - Tests

3. **Deuxième passe** (reviewer)
   - Détails d'implémentation
   - Nommage
   - Optimizations

4. **Commentaires**
   - Constructifs et bienveillants
   - Suggérer des solutions
   - Expliquer le "pourquoi"

5. **Approbation**
   - ✅ Approve → Prêt pour merge
   - 💬 Comment → Suggestions non bloquantes
   - 🔴 Request changes → Corrections nécessaires

### Examples de commentaires

#### ✅ BON (constructif)

```
Suggestion: Cette méthode fait plusieurs choses (calcul + validation).
Que penses-tu de la découper en deux méthodes distinctes pour respecter SRP ?

Exemple:
```php
public function calculate(Reservation $r): Money
{
    $this->validate($r);
    return $this->doCalculate($r);
}

private function validate(Reservation $r): void { /* ... */ }
private function doCalculate(Reservation $r): Money { /* ... */ }
```
```

#### ❌ MAUVAIS (non constructif)

```
Ce code est nul, il faut tout refaire.
```

---

## Checklist PR

### Before de créer la PR

```bash
# 1. Tests passent
make test

# 2. Couverture OK
make test-coverage
# Vérifier: ≥ 80%

# 3. Qualité OK
make quality
# PHPStan: 0 erreur
# CS-Fixer: 0 violation
# Rector: 0 suggestion
# Deptrac: 0 violation

# 4. Mutation score OK
make infection
# MSI ≥ 80%

# 5. Self-review
git diff main...HEAD
```

### During la review

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

### Before le merge

```bash
# 1. Branch à jour
git fetch origin
git rebase origin/main

# 2. Squash si nécessaire (commits intermediaires)
git rebase -i origin/main

# 3. CI passe
# → Vérifier GitHub Actions

# 4. Review approuvée
# → Au moins 1 approve

# 5. Merge
# → Squash and merge (historique propre)
```

---

## Examples de workflow

### Feature complète

```bash
# 1. Créer branche
git checkout main
git pull
git checkout -b feature/add-reservation-confirmation

# 2. TDD: Test d'abord (RED)
# Écrire test qui échoue
git add tests/
git commit -m "test(reservation): add confirmation tests"

# 3. Implémentation (GREEN)
# Code minimal pour passer le test
git add src/
git commit -m "feat(reservation): add confirmation logic"

# 4. Refactor
# Améliorer le code
git add src/
git commit -m "refactor(reservation): extract confirmation rules"

# 5. Documentation
git add README.md
git commit -m "docs(reservation): document confirmation process"

# 6. Push + PR
git push -u origin feature/add-reservation-confirmation
gh pr create --fill

# 7. Review + corrections
# ... apply feedback ...
git add .
git commit -m "fix: apply review suggestions"
git push

# 8. Merge
# → Via GitHub UI (Squash and merge)

# 9. Cleanup
git checkout main
git pull
git branch -d feature/add-reservation-confirmation
```

### Hotfix urgent

```bash
# 1. Créer branche depuis main
git checkout main
git pull
git checkout -b fix/critical-pricing-bug

# 2. Fix + test
git add src/ tests/
git commit -m "fix(pricing): correct discount calculation

Family discount was doubled due to loop error.
Added test to prevent regression.

Fixes #789"

# 3. Push + PR express
git push -u origin fix/critical-pricing-bug
gh pr create --fill --label "bug,urgent"

# 4. Review rapide + merge
# → Priority review
# → Fast-track merge

# 5. Cleanup
git checkout main
git pull
git branch -d fix/critical-pricing-bug
```

---

## Ressources

- **GitHub Flow:** [Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Specification](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentation](https://commitlint.js.org/)
- **Git Best Practices:** [Atlassian Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
