---
description: Vérification Compliance Complète Python
argument-hint: [arguments]
model: haiku

---

# Vérification Compliance Complète Python

## Arguments

$ARGUMENTS (optionnel : chemin vers le projet à analyser)

## MISSION

Réaliser un audit complet de conformité du projet Python en orchestrant les 4 vérifications majeures : Architecture, Qualité du Code, Tests, et Sécurité. Produire un rapport consolidé avec un score global sur 100 points.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (pyproject.toml, requirements.txt)
- [ ] Lister les répertoires principaux (src/, tests/, etc.)
- [ ] Identifier la structure du projet

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit Architecture (25 points)

Exécuter la vérification architecture complète :

**Commande** : Utiliser le slash command `/check-architecture` ou suivre manuellement les étapes de `check-architecture.md`

**Critères évalués** :
- Structure et séparation des couches (6 pts)
- Respect des dépendances (6 pts)
- Ports et Adapters (4 pts)
- Modélisation du domaine (4 pts)
- Use Cases et Services (3 pts)
- Principes SOLID (2 pts)

**Référence** : `claude-commands/python/check-architecture.md`

### Étape 3 : Audit Qualité du Code (25 points)

Exécuter la vérification qualité du code :

**Commande** : Utiliser le slash command `/check-code-quality` ou suivre manuellement les étapes de `check-code-quality.md`

**Critères évalués** :
- PEP8 et formatage (5 pts)
- Type hints et MyPy (5 pts)
- Ruff linting (4 pts)
- KISS/DRY/YAGNI (4 pts)
- Documentation (4 pts)
- Gestion des erreurs (3 pts)

**Référence** : `claude-commands/python/check-code-quality.md`

### Étape 4 : Audit Tests (25 points)

Exécuter la vérification des tests :

**Commande** : Utiliser le slash command `/check-testing` ou suivre manuellement les étapes de `check-testing.md`

**Critères évalués** :
- Couverture de code (7 pts)
- Tests unitaires (6 pts)
- Tests d'intégration (4 pts)
- Qualité des assertions (3 pts)
- Fixtures et organisation (3 pts)
- Performance (2 pts)

**Référence** : `claude-commands/python/check-testing.md`

### Étape 5 : Audit Sécurité (25 points)

Exécuter la vérification sécurité :

**Commande** : Utiliser le slash command `/check-security` ou suivre manuellement les étapes de `check-security.md`

**Critères évalués** :
- Bandit scan (6 pts)
- Secrets et credentials (5 pts)
- Validation des entrées (4 pts)
- Dépendances sécurisées (4 pts)
- Gestion des erreurs (3 pts)
- Auth/Authz (2 pts)
- Injection/XSS (1 pt)

**Référence** : `claude-commands/python/check-security.md`

### Étape 6 : Consolidation et scoring global

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (max 100 points)
- [ ] Identifier les catégories critiques (<50%)
- [ ] Lister tous les problèmes critiques transverses
- [ ] Prioriser les actions selon impact/effort
- [ ] Produire le rapport final consolidé

**Grille d'évaluation** :
- 90-100 : 🏆 Excellent - Projet de référence
- 75-89 : ✅ Très Bon - Quelques améliorations mineures
- 60-74 : ⚠️ Acceptable - Nécessite des améliorations
- 40-59 : ❌ Insuffisant - Refactoring important requis
- 0-39 : 🚨 Critique - Refonte complète nécessaire

### Étape 7 : Recommandations et plan d'action

Produire les recommandations finales :
- [ ] Identifier les 3 actions prioritaires toutes catégories confondues
- [ ] Estimer l'effort (Faible/Moyen/Élevé) pour chaque action
- [ ] Estimer l'impact (Faible/Moyen/Élevé) pour chaque action
- [ ] Proposer un ordre d'implémentation
- [ ] Suggérer des quick wins (ratio impact/effort élevé)

## FORMAT DE SORTIE

