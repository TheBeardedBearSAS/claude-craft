# Vérification Complète de la Conformité Vite

## Arguments

$ARGUMENTS (optionnel : chemin du projet à analyser)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Réaliser un audit complet de conformité du projet Vite en orchestrant les 4 grandes vérifications : Architecture, Qualité du Code, Tests et Sécurité. Produire un rapport consolidé avec un score global sur 100 points.

> **Rappel du périmètre** : cet audit couvre uniquement l'usage de Vite indépendant de tout framework (applications JS/TS vanilla, création de bibliothèques avec `build.lib`, applications multi-pages, entrées Workers/WASM). Ne pas évaluer l'intégration dev-server spécifique à React/Vue/Angular/Svelte ; elle relève de la vérification de conformité propre à chacun de ces stacks.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (package.json, tsconfig.json, vite.config.ts)
- [ ] Lister les répertoires principaux (src/, pages/, public/, tests/, etc.)
- [ ] Identifier le type de projet : SPA vanilla, bibliothèque (build.lib), application multi-pages ou points d'entrée Workers/WASM
- [ ] Identifier la version de Vite et confirmer qu'aucun plugin spécifique à un framework (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) n'entre dans le périmètre

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit Architecture (25 points)

Exécuter la vérification complète de l'architecture :

**Commande** : Utiliser la commande slash `/vite:check architecture` ou suivre manuellement les étapes dans `.claude/references/vite/checks/architecture.md`

**Critères évalués** :
- Détection de la forme du projet et points d'entrée (index.html à la racine, entrée build.lib, input multi-pages, motif `new URL` Worker/WASM) (6 pts)
- Structure de vite.config.ts (defineConfig, forme fonctionnelle, ordre des clés) (5 pts)
- Organisation des plugins personnalisés (vite-plugins/, nommage vite-plugin-*, une responsabilité par plugin) (4 pts)
- Externalisation des dépendances et map exports de package.json (bibliothèque) (6 pts)
- Structure de sortie (dist/ ignoré, ES + CJS + .d.ts via vite-plugin-dts, noms de chunks stables) (4 pts)

**Référence** : `.claude/references/vite/checks/architecture.md`

### Étape 3 : Audit Qualité du Code (25 points)

Exécuter la vérification de la qualité du code :

**Commande** : Utiliser la commande slash `/vite:check code-quality` ou suivre manuellement les étapes dans `.claude/references/vite/checks/code-quality.md`

**Critères évalués** :
- Analyse ESLint (no-explicit-any, no-restricted-imports, no-console) (5 pts)
- Rigueur TypeScript (strict, moduleResolution: "bundler", types vite/client) (6 pts)
- Détection de fuite de framework (aucun couplage React/Vue/Angular/Svelte) (5 pts)
- Complexité du code (taille des fonctions/fichiers, complexité cyclomatique, imbrication) (4 pts)
- Qualité spécifique à Vite (config fonctionnelle, plugins extraits, variables VITE_* uniquement publiques, motifs Worker/WASM statiques) (5 pts)

**Référence** : `.claude/references/vite/checks/code-quality.md`

### Étape 4 : Audit Tests (25 points)

Exécuter la vérification des tests :

**Commande** : Utiliser la commande slash `/vite:check testing` ou suivre manuellement les étapes dans `.claude/references/vite/checks/testing.md`

