---
description: "Gestionar el backlog: añadir, listar, editar y mover EPICs, User Stories y Tareas, elegir la próxima story, cambiar el estado de las stories y aplicar las reglas de enrutamiento"
argument-hint: "<add|list|edit|move|next> <epic|story|task> [args] | move story --auto"
---

# Backlog

Punto de entrada único para gestionar el backlog del proyecto: crear, listar, editar y mover EPICs, User Stories y Tareas.

## Uso

| Invocación | Qué hace | Reemplaza |
|------------|----------|-----------|
| `/project:backlog add epic "Nombre" [prioridad]` | Crear un EPIC | `/project:backlog add epic` |
| `/project:backlog add story EPIC-XXX "Nombre" [puntos]` | Crear una User Story en un EPIC | `/project:backlog add story` |
| `/project:backlog add task US-XXX "[TIPO] Descripción" 4h` | Crear una Tarea en una User Story | `/project:backlog add task` |
| `/project:backlog list epic [estado] [prioridad]` | Listar los EPICs con estado derivado y progreso | `/project:backlog list epic` |
| `/project:backlog list story [epic EPIC-XXX \| sprint N \| status S \| backlog]` | Listar las User Stories | `/project:backlog list story` |
| `/project:backlog list task [us US-XXX \| sprint N \| type T \| status S]` | Listar las Tareas | `/project:backlog list task` |
| `/project:backlog edit epic EPIC-XXX [campo] [valor]` | Modificar un EPIC | `/project:backlog edit epic` |
| `/project:backlog edit story US-XXX [campo] [valor]` | Modificar una User Story | `/project:backlog edit story` |
| `/project:backlog move task TASK-XXX <in-progress\|blocked\|done>` | Cambiar el estado de una Tarea | `/project:backlog move task` |
| `/project:backlog next story [--claim]` | Elegir la próxima story `ready-for-dev` según prioridad y dependencias (`--claim` la pasa a `in-progress`) | `/project:backlog next story` |
| `/project:backlog move story US-XXX <backlog\|ready-for-dev\|in-progress\|review\|done\|blocked\|sprint-N> ["motivo"]` | Cambiar el estado de una story mediante la máquina de estados BMAD, con gates | `/project:backlog move story` |
| `/project:backlog move story --auto [--dry-run]` | Evaluar las reglas `routing.auto_transitions` de `.bmad/sprint-status.yaml` y aplicar las transiciones disparadas | `/project:backlog move story --auto` |

No existen `edit task` ni `move epic`: los estados de los EPICs son derivados. Los estados de las stories se cambian con `move story` (máquina de estados con gates); las reglas `routing.auto_transitions` también se aplican tras cada transición.

## Argumentos

$ARGUMENTS: `<acción> <entidad> [args]`

1. Primera palabra = acción: `add`, `list`, `edit`, `move` o `next`
2. Segunda palabra = entidad: `epic`, `story` o `task` (`move` acepta `task` o `story`, `next` solo `story`)
3. El resto se transmite a la sección correspondiente más abajo
4. Acción o entidad ausente o desconocida: mostrar la tabla de Uso y detenerse. `move epic`: responder que el estado del EPIC es derivado

## Reglas comunes

### Fuente de verdad del estado

- **El estado vive únicamente en `.bmad/sprint-status.yaml`** (fuente de verdad única, esquema: `.claude/templates/project/sprint-status.md`). Usar las cadenas de estado exactas del esquema.
  - Story: `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`
  - Tarea (`stories.<US>.tasks.status.<TASK>`): `to-do`, `in-progress`, `blocked`, `done`
- **Los archivos markdown solo contienen contenido** (nombre, descripción, puntos, criterios, estimación, texto del bloqueo, tiempo dedicado). No escribir nunca un estado en un archivo de EPIC, US o tarea, ni en las tablas que contienen.
- **El estado de un EPIC es derivado, nunca almacenado**: todas las stories `backlog` (o ninguna story) = no iniciado; todas `done` = terminado; alguna `blocked` y ninguna en curso = bloqueado; en caso contrario en curso.
- Los boards (`board.md`) son vistas generadas: regenerarlos desde `.bmad/sprint-status.yaml`, nunca editarlos a mano.
- Si falta `.bmad/sprint-status.yaml`, crearlo a partir del esqueleto de `/workflow:init`.

### Rutas y plantillas

