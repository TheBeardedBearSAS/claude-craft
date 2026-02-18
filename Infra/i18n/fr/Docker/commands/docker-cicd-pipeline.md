---
description: Pipeline CI/CD Docker
argument-hint: [arguments]
---

# Pipeline CI/CD Docker

Tu es un expert en CI/CD Docker. Tu dois générer un pipeline complet pour build, test, scan et déploiement d'images Docker.

## Arguments
$ARGUMENTS

Arguments :
- Plateforme CI : github, gitlab, circleci
- Registry : ghcr, ecr, gcr, dockerhub, harbor
- Environnements : dev, staging, prod

Exemple : `/docker:cicd-pipeline github ghcr envs:staging,prod`

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## MISSION

### Étape 1 : Analyser les Besoins

```
══════════════════════════════════════════════════════════════
🚀 CONFIGURATION CI/CD DOCKER
══════════════════════════════════════════════════════════════

Plateforme : {github|gitlab|circleci}
Registry : {registry}
Environnements : {liste}

──────────────────────────────────────────────────────────────
📋 ARCHITECTURE PIPELINE
──────────────────────────────────────────────────────────────

┌─────────┬──────────┬──────────┬──────────┬─────────────┐
│  BUILD  │   TEST   │   SCAN   │   PUSH   │   DEPLOY    │
├─────────┼──────────┼──────────┼──────────┼─────────────┤
│ Lint    │ Unit     │ Trivy    │ Tag      │ Staging     │
│ Build   │ Integ    │ SBOM     │ Push     │ Prod        │
│ Cache   │ E2E      │ Sign     │ Manifest │ Rollback    │
└─────────┴──────────┴──────────┴──────────┴─────────────┘
```

### Étape 2 : Générer le Pipeline

#### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ═══════════════════════════════════════════════════════════
  # BUILD & TEST
  # ═══════════════════════════════════════════════════════════
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      security-events: write

    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix=

      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: true
          sbom: true

  # ═══════════════════════════════════════════════════════════
  # SECURITY SCAN
  # ═══════════════════════════════════════════════════════════
  scan:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'

    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ needs.build.outputs.image-digest }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  # ═══════════════════════════════════════════════════════════
  # DEPLOY STAGING
  # ═══════════════════════════════════════════════════════════
  deploy-staging:
    needs: [build, scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - name: Deploy to Staging
        run: |
          echo "Deploying ${{ needs.build.outputs.image-digest }} to staging"
          # Ajouter ici les commandes de déploiement
          # kubectl set image deployment/app app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ needs.build.outputs.image-digest }}

  # ═══════════════════════════════════════════════════════════
  # DEPLOY PRODUCTION
  # ═══════════════════════════════════════════════════════════
  deploy-prod:
    needs: [build, scan]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Deploy to Production
        run: |
          echo "Deploying ${{ needs.build.outputs.image-digest }} to production"
          # Ajouter ici les commandes de déploiement
```

#### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - scan
  - push
  - deploy

variables:
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  IMAGE_LATEST: $CI_REGISTRY_IMAGE:latest

# ═══════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════
build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build --cache-from $IMAGE_LATEST -t $IMAGE_TAG -t $IMAGE_LATEST .
    - docker push $IMAGE_TAG
    - docker push $IMAGE_LATEST
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ═══════════════════════════════════════════════════════════
# TEST
# ═══════════════════════════════════════════════════════════
test:
  stage: test
  image: $IMAGE_TAG
  script:
    - npm test
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ═══════════════════════════════════════════════════════════
# SECURITY SCAN
# ═══════════════════════════════════════════════════════════
scan:
  stage: scan
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image --exit-code 1 --severity CRITICAL,HIGH $IMAGE_TAG
  allow_failure: false
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ═══════════════════════════════════════════════════════════
# DEPLOY STAGING
# ═══════════════════════════════════════════════════════════
deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
    # Commandes de déploiement
  environment:
    name: staging
    url: https://staging.example.com
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ═══════════════════════════════════════════════════════════
# DEPLOY PRODUCTION
# ═══════════════════════════════════════════════════════════
deploy_prod:
  stage: deploy
  script:
    - echo "Deploying to production..."
    # Commandes de déploiement
  environment:
    name: production
    url: https://example.com
  when: manual
  rules:
    - if: $CI_COMMIT_TAG =~ /^v.*/
```

### Étape 3 : Variables et Secrets

```
──────────────────────────────────────────────────────────────
🔐 VARIABLES À CONFIGURER
──────────────────────────────────────────────────────────────

### GitHub Actions (Settings > Secrets)
| Variable | Description | Exemple |
|----------|-------------|---------|
| GITHUB_TOKEN | Auto-fourni | - |
| DOCKERHUB_TOKEN | Si DockerHub | xxx |
| KUBECONFIG | Si K8s | base64 encoded |

### GitLab CI (Settings > CI/CD > Variables)
| Variable | Description | Type |
|----------|-------------|------|
| CI_REGISTRY_* | Auto-fourni | - |
| KUBECONFIG | Si K8s | File |
| DEPLOY_TOKEN | Token deploy | Masked |
```

### Étape 4 : Rapport Final

```
══════════════════════════════════════════════════════════════
📊 PIPELINE GÉNÉRÉ
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📁 FICHIERS CRÉÉS
──────────────────────────────────────────────────────────────

✅ .github/workflows/docker.yml   # (ou .gitlab-ci.yml)

──────────────────────────────────────────────────────────────
🔄 FLOW DU PIPELINE
──────────────────────────────────────────────────────────────

Push/PR → Build → Test → Scan → [Pass?]
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
               [main branch]              [tag v*.*.*]
                    │                           │
                    ▼                           ▼
               Staging                     Production
              (auto)                       (manual)

──────────────────────────────────────────────────────────────
⚙️ CONFIGURATION REQUISE
──────────────────────────────────────────────────────────────

1. Configurer les secrets dans les settings CI
2. Créer les environnements (staging, production)
3. Ajouter les règles de protection si nécessaire
4. Configurer les notifications (Slack, email)

──────────────────────────────────────────────────────────────
🎯 STRATÉGIE DE ROLLBACK
──────────────────────────────────────────────────────────────

# Revenir à la version précédente
docker pull registry/image:previous-sha
docker tag registry/image:previous-sha registry/image:latest
docker push registry/image:latest

# Ou via kubectl
kubectl rollout undo deployment/app
```
