---
description: Afficher le statut de la file de traitement batch
argument-hint: [--history]
---

# Batch Status

Afficher le statut actuel de la file de traitement batch.

## Arguments

$ARGUMENTS (format: [--history])
- **--history** (optionnel) : Afficher l'historique des stories terminées/échouées

## Processus

### Étape 1 : Charger la file

1. Lire `.bmad/batch-queue.yaml`
2. Parser les entrées de la file
3. Charger les données de checkpoint

### Étape 2 : Catégoriser les stories

Grouper par statut :
- `pending` - En attente de traitement
- `running` - En cours de traitement
- `completed` - Terminé avec succès
- `failed` - Erreur rencontrée
- `skipped` - Ignoré suite à un échec de dépendance

### Étape 3 : Afficher l'état de la file

Afficher le statut actuel de la file avec détails.

### Étape 4 : Afficher l'historique (si demandé)

Afficher les stories terminées et échouées avec timing.

## Format de sortie

### File active

```
═══════════════════════════════════════════════════════
              Statut File Batch
═══════════════════════════════════════════════════════

Mode : Séquentiel
Checkpoint : US-011 (2026-01-29 10:45:00)

Résumé de la file :
──────────────────────────────────────────────────────
⏳ En attente : 3
🔄 En cours :   1
✅ Terminé :    2
❌ Échoué :     0
⏭️ Ignoré :     0

Total : 6 stories

En cours :
──────────────────────────────────────────────────────
🔄 US-012 : Page profil
   Priorité : 3
   Démarré : 2026-01-29 10:45:00 (il y a 15 min)
   Phase TDD : green
   Tâche : 2/4

En attente :
──────────────────────────────────────────────────────
[4] US-013 : Réinitialisation mot de passe
    Dépendances : US-010 ✅, US-011 ✅

[5] US-014 : Vérification email
    Dépendances : US-010 ✅

[6] US-015 : Page paramètres
    Dépendances : aucune

Progression :
──────────────────────────────────────────────────────
██████████░░░░░░░░░░ 50% (3/6 stories)

Fin estimée : ~1h 30m
═══════════════════════════════════════════════════════
```

### Avec historique

```
═══════════════════════════════════════════════════════
              Statut File Batch
═══════════════════════════════════════════════════════

Mode : Séquentiel
Dernier checkpoint : US-014

Résumé de la file :
──────────────────────────────────────────────────────
⏳ En attente : 0
🔄 En cours :   0
✅ Terminé :    5
❌ Échoué :     1
⏭️ Ignoré :     1

Historique des terminés :
──────────────────────────────────────────────────────
| Story | Démarré | Terminé | Durée |
|-------|---------|---------|-------|
| US-010 | 10:00 | 10:42 | 42m |
| US-011 | 10:42 | 11:18 | 36m |
| US-012 | 11:18 | 12:05 | 47m |
| US-014 | 12:05 | 12:38 | 33m |
| US-015 | 12:38 | 13:10 | 32m |

Échoués :
──────────────────────────────────────────────────────
❌ US-013 : Réinitialisation mot de passe
   Démarré : 12:05
   Échoué : 12:22
   Durée : 17m
   Erreur : Assertion test échouée dans PasswordResetTest
   Phase TDD : red

Ignorés :
──────────────────────────────────────────────────────
⏭️ US-016 : Panel admin
   Raison : Dépend de US-013 qui a échoué

Statistiques :
──────────────────────────────────────────────────────
Temps total : 3h 10m
Moyenne par story : 38m
Taux de succès : 83% (5/6)
Points terminés : 18/21

Actions :
──────────────────────────────────────────────────────
Pour réessayer les stories échouées :
  /project:queue-retry US-013

Pour vider la file :
  /project:queue-clear
═══════════════════════════════════════════════════════
```

### File vide

```
═══════════════════════════════════════════════════════
              Statut File Batch
═══════════════════════════════════════════════════════

La file est vide.

Aucune story n'est actuellement en file de traitement.

Pour ajouter des stories :
  /project:run-epic EPIC-001    Mettre un epic en file
  /project:run-sprint           Mettre les stories du sprint en file

Ou ajouter une story individuelle :
  .bmad/lib/batch-executor.sh add US-001
═══════════════════════════════════════════════════════
```

## Exemple

```
/project:batch-status
/project:batch-status --history
```

## Gestion de la file

### Ajouter une story à la file
```bash
.bmad/lib/batch-executor.sh add US-001 1
```

### Réessayer une story échouée
```
/project:queue-retry US-013
```

### Vider la file
```
/project:queue-clear --force
```

### Reprendre depuis le checkpoint
```
/project:run-queue --resume
```

## Configuration

Fichier de la file : `.bmad/batch-queue.yaml`

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```