| Elemento | Ruta |
|----------|------|
| EPICs | `project-management/backlog/epics/EPIC-{ID}-{slug}.md` |
| User Stories | `project-management/backlog/user-stories/US-{ID}-{slug}.md` |
| Tareas (US en un sprint) | `project-management/sprints/sprint-{N}-{slug}/tasks/TASK-{ID}.md` |
| Tareas (en otro caso) | `project-management/backlog/tasks/TASK-{ID}.md` |
| Índice | `project-management/backlog/index.md` |
| Plantillas | `.claude/templates/project/{epic,user-story,task}.md` |

### Modo Plan (add, edit, move)

> **El modo plan es obligatorio** para toda acción que escriba (`add`, `edit`, `move`). Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio. `list` es de solo lectura.

### Iconos de estado (list)

| Icono | Significado |
|-------|-------------|
| 🔴 | Por hacer / backlog (no iniciado) |
| 🟡 | En curso |
| ⏸️ | Bloqueado |
| 🟢 | Terminado |

## add epic

`/project:backlog add epic "Nombre del EPIC" [prioridad]`

- **Nombre** (obligatorio), **Prioridad** (opcional): High, Medium, Low (por defecto: Medium)

1. **Generar el ID**: leer `project-management/backlog/epics/`, encontrar el último `EPIC-XXX`, incrementar
2. **Recopilar** (si no se proporcionan): descripción, MMF (Minimum Marketable Feature), 2-3 objetivos de negocio, criterios de éxito
3. **Crear el archivo** desde `.claude/templates/project/epic.md`, reemplazando `{ID}`, `{NOM}`, `{PRIORITE}`, `{MINIMUM_MARKETABLE_FEATURE}`, `{DESCRIPTION}`, `{DATE}` (AAAA-MM-DD), `{OBJECTIF_1}`, `{OBJECTIF_2}`, `{CRITERE_1}`, `{CRITERE_2}`. No se escribe ningún estado.
4. **Actualizar el índice**: añadir el EPIC a la tabla de EPICs, actualizar los contadores

```
✅ EPIC creado con éxito!

📋 EPIC-{ID}: {NOMBRE}
   Estado: derivado de sus stories (ninguna todavía)
   Prioridad: {PRIORIDAD}
   Archivo: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Próximos pasos:
  /project:backlog add story EPIC-{ID} "Nombre de la User Story"
```

Ejemplo: `/project:backlog add epic "Sistema de autenticación" High` crea `project-management/backlog/epics/EPIC-001-sistema-de-autenticacion.md`.

Validación: nombre no vacío, prioridad entre High/Medium/Low, `project-management/backlog/epics/` existe, ID único.

## add story

`/project:backlog add story EPIC-XXX "Nombre de la US" [puntos]`

- **EPIC-ID** (obligatorio), **Nombre** (obligatorio), **Puntos** (opcional): Fibonacci (1, 2, 3, 5, 8)

1. **Validar el EPIC**: debe existir en `project-management/backlog/epics/`; si no, mostrar un error con los EPICs disponibles
2. **Generar el ID**: leer `project-management/backlog/user-stories/`, encontrar el último `US-XXX`, incrementar
3. **Recopilar**: persona (P-XXX o descripción), acción, beneficio, al menos 2 criterios de aceptación en formato Gherkin, puntos (estimar si no se proporcionan)
4. **Crear el archivo** desde `.claude/templates/project/user-story.md`, reemplazando `{ID}`, `{NOM}`, `{EPIC_ID}`, `{SPRINT}` ("Backlog" = sin asignar), `{POINTS}`, `{PERSONA}`, `{PERSONA_ID}`, `{ACTION}`, `{BENEFICE}`, `{DATE}`; añadir los criterios Gherkin
5. **Registrar el estado** en `.bmad/sprint-status.yaml`: añadir `stories.US-{ID}` con `title`, `status: backlog`, `story_points`, `epic_id`, `priority`, `dependencies: []`, `tasks: { total: 0, completed: 0, list: [] }`, `history: []`
6. **Actualizar el EPIC** (añadir la US a su tabla de User Stories, sin columna de estado; actualizar el progreso) y el **índice** (sección «Backlog priorizado», contadores)

```
✅ User Story creada con éxito!

📖 US-{ID}: {NOMBRE}
   EPIC: {EPIC_ID}
   Estado: backlog (.bmad/sprint-status.yaml)
   Puntos: {PUNTOS}
   Archivo: project-management/backlog/user-stories/US-{ID}-{slug}.md

Próximos pasos:
  /project:backlog move story US-{ID} sprint-X                # Asignar a un sprint
  /project:backlog add task US-{ID} "[BE] ..." 4h    # Añadir tareas
```

