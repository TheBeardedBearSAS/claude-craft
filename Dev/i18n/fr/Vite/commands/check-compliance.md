---
description: Vérifier la Conformité Complète Vite
argument-hint: [arguments]
---

# Vérifier la Conformité Complète Vite

## Arguments

$ARGUMENTS (optionnel : chemin du projet à analyser)

## Plan Mode

> Le mode plan s'active automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Réaliser un audit de conformité complet du projet Vite en orchestrant les 4 vérifications majeures : Config & Architecture Vite, TypeScript & Qualité, Tests, et Sortie de build & Performance. Produire un rapport consolidé avec un score global sur 100 points. **Rappel de périmètre** : cet audit couvre uniquement l'usage de Vite indépendant de tout framework (applications vanilla JS/TS, création de librairies, applications multi-pages, Workers/WASM). Ne pas évaluer l'intégration spécifique du serveur de développement React/Vue/Angular/Svelte — cela relève du check de conformité propre à ce stack.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (package.json, tsconfig.json, vite.config.ts)
- [ ] Lister les répertoires principaux (src/, pages/, public/, tests/, etc.)
- [ ] Identifier le type de projet : SPA vanilla, librairie (build.lib), application multi-pages, ou points d'entrée Workers/WASM
- [ ] Identifier la version de Vite et confirmer qu'aucun plugin spécifique à un framework (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) n'entre dans le périmètre de cet audit

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin de projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit Config & Architecture Vite (30 points)

Exécuter la vérification complète de configuration et d'architecture :

**Critères évalués** :
- Correction de vite.config.ts (defineConfig, alias synchronisés avec tsconfig) (8 pts)
- Emplacement d'index.html à la racine du projet, jamais dans public/ (6 pts)
- Configuration build.lib pour les librairies (entry, formats, external, vite-plugin-dts) (8 pts)
- rollupOptions.input pour les applications multi-pages, convention de nommage des plugins (vite-plugin-*) (8 pts)

**Référence** : `.claude/agents/vite-reviewer.md` (section 1)

### Étape 3 : Audit TypeScript & Qualité (20 points)

Exécuter la vérification de la configuration TypeScript et de la qualité du typage :

**Critères évalués** :
- strict: true, moduleResolution: "bundler", target ES2022+ (6 pts)
- Types Vite présents (vite/client), import.meta.env correctement typé (5 pts)
- Correction de la sortie vite-plugin-dts (rollupTypes, zéro any non justifié) (5 pts)
- Hooks de plugin custom typés via l'interface Plugin (4 pts)

**Référence** : `.claude/agents/vite-reviewer.md` (section 2)

### Étape 4 : Audit des Tests (25 points)

Exécuter la vérification des tests :

**Critères évalués** :
- Config Vitest cohérente (mergeConfig ou fichier dédié), pas de dérive avec vite.config.ts (6 pts)
- Couverture >= 80% sur la logique métier / l'API publique (6 pts)
- Environnement de test adapté au besoin (node vs jsdom/happy-dom) (4 pts)
- Tests sur le build publié (dist/), pas seulement le code source (5 pts)
- Tests d'intégration/E2E pour les applications multi-pages (4 pts)

**Référence** : `.claude/agents/vite-reviewer.md` (section 3)

### Étape 5 : Audit Sortie de build & Performance (25 points)

Exécuter la vérification de la sortie de build et de la performance :

**Critères évalués** :
- Tree-shaking effectif (sideEffects: false, exports nommés, exports map cohérente) (6 pts)
- Dépendances externalisées pour les librairies (peer deps non bundlées) (6 pts)
- Code-splitting pour les applications multi-pages (manualChunks, vendor partagé) (5 pts)
- Bundle sous les seuils, assetsInlineLimit contrôlé (4 pts)
- Hashing des assets, build.target approprié, sourcemaps correctement gérées en prod (4 pts)

**Référence** : `.claude/agents/vite-reviewer.md` (section 4)

### Étape 6 : Consolidation et notation globale

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (30 + 20 + 25 + 25 = 100 points)
- [ ] Identifier les catégories critiques (< 50% de leur maximum)
- [ ] Lister tous les problèmes critiques transversaux (ex : index.html dans public/, externalisation des peer deps manquante)
- [ ] Prioriser les actions par impact/effort
- [ ] Produire le rapport consolidé final

**Échelle de notation** :
- 90-100 : Excellent - Projet de référence
- 75-89 : Très bien - Quelques améliorations mineures
- 60-74 : Acceptable - Améliorations nécessaires
- 40-59 : Insuffisant - Refactoring majeur requis
- 0-39 : Critique - Refonte complète nécessaire

### Étape 7 : Recommandations et plan d'action

Produire les recommandations finales :
- [ ] Identifier les 3 actions prioritaires principales toutes catégories confondues
- [ ] Estimer l'effort (Faible/Moyen/Élevé) pour chaque action
- [ ] Estimer l'impact (Faible/Moyen/Élevé) pour chaque action
- [ ] Proposer un ordre d'implémentation
- [ ] Suggérer des quick wins (ratio impact/effort élevé)

## FORMAT DE SORTIE

