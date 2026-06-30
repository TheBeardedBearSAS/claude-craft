---
description: "Ejecutar todas las stories listas del sprint actual"
argument-hint: "[--auto] [--dry-run]"
---

# Run Sprint

Poner en cola y ejecutar todas las stories del sprint actual que estan listas para desarrollo.

## Argumentos

$ARGUMENTS (format: [--auto] [--dry-run])
- **--auto** (opcional): Iniciar el procesamiento inmediatamente
- **--dry-run** (opcional): Previsualizar el plan de ejecucion sin modificaciones

## Modo Plan

> **El modo plan es recomendado.** Claude activa el modo plan para estructurar el enfoque, identificar dependencias y presentar una estrategia de generación antes de crear artefactos.

## Proceso

### Paso 1: Validar el sprint

1. Ejecutar `/gate:validate-sprint` para asegurar que el sprint esta listo
2. Si el gate falla, mostrar los problemas y salir
3. Obtener los metadatos del sprint

### Paso 2: Recolectar las stories listas

1. Obtener todas las stories con estado `ready-for-dev`
2. Ordenar por prioridad (si esta definida) o ID
3. Calcular el total de story points

### Paso 3: Construir el plan de ejecucion

Crear una cola ordenada:
1. Analizar las dependencias entre stories
2. Construir el grafo de dependencias
3. Determinar el orden de ejecucion
4. Identificar los grupos paralelizables

### Paso 4: Poner en cola las stories

Agregar todas las stories a `.bmad/batch-queue.yaml` con:
- Prioridad basada en dependencias y orden
- Dependencias mapeadas
- Estado establecido en `pending`

### Paso 5: Ejecutar (si --auto)

Iniciar el procesamiento de la cola:
- Secuencial por defecto
- Usar `--parallel N` para ejecucion paralela
- Checkpoint despues de cada story

## Formato de salida

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Sprint: sprint-3 (DRY RUN)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestion de Usuarios
Periodo: 2026-01-29 → 2026-02-12

Sprint Gate: ✅ VALIDADO

Stories listas: 5
Total Puntos: 21

Plan de ejecucion:
──────────────────────────────────────────────────────

Fase 1 (sin dependencias):
  📖 US-010: Registro de usuario (5 pts)

Fase 2 (despues de US-010):
  📖 US-011: Inicio de sesion de usuario (5 pts)
  📖 US-012: Pagina de perfil (5 pts)
  📖 US-014: Verificacion de email (3 pts)

Fase 3 (despues de US-010, US-011):
  📖 US-013: Restablecimiento de contrasena (3 pts)

Oportunidades de paralelizacion:
──────────────────────────────────────────────────────
* Fase 2: US-011, US-012, US-014 pueden ejecutarse en paralelo
* Paralelismo maximo: 3 stories

Duracion estimada:
──────────────────────────────────────────────────────
Secuencial: ~3.5 horas (prom 42 min/story)
Paralelo (3): ~2 horas

⚠️ DRY RUN - Ninguna modificacion efectuada

Para ejecutar:
  /project:run-sprint
  /project:run-sprint --auto
  /project:run-sprint --auto --parallel 3
═══════════════════════════════════════════════════════
```

### Puesta en cola

```
═══════════════════════════════════════════════════════
              Run Sprint: sprint-3
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestion de Usuarios
Periodo: 2026-01-29 → 2026-02-12

Validando el sprint...
  ✅ Metadatos sprint completos
  ✅ Sprint goal definido
  ✅ 5 stories listas
  ✅ Todas las stories estimadas

Poniendo stories en cola...
──────────────────────────────────────────────────────
✅ US-010: Registro de usuario (prioridad 1)
✅ US-011: Inicio de sesion de usuario (prioridad 2)
✅ US-012: Pagina de perfil (prioridad 3)
✅ US-013: Restablecimiento de contrasena (prioridad 4)
✅ US-014: Verificacion de email (prioridad 5)

Resumen de la cola:
──────────────────────────────────────────────────────
Stories en cola: 5
Total puntos: 21
Dependencias mapeadas: 4

Cola batch actualizada: .bmad/batch-queue.yaml

Para iniciar el procesamiento:
  /project:run-queue

O para ejecucion automatica:
  /project:run-sprint --auto
═══════════════════════════════════════════════════════
```

### Ejecucion auto

```
═══════════════════════════════════════════════════════
              Run Sprint: sprint-3 (AUTO)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestion de Usuarios

Validando... ✅
Poniendo en cola... ✅
Iniciando la ejecucion...

──────────────────────────────────────────────────────

[1/5] US-010: Registro de usuario
      ⏳ Transicion a in-progress
      🔴 TDD Red: Escribiendo tests fallidos
      🟢 TDD Green: Implementando el codigo
      🔵 TDD Refactor: Limpiando
      ✅ Tests aprobados
      👀 Listo para review
      ✅ Completado

      Progreso: ████░░░░░░░░░░░░░░░░ 20%

[2/5] US-011: Inicio de sesion de usuario
      ⏳ Transicion a in-progress
      🔴 TDD Red: Escribiendo tests fallidos
      ...

Progreso Sprint:
──────────────────────────────────────────────────────
█████████░░░░░░░░░░░ 45%

Completado: 2/5 stories (9/21 pts)
En curso: US-012 - Pagina de perfil
Tiempo transcurrido: 1h 23m
Restante estimado: 1h 45m
═══════════════════════════════════════════════════════
```

### Finalizacion

```
═══════════════════════════════════════════════════════
              Sprint Completado!
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestion de Usuarios

Resultados:
──────────────────────────────────────────────────────
✅ Completado: 5/5 stories
📊 Puntos: 21/21 entregados
⏱️ Duracion: 3h 18min

Resumen de stories:
| Story | Puntos | Duracion | Estado |
|-------|--------|----------|--------|
| US-010 | 5 | 45m | ✅ done |
| US-011 | 5 | 38m | ✅ done |
| US-012 | 5 | 52m | ✅ done |
| US-013 | 3 | 28m | ✅ done |
| US-014 | 3 | 35m | ✅ done |

Quality Gates:
──────────────────────────────────────────────────────
✅ Todas las stories pasaron la DoD
✅ Todos los tests aprobados
✅ Codigo revisado

Estado Sprint:
──────────────────────────────────────────────────────
📋 Backlog: 3 (proximo sprint)
✅ Done: 5

🎉 Objetivo del sprint alcanzado!

Proximos pasos:
  /sprint:retrospective    Iniciar la retrospectiva
  /sprint:plan            Planificar el proximo sprint
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/project:run-sprint --dry-run
/project:run-sprint
/project:run-sprint --auto
/project:run-sprint --auto --parallel 3
```

## Configuracion

Parametros de ejecucion sprint en `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
```

## Interrupcion y reanudacion

Si se interrumpe (Ctrl+C o error):
```
/project:run-queue --resume
```

El checkpoint se guarda despues de cada story completada.

## Integracion

Funciona con:
- `/sprint:status --bmad` - Ver el progreso
- `/gate:report` - Metricas de calidad
- Ralph (si esta configurado) - Orquestacion externa
