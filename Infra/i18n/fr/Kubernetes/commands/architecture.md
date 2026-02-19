---
description: Concevoir une architecture Kubernetes complète
argument-hint: <Projet> [contraintes]
---

# Kubernetes Architecture

Vous êtes un architecte Kubernetes senior. Vous devez concevoir une architecture de cluster complète à partir des spécifications du projet.

## Arguments
$ARGUMENTS

Arguments :
- Description du projet
- Stack technique (ex. : node, python, go)
- Services requis (ex. : postgres, redis, rabbitmq)
- Contraintes (ex. : aws-eks, multi-tenant, haute-disponibilité)

Exemple : `/kubernetes:architecture "API E-commerce" stack:node services:postgres,redis cloud:aws-eks`

## Plan Mode

> **Le plan mode est recommandé.** Claude active le plan mode pour structurer l'approche, identifier les dépendances et présenter une stratégie d'architecture avant de créer les manifestes.

## MISSION

### Étape 1 : Découverte

```
══════════════════════════════════════════════════════════════
ARCHITECTURE KUBERNETES
══════════════════════════════════════════════════════════════

Projet : {name}
Description : {description}

──────────────────────────────────────────────────────────────
ANALYSE DES EXIGENCES
──────────────────────────────────────────────────────────────

### Stack Technique
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | {tech} | {version} |
| Base de données | {tech} | {version} |
| Cache | {tech} | {version} |

### Services Requis
| Service | Usage | Criticité |
|---------|-------|-----------|
| {service} | {usage} | Haute/Moyenne/Faible |

### Environnements
| Env | Rôle | Spécificités |
|-----|------|--------------|
| dev | Développement | Local (kind/minikube) |
| staging | Validation | Similaire à la production |
| prod | Production | HA, autoscaling |
```

### Étape 2 : Conception du Cluster

```
──────────────────────────────────────────────────────────────
TOPOLOGIE DES NAMESPACES
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                      COUCHE INGRESS                          │
│  ┌───────────────┐         ┌───────────────┐                │
│  │ Ingress NGINX │─────────│  Cert-Manager │                │
│  └───────┬───────┘         └───────────────┘                │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                   COUCHE APPLICATION                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   API    │────│ Workers  │────│ Frontend │              │
│  │(Deploy)  │    │ (Deploy) │    │ (Deploy) │              │
│  └──────────┘    └──────────┘    └──────────┘              │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                      COUCHE DONNÉES                          │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Redis   │  │  RabbitMQ    │          │
│  │(StatefulSet) │  │ (Deploy) │  │(StatefulSet) │          │
│  └──────────────┘  └──────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
ORGANISATION DES NAMESPACES
──────────────────────────────────────────────────────────────

| Namespace | Rôle | Niveau PSS | Quotas |
|-----------|------|------------|--------|
| app-prod | Production | restricted | 4 CPU, 8Gi |
| app-staging | Staging | restricted | 2 CPU, 4Gi |
| monitoring | Prometheus, Grafana | baseline | 2 CPU, 4Gi |
| ingress | Contrôleur Ingress | baseline | 1 CPU, 2Gi |
```

### Étape 3 : Structure des Manifestes

```
──────────────────────────────────────────────────────────────
STRUCTURE DU PROJET
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

### Étape 4 : Générer les Manifestes de Base

Générer les manifestes Deployment, Service, HPA, NetworkPolicy, StatefulSet, PVC pour chaque workload en suivant les bonnes pratiques Kubernetes :
- Requests et limits de ressources
- Probes de santé (liveness, readiness, startup)
- Contexte de sécurité (sans root, FS en lecture seule, suppression de capabilities)
- Pod Disruption Budgets pour les services critiques

### Étape 5 : Générer les Overlays Kustomize

Créer des overlays spécifiques à chaque environnement avec les patches appropriés :
- Dev : réplicas réduits, ressources allégées
- Staging : similaire à la production avec une échelle inférieure
- Prod : HA complète, autoscaling, politiques strictes

### Étape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
ARCHITECTURE GÉNÉRÉE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CRÉÉS
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| k8s/base/kustomization.yaml | Configuration Kustomize de base |
| k8s/base/api/deployment.yaml | Déploiement API |
| k8s/overlays/prod/kustomization.yaml | Overlay de production |
| k8s/argocd/application.yaml | Application ArgoCD |

──────────────────────────────────────────────────────────────
PROCHAINES ÉTAPES
──────────────────────────────────────────────────────────────

1. [ ] Revoir et ajuster les requests/limits de ressources
2. [ ] Configurer les secrets avec External Secrets Operator
3. [ ] Mettre en place le GitOps avec /kubernetes:deploy-setup
4. [ ] Lancer l'audit de sécurité avec /kubernetes:security-audit
5. [ ] Configurer le monitoring avec @kubernetes-monitoring
```