Ejemplo: `/project:backlog add story EPIC-001 "Inicio de sesión" 5`.

Verificación INVEST: **I**ndependiente, **N**egociable, **V**aliosa, **E**stimable (puntos proporcionados), **S**mall/pequeña (≤ 8 puntos, si no sugerir dividir), **T**esteable (criterios de aceptación claros).

## add task

`/project:backlog add task US-XXX "[TIPO] Descripción" estimación`

- **US-ID** (obligatorio), **Descripción** con el tipo entre corchetes (obligatorio), **Estimación** en horas (obligatoria, p. ej. 4h, 2h, 0.5h)

| Tipo | Prefijo | Descripción |
|------|---------|-------------|
| Base de datos | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unitarios, Integración, E2E |
| Documentación | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revisión | `[REV]` | Code Review |

1. **Validar la US**: debe existir en `project-management/backlog/user-stories/`; obtener su sprint (si lo hay); si no, mostrar un error
2. **Validar la estimación**: mínimo 0.5h, máximo 8h, ideal 2-4h; si > 8h, sugerir dividir la tarea
3. **Generar el ID**: encontrar el último ID de tarea, incrementar
4. **Crear el archivo** desde `.claude/templates/project/task.md`, reemplazando `{ID}`, `{DESCRIPTION}`, `{US_ID}`, `{TYPE}`, `{ESTIMATION}`, `{DATE}`, `{DESCRIPTION_DETAILLEE}`; ruta: directorio de tareas del sprint si la US está en un sprint, si no `project-management/backlog/tasks/`
5. **Registrar la tarea** en `.bmad/sprint-status.yaml`: añadir `TASK-{ID}` a `stories.{US_ID}.tasks.list`, establecer `stories.{US_ID}.tasks.status.TASK-{ID}: to-do`, actualizar `stories.{US_ID}.tasks.total` (mantener `completed` = número de tareas `done`)
6. **Actualizar la US** (añadir la tarea a su tabla de tareas, sin columna de estado; actualizar el progreso)
7. **Actualizar el board** si la US está en un sprint: regenerar `board.md` desde `.bmad/sprint-status.yaml` (la tarea aparece en `to-do`) y actualizar las métricas

```
✅ Tarea creada con éxito!

🔧 TASK-{ID}: {DESCRIPCIÓN}
   US: {US_ID}
   Tipo: {TIPO}
   Estado: to-do (.bmad/sprint-status.yaml)
   Estimación: {ESTIMACIÓN}h
   Archivo: {RUTA}

Próximos pasos:
  /project:backlog move task TASK-{ID} in-progress  # Iniciar la tarea
  /workflow:status --board                                     # Ver el Kanban
```

Ejemplos: `/project:backlog add task US-001 "[BE] Endpoint API de login" 4h`, `/project:backlog add task US-001 "[TEST] Tests unitarios de AuthService" 3h`.

Validación: tipo válido, estimación entre 0.5h y 8h, la User Story existe, ID único.

## list epic

`/project:backlog list epic [estado] [prioridad]`

- **Estado** (derivado de las stories): todo, in-progress, blocked, done, all (por defecto: all)
- **Prioridad**: high, medium, low

1. Recorrer `project-management/backlog/epics/`, leer cada `EPIC-XXX-*.md` para los metadatos de contenido (nombre, prioridad)
2. Leer los estados de sus stories en `.bmad/sprint-status.yaml`
3. Aplicar los filtros; para cada EPIC contar el total de US, las US por estado y el porcentaje de progreso (estado del EPIC derivado como se describe en las Reglas comunes)
4. Mostrar la tabla

```
📋 EPICs del proyecto

| ID | Nombre | Estado | Prioridad | US | Progreso |
|----|--------|--------|-----------|-----|----------|
| EPIC-001 | Autenticación | 🟡 En curso | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catálogo | 🔴 Por hacer | Medium | 8 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Resumen: 2 EPICs | 🔴 1 Por hacer | 🟡 1 En curso | 🟢 0 Terminado
```

Con muchos EPICs (p. ej. 12), usar el formato compacto: una línea por grupo de estado (`🔴 Por hacer (5): EPIC-002, EPIC-003, ...`, `🟡 En curso (4): EPIC-001 (40%), ...`, `⏸️ Bloqueado`, `🟢 Terminado`).

Ejemplos: `/project:backlog list epic`, `/project:backlog list epic in-progress`, `/project:backlog list epic all high`, `/project:backlog list epic blocked`.

