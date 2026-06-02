---
description: Vérification Complète de la Conformité Vue.js
argument-hint: [arguments]
---

# Vérification Complète de la Conformité Vue.js

## Arguments

$ARGUMENTS (optionnel : chemin du projet à analyser)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Réaliser un audit complet de conformité du projet Vue.js en orchestrant les 4 grandes vérifications : Architecture, Qualité du Code, Tests et Sécurité. Produire un rapport consolidé avec un score global sur 100 points.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (package.json, tsconfig.json, vite.config.ts)
- [ ] Lister les répertoires principaux (src/, tests/, public/, etc.)
- [ ] Identifier la structure du projet et la version Vue.js

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit Architecture (25 points)

Exécuter la vérification complète de l'architecture :

**Commande** : Utiliser la commande slash `/vuejs:check-architecture` ou suivre manuellement les étapes dans `check-architecture.md`

**Critères évalués** :
- Organisation des composants et des fonctionnalités (6 pts)
- Structure et réutilisation des composables (6 pts)
- Architecture du store Pinia (4 pts)
- Configuration du routeur et lazy loading (4 pts)
- Séparation des modules partagés/communs (3 pts)
- Règles de dépendances et exports barrel (2 pts)

**Référence** : `check-architecture.md`

### Étape 3 : Audit Qualité du Code (25 points)

Exécuter la vérification de la qualité du code :

**Commande** : Utiliser la commande slash `/vuejs:check-code-quality` ou suivre manuellement les étapes dans `check-code-quality.md`

**Critères évalués** :
- Mode strict TypeScript et sûreté des types (5 pts)
- Conformité ESLint et Prettier (5 pts)
- Utilisation de la Composition API et de script setup (4 pts)
- Principes KISS/DRY/YAGNI (4 pts)
- Conventions de nommage (4 pts)
- Gestion des erreurs (3 pts)

**Référence** : `check-code-quality.md`

### Étape 4 : Audit Tests (25 points)

Exécuter la vérification des tests :

**Commande** : Utiliser la commande slash `/vuejs:check-testing` ou suivre manuellement les étapes dans `check-testing.md`

**Critères évalués** :
- Couverture du code (7 pts)
- Tests unitaires pour les composables et les stores (6 pts)
- Tests de composants avec Vue Test Utils (4 pts)
- Tests d'intégration (3 pts)
- Qualité des tests et pattern AAA (3 pts)
- Organisation des mocks et des fixtures (2 pts)

**Référence** : `check-testing.md`

### Étape 5 : Audit Sécurité (25 points)

Exécuter la vérification de sécurité :

**Commande** : Utiliser la commande slash `/vuejs:check-security` ou suivre manuellement les étapes dans `check-security.md`

**Critères évalués** :
- Prévention XSS (utilisation de v-html) (6 pts)
- Gestion des secrets et des identifiants (5 pts)
- Validation et assainissement des entrées (4 pts)
- Vulnérabilités des dépendances (4 pts)
- Authentification et route guards (3 pts)
- Communication API sécurisée (2 pts)
- Protection CSRF (1 pt)

**Référence** : `check-security.md`

### Étape 6 : Consolidation et Score Global

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (max 100 points)
- [ ] Identifier les catégories critiques (<50%)
- [ ] Lister tous les problèmes transversaux critiques
- [ ] Prioriser les actions par impact/effort
- [ ] Produire le rapport final consolidé

**Échelle de notation** :
- 90-100 : Excellent - Projet de référence
- 75-89 : Très bien - Quelques améliorations mineures
- 60-74 : Acceptable - Des améliorations sont nécessaires
- 40-59 : Insuffisant - Refactoring majeur requis
- 0-39 : Critique - Refonte complète nécessaire

### Étape 7 : Recommandations et Plan d'Action

