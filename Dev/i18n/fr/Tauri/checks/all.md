# Vérification complète de la conformité Tauri v2

## Arguments

$ARGUMENTS (optionnel : chemin du projet à analyser)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transverse.

## MISSION

Réaliser un audit de conformité complet du projet Tauri v2 en orchestrant les 4 vérifications majeures : Architecture, Qualité du code, Tests et Sécurité. Produire un rapport consolidé avec un score global sur 100 points.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (`src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/*.json`, `src-tauri/build.rs`, `package.json`, config Vite)
- [ ] Lister les répertoires principaux (`src/`, `src-tauri/src/`, `src-tauri/capabilities/`, `src-tauri/icons/`, tests, workflows CI)
- [ ] Identifier la version de Tauri (`tauri`, `tauri-build`, `@tauri-apps/api`, `@tauri-apps/cli` dans les lockfiles), le `rust-version` Rust et les plugins officiels utilisés
- [ ] Confirmer que la cible est Tauri v2 stable (Tauri 3 alpha et Tauri v1 sont hors périmètre) ; noter les cibles desktop uniquement ou mobile (iOS/Android)

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit de l'architecture (25 points)

Exécuter la vérification d'architecture complète :

**Commande** : Utiliser la slash command `/tauri:check architecture` ou suivre manuellement les étapes de `.claude/references/tauri/checks/architecture.md`

**Critères évalués** :
- Organisation du projet (`src/` / `src-tauri/`, point d'entrée `run()` dans `lib.rs`, point d'entrée mobile) et `main.rs` minimal (5 pts)
- Conception des commandes : handlers `#[tauri::command]` fins, logique dans des modules Rust testables (6 pts)
- Modèle d'erreurs typé : enum `thiserror` implémentant `Serialize` (4 pts)
- Gestion d'état (`manage` / `State<'_, T>`) et correction de l'async (pas de blocage, portée des verrous) (4 pts)
- Événements et `Channel<T>` pour le streaming, usage des plugins (`.plugin(...)`, `#[cfg(desktop)]`) (4 pts)
- Frontière frontend/cœur : pas de logique métier dans la webview, IPC typé (2 pts)

**Référence** : `.claude/references/tauri/checks/architecture.md`

### Étape 3 : Audit de la qualité du code (25 points)

Exécuter la vérification de qualité du code :

**Commande** : Utiliser la slash command `/tauri:check code-quality` ou suivre manuellement les étapes de `.claude/references/tauri/checks/code-quality.md`

**Critères évalués** :
- Clippy propre avec `-D warnings` et `cargo fmt --check` (5 pts)
- Nommage Rust, hygiène d'ownership et de borrowing (les commandes async avec arguments empruntés retournent un `Result`) (5 pts)
- Typage et lint du frontend (`tsc --noEmit`, ESLint ou Biome) et wrappers `invoke` cohérents (4 pts)
- Principes KISS/DRY/YAGNI (4 pts)
- Taille des fonctions et complexité cognitive (4 pts)
- Gestion des erreurs : pas de `unwrap()` / `expect()` dans les commandes, pas d'échecs silencieux (3 pts)

**Référence** : `.claude/references/tauri/checks/code-quality.md`

### Étape 4 : Audit des tests (25 points)

Exécuter la vérification des tests :

**Commande** : Utiliser la slash command `/tauri:check testing` ou suivre manuellement les étapes de `.claude/references/tauri/checks/testing.md`

**Critères évalués** :
- Couverture de code (cible >= 80 %) sur le cœur Rust et le frontend (7 pts)
- Tests des commandes Rust sans GUI (runtime mock `tauri::test` : `mock_builder()`, `mock_context(noop_assets())`) (6 pts)
- Tests frontend avec `@tauri-apps/api/mocks` (`mockIPC`, `clearMocks()` dans `afterEach`) (4 pts)
- Tests de bout en bout (WebdriverIO + `@wdio/tauri-service`, ou `tauri-driver` sous Windows/Linux) sur un build `tauri build --debug --no-bundle` (3 pts)
- Qualité des tests : AAA, nommage, absence de flakiness, exécution en CI (3 pts)
- Isolation des tests et mock de l'IPC et des accès à l'OS (2 pts)

**Référence** : `.claude/references/tauri/checks/testing.md`

### Étape 5 : Audit de la sécurité (25 points)

Exécuter la vérification de sécurité :

**Commande** : Utiliser la slash command `/tauri:check security` ou suivre manuellement les étapes de `.claude/references/tauri/checks/security.md`