Para el detalle de un EPIC, sugerir: `cat project-management/backlog/epics/EPIC-001-*.md`.

## list story

`/project:backlog list story [filtro] [valor]`

- `epic EPIC-XXX`: filtrar por EPIC | `sprint N`: filtrar por sprint | `status STATUS`: backlog, ready-for-dev, in-progress, review, done, blocked | `backlog`: solo las US no asignadas a un sprint

1. Recorrer `project-management/backlog/user-stories/`, leer cada `US-XXX-*.md` para los metadatos de contenido (título, EPIC, sprint)
2. Leer el estado de cada US, los estados y los recuentos de tareas en `.bmad/sprint-status.yaml`
3. Aplicar los filtros; por US contar el total de tareas, las tareas por estado y el porcentaje de progreso
4. Mostrar una tabla agrupada por EPIC o por sprint según el contexto

```
📖 User Stories - EPIC-001: Autenticación

| ID | Nombre | Sprint | Estado | Puntos | Tareas | Progreso |
|----|--------|--------|--------|--------|--------|----------|
| US-001 | Inicio de sesión | Sprint 1 | 🟡 En curso | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Registro | Sprint 1 | 🔴 Por hacer | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Contraseña olvidada | Backlog | 🔴 Por hacer | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 puntos | 🔴 2 | 🟡 1 | 🟢 0
```

- Por sprint: columnas `ID | EPIC | Nombre | Estado | Puntos | Tareas | Progreso`, pie `Sprint 1: 3 US | 13 puntos | Terminado: 5 pts (38%)`
- Backlog (sin asignar): columnas `ID | EPIC | Nombre | Prioridad | Puntos | Estado`, pie `Backlog: 3 US | 16 puntos por planificar`

Ejemplos: `/project:backlog list story`, `... list story epic EPIC-001`, `... list story sprint 1`, `... list story status blocked`, `... list story backlog`.

Acciones sugeridas: `/project:backlog move story US-XXX sprint-2` (asignar a un sprint), `/project:backlog move story US-XXX in-progress` (cambiar el estado), `/project:backlog add task US-XXX "[BE] ..." 4h`.

## list task

`/project:backlog list task [filtro] [valor]`

- `us US-XXX` | `sprint N` | `type TYPE` (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV) | `status STATUS` (to-do, in-progress, blocked, done)

1. Recorrer `project-management/sprints/sprint-{N}-{slug}/tasks/` y `project-management/backlog/tasks/` (si existe), leer cada `TASK-XXX.md` para los metadatos de contenido (tipo, descripción, estimación)
2. Leer el estado de cada tarea en `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`)
3. Aplicar los filtros; calcular el total de horas estimadas, las horas completadas, el desglose por tipo y por estado
4. Mostrar

```
🔧 Tareas - US-001: Inicio de sesión

| ID | Tipo | Descripción | Estado | Est. | Dedicado |
|----|------|-------------|--------|------|----------|
| TASK-001 | [DB] | Entidad User | 🟢 Terminado | 2h | 2h |
| TASK-003 | [BE] | Endpoint API de login | 🟡 En curso | 4h | 2h |
| TASK-004 | [FE-WEB] | Controlador de auth | 🔴 Por hacer | 3h | - |
| TASK-005 | [FE-MOB] | Pantalla de login | ⏸️ Bloqueado | 6h | - |

───────────────────────────────────────────────────
US-001: 4 tareas | 15h estimadas | 4h completadas (27%)
```

- Por sprint: resumen por estado (`🔴 Por hacer (8 tareas, 24h)`, ...) y por tipo (una barra por `[DB]`, `[BE]`, ...), pie `Sprint 1: 25 tareas | 77h estimadas | 35h completadas (45%)`
- Bloqueadas (`status blocked`): columnas `ID | US | Tipo | Descripción | Bloqueo`, pie `2 tareas bloqueadas | 14h en espera`, y luego una lista `Acciones:` con cómo resolver cada bloqueo

Ejemplos: `/project:backlog list task`, `... list task us US-001`, `... list task sprint 1`, `... list task type BE`, `... list task status blocked`.

## edit epic

`/project:backlog edit epic EPIC-XXX [campo] [valor]`

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `name` | Nombre del EPIC | "Nuevo nombre" |
| `priority` | Prioridad | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "Descripción del MMF" |
| `description` | Descripción | "Nueva descripción" |

> **El estado no es editable aquí.** El estado de un EPIC se deriva de los estados de sus stories en `.bmad/sprint-status.yaml`. Para cambiar el estado de una story usar `/project:backlog move story`; para el de una tarea, `/project:backlog move task`.

