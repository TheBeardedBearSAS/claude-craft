---
description: Obtener la siguiente story lista para desarrollo
argument-hint: [--claim]
---

# Sprint Next Story

Encontrar y opcionalmente tomar la siguiente story lista para desarrollo en el sprint.

## Argumentos

$ARGUMENTS (format: [--claim])
- **--claim** (opcional): Transicionar automaticamente la story a in-progress

## Proceso

### Paso 1: Cargar el estado del sprint

1. Leer `.bmad/sprint-status.yaml`
2. Obtener todas las stories con estado `ready-for-dev`
3. Ordenar por prioridad (si esta definida) o por ID

### Paso 2: Verificar los prerrequisitos

Para cada story ready, verificar:
- [ ] Sin dependencias bloqueantes
- [ ] Story points estimados
- [ ] Tareas descompuestas
- [ ] Criterios de aceptacion definidos

### Paso 3: Seleccionar la siguiente story

Orden de prioridad:
1. Stories sin dependencias bloqueantes
2. ID de story mas bajo (mas temprano en el backlog)
3. Story points mas bajos (mas simple primero)

### Paso 4: Mostrar los detalles de la story

Mostrar la informacion completa:
- ID y titulo
- Story points
- Asociacion al Epic
- Resumen de los criterios de aceptacion
- Vista previa de la lista de tareas
- Notas o contexto eventuales

### Paso 5: Tomar la story (si --claim)

Si el flag `--claim` esta definido:
1. Transicionar la story a `in-progress`
2. Establecer `tdd_phase` en `red`
3. Establecer `current_task` en la primera tarea
4. Registrar la transicion en el historial

### Paso 6: Proporcionar las instrucciones

Mostrar los siguientes pasos:
- Primera tarea a trabajar
- Recordatorio del workflow TDD
- Comandos asociados

## Formato de salida

```
═══════════════════════════════════════════════════════
              Siguiente Story Lista para Dev
═══════════════════════════════════════════════════════

📖 US-012: Implementar la pagina de perfil de usuario
   Epic: EPIC-003 (Gestion de Usuarios)
   Puntos: 5
   Prioridad: Alta

Descripcion:
──────────────────────────────────────────────────────
Como usuario registrado
Quiero ver y modificar mi perfil
Para mantener mi informacion actualizada

Criterios de Aceptacion (3):
──────────────────────────────────────────────────────
□ AC1: El usuario puede ver su informacion de perfil
□ AC2: El usuario puede modificar su nombre e email
□ AC3: Las modificaciones se validan antes de guardar

Tareas (4):
──────────────────────────────────────────────────────
□ TASK-031 [BE] Crear el endpoint API de perfil
□ TASK-032 [BE] Agregar la validacion del perfil
□ TASK-033 [FE] Crear el componente de perfil
□ TASK-034 [FE] Agregar la validacion del formulario

Prerrequisitos:
──────────────────────────────────────────────────────
✅ Sin dependencias bloqueantes
✅ Story points estimados
✅ Tareas descompuestas
✅ Criterios de aceptacion definidos

Para comenzar a trabajar:
──────────────────────────────────────────────────────
/sprint:transition US-012 in-progress

O usar: /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Ninguna story disponible

```
═══════════════════════════════════════════════════════
              Ninguna Story Lista para Dev
═══════════════════════════════════════════════════════

📋 Estado del backlog:
   - 3 stories en el backlog (necesitan refinamiento)
   - 2 stories en curso
   - 1 story bloqueada

Sugerencias:
──────────────────────────────────────────────────────
1. Refinar las stories del backlog: /project:update-stories
2. Ayudar en las stories en curso
3. Desbloquear US-003: en espera de credenciales API

Comandos:
  /sprint:status --bmad  Ver el estado completo del sprint
  /gate:validate-backlog Verificar la preparacion de las stories
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/sprint:next-story
/sprint:next-story --claim
```

## Workflow TDD

Despues de tomar una story:
1. 🔴 RED: Escribir un test fallido para el primer AC/tarea
2. 🟢 GREEN: Implementar el codigo minimo para hacer pasar
3. 🔵 REFACTOR: Limpiar manteniendo los tests en verde
4. Repetir para cada tarea

Usar `/sprint:tdd-cycle` para seguir las transiciones de fase.
