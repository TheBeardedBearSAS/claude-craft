# Ajouter une User Story

Créer une nouvelle User Story et l'associer à un EPIC.

## Arguments

$ARGUMENTS (format: EPIC-XXX "Nom de la US" [points])
- **EPIC-ID** (obligatoire): ID de l'EPIC parent (ex: EPIC-001)
- **Nom** (obligatoire): Titre de la User Story
- **Points** (optionnel): Story points en Fibonacci (1, 2, 3, 5, 8)

## Processus

### Étape 1: Analyse des arguments

Extraire depuis $ARGUMENTS:
- L'ID de l'EPIC
- Le nom de la User Story
- Les story points (si fournis)

### Étape 2: Valider l'EPIC

1. Vérifier que l'EPIC existe dans `project-management/backlog/epics/`
2. Si non trouvé, afficher une erreur avec les EPICs disponibles

### Étape 3: Générer l'ID

1. Lire les fichiers dans `project-management/backlog/user-stories/`
2. Trouver le dernier ID utilisé (format US-XXX)
3. Incrémenter pour obtenir le nouvel ID

### Étape 4: Collecter les informations

Demander à l'utilisateur:
- **Persona**: Qui est l'utilisateur? (P-XXX ou description)
- **Action**: Que veut-il faire?
- **Bénéfice**: Pourquoi le veut-il?
- **Critères d'acceptation**: Au moins 2 en format Gherkin
- **Points**: Si non fournis, estimer (Fibonacci: 1, 2, 3, 5, 8)

### Étape 5: Créer le fichier

1. Utiliser le template `Scrum/templates/user-story.md`
2. Remplacer les placeholders:
   - `{ID}`: ID généré
   - `{NOM}`: Nom de la US
   - `{EPIC_ID}`: ID de l'EPIC parent
   - `{SPRINT}`: "Backlog" (non assigné)
   - `{POINTS}`: Story points
   - `{PERSONA}`: Persona identifié
   - `{PERSONA_ID}`: ID du persona
   - `{ACTION}`: Action souhaitée
   - `{BENEFICE}`: Bénéfice attendu
   - `{DATE}`: Date du jour (YYYY-MM-DD)

3. Ajouter les critères d'acceptation en format Gherkin

4. Créer le fichier: `project-management/backlog/user-stories/US-{ID}-{slug}.md`

### Étape 6: Mettre à jour l'EPIC

1. Lire le fichier de l'EPIC
2. Ajouter la US dans la table des User Stories
3. Mettre à jour la progression
4. Sauvegarder

### Étape 7: Mettre à jour l'index

1. Lire `project-management/backlog/index.md`
2. Ajouter la US dans la section "Backlog Priorisé"
3. Mettre à jour les compteurs
4. Sauvegarder

## Format de Sortie

```
✅ User Story créée avec succès!

📖 US-{ID}: {NOM}
   EPIC: {EPIC_ID}
   Statut: 🔴 To Do
   Points: {POINTS}
   Fichier: project-management/backlog/user-stories/US-{ID}-{slug}.md

Prochaines étapes:
  /project:move-story US-{ID} sprint-X    # Assigner à un sprint
  /project:add-task US-{ID} "[BE] ..." 4h # Ajouter des tâches
```

## Exemple

```
/project:add-story EPIC-001 "Login utilisateur" 5
```

Crée:
- `project-management/backlog/user-stories/US-001-login-utilisateur.md`

## Validation INVEST

Vérifier que la US respecte INVEST:
- **I**ndépendante: Peut être développée seule
- **N**égociable: Les détails peuvent être discutés
- **V**aluable: Apporte de la valeur au persona
- **E**stimable: Peut être estimée (points fournis)
- **S**mall: ≤ 8 points (sinon suggérer de découper)
- **T**estable: A des critères d'acceptation clairs