- **Modo interactivo** (solo el ID): mostrar los campos actuales numerados (Nombre, Prioridad, MMF, Descripción) y preguntar cuál modificar (`1-4`, o `q` para salir)
- **Modo directo** (campo y valor): modificar directamente el campo

Pasos: validar que el EPIC existe, leer el archivo, modificar el campo, actualizar la fecha de modificación, guardar, actualizar el índice si es necesario.

```
✅ EPIC actualizado!

📋 EPIC-001: Sistema de autenticación

Modificación:
  Prioridad: High → Medium

Archivo: project-management/backlog/epics/EPIC-001-sistema-de-autenticacion.md
```

Ejemplos: `/project:backlog edit epic EPIC-001`, `... edit epic EPIC-001 name "Autenticación y autorización"`, `... edit epic EPIC-001 priority Low`, `... edit epic EPIC-001 mmf "Permitir SSO y 2FA"`.

Validación: el campo debe ser modificable, prioridad High/Medium/Low, nombre no vacío.

## edit story

`/project:backlog edit story US-XXX [campo] [valor]`

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `name` | Nombre de la US | "Nuevo nombre" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | EPIC padre | EPIC-002 |
| `persona` | Persona asociada | P-001 |
| `story` | Texto de la US | "Como..." |
| `criteria` | Criterios de aceptación | (modo interactivo) |

> **El estado no es editable aquí.** Los estados viven en `.bmad/sprint-status.yaml`. Para cambiar el estado de una story usar `/project:backlog move story`; para el de una tarea, `/project:backlog move task`.

- **Modo interactivo** (solo el ID): mostrar los campos numerados (Nombre, EPIC, Puntos, Persona, Story, Criterios de aceptación) y preguntar cuál modificar (`1-6`, o `q`)
- **Modo directo**: p. ej. `/project:backlog edit story US-001 points 8`
- **Criterios de aceptación** (interactivo): listar los criterios (CA-1, CA-2, ...) y preguntar `(a)ñadir, (m)odificar, (e)liminar, (s)alir`; un criterio nuevo se introduce en Gherkin (GIVEN / WHEN / THEN)

Pasos: validar que la US existe, leer el archivo, modificar el campo, actualizar la fecha de modificación, guardar, actualizar el EPIC padre si ha cambiado, actualizar el índice.

```
✅ User Story actualizada!

📖 US-001: Inicio de sesión

Modificación:
  Puntos: 5 → 8

⚠️ Atención: 8 puntos es el máximo recomendado.
   Considera dividir esta US si es demasiado compleja.

Archivo: project-management/backlog/user-stories/US-001-inicio-de-sesion.md
```

Si cambia el EPIC padre (`EPIC: EPIC-001 → EPIC-002`), indicar las actualizaciones: US retirada de la lista del EPIC anterior, añadida a la del nuevo, índice actualizado; actualizar también `epic_id` en `.bmad/sprint-status.yaml`.

Ejemplos: `/project:backlog edit story US-001`, `... edit story US-001 points 3`, `... edit story US-001 epic EPIC-002`, `... edit story US-001 name "Inicio de sesión con SSO"`.

Validación: puntos Fibonacci (1, 2, 3, 5, 8), avisar de dividir si > 8, el EPIC debe existir, la persona debe estar definida en personas.md.

## move task

`/project:backlog move task TASK-XXX <destino>`

- **TASK-ID** (obligatorio); **Destino** (obligatorio): `in-progress` (iniciar), `blocked`, `done`. Para el estado de una **story** usar `/project:backlog move story`.

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

| Desde | Hacia | Permitido |
|-------|-------|-----------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Prohibido** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (retroceso) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (reapertura) |

Proceso:

1. **Validar la tarea**: encontrar el archivo de la tarea, leer su estado actual en `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), identificar la US y el sprint
2. **Validar la transición** con la tabla; to-do → done se bloquea y se sugiere `in-progress`
3. **Hacia blocked**: preguntar el bloqueo (`¿Cuál es el bloqueo de TASK-XXX?`)
4. **Hacia done**: preguntar el tiempo dedicado (`¿Tiempo dedicado a TASK-XXX? (estimación: 4h)`)
5. **Actualizar el estado**: escribirlo en `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), recalcular `stories.<US>.tasks.completed` (= número de tareas `done`); nunca en el archivo de la tarea. En el archivo de la tarea solo cambia el contenido: texto del bloqueo si blocked, tiempo dedicado si done, fecha de modificación
6. **Actualizar el board**: regenerar el `board.md` del sprint desde `.bmad/sprint-status.yaml` y actualizar las métricas
7. **Actualizar la User Story** (contenido de la lista de tareas, progreso recalculado desde `.bmad/sprint-status.yaml`); si todas las tareas están done, sugerir terminar la US
8. **Actualizar el índice** (contadores globales)

