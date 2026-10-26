---
name: workflow-status
description: "Dónde estoy + siguiente acción: fase del workflow, métricas del sprint, tablero Kanban (--board), cola de lotes (--queue), daily (--standup) y gates (--gates)"
argument-hint: "[--board|--queue|--standup|--gates] [--sprint N] [--verbose]"
arguments:
  - name: view
    description: "Vista opcional: --board, --queue, --standup o --gates (por defecto: fase + métricas del sprint + siguiente acción)"
    required: false
  - name: sprint
    description: "Número de sprint (--sprint N), por defecto el sprint actual"
    required: false
  - name: verbose
    description: Mostrar el estado detallado con todos los artefactos
    required: false
---

# /workflow:status

## Misión

Responder a "¿dónde estoy y qué hago a continuación?". Muestra la fase del workflow, las métricas del sprint y la siguiente acción recomendada. El mismo comando también muestra el tablero Kanban, la cola de lotes, el daily stand-up y el resumen de gates.

Este comando **actualiza** `project-management/workflow-status.yaml` (`current_phase`, `artifacts`, `next_action`, `next_command`) cada vez que se ejecuta, de modo que el archivo siempre refleje lo que existe en disco.

## Uso

| Modo | Qué hace | Reemplaza |
|------|----------|-----------|
| `/workflow:status` | Vista por defecto: fase del workflow + métricas del sprint + siguiente acción | `/workflow:status` |
| `/workflow:status --verbose` | Igual, con todos los artefactos y las comprobaciones de salud | - |
| `/workflow:status --board` | Tablero Kanban del sprint, regenera `board.md` | `/workflow:status --board` |
| `/workflow:status --queue [--history]` | Cola de lotes (`.bmad/batch-queue.yaml`) y su historial | `/workflow:status --queue` |
| `/workflow:status --standup [date]` | Resumen del daily stand-up (ayer / hoy / bloqueos) | `/workflow:status --standup` |
| `/workflow:status --gates` | Resumen de quality gates, ejecuta/lee `/gate:check all` | - |
| `--sprint N` | Apunta al sprint N en lugar del actual (se combina con cualquier vista) | - |

```bash
/workflow:status                   # Fase + métricas del sprint + siguiente acción
/workflow:status --verbose         # Vista detallada con todos los artefactos
/workflow:status --board           # Tablero Kanban del sprint actual
/workflow:status --board --sprint 2
/workflow:status --queue --history
/workflow:status --standup
/workflow:status --gates
```

## Fuentes de verdad

| Dato | Fuente |
|------|--------|
| Fase del workflow, artefactos, siguiente acción | `project-management/workflow-status.yaml` (actualizado por este comando) |
| Estados de historias y tareas, fase TDD, enrutamiento | `.bmad/sprint-status.yaml` (única fuente de verdad del estado; esquema en `.claude/templates/project/sprint-status.md`) |
| Contenido (títulos, estimaciones, tipos, AC) | Archivos Markdown en `project-management/` (nunca una fuente de estado) |
| Cola de lotes | `.bmad/batch-queue.yaml` |

## Proceso (vista por defecto)

### Paso 1: Leer y actualizar el estado del workflow

1. Leer `project-management/workflow-status.yaml`; si no existe, mostrar la pantalla "Ningún workflow inicializado" que figura más abajo.
2. Comprobar qué artefactos existen (`prd.md`, `tech-spec.md`, `backlog/`, `sprints/`, ...) y establecer el estado de cada artefacto.
3. Deducir `current_phase` y actualizar `artifacts`, `next_action`, `next_command`, `updated_at` en el archivo.

### Paso 2: Leer las métricas del sprint

1. Identificar el sprint (`--sprint N` o el actual: el sprint con historias que no estén en Done) y leer su `sprint-goal.md`.
2. Leer `.bmad/sprint-status.yaml`: estados de historias/tareas, `tdd_phase`, asignaciones, bloqueos.
3. Calcular puntos, tareas y horas completados frente al objetivo, progreso por historia, burndown, bloqueos y riesgos.
4. Añadir el enrutamiento BMAD: contadores de la máquina de estados, fase TDD de las historias en curso, sugerencias de enrutamiento automático (las historias cuyas tareas están todas completadas están listas para `review`).

