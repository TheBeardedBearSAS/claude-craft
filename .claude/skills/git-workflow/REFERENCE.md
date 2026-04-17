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

### Pre-Release Strategy (SemVer)

Avant une release en production, utiliser des pre-releases pour validation :

| Version | Quand | Exemple |
|---------|-------|---------|
| **alpha** | Développement initial, features incomplètes | `2.0.0-alpha.1` |
| **beta** | Features complètes, testing interne | `2.0.0-beta.1` |
| **rc** | Release Candidate, prêt pour production | `2.0.0-rc.1` |
| **stable** | Production | `2.0.0` |

**Workflow :**
```
feature/add-payment
  ├─ 2.0.0-alpha.1 (branche develop)
  ├─ 2.0.0-beta.1 (tests QA)
  ├─ 2.0.0-rc.1 (staging)
  └─ 2.0.0 (main → production)
```

**Règles SemVer :**
- **MAJOR** (X.0.0) : Breaking changes
- **MINOR** (x.Y.0) : Nouvelles features, backward-compatible
- **PATCH** (x.y.Z) : Bug fixes uniquement

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

### Scopes recommandés

Utilisez les bounded contexts ou modules de votre projet:
- `auth` - Authentification
- `user` - Gestion utilisateurs
- `order` - Commandes
- `payment` - Paiements
- `notification` - Notifications
- `infra` - Infrastructure

### Outils de validation

- **Commitlint:** `@commitlint/config-conventional` avec `subject-max-length: 72`
- **Git hook:** `.husky/commit-msg` → `npx --no-install commitlint --edit "$1"`

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

```
feature/add-user-registration    ✅
fix/login-validation-error       ✅
refactor/extract-auth-service    ✅
dev-branch                       ❌
my-work                          ❌
feature123                       ❌
```

### Durée de vie

- **Maximum 3 jours** de développement
- Si > 3 jours → **découper** en plusieurs PRs
- Merge dès que fonctionnel (même si incomplet)
- Utiliser **feature flags** si nécessaire

Toujours partir de `main` à jour : `git checkout main && git pull origin main`

---

## Pull Requests

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

1. **Auto-review** (auteur) — relire, vérifier checklist, tester manuellement
2. **Première passe** (reviewer) — architecture, logique métier, tests
3. **Deuxième passe** (reviewer) — détails d'implémentation, nommage, optimisations
4. **Commentaires** — constructifs, suggérer des solutions, expliquer le "pourquoi"
5. **Approbation** — ✅ Approve / 💬 Comment / 🔴 Request changes

---

## Checklist PR

### Avant de créer la PR

- [ ] Tests passent (`make test`)
- [ ] Couverture ≥ 80% (`make test-coverage`)
- [ ] Linter : 0 erreur (`make quality`)
- [ ] Self-review : `git diff main...HEAD`

### Pendant la review

- Appliquer les suggestions avec un commit `fix: apply code review suggestions`
- Rebaser si nécessaire : `git rebase origin/main` puis `git push --force-with-lease`

### Avant le merge

- [ ] Branche à jour avec `main`
- [ ] CI passe
- [ ] Au moins 1 approve
- [ ] Squash and merge (historique propre)

---

## Ressources

- **GitHub Flow:** [Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Specification](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentation](https://commitlint.js.org/)
- **Git Best Practices:** [Atlassian Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Date de dernière mise à jour:** 2026-04
**Version:** 1.1.0
**Auteur:** The Bearded CTO
