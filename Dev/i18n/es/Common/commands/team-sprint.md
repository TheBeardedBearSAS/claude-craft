---
description: Equipo de Desarrollo de Sprint - Implementacion paralela de stories usando Agent Teams
argument-hint: <sprint-name> [--max-workers=3] [--overnight] [--use-teams]
---

# Equipo de Desarrollo de Sprint - Implementacion Paralela de Stories

Orquestar la ejecucion paralela de sprints usando Claude Code Agent Teams (v2.1.32+). Lanza un conductor de sprint (opus) mas 2-3 workers desarrolladores (sonnet), cada uno tomando una story independiente del backlog. Disenado para integrarse con el flujo existente de Ralph Sprint (`/common:ralph-sprint --use-teams`).

## Argumentos

$ARGUMENTS

- `<sprint-name>`: Nombre o ID del sprint a procesar
- `--max-workers=3`: Maximo de dev workers paralelos (por defecto: 2, max: 3)
- `--overnight`: Ejecutar en modo nocturno (limitado, se detiene a las 6am)
- `--supervised`: Pausar antes de cada story para confirmacion humana
- `--max-stories=10`: Maximo de stories a procesar (por defecto: 10)
- `--timeout=12`: Tiempo maximo de ejecucion en horas (por defecto: 12)
- `--dry-run`: Mostrar composicion del equipo y asignacion de stories sin ejecutar
- `--use-teams`: Flag pasado desde ralph-sprint para indicar modo Agent Teams
- `--ralph-mode`: Habilitar motor de recuperacion Ralph (clasificacion de errores, auto-reintento, servicio de escalamiento) junto con la paralelizacion de Agent Teams. Combina lo mejor de ambos: ejecucion paralela de stories de team-sprint con las capacidades de recuperacion/escalamiento de ralph-sprint.

## Prerequisitos

- Claude Code v2.1.32+ con soporte de Agent Teams
- Variable de entorno `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurada
- Backlog de sprint BMAD con stories en estado `ready-for-dev`
- Metadatos del sprint en `.bmad/sprint-status.yaml`
- Al menos 2 stories independientes (sprints de una sola story usan Ralph secuencial)
- `Tools/AgentTeams/lib/ralph-teams-adapter.sh` disponible
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible

## Cuando usar (vs. Sprint secuencial)

| Condicion | Usar Team Sprint | Usar `/common:ralph-sprint` secuencial |
|-----------|-----------------|----------------------------------------|
| 1 story restante | No | Si |
| 2+ stories independientes | Si (~2x aceleracion) | Tambien valido (mas simple) |
| Stories con archivos compartidos | No (conflictos de escritura) | Si |
| Nocturno desatendido | Si (con `--overnight`) | Tambien valido |
| Presupuesto limitado | No (+25-35% overhead de tokens) | Si |

**Critico**: Las stories deben ser totalmente independientes (sin dominios de archivo compartidos). Si las stories modifican archivos solapados, el conductor las asigna secuencialmente al mismo worker.

## Proceso

### Paso 1: Inicializacion del sprint

El conductor de sprint carga el estado del sprint:

1. Leer `.bmad/sprint-status.yaml` para la lista de stories y estados
2. Filtrar stories con estado `ready-for-dev`
3. Analizar la independencia de las stories (verificar solapamiento de dominios de archivo)
4. Particionar stories en grupos paralelizables

**Verificacion de independencia**: Dos stories son independientes si sus criterios de aceptacion y alcance de implementacion no hacen referencia a los mismos archivos fuente. El conductor revisa la descripcion de cada story y las referencias al tech spec para determinarlo.

### Paso 2: Asignacion de stories

```
Conductor de Sprint (opus) — coordina via TaskCreate/SendMessage
  |
  +-- [Workers paralelos - max 3] ---------+
  |   dev-worker-1 (sonnet): US-001        |
  |   dev-worker-2 (sonnet): US-002        |
  |   dev-worker-3 (sonnet): US-003        |
  +-----------------------------------------+
  |
  v (barrera de sincronizacion - todas las stories completas)
  |
  +-- [Revision secuencial] ---------------+
  |   El conductor valida el DoD de cada    |
  |   story                                 |
  +-----------------------------------------+
```

El conductor crea un `TaskCreate` por story:

- **Asunto**: `Implementar US-XXX: <titulo de la story>`
- **Descripcion**: Contenido completo de la story, criterios de aceptacion, referencias al tech spec, requisitos TDD
- **activeForm**: `Implementando US-XXX`

### Paso 3: Ejecucion del worker (por story)

Cada dev worker sigue el ciclo TDD para su story asignada:

```
1. Leer story y criterios de aceptacion
2. RED: Escribir tests que fallen desde los criterios de aceptacion
3. GREEN: Implementar codigo minimo para pasar los tests
4. REFACTOR: Limpiar manteniendo los tests en verde
5. Ejecutar suite de tests completa (basada en Docker)
6. Escribir resumen de resultados
7. Marcar tarea como completada
```

**Comandos TDD del worker** (especificos por tecnologia):

```bash
# Symfony
docker compose exec php vendor/bin/phpunit
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php php bin/console lint:container

# React
docker compose exec node npm run test
docker compose exec node npm run lint
docker compose exec node npm run build

