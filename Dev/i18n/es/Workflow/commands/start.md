---
description: "Preparación del inicio de sprint: carpeta del sprint, entradas de sprint-status.yaml y descomposición en tareas"
argument-hint: "<N> [--tasks-only]"
---

# Preparación del Inicio de Sprint

Eres un Scrum Master y Tech Lead experimentado. Debes preparar y facilitar el arranque de un nuevo sprint: verificar las condiciones, crear la carpeta del sprint, registrar el sprint en `.bmad/sprint-status.yaml` y descomponer las historias en tareas (Sprint Planning Parte 2, «El Cómo»).

## Uso

| Invocación | Qué hace | Reemplaza |
|------------|----------|-----------|
| `/workflow:start <N>` | Inicio completo: requisitos previos, capacidad, planning, `project-management/sprints/sprint-{N}-{slug}/` (sprint-goal.md, sprint-dependencies.md, board.md, `tasks/TASK-*.md`), sprint e historias escritos en `.bmad/sprint-status.yaml`, tareas registradas | antiguos pasos de inicio de sprint (eliminados en 9.0) |
| `/workflow:start <N> --tasks-only` | Descompone en tareas las historias de un sprint **existente** (solo Pasos 7 a 9, omitir los Pasos 1 a 6) | `/workflow:start <N>` |

## Argumentos
$ARGUMENTS

Argumentos:
- Número del sprint (p. ej.: `5`, `005`); si falta, preguntar qué sprint iniciar
- (Opcional) Duración en días (por defecto: 10 días = 2 semanas)
- `--tasks-only`: solo descompone en tareas las historias de un sprint existente

Ejemplos: `/workflow:start 5`, `/workflow:start 5 --tasks-only`

> **El Plan Mode es obligatorio para la descomposición** (Paso 7): analizar el código afectado, proponer el desglose en tareas y esperar la validación antes de escribir archivos.

> **El estado vive en `.bmad/sprint-status.yaml`** (esquema: `.claude/templates/project/sprint-status.md`), nunca en el markdown. Los archivos de sprint, de tareas y de board solo contienen contenido.

## MISIÓN

### Paso 1: Verificar Prerequisitos

#### 1.1 Sprint Anterior Cerrado
```bash
# Comprobar el estado del sprint anterior
# - Sprint Review completada
# - Retrospectiva completada
# - Todas las US finalizadas o trasladadas
```

#### 1.2 Backlog Priorizado
- El Product Owner ha priorizado el backlog
- Las US candidatas están estimadas
- Los criterios de aceptación están definidos

#### 1.3 Equipo Disponible
- Disponibilidad confirmada
- Vacaciones identificadas
- Capacidad calculada

### Paso 2: Calcular la Capacidad

```
══════════════════════════════════════════════════════════════
📊 CÁLCULO DE CAPACIDAD - Sprint {N}
══════════════════════════════════════════════════════════════

Duración del sprint: {X} días laborables
Fecha de inicio: {YYYY-MM-DD}
Fecha de fin: {YYYY-MM-DD}

──────────────────────────────────────────────────────────────
👥 DISPONIBILIDAD DEL EQUIPO
──────────────────────────────────────────────────────────────

| Miembro | Días disponibles | Foco (%) | Capacidad |
|---------|-----------------|----------|-----------|
| Dev 1   | 10/10           | 80%      | 8 días    |
| Dev 2   | 8/10            | 80%      | 6.4 días  |
| Dev 3   | 10/10           | 50%      | 5 días    |
| Total   | -               | -        | 19.4 días |

──────────────────────────────────────────────────────────────
📈 VELOCIDAD
──────────────────────────────────────────────────────────────

| Sprint | Puntos planificados | Puntos entregados |
|--------|---------------------|-------------------|
| S-3    | 25                  | 23                |
| S-2    | 28                  | 26                |
| S-1    | 30                  | 28                |
| Media  | 27.7                | 25.7              |

Velocidad media: 26 puntos
Capacidad ajustada: ~24 puntos (factor de seguridad del 10%)
```

### Paso 3: Preparar el Sprint Planning

