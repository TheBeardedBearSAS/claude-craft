---
description: "Exécuter toutes les stories prêtes du sprint courant"
argument-hint: "[--auto] [--dry-run]"
---

# Run Sprint

Mettre en file et exécuter toutes les stories du sprint courant qui sont prêtes pour le développement.

## Arguments

$ARGUMENTS (format: [--auto] [--dry-run])
- **--auto** (optionnel) : Démarrer le traitement immédiatement
- **--dry-run** (optionnel) : Prévisualiser le plan d'exécution sans modifications

## Mode Plan

> **Le mode plan est recommandé.** Claude active le mode plan pour structurer l'approche, identifier les dépendances et présenter une stratégie de génération avant de créer les artefacts.

## Processus

### Étape 1 : Valider le sprint

1. Exécuter `/gate:validate-sprint` pour s'assurer que le sprint est prêt
2. Si le gate échoue, afficher les problèmes et sortir
3. Obtenir les métadonnées du sprint

### Étape 2 : Collecter les stories prêtes

1. Obtenir toutes les stories avec statut `ready-for-dev`
2. Trier par priorité (si définie) ou ID
3. Calculer le total des story points

### Étape 3 : Construire le plan d'exécution

Créer une file ordonnée :
1. Analyser les dépendances entre stories
2. Construire le graphe de dépendances
3. Déterminer l'ordre d'exécution
4. Identifier les groupes parallélisables

### Étape 4 : Mettre en file les stories

Ajouter toutes les stories à `.bmad/batch-queue.yaml` avec :
- Priorité basée sur les dépendances et l'ordre
- Dépendances mappées
- Statut défini sur `pending`

### Étape 5 : Exécuter (si --auto)

Démarrer le traitement de la file :
- Séquentiel par défaut
- Utiliser `--parallel N` pour exécution parallèle
- Checkpoint après chaque story

## Format de sortie

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Sprint : sprint-3 (DRY RUN)
═══════════════════════════════════════════════════════

Sprint : sprint-3 - Gestion Utilisateurs
Période : 2026-01-29 → 2026-02-12

Sprint Gate : ✅ VALIDÉ

Stories prêtes : 5
Total Points : 21

Plan d'exécution :
──────────────────────────────────────────────────────

Phase 1 (sans dépendances) :
  📖 US-010 : Inscription utilisateur (5 pts)

Phase 2 (après US-010) :
  📖 US-011 : Connexion utilisateur (5 pts)
  📖 US-012 : Page profil (5 pts)
  📖 US-014 : Vérification email (3 pts)

Phase 3 (après US-010, US-011) :
  📖 US-013 : Réinitialisation mot de passe (3 pts)

Opportunités de parallélisation :
──────────────────────────────────────────────────────
• Phase 2 : US-011, US-012, US-014 peuvent tourner en parallèle
• Parallélisme maximum : 3 stories

Durée estimée :
──────────────────────────────────────────────────────
Séquentiel : ~3.5 heures (moy 42 min/story)
Parallèle (3) : ~2 heures

⚠️ DRY RUN - Aucune modification effectuée

Pour exécuter :
  /project:run-sprint
  /project:run-sprint --auto
  /project:run-sprint --auto --parallel 3
═══════════════════════════════════════════════════════
```

### Mise en file

```
═══════════════════════════════════════════════════════
              Run Sprint : sprint-3
═══════════════════════════════════════════════════════

Sprint : sprint-3 - Gestion Utilisateurs
Période : 2026-01-29 → 2026-02-12

Validation du sprint...
  ✅ Métadonnées sprint complètes
  ✅ Sprint goal défini
  ✅ 5 stories prêtes
  ✅ Toutes les stories estimées

Mise en file des stories...
──────────────────────────────────────────────────────
✅ US-010 : Inscription utilisateur (priorité 1)
✅ US-011 : Connexion utilisateur (priorité 2)
✅ US-012 : Page profil (priorité 3)
✅ US-013 : Réinitialisation mot de passe (priorité 4)
✅ US-014 : Vérification email (priorité 5)

Résumé de la file :
──────────────────────────────────────────────────────
Stories en file : 5
Total points : 21
Dépendances mappées : 4

File batch mise à jour : .bmad/batch-queue.yaml

Pour démarrer le traitement :
  /project:run-queue

Ou pour exécution automatique :
  /project:run-sprint --auto
═══════════════════════════════════════════════════════
```

### Exécution auto

```
═══════════════════════════════════════════════════════
              Run Sprint : sprint-3 (AUTO)
═══════════════════════════════════════════════════════

Sprint : sprint-3 - Gestion Utilisateurs

Validation... ✅
Mise en file... ✅
Démarrage de l'exécution...

──────────────────────────────────────────────────────

[1/5] US-010 : Inscription utilisateur
      ⏳ Transition vers in-progress
      🔴 TDD Red : Écriture des tests échouants
      🟢 TDD Green : Implémentation du code
      🔵 TDD Refactor : Nettoyage
      ✅ Tests passants
      👀 Prêt pour review
      ✅ Terminé

      Progression : ████░░░░░░░░░░░░░░░░ 20%

[2/5] US-011 : Connexion utilisateur
      ⏳ Transition vers in-progress
      🔴 TDD Red : Écriture des tests échouants
      ...

Progression Sprint :
──────────────────────────────────────────────────────
█████████░░░░░░░░░░░ 45%

Terminé : 2/5 stories (9/21 pts)
En cours : US-012 - Page profil
Temps écoulé : 1h 23m
Restant estimé : 1h 45m
═══════════════════════════════════════════════════════
```

### Complétion

```
═══════════════════════════════════════════════════════
              Sprint Terminé !
═══════════════════════════════════════════════════════

Sprint : sprint-3 - Gestion Utilisateurs

Résultats :
──────────────────────────────────────────────────────
✅ Terminé : 5/5 stories
📊 Points : 21/21 livrés
⏱️ Durée : 3h 18min

Résumé des stories :
| Story | Points | Durée | Statut |
|-------|--------|-------|--------|
| US-010 | 5 | 45m | ✅ done |
| US-011 | 5 | 38m | ✅ done |
| US-012 | 5 | 52m | ✅ done |
| US-013 | 3 | 28m | ✅ done |
| US-014 | 3 | 35m | ✅ done |

Quality Gates :
──────────────────────────────────────────────────────
✅ Toutes les stories ont passé la DoD
✅ Tous les tests passants
✅ Code reviewé

Statut Sprint :
──────────────────────────────────────────────────────
📋 Backlog : 3 (prochain sprint)
✅ Done : 5

🎉 Objectif du sprint atteint !

Prochaines étapes :
  /sprint:retrospective    Lancer la rétrospective
  /sprint:plan            Planifier le prochain sprint
═══════════════════════════════════════════════════════
```

## Exemple

```
/project:run-sprint --dry-run
/project:run-sprint
/project:run-sprint --auto
/project:run-sprint --auto --parallel 3
```

## Configuration

Paramètres d'exécution sprint dans `.bmad/batch-queue.yaml` :

```yaml
execution:
  mode: "sequential"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
```

## Interruption et reprise

Si interrompu (Ctrl+C ou erreur) :
```
/project:run-queue --resume
```

Le checkpoint est sauvegardé après chaque story terminée.

## Intégration

Fonctionne avec :
- `/sprint:status --bmad` - Voir la progression
- `/gate:report` - Métriques qualité
- Ralph (si configuré) - Orchestration externe
