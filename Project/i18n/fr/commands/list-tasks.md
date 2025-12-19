---
description: Lister les Tasks
argument-hint: [arguments]
---

# Lister les Tasks

Afficher la liste des tâches avec filtrage par User Story, Sprint, Type ou Statut.

## Arguments

$ARGUMENTS (optionnel, format: [filtre] [valeur])
- **us US-XXX**: Filtrer par User Story
- **sprint N**: Filtrer par sprint
- **type TYPE**: Filtrer par type (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- **status STATUS**: Filtrer par statut (todo, in-progress, blocked, done)

## Processus

### Étape 1: Lire les Tasks

1. Scanner les répertoires de tasks:
   - `project-management/sprints/sprint-XXX/tasks/`
   - `project-management/backlog/tasks/` (si existe)
2. Lire chaque fichier TASK-XXX.md
3. Extraire les métadonnées

### Étape 2: Filtrer

Appliquer les filtres selon $ARGUMENTS.

### Étape 3: Calculer

- Heures estimées totales
- Heures complétées
- Répartition par type
- Répartition par statut

### Étape 4: Afficher

Générer un tableau formaté.

## Format de Sortie - Par User Story

```
🔧 Tasks - US-001: Login utilisateur

| ID | Type | Description | Statut | Est. | Passé |
|----|------|-------------|--------|------|-------|
| TASK-001 | [DB] | Entity User | 🟢 Done | 2h | 2h |
| TASK-002 | [BE] | Repository User | 🟢 Done | 3h | 3.5h |
| TASK-003 | [BE] | API endpoint login | 🟡 In Progress | 4h | 2h |
| TASK-004 | [FE-WEB] | Controller Auth | 🔴 To Do | 3h | - |
| TASK-005 | [FE-MOB] | Screen Login | ⏸️ Blocked | 6h | - |
| TASK-006 | [TEST] | Tests AuthService | 🔴 To Do | 3h | - |

───────────────────────────────────────────────────
US-001: 6 tasks | 21h estimées | 7.5h complétées (36%)
🔴 2 | 🟡 1 | ⏸️ 1 | 🟢 2
```

## Format de Sortie - Par Sprint

```
🔧 Tasks - Sprint 1

Par statut:
🔴 To Do (8 tasks, 24h)
🟡 In Progress (3 tasks, 10h)
⏸️ Blocked (2 tasks, 8h)
🟢 Done (12 tasks, 35h)

Par type:
[DB]     ████████░░ 5 tasks
[BE]     ██████████ 8 tasks
[FE-WEB] ██████░░░░ 4 tasks
[FE-MOB] ████░░░░░░ 3 tasks
[TEST]   ██████░░░░ 4 tasks
[DOC]    ██░░░░░░░░ 1 task

───────────────────────────────────────────────────
Sprint 1: 25 tasks | 77h estimées | 35h complétées (45%)
```

## Format de Sortie - Bloquées

```
⏸️ Tasks Bloquées

| ID | US | Type | Description | Bloqueur |
|----|-----|------|-------------|----------|
| TASK-005 | US-001 | [FE-MOB] | Screen Login | En attente API auth |
| TASK-012 | US-003 | [BE] | Service Email | Config SMTP manquante |

───────────────────────────────────────────────────
2 tasks bloquées | 14h en attente

Actions:
  Résoudre TASK-005: Compléter TASK-003 d'abord
  Résoudre TASK-012: Configurer SMTP dans .env
```

## Exemples

```
# Lister toutes les tasks
/project:list-tasks

# Lister les tasks d'une US
/project:list-tasks us US-001

# Lister les tasks du sprint 1
/project:list-tasks sprint 1

# Lister les tasks backend
/project:list-tasks type BE

# Lister les tasks en cours
/project:list-tasks status in-progress

# Lister les tasks bloquées
/project:list-tasks status blocked
```

## Codes Couleur Statuts

| Icône | Statut | Signification |
|-------|--------|---------------|
| 🔴 | To Do | Non commencée |
| 🟡 | In Progress | En cours |
| ⏸️ | Blocked | Bloquée |
| 🟢 | Done | Terminée |
