---
description: Valider une story contre la Definition of Done
argument-hint: <story-id>
---

# Valider Story Gate (DoD)

Valide une User Story contre les critères de la Definition of Done.
Tous les critères doivent passer pour marquer la story comme terminée.

## Arguments

$ARGUMENTS (format: <story-id>)
- **story-id** (requis) : Identifiant de la story (ex: US-001)

## Critères Definition of Done

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Tâches complètes | 20% | Oui | Toutes les tâches marquées done |
| Tests passants | 20% | Oui | Cycle TDD complet (green/refactor) |
| AC validés | 20% | Oui | Tous les critères d'acceptance validés |
| Code reviewé | 15% | Oui | Revue par les pairs terminée |
| Pas de bloquants | 10% | Oui | Pas en état bloqué |
| Documentation | 10% | Non | Docs mises à jour si nécessaire |
| Revue sécurité | 5% | Non | Implications sécurité vérifiées |

**Seuil : 100% (tous les critères requis)**

## Processus

### Étape 1 : Charger la story

1. Lire `.bmad/sprint-status.yaml`
2. Trouver la story par ID
3. Charger tous les champs de la story

### Étape 2 : Valider chaque critère

Vérifier tous les critères DoD :
- Tâches : `tasks.completed == tasks.total`
- Tests : `tdd_phase in ['green', 'refactor', 'done']`
- AC : `acceptance_criteria.validated == acceptance_criteria.total`
- Review : `status == 'review' or review.approved == true`
- Bloquants : `blocked_reason == null`

### Étape 3 : Générer le rapport

Afficher les résultats détaillés avec statut pass/fail.

## Format de sortie

### Story valide DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate : US-005
═══════════════════════════════════════════════════════

📖 US-005 : Vérification email
Statut : review → done (en attente)

Definition of Done :
──────────────────────────────────────────────────────
✅ Tâches complètes (20%)
   Toutes les tâches terminées : 4/4
   □ TASK-021 : Endpoint backend ✓
   □ TASK-022 : Service email ✓
   □ TASK-023 : Flow frontend ✓
   □ TASK-024 : Tests ✓

✅ Tests passants (20%)
   Phase TDD : refactor
   Tous les tests au vert

✅ Critères d'Acceptance (20%)
   Validés : 3/3
   ✓ AC1 : Email de vérification envoyé
   ✓ AC2 : Lien expire après 24h
   ✓ AC3 : Statut utilisateur mis à jour

✅ Code reviewé (15%)
   PR #42 approuvée par @reviewer
   Statut review : approuvé

✅ Pas de bloquants (10%)
   Aucun problème bloquant

✅ Documentation (10%)
   Docs API mises à jour

✅ Revue sécurité (5%)
   Génération token revue

Score : 100/100
──────────────────────────────────────────────────────

✅ STORY DoD GATE VALIDÉ

La story peut être transitionée vers 'done'.
Exécuter : /sprint:transition US-005 done
═══════════════════════════════════════════════════════
```

### Story échoue DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate : US-005
═══════════════════════════════════════════════════════

📖 US-005 : Vérification email
Statut : in-progress

Definition of Done :
──────────────────────────────────────────────────────
❌ Tâches complètes (20%)
   Tâches terminées : 2/4
   ✓ TASK-021 : Endpoint backend
   ✓ TASK-022 : Service email
   □ TASK-023 : Flow frontend (en cours)
   □ TASK-024 : Tests (en attente)

❌ Tests passants (20%)
   Phase TDD : red
   Les tests échouent

⚠️ Critères d'Acceptance (20%)
   Validés : 1/3
   ✓ AC1 : Email de vérification envoyé
   □ AC2 : Lien expire après 24h
   □ AC3 : Statut utilisateur mis à jour

❌ Code reviewé (15%)
   Aucune PR créée

✅ Pas de bloquants (10%)
   Aucun problème bloquant

⏳ Documentation (10%)
   Non vérifié

⏳ Revue sécurité (5%)
   Non vérifié

Score : 25/100
──────────────────────────────────────────────────────

❌ STORY DoD GATE ÉCHOUÉ

Actions requises :
──────────────────────────────────────────────────────
1. Terminer les tâches restantes
   - TASK-023 : Flow frontend
   - TASK-024 : Tests

2. Corriger les tests échouants
   Phase TDD actuelle : red
   Lancer les tests et implémenter les corrections

3. Valider les critères d'acceptance
   - Tester AC2 : Expiration du lien
   - Tester AC3 : Mise à jour statut utilisateur

4. Créer une pull request pour review
   git push && gh pr create

Travail restant estimé :
  Tâches : 2 restantes
  Cycles TDD : 2 (pour les tâches restantes)

Reprendre le travail : /sprint:dev US-005
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:validate-story US-005
/gate:validate-story US-001
```

## Guide phases TDD

| Phase | Signification | Prochaine étape |
|-------|---------------|-----------------|
| red | Tests échouent | Implémenter le code |
| green | Tests passent | Refactorer |
| refactor | Nettoyage | Terminer ou prochaine tâche |
| done | Cycle complet | Passer en review |

Mettre à jour la phase :
```
/sprint:tdd US-005 green
```

## Intégration

Ce gate est vérifié :
1. Manuellement via cette commande
2. Dans le hook Stop (quality-gate.sh)
3. Avant `/sprint:transition <id> done`

Configuration du gate : `.bmad/gates/story-gate.yaml`
