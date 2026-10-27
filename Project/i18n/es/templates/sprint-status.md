# Esquema de Sprint Status (`.bmad/sprint-status.yaml`)

`.bmad/sprint-status.yaml` es la **única fuente de verdad del ESTADO de stories y tareas**. Los archivos markdown (`US-*.md`, `EPIC-*.md`, `TASK-*.md`, `board.md`) contienen **solo contenido**: sin campo de estado, sin emoji de estado. El estado de un epic se **deriva** de los estados de sus stories (nunca se almacena).

- Estados de story: `backlog | ready-for-dev | in-progress | review | done | blocked`
- Estados de tarea: `to-do | in-progress | done | blocked`
- Las transiciones de story siguen la máquina de estados BMAD (ver `/project:backlog move story`).

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "Gestión de usuarios"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Los usuarios pueden registrarse, iniciar sesión y editar su perfil"
  capacity_points: 21
stories:
  US-010:
    title: "Registro de usuario"
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
        reason: "Implementación iniciada"
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

## Reglas

- El contenido (título, descripción, criterios de aceptación, detalle de las tareas) se escribe en los archivos markdown; el estado se escribe únicamente en este archivo.
- `tasks.completed` es el número de tareas cuyo estado es `done`; `tasks.total` es la longitud de `tasks.list`.
- Cada transición de story actualiza `status` y `previous_status` y añade una entrada a `history` (`timestamp`, `from`, `to`, `by`, `reason`).
- El estado del epic se calcula a partir de sus stories (todas `backlog` = no iniciado, cualquier otro estado no `done` = en curso, todas `done` = terminado); nunca se escribe en ningún sitio.
- Si el archivo no existe, créalo desde el esqueleto de `/workflow:init` antes de escribir.
