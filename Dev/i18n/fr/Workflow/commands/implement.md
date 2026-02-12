---
name: workflow-implement
description: "Exécuter la phase d'Implémentation - développement sprint avec TDD/BDD"
arguments:
  - name: sprint
    description: Numéro de sprint spécifique sur lequel travailler
    required: false
---

# /workflow:implement

## Mission

Exécuter la phase d'Implémentation du workflow de développement. Cette phase se concentre sur le développement sprint par sprint en utilisant les pratiques TDD/BDD, en suivant la conception technique établie dans les phases précédentes.

## Quand utiliser

- Après la complétion de `/workflow:design` (tracks Standard/Enterprise)
- Après `/workflow:init` pour le track Quick Flow
- Quand on est prêt à coder

## Prérequis

Pour les tracks Standard/Enterprise :
- La Spécification Technique existe dans `project-management/tech-spec.md`
- Le backlog existe dans `project-management/backlog/`
- La structure de sprint est définie dans `project-management/sprints/`

Pour le Quick Flow :
- Compréhension claire du bug/fonctionnalité à implémenter

## Workflow

### Étape 1 : Mise en place de l'implémentation

```
╔══════════════════════════════════════════════════════════╗
║           PHASE D'IMPLÉMENTATION - DÉMARRAGE              ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 4 sur 4 - Implémentation                          ║
║                                                           ║
║ Objectifs :                                               ║
║ • Exécuter le développement sprint avec TDD/BDD           ║
║ • Implémenter les user stories selon la spécification     ║
║ • Maintenir la qualité du code et la couverture de tests  ║
║ • Valider la Definition of Done pour chaque story         ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 2 : Sélection du sprint

```
╔══════════════════════════════════════════════════════════╗
║               APERÇU DES SPRINTS                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprints disponibles :                                     ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 1 : Walking Skeleton                         │  ║
║ │ Statut : Prêt à démarrer                            │  ║
║ │ Stories : 5 | Points : 21                           │  ║
║ │ Focus : Infrastructure + première fonctionnalité    │  ║
║ │ bout en bout                                        │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 2 : Fonctionnalités principales              │  ║
║ │ Statut : Planifié                                   │  ║
║ │ Stories : 6 | Points : 28                           │  ║
║ │ Focus : Gestion utilisateurs, authentification      │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 3 : Intégration paiement                     │  ║
║ │ Statut : Planifié                                   │  ║
║ │ Stories : 4 | Points : 24                           │  ║
║ │ Focus : Intégration Stripe, parcours de paiement    │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Sélectionner le sprint à travailler (défaut : Sprint 1)  ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 3 : Redirection vers le développement sprint

Pour l'exécution complète du sprint, cette commande redirige vers la commande spécialisée sprint-dev :

```
╔══════════════════════════════════════════════════════════╗
║           DÉMARRAGE DU DÉVELOPPEMENT SPRINT               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Invocation : /sprint:dev sprint-001-walking-skeleton║
║                                                           ║
║ Fonctionnalités du mode développement sprint :            ║
║ • Mode plan obligatoire avant chaque tâche                ║
║ • Cycle TDD : RED → GREEN → REFACTOR                      ║
║ • Mises à jour automatiques du statut                     ║
║ • Commits conventionnels avec références aux stories      ║
║ • Validation de la Definition of Done                     ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 4 : Guide d'implémentation

Fournir le contexte depuis la phase de conception :

```
╔══════════════════════════════════════════════════════════╗
║           CONTEXTE D'IMPLÉMENTATION                       ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Depuis la Spécification Technique :                       ║
║ ├── Architecture : Clean Architecture (Hexagonal)         ║
║ ├── Style d'API : REST avec JSON:API                      ║
║ ├── Auth : JWT avec refresh tokens                        ║
║ ├── Base de données : PostgreSQL avec Doctrine ORM        ║
║ └── Tests : PHPUnit + Jest + Playwright                   ║
║                                                           ║
║ ADR pertinents :                                          ║
║ ├── ADR-001 : Choix de base de données (PostgreSQL)       ║
║ ├── ADR-002 : Style d'API (REST)                          ║
║ └── ADR-003 : Authentification (JWT)                      ║
║                                                           ║
║ Standards de code :                                       ║
║ ├── Suivre les patterns existants dans le codebase        ║
║ ├── Objectif de couverture de tests : 80%                 ║
║ └── Utiliser les rules spécifiques à la technologie :     ║
║     /symfony:*, /react:*, etc.                            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 5 : Mode Quick Flow

