---
name: workflow-status
description: "Afficher la progression du workflow et les prochaines actions recommandées"
arguments:
  - name: verbose
    description: Afficher le statut détaillé avec tous les artefacts
    required: false
---

# /workflow:status

## Mission

Afficher l'état actuel du workflow de développement, incluant les phases terminées, la progression en cours et les prochaines actions recommandées.

## Utilisation

```bash
/workflow:status           # Vue standard du statut
/workflow:status --verbose # Vue détaillée avec tous les artefacts
```

## Format de sortie

### Vue standard

```
╔══════════════════════════════════════════════════════════════════╗
║                       STATUT DU WORKFLOW                          ║
╠══════════════════════════════════════════════════════════════════╣
║ Projet : my-awesome-app                                           ║
║ Track : STANDARD                                                  ║
║ Démarré : 2026-01-07                                              ║
║ Phase actuelle : Conception ████████████░░░░ 75%                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Phase 1 : Analyse                                                ║
║  └── ⏭️  Ignorée (track Standard)                                 ║
║                                                                   ║
║  Phase 2 : Planification                                          ║
║  └── ✅ Terminée                                                  ║
║      ├── PRD : ✅ Terminé                                         ║
║      ├── Personas : ✅ 3 définis                                  ║
║      └── Backlog : ✅ 18 stories (89 pts)                         ║
║                                                                   ║
║  Phase 3 : Conception                                             ║
║  └── 🔄 En cours                                                  ║
║      ├── Spécification Technique : ✅ Terminée                    ║
║      ├── Architecture : ✅ Diagrammes C4 créés                    ║
║      ├── Conception API : 🔄 En cours (18/24 endpoints)           ║
║      └── ADR : ✅ 3 créés                                         ║
║                                                                   ║
║  Phase 4 : Implémentation                                         ║
║  └── ⏳ En attente                                                ║
║      └── Sprint 1 : Prêt à démarrer (21 pts)                     ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ PROCHAINE ACTION : Terminer la conception API                     ║
║ COMMANDE : /workflow:design --continue                            ║
╚══════════════════════════════════════════════════════════════════╝
```

### Vue détaillée (--verbose)

```
╔══════════════════════════════════════════════════════════════════╗
║                   STATUT DU WORKFLOW (DÉTAILLÉ)                   ║
╠══════════════════════════════════════════════════════════════════╣
║ Projet : my-awesome-app                                           ║
║ Track : STANDARD                                                  ║
║ Démarré : 2026-01-07T10:00:00Z                                    ║
║ Dernière mise à jour : 2026-01-07T15:30:00Z                       ║
║ Fichier de statut : project-management/workflow-status.yaml       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 2 : PLANIFICATION (Terminée)                                ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ PRD : project-management/prd.md                                   ║
║ ├── Version : 1.0                                                 ║
║ ├── Exigences fonctionnelles : 12                                 ║
║ ├── Exigences non fonctionnelles : 8                              ║
║ ├── Métriques de succès : 5 KPI définis                           ║
║ └── Dernière modification : 2026-01-07T11:00:00Z                  ║
║                                                                   ║
║ Personas : project-management/personas.md                         ║
║ ├── Principaux : Business Owner, Freelancer                       ║
║ └── Secondaire : Accountant                                       ║
║                                                                   ║
║ Backlog : project-management/backlog/                             ║
║ ├── EPIC : 4                                                      ║
║ │   ├── EPIC-001 : Gestion utilisateurs (21 pts)                  ║
║ │   ├── EPIC-002 : Intégration paiement (24 pts)                  ║
║ │   ├── EPIC-003 : Reporting (23 pts)                              ║
║ │   └── EPIC-004 : Notifications (21 pts)                          ║
║ ├── User Stories : 18                                              ║
║ │   ├── P0 (Indispensable) : 8 stories                             ║
║ │   ├── P1 (Souhaitable) : 6 stories                               ║
║ │   └── P2 (Optionnel) : 4 stories                                 ║
║ └── Story Points totaux : 89                                       ║
║                                                                   ║
║ Sprints planifiés :                                                ║
║ ├── Sprint 1 : Walking Skeleton (21 pts) - 5 stories              ║
║ ├── Sprint 2 : Fonctionnalités principales (28 pts) - 6 stories   ║
║ ├── Sprint 3 : Paiements (24 pts) - 4 stories                     ║
║ └── Sprint 4 : Finalisation (16 pts) - 3 stories                  ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 3 : CONCEPTION (En cours - 75%)                             ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Spécification Technique : project-management/tech-spec.md ✅      ║
║ ├── Version : 1.0                                                 ║
║ ├── Architecture : Clean Architecture (Hexagonal)                 ║
║ ├── Stack : Symfony 7.x + React 18 + PostgreSQL 16                ║
║ └── Intégrations : Stripe, SendGrid, AWS S3                       ║
║                                                                   ║
║ Architecture : project-management/architecture/ ✅                ║
║ ├── c4-context.md - Diagramme de contexte système                 ║
║ ├── c4-container.md - Diagramme de conteneurs                     ║
║ ├── c4-component.md - Diagramme de composants                     ║
║ └── erd.md - Diagramme Entité-Relation (8 entités)                ║
║                                                                   ║
║ Conception API : project-management/architecture/api.md 🔄        ║
║ ├── Conçus : 18 endpoints                                         ║
║ ├── Restants : 6 endpoints                                        ║
║ └── Auth : JWT avec refresh tokens                                 ║
║                                                                   ║
║ ADR : docs/adr/ ✅                                                 ║
║ ├── ADR-001 : Base de données (PostgreSQL)                         ║
║ ├── ADR-002 : Style d'API (REST)                                   ║
║ └── ADR-003 : Authentification (JWT)                               ║
║                                                                   ║
║ Sécurité : project-management/architecture/security.md ⏳         ║
║ └── Statut : En attente                                            ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 4 : IMPLÉMENTATION (En attente)                             ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Sprint 1 : sprint-001-walking-skeleton                             ║
║ ├── Statut : Prêt à démarrer                                      ║
║ ├── Stories : 5                                                    ║
║ ├── Points : 21                                                    ║
║ └── Tâches : 0 (pas encore décomposé)                              ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ SANTÉ DU WORKFLOW                                                 ║
╠══════════════════════════════════════════════════════════════════╣
║ ✅ Le PRD est aligné avec le backlog                               ║
║ ✅ La spécification technique couvre toutes les exigences          ║
║ ✅ L'architecture est documentée                                   ║
║ ⚠️  Conception API incomplète (6 endpoints restants)               ║
║ ⚠️  Revue de sécurité en attente                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ PROCHAINES ACTIONS                                                ║
╠══════════════════════════════════════════════════════════════════╣
║ 1. Terminer la conception API (6 endpoints restants)              ║
║    Commande : /workflow:design --continue                         ║
║                                                                   ║
║ 2. Compléter la revue de sécurité                                 ║
║    Commande : (inclus dans la phase de conception)                ║
║                                                                   ║
║ 3. Puis démarrer l'implémentation                                 ║
║    Commande : /workflow:implement                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

### Pas de workflow initialisé

```
╔══════════════════════════════════════════════════════════════════╗
║                       STATUT DU WORKFLOW                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ⚠️  Aucun workflow initialisé pour ce projet                     ║
║                                                                   ║
║  Pour commencer, exécuter :                                       ║
║                                                                   ║
║    /workflow:init                                                 ║
║                                                                   ║
║  Cela va :                                                        ║
║  • Analyser le contexte de ton projet                             ║
║  • Recommander le track approprié (Quick/Standard/Enterprise)     ║
║  • Initialiser le suivi du workflow                               ║
║  • Te guider à travers les phases de développement                ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Statut Quick Flow

