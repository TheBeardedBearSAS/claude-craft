---
description: Ejecutar todas las stories de un epic en batch
argument-hint: <epic-id> [--dry-run]
---

# Run Epic

Poner en cola y procesar todas las stories de un epic en modo batch.

## Argumentos

$ARGUMENTS (format: <epic-id> [--dry-run])
- **epic-id** (requerido): Identificador del epic (ej: EPIC-001)
- **--dry-run** (opcional): Previsualizar sin ejecutar

## Modo Plan

> **El modo plan es recomendado.** Claude activa el modo plan para estructurar el enfoque, identificar dependencias y presentar una estrategia de generación antes de crear artefactos.

## Proceso

### Paso 1: Identificar las stories del epic

1. Leer `.bmad/sprint-status.yaml`
2. Encontrar todas las stories con `epic_id` correspondiente al argumento
3. Ordenar por prioridad o ID

### Paso 2: Verificar la preparacion de las stories

Para cada story, verificar:
- La story existe y tiene los campos requeridos
- No esta ya terminada
- No esta bloqueada (o senalar para revision)

### Paso 3: Construir la cola de ejecucion

Crear una cola priorizada:
1. Stories sin dependencias primero
2. ID mas bajo = prioridad mas alta
3. Respetar la prioridad explicita si esta definida

### Paso 4: Agregar a la cola batch

Actualizar `.bmad/batch-queue.yaml`:
```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-002"
    priority: 2
    dependencies: ["US-001"]
```

### Paso 5: Ejecutar (excepto --dry-run)

Para cada story en orden:
1. Transicionar a in-progress
2. Ejecutar el workflow de desarrollo
3. Ejecutar los quality gates
4. Transicionar a traves de los estados
5. Checkpoint despues de cada una

## Formato de salida

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Epic: EPIC-002 (DRY RUN)
═══════════════════════════════════════════════════════

Epic: EPIC-002 - Gestion de Usuarios
Stories: 5

Plan de ejecucion:
──────────────────────────────────────────────────────
[1] US-010: Registro de usuario (5 pts)
    Estado: ready-for-dev → in-progress → review → done
    Dependencias: ninguna

[2] US-011: Inicio de sesion de usuario (5 pts)
    Estado: ready-for-dev → in-progress → review → done
    Dependencias: US-010

[3] US-012: Pagina de perfil (5 pts)
    Estado: ready-for-dev → in-progress → review → done
    Dependencias: US-010

[4] US-013: Restablecimiento de contrasena (3 pts)
    Estado: ready-for-dev → in-progress → review → done
    Dependencias: US-010, US-011

[5] US-014: Verificacion de email (3 pts)
    Estado: ready-for-dev → in-progress → review → done
    Dependencias: US-010

Total Puntos: 21

Orden de ejecucion (respetando dependencias):
  1. US-010 (sin deps)
  2. US-011, US-012, US-014 (paralelo despues de US-010)
  3. US-013 (despues de US-010, US-011)

Workflow estimado por story:
  * Transicion a in-progress
  * Ciclos TDD (red → green → refactor)
  * Code review
  * Validacion quality gate
  * Transicion a done

⚠️ DRY RUN - Ninguna modificacion efectuada

Ejecutar sin --dry-run para lanzar.
═══════════════════════════════════════════════════════
```

### Ejecucion

```
═══════════════════════════════════════════════════════
              Run Epic: EPIC-002
═══════════════════════════════════════════════════════

Epic: EPIC-002 - Gestion de Usuarios
Modo: Secuencial
Stories: 5

Poniendo stories en cola...
──────────────────────────────────────────────────────
✅ Agregado US-010 (prioridad 1)
✅ Agregado US-011 (prioridad 2, depende de US-010)
✅ Agregado US-012 (prioridad 3, depende de US-010)
✅ Agregado US-013 (prioridad 4, depende de US-010, US-011)
✅ Agregado US-014 (prioridad 5, depende de US-010)

Estado de la cola:
──────────────────────────────────────────────────────
⏳ En espera: 5
🔄 En proceso: 0
✅ Completado: 0
❌ Fallido: 0

Proximos pasos:
──────────────────────────────────────────────────────
Ejecutar la cola:
  /project:run-queue

O procesar automaticamente:
  /project:run-queue --auto

Monitorear el progreso:
  /project:batch-status
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/project:run-epic EPIC-002 --dry-run
/project:run-epic EPIC-002
```

## Ejecucion paralela

Para las stories independientes, activar el modo paralelo:
```
/project:run-queue --parallel 3
```

Esto procesa hasta 3 stories simultaneamente cuando no tienen dependencias.

## Reanudacion

Si la ejecucion se interrumpe:
```
/project:run-queue --resume
```

Continua desde el ultimo checkpoint.

## Integracion con Ralph

Si Ralph esta configurado, la ejecucion batch se integra:
```yaml
# ralph.yml
bmad_integration:
  enabled: true
  batch_queue_file: ".bmad/batch-queue.yaml"
```
