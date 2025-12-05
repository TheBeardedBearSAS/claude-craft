# Checklist Pre-Commit

## Avant Chaque Commit

### 1. Code Quality

- [ ] **Linting** - Code respecte les standards
  ```bash
  make lint
  # ou
  ruff check src/ tests/
  ```

- [ ] **Formatting** - Code correctement formaté
  ```bash
  make format-check
  # ou
  black --check src/ tests/
  isort --check src/ tests/
  ```

- [ ] **Type Checking** - Pas d'erreurs de types
  ```bash
  make type-check
  # ou
  mypy src/
  ```

- [ ] **Security** - Pas de vulnérabilités évidentes
  ```bash
  make security-check
  # ou
  bandit -r src/ -ll
  ```

### 2. Tests

- [ ] **Tous les tests passent**
  ```bash
  make test
  # ou
  pytest tests/
  ```

- [ ] **Nouveaux tests écrits** pour le nouveau code
  - [ ] Tests unitaires pour nouvelle logique
  - [ ] Tests d'intégration si nécessaire
  - [ ] Tests E2E si flux critique

- [ ] **Couverture maintenue** (> 80%)
  ```bash
  make test-cov
  # ou
  pytest --cov=src --cov-report=term
  ```

- [ ] **Tests pertinents** pour les bugs fixés
  - [ ] Test reproduit le bug (devrait échouer avant fix)
  - [ ] Test passe après le fix

### 3. Code Standards

- [ ] **PEP 8** respecté
  - [ ] Ligne max 88 caractères
  - [ ] Imports organisés (stdlib, third-party, local)
  - [ ] Pas de trailing whitespace

- [ ] **Type hints** sur toutes fonctions publiques
  ```python
  def my_function(param: str) -> int:
      """Docstring."""
      pass
  ```

- [ ] **Docstrings** Google style
  ```python
  def function(arg1: str, arg2: int) -> bool:
      """
      Summary line.

      Args:
          arg1: Description
          arg2: Description

      Returns:
          Description

      Raises:
          ValueError: If condition
      """
      pass
  ```

- [ ] **Naming conventions**
  - [ ] Classes: PascalCase
  - [ ] Fonctions/variables: snake_case
  - [ ] Constantes: UPPER_CASE
  - [ ] Private: _prefixed

### 4. Architecture

- [ ] **Clean Architecture** respectée
  - [ ] Domain ne dépend de rien
  - [ ] Dépendances pointent vers l'intérieur
  - [ ] Protocols pour abstractions

- [ ] **SOLID** appliqué
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI**
  - [ ] Solution simple
  - [ ] Pas de duplication
  - [ ] Pas de code inutile

### 5. Sécurité

- [ ] **Pas de secrets** en dur dans le code
  - [ ] Pas de passwords
  - [ ] Pas d'API keys
  - [ ] Pas de tokens

- [ ] **Variables d'environnement**
  - [ ] Ajoutées à `.env.example` si nouvelles
  - [ ] Documentées dans README si nécessaire

- [ ] **Input validation**
  - [ ] Tous les inputs validés (Pydantic)
  - [ ] Pas d'injection SQL (parameterized queries)
  - [ ] Pas d'injection XSS

- [ ] **Sensitive data**
  - [ ] Passwords hashés (bcrypt)
  - [ ] PII protégées
  - [ ] Logs ne contiennent pas de données sensibles

### 6. Base de Données

- [ ] **Migration** créée si changement de schéma
  ```bash
  make db-migrate msg="Description"
  # ou
  alembic revision --autogenerate -m "Description"
  ```

- [ ] **Migration testée**
  - [ ] Upgrade fonctionne
  - [ ] Downgrade fonctionne
  - [ ] Pas de perte de données

- [ ] **Index** ajoutés si nécessaire
  - [ ] Sur colonnes fréquemment recherchées
  - [ ] Sur foreign keys

### 7. Performance

- [ ] **N+1 queries** évitées
  - [ ] Utilisation de joinedload/selectinload si nécessaire
  - [ ] Pas de queries en boucle

- [ ] **Pagination** pour grandes listes
  - [ ] Limit/offset implémenté
  - [ ] Pas de chargement de milliers d'items

- [ ] **Caching** si approprié
  - [ ] Cache pour données fréquemment accédées
  - [ ] Invalidation du cache gérée

### 8. Logging & Monitoring