### Paso 3: Mostrar

Vista de fases, métricas del sprint, luego la siguiente acción y su comando.

## Formato de salida

### Vista estándar

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║ Proyecto: my-awesome-app                                          ║
║ Track: STANDARD                                                   ║
║ Fase actual: Implementación ████████░░░░░░░░ 45%                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Fase 1: Análisis         ⏭️  Omitida (track Standard)            ║
║  Fase 2: Planificación    ✅ PRD, backlog (18 historias, 89 pts)  ║
║  Fase 3: Diseño           ✅ Tech spec, arquitectura, 3 ADRs      ║
║  Fase 4: Implementación   🔄 Sprint 1 (Día 8/14)                  ║
╠══════════════════════════════════════════════════════════════════╣
║ SPRINT 1 - Walking Skeleton                                       ║
║ Puntos: 5/10 🟡 50%  Tareas: 8/16  Horas: 28h/62h                 ║
║ Estado: [backlog 2] [ready-for-dev 3] [in-progress 2] [review 1]  ║
║         [done 4] [blocked 1]                                      ║
║ Bloqueos: TASK-008 (a la espera de la API de auth, 2 días)        ║
╠══════════════════════════════════════════════════════════════════╣
║ SIGUIENTE ACCIÓN: Continuar el sprint                             ║
║ COMANDO: /workflow:implement                                      ║
╚══════════════════════════════════════════════════════════════════╝
```

### Bloque de métricas del sprint

```
Progreso global: ██████████████░░░░░░░░░░░░░░░░░░ 45%

│ US      │ Nombre       │ Pts │ Tareas│ TDD   │ Estado         │
├─────────┼──────────────┼─────┼───────┼───────┼────────────────┤
│ US-005  │ Inicio de sesión │ 5 │ 3/5  │ Green │ 🟡 In Progress │
│ US-007  │ Restablecer contraseña │ 3 │ 0/4 │ Red │ 🟡 In Progress │

Burndown: 34h restantes, ideal 28h → 🟡 ligeramente retrasado (6h)
Riesgos: 🔴 mobile bloqueado desde hace 2 días → priorizar TASK-005
Enrutamiento automático: US-008 tiene todas las tareas completadas → /project:backlog move story US-008 review
```

El informe también se guarda en `project-management/sprints/sprint-{N}-{slug}/status-YYYY-MM-DD.md`.

### Vista detallada (--verbose)

Añade, por fase, cada artefacto con su ruta, versión y contadores (requisitos del PRD, personas, EPICs e historias por prioridad, sprints planificados, stack de la tech spec, diagramas de arquitectura, endpoints de API diseñados/restantes, ADRs, revisión de seguridad), y después:

```
║ SALUD DEL WORKFLOW                                                ║
║ ✅ El PRD está alineado con el backlog                            ║
║ ✅ La tech spec cubre todos los requisitos                        ║
║ ⚠️  Diseño de API incompleto (6 endpoints restantes)              ║
║ ⚠️  Revisión de seguridad pendiente                               ║
║ SIGUIENTES ACCIONES                                               ║
║ 1. Completar el diseño de la API → /workflow:design               ║
║ 2. Después iniciar la implementación → /workflow:implement        ║
```

### Ningún workflow inicializado

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  Ningún workflow inicializado para este proyecto              ║
║  Para empezar, ejecuta:  /workflow:init                           ║
║  • Analiza el contexto de tu proyecto                             ║
║  • Recomienda el track (Quick/Standard/Enterprise)                ║
║  • Inicializa el seguimiento del workflow                         ║
╚══════════════════════════════════════════════════════════════════╝
```

### Estado de Quick Flow

No se requiere ninguna fase. Mostrar la tarea actual si está registrada (p. ej. `TASK-042: Fix login validation bug, In Progress`) y los comandos disponibles: `/qa:tdd` (continuar con TDD), `/project:backlog move task <TASK> done` (marcar como completada), `/workflow:init` (iniciar un nuevo workflow).

## `--board`: tablero Kanban

Muestra el tablero Kanban del sprint actual (o de `--sprint N`).

