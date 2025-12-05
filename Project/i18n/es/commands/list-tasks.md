# Listar Tareas

Mostrar lista de tareas con filtrado por User Story, Sprint, Tipo o Estado.

## Argumentos

$ARGUMENTS (opcional, formato: [filtro] [valor])
- **us US-XXX**: Filtrar por User Story
- **sprint N**: Filtrar por sprint
- **type TYPE**: Filtrar por tipo (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- **status STATUS**: Filtrar por estado (todo, in-progress, blocked, done)

## Proceso

### Paso 1: Leer Tareas

1. Escanear directorios de tareas:
   - `project-management/sprints/sprint-XXX/tasks/`
   - `project-management/backlog/tasks/` (si existe)
2. Leer cada archivo TASK-XXX.md
3. Extraer metadatos

### Paso 2: Filtrar

Aplicar filtros según $ARGUMENTS.

### Paso 3: Calcular

- Horas totales estimadas
- Horas completadas
- Desglose por tipo
- Desglose por estado

### Paso 4: Mostrar

Generar tabla formateada.

## Formato de salida - Por User Story

```
🔧 Tareas - US-001: Inicio de sesión de usuario

| ID | Tipo | Descripción | Estado | Est. | Gastado |
|----|------|-------------|--------|------|-------|
| TASK-001 | [DB] | Entidad User | 🟢 Done | 2h | 2h |
| TASK-002 | [BE] | Repositorio User | 🟢 Done | 3h | 3.5h |
| TASK-003 | [BE] | Endpoint de API login | 🟡 In Progress | 4h | 2h |
| TASK-004 | [FE-WEB] | Controller Auth | 🔴 To Do | 3h | - |
| TASK-005 | [FE-MOB] | Pantalla Login | ⏸️ Blocked | 6h | - |
| TASK-006 | [TEST] | Tests AuthService | 🔴 To Do | 3h | - |

───────────────────────────────────────────────────
US-001: 6 tareas | 21h estimadas | 7.5h completadas (36%)
🔴 2 | 🟡 1 | ⏸️ 1 | 🟢 2
```

## Formato de salida - Por Sprint

```
🔧 Tareas - Sprint 1

Por estado:
🔴 To Do (8 tareas, 24h)
🟡 In Progress (3 tareas, 10h)
⏸️ Blocked (2 tareas, 8h)
🟢 Done (12 tareas, 35h)

Por tipo:
[DB]     ████████░░ 5 tareas
[BE]     ██████████ 8 tareas
[FE-WEB] ██████░░░░ 4 tareas
[FE-MOB] ████░░░░░░ 3 tareas
[TEST]   ██████░░░░ 4 tareas
[DOC]    ██░░░░░░░░ 1 tarea

───────────────────────────────────────────────────
Sprint 1: 25 tareas | 77h estimadas | 35h completadas (45%)
```

## Formato de salida - Bloqueadas

```
⏸️ Tareas Bloqueadas

| ID | US | Tipo | Descripción | Bloqueador |
|----|-----|------|-------------|----------|
| TASK-005 | US-001 | [FE-MOB] | Pantalla login | Esperando auth API |
| TASK-012 | US-003 | [BE] | Servicio email | Falta config SMTP |

───────────────────────────────────────────────────
2 tareas bloqueadas | 14h esperando

Acciones:
  Resolver TASK-005: Completar TASK-003 primero
  Resolver TASK-012: Configurar SMTP en .env
```

## Ejemplos

```
# Listar todas las tareas
/project:list-tasks

# Listar tareas de una US
/project:list-tasks us US-001

# Listar tareas del sprint 1
/project:list-tasks sprint 1

# Listar tareas backend
/project:list-tasks type BE

# Listar tareas en progreso
/project:list-tasks status in-progress

# Listar tareas bloqueadas
/project:list-tasks status blocked
```

## Códigos de Color de Estado

| Icono | Estado | Significado |
|-------|--------|---------------|
| 🔴 | To Do | No iniciada |
| 🟡 | In Progress | En progreso |
| ⏸️ | Blocked | Bloqueada |
| 🟢 | Done | Completada |
