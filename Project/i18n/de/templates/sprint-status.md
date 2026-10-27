# Sprint-Status-Schema (`.bmad/sprint-status.yaml`)

`.bmad/sprint-status.yaml` ist die **einzige Quelle der Wahrheit für den STATUS von Stories und Aufgaben**. Markdown-Dateien (`US-*.md`, `EPIC-*.md`, `TASK-*.md`, `board.md`) enthalten **nur Inhalt**: kein Statusfeld, kein Status-Emoji. Der Epic-Status wird aus den Status seiner Stories **abgeleitet** (nie gespeichert).

- Story-Status: `backlog | ready-for-dev | in-progress | review | done | blocked`
- Aufgabenstatus: `to-do | in-progress | done | blocked`
- Story-Übergänge folgen der BMAD-Zustandsmaschine (siehe `/sprint:transition`).

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "Benutzerverwaltung"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Benutzer können sich registrieren, anmelden und ihr Profil bearbeiten"
  capacity_points: 21
stories:
  US-010:
    title: "Benutzerregistrierung"
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
        reason: "Implementierung gestartet"
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

## Regeln

- Inhalt (Titel, Beschreibung, Abnahmekriterien, Aufgabendetails) wird in den Markdown-Dateien geschrieben; der Status wird ausschließlich in dieser Datei geschrieben.
- `tasks.completed` ist die Anzahl der Aufgaben mit dem Status `done`; `tasks.total` ist die Länge von `tasks.list`.
- Jeder Story-Übergang aktualisiert `status` und `previous_status` und hängt einen `history`-Eintrag an (`timestamp`, `from`, `to`, `by`, `reason`).
- Der Epic-Status wird aus seinen Stories berechnet (alle `backlog` = nicht gestartet, alle anderen nicht-`done` = in Arbeit, alle `done` = erledigt); er wird nirgends geschrieben.
- Fehlt die Datei, wird sie vor dem Schreiben aus dem Skelett von `/workflow:init` erstellt.
