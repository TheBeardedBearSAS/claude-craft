---
name: workflow-status
description: "Où en suis-je + prochaine action : phase du workflow, métriques du sprint, tableau Kanban (--board), file d'attente batch (--queue), daily stand-up (--standup) et gates (--gates)"
argument-hint: "[--board|--queue|--standup|--gates] [--sprint N] [--verbose]"
arguments:
  - name: view
    description: "Vue optionnelle : --board, --queue, --standup ou --gates (par défaut : phase + métriques du sprint + prochaine action)"
    required: false
  - name: sprint
    description: "Numéro du sprint (--sprint N), par défaut le sprint courant"
    required: false
  - name: verbose
    description: Afficher le statut détaillé avec tous les artefacts
    required: false
---

# /workflow:status

## Mission

Répondre à « où en suis-je et que dois-je faire ensuite ? ». Afficher la phase du workflow, les métriques du sprint et la prochaine action recommandée. La même commande affiche aussi le tableau Kanban, la file d'attente batch, le daily stand-up quotidien et la synthèse des gates.

Cette commande **met à jour** `project-management/workflow-status.yaml` (`current_phase`, `artifacts`, `next_action`, `next_command`) à chaque exécution, de sorte que le fichier reflète toujours ce qui existe sur le disque.

## Utilisation

