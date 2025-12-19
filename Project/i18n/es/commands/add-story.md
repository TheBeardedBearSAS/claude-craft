---
description: Agregar una User Story
argument-hint: [arguments]
---

# Agregar una User Story

Crear una nueva User Story y asociarla a un EPIC.

## Argumentos

$ARGUMENTS (formato: EPIC-XXX "Nombre de US" [puntos])
- **EPIC-ID** (obligatorio): ID del EPIC padre (ej., EPIC-001)
- **Nombre** (obligatorio): Título de la User Story
- **Puntos** (opcional): Story points en Fibonacci (1, 2, 3, 5, 8)

## Proceso

### Paso 1: Analizar argumentos

Extraer de $ARGUMENTS:
- ID del EPIC
- Nombre de la User Story
- Story points (si se proporcionan)

### Paso 2: Validar EPIC

1. Verificar que el EPIC existe en `project-management/backlog/epics/`
2. Si no se encuentra, mostrar error con EPICs disponibles

### Paso 3: Generar ID

1. Leer archivos en `project-management/backlog/user-stories/`
2. Encontrar el último ID utilizado (formato US-XXX)
3. Incrementar para obtener el nuevo ID

### Paso 4: Recopilar información

Preguntar al usuario:
- **Persona**: ¿Quién es el usuario? (P-XXX o descripción)
- **Acción**: ¿Qué quiere hacer?
- **Beneficio**: ¿Por qué lo quiere?
- **Criterios de aceptación**: Al menos 2 en formato Gherkin
- **Puntos**: Si no se proporcionan, estimar (Fibonacci: 1, 2, 3, 5, 8)

### Paso 5: Crear el archivo

1. Usar plantilla `Scrum/templates/user-story.md`
2. Reemplazar marcadores de posición:
   - `{ID}`: ID generado
   - `{NOM}`: Nombre de la US
   - `{EPIC_ID}`: ID del EPIC padre
   - `{SPRINT}`: "Backlog" (sin asignar)
   - `{POINTS}`: Story points
   - `{PERSONA}`: Persona identificada
   - `{PERSONA_ID}`: ID de la Persona
   - `{ACTION}`: Acción deseada
   - `{BENEFICE}`: Beneficio esperado
   - `{DATE}`: Fecha actual (YYYY-MM-DD)

3. Agregar criterios de aceptación en formato Gherkin

4. Crear archivo: `project-management/backlog/user-stories/US-{ID}-{slug}.md`

### Paso 6: Actualizar EPIC

1. Leer archivo del EPIC
2. Agregar US a la tabla de User Stories
3. Actualizar progreso
4. Guardar

### Paso 7: Actualizar índice

1. Leer `project-management/backlog/index.md`
2. Agregar US a la sección "Backlog Priorizado"
3. Actualizar contadores
4. Guardar

## Formato de salida

```
✅ User Story creada con éxito!

📖 US-{ID}: {NAME}
   EPIC: {EPIC_ID}
   Estado: 🔴 To Do
   Puntos: {POINTS}
   Archivo: project-management/backlog/user-stories/US-{ID}-{slug}.md

Próximos pasos:
  /project:move-story US-{ID} sprint-X    # Asignar a sprint
  /project:add-task US-{ID} "[BE] ..." 4h # Agregar tareas
```

## Ejemplo

```
/project:add-story EPIC-001 "Inicio de sesión de usuario" 5
```

Crea:
- `project-management/backlog/user-stories/US-001-user-login.md`

## Validación INVEST

Verificar que la US sigue INVEST:
- **I**ndependiente: Se puede desarrollar sola
- **N**egociable: Los detalles se pueden discutir
- **V**aliosa: Aporta valor a la persona
- **E**stimable: Se puede estimar (puntos proporcionados)
- **S**mall (Pequeña): ≤ 8 puntos (de lo contrario sugerir división)
- **T**esteable: Tiene criterios de aceptación claros
