---
name: workflow-implement
description: "Ejecutar la fase de Implementación - desarrollo TDD/BDD de un sprint, un epic, una story o la cola batch (secuencial, o paralelo vía /team:delivery --phase=implementation)"
argument-hint: "[<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]"
arguments:
  - name: sprint
    description: Número de sprint, "next" o "current" (por defecto - sprint actual)
    required: false
  - name: epic
    description: "--epic <EPIC> - implementar todas las stories de un epic (p. ej. EPIC-001)"
    required: false
  - name: story
    description: "--story <US-ID> - implementar una sola story (p. ej. US-001)"
    required: false
  - name: queue
    description: "--queue - procesar la cola batch .bmad/batch-queue.yaml"
    required: false
---

# /workflow:implement

## Misión

Ejecutar la fase de Implementación: desarrollo sprint por sprint (o epic / story / cola) con TDD/BDD, siguiendo el diseño técnico de las fases anteriores. Es el punto de entrada único de la implementación: sustituye a `/workflow:implement`, `/workflow:implement`, `/workflow:implement --epic` y `/workflow:implement --queue`.

**Secuencial por defecto.** `--parallel N` delega la ejecución en `/team:delivery --phase=implementation` (Agent Teams).

## Uso

```bash
/workflow:implement [<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]
```

| Modo / flag | Qué hace | Sustituye a |
|-------------|----------|-------------|
| `<N>` / `next` / `current` | Implementa el sprint N, el siguiente sprint incompleto o el activo (por defecto: actual) | `/workflow:implement`, `/workflow:implement` |
| `--epic <EPIC>` | Encola e implementa todas las stories de un epic, dependencias primero | `/workflow:implement --epic <EPIC>` |
| `--story <US-ID>` | Implementa una sola story (bucle de tareas + validación) | (una story) |
| `--queue` | Procesa la cola batch `.bmad/batch-queue.yaml` | `/workflow:implement --queue` |
| `--resume` | Reanuda desde el último checkpoint (sprint detenido o cola interrumpida) | `/workflow:implement --queue --resume` |
| `--parallel N` | Ejecuta hasta N stories independientes en paralelo delegando en `/team:delivery --phase=implementation` | `/workflow:implement --queue --parallel N` |
| `--auto` | Empieza de inmediato, sin pedir confirmación | `--auto` |
| `--dry-run` | Previsualiza el plan de ejecución; no se modifica nada | `--dry-run` |

**Fuente única de verdad:** todo cambio de estado se escribe en `.bmad/sprint-status.yaml` (esquema: `.claude/templates/project/sprint-status.md`) - transiciones de stories, `tdd_phase`, estados de las tareas, `tasks.completed` y `history`. Los archivos markdown solo llevan contenido, nunca el estado.

## Cuándo usarlo

- Tras `/workflow:design` (Standard/Enterprise) y `/workflow:start <N>` (carpeta del sprint, tareas)
- Tras `/workflow:init` en el track Quick Flow
- Cuando estés listo para programar

## Requisitos previos

Standard/Enterprise:
- Tech Spec en `project-management/tech-spec.md`, backlog en `project-management/backlog/`
- Sprint con tareas descompuestas en `project-management/sprints/sprint-{N}-{slug}/` (`sprint-goal.md`, `board.md`, `tasks/TASK-*.md`) - ejecutar `/workflow:start <N>` (o `/workflow:start <N> --tasks-only`) si faltan
- Stories presentes en `.bmad/sprint-status.yaml`

Quick Flow: una comprensión clara del bug/funcionalidad a implementar.

## Plan Mode

> **El plan mode es obligatorio.** Antes de cada tarea, Claude activa el plan mode para analizar el código afectado, proponer un plan de implementación y esperar tu validación antes de modificar nada.

## Workflow

### Paso 1: Seleccionar el alcance

1. Analizar los argumentos (modo, luego flags). Sin modo, usar el sprint actual.
2. Leer `.bmad/sprint-status.yaml` y construir la lista de stories elegibles:
   - `<N>`: las stories del sprint en `ready-for-dev` o `in-progress`
   - `--epic <EPIC>`: las stories cuyo `epic_id` coincide, no terminadas, no bloqueadas (las bloqueadas se señalan para revisión)
   - `--story <US-ID>`: esa única story
   - `--queue`: las stories con estado `pending` en `.bmad/batch-queue.yaml`, ordenadas por prioridad
3. Para un sprint, ejecutar antes `/gate:check sprint`; si el gate falla, mostrar los problemas y detenerse.

```
Sprint 1: Walking Skeleton
   Goal: Complete authentication flow end-to-end
   3 User Stories, 17 Tasks
   To Do: 15 | In Progress: 2 | Done: 0
```

### Paso 2: Construir el plan de ejecución

1. Analizar las dependencias entre stories y construir el grafo de dependencias.
2. Ordenar las stories: sin dependencias primero, luego por prioridad, luego el ID más bajo primero.
3. Identificar los grupos que pueden ejecutarse en paralelo.
4. Escribir la cola en `.bmad/batch-queue.yaml` (para `--epic` y sprints con varias stories):

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

