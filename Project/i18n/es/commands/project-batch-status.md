---
description: Mostrar el estado de la cola de procesamiento batch
argument-hint: [--history]
---

# Batch Status

Mostrar el estado actual de la cola de procesamiento batch.

## Argumentos

$ARGUMENTS (format: [--history])
- **--history** (opcional): Mostrar el historial de stories completadas/fallidas

## Proceso

### Paso 1: Cargar la cola

1. Leer `.bmad/batch-queue.yaml`
2. Parsear las entradas de la cola
3. Cargar los datos de checkpoint

### Paso 2: Categorizar las stories

Agrupar por estado:
- `pending` - En espera de procesamiento
- `running` - En proceso
- `completed` - Terminado con exito
- `failed` - Error encontrado
- `skipped` - Omitido debido a fallo de dependencia

### Paso 3: Mostrar el estado de la cola

Mostrar el estado actual de la cola con detalles.

### Paso 4: Mostrar el historial (si se solicita)

Mostrar las stories completadas y fallidas con tiempos.

## Formato de salida

### Cola activa

```
═══════════════════════════════════════════════════════
              Estado Cola Batch
═══════════════════════════════════════════════════════

Modo: Secuencial
Checkpoint: US-011 (2026-01-29 10:45:00)

Resumen de la cola:
──────────────────────────────────────────────────────
⏳ En espera:  3
🔄 En proceso: 1
✅ Completado: 2
❌ Fallido:    0
⏭️ Omitido:   0

Total: 6 stories

En proceso:
──────────────────────────────────────────────────────
🔄 US-012: Pagina de perfil
   Prioridad: 3
   Iniciado: 2026-01-29 10:45:00 (hace 15 min)
   Fase TDD: green
   Tarea: 2/4

En espera:
──────────────────────────────────────────────────────
[4] US-013: Restablecimiento de contrasena
    Dependencias: US-010 ✅, US-011 ✅

[5] US-014: Verificacion de email
    Dependencias: US-010 ✅

[6] US-015: Pagina de configuracion
    Dependencias: ninguna

Progreso:
──────────────────────────────────────────────────────
██████████░░░░░░░░░░ 50% (3/6 stories)

Fin estimado: ~1h 30m
═══════════════════════════════════════════════════════
```

### Con historial

```
═══════════════════════════════════════════════════════
              Estado Cola Batch
═══════════════════════════════════════════════════════

Modo: Secuencial
Ultimo checkpoint: US-014

Resumen de la cola:
──────────────────────────────────────────────────────
⏳ En espera:  0
🔄 En proceso: 0
✅ Completado: 5
❌ Fallido:    1
⏭️ Omitido:   1

Historial de completados:
──────────────────────────────────────────────────────
| Story | Iniciado | Terminado | Duracion |
|-------|----------|-----------|----------|
| US-010 | 10:00 | 10:42 | 42m |
| US-011 | 10:42 | 11:18 | 36m |
| US-012 | 11:18 | 12:05 | 47m |
| US-014 | 12:05 | 12:38 | 33m |
| US-015 | 12:38 | 13:10 | 32m |

Fallidos:
──────────────────────────────────────────────────────
❌ US-013: Restablecimiento de contrasena
   Iniciado: 12:05
   Fallido: 12:22
   Duracion: 17m
   Error: Asercion de test fallida en PasswordResetTest
   Fase TDD: red

Omitidos:
──────────────────────────────────────────────────────
⏭️ US-016: Panel de administracion
   Razon: Depende de US-013 que fallo

Estadisticas:
──────────────────────────────────────────────────────
Tiempo total: 3h 10m
Promedio por story: 38m
Tasa de exito: 83% (5/6)
Puntos completados: 18/21

Acciones:
──────────────────────────────────────────────────────
Para reintentar las stories fallidas:
  /project:queue-retry US-013

Para vaciar la cola:
  /project:queue-clear
═══════════════════════════════════════════════════════
```

### Cola vacia

```
═══════════════════════════════════════════════════════
              Estado Cola Batch
═══════════════════════════════════════════════════════

La cola esta vacia.

Ninguna story esta actualmente en cola de procesamiento.

Para agregar stories:
  /project:run-epic EPIC-001    Poner un epic en cola
  /project:run-sprint           Poner las stories del sprint en cola

O agregar una story individual:
  .bmad/lib/batch-executor.sh add US-001
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/project:batch-status
/project:batch-status --history
```

## Gestion de la cola

### Agregar una story a la cola
```bash
.bmad/lib/batch-executor.sh add US-001 1
```

### Reintentar una story fallida
```
/project:queue-retry US-013
```

### Vaciar la cola
```
/project:queue-clear --force
```

### Reanudar desde el checkpoint
```
/project:run-queue --resume
```

## Configuracion

Archivo de la cola: `.bmad/batch-queue.yaml`

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```
