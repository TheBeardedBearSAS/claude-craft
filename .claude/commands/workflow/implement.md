---
name: workflow-implement
description: "Exécuter la phase d'Implémentation - développement TDD/BDD d'un sprint, d'un epic, d'une story ou de la file batch (séquentiel, ou parallèle via /team:delivery --phase=implementation)"
argument-hint: "[<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]"
arguments:
  - name: sprint
    description: Numéro de sprint, "next" ou "current" (défaut - sprint courant)
    required: false
  - name: epic
    description: "--epic <EPIC> - implémenter toutes les stories d'un epic (ex. EPIC-001)"
    required: false
  - name: story
    description: "--story <US-ID> - implémenter une seule story (ex. US-001)"
    required: false
  - name: queue
    description: "--queue - traiter la file batch .bmad/batch-queue.yaml"
    required: false
---

# /workflow:implement

## Mission

Exécuter la phase d'Implémentation : développement sprint par sprint (ou epic / story / file) en TDD/BDD, en suivant la conception technique issue des phases précédentes. C'est le point d'entrée unique de l'implémentation : il remplace `/workflow:implement`, `/workflow:implement`, `/workflow:implement --epic` et `/workflow:implement --queue`.

**Séquentiel par défaut.** `--parallel N` délègue l'exécution à `/team:delivery --phase=implementation` (Agent Teams).

## Usage

```bash
/workflow:implement [<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]
```

| Mode / flag | Effet | Remplace |
|-------------|-------|----------|
| `<N>` / `next` / `current` | Implémente le sprint N, le prochain sprint incomplet, ou le sprint actif (défaut : courant) | `/workflow:implement`, `/workflow:implement` |
| `--epic <EPIC>` | Met en file et implémente toutes les stories d'un epic, dépendances d'abord | `/workflow:implement --epic <EPIC>` |
| `--story <US-ID>` | Implémente une seule story (boucle de tâches + validation) | (une story) |
| `--queue` | Traite la file batch `.bmad/batch-queue.yaml` | `/workflow:implement --queue` |
| `--resume` | Reprend depuis le dernier checkpoint (sprint arrêté ou file interrompue) | `/workflow:implement --queue --resume` |
| `--parallel N` | Exécute jusqu'à N stories indépendantes en parallèle en déléguant à `/team:delivery --phase=implementation` | `/workflow:implement --queue --parallel N` |
| `--auto` | Démarre immédiatement, sans demande de confirmation | `--auto` |
| `--dry-run` | Prévisualise le plan d'exécution ; rien n'est modifié | `--dry-run` |

**Source unique de vérité :** tout changement de statut est écrit dans `.bmad/sprint-status.yaml` (schéma : `.claude/templates/project/sprint-status.md`) - transitions de stories, `tdd_phase`, statuts des tâches, `tasks.completed` et `history`. Les fichiers markdown portent uniquement le contenu, jamais le statut.

## Quand l'utiliser

- Après `/workflow:design` (Standard/Enterprise) et `/workflow:start <N>` (dossier de sprint, tâches)
- Après `/workflow:init` pour le track Quick Flow
- Quand vous êtes prêt à coder

## Prérequis

Standard/Enterprise :
- Tech Spec dans `project-management/tech-spec.md`, backlog dans `project-management/backlog/`
- Sprint avec tâches décomposées dans `project-management/sprints/sprint-{N}-{slug}/` (`sprint-goal.md`, `board.md`, `tasks/TASK-*.md`) - lancer `/workflow:start <N>` (ou `/workflow:start <N> --tasks-only`) s'ils manquent
- Stories présentes dans `.bmad/sprint-status.yaml`

Quick Flow : une compréhension claire du bug/de la fonctionnalité à implémenter.

## Plan Mode

> **Le plan mode est obligatoire.** Avant chaque tâche, Claude active le plan mode pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Workflow

### Étape 1 : Sélectionner le périmètre

