---
description: Déplacer une Task
argument-hint: [arguments]
---

# Déplacer une Task

Changer le statut d'une tâche selon le workflow strict.

## Arguments

$ARGUMENTS (format: TASK-XXX destination)
- **TASK-ID** (obligatoire): ID de la tâche (ex: TASK-001)
- **Destination** (obligatoire):
  - `in-progress`: Commencer la tâche
  - `blocked`: Marquer comme bloquée
  - `done`: Marquer comme terminée

## Workflow Strict

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

### Transitions Autorisées

| Depuis | Vers | Autorisé |
|--------|------|----------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Interdit** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (rollback) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (réouverture) |

> Les statuts des tâches sont stockés uniquement dans `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), selon `.claude/templates/project/sprint-status.md`. Les fichiers markdown de tâche et de US ne contiennent aucun statut.

## Processus

### Étape 1: Valider la Task

1. Trouver le fichier de la task
2. Lire son statut actuel depuis `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`)
3. Identifier la US et le sprint associés

### Étape 2: Valider la transition

1. Vérifier que la transition est autorisée
2. Si To Do → Done, bloquer et suggérer In Progress

### Étape 3: Si transition vers Blocked

Demander le bloqueur:
```
Quel est le bloqueur pour TASK-XXX?
> [Description du bloqueur]
```

### Étape 4: Si transition vers Done

Demander le temps passé:
```
Temps passé sur TASK-XXX? (estimation: 4h)
> [Temps réel, ex: 3.5h]
```

### Étape 5: Mettre à jour la Task

1. Écrire le nouveau statut dans `.bmad/sprint-status.yaml` : `stories.<US>.tasks.status.<TASK>` (schéma : `.claude/templates/project/sprint-status.md`) ; jamais dans le fichier de la task
2. Recalculer `stories.<US>.tasks.completed` (= nombre de tasks `done`)
3. Contenu uniquement dans le fichier de la task : ajouter le bloqueur si Blocked, mettre à jour le temps passé si Done, mettre à jour la date de modification

### Étape 6: Mettre à jour le Board

1. Régénérer le `board.md` du sprint depuis `.bmad/sprint-status.yaml` (vue générée, jamais éditée à la main)
2. Mettre à jour les métriques

### Étape 7: Mettre à jour la User Story

1. Mettre à jour la liste des tasks (contenu uniquement)
2. Recalculer la progression depuis `.bmad/sprint-status.yaml`
3. Si toutes les tasks Done, suggérer de terminer la US

### Étape 8: Mettre à jour l'Index

1. Mettre à jour les compteurs globaux

## Format de Sortie

### Transition réussie

```
✅ Task déplacée!

🔧 TASK-003: API endpoint login
   Avant: to-do
   Après: in-progress

📖 US-001: Login utilisateur
   Progression: 2/6 → 3/6 (50%)

Prochaines étapes:
  /project:move-task TASK-003 done       # Quand terminée
  /project:move-task TASK-003 blocked    # Si bloquée
```

### Task terminée

```
✅ Task terminée!

🔧 TASK-003: API endpoint login
   Statut: in-progress → done
   Estimation: 4h
   Temps réel: 3.5h ✓

📖 US-001: Login utilisateur
   Progression: 4/6 (67%) ████████░░░░

Sprint 1:
   Tasks done: 12/25 (48%)
   Heures: 35h/77h complétées
```

### Toutes les tasks Done

```
✅ Task terminée!

🔧 TASK-006: Tests AuthService
   Statut: done

🎉 Toutes les tasks de US-001 sont terminées!

📖 US-001: Login utilisateur
   Progression: 6/6 (100%) ██████████

Prochaine étape recommandée:
  /sprint:transition US-001 done
```

### Erreur de workflow

```
❌ Transition non autorisée!

🔧 TASK-004: Controller Auth
   Statut actuel: to-do
   Transition demandée: → done

Règle: Une task doit passer par "In Progress" avant "Done"

Action correcte:
  /project:move-task TASK-004 in-progress
  # ... travailler sur la task ...
  /project:move-task TASK-004 done
```

### Task bloquée

```
✅ Task marquée comme bloquée

🔧 TASK-005: Screen Login
   Statut: in-progress → blocked
   Bloqueur: En attente de l'API auth (TASK-003)

Pour débloquer:
  1. Terminer TASK-003
  2. /project:move-task TASK-005 in-progress
```

## Exemples

```
# Commencer une task
/project:move-task TASK-001 in-progress

# Terminer une task
/project:move-task TASK-001 done

# Bloquer une task
/project:move-task TASK-001 blocked

# Débloquer une task
/project:move-task TASK-001 in-progress
```

## Métriques mises à jour

À chaque mouvement:
- Compteur de tasks par statut
- Heures estimées vs réelles
- Progression de la US
- Progression du sprint
- Board Kanban
