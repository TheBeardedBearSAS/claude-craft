---
description: Vérification Pre-Merge
argument-hint: [arguments]
---

# Vérification Pre-Merge

Tu es un assistant de qualité code. Tu dois effectuer toutes les vérifications nécessaires AVANT de merger une branche, pour garantir la qualité et éviter les régressions.

## Arguments
$ARGUMENTS

Arguments attendus :
- Branche source (défaut: branche courante)
- Branche cible (défaut: main ou master)

Exemple : `/common:pre-merge-check feature/auth main`

## MISSION

### Étape 1 : Analyser le Diff

```bash
# Identifier les branches
SOURCE_BRANCH=$(git branch --show-current)
TARGET_BRANCH=${2:-main}

# Commits à merger
git log $TARGET_BRANCH..$SOURCE_BRANCH --oneline

# Fichiers modifiés
git diff $TARGET_BRANCH...$SOURCE_BRANCH --stat

# Lignes ajoutées/supprimées
git diff $TARGET_BRANCH...$SOURCE_BRANCH --shortstat
```

### Étape 2 : Vérifications de Qualité

#### 2.1 Tests Complets
```bash
# Exécuter TOUS les tests
# Symfony
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app pytest --cov --cov-report=term

# React/RN
docker compose exec node npm run test -- --coverage
```

#### 2.2 Analyse Statique Complète
```bash
# PHPStan (niveau max)
docker compose exec php vendor/bin/phpstan analyse -l max

# Dart Analyzer
docker run --rm -v $(pwd):/app -w /app dart dart analyze --fatal-infos

# Mypy (strict)
docker compose exec app mypy --strict .

# TypeScript
docker compose exec node npx tsc --noEmit
```

#### 2.3 Vérification Dépendances
```bash
# Audit sécurité
# PHP
docker compose exec php composer audit

# Python
docker compose exec app pip-audit

# Node
docker compose exec node npm audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated
```

### Étape 3 : Vérifications Spécifiques

#### Migrations DB (si présentes)
```bash
# Vérifier les migrations Doctrine
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- migrations/

# Si migrations présentes
docker compose exec php php bin/console doctrine:migrations:diff --no-interaction
docker compose exec php php bin/console doctrine:schema:validate
```

#### Breaking Changes API
```bash
# Comparer les specs OpenAPI
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- openapi.yaml docs/api/
```

#### Changements Configuration
```bash
# Fichiers de config modifiés
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- config/ .env.example docker-compose*.yml
```

### Étape 4 : Analyse des Commits

```bash
# Vérifier les messages de commit
git log $TARGET_BRANCH..$SOURCE_BRANCH --pretty=format:"%s" | while read msg; do
    # Pattern conventionnel : type(scope): description
    if ! echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo "⚠️ Message non conventionnel: $msg"
    fi
done
```

### Étape 5 : Vérification Couverture

```bash
# Comparer la couverture avant/après
# La couverture ne doit pas diminuer
```

### Étape 6 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
🔀 PRE-MERGE CHECK
══════════════════════════════════════════════════════════════

📌 Source : feature/user-auth
📌 Cible  : main
📅 Date   : YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
📊 STATISTIQUES
──────────────────────────────────────────────────────────────

Commits : 12
Fichiers modifiés : 45
Lignes ajoutées : +1,234
Lignes supprimées : -567

──────────────────────────────────────────────────────────────
🧪 TESTS
──────────────────────────────────────────────────────────────

| Suite | Tests | Passés | Échoués | Skipped |
|-------|-------|--------|---------|---------|
| Unit  | 234   | 234    | 0       | 0       |
| Integ | 45    | 45     | 0       | 0       |
| E2E   | 12    | 12     | 0       | 0       |

Couverture : 85.2% (précédent: 84.8%) ✅ +0.4%

──────────────────────────────────────────────────────────────
🔍 ANALYSE STATIQUE
──────────────────────────────────────────────────────────────

| Outil | Erreurs | Warnings | Status |
|-------|---------|----------|--------|
| PHPStan | 0 | 2 | ✅ |
| ESLint | 0 | 5 | ⚠️ |
| Mypy | 0 | 0 | ✅ |

──────────────────────────────────────────────────────────────
🔒 SÉCURITÉ
──────────────────────────────────────────────────────────────

Audit dépendances : ✅ Pas de vulnérabilité
Secrets détectés : ✅ Aucun
Fichiers sensibles : ✅ Aucun

──────────────────────────────────────────────────────────────
📦 MIGRATIONS
──────────────────────────────────────────────────────────────

Nouvelles migrations : 2
  - Version20240115_AddUserRoles.php
  - Version20240116_CreateAuditLog.php

Schema validation : ✅ OK
Rollback possible : ✅ Oui

──────────────────────────────────────────────────────────────
⚠️ POINTS D'ATTENTION
──────────────────────────────────────────────────────────────

1. [MEDIUM] 5 warnings ESLint à corriger
2. [LOW] 2 TODO ajoutés dans le code
3. [INFO] 2 nouvelles migrations - vérifier en staging d'abord

──────────────────────────────────────────────────────────────
📋 CHECKLIST FINALE
──────────────────────────────────────────────────────────────

- [x] Tous les tests passent
- [x] Couverture maintenue ou améliorée
- [x] Pas d'erreurs d'analyse statique
- [x] Pas de vulnérabilités de sécurité
- [x] Pas de secrets commités
- [ ] Code review approuvée (à vérifier manuellement)
- [ ] Testé en staging (à vérifier manuellement)

──────────────────────────────────────────────────────────────
🎯 VERDICT
──────────────────────────────────────────────────────────────

Merge autorisé : ✅ OUI

Recommandations avant merge :
1. Résoudre les 5 warnings ESLint
2. Tester les migrations en staging
3. Obtenir l'approbation de la code review
```

## Règles de Blocage

### Bloquant (merge interdit)
- ❌ Tests qui échouent
- ❌ Couverture en baisse significative (> 2%)
- ❌ Erreurs d'analyse statique
- ❌ Vulnérabilités critiques/hautes
- ❌ Secrets dans le code
- ❌ Migrations non réversibles

### Non-bloquant (warning)
- ⚠️ Warnings d'analyse statique
- ⚠️ TODO/FIXME ajoutés
- ⚠️ Vulnérabilités basses/moyennes
- ⚠️ Couverture légèrement diminuée (< 2%)