**Critères évalués** :
- Capabilities et permissions : une capability par fenêtre/rôle, moindre privilège (6 pts)
- Scopes : listes allow et deny pour `fs` / `http`, pas de wildcards trop larges (4 pts)
- CSP (`app.security.csp`) et pattern Isolation (`app.security.pattern`) (5 pts)
- Signature de l'updater : clé publique dans la config, clé privée jamais commitée, secret de CI (4 pts)
- Gestion des secrets et des identifiants, protections OWASP Top 10:2025 (3 pts)
- Vulnérabilités des dépendances et supply chain (`cargo deny` / `cargo audit`, `npm audit`) (2 pts)
- Validation des entrées dans les commandes et état d'esprit « webview non fiable » (1 pt)

**Référence** : `.claude/references/tauri/checks/security.md`

### Étape 6 : Consolidation et notation globale

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (max 100 points)
- [ ] Identifier les catégories critiques (<50 %)
- [ ] Lister tous les problèmes critiques transverses
- [ ] Prioriser les actions par impact/effort
- [ ] Produire le rapport consolidé final

**Barème** :
- 90-100 : Excellent - Projet de référence
- 75-89 : Très bien - Quelques améliorations mineures
- 60-74 : Acceptable - Des améliorations sont nécessaires
- 40-59 : Insuffisant - Refactoring majeur requis
- 0-39 : Critique - Refonte complète nécessaire

### Étape 7 : Recommandations et plan d'action

Produire les recommandations finales :
- [ ] Identifier les 3 actions prioritaires toutes catégories confondues
- [ ] Estimer l'effort (Faible/Moyen/Élevé) de chaque action
- [ ] Estimer l'impact (Faible/Moyen/Élevé) de chaque action
- [ ] Proposer un ordre de mise en œuvre
- [ ] Suggérer des quick wins (fort ratio impact/effort)

## FORMAT DE SORTIE

```
AUDIT DE CONFORMITÉ TAURI V2 - RAPPORT COMPLET
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
1. [Amélioration transverse mineure]
2. [Autre amélioration recommandée]
3. [Troisième amélioration]

PROBLÈMES CRITIQUES :
1. [Problème critique n°1 - catégorie concernée]
2. [Problème critique n°2 - catégorie concernée]
3. [Problème critique n°3 - catégorie concernée]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÉTAILS PAR CATÉGORIE :

┌─────────────────────────────────────────────┐
│ ARCHITECTURE (XX/25)                        │
└─────────────────────────────────────────────┘

Sous-scores :
  • Organisation / points d'entrée : XX/5
  • Conception des commandes       : XX/6
  • Erreurs typées                 : XX/4
  • État et async                  : XX/4
  • Événements, Channels, plugins  : XX/4
  • Frontière frontend / cœur      : XX/2

Points forts :
- [Points forts de l'architecture]

Problèmes :
- [Problèmes d'architecture]

[Sections similaires pour Qualité du code, Tests et Sécurité...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 DES ACTIONS PRIORITAIRES (TOUTES CATÉGORIES) :

1. CRITIQUE - [Action n°1]
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

2. IMPORTANT - [Action n°2]
   [Même format...]

3. RECOMMANDÉ - [Action n°3]
   [Même format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Fort impact / Faible effort) :

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

[Paragraphe de synthèse sur l'état global du projet, ses principaux
points forts, ses principales faiblesses et la trajectoire recommandée
pour améliorer la conformité. Indiquer si le projet est prêt pour la
production, nécessite des corrections ou doit être refactoré.]

Recommandation générale : [Prêt pour la production / Corrections mineures /
Refactoring majeur / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 audits spécialisés
- Utiliser Docker pour tous les outils d'analyse (`docker compose exec app ...`) ; les builds GUI peuvent nécessiter la CI
- Fournir des exemples concrets avec fichier:ligne pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- Les problèmes de sécurité sont TOUJOURS la priorité absolue
- Proposer des corrections automatisables (scripts, hooks pre-commit, étapes CI)
- Le rapport doit être actionnable, pas seulement descriptif
- Adapter les recommandations au contexte métier du projet
- Pragmatisme avant tout : ne pas pénaliser une petite application pour un unique `lib.rs` avec des modules lorsque les responsabilités sont séparées
- Hors périmètre : code des frameworks UI (voir les stacks React / Vue / Svelte / Vite) et règles Rust générales (voir le stack `rust`)