1. Analyser les arguments (mode, puis flags). Sans mode, utiliser le sprint courant.
2. Lire `.bmad/sprint-status.yaml` et construire la liste des stories éligibles :
   - `<N>` : les stories du sprint en `ready-for-dev` ou `in-progress`
   - `--epic <EPIC>` : les stories dont l'`epic_id` correspond, non terminées, non bloquées (les bloquées sont signalées pour revue)
   - `--story <US-ID>` : cette seule story
   - `--queue` : les stories au statut `pending` dans `.bmad/batch-queue.yaml`, triées par priorité
3. Pour un sprint, lancer d'abord `/gate:check sprint` ; si le gate échoue, afficher les problèmes et s'arrêter.

```
Sprint 1: Walking Skeleton
   Goal: Complete authentication flow end-to-end
   3 User Stories, 17 Tasks
   To Do: 15 | In Progress: 2 | Done: 0
```

### Étape 2 : Construire le plan d'exécution

1. Analyser les dépendances entre stories et construire le graphe de dépendances.
2. Ordonner les stories : sans dépendances d'abord, puis par priorité, puis ID le plus bas d'abord.
3. Identifier les groupes exécutables en parallèle.
4. Écrire la file dans `.bmad/batch-queue.yaml` (pour `--epic` et les sprints de plusieurs stories) :

```yaml
queue:
  - story_id: "US-010"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-011"
    priority: 2
    status: "pending"
    dependencies: ["US-010"]
```

Avec `--dry-run`, afficher le plan et s'arrêter :

```
Implement: EPIC-002 (DRY RUN)
Stories: 5 | Total points: 21

[1] US-010: User registration (5 pts)  deps: none
[2] US-011: User login (5 pts)         deps: US-010
[3] US-012: Profile page (5 pts)       deps: US-010
[4] US-013: Password reset (3 pts)     deps: US-010, US-011
[5] US-014: Email verification (3 pts) deps: US-010

Parallelizable after US-010: US-011, US-012, US-014
DRY RUN - no changes made. Run without --dry-run to execute.
```

Sans `--auto`, demander confirmation avant d'exécuter.

### Étape 3 : Exécuter

- **Séquentiel (défaut) :** traiter les stories une par une avec la boucle de story ci-dessous, avec un checkpoint après chaque story.
- **`--parallel N` :** confier les stories indépendantes (sans dépendance non satisfaite) à `/team:delivery --phase=implementation`, qui lance jusqu'à N coéquipiers en parallèle. `/team:delivery` écrit ses transitions dans le même `.bmad/sprint-status.yaml` ; les stories avec dépendances attendent que leurs prérequis soient `done`.

```
Mode: Parallel (3 workers)
Worker 1: US-010 - User registration       [running]
Worker 2: (waiting for dependencies)
[10:15] US-010 done -> starting US-011, US-012, US-014 in parallel
[10:30] US-013 done (deps US-010, US-011 satisfied)
```

#### Boucle de story

Pour chaque story en `ready-for-dev` ou `in-progress` :

1. **Faire passer la story en `in-progress`** (`status`, `previous_status`, `tdd_phase`, entrée `history` dans le YAML).
2. **Afficher les critères d'acceptation** (Gherkin).
3. **Traiter chaque tâche** avec la boucle de tâches.

```
US-001: User Authentication (5 pts)  -  in-progress

   GIVEN a registered user with valid credentials
   WHEN they submit the login form
   THEN they should see their dashboard
   AND a session should be created

   TASK-001 [DB] Create User entity .............. to-do
   TASK-002 [BE] Authentication service .......... to-do
   TASK-003 [FE-WEB] Login form .................. to-do
   TASK-004 [TEST] E2E authentication tests ...... to-do
```

#### Boucle de tâches (TDD)

Pour chaque tâche en `to-do`, dans l'ordre de traitement ci-dessous :

**3.1 Afficher la tâche** (estimation, description, fichiers à modifier, Definition of Done).

**3.2 Plan mode (obligatoire).** Explorer le code impacté et les dépendances, documenter les constats, puis proposer un plan : fichiers à créer/modifier, tests à écrire en premier, risques et mitigations. Attendre la validation :

```
[continue] Poursuivre   [skip] Passer cette tâche   [block] Marquer bloquée   [stop] Arrêter (état sauvegardé)
```

