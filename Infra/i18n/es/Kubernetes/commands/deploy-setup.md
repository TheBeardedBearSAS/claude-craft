---
description: Configurar un pipeline de despliegue GitOps para Kubernetes
argument-hint: <Stack> [herramienta-gitops]
---

# Configuración de Despliegue Kubernetes

Eres un especialista en despliegue Kubernetes. Debes configurar un pipeline de despliegue GitOps completo para el proyecto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripción del stack o ruta
- (Opcional) Herramienta GitOps: argocd, flux (por defecto: argocd)
- (Opcional) Estrategia de versión: rolling, canary, blue-green

Ejemplo: `/kubernetes:deploy-setup "API Node.js" gitops:argocd strategy:canary`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el proyecto, proponer una estrategia de despliegue y esperar la validación.

## MISIÓN

### Paso 1: Analizar el Proyecto

```
══════════════════════════════════════════════════════════════
CONFIGURACIÓN DE DESPLIEGUE KUBERNETES
══════════════════════════════════════════════════════════════

Proyecto: {nombre}

──────────────────────────────────────────────────────────────
DETECCIÓN DEL STACK
──────────────────────────────────────────────────────────────

| Componente | Detectado | Versión |
|------------|-----------|---------|
| Lenguaje | {language} | {version} |
| Framework | {framework} | {version} |
| Dockerfile | {sí/no} | {ruta} |
| Manifiestos K8s | {sí/no} | {ruta} |
```

### Paso 2: Diseñar la Estrategia de Despliegue

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DE DESPLIEGUE
──────────────────────────────────────────────────────────────

Herramienta GitOps: {ArgoCD / Flux}
Estrategia de versión: {Rolling / Canary / Blue-Green}

Pipeline:
  Push a main
    → CI: Test → Construir → Push imagen
    → CD: Actualizar manifiesto → Sincronizar con clúster
    → Verificar: Comprobaciones de salud → Pruebas de humo
    → Promover: Staging → Producción
```

### Paso 3: Generar Pipeline CI

Generar flujo de trabajo de GitHub Actions / GitLab CI:
- Construir y probar la aplicación
- Construir y enviar la imagen Docker con etiqueta SHA
- Actualizar los manifiestos Kubernetes con la nueva etiqueta de imagen
- Iniciar la sincronización GitOps

### Paso 4: Generar Configuración GitOps

Generar la Aplicación ArgoCD o el HelmRelease de Flux:
- Definición de la aplicación
- Políticas de sincronización (auto-sync, prune, self-heal)
- Estrategia de promoción entre entornos
- Configuración de rollback

### Paso 5: Generar Estrategia de Rollout

Si es canary o blue-green, generar la configuración de Argo Rollouts:
- Pasos de entrega progresiva
- Plantillas de análisis para la promoción basada en métricas
- Integración con service mesh (si aplica)

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
| .github/workflows/deploy.yml | Pipeline CI/CD |
| k8s/argocd/application.yaml | Aplicación ArgoCD |
| k8s/argocd/project.yaml | Proyecto ArgoCD |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Instalar ArgoCD/Flux en el clúster de destino
2. [ ] Configurar el acceso al repositorio Git (deploy key o GitHub App)
3. [ ] Configurar las credenciales del registro de imágenes
4. [ ] Configurar Secrets con External Secrets Operator
5. [ ] Probar el pipeline de despliegue de extremo a extremo
6. [ ] Configurar monitorización con @kubernetes-monitoring
```
