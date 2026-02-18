---
description: Equipo de Revision de Seguridad - Auditoria de seguridad paralela multi-dimension usando Agent Teams
argument-hint: [--scope=full|code|deps|infra] [--max-workers=3]
---

# Equipo de Revision de Seguridad - Auditoria de Seguridad Paralela Multi-Dimension

Orquestar una auditoria de seguridad completa usando Claude Code Agent Teams (v2.1.32+). Lanza un lider de seguridad (opus) mas 3 revisores haiku especializados, cada uno analizando una dimension de seguridad diferente en paralelo: vulnerabilidades del codigo fuente, cadena de suministro/dependencias, e infraestructura/configuracion.

## Argumentos

$ARGUMENTS

- `--scope=full`: Alcance de la auditoria (por defecto: `full`). Opciones: `full`, `code`, `deps`, `infra`
- `--max-workers=3`: Maximo de revisores paralelos (por defecto: 3, max: 3)
- `--severity=medium`: Severidad minima a reportar: `low`, `medium`, `high`, `critical`
- `--output-dir=<path>`: Directorio de salida personalizado para resultados de seguridad
- `--dry-run`: Mostrar composicion del equipo y plan de escaneo sin ejecutar
- `--sarif`: Emitir resultados en formato SARIF (para integracion CI/CD)
- `--max-cost=<dollars>`: Presupuesto maximo en dolares. Si el costo paralelo estimado supera este umbral, la ejecucion se bloquea con un mensaje OVER BUDGET

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## Prerequisitos

- Claude Code v2.1.32+ con soporte de Agent Teams
- Variable de entorno `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurada
- Docker disponible para ejecutar escaneadores de seguridad
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/result-aggregator.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible

## Proteccion Fast Mode (Confirmacion Bloqueante)

**OBLIGATORIO**: Antes de lanzar el equipo, el lider de seguridad DEBE:

1. Detectar si el Fast Mode esta activo (indicador lightning bolt en la terminal)
2. Si el Fast Mode esta activo:
   - Mostrar el dashboard comparativo estandar vs fast via `cost-estimator.sh --fast-mode`
   - **Mostrar una advertencia bloqueante** con los costos comparados:
     ```
     ⚠️  FAST MODE DETECTADO — Costos Opus 6x mas altos!

     | Modo     | Input ($/M) | Output ($/M) | Costo estimado esta revision |
     |----------|-------------|--------------|------------------------------|
     | Estandar | $5.00       | $25.00       | ~$X.XX                       |
     | Fast     | $30.00      | $150.00      | ~$Y.YY                       |

     ¿Desea continuar en Fast Mode? (si/no)
     Recomendacion: escriba /fast para desactivar antes de continuar.
     ```
   - **Esperar la confirmacion explicita** del usuario antes de continuar
   - Si el usuario rechaza, abortar con un mensaje sugiriendo `/fast` para desactivar

## Composicion del equipo

| Rol | Modelo | Agente | Responsabilidad |
|-----|--------|--------|-----------------|
| Lider de Seguridad | opus | Personalizado (lider de equipo) | Orquestacion, modelado de amenazas, reporte |
| Revisor de Codigo | haiku | `{tech}-reviewer` | Analisis de vulnerabilidades del codigo fuente |
| Auditor de Dependencias | haiku | `{tech}-reviewer` | Cadena de suministro, CVE, cumplimiento de licencias |
| Revisor de Infraestructura | haiku | `devops-engineer` o `docker-architect` | Seguridad de contenedores, secretos, configuracion |

**Tamano del equipo**: 4 agentes (1 lider + 3 workers). Composicion fija para revision de seguridad.

## Proceso

### Paso 1: Reconocimiento del proyecto

El lider de seguridad realiza el reconocimiento inicial:

1. Detectar stacks tecnologicos (misma deteccion que team-audit)
2. Identificar puntos de entrada: endpoints API, formularios, carga de archivos
3. Mapear la superficie de ataque: rutas publicas, limites de autenticacion, flujos de datos
4. Crear esquema de modelo de amenazas (categorias STRIDE)

### Paso 2: Verificacion de compatibilidad

```bash
# Verificar que el agente revisor de codigo tiene las herramientas requeridas
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash

# Verificar revisor de infraestructura
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/Common/agents/devops-engineer.md \
  --require-tools Read,Glob,Grep,Bash
