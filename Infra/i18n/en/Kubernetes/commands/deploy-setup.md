---
description: Setup GitOps deployment pipeline for Kubernetes
argument-hint: <Stack> [gitops-tool]
---

# Kubernetes Deploy Setup

You are a Kubernetes deployment specialist. You must configure a complete GitOps deployment pipeline for the project.

## Arguments
$ARGUMENTS

Arguments:
- Stack description or path
- (Optional) GitOps tool: argocd, flux (default: argocd)
- (Optional) Release strategy: rolling, canary, blue-green

Example: `/kubernetes:deploy-setup "Node.js API" gitops:argocd strategy:canary`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze the project, propose a deployment strategy, and wait for validation.

## MISSION

### Step 1: Analyze Project

```
══════════════════════════════════════════════════════════════
KUBERNETES DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
STACK DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Version |
|-----------|----------|---------|
| Language | {language} | {version} |
| Framework | {framework} | {version} |
| Dockerfile | {yes/no} | {path} |
| K8s manifests | {yes/no} | {path} |
```

### Step 2: Design Deployment Strategy

```
──────────────────────────────────────────────────────────────
DEPLOYMENT STRATEGY
──────────────────────────────────────────────────────────────

GitOps Tool: {ArgoCD / Flux}
Release Strategy: {Rolling / Canary / Blue-Green}

Pipeline:
  Push to main
    → CI: Test → Build → Push image
    → CD: Update manifest → Sync to cluster
    → Verify: Health checks → Smoke tests
    → Promote: Staging → Production
```

### Step 3: Generate CI Pipeline

Generate GitHub Actions / GitLab CI workflow:
- Build and test application
- Build and push Docker image with SHA tag
- Update Kubernetes manifests with new image tag
- Trigger GitOps sync

### Step 4: Generate GitOps Configuration

Generate ArgoCD Application or Flux HelmRelease:
- Application definition
- Sync policies (auto-sync, prune, self-heal)
- Environment promotion strategy
- Rollback configuration

### Step 5: Generate Rollout Strategy

If canary or blue-green, generate Argo Rollouts configuration:
- Progressive delivery steps
- Analysis templates for metric-based promotion
- Service mesh integration (if applicable)

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
SETUP REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| .github/workflows/deploy.yml | CI/CD pipeline |
| k8s/argocd/application.yaml | ArgoCD application |
| k8s/argocd/project.yaml | ArgoCD project |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Install ArgoCD/Flux on target cluster
2. [ ] Configure Git repository access (deploy key or GitHub App)
3. [ ] Set up image registry credentials
4. [ ] Configure secrets with External Secrets Operator
5. [ ] Test deployment pipeline end-to-end
6. [ ] Configure monitoring with @kubernetes-monitoring
```
