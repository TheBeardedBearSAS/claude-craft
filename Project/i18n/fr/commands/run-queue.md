---
description: "Traiter la file batch de stories"
argument-hint: "[--parallel N] [--auto] [--resume]"
---

# Run Queue

Traiter les stories dans la file batch séquentiellement ou en parallèle.

## Arguments

$ARGUMENTS (format: [--parallel N] [--auto] [--resume])
- **--parallel N** (optionnel) : Traiter N stories en parallèle. Défaut : 1 (séquentiel)
- **--auto** (optionnel) : Démarrer le traitement immédiatement sans confirmation
- **--resume** (optionnel) : Reprendre depuis le dernier checkpoint

## Mode Plan

> **Le mode plan est recommandé.** Claude active le mode plan pour structurer l'approche, identifier les dépendances et présenter une stratégie de génération avant de créer les artefacts.

## Processus

### Étape 1 : Charger la file

1. Lire `.bmad/batch-queue.yaml`
2. Obtenir toutes les stories avec statut `pending`
3. Trier par priorité

### Étape 2 : Vérifier les dépendances

Pour chaque story :
- Vérifier si les dépendances sont terminées
- Ignorer si bloquée par une story en attente
- Signaler si bloquée par une story en échec

### Étape 3 : Traiter les stories

Pour chaque story éligible :
1. Marquer comme `running`
2. Définir le timestamp `started_at`
3. Exécuter le workflow de développement :
   - Transition vers in-progress
   - Cycle TDD (red → green → refactor)
   - Exécuter les tests
   - Code review
   - Validation quality gate
4. Marquer comme `completed` ou `failed`
5. Mettre à jour le checkpoint

### Étape 4 : Gérer les échecs

Si une story échoue :
- Marquer comme `failed` avec message d'erreur
- Vérifier le paramètre `resume_on_failure`
- Continuer ou arrêter selon la config

### Étape 5 : Rapporter les résultats

Afficher le statut final et les métriques.

## Format de sortie

### Traitement

```
═══════════════════════════════════════════════════════
              Traitement de la File Batch
═══════════════════════════════════════════════════════

Mode : Séquentiel
File : 5 en attente

Traitement :
──────────────────────────────────────────────────────

[1/5] US-010 : Inscription utilisateur
      Démarrage... ✅
      TDD Red → Green → Refactor ✅
      Tests passants ✅
      Quality gate ✅
      Terminé en 45 min

      Checkpoint sauvegardé.

[2/5] US-011 : Connexion utilisateur
      Démarrage... ✅
      TDD Red → Green → Refactor ✅
      Tests passants ✅
      Quality gate ✅
      Terminé en 38 min

      Checkpoint sauvegardé.

[3/5] US-012 : Page profil
      Démarrage... ✅
      TDD Red... 🔄 en cours

      (Ctrl+C pour pause, reprendra depuis le checkpoint)
```

### Terminé

```
═══════════════════════════════════════════════════════
              File Batch Terminée
═══════════════════════════════════════════════════════

Résultats :
──────────────────────────────────────────────────────
✅ Terminé : 5
❌ Échoué : 0
⏭️ Ignoré : 0

Stories traitées :
| Story | Statut | Durée |
|-------|--------|-------|
| US-010 | ✅ done | 45 min |
| US-011 | ✅ done | 38 min |
| US-012 | ✅ done | 52 min |
| US-013 | ✅ done | 28 min |
| US-014 | ✅ done | 35 min |

Temps total : 3h 18min
Moyenne par story : 40 min

Statut Sprint :
──────────────────────────────────────────────────────
📋 Backlog : 2
🎯 Ready : 0
🔄 En cours : 0
👀 Review : 0
✅ Done : 8

Commandes :
  /sprint:status --bmad    Voir le statut mis à jour
  /gate:report          Rapport qualité
═══════════════════════════════════════════════════════
```

### Avec échecs

```
═══════════════════════════════════════════════════════
              File Batch Interrompue
═══════════════════════════════════════════════════════

Résultats :
──────────────────────────────────────────────────────
✅ Terminé : 3
❌ Échoué : 1
⏭️ Ignoré : 1 (dépendance échouée)

Détails de l'échec :
──────────────────────────────────────────────────────
❌ US-012 : Page profil
   Erreur : Tests échouants dans ProfileController
   Phase TDD : red
   Dernier checkpoint : TASK-033

   Stack trace :
   AssertionError: Expected 200, got 401
   at ProfileControllerTest.testGetProfile

Actions :
──────────────────────────────────────────────────────
1. Corriger le test échouant
2. Reprendre le traitement :
   /project:run-queue --resume

Ou réinitialiser et réessayer :
   /project:queue-reset US-012
   /project:run-queue
═══════════════════════════════════════════════════════
```

### Mode parallèle

```
═══════════════════════════════════════════════════════
              Traitement de la File Batch
═══════════════════════════════════════════════════════

Mode : Parallèle (3 workers)
File : 5 en attente

Traitement :
──────────────────────────────────────────────────────

Worker 1 : US-010 - Inscription utilisateur 🔄
Worker 2 : (en attente des dépendances)
Worker 3 : (en attente des dépendances)

[10:05] US-010 démarré
[10:08] US-010 : Phase TDD Green
[10:12] US-010 : Tests passants
[10:15] US-010 terminé ✅

[10:15] Dépendances résolues, démarrage batch parallèle :
Worker 1 : US-011 - Connexion utilisateur 🔄
Worker 2 : US-012 - Page profil 🔄
Worker 3 : US-014 - Vérification email 🔄

[10:20] US-014 terminé ✅
[10:22] US-011 terminé ✅
Worker 3 : US-013 - Réinit mot de passe 🔄 (deps: US-010, US-011 ✅)
[10:25] US-012 terminé ✅
[10:30] US-013 terminé ✅

Tous les workers terminés.
═══════════════════════════════════════════════════════
```

## Exemple

```
/project:run-queue
/project:run-queue --auto
/project:run-queue --parallel 3
/project:run-queue --resume
```

## Configuration

Paramètres de la file dans `.bmad/batch-queue.yaml` :

```yaml
execution:
  mode: "sequential"  # ou "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600

settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

## Checkpoints

Les checkpoints sont sauvegardés après chaque story :
```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

Reprendre depuis le checkpoint :
```
/project:run-queue --resume
```