1. Identificar el sprint (el número indicado; en su defecto, el sprint actual con tareas que no estén en Done).
2. Leer los estados de `.bmad/sprint-status.yaml` (`stories.<US>.status`, `stories.<US>.tasks.status.<TASK>`) y el contenido (títulos, estimaciones, tipos) de los archivos markdown de las US y de las tareas (`tasks/TASK-*.md`).
3. Agrupar las tareas por columna: 🔴 To Do, 🟡 In Progress, ⏸️ Blocked, 🟢 Done.
4. Calcular las tareas por columna, las horas estimadas y completadas, el porcentaje de progreso, el progreso por tipo (`[DB]`, `[BE]`, `[WEB]`, `[MOB]`, `[TEST]`) y por historia de usuario.

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Tablero Kanban                                    ║
║  Objetivo: Walking Skeleton - Auth + Primera página              ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 TO DO (4)    │ 🟡 IN PROGRESS  │ ⏸️ BLOCKED (1)  │ 🟢 DONE (8)     │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ Tests E2E       │ Servicio Auth   │ Pantalla Login  │ Entidad User ✓  │
│ 4h @US-001      │ 4h @US-001      │ ⚠️ Espera API   │ 2h @US-001      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Tareas: ████████████████████░░░░░░░░░░ 8/16 (50%)
Horas: ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Bloqueadas: 1 tarea (6h)
```

Con muchas tareas, usar el formato compacto:

```
📋 Sprint 1 - Kanban (32 tareas)
🔴 To Do (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 In Progress (5): TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Blocked (2):     TASK-008 (API), TASK-021 (config)
🟢 Done (13):       TASK-001..TASK-004, TASK-007, TASK-009..TASK-014
Progreso: 13/32 (41%) | 45h/98h
```

`board.md` es una **vista generada**: tras mostrarla, el archivo `board.md` del sprint se regenera a partir de `.bmad/sprint-status.yaml` (plantilla `.claude/templates/project/board.md`). Nunca se edita a mano y nunca es la fuente de un estado.

Acciones: `/project:backlog move task TASK-XXX in-progress` (iniciar), `/project:backlog move task TASK-XXX done` (completar).

## `--queue`: cola de lotes

Muestra el estado de la cola de lotes (`/workflow:implement --queue`).

1. Leer `.bmad/batch-queue.yaml`, analizar las entradas y cargar el checkpoint.
2. Agrupar las historias por estado: `pending` (en espera), `running` (en curso), `completed`, `failed` (error), `skipped` (una dependencia falló).
3. Mostrar el estado de la cola; con `--history`, también las historias completadas y fallidas con sus tiempos.

```
═══════════════════════════════════════════════════════
              Estado de la cola de lotes
═══════════════════════════════════════════════════════
Modo: Secuencial
Checkpoint: US-011 (2026-01-29 10:45:00)

⏳ Pending: 3   🔄 Running: 1   ✅ Completed: 2   ❌ Failed: 0   ⏭️ Skipped: 0

En curso:
🔄 US-012: Página de perfil
   Inicio: 2026-01-29 10:45:00 (hace 15 min) | Fase TDD: green | Tarea: 2/4

Pendientes:
[4] US-013: Restablecer contraseña (Dependencias: US-010 ✅, US-011 ✅)
[5] US-014: Verificación de correo (Dependencias: US-010 ✅)

██████████░░░░░░░░░░ 50% (3/6 historias) | Finalización estimada: ~1h 30m
═══════════════════════════════════════════════════════
```

`--history` añade la tabla de completadas (historia, inicio, fin, duración), las historias fallidas (error, fase TDD), las omitidas (motivo, p. ej. "Depende de US-013 fallida") y estadísticas: tiempo total, promedio por historia, tasa de éxito (5/6 = 83%), puntos completados.

Una cola vacía indica cómo llenarla: `/workflow:implement --queue` o `/workflow:implement --epic EPIC-001`.

Gestión de la cola:

```bash
.bmad/lib/batch-executor.sh add US-001 1   # añadir una historia (prioridad 1)
# Reintentar una historia fallida: .bmad/batch-queue.yaml → US-013: status: pending
/workflow:implement --queue                # ejecutar la cola
/workflow:implement --queue --resume       # reanudar desde el checkpoint
# Vaciar la cola:       .bmad/batch-queue.yaml → queue: []
```

Formato del archivo de cola:

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

## `--standup`: daily stand-up

Genera un resumen de la actividad de desarrollo para el daily stand-up. Argumento opcional: un periodo (por defecto: desde ayer).

1. Recopilar datos (comandos ejecutados mediante Docker cuando dependen del entorno del proyecto):

```bash
git log --since="yesterday" --oneline --all   # commits desde ayer
git branch -a --sort=-committerdate | head -10
gh pr list --state open                       # PRs abiertas
gh issue list --assignee @me --state open     # issues actuales
git status --short                            # cambios locales
```

2. Leer el bloque del sprint de `.bmad/sprint-status.yaml`: número de sprint, día X/10, puntos restantes, burndown (📉 en plazo / 📈 adelantado / 📊 retrasado).
3. Generar el resumen: hecho (commits, PRs fusionadas, issues cerradas), planificado (en curso por rama/issue/responsable/estado, por iniciar), bloqueos/riesgos (bloqueo, impacto, acción), pull requests activas (antigüedad, revisiones), notas.
4. Formato corto para Slack/Teams:

```markdown
**📅 Daily - {YYYY-MM-DD}**
**Ayer:** • PR #123 fusionada (Google OAuth) • 5 commits en feature/auth
**Hoy:** • Terminar PR #125 (GitHub OAuth) • Empezar Issue #50 (Restablecer contraseña)
**Bloqueos:** • ⚠️ Revisión pendiente de la PR #125 (@dev3)
**PRs por revisar:** • PR #127 - Fix user profile (0/2)
```

5. Métricas del equipo a 7 días (commits, PRs, revisiones, issues por miembro) y velocidad actual (puntos entregados por día, acumulado frente al ideal, p. ej. "📈 Adelantado en 1,6 puntos").

Reglas del stand-up: 15 minutos como máximo para todo el equipo, de pie, a la misma hora cada día, sin resolver problemas (parking lot), centrado en el objetivo del sprint. Antipatrones: informar al Scrum Master, largas discusiones técnicas, vagos "trabajé en X". Formato alternativo "walk the board": Done → In Progress → To Do, centrándose en lo que bloquea el avance.

Para un resumen diario, una GitHub Action programada (cron `0 7 * * 1-5`) puede ejecutar los mismos comandos git/gh y publicar el resultado en Slack.

## `--gates`: resumen de gates

Resume las quality gates ejecutando (o leyendo el último resultado de) `/gate:check all`.

| Gate | Umbral |
|------|--------|
| PRD | >= 80% |
| Tech spec | >= 90% |
| INVEST | 6/6 |
| Sprint ready | 100% |
| Story DoD | 100% |
| Spec alignment | >= 85% |

```
GATES
✅ prd 86%   ✅ tech-spec 92%   ✅ invest 6/6
⚠️ sprint-ready 80%   ⏳ story-dod (US-005 en curso)   ✅ spec-alignment 88%
Siguiente: corregir los bloqueos de sprint-ready → /gate:check sprint-ready
```

Para una sola gate, usar directamente `/gate:check <gate>`.

## Estructura del archivo de estado

El estado del workflow se lee de, y se escribe en, `project-management/workflow-status.yaml`:

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Track Standard - análisis no requerido"
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

next_action: "Completar el diseño de la API"
next_command: "/workflow:design"
```

Los estados de historias y tareas NO se almacenan aquí: viven únicamente en `.bmad/sprint-status.yaml`.

## Comandos relacionados

- `/workflow:init` - Inicializar el workflow
- `/workflow:plan` - Fase de planificación (`--research`, `--only=prd`, `--only=backlog`)
- `/workflow:design` - Fase de diseño
- `/workflow:start` - Preparación del sprint
- `/workflow:implement` - Fase de implementación
- `/project:backlog` - Añadir, listar, editar y mover historias y tareas
- `/gate:check` - Quality gates

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║  Según la fase actual:                                   ║
║                                                          ║
║  • init      → /workflow:plan                            ║
║  • plan      → /workflow:design                          ║
║  • design    → /workflow:start {N}                       ║
║  • start     → /workflow:implement                       ║
║  • implement → /workflow:review                          ║
║  • review    → /workflow:retro                           ║
║  • retro     → /workflow:start {N+1}                     ║
║                                                          ║
║  En cualquier momento: /workflow:status                  ║
╚══════════════════════════════════════════════════════════╝
```
