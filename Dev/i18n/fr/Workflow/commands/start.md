---
description: "Préparation du début de sprint : dossier de sprint, entrées sprint-status.yaml et décomposition en tâches"
argument-hint: "<N> [--tasks-only]"
---

# Préparation du Début de Sprint

Tu es un Scrum Master et Tech Lead expérimenté. Tu dois préparer et faciliter le démarrage d'un nouveau sprint : vérifier les conditions, créer le dossier du sprint, enregistrer le sprint dans `.bmad/sprint-status.yaml` et décomposer les stories en tâches (Sprint Planning Partie 2, « Le Comment »).

## Usage

| Invocation | Ce que ça fait | Remplace |
|------------|----------------|----------|
| `/workflow:start <N>` | Démarrage complet : prérequis, capacité, planning, `project-management/sprints/sprint-{N}-{slug}/` (sprint-goal.md, sprint-dependencies.md, board.md, `tasks/TASK-*.md`), sprint et stories écrits dans `.bmad/sprint-status.yaml`, tâches enregistrées | anciennes étapes de démarrage de sprint (retirées en 9.0) |
| `/workflow:start <N> --tasks-only` | Décompose en tâches les stories d'un sprint **existant** (Étapes 7 à 9 uniquement, sauter les Étapes 1 à 6) | `/workflow:start <N>` |

## Arguments
$ARGUMENTS

Arguments :
- Numéro du sprint (ex : `5`, `005`) ; s'il est absent, demander quel sprint démarrer
- (Optionnel) Durée en jours (défaut : 10 jours = 2 semaines)
- `--tasks-only` : décompose uniquement en tâches les stories d'un sprint existant

Exemples : `/workflow:start 5`, `/workflow:start 5 --tasks-only`

> **Le Plan Mode est obligatoire pour la décomposition** (Étape 7) : analyser le code impacté, proposer le découpage en tâches et attendre la validation avant d'écrire des fichiers.

> **Le statut vit dans `.bmad/sprint-status.yaml`** (schéma : `.claude/templates/project/sprint-status.md`), jamais dans le markdown. Les fichiers de sprint, de tâches et de board ne contiennent que du contenu.

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

Créer le dossier du sprint (templates dans `.claude/templates/project/`) :

```
project-management/
└── sprints/
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md
        ├── sprint-dependencies.md
        ├── board.md                  # vue Kanban unique, contenu seul
        ├── tasks/
        │   ├── README.md             # vue d'ensemble : tâches groupées par US
        │   ├── TASK-001.md           # un fichier par tâche (.claude/templates/project/task.md)
        │   └── ...
        ├── daily-notes/
        │   └── {YYYY-MM-DD}.md
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

### Étape 6 : Synchroniser `.bmad/sprint-status.yaml`

`/gate:check sprint` et `/workflow:implement` lisent le sprint dans `.bmad/sprint-status.yaml`. L'écrire maintenant à partir du `sprint-goal.md` ci-dessus et des fiches US sélectionnées (`project-management/backlog/user-stories/US-*.md`) :

1. Créer `.bmad/` s'il n'existe pas.
2. `metadata` : `sprint_id` (`sprint-{N}`), `name`, `start_date`, `end_date`, `goal`, `capacity_points`, repris de `sprint-goal.md`.
3. `stories` : une entrée par US sélectionnée : `title`, `status: ready-for-dev`, `story_points`, `epic_id`, `priority` (MoSCoW), `dependencies`, `tasks`, `history: []`.
4. Fichier déjà présent pour le **même** `sprint_id` : conserver les statuts existants (ne jamais faire reculer une story) et n'ajouter que les nouvelles US.
5. Fichier présent pour un **autre** sprint : déplacer d'abord ses stories sous `archived_sprints.<ancien sprint_id>` (`status`, `points`), puis écrire le nouveau sprint.

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "Gestion des utilisateurs"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Les utilisateurs peuvent s'inscrire, se connecter et modifier leur profil"
  capacity_points: 21
stories:
  US-010:
    title: "Inscription utilisateur"
    status: "ready-for-dev"
    story_points: 5
    epic_id: "EPIC-002"
    priority: "must"
    dependencies: ["US-001"]
    tasks: { total: 0, completed: 0, list: [] }
    history: []
archived_sprints:
  sprint-1:
    stories:
      US-001: { status: "done", points: 5 }
```

### Étape 7 : Décomposer les Stories en Tâches

Lire `sprint-goal.md`, `sprint-dependencies.md` et chaque US référencée dans `project-management/backlog/user-stories/` (avec `--tasks-only`, commencer ici). Adapter les types de tâches à la stack réelle du projet (lire `CLAUDE.md` / `.claude/rules/`) ; le tableau ci-dessous est un exemple typique.

