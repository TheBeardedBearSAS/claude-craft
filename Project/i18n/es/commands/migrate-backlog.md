---
description: Migrar el backlog existente al formato BMAD v6
argument-hint: [--dry-run] [--force]
---

# Migrar el Backlog

Convertir el backlog existente al formato BMAD v6 con seguimiento sprint-status.yaml.

## Argumentos

$ARGUMENTS (format: [--dry-run] [--force])
- **--dry-run** (opcional): Vista previa de los cambios sin aplicarlos
- **--force** (opcional): Sobrescribir los archivos BMAD existentes

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Prerrequisitos

Ejecutar `/project:analyze-backlog` primero para entender la estructura actual.

## Proceso

### Paso 1: Validar los prerrequisitos

1. Verificar que el directorio `.bmad/` existe (crear si es necesario)
2. Verificar la existencia de `sprint-status.yaml` (advertir si existe y no hay --force)
3. Verificar que el analisis del backlog ha sido efectuado

### Paso 2: Crear la estructura BMAD

```
.bmad/
├── sprint-status.yaml       # Archivo principal de seguimiento
├── batch-queue.yaml         # Cola de procesamiento batch
├── gates/                   # Configuraciones de los quality gates
├── hooks/                   # Hooks Claude Code
└── lib/                     # Scripts utilitarios
```

### Paso 3: Parsear el backlog existente

Para cada User Story encontrada:
1. Extraer todos los metadatos
2. Parsear los criterios de aceptacion (formato Gherkin)
3. Identificar las tareas asociadas
4. Determinar el estado actual
5. Calcular el porcentaje de completitud

### Paso 4: Generar sprint-status.yaml

Transformar cada story al formato BMAD v6:

```yaml
stories:
  US-001:
    title: "Inicio de sesion de usuario"
    status: "in-progress"
    previous_status: "ready-for-dev"
    assigned_to: ""
    tdd_phase: "red"
    current_task: "TASK-001"
    story_points: 5
    epic_id: "EPIC-001"
    tasks:
      total: 4
      completed: 2
      list:
        - id: "TASK-001"
          title: "Endpoint backend auth"
          status: "in-progress"
    history:
      - timestamp: "2026-01-29T10:00:00Z"
        from: "backlog"
        to: "in-progress"
        by: "migration"
```

### Paso 5: Mapeo de estados

| Original | Estado BMAD v6 |
|----------|----------------|
| 🔴 Pendiente | backlog |
| 🟡 En curso | in-progress |
| 🟢 Completado | done |
| ⏸️ Bloqueado | blocked |
| Asignado Sprint-X | ready-for-dev |

### Paso 6: Inicializar la fase TDD

Definir la fase TDD inicial segun la completitud de las tareas:
- 0% tareas terminadas → `red`
- 1-99% tareas terminadas → `green`
- 100% tareas terminadas → `refactor` o `done`

### Paso 7: Crear una copia de seguridad (excepto --dry-run)

1. Copiar el backlog existente hacia `.bmad/backup/`
2. Agregar marca de tiempo a la copia
3. Registrar la ubicacion de la copia

### Paso 8: Aplicar la migracion (excepto --dry-run)

1. Escribir `sprint-status.yaml`
2. Actualizar los archivos de story con los metadatos BMAD
3. Crear `.bmad/migration-log.md`

## Formato de Salida

```
🔄 Migracion BMAD v6
====================

## Verificacion Previa
✅ Ubicacion backlog: project-management/backlog/
✅ Directorio BMAD: .bmad/ (creado)
✅ Sin sprint-status.yaml existente

## Resumen de Migracion

### Stories Migradas: {CANTIDAD}
| ID | Titulo | Estado | Fase TDD |
|----|--------|--------|----------|
| US-001 | Inicio de sesion | in-progress | green |

### Tareas Migradas: {CANTIDAD}
### Criterios de Aceptacion: {CANTIDAD}

## Archivos Creados
- .bmad/sprint-status.yaml
- .bmad/batch-queue.yaml
- .bmad/backup/backlog-2026-01-29.tar.gz

## Pasos Siguientes
1. Verificar sprint-status.yaml
2. Ejecutar `/sprint:status` para verificar
3. Configurar los metadatos del sprint
```

## Ejemplo

```
/project:migrate-backlog --dry-run
/project:migrate-backlog
/project:migrate-backlog --force
```
