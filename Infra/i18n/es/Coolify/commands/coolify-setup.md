---
description: Initialize project for Coolify deployment
argument-hint: [arguments]
---

# Configuracion Coolify

Eres un especialista en despliegues Coolify. Debes analizar el proyecto y prepararlo para el despliegue en una instancia Coolify PaaS autoalojada.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripcion o ruta del proyecto
- (Opcional) Build pack objetivo: nixpacks, dockerfile, compose
- (Opcional) Servicios necesarios: postgres, redis, mysql, mongodb

Ejemplo: `/coolify:setup "API Node.js con PostgreSQL y Redis"` o `/coolify:setup . buildpack:dockerfile services:postgres,redis`

## MISION

### Paso 1: Analizar el Stack del Proyecto

```bash
# Detectar tipo de proyecto
ls -la package.json composer.json requirements.txt go.mod Cargo.toml Gemfile *.csproj 2>/dev/null

# Verificar archivos Docker existentes
ls -la Dockerfile* docker-compose*.yml .dockerignore nixpacks.toml 2>/dev/null

# Verificar configuracion de entorno
ls -la .env .env.example .env.local 2>/dev/null

# Identificar servicios desde el codigo
grep -r "DATABASE_URL\|REDIS_URL\|MONGODB_URI\|MYSQL_" .env* 2>/dev/null
```

```
══════════════════════════════════════════════════════════════
CONFIGURACION DE PROYECTO COOLIFY
══════════════════════════════════════════════════════════════

Proyecto: {nombre}
Ruta: {ruta}

──────────────────────────────────────────────────────────────
DETECCION DE STACK
──────────────────────────────────────────────────────────────

| Componente | Detectado | Version |
|------------|----------|---------|
| Lenguaje | {lenguaje} | {version} |
| Framework | {framework} | {version} |
| Gestor de Paquetes | {npm/yarn/pnpm/composer/pip} | {version} |

| Servicio | Detectado | Fuente |
|----------|----------|--------|
| {base de datos} | {si/no} | {var env / archivo config} |
| {cache} | {si/no} | {var env / archivo config} |
| {cola} | {si/no} | {var env / archivo config} |
```

### Paso 2: Recomendar Build Pack

```
──────────────────────────────────────────────────────────────
RECOMENDACION DE BUILD PACK
──────────────────────────────────────────────────────────────

Recomendado: {Nixpacks / Dockerfile / Docker Compose}

Razonamiento:
- {razon 1}
- {razon 2}

| Build Pack | Ventajas | Desventajas |
|------------|----------|-------------|
| Nixpacks | Zero-config, auto-deteccion | Menos control |
| Dockerfile | Control total, reproducible | Config manual |
| Docker Compose | Multi-servicio, setup existente | Mas complejo |

Seleccionado: {build pack}
```

### Paso 3: Generar/Validar Configuracion

Para Nixpacks:
```toml
# nixpacks.toml (si se necesita personalizacion)
[phases.setup]
nixPkgs = ["..."]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

Para Dockerfile (si no existe):
```dockerfile
# Generar Dockerfile apropiado basado en el stack detectado
# Build multi-stage optimizado para despliegue Coolify
```

Para Docker Compose (validar existente):
```yaml
# Validar docker-compose.yml para compatibilidad con Coolify
# Verificar conflictos de puertos, definiciones de volumenes, config de red
```

### Paso 4: Crear Plantilla de Entorno

```
──────────────────────────────────────────────────────────────
VARIABLES DE ENTORNO
──────────────────────────────────────────────────────────────
```

Generar plantilla `.env.coolify`:
```bash
# =============================================================================
# Plantilla de Variables de Entorno Coolify
# =============================================================================
# Copiar estas variables a la configuracion de su servicio Coolify
# Dashboard > Service > Environment Variables

# Aplicacion
NODE_ENV=production
APP_URL=https://{tu-dominio}
PORT=3000

# Base de datos (usar PostgreSQL gestionado por Coolify)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${SERVICE_URL_POSTGRES}:5432/${POSTGRES_DB}

# Cache (usar Redis gestionado por Coolify)
REDIS_URL=redis://${SERVICE_URL_REDIS}:6379

# Secrets (generar valores unicos)
SECRET_KEY={generar-con: openssl rand -hex 32}
JWT_SECRET={generar-con: openssl rand -hex 64}

# Servicios Externos (configurar segun necesidad)
# SMTP_HOST=
# SMTP_PORT=587
# S3_ENDPOINT=
# S3_BUCKET=
```

### Paso 5: Generar Lista de Verificacion de Despliegue

```
──────────────────────────────────────────────────────────────
LISTA DE VERIFICACION DE DESPLIEGUE
──────────────────────────────────────────────────────────────

### Prerrequisitos del Servidor
- [ ] VPS aprovisionado (min 4 GB RAM, 2 vCPU, 50 GB SSD)
- [ ] Coolify instalado: curl -fsSL https://cdn.coolify.io/install.sh | bash
- [ ] Firewall configurado: puertos 22, 80, 443 abiertos
- [ ] Autenticacion SSH basada en clave habilitada

### Configuracion DNS
- [ ] Registro A: {dominio} → {server-ip}
- [ ] (Opcional) Wildcard: *.{dominio} → {server-ip}
- [ ] Propagacion DNS verificada: dig +short {dominio}

### Configuracion Coolify
- [ ] Fuente Git conectada (GitHub App / deploy key)
- [ ] Proyecto creado en dashboard Coolify
- [ ] Entorno creado (produccion/staging)
- [ ] Servicio de aplicacion agregado

### Configuracion del Servicio
- [ ] Build pack seleccionado: {recomendacion}
- [ ] Comandos de build/inicio verificados
- [ ] Puerto configurado: {puerto}
- [ ] Variables de entorno establecidas
- [ ] Dominio configurado con SSL
- [ ] Endpoint de health check: /health

### Configuracion de Base de Datos (si aplica)
- [ ] Servicio de base de datos creado en Coolify
- [ ] URL de conexion establecida en variables de entorno
- [ ] Migracion/seed inicial lista
- [ ] Programacion de backup configurada

### Post-Despliegue
- [ ] Health check respondiendo
- [ ] Certificado SSL valido
- [ ] Aplicacion funcional
- [ ] Monitoreo configurado
```

### Paso 6: Reporte Final

```
══════════════════════════════════════════════════════════════
REPORTE DE CONFIGURACION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARCHIVOS CREADOS/VERIFICADOS
──────────────────────────────────────────────────────────────

| Archivo | Estado | Descripcion |
|---------|--------|-------------|
| {archivo} | {creado/verificado/modificado} | {descripcion} |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar .env.coolify y establecer valores de produccion
2. [ ] Completar lista de verificacion de prerrequisitos del servidor
3. [ ] Configurar registros DNS
4. [ ] Desplegar con /coolify:deploy
5. [ ] Configurar backups con /coolify:backup
```
