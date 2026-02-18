---
description: Ajouter une Task
argument-hint: [arguments]
---

# Ajouter une Task

Créer une nouvelle tâche technique et l'associer à une User Story.

## Arguments

$ARGUMENTS (format: US-XXX "[TYPE] Description" estimation)
- **US-ID** (obligatoire): ID de la User Story parent (ex: US-001)
- **Description** (obligatoire): Description avec type entre crochets
- **Estimation** (obligatoire): Estimation en heures (ex: 4h, 2h, 0.5h)

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Types de Tâches

| Type | Préfixe | Description |
|------|---------|-------------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, Integration, E2E |
| Documentation | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

## Processus

### Étape 1: Analyse des arguments

Extraire depuis $ARGUMENTS:
- L'ID de la User Story
- Le type (entre crochets)
- La description
- L'estimation en heures

### Étape 2: Valider la User Story

1. Vérifier que la US existe dans `project-management/backlog/user-stories/`
2. Récupérer le sprint assigné (si applicable)
3. Si US non trouvée, afficher une erreur

### Étape 3: Valider l'estimation

- Minimum: 0.5h
- Maximum: 8h
- Idéal: 2-4h
- Si > 8h, suggérer de découper la tâche

### Étape 4: Générer l'ID

1. Trouver le dernier ID de tâche utilisé
2. Incrémenter pour obtenir le nouvel ID

### Étape 5: Créer le fichier

1. Utiliser le template `Scrum/templates/task.md`
2. Remplacer les placeholders:
   - `{ID}`: ID généré
   - `{DESCRIPTION}`: Description courte
   - `{US_ID}`: ID de la User Story
   - `{TYPE}`: Type de tâche
   - `{ESTIMATION}`: Estimation en heures
   - `{DATE}`: Date du jour (YYYY-MM-DD)
   - `{DESCRIPTION_DETAILLEE}`: Description détaillée

3. Déterminer le chemin:
   - Si US dans un sprint: `project-management/sprints/sprint-XXX/tasks/TASK-{ID}.md`
   - Sinon: `project-management/backlog/tasks/TASK-{ID}.md`

### Étape 6: Mettre à jour la User Story

1. Lire le fichier de la US
2. Ajouter la tâche dans la table des Tasks
3. Mettre à jour la progression
4. Sauvegarder

### Étape 7: Mettre à jour le board (si sprint)

Si la US est dans un sprint:
1. Lire `project-management/sprints/sprint-XXX/board.md`
2. Ajouter la tâche dans "🔴 To Do"
3. Mettre à jour les métriques
4. Sauvegarder

## Format de Sortie

```
✅ Tâche créée avec succès!

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Type: {TYPE}
   Statut: 🔴 To Do
   Estimation: {ESTIMATION}h
   Fichier: {CHEMIN}

Prochaines étapes:
  /project:move-task TASK-{ID} in-progress  # Commencer la tâche
  /project:board                             # Voir le Kanban
```

## Exemples

```
# Tâche backend
/project:add-task US-001 "[BE] API endpoint login" 4h

# Tâche base de données
/project:add-task US-001 "[DB] Entity User avec champs email/password" 2h

# Tâche frontend mobile
/project:add-task US-001 "[FE-MOB] Screen login avec validation" 6h

# Tâche test
/project:add-task US-001 "[TEST] Tests unitaires AuthService" 3h
```

## Validation

- [ ] Le type est valide (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- [ ] L'estimation est entre 0.5h et 8h
- [ ] La User Story existe
- [ ] L'ID est unique
