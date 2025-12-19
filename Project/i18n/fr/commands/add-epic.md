---
description: Ajouter un EPIC
argument-hint: [arguments]
---

# Ajouter un EPIC

Créer un nouvel EPIC dans le backlog.

## Arguments

$ARGUMENTS (format: "Nom de l'EPIC" [priorité])
- **Nom** (obligatoire): Titre de l'EPIC
- **Priorité** (optionnel): High, Medium, Low (défaut: Medium)

## Processus

### Étape 1: Analyse des arguments

Extraire:
- Le nom de l'EPIC depuis $ARGUMENTS
- La priorité (si fournie, sinon Medium)

### Étape 2: Générer l'ID

1. Lire les fichiers dans `project-management/backlog/epics/`
2. Trouver le dernier ID utilisé (format EPIC-XXX)
3. Incrémenter pour obtenir le nouvel ID

### Étape 3: Collecter les informations

Demander à l'utilisateur (si non fourni):
- Description de l'EPIC
- MMF (Minimum Marketable Feature)
- Objectifs business (2-3 points)
- Critères de succès

### Étape 4: Créer le fichier

1. Utiliser le template `Scrum/templates/epic.md`
2. Remplacer les placeholders:
   - `{ID}`: ID généré
   - `{NOM}`: Nom de l'EPIC
   - `{PRIORITE}`: Priorité choisie
   - `{MINIMUM_MARKETABLE_FEATURE}`: MMF
   - `{DESCRIPTION}`: Description
   - `{DATE}`: Date du jour (YYYY-MM-DD)
   - `{OBJECTIF_1}`, `{OBJECTIF_2}`: Objectifs business
   - `{CRITERE_1}`, `{CRITERE_2}`: Critères de succès

3. Créer le fichier: `project-management/backlog/epics/EPIC-{ID}-{slug}.md`

### Étape 5: Mettre à jour l'index

1. Lire `project-management/backlog/index.md`
2. Ajouter l'EPIC dans la table des EPICs
3. Mettre à jour les compteurs du résumé
4. Sauvegarder

## Format de Sortie

```
✅ EPIC créé avec succès!

📋 EPIC-{ID}: {NOM}
   Statut: 🔴 To Do
   Priorité: {PRIORITE}
   Fichier: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Prochaines étapes:
  /project:add-story EPIC-{ID} "Nom de la User Story"
```

## Exemple

```
/project:add-epic "Système d'authentification" High
```

Crée:
- `project-management/backlog/epics/EPIC-001-systeme-authentification.md`

## Validation

- [ ] Le nom est non vide
- [ ] La priorité est valide (High/Medium/Low)
- [ ] Le répertoire `project-management/backlog/epics/` existe
- [ ] L'ID est unique