Salidas:

```
✅ Tarea movida!

🔧 TASK-003: Endpoint API de login
   Antes: to-do
   Después: in-progress

📖 US-001: Inicio de sesión
   Progreso: 2/6 → 3/6 (50%)

Próximos pasos:
  /project:backlog move task TASK-003 done       # Al terminar
  /project:backlog move task TASK-003 blocked    # Si se bloquea
```

Para `done`, mostrar también la estimación frente al tiempo real (`Estimación: 4h`, `Tiempo real: 3.5h ✓`), la barra de progreso de la US y los totales del sprint (tareas terminadas, horas completadas). Cuando todas las tareas de la US están done:

```
🎉 Todas las tareas de US-001 están terminadas!

Siguiente paso recomendado:
  /project:backlog move story US-001 done
```

Error de workflow:

```
❌ Transición no permitida!

🔧 TASK-004: Controlador de auth
   Estado actual: to-do
   Transición solicitada: → done

Regla: Una tarea debe pasar por "In Progress" antes de "Done"

Acción correcta:
  /project:backlog move task TASK-004 in-progress
  # ... trabajar en la tarea ...
  /project:backlog move task TASK-004 done
```

Para `blocked`, mostrar `Estado: in-progress → blocked`, el texto del bloqueo y cómo desbloquear (terminar la tarea que bloquea y luego `/project:backlog move task TASK-005 in-progress`).

Ejemplos: `/project:backlog move task TASK-001 in-progress`, `... move task TASK-001 done`, `... move task TASK-001 blocked`, `... move task TASK-001 in-progress` (desbloquear).

Métricas actualizadas en cada movimiento: número de tareas por estado, horas estimadas vs reales, progreso de la US, progreso del sprint, board Kanban.

## next story

`/project:backlog next story [--claim]`

- **--claim** (opcional): pasa automáticamente la story a `in-progress`

1. **Cargar**: leer `.bmad/sprint-status.yaml`, recopilar las stories con estado `ready-for-dev`, ordenarlas por prioridad (si está definida) o por ID
2. **Verificar los requisitos previos** de cada story lista: sin dependencias bloqueantes (todas las stories `Depends on` están en `done` o `review`; si no, indicar cuáles bloquean), puntos de story estimados, tareas descompuestas, criterios de aceptación definidos
3. **Seleccionar**, en este orden: todas las dependencias resueltas, sin dependencias bloqueantes, ID de story más bajo (antes en el backlog), puntos de story más bajos (las más simples primero)
4. **Mostrar** la story: ID y título, puntos, EPIC, criterios de aceptación, lista de tareas, requisitos previos, dependencias, notas
5. **Reservar** (solo con `--claim`): mismo efecto que `/project:backlog move story US-XXX in-progress` (gates, historial): estado `in-progress`, `tdd_phase` en `red`, `current_task` en la primera tarea, entrada añadida a `history`
6. **Guiar**: primera tarea a trabajar y recordatorio TDD

```
═══════════════════════════════════════════════════════
         Próxima story lista para desarrollo
═══════════════════════════════════════════════════════

📖 US-012: Implementar la página de perfil de usuario
   Epic: EPIC-003 (Gestión de usuarios)
   Puntos: 5
   Prioridad: High

Criterios de aceptación (3):
□ AC1: El usuario puede ver la información de su perfil
□ AC2: El usuario puede editar su nombre y su email
□ AC3: Los cambios se validan antes de guardar

Tareas (4):
□ TASK-031 [BE] Crear el endpoint API del perfil
□ TASK-033 [FE] Crear el componente de perfil

Requisitos previos:
✅ Sin dependencias bloqueantes
✅ Puntos de story estimados
✅ Tareas descompuestas
✅ Criterios de aceptación definidos

Dependencias:
✅ US-001 (Página de inicio de sesión) — done

Para empezar:
  /project:backlog move story US-012 in-progress
O usar: /project:backlog next story --claim
═══════════════════════════════════════════════════════
```

Cuando ninguna story está lista, mostrar el estado del backlog (stories en backlog por refinar, en curso, bloqueadas) y sugerencias: refinar las stories del backlog (`/project:migrate --stories`), ayudar con las stories en curso, desbloquear una story bloqueada (mostrar su `blocked_reason`), ver el grafo de dependencias (`/project:report deps`), ver el sprint (`/workflow:status`) y comprobar la preparación de las stories (`/gate:check backlog`).

