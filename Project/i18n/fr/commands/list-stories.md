---
description: Lister les User Stories
argument-hint: [arguments]
---

# Lister les User Stories

Afficher la liste des User Stories avec filtrage par EPIC, Sprint ou Statut.

## Arguments

$ARGUMENTS (optionnel, format: [filtre] [valeur])
- **epic EPIC-XXX**: Filtrer par EPIC
- **sprint N**: Filtrer par sprint
- **status STATUS**: Filtrer par statut (todo, in-progress, blocked, done)
- **backlog**: Afficher uniquement les US non assignées à un sprint

## Processus

### Étape 1: Lire les User Stories

1. Scanner le répertoire `project-management/backlog/user-stories/`
2. Lire chaque fichier US-XXX-*.md
3. Extraire les métadonnées de chaque US

### Étape 2: Filtrer

Appliquer les filtres selon $ARGUMENTS:
- Par EPIC parent
- Par sprint assigné
- Par statut
- Non assignées (backlog)

### Étape 3: Calculer les statistiques

Pour chaque US:
- Compter les tasks totales
- Compter les tasks par statut
- Calculer le pourcentage de progression

### Étape 4: Afficher

Générer un tableau formaté groupé par EPIC ou Sprint selon le contexte.

## Format de Sortie - Par EPIC

```
📖 User Stories - EPIC-001: Authentification

| ID | Nom | Sprint | Statut | Points | Tasks | Progression |
|----|-----|--------|--------|--------|-------|-------------|
| US-001 | Login utilisateur | Sprint 1 | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Inscription | Sprint 1 | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Mot de passe oublié | Backlog | 🔴 To Do | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 points | 🔴 2 | 🟡 1 | 🟢 0
```

## Format de Sortie - Par Sprint

```
📖 User Stories - Sprint 1

| ID | EPIC | Nom | Statut | Points | Tasks | Progression |
|----|------|-----|--------|--------|-------|-------------|
| US-001 | EPIC-001 | Login utilisateur | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | EPIC-001 | Inscription | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-005 | EPIC-002 | Liste produits | 🟢 Done | 5 | 6/6 | ██████████ 100% |

───────────────────────────────────────────────────
Sprint 1: 3 US | 13 points | Done: 5 pts (38%)
```

## Format de Sortie - Backlog

```
📖 Backlog (US non assignées)

| ID | EPIC | Nom | Priorité | Points | Statut |
|----|------|-----|----------|--------|--------|
| US-003 | EPIC-001 | Mot de passe oublié | High | 3 | 🔴 To Do |
| US-006 | EPIC-002 | Détail produit | Medium | 5 | 🔴 To Do |
| US-007 | EPIC-002 | Recherche | Low | 8 | 🔴 To Do |

───────────────────────────────────────────────────
Backlog: 3 US | 16 points à planifier
```

## Exemples

```
# Lister toutes les US
/project:list-stories

# Lister les US d'un EPIC
/project:list-stories epic EPIC-001

# Lister les US du sprint courant
/project:list-stories sprint 1

# Lister les US en cours
/project:list-stories status in-progress

# Lister les US bloquées
/project:list-stories status blocked

# Lister le backlog (non assignées)
/project:list-stories backlog
```

## Actions suggérées

Selon le contexte, suggérer:
```
Actions:
  /sprint:transition US-XXX sprint-2     # Assigner à un sprint
  /sprint:transition US-XXX in-progress  # Changer le statut
  /project:add-task US-XXX "[BE] ..." 4h  # Ajouter une tâche
```
