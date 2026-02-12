---
description: Validar una story contra la Definition of Done
argument-hint: <story-id>
---

# Validar Story Gate (DoD)

Valida una User Story contra los criterios de la Definition of Done.
Todos los criterios deben aprobarse para marcar la story como terminada.

## Argumentos

$ARGUMENTS (format: <story-id>)
- **story-id** (requerido): Identificador de la story (ej: US-001)

## Criterios Definition of Done

| Criterio | Peso | Requerido | Descripcion |
|----------|------|-----------|-------------|
| Tareas completas | 20% | Si | Todas las tareas marcadas como done |
| Tests aprobados | 20% | Si | Ciclo TDD completo (green/refactor) |
| AC validados | 20% | Si | Todos los criterios de aceptacion validados |
| Codigo revisado | 15% | Si | Revision por pares terminada |
| Sin bloqueantes | 10% | Si | No en estado bloqueado |
| Documentacion | 10% | No | Docs actualizadas si es necesario |
| Revision seguridad | 5% | No | Implicaciones de seguridad verificadas |

**Umbral: 100% (todos los criterios requeridos)**

## Proceso

### Paso 1: Cargar la story

1. Leer `.bmad/sprint-status.yaml`
2. Encontrar la story por ID
3. Cargar todos los campos de la story

### Paso 2: Validar cada criterio

Verificar todos los criterios DoD:
- Tareas: `tasks.completed == tasks.total`
- Tests: `tdd_phase in ['green', 'refactor', 'done']`
- AC: `acceptance_criteria.validated == acceptance_criteria.total`
- Review: `status == 'review' or review.approved == true`
- Bloqueantes: `blocked_reason == null`

### Paso 3: Generar el informe

Mostrar los resultados detallados con estado pass/fail.

## Formato de salida

### Story valida DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: Verificacion de email
Estado: review → done (pendiente)

Definition of Done:
──────────────────────────────────────────────────────
✅ Tareas completas (20%)
   Todas las tareas terminadas: 4/4
   □ TASK-021: Endpoint backend ✓
   □ TASK-022: Servicio de email ✓
   □ TASK-023: Flujo frontend ✓
   □ TASK-024: Tests ✓

✅ Tests aprobados (20%)
   Fase TDD: refactor
   Todos los tests en verde

✅ Criterios de Aceptacion (20%)
   Validados: 3/3
   ✓ AC1: Email de verificacion enviado
   ✓ AC2: El enlace expira despues de 24h
   ✓ AC3: Estado del usuario actualizado

✅ Codigo revisado (15%)
   PR #42 aprobada por @reviewer
   Estado review: aprobado

✅ Sin bloqueantes (10%)
   Ningun problema bloqueante

✅ Documentacion (10%)
   Docs API actualizadas

✅ Revision seguridad (5%)
   Generacion de token revisada

Puntuacion: 100/100
──────────────────────────────────────────────────────

✅ STORY DoD GATE VALIDADO

La story puede transicionarse hacia 'done'.
Ejecutar: /sprint:transition US-005 done
═══════════════════════════════════════════════════════
```

### Story falla DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: Verificacion de email
Estado: in-progress

Definition of Done:
──────────────────────────────────────────────────────
❌ Tareas completas (20%)
   Tareas terminadas: 2/4
   ✓ TASK-021: Endpoint backend
   ✓ TASK-022: Servicio de email
   □ TASK-023: Flujo frontend (en curso)
   □ TASK-024: Tests (pendiente)

❌ Tests aprobados (20%)
   Fase TDD: red
   Los tests fallan

⚠️ Criterios de Aceptacion (20%)
   Validados: 1/3
   ✓ AC1: Email de verificacion enviado
   □ AC2: El enlace expira despues de 24h
   □ AC3: Estado del usuario actualizado

❌ Codigo revisado (15%)
   Ninguna PR creada

✅ Sin bloqueantes (10%)
   Ningun problema bloqueante

⏳ Documentacion (10%)
   No verificado

⏳ Revision seguridad (5%)
   No verificado

Puntuacion: 25/100
──────────────────────────────────────────────────────

❌ STORY DoD GATE FALLIDO

Acciones requeridas:
──────────────────────────────────────────────────────
1. Terminar las tareas restantes
   - TASK-023: Flujo frontend
   - TASK-024: Tests

2. Corregir los tests fallidos
   Fase TDD actual: red
   Ejecutar los tests e implementar las correcciones

3. Validar los criterios de aceptacion
   - Probar AC2: Expiracion del enlace
   - Probar AC3: Actualizacion estado usuario

4. Crear una pull request para revision
   git push && gh pr create

Trabajo restante estimado:
  Tareas: 2 restantes
  Ciclos TDD: 2 (para las tareas restantes)

Reanudar el trabajo: /sprint:dev US-005
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:validate-story US-005
/gate:validate-story US-001
```

## Guia fases TDD

| Fase | Significado | Siguiente paso |
|------|-------------|----------------|
| red | Tests fallan | Implementar el codigo |
| green | Tests pasan | Refactorizar |
| refactor | Limpieza | Terminar o siguiente tarea |
| done | Ciclo completo | Pasar a review |

Actualizar la fase:
```
/sprint:tdd US-005 green
```

## Integracion

Este gate se verifica:
1. Manualmente via este comando
2. En el hook Stop (quality-gate.sh)
3. Antes de `/sprint:transition <id> done`

Configuracion del gate: `.bmad/gates/story-gate.yaml`
