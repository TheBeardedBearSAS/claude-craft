---
description: Pruebas de aceptacion automatizadas con Claude in Chrome
argument-hint: --scope=<story|epic|sprint|task> --id=<target-id> [--resume|--record-gif|--dry-run]
---

# QA Recette - Pruebas de Aceptacion Automatizadas

Ejecuta pruebas de aceptacion automatizadas (recette) en aplicaciones web utilizando Claude in Chrome para la automatizacion del navegador. Este sistema implementa la **Regla de Oro**: Un bug corregido NUNCA debe reaparecer.

## Argumentos

**$ARGUMENTS**

- `--scope=<type>`: Alcance de las pruebas (story, epic, sprint, task)
- `--id=<target-id>`: Identificador objetivo (ej: US-001, EPIC-01, Sprint-3)
- `--resume=<session-id>`: Reanudar desde una sesion anterior
- `--record-gif`: Grabar GIF de la ejecucion
- `--dry-run`: Generar plan sin ejecutar pruebas
- `--base-url=<url>`: Sobrescribir URL base

## Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| **Planes Exhaustivos** | Genera planes de prueba exhaustivos desde criterios de aceptacion |
| **Automatizacion de Navegador** | Usa Claude in Chrome para pruebas reales de navegador |
| **Recuperacion de Sesion** | Reanudacion basada en checkpoints para sesiones interrumpidas |
| **Regla de Oro** | Generacion automatica de pruebas de regresion para todos los errores |
| **Documentacion Viva** | Mantiene documentacion de pruebas con trazabilidad |
| **Deteccion de Regresiones** | Compara ejecuciones para detectar regresiones |

## Requisitos Previos

1. **Extension Claude in Chrome**: Version 1.0.36 o superior
2. **Navegador Chrome**: Abierto con la extension activa
3. **Claude Code**: Iniciado con el flag `--chrome` o comando `/chrome`

```bash
# Iniciar Claude Code con soporte Chrome
claude --chrome

# O activar Chrome en una sesion existente
/chrome
```

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Proceso

### 1. Verificacion

El comando primero verifica que el MCP Chrome esta disponible:

```
┌─────────────────────────────────────────┐
│  1. check_chrome_mcp()                  │
│     - MCP claude-in-chrome presente?    │
│     - Extension conectada?              │
│     - Permisos del sitio OK?            │
└─────────────────────────────────────────┘
```

### 2. Generacion del Plan de Pruebas

Genera un plan de pruebas completo que cubre:

| Categoria | Descripcion |
|-----------|-------------|
| `acceptance_criteria_validation` | Pruebas para cada AC |
| `edge_cases` | Condiciones limite |
| `error_scenarios` | Manejo de errores |
| `ui_ux_verification` | Consistencia UI/UX |
| `performance_checks` | Tiempos de carga |
| `security_basics` | XSS, CSRF, inyeccion |

### 3. Ejecucion de Pruebas

Cada prueba se ejecuta via Chrome:

```
Test TC-001
├── Paso 1: navigate → /login
├── Paso 2: type → #email = "user@test.com"
├── Paso 3: click → button[type='submit']
└── Aserciones
    ├── url_matches → ^.*/dashboard$
    └── element_visible → .welcome-message
```

### 4. Error → Prueba → Regresion

Cuando se detecta un error:

```
1. Error detectado durante recette
         │
         ▼
2. Clasificacion (visual, interaction, validation, logic, security, API)
         │
         ▼
3. Generar pruebas segun tipo:
   - Logic/Validation → Prueba unitaria
   - API/Service → Prueba funcional
   - Flujo de usuario → Feature Behat
         │
         ▼
4. Agregar al registro de regresion con tag @regression
         │
         ▼
5. Corregir el bug (workflow TDD)
         │
         ▼
6. Verificar: todas las pruebas de regresion pasan
```

## Ejemplos Rapidos

