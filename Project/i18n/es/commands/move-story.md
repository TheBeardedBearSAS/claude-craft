# Mover una User Story

Cambiar el estado de una User Story o asignarla a un sprint.

## Argumentos

$ARGUMENTS (formato: US-XXX destino)
- **US-ID** (obligatorio): ID de la User Story (ej., US-001)
- **Destino** (obligatorio):
  - `sprint-N`: Asignar a sprint N
  - `backlog`: Quitar del sprint actual
  - `in-progress`: Iniciar US
  - `blocked`: Marcar como bloqueada
  - `done`: Marcar como completada

## Flujo de Trabajo Estricto

Las transiciones de estado siguen un flujo de trabajo estricto:

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
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | * | ❌ (reapertura manual) |

## Proceso

### Paso 1: Validar User Story

1. Verificar que la US existe
2. Leer estado actual
3. Identificar sprint actual (si aplica)

### Paso 2: Validar transición

**Si es cambio de estado:**
1. Verificar que la transición está permitida
2. Si no está permitida, mostrar error con transiciones posibles

**Si es asignación a sprint:**
1. Verificar que el sprint existe
2. Crear directorio de sprint si es necesario

### Paso 3: Si transición a Blocked

Preguntar por bloqueador:
```
¿Cuál es el bloqueador para US-XXX?
> [Descripción del bloqueador]
```

### Paso 4: Actualizar User Story

1. Modificar estado en metadatos
2. Modificar sprint si aplica
3. Agregar bloqueador si está Blocked
4. Actualizar fecha de modificación

### Paso 5: Actualizar archivos relacionados

1. **Índice** (`backlog/index.md`): Actualizar contadores
2. **EPIC padre**: Actualizar progreso
3. **Tablero del Sprint** (si aplica): Mover tareas

### Paso 6: Cascada a Tareas

**Si la US pasa a In Progress:**
- Las tareas permanecen To Do (se iniciarán individualmente)

**Si la US pasa a Done:**
- Verificar que todas las tareas están Done
- Si no, mostrar advertencia

**Si la US pasa a Blocked:**
- Marcar todas las tareas In Progress como Blocked

## Formato de salida

### Cambio de estado

```
✅ User Story movida!

📖 US-001: Inicio de sesión de usuario
   Antes: 🔴 To Do
   Después: 🟡 In Progress

Próximos pasos:
  /project:move-task TASK-001 in-progress  # Iniciar una tarea
  /project:board                            # Ver Kanban
```

### Asignación a sprint

```
✅ User Story asignada al Sprint 2!

📖 US-003: Olvidé contraseña
   Sprint: Backlog → Sprint 2
   Estado: 🔴 To Do

Sprint 2 actualizado:
  - 8 US | 34 puntos

Próximos pasos:
  /project:decompose-tasks 2  # Crear tareas
  /project:board              # Ver Kanban
```

### Error de flujo de trabajo

```
❌ Transición no permitida!

📖 US-001: Inicio de sesión de usuario
   Estado actual: 🔴 To Do
   Transición solicitada: → 🟢 Done

Regla: Una US debe pasar por "In Progress" antes de "Done"

Transiciones posibles:
  /project:move-story US-001 in-progress
  /project:move-story US-001 blocked
```

## Ejemplos

```
# Iniciar una US
/project:move-story US-001 in-progress

# Completar una US
/project:move-story US-001 done

# Bloquear una US
/project:move-story US-001 blocked

# Asignar al sprint 2
/project:move-story US-003 sprint-2

# Quitar del sprint
/project:move-story US-003 backlog
```

## Validación antes de Done

Antes de marcar US como Done, verificar:
- [ ] Todas las tareas están Done
- [ ] Los tests pasan
- [ ] Código revisado
- [ ] Criterios de aceptación validados

Si no se cumplen:
```
⚠️ Advertencia: US-001 aún tiene tareas sin terminar!

Tareas restantes:
  🔴 TASK-004 [FE-WEB] Controller Auth
  🔴 TASK-006 [TEST] Tests AuthService

¿Confirmar de todos modos? (no recomendado)
```
