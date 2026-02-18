---
description: Exécuter toutes les stories d'un epic en batch
argument-hint: <epic-id> [--dry-run]
---

# Run Epic

Mettre en file d'attente et traiter toutes les stories d'un epic en mode batch.

## Arguments

$ARGUMENTS (format: <epic-id> [--dry-run])
- **epic-id** (requis) : Identifiant de l'epic (ex: EPIC-001)
- **--dry-run** (optionnel) : Prévisualiser sans exécuter

## Mode Plan

> **Le mode plan est recommandé.** Claude active le mode plan pour structurer l'approche, identifier les dépendances et présenter une stratégie de génération avant de créer les artefacts.

## Processus

### Étape 1 : Identifier les stories de l'epic

1. Lire `.bmad/sprint-status.yaml`
2. Trouver toutes les stories avec `epic_id` correspondant à l'argument
3. Trier par priorité ou ID

### Étape 2 : Vérifier la préparation des stories

Pour chaque story, vérifier :
- La story existe et a les champs requis
- Pas déjà terminée
- Pas bloquée (ou signaler pour revue)

### Étape 3 : Construire la file d'exécution

Créer une file priorisée :
1. Stories sans dépendances en premier
2. ID plus bas = priorité plus haute
3. Respecter la priorité explicite si définie

### Étape 4 : Ajouter à la file batch

Mettre à jour `.bmad/batch-queue.yaml` :
```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-002"
    priority: 2
    dependencies: ["US-001"]
```

### Étape 5 : Exécuter (sauf --dry-run)

Pour chaque story dans l'ordre :
1. Transitionner vers in-progress
2. Exécuter le workflow de développement
3. Exécuter les quality gates
4. Transitionner à travers les états
5. Checkpoint après chaque

## Format de sortie

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Epic : EPIC-002 (DRY RUN)
═══════════════════════════════════════════════════════

Epic : EPIC-002 - Gestion Utilisateurs
Stories : 5

Plan d'exécution :
──────────────────────────────────────────────────────
[1] US-010 : Inscription utilisateur (5 pts)
    Statut : ready-for-dev → in-progress → review → done
    Dépendances : aucune

[2] US-011 : Connexion utilisateur (5 pts)
    Statut : ready-for-dev → in-progress → review → done
    Dépendances : US-010

[3] US-012 : Page profil (5 pts)
    Statut : ready-for-dev → in-progress → review → done
    Dépendances : US-010

[4] US-013 : Réinitialisation mot de passe (3 pts)
    Statut : ready-for-dev → in-progress → review → done
    Dépendances : US-010, US-011

[5] US-014 : Vérification email (3 pts)
    Statut : ready-for-dev → in-progress → review → done
    Dépendances : US-010

Total Points : 21

Ordre d'exécution (respect des dépendances) :
  1. US-010 (pas de deps)
  2. US-011, US-012, US-014 (parallèle après US-010)
  3. US-013 (après US-010, US-011)

Workflow estimé par story :
  • Transition vers in-progress
  • Cycles TDD (red → green → refactor)
  • Code review
  • Validation quality gate
  • Transition vers done

⚠️ DRY RUN - Aucune modification effectuée

Exécuter sans --dry-run pour lancer.
═══════════════════════════════════════════════════════
```

### Exécution

```
═══════════════════════════════════════════════════════
              Run Epic : EPIC-002
═══════════════════════════════════════════════════════

Epic : EPIC-002 - Gestion Utilisateurs
Mode : Séquentiel
Stories : 5

Mise en file des stories...
──────────────────────────────────────────────────────
✅ Ajouté US-010 (priorité 1)
✅ Ajouté US-011 (priorité 2, dépend de US-010)
✅ Ajouté US-012 (priorité 3, dépend de US-010)
✅ Ajouté US-013 (priorité 4, dépend de US-010, US-011)
✅ Ajouté US-014 (priorité 5, dépend de US-010)

Statut de la file :
──────────────────────────────────────────────────────
⏳ En attente : 5
🔄 En cours : 0
✅ Terminé : 0
❌ Échoué : 0

Prochaines étapes :
──────────────────────────────────────────────────────
Exécuter la file :
  /project:run-queue

Ou traiter automatiquement :
  /project:run-queue --auto

Surveiller la progression :
  /project:batch-status
═══════════════════════════════════════════════════════
```

## Exemple

```
/project:run-epic EPIC-002 --dry-run
/project:run-epic EPIC-002
```

## Exécution parallèle

Pour les stories indépendantes, activer le mode parallèle :
```
/project:run-queue --parallel 3
```

Cela traite jusqu'à 3 stories simultanément quand elles n'ont pas de dépendances.

## Reprise

Si l'exécution est interrompue :
```
/project:run-queue --resume
```

Continue depuis le dernier checkpoint.

## Intégration avec Ralph

Si Ralph est configuré, l'exécution batch s'intègre :
```yaml
# ralph.yml
bmad_integration:
  enabled: true
  batch_queue_file: ".bmad/batch-queue.yaml"
```