Pour le track Quick Flow (corrections de bugs, petites fonctionnalités) :

```
╔══════════════════════════════════════════════════════════╗
║           QUICK FLOW - IMPLÉMENTATION DIRECTE             ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Pas de structure de sprint nécessaire pour Quick Flow.    ║
║                                                           ║
║ Commandes disponibles :                                   ║
║                                                           ║
║ Pour les corrections de bugs :                            ║
║ • /qa:tdd        - Corriger avec TDD          ║
║                                                           ║
║ Pour les petites fonctionnalités :                        ║
║ • /{tech}:* commandes        - Spécifiques à la techno    ║
║                                                           ║
║ Suivi :                                                   ║
║ • /project:add-task          - Suivre comme tâche         ║
║ • /project:move-task done    - Marquer comme terminé      ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 6 : Fin de sprint

Après la complétion du sprint :

```
╔══════════════════════════════════════════════════════════╗
║           SPRINT TERMINÉ                                  ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprint 1 : Walking Skeleton                               ║
║ Statut : ✅ Terminé                                       ║
║                                                           ║
║ Métriques :                                               ║
║ ├── Stories complétées : 5/5                              ║
║ ├── Points livrés : 21                                    ║
║ ├── Vélocité : 21 pts/sprint                              ║
║ ├── Couverture de tests : 82%                             ║
║ └── Commits : 23                                          ║
║                                                           ║
║ Artefacts :                                               ║
║ ├── sprint-review.md généré                               ║
║ └── sprint-retro.md template prêt                         ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PROCHAINES ACTIONS :                                      ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ 1. /workflow:review     - Conduire la revue sprint   ║
║ 2. /workflow:retro      - Lancer la rétrospective    ║
║ 3. /workflow:implement 2     - Démarrer le Sprint 2       ║
║                                                           ║
║ Ou vérifier la progression : /workflow:status             ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 7 : Fin du workflow

Quand tous les sprints sont terminés :

```
╔══════════════════════════════════════════════════════════╗
║           PHASE D'IMPLÉMENTATION TERMINÉE                 ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Tous les sprints planifiés sont terminés !                ║
║                                                           ║
║ Résumé du projet :                                        ║
║ ├── Sprints totaux : 4                                    ║
║ ├── Stories totales : 18                                  ║
║ ├── Points totaux : 89                                    ║
║ ├── Vélocité moyenne : 22 pts/sprint                      ║
║ ├── Couverture de tests : 84%                             ║
║ └── Commits totaux : 87                                   ║
║                                                           ║
║ Prochaines étapes :                                       ║
║ • /common:release-checklist  - Préparer la release        ║
║ • /common:generate-changelog - Générer les notes de       ║
║   release                                                 ║
║ • Déployer en staging/production                          ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║           WORKFLOW DU PROJET TERMINÉ !                    ║
║ ═══════════════════════════════════════════════════════  ║
╚══════════════════════════════════════════════════════════╝
```

## Agents impliqués

- **tech-lead** : Décomposition des tâches, guidance architecturale
- **tdd-coach** : Guidance méthodologique TDD/BDD
- **{tech}-reviewer** : Revue de code (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer** : CI/CD et déploiement

## Commandes associées

- `/workflow:design` - Phase précédente
- `/workflow:status` - Vérifier la progression
- `/sprint:dev` - Mode complet de développement sprint
- `/qa:tdd` - Corrections rapides de bugs
- `/workflow:review` - Cérémonie de revue de sprint
- `/workflow:retro` - Rétrospective de sprint
