---
description: Optimize Coolify deployment
argument-hint: [arguments]
---

# Optimizacion Coolify

Eres un Ingeniero DevOps experto en optimizacion Coolify. Debes analizar y mejorar el rendimiento de builds, uso de recursos, monitoreo y eficiencia general de la infraestructura para despliegues Coolify.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Area de enfoque: build, resources, cleanup, network, all
- (Opcional) Nombre del servicio

Ejemplo: `/coolify:optimize` o `/coolify:optimize focus:build service:api` o `/coolify:optimize focus:cleanup`

## Modo Plan

> **El modo plan es recomendado.** Claude activa el modo plan para estructurar el enfoque, identificar dependencias y presentar una estrategia de generación antes de crear artefactos.

## MISION

### Paso 1: Analizar Uso Actual de Recursos

```bash
# Recursos del servidor
free -h
df -h /var/lib/docker
nproc
uptime

# Uso de recursos Docker por contenedor
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Desglose de uso de disco Docker
docker system df -v

# Numero de imagenes, contenedores, volumenes
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}"
```

```
══════════════════════════════════════════════════════════════
ANALISIS DE OPTIMIZACION COOLIFY
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
USO ACTUAL DE RECURSOS
──────────────────────────────────────────────────────────────

### Recursos del Servidor
| Recurso | Usado | Total | Estado |
|---------|-------|-------|--------|
| CPU | {uso}% | {cores} cores | {OK/ADVERTENCIA/CRITICO} |
| RAM | {usado} | {total} | {OK/ADVERTENCIA/CRITICO} |
| Disco | {usado} | {total} | {OK/ADVERTENCIA/CRITICO} |
| Swap | {usado} | {total} | {OK/ADVERTENCIA/CRITICO} |

### Recursos Docker
| Tipo | Cantidad | Activos | Tamano | Recuperable |
|------|---------|---------|--------|-------------|
| Imagenes | {n} | {n} | {tamano} | {tamano} |
| Contenedores | {n} | {n} | {tamano} | {tamano} |
| Volumenes | {n} | {n} | {tamano} | {tamano} |
| Build Cache | - | - | {tamano} | {tamano} |

### Uso por Servicio
| Servicio | CPU | Memoria | E/S Red | E/S Disco |
|----------|-----|---------|---------|-----------|
| {nombre} | {%} | {usado}/{limite} | {ent/sal} | {lec/esc} |
```

### Paso 2: Optimizar Rendimiento de Build

```
──────────────────────────────────────────────────────────────
OPTIMIZACION DE BUILD
──────────────────────────────────────────────────────────────

### Rendimiento Actual de Build
| Servicio | Tiempo de Build | Tamano Imagen | Metodo |
|----------|----------------|---------------|--------|
| {nombre} | {duracion} | {tamano} | {Nixpacks/Dockerfile} |

### Recomendaciones

#### Optimizacion Nixpacks
| Optimizacion | Impacto | Como |
|-------------|---------|------|
| Cache de dependencias | Build -50% | Automatico (Nixpacks cachea capas) |
| .nixpacks ignore | Build -20% | Agregar archivo .nixpacks para excluir archivos |
| Imagen pre-construida | Build -80% | Usar imagen Docker pre-construida en su lugar |

#### Optimizacion Dockerfile
| Optimizacion | Impacto | Como |
|-------------|---------|------|
| Build multi-stage | Tamano -60% | Separar etapas de build y runtime |
| Orden de capas | Cache hit +50% | Dependencias antes del codigo fuente |
| .dockerignore | Contexto -70% | Excluir node_modules, .git, tests |
| Base Alpine | Tamano -40% | Usar variantes de imagen -alpine |
| BuildKit cache | Build -30% | --mount=type=cache para gestores de paquetes |

#### Servidor de Build Dedicado
| Beneficio | Descripcion |
|-----------|-------------|
| Sin impacto en prod | Builds no consumen recursos de prod |
| Builds mas rapidos | Mas CPU/RAM dedicados a builds |
| Builds paralelos | Multiples apps se construyen simultaneamente |

Configuracion:
1. Coolify Dashboard > Servers > Add Server
2. Establecer como "Build Server" en configuracion del servidor
3. Las aplicaciones se construiran en este servidor, se desplegaran en produccion
```

### Paso 3: Configurar Auto-Limpieza

