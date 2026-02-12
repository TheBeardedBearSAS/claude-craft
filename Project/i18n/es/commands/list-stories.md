---
description: Listar User Stories
argument-hint: [arguments]
---

# Listar User Stories

Mostrar lista de User Stories con filtrado por EPIC, Sprint o Estado.

## Argumentos

$ARGUMENTS (opcional, formato: [filtro] [valor])
- **epic EPIC-XXX**: Filtrar por EPIC
- **sprint N**: Filtrar por sprint
- **status STATUS**: Filtrar por estado (todo, in-progress, blocked, done)
- **backlog**: Mostrar solo USs no asignadas a un sprint

## Proceso

### Paso 1: Leer User Stories

1. Escanear directorio `project-management/backlog/user-stories/`
2. Leer cada archivo US-XXX-*.md
3. Extraer metadatos de cada US

### Paso 2: Filtrar

Aplicar filtros según $ARGUMENTS:
- Por EPIC padre
- Por sprint asignado
- Por estado
- Sin asignar (backlog)

### Paso 3: Calcular estadísticas

Para cada US:
- Contar tareas totales
- Contar tareas por estado
- Calcular porcentaje de progreso

### Paso 4: Mostrar

Generar tabla formateada agrupada por EPIC o Sprint según contexto.

## Formato de salida - Por EPIC

```
📖 User Stories - EPIC-001: Autenticación

| ID | Nombre | Sprint | Estado | Puntos | Tareas | Progreso |
|----|-----|--------|--------|--------|-------|-------------|
| US-001 | Inicio de sesión | Sprint 1 | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Registro | Sprint 1 | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Olvidé contraseña | Backlog | 🔴 To Do | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 puntos | 🔴 2 | 🟡 1 | 🟢 0
```

## Formato de salida - Por Sprint

```
📖 User Stories - Sprint 1

| ID | EPIC | Nombre | Estado | Puntos | Tareas | Progreso |
|----|------|-----|--------|--------|-------|-------------|
| US-001 | EPIC-001 | Inicio de sesión | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | EPIC-001 | Registro | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-005 | EPIC-002 | Lista de productos | 🟢 Done | 5 | 6/6 | ██████████ 100% |

───────────────────────────────────────────────────
Sprint 1: 3 US | 13 puntos | Completados: 5 pts (38%)
```

## Formato de salida - Backlog

```
📖 Backlog (USs sin asignar)

| ID | EPIC | Nombre | Prioridad | Puntos | Estado |
|----|------|-----|----------|--------|--------|
| US-003 | EPIC-001 | Olvidé contraseña | High | 3 | 🔴 To Do |
| US-006 | EPIC-002 | Detalle de producto | Medium | 5 | 🔴 To Do |
| US-007 | EPIC-002 | Búsqueda | Low | 8 | 🔴 To Do |

───────────────────────────────────────────────────
Backlog: 3 US | 16 puntos a planificar
```

## Ejemplos

```
# Listar todas las USs
/project:list-stories

# Listar USs de un EPIC
/project:list-stories epic EPIC-001

# Listar USs del sprint actual
/project:list-stories sprint 1

# Listar USs en progreso
/project:list-stories status in-progress

# Listar USs bloqueadas
/project:list-stories status blocked

# Listar backlog (sin asignar)
/project:list-stories backlog
```

## Acciones Sugeridas

Según el contexto, sugerir:
```
Acciones:
  /sprint:transition US-XXX sprint-2     # Asignar a sprint
  /sprint:transition US-XXX in-progress  # Cambiar estado
  /project:add-task US-XXX "[BE] ..." 4h  # Agregar tarea
```
