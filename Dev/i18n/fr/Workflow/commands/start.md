---
description: Préparation du Début de Sprint
argument-hint: [arguments]
---

# Préparation du Début de Sprint

Tu es un Scrum Master expérimenté. Tu dois préparer et faciliter le démarrage d'un nouveau sprint en vérifiant que toutes les conditions sont réunies.

## Arguments
$ARGUMENTS

Arguments :
- Numéro du sprint (ex: `5`)
- (Optionnel) Durée en jours (défaut: 10 jours = 2 semaines)

Exemple : `/common:sprint-start 5`

## MISSION

### Étape 1 : Vérifier les Prérequis

#### 1.1 Sprint Précédent Clôturé
```bash
# Vérifier l'état du sprint précédent
# - Sprint Review effectuée
# - Rétrospective effectuée
# - Toutes les US terminées ou reportées
```

#### 1.2 Backlog Priorisé
- Le Product Owner a priorisé le backlog
- Les US candidates sont estimées
- Les critères d'acceptance sont définis

#### 1.3 Équipe Disponible
- Disponibilités confirmées
- Congés identifiés
- Capacité calculée

### Étape 2 : Calculer la Capacité

```
══════════════════════════════════════════════════════════════
📊 CALCUL DE CAPACITÉ - Sprint {N}
══════════════════════════════════════════════════════════════

Durée du sprint : {X} jours ouvrés
Date début : {YYYY-MM-DD}
Date fin : {YYYY-MM-DD}

──────────────────────────────────────────────────────────────
👥 DISPONIBILITÉ ÉQUIPE
──────────────────────────────────────────────────────────────

| Membre | Jours dispo | Focus (%) | Capacité |
|--------|-------------|-----------|----------|
| Dev 1  | 10/10       | 80%       | 8 jours  |
| Dev 2  | 8/10        | 80%       | 6.4 jours|
| Dev 3  | 10/10       | 50%       | 5 jours  |
| Total  | -           | -         | 19.4 jours|

──────────────────────────────────────────────────────────────
📈 VÉLOCITÉ
──────────────────────────────────────────────────────────────

| Sprint | Points planifiés | Points livrés |
|--------|------------------|---------------|
| S-3    | 25               | 23            |
| S-2    | 28               | 26            |
| S-1    | 30               | 28            |
| Moyenne| 27.7             | 25.7          |

Vélocité moyenne : 26 points
Capacité ajustée : ~24 points (facteur sécurité 10%)
```

### Étape 3 : Préparer le Sprint Planning

```
══════════════════════════════════════════════════════════════
📋 SPRINT PLANNING - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 SPRINT GOAL (à définir avec le PO)
──────────────────────────────────────────────────────────────

> "{Objectif métier clair en une phrase}"

Exemple : "Les utilisateurs peuvent créer un compte et se connecter
via OAuth2 (Google, GitHub)"

──────────────────────────────────────────────────────────────
📦 USER STORIES CANDIDATES
──────────────────────────────────────────────────────────────

| Priorité | US | Titre | Points | Status |
|----------|-----|-------|--------|--------|
| 🔴 Must  | US-045 | Inscription utilisateur | 5 | Ready |
| 🔴 Must  | US-046 | Login OAuth Google | 8 | Ready |
| 🔴 Must  | US-047 | Login OAuth GitHub | 5 | Ready |
| 🟡 Should| US-048 | Reset mot de passe | 3 | Ready |
| 🟡 Should| US-049 | Page profil utilisateur | 5 | Ready |
| 🟢 Could | US-050 | Avatar personnalisé | 2 | Ready |

Total candidat : 28 points
Capacité : 24 points

──────────────────────────────────────────────────────────────
✅ DÉFINITION OF READY (vérifier pour chaque US)
──────────────────────────────────────────────────────────────

Pour chaque US sélectionnée :
- [ ] Description claire et complète
- [ ] Critères d'acceptance définis (Given/When/Then)
- [ ] Estimation en points
- [ ] Dépendances identifiées
- [ ] Maquettes/designs disponibles (si UI)
- [ ] Données de test préparées
- [ ] Pas de bloqueur technique

──────────────────────────────────────────────────────────────
📅 CÉRÉMONIES PLANIFIÉES
──────────────────────────────────────────────────────────────

| Cérémonie | Date | Heure | Durée | Lieu |
|-----------|------|-------|-------|------|
| Sprint Planning P1 | {date} | 09:00 | 2h | Salle A |
| Sprint Planning P2 | {date} | 14:00 | 2h | Salle A |
| Daily Scrum | Quotidien | 09:30 | 15min | Stand-up |
| Backlog Refinement | {date} | 14:00 | 1h | Salle B |
| Sprint Review | {date fin} | 14:00 | 2h | Salle A |
| Rétrospective | {date fin} | 16:30 | 1h30 | Salle A |
```

