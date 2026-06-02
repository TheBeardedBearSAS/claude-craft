---
description: Vérification Complète de la Conformité Laravel
argument-hint: [arguments]
---

# Vérification Complète de la Conformité Laravel

## Arguments

$ARGUMENTS (optionnel : chemin du projet à analyser)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Réaliser un audit complet de conformité du projet Laravel en orchestrant les 4 grandes vérifications : Architecture, Qualité du Code, Tests et Sécurité. Produire un rapport consolidé avec un score global sur 100 points.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (composer.json avec laravel/*, .env.example)
- [ ] Lister les répertoires principaux (app/, tests/, config/, routes/, etc.)
- [ ] Identifier la structure du projet et la version Laravel

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit Architecture (25 points)

Exécuter la vérification complète de l'architecture :

**Commande** : Utiliser la commande slash `/laravel:check-architecture` ou suivre manuellement les étapes dans `check-architecture.md`

**Critères évalués** :
- Séparation des couches en Clean Architecture (6 pts)
- Structure Domain/Application/Infrastructure (6 pts)
- Pattern Actions et contrôleurs fins (4 pts)
- Bindings des Service Providers (4 pts)
- Pattern Repository et interfaces (3 pts)
- Règles de dépendances (2 pts)

**Référence** : `check-architecture.md`

### Étape 3 : Audit Qualité du Code (25 points)

Exécuter la vérification de la qualité du code :

**Commande** : Utiliser la commande slash `/laravel:check-code-quality` ou suivre manuellement les étapes dans `check-code-quality.md`

**Critères évalués** :
- Conformité PSR-12 et Laravel Pint (5 pts)
- Analyse statique PHPStan (5 pts)
- Fonctionnalités PHP modernes (enums, readonly, typed properties) (4 pts)
- Principes KISS/DRY/YAGNI (4 pts)
- Conventions de nommage (standards Laravel) (4 pts)
- Gestion des erreurs et logging (3 pts)

**Référence** : `check-code-quality.md`

### Étape 4 : Audit Tests (25 points)

Exécuter la vérification des tests :

**Commande** : Utiliser la commande slash `/laravel:check-testing` ou suivre manuellement les étapes dans `check-testing.md`

**Critères évalués** :
- Couverture du code (7 pts)
- Tests unitaires pour la logique Domain (6 pts)
- Tests de fonctionnalité pour les endpoints HTTP (4 pts)
- Utilisation de Pest PHP et qualité des tests (3 pts)
- Factories et seeders de base de données (3 pts)
- Isolation des tests et mocking (2 pts)

**Référence** : `check-testing.md`

### Étape 5 : Audit Sécurité (25 points)

Exécuter la vérification de sécurité :

**Commande** : Utiliser la commande slash `/laravel:check-security` ou suivre manuellement les étapes dans `check-security.md`

**Critères évalués** :
- Protections OWASP Top 10 (6 pts)
- Gestion des secrets et des identifiants (5 pts)
- Validation par Form Request (4 pts)
- Vulnérabilités des dépendances (composer audit) (4 pts)
- Authentification et Autorisation (Policies) (3 pts)
- Configuration CSRF et middleware (2 pts)
- Prévention de l'injection SQL (1 pt)

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
AUDIT DE CONFORMITÉ LARAVEL - RAPPORT COMPLET
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
  • Couches Clean Architecture        : XX/6
  • Structure Domain/App/Infra        : XX/6
  • Actions et contrôleurs fins       : XX/4
  • Bindings Service Provider         : XX/4
  • Pattern Repository                : XX/3
  • Règles de dépendances             : XX/2

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
