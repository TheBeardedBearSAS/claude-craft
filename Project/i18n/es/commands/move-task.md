# Mover una Tarea

Cambiar el estado de una tarea siguiendo el flujo de trabajo estricto.

## Argumentos

$ARGUMENTS (formato: TASK-XXX destino)
- **TASK-ID** (obligatorio): ID de la Tarea (ej., TASK-001)
- **Destino** (obligatorio):
  - `in-progress`: Iniciar tarea
  - `blocked`: Marcar como bloqueada
  - `done`: Marcar como completada

## Flujo de Trabajo Estricto

```
🔴 To Do ──→ 🟡 In Progress ──→ 🟢 Done
     │              │
     │              ↓
     └────→ ⏸️ Blocked ←────┘
                │
                ↓
           🟡 In Progress
```

### Transiciones Permitidas

| Desde | A | Permitido |
|--------|------|----------|
| 🔴 To Do | 🟡 In Progress | ✅ |
| 🔴 To Do | ⏸️ Blocked | ✅ |
| 🔴 To Do | 🟢 Done | ❌ **Prohibido** |
| 🟡 In Progress | 🟢 Done | ✅ |
| 🟡 In Progress | ⏸️ Blocked | ✅ |
| 🟡 In Progress | 🔴 To Do | ✅ (rollback) |
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | 🟡 In Progress | ⚠️ (reapertura) |

## Proceso

### Paso 1: Validar Tarea

1. Encontrar archivo de tarea
2. Leer estado actual
3. Identificar US y sprint asociados

### Paso 2: Validar transición

1. Verificar que la transición está permitida
2. Si To Do → Done, bloquear y sugerir In Progress

### Paso 3: Si transición a Blocked

Preguntar por bloqueador:
```
¿Cuál es el bloqueador para TASK-XXX?
> [Descripción del bloqueador]
```

### Paso 4: Si transición a Done

Preguntar por tiempo gastado:
```
¿Tiempo gastado en TASK-XXX? (estimación: 4h)
> [Tiempo real, ej., 3.5h]
```

### Paso 5: Actualizar Tarea

1. Modificar estado en metadatos
2. Agregar bloqueador si está Blocked
3. Actualizar tiempo gastado si está Done
4. Actualizar fecha de modificación

### Paso 6: Actualizar Tablero

1. Leer tablero del sprint
2. Mover tarea a nueva columna
3. Actualizar métricas

### Paso 7: Actualizar User Story

1. Actualizar lista de tareas
2. Recalcular progreso
3. Si todas las tareas Done, sugerir completar US

### Paso 8: Actualizar Índice

1. Actualizar contadores globales

## Formato de salida

### Transición exitosa

```
✅ Tarea movida!

🔧 TASK-003: Endpoint de API login
   Antes: 🔴 To Do
   Después: 🟡 In Progress

📖 US-001: Inicio de sesión de usuario
   Progreso: 2/6 → 3/6 (50%)

Próximos pasos:
  /project:move-task TASK-003 done       # Cuando se complete
  /project:move-task TASK-003 blocked    # Si se bloquea
```

### Tarea completada

```
✅ Tarea completada!

🔧 TASK-003: Endpoint de API login
   Estado: 🟡 In Progress → 🟢 Done
   Estimación: 4h
   Tiempo real: 3.5h ✓

📖 US-001: Inicio de sesión de usuario
   Progreso: 4/6 (67%) ████████░░░░

Sprint 1:
   Tareas completadas: 12/25 (48%)
   Horas: 35h/77h completadas
```

### Todas las tareas Done

```
✅ Tarea completada!

🔧 TASK-006: Tests AuthService
   Estado: 🟢 Done

🎉 Todas las tareas de US-001 completadas!

📖 US-001: Inicio de sesión de usuario
   Progreso: 6/6 (100%) ██████████

Próximo paso recomendado:
  /project:move-story US-001 done
```

### Error de flujo de trabajo

```
❌ Transición no permitida!

🔧 TASK-004: Controller Auth
   Estado actual: 🔴 To Do
   Transición solicitada: → 🟢 Done

Regla: Una tarea debe pasar por "In Progress" antes de "Done"

Acción correcta:
  /project:move-task TASK-004 in-progress
  # ... trabajar en la tarea ...
  /project:move-task TASK-004 done
```

### Tarea bloqueada

```
✅ Tarea marcada como bloqueada

🔧 TASK-005: Pantalla Login
   Estado: 🟡 In Progress → ⏸️ Blocked
   Bloqueador: Esperando auth API (TASK-003)

Para desbloquear:
  1. Completar TASK-003
  2. /project:move-task TASK-005 in-progress
```

## Ejemplos

```
# Iniciar una tarea
/project:move-task TASK-001 in-progress

# Completar una tarea
/project:move-task TASK-001 done

# Bloquear una tarea
/project:move-task TASK-001 blocked

# Desbloquear una tarea
/project:move-task TASK-001 in-progress
```

## Métricas Actualizadas

En cada movimiento:
- Conteo de tareas por estado
- Horas estimadas vs reales
- Progreso de la US
- Progreso del Sprint
- Tablero Kanban
