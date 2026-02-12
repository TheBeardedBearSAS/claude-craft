---
description: Ejecutar las reglas de enrutamiento automatico para las transiciones de stories
argument-hint: [--dry-run]
---

# Sprint Auto Route

Ejecutar las reglas de enrutamiento automatico para transicionar las stories en funcion de su estado actual y metricas de completitud.

## Argumentos

$ARGUMENTS (format: [--dry-run])
- **--dry-run** (opcional): Previsualizar las transiciones sin aplicarlas

## Proceso

### Paso 1: Cargar el estado del sprint

1. Leer `.bmad/sprint-status.yaml`
2. Cargar las reglas de enrutamiento desde `routing.auto_transitions.rules`
3. Obtener todas las stories

### Paso 2: Evaluar las reglas

Para cada story, evaluar todas las reglas de enrutamiento:

**Regla: all_tasks_complete**
```yaml
when: "tasks.completed == tasks.total && tasks.total > 0"
from: "in-progress"
to: "review"
```

**Regla: review_approved**
```yaml
when: "review.approved == true"
from: "review"
to: "done"
```

**Regla: blocked_detection**
```yaml
when: "blocked_reason != null"
from: "*"
to: "blocked"
```

**Regla: unblocked**
```yaml
when: "blocked_reason == null && previous_status != null"
from: "blocked"
to: "previous_status"
```

### Paso 3: Verificar los prerrequisitos

Antes de la auto-transicion, verificar:
- Requisitos del gate para el estado destino
- Sin reglas conflictivas
- Story no bloqueada manualmente

### Paso 4: Ejecutar las transiciones (excepto --dry-run)

Para cada regla activada:
1. Registrar la transicion
2. Actualizar el estado
3. Registrar en el historial con `by: "auto-route"`
4. Aplicar los efectos secundarios (fase TDD, etc.)

### Paso 5: Reportar los resultados

Mostrar:
- Numero de reglas evaluadas
- Transiciones efectuadas
- Stories sin cambios
- Errores o advertencias eventuales

## Formato de salida

### Dry Run

```
═══════════════════════════════════════════════════════
           Previsualizacion Auto-Route (DRY RUN)
═══════════════════════════════════════════════════════

Evaluando 4 reglas de enrutamiento contra 8 stories...

Transicionaria:
──────────────────────────────────────────────────────
📖 US-005: Autenticacion de usuario
   Regla: all_tasks_complete
   in-progress → review
   Razon: 5/5 tareas terminadas

📖 US-008: Verificacion de email
   Regla: all_tasks_complete
   in-progress → review
   Razon: 3/3 tareas terminadas

📖 US-003: Integracion OAuth
   Regla: unblocked
   blocked → in-progress
   Razon: blocked_reason eliminado

Resumen:
──────────────────────────────────────────────────────
Reglas evaluadas: 4
Stories verificadas: 8
Transicionaria: 3
Sin cambio necesario: 5

Ejecutar sin --dry-run para aplicar las transiciones.
═══════════════════════════════════════════════════════
```

### Transiciones aplicadas

```
═══════════════════════════════════════════════════════
              Resultados Auto-Route
═══════════════════════════════════════════════════════

Evaluando 4 reglas de enrutamiento contra 8 stories...

Transiciones aplicadas:
──────────────────────────────────────────────────────
✅ US-005: in-progress → review
   Regla: all_tasks_complete
   Tareas: 5/5 terminadas

✅ US-008: in-progress → review
   Regla: all_tasks_complete
   Tareas: 3/3 terminadas

✅ US-003: blocked → in-progress
   Regla: unblocked
   Estado anterior restaurado

Resumen:
──────────────────────────────────────────────────────
Reglas evaluadas: 4
Stories verificadas: 8
Transicionadas: 3
Sin cambio necesario: 5

Estado sprint actualizado. Ejecutar /sprint:status --bmad para ver.
═══════════════════════════════════════════════════════
```

### Ninguna transicion necesaria

```
═══════════════════════════════════════════════════════
              Resultados Auto-Route
═══════════════════════════════════════════════════════

Evaluando 4 reglas de enrutamiento contra 8 stories...

Ninguna transicion automatica necesaria.
──────────────────────────────────────────────────────
Todas las stories estan en estados apropiados segun
sus metricas de completitud actuales.

Stories por estado:
  📋 Backlog: 2
  🎯 Ready: 3
  🔄 En curso: 2 (tareas pendientes)
  ✅ Done: 1
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/sprint:auto-route --dry-run
/sprint:auto-route
```

## Reglas personalizadas

Agregar reglas personalizadas en `.bmad/sprint-status.yaml`:

```yaml
routing:
  auto_transitions:
    enabled: true
    rules:
      # Regla personalizada: story demasiado tiempo en review
      - name: "review_timeout"
        description: "Senalar las stories en review > 2 dias"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify

      # Regla personalizada: prioridad alta primero
      - name: "priority_bump"
        description: "Auto-asignar las stories de alta prioridad"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

## Integracion

El auto-route puede activarse:
1. Manualmente via este comando
2. Automaticamente en el hook Stop
3. Despues de completar una tarea
4. Al inicio de sesion (configurable)

Configurar en `.bmad/sprint-status.yaml`:
```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
```
