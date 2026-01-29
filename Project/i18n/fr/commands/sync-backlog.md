---
description: Synchroniser les fichiers backlog avec sprint-status.yaml
argument-hint: [--direction source] [--dry-run]
---

# Sync Backlog

Synchronisation bidirectionnelle entre les fichiers markdown du backlog et sprint-status.yaml.

## Arguments

$ARGUMENTS (format: [--direction source] [--dry-run])
- **--direction** (optionnel) : Direction de synchronisation
  - `files-to-yaml` : Mettre à jour sprint-status.yaml depuis les fichiers markdown
  - `yaml-to-files` : Mettre à jour les fichiers markdown depuis sprint-status.yaml
  - `bidirectional` : Fusionner les deux (défaut, le plus récent gagne)
- **--dry-run** (optionnel) : Prévisualiser les changements sans les appliquer

## Processus

### Étape 1 : Charger les deux sources

1. Parser `.bmad/sprint-status.yaml`
2. Parser tous les fichiers story du répertoire backlog
3. Construire la map de comparaison par story ID

### Étape 2 : Détecter les conflits

Pour chaque story, comparer :
- Statut
- Comptage de tâches terminées
- Validation des critères d'acceptance
- Phase TDD
- Assignation

Détection des conflits :
```yaml
conflicts:
  US-001:
    field: status
    yaml_value: "in-progress"
    file_value: "🟢 Done"
    yaml_timestamp: "2026-01-29T09:00:00Z"
    file_timestamp: "2026-01-29T10:00:00Z"
    resolution: "file"  # le plus récent gagne
```

### Étape 3 : Résoudre les conflits

Stratégies de résolution :
1. **newest-wins** (défaut) : Utiliser la valeur la plus récemment modifiée
2. **yaml-wins** : Toujours préférer sprint-status.yaml
3. **files-win** : Toujours préférer les fichiers markdown
4. **prompt** : Demander à l'utilisateur pour chaque conflit

### Étape 4 : Sync fichiers → YAML

Mettre à jour sprint-status.yaml avec :
- Nouvelles stories trouvées dans les fichiers
- Changements de statut depuis les fichiers
- Mises à jour des tâches depuis les fichiers
- Validation AC depuis les fichiers

### Étape 5 : Sync YAML → fichiers

Mettre à jour les fichiers markdown avec :
- Phase TDD (ajouter au commentaire metadata)
- Historique (ajouter au commentaire metadata)
- Score INVEST (ajouter au commentaire metadata)
- Timestamp de synchronisation

### Étape 6 : Gérer les orphelins

- **Stories dans YAML mais pas dans les fichiers** : Marquer comme `archived` ou avertir
- **Stories dans les fichiers mais pas dans YAML** : Ajouter à sprint-status.yaml

### Étape 7 : Mettre à jour les timestamps

Ajouter le timestamp de dernière sync aux deux :
- `.bmad/sprint-status.yaml` : `last_sync: "2026-01-29T10:00:00Z"`
- Fichiers story : `<!-- last_sync: 2026-01-29T10:00:00Z -->`

## Format de sortie

```
🔄 Synchronisation du Backlog
==============================

## Direction : Bidirectionnelle

## Changements détectés

### Fichiers → YAML (4 changements)
| Story | Champ | Ancien | Nouveau |
|-------|-------|--------|---------|
| US-001 | status | in-progress | done |
| US-002 | tasks.completed | 2 | 3 |

### YAML → Fichiers (2 changements)
| Story | Champ | Ancien | Nouveau |
|-------|-------|--------|---------|
| US-003 | tdd_phase | - | green |
| US-004 | invest_score | - | 5/6 |

## Conflits résolus

| Story | Champ | Résolution | Valeur |
|-------|-------|------------|--------|
| US-005 | status | newest-wins | done |

## Orphelins

### Dans YAML uniquement (archivés) :
- US-010 : "Ancienne fonctionnalité" (archivé le 2026-01-15)

### Dans fichiers uniquement (ajoutés au YAML) :
- US-015 : "Nouvelle fonctionnalité"

## Synchronisation terminée

✅ sprint-status.yaml mis à jour
✅ 12 fichiers story mis à jour
⏰ Dernière sync : 2026-01-29T10:00:00Z

## Prochaines étapes
- Vérifier les changements dans git diff
- Exécuter `/sprint:status` pour vérifier
```

## Sortie Dry Run

```
🔄 Synchronisation du Backlog (DRY RUN)
========================================

⚠️ Aucune modification ne sera effectuée

## Changerait :

### sprint-status.yaml
- US-001.status : "in-progress" → "done"
- US-002.tasks.completed : 2 → 3

### Fichiers Story
- US-003 : Ajouter metadata tdd_phase
- US-004 : Ajouter metadata invest_score

Exécuter sans --dry-run pour appliquer les changements.
```

## Exemple

```
/project:sync-backlog
/project:sync-backlog --direction files-to-yaml
/project:sync-backlog --direction yaml-to-files --dry-run
```

## Automatisation

Ajouter au hook pre-commit pour synchronisation automatique :
```bash
# .bmad/hooks/pre-commit.sh
/project:sync-backlog --direction files-to-yaml
```
