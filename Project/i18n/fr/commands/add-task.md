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

1. Utiliser le template `.claude/templates/project/task.md`
2. Remplacer les placeholders:
   - `{ID}`: ID généré
   - `{DESCRIPTION}`: Description courte
   - `{US_ID}`: ID de la User Story
   - `{TYPE}`: Type de tâche
   - `{ESTIMATION}`: Estimation en heures
   - `{DATE}`: Date du jour (YYYY-MM-DD)
   - `{DESCRIPTION_DETAILLEE}`: Description détaillée

3. Déterminer le chemin:
   - Si US dans un sprint: `project-management/sprints/sprint-{N}-{slug}/tasks/TASK-{ID}.md`
   - Sinon: `project-management/backlog/tasks/TASK-{ID}.md`

### Étape 5b: Enregistrer la tâche dans `.bmad/sprint-status.yaml`

Le fichier tâche ne contient que du contenu. Le statut vit dans `.bmad/sprint-status.yaml` (source unique de vérité), selon le schéma de `.claude/templates/project/sprint-status.md` :

1. Créer `.bmad/sprint-status.yaml` à partir du squelette de `/workflow:init` s'il est absent
2. Ajouter `TASK-{ID}` à `stories.{US_ID}.tasks.list`
3. Définir `stories.{US_ID}.tasks.status.TASK-{ID}: to-do`
4. Mettre à jour `stories.{US_ID}.tasks.total` (et garder `completed` = nombre de tâches `done`)

### Étape 6: Mettre à jour la User Story

1. Lire le fichier de la US
2. Ajouter la tâche dans la table des Tasks (sans colonne statut)
3. Mettre à jour la progression
4. Sauvegarder

### Étape 7: Mettre à jour le board (si sprint)

Si la US est dans un sprint:
1. Lire `project-management/sprints/sprint-{N}-{slug}/board.md`
2. Le régénérer depuis `.bmad/sprint-status.yaml` (le board est une vue générée ; la tâche apparaît à l'état `to-do`)
3. Mettre à jour les métriques
4. Sauvegarder

## Format de Sortie

```
✅ Tâche créée avec succès!

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Type: {TYPE}
   Statut: to-do (.bmad/sprint-status.yaml)
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