Con `--dry-run`, mostrar el plan y detenerse:

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

Sin `--auto`, pedir confirmación antes de ejecutar.

### Paso 3: Ejecutar

- **Secuencial (por defecto):** procesar las stories una a una con el bucle de story descrito abajo, con un checkpoint tras cada story.
- **`--parallel N`:** entregar las stories independientes (sin dependencia pendiente) a `/team:delivery --phase=implementation`, que lanza hasta N compañeros en paralelo. `/team:delivery` escribe sus transiciones en el mismo `.bmad/sprint-status.yaml`; las stories con dependencias esperan a que sus prerrequisitos estén `done`.

```
Mode: Parallel (3 workers)
Worker 1: US-010 - User registration       [running]
Worker 2: (waiting for dependencies)
[10:15] US-010 done -> starting US-011, US-012, US-014 in parallel
[10:30] US-013 done (deps US-010, US-011 satisfied)
```

#### Bucle de story

Para cada story en `ready-for-dev` o `in-progress`:

1. **Pasar la story a `in-progress`** (`status`, `previous_status`, `tdd_phase`, entrada `history` en el YAML).
2. **Mostrar los criterios de aceptación** (Gherkin).
3. **Procesar cada tarea** con el bucle de tareas.

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

#### Bucle de tareas (TDD)

Para cada tarea en `to-do`, en el orden de procesamiento indicado abajo:

**3.1 Mostrar la tarea** (estimación, descripción, archivos a modificar, Definition of Done).

**3.2 Plan mode (obligatorio).** Explorar el código afectado y las dependencias, documentar los hallazgos y proponer un plan: archivos a crear/modificar, tests a escribir primero, riesgos y mitigaciones. Esperar la validación:

```
[continue] Continuar   [skip] Omitir esta tarea   [block] Marcar como bloqueada   [stop] Detener (estado guardado)
```

**3.3 Marcar la tarea `in-progress`.** En `.bmad/sprint-status.yaml`: establecer `stories.<US>.tasks.status.<TASK>: in-progress`; para la primera tarea de una story `ready-for-dev`, pasar la story a `in-progress` (`status`, `previous_status`, `tdd_phase`, entrada de historial). Regenerar `board.md` (vista generada) y actualizar `index.md`.

**3.4 Ciclo TDD.**

```
RED       Escribir tests que fallan        -> FAILED (esperado)
GREEN     Implementar el código mínimo     -> PASSED
REFACTOR  Mejorar la calidad               -> PASSED (sin regresión)
```

Actualizar `tdd_phase` (`red` -> `green` -> `refactor`) en el YAML en cada fase.

**3.5 Verificación de la Definition of Done.**

```
- [x] Código escrito y funcional
- [x] Tests en verde (3/3)
- [ ] Código revisado -> a cargo de TASK-XXX [REV]
```

**3.6 Marcar la tarea `done`.** Pedir el tiempo real invertido y luego actualizar:
- `.bmad/sprint-status.yaml`: `tasks.status.<TASK>: done` y `tasks.completed` (= número de tareas `done`)
- Metadatos de contenido del archivo de la tarea (`time_spent`, `updated_at`; sin estado)
- `board.md` (regenerado desde el YAML), `index.md`, métricas del sprint

**3.7 Commit convencional** con la referencia de la story:

```
feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add unit tests for User entity

Refs: TASK-001, US-001
```

#### Validación de la story

Cuando todas las tareas de una story están `done`: comprobar cada criterio de aceptación, ejecutar los tests E2E si existen, ejecutar el quality gate (`/gate:check story` si está configurado) y hacer transitar la story (`in-progress` -> `review` -> `done`) en el YAML, con `previous_status` y una entrada `history`. Actualizar el progreso del EPIC (el estado del EPIC se deriva).

```
US-001 validation: 4/4 tasks, acceptance criteria met, E2E passed
US-001 -> done  |  EPIC-001: 1/3 stories (33%)
```

Tras cada transición se aplican las reglas `routing.auto_transitions` (ver `/project:backlog move story --auto`).

### Paso 4: Gestionar fallos y bloqueos

- **Tarea bloqueada:** marcarla `blocked` con el motivo en el YAML y elegir: [1] omitirla y continuar con la siguiente tarea no bloqueada, [2] intentar resolver el bloqueo, [3] detener.
- **Story fallida (cola / epic):** marcarla `failed` con el error, la fase TDD y el último checkpoint; las stories que dependen de ella se omiten. Aplicar `resume_on_failure` de los ajustes de la cola (continuar o detener). Corregir la causa y ejecutar `/workflow:implement --resume`.

### Paso 5: Checkpoints y reanudación

Se guarda un checkpoint tras cada story en `.bmad/batch-queue.yaml`:

