---
description: Procesar la cola batch de stories
argument-hint: [--parallel N] [--auto] [--resume]
---

# Run Queue

Procesar las stories en la cola batch secuencialmente o en paralelo.

## Argumentos

$ARGUMENTS (format: [--parallel N] [--auto] [--resume])
- **--parallel N** (opcional): Procesar N stories en paralelo. Por defecto: 1 (secuencial)
- **--auto** (opcional): Iniciar el procesamiento inmediatamente sin confirmacion
- **--resume** (opcional): Reanudar desde el ultimo checkpoint

## Proceso

### Paso 1: Cargar la cola

1. Leer `.bmad/batch-queue.yaml`
2. Obtener todas las stories con estado `pending`
3. Ordenar por prioridad

### Paso 2: Verificar las dependencias

Para cada story:
- Verificar si las dependencias estan completadas
- Omitir si esta bloqueada por una story pendiente
- Senalar si esta bloqueada por una story fallida

### Paso 3: Procesar las stories

Para cada story elegible:
1. Marcar como `running`
2. Establecer el timestamp `started_at`
3. Ejecutar el workflow de desarrollo:
   - Transicion a in-progress
   - Ciclo TDD (red → green → refactor)
   - Ejecutar los tests
   - Code review
   - Validacion quality gate
4. Marcar como `completed` o `failed`
5. Actualizar el checkpoint

### Paso 4: Gestionar los fallos

Si una story falla:
- Marcar como `failed` con mensaje de error
- Verificar el parametro `resume_on_failure`
- Continuar o detenerse segun la configuracion

### Paso 5: Reportar los resultados

Mostrar el estado final y las metricas.

## Formato de salida

### Procesamiento

```
═══════════════════════════════════════════════════════
              Procesamiento de la Cola Batch
═══════════════════════════════════════════════════════

Modo: Secuencial
Cola: 5 en espera

Procesando:
──────────────────────────────────────────────────────

[1/5] US-010: Registro de usuario
      Iniciando... ✅
      TDD Red → Green → Refactor ✅
      Tests aprobados ✅
      Quality gate ✅
      Completado en 45 min

      Checkpoint guardado.

[2/5] US-011: Inicio de sesion de usuario
      Iniciando... ✅
      TDD Red → Green → Refactor ✅
      Tests aprobados ✅
      Quality gate ✅
      Completado en 38 min

      Checkpoint guardado.

[3/5] US-012: Pagina de perfil
      Iniciando... ✅
      TDD Red... 🔄 en curso

      (Ctrl+C para pausar, reanudara desde el checkpoint)
```

### Completado

```
═══════════════════════════════════════════════════════
              Cola Batch Completada
═══════════════════════════════════════════════════════

Resultados:
──────────────────────────────────────────────────────
✅ Completado: 5
❌ Fallido: 0
⏭️ Omitido: 0

Stories procesadas:
| Story | Estado | Duracion |
|-------|--------|----------|
| US-010 | ✅ done | 45 min |
| US-011 | ✅ done | 38 min |
| US-012 | ✅ done | 52 min |
| US-013 | ✅ done | 28 min |
| US-014 | ✅ done | 35 min |

Tiempo total: 3h 18min
Promedio por story: 40 min

Estado Sprint:
──────────────────────────────────────────────────────
📋 Backlog: 2
🎯 Ready: 0
🔄 En curso: 0
👀 Review: 0
✅ Done: 8

Comandos:
  /sprint:status --bmad    Ver el estado actualizado
  /gate:report          Informe de calidad
═══════════════════════════════════════════════════════
```

### Con fallos

```
═══════════════════════════════════════════════════════
              Cola Batch Interrumpida
═══════════════════════════════════════════════════════

Resultados:
──────────────────────────────────────────────────────
✅ Completado: 3
❌ Fallido: 1
⏭️ Omitido: 1 (dependencia fallida)

Detalles del fallo:
──────────────────────────────────────────────────────
❌ US-012: Pagina de perfil
   Error: Tests fallidos en ProfileController
   Fase TDD: red
   Ultimo checkpoint: TASK-033

   Stack trace:
   AssertionError: Expected 200, got 401
   at ProfileControllerTest.testGetProfile

Acciones:
──────────────────────────────────────────────────────
1. Corregir el test fallido
2. Reanudar el procesamiento:
   /project:run-queue --resume

O reiniciar y reintentar:
   /project:queue-reset US-012
   /project:run-queue
═══════════════════════════════════════════════════════
```

### Modo paralelo

```
═══════════════════════════════════════════════════════
              Procesamiento de la Cola Batch
═══════════════════════════════════════════════════════

Modo: Paralelo (3 workers)
Cola: 5 en espera

Procesando:
──────────────────────────────────────────────────────

Worker 1: US-010 - Registro de usuario 🔄
Worker 2: (esperando dependencias)
Worker 3: (esperando dependencias)

[10:05] US-010 iniciado
[10:08] US-010: Fase TDD Green
[10:12] US-010: Tests aprobados
[10:15] US-010 completado ✅

[10:15] Dependencias resueltas, iniciando batch paralelo:
Worker 1: US-011 - Inicio de sesion de usuario 🔄
Worker 2: US-012 - Pagina de perfil 🔄
Worker 3: US-014 - Verificacion de email 🔄

[10:20] US-014 completado ✅
[10:22] US-011 completado ✅
Worker 3: US-013 - Restabl. contrasena 🔄 (deps: US-010, US-011 ✅)
[10:25] US-012 completado ✅
[10:30] US-013 completado ✅

Todos los workers terminados.
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/project:run-queue
/project:run-queue --auto
/project:run-queue --parallel 3
/project:run-queue --resume
```

## Configuracion

Parametros de la cola en `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"  # o "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600

settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

## Checkpoints

Los checkpoints se guardan despues de cada story:
```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

Reanudar desde el checkpoint:
```
/project:run-queue --resume
```
