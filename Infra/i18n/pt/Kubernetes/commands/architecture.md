---
description: Projetar arquitetura Kubernetes completa
argument-hint: <Projeto> [restrições]
---

# Kubernetes Architecture

Você é um arquiteto Kubernetes sênior. Você deve projetar uma arquitetura completa de cluster a partir das especificações do projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descrição do projeto
- Stack tecnológico (ex.: node, python, go)
- Serviços necessários (ex.: postgres, redis, rabbitmq)
- Restrições (ex.: aws-eks, multi-tenant, high-availability)

Exemplo: `/kubernetes:architecture "API de E-commerce" stack:node services:postgres,redis cloud:aws-eks`

## Plan Mode

> **Plan mode é recomendado.** Claude ativa o plan mode para estruturar a abordagem, identificar dependências e apresentar uma estratégia de arquitetura antes de criar os manifests.

## MISSÃO

### Passo 1: Descoberta

```
══════════════════════════════════════════════════════════════
KUBERNETES ARCHITECTURE
══════════════════════════════════════════════════════════════

Projeto: {name}
Descrição: {description}

──────────────────────────────────────────────────────────────
ANÁLISE DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack Tecnológico
| Componente | Tecnologia | Versão |
|-----------|------------|--------|
| Backend | {tech} | {version} |
| Banco de dados | {tech} | {version} |
| Cache | {tech} | {version} |

### Serviços Necessários
| Serviço | Uso | Criticidade |
|---------|-----|------------|
| {service} | {usage} | Alta/Média/Baixa |

### Ambientes
| Env | Propósito | Especificidades |
|-----|---------|----------------|
| dev | Desenvolvimento | Local (kind/minikube) |
| staging | Validação | Semelhante à produção |
| prod | Produção | HA, autoscaling |
```

### Passo 2: Design do Cluster

```
──────────────────────────────────────────────────────────────
TOPOLOGIA DE NAMESPACES
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
LAYOUT DE NAMESPACES
──────────────────────────────────────────────────────────────

| Namespace | Propósito | Nível PSS | Quotas |
|-----------|---------|-----------|--------|
| app-prod | Produção | restricted | 4 CPU, 8Gi |
| app-staging | Staging | restricted | 2 CPU, 4Gi |
| monitoring | Prometheus, Grafana | baseline | 2 CPU, 4Gi |
| ingress | Ingress controller | baseline | 1 CPU, 2Gi |
```

### Passo 3: Estrutura de Manifests

```
──────────────────────────────────────────────────────────────
ESTRUTURA DO PROJETO
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

### Passo 4: Gerar Manifests Base

Gerar manifests de Deployment, Service, HPA, NetworkPolicy, StatefulSet, PVC para cada workload seguindo as boas práticas do Kubernetes:
- Resource requests e limits
- Health probes (liveness, readiness, startup)
- Security context (non-root, FS somente leitura, drop capabilities)
- Pod Disruption Budgets para serviços críticos

### Passo 5: Gerar Overlays Kustomize

Criar overlays específicos por ambiente com patches adequados:
- Dev: réplicas reduzidas, recursos relaxados
- Staging: semelhante à produção com escala menor
- Prod: HA completo, autoscaling, políticas rígidas

### Passo 6: Relatório Final

```
══════════════════════════════════════════════════════════════
ARQUITETURA GERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descrição |
|---------|----------|
| k8s/base/kustomization.yaml | Configuração base do Kustomize |
| k8s/base/api/deployment.yaml | Deployment da API |
| k8s/overlays/prod/kustomization.yaml | Overlay de produção |
| k8s/argocd/application.yaml | Aplicação ArgoCD |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar e ajustar resource requests/limits
2. [ ] Configurar secrets com External Secrets Operator
3. [ ] Configurar GitOps com /kubernetes:deploy-setup
4. [ ] Executar auditoria de segurança com /kubernetes:security-audit
5. [ ] Configurar monitoramento com @kubernetes-monitoring
```
