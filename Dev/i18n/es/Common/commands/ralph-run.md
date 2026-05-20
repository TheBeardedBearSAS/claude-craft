---
description: Ejecutar Claude en bucle continuo hasta completar la tarea (Ralph Wiggum v2.0)
argument-hint: <descripcion-tarea> [--auto-detect|--init|--interactive]
translation_status: pending
---

> ⚠️ **Translation incomplete.** Please contribute via GitHub PR or refer to the [English version](../../en/Common/commands/ralph-run.md).

# Ralph Run - Bucle Continuo de Agente IA v2.0

Ejecuta Claude en un bucle continuo hasta que la tarea este completa o se cumplan los criterios de Definition of Done (DoD).

## Argumentos

**$ARGUMENTS**

- `<descripcion-tarea>`: La tarea para que Claude complete
- `--auto-detect`: Detectar automaticamente el tipo de proyecto y configurar DoD
- `--init`: Generar configuracion sin ejecutar
- `--interactive`: Asistente de configuracion interactivo

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Nuevas funcionalidades v2.0

| Funcionalidad | Descripcion |
|---------------|-------------|
| **Integracion Hooks** | Integracion bidireccional con Claude Code 2.1.23+ |
| **Auto-Deteccion** | Deteccion automatica del tipo de proyecto |
| **Dashboard** | Visualizacion en tiempo real con barra de progreso |
| **Export Metricas** | Metricas en formato JSON y Prometheus |
| **Circuit Breaker Adaptativo** | 5 perfiles con aprendizaje historico |
| **Monitor de Salud** | Deteccion de estancamiento, espiral de errores |
| **Templates DoD** | Templates preconfigurados para 8 tecnologias |

## Proceso

### 1. Inicializacion de sesion

1. **Verificar prerequisitos**
2. **Detectar proyecto** (si `--auto-detect`)
3. **Cargar configuracion**

### 2. Bucle principal con Dashboard

### 3. Validacion Definition of Done

### 4. Circuit Breaker Adaptativo (v2.0)

| Perfil | Palabras clave | Sin Cambios | Errores | Max Iter |
|--------|----------------|-------------|---------|----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

## Ejemplos rapidos

```bash
# Uso basico
ralph.sh "Implementar autenticacion de usuario"

# Detectar y generar config
ralph.sh --auto-detect --init

# Asistente interactivo
ralph.sh --interactive
```

## Templates DoD por tecnologia

| Tecnologia | Comando Test | Comando Lint |
|------------|--------------|--------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Relacionado

- `@ralph-conductor` - Agente para orquestacion Ralph
- `/qa:tdd` - Correccion de bugs con TDD
- `/sprint:dev` - Desarrollo de sprint con TDD
