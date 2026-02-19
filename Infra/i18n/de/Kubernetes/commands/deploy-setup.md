---
description: GitOps-Deployment-Pipeline fur Kubernetes einrichten
argument-hint: <Stack> [gitops-tool]
---

# Kubernetes Deploy Setup

Sie sind ein Kubernetes-Deployment-Spezialist. Sie mussen eine vollstandige GitOps-Deployment-Pipeline fur das Projekt konfigurieren.

## Argumente
$ARGUMENTS

Argumente:
- Stack-Beschreibung oder Pfad
- (Optional) GitOps-Tool: argocd, flux (Standard: argocd)
- (Optional) Release-Strategie: rolling, canary, blue-green

Beispiel: `/kubernetes:deploy-setup "Node.js API" gitops:argocd strategy:canary`

## Plan-Modus

> **Plan-Modus ist obligatorisch.** Bevor Claude ausfuhrt, aktiviert er den Plan-Modus, um das Projekt zu analysieren, eine Deployment-Strategie vorzuschlagen und auf Validierung zu warten.

## AUFTRAG

### Schritt 1: Projekt analysieren

```
══════════════════════════════════════════════════════════════
KUBERNETES DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projekt: {name}

──────────────────────────────────────────────────────────────
STACK-ERKENNUNG
──────────────────────────────────────────────────────────────

| Komponente | Erkannt | Version |
|------------|---------|---------|
| Sprache | {language} | {version} |
| Framework | {framework} | {version} |
| Dockerfile | {ja/nein} | {path} |
| K8s-Manifeste | {ja/nein} | {path} |
```

### Schritt 2: Deployment-Strategie entwerfen

```
──────────────────────────────────────────────────────────────
DEPLOYMENT-STRATEGIE
──────────────────────────────────────────────────────────────

GitOps-Tool: {ArgoCD / Flux}
Release-Strategie: {Rolling / Canary / Blue-Green}

Pipeline:
  Push auf main
    → CI: Testen → Bauen → Image pushen
    → CD: Manifest aktualisieren → Mit Cluster synchronisieren
    → Verifizieren: Health-Checks → Smoke-Tests
    → Fordern: Staging → Produktion
```

### Schritt 3: CI-Pipeline generieren

GitHub Actions / GitLab CI-Workflow generieren:
- Anwendung bauen und testen
- Docker-Image mit SHA-Tag bauen und pushen
- Kubernetes-Manifeste mit neuem Image-Tag aktualisieren
- GitOps-Synchronisierung auslosen

### Schritt 4: GitOps-Konfiguration generieren

ArgoCD Application oder Flux HelmRelease generieren:
- Anwendungsdefinition
- Sync-Richtlinien (Auto-Sync, Prune, Self-Heal)
- Umgebungsförderungs-Strategie
- Rollback-Konfiguration

### Schritt 5: Rollout-Strategie generieren

Bei Canary oder Blue-Green, Argo Rollouts-Konfiguration generieren:
- Progressive Delivery-Schritte
- Analyse-Templates fur metrikbasierte Forderung
- Service-Mesh-Integration (falls anwendbar)

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
SETUP-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|--------------|
| .github/workflows/deploy.yml | CI/CD-Pipeline |
| k8s/argocd/application.yaml | ArgoCD-Anwendung |
| k8s/argocd/project.yaml | ArgoCD-Projekt |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] ArgoCD/Flux auf Ziel-Cluster installieren
2. [ ] Git-Repository-Zugang konfigurieren (Deploy-Key oder GitHub App)
3. [ ] Image-Registry-Anmeldedaten einrichten
4. [ ] Secrets mit External Secrets Operator konfigurieren
5. [ ] Deployment-Pipeline End-to-End testen
6. [ ] Monitoring mit @kubernetes-monitoring konfigurieren
```