```

### Paso 3: Lanzamiento del equipo (Fan-Out)

**Estimacion de costos**: El lider de seguridad estima los costos via `cost-estimator.sh --task-type security --techs <worker_count>`.

**Proteccion de presupuesto**: Si se especifica `--max-cost`, verificar que el costo estimado <= max_cost. Si hay exceso: mostrar `OVER BUDGET`, abortar.

**Contexto lean por worker**: Cada revisor solo recibe el contexto necesario para su dimension:
- Revisor de Codigo → `@.claude/references/<tech>/CLAUDE.md` + lista de archivos fuente
- Auditor de Dependencias → lista de archivos lockfile (composer.lock, package-lock.json, etc.)
- Revisor de Infra → Dockerfiles, docker-compose.yml, configs CI/CD

```
Lider de Seguridad (opus) — orquesta via TaskCreate/SendMessage
  |
  +-- [Revisores paralelos] --------------------+
  |   Revisor de Codigo (haiku): Analisis fuente |
  |   Auditor de Deps (haiku): Cadena suministro |
  |   Revisor de Infra (haiku): Configuracion    |
  +----------------------------------------------+
  |
  v (barrera de sincronizacion)
  |
  Lider de Seguridad: Correlacionar, priorizar, reportar
```

El lider crea 3 tareas via `TaskCreate`:

**Plantilla de spawn estructurada (TaskCreate)**: El lider DEBE incluir en cada tarea:
```
Subject: "Revision de seguridad <dimension>"
Description:
  Proyecto: <nombre-del-proyecto>
  Dimension: <code|deps|infra>
  Scope: <archivos/directorios a analizar>
  Herramientas: <comandos docker a usar>
  Formato de salida: findings en formato { severidad, categoria, archivo, descripcion }
activeForm: "Revision de seguridad <dimension>"
```

#### Tarea A: Revision de seguridad del codigo fuente

**Alcance**: Analisis de vulnerabilidades del codigo fuente de la aplicacion

| Verificacion | Que buscar | Categoria OWASP |
|--------------|-----------|-----------------|
| Inyeccion | Patrones de inyeccion SQL, NoSQL, comandos OS, LDAP | A03:2021 |
| XSS | Salida sin escapar, innerHTML, dangerouslySetInnerHTML | A03:2021 |
| Autenticacion | Politicas de contrasena debiles, MFA ausente, fijacion de sesion | A07:2021 |
| Autorizacion | Controles de acceso ausentes, IDOR, escalamiento de privilegios | A01:2021 |
| Criptografia | Algoritmos debiles, claves hardcodeadas, aleatorio inseguro | A02:2021 |
| Validacion de entrada | Sanitizacion ausente, coercion de tipos, carga de archivos | A03:2021 |
| Manejo de errores | Stack traces en respuestas, errores verbosos | A05:2021 |
| Logging | Datos sensibles en logs, pista de auditoria ausente | A09:2021 |

**Comandos Docker por stack**:

```bash
# PHP/Symfony
docker compose exec php vendor/bin/phpstan analyse --level=max
docker compose exec php php bin/console security:check

# React/Node
docker compose exec node npm run lint -- --rule 'no-eval: error'
docker compose exec node npx eslint --plugin security .

# Python
docker compose exec app bandit -r src/
docker compose exec app ruff check --select S .

# General (todos los stacks)
# Patrones grep para vulnerabilidades comunes
# Buscar: eval(, exec(, system(, shell_exec(, innerHTML, dangerouslySetInnerHTML
# Buscar: contrasenas hardcodeadas, claves API, tokens en el codigo fuente
```

#### Tarea B: Auditoria de dependencias / cadena de suministro

**Alcance**: Analisis de vulnerabilidades y licencias de dependencias de terceros

| Verificacion | Que analizar |
|--------------|-------------|
| CVEs conocidos | Todas las dependencias directas y transitivas |
| Severidad | CVEs criticos y altos que requieren accion inmediata |
| Cumplimiento de licencias | Licencias copyleft en proyectos propietarios |
| Paquetes desactualizados | Paquetes con parches de seguridad disponibles |
| Typosquatting | Nombres de paquetes sospechosos similares a paquetes populares |
| Deps no utilizadas | Dependencias declaradas pero nunca importadas |

**Comandos Docker por stack**:

```bash
# PHP
docker compose exec php composer audit --format=json
docker compose exec php composer outdated --direct

