---
description: Setup CI/CD pipeline for OpenTofu
argument-hint: <Platform> [environments]
---

# Configuración de Despliegue OpenTofu

Eres un especialista en despliegue OpenTofu. Debes configurar un pipeline CI/CD completo para el despliegue seguro de infraestructura.

## Arguments
$ARGUMENTS

Argumentos:
- Plataforma CI/CD (github-actions, gitlab-ci)
- (Opcional) Entornos: dev,staging,prod
- (Opcional) Estrategia de aprobación: manual, auto-dev-manual-prod

Ejemplo: `/opentofu:deploy-setup "github-actions" envs:dev,staging,prod approval:manual-prod`

## Plan Mode

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el proyecto, proponer una estrategia de despliegue y esperar la validación.

## MISSION

### Paso 1: Analizar Proyecto

```
══════════════════════════════════════════════════════════════
CONFIGURACIÓN DE DESPLIEGUE OPENTOFU
══════════════════════════════════════════════════════════════

Proyecto: {name}

──────────────────────────────────────────────────────────────
DETECCIÓN DEL PROYECTO
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalles |
|------------|-----------|----------|
| Versión de OpenTofu | {version} | versions.tf |
| Backend | {type} | {S3/GCS/Azure} |
| Entornos | {count} | {list} |
| Cifrado de estado | {sí/no} | {método} |
| Módulos | {count} | {list} |
```

### Paso 2: Diseñar Estrategia del Pipeline

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DEL PIPELINE
──────────────────────────────────────────────────────────────

Plataforma: {GitHub Actions / GitLab CI}
Aprobación: {auto-dev / manual-staging / manual-prod}

Pipeline:
  PR abierto
    -> Validar (fmt, validate)
    -> Plan (por entorno)
    -> Comentar PR con salida del plan

  PR fusionado a main
    -> Plan (artefacto guardado)
    -> Apply dev (auto)
    -> Apply staging (auto/manual)
    -> Apply prod (aprobación manual)
```

### Paso 3: Generar Pipeline CI/CD

Generar configuración completa del pipeline con:
- Paso de configuración de OpenTofu (`opentofu/setup-opentofu@v1`)
- Etapas de init, plan, apply
- Artefacto de plan para applies seguros
- Comentario en PR con salida del plan
- Puertas de aprobación por entorno
- Autenticación OIDC (sin secretos de larga duración)

### Paso 4: Generar Detección de Deriva

Generar flujo de trabajo de detección de deriva programado:
- Ejecución basada en cron (p. ej., mañanas de días laborables)
- Plan con `-detailed-exitcode`
- Notificación al detectar deriva

### Paso 5: Generar Procedimiento de Rollback

Documentar estrategia de rollback:
- Versionado y restauración del estado
- Destroy dirigido para recursos nuevos
- Procedimientos de intervención manual

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
| .github/workflows/tofu-plan.yml | Flujo de trabajo de plan en PR |
| .github/workflows/tofu-apply.yml | Flujo de trabajo de apply |
| .github/workflows/tofu-drift.yml | Detección de deriva |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Configurar proveedor OIDC en la cuenta cloud
2. [ ] Crear roles IAM para plan y apply
3. [ ] Establecer reglas de protección de entornos en GitHub
4. [ ] Probar el pipeline con un cambio sin operación
5. [ ] Configurar monitorización con detección de deriva
```
