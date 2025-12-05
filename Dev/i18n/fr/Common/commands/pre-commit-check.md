# Vérification Pre-Commit

Tu es un assistant de qualité code. Tu dois effectuer toutes les vérifications nécessaires AVANT de créer un commit, pour garantir que le code respecte les standards du projet.

## Arguments
$ARGUMENTS

Options :
- `--fix` : Corriger automatiquement les problèmes corrigeables
- `--staged` : Vérifier uniquement les fichiers stagés

## MISSION

### Étape 1 : Identifier les Fichiers Modifiés

```bash
# Fichiers stagés
git diff --cached --name-only

# Fichiers modifiés (non stagés)
git diff --name-only
```

### Étape 2 : Détecter la Technologie par Fichier

| Extension | Technologie | Outils |
|-----------|-------------|--------|
| `.php` | PHP/Symfony | php-cs-fixer, phpstan |
| `.dart` | Flutter | dart format, dart analyze |
| `.py` | Python | ruff, mypy |
| `.ts`, `.tsx` | React/RN | eslint, prettier |
| `.js`, `.jsx` | React/RN | eslint, prettier |

### Étape 3 : Exécuter les Vérifications

#### Pour les fichiers PHP
```bash
# Formatage
docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff [fichiers]

# Analyse statique
docker compose exec php vendor/bin/phpstan analyse [fichiers]

# Syntaxe Twig (si modifiés)
docker compose exec php php bin/console lint:twig templates/

# Container Symfony
docker compose exec php php bin/console lint:container
```

#### Pour les fichiers Dart/Flutter
```bash
# Formatage
docker run --rm -v $(pwd):/app -w /app dart dart format --set-exit-if-changed [fichiers]

# Analyse
docker run --rm -v $(pwd):/app -w /app dart dart analyze [fichiers]

# Tests affectés
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

#### Pour les fichiers Python
```bash
# Linting + formatage
docker compose exec app ruff check [fichiers]
docker compose exec app ruff format --check [fichiers]

# Types
docker compose exec app mypy [fichiers]
```

#### Pour les fichiers JS/TS
```bash
# Linting
docker compose exec node npx eslint [fichiers]

# Formatage
docker compose exec node npx prettier --check [fichiers]

# Types (si TypeScript)
docker compose exec node npx tsc --noEmit
```

### Étape 4 : Vérifications Globales

#### Secrets
```bash
# Rechercher des patterns de secrets
grep -rE "(password|secret|api_key|token)\s*[:=]\s*['\"][^'\"]+['\"]" --include="*.{php,py,ts,js,dart}" .
grep -rE "sk_live_|pk_live_|ghp_|gho_|AKIA" .
```

#### Fichiers interdits
```bash
# Vérifier qu'il n'y a pas de fichiers sensibles
git diff --cached --name-only | grep -E "\.(env|pem|key|p12)$"
```

#### Taille des fichiers
```bash
# Fichiers > 1MB
find . -type f -size +1M -name "*.{php,py,ts,js,dart}"
```

### Étape 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
🔍 PRE-COMMIT CHECK
══════════════════════════════════════════════════════════════

📁 Fichiers vérifiés : X
📅 Date : YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
✅ VÉRIFICATIONS RÉUSSIES
──────────────────────────────────────────────────────────────

✅ Formatage PHP (php-cs-fixer)
✅ Analyse statique PHP (phpstan)
✅ Formatage TypeScript (prettier)
✅ Linting TypeScript (eslint)
✅ Pas de secrets détectés

──────────────────────────────────────────────────────────────
⚠️ PROBLÈMES DÉTECTÉS
──────────────────────────────────────────────────────────────

❌ [PHP] src/Controller/UserController.php:45
   PHPStan: Parameter $id of method __construct() has no type hint

⚠️ [TS] src/components/Button.tsx:12
   ESLint: 'unused' is defined but never used (no-unused-vars)

──────────────────────────────────────────────────────────────
📋 RÉSUMÉ
──────────────────────────────────────────────────────────────

| Catégorie | Status |
|-----------|--------|
| Formatage | ✅ OK |
| Linting   | ⚠️ 1 warning |
| Types     | ❌ 1 erreur |
| Secrets   | ✅ OK |

──────────────────────────────────────────────────────────────
🎯 ACTIONS REQUISES
──────────────────────────────────────────────────────────────

1. Corriger l'erreur PHPStan dans UserController.php
2. (Optionnel) Corriger le warning ESLint

Commit autorisé : ❌ NON (1 erreur bloquante)
```

### Option --fix

Si `--fix` est passé en argument :

```bash
# PHP
docker compose exec php vendor/bin/php-cs-fixer fix [fichiers]

# Dart
docker run --rm -v $(pwd):/app -w /app dart dart format [fichiers]

# Python
docker compose exec app ruff check --fix [fichiers]
docker compose exec app ruff format [fichiers]

# JS/TS
docker compose exec node npx eslint --fix [fichiers]
docker compose exec node npx prettier --write [fichiers]
```

## Règles de Blocage

### Bloquant (commit interdit)
- ❌ Erreurs de syntaxe
- ❌ Erreurs PHPStan/mypy/tsc
- ❌ Secrets détectés
- ❌ Fichiers .env commités
- ❌ Clés privées/certificats

### Non-bloquant (warning)
- ⚠️ Problèmes de formatage
- ⚠️ Warnings ESLint
- ⚠️ Couverture de tests diminuée
- ⚠️ TODO/FIXME ajoutés

## Conseil

Pour automatiser, configurer un hook pre-commit :

```bash
# .git/hooks/pre-commit
#!/bin/sh
claude-code "/common:pre-commit-check --staged"
```
