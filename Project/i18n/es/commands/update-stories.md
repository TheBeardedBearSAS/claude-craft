---
description: Actualizar las stories al formato BMAD v6 con los campos faltantes
argument-hint: [--dry-run] [story-id]
---

# Update Stories

Agregar los campos BMAD v6 faltantes a las user stories existentes.

## Argumentos

$ARGUMENTS (format: [--dry-run] [story-id])
- **--dry-run** (opcional): Previsualizar los cambios sin aplicarlos
- **story-id** (opcional): Story especifica a actualizar (ej: US-001). Si se omite, actualiza todas.

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Proceso

### Paso 1: Cargar el estado actual

1. Leer `.bmad/sprint-status.yaml`
2. Cargar los archivos story del backlog
3. Comparar los campos entre archivo y sprint-status

### Paso 2: Identificar los campos faltantes

Para cada story, verificar:

| Campo | Requerido | Por defecto si falta |
|-------|-----------|---------------------|
| tdd_phase | Si | "red" si in-progress, "" sino |
| tasks.list | Si | Extraer de la seccion ## Tasks |
| tasks.total | Si | Contar desde la lista |
| tasks.completed | Si | Contar las tareas terminadas |
| current_task | No | Primera tarea en curso |
| history | Si | Inicializar con el estado actual |
| acceptance_criteria.total | Si | Contar desde la seccion AC |
| acceptance_criteria.validated | Si | 0 (por defecto) |
| story_points | Si | Solicitar si falta |
| epic_id | No | Extraer del archivo |

### Paso 3: Parsear la lista de tareas desde el markdown

Extraer las tareas del formato archivo story:
```markdown
## Tasks

| ID | Descripcion | Estado |
|----|-------------|--------|
| TASK-001 | Endpoint backend | 🟢 Done |
| TASK-002 | Formulario frontend | 🟡 En curso |
```

Convertir al formato BMAD:
```yaml
tasks:
  list:
    - id: "TASK-001"
      title: "Endpoint backend"
      status: "done"
    - id: "TASK-002"
      title: "Formulario frontend"
      status: "in-progress"
```

### Paso 4: Parsear los criterios de aceptacion

Extraer del formato Gherkin:
```markdown
## Criterios de Aceptacion

### AC1: Login valido
Dado un usuario registrado
Cuando ingresa credenciales validas
Entonces esta conectado
Estado: ✅ Validado

### AC2: Login invalido
Dado un usuario
Cuando ingresa credenciales invalidas
Entonces ve un mensaje de error
Estado: ⏳ Pendiente
```

Convertir al formato BMAD:
```yaml
acceptance_criteria:
  total: 2
  validated: 1
  list:
    - id: "AC1"
      title: "Login valido"
      status: "validated"
    - id: "AC2"
      title: "Login invalido"
      status: "pending"
```

### Paso 5: Inicializar el historial

Si no hay historial, crear la entrada inicial:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: ""
    to: "{estado_actual}"
    by: "update-stories"
    reason: "Historial inicializado"
```

### Paso 6: Validar la conformidad INVEST

Ejecutar las verificaciones INVEST y agregar la puntuacion:
```yaml
invest_score:
  independent: true
  negotiable: true
  valuable: true
  estimable: true   # false si no hay story_points
  small: true       # false si > 8 puntos
  testable: true    # false si no hay AC
  total: 6
```

### Paso 7: Actualizar sprint-status.yaml

Fusionar los campos actualizados en sprint-status.yaml.

### Paso 8: Actualizar los archivos story (opcional)

Agregar el comentario metadata BMAD a los archivos story:
```markdown
<!-- BMAD v6 Metadata
tdd_phase: green
invest_score: 6/6
last_sync: 2026-01-29T10:00:00Z
-->
```

## Formato de salida

```
📝 Actualizacion Stories a BMAD v6
====================================

## Stories actualizadas: {CANTIDAD}

| Story | Campos agregados | Puntuacion INVEST |
|-------|------------------|-------------------|
| US-001 | tdd_phase, history | 6/6 ✅ |
| US-002 | tasks.list, history | 5/6 ⚠️ |
| US-003 | story_points requerido | 4/6 ❌ |

## Resumen de campos

| Campo | Agregado a | Omitido |
|-------|------------|---------|
| tdd_phase | 10 | 2 (ya definido) |
| tasks.list | 8 | 4 (ya definido) |
| history | 12 | 0 |
| invest_score | 12 | 0 |

## Advertencias

⚠️ US-003: Story points faltantes - por favor estimar
⚠️ US-007: Sin criterios de aceptacion - agregar antes del desarrollo

## Archivos modificados
- .bmad/sprint-status.yaml
- project-management/backlog/user-stories/US-001-*.md (comentario metadata)

## Proximos pasos
1. Corregir las advertencias: agregar los story_points y AC faltantes
2. Ejecutar `/project:sync-backlog` para verificar la coherencia
3. Ejecutar `/gate:validate-backlog` para validacion completa
```

## Ejemplo

```
/project:update-stories --dry-run
/project:update-stories
/project:update-stories US-001
```

## Validacion

Despues de la actualizacion, todas las stories deben aprobar:
```
/gate:validate-backlog
```
