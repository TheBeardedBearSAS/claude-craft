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
- `--dry-run`: Mostrar composicion del equipo y costo estimado sin ejecutar
- `--skip-aggregation`: Emitir resultados por stack sin fusionar
- `--sequential`: Ejecutar auditorias secuencialmente en lugar de en paralelo (sin overhead de Agent Teams, equivalente a `/common:full-audit` pero con formato de reporte team-audit). Util para proyectos de una sola tecnologia o cuando Agent Teams no esta disponible.

## Prerequisitos

- Claude Code v2.1.32+ con soporte de Agent Teams
- Variable de entorno `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurada
- Proyecto con 2+ stacks tecnologicos detectados (proyectos de un solo stack deben usar `/common:full-audit` secuencial)
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/result-aggregator.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible

## Cuando usar (vs. Auditoria secuencial)

| Condicion | Usar Team Audit | Usar `/common:full-audit` secuencial |
|-----------|----------------|--------------------------------------|
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

**Gate de decision**: Si solo se detecta 1 tecnologia, recurrir a `/common:full-audit` secuencial (no se necesita overhead de equipo).

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

### Paso 5: Barrera de sincronizacion

El lider espera a que todas las tareas de los workers alcancen el estado `completed` via sondeo de `TaskList`. Si un worker excede su timeout (5 minutos por stack), el lider lo marca como fallido y continua con resultados parciales.

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

Igual que `/common:full-audit`:

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
| Una sola tecnologia | Recurrir a `/common:full-audit` secuencial |
| Falla la verificacion de compatibilidad | Excluir stack del paralelo, el lider lo maneja secuencialmente |

## Limitaciones

- Maximo 4 workers paralelos (el overhead de coordinacion domina mas alla de esto)
- El costo de tokens es ~20-35% mayor que secuencial debido a la duplicacion de contexto por worker
- Requiere Agent Teams Research Preview (la API puede cambiar)
- Cada worker carga el contexto del proyecto independientemente (~10-20K tokens de overhead cada uno)
