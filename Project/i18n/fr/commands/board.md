---
description: Afficher le Tableau Kanban
argument-hint: [arguments]
---

# Afficher le Tableau Kanban

Afficher le tableau Kanban du sprint actuel ou d'un sprint spécifique.

## Arguments

$ARGUMENTS (optionnel, format: [sprint N])
- **sprint N** (optionnel): Numéro du sprint à afficher
- Si non spécifié, affiche le sprint actuel

## Processus

### Étape 1: Identifier le sprint

1. Si sprint spécifié, utiliser ce numéro
2. Sinon, trouver le sprint actuel (avec des tasks non Done)

### Étape 2: Lire les données

1. Lire le fichier `project-management/sprints/sprint-XXX/board.md`
2. Ou le régénérer depuis les fichiers de tasks

### Étape 3: Grouper par statut

Organiser les tasks par colonne:
- 🔴 To Do
- 🟡 In Progress
- ⏸️ Blocked
- 🟢 Done

### Étape 4: Calculer les métriques

- Nombre de tasks par colonne
- Heures estimées et complétées
- Progression en pourcentage

## Format de Sortie

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Kanban Board                                      ║
║  Goal: Walking Skeleton - Auth + Première page                   ║
║  Période: 2024-01-15 → 2024-01-29                               ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 TO DO (4)    │ 🟡 IN PROGRESS  │ ⏸️ BLOCKED (1)  │ 🟢 DONE (8)     │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ Tests E2E       │ Service Auth    │ Screen Login    │ Entity User ✓   │
│ 4h @US-001      │ 4h @US-001      │ 6h @US-001      │ 2h @US-001      │
│                 │                 │ ⚠️ Attente API  │                 │
│ TASK-010 [DOC]  │ TASK-006 [WEB]  │                 │ TASK-002 [DB]   │
│ Documentation   │ Controller Auth │                 │ Migration ✓     │
│ 2h @US-001      │ 3h @US-001      │                 │ 1h @US-001      │
│                 │                 │                 │                 │
│ TASK-015 [BE]   │ TASK-012 [MOB]  │                 │ TASK-003 [BE]   │
│ API Products    │ Bloc Products   │                 │ Repository ✓    │
│ 4h @US-002      │ 5h @US-002      │                 │ 3h @US-001      │
│                 │                 │                 │                 │
│ TASK-016 [TEST] │                 │                 │ TASK-004 [BE]   │
│ Tests Products  │                 │                 │ API Login ✓     │
│ 3h @US-002      │                 │                 │ 4h @US-001      │
│                 │                 │                 │                 │
│                 │                 │                 │ ... +4 more     │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

══════════════════════════════════════════════════════════════════════════
📊 MÉTRIQUES

Tasks:     ████████████████████░░░░░░░░░░ 8/16 (50%)
Heures:    ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Bloquées:  1 task (6h)

Par type:
[DB]  ██████████ 3/3 done
[BE]  ████████░░ 4/5 (1 in progress)
[WEB] ████░░░░░░ 1/3 (1 in progress)
[MOB] ██░░░░░░░░ 0/3 (1 blocked, 1 in progress)
[TEST]░░░░░░░░░░ 0/2

══════════════════════════════════════════════════════════════════════════
📖 USER STORIES

│ US      │ Points │ Statut          │ Tasks     │ Progression │
├─────────┼────────┼─────────────────┼───────────┼─────────────┤
│ US-001  │ 5      │ 🟡 In Progress  │ 6/10      │ ██████░░░░  │
│ US-002  │ 5      │ 🔴 To Do        │ 2/6       │ ███░░░░░░░  │

Sprint: 10 points | Done: 0 pts
══════════════════════════════════════════════════════════════════════════

Actions:
  /project:move-task TASK-XXX in-progress  # Commencer une task
  /project:move-task TASK-XXX done         # Terminer une task
  /sprint:status                   # Voir plus de métriques
```

## Format Compact

Si beaucoup de tasks, afficher un résumé:

```
📋 Sprint 1 - Kanban (32 tasks)

🔴 To Do (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 In Progress (5): TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Blocked (2):     TASK-008 (API), TASK-021 (config)
🟢 Done (13):       TASK-001..TASK-004, TASK-007, TASK-009..TASK-014

Progression: 13/32 (41%) | 45h/98h
```

## Exemples

```
# Afficher le board du sprint actuel
/project:board

# Afficher le board du sprint 2
/project:board sprint 2
```

## Mise à jour du fichier board.md

Après affichage, le fichier `board.md` du sprint est mis à jour avec les données actuelles.
