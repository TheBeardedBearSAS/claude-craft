# Checklist: Nouvelle Feature

## Phase 1: Analyse (OBLIGATOIRE)

### Comprendre le Besoin

- [ ] **Objectif** clairement défini
  - Quelle fonctionnalité exactement?
  - Quel problème résout-elle?
  - Quels sont les critères d'acceptation?

- [ ] **Contexte métier** compris
  - Quel impact business?
  - Quels utilisateurs affectés?
  - Y a-t-il des contraintes métier spécifiques?

- [ ] **Contraintes techniques** identifiées
  - Performance requise?
  - Scalabilité?
  - Sécurité?
  - Compatibilité?

### Explorer le Code Existant

- [ ] **Patterns similaires** identifiés
  ```bash
  rg "class.*Service" --type py
  rg "class.*Repository" --type py
  ```

- [ ] **Architecture** analysée
  ```bash
  tree src/ -L 3 -I "__pycache__|*.pyc"
  ```

- [ ] **Standards du projet** compris
  - Conventions de nommage
  - Patterns d'error handling
  - Structure des tests

### Identifier les Impacts

- [ ] **Matrice d'impact** créée
  - Quels modules affectés?
  - Quelles migrations DB nécessaires?
  - Quels changements d'API?

- [ ] **Dépendances** identifiées
  - Modules qui dépendent du code à modifier
  - Modules dont dépend le nouveau code

### Concevoir la Solution

- [ ] **Architecture** définie
  - Quelle couche (Domain/Application/Infrastructure)?
  - Quelles classes/fonctions créer?
  - Quelles interfaces nécessaires?

- [ ] **Flux de données** documenté
  - Comment les données circulent?
  - Quelles transformations?

- [ ] **Choix techniques** justifiés
  - Pourquoi cette approche?
  - Quelles alternatives considérées?

### Planifier l'Implémentation

- [ ] **Tâches** découpées en steps atomiques
- [ ] **Ordre** d'implémentation défini
- [ ] **Estimation** réalisée avec buffer (20%)

### Identifier les Risques

- [ ] **Risques** identifiés et évalués
- [ ] **Mitigations** planifiées
- [ ] **Fallbacks** définis si possible

### Définir les Tests

- [ ] **Stratégie de tests** définie
  - Tests unitaires
  - Tests d'intégration
  - Tests E2E
- [ ] **Couverture cible** définie

Voir `rules/01-workflow-analysis.md` pour le détail.

## Phase 2: Implémentation

### Domain Layer (Si Applicable)

- [ ] **Entités** créées
  - [ ] Dataclass ou class Python
  - [ ] Validation dans `__post_init__`
  - [ ] Méthodes métier
  - [ ] Égalité basée sur l'ID
  - [ ] Docstrings complètes

- [ ] **Value Objects** créés
  - [ ] `frozen=True` (immutable)
  - [ ] Validation stricte
  - [ ] Égalité basée sur la valeur

- [ ] **Domain Services** créés (si nécessaire)
  - [ ] Logique métier multi-entités
  - [ ] Dépendances injectées
  - [ ] Pas de dépendance infrastructure

- [ ] **Repository Interfaces** créées
  - [ ] Protocol dans domain/repositories/
  - [ ] Méthodes documentées

- [ ] **Domain Exceptions** créées
  - [ ] Héritent de DomainException
  - [ ] Messages clairs

### Application Layer

- [ ] **DTOs** créés
  - [ ] Pydantic BaseModel
  - [ ] from_entity() et to_dict() si nécessaire
  - [ ] Validation Pydantic

- [ ] **Commands** créés
  - [ ] Dataclass ou Pydantic
  - [ ] Tous les inputs de l'use case

- [ ] **Use Cases** créés
  - [ ] Une classe par use case
  - [ ] Dépendances injectées via __init__
  - [ ] Méthode execute()
  - [ ] Validation des inputs
  - [ ] Gestion des erreurs
  - [ ] Retourne DTO

### Infrastructure Layer

- [ ] **Database Models** créés (si nouvelle entité)
  - [ ] SQLAlchemy model
  - [ ] Colonnes appropriées
  - [ ] Index si nécessaire
  - [ ] Relations si nécessaire

- [ ] **Migrations** créées
  ```bash
  make db-migrate msg="Description de la migration"
  ```
  - [ ] Migration testée (upgrade + downgrade)

- [ ] **Repositories** implémentés
  - [ ] Implémente l'interface domain
  - [ ] Conversion entity <-> model
  - [ ] Error handling
  - [ ] Rollback en cas d'erreur

- [ ] **API Routes** créées
  - [ ] FastAPI router
  - [ ] Pydantic schemas
  - [ ] Dependency injection
  - [ ] Status codes appropriés
  - [ ] Error handling

- [ ] **External Services** intégrés (si nécessaire)
  - [ ] Implémente interface domain
  - [ ] Retry logic
  - [ ] Timeout handling
  - [ ] Error handling

### Configuration

- [ ] **Dependency Injection** configurée
  - [ ] Container mis à jour
  - [ ] Factories créées
  - [ ] Dependencies FastAPI créées

- [ ] **Variables d'environnement** ajoutées
  - [ ] Ajoutées à `.env.example`
  - [ ] Documentées dans README
  - [ ] Validation avec Pydantic Settings

- [ ] **Configuration** mise à jour
  - [ ] Config class mise à jour
  - [ ] Valeurs par défaut définies