```
══════════════════════════════════════════════════════════════
📋 SPRINT PLANNING - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 OBJETIVO DEL SPRINT (a definir con el PO)
──────────────────────────────────────────────────────────────

> "{Objetivo de negocio claro en una frase}"

Ejemplo: "Los usuarios pueden crear una cuenta e iniciar sesión
mediante OAuth2 (Google, GitHub)"

──────────────────────────────────────────────────────────────
📋 HISTORIAS DE USUARIO CANDIDATAS
──────────────────────────────────────────────────────────────

| Prioridad | US | Título | Puntos | Estado |
|-----------|-----|--------|--------|--------|
| 🔴 Must   | US-045 | Registro de usuario | 5 | Listo |
| 🔴 Must   | US-046 | Login con Google OAuth | 8 | Listo |
| 🔴 Must   | US-047 | Login con GitHub OAuth | 5 | Listo |
| 🟡 Should | US-048 | Restablecimiento de contraseña | 3 | Listo |
| 🟡 Should | US-049 | Página de perfil de usuario | 5 | Listo |
| 🟢 Could  | US-050 | Avatar personalizado | 2 | Listo |

Total candidato: 28 puntos
Capacidad: 24 puntos

──────────────────────────────────────────────────────────────
✅ DEFINITION OF READY (verificar para cada US)
──────────────────────────────────────────────────────────────

Para cada US seleccionada:
- [ ] Descripción clara y completa
- [ ] Criterios de aceptación definidos (Given/When/Then)
- [ ] Estimación en puntos
- [ ] Dependencias identificadas
- [ ] Mockups/diseños disponibles (si hay UI)
- [ ] Datos de prueba preparados
- [ ] Sin bloqueador técnico

──────────────────────────────────────────────────────────────
📅 CEREMONIAS PLANIFICADAS
──────────────────────────────────────────────────────────────

| Ceremonia | Fecha | Hora | Duración | Lugar |
|-----------|-------|------|----------|-------|
| Sprint Planning P1 | {fecha} | 09:00 | 2h | Sala A |
| Sprint Planning P2 | {fecha} | 14:00 | 2h | Sala A |
| Daily Scrum | Diario | 09:30 | 15min | Stand-up |
| Backlog Refinement | {fecha} | 14:00 | 1h | Sala B |
| Sprint Review | {fecha fin} | 14:00 | 2h | Sala A |
| Retrospectiva | {fecha fin} | 16:30 | 1h30 | Sala A |
```

### Paso 4: Crear la Estructura del Sprint

Crear la carpeta del sprint (plantillas en `.claude/templates/project/`):

```
project-management/
└── sprints/
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md
        ├── sprint-dependencies.md
        ├── board.md                  # vista Kanban única, solo contenido
        ├── tasks/
        │   ├── README.md             # resumen: tareas agrupadas por US
        │   ├── TASK-001.md           # un archivo por tarea (.claude/templates/project/task.md)
        │   └── ...
        ├── daily-notes/
        │   └── {YYYY-MM-DD}.md
        ├── sprint-review.md
        └── sprint-retro.md
```

### Paso 5: Plantilla sprint-goal.md

```markdown
# Sprint {N}: {Objetivo}

## Información

| Atributo | Valor |
|----------|-------|
| Número | {N} |
| Inicio | {YYYY-MM-DD} |
| Fin | {YYYY-MM-DD} |
| Duración | {X} días |
| Capacidad | {Y} puntos |

## Objetivo del Sprint

> "{Objetivo de negocio claro}"

## Definition of Done (Recordatorio)

- [ ] Code review aprobado (2 revisores)
- [ ] Tests unitarios (cobertura ≥ 80%)
- [ ] Tests de integración pasan
- [ ] Documentación actualizada
- [ ] Sin deuda técnica añadida
- [ ] Desplegable a producción

## Sprint Backlog

| ID | Título | Puntos | Asignado | Estado |
|----|--------|--------|----------|--------|
| US-045 | Registro de usuario | 5 | @dev1 | 🔵 Por hacer |
| US-046 | Login con Google OAuth | 8 | @dev2 | 🔵 Por hacer |
| US-047 | Login con GitHub OAuth | 5 | @dev1 | 🔵 Por hacer |
| US-048 | Restablecimiento de contraseña | 3 | @dev3 | 🔵 Por hacer |

**Total comprometido: 21 puntos**

## Dependencias

| US | Depende de | Estado |
|----|-----------|--------|
| US-046 | Configuración de Google OAuth Console | ✅ Hecho |
| US-047 | Configuración de GitHub OAuth App | ⚠️ En progreso |

## Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Cambios en la API de Google | Baja | Media | Usar librería oficial |
| Dev2 de baja | Media | Media | @dev1 puede asumir |

## Burndown Chart

```
Puntos |
  21   |████
  18   |████████
  15   |████████████
  12   |████████████████
   9   |████████████████████
   6   |████████████████████████
   3   |████████████████████████████
   0   |________________________________
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10
```

## Notas

{Notas del sprint planning, decisiones tomadas...}
```

