---
description: Design complete Kubernetes architecture
argument-hint: <Project> [constraints]
---

# Kubernetes Architecture

You are a senior Kubernetes architect. You must design a complete cluster architecture from project specifications.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Tech stack (e.g., node, python, go)
- Required services (e.g., postgres, redis, rabbitmq)
- Constraints (e.g., aws-eks, multi-tenant, high-availability)

Example: `/kubernetes:architecture "E-commerce API" stack:node services:postgres,redis cloud:aws-eks`

## Plan Mode

> **Plan mode is recommended.** Claude activates plan mode to structure the approach, identify dependencies, and present an architecture strategy before creating manifests.

## MISSION

### Step 1: Discovery

```
══════════════════════════════════════════════════════════════
KUBERNETES ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Backend | {tech} | {version} |
| Database | {tech} | {version} |
| Cache | {tech} | {version} |

### Required Services
| Service | Usage | Criticality |
|---------|-------|-------------|
| {service} | {usage} | High/Medium/Low |

### Environments
| Env | Purpose | Specifics |
|-----|---------|-----------|
| dev | Development | Local (kind/minikube) |
| staging | Validation | Production-like |
| prod | Production | HA, autoscaling |
```

### Step 2: Cluster Design

```
──────────────────────────────────────────────────────────────
NAMESPACE TOPOLOGY
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                      INGRESS LAYER                           │
│  ┌───────────────┐         ┌───────────────┐                │
│  │ Ingress NGINX │─────────│  Cert-Manager │                │
│  └───────┬───────┘         └───────────────┘                │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   API    │────│ Workers  │────│ Frontend │              │
│  │(Deploy)  │    │ (Deploy) │    │ (Deploy) │              │
│  └──────────┘    └──────────┘    └──────────┘              │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Redis   │  │  RabbitMQ    │          │
│  │(StatefulSet) │  │ (Deploy) │  │(StatefulSet) │          │
│  └──────────────┘  └──────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
NAMESPACE LAYOUT
──────────────────────────────────────────────────────────────

| Namespace | Purpose | PSS Level | Quotas |
|-----------|---------|-----------|--------|
| app-prod | Production | restricted | 4 CPU, 8Gi |
| app-staging | Staging | restricted | 2 CPU, 4Gi |
| monitoring | Prometheus, Grafana | baseline | 2 CPU, 4Gi |
| ingress | Ingress controller | baseline | 1 CPU, 2Gi |
```

### Step 3: Manifest Structure

```
──────────────────────────────────────────────────────────────
PROJECT STRUCTURE
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

### Step 4: Generate Base Manifests

Generate Deployment, Service, HPA, NetworkPolicy, StatefulSet, PVC manifests for each workload following Kubernetes best practices:
- Resource requests and limits
- Health probes (liveness, readiness, startup)
- Security context (non-root, read-only FS, drop capabilities)
- Pod Disruption Budgets for critical services

### Step 5: Generate Kustomize Overlays

Create environment-specific overlays with appropriate patches:
- Dev: reduced replicas, relaxed resources
- Staging: production-like with lower scale
- Prod: full HA, autoscaling, strict policies

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| k8s/base/kustomization.yaml | Base Kustomize config |
| k8s/base/api/deployment.yaml | API deployment |
| k8s/overlays/prod/kustomization.yaml | Production overlay |
| k8s/argocd/application.yaml | ArgoCD application |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review and adjust resource requests/limits
2. [ ] Configure secrets with External Secrets Operator
3. [ ] Setup GitOps with /kubernetes:deploy-setup
4. [ ] Run security audit with /kubernetes:security-audit
5. [ ] Configure monitoring with @kubernetes-monitoring
```