## Phase 3: Tests

### Tests Unitaires

- [ ] **Domain Layer** testé
  - [ ] Tests pour chaque entité
  - [ ] Tests pour chaque value object
  - [ ] Tests pour chaque service
  - [ ] Couverture > 95%

- [ ] **Application Layer** testé
  - [ ] Tests pour chaque use case
  - [ ] Mocks pour dépendances
  - [ ] Cas nominaux + edge cases
  - [ ] Couverture > 90%

- [ ] **Tous les tests unitaires** passent
  ```bash
  make test-unit
  ```

### Tests d'Intégration

- [ ] **Repository** testé
  - [ ] CRUD operations
  - [ ] Méthodes de recherche
  - [ ] Avec vraie DB (testcontainers)

- [ ] **API Routes** testées
  - [ ] Cas nominaux
  - [ ] Erreurs (400, 404, 409, 500)
  - [ ] Avec TestClient FastAPI

- [ ] **Tous les tests d'intégration** passent
  ```bash
  make test-integration
  ```

### Tests E2E

- [ ] **Flux complets** testés
  - [ ] Happy path
  - [ ] Cas d'erreur critiques

- [ ] **Tous les tests E2E** passent
  ```bash
  make test-e2e
  ```

### Couverture

- [ ] **Couverture globale** > 80%
  ```bash
  make test-cov
  ```
- [ ] **Couverture domain** > 95%
- [ ] **Couverture application** > 90%

## Phase 4: Qualité

### Code Quality

- [ ] **Linting** passe
  ```bash
  make lint
  ```

- [ ] **Formatting** correct
  ```bash
  make format-check
  ```

- [ ] **Type checking** passe
  ```bash
  make type-check
  ```

- [ ] **Security check** passe
  ```bash
  make security-check
  ```

### Code Review Personnel

- [ ] **SOLID** respecté
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI** respectés
  - [ ] Solution simple
  - [ ] Pas de duplication
  - [ ] Pas de code inutile

- [ ] **Clean Architecture** respectée
  - [ ] Dépendances vers l'intérieur
  - [ ] Domain indépendant
  - [ ] Abstractions (Protocols)

- [ ] **Naming** clair et cohérent
- [ ] **Docstrings** complètes
- [ ] **Comments** pour logique complexe seulement
- [ ] **Code mort** supprimé

## Phase 5: Documentation

- [ ] **API Documentation** à jour
  - [ ] Nouveaux endpoints documentés
  - [ ] Exemples fournis
  - [ ] Request/Response schemas clairs

- [ ] **README** mis à jour si nécessaire
  - [ ] Nouvelles features documentées
  - [ ] Setup instructions à jour

- [ ] **ADR** créé si décision architecturale importante
  ```markdown
  docs/adr/NNNN-description.md
  ```

- [ ] **Changelog** mis à jour
  ```markdown
  ## [Unreleased]
  ### Added
  - Description de la feature
  ```

## Phase 6: Git & PR

### Commits

- [ ] **Commits** suivent Conventional Commits
  ```
  feat(scope): add user notification system

  - Implement email notifications
  - Add SMS notification support
  - Create notification repository

  Closes #123
  ```

- [ ] **Commits atomiques**
  - Pas de commits géants
  - Un commit = un changement logique

### Pull Request

- [ ] **Branche** nommée correctement
  ```
  feature/user-notifications
  ```

- [ ] **PR description** complète
  ```markdown
  ## Summary
  - What
  - Why
  - How

  ## Changes
  - Change 1
  - Change 2

  ## Testing
  - How tested
  - Screenshots if UI

  ## Checklist
  - [x] Tests pass
  - [x] Docs updated
  ```

- [ ] **Tests** passent sur CI
- [ ] **Pas de conflits** avec main
- [ ] **Review** de son propre code effectuée

## Phase 7: Deployment

### Pre-Deployment

- [ ] **Migration DB** prête
  - [ ] Testée en local
  - [ ] Testée en staging
  - [ ] Rollback plan défini

- [ ] **Variables d'environnement** documentées
  - [ ] Équipe devops informée
  - [ ] Valeurs pour prod fournies

- [ ] **Feature flags** configurés (si applicable)
  - [ ] Feature désactivée par défaut
  - [ ] Plan de rollout défini

### Post-Deployment

- [ ] **Monitoring** en place
  - [ ] Logs vérifiés
  - [ ] Métriques vérifiées
  - [ ] Alertes configurées

- [ ] **Smoke tests** effectués
  - [ ] Feature testée en prod
  - [ ] Pas d'erreurs visibles

- [ ] **Rollback plan** prêt si problème

## Checklist Rapide

### Minimum Vital

- [ ] Analyse complète effectuée
- [ ] Architecture propre (Clean + SOLID)
- [ ] Tests écrits et passants (> 80% couverture)
- [ ] `make quality` passe
- [ ] Documentation à jour
- [ ] PR description complète

### Avant Merge

- [ ] Review approuvée
- [ ] CI passe
- [ ] Pas de conflits
- [ ] Squash commits si nécessaire

### Red Flags

Si l'un de ces points est vrai, **NE PAS MERGER**:

- ❌ Analyse pas faite
- ❌ Tests manquants
- ❌ Couverture < 80%
- ❌ Linting/Type errors
- ❌ Secrets en dur
- ❌ Breaking changes non documentés
- ❌ Migration DB non testée
