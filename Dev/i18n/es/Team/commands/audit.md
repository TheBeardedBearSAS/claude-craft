---
description: Equipo de Auditoria Completa - Auditoria paralela multi-tecnologia usando Agent Teams
argument-hint: [--techs=auto|tech1,tech2] [--max-workers=4]
---

# Equipo de Auditoria Completa - Auditoria Paralela Multi-Tecnologia

Orquestar una auditoria completa en paralelo a traves de multiples stacks tecnologicos usando Claude Code Agent Teams (v2.1.32+). Lanza un agente lider (opus) mas N auditores de stack (haiku), uno por stack tecnologico detectado, hasta un maximo configurable.

## Argumentos

$ARGUMENTS

- `--techs=auto`: Auto-detectar tecnologias (por defecto). O especificar separadas por comas: `--techs=symfony,react`
- `--max-workers=4`: Maximo de auditores paralelos (por defecto: 4, max: 4)
- `--output-dir=<path>`: Directorio de salida personalizado para resultados de auditoria
- `--max-cost=<dollars>`: Presupuesto maximo en dolares. Si el costo paralelo estimado supera este umbral, la ejecucion se bloquea con un mensaje OVER BUDGET
- `--dry-run`: Mostrar composicion del equipo y costo estimado sin ejecutar
- `--skip-aggregation`: Emitir resultados por stack sin fusionar
- `--sequential`: Ejecutar auditorias secuencialmente en lugar de en paralelo (sin overhead de Agent Teams). Util para proyectos de una sola tecnologia o cuando Agent Teams no esta disponible.

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## Prerequisitos

- Claude Code v2.1.32+ con soporte de Agent Teams
- Variable de entorno `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurada
- Proyecto con 2+ stacks tecnologicos detectados (proyectos de un solo stack deben usar el flag `--sequential`)
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/result-aggregator.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible

## Proteccion Fast Mode (Confirmacion Bloqueante)

**OBLIGATORIO**: Antes de lanzar el equipo, el lider DEBE:

1. Detectar si el Fast Mode esta activo (indicador lightning bolt en la terminal)
2. Si el Fast Mode esta activo:
   - Mostrar el dashboard comparativo estandar vs fast via `cost-estimator.sh --fast-mode`
   - **Mostrar una advertencia bloqueante** con los costos comparados:
     ```
     ⚠️  FAST MODE DETECTADO — Costos Opus 6x mas altos!

     | Modo     | Input ($/M) | Output ($/M) | Costo estimado esta auditoria |
     |----------|-------------|--------------|-------------------------------|
     | Estandar | $5.00       | $25.00       | ~$X.XX                        |
     | Fast     | $30.00      | $150.00      | ~$Y.YY                        |

     ¿Desea continuar en Fast Mode? (si/no)
     Recomendacion: escriba /fast para desactivar antes de continuar.
     ```
   - **Esperar la confirmacion explicita** del usuario antes de continuar
   - Si el usuario rechaza, abortar con un mensaje sugiriendo `/fast` para desactivar

## Cuando usar (vs. Auditoria secuencial)

| Condicion | Usar Team Audit | Usar flag `--sequential` |
|-----------|----------------|-------------------------|
| 1 stack tecnologico | No | Si |
| 2+ stacks tecnologicos | Si | Tambien valido (mas simple, mas economico) |
| Tiempo limitado | Si (2-3x mas rapido) | No |
| Presupuesto limitado | No (+20-35% overhead de tokens) | Si |

**Punto de equilibrio**: Los beneficios de la paralelizacion aparecen a partir de 2+ stacks. Para un solo stack, el overhead de coordinacion supera el tiempo ahorrado.

## Proceso

### Paso 1: Deteccion de tecnologias

```
Lider de Auditoria (opus)
  |
  v
