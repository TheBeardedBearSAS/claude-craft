---
description: Transitionner une story vers un nouveau statut
argument-hint: <story-id> <statut-cible>
---

# Sprint Transition

Transitionner une story vers un nouveau statut avec validation et suivi de l'historique.

## Arguments

$ARGUMENTS (format: <story-id> <statut-cible>)
- **story-id** (requis) : Identifiant de la story (ex: US-001)
- **statut-cible** (requis) : Statut cible

Statuts valides :
- `backlog` - Story dans le product backlog
- `ready-for-dev` - Affinée et prête pour développement
- `in-progress` - En cours de développement
- `review` - Code terminé, en attente de review
- `done` - Definition of Done atteinte
- `blocked` - Bloquée par un facteur externe

## Processus

### Étape 1 : Valider que la story existe

1. Lire `.bmad/sprint-status.yaml`
2. Trouver la story par ID
3. Obtenir le statut actuel

### Étape 2 : Valider la transition

Vérifier les règles de la machine à états :
```
Transitions autorisées :
  backlog → ready-for-dev
  ready-for-dev → in-progress
  in-progress → review
  review → done
  review → in-progress (changements demandés)
  * → blocked (tout état peut être bloqué)
  blocked → previous_status (reprendre)
```

### Étape 3 : Vérifier les exigences du gate

Avant de transitionner, vérifier les exigences du gate :

**→ ready-for-dev**
- [ ] Critères d'acceptance définis
- [ ] Story points estimés
- [ ] Tâches décomposées

**→ in-progress**
- [ ] Pas de dépendances bloquantes
- [ ] Développeur assigné (optionnel)

**→ review**
- [ ] Toutes les tâches terminées
- [ ] Tests passants (TDD green ou refactor)
- [ ] Code poussé

**→ done**
- [ ] Code reviewé
- [ ] Tous les AC validés
- [ ] Checklist DoD complète

**→ blocked**
- Fournir blocked_reason

### Étape 4 : Exécuter la transition

1. Stocker le statut précédent
2. Mettre à jour le champ statut
3. Définir les timestamps
4. Mettre à jour la phase TDD si applicable
5. Enregistrer dans l'historique

### Étape 5 : Effets secondaires

Selon la transition :

**→ in-progress**
- Définir `tdd_phase` sur `red`
- Définir `current_task` sur la première tâche

**→ review**
- Définir `tdd_phase` sur `refactor`
- Vider `current_task`

**→ done**
- Vider `tdd_phase`
- Enregistrer le temps de complétion

**→ blocked**
- Stocker `blocked_reason`
- Stocker `previous_status` pour reprise

### Étape 6 : Mettre à jour l'historique

Ajouter une entrée :
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "Toutes les tâches terminées"
```

## Format de sortie

### Transition réussie

```
═══════════════════════════════════════════════════════
              Transition Story
═══════════════════════════════════════════════════════

📖 US-005 : Authentification utilisateur

Statut : in-progress → review ✅

Vérifications du gate :
──────────────────────────────────────────────────────
✅ Toutes les tâches terminées (5/5)
✅ Tests passants
✅ Code poussé

Historique mis à jour :
──────────────────────────────────────────────────────
• 2026-01-29 10:00 - in-progress → review (manuel)
• 2026-01-27 09:00 - ready-for-dev → in-progress
• 2026-01-25 14:00 - backlog → ready-for-dev

Prochaines étapes :
──────────────────────────────────────────────────────
La story est maintenant en review. Assigner un reviewer ou exécuter :
  /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Gate échoué

```
═══════════════════════════════════════════════════════
              Transition Bloquée
═══════════════════════════════════════════════════════

📖 US-005 : Authentification utilisateur

Demandé : in-progress → review ❌

Échecs du gate :
──────────────────────────────────────────────────────
❌ Tâches incomplètes : 3/5
❌ Phase TDD est 'red' - les tests doivent passer d'abord

Actions requises :
──────────────────────────────────────────────────────
1. Terminer les tâches restantes :
   □ TASK-015 : Implémenter la validation JWT
   □ TASK-016 : Ajouter le support refresh token

2. Passer la phase TDD à green :
   /sprint:tdd green

Puis réessayer : /sprint:transition US-005 review
═══════════════════════════════════════════════════════
```

### Transition invalide

```
═══════════════════════════════════════════════════════
              Transition Invalide
═══════════════════════════════════════════════════════

📖 US-005 : Authentification utilisateur

Actuel : in-progress
Demandé : done ❌

Invalide : Impossible de transitionner directement de 'in-progress' à 'done'

Transitions valides depuis 'in-progress' :
──────────────────────────────────────────────────────
• review - Code terminé, prêt pour review
• blocked - Story bloquée

Machine à états :
  backlog → ready-for-dev → in-progress → review → done
═══════════════════════════════════════════════════════
```

## Exemple

```
/sprint:transition US-005 review
/sprint:transition US-003 blocked "En attente des credentials API"
/sprint:transition US-003 in-progress  # Reprendre depuis blocked
```

## Cas spéciaux

### Bloquer une story
```
/sprint:transition US-003 blocked "En attente API externe"
```
Stocke la raison et préserve le statut précédent pour reprise.

### Débloquer une story
```
/sprint:transition US-003 in-progress
```
Lors de la transition depuis blocked, retourne au statut précédent.

### Demander des changements en review
```
/sprint:transition US-005 in-progress
```
Transition inverse valide depuis review pour traiter le feedback.
