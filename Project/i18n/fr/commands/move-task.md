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
🔴 To Do ──→ 🟡 In Progress ──→ 🟢 Done
     │              │
     │              ↓
     └────→ ⏸️ Blocked ←────┘
                │
                ↓
           🟡 In Progress
```

### Transitions Autorisées

| Depuis | Vers | Autorisé |
|--------|------|----------|
| 🔴 To Do | 🟡 In Progress | ✅ |
| 🔴 To Do | ⏸️ Blocked | ✅ |
| 🔴 To Do | 🟢 Done | ❌ **Interdit** |
| 🟡 In Progress | 🟢 Done | ✅ |
| 🟡 In Progress | ⏸️ Blocked | ✅ |
| 🟡 In Progress | 🔴 To Do | ✅ (rollback) |
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | 🟡 In Progress | ⚠️ (réouverture) |

## Processus

### Étape 1: Valider la Task

1. Trouver le fichier de la task
2. Lire son statut actuel
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

1. Modifier le statut dans les métadonnées
2. Ajouter le bloqueur si Blocked
3. Mettre à jour le temps passé si Done
4. Mettre à jour la date de modification

### Étape 6: Mettre à jour le Board

1. Lire le board du sprint
2. Déplacer la task vers la nouvelle colonne
3. Mettre à jour les métriques

### Étape 7: Mettre à jour la User Story

1. Mettre à jour la liste des tasks
2. Recalculer la progression
3. Si toutes les tasks Done, suggérer de terminer la US

### Étape 8: Mettre à jour l'Index

1. Mettre à jour les compteurs globaux

## Format de Sortie

### Transition réussie

```
✅ Task déplacée!

🔧 TASK-003: API endpoint login
   Avant: 🔴 To Do
   Après: 🟡 In Progress

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
   Statut: 🟡 In Progress → 🟢 Done
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
   Statut: 🟢 Done

🎉 Toutes les tasks de US-001 sont terminées!

📖 US-001: Login utilisateur
   Progression: 6/6 (100%) ██████████

Prochaine étape recommandée:
  /project:move-story US-001 done
```

### Erreur de workflow

```
❌ Transition non autorisée!

🔧 TASK-004: Controller Auth
   Statut actuel: 🔴 To Do
   Transition demandée: → 🟢 Done

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
   Statut: 🟡 In Progress → ⏸️ Blocked
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
