---
description: Ejecutar Claude en bucle continuo hasta completar tarea (Ralph Wiggum)
argument-hint: <descripcion-tarea> [--auto|--full]
---

# Ralph Run - Bucle Continuo de Agente IA

Ejecutar Claude en bucle continuo hasta que la tarea este completa o se cumplan los criterios de Definition of Done (DoD).

## Argumentos

**$ARGUMENTS**

- `<descripcion-tarea>`: La tarea para que Claude complete
- `--auto`: Deteccion automatica maxima, preguntas minimas
- `--full`: Modo completo con todas las verificaciones DoD

## Proceso

### 1. Inicializacion de Sesion

1. **Verificar prerequisitos**:
   - Verificar que Claude esta disponible
   - Buscar configuracion `ralph.yml`
   - Inicializar directorio de sesion (`.ralph/`)

2. **Cargar configuracion**:
   - Leer `ralph.yml` o `.claude/ralph.yml`
   - Establecer iteraciones max, timeouts, criterios DoD

### 2. Bucle Principal

```
┌─────────────────────────────────────────────────────────────┐
│  BUCLE RALPH                                                 │
│                                                              │
│  while (iteraciones < max && !DoD_aprobado) {                │
│      1. Verificar disyuntor                                  │
│      2. Invocar Claude con prompt actual                     │
│      3. Procesar salida                                      │
│      4. Validar Definition of Done                           │
│      5. Crear checkpoint (commit git)                        │
│      6. Si DoD no cumple, usar respuesta como prompt         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3. Validacion Definition of Done

El sistema DoD valida la completitud mediante multiples criterios:

| Validador | Descripcion |
|-----------|-------------|
| `command` | Ejecutar comando shell (tests, lint, build) |
| `output_contains` | Verificar patron en salida de Claude |
| `file_changed` | Verificar que archivos fueron modificados |
| `hook` | Ejecutar hook Claude existente |
| `human` | Validacion humana interactiva |

Ejemplo DoD en `ralph.yml`:

```yaml
definition_of_done:
  checklist:
    - id: tests
      name: "Todos los tests pasan"
      type: command
      command: "docker compose exec app npm test"
      required: true

    - id: completion
      name: "Claude senala completitud"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

### 4. Disyuntor (Circuit Breaker)

Mecanismo de seguridad para prevenir bucles infinitos:

| Disparador | Umbral | Accion |
|------------|--------|--------|
| Sin cambios de archivos | 3 iteraciones | Parar |
| Errores repetidos | 5 iteraciones | Parar |
| Declive de salida | 70% | Parar |
| Max iteraciones | 25 (defecto) | Parar |

### 5. Checkpointing

Se crean checkpoints Git despues de cada iteracion para:
- **Recuperacion**: Restaurar estado anterior si es necesario
- **Historial**: Seguir progreso a traves de iteraciones
- **Revision**: Inspeccionar que cambio en cada paso

## Salida

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Bucle Continuo de Agente IA           ║
╚════════════════════════════════════════════════════════════╝

✓ Sesion creada: ralph-1704067200-a1b2

ℹ Iniciando bucle Ralph...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteracion 1 de 25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Invocando Claude...
ℹ Verificando criterios DoD...
  ✓ [tests] Todos los tests pasan - OK
  ✓ [lint] Sin errores lint - OK
  ✓ [completion] Claude senala completitud - OK

  Todos los criterios requeridos aprobados!

✓ DoD APROBADO

╔════════════════════════════════════════════════════════════╗
║     📊 Resumen de Sesion                                    ║
╚════════════════════════════════════════════════════════════╝

  ID de sesion:        ralph-1704067200-a1b2
  Iteraciones totales: 3
  Duracion:            45s
  Estado DoD:          APROBADO
  Razon de salida:     dod_complete
```

## Configuracion

Crear `ralph.yml` en la raiz del proyecto:

```yaml
version: "1.0"

session:
  max_iterations: 25
  timeout: 600000

circuit_breaker:
  enabled: true
  no_file_changes_threshold: 3

definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Mejores Practicas

1. **Descripcion clara**: Proporcionar tareas especificas y accionables
2. **Configurar DoD**: Definir criterios de completitud en `ralph.yml`
3. **Usar TDD**: Escribir tests primero, dejar que Ralph implemente
4. **Monitorear progreso**: Observar salidas de iteracion
5. **Limites razonables**: Ajustar max_iterations segun complejidad

## Ver tambien

- `@ralph-conductor` - Agente para orquestacion Ralph
- `/common:fix-bug-tdd` - Correccion de bugs con TDD
- `/project:sprint-dev` - Desarrollo de sprint con TDD
