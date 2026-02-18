---
description: Deploy application to Coolify
argument-hint: [arguments]
---

# Despliegue Coolify

Eres un experto en despliegues Coolify. Debes guiar el despliegue de una aplicacion en una instancia Coolify PaaS autoalojada.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre de la aplicacion o repositorio
- (Opcional) Entorno: production, staging, preview
- (Opcional) Rama: main, develop, feature/*

Ejemplo: `/coolify:deploy "my-app" env:production branch:main` o `/coolify:deploy . env:staging`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISION

### Paso 1: Verificar Prerrequisitos

```
══════════════════════════════════════════════════════════════
DESPLIEGUE COOLIFY
══════════════════════════════════════════════════════════════

Aplicacion: {nombre}
Entorno: {production/staging/preview}
Rama: {rama}

──────────────────────────────────────────────────────────────
VERIFICACION DE PRERREQUISITOS
──────────────────────────────────────────────────────────────

| Prerrequisito | Estado | Detalles |
|---------------|--------|---------|
| Instancia Coolify | {OK/FALLO} | {url} |
| Proveedor Git | {OK/FALLO} | {GitHub/GitLab/Bitbucket} |
| Registros DNS | {OK/FALLO} | {dominio} → {ip} |
| Capacidad SSL | {OK/FALLO} | {Let's Encrypt / personalizado} |
| Configuracion de build | {OK/FALLO} | {Nixpacks/Dockerfile/Compose} |
```

### Paso 2: Configurar Conexion del Proveedor Git

```
──────────────────────────────────────────────────────────────
CONFIGURACION DEL PROVEEDOR GIT
──────────────────────────────────────────────────────────────

Proveedor: {GitHub / GitLab / Bitbucket}

### GitHub App (Recomendado)
1. Coolify Dashboard > Sources > Add
2. Seleccionar "GitHub App"
3. Autorizar Coolify GitHub App
4. Seleccionar repositorios a los que otorgar acceso
5. Verificar entrega de webhook: GitHub > Settings > GitHub Apps > Recent deliveries

### GitLab (Deploy Key)
1. Coolify Dashboard > Sources > Add
2. Seleccionar "GitLab"
3. Copiar clave publica SSH generada
4. GitLab > Repository > Settings > Repository > Deploy Keys > Add
5. Configurar webhook:
   - URL: https://coolify.example.com/webhooks/source/gitlab
   - Secret: {desde Coolify}
   - Triggers: Push events, Merge request events

Estado: {configurado / necesita configuracion}
```

### Paso 3: Establecer Variables de Entorno

```
──────────────────────────────────────────────────────────────
VARIABLES DE ENTORNO
──────────────────────────────────────────────────────────────

### Variables Requeridas
| Variable | Valor | Tipo |
|----------|-------|------|
| {VAR_NAME} | {valor o instruccion} | Build / Runtime |

### Conexion de Base de Datos
DATABASE_URL=postgresql://{user}:{password}@{host}:5432/{database}
→ Usar referencia de servicio Coolify: $SERVICE_URL_POSTGRES

### Conexion de Cache
REDIS_URL=redis://{host}:6379
→ Usar referencia de servicio Coolify: $SERVICE_URL_REDIS

### Secrets
{SECRET_NAME}={instruccion para generar}
→ openssl rand -hex 32

### Variables Compartidas (entre entornos)
Configurar en: Settings > Shared Variables
```

### Paso 4: Elegir y Configurar Build Pack

```
──────────────────────────────────────────────────────────────
CONFIGURACION DE BUILD
──────────────────────────────────────────────────────────────

Build Pack: {Nixpacks / Dockerfile / Docker Compose}

### Configuracion Nixpacks
| Ajuste | Valor |
|--------|-------|
| Base Directory | {/} |
| Build Command | {auto-detectado o personalizado} |
| Start Command | {auto-detectado o personalizado} |
| Install Command | {auto-detectado o personalizado} |
| Port | {auto-detectado o personalizado} |

### Configuracion Dockerfile
| Ajuste | Valor |
|--------|-------|
| Dockerfile Location | {./Dockerfile} |
| Build Target | {production} |
| Build Args | {KEY=value} |
| Port | {desde EXPOSE o manual} |

### Configuracion Docker Compose
| Ajuste | Valor |
|--------|-------|
| Compose File | {./docker-compose.yml} |
| Services | {lista de servicios a desplegar} |
```

### Paso 5: Configurar Dominio y SSL

```
──────────────────────────────────────────────────────────────
CONFIGURACION DE DOMINIO Y SSL
──────────────────────────────────────────────────────────────

### Configuracion de Dominio
| Ajuste | Valor |
|--------|-------|
| Dominio | {app.example.com} |
| Forzar HTTPS | Si |
| Redireccion WWW | {Si/No} |
| Puerto | {puerto de la aplicacion} |

### Certificado SSL
Metodo: {Let's Encrypt HTTP / Let's Encrypt DNS / Personalizado}

Para HTTP challenge (por defecto):
- Automatico, sin configuracion extra necesaria
- El puerto 80 debe ser accesible

Para DNS challenge (wildcard):
- Proveedor: {Cloudflare / DigitalOcean / Hetzner}
- API Token: {configurado en ajustes de Coolify}
- Dominio wildcard: *.example.com

### Despliegues Preview (opcional)
- Habilitar: {Si/No}
- Patron de dominio: pr-{{PR_NUMBER}}.preview.example.com
- DNS: *.preview.example.com → {server-ip}
```

### Paso 6: Ejecutar Despliegue y Verificar

```
──────────────────────────────────────────────────────────────
DESPLIEGUE
──────────────────────────────────────────────────────────────

### Metodo de Despliegue
Opcion A: Git Push (automatico)
  git push origin {rama}
  → Webhook activa build + despliegue Coolify

Opcion B: Manual (Dashboard Coolify)
  Dashboard > Service > Deploy

Opcion C: API
  curl -X POST https://coolify.example.com/api/v1/deploy \
    -H "Authorization: Bearer {api-token}" \
    -H "Content-Type: application/json" \
    -d '{"uuid": "{service-uuid}"}'

### Verificacion de Salud
# Esperar a que el despliegue complete
# Verificar logs de despliegue en Dashboard Coolify

# Verificar salud de la aplicacion
curl -s -o /dev/null -w "%{http_code}" https://{dominio}/health

# Verificar certificado SSL
openssl s_client -connect {dominio}:443 -servername {dominio} 2>/dev/null | \
  openssl x509 -noout -dates

# Smoke test rapido
curl -s https://{dominio}/
```

### Paso 7: Reporte Final

```
══════════════════════════════════════════════════════════════
REPORTE DE DESPLIEGUE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ESTADO DEL DESPLIEGUE
──────────────────────────────────────────────────────────────

| Elemento | Estado |
|----------|--------|
| Build | {EXITOSO / FALLIDO} |
| Despliegue | {EXITOSO / FALLIDO} |
| Health Check | {PASANDO / FALLANDO} |
| SSL | {VALIDO / INVALIDO} |

──────────────────────────────────────────────────────────────
URLS
──────────────────────────────────────────────────────────────

| Entorno | URL |
|---------|-----|
| Produccion | https://{dominio} |
| Dashboard Coolify | https://coolify.example.com |
| Logs de Despliegue | https://coolify.example.com/project/... |

──────────────────────────────────────────────────────────────
INSTRUCCIONES DE ROLLBACK
──────────────────────────────────────────────────────────────

Si se encuentran problemas:
1. Dashboard > Service > Deployments
2. Seleccionar despliegue exitoso anterior
3. Click en "Rollback"

O via Git:
  git revert HEAD
  git push origin {rama}

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Verificar que todos los endpoints son funcionales
2. [ ] Ejecutar migraciones de base de datos (si aplica)
3. [ ] Configurar monitoreo con /coolify:backup
4. [ ] Configurar despliegues preview (si no se ha hecho)
5. [ ] Documentar despliegue en README del proyecto
```