**3.3 Passer la tâche en `in-progress`.** Dans `.bmad/sprint-status.yaml` : définir `stories.<US>.tasks.status.<TASK>: in-progress` ; pour la première tâche d'une story `ready-for-dev`, faire passer la story en `in-progress` (`status`, `previous_status`, `tdd_phase`, entrée d'historique). Régénérer `board.md` (vue générée) et mettre à jour `index.md`.

**3.4 Cycle TDD.**

```
RED       Écrire des tests qui échouent   -> FAILED (attendu)
GREEN     Implémenter le code minimal     -> PASSED
REFACTOR  Améliorer la qualité            -> PASSED (pas de régression)
```

Mettre à jour `tdd_phase` (`red` -> `green` -> `refactor`) dans le YAML à chaque phase.

**3.5 Vérification de la Definition of Done.**

```
- [x] Code écrit et fonctionnel
- [x] Tests au vert (3/3)
- [ ] Code relu -> pris en charge par TASK-XXX [REV]
```

**3.6 Passer la tâche en `done`.** Demander le temps réellement passé, puis mettre à jour :
- `.bmad/sprint-status.yaml` : `tasks.status.<TASK>: done` et `tasks.completed` (= nombre de tâches `done`)
- Métadonnées de contenu du fichier de tâche (`time_spent`, `updated_at` ; pas de statut)
- `board.md` (régénéré depuis le YAML), `index.md`, métriques du sprint

**3.7 Commit conventionnel** avec la référence de la story :

```
feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add unit tests for User entity

Refs: TASK-001, US-001
```

#### Validation de la story