| Couche | Préfixe | Tâches typiques |
|--------|---------|-----------------|
| Base de données | `[DB]` | Entité, migration, repository, fixtures |
| Backend | `[BE]` | Service, ressource API, DTO, processor, voter |
| Frontend Web | `[FE-WEB]` | Contrôleur, template, composant |
| Frontend Mobile | `[FE-MOB]` | Modèle, repository, état, écran |
| Tests | `[TEST]` | Unitaires, intégration, API, E2E |
| Documentation | `[DOC]` | Doc du code, README, OpenAPI |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revue | `[REV]` | Code review |

**Bonne tâche (SMART)** : Spécifique (action claire), Mesurable (on sait quand c'est fini), Assignable (un seul responsable), Réaliste, Temporellement définie (estimée en heures, pas en points).

**Règles de taille** : minimum 30 min, maximum 8 h (1 jour), idéal 2 à 4 h. Au-delà de 8 h : découper en sous-tâches.

**Découpage vertical** : chaque US reçoit les tâches DB + API + front + tests + doc + revue selon le besoin. Taille typique : CRUD simple ~15 tâches, fonctionnalité métier ~18, UI seule ~11.

Pour chaque US, créer un `tasks/TASK-{NNN}.md` par tâche à partir de `.claude/templates/project/task.md` (les IDs continuent après le dernier `TASK-*` existant, comme le fait `/project:backlog add task`) avec : type, estimation, `Depends on`, description, fichiers à créer ou modifier, critères de validation. Puis ajouter une section dans `tasks/README.md` :

```markdown
## US-XXX : [Titre] (Epic EPIC-XXX, [X] points)

| ID | Type | Tâche | Estimation | Dépend de |
|----|------|-------|------------|-----------|
| TASK-001 | [DB] | Créer l'entité [Nom] | 2h | - |
| TASK-002 | [DB] | Migration | 1h | TASK-001 |
| TASK-003 | [BE] | Ressource API | 3h | TASK-001 |
| TASK-004 | [TEST] | Tests API | 2h | TASK-003 |

**Total estimé** : XXh
```

Ajouter les dépendances sous forme de graphe Mermaid (`TASK-001 --> TASK-002`) et un récapitulatif par couche (tâches et heures). Ajouter aussi une section « Tâches techniques transverses » (environnement, mises à jour de dépendances, pipeline CI, refactoring identifié) avec un `tasks/TASK-{NNN}.md` chacune (sans US).

Règles :
1. Estimation en heures (pas en points)
2. Une tâche = un responsable
3. Max 2 tâches en cours par personne
4. Dépendances explicites (graphe Mermaid)

### Étape 8 : Board et Vue d'Ensemble des Tâches

Créer `board.md` (template `.claude/templates/project/board.md`) :

```markdown
# Task Board - Sprint {N}

> Vue générée : régénérée depuis `.bmad/sprint-status.yaml` par `/workflow:status --board`. Ne pas éditer à la main.

## to-do
| ID | US | Tâche | Estimation | Assigné |
|----|-----|-------|------------|---------|

## in-progress | review | done | blocked
(même mise en forme, un tableau par colonne)

## Métriques
- **Tâches** : X au total | X terminées (X%)
- **Heures** : Xh estimées | Xh passées | Xh restantes
```

`tasks/README.md` contient aussi le tableau de synthèse (US, titre, points, tâches, heures), la répartition par type et les conventions : ID `TASK-[NNN]`, taille 0,5 h à 8 h, statuts suivis dans `.bmad/sprint-status.yaml` (`to-do | in-progress | done | blocked`).

### Étape 9 : Enregistrer les Tâches dans `.bmad/sprint-status.yaml`

Pour chaque tâche créée (tâches d'US et tâches transverses), selon `.claude/templates/project/sprint-status.md` :

1. Créer `.bmad/sprint-status.yaml` depuis le squelette de `/workflow:init` s'il n'existe pas (avec `--tasks-only`, le sprint et les stories existent déjà ; sinon, lancer le `/workflow:start <N>` complet)
2. Ajouter les ids TASK à `stories.<US>.tasks.list`
3. Définir `stories.<US>.tasks.status.<TASK>: to-do`
4. Mettre à jour `stories.<US>.tasks.total` (`completed` reste le nombre de tâches `done`)

### Étape 10 : Checklist Finale

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

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /gate:check sprint {N}                                ║
║    Vérifier que le sprint est prêt (gate)                ║
║                                                          ║
║  → /workflow:implement {N}                               ║
║    Démarrer le développement TDD/BDD                     ║
║                                                          ║
║  Voir aussi :                                            ║
║  • /project:backlog next story — Prendre la 1re story    ║
║  • /workflow:status  — Suivre l'avancement du sprint     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
