---
description: Sincronizar los archivos del backlog con sprint-status.yaml
argument-hint: [--direction source] [--dry-run]
---

# Sync Backlog

Sincronizacion bidireccional entre los archivos markdown del backlog y sprint-status.yaml.

## Argumentos

$ARGUMENTS (format: [--direction source] [--dry-run])
- **--direction** (opcional): Direccion de sincronizacion
  - `files-to-yaml`: Actualizar sprint-status.yaml desde los archivos markdown
  - `yaml-to-files`: Actualizar los archivos markdown desde sprint-status.yaml
  - `bidirectional`: Fusionar ambos (por defecto, el mas reciente gana)
- **--dry-run** (opcional): Previsualizar los cambios sin aplicarlos

## Proceso

### Paso 1: Cargar ambas fuentes

1. Parsear `.bmad/sprint-status.yaml`
2. Parsear todos los archivos story del directorio backlog
3. Construir el mapa de comparacion por story ID

### Paso 2: Detectar los conflictos

Para cada story, comparar:
- Estado
- Conteo de tareas terminadas
- Validacion de los criterios de aceptacion
- Fase TDD
- Asignacion

Deteccion de conflictos:
```yaml
conflicts:
  US-001:
    field: status
    yaml_value: "in-progress"
    file_value: "🟢 Done"
    yaml_timestamp: "2026-01-29T09:00:00Z"
    file_timestamp: "2026-01-29T10:00:00Z"
    resolution: "file"  # el mas reciente gana
```

### Paso 3: Resolver los conflictos

Estrategias de resolucion:
1. **newest-wins** (por defecto): Usar el valor modificado mas recientemente
2. **yaml-wins**: Siempre preferir sprint-status.yaml
3. **files-win**: Siempre preferir los archivos markdown
4. **prompt**: Preguntar al usuario para cada conflicto

### Paso 4: Sync archivos → YAML

Actualizar sprint-status.yaml con:
- Nuevas stories encontradas en los archivos
- Cambios de estado desde los archivos
- Actualizaciones de tareas desde los archivos
- Validacion AC desde los archivos

### Paso 5: Sync YAML → archivos

Actualizar los archivos markdown con:
- Fase TDD (agregar al comentario metadata)
- Historial (agregar al comentario metadata)
- Puntuacion INVEST (agregar al comentario metadata)
- Timestamp de sincronizacion

### Paso 6: Gestionar los huerfanos

- **Stories en YAML pero no en archivos**: Marcar como `archived` o advertir
- **Stories en archivos pero no en YAML**: Agregar a sprint-status.yaml

### Paso 7: Actualizar los timestamps

Agregar el timestamp de ultima sincronizacion a ambos:
- `.bmad/sprint-status.yaml`: `last_sync: "2026-01-29T10:00:00Z"`
- Archivos story: `<!-- last_sync: 2026-01-29T10:00:00Z -->`

## Formato de salida

```
🔄 Sincronizacion del Backlog
==============================

## Direccion: Bidireccional

## Cambios detectados

### Archivos → YAML (4 cambios)
| Story | Campo | Anterior | Nuevo |
|-------|-------|----------|-------|
| US-001 | status | in-progress | done |
| US-002 | tasks.completed | 2 | 3 |

### YAML → Archivos (2 cambios)
| Story | Campo | Anterior | Nuevo |
|-------|-------|----------|-------|
| US-003 | tdd_phase | - | green |
| US-004 | invest_score | - | 5/6 |

## Conflictos resueltos

| Story | Campo | Resolucion | Valor |
|-------|-------|------------|-------|
| US-005 | status | newest-wins | done |

## Huerfanos

### Solo en YAML (archivados):
- US-010: "Antigua funcionalidad" (archivado el 2026-01-15)

### Solo en archivos (agregados al YAML):
- US-015: "Nueva funcionalidad"

## Sincronizacion completada

✅ sprint-status.yaml actualizado
✅ 12 archivos story actualizados
⏰ Ultima sync: 2026-01-29T10:00:00Z

## Proximos pasos
- Verificar los cambios en git diff
- Ejecutar `/sprint:status` para verificar
```

## Salida Dry Run

```
🔄 Sincronizacion del Backlog (DRY RUN)
========================================

⚠️ Ninguna modificacion sera efectuada

## Cambiaria:

### sprint-status.yaml
- US-001.status: "in-progress" → "done"
- US-002.tasks.completed: 2 → 3

### Archivos Story
- US-003: Agregar metadata tdd_phase
- US-004: Agregar metadata invest_score

Ejecutar sin --dry-run para aplicar los cambios.
```

## Ejemplo

```
/project:sync-backlog
/project:sync-backlog --direction files-to-yaml
/project:sync-backlog --direction yaml-to-files --dry-run
```

## Automatizacion

Agregar al hook pre-commit para sincronizacion automatica:
```bash
# .bmad/hooks/pre-commit.sh
/project:sync-backlog --direction files-to-yaml
```
