---
description: Diseñar una arquitectura Kubernetes completa
argument-hint: <Proyecto> [restricciones]
---

# Arquitectura Kubernetes

Eres un arquitecto Kubernetes senior. Debes diseñar una arquitectura de clúster completa a partir de las especificaciones del proyecto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripción del proyecto
- Stack tecnológico (p. ej., node, python, go)
- Servicios requeridos (p. ej., postgres, redis, rabbitmq)
- Restricciones (p. ej., aws-eks, multi-tenant, high-availability)

Ejemplo: `/kubernetes:architecture "API de e-commerce" stack:node services:postgres,redis cloud:aws-eks`

## Modo Plan

> **El modo plan es recomendado.** Claude activa el modo plan para estructurar el enfoque, identificar dependencias y presentar una estrategia de arquitectura antes de crear los manifiestos.

## MISIÓN

### Paso 1: Descubrimiento

```
══════════════════════════════════════════════════════════════
ARQUITECTURA KUBERNETES
══════════════════════════════════════════════════════════════

Proyecto: {nombre}
Descripción: {descripción}

──────────────────────────────────────────────────────────────
ANÁLISIS DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack Tecnológico
| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | {tech} | {version} |
| Base de datos | {tech} | {version} |
| Caché | {tech} | {version} |

### Servicios Requeridos
| Servicio | Uso | Criticidad |
|----------|-----|------------|
| {service} | {usage} | Alta/Media/Baja |

### Entornos
| Entorno | Propósito | Detalles |
|---------|-----------|----------|
| dev | Desarrollo | Local (kind/minikube) |
| staging | Validación | Similar a producción |
| prod | Producción | HA, autoescalado |
```

### Paso 2: Diseño del Clúster

```
──────────────────────────────────────────────────────────────
TOPOLOGÍA DE NAMESPACES
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE INGRESS                         │
│  ┌───────────────┐         ┌───────────────┐                │
│  │ Ingress NGINX │─────────│  Cert-Manager │                │
│  └───────┬───────┘         └───────────────┘                │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                   CAPA DE APLICACIÓN                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   API    │────│ Workers  │────│ Frontend │              │
│  │(Deploy)  │    │ (Deploy) │    │ (Deploy) │              │
│  └──────────┘    └──────────┘    └──────────┘              │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                      CAPA DE DATOS                           │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Redis   │  │  RabbitMQ    │          │
│  │(StatefulSet) │  │ (Deploy) │  │(StatefulSet) │          │
│  └──────────────┘  └──────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
DISTRIBUCIÓN DE NAMESPACES
──────────────────────────────────────────────────────────────

| Namespace | Propósito | Nivel PSS | Cuotas |
|-----------|-----------|-----------|--------|
| app-prod | Producción | restricted | 4 CPU, 8Gi |
| app-staging | Staging | restricted | 2 CPU, 4Gi |
| monitoring | Prometheus, Grafana | baseline | 2 CPU, 4Gi |
| ingress | Controlador Ingress | baseline | 1 CPU, 2Gi |
```

### Paso 3: Estructura de Manifiestos

```
──────────────────────────────────────────────────────────────
ESTRUCTURA DEL PROYECTO
──────────────────────────────────────────────────────────────

k8s/
├── base/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── api/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── networkpolicy.yaml
│   ├── worker/
│   │   └── deployment.yaml
│   └── database/
│       ├── statefulset.yaml
│       ├── service.yaml
│       └── pvc.yaml
├── overlays/
│   ├── dev/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   ├── staging/
│   │   └── kustomization.yaml
│   └── prod/
│       ├── kustomization.yaml
│       └── patches/
└── argocd/
    └── application.yaml
```

### Paso 4: Generar Manifiestos Base

Generar manifiestos de Deployment, Service, HPA, NetworkPolicy, StatefulSet y PVC para cada carga de trabajo siguiendo las mejores prácticas de Kubernetes:
- Solicitudes y límites de recursos
- Sondas de salud (liveness, readiness, startup)
- Contexto de seguridad (no-root, FS de solo lectura, eliminar capacidades)
- Pod Disruption Budgets para servicios críticos

### Paso 5: Generar Overlays de Kustomize

Crear overlays específicos por entorno con los patches apropiados:
- Dev: réplicas reducidas, recursos relajados
- Staging: similar a producción con menor escala
- Prod: HA completo, autoescalado, políticas estrictas

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
ARQUITECTURA GENERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripción |
|---------|-------------|
| k8s/base/kustomization.yaml | Configuración base de Kustomize |
| k8s/base/api/deployment.yaml | Deployment de la API |
| k8s/overlays/prod/kustomization.yaml | Overlay de producción |
| k8s/argocd/application.yaml | Aplicación ArgoCD |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar y ajustar solicitudes/límites de recursos
2. [ ] Configurar Secrets con External Secrets Operator
3. [ ] Configurar GitOps con /kubernetes:deploy-setup
4. [ ] Ejecutar auditoría de seguridad con /kubernetes:security-audit
5. [ ] Configurar monitorización con @kubernetes-monitoring
```
