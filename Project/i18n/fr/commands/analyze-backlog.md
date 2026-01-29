---
description: Analyser la structure du backlog existant pour migration BMAD
argument-hint: [--format json|yaml|md]
---

# Analyser le Backlog

Analyser la structure actuelle du backlog pour préparer la migration vers BMAD v6.

## Arguments

$ARGUMENTS (format: [--format format_sortie])
- **--format** (optionnel): Format de sortie (json, yaml, md). Défaut: md

## Processus

### Étape 1: Détecter l'emplacement du backlog

Rechercher les fichiers de backlog dans les emplacements courants:
1. `project-management/backlog/` (standard claude-craft)
2. `docs/backlog/` (alternatif)
3. `backlog/` (simple)
4. `.bmad/` (si déjà migré)

### Étape 2: Analyser la structure

Pour chaque emplacement trouvé, identifier:
- **Epics**: Fichiers correspondant à `EPIC-*.md`
- **User Stories**: Fichiers correspondant à `US-*.md`
- **Tâches**: Fichiers correspondant à `TASK-*.md`
- **Fichiers index**: `index.md`, `backlog.md`

### Étape 3: Parser les métadonnées

Pour chaque fichier, extraire:
- ID (EPIC-XXX, US-XXX, TASK-XXX)
- Titre/Nom
- Statut (🔴 À faire, 🟡 En cours, 🟢 Terminé, ⏸️ Bloqué)
- Assignation sprint
- Points de story (pour US)
- Relations parent (US → EPIC, TASK → US)

### Étape 4: Valider la conformité INVEST

Pour chaque User Story, vérifier:
- [ ] **I**ndépendante: Pas de dépendances bloquantes
- [ ] **N**égociable: A une description (pas juste un titre)
- [ ] **V**alorisable: A un énoncé de bénéfice/valeur
- [ ] **E**stimable: A des points de story
- [ ] **S**uffisamment petite: ≤ 8 points
- [ ] **T**estable: A des critères d'acceptation

Score: 0-6 critères passés.

### Étape 5: Identifier les lacunes de migration

Vérifier la compatibilité BMAD v6:
- [ ] Suivi de phase TDD (red/green/refactor)
- [ ] Liste de tâches avec suivi de complétion
- [ ] Historique des statuts
- [ ] Assignation sprint
- [ ] État de validation des critères d'acceptation

### Étape 6: Générer le rapport de compatibilité

Créer un rapport avec:
1. **Résumé**: Total epics, stories, tâches trouvées
2. **Structure**: Organisation actuelle des fichiers
3. **Scores INVEST**: Conformité par story
4. **Lacunes**: Champs BMAD v6 manquants
5. **Recommandations**: Actions suggérées

## Format de Sortie

```
📊 Rapport d'Analyse du Backlog
===============================

## Résumé
- Emplacement: project-management/backlog/
- Format: Markdown (standard claude-craft)
- Epics: {NOMBRE}
- User Stories: {NOMBRE}
- Tâches: {NOMBRE}

## Conformité INVEST

| Story ID | Titre | Score | Manquant |
|----------|-------|-------|----------|
| US-001 | Connexion | 5/6 | Estimable |
| US-002 | Inscription | 6/6 | - |

Score INVEST moyen: {MOY}/6

## Recommandations

1. ⚠️ {NOMBRE} stories sans points de story
2. ✅ Structure compatible avec BMAD v6
3. 📝 Exécuter `/project:migrate-backlog` pour migrer
```

## Exemple

```
/project:analyze-backlog
/project:analyze-backlog --format yaml
```

## Étapes Suivantes

Après l'analyse:
- `/project:migrate-backlog` - Convertir au format BMAD v6
- `/project:update-stories` - Ajouter les champs manquants
- `/project:sync-backlog` - Synchroniser avec sprint-status.yaml