| Mode | Ce qu'il fait | Remplace |
|------|---------------|----------|
| `/workflow:status` | Vue par défaut : phase du workflow + métriques du sprint + prochaine action | `/workflow:status` |
| `/workflow:status --verbose` | Idem, avec chaque artefact et les contrôles de santé | - |
| `/workflow:status --board` | Tableau Kanban du sprint, régénère `board.md` | `/workflow:status --board` |
| `/workflow:status --queue [--history]` | File d'attente batch (`.bmad/batch-queue.yaml`) et son historique | `/workflow:status --queue` |
| `/workflow:status --standup [date]` | Synthèse du daily stand-up (hier / aujourd'hui / bloqueurs) | `/workflow:status --standup` |
| `/workflow:status --gates` | Synthèse des quality gates, exécute/lit `/gate:check all` | - |
| `--sprint N` | Cible le sprint N au lieu du sprint courant (se combine avec toute vue) | - |

```bash
/workflow:status                   # Phase + métriques du sprint + prochaine action
/workflow:status --verbose         # Vue détaillée avec tous les artefacts
/workflow:status --board           # Tableau Kanban du sprint courant
/workflow:status --board --sprint 2
/workflow:status --queue --history
/workflow:status --standup
/workflow:status --gates
```

## Sources de vérité

| Donnée | Source |
|--------|--------|
| Phase du workflow, artefacts, prochaine action | `project-management/workflow-status.yaml` (mis à jour par cette commande) |
| Statuts des stories et des tâches, phase TDD, routage | `.bmad/sprint-status.yaml` (source unique de vérité pour le statut ; schéma dans `.claude/templates/project/sprint-status.md`) |
| Contenu (titres, estimations, types, AC) | Fichiers Markdown dans `project-management/` (jamais une source de statut) |
| File d'attente batch | `.bmad/batch-queue.yaml` |

## Processus (vue par défaut)

### Étape 1 : Lire et rafraîchir l'état du workflow

1. Lire `project-management/workflow-status.yaml` ; s'il est absent, afficher l'écran « Aucun workflow initialisé » ci-dessous.
2. Vérifier quels artefacts existent (`prd.md`, `tech-spec.md`, `backlog/`, `sprints/`, ...) et renseigner le statut de chaque artefact.
3. Déduire `current_phase` et mettre à jour `artifacts`, `next_action`, `next_command`, `updated_at` dans le fichier.

### Étape 2 : Lire les métriques du sprint

1. Identifier le sprint (`--sprint N` ou le sprint courant : celui qui contient des stories non Done) et lire son `sprint-goal.md`.
2. Lire `.bmad/sprint-status.yaml` : statuts des stories/tâches, `tdd_phase`, affectations, bloqueurs.
3. Calculer les points, les tâches et les heures réalisés vs la cible, la progression par story, le burndown, les bloqueurs et les risques.
4. Ajouter le routage BMAD : décompte de la machine à états, phase TDD des stories en cours, suggestions de routage automatique (les stories dont toutes les tâches sont terminées sont prêtes pour `review`).

### Étape 3 : Afficher

Vue des phases, métriques du sprint, puis la prochaine action et sa commande.

## Format de sortie

### Vue standard

```
╔══════════════════════════════════════════════════════════════════╗
║                       STATUT DU WORKFLOW                          ║
╠══════════════════════════════════════════════════════════════════╣
║ Projet : my-awesome-app                                           ║
║ Track : STANDARD                                                  ║
║ Phase courante : Implémentation ████████░░░░░░░░ 45%              ║
╠══════════════════════════════════════════════════════════════════╣
║  Phase 1 : Analyse         ⏭️  Ignorée (track Standard)           ║
║  Phase 2 : Planification   ✅ PRD, backlog (18 stories, 89 pts)   ║
║  Phase 3 : Conception      ✅ Tech spec, architecture, 3 ADR      ║
║  Phase 4 : Implémentation  🔄 Sprint 1 (Jour 8/14)                ║
╠══════════════════════════════════════════════════════════════════╣
║ SPRINT 1 - Walking Skeleton                                       ║
║ Points : 5/10 🟡 50%  Tâches : 8/16  Heures : 28h/62h             ║
║ État : [backlog 2] [ready-for-dev 3] [in-progress 2] [review 1]   ║
║        [done 4] [blocked 1]                                       ║
║ Bloqueurs : TASK-008 (en attente de l'API auth, 2 jours)          ║
╠══════════════════════════════════════════════════════════════════╣
║ PROCHAINE ACTION : Poursuivre le sprint                           ║
║ COMMANDE : /workflow:implement                                    ║
╚══════════════════════════════════════════════════════════════════╝
```

### Bloc des métriques du sprint

```
Progression globale : ██████████████░░░░░░░░░░░░░░░░░░ 45%

│ US      │ Nom                  │ Pts │ Tâches │ TDD   │ Statut         │
├─────────┼──────────────────────┼─────┼────────┼───────┼────────────────┤
│ US-005  │ Connexion utilisateur │ 5   │ 3/5    │ Green │ 🟡 In Progress │
│ US-007  │ Réinitialisation du mot de passe │ 3 │ 0/4 │ Red │ 🟡 In Progress │

Burndown : 34h restantes, idéal 28h → 🟡 légèrement en retard (6h)
Risques : 🔴 mobile bloqué depuis 2 jours → prioriser TASK-005
Routage auto : US-008 a toutes ses tâches terminées → /project:backlog move story US-008 review
```

Le rapport est également sauvegardé dans `project-management/sprints/sprint-{N}-{slug}/status-YYYY-MM-DD.md`.

### Vue détaillée (--verbose)

Ajoute, pour chaque phase, chaque artefact avec son chemin, sa version et ses compteurs (exigences du PRD, personas, EPICs et stories par priorité, sprints planifiés, stack de la tech spec, diagrammes d'architecture, endpoints d'API conçus/restants, ADR, revue de sécurité), puis :

```
║ SANTÉ DU WORKFLOW                                                 ║
║ ✅ Le PRD est aligné avec le backlog                              ║
║ ✅ La tech spec couvre toutes les exigences                       ║
║ ⚠️  Conception d'API incomplète (6 endpoints restants)            ║
║ ⚠️  Revue de sécurité en attente                                  ║
║ PROCHAINES ACTIONS                                                ║
║ 1. Terminer la conception d'API → /workflow:design                ║
║ 2. Puis démarrer l'implémentation → /workflow:implement           ║
```

### Aucun workflow initialisé

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  Aucun workflow initialisé pour ce projet                     ║
║  Pour commencer, lancez :  /workflow:init                         ║
║  • Analyser le contexte de votre projet                           ║
║  • Recommander le track (Quick/Standard/Enterprise)               ║
║  • Initialiser le suivi du workflow                               ║
╚══════════════════════════════════════════════════════════════════╝
```

### Statut Quick Flow

Aucune phase n'est requise. Afficher la tâche courante si elle est suivie (ex. `TASK-042: Fix login validation bug, In Progress`) et les commandes disponibles : `/qa:tdd` (continuer en TDD), `/project:backlog move task <TASK> done` (marquer comme terminée), `/workflow:init` (démarrer un nouveau workflow).

## `--board` : tableau Kanban

Afficher le tableau Kanban du sprint courant (ou de `--sprint N`).

1. Identifier le sprint (numéro donné, sinon le sprint courant contenant des tâches non Done).
2. Lire les statuts depuis `.bmad/sprint-status.yaml` (`stories.<US>.status`, `stories.<US>.tasks.status.<TASK>`) et le contenu (titres, estimations, types) depuis les fichiers markdown des US et des tâches (`tasks/TASK-*.md`).
3. Regrouper les tâches par colonne : 🔴 À faire, 🟡 En cours, ⏸️ Bloqué, 🟢 Terminé.
4. Calculer les tâches par colonne, les heures estimées et réalisées, le pourcentage de progression, la progression par type (`[DB]`, `[BE]`, `[WEB]`, `[MOB]`, `[TEST]`) et par user story.

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Tableau Kanban                                    ║
║  Objectif : Walking Skeleton - Auth + Première page              ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 À FAIRE (4)  │ 🟡 EN COURS     │ ⏸️ BLOQUÉ (1)   │ 🟢 TERMINÉ (8)  │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ Tests E2E       │ Service Auth    │ Écran Login     │ Entité User ✓   │
│ 4h @US-001      │ 4h @US-001      │ ⚠️ Attente API  │ 2h @US-001      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Tâches : ████████████████████░░░░░░░░░░ 8/16 (50%)
Heures : ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Bloquées : 1 tâche (6h)
```

Avec de nombreuses tâches, utiliser le format compact :

```
📋 Sprint 1 - Kanban (32 tâches)
🔴 À faire (12) :    TASK-015, TASK-016, TASK-017, TASK-018...
🟡 En cours (5) :    TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Bloqué (2) :      TASK-008 (API), TASK-021 (config)
🟢 Terminé (13) :    TASK-001..TASK-004, TASK-007, TASK-009..TASK-014
Progression : 13/32 (41%) | 45h/98h
```

`board.md` est une **vue générée** : après l'affichage, le fichier `board.md` du sprint est régénéré à partir de `.bmad/sprint-status.yaml` (template `.claude/templates/project/board.md`). Il n'est jamais modifié à la main et n'est jamais la source d'un statut.

Actions : `/project:backlog move task TASK-XXX in-progress` (démarrer), `/project:backlog move task TASK-XXX done` (terminer).

## `--queue` : file d'attente batch

Afficher le statut de la file d'attente batch (`/workflow:implement --queue`).

1. Lire `.bmad/batch-queue.yaml`, analyser les entrées et charger le checkpoint.
2. Regrouper les stories par statut : `pending` (en attente), `running` (en cours), `completed` (terminée), `failed` (en erreur), `skipped` (une dépendance a échoué).
3. Afficher l'état de la file ; avec `--history`, afficher aussi les stories terminées et en échec avec leur durée.

```
═══════════════════════════════════════════════════════
              Statut de la file d'attente batch
═══════════════════════════════════════════════════════
Mode : Séquentiel
Checkpoint : US-011 (2026-01-29 10:45:00)

⏳ En attente : 3   🔄 En cours : 1   ✅ Terminées : 2   ❌ Échecs : 0   ⏭️ Ignorées : 0

En cours :
🔄 US-012 : Page de profil
   Démarrée : 2026-01-29 10:45:00 (il y a 15 min) | Phase TDD : green | Tâche : 2/4

En attente :
[4] US-013 : Réinitialisation du mot de passe (Dépendances : US-010 ✅, US-011 ✅)
[5] US-014 : Vérification de l'e-mail (Dépendances : US-010 ✅)

██████████░░░░░░░░░░ 50% (3/6 stories) | Fin estimée : ~1h 30m
═══════════════════════════════════════════════════════
```

`--history` ajoute le tableau des stories terminées (story, début, fin, durée), les stories en échec (erreur, phase TDD), les stories ignorées (raison, p. ex. « Dépend de US-013 en échec ») et des statistiques : temps total, moyenne par story, taux de réussite (5/6 = 83%), points réalisés.

Une file vide indique comment la remplir : `/workflow:implement --queue` ou `/workflow:implement --epic EPIC-001`.

Gestion de la file :

```bash
.bmad/lib/batch-executor.sh add US-001 1   # ajouter une story (priorité 1)
# Relancer une story en échec : .bmad/batch-queue.yaml → US-013: status: pending
/workflow:implement --queue                # exécuter la file
/workflow:implement --queue --resume       # reprendre depuis le checkpoint
# Vider la file :        .bmad/batch-queue.yaml → queue: []
```

Format du fichier de file :

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```

## `--standup` : daily stand-up

Générer une synthèse de l'activité de développement pour le daily stand-up. Argument optionnel : une période (par défaut : depuis hier).

1. Collecter les données (commandes exécutées via Docker lorsqu'elles dépendent de l'environnement du projet) :

```bash
git log --since="yesterday" --oneline --all   # commits depuis hier
git branch -a --sort=-committerdate | head -10
gh pr list --state open                       # PR ouvertes
gh issue list --assignee @me --state open     # issues en cours
git status --short                            # modifications locales
```

2. Lire le bloc sprint de `.bmad/sprint-status.yaml` : numéro du sprint, jour X/10, points restants, burndown (📉 dans les temps / 📈 en avance / 📊 en retard).
3. Générer la synthèse : réalisé (commits, PR mergées, issues fermées), prévu (en cours par branche/issue/assigné/statut, à démarrer), bloqueurs/risques (bloqueur, impact, action), pull requests actives (ancienneté, revues), notes.
4. Format court pour Slack/Teams :

```markdown
**📅 Daily - {YYYY-MM-DD}**
**Hier :** • PR #123 mergée (Google OAuth) • 5 commits sur feature/auth
**Aujourd'hui :** • Terminer la PR #125 (GitHub OAuth) • Démarrer l'issue #50 (Réinitialisation du mot de passe)
**Bloqueurs :** • ⚠️ Revue en attente sur la PR #125 (@dev3)
**PR à relire :** • PR #127 - Correction du profil utilisateur (0/2)
```

5. Métriques d'équipe sur 7 jours (commits, PR, revues, issues par membre) et vélocité courante (points livrés par jour, cumulé vs idéal, p. ex. « 📈 En avance de 1,6 point »).

Règles du stand-up : 15 minutes maximum pour toute l'équipe, debout, à la même heure chaque jour, pas de résolution de problèmes (parking lot), focus sur l'objectif du sprint. Anti-patterns : rapporter au Scrum Master, longues discussions techniques, « j'ai travaillé sur X » trop vague. Format alternatif « walk the board » : Done → In Progress → To Do, en se concentrant sur ce qui bloque la progression.

Pour un digest quotidien, une GitHub Action planifiée (cron `0 7 * * 1-5`) peut exécuter les mêmes commandes git/gh et publier le résultat sur Slack.

## `--gates` : synthèse des gates

Synthétiser les quality gates en exécutant (ou en lisant le dernier résultat de) `/gate:check all`.

| Gate | Seuil |
|------|-------|
| PRD | >= 80% |
| Tech spec | >= 90% |
| INVEST | 6/6 |
| Sprint ready | 100% |
| Story DoD | 100% |
| Spec alignment | >= 85% |

```
GATES
✅ prd 86%   ✅ tech-spec 92%   ✅ invest 6/6
⚠️ sprint-ready 80%   ⏳ story-dod (US-005 en cours)   ✅ spec-alignment 88%
Suivant : corriger les bloqueurs de sprint-ready → /gate:check sprint-ready
```

Pour une seule gate, utiliser directement `/gate:check <gate>`.

## Structure du fichier de statut

Le statut du workflow est lu depuis, et écrit dans, `project-management/workflow-status.yaml` :

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Track Standard - analyse non requise"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
  implementation:
    status: pending
    sprints:
      - name: sprint-1-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Terminer la conception d'API"
next_command: "/workflow:design"
```

Les statuts des stories et des tâches ne sont PAS stockés ici : ils vivent uniquement dans `.bmad/sprint-status.yaml`.

## Commandes associées

- `/workflow:init` - Initialiser le workflow
- `/workflow:plan` - Phase de planification (`--research`, `--only=prd`, `--only=backlog`)
- `/workflow:design` - Phase de conception
- `/workflow:start` - Préparation du sprint
- `/workflow:implement` - Phase d'implémentation
- `/project:backlog` - Ajouter, lister, modifier, déplacer des stories et des tâches
- `/gate:check` - Quality gates

## Étape suivante

```
╔══════════════════════════════════════════════════════════╗
║                    ÉTAPE SUIVANTE                        ║
╠══════════════════════════════════════════════════════════╣
║  Selon la phase courante :                               ║
║                                                          ║
║  • init      → /workflow:plan                            ║
║  • plan      → /workflow:design                          ║
║  • design    → /workflow:start {N}                       ║
║  • start     → /workflow:implement                       ║
║  • implement → /workflow:review                          ║
║  • review    → /workflow:retro                           ║
║  • retro     → /workflow:start {N+1}                     ║
║                                                          ║
║  À tout moment : /workflow:status                        ║
╚══════════════════════════════════════════════════════════╝
```
