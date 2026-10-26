# Sprint Status Schema (`.bmad/sprint-status.yaml`)

`.bmad/sprint-status.yaml` is the **single source of truth for story and task STATUS**. Markdown files (`US-*.md`, `EPIC-*.md`, `TASK-*.md`, `board.md`) hold **content only**: no status field, no status emoji. Epic status is **derived** from its stories' statuses (never stored).

- Story statuses: `backlog | ready-for-dev | in-progress | review | done | blocked`
- Task statuses: `to-do | in-progress | done | blocked`
- Story transitions follow the BMAD state machine (see `/sprint:transition`).

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "User management"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Users can sign up, log in and edit their profile"
  capacity_points: 21
stories:
  US-010:
    title: "User sign-up"
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
        reason: "Implementation started"
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

## Rules

- Content (title, description, acceptance criteria, task details) is written in the markdown files; status is written only in this file.
- `tasks.completed` is the count of tasks whose status is `done`; `tasks.total` is the length of `tasks.list`.
- Every story transition updates `status` and `previous_status` and appends a `history` entry (`timestamp`, `from`, `to`, `by`, `reason`).
- Epic status is computed from its stories (all `backlog` = not started, any other non-`done` = in progress, all `done` = done); it is never written anywhere.
- If the file is missing, create it from the `/workflow:init` skeleton before writing.
