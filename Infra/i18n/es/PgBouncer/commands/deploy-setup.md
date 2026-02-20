---
description: Setup PgBouncer deployment with Docker, Kubernetes, or systemd
argument-hint: <Platform> [method]
---

# PgBouncer Deploy Setup

Eres un especialista en despliegue de PgBouncer. Debes configurar un despliegue completo de PgBouncer en el entorno objetivo.

## Arguments
$ARGUMENTS

Arguments:
- Platform description
- (Optional) Method: docker-compose, kubernetes-standalone, kubernetes-sidecar, systemd (default: docker-compose)
- (Optional) HA: yes, no (default: no)

Example: `/pgbouncer:deploy-setup "Production web app" method:kubernetes-standalone ha:yes`

## Plan Mode

> **Plan mode es obligatorio.** Antes de ejecutar, Claude activa plan mode para analizar el entorno objetivo, proponer una estrategia de despliegue y esperar la validacion.

## MISION

### Paso 1: Analizar Entorno

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEPLOY SETUP
══════════════════════════════════════════════════════════════

Proyecto: {name}

──────────────────────────────────────────────────────────────
DETECCION DE ENTORNO
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalles |
|------------|-----------|----------|
| PostgreSQL | {version} | {host, port} |
| Objetivo de despliegue | {Docker/K8s/systemd} | {detalles} |
| PgBouncer existente | {si/no} | {version} |
| Red | {topologia} | {privada/publica} |
| Gestion de secretos | {metodo} | {K8s Secrets/Vault/env} |
```

### Paso 2: Elegir Estrategia de Despliegue

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DE DESPLIEGUE
──────────────────────────────────────────────────────────────

Metodo: {Docker Compose / K8s Standalone / K8s Sidecar / Systemd}
HA: {Active-passive / Multiples replicas / Instancia unica}
Imagen: bitnami/pgbouncer:1.25.1

| Decision | Eleccion | Justificacion |
|----------|----------|---------------|
| Metodo de despliegue | {method} | {reason} |
| Replicas | {count} | {reason} |
| Health check | {pg_isready / TCP} | {reason} |
| Gestion de config | {ConfigMap/env/file} | {reason} |
```

### Paso 3: Generar Archivos de Despliegue

Generar todos los archivos de configuracion de despliegue:
- Definicion de servicio Docker Compose (si Docker)
- Manifiestos de Kubernetes: Deployment, Service, ConfigMap, Secret (si K8s)
- Archivo unit systemd (si bare metal)
- Configuracion pgbouncer.ini
- Script de health check
- Script de reload para cambios de configuracion sin tiempo de inactividad

### Paso 4: Generar Health Check

Generar configuracion de health check apropiada para el objetivo de despliegue:
- Docker: instruccion HEALTHCHECK
- Kubernetes: livenessProbe + readinessProbe
- Systemd: verificacion ExecStartPost

### Paso 5: Generar Script de Reload

Generar script de reload sin tiempo de inactividad:
```bash
#!/bin/bash
# reload-pgbouncer.sh
# Reloads PgBouncer configuration without dropping connections
```

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE SETUP
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripcion |
|---------|-------------|
| {file} | {description} |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Configurar credenciales de base de datos en secrets
2. [ ] Desplegar PgBouncer al entorno objetivo
3. [ ] Verificar que los health checks pasan
4. [ ] Actualizar DATABASE_URL de la aplicacion para apuntar a PgBouncer
5. [ ] Auditar seguridad con /pgbouncer:security-audit
6. [ ] Configurar monitoreo con /pgbouncer:optimize
```
