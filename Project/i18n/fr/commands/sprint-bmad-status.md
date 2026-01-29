---
description: Afficher le statut du sprint BMAD avec informations de routage
argument-hint: [--verbose]
---

# Statut Sprint BMAD

Afficher le statut complet du sprint utilisant le suivi BMAD v6 avec routage basé sur la machine d'états.

## Arguments

$ARGUMENTS (format: [--verbose])
- **--verbose** (optionnel): Afficher le détail des tâches par story

## Processus

### Étape 1: Charger sprint-status.yaml

1. Lire `.bmad/sprint-status.yaml`
2. Parser métadonnées, stories, règles de routage
3. Si fichier inexistant, suggérer `/project:migrate-backlog`

### Étape 2: Extraire les métadonnées

Afficher les informations du sprint:
- ID et nom du sprint
- Dates de début et fin
- Objectif du sprint
- Jours restants

### Étape 3: Compter les stories par statut

Agréger les stories par état:
- 📋 Backlog
- 🎯 Prêt pour Dev
- 🔄 En Cours
- 👀 Revue
- ✅ Terminé
- ⛔ Bloqué

Calculer:
- Total des points de story planifiés
- Points de story complétés
- Vélocité (si historique disponible)
- Progression burndown

### Étape 4: Afficher la machine d'états

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

### Étape 5: Afficher la vue détaillée (si --verbose)

Pour chaque story:
- ID et titre
- Statut actuel et phase TDD
- Détail des tâches (complétées/total)
- Statut des critères d'acceptation
- Tâche en cours
- Temps dans le statut actuel

### Étape 6: Suggestions d'auto-routage

Vérifier si des transitions automatiques devraient se produire:
- Stories avec toutes les tâches complètes → suggérer passage en revue
- Stories débloquées → suggérer reprise du statut précédent

## Format de Sortie

```
═══════════════════════════════════════════════════════
                  Statut Sprint BMAD
═══════════════════════════════════════════════════════

Sprint: {SPRINT_ID} - {NOM_SPRINT}
Période: {DATE_DEBUT} → {DATE_FIN} ({JOURS_RESTANTS} jours restants)
Objectif: {OBJECTIF_SPRINT}

Progression: ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 40% (24/60 pts)

Stories par Statut:
──────────────────────────────────────────────────────
📋 Backlog:       2
🎯 Prêt pour Dev: 3
🔄 En Cours:      2
👀 Revue:         1
✅ Terminé:       4
⛔ Bloqué:        1

En Cours:
──────────────────────────────────────────────────────
🔄 US-005: Authentification utilisateur
   TDD: 🟢 Green | Tâches: 3/5 | CA: 1/3
   En cours: TASK-015 - Implémenter validation JWT

Bloqué:
──────────────────────────────────────────────────────
⛔ US-003: Intégration OAuth
   Raison: En attente des credentials API
   Bloqué depuis: 2026-01-27 (2 jours)

Suggestions d'auto-routage:
──────────────────────────────────────────────────────
💡 US-008 a toutes ses tâches complètes → /sprint:transition US-008 review

Commandes:
  /sprint:next-story         Prendre la prochaine story
  /sprint:transition <ID>    Changer le statut
  /sprint:auto-route        Appliquer les transitions auto
═══════════════════════════════════════════════════════
```

## Exemple

```
/sprint:bmad-status
/sprint:bmad-status --verbose
```