```
🎯 AUDIT COMPLIANCE PYTHON - RAPPORT COMPLET
=============================================

📊 SCORE GLOBAL : XX/100

🏆 NIVEAU DE CONFORMITÉ : [Excellent/Très Bon/Acceptable/Insuffisant/Critique]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 SCORES PAR CATÉGORIE :

🏗️ ARCHITECTURE       : XX/25  [██████████░░░░░░░░░░] XX%
📝 QUALITÉ DU CODE     : XX/25  [██████████░░░░░░░░░░] XX%
🧪 TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
🔒 SÉCURITÉ           : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ POINTS FORTS GLOBAUX :
1. [Point fort identifié dans plusieurs catégories]
2. [Autre point fort majeur]
3. [Troisième point fort]

⚠️ POINTS D'AMÉLIORATION GLOBAUX :
1. [Amélioration mineure transverse]
2. [Autre amélioration recommandée]
3. [Troisième amélioration]

❌ PROBLÈMES CRITIQUES GLOBAUX :
1. [Problème critique #1 - catégorie concernée]
2. [Problème critique #2 - catégorie concernée]
3. [Problème critique #3 - catégorie concernée]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DÉTAILS PAR CATÉGORIE :

┌─────────────────────────────────────────────┐
│ 🏗️ ARCHITECTURE (XX/25)                     │
└─────────────────────────────────────────────┘

Sous-scores :
  • Structure et couches      : XX/6
  • Dépendances              : XX/6
  • Ports et Adapters        : XX/4
  • Modélisation Domain      : XX/4
  • Use Cases                : XX/3
  • SOLID Principles         : XX/2

✅ Points forts :
- [Points forts architecture]

❌ Problèmes identifiés :
- [Problèmes architecture]

┌─────────────────────────────────────────────┐
│ 📝 QUALITÉ DU CODE (XX/25)                  │
└─────────────────────────────────────────────┘

Sous-scores :
  • PEP8 et formatage        : XX/5
  • Type hints               : XX/5
  • Ruff linting             : XX/4
  • KISS/DRY/YAGNI          : XX/4
  • Documentation            : XX/4
  • Gestion erreurs          : XX/3

Métriques :
  • Erreurs Flake8           : XX
  • Erreurs MyPy             : XX
  • Warnings Ruff            : XX
  • Complexité max           : XX

✅ Points forts :
- [Points forts qualité]

❌ Problèmes identifiés :
- [Problèmes qualité]

┌─────────────────────────────────────────────┐
│ 🧪 TESTS (XX/25)                            │
└─────────────────────────────────────────────┘

Sous-scores :
  • Couverture               : XX/7
  • Tests unitaires          : XX/6
  • Tests intégration        : XX/4
  • Assertions               : XX/3
  • Fixtures                 : XX/3
  • Performance              : XX/2

Métriques :
  • Couverture globale       : XX%
  • Couverture Domain        : XX%
  • Nombre de tests          : XX
  • Temps d'exécution        : XXs

✅ Points forts :
- [Points forts tests]

❌ Problèmes identifiés :
- [Problèmes tests]

┌─────────────────────────────────────────────┐
│ 🔒 SÉCURITÉ (XX/25)                         │
└─────────────────────────────────────────────┘

Sous-scores :
  • Bandit scan              : XX/6
  • Secrets                  : XX/5
  • Validation entrées       : XX/4
  • Dépendances              : XX/4
  • Gestion erreurs          : XX/3
  • Auth/Authz               : XX/2
  • Injections               : XX/1

Métriques :
  • Issues Bandit critiques  : XX
  • CVE critiques            : XX
  • Secrets exposés          : XX

🚨 VULNÉRABILITÉS CRITIQUES :
- [Liste des vulnérabilités à corriger immédiatement]

✅ Points forts :
- [Points forts sécurité]

❌ Problèmes identifiés :
- [Problèmes sécurité]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TOP 3 ACTIONS PRIORITAIRES (TOUTES CATÉGORIES) :

1. 🚨 CRITIQUE - [Action #1]
   Catégorie : [Architecture/Qualité/Tests/Sécurité]
   Impact    : [Élevé/Moyen/Faible]
   Effort    : [Élevé/Moyen/Faible]
   Priorité  : IMMÉDIATE

   Description détaillée :
   [Explication du problème et de la solution proposée]

   Fichiers concernés :
   - [fichier:ligne]

   Exemple de correction :
   [Code ou commande de correction]

2. ⚠️ IMPORTANT - [Action #2]
   Catégorie : [Architecture/Qualité/Tests/Sécurité]
   Impact    : [Élevé/Moyen/Faible]
   Effort    : [Élevé/Moyen/Faible]
   Priorité  : COURT TERME (< 1 semaine)

   Description détaillée :
   [Explication du problème et de la solution proposée]

   Fichiers concernés :
   - [fichier:ligne]

   Exemple de correction :
   [Code ou commande de correction]

3. 💡 RECOMMANDÉ - [Action #3]
   Catégorie : [Architecture/Qualité/Tests/Sécurité]
   Impact    : [Élevé/Moyen/Faible]
   Effort    : [Élevé/Moyen/Faible]
   Priorité  : MOYEN TERME (< 1 mois)

   Description détaillée :
   [Explication du problème et de la solution proposée]

   Fichiers concernés :
   - [fichier:ligne]

   Exemple de correction :
   [Code ou commande de correction]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 QUICK WINS (Impact élevé / Effort faible) :

- [Quick win #1] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Quick win #2] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Quick win #3] - Catégorie : [X] - Impact : [X] - Effort : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 PLAN D'ACTION RECOMMANDÉ :

SEMAINE 1 (Immédiat) :
- [ ] [Action critique #1]
- [ ] [Quick win prioritaire]

SEMAINE 2-4 (Court terme) :
- [ ] [Action importante #2]
- [ ] [Autres quick wins]

MOIS 2-3 (Moyen terme) :
- [ ] [Action recommandée #3]
- [ ] [Améliorations progressives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 RÉFÉRENCES :

Architecture     : rules/02-architecture.md
Coding Standards : rules/03-coding-standards.md
SOLID            : rules/04-solid-principles.md
KISS/DRY/YAGNI   : rules/05-kiss-dry-yagni.md
Tooling          : rules/06-tooling.md
Testing          : rules/07-testing.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RÉSUMÉ EXÉCUTIF :

[Paragraphe de synthèse sur l'état global du projet, les points forts,
les faiblesses majeures, et la trajectoire recommandée pour améliorer
la conformité. Mentionner si le projet est prêt pour la production,
nécessite des corrections, ou doit être refondu.]

Recommandation générale : [Prêt pour production / Corrections mineures /
Refactoring important / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 audits spécialisés
- Utiliser Docker pour tous les outils d'analyse
- Fournir des exemples concrets avec fichier:ligne pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- Les problèmes de sécurité sont TOUJOURS prioritaires
- Proposer des corrections automatisables (scripts, pre-commit hooks)
- Le rapport doit être actionnable, pas seulement descriptif
- Adapter les recommandations au contexte métier du projet