```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

`--resume` recarga el checkpoint (o, para un sprint detenido, la última tarea completada) y continúa:

```
Resuming Sprint 1: Walking Skeleton - 8/17 tasks (47%)
Last completed: TASK-008 [BE] JWT Token Service
Next task: TASK-009 [FE-WEB] Login Controller - continue? [y/n]
```

### Paso 6: Informe

```
Batch complete: 5 done | 0 failed | 0 skipped
US-010 45 min | US-011 38 min | US-012 52 min | US-013 28 min | US-014 35 min
Total 3h 18min - average 40 min per story
```

Cuando todas las stories de un sprint están `done`:

```
Sprint 1 complete: 5/5 stories, 21 points, velocity 21 pts/sprint
Hours: 38h actual vs 42h estimated | Test coverage: 82% | Commits: 23
sprint-review.md generated, sprint-retro.md template ready
```

Próximas acciones: `/workflow:review`, `/workflow:retro`, `/workflow:implement <N+1>` o `/workflow:status`.

## Orden de procesamiento de las tareas

| Orden | Tipo | Descripción |
|-------|------|-------------|
| 1 | `[DB]` | Base de datos (entidades, migraciones, repositorios) |
| 2 | `[BE]` | Backend (servicios, APIs, lógica de negocio) |
| 3 | `[FE-WEB]` | Frontend Web (controladores, plantillas, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (pantallas, blocs, widgets) |
| 5 | `[TEST]` | Tests adicionales (E2E, rendimiento) |
| 6 | `[DOC]` | Documentación |
| 7 | `[REV]` | Revisión de código |

## Comandos de control

| Comando | Acción |
|---------|--------|
| `continue` | Validar el plan y continuar |
| `skip` | Omitir esta tarea (sigue `to-do`) |
| `block [motivo]` | Marcar la tarea `blocked` con un motivo |
| `stop` | Detener y guardar el estado actual |
| `status` | Mostrar el progreso (`/workflow:status`) |
| `board` | Mostrar el tablero Kanban (`/workflow:status --board`) |

## Actualizaciones automáticas

En cada cambio de estado, todos los estados van a `.bmad/sprint-status.yaml`; los archivos markdown solo reciben contenido.

1. **sprint-status.yaml:** estado de las tareas (`to-do | in-progress | done | blocked`), `tasks.completed`, `tdd_phase`, transiciones de stories (`ready-for-dev` -> `in-progress` -> `review` -> `done`) con `previous_status` y una entrada `history`
2. **Archivo de tarea:** `time_spent`, `updated_at` (sin estado)
3. **Archivo de user story:** visualización del progreso de tareas (sin estado)
4. **Archivo EPIC:** progreso de stories (estado derivado)
5. **board.md:** columnas Kanban regeneradas desde el YAML
6. **index.md:** métricas globales

## Archivos actualizados

| Archivo | Actualizaciones |
|---------|-----------------|
| `.bmad/sprint-status.yaml` | Estado de stories, `tdd_phase`, estados de tareas, `tasks.completed`, historial |
| `.bmad/batch-queue.yaml` | Entradas de la cola, estados, checkpoints |
| `project-management/backlog/user-stories/US-XXX.md` | Progreso de tareas (solo contenido) |
| `project-management/backlog/epics/EPIC-XXX.md` | Progreso de stories |
| `project-management/sprints/sprint-{N}-{slug}/board.md` | Columnas Kanban (regeneradas) |
| `project-management/sprints/sprint-{N}-{slug}/tasks/*.md` | Tiempo invertido (sin estado) |
| `project-management/sprints/sprint-{N}-{slug}/sprint-review.md` | Generado al final |

## Configuración de la cola

Ajustes en `.bmad/batch-queue.yaml`:

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

Si Ralph está configurado, definir `bmad_integration.batch_queue_file: ".bmad/batch-queue.yaml"` en `ralph.yml` para integrar la ejecución batch.

## Modo Quick Flow

Para correcciones de bugs y pequeñas funcionalidades no hace falta estructura de sprint:
- Correcciones de bugs: `/qa:tdd` (enfoque TDD)
- Pequeñas funcionalidades: los comandos `/{tech}:*` específicos de la tecnología
- Seguimiento: `/project:backlog add task` y luego `/project:backlog move task done`

## Agentes involucrados

- **tech-lead**: Descomposición de tareas, guía de arquitectura
- **tdd-coach**: Guía metodológica TDD/BDD
- **{tech}-reviewer**: Revisión de código (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD y despliegue

## Comandos relacionados

- `/workflow:design` - Fase anterior; `/workflow:start <N>` - crear el sprint y sus tareas
- `/workflow:status` - Progreso, board (`--board`), cola (`--queue`), gates (`--gates`)
- `/team:delivery --phase=implementation` - Motor paralelo usado por `--parallel N`; `/team:delivery` - Redacción + implementación en paralelo
- `/project:backlog move story <US> <status>` - Transición manual de una story
- `/qa:tdd` - Correcciones rápidas de bugs
- `/workflow:review` - Ceremonia de sprint review
- `/workflow:retro` - Retrospectiva del sprint
