# Vérification Complète de la Conformité Rust / Axum

## Arguments

$ARGUMENTS (optionnel : chemin du projet à analyser)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transverse.

## MISSION

Réaliser un audit de conformité complet du projet Rust / Axum en orchestrant les 4 vérifications majeures : Architecture, Qualité du code, Tests et Sécurité. Produire un rapport consolidé avec un score global sur 100 points.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers de configuration (Cargo.toml, Cargo.lock, rust-toolchain.toml, rustfmt.toml, clippy.toml ou tables `[lints]`, deny.toml, `.sqlx/`)
- [ ] Lister les répertoires principaux (crates/ ou src/, migrations/, tests/, benches/)
- [ ] Identifier la toolchain Rust (`rust-toolchain.toml`), l'édition (`edition = "2024"`) et les versions d'axum / tokio / sqlx (`Cargo.lock`)

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit d'architecture (25 points)

Exécuter la vérification d'architecture complète :

**Commande** : Utiliser la slash command `/rust:check architecture` ou suivre manuellement les étapes de `.claude/references/rust/checks/architecture.md`

**Critères évalués** :
- Organisation du workspace et frontières de crates (domain exempt d'axum/sqlx) (6 pts)
- Handlers fins, cas d'usage dans la couche application (6 pts)
- Router, State (`Arc<AppState>` / `FromRef`) et extractors (4 pts)
- Modèle d'erreurs : `thiserror` dans les bibliothèques, `AppError: IntoResponse`, problem+json (4 pts)
- Middleware Tower, tracing et arrêt gracieux (3 pts)
- Sens des dépendances et adaptateurs de persistance (SQLx) (2 pts)

**Référence** : `.claude/references/rust/checks/architecture.md`

### Étape 3 : Audit de qualité du code (25 points)

Exécuter la vérification de qualité du code :

**Commande** : Utiliser la slash command `/rust:check code-quality` ou suivre manuellement les étapes de `.claude/references/rust/checks/code-quality.md`

**Critères évalués** :
- Clippy sans alerte avec `-D warnings` et lints de workspace (5 pts)
- rustfmt, nommage Rust API Guidelines, `#![forbid(unsafe_code)]` (5 pts)
- Hygiène de l'ownership et du borrowing, pas de clones inutiles, rustdoc (4 pts)
- Principes KISS/DRY/YAGNI (4 pts)
- Taille des fonctions et complexité cognitive (4 pts)
- Gestion d'erreurs : pas de `unwrap()` / `expect()` sur les chemins de requête (3 pts)

**Référence** : `.claude/references/rust/checks/code-quality.md`

### Étape 4 : Audit des tests (25 points)

Exécuter la vérification des tests :

**Commande** : Utiliser la slash command `/rust:check testing` ou suivre manuellement les étapes de `.claude/references/rust/checks/testing.md`

**Critères évalués** :
- Couverture de code (cargo-llvm-cov, cible >= 80 %) (7 pts)
- Tests unitaires dans le module pour le domaine et les cas d'usage (6 pts)
- Tests d'intégration : Router avec `oneshot`, `#[sqlx::test]` (4 pts)
- Qualité des tests : AAA, nommage, nextest, absence de flakiness (3 pts)
- Tests par propriétés, par snapshots et de mutation (proptest, insta, cargo-mutants) (3 pts)
- Isolation des tests et mocking des ports (2 pts)

**Référence** : `.claude/references/rust/checks/testing.md`

### Étape 5 : Audit de sécurité (25 points)

Exécuter la vérification de sécurité :

**Commande** : Utiliser la slash command `/rust:check security` ou suivre manuellement les étapes de `.claude/references/rust/checks/security.md`

**Critères évalués** :
- Protections OWASP Top 10:2025 (6 pts)
- Gestion des secrets et des identifiants (`secrecy`, environnement, vault) (5 pts)
- Validation des entrées (validator / garde), limites de corps, encodage des sorties (4 pts)
- Vulnérabilités des dépendances et supply chain (cargo-deny, cargo-audit, cargo-vet) (4 pts)
- Authentification, autorisation et rate limiting (Argon2id, JWT EdDSA, tower_governor) (3 pts)
- Configuration sécurisée (en-têtes de sécurité, cookies, CORS, TLS) (2 pts)
- Prévention des injections SQL (paramètres liés SQLx) (1 pt)

**Référence** : `.claude/references/rust/checks/security.md`

### Étape 6 : Consolidation et notation globale

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (max 100 points)
- [ ] Identifier les catégories critiques (<50 %)
- [ ] Lister tous les problèmes critiques transverses
- [ ] Prioriser les actions par impact/effort
- [ ] Produire le rapport consolidé final

**Échelle de notation** :
- 90-100 : Excellent - Projet de référence
- 75-89 : Très bon - Quelques améliorations mineures
- 60-74 : Acceptable - Améliorations nécessaires
- 40-59 : Insuffisant - Refactoring majeur nécessaire
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
AUDIT DE CONFORMITÉ RUST / AXUM - RAPPORT COMPLET
=================================================

SCORE GLOBAL : XX/100

NIVEAU DE CONFORMITÉ : [Excellent/Très bon/Acceptable/Insuffisant/Critique]

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

DÉTAIL PAR CATÉGORIE :

┌─────────────────────────────────────────────┐
│ ARCHITECTURE (XX/25)                        │
└─────────────────────────────────────────────┘

Sous-scores :
  • Workspace / frontières de crates : XX/6
  • Handlers fins / cas d'usage      : XX/6
  • Router, State, extractors        : XX/4
  • Modèle d'erreurs / problem+json  : XX/4
  • Middleware, tracing, arrêt       : XX/3
  • Dépendances et adaptateurs       : XX/2

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

[Paragraphe de synthèse sur l'état global du projet, ses points forts
majeurs, ses faiblesses majeures et la trajectoire recommandée pour
améliorer la conformité. Indiquer si le projet est prêt pour la
production, nécessite des corrections ou doit être refactoré.]

Recommandation générale : [Prêt pour la production / Corrections mineures /
Refactoring majeur / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 audits spécialisés
- Utiliser Docker pour tous les outils d'analyse (`docker compose exec app ...`)
- Fournir des exemples concrets avec fichier:ligne pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- Les problèmes de sécurité sont TOUJOURS la priorité absolue
- Proposer des corrections automatisables (scripts, hooks pre-commit, étapes CI)
- Le rapport doit être actionnable, pas seulement descriptif
- Adapter les recommandations au contexte métier du projet
- Pragmatisme avant tout : ne pas pénaliser un petit service qui reste une seule crate avec des modules tant que les frontières sont respectées
