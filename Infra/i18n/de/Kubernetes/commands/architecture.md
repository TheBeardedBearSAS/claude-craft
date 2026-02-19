---
description: Vollstandige Kubernetes-Architektur entwerfen
argument-hint: <Projekt> [Einschrankungen]
---

# Kubernetes Architecture

Sie sind ein erfahrener Kubernetes-Architect. Sie mussen eine vollstandige Cluster-Architektur aus Projektspezifikationen entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Projektbeschreibung
- Tech-Stack (z.B. node, python, go)
- Benotigte Services (z.B. postgres, redis, rabbitmq)
- Einschrankungen (z.B. aws-eks, multi-tenant, high-availability)

Beispiel: `/kubernetes:architecture "E-Commerce API" stack:node services:postgres,redis cloud:aws-eks`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Abhangigkeiten zu identifizieren und eine Architekturstrategie vorzustellen, bevor Manifeste erstellt werden.

## AUFTRAG

### Schritt 1: Ermittlung

```
══════════════════════════════════════════════════════════════
KUBERNETES ARCHITEKTUR
══════════════════════════════════════════════════════════════

Projekt: {name}
Beschreibung: {description}

──────────────────────────────────────────────────────────────
ANFORDERUNGSANALYSE
──────────────────────────────────────────────────────────────

### Tech-Stack
| Komponente | Technologie | Version |
|------------|-------------|---------|
| Backend | {tech} | {version} |
| Datenbank | {tech} | {version} |
| Cache | {tech} | {version} |

### Benotigte Services
| Service | Verwendung | Kritikalitat |
|---------|------------|--------------|
| {service} | {usage} | Hoch/Mittel/Niedrig |

### Umgebungen
| Umgebung | Zweck | Besonderheiten |
|----------|-------|----------------|
| dev | Entwicklung | Lokal (kind/minikube) |
| staging | Validierung | Produktionsahnlich |
| prod | Produktion | HA, Autoscaling |
```

### Schritt 2: Cluster-Design

```
──────────────────────────────────────────────────────────────
NAMESPACE-TOPOLOGIE
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
NAMESPACE-LAYOUT
──────────────────────────────────────────────────────────────

| Namespace | Zweck | PSS-Level | Quoten |
|-----------|-------|-----------|--------|
| app-prod | Produktion | restricted | 4 CPU, 8Gi |
| app-staging | Staging | restricted | 2 CPU, 4Gi |
| monitoring | Prometheus, Grafana | baseline | 2 CPU, 4Gi |
| ingress | Ingress-Controller | baseline | 1 CPU, 2Gi |
```

### Schritt 3: Manifest-Struktur

```
──────────────────────────────────────────────────────────────
PROJEKTSTRUKTUR
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

### Schritt 4: Basis-Manifeste generieren

Deployment-, Service-, HPA-, NetworkPolicy-, StatefulSet- und PVC-Manifeste fur jeden Workload nach Kubernetes-Best-Practices generieren:
- Ressourcenanforderungen und -limits
- Health-Probes (Liveness, Readiness, Startup)
- Sicherheitskontext (Nicht-Root, schreibgeschutztes FS, Capabilities entfernen)
- Pod Disruption Budgets fur kritische Services

### Schritt 5: Kustomize-Overlays generieren

Umgebungsspezifische Overlays mit passenden Patches erstellen:
- Dev: reduzierte Replicas, lockere Ressourcen
- Staging: Produktionsahnlich mit geringerer Skalierung
- Prod: Volles HA, Autoscaling, strikte Richtlinien

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
GENERIERTE ARCHITEKTUR
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|--------------|
| k8s/base/kustomization.yaml | Basis-Kustomize-Konfiguration |
| k8s/base/api/deployment.yaml | API-Deployment |
| k8s/overlays/prod/kustomization.yaml | Produktions-Overlay |
| k8s/argocd/application.yaml | ArgoCD-Anwendung |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Ressourcenanforderungen/-limits prufen und anpassen
2. [ ] Secrets mit External Secrets Operator konfigurieren
3. [ ] GitOps mit /kubernetes:deploy-setup einrichten
4. [ ] Sicherheitsaudit mit /kubernetes:security-audit durchfuhren
5. [ ] Monitoring mit @kubernetes-monitoring konfigurieren
```
