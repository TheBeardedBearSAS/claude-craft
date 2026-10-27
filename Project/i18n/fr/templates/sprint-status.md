# Schéma Sprint Status (`.bmad/sprint-status.yaml`)

`.bmad/sprint-status.yaml` est la **source unique de vérité des STATUTS des stories et des tâches**. Les fichiers markdown (`US-*.md`, `EPIC-*.md`, `TASK-*.md`, `board.md`) ne contiennent que du **contenu** : pas de champ statut, pas d'emoji de statut. Le statut d'un EPIC est **dérivé** des statuts de ses stories (jamais stocké).

- Statuts des stories : `backlog | ready-for-dev | in-progress | review | done | blocked`
- Statuts des tâches : `to-do | in-progress | done | blocked`
- Les transitions de story suivent la machine à états BMAD (voir `/project:backlog move story`).

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
    status: "in-progress"
    previous_status: "ready-for-dev"
    tdd_phase: "green"
    story_points: 5
    epic_id: "EPIC-002"
    priority: "must"
    dependencies: ["US-001"]
    tasks:
      total: 2
      completed: 1
      list: ["TASK-001", "TASK-002"]
      status:
        TASK-001: "done"
        TASK-002: "in-progress"
    history:
      - timestamp: "2026-11-02T09:00:00Z"
        from: "ready-for-dev"
        to: "in-progress"
        by: "dev"
        reason: "Implémentation démarrée"
archived_sprints:
  sprint-1:
    stories:
      US-001: { status: "done", points: 5 }
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
    rules: []
```

## Règles

- Le contenu (titre, description, critères d'acceptation, détail des tâches) s'écrit dans les fichiers markdown ; le statut s'écrit uniquement dans ce fichier.
- `tasks.completed` est le nombre de tâches dont le statut est `done` ; `tasks.total` est la longueur de `tasks.list`.
- Chaque transition de story met à jour `status` et `previous_status` et ajoute une entrée `history` (`timestamp`, `from`, `to`, `by`, `reason`).
- Le statut d'un EPIC est calculé depuis ses stories (toutes `backlog` = non démarré, toute autre situation non `done` = en cours, toutes `done` = terminé) ; il n'est écrit nulle part.
- Si le fichier est absent, le créer à partir du squelette de `/workflow:init` avant d'écrire.
