---
description: Ver y gestionar el registro de tests de regresion QA Recette
argument-hint: [--list|--stats|--check] [--status=<active|verified|obsolete>] [--source=<story-id>]
---

# QA Recette Regression - Registro de Tests de Regresion

Ver y gestionar el registro de tests de regresion. Navegar por los tests registrados, verificar puntuaciones de estabilidad y detectar violaciones de la Regla de Oro. Implementa la **Regla de Oro**: Un bug corregido NUNCA debe reaparecer.

## Argumentos

**$ARGUMENTS**

- `--list` : Listar todos los tests de regresion del registro
- `--stats` : Mostrar puntuacion de estabilidad y analisis de tendencia
- `--check` : Ejecutar tests de regresion y detectar violaciones
- `--status=<status>` : Filtrar por estado (active, verified, obsolete)
- `--source=<id>` : Filtrar por story/sprint de origen (ej: US-001)
- `--trend` : Mostrar datos de tendencia historica
- `--format=<type>` : Formato de salida (table, yaml, json) — defecto: table

## Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| **Navegacion del Registro** | Listar todos los tests de regresion con metadatos |
| **Puntuacion de Estabilidad** | Puntuacion de 0-100 basada en tasa de exito de tests |
| **Analisis de Tendencia** | Tendencia historica de estabilidad de regresion |
| **Verificacion Regla de Oro** | Alerta sobre fallos de tests de regresion |
| **Filtrado por Origen** | Filtrar tests por story o sprint de origen |
| **Gestion de Estados** | Seguir tests activos, verificados y obsoletos |

## Proceso

### 1. Carga del Registro

```
┌─────────────────────────────────────────┐
│  1. load_registry()                     │
│     - Leer .recette/regression/         │
│       registry.yaml                     │
│     - Cargar metadatos de tests         │
│     - Aplicar filtros                   │
└─────────────────────────────────────────┘
```

### 2. Lista del Registro (--list)

```
┌──────────┬─────────────────────────────────┬──────────┬──────────────────────────────┬──────────┐
│ ID       │ Error                           │ Origen   │ Ruta del Test                │ Estado   │
├──────────┼─────────────────────────────────┼──────────┼──────────────────────────────┼──────────┤
│ REG-001  │ Validacion login no mostrada    │ US-001   │ tests/Unit/Auth/LoginTest.php │ verified │
│ REG-002  │ Timeout API en /api/users       │ US-001   │ tests/Func/Api/UsersTest.php  │ active   │
│ REG-003  │ Error calculo total carrito     │ US-015   │ tests/Unit/Cart/TotalTest.php │ active   │
└──────────┴─────────────────────────────────┴──────────┴──────────────────────────────┴──────────┘
```

### 3. Puntuacion de Estabilidad (--stats)

```
Puntuacion de Estabilidad de Regresion: 94/100

  Desglose:
    Tests activos:     12
    Tests verificados:  8
    Tests obsoletos:    2
    Total:             22

  Ultimas 5 ejecuciones:
    ████████████████████  100% (2026-02-01)
    ████████████████░░░░   88% (2026-01-31)
    ████████████████████  100% (2026-01-30)
    ████████████████████  100% (2026-01-29)
    ██████████████░░░░░░   75% (2026-01-28)

  Tendencia: ↑ Mejorando (+6 pts en 5 ejecuciones)
```

### 4. Verificacion Regla de Oro (--check)

```
Verificacion Regla de Oro: 1 VIOLACION DETECTADA

  ⚠ REG-002: Timeout API en /api/users
    Origen:  US-001
    Test:    tests/Functional/Api/UsersTest.php
    Estado:  FALLANDO (pasaba el 2026-01-30)
    Accion:  Bug reaparecido — correccion inmediata requerida

  ✓ REG-001: Validacion login — EXITOSO
  ✓ REG-003: Total carrito — EXITOSO
  ...

  Resumen: 11/12 tests activos exitosos (91.7%)
```

## Fuentes de Datos

| Fuente | Ruta | Descripcion |
|--------|------|-------------|
| Registro | `.recette/regression/registry.yaml` | Todos los tests de regresion registrados |
| Tests | `.recette/regression/tests/` | Archivos de tests generados |
| Historico | `.recette/metrics/history.jsonl` | Datos historicos de ejecucion |

## Ejemplos

```bash
# Listar todos los tests de regresion
/qa:recette-regression --list

# Mostrar puntuacion de estabilidad
/qa:recette-regression --stats

# Ejecutar verificacion de regresion (detectar violaciones)
/qa:recette-regression --check

# Filtrar por story de origen
/qa:recette-regression --list --source=US-001

# Filtrar por estado
/qa:recette-regression --list --status=active

# Mostrar tendencia historica
/qa:recette-regression --stats --trend

# Salida en JSON
/qa:recette-regression --list --format=json
```

## Estructura de Salida

```
.recette/regression/
├── registry.yaml          # Registro de tests de regresion
└── tests/
    ├── Unit/              # Tests de regresion unitarios
    ├── Functional/        # Tests de regresion funcionales
    └── Behat/             # Features de regresion Behat

.recette/metrics/
└── history.jsonl          # Datos historicos para analisis de tendencia
```

## Comandos Relacionados

| Comando | Descripcion |
|---------|-------------|
| `/qa:recette` | Ejecutar pruebas de aceptacion |
| `/qa:recette-fix` | Corregir bugs de una sesion |
| `/qa:recette-status` | Mostrar estado de sesion |
| `/qa:recette-report` | Generar informe |

## Mensajes de Error

| Error | Solucion |
|-------|----------|
| "Registro no encontrado" | Ejecute `/qa:recette` primero para generar un registro |
| "Sin tests de regresion" | No se detectaron errores en ejecuciones anteriores |
| "Violacion de la Regla de Oro" | Un bug reaparecio — ejecute `/qa:recette-fix` |
| "Archivo historico faltante" | Ejecute al menos 2 sesiones recette para tendencias |

## Mejores Practicas

1. **Verifique regularmente** : Ejecute `--check` antes de cada despliegue
2. **Monitoree tendencias** : Use `--stats --trend` para seguir la estabilidad
3. **Corrija violaciones inmediatamente** : Las violaciones indican bugs reintroducidos
4. **Limpie tests obsoletos** : Marque como obsoletos los tests de funcionalidades eliminadas
5. **Filtre por origen** : Examine los tests de regresion por story para analisis dirigido

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Lanzar una nueva sesión de recette                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
