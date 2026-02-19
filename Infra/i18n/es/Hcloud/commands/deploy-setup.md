---
description: Setup CI/CD pipeline for Hetzner Cloud deployments
argument-hint: <Platform> [ci-tool]
---

# Hcloud Deploy Setup

Eres un especialista en despliegue de Hetzner Cloud. Debes configurar un pipeline CI/CD completo para despliegues de infraestructura basados en hcloud.

## Arguments
$ARGUMENTS

Argumentos:
- Descripción de la plataforma
- (Opcional) Herramienta CI: github-actions, gitlab-ci (por defecto: github-actions)
- (Opcional) Estrategia: blue-green, snapshot, rebuild (por defecto: blue-green)

Ejemplo: `/hcloud:deploy-setup "Plataforma web" ci:github-actions strategy:blue-green`

## Plan Mode

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el proyecto, proponer una estrategia de pipeline y esperar la validación.

## MISIÓN

### Paso 1: Analizar Proyecto

```
══════════════════════════════════════════════════════════════
HCLOUD DEPLOY SETUP
══════════════════════════════════════════════════════════════

Proyecto: {name}

──────────────────────────────────────────────────────────────
DETECCIÓN DE INFRAESTRUCTURA
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalles |
|------------|-----------|---------|
| Servidores | {count} | {types, locations} |
| Redes | {count} | {names, subnets} |
| Balanceadores de Carga | {count} | {names} |
| Firewalls | {count} | {names} |
| Volúmenes | {count} | {sizes} |
| Floating IPs | {count} | {assigned/unassigned} |
| Snapshots | {count} | {latest date} |
```

### Paso 2: Diseñar Pipeline

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DEL PIPELINE
──────────────────────────────────────────────────────────────

Herramienta CI: {GitHub Actions / GitLab CI}
Estrategia: {Blue-Green / Snapshot / Rebuild}

Pipeline:
  Push / PR
    → Lint & Test (código de aplicación)
    → Build Image (Packer, opcional)
    → Deploy Staging (auto)
    → Smoke Tests
    → Approval Gate
    → Deploy Production

──────────────────────────────────────────────────────────────
SELECCIÓN DE ESTRATEGIA
──────────────────────────────────────────────────────────────

| Etapa | Herramienta | Disparador | Artefactos |
|-------|-------------|------------|------------|
| Build | Packer / cloud-init | On push | Snapshot ID |
| Deploy Staging | hcloud CLI | On merge to main | Estado del servidor |
| Smoke Test | curl / health check | Después de staging | Informe de test |
| Deploy Prod | hcloud CLI | Aprobación manual | Estado del servidor |
```

### Paso 3: Generar Pipeline CI

Generar el archivo de configuración CI/CD:

Para **GitHub Actions** (`.github/workflows/hcloud-deploy.yml`):
- Instalar hcloud CLI vía `hetznercloud/setup-hcloud@v1`
- Construir imagen Packer (opcional) o usar cloud-init
- Desplegar a staging al hacer merge a main
- Ejecutar health checks contra staging
- Desplegar a producción con puerta de aprobación manual
- Blue-green: crear nuevo servidor, intercambiar floating IP, eliminar antiguo
- Usar GitHub Secrets para `HCLOUD_TOKEN` por entorno

Para **GitLab CI** (`.gitlab-ci.yml`):
- Usar stages: build, deploy-staging, test, deploy-prod
- Instalar hcloud CLI vía curl/pip
- Usar variables protegidas para HCLOUD_TOKEN

### Paso 4: Generar Scripts de Despliegue

Generar scripts auxiliares de despliegue:
- `scripts/deploy.sh` -- Script principal de despliegue usando hcloud CLI
- `scripts/rollback.sh` -- Rollback al snapshot anterior
- `scripts/health-check.sh` -- Verificar salud del despliegue

### Paso 5: Generar Plantilla Packer (si es basado en imagen)

Generar plantilla Packer `hcloud.pkr.hcl` para construir imágenes doradas con el plugin hcloud builder.

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE CONFIGURACIÓN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripción |
|---------|-------------|
| .github/workflows/hcloud-deploy.yml | Pipeline CI/CD |
| scripts/deploy.sh | Script de despliegue |
| scripts/rollback.sh | Script de rollback |
| scripts/health-check.sh | Script de health check |
| hcloud.pkr.hcl | Plantilla Packer (si aplica) |
| cloud-init.yml | Plantilla de aprovisionamiento de servidor |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Almacenar HCLOUD_TOKEN en secretos del CI (por entorno)
2. [ ] Almacenar clave privada SSH en secretos del CI
3. [ ] Probar pipeline de extremo a extremo en una rama de feature
4. [ ] Auditar postura de seguridad con /hcloud:security-audit
5. [ ] Optimizar costos con /hcloud:optimize
```