Tras reservar una story, seguir el TDD: 🔴 RED (test que falla para el primer AC/tarea), 🟢 GREEN (código mínimo para pasar), 🔵 REFACTOR (limpiar, los tests siguen en verde), y repetir por cada tarea. `tdd_phase` en `.bmad/sprint-status.yaml` registra la fase.

Ejemplos: `/project:backlog next story`, `/project:backlog next story --claim`.

## move story

`/project:backlog move story US-XXX <estado> ["motivo"]`

- **US-ID** (obligatorio); **Estado** (obligatorio): `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`, o `sprint-N` (asigna la story al sprint N, p. ej. `sprint-2`)
- **motivo** (obligatorio para `blocked`): se almacena en `blocked_reason`

```
backlog → ready-for-dev → in-progress → review → done
                              ↑            │
                              └────────────┘  (cambios solicitados)
cualquier estado → blocked → previous_status (reanudar)
```

| Desde | Hacia | Permitido |
|-------|-------|-----------|
| backlog | ready-for-dev | ✅ |
| ready-for-dev | in-progress | ✅ |
| in-progress | review | ✅ |
| review | done | ✅ |
| review | in-progress | ✅ (cambios solicitados) |
| cualquiera | blocked | ✅ (motivo obligatorio) |
| blocked | previous_status | ✅ (reanudar) |
| in-progress | done | ❌ **Prohibido** (pasar por `review`) |

Proceso:

1. **Validar la story**: leer `.bmad/sprint-status.yaml`, encontrar la story por ID, obtener su estado actual
2. **Validar la transición** según la tabla anterior; si no, mostrar las transiciones válidas desde el estado actual
3. **Verificar las gates** del estado destino; una gate fallida bloquea la transición y lista las acciones requeridas:

| → Destino | Requisitos de la gate |
|-----------|-----------------------|
| `ready-for-dev` | Criterios de aceptación definidos, puntos de story estimados, tareas descompuestas |
| `in-progress` | Sin dependencias bloqueantes, desarrollador asignado (opcional) |
| `review` | Todas las tareas completadas, tests en verde (TDD green o refactor), código enviado |
| `done` | Código revisado, todos los AC validados, checklist DoD completa |
| `blocked` | `blocked_reason` proporcionado |

4. **Ejecutar la transición**: todo se escribe en `.bmad/sprint-status.yaml` (fuente única de verdad del estado, esquema en `.claude/templates/project/sprint-status.md`); los archivos Markdown US/EPIC solo contienen contenido y nunca reciben un estado:
   1. Almacenar `previous_status` en `stories.<US>`
   2. Actualizar `stories.<US>.status`
   3. Establecer las marcas de tiempo
   4. Actualizar `stories.<US>.tdd_phase` si procede
   5. Añadir una entrada a `stories.<US>.history` (`timestamp`, `from`, `to`, `by`, `reason`)
5. **Aplicar los efectos secundarios**: `→ in-progress`: `tdd_phase: red`, `current_task` = primera tarea | `→ review`: `tdd_phase: refactor`, borrar `current_task` | `→ done`: borrar `tdd_phase`, registrar la hora de finalización | `→ blocked`: almacenar `blocked_reason` y `previous_status`
6. **Aplicar las reglas de enrutamiento**: tras cada transición, evaluar `routing.auto_transitions` (ver `move story --auto` más abajo) para encadenar las transiciones dependientes

```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "All tasks complete"
```

Transición exitosa:

```
📖 US-005: Autenticación de usuario

Estado: in-progress → review ✅

Verificación de gates:
✅ Todas las tareas completadas (5/5)
✅ Tests en verde
✅ Código enviado

Historial actualizado:
• 2026-01-29 10:00 - in-progress → review (manual)
• 2026-01-27 09:00 - ready-for-dev → in-progress
```

Gate fallida:

```
📖 US-005: Autenticación de usuario

Solicitado: in-progress → review ❌

Gates fallidas:
❌ Tareas incompletas: 3/5
❌ La fase TDD es 'red' - los tests deben pasar primero

Acciones requeridas:
1. Completar las tareas restantes (TASK-015, TASK-016)
2. Pasar el TDD a fase green: .bmad/sprint-status.yaml → US-005: tdd_phase: green

Luego reintentar: /project:backlog move story US-005 review
```