### Paso 6: Sincronizar `.bmad/sprint-status.yaml`

`/gate:check sprint` y `/workflow:implement` leen el sprint en `.bmad/sprint-status.yaml`. Escríbelo ahora a partir del `sprint-goal.md` anterior y de las fichas US seleccionadas (`project-management/backlog/user-stories/US-*.md`):

1. Crear `.bmad/` si no existe.
2. `metadata`: `sprint_id` (`sprint-{N}`), `name`, `start_date`, `end_date`, `goal`, `capacity_points`, tomados de `sprint-goal.md`.
3. `stories`: una entrada por US seleccionada: `title`, `status: ready-for-dev`, `story_points`, `epic_id`, `priority` (MoSCoW), `dependencies`, `tasks`, `history: []`.
4. Archivo ya presente para el **mismo** `sprint_id`: conservar los estados existentes (nunca hacer retroceder una story) y añadir solo las nuevas US.
5. Archivo presente para **otro** sprint: mover primero sus stories a `archived_sprints.<sprint_id anterior>` (`status`, `points`) y luego escribir el nuevo sprint.

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
    status: "ready-for-dev"
    story_points: 5
    epic_id: "EPIC-002"
    priority: "must"
    dependencies: ["US-001"]
    tasks: { total: 0, completed: 0, list: [] }
    history: []
archived_sprints:
  sprint-1:
    stories:
      US-001: { status: "done", points: 5 }
```

### Paso 7: Descomponer las Historias en Tareas

Leer `sprint-goal.md`, `sprint-dependencies.md` y cada US referenciada en `project-management/backlog/user-stories/` (con `--tasks-only`, empezar aquí). Adaptar los tipos de tarea al stack real del proyecto (leer `CLAUDE.md` / `.claude/rules/`); la tabla siguiente es un ejemplo típico.

| Capa | Prefijo | Tareas típicas |
|------|---------|----------------|
| Base de datos | `[DB]` | Entidad, migración, repositorio, fixtures |
| Backend | `[BE]` | Servicio, recurso API, DTO, processor, voter |
| Frontend Web | `[FE-WEB]` | Controlador, plantilla, componente |
| Frontend Mobile | `[FE-MOB]` | Modelo, repositorio, estado, pantalla |
| Tests | `[TEST]` | Unitarios, integración, API, E2E |
| Documentación | `[DOC]` | Documentación del código, README, OpenAPI |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revisión | `[REV]` | Code review |

**Buena tarea (SMART)**: Específica (acción clara), Medible (se sabe cuándo termina), Asignable (un único responsable), Realista, Acotada en el tiempo (estimada en horas, no en puntos).

**Reglas de tamaño**: mínimo 30 min, máximo 8 h (1 día), ideal 2 a 4 h. Por encima de 8 h: dividir en subtareas.

**Corte vertical**: cada US recibe las tareas DB + API + front + tests + doc + revisión según haga falta. Tamaño típico: CRUD simple ~15 tareas, funcionalidad de negocio ~18, solo UI ~11.

Para cada US, crear un `tasks/TASK-{NNN}.md` por tarea a partir de `.claude/templates/project/task.md` (los IDs continúan tras el último `TASK-*` existente, como hace `/project:backlog add task`) con: tipo, estimación, `Depends on`, descripción, archivos a crear o modificar, criterios de validación. Después añadir una sección en `tasks/README.md`:

```markdown
## US-XXX: [Título] (Epic EPIC-XXX, [X] puntos)

| ID | Tipo | Tarea | Estimación | Depende de |
|----|------|-------|------------|-----------|
| TASK-001 | [DB] | Crear la entidad [Nombre] | 2h | - |
| TASK-002 | [DB] | Migración | 1h | TASK-001 |
| TASK-003 | [BE] | Recurso API | 3h | TASK-001 |
| TASK-004 | [TEST] | Tests API | 2h | TASK-003 |

