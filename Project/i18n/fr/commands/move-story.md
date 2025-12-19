---
description: Déplacer une User Story
argument-hint: [arguments]
---

# Déplacer une User Story

Changer le statut d'une User Story ou l'assigner à un sprint.

## Arguments

$ARGUMENTS (format: US-XXX destination)
- **US-ID** (obligatoire): ID de la User Story (ex: US-001)
- **Destination** (obligatoire):
  - `sprint-N`: Assigner au sprint N
  - `backlog`: Retirer du sprint actuel
  - `in-progress`: Commencer la US
  - `blocked`: Marquer comme bloquée
  - `done`: Marquer comme terminée

## Workflow Strict

Les transitions de statut suivent un workflow strict:

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
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | * | ❌ (réouverture manuelle) |

## Processus

### Étape 1: Valider la User Story

1. Vérifier que la US existe
2. Lire son statut actuel
3. Identifier son sprint actuel (si applicable)

### Étape 2: Valider la transition

**Si changement de statut:**
1. Vérifier que la transition est autorisée
2. Si non autorisé, afficher l'erreur avec les transitions possibles

**Si assignation à un sprint:**
1. Vérifier que le sprint existe
2. Créer le répertoire du sprint si nécessaire

### Étape 3: Si transition vers Blocked

Demander le bloqueur:
```
Quel est le bloqueur pour US-XXX?
> [Description du bloqueur]
```

### Étape 4: Mettre à jour la User Story

1. Modifier le statut dans les métadonnées
2. Modifier le sprint si applicable
3. Ajouter le bloqueur si Blocked
4. Mettre à jour la date de modification

### Étape 5: Mettre à jour les fichiers liés

1. **Index** (`backlog/index.md`): Mettre à jour les compteurs
2. **EPIC parent**: Mettre à jour la progression
3. **Board du sprint** (si applicable): Déplacer les tasks

### Étape 6: Cascade sur les Tasks

**Si US passe à In Progress:**
- Les tasks restent en To Do (elles seront démarrées individuellement)

**Si US passe à Done:**
- Vérifier que toutes les tasks sont Done
- Si non, afficher un avertissement

**Si US passe à Blocked:**
- Marquer toutes les tasks In Progress comme Blocked

## Format de Sortie

### Changement de statut

```
✅ User Story déplacée!

📖 US-001: Login utilisateur
   Avant: 🔴 To Do
   Après: 🟡 In Progress

Prochaines étapes:
  /project:move-task TASK-001 in-progress  # Commencer une tâche
  /project:board                            # Voir le Kanban
```

### Assignation à un sprint

```
✅ User Story assignée au Sprint 2!

📖 US-003: Mot de passe oublié
   Sprint: Backlog → Sprint 2
   Statut: 🔴 To Do

Sprint 2 mis à jour:
  - 8 US | 34 points

Prochaines étapes:
  /project:decompose-tasks 2  # Créer les tasks
  /project:board              # Voir le Kanban
```

### Erreur de workflow

```
❌ Transition non autorisée!

📖 US-001: Login utilisateur
   Statut actuel: 🔴 To Do
   Transition demandée: → 🟢 Done

Règle: Une US doit passer par "In Progress" avant "Done"

Transitions possibles:
  /project:move-story US-001 in-progress
  /project:move-story US-001 blocked
```

## Exemples

```
# Commencer une US
/project:move-story US-001 in-progress

# Terminer une US
/project:move-story US-001 done

# Bloquer une US
/project:move-story US-001 blocked

# Assigner au sprint 2
/project:move-story US-003 sprint-2

# Retirer d'un sprint
/project:move-story US-003 backlog
```

## Validation avant Done

Avant de marquer une US comme Done, vérifier:
- [ ] Toutes les tasks sont Done
- [ ] Les tests passent
- [ ] Code reviewé
- [ ] Critères d'acceptation validés

Si non respecté:
```
⚠️ Attention: US-001 a encore des tasks non terminées!

Tasks restantes:
  🔴 TASK-004 [FE-WEB] Controller Auth
  🔴 TASK-006 [TEST] Tests AuthService

Confirmer quand même? (non recommandé)
```