Quand toutes les tâches d'une story sont `done` : vérifier chaque critère d'acceptation, lancer les tests E2E s'ils existent, exécuter le quality gate (`/gate:check story` si configuré), puis faire transiter la story (`in-progress` -> `review` -> `done`) dans le YAML, avec `previous_status` et une entrée `history`. Mettre à jour la progression de l'EPIC (le statut de l'EPIC est dérivé).

```
US-001 validation: 4/4 tasks, acceptance criteria met, E2E passed
US-001 -> done  |  EPIC-001: 1/3 stories (33%)
```

Après chaque transition, les règles `routing.auto_transitions` s'appliquent (voir `/project:backlog move story --auto`).

### Étape 4 : Gérer les échecs et les blocages

- **Tâche bloquée :** la marquer `blocked` avec la raison dans le YAML, puis choisir : [1] passer et continuer avec la prochaine tâche non bloquée, [2] tenter de lever le blocage, [3] arrêter.
- **Story en échec (file / epic) :** la marquer `failed` avec l'erreur, la phase TDD et le dernier checkpoint ; les stories qui en dépendent sont ignorées. Appliquer `resume_on_failure` des réglages de la file (continuer ou arrêter). Corriger la cause, puis lancer `/workflow:implement --resume`.

### Étape 5 : Checkpoints et reprise

Un checkpoint est sauvegardé après chaque story dans `.bmad/batch-queue.yaml` :

```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

`--resume` recharge le checkpoint (ou, pour un sprint arrêté, la dernière tâche terminée) et continue :

```
Resuming Sprint 1: Walking Skeleton - 8/17 tasks (47%)
Last completed: TASK-008 [BE] JWT Token Service
Next task: TASK-009 [FE-WEB] Login Controller - continue? [y/n]
```

### Étape 6 : Rapport

```
Batch complete: 5 done | 0 failed | 0 skipped
US-010 45 min | US-011 38 min | US-012 52 min | US-013 28 min | US-014 35 min
Total 3h 18min - average 40 min per story
```

Quand toutes les stories d'un sprint sont `done` :

```
Sprint 1 complete: 5/5 stories, 21 points, velocity 21 pts/sprint
Hours: 38h actual vs 42h estimated | Test coverage: 82% | Commits: 23
sprint-review.md generated, sprint-retro.md template ready
```

Prochaines actions : `/workflow:review`, `/workflow:retro`, `/workflow:implement <N+1>`, ou `/workflow:status`.

## Ordre de traitement des tâches

| Ordre | Type | Description |
|-------|------|-------------|
| 1 | `[DB]` | Base de données (entités, migrations, repositories) |
| 2 | `[BE]` | Backend (services, APIs, logique métier) |
| 3 | `[FE-WEB]` | Frontend Web (contrôleurs, templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (écrans, blocs, widgets) |
| 5 | `[TEST]` | Tests additionnels (E2E, performance) |
| 6 | `[DOC]` | Documentation |
| 7 | `[REV]` | Revue de code |

## Commandes de contrôle

| Commande | Action |
|----------|--------|
| `continue` | Valider le plan et poursuivre |
| `skip` | Passer cette tâche (reste `to-do`) |
| `block [raison]` | Marquer la tâche `blocked` avec une raison |
| `stop` | Arrêter et sauvegarder l'état courant |
| `status` | Afficher la progression (`/workflow:status`) |
| `board` | Afficher le tableau Kanban (`/workflow:status --board`) |

## Mises à jour automatiques

À chaque changement de statut, tous les statuts vont dans `.bmad/sprint-status.yaml` ; les fichiers markdown ne reçoivent que du contenu.

1. **sprint-status.yaml :** statut des tâches (`to-do | in-progress | done | blocked`), `tasks.completed`, `tdd_phase`, transitions de stories (`ready-for-dev` -> `in-progress` -> `review` -> `done`) avec `previous_status` et une entrée `history`
2. **Fichier de tâche :** `time_spent`, `updated_at` (pas de statut)
3. **Fichier de user story :** affichage de la progression des tâches (pas de statut)
4. **Fichier EPIC :** progression des stories (statut dérivé)
5. **board.md :** colonnes Kanban régénérées depuis le YAML
6. **index.md :** métriques globales

## Fichiers mis à jour

| Fichier | Mises à jour |
|---------|--------------|
| `.bmad/sprint-status.yaml` | Statut des stories, `tdd_phase`, statuts des tâches, `tasks.completed`, historique |
| `.bmad/batch-queue.yaml` | Entrées de la file, statuts, checkpoints |
| `project-management/backlog/user-stories/US-XXX.md` | Progression des tâches (contenu uniquement) |
| `project-management/backlog/epics/EPIC-XXX.md` | Progression des stories |
| `project-management/sprints/sprint-{N}-{slug}/board.md` | Colonnes Kanban (régénérées) |
| `project-management/sprints/sprint-{N}-{slug}/tasks/*.md` | Temps passé (pas de statut) |
| `project-management/sprints/sprint-{N}-{slug}/sprint-review.md` | Généré à la fin |

## Configuration de la file

Réglages dans `.bmad/batch-queue.yaml` :

```yaml
execution:
  mode: "sequential"  # or "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600
settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

Si Ralph est configuré, définir `bmad_integration.batch_queue_file: ".bmad/batch-queue.yaml"` dans `ralph.yml` pour intégrer l'exécution batch.

## Mode Quick Flow

Pour les corrections de bugs et les petites fonctionnalités, aucune structure de sprint n'est nécessaire :
- Corrections de bugs : `/qa:tdd` (approche TDD)
- Petites fonctionnalités : les commandes `/{tech}:*` spécifiques à la technologie
- Suivi : `/project:backlog add task` puis `/project:backlog move task done`

## Agents impliqués

- **tech-lead** : Décomposition des tâches, guidage architectural
- **tdd-coach** : Guidage méthodologique TDD/BDD
- **{tech}-reviewer** : Revue de code (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer** : CI/CD et déploiement

## Commandes associées

- `/workflow:design` - Phase précédente ; `/workflow:start <N>` - créer le sprint et ses tâches
- `/workflow:status` - Progression, board (`--board`), file (`--queue`), gates (`--gates`)
- `/team:delivery --phase=implementation` - Moteur parallèle utilisé par `--parallel N` ; `/team:delivery` - Rédaction + implémentation en parallèle
- `/project:backlog move story <US> <status>` - Transition manuelle d'une story
- `/qa:tdd` - Corrections rapides de bugs
- `/workflow:review` - Cérémonie de sprint review
- `/workflow:retro` - Rétrospective de sprint