**Total estimado**: XXh
```

Añadir las dependencias como grafo Mermaid (`TASK-001 --> TASK-002`) y un resumen por capa (tareas y horas). Añadir también una sección «Tareas técnicas transversales» (entorno, actualización de dependencias, pipeline CI, refactorización identificada) con un `tasks/TASK-{NNN}.md` cada una (sin US).

Reglas:
1. Estimación en horas (no en puntos)
2. Una tarea = un responsable
3. Máx. 2 tareas en curso por persona
4. Dependencias explícitas (grafo Mermaid)

### Paso 8: Board y Resumen de Tareas

Crear `board.md` (plantilla `.claude/templates/project/board.md`):

```markdown
# Task Board - Sprint {N}

> Vista generada: regenerada desde `.bmad/sprint-status.yaml` por `/workflow:status --board`. No editar a mano.

## to-do
| ID | US | Tarea | Estimación | Asignado |
|----|-----|-------|------------|---------|

## in-progress | review | done | blocked
(mismo formato, una tabla por columna)

## Métricas
- **Tareas**: X en total | X completadas (X%)
- **Horas**: Xh estimadas | Xh dedicadas | Xh restantes
```

`tasks/README.md` contiene además la tabla resumen (US, título, puntos, tareas, horas), el desglose por tipo y las convenciones: ID `TASK-[NNN]`, tamaño 0,5 h a 8 h, estados seguidos en `.bmad/sprint-status.yaml` (`to-do | in-progress | done | blocked`).

### Paso 9: Registrar las Tareas en `.bmad/sprint-status.yaml`

Para cada tarea creada (tareas de US y tareas transversales), según `.claude/templates/project/sprint-status.md`:

1. Crear `.bmad/sprint-status.yaml` a partir del esqueleto de `/workflow:init` si no existe (con `--tasks-only`, el sprint y las historias ya existen; si no, ejecutar el `/workflow:start <N>` completo)
2. Añadir los ids TASK a `stories.<US>.tasks.list`
3. Definir `stories.<US>.tasks.status.<TASK>: to-do`
4. Actualizar `stories.<US>.tasks.total` (`completed` sigue siendo el número de tareas `done`)

### Paso 10: Lista de Verificación Final

```
══════════════════════════════════════════════════════════════
✅ LISTA DE VERIFICACIÓN INICIO SPRINT {N}
══════════════════════════════════════════════════════════════

## Antes del Sprint Planning

- [ ] Sprint anterior oficialmente completado
- [ ] Acciones de la retrospectiva en curso
- [ ] Backlog priorizado por el PO
- [ ] US candidatas estimadas y en estado "Listo"
- [ ] Capacidad del equipo calculada
- [ ] Salas reservadas para las ceremonias

## Durante el Sprint Planning

### Parte 1 - QUÉ (con el PO)
- [ ] Objetivo del Sprint definido y aceptado
- [ ] US seleccionadas por el equipo
- [ ] Compromiso con el alcance
- [ ] Dependencias identificadas

### Parte 2 - CÓMO (equipo dev)
- [ ] Desglose en tareas
- [ ] Estimación de tareas
- [ ] Asignación inicial
- [ ] Riesgos discutidos

## Después del Sprint Planning

- [ ] Sprint backlog visible (tablero actualizado)
- [ ] Daily Scrum programado
- [ ] Herramientas configuradas (tablero, ramas, etc.)
- [ ] Comunicación del equipo (canal, notificaciones)

══════════════════════════════════════════════════════════════
🚀 ¡SPRINT {N} LISTO PARA EMPEZAR!
══════════════════════════════════════════════════════════════
```

## Consejos Scrum

### Objetivo del Sprint
- Una frase
- Orientado al valor de negocio
- Medible
- Compartido por todo el equipo

### Compromiso vs Previsión
- El equipo se compromete con el Objetivo del Sprint
- El número de puntos es una previsión
- La confianza aumenta con la experiencia

### Factor de Foco
- Equipo principiante: 50-60%
- Equipo establecido: 70-80%
- Equipo maduro: 80-90%

## Siguiente Paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /gate:check sprint {N}                                ║
║    Verificar que el sprint está listo (gate)             ║
║                                                          ║
║  → /workflow:implement {N}                               ║
║    Iniciar el desarrollo TDD/BDD                         ║
║                                                          ║
║  Ver también:                                            ║
║  • /project:backlog next story — Tomar la 1.ª historia   ║
║  • /workflow:status  — Seguir el avance del sprint       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
