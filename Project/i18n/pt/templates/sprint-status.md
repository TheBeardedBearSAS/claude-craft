# Esquema do Sprint Status (`.bmad/sprint-status.yaml`)

`.bmad/sprint-status.yaml` é a **fonte única de verdade para o STATUS das stories e das tarefas**. Os arquivos markdown (`US-*.md`, `EPIC-*.md`, `TASK-*.md`, `board.md`) contêm **apenas conteúdo**: nenhum campo de status, nenhum emoji de status. O status de um epic é **derivado** dos status de suas stories (nunca armazenado).

- Status das stories: `backlog | ready-for-dev | in-progress | review | done | blocked`
- Status das tarefas: `to-do | in-progress | done | blocked`
- As transições de stories seguem a máquina de estados BMAD (ver `/project:backlog move story`).

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "Gestão de usuários"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Os usuários podem se cadastrar, entrar e editar seu perfil"
  capacity_points: 21
stories:
  US-010:
    title: "Cadastro de usuário"
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
        reason: "Implementação iniciada"
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

## Regras

- O conteúdo (título, descrição, critérios de aceitação, detalhes das tarefas) é escrito nos arquivos markdown; o status é escrito somente neste arquivo.
- `tasks.completed` é o número de tarefas cujo status é `done`; `tasks.total` é o tamanho de `tasks.list`.
- Toda transição de story atualiza `status` e `previous_status` e adiciona uma entrada em `history` (`timestamp`, `from`, `to`, `by`, `reason`).
- O status do epic é calculado a partir de suas stories (todas `backlog` = não iniciado, qualquer outra não `done` = em andamento, todas `done` = concluído); nunca é escrito em lugar algum.
- Se o arquivo não existir, criá-lo a partir do esqueleto de `/workflow:init` antes de escrever.