```
╔══════════════════════════════════════════════════════════════════╗
║                       STATUT DU WORKFLOW                          ║
╠══════════════════════════════════════════════════════════════════╣
║ Projet : my-awesome-app                                           ║
║ Track : QUICK FLOW                                                ║
║ Démarré : 2026-01-07                                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Quick Flow - Implémentation directe                              ║
║  └── 🔄 En cours                                                  ║
║                                                                   ║
║  Pas de phases requises pour Quick Flow.                          ║
║  Travail direct sur l'implémentation.                             ║
║                                                                   ║
║  Tâche actuelle (si suivie) :                                     ║
║  └── TASK-042 : Corriger le bug de validation login               ║
║      Statut : En cours                                            ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ COMMANDES DISPONIBLES                                             ║
╠══════════════════════════════════════════════════════════════════╣
║ • /qa:tdd     - Continuer avec l'approche TDD        ║
║ • /project:move-task done - Marquer la tâche comme terminée      ║
║ • /workflow:init          - Démarrer un nouveau workflow          ║
╚══════════════════════════════════════════════════════════════════╝
```

## Structure du fichier de statut

Le statut est lu depuis `project-management/workflow-status.yaml` :

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Track Standard - analyse non requise"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      personas:
        status: complete
        path: project-management/personas.md
        count: 3
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    started_at: 2026-01-07T12:00:00Z
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      architecture:
        status: complete
        path: project-management/architecture/
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
      adrs:
        status: complete
        count: 3
        path: docs/adr/
      security:
        status: pending
  implementation:
    status: pending
    sprints:
      - name: sprint-001-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Terminer la conception API"
next_command: "/workflow:design --continue"
```

## Commandes associées

- `/workflow:init` - Initialiser un nouveau workflow
- `/workflow:analyze` - Phase d'analyse
- `/workflow:plan` - Phase de planification
- `/workflow:design` - Phase de conception
- `/workflow:implement` - Phase d'implémentation

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Selon la phase en cours :                               ║
║                                                          ║
║  • analyze  → /workflow:plan                             ║
║  • plan     → /workflow:design                           ║
║  • design   → /workflow:implement                        ║
║  • implement→ /workflow:review                           ║
║  • review   → /workflow:retro                            ║
║  • retro    → /workflow:start {N+1}                      ║
║                                                          ║
║  Voir aussi :                                            ║
║  • /sprint:status — Métriques au niveau sprint           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