Transición inválida: mostrar el estado actual y el solicitado, el motivo (`No se puede pasar directamente de 'in-progress' a 'done'`), las transiciones válidas desde el estado actual y la máquina de estados.

Casos particulares:

- **Bloquear**: `/project:backlog move story US-003 blocked "Esperando credenciales de la API"` almacena el motivo y conserva el estado anterior para reanudar
- **Desbloquear**: `/project:backlog move story US-003 in-progress` vuelve al estado anterior
- **Cambios solicitados** (review): `/project:backlog move story US-005 in-progress`
- **Asignar a un sprint**: `/project:backlog move story US-003 sprint-2` asigna la story al sprint 2, crea el directorio del sprint si es necesario; el estado de la story se conserva
- **Cascada a las tareas**: `→ in-progress` deja las tareas en su estado actual (se inician individualmente); `→ done` comprueba que todas las tareas estén `done` y avisa si no; `→ blocked` marca como `blocked` todas las tareas en curso

Próximos pasos según el estado destino: `→ in-progress`: `/workflow:implement --story US-XXX` | `→ review`: `/gate:check story` (validar la DoD) | `→ done`: `/project:backlog next story` (y `/workflow:review` cuando el sprint haya terminado) | `→ blocked`: resolver el bloqueo y luego `/project:backlog move story US-XXX in-progress`.

### move story --auto

`/project:backlog move story --auto [--dry-run]`

Evalúa las reglas de enrutamiento y hace transitar las stories en consecuencia (sin ID de story). **--dry-run** previsualiza las transiciones sin aplicarlas. Las mismas reglas también se aplican tras cada transición `move story` y, según los ajustes de `routing.auto_transitions`, en el hook Stop, tras completar una tarea y al iniciar la sesión.

1. **Cargar**: leer `.bmad/sprint-status.yaml`, cargar `routing.auto_transitions.rules`, obtener todas las stories
2. **Evaluar** cada regla para cada story:

| Regla | `when` | Desde → Hacia |
|-------|--------|---------------|
| `all_tasks_complete` | `tasks.completed == tasks.total && tasks.total > 0` | `in-progress` → `review` |
| `review_approved` | `review.approved == true` | `review` → `done` |
| `blocked_detection` | `blocked_reason != null` | `*` → `blocked` |
| `unblocked` | `blocked_reason == null && previous_status != null` | `blocked` → `previous_status` |

3. **Verificar los requisitos previos** antes de la transición automática: requisitos de gate del estado destino (igual que `move story`), ninguna regla en conflicto, story no bloqueada manualmente
4. **Ejecutar** (salvo `--dry-run`): registrar la transición, actualizar el estado, anotarla en `history` con `by: "auto-route"`, aplicar los efectos secundarios (fase TDD, etc.)
5. **Informar**: reglas evaluadas, stories verificadas, transiciones realizadas, stories sin cambios, errores o avisos

```
═══════════════════════════════════════════════════════
         Vista previa del enrutamiento (DRY RUN)
═══════════════════════════════════════════════════════
Evaluando 4 reglas de enrutamiento sobre 8 stories...

Transiciones previstas:
📖 US-005: Autenticación de usuario
   Regla: all_tasks_complete
   in-progress → review
   Motivo: 5/5 tareas completadas

📖 US-003: Integración OAuth
   Regla: unblocked
   blocked → in-progress
   Motivo: blocked_reason borrado

Resumen:
Reglas evaluadas: 4 | Stories verificadas: 8
Transiciones previstas: 2 | Sin cambios: 6

Ejecutar sin --dry-run para aplicar las transiciones.
═══════════════════════════════════════════════════════
```

Sin `--dry-run`, el informe lista `✅ US-005: in-progress → review` con la regla y los detalles, y luego `Transiciones realizadas: N`. Cuando no se dispara nada: `No se necesita ninguna transición automática.` seguido de las stories por estado.

Las reglas personalizadas y los disparadores se configuran en `.bmad/sprint-status.yaml`:

```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
    rules:
      - name: "review_timeout"
        description: "Señalar las stories en review desde hace más de 2 días"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify
      - name: "priority_bump"
        description: "Notificar las stories listas de alta prioridad"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

Próximos pasos: `/project:backlog next story` (elegir la próxima story enrutada), `/workflow:implement` (iniciar el desarrollo).

Ejemplos: `/project:backlog move story US-005 review`, `/project:backlog move story US-003 blocked "Esperando una API externa"`, `/project:backlog move story --auto --dry-run`, `/project:backlog move story --auto`.