# Python
docker compose exec app pytest --cov
docker compose exec app ruff check .
docker compose exec app mypy .

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test
docker run --rm -v $(pwd):/app -w /app dart dart analyze
```

### Paso 4: Transicion de stories

A medida que cada worker completa, el conductor:

1. Valida la Definition of Done (DoD) para la story
2. Transiciona el estado de la story: `in-progress` -> `review`
3. Asigna la siguiente story `ready-for-dev` al worker liberado
4. Repite hasta que no queden stories o se alcancen los limites

**Checklist de validacion DoD**:
- [ ] Todos los tests de criterios de aceptacion pasan
- [ ] Sin nuevos errores de linting introducidos
- [ ] Cobertura de codigo no disminuida
- [ ] Sin secretos en el codigo commiteado
- [ ] Implementacion de la story coincide con el tech spec

### Paso 5: Recuperacion de errores

El conductor clasifica los errores segun el motor de recuperacion Ralph:

| Nivel | Tipo | Accion | Ejemplos |
|-------|------|--------|----------|
| 0 | Transitorio | Auto-reintento con backoff | Timeout, rate limit, red |
| 1 | Recuperable | Worker auto-corrige + reintento | Errores de lint, fallos de tests, deps |
| 2 | Degradado | Continuar con advertencia | Docs, gates opcionales, caida de cobertura |
| 3 | Bloqueado | Escalar a humano | Seguridad, arquitectura, auth |

**Deteccion de worker atascado**: Si un worker no ha actualizado su tarea en 10 minutos, el conductor envia un mensaje de verificacion de estado. Si no hay respuesta en 2 minutos, el conductor marca la story como bloqueada y la reasigna a otro worker o la pone en cola para revision humana.

### Paso 6: Finalizacion del sprint

Cuando todas las stories han sido procesadas:

1. El conductor genera el reporte resumen del sprint
2. Actualiza `.bmad/sprint-status.yaml` via patron de escritor unico
3. Envia `shutdown_request` a todos los workers
4. Reporta metricas finales

## Salida

### Reporte resumen del sprint

```
================================================================
EQUIPO DE DESARROLLO DE SPRINT - Resumen
================================================================

Sprint: <sprint-name>
Fecha: YYYY-MM-DD
Modo: Paralelo (Agent Teams)
Equipo: 1 conductor + N dev workers

----------------------------------------------------------------
STORIES COMPLETADAS
----------------------------------------------------------------

| Story | Titulo | Worker | Tiempo | DoD |
|-------|--------|--------|--------|-----|
| US-001 | Funcionalidad de login | dev-1 | 12m | PASS |
| US-002 | Perfil de usuario | dev-2 | 18m | PASS |
| US-003 | Dashboard | dev-3 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOQUEADAS
----------------------------------------------------------------

| Story | Titulo | Razon | Escalamiento |
|-------|--------|-------|-------------|
| US-004 | Pago | Dependencia de arquitectura | En cola para humano |

================================================================
METRICAS DE EJECUCION
================================================================

| Metrica | Valor |
|---------|-------|
| Stories completadas | X / Y |
| Stories bloqueadas | Z |
| Tiempo total | Xm (vs ~Ym secuencial) |
| Aceleracion | ~X.Xx |
| Tokens totales | ~XK |
| Workers lanzados | N |
| Tiempo promedio por story | Xm |
```

## Expectativas de rendimiento

| Workers | Stories | Estimacion secuencial | Estimacion equipo | Aceleracion | Overhead de tokens |
|---------|---------|----------------------|-------------------|-------------|-------------------|
| 2 | 4 | ~60 min | ~35 min | ~1.7x | +25% |
| 2 | 6 | ~90 min | ~50 min | ~1.8x | +25% |
| 3 | 6 | ~90 min | ~40 min | ~2.2x | +30% |
| 3 | 9 | ~135 min | ~55 min | ~2.5x | +35% |

**Nota**: La aceleracion depende de la independencia de las stories y una complejidad comparable. Si una story tarda 3x mas que las demas, la story cuello de botella limita la aceleracion global.

## Integracion con Ralph Sprint

Cuando se invoca via `/common:ralph-sprint --use-teams`, el adaptador Ralph Teams (`Tools/AgentTeams/lib/ralph-teams-adapter.sh`) gestiona:

1. Traducir la configuracion de sesion Ralph a parametros de Agent Teams
2. Puente de checkpoint/recuperacion entre Ralph y Agent Teams
3. Asegurar que las actualizaciones de sprint-status.yaml sigan el patron de escritor unico
4. Mapear los niveles de error de Ralph a acciones de recuperacion de Agent Teams

## Manejo de errores

| Error | Recuperacion |
|-------|-------------|
| Timeout del worker (>15min por story) | El conductor reasigna la story |
| Crash del worker | La story vuelve a `ready-for-dev`, otro worker la toma |
| Todos los workers atascados | El conductor escala a humano |
| Conflicto en sprint-status.yaml | Patron de escritor unico via bloqueo de archivo |
| Story con solapamiento de archivos con otra | El conductor asigna secuencialmente al mismo worker |
| Docker no disponible | El worker reporta error, el conductor intenta solo codigo fuente |

## Limitaciones

- Maximo 3 dev workers paralelos (4 en total incluyendo el conductor)
- Las stories deben ser independientes (sin dominios de archivo compartidos)
- El costo de tokens es ~25-35% mayor que secuencial debido a la duplicacion de contexto
- Requiere Agent Teams Research Preview (la API puede cambiar)
- El modo nocturno depende de la estabilidad del agente conductor (riesgo de agentes huerfanos)
- No es adecuado para stories que requieran decisiones humanas interactivas durante la implementacion
