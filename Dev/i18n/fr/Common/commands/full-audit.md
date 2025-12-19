---
description: Audit Multi-Technologies Complet
argument-hint: [arguments]
---

# Audit Multi-Technologies Complet

Tu es un auditeur de code expert. Tu dois effectuer un audit complet de conformité sur le projet, en détectant automatiquement les technologies présentes et en appliquant les rules correspondantes.

## Arguments
$ARGUMENTS

Si aucun argument fourni, détecter automatiquement toutes les technologies.

## MISSION

### Étape 1 : Détection des Technologies

Scanner le projet pour identifier les technologies présentes :

| Fichier | Technologie |
|---------|-------------|
| `composer.json` + `symfony/*` | Symfony |
| `pubspec.yaml` + `flutter:` | Flutter |
| `pyproject.toml` ou `requirements.txt` | Python |
| `package.json` + `react` (sans `react-native`) | React |
| `package.json` + `react-native` | React Native |

Pour chaque technologie détectée :
1. Charger les rules depuis `.claude/rules/`
2. Appliquer l'audit spécifique

### Étape 2 : Audit par Technologie

Pour CHAQUE technologie détectée, vérifier :

#### Architecture (25 points)
- [ ] Couches séparées (Domain/Application/Infrastructure)
- [ ] Dépendances inward-pointing (vers le domain)
- [ ] Structure de dossiers conforme aux conventions
- [ ] Pas de couplage framework dans le domaine
- [ ] Patterns architecturaux respectés

#### Qualité du Code (25 points)
- [ ] Standards de nommage respectés
- [ ] Linting/Analyze sans erreurs critiques
- [ ] Type hints/annotations présents
- [ ] Documentation des classes publiques
- [ ] Complexité cyclomatique < 10

#### Testing (25 points)
- [ ] Couverture ≥ 80%
- [ ] Tests unitaires pour le domain
- [ ] Tests d'intégration présents
- [ ] Tests E2E/Widget pour l'UI
- [ ] Pyramide de tests respectée

#### Sécurité (25 points)
- [ ] Pas de secrets dans le code source
- [ ] Input validation sur toutes les entrées
- [ ] Protections OWASP (XSS, CSRF, injection)
- [ ] Données sensibles chiffrées
- [ ] Dépendances sans vulnérabilités connues

### Étape 3 : Exécuter les Outils

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov

# React/React Native
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
```

### Étape 4 : Calculer les Scores

Pour chaque technologie, calculer :
- Score Architecture : X/25
- Score Qualité Code : X/25
- Score Testing : X/25
- Score Sécurité : X/25
- **Score Total : X/100**

### Étape 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
📊 AUDIT MULTI-TECHNOLOGIES - Score Global: XX/100
══════════════════════════════════════════════════════════════

Technologies détectées : [liste]
Date : YYYY-MM-DD

──────────────────────────────────────────────────────────────
🔷 SYMFONY - Score: XX/100
──────────────────────────────────────────────────────────────

🏗️ Architecture (XX/25)
  ✅ Clean Architecture respectée
  ✅ CQRS implémenté correctement
  ⚠️ 2 services accèdent directement au Repository

📝 Qualité Code (XX/25)
  ✅ PHPStan level 8 - 0 erreur
  ✅ Conventions PSR-12 respectées
  ⚠️ 5 méthodes > 20 lignes

🧪 Testing (XX/25)
  ✅ Couverture: 85%
  ✅ Tests unitaires domain
  ⚠️ Pas de tests E2E Panther

🔒 Sécurité (XX/25)
  ✅ Pas de secrets dans le code
  ✅ CSRF activé
  ⚠️ Dépendance avec CVE mineure

──────────────────────────────────────────────────────────────
🔷 FLUTTER - Score: XX/100
──────────────────────────────────────────────────────────────

[Même structure]

══════════════════════════════════════════════════════════════
📋 SYNTHÈSE GLOBALE
══════════════════════════════════════════════════════════════

| Technologie | Architecture | Code | Tests | Sécurité | Total |
|-------------|--------------|------|-------|----------|-------|
| Symfony     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| Flutter     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| MOYENNE     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|

══════════════════════════════════════════════════════════════
🎯 TOP 5 ACTIONS PRIORITAIRES
══════════════════════════════════════════════════════════════

1. [CRITIQUE] Description action 1
   → Impact: +X points | Effort: Faible/Moyen/Élevé

2. [HAUTE] Description action 2
   → Impact: +X points | Effort: Faible/Moyen/Élevé

3. [MOYENNE] Description action 3
   → Impact: +X points | Effort: Faible/Moyen/Élevé

4. [MOYENNE] Description action 4
   → Impact: +X points | Effort: Faible/Moyen/Élevé

5. [BASSE] Description action 5
   → Impact: +X points | Effort: Faible/Moyen/Élevé
```

## Règles de Scoring

### Déductions par Catégorie

| Violation | Points perdus |
|-----------|---------------|
| Pattern architectural violé | -5 |
| Couplage framework/domain | -3 |
| Erreur linting critique | -2 |
| Warning linting | -1 |
| Méthode > 30 lignes | -1 |
| Couverture < 80% | -5 |
| Pas de tests unitaires domain | -5 |
| Secret dans le code | -10 |
| Vulnérabilité CVE critique | -10 |
| Vulnérabilité CVE haute | -5 |

### Seuils de Qualité

| Score | Évaluation |
|-------|------------|
| 90-100 | Excellent |
| 75-89 | Bon |
| 60-74 | Acceptable |
| 40-59 | À améliorer |
| < 40 | Critique |
