---
description: Pipeline CI/CD Docker
argument-hint: [arguments]
---

# Pipeline CI/CD Docker

Eres un experto en CI/CD Docker. Debes generar un pipeline completo para construir, probar, escanear y desplegar imágenes Docker.

## Argumentos
$ARGUMENTS

Argumentos:
- Plataforma CI: github, gitlab, circleci
- Registry: ghcr, ecr, gcr, dockerhub, harbor
- Entornos: dev, staging, prod

Ejemplo: `/docker:cicd-pipeline github ghcr envs:staging,prod`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Analizar Requisitos

```
══════════════════════════════════════════════════════════════
🚀 CONFIGURACIÓN CI/CD DOCKER
══════════════════════════════════════════════════════════════

Plataforma: {github|gitlab|circleci}
Registry: {registry}
Entornos: {lista}

──────────────────────────────────────────────────────────────
📋 ARQUITECTURA DEL PIPELINE
──────────────────────────────────────────────────────────────

┌─────────┬──────────┬──────────┬──────────┬─────────────┐
│  BUILD  │   TEST   │   SCAN   │   PUSH   │   DEPLOY    │
├─────────┼──────────┼──────────┼──────────┼─────────────┤
│ Lint    │ Unit     │ Trivy    │ Tag      │ Staging     │
│ Build   │ Integ    │ SBOM     │ Push     │ Prod        │
│ Cache   │ E2E      │ Sign     │ Manifest │ Rollback    │
└─────────┴──────────┴──────────┴──────────┴─────────────┘
```

### Paso 2: Generar Pipeline

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
          echo "Desplegando ${{ needs.build.outputs.image-digest }} a staging"
          # Añadir comandos de despliegue aquí

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
          echo "Desplegando ${{ needs.build.outputs.image-digest }} a producción"
          # Añadir comandos de despliegue aquí
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
    - echo "Desplegando a staging..."
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
    - echo "Desplegando a producción..."
  environment:
    name: production
    url: https://example.com
  when: manual
  rules:
    - if: $CI_COMMIT_TAG =~ /^v.*/
```

### Paso 3: Variables y Secrets

```
──────────────────────────────────────────────────────────────
🔐 VARIABLES A CONFIGURAR
──────────────────────────────────────────────────────────────

### GitHub Actions (Settings > Secrets)
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| GITHUB_TOKEN | Proporcionado automáticamente | - |
| DOCKERHUB_TOKEN | Si usa DockerHub | xxx |
| KUBECONFIG | Si usa K8s | base64 encoded |

### GitLab CI (Settings > CI/CD > Variables)
| Variable | Descripción | Tipo |
|----------|-------------|------|
| CI_REGISTRY_* | Proporcionado automáticamente | - |
| KUBECONFIG | Si usa K8s | File |
| DEPLOY_TOKEN | Token de despliegue | Masked |
```

### Paso 4: Reporte Final

```
══════════════════════════════════════════════════════════════
📊 PIPELINE GENERADO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📁 ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

✅ .github/workflows/docker.yml   # (o .gitlab-ci.yml)

──────────────────────────────────────────────────────────────
🔄 FLUJO DEL PIPELINE
──────────────────────────────────────────────────────────────

Push/PR → Build → Test → Scan → [¿Pasa?]
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
               [rama main]               [tag v*.*.*]
                    │                           │
                    ▼                           ▼
               Staging                     Producción
              (auto)                       (manual)

──────────────────────────────────────────────────────────────
⚙️ CONFIGURACIÓN REQUERIDA
──────────────────────────────────────────────────────────────

1. Configurar secrets en ajustes del CI
2. Crear entornos (staging, production)
3. Añadir reglas de protección si es necesario
4. Configurar notificaciones (Slack, email)

──────────────────────────────────────────────────────────────
🎯 ESTRATEGIA DE ROLLBACK
──────────────────────────────────────────────────────────────

# Revertir a versión anterior
docker pull registry/image:previous-sha
docker tag registry/image:previous-sha registry/image:latest
docker push registry/image:latest

# O vía kubectl
kubectl rollout undo deployment/app
```