```
AUDIT DE CONFORMITÉ VITE - RAPPORT COMPLET
=============================================

SCORE GLOBAL : XX/100

NIVEAU DE CONFORMITÉ : [Excellent/Très bien/Acceptable/Insuffisant/Critique]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES PAR CATÉGORIE :

CONFIG & ARCHITECTURE VITE  : XX/30  [██████████░░░░░░░░░░] XX%
TYPESCRIPT & QUALITÉ        : XX/20  [██████████░░░░░░░░░░] XX%
TESTS                       : XX/25  [██████████░░░░░░░░░░] XX%
SORTIE DE BUILD & PERF.     : XX/25  [██████████░░░░░░░░░░] XX%

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
1. [Problème critique #1 - catégorie affectée]
2. [Problème critique #2 - catégorie affectée]
3. [Problème critique #3 - catégorie affectée]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÉTAILS PAR CATÉGORIE :

┌─────────────────────────────────────────────┐
│ CONFIG & ARCHITECTURE VITE (XX/30)           │
└─────────────────────────────────────────────┘

Sous-scores :
  • Correction de vite.config.ts     : XX/8
  • Emplacement d'index.html         : XX/6
  • Configuration build.lib          : XX/8
  • rollupOptions.input / plugins    : XX/8

Points forts :
- [Points forts architecture]

Problèmes :
- [Problèmes architecture]

┌─────────────────────────────────────────────┐
│ TYPESCRIPT & QUALITÉ (XX/20)                 │
└─────────────────────────────────────────────┘

Sous-scores :
  • Mode strict / moduleResolution   : XX/6
  • Types Vite / import.meta.env     : XX/5
  • Sortie vite-plugin-dts           : XX/5
  • Hooks de plugin typés            : XX/4

Points forts :
- [Points forts typage]

Problèmes :
- [Problèmes typage]

┌─────────────────────────────────────────────┐
│ TESTS (XX/25)                                │
└─────────────────────────────────────────────┘

Sous-scores :
  • Cohérence config Vitest          : XX/6
  • Couverture >= 80%                : XX/6
  • Adéquation environnement de test : XX/4
  • Build publié testé               : XX/5
  • Intégration/E2E multi-pages      : XX/4

Points forts :
- [Points forts tests]

Problèmes :
- [Problèmes tests]

┌─────────────────────────────────────────────┐
│ SORTIE DE BUILD & PERFORMANCE (XX/25)        │
└─────────────────────────────────────────────┘

Sous-scores :
  • Efficacité du tree-shaking       : XX/6
  • Externalisation des peer deps    : XX/6
  • Code-splitting multi-pages       : XX/5
  • Seuils de bundle                 : XX/4
  • Hashing / build.target / sourcemaps : XX/4

Points forts :
- [Points forts performance]

Problèmes :
- [Problèmes performance]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACTIONS PRIORITAIRES (TOUTES CATÉGORIES) :

1. CRITIQUE - [Action #1]
   Catégorie : [Architecture/TypeScript/Tests/Performance]
   Impact    : [Élevé/Moyen/Faible]
   Effort    : [Élevé/Moyen/Faible]
   Priorité  : IMMÉDIATE

   Description détaillée :
   [Explication du problème et solution proposée]

   Fichiers affectés :
   - [file:line]

   Exemple de correction :
   [Code ou commande de correction]

2. IMPORTANT - [Action #2]
   [Même format...]

3. RECOMMANDÉ - [Action #3]
   [Même format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Impact élevé / Effort faible) :

- [Quick win #1] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Quick win #2] - Catégorie : [X] - Impact : [X] - Effort : [X]
- [Quick win #3] - Catégorie : [X] - Impact : [X] - Effort : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN D'ACTION RECOMMANDÉ :

SEMAINE 1 (Immédiat) :
- [ ] [Action critique #1]
- [ ] [Quick win prioritaire]

SEMAINES 2-4 (Court terme) :
- [ ] [Action importante #2]
- [ ] [Autres quick wins]

MOIS 2-3 (Moyen terme) :
- [ ] [Action recommandée #3]
- [ ] [Améliorations progressives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÉSUMÉ EXÉCUTIF :

[Paragraphe de synthèse sur l'état global du projet, les principaux points
forts, les principales faiblesses, et la trajectoire recommandée pour
améliorer la conformité. Préciser si le projet est prêt pour la production,
nécessite des corrections, ou requiert un refactoring.]

Recommandation générale : [Prêt pour la production / Corrections mineures /
Refactoring majeur / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 catégories couvertes par `@vite-reviewer`
- Utiliser Docker pour tous les outils d'analyse
- Fournir des exemples concrets avec file:line pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- L'emplacement d'index.html et l'externalisation des peer dependencies sont TOUJOURS prioritaires en cas de violation (ils cassent le graphe de modules ou alourdissent le bundle de chaque consommateur)
- Proposer des corrections automatisables (scripts, hooks pre-commit)
- Le rapport doit être actionnable, pas seulement descriptif
- Adapter les recommandations au type de projet (app vanilla / librairie / multi-pages / Workers-WASM)
- Ne PAS évaluer l'intégration spécifique du serveur de développement d'un framework (React/Vue/Angular/Svelte) — hors périmètre de cet audit
