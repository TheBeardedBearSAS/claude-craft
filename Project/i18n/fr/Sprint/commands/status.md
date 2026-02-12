---
description: Statut du Sprint
argument-hint: [arguments]
---

# Statut du Sprint

Afficher les métriques détaillées et l'état d'avancement du sprint.

## Arguments

$ARGUMENTS (optionnel, format: [sprint N])
- **sprint N** (optionnel): Numéro du sprint
- Si non spécifié, affiche le sprint actuel

## Processus

### Étape 1: Identifier le sprint

1. Trouver le sprint demandé ou le sprint actuel
2. Lire le sprint-goal.md

### Étape 2: Collecter les données

1. Lire toutes les User Stories du sprint
2. Lire toutes les Tasks associées
3. Calculer les métriques

### Étape 3: Générer le rapport

Créer un rapport détaillé avec:
- Vue d'ensemble
- Progression par US
- Métriques de temps
- Burndown chart (texte)
- Bloqueurs
- Risques

## Format de Sortie

```
╔══════════════════════════════════════════════════════════════════╗
║  📊 SPRINT 1 - STATUS REPORT                                     ║
║  Generated: 2024-01-22 14:30                                     ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│ 🎯 SPRINT GOAL                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Walking Skeleton - Authentification complète et première page    │
│ Période: 2024-01-15 → 2024-01-29 (Jour 8/14)                    │
└──────────────────────────────────────────────────────────────────┘

══════════════════════════════════════════════════════════════════════════
📈 VUE D'ENSEMBLE

Progression globale:
██████████████░░░░░░░░░░░░░░░░░░ 45%

│ Métrique          │ Actuel │ Cible  │ Status │
├───────────────────┼────────┼────────┼────────┤
│ Points complétés  │ 5      │ 10     │ 🟡 50% │
│ Tasks terminées   │ 8      │ 16     │ 🟡 50% │
│ Heures réalisées  │ 28h    │ 62h    │ 🟡 45% │
│ Jours restants    │ 6      │ -      │        │

══════════════════════════════════════════════════════════════════════════
📖 PROGRESSION PAR USER STORY

│ US      │ Nom                │ Points │ Tasks    │ Statut          │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-001  │ Login utilisateur  │ 5      │ 6/10     │ 🟡 In Progress  │
│         │                    │        │ 60%      │ ██████░░░░      │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-002  │ Liste produits     │ 5      │ 2/6      │ 🔴 To Do        │
│         │                    │        │ 33%      │ ███░░░░░░░      │

══════════════════════════════════════════════════════════════════════════
⏱️ MÉTRIQUES DE TEMPS

Estimé vs Réel (heures):
│ Type    │ Estimé │ Réel   │ Écart  │
├─────────┼────────┼────────┼────────┤
│ [DB]    │ 6h     │ 5.5h   │ -0.5h  │ ✅
│ [BE]    │ 20h    │ 12h    │ -      │ 🟡 En cours
│ [FE-WEB]│ 12h    │ 3h     │ -      │ 🟡 En cours
│ [FE-MOB]│ 14h    │ 0h     │ -      │ ⏸️ Bloqué
│ [TEST]  │ 10h    │ 7.5h   │ -2.5h  │ ✅ Sous-estimé

Vélocité journalière: 4h/jour (cible: 4.4h/jour)

══════════════════════════════════════════════════════════════════════════
📉 BURNDOWN (simplifié)

Heures restantes par jour:
62h │████████████████████████████████████████████████████████████████
    │█████████████████████████████████████████████████████░░░░░░░░░░░
    │██████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ← Idéal
34h │████████████████████████████████████████████████ ← Actuel
    └───────────────────────────────────────────────────────────────
    J1  J2  J3  J4  J5  J6  J7  J8  J9  J10 J11 J12 J13 J14

Status: 🟡 Légèrement en retard (6h)

══════════════════════════════════════════════════════════════════════════
⚠️ BLOQUEURS

│ Task     │ US     │ Bloqueur                    │ Depuis │
├──────────┼────────┼─────────────────────────────┼────────┤
│ TASK-008 │ US-001 │ En attente API auth         │ 2 jours│
│ TASK-021 │ US-002 │ Config SMTP manquante       │ 1 jour │

Impact: 14h bloquées (22% du sprint)

══════════════════════════════════════════════════════════════════════════
🚨 RISQUES

│ Niveau │ Description                           │ Mitigation              │
├────────┼───────────────────────────────────────┼─────────────────────────┤
│ 🔴 High│ Mobile bloqué depuis 2 jours          │ Prioriser TASK-005      │
│ 🟡 Med │ Retard de 6h sur la trajectoire       │ Overtime possible       │
│ 🟢 Low │ Tests sous-estimés                    │ Ajouter buffer sprint 2 │

══════════════════════════════════════════════════════════════════════════
📋 ACTIONS RECOMMANDÉES

1. 🔴 URGENT: Débloquer TASK-008 en terminant TASK-005
2. 🟡 Configurer SMTP pour débloquer TASK-021
3. 🟢 Revoir estimations tests pour prochains sprints

══════════════════════════════════════════════════════════════════════════

Actions:
  /project:board                    # Voir le Kanban
  /project:move-task TASK-XXX done  # Terminer une task
  /project:list-tasks status blocked # Voir tous les bloqueurs
```

## Exemples

```
# Statut du sprint actuel
/sprint:status

# Statut du sprint 2
/sprint:status sprint 2
```

## Génération de rapport

Le rapport est également sauvegardé dans:
`project-management/sprints/sprint-XXX/status-YYYY-MM-DD.md`