- [ ] **Logging approprié**
  - [ ] Niveau correct (DEBUG, INFO, WARNING, ERROR)
  - [ ] Messages clairs et informatifs
  - [ ] Context ajouté (user_id, request_id, etc.)

- [ ] **Pas de print()** - utiliser logger
  ```python
  # ❌ Mauvais
  print(f"User {user_id} created")

  # ✅ Bon
  logger.info(f"User created", extra={"user_id": user_id})
  ```

- [ ] **Exceptions loggées**
  ```python
  try:
      risky_operation()
  except Exception as e:
      logger.error(f"Operation failed: {e}", exc_info=True)
      raise
  ```

### 9. Documentation

- [ ] **Code comments** pour logique complexe
  - [ ] Pas de commentaires évidents
  - [ ] Explication du "pourquoi", pas du "quoi"

- [ ] **README** mis à jour si nécessaire
  - [ ] Nouvelles features documentées
  - [ ] Setup instructions à jour
  - [ ] Variables d'environnement documentées

- [ ] **API docs** à jour
  - [ ] Nouveaux endpoints documentés
  - [ ] Exemples fournis
  - [ ] Erreurs documentées

### 10. Git

- [ ] **Commit message** suit Conventional Commits
  ```
  type(scope): subject

  body

  footer
  ```
  - Types: feat, fix, docs, style, refactor, test, chore
  - Subject: impératif, lowercase, pas de point final
  - Body: optionnel, détails du changement
  - Footer: breaking changes, issues closes

- [ ] **Commit atomique**
  - [ ] Un commit = un changement logique
  - [ ] Pas de commits géants
  - [ ] Pas de commits "WIP" ou "fix"

- [ ] **Fichiers temporaires** pas inclus
  - [ ] Pas de .pyc, __pycache__
  - [ ] Pas de .env (seulement .env.example)
  - [ ] Pas de fichiers IDE

### 11. Dependencies

- [ ] **Nouvelles dépendances** justifiées
  - [ ] Vraiment nécessaire?
  - [ ] Pas d'alternative dans deps existantes?
  - [ ] Librairie maintenue et sécurisée?

- [ ] **Lock file** mis à jour
  ```bash
  poetry lock
  # ou
  uv lock
  ```

- [ ] **Version pinned** correctement
  - [ ] Pas de versions trop larges (`*`)
  - [ ] Compatible avec autres deps

### 12. Cleanup

- [ ] **Code mort** supprimé
  - [ ] Pas de code commenté
  - [ ] Pas de fonctions inutilisées
  - [ ] Pas d'imports inutilisés

- [ ] **Debug code** supprimé
  - [ ] Pas de breakpoint()
  - [ ] Pas de debug prints
  - [ ] Pas de TODO/FIXME (ou créer issue)

- [ ] **Console logs** supprimés
  - [ ] Pas de print() de debug
  - [ ] Logs appropriés utilisés

## Quick Check Command

```bash
# One-liner pour vérifier tout
make quality && make test-cov
```

## Pre-commit Hook

Pour automatiser, utiliser pre-commit hooks:

```bash
# .pre-commit-config.yaml déjà configuré
pre-commit install

# Run manuellement
pre-commit run --all-files
```

## Si Quelque Chose Échoue

### Linting Errors

```bash
# Auto-fix ce qui peut l'être
make lint-fix
# ou
ruff check --fix src/ tests/
```

### Formatting Errors

```bash
# Auto-format
make format
# ou
black src/ tests/
isort src/ tests/
```

### Tests Failing

```bash
# Run tests en verbose pour debug
pytest -vv tests/

# Run un test spécifique
pytest tests/path/to/test.py::test_function -vv

# Voir stdout/stderr
pytest -s tests/
```

### Type Errors

```bash
# Voir erreurs détaillées
mypy src/ --show-error-codes

# Ignorer temporairement (à éviter!)
# type: ignore[error-code]
```

## Exceptions

### Hotfix Urgent

Si hotfix urgent en production:
- [ ] Tests minimums passent
- [ ] Fix vérifié manuellement
- [ ] PR créée immédiatement après
- [ ] TODO créé pour améliorer tests

### WIP Commit

Si vraiment nécessaire (à éviter):
- [ ] Commit dans branche séparée
- [ ] Préfixé par `WIP:`
- [ ] Squash avant merge dans main

## Checklist Rapide (Minimum)

- [ ] `make lint` ✅
- [ ] `make type-check` ✅
- [ ] `make test` ✅
- [ ] Commit message valide ✅
- [ ] Pas de secrets ✅