Escanear raiz del proyecto para marcadores de tecnologia:
  composer.json + symfony/*      -> Symfony
  pubspec.yaml + flutter:        -> Flutter
  pyproject.toml / requirements  -> Python
  package.json + react           -> React
  package.json + react-native    -> React Native
  package.json + @angular/core   -> Angular
  package.json + vue             -> Vue.js
  artisan + laravel/*            -> Laravel
  *.csproj + dotnet              -> C#/.NET
  composer.json (sin symfony)    -> PHP
```

Si `--techs=auto`, detectar todas. Si es explicito, validar que los stacks especificados existan.

**Gate de decision**: Si solo se detecta 1 tecnologia, cambiar a modo secuencial via `--sequential` (no se necesita overhead de equipo).

### Paso 2: Verificacion de compatibilidad

Antes de lanzar los workers, validar cada agente auditor contra los requisitos del rol:

```bash
# Para cada stack detectado, verificar que el agente reviewer tiene las herramientas requeridas
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash \
  --require-model haiku
```

Si algun agente falla la compatibilidad, registrar una advertencia y excluir ese stack de la ejecucion paralela (el lider lo maneja secuencialmente).

### Paso 3: Estimacion de costos

Antes de lanzar el equipo, estimar los costos de tokens:

```bash
Tools/AgentTeams/lib/cost-estimator.sh \
  --team-size <N+1> \
  --lead-model opus \
  --worker-model haiku \
  --task-type audit \
  --stacks <detected_count>
```

Mostrar el costo estimado al usuario. En modo `--dry-run`, detenerse aqui.

**Proteccion de presupuesto**: Si se especifica `--max-cost`, verificar que `PAR_COST <= max_cost`. Si el costo estimado supera el presupuesto:
- Mostrar `OVER BUDGET: costo estimado $X.XX > presupuesto $Y.YY`
- Abortar la ejecucion (NO lanzar los workers)
- Sugerir reducir el numero de stacks o usar `--sequential`

### Paso 4: Lanzamiento del equipo (Fan-Out)

```
Lider de Auditoria (opus) — coordina via TaskCreate/SendMessage
  |
  +-- [Workers paralelos - max 4] ---------+
  |   stack-auditor-1 (haiku): Symfony      |
  |   stack-auditor-2 (haiku): React        |
  |   stack-auditor-3 (haiku): Python       |
  |   stack-auditor-4 (haiku): Angular      |
  +-----------------------------------------+
```

**Patron de creacion del equipo:**

1. El lider crea directorios de salida aislados por worker (uno por stack)
2. El lider crea tareas via `TaskCreate` para cada auditoria de stack:
   - Asunto de la tarea: `Auditar stack <NombreTech>`
   - Descripcion de la tarea: incluye instrucciones de check-architecture, check-code-quality, check-testing, check-security, check-compliance
   - Cada tarea especifica su ruta de salida aislada
3. Los workers reclaman tareas via `TaskUpdate` (status: in_progress)
4. Los workers escriben resultados solo en su directorio aislado

**Contexto lean por worker (A4)**: Cada worker solo recibe la referencia tecnologica de su stack. NO cargar el contexto de todas las tecnologias.
- Worker Symfony → `@.claude/references/symfony/CLAUDE.md` unicamente
- Worker React → `@.claude/references/react/` unicamente
- Worker Python → `@.claude/references/python/` unicamente
- etc.

**Plantilla de spawn estructurada (TaskCreate)**: El lider DEBE incluir en cada `TaskCreate`:

```
Subject: "Auditar stack <TechName>"
Description:
  Proyecto: <nombre-del-proyecto>
  Tecnologia: <tech-name>
  Servicio Docker: <docker-service-name>
  Directorio raiz: <tech-root-directory>
  Referencia: @.claude/references/<tech>/CLAUDE.md
  Checks: [architecture, code-quality, testing, security]
  Formato de salida: result.json en <output-dir>/<tech>/
  Schema output:
    { "tech": "<tech>", "score": <0-100>,
      "architecture": { "score": <0-25>, "findings": [...] },
      "code_quality": { "score": <0-25>, "findings": [...] },
      "testing": { "score": <0-25>, "findings": [...] },
      "security": { "score": <0-25>, "findings": [...] } }
activeForm: "Auditoria <TechName>"
```

**Instrucciones del worker** (por stack):

Cada worker ejecuta las 4 categorias de auditoria secuencialmente dentro de su stack:

| Categoria | Puntos | Que verificar |
|-----------|--------|---------------|
| Arquitectura (25pts) | Separacion de capas, direccion de dependencias, convenciones de carpetas, sin acoplamiento de framework |
| Calidad de codigo (25pts) | Estandares de nomenclatura, linting, type hints, documentacion, complejidad < 10 |
| Testing (25pts) | Cobertura >= 80%, tests unitarios, tests de integracion, tests E2E, piramide de tests |
| Seguridad (25pts) | Sin secretos, validacion de entrada, OWASP, cifrado, CVEs de dependencias |

Los workers ejecutan comandos de diagnostico basados en Docker por stack:

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text
docker compose exec php composer audit

# React
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
docker compose exec node npm audit

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov
docker compose exec app pip-audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

Cada worker escribe `result.json` en su directorio de salida aislado:

```json
{
  "tech": "symfony",
  "score": 82,
  "architecture": { "score": 22, "findings": [...] },
  "code_quality": { "score": 20, "findings": [...] },
  "testing": { "score": 18, "findings": [...] },
  "security": { "score": 22, "findings": [...] }
}
```

**Verbosidad de mensajes de finalizacion (B4)**: Los workers DEBEN limitar sus mensajes de finalizacion a < 50 tokens. Escribir los detalles en el archivo `result.json`, no en el mensaje. Formato: `DONE: <tech> <score>/100 | <findings_count> findings`

### Paso 5: Barrera de sincronizacion

El lider espera a que todas las tareas de los workers alcancen el estado `completed` via sondeo de `TaskList`.

**Cadencia de sondeo (B5)**: `TaskList` cada 30 segundos. Despues de 3 sondeos consecutivos sin cambio de estado, reducir a 60 segundos. Usar los hooks `TeammateIdle`/`TaskCompleted` (v2.1.33+) para notificacion mas reactiva si estan disponibles.

Si un worker excede su timeout (5 minutos por stack), el lider lo marca como fallido y continua con resultados parciales.

**Recuperacion de contexto del lider (A6)**: Para mitigar el bug de compactacion de contexto (#23620), el lider DEBE releer `TaskList` cada 5 finalizaciones de workers para refrescar su conocimiento del estado del equipo. Si se detecta un periodo de inactividad prolongado (>3 min sin actualizacion), forzar una relectura completa de `TaskList`.

### Paso 6: Agregacion de resultados

El lider ejecuta el agregador de resultados:

```bash
Tools/AgentTeams/lib/result-aggregator.sh \
  --input-dir <isolated-output-root> \
  --output-file audit-report.json
```

El agregador:
- Recopila todos los archivos `result.json` de los directorios aislados
- Elimina hallazgos duplicados (mismo archivo + mismo mensaje = duplicado)
- Resuelve conflictos de puntuacion via promedio ponderado
- Produce reporte unificado

### Paso 7: Generacion del reporte

El lider genera el reporte de auditoria multi-tecnologia formateado:

```
================================================================
AUDITORIA MULTI-TECNOLOGIA (Agent Teams) - Puntuacion global: XX/100
================================================================

Tecnologias detectadas: [lista]
Tamano del equipo: 1 lider + N workers
Modo de ejecucion: Paralelo
Fecha: YYYY-MM-DD

----------------------------------------------------------------
SYMFONY - Puntuacion: XX/100
----------------------------------------------------------------

Arquitectura (XX/25)
  [PASS] Clean Architecture respetada
  [PASS] CQRS implementado correctamente
  [WARN] 2 servicios acceden directamente al Repository

Calidad de codigo (XX/25)
  [PASS] PHPStan nivel 8 - 0 errores
  [WARN] 5 metodos > 20 lineas

Testing (XX/25)
  [PASS] Cobertura: 85%
  [WARN] Sin tests E2E Panther

Seguridad (XX/25)
  [PASS] Sin secretos en el codigo
  [WARN] Dependencia con CVE menor

----------------------------------------------------------------
REACT - Puntuacion: XX/100
----------------------------------------------------------------

[Misma estructura por tecnologia]

================================================================
RESUMEN GLOBAL
================================================================

| Tecnologia | Arquitectura | Codigo | Tests | Seguridad | Total |
|------------|-------------|--------|-------|-----------|-------|
| Symfony    | XX/25       | XX/25  | XX/25 | XX/25     | XX/100|
| React      | XX/25       | XX/25  | XX/25 | XX/25     | XX/100|
| PROMEDIO   | XX/25       | XX/25  | XX/25 | XX/25     | XX/100|

================================================================
TOP 5 ACCIONES PRIORITARIAS
================================================================

1. [CRITICO] Descripcion de la accion
   -> Impacto: +X puntos | Esfuerzo: Bajo/Medio/Alto

2. [ALTO] Descripcion de la accion
   -> Impacto: +X puntos | Esfuerzo: Bajo/Medio/Alto

================================================================
METRICAS DE EJECUCION
================================================================

| Metrica | Valor |
|---------|-------|
| Tiempo total | Xs (vs ~Ys secuencial) |
| Aceleracion | ~X.Xx |
| Tokens totales | ~XK |
| Overhead de tokens vs secuencial | +XX% |
| Workers lanzados | N |
| Workers completados | N |
| Workers fallidos | 0 |
```

### Paso 8: Limpieza

El lider envia `shutdown_request` a todos los workers y limpia los directorios de salida aislados (a menos que se especifique `--keep-artifacts`).

## Reglas de puntuacion

Reglas de puntuacion:

| Violacion | Puntos perdidos |
|-----------|-----------------|
| Patron de arquitectura violado | -5 |
| Acoplamiento framework/dominio | -3 |
| Error critico de linting | -2 |
| Advertencia de linting | -1 |
| Metodo > 30 lineas | -1 |
| Cobertura < 80% | -5 |
| Sin tests unitarios de dominio | -5 |
| Secreto en el codigo | -10 |
| Vulnerabilidad CVE critica | -10 |
| Vulnerabilidad CVE alta | -5 |

## Expectativas de rendimiento

| Stacks | Estimacion secuencial | Estimacion equipo | Aceleracion | Overhead de tokens |
|--------|-----------------------|------------------:|-------------|-------------------|
| 2 | ~4 min | ~2.5 min | ~1.6x | +20% |
| 3 | ~6 min | ~3 min | ~2x | +25% |
| 4 | ~8 min | ~3.5 min | ~2.3x | +30% |
| 5+ | ~10+ min | ~4 min | ~2.5x | +35% |

**Nota**: Estas son estimaciones realistas que consideran el overhead de coordinacion (lanzamiento de agente ~5-10s, asignacion de tareas, agregacion de resultados). No esperar aceleracion lineal.

## Manejo de errores

| Error | Recuperacion |
|-------|-------------|
| Timeout del worker (>5min) | El lider marca como fallido, continua con resultados parciales |
| Crash del worker | El lider registra el error, excluye el stack del reporte |
| Docker no disponible | El worker reporta error, el lider recurre a analisis solo de codigo fuente |
| Sin tecnologias detectadas | Abortar con mensaje claro |
| Una sola tecnologia | Cambiar a modo `--sequential` |
| Falla la verificacion de compatibilidad | Excluir stack del paralelo, el lider lo maneja secuencialmente |

## Limitaciones

- Maximo 4 workers paralelos (el overhead de coordinacion domina mas alla de esto)
- El costo de tokens es ~20-35% mayor que secuencial debido a la duplicacion de contexto por worker
- Requiere Agent Teams Research Preview (la API puede cambiar)
- Cada worker carga el contexto del proyecto independientemente (~10-20K tokens de overhead cada uno)
