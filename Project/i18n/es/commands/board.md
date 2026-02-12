---
description: Mostrar Tablero Kanban
argument-hint: [arguments]
---

# Mostrar Tablero Kanban

Mostrar el tablero Kanban del sprint actual o de un sprint específico.

## Argumentos

$ARGUMENTS (opcional, formato: [sprint N])
- **sprint N** (opcional): Número de sprint a mostrar
- Si no se especifica, muestra el sprint actual

## Proceso

### Paso 1: Identificar sprint

1. Si se especifica sprint, usar ese número
2. De lo contrario, encontrar sprint actual (con tareas no Done)

### Paso 2: Leer datos

1. Leer archivo `project-management/sprints/sprint-XXX/board.md`
2. O regenerar desde archivos de tareas

### Paso 3: Agrupar por estado

Organizar tareas por columna:
- 🔴 To Do
- 🟡 In Progress
- ⏸️ Blocked
- 🟢 Done

### Paso 4: Calcular métricas

- Número de tareas por columna
- Horas estimadas y completadas
- Porcentaje de progreso

## Formato de salida

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Tablero Kanban                                    ║
║  Objetivo: Walking Skeleton - Auth + Primera página             ║
║  Período: 2024-01-15 → 2024-01-29                              ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 TO DO (4)    │ 🟡 IN PROGRESS  │ ⏸️ BLOCKED (1)  │ 🟢 DONE (8)     │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ Tests E2E       │ Auth Service    │ Pantalla Login  │ User Entity ✓   │
│ 4h @US-001      │ 4h @US-001      │ 6h @US-001      │ 2h @US-001      │
│                 │                 │ ⚠️ Esperando API│                 │
│ TASK-010 [DOC]  │ TASK-006 [WEB]  │                 │ TASK-002 [DB]   │
│ Documentación   │ Auth Controller │                 │ Migration ✓     │
│ 2h @US-001      │ 3h @US-001      │                 │ 1h @US-001      │
│                 │                 │                 │                 │
│ TASK-015 [BE]   │ TASK-012 [MOB]  │                 │ TASK-003 [BE]   │
│ Products API    │ Products Bloc   │                 │ Repository ✓    │
│ 4h @US-002      │ 5h @US-002      │                 │ 3h @US-001      │
│                 │                 │                 │                 │
│ TASK-016 [TEST] │                 │                 │ TASK-004 [BE]   │
│ Products Tests  │                 │                 │ Login API ✓     │
│ 3h @US-002      │                 │                 │ 4h @US-001      │
│                 │                 │                 │                 │
│                 │                 │                 │ ... +4 más      │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

══════════════════════════════════════════════════════════════════════════
📊 MÉTRICAS

Tareas:    ████████████████████░░░░░░░░░░ 8/16 (50%)
Horas:     ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Bloqueadas: 1 tarea (6h)

Por tipo:
[DB]  ██████████ 3/3 completadas
[BE]  ████████░░ 4/5 (1 en progreso)
[WEB] ████░░░░░░ 1/3 (1 en progreso)
[MOB] ██░░░░░░░░ 0/3 (1 bloqueada, 1 en progreso)
[TEST]░░░░░░░░░░ 0/2

══════════════════════════════════════════════════════════════════════════
📖 USER STORIES

│ US      │ Puntos │ Estado          │ Tareas    │ Progreso    │
├─────────┼────────┼─────────────────┼───────────┼─────────────┤
│ US-001  │ 5      │ 🟡 In Progress  │ 6/10      │ ██████░░░░  │
│ US-002  │ 5      │ 🔴 To Do        │ 2/6       │ ███░░░░░░░  │

Sprint: 10 puntos | Completados: 0 pts
══════════════════════════════════════════════════════════════════════════

Acciones:
  /project:move-task TASK-XXX in-progress  # Iniciar una tarea
  /project:move-task TASK-XXX done         # Completar una tarea
  /sprint:status                   # Ver más métricas
```

## Formato Compacto

Si hay muchas tareas, mostrar resumen:

```
📋 Sprint 1 - Kanban (32 tareas)

🔴 To Do (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 In Progress (5): TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Blocked (2):     TASK-008 (API), TASK-021 (config)
🟢 Done (13):       TASK-001..TASK-004, TASK-007, TASK-009..TASK-014

Progreso: 13/32 (41%) | 45h/98h
```

## Ejemplos

```
# Mostrar tablero del sprint actual
/project:board

# Mostrar tablero del sprint 2
/project:board sprint 2
```

## Actualizar archivo board.md

Después de mostrar, se actualiza el archivo `board.md` del sprint con los datos actuales.
