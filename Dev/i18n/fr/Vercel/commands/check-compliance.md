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

Réaliser un audit complet de conformité de la configuration de déploiement Vercel et du code de surface plateforme en orchestrant les 4 vérifications majeures : vercel.json & Architecture, Functions & Choix du Runtime, Sécurité & Gestion des variables d'environnement, et ISR/Caching & Tests. Produire un rapport consolidé avec un score global sur 100 points. **Rappel de périmètre** : cet audit couvre uniquement l'usage de la plateforme Vercel indépendant de tout framework (`vercel.json`, Serverless Functions sur Node.js/Fluid Compute, primitives de cache ISR, Cron Jobs, Storage). Ne pas évaluer le routage, le rendu, ou la récupération de données spécifiques à Next.js (`revalidatePath`, `revalidateTag`, App Router, etc.) — cela relève de la vérification de conformité propre au stack du framework correspondant (`/react:*`, `/vuejs:*`, `/angular:*`).

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Lister les répertoires principaux (`api/`, `middleware.ts`, `.vercel/`, répertoires de tests, etc.)
- [ ] Classifier la forme du projet : statique uniquement, Functions uniquement, ISR activé, Cron activé, ou hybride
- [ ] Identifier si un framework (Next.js, ou un build Vite/React/Vue/Angular) se superpose, et confirmer que le routage/rendu spécifique au framework est hors périmètre de cet audit

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit vercel.json & Architecture (30 points)

Exécuter la vérification complète de la configuration et de l'architecture :

**Critères évalués** :
- vercel.json correct au schéma (`$schema`, `version`, clés de premier niveau valides) (8 pts)
- Correction des rewrites/redirects/headers (redirect vs rewrite, pas de duplication de header avec le middleware) (6 pts)
- regions & bloc functions (pas de chevauchement ambigu de glob, memory/maxDuration justifiés) (8 pts)
- Adéquation à la forme du projet (la configuration correspond à la forme déclarée statique/Functions/ISR/Cron) (8 pts)

**Référence** : `.claude/agents/vercel-reviewer.md` (section 1)

### Étape 3 : Audit Functions & Choix du Runtime (20 points)

Exécuter la vérification de la qualité du runtime et des handlers :

**Critères évalués** :
- Pas de `runtime: 'edge'` non signalé sur du code nouveau/modifié (défaut Node.js/Fluid Compute respecté) (8 pts)
- Version Node.js épinglée sur 20+ pour le bénéfice du cache de bytecode Fluid Compute (6 pts)
- Qualité de la signature des handlers (input validé, réponses typées explicites, imports conscients du cold-start) (6 pts)

**Référence** : `.claude/agents/vercel-reviewer.md` (section 2)

### Étape 4 : Audit Sécurité & Gestion des variables d'environnement (25 points)

Exécuter la vérification de la sécurité et de la gestion des secrets :

**Critères évalués** :
- Secrets/variables d'environnement (pas de hardcoding, pas de fuite vers le bundle client, scoping d'environnement correct) (8 pts)
- Les endpoints Cron vérifient un secret d'invocation (comparaison à temps constant) (8 pts)
- Correction des headers CORS/CSP (pas de générique + credentials, CSP de base présente) (5 pts)
- Scoping des credentials Marketplace (moindre privilège, pas de `@vercel/kv`/`@vercel/postgres` dépréciés) (4 pts)

**Référence** : `.claude/agents/vercel-reviewer.md` (section 3)

### Étape 5 : Audit ISR/Caching & Tests (25 points)

Exécuter la vérification du caching et des tests :

**Critères évalués** :
- Correction de Cache-Control (stale-while-revalidate sur les routes cacheables) (8 pts)
- Pas de conflit de revalidation vercel.json/framework (source de vérité unique) (7 pts)
- Couverture de tests des handlers (chemins nominal/validation/authentification, >= 80%) (6 pts)
- `x-vercel-cache` vérifié / smoke test d'intégration via `vercel dev` (4 pts)

**Référence** : `.claude/agents/vercel-reviewer.md` (section 4)

### Étape 6 : Consolidation et notation globale

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (30 + 20 + 25 + 25 = 100 points)
- [ ] Identifier les catégories critiques (<50% de leur maximum)
- [ ] Lister tous les problèmes critiques transversaux (ex. endpoint Cron non protégé, secret en dur, package Storage déprécié)
- [ ] Prioriser les actions par impact/effort
- [ ] Produire le rapport consolidé final

**Échelle de notation** :
- 90-100 : Excellent - Projet de référence
- 75-89 : Très bien - Quelques améliorations mineures
- 60-74 : Acceptable - Nécessite des améliorations
- 40-59 : Insuffisant - Refactoring majeur requis
- 0-39 : Critique - Refonte complète nécessaire

### Étape 7 : Recommandations et plan d'action

Produire les recommandations finales :
- [ ] Identifier les 3 actions prioritaires principales toutes catégories confondues
- [ ] Estimer l'effort (Faible/Moyen/Élevé) pour chaque action
- [ ] Estimer l'impact (Faible/Moyen/Élevé) pour chaque action
- [ ] Proposer un ordre d'implémentation
- [ ] Suggérer des quick wins (ratio impact élevé/effort faible)

## FORMAT DE SORTIE