Produire les recommandations finales :
- [ ] Identifier les 3 actions prioritaires dans toutes les catégories
- [ ] Estimer l'effort (Faible/Moyen/Élevé) pour chaque action
- [ ] Estimer l'impact (Faible/Moyen/Élevé) pour chaque action
- [ ] Proposer un ordre d'implémentation
- [ ] Suggérer des gains rapides (ratio impact/effort élevé)

## FORMAT DE SORTIE

```
AUDIT DE CONFORMITÉ VUE.JS - RAPPORT COMPLET
=============================================

SCORE GLOBAL : XX/100

NIVEAU DE CONFORMITÉ : [Excellent/Très bien/Acceptable/Insuffisant/Critique]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES PAR CATÉGORIE :

ARCHITECTURE       : XX/25  [██████████░░░░░░░░░░] XX%
QUALITÉ DU CODE    : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SÉCURITÉ           : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POINTS FORTS GLOBAUX :
1. [Point fort identifié dans plusieurs catégories]
2. [Autre point fort majeur]
3. [Troisième point fort]

AMÉLIORATIONS GLOBALES :
1. [Amélioration transversale mineure]
2. [Autre amélioration recommandée]
3. [Troisième amélioration]

PROBLÈMES CRITIQUES :
1. [Problème critique #1 - catégorie concernée]
2. [Problème critique #2 - catégorie concernée]
3. [Problème critique #3 - catégorie concernée]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÉTAILS PAR CATÉGORIE :

┌─────────────────────────────────────────────┐
│ ARCHITECTURE (XX/25)                        │
└─────────────────────────────────────────────┘

Sous-scores :
  • Organisation composants/fonctionnalités   : XX/6
  • Structure des composables                 : XX/6
  • Architecture store Pinia                  : XX/4
  • Routeur et lazy loading                   : XX/4
  • Séparation des modules partagés           : XX/3
  • Règles de dépendances                     : XX/2

Points forts :
- [Points forts d'architecture]

Problèmes :
- [Problèmes d'architecture]

[Sections similaires pour Qualité du Code, Tests et Sécurité...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 DES ACTIONS PRIORITAIRES (TOUTES CATÉGORIES) :

1. CRITIQUE - [Action #1]
   Catégorie  : [Architecture/Qualité/Tests/Sécurité]
   Impact     : [Élevé/Moyen/Faible]
   Effort     : [Élevé/Moyen/Faible]
   Priorité   : IMMÉDIATE

   Description détaillée :
   [Explication du problème et solution proposée]

   Fichiers concernés :
   - [fichier:ligne]

   Exemple de correction :
   [Code ou commande de correction]

2. IMPORTANT - [Action #2]
   [Même format...]

3. RECOMMANDÉ - [Action #3]
   [Même format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GAINS RAPIDES (Impact Élevé / Effort Faible) :

- [Gain rapide #1] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Gain rapide #2] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Gain rapide #3] - Catégorie : [X] - Impact : [X] - Effort : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN D'ACTION RECOMMANDÉ :

SEMAINE 1 (Immédiat) :
- [ ] [Action critique #1]
- [ ] [Gain rapide prioritaire]

SEMAINES 2-4 (Court terme) :
- [ ] [Action importante #2]
- [ ] [Autres gains rapides]

MOIS 2-3 (Moyen terme) :
- [ ] [Action recommandée #3]
- [ ] [Améliorations progressives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÉSUMÉ EXÉCUTIF :

[Paragraphe de synthèse sur l'état global du projet, les principaux
points forts, les principales faiblesses et la trajectoire recommandée
pour améliorer la conformité. Mentionner si le projet est prêt pour
la production, nécessite des corrections ou un refactoring.]

Recommandation générale : [Prêt pour la production / Corrections mineures /
Refactoring majeur / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 audits spécialisés
- Utiliser Docker pour tous les outils d'analyse
- Fournir des exemples concrets avec fichier:ligne pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- Les problèmes de sécurité sont TOUJOURS prioritaires
- Proposer des corrections automatisables (scripts, hooks pre-commit)
- Le rapport doit être actionnable, pas seulement descriptif
- Adapter les recommandations au contexte métier du projet