### Étape 4 : Créer la Structure Sprint

Créer le dossier du sprint :

```
project-management/
└── sprints/
    └── sprint-{N}-{objectif}/
        ├── sprint-goal.md
        ├── sprint-backlog.md
        ├── daily-notes/
        │   ├── {YYYY-MM-DD}.md
        │   └── ...
        ├── sprint-review.md
        └── sprint-retro.md
```

### Étape 5 : Template sprint-goal.md

```markdown
# Sprint {N} : {Objectif}

## Informations

| Attribut | Valeur |
|----------|--------|
| Numéro | {N} |
| Début | {YYYY-MM-DD} |
| Fin | {YYYY-MM-DD} |
| Durée | {X} jours |
| Capacité | {Y} points |

## Sprint Goal

> "{Objectif métier clair}"

## Definition of Done (Rappel)

- [ ] Code review approuvée (2 reviewers)
- [ ] Tests unitaires (couverture ≥ 80%)
- [ ] Tests d'intégration passent
- [ ] Documentation mise à jour
- [ ] Pas de dette technique ajoutée
- [ ] Déployable en production

## Sprint Backlog

| ID | Titre | Points | Assigné | Status |
|----|-------|--------|---------|--------|
| US-045 | Inscription utilisateur | 5 | @dev1 | 🔵 To Do |
| US-046 | Login OAuth Google | 8 | @dev2 | 🔵 To Do |
| US-047 | Login OAuth GitHub | 5 | @dev1 | 🔵 To Do |
| US-048 | Reset mot de passe | 3 | @dev3 | 🔵 To Do |

**Total engagé : 21 points**

## Dépendances

| US | Dépend de | Status |
|----|-----------|--------|
| US-046 | Config Google OAuth Console | ✅ Fait |
| US-047 | Config GitHub OAuth App | ⏳ En cours |

## Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API Google change | Faible | Moyen | Utiliser lib officielle |
| Dev2 malade | Moyenne | Moyen | @dev1 peut reprendre |

## Burndown Chart

```
Points |
  21   |████
  18   |████████
  15   |████████████
  12   |████████████████
   9   |████████████████████
   6   |████████████████████████
   3   |████████████████████████████
   0   |________________________________
       J1  J2  J3  J4  J5  J6  J7  J8  J9  J10
```

## Notes

{Notes de sprint planning, décisions prises...}
```

### Étape 6 : Checklist Finale

```
══════════════════════════════════════════════════════════════
✅ CHECKLIST DÉMARRAGE SPRINT {N}
══════════════════════════════════════════════════════════════

## Avant le Sprint Planning

- [ ] Sprint précédent officiellement terminé
- [ ] Rétrospective actions en cours
- [ ] Backlog priorisé par le PO
- [ ] US candidates estimées et "Ready"
- [ ] Capacité équipe calculée
- [ ] Salles réservées pour les cérémonies

## Pendant le Sprint Planning

### Part 1 - QUOI (avec PO)
- [ ] Sprint Goal défini et accepté
- [ ] US sélectionnées par l'équipe
- [ ] Engagement sur le scope
- [ ] Dépendances identifiées

### Part 2 - COMMENT (équipe dev)
- [ ] Découpage en tâches
- [ ] Estimation des tâches
- [ ] Assignation initiale
- [ ] Risques discutés

## Après le Sprint Planning

- [ ] Sprint backlog visible (board mis à jour)
- [ ] Daily Scrum planifié
- [ ] Outils configurés (board, branches, etc.)
- [ ] Communication équipe (canal, notifications)

══════════════════════════════════════════════════════════════
🚀 SPRINT {N} PRÊT À DÉMARRER !
══════════════════════════════════════════════════════════════
```

## Conseils Scrum

### Sprint Goal
- Une seule phrase
- Orienté valeur métier
- Mesurable
- Partagé par toute l'équipe

### Engagement vs Prévision
- L'équipe s'engage sur le Sprint Goal
- Le nombre de points est une prévision
- La confiance augmente avec l'expérience

### Focus Factor
- Équipe débutante : 50-60%
- Équipe rodée : 70-80%
- Équipe mature : 80-90%