```
AUDIT DE CONFORMITÉ VERCEL - RAPPORT COMPLET
=============================================

SCORE GLOBAL : XX/100

NIVEAU DE CONFORMITÉ : [Excellent/Très bien/Acceptable/Insuffisant/Critique]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORES PAR CATÉGORIE :

VERCEL.JSON & ARCHITECTURE   : XX/30  [██████████░░░░░░░░░░] XX%
FUNCTIONS & CHOIX DU RUNTIME : XX/20  [██████████░░░░░░░░░░] XX%
SÉCURITÉ & ENV HANDLING      : XX/25  [██████████░░░░░░░░░░] XX%
ISR/CACHING & TESTS          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POINTS FORTS GLOBAUX :
1. [Point fort identifié dans plusieurs catégories]
2. [Autre force majeure]
3. [Troisième force]

AMÉLIORATIONS GLOBALES :
1. [Amélioration transversale mineure]
2. [Autre amélioration recommandée]
3. [Troisième amélioration]

PROBLÈMES CRITIQUES :
1. [Problème critique n°1 - catégorie affectée]
2. [Problème critique n°2 - catégorie affectée]
3. [Problème critique n°3 - catégorie affectée]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÉTAILS PAR CATÉGORIE :

┌─────────────────────────────────────────────┐
│ VERCEL.JSON & ARCHITECTURE (XX/30)           │
└─────────────────────────────────────────────┘

Sous-scores :
  • Correction du schéma vercel.json : XX/8
  • rewrites/redirects/headers       : XX/6
  • regions & bloc functions         : XX/8
  • Adéquation à la forme du projet  : XX/8

Points forts :
- [Points forts architecture]

Problèmes :
- [Problèmes architecture]

┌─────────────────────────────────────────────┐
│ FUNCTIONS & CHOIX DU RUNTIME (XX/20)         │
└─────────────────────────────────────────────┘

Sous-scores :
  • Node.js/Fluid Compute vs Edge     : XX/8
  • Version Node.js épinglée          : XX/6
  • Qualité de la signature du handler : XX/6

Points forts :
- [Points forts runtime]

Problèmes :
- [Problèmes runtime]

┌─────────────────────────────────────────────┐
│ SÉCURITÉ & ENV HANDLING (XX/25)              │
└─────────────────────────────────────────────┘

Sous-scores :
  • Secrets/variables d'environnement : XX/8
  • Garde d'authentification cron     : XX/8
  • Headers CORS/CSP                  : XX/5
  • Scoping des credentials Marketplace : XX/4

Points forts :
- [Points forts sécurité]

Problèmes :
- [Problèmes sécurité]

┌─────────────────────────────────────────────┐
│ ISR/CACHING & TESTS (XX/25)                  │
└─────────────────────────────────────────────┘

Sous-scores :
  • Correction de Cache-Control        : XX/8
  • Absence de conflit de revalidation : XX/7
  • Couverture de tests des handlers   : XX/6
  • x-vercel-cache vérifié             : XX/4

Points forts :
- [Points forts caching/tests]

Problèmes :
- [Problèmes caching/tests]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 DES ACTIONS PRIORITAIRES (TOUTES CATÉGORIES) :

1. CRITIQUE - [Action n°1]
   Catégorie : [Architecture/Runtime/Sécurité/Caching]
   Impact    : [Élevé/Moyen/Faible]
   Effort    : [Élevé/Moyen/Faible]
   Priorité  : IMMÉDIATE

   Description détaillée :
   [Explication du problème et solution proposée]

   Fichiers affectés :
   - [file:line]

   Exemple de correction :
   [Code ou commande de correction]

2. IMPORTANT - [Action n°2]
   [Même format...]

3. RECOMMANDÉ - [Action n°3]
   [Même format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Impact élevé / Effort faible) :

- [Quick win n°1] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Quick win n°2] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Quick win n°3] - Catégorie : [X] - Impact : [X] - Effort : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN D'ACTION RECOMMANDÉ :

SEMAINE 1 (Immédiat) :
- [ ] [Action critique n°1]
- [ ] [Quick win prioritaire]

SEMAINES 2-4 (Court terme) :
- [ ] [Action importante n°2]
- [ ] [Autres quick wins]

MOIS 2-3 (Moyen terme) :
- [ ] [Action recommandée n°3]
- [ ] [Améliorations progressives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÉSUMÉ EXÉCUTIF :

[Paragraphe résumant l'état global du projet, les forces majeures,
les faiblesses majeures, et la trajectoire recommandée pour améliorer
la conformité. Mentionner si le projet est prêt pour la production,
nécessite des corrections, ou requiert un refactoring.]

Recommandation générale : [Prêt pour la production / Corrections mineures /
Refactoring majeur / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 catégories couvertes par `@vercel-reviewer`
- Utiliser Docker pour tous les outils d'analyse
- Fournir des exemples concrets avec file:line pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- Un endpoint Cron non protégé et un secret en dur sont TOUJOURS priorité absolue lorsqu'ils sont trouvés (ils permettent à quiconque découvre le chemin/dépôt de déclencher des jobs ou d'exfiltrer des credentials)
- Un constat `runtime: 'edge'` sur du code nouveau/modifié est toujours signalé, mais ne bloque jamais un rapport sur du code legacy non modifié — le traiter comme une dette de migration, pas comme un échec bloquant
- Proposer des corrections automatisables (scripts, hooks pre-commit)
- Le rapport doit être actionnable, pas seulement descriptif
- Adapter les recommandations à la forme du projet (statique uniquement / Functions uniquement / ISR activé / Cron activé / hybride)
- NE PAS évaluer le routage/rendu/récupération de données spécifiques à Next.js ni l'intégration de serveur de développement propre à un autre framework — hors périmètre de cet audit