# Node/React/Angular/Vue
docker compose exec node npm audit --json
docker compose exec node npm outdated

# Python
docker compose exec app pip-audit --format=json
docker compose exec app pip list --outdated

# Flutter/Dart
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated --json

# C#/.NET
docker compose exec app dotnet list package --vulnerable
docker compose exec app dotnet list package --outdated
```

#### Tarea C: Revision de seguridad de infraestructura / configuracion

**Alcance**: Docker, configuracion de despliegue, gestion de secretos

| Verificacion | Que analizar |
|--------------|-------------|
| Seguridad de Dockerfile | Fijacion de imagen base, usuario no-root, builds multi-etapa |
| Exposicion de secretos | Archivos .env, credenciales hardcodeadas, secretos sin cifrar |
| Docker Compose | Contenedores privilegiados, puertos expuestos, montajes de volumenes |
| Politica de red | Exposicion innecesaria de puertos, aislamiento de red ausente |
| TLS/SSL | Validacion de certificados, versiones de protocolo, suites de cifrado |
| Seguridad CI/CD | Inyeccion de secretos, permisos de pipeline, integridad de artefactos |
| Permisos de archivos | Configs legibles por todos, exposicion de .git, archivos de backup |

**Comandos de escaneo**:

```bash
# Seguridad Docker
docker compose config --quiet  # Validar sintaxis de compose
# Revisar Dockerfiles para: USER root, tags latest, ADD vs COPY

# Escaneo de secretos
# Buscar: archivos .env no en .gitignore
# Buscar: AWS_SECRET, PRIVATE_KEY, password=, token= en el codigo fuente
# Buscar: secretos codificados en base64, claves SSH en el repo

# Revision de configuracion
# Verificar: politicas CORS, cabeceras CSP, HSTS
# Verificar: modo debug deshabilitado en configs de produccion
# Verificar: rate limiting configurado
```

### Paso 4: Barrera de sincronizacion

El lider de seguridad espera a que las 3 tareas de los revisores se completen.

**Cadencia de sondeo (B5)**: `TaskList` cada 30 segundos. Despues de 3 sondeos consecutivos sin cambios, reducir a 60 segundos. Usar los hooks `TeammateIdle`/`TaskCompleted` (v2.1.33+) si estan disponibles.

**Verbosidad de mensajes (B4)**: Los revisores DEBEN limitar sus mensajes de finalizacion a < 50 tokens. Formato: `DONE: <dimension> <findings_count> findings (<critical>C/<high>H/<medium>M)`. Escribir los detalles en el archivo de resultados.

**Recuperacion de contexto del lider (A6)**: Para mitigar el bug de compactacion de contexto (#23620), el lider DEBE releer `TaskList` despues de cada finalizacion de revisor para refrescar su conocimiento del estado del equipo.

Timeout: 8 minutos por revisor. Si un revisor excede el timeout, el lider continua con los resultados disponibles y registra la brecha.

### Paso 5: Correlacion y priorizacion

El lider de seguridad correlaciona los hallazgos a traves de las 3 dimensiones:

1. **Referencia cruzada**: Una dependencia vulnerable (Tarea B) utilizada en una ruta de codigo propensa a inyeccion (Tarea A) se eleva a Critico
2. **Analisis de cadena de ataque**: Combinar hallazgos para identificar rutas de ataque multi-paso
3. **Deduplicar**: El mismo problema encontrado por multiples revisores se fusiona
4. **Priorizar**: Puntuar cada hallazgo por severidad x explotabilidad x impacto

**Matriz de severidad**:

| Severidad | Rango CVSS | Respuesta |
|-----------|-----------|-----------|
| Critico | 9.0 - 10.0 | Correccion inmediata requerida |
| Alto | 7.0 - 8.9 | Corregir dentro del sprint actual |
| Medio | 4.0 - 6.9 | Planificar para el proximo sprint |
| Bajo | 0.1 - 3.9 | Backlog / aceptar riesgo |

### Paso 6: Generacion del reporte

```
================================================================
EQUIPO DE REVISION DE SEGURIDAD - Reporte
================================================================

Proyecto: <nombre-proyecto>
Fecha: YYYY-MM-DD
Alcance: <full|code|deps|infra>
Equipo: 1 lider + 3 revisores

================================================================
RESUMEN EJECUTIVO
================================================================

