# Vérification complète de la conformité WordPress

## Arguments

$ARGUMENTS (optionnel : chemin du plugin/thème à analyser)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transverse.

## MISSION

Réaliser un audit de conformité complet du plugin ou du thème WordPress en orchestrant les 4 vérifications majeures : Architecture, Qualité du code, Tests et Sécurité. Produire un rapport consolidé avec un score global sur 100 points.

### Étape 1 : Préparation de l'audit

Préparer l'environnement d'audit :
- [ ] Identifier le chemin du projet à auditer
- [ ] Vérifier la présence des fichiers clés (fichier d'en-tête du plugin ou `style.css`/`theme.json`, `composer.json`, `package.json`, `.wp-env.json`, `phpcs.xml*`, `phpstan.neon*`, `uninstall.php`, fichiers `block.json`)
- [ ] Lister les répertoires principaux (`src/` ou `includes/`, `blocks/`, `languages/`, `tests/`, workflows CI)
- [ ] Identifier les valeurs déclarées `Requires at least`, `Requires PHP`, `Requires Plugins`, et les versions de l'outillage dans les lockfiles
- [ ] Déterminer le type : plugin, thème classique, thème de blocs ou mixte ; noter si le projet dépend de WooCommerce

**Note** : Si $ARGUMENTS est fourni, l'utiliser comme chemin du projet, sinon utiliser le répertoire courant.

### Étape 2 : Audit de l'architecture (25 points)

**Commande** : Utiliser la slash command `/wordpress:check architecture` ou suivre manuellement les étapes de `.claude/references/wordpress/checks/architecture.md`

**Critères évalués** :
- En-tête du plugin, fichier de bootstrap, garde ABSPATH, autoload Composer (5 pts)
- Préfixes et namespaces pour les fonctions, classes, options, hooks, handles (5 pts)
- Organisation des hooks et callbacks légers (5 pts)
- Blocs (`block.json` apiVersion 3, `render.php`) et structure d'un thème de blocs (`theme.json`, templates, parts) (5 pts)
- Conception REST et cycle de vie (activation, désactivation, désinstallation) (5 pts)

**Référence** : `.claude/references/wordpress/checks/architecture.md`

### Étape 3 : Audit de la qualité du code (25 points)

**Commande** : Utiliser la slash command `/wordpress:check code-quality` ou suivre manuellement les étapes de `.claude/references/wordpress/checks/code-quality.md`

**Critères évalués** :
- WPCS (PHPCS) passe (7 pts)
- i18n : text domain, commentaires pour traducteurs, traductions JS (5 pts)
- PHPStan (phpstan-wordpress) et ESLint (`@wordpress/eslint-plugin`) (5 pts)
- Principes KISS/DRY/YAGNI (4 pts)
- Taille des fonctions et complexité cognitive (4 pts)

**Référence** : `.claude/references/wordpress/checks/code-quality.md`

### Étape 4 : Audit des tests (25 points)

**Commande** : Utiliser la slash command `/wordpress:check testing` ou suivre manuellement les étapes de `.claude/references/wordpress/checks/testing.md`

**Critères évalués** :
- Couverture de code (cible >= 80 %) en PHP et en JS (7 pts)
- PHPUnit avec `WP_UnitTestCase` via wp-env, `yoast/phpunit-polyfills` (6 pts)
- Jest via `@wordpress/scripts` pour les blocs et le JS (4 pts)
- Tests de bout en bout Playwright avec `@wordpress/e2e-test-utils-playwright` (3 pts)
- Qualité des tests : AAA, nommage, absence de flakiness, exécution en CI (3 pts)
- Isolation des tests et usage de factories (2 pts)

**Référence** : `.claude/references/wordpress/checks/testing.md`

### Étape 5 : Audit de la sécurité (25 points)

**Commande** : Utiliser la slash command `/wordpress:check security` ou suivre manuellement les étapes de `.claude/references/wordpress/checks/security.md`

**Critères évalués** :
- Vérifications de capabilities et nonces sur chaque changement d'état (6 pts)
- `permission_callback` REST et validation des arguments (5 pts)
- Échappement en sortie (`esc_*`, `wp_kses_post`) (5 pts)
- Assainissement des entrées et `$wpdb->prepare()` (4 pts)
- Gestion des secrets et des identifiants, protections OWASP Top 10:2025 (3 pts)
- Vulnérabilités des dépendances et chaîne d'approvisionnement (`composer audit`, `npm audit`) (2 pts)

**Référence** : `.claude/references/wordpress/checks/security.md`

### Étape 6 : WooCommerce (uniquement si le projet en dépend)

Appliquer `.claude/skills/woocommerce/checklist.md` : compatibilité HPOS déclarée, `wc_get_order()` / objets CRUD au lieu des post meta, compatibilité `cart_checkout_blocks`. Intégrer les constats dans les scores Architecture et Sécurité ; ignorer entièrement cette étape pour les projets sans WooCommerce.

### Étape 7 : Consolidation et notation globale

Calculer le score global et produire le rapport consolidé :
- [ ] Additionner les 4 scores (maximum 100 points)
- [ ] Identifier les catégories critiques (<50 %)
- [ ] Lister tous les problèmes critiques transverses
- [ ] Prioriser les actions par impact/effort
- [ ] Produire le rapport consolidé final

**Barème de notation** :
- 90-100 : Excellent - Projet de référence
- 75-89 : Très bien - Quelques améliorations mineures
- 60-74 : Acceptable - Des améliorations sont nécessaires
- 40-59 : Insuffisant - Refactoring majeur nécessaire
- 0-39 : Critique - Refonte complète nécessaire

### Étape 8 : Recommandations et plan d'action

- [ ] Identifier les 3 actions prioritaires toutes catégories confondues
- [ ] Estimer l'effort et l'impact (Faible/Moyen/Élevé) de chacune
- [ ] Proposer un ordre d'implémentation
- [ ] Suggérer des quick wins (fort ratio impact/effort)

## FORMAT DE SORTIE

```
AUDIT DE CONFORMITÉ WORDPRESS - RAPPORT COMPLET
================================================

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
  • En-tête / bootstrap / autoload : XX/5
  • Préfixes / namespaces          : XX/5
  • Organisation des hooks         : XX/5
  • Blocs / structure du thème     : XX/5
  • REST / cycle de vie            : XX/5

Points forts :
- [Points forts de l'architecture]

Problèmes :
- [Problèmes d'architecture]

[Sections similaires pour Qualité du code, Tests et Sécurité...]

WOOCOMMERCE (le cas échéant) : [constats HPOS / CRUD / blocs de paiement]

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
points forts, ses principales faiblesses et la trajectoire recommandée.
Indiquer si le projet est prêt pour la production, nécessite des
corrections ou doit être refactoré.]

Recommandation générale : [Prêt pour la production / Corrections mineures /
Refactoring majeur / Refonte nécessaire]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTES IMPORTANTES

- Cette commande orchestre les 4 audits spécialisés
- Utiliser Docker pour tous les outils d'analyse (`docker compose exec app ...` ou `npx wp-env run ...`)
- Fournir des exemples concrets avec fichier:ligne pour chaque problème
- Prioriser les actions selon la matrice Impact/Effort
- Les problèmes de sécurité sont TOUJOURS la priorité absolue
- Proposer des corrections automatisables (scripts, hooks pre-commit, étapes CI)
- Le rapport doit être actionnable, pas seulement descriptif
- Pragmatisme avant tout : ne pas pénaliser un petit plugin à fichier unique pour l'absence de couches lorsque les responsabilités sont séparées
- Hors périmètre : règles PHP générales (voir le stack `php`), hébergement et déploiements de type Bedrock, développement du cœur de WordPress
