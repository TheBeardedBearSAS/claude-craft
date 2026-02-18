---
description: Agregar un EPIC
argument-hint: [arguments]
---

# Agregar un EPIC

Crear un nuevo EPIC en el backlog.

## Argumentos

$ARGUMENTS (formato: "Nombre del EPIC" [prioridad])
- **Nombre** (obligatorio): Título del EPIC
- **Prioridad** (opcional): High, Medium, Low (por defecto: Medium)

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Proceso

### Paso 1: Analizar argumentos

Extraer:
- Nombre del EPIC de $ARGUMENTS
- Prioridad (si se proporciona, de lo contrario Medium)

### Paso 2: Generar ID

1. Leer archivos en `project-management/backlog/epics/`
2. Encontrar el último ID utilizado (formato EPIC-XXX)
3. Incrementar para obtener el nuevo ID

### Paso 3: Recopilar información

Preguntar al usuario (si no se proporciona):
- Descripción del EPIC
- MMF (Minimum Marketable Feature)
- Objetivos de negocio (2-3 puntos)
- Criterios de éxito

### Paso 4: Crear el archivo

1. Usar plantilla `Scrum/templates/epic.md`
2. Reemplazar marcadores de posición:
   - `{ID}`: ID generado
   - `{NOM}`: Nombre del EPIC
   - `{PRIORITE}`: Prioridad elegida
   - `{MINIMUM_MARKETABLE_FEATURE}`: MMF
   - `{DESCRIPTION}`: Descripción
   - `{DATE}`: Fecha actual (YYYY-MM-DD)
   - `{OBJECTIF_1}`, `{OBJECTIF_2}`: Objetivos de negocio
   - `{CRITERE_1}`, `{CRITERE_2}`: Criterios de éxito

3. Crear archivo: `project-management/backlog/epics/EPIC-{ID}-{slug}.md`

### Paso 5: Actualizar índice

1. Leer `project-management/backlog/index.md`
2. Agregar EPIC a la tabla de EPICs
3. Actualizar contadores resumen
4. Guardar

## Formato de salida

```
✅ EPIC creado con éxito!

📋 EPIC-{ID}: {NAME}
   Estado: 🔴 To Do
   Prioridad: {PRIORITY}
   Archivo: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Próximos pasos:
  /project:add-story EPIC-{ID} "Nombre de User Story"
```

## Ejemplo

```
/project:add-epic "Sistema de autenticación" High
```

Crea:
- `project-management/backlog/epics/EPIC-001-authentication-system.md`

## Validación

- [ ] El nombre no está vacío
- [ ] La prioridad es válida (High/Medium/Low)
- [ ] El directorio `project-management/backlog/epics/` existe
- [ ] El ID es único