| Severidad | Cantidad |
|-----------|----------|
| Critico | X |
| Alto | X |
| Medio | X |
| Bajo | X |
| Total | X |

Nivel de riesgo global: <Critico|Alto|Medio|Bajo>

================================================================
HALLAZGOS POR DIMENSION
================================================================

-- CODIGO FUENTE (Revisor de Codigo) --

| # | Severidad | Categoria | Archivo | Descripcion |
|---|-----------|-----------|---------|-------------|
| 1 | ALTO | A03:Inyeccion | src/... | Inyeccion SQL en... |
| 2 | MEDIO | A07:Auth | src/... | Contrasena debil... |

-- DEPENDENCIAS (Auditor de Dependencias) --

| # | Severidad | Paquete | Version | CVE | Correccion disponible |
|---|-----------|---------|---------|-----|----------------------|
| 1 | CRITICO | lib-x | 1.2.3 | CVE-2026-XXXX | 1.2.4 |
| 2 | ALTO | lib-y | 4.5.6 | CVE-2026-YYYY | 5.0.0 |

-- INFRAESTRUCTURA (Revisor de Infra) --

| # | Severidad | Componente | Descripcion |
|---|-----------|------------|-------------|
| 1 | ALTO | Dockerfile | Ejecutando como root |
| 2 | MEDIO | .env | No en .gitignore |

================================================================
CADENAS DE ATAQUE (Hallazgos correlacionados)
================================================================

Cadena 1: Inyeccion SQL via dependencia vulnerable
  Paso 1: Libreria ORM desactualizada (CVE-2026-XXXX)
  Paso 2: Entrada de usuario llega al query builder sin sanitizacion
  Impacto: Compromiso de base de datos
  Severidad: CRITICO

================================================================
PLAN DE REMEDIACION
================================================================

| Prioridad | Accion | Esfuerzo | Impacto |
|-----------|--------|----------|---------|
| 1 | Actualizar lib-x a 1.2.4 | Bajo | Corrige CVE-2026-XXXX |
| 2 | Agregar sanitizacion de entrada en src/... | Medio | Bloquea inyeccion |
| 3 | Cambiar a usuario Docker no-root | Bajo | Reduce radio de explosion |

================================================================
METRICAS DE EJECUCION
================================================================

| Metrica | Valor |
|---------|-------|
| Tiempo total | Xs (vs ~Ys secuencial) |
| Aceleracion | ~X.Xx |
| Tokens totales | ~XK |
| Hallazgos descubiertos | X |
| Revisores completados | 3/3 |
```

### Paso 7: Limpieza

El lider de seguridad envia `shutdown_request` a todos los revisores y limpia los directorios de salida aislados.

## Expectativas de rendimiento

| Alcance | Estimacion secuencial | Estimacion equipo | Aceleracion | Overhead de tokens |
|---------|-----------------------|-------------------|-------------|-------------------|
| Solo codigo | ~5 min | ~5 min | 1x (sin paralelismo) | 0% |
| Solo deps | ~3 min | ~3 min | 1x (sin paralelismo) | 0% |
| Completo | ~12 min | ~6 min | ~2x | +30% |

**Nota**: El alcance completo se beneficia del paralelismo de 3 vias. Los alcances individuales (`--scope=code`) se ejecutan como tareas de un solo worker sin overhead de equipo.

## Manejo de errores

| Error | Recuperacion |
|-------|-------------|
| Timeout del revisor (>8min) | El lider continua con resultados parciales, registra la brecha |
| Crash del revisor | El lider registra el error, reporta la dimension como "no evaluada" |
| Docker no disponible | El revisor recurre a analisis de patrones solo en codigo fuente |
| Sin vulnerabilidades encontradas | El reporte indica estado limpio (no es un error) |
| Herramienta de escaneo no instalada | El revisor omite el escaneador, usa analisis basado en grep |

## Limitaciones

- Equipo fijo de 4 agentes (1 lider + 3 revisores)
- No puede reemplazar herramientas especializadas de seguridad (SAST/DAST/SCA) -- las complementa
- Los hallazgos dependen del conocimiento de seguridad del modelo (sin deteccion de zero-day)
- El costo de tokens es ~30% mayor que secuencial debido a la duplicacion de contexto
- Requiere Agent Teams Research Preview (la API puede cambiar)
- La calidad de la correlacion de cadenas de ataque depende de la capacidad de razonamiento del agente lider
