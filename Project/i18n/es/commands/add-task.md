---
description: Agregar una Tarea
argument-hint: [arguments]
---

# Agregar una Tarea

Crear una nueva tarea técnica y asociarla a una User Story.

## Argumentos

$ARGUMENTS (formato: US-XXX "[TIPO] Descripción" estimación)
- **US-ID** (obligatorio): ID de la User Story padre (ej., US-001)
- **Descripción** (obligatorio): Descripción con tipo entre corchetes
- **Estimación** (obligatorio): Estimación en horas (ej., 4h, 2h, 0.5h)

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Tipos de Tareas

| Tipo | Prefijo | Descripción |
|------|---------|-------------|
| Base de datos | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Móvil | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, Integration, E2E |
| Documentación | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revisión | `[REV]` | Code Review |

## Proceso

### Paso 1: Analizar argumentos

Extraer de $ARGUMENTS:
- ID de la User Story
- Tipo (entre corchetes)
- Descripción
- Estimación en horas

### Paso 2: Validar User Story

1. Verificar que la US existe en `project-management/backlog/user-stories/`
2. Obtener sprint asignado (si aplica)
3. Si no se encuentra la US, mostrar error

### Paso 3: Validar estimación

- Mínimo: 0.5h
- Máximo: 8h
- Ideal: 2-4h
- Si > 8h, sugerir dividir la tarea

### Paso 4: Generar ID

1. Encontrar último ID de tarea usado
2. Incrementar para obtener nuevo ID

### Paso 5: Crear el archivo

1. Usar plantilla `Scrum/templates/task.md`
2. Reemplazar marcadores de posición:
   - `{ID}`: ID generado
   - `{DESCRIPTION}`: Descripción corta
   - `{US_ID}`: ID de la User Story
   - `{TYPE}`: Tipo de tarea
   - `{ESTIMATION}`: Estimación en horas
   - `{DATE}`: Fecha actual (YYYY-MM-DD)
   - `{DESCRIPTION_DETAILLEE}`: Descripción detallada

3. Determinar ruta:
   - Si US en sprint: `project-management/sprints/sprint-XXX/tasks/TASK-{ID}.md`
   - De lo contrario: `project-management/backlog/tasks/TASK-{ID}.md`

### Paso 6: Actualizar User Story

1. Leer archivo de la US
2. Agregar tarea a la tabla de Tareas
3. Actualizar progreso
4. Guardar

### Paso 7: Actualizar tablero (si es sprint)

Si la US está en un sprint:
1. Leer `project-management/sprints/sprint-XXX/board.md`
2. Agregar tarea a "🔴 To Do"
3. Actualizar métricas
4. Guardar

## Formato de salida

```
✅ Tarea creada con éxito!

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Tipo: {TYPE}
   Estado: 🔴 To Do
   Estimación: {ESTIMATION}h
   Archivo: {PATH}

Próximos pasos:
  /project:move-task TASK-{ID} in-progress  # Iniciar tarea
  /project:board                             # Ver Kanban
```

## Ejemplos

```
# Tarea de backend
/project:add-task US-001 "[BE] Endpoint de API de login" 4h

# Tarea de base de datos
/project:add-task US-001 "[DB] Entidad User con campos email/password" 2h

# Tarea de frontend móvil
/project:add-task US-001 "[FE-MOB] Pantalla de login con validación" 6h

# Tarea de test
/project:add-task US-001 "[TEST] Tests unitarios de AuthService" 3h
```

## Validación

- [ ] El tipo es válido (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- [ ] La estimación está entre 0.5h y 8h
- [ ] La User Story existe
- [ ] El ID es único
