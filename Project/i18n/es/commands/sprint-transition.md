---
description: Transicionar una story hacia un nuevo estado
argument-hint: <story-id> <estado-destino>
---

# Sprint Transition

Transicionar una story hacia un nuevo estado con validacion y seguimiento del historial.

## Argumentos

$ARGUMENTS (format: <story-id> <estado-destino>)
- **story-id** (requerido): Identificador de la story (ej: US-001)
- **estado-destino** (requerido): Estado destino

Estados validos:
- `backlog` - Story en el product backlog
- `ready-for-dev` - Refinada y lista para desarrollo
- `in-progress` - En curso de desarrollo
- `review` - Codigo terminado, en espera de revision
- `done` - Definition of Done alcanzada
- `blocked` - Bloqueada por un factor externo

## Proceso

### Paso 1: Validar que la story existe

1. Leer `.bmad/sprint-status.yaml`
2. Encontrar la story por ID
3. Obtener el estado actual

### Paso 2: Validar la transicion

Verificar las reglas de la maquina de estados:
```
Transiciones autorizadas:
  backlog → ready-for-dev
  ready-for-dev → in-progress
  in-progress → review
  review → done
  review → in-progress (cambios solicitados)
  * → blocked (cualquier estado puede ser bloqueado)
  blocked → previous_status (reanudar)
```

### Paso 3: Verificar los requisitos del gate

Antes de transicionar, verificar los requisitos del gate:

**→ ready-for-dev**
- [ ] Criterios de aceptacion definidos
- [ ] Story points estimados
- [ ] Tareas descompuestas

**→ in-progress**
- [ ] Sin dependencias bloqueantes
- [ ] Desarrollador asignado (opcional)

**→ review**
- [ ] Todas las tareas terminadas
- [ ] Tests aprobados (TDD green o refactor)
- [ ] Codigo pusheado

**→ done**
- [ ] Codigo revisado
- [ ] Todos los AC validados
- [ ] Checklist DoD completa

**→ blocked**
- Proporcionar blocked_reason

### Paso 4: Ejecutar la transicion

1. Almacenar el estado anterior
2. Actualizar el campo estado
3. Establecer los timestamps
4. Actualizar la fase TDD si aplica
5. Registrar en el historial

### Paso 5: Efectos secundarios

Segun la transicion:

**→ in-progress**
- Establecer `tdd_phase` en `red`
- Establecer `current_task` en la primera tarea

**→ review**
- Establecer `tdd_phase` en `refactor`
- Vaciar `current_task`

**→ done**
- Vaciar `tdd_phase`
- Registrar el tiempo de completitud

**→ blocked**
- Almacenar `blocked_reason`
- Almacenar `previous_status` para reanudacion

### Paso 6: Actualizar el historial

Agregar una entrada:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "Todas las tareas terminadas"
```

## Formato de salida

### Transicion exitosa

```
═══════════════════════════════════════════════════════
              Transicion Story
═══════════════════════════════════════════════════════

📖 US-005: Autenticacion de usuario

Estado: in-progress → review ✅

Verificaciones del gate:
──────────────────────────────────────────────────────
✅ Todas las tareas terminadas (5/5)
✅ Tests aprobados
✅ Codigo pusheado

Historial actualizado:
──────────────────────────────────────────────────────
* 2026-01-29 10:00 - in-progress → review (manual)
* 2026-01-27 09:00 - ready-for-dev → in-progress
* 2026-01-25 14:00 - backlog → ready-for-dev

Proximos pasos:
──────────────────────────────────────────────────────
La story esta ahora en revision. Asignar un revisor o ejecutar:
  /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Gate fallido

```
═══════════════════════════════════════════════════════
              Transicion Bloqueada
═══════════════════════════════════════════════════════

📖 US-005: Autenticacion de usuario

Solicitado: in-progress → review ❌

Fallos del gate:
──────────────────────────────────────────────────────
❌ Tareas incompletas: 3/5
❌ Fase TDD es 'red' - los tests deben pasar primero

Acciones requeridas:
──────────────────────────────────────────────────────
1. Terminar las tareas restantes:
   □ TASK-015: Implementar la validacion JWT
   □ TASK-016: Agregar el soporte refresh token

2. Pasar la fase TDD a green:
   /sprint:tdd green

Luego reintentar: /sprint:transition US-005 review
═══════════════════════════════════════════════════════
```

### Transicion invalida

```
═══════════════════════════════════════════════════════
              Transicion Invalida
═══════════════════════════════════════════════════════

📖 US-005: Autenticacion de usuario

Actual: in-progress
Solicitado: done ❌

Invalido: Imposible transicionar directamente de 'in-progress' a 'done'

Transiciones validas desde 'in-progress':
──────────────────────────────────────────────────────
* review - Codigo terminado, listo para revision
* blocked - Story bloqueada

Maquina de estados:
  backlog → ready-for-dev → in-progress → review → done
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/sprint:transition US-005 review
/sprint:transition US-003 blocked "En espera de credenciales API"
/sprint:transition US-003 in-progress  # Reanudar desde blocked
```

## Casos especiales

### Bloquear una story
```
/sprint:transition US-003 blocked "En espera de API externa"
```
Almacena la razon y preserva el estado anterior para reanudacion.

### Desbloquear una story
```
/sprint:transition US-003 in-progress
```
Al transicionar desde blocked, retorna al estado anterior.

### Solicitar cambios en review
```
/sprint:transition US-005 in-progress
```
Transicion inversa valida desde review para atender el feedback.