```
──────────────────────────────────────────────────────────────
CONFIGURACION DE AUTO-LIMPIEZA
──────────────────────────────────────────────────────────────

### Limpieza Integrada de Coolify
Dashboard > Settings > Configuration:
- Eliminar imagenes Docker no usadas: {habilitar}
- Frecuencia de limpieza: {diaria/semanal}

### Script de Limpieza Docker
\`\`\`bash
#!/bin/bash
# docker-cleanup.sh - Ejecutar via cron diariamente

# Eliminar contenedores detenidos de mas de 24h
docker container prune -f --filter "until=24h"

# Eliminar imagenes no usadas (no usadas por ningun contenedor)
docker image prune -af --filter "until=72h"

# Eliminar volumenes no usados (ADVERTENCIA: verificar que no hay datos importantes)
# docker volume prune -f

# Eliminar build cache de mas de 7 dias
docker builder prune -f --filter "until=168h"

# Registrar resultados de limpieza
echo "$(date): Recursos Docker limpiados" >> /var/log/docker-cleanup.log
docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}"
\`\`\`

### Configuracion Cron
\`\`\`bash
# Agregar a crontab: crontab -e
0 4 * * * /opt/scripts/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
\`\`\`

### Estimacion de Impacto de Limpieza
| Recurso | Actual | Despues de Limpieza | Ahorro |
|---------|--------|---------------------|--------|
| Imagenes | {tamano} | {estimado} | {ahorrado} |
| Build Cache | {tamano} | {estimado} | {ahorrado} |
| Contenedores | {tamano} | {estimado} | {ahorrado} |
| Total | {total} | {estimado} | {ahorrado} |
```

### Paso 4: Revisar y Mejorar Monitoreo

```
──────────────────────────────────────────────────────────────
REVISION DE MONITOREO
──────────────────────────────────────────────────────────────

### Auditoria de Health Check
| Servicio | Health Check | Intervalo | Estado |
|----------|-------------|----------|--------|
| {nombre} | {ruta o ninguno} | {intervalo} | {OK/FALTANTE/FALLANDO} |

### Health Checks Recomendados
Para cada servicio sin health check:
\`\`\`
Servicio: {nombre}
Path: /health (o /api/health, /healthz)
Interval: 30s
Timeout: 10s
Retries: 3
Start Period: 60s
\`\`\`

### Limites de Recursos
| Servicio | Limite Actual | Recomendado | Razon |
|----------|--------------|-------------|-------|
| {nombre} | {ninguno/actual} | {recomendado} | {basado en uso} |

### Brechas de Alertas
| Alerta | Estado | Recomendado |
|--------|--------|-------------|
| Crash de contenedor | {configurado/faltante} | Notificacion Coolify |
| Disco > 85% | {configurado/faltante} | Cron + webhook |
| RAM > 90% | {configurado/faltante} | Cron + webhook |
| Fallo de backup | {configurado/faltante} | Notificacion Coolify |
| Expiracion SSL | {configurado/faltante} | Uptime Kuma |
```

### Paso 5: Optimizar Red

```
──────────────────────────────────────────────────────────────
OPTIMIZACION DE RED
──────────────────────────────────────────────────────────────

### Configuracion Traefik
| Ajuste | Actual | Recomendado |
|--------|--------|-------------|
| Compresion | {on/off} | Habilitar gzip/brotli |
| Rate limiting | {on/off} | Habilitar para APIs publicas |
| Limites de conexion | {valor} | Ajustar segun trafico |
| Access logs | {on/off} | Habilitar para depuracion |

### Configuracion de Compresion
\`\`\`yaml
# Middleware Traefik para compresion
http:
  middlewares:
    compress:
      compress:
        excludedContentTypes:
          - "text/event-stream"
\`\`\`

### Headers de Seguridad
\`\`\`yaml
# Middleware Traefik para headers de seguridad
http:
  middlewares:
    security-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        contentTypeNosniff: true
        frameDeny: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
\`\`\`

### Optimizacion DNS
| Ajuste | Actual | Recomendado |
|--------|--------|-------------|
| TTL | {valor} | 300s (prod), 60s (durante migracion) |
| CDN | {ninguno/Cloudflare} | Cloudflare (plan gratuito) para activos estaticos |
| Proxy | {directo/proxied} | Proxy Cloudflare para proteccion DDoS |
```

### Paso 6: Reporte Final

```
══════════════════════════════════════════════════════════════
REPORTE DE OPTIMIZACION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
MEJORAS APLICADAS
──────────────────────────────────────────────────────────────

| Categoria | Antes | Despues | Mejora |
|-----------|-------|---------|--------|
| Tiempo de build | {antes} | {despues} | {reduccion %} |
| Tamano de imagen | {antes} | {despues} | {reduccion %} |
| Uso de disco | {antes} | {despues} | {liberado} |
| Uso de memoria | {antes} | {despues} | {liberado} |

──────────────────────────────────────────────────────────────
RESUMEN DE RECOMENDACIONES
──────────────────────────────────────────────────────────────

### Inmediato (hacer ahora)
- [ ] {recomendacion con alto impacto, bajo esfuerzo}

### Corto plazo (esta semana)
- [ ] {recomendacion con impacto medio}

### Largo plazo (este mes)
- [ ] {recomendacion que requiere planificacion}

──────────────────────────────────────────────────────────────
COMANDOS DE MONITOREO
──────────────────────────────────────────────────────────────

# Verificacion rapida de salud
docker ps --format "{{.Names}}: {{.Status}}" | sort

# Resumen de recursos
docker stats --no-stream

# Uso de disco
docker system df

# Limpieza (segura)
docker system prune -f
docker image prune -f --filter "until=72h"
```
