---
description: Migrer le backlog existant vers le format BMAD v6
argument-hint: [--dry-run] [--force]
---

# Migrer le Backlog

Convertir le backlog existant vers le format BMAD v6 avec suivi sprint-status.yaml.

## Arguments

$ARGUMENTS (format: [--dry-run] [--force])
- **--dry-run** (optionnel): Aperçu des changements sans les appliquer
- **--force** (optionnel): Écraser les fichiers BMAD existants

## Prérequis

Exécuter `/project:analyze-backlog` d'abord pour comprendre la structure actuelle.

## Processus

### Étape 1: Valider les prérequis

1. Vérifier que le répertoire `.bmad/` existe (créer si nécessaire)
2. Vérifier l'existence de `sprint-status.yaml` (avertir si existe et pas de --force)
3. Vérifier que l'analyse du backlog a été effectuée

### Étape 2: Créer la structure BMAD

```
.bmad/
├── sprint-status.yaml       # Fichier principal de suivi
├── batch-queue.yaml         # File d'attente de traitement batch
├── gates/                   # Configurations des quality gates
├── hooks/                   # Hooks Claude Code
└── lib/                     # Scripts utilitaires
```

### Étape 3: Parser le backlog existant

Pour chaque User Story trouvée:
1. Extraire toutes les métadonnées
2. Parser les critères d'acceptation (format Gherkin)
3. Identifier les tâches associées
4. Déterminer le statut actuel
5. Calculer le pourcentage de complétion

### Étape 4: Générer sprint-status.yaml

Transformer chaque story au format BMAD v6:

```yaml
stories:
  US-001:
    title: "Connexion utilisateur"
    status: "in-progress"
    previous_status: "ready-for-dev"
    assigned_to: ""
    tdd_phase: "red"
    current_task: "TASK-001"
    story_points: 5
    epic_id: "EPIC-001"
    tasks:
      total: 4
      completed: 2
      list:
        - id: "TASK-001"
          title: "Endpoint backend auth"
          status: "in-progress"
    history:
      - timestamp: "2026-01-29T10:00:00Z"
        from: "backlog"
        to: "in-progress"
        by: "migration"
```

### Étape 5: Mapping des statuts

| Original | Statut BMAD v6 |
|----------|----------------|
| 🔴 À faire | backlog |
| 🟡 En cours | in-progress |
| 🟢 Terminé | done |
| ⏸️ Bloqué | blocked |
| Assigné Sprint-X | ready-for-dev |

### Étape 6: Initialiser la phase TDD

Définir la phase TDD initiale selon la complétion des tâches:
- 0% tâches terminées → `red`
- 1-99% tâches terminées → `green`
- 100% tâches terminées → `refactor` ou `done`

### Étape 7: Créer une sauvegarde (sauf --dry-run)

1. Copier le backlog existant vers `.bmad/backup/`
2. Horodater la sauvegarde
3. Logger l'emplacement de la sauvegarde

### Étape 8: Appliquer la migration (sauf --dry-run)

1. Écrire `sprint-status.yaml`
2. Mettre à jour les fichiers de story avec les métadonnées BMAD
3. Créer `.bmad/migration-log.md`

## Format de Sortie

```
🔄 Migration BMAD v6
====================

## Vérification Préalable
✅ Emplacement backlog: project-management/backlog/
✅ Répertoire BMAD: .bmad/ (créé)
✅ Pas de sprint-status.yaml existant

## Résumé de Migration

### Stories Migrées: {NOMBRE}
| ID | Titre | Statut | Phase TDD |
|----|-------|--------|-----------|
| US-001 | Connexion | in-progress | green |

### Tâches Migrées: {NOMBRE}
### Critères d'Acceptation: {NOMBRE}

## Fichiers Créés
- .bmad/sprint-status.yaml
- .bmad/batch-queue.yaml
- .bmad/backup/backlog-2026-01-29.tar.gz

## Étapes Suivantes
1. Vérifier sprint-status.yaml
2. Exécuter `/sprint:status` pour vérifier
3. Configurer les métadonnées du sprint
```

## Exemple

```
/project:migrate-backlog --dry-run
/project:migrate-backlog
/project:migrate-backlog --force
```
