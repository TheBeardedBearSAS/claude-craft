---
description: Exécuter les règles de routage automatique pour les transitions de stories
argument-hint: [--dry-run]
---

# Sprint Auto Route

Exécuter les règles de routage automatique pour transitionner les stories en fonction de leur état actuel et métriques de complétion.

## Arguments

$ARGUMENTS (format: [--dry-run])
- **--dry-run** (optionnel) : Prévisualiser les transitions sans les appliquer

## Processus

### Étape 1 : Charger le statut sprint

1. Lire `.bmad/sprint-status.yaml`
2. Charger les règles de routage depuis `routing.auto_transitions.rules`
3. Obtenir toutes les stories

### Étape 2 : Évaluer les règles

Pour chaque story, évaluer toutes les règles de routage :

**Règle : all_tasks_complete**
```yaml
when: "tasks.completed == tasks.total && tasks.total > 0"
from: "in-progress"
to: "review"
```

**Règle : review_approved**
```yaml
when: "review.approved == true"
from: "review"
to: "done"
```

**Règle : blocked_detection**
```yaml
when: "blocked_reason != null"
from: "*"
to: "blocked"
```

**Règle : unblocked**
```yaml
when: "blocked_reason == null && previous_status != null"
from: "blocked"
to: "previous_status"
```

### Étape 3 : Vérifier les prérequis

Avant l'auto-transition, vérifier :
- Exigences du gate pour le statut cible
- Pas de règles conflictuelles
- Story pas verrouillée manuellement

### Étape 4 : Exécuter les transitions (sauf --dry-run)

Pour chaque règle déclenchée :
1. Logger la transition
2. Mettre à jour le statut
3. Enregistrer dans l'historique avec `by: "auto-route"`
4. Appliquer les effets secondaires (phase TDD, etc.)

### Étape 5 : Rapporter les résultats

Afficher :
- Nombre de règles évaluées
- Transitions effectuées
- Stories inchangées
- Erreurs ou avertissements éventuels

## Format de sortie

### Dry Run

```
═══════════════════════════════════════════════════════
           Prévisualisation Auto-Route (DRY RUN)
═══════════════════════════════════════════════════════

Évaluation de 4 règles de routage contre 8 stories...

Transitionnerait :
──────────────────────────────────────────────────────
📖 US-005 : Authentification utilisateur
   Règle : all_tasks_complete
   in-progress → review
   Raison : 5/5 tâches terminées

📖 US-008 : Vérification email
   Règle : all_tasks_complete
   in-progress → review
   Raison : 3/3 tâches terminées

📖 US-003 : Intégration OAuth
   Règle : unblocked
   blocked → in-progress
   Raison : blocked_reason effacé

Résumé :
──────────────────────────────────────────────────────
Règles évaluées : 4
Stories vérifiées : 8
Transitionnerait : 3
Pas de changement nécessaire : 5

Exécuter sans --dry-run pour appliquer les transitions.
═══════════════════════════════════════════════════════
```

### Transitions appliquées

```
═══════════════════════════════════════════════════════
              Résultats Auto-Route
═══════════════════════════════════════════════════════

Évaluation de 4 règles de routage contre 8 stories...

Transitions appliquées :
──────────────────────────────────────────────────────
✅ US-005 : in-progress → review
   Règle : all_tasks_complete
   Tâches : 5/5 terminées

✅ US-008 : in-progress → review
   Règle : all_tasks_complete
   Tâches : 3/3 terminées

✅ US-003 : blocked → in-progress
   Règle : unblocked
   Statut précédent restauré

Résumé :
──────────────────────────────────────────────────────
Règles évaluées : 4
Stories vérifiées : 8
Transitionnées : 3
Pas de changement nécessaire : 5

Statut sprint mis à jour. Exécuter /sprint:bmad-status pour voir.
═══════════════════════════════════════════════════════
```

### Aucune transition nécessaire

```
═══════════════════════════════════════════════════════
              Résultats Auto-Route
═══════════════════════════════════════════════════════

Évaluation de 4 règles de routage contre 8 stories...

Aucune transition automatique nécessaire.
──────────────────────────────────────────────────────
Toutes les stories sont dans des états appropriés selon
leurs métriques de complétion actuelles.

Stories par statut :
  📋 Backlog : 2
  🎯 Ready : 3
  🔄 En cours : 2 (tâches en attente)
  ✅ Done : 1
═══════════════════════════════════════════════════════
```

## Exemple

```
/sprint:auto-route --dry-run
/sprint:auto-route
```

## Règles personnalisées

Ajouter des règles personnalisées dans `.bmad/sprint-status.yaml` :

```yaml
routing:
  auto_transitions:
    enabled: true
    rules:
      # Règle personnalisée : story trop longtemps en review
      - name: "review_timeout"
        description: "Signaler les stories en review > 2 jours"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify

      # Règle personnalisée : priorité haute en premier
      - name: "priority_bump"
        description: "Auto-assigner les stories haute priorité"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

## Intégration

L'auto-route peut être déclenché :
1. Manuellement via cette commande
2. Automatiquement dans le hook Stop
3. Après complétion d'une tâche
4. Au démarrage de session (configurable)

Configurer dans `.bmad/sprint-status.yaml` :
```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
```
