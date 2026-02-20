---
description: Generate FrankenPHP deployment files for Docker, Kubernetes, or standalone
argument-hint: <Platform> [method]
---

# FrankenPHP Deploy Setup

Eres un especialista en despliegue de FrankenPHP. Debes configurar un despliegue completo para FrankenPHP en el entorno objetivo.

## Arguments
$ARGUMENTS

Arguments:
- Platform description
- (Optional) Method: docker-compose, kubernetes, standalone-binary (default: docker-compose)
- (Optional) Framework: symfony, laravel, php (default: auto-detect)

Example: `/frankenphp:deploy-setup "Production API" method:kubernetes framework:symfony`

## Plan Mode

> **Plan mode es obligatorio.** Antes de ejecutar, Claude activa plan mode para analizar el entorno objetivo, proponer una estrategia de despliegue y esperar validacion.

## MISION

### Paso 1: Analizar Entorno

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEPLOY SETUP
══════════════════════════════════════════════════════════════

Proyecto: {name}

──────────────────────────────────────────────────────────────
DETECCION DE ENTORNO
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalles |
|------------|-----------|----------|
| Framework PHP | {Symfony/Laravel/PHP} | {version} |
| Objetivo de despliegue | {Docker/K8s/standalone} | {detalles} |
| FrankenPHP existente | {si/no} | {version} |
| Estrategia TLS | {auto/proxy/manual} | {detalles} |
| Gestion de secretos | {metodo} | {K8s Secrets/Vault/env} |
```

### Paso 2: Elegir Estrategia de Despliegue

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DE DESPLIEGUE
──────────────────────────────────────────────────────────────

Metodo: {Docker Compose / Kubernetes / Standalone Binary}
Imagen: dunglas/frankenphp:1.11-php8.5-bookworm
Worker mode: {si/no}

| Decision | Eleccion | Justificacion |
|----------|----------|---------------|
| Metodo de despliegue | {metodo} | {razon} |
| Replicas | {conteo} | {razon} |
| Health check | {HTTP /healthz} | {razon} |
| Terminacion TLS | {FrankenPHP/proxy} | {razon} |
```

### Paso 3: Generar Archivos de Despliegue

Generar todos los archivos de configuracion de despliegue:
- Dockerfile (multi-stage, optimizado para produccion)
- docker-compose.yml (si metodo Docker)
- Manifiestos Kubernetes: Deployment, Service, HPA (si metodo K8s)
- Caddyfile para el entorno
- Configuracion PHP (opcache, seguridad)
- Endpoint de health check

### Paso 4: Generar Health Check

Generar health check apropiado para el objetivo de despliegue:
- Docker: Instruccion HEALTHCHECK
- Kubernetes: livenessProbe + readinessProbe (HTTP)
- Standalone: verificacion systemd

### Paso 5: Generar Script de Reload

Generar script de reload sin tiempo de inactividad:
```bash
#!/bin/bash
# reload-frankenphp.sh
# Reloads FrankenPHP workers without dropping connections (SIGUSR1)
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
| {archivo} | {descripcion} |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Configurar variables de entorno (SERVER_NAME, secretos)
2. [ ] Construir y desplegar imagen FrankenPHP
3. [ ] Verificar que los health checks pasan
4. [ ] Auditar seguridad con /frankenphp:security-audit
5. [ ] Optimizar rendimiento con /frankenphp:optimize
```
