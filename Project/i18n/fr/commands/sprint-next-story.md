---
description: Obtenir la prochaine story prête pour développement
argument-hint: [--claim]
---

# Sprint Next Story

Trouver et optionnellement prendre la prochaine story prête pour développement dans le sprint.

## Arguments

$ARGUMENTS (format: [--claim])
- **--claim** (optionnel) : Transitionner automatiquement la story vers in-progress

## Processus

### Étape 1 : Charger le statut sprint

1. Lire `.bmad/sprint-status.yaml`
2. Obtenir toutes les stories avec statut `ready-for-dev`
3. Trier par priorité (si définie) ou par ID

### Étape 2 : Vérifier les prérequis

Pour chaque story ready, vérifier :
- [ ] Pas de dépendances bloquantes
- [ ] Story points estimés
- [ ] Tâches décomposées
- [ ] Critères d'acceptance définis

### Étape 3 : Sélectionner la prochaine story

Ordre de priorité :
1. Stories sans dépendances bloquantes
2. ID story plus bas (plus tôt dans le backlog)
3. Story points plus bas (plus simple en premier)

### Étape 4 : Afficher les détails de la story

Afficher les informations complètes :
- ID et titre
- Story points
- Association à l'Epic
- Résumé des critères d'acceptance
- Aperçu de la liste des tâches
- Notes ou contexte éventuels

### Étape 5 : Prendre la story (si --claim)

Si le flag `--claim` est défini :
1. Transitionner la story vers `in-progress`
2. Définir `tdd_phase` sur `red`
3. Définir `current_task` sur la première tâche
4. Enregistrer la transition dans l'historique

### Étape 6 : Fournir les instructions

Afficher les prochaines étapes :
- Première tâche à travailler
- Rappel du workflow TDD
- Commandes associées

## Format de sortie

```
═══════════════════════════════════════════════════════
              Prochaine Story Prête pour Dev
═══════════════════════════════════════════════════════

📖 US-012 : Implémenter la page profil utilisateur
   Epic : EPIC-003 (Gestion Utilisateurs)
   Points : 5
   Priorité : Haute

Description :
──────────────────────────────────────────────────────
En tant qu'utilisateur inscrit
Je veux voir et modifier mon profil
Afin de garder mes informations à jour

Critères d'Acceptance (3) :
──────────────────────────────────────────────────────
□ AC1 : L'utilisateur peut voir ses informations de profil
□ AC2 : L'utilisateur peut modifier son nom et email
□ AC3 : Les modifications sont validées avant sauvegarde

Tâches (4) :
──────────────────────────────────────────────────────
□ TASK-031 [BE] Créer l'endpoint API profil
□ TASK-032 [BE] Ajouter la validation du profil
□ TASK-033 [FE] Créer le composant profil
□ TASK-034 [FE] Ajouter la validation du formulaire

Prérequis :
──────────────────────────────────────────────────────
✅ Pas de dépendances bloquantes
✅ Story points estimés
✅ Tâches décomposées
✅ Critères d'acceptance définis

Pour commencer à travailler :
──────────────────────────────────────────────────────
/sprint:transition US-012 in-progress

Ou utiliser : /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Aucune story disponible

```
═══════════════════════════════════════════════════════
              Aucune Story Prête pour Dev
═══════════════════════════════════════════════════════

📋 Statut du backlog :
   - 3 stories dans le backlog (besoin de refinement)
   - 2 stories en cours
   - 1 story bloquée

Suggestions :
──────────────────────────────────────────────────────
1. Affiner les stories du backlog : /project:update-stories
2. Aider sur les stories en cours
3. Débloquer US-003 : en attente des credentials API

Commandes :
  /sprint:bmad-status    Voir le statut complet du sprint
  /gate:validate-backlog Vérifier la préparation des stories
═══════════════════════════════════════════════════════
```

## Exemple

```
/sprint:next-story
/sprint:next-story --claim
```

## Workflow TDD

Après avoir pris une story :
1. 🔴 RED : Écrire un test échouant pour le premier AC/tâche
2. 🟢 GREEN : Implémenter le code minimum pour faire passer
3. 🔵 REFACTOR : Nettoyer en gardant les tests au vert
4. Répéter pour chaque tâche

Utiliser `/sprint:tdd-cycle` pour suivre les transitions de phase.