```bash
# Probar una story especifica
/qa:recette --scope=story --id=US-001

# Probar todas las stories de un sprint
/qa:recette --scope=sprint --id=Sprint-3

# Dry run para ver el plan de pruebas
/qa:recette --scope=story --id=US-001 --dry-run

# Reanudar una sesion interrumpida
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022

# Grabar ejecucion en GIF
/qa:recette --scope=story --id=US-001 --record-gif
```

## Recuperacion de Sesion

Las sesiones se guardan despues de cada prueba:

```yaml
# .recette/sessions/{session-id}/state.yaml
session:
  id: "REC-20260130-143022"
  status: "paused"

progress:
  current_test_index: 5
  tests:
    total: 15
    passed: 4
    failed: 1
    pending: 10

recovery:
  resumable: true
  resume_from:
    test_id: "TC-005"
    step_index: 0
```

Para reanudar:

```bash
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022
```

## Registro de Regresion

Todos los errores detectados se registran:

```yaml
# .recette/regression/registry.yaml
entries:
  - id: "REG-001"
    error_id: "ERR-001"
    source:
      scope: "story"
      target_id: "US-001"
    generated_tests:
      - type: "unit"
        path: "tests/Unit/Auth/LoginErrorTest.php"
      - type: "behat"
        path: "features/auth/login_error.feature"
    fix:
      status: "verified"
```

## Estructura de Salida

```
.recette/
├── plans/              # Planes de prueba (YAML)
│   └── story-US-001-plan.yaml
├── sessions/           # Estados de sesion
│   └── REC-20260130-143022/
│       ├── state.yaml
│       ├── screenshots/
│       ├── checkpoints/
│       └── logs/
├── regression/         # Suite de regresion
│   ├── registry.yaml
│   └── tests/
│       ├── Unit/
│       ├── Functional/
│       └── Behat/
├── metrics/            # Datos historicos
│   └── history.jsonl
└── reports/            # Reportes generados
    └── REC-20260130-143022-report.md
```

## Comandos Relacionados

| Comando | Descripcion |
|---------|-------------|
| `/qa:recette-fix` | Corregir bugs de una sesion |
| `/qa:recette-status` | Mostrar estado de sesion |
| `/qa:recette-regression` | Ver pruebas de regresion |
| `/qa:recette-report` | Generar reporte |
| `/qa:validate` | Validar AC de una story |
| `/qa:automate` | Crear pruebas automatizadas |

## Capacidades de Chrome

| Categoria | Acciones |
|-----------|----------|
| **Navegacion** | navigate, back, forward, refresh |
| **Interaccion** | click, type, fill_form, scroll, hover |
| **Lectura** | Estado DOM, texto de elemento, atributos |
| **Depuracion** | Logs de consola, peticiones de red, errores |
| **Captura** | Screenshot, grabacion GIF |

## Mensajes de Error

| Error | Solucion |
|-------|----------|
| "MCP no detectado" | Ejecutar `claude --chrome` o `/chrome` |
| "Extension no conectada" | Abrir Chrome, verificar extension |
| "Permiso requerido" | Autorizar extension en el dominio |
| "Version obsoleta" | Actualizar extension Chrome a v1.0.36+ |

## Mejores Practicas

1. **Comenzar con dry-run**: Verificar el plan de pruebas antes de ejecutar
2. **Usar scopes especificos**: Probar stories individualmente para mejor seguimiento
3. **Revisar regresiones**: Consultar `.recette/regression/` despues de cada ejecucion
4. **Activar grabacion GIF**: Para depurar fallos complejos
5. **Mantener URL base**: Configurar en el plan para pruebas consistentes

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si se encontraron bugs:                                 ║
║  → /qa:fix                                               ║
║    Corrección automatizada de bugs                       ║
║  → /qa:tdd                                               ║
║    Corrección con enfoque TDD                            ║
║                                                          ║
║  Si todos los tests pasan:                               ║
║  → /qa:report                                            ║
║    Generar el informe de recette                         ║
║  → /sprint:transition done                               ║
║    Marcar la story como terminada                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
