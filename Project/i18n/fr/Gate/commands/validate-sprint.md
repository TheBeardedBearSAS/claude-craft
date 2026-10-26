---
description: Valider la préparation du sprint avant démarrage
argument-hint: "[N] [--verbose]"
---

# Valider Sprint Gate

Valide que le sprint est correctement planifié et prêt à démarrer.
Tous les critères requis doivent être remplis.

## Arguments

$ARGUMENTS (format: [N] [--verbose])
- **N** (optionnel) : numéro du sprint (`1`, `001` ou `sprint-001`) ; par défaut : `metadata.sprint_id`, sinon le dossier `project-management/sprints/sprint-*/` le plus récent
- **--verbose** (optionnel) : Afficher le détail par story

## Critères Sprint Ready

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Métadonnées Sprint | 20% | Oui | ID, nom, dates définis |
| Sprint Goal | 15% | Oui | Objectif clair défini |
| Stories prêtes | 25% | Oui | Stories en ready-for-dev |
| Stories estimées | 20% | Oui | Toutes ont des points |
| Vérification capacité | 10% | Non | Points dans la capacité |
| Dépendances résolues | 10% | Non | Pas de stories bloquées en ready |

**Seuil : Tous les critères requis**

## Processus

### Étape 1 : Charger le statut sprint

Source, dans cet ordre :

1. **`.bmad/sprint-status.yaml`** s'il existe et que son `metadata.sprint_id` correspond au sprint `N` : extraire les métadonnées et compter les stories par statut.
2. **Sinon, repli Markdown** sur `project-management/sprints/sprint-{N}-*/` (écrit par `/workflow:start`) :
   - métadonnées, objectif, capacité : `sprint-goal.md` (début, fin, capacité, objectif) ;
   - stories : la table des US sélectionnées de `sprint-goal.md` et les fiches `project-management/backlog/user-stories/US-*.md` (points, statut). Une story planifiée et non démarrée compte comme `ready-for-dev` ;
   - dépendances bloquantes : `sprint-dependencies.md`.
3. Aucun des deux : échouer avec « Aucun sprint {N} : lancez `/workflow:start {N}` ».

En repli, le gate est quand même évalué, mais le rapport ajoute un avertissement non bloquant : les commandes `/sprint:*` ont besoin de `.bmad/sprint-status.yaml`, lancez `/workflow:start {N}` ou `/project:migrate-backlog`.

### Étape 2 : Valider les métadonnées

Vérifier les champs requis :
- `metadata.sprint_id` - Identifiant du sprint
- `metadata.name` - Nom du sprint
- `metadata.start_date` - Date de début
- `metadata.end_date` - Date de fin
- `metadata.goal` - Objectif du sprint (min 10 caractères)

### Étape 3 : Valider les stories

Vérifier la préparation des stories :
- Au moins 1 story en `ready-for-dev`
- Toutes les stories ont des story points
- Pas de stories bloquées en statut ready

### Étape 4 : Vérification capacité optionnelle

Si `metadata.capacity_points` défini :
- Somme des points stories ready ≤ capacité + 20%

### Étape 5 : Générer le rapport

Afficher le statut de préparation du sprint.
Commencer le rapport par la source utilisée : `Source : .bmad/sprint-status.yaml` ou `Source : Markdown (project-management/sprints/sprint-{N}-*/)`.

## Format de sortie

### Sprint prêt

```
═══════════════════════════════════════════════════════
           Validation Sprint Ready Gate
═══════════════════════════════════════════════════════

Sprint : sprint-3 - Gestion Utilisateurs
Période : 2026-01-29 → 2026-02-12 (14 jours)

Résultats de validation :
──────────────────────────────────────────────────────
✅ Métadonnées Sprint (20%)
   ID : sprint-3
   Nom : Gestion Utilisateurs
   Début : 2026-01-29
   Fin : 2026-02-12

✅ Sprint Goal (15%)
   "Implémenter les fonctionnalités de gestion utilisateur
    incluant inscription, connexion et gestion de profil"

✅ Stories prêtes (25%)
   5 stories en statut ready-for-dev
   Total points : 21

✅ Stories estimées (20%)
   Les 8 stories ont des story points

✅ Vérification capacité (10%)
   Planifié : 21 points
   Capacité : 25 points
   Utilisation : 84%

✅ Dépendances résolues (10%)
   Aucune story bloquée en statut ready

Score : 100/100
──────────────────────────────────────────────────────

✅ SPRINT READY GATE VALIDÉ

Le sprint peut être démarré.

Stories prêtes :
  📖 US-010 : Inscription utilisateur (5 pts)
  📖 US-011 : Connexion utilisateur (5 pts)
  📖 US-012 : Page profil (5 pts)
  📖 US-013 : Réinitialisation mot de passe (3 pts)
  📖 US-014 : Vérification email (3 pts)

Commandes :
  /workflow:start           Démarrer le sprint
  /sprint:next-story     Prendre la première story
═══════════════════════════════════════════════════════
```

### Sprint non prêt

```
═══════════════════════════════════════════════════════
           Validation Sprint Ready Gate
═══════════════════════════════════════════════════════

Sprint : (non configuré)

Résultats de validation :
──────────────────────────────────────────────────────
❌ Métadonnées Sprint (20%)
   Manquant : sprint_id
   Manquant : start_date
   Manquant : end_date

❌ Sprint Goal (15%)
   Manquant : Aucun objectif défini

⚠️ Stories prêtes (25%)
   Seulement 1 story en ready-for-dev
   Recommandé : au moins 3 stories

❌ Stories estimées (20%)
   3 stories sans story points :
   - US-010 : Inscription utilisateur
   - US-012 : Page profil
   - US-015 : Page paramètres

⏳ Vérification capacité (10%)
   Ignoré : Pas de capacité définie

⚠️ Dépendances résolues (10%)
   1 story ready est bloquée :
   - US-011 : Bloquée par API externe

Score : 35/100
──────────────────────────────────────────────────────

❌ SPRINT READY GATE ÉCHOUÉ

Actions requises :
──────────────────────────────────────────────────────
1. Configurer les métadonnées du sprint
   Éditer .bmad/sprint-status.yaml :
   ```yaml
   metadata:
     sprint_id: "sprint-3"
     name: "Gestion Utilisateurs"
     start_date: "2026-01-29"
     end_date: "2026-02-12"
     goal: "Implémenter les fonctionnalités de gestion utilisateur"
   ```

2. Définir l'objectif du sprint
   Ajouter un objectif clair et mesurable

3. Estimer les stories manquantes
   /project:update-story US-010 --points 5
   /project:update-story US-012 --points 5
   /project:update-story US-015 --points 3

4. Résoudre les stories bloquées
   US-011 bloquée par : dépendance API externe
   Options :
   - Retirer du sprint
   - Débloquer la dépendance
   - Réordonner les stories

Relancer : /gate:validate-sprint
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:validate-sprint
/gate:validate-sprint --verbose
```

## Configuration Sprint

Configurer le sprint dans `.bmad/sprint-status.yaml` :

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "Gestion Utilisateurs"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implémenter les fonctionnalités de gestion utilisateur"
  capacity_points: 25  # Optionnel : capacité de l'équipe
```

Configuration du gate : `.bmad/gates/sprint-ready-gate.yaml`
