---
description: "Mettre à jour les stories au format BMAD v6 avec les champs manquants"
argument-hint: "[--dry-run] [story-id]"
---

# Update Stories

Ajouter les champs BMAD v6 manquants aux user stories existantes.

## Arguments

$ARGUMENTS (format: [--dry-run] [story-id])
- **--dry-run** (optionnel) : Prévisualiser les changements sans les appliquer
- **story-id** (optionnel) : Story spécifique à mettre à jour (ex: US-001). Si omis, met à jour toutes.

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Processus

### Étape 1 : Charger l'état actuel

1. Lire `.bmad/sprint-status.yaml`
2. Charger les fichiers story du backlog
3. Comparer les champs entre fichier et sprint-status

### Étape 2 : Identifier les champs manquants

Pour chaque story, vérifier :

| Champ | Requis | Défaut si manquant |
|-------|--------|-------------------|
| tdd_phase | Oui | "red" si in-progress, "" sinon |
| tasks.list | Oui | Extraire de la section ## Tasks |
| tasks.total | Oui | Compter depuis la liste |
| tasks.completed | Oui | Compter les tâches terminées |
| current_task | Non | Première tâche en cours |
| history | Oui | Initialiser avec le statut actuel |
| acceptance_criteria.total | Oui | Compter depuis la section AC |
| acceptance_criteria.validated | Oui | 0 (défaut) |
| story_points | Oui | Demander si manquant |
| epic_id | Non | Extraire du fichier |

### Étape 3 : Parser la liste des tâches depuis le markdown

Extraire les tâches du format fichier story :
```markdown
## Tasks

| ID | Description | Statut |
|----|-------------|--------|
| TASK-001 | Endpoint backend | 🟢 Done |
| TASK-002 | Formulaire frontend | 🟡 En cours |
```

Convertir au format BMAD :
```yaml
tasks:
  list:
    - id: "TASK-001"
      title: "Endpoint backend"
      status: "done"
    - id: "TASK-002"
      title: "Formulaire frontend"
      status: "in-progress"
```

### Étape 4 : Parser les critères d'acceptance

Extraire du format Gherkin :
```markdown
## Critères d'Acceptance

### AC1 : Login valide
Étant donné un utilisateur inscrit
Quand il entre des identifiants valides
Alors il est connecté
Statut : ✅ Validé

### AC2 : Login invalide
Étant donné un utilisateur
Quand il entre des identifiants invalides
Alors il voit un message d'erreur
Statut : ⏳ En attente
```

Convertir au format BMAD :
```yaml
acceptance_criteria:
  total: 2
  validated: 1
  list:
    - id: "AC1"
      title: "Login valide"
      status: "validated"
    - id: "AC2"
      title: "Login invalide"
      status: "pending"
```

### Étape 5 : Initialiser l'historique

Si pas d'historique, créer l'entrée initiale :
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: ""
    to: "{statut_actuel}"
    by: "update-stories"
    reason: "Historique initialisé"
```

### Étape 6 : Valider la conformité INVEST

Exécuter les vérifications INVEST et ajouter le score :
```yaml
invest_score:
  independent: true
  negotiable: true
  valuable: true
  estimable: true   # false si pas de story_points
  small: true       # false si > 8 points
  testable: true    # false si pas d'AC
  total: 6
```

### Étape 7 : Mettre à jour sprint-status.yaml

Fusionner les champs mis à jour dans sprint-status.yaml.

### Étape 8 : Mettre à jour les fichiers story (optionnel)

Ajouter le commentaire metadata BMAD aux fichiers story :
```markdown
<!-- BMAD v6 Metadata
tdd_phase: green
invest_score: 6/6
last_sync: 2026-01-29T10:00:00Z
-->
```

## Format de sortie

```
📝 Mise à jour Stories vers BMAD v6
====================================

## Stories mises à jour : {COUNT}

| Story | Champs ajoutés | Score INVEST |
|-------|----------------|--------------|
| US-001 | tdd_phase, history | 6/6 ✅ |
| US-002 | tasks.list, history | 5/6 ⚠️ |
| US-003 | story_points requis | 4/6 ❌ |

## Résumé des champs

| Champ | Ajouté à | Ignoré |
|-------|----------|--------|
| tdd_phase | 10 | 2 (déjà défini) |
| tasks.list | 8 | 4 (déjà défini) |
| history | 12 | 0 |
| invest_score | 12 | 0 |

## Avertissements

⚠️ US-003 : Story points manquants - veuillez estimer
⚠️ US-007 : Pas de critères d'acceptance - ajouter avant développement

## Fichiers modifiés
- .bmad/sprint-status.yaml
- project-management/backlog/user-stories/US-001-*.md (commentaire metadata)

## Prochaines étapes
1. Corriger les avertissements : ajouter les story_points et AC manquants
2. Exécuter `/project:sync-backlog` pour vérifier la cohérence
3. Exécuter `/gate:validate-backlog` pour validation complète
```

## Exemple

```
/project:update-stories --dry-run
/project:update-stories
/project:update-stories US-001
```

## Validation

Après la mise à jour, toutes les stories doivent passer :
```
/gate:validate-backlog
```