**Critères évalués** :
- Couverture du code avec Vitest (>= 80 % instructions, branches, fonctions, lignes) (7 pts)
- Organisation et isolation des tests (4 pts)
- Tests des modules vanilla (fonctions pures, cas limites, environnement node) (4 pts)
- Tests des Workers (logique du handler extraite, contrat de messages) (4 pts)
- Tests des wrappers WASM (`?init` mocké, un test d'intégration avec un vrai .wasm) (3 pts)
- Tests de la sortie de build de la bibliothèque sur dist/ (ESM, CJS, map exports) (3 pts)

**Référence** : `.claude/references/vite/checks/testing.md`

### Étape 5 : Audit Sécurité (25 points)

Exécuter la vérification de sécurité :

**Commande** : Utiliser la commande slash `/vite:check security` ou suivre manuellement les étapes dans `.claude/references/vite/checks/security.md`

**Critères évalués** :
- Fuite de secrets via l'env / `define()` (préfixe VITE_*, secrets codés en dur) (7 pts)
- Couverture CSP sur toutes les entrées (multi-pages, application côté serveur/CDN) (5 pts)
- Isolation WASM (COOP/COEP, wasm-unsafe-eval, objet d'imports minimal) (4 pts)
- Validation des messages Worker (contrôle de forme, pas d'eval, contrôle de l'origine) (5 pts)
- Vulnérabilités des dépendances (npm audit) (4 pts)

**Référence** : `.claude/references/vite/checks/security.md`

### Étape 6 : Consolidation et Score Global

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (max 100 points)
- [ ] Identifier les catégories critiques (<50 %)
- [ ] Lister tous les problèmes transversaux critiques (p. ex. index.html dans public/, secrets exposés via VITE_*, externalisation des peer deps manquante)
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

> **Projets de bibliothèque** : `/vite:check-library-build` complète cet audit pour les projets de bibliothèque (sortie build.lib, map exports, déclarations de types, tree-shaking). L'exécuter en complément lorsque le projet publie un package.

## FORMAT DE SORTIE

```
AUDIT DE CONFORMITÉ VITE - RAPPORT COMPLET
=============================================

SCORE GLOBAL: XX/100

NIVEAU DE CONFORMITÉ: [Excellent/Très bien/Acceptable/Insuffisant/Critique]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES PAR CATÉGORIE:

ARCHITECTURE      : XX/25  [██████████░░░░░░░░░░] XX%
QUALITÉ DU CODE   : XX/25  [██████████░░░░░░░░░░] XX%
TESTS             : XX/25  [██████████░░░░░░░░░░] XX%
SÉCURITÉ          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POINTS FORTS GLOBAUX:
1. [Point fort identifié dans plusieurs catégories]
2. [Autre point fort majeur]
3. [Troisième point fort]

AMÉLIORATIONS GLOBALES:
1. [Amélioration transversale mineure]
2. [Autre amélioration recommandée]
3. [Troisième amélioration]

PROBLÈMES CRITIQUES:
1. [Problème critique - catégorie concernée #1]
2. [Problème critique - catégorie concernée #2]
3. [Problème critique - catégorie concernée #3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÉTAILS PAR CATÉGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITECTURE (XX/25)
└─────────────────────────────────────────────┘

Sous-scores :
  • Détection de la forme du projet et points d'entrée (index.html à la racine, entrée build.lib, input multi-pages, motif `new URL` Worker/WASM) : XX/6
  • Structure de vite.config.ts (defineConfig, forme fonctionnelle, ordre des clés) : XX/5
  • Organisation des plugins personnalisés (vite-plugins/, nommage vite-plugin-*, une responsabilité par plugin) : XX/4
  • Externalisation des dépendances et map exports de package.json (bibliothèque) : XX/6
  • Structure de sortie (dist/ ignoré, ES + CJS + .d.ts via vite-plugin-dts, noms de chunks stables) : XX/4

Points forts :
- [Points forts de l'architecture]

Problèmes :
- [Problèmes d'architecture]

[Sections similaires pour Qualité du Code, Tests et Sécurité...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 DES ACTIONS PRIORITAIRES (TOUTES CATÉGORIES):

1. CRITIQUE - [Action #1]
   Catégorie: [Architecture/Code Quality/Tests/Security]
   Impact   : [Élevé/Moyen/Faible]
   Effort   : [Élevé/Moyen/Faible]
   Priorité : IMMÉDIATE

   Description détaillée:
   [Explication du problème et de la solution proposée]

   Fichiers concernés:
   - [file:line]

   Exemple de correction:
   [Code ou commande de correction]

2. IMPORTANT - [Action #2]
   [Même format...]

3. RECOMMANDÉ - [Action #3]
   [Même format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GAINS RAPIDES (Impact élevé / Effort faible):

- [Quick win #1] - Catégorie: [X] - Impact   : [X] - Effort   : [X]
- [Quick win #2] - Catégorie: [X] - Impact   : [X] - Effort   : [X]
- [Quick win #3] - Catégorie: [X] - Impact   : [X] - Effort   : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN D'ACTION RECOMMANDÉ:

SEMAINE 1 (Immédiat):
- [ ] [Action critique n°1]
- [ ] [Gain rapide prioritaire]

SEMAINES 2-4 (Court terme):
- [ ] [Action importante n°2]
- [ ] [Autres gains rapides]

MOIS 2-3 (Moyen terme):
- [ ] [Action recommandée n°3]
- [ ] [Améliorations progressives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÉSUMÉ EXÉCUTIF:

[Paragraphe de synthèse sur l'état global du projet, ses principaux
points forts, ses principales faiblesses et la trajectoire recommandée
pour améliorer la conformité. Indiquer si le projet est prêt pour la
production, nécessite des corrections ou un refactoring.]

Recommandation générale: [Prêt pour la production / Corrections mineures /
Refactoring majeur / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 audits spécialisés (`/vite:check architecture`, `/vite:check code-quality`, `/vite:check testing`, `/vite:check security`)
- Utiliser Docker pour tous les outils d'analyse
- Fournir des exemples concrets avec fichier:ligne pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- Les problèmes de sécurité sont TOUJOURS prioritaires (secrets exposés via VITE_* ou define() en premier)
- Proposer des corrections automatisables (scripts, hooks pre-commit)
- Le rapport doit être actionnable, pas seulement descriptif
- Adapter les recommandations au type de projet (application vanilla / bibliothèque / multi-pages / Workers-WASM)
- Ne PAS évaluer l'intégration dev-server spécifique à un framework (React/Vue/Angular/Svelte) ; hors périmètre de cet audit
