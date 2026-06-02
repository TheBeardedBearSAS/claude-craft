---
description: Ejecutar Claude en bucle continuo hasta completar la tarea (Ralph Wiggum v2.0)
argument-hint: <descripcion-tarea> [--auto-detect|--init|--interactive]
---

# Ralph Run - Bucle Continuo de Agente IA v2.0

Ejecuta Claude en un bucle continuo hasta que la tarea esté completa o se cumplan los criterios de Definition of Done (DoD).

## Argumentos

**$ARGUMENTS**

- `<descripcion-tarea>`: La tarea para que Claude complete
- `--auto-detect`: Detectar automáticamente el tipo de proyecto y configurar DoD
- `--init`: Generar configuración sin ejecutar
- `--interactive`: Asistente de configuración interactivo

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Nuevas funcionalidades v2.0

| Funcionalidad | Descripción |
|---------------|-------------|
| **Integración Hooks** | Integración bidireccional con Claude Code 2.1.23+ |
| **Auto-Detección** | Detección automática del tipo de proyecto (Symfony, Flutter, React, etc.) |
| **Dashboard** | Visualización en tiempo real con barra de progreso en terminal |
| **Exportación de Métricas** | Métricas en formato JSON y Prometheus |
| **Circuit Breaker Adaptativo** | 5 perfiles con aprendizaje a partir del historial |
| **Monitor de Salud** | Detección de estancamiento, espiral de errores y saturación de contexto |
| **Plantillas DoD** | Plantillas preconfiguradas para 8 tecnologías |

## Proceso

### 1. Inicialización de Sesión

1. **Verificar prerequisitos**:
   - Verificar que Claude esté disponible
   - Comprobar la configuración `ralph.yml`
   - Inicializar el directorio de sesión (`.ralph/`)

2. **Detección automática del proyecto** (si se usa `--auto-detect`):
   - Detectar el tipo de proyecto (Symfony, Flutter, React, Python, .NET, Go, Rust)
   - Cargar la plantilla DoD apropiada
   - Configurar los comandos de test y lint

3. **Cargar configuración**:
   - Leer `ralph.yml` o `.claude/ralph.yml`
   - Establecer máximo de iteraciones, timeouts y criterios DoD
   - Inicializar hooks si están habilitados

### 2. Bucle Principal con Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║  RALPH WIGGUM - Session: ralph-xxx           PHASE: GREEN     ║
╠═══════════════════════════════════════════════════════════════╣
║  ITERATION 8/25              ELAPSED: 12:34                   ║
║  PROGRESS ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%  ║
║                                                               ║
║  Circuit Breaker: ░░ (0/4)    Context: ████████░░ 78%        ║
╚═══════════════════════════════════════════════════════════════╝
```

### 3. Validación Definition of Done

El sistema DoD valida la finalización a través de múltiples criterios:

| Validador | Descripción |
|-----------|-------------|
| `command` | Ejecutar comando de shell (tests, lint, build) |
| `output_contains` | Comprobar patrón en la salida de Claude |
| `file_changed` | Verificar que los archivos fueron modificados |
| `hook` | Ejecutar un hook de Claude existente |
| `human` | Validación humana interactiva |

### 4. Circuit Breaker Adaptativo (v2.0)

Selecciona automáticamente el perfil basándose en palabras clave de la tarea:

| Perfil | Palabras clave | Sin Cambios | Errores | Máx. Iter |
|--------|----------------|-------------|---------|-----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

### 5. Integración de Hooks (Claude Code 2.1.23+)

```
SessionStart → session-restore.sh → Inyectar contexto Ralph
     ↓
PreToolUse (una vez) → status-injector.sh → Inyectar estado DoD
     ↓
Claude trabaja...
     ↓
Stop → stop-dod-gate.sh → Bloquear si DoD no satisfecho (exit 2)
```

## Ejemplos de Inicio Rápido

```bash
# Uso básico
ralph.sh "Implementar autenticación de usuario"

# Detección automática del proyecto y generación de configuración
ralph.sh --auto-detect --init

# Asistente de configuración interactivo
ralph.sh --interactive

# Con archivo de configuración
ralph.sh --config=ralph.yml "Corregir el bug de login"

# Reanudar sesión
ralph.sh --continue=ralph-1704067200-a1b2
```

## Configuración (v2.0)

```yaml
version: "2.0"

