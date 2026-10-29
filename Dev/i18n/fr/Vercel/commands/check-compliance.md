---
description: Vérification Complète de Conformité Vercel
argument-hint: [arguments]
---

# Vérification Complète de Conformité Vercel

## Arguments

$ARGUMENTS (optionnel : chemin du projet à analyser)

## Mode Plan

> Le mode plan s'active automatiquement lorsque le périmètre s'étend sur plusieurs modules ou nécessite une investigation transversale.

## MISSION

Réaliser un audit complet de conformité de la configuration de déploiement Vercel et du code de surface plateforme en orchestrant les 4 vérifications majeures : Architecture, Qualité du Code, Tests et Sécurité. Produire un rapport consolidé avec un score global sur 100 points. **Rappel de périmètre** : cet audit couvre uniquement l'usage de la plateforme Vercel indépendant de tout framework (`vercel.json`, Serverless Functions sur Node.js/Fluid Compute, primitives de cache ISR, Cron Jobs, Storage). Ne pas évaluer le routage, le rendu, ou la récupération de données spécifiques à Next.js (`revalidatePath`, `revalidateTag`, App Router, etc.) — cela relève de la vérification de conformité propre au stack du framework correspondant (`/react:*`, `/vuejs:*`, `/angular:*`).

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Lister les répertoires principaux (`api/`, `middleware.ts`, `.vercel/`, répertoires de tests, etc.)
- [ ] Classifier la forme du projet : statique uniquement, Functions uniquement, ISR activé, Cron activé, ou hybride
- [ ] Identifier si un framework (Next.js, ou un build Vite/React/Vue/Angular) se superpose, et confirmer que le routage/rendu spécifique au framework est hors périmètre de cet audit

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit Architecture (25 points)

Exécuter la vérification complète de l'architecture :

**Commande** : Utiliser la commande slash `/vercel:check-architecture` ou suivre manuellement les étapes dans `check-architecture.md`

**Critères évalués** :
- Validité du schéma vercel.json (`$schema`, `version`, clés de premier niveau valides) (6 pts)
- Exactitude des rewrites / redirects / headers (6 pts)
- Bloc regions et functions (pas de chevauchement ambigu de globs, memory/maxDuration justifiés) (5 pts)
- Configuration des Cron Jobs (chemins et planifications valides dans `crons[]`) (4 pts)
- Adéquation à la forme du projet et conflits avec l'adaptateur de framework (4 pts)

**Référence** : `check-architecture.md`

### Étape 3 : Audit Qualité du Code (25 points)

Exécuter la vérification de la qualité du code :

**Commande** : Utiliser la commande slash `/vercel:check-code-quality` ou suivre manuellement les étapes dans `check-code-quality.md`

**Critères évalués** :
- Analyse ESLint des Functions et du middleware (6 pts)
- Mode strict TypeScript et sûreté des types (6 pts)
- Conventions de signature des handlers (requête/réponse typées, entrée validée, runtime Node.js/Fluid Compute par défaut) (6 pts)
- Maîtrise de la taille du bundle (imports adaptés au cold start) (4 pts)
- Qualité du middleware (3 pts)

**Référence** : `check-code-quality.md`

### Étape 4 : Audit Tests (25 points)

Exécuter la vérification des tests :

**Commande** : Utiliser la commande slash `/vercel:check-testing` ou suivre manuellement les étapes dans `check-testing.md`

**Critères évalués** :
- Couverture des handlers de Functions et du middleware (>= 80%) (7 pts)
- Tests des handlers de Functions (cas nominal, validation et erreurs) (6 pts)
- Tests des gardes de secret des Cron (toutes les branches de garde) (5 pts)
- Tests du middleware (3 pts)
- Organisation et isolation des tests (2 pts)
- Tests de fumée `vercel dev` et vérification de `x-vercel-cache` (2 pts)

**Référence** : `check-testing.md`

### Étape 5 : Audit Sécurité (25 points)

Exécuter la vérification de sécurité :

**Commande** : Utiliser la commande slash `/vercel:check-security` ou suivre manuellement les étapes dans `check-security.md`

**Critères évalués** :
- Gestion des variables d'environnement (pas de valeurs en dur, pas de fuite dans le bundle client, portée d'environnement correcte) (7 pts)
- Authentification des endpoints Cron (secret d'invocation, comparaison à temps constant) (7 pts)
- En-têtes CORS / CSP dans vercel.json (4 pts)
- Portée des identifiants Marketplace (moindre privilège) (3 pts)
- Paquets Storage dépréciés (`@vercel/kv`, `@vercel/postgres`) et signalement de migration du runtime Edge hérité (2 pts)
- Vulnérabilités des dépendances (2 pts)

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
AUDIT DE CONFORMITÉ VERCEL - RAPPORT COMPLET
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
  • Schéma vercel.json            : XX/6
  • rewrites/redirects/headers    : XX/6
  • regions & functions           : XX/5
  • Configuration crons[]         : XX/4
  • Forme du projet               : XX/4

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
- Un endpoint Cron non protégé et un secret en dur sont TOUJOURS prioritaires lorsqu'ils sont détectés
- Un `runtime: 'edge'` sur du code nouveau ou modifié est toujours signalé, mais constitue une dette de migration (pas un échec bloquant) sur du code hérité non modifié
- Ne PAS évaluer le routage/rendu/récupération de données spécifiques à Next.js — hors périmètre (voir `/react:*`, `/vuejs:*`, `/angular:*`)
