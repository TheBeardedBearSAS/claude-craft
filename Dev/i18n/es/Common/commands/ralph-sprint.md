---
description: Ejecutar el conductor de sprint autonomo para ejecucion overnight/desatendida
argument-hint: <nombre-sprint> [--overnight|--parallel N|--supervised|--max-stories N]
---

# Ralph Sprint - Conductor de Sprint Autonomo (ASC)

Ejecuta un sprint completo de forma autonoma con minima intervencion humana. El Conductor de Sprint Autonomo (ASC) gestiona la reclamacion de historias, ejecucion, transiciones, recuperacion de errores y escalamiento de problemas bloqueantes.

## Argumentos

**$ARGUMENTS**

- `<nombre-sprint>`: Nombre o ID del sprint a procesar
- `--overnight`: Modo nocturno (limitado, para a las 6am)
- `--parallel N`: Procesar hasta N historias en paralelo (defecto: 1)
- `--supervised`: Pausar antes de cada historia para confirmacion
- `--max-stories N`: Maximo de historias a procesar (defecto: 10)
- `--timeout H`: Tiempo maximo de ejecucion en horas (defecto: 12)

## Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| **Auto-Claim** | Reclama automaticamente la siguiente historia lista |
| **Auto-Transicion** | Transiciona historias segun estado de completitud |
| **Motor de Recuperacion** | Auto-recuperacion de errores transitorios/recuperables |
| **Servicio de Escalamiento** | Cola de problemas bloqueantes para resolucion humana |
| **Procesamiento Paralelo** | Procesa multiples historias independientes simultaneamente |
| **Ejecucion Limitada** | Ventanas de tiempo, limites de historias, umbrales de fallos |

## Proceso

### 1. Inicializacion del Sprint

1. **Cargar configuracion del sprint**:
   - Leer metadatos desde `.bmad/sprint-status.yaml`
   - Cargar config autonoma desde `ralph-autonomous.yml`
   - Inicializar motor de recuperacion y servicio de escalamiento

2. **Activar modo autonomo**:
   - Configurar circuit breaker en perfil autonomo
   - Activar recuperacion antes de disparo
   - Inicializar gestor paralelo si esta activado

### 2. Bucle Principal del Conductor

El ASC ejecuta un bucle continuo:

1. Verificar condiciones de parada
2. Obtener siguiente historia lista
3. Reclamar la historia
4. Ejecutar con Ralph
5. Procesar resultado (exito/fallo/escalado)
6. Transicionar historia
7. Crear checkpoint

### 3. Recuperacion de Errores

El Motor de Recuperacion clasifica errores en 4 niveles:

| Nivel | Tipo | Accion | Ejemplos |
|-------|------|--------|----------|
| 0 | **Transitorio** | Auto-retry con backoff | Timeout, rate limit, red |
| 1 | **Recuperable** | Auto-fix + retry | Lint, tests, deps, sintaxis |
| 2 | **Degradado** | Continuar con warning | Docs, gates opcionales |
| 3 | **Bloqueado** | Escalar a humano | Seguridad, arquitectura |

### 4. Gestion de Escalamientos

Los problemas bloqueantes se ponen en cola para resolucion humana.

**Opciones de resolucion**:
- `proceed` - Continuar con la tarea
- `skip` - Saltar esta historia y continuar
- `retry` - Reintentar la operacion fallida
- `abort` - Detener el sprint

### 5. Condiciones de Parada

| Condicion | Defecto | Descripcion |
|-----------|---------|-------------|
| Max historias | 10 | Maximo de historias procesadas |
| Max fallos | 3 | Umbral de fallos consecutivos |
| Max runtime | 12h | Tiempo maximo total |
| Ventana parada | 06:00 | Parada por hora (overnight) |
| Escalamiento critico | - | Pausa en problemas criticos |

## Ejemplos Rapidos

```bash
# Sprint nocturno
/common:ralph-sprint "Sprint 3" --overnight

# Procesamiento paralelo con 3 sesiones
/common:ralph-sprint "Sprint 3" --parallel 3

# Modo supervisado
/common:ralph-sprint "Sprint 3" --supervised

# Ejecucion limitada
/common:ralph-sprint "Sprint 3" --max-stories 5 --timeout 4
```

## Configuracion

El ASC usa `Tools/Ralph/config/ralph-autonomous.yml`:

```yaml
autonomous:
  enabled: true
  mode: "bounded"
  schedule:
    stop_window: "06:00"
    max_runtime_hours: 12
  limits:
    max_stories_per_session: 10
    max_consecutive_failures: 3
  parallel:
    enabled: false
    max_concurrent: 3

recovery:
  enabled: true
  max_attempts: 3
  auto_fix_lint: true
  auto_fix_tests: "retry_tdd"

escalation:
  enabled: true
  timeout_hours: 4
  default_action: "skip"
  critical_action: "pause"
```

## Metricas de Exito

| Metrica | Actual | Objetivo |
|---------|--------|----------|
| Intervenciones humanas/sprint | ~15 | <5 |
| Historias completadas overnight | 0 | 3-5 |
| Tasa auto-recuperacion | N/A | >70% |
| Tiempo hasta escalamiento | N/A | <15 min |
| Eficiencia paralelizacion | N/A | >60% |

## Mejores Practicas

1. **Empezar supervisado**: Usar `--supervised` primero
2. **Limites realistas**: No poner max-stories muy alto inicialmente
3. **Monitorear escalamientos**: Revisar `.ralph/escalations/queue/`
4. **Analizar metricas**: Examinar `metrics-*.json` despues de cada run
5. **Configurar webhooks**: Notificaciones Slack/Teams para problemas criticos

## Relacionado

- `/common:ralph-run` - Bucle continuo para una tarea
- `/project:run-sprint` - Ejecucion estandar de sprint
- `/sprint:next-story` - Obtener siguiente historia lista
- `@ralph-conductor` - Agente de orquestacion Ralph