# Integración de hooks
hooks:
  enabled: true
  mode: "advanced"  # simple o advanced

# Auto-detección
auto_detect:
  enabled: true
  interactive: false

# Panel de control en tiempo real
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# Exportación de métricas
metrics:
  enabled: true
  format: "both"  # json, prometheus, both

# Monitoreo de salud
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true

# Circuit breaker adaptativo
circuit_breaker:
  adaptive: true
  default_profile: "medium_feature"
  learning:
    enabled: true
    min_samples: 5

# Definition of Done
definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "docker compose exec app npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Plantillas DoD por Tecnología

| Tecnología | Comando de Test | Comando de Lint |
|------------|-----------------|-----------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Salida

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Continuous AI Agent Loop v2.0        ║
╚════════════════════════════════════════════════════════════╝

✓ Detected: react-typescript (HIGH confidence)
✓ Session created: ralph-1704067200-a1b2
✓ Hooks initialized (advanced mode)

ℹ Starting Ralph loop...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration 1 of 25 (Profile: medium_feature)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Invoking Claude...
ℹ Checking DoD criteria...
  ✓ [tests] All tests pass - PASS
  ✓ [lint] No lint errors - PASS
  ✓ [completion] Claude signals completion - PASS

  All required criteria passed!

✓ DoD PASSED

╔════════════════════════════════════════════════════════════╗
║     📊 Session Summary                                      ║
╚════════════════════════════════════════════════════════════╝

  Session ID:        ralph-1704067200-a1b2
  Profile:           medium_feature
  Total iterations:  3
  Duration:          45s
  DoD status:        PASSED
  Exit reason:       dod_complete
  Metrics exported:  .ralph/sessions/.../metrics-export.json
```

## Modos de Fallo y Recuperación

### Fallos de Validadores DoD

Cuando los validadores DoD fallan repetidamente, Ralph aplica una recuperación escalonada:

| Fallos Consecutivos | Acción |
|---------------------|--------|
| 1-2 | Reintentar con contexto — Ralph incluye la salida de error previa |
| 3 | Activar comprobación del circuit breaker — evaluar si la tarea está bloqueada |
| 4+ | Se activa el circuit breaker — la sesión se detiene con `exit_reason: circuit_breaker` |

### Gestión de Timeouts

| Tipo de Timeout | Por defecto | Configuración |
|-----------------|-------------|---------------|
| Por iteración | 5 min | `circuit_breaker.iteration_timeout` |
| Sesión total | 30 min | `circuit_breaker.session_timeout` |
| Comando DoD | 60 seg | `definition_of_done.timeout` |

Cuando se activa un timeout:
1. La iteración actual es cancelada
2. El progreso parcial se preserva en el estado de sesión
3. El contador del circuit breaker se incrementa
4. Reanudar con `--continue=<session-id>` para reintentar

### Razones de Salida Comunes

| Razón de Salida | Significado | Recuperación |
|-----------------|-------------|--------------|
| `dod_complete` | Todos los criterios DoD pasaron | Éxito — no se requiere acción |
| `circuit_breaker` | Demasiados fallos | Revisar el alcance de la tarea, simplificar DoD |
| `max_iterations` | Límite de iteraciones alcanzado | Aumentar el límite o dividir en subtareas |
| `timeout` | Timeout de sesión expirado | Reanudar o aumentar el timeout |
| `user_abort` | Usuario canceló (Ctrl+C) | Reanudar con `--continue` |

## Buenas Prácticas

1. **Usar auto-detect**: Dejar que Ralph configure el DoD para tu stack
2. **Descripción clara de la tarea**: Proporcionar tareas específicas y accionables
3. **Usar TDD**: Escribir los tests primero, dejar que Ralph implemente
4. **Supervisar el dashboard**: Observar el progreso en tiempo real
5. **Revisar métricas**: Analizar las métricas de sesión para optimización
6. **Establecer timeouts realistas**: Ajustar los timeouts a la complejidad de la tarea
7. **Usar perfiles del circuit breaker**: Ajustar el perfil al tipo de tarea (quick_fix vs large_feature)

## Relacionado

- `@ralph-conductor` - Agente para la orquestación de Ralph
- `/qa:tdd` - Corrección de bugs basada en TDD
- `/sprint:dev` - Desarrollo de sprint con TDD
