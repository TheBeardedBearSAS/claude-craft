---
description: Generate FrankenPHP deployment files for Docker, Kubernetes, or standalone
argument-hint: <Platform> [method]
---

# FrankenPHP Deploy Setup

You are a FrankenPHP deployment specialist. You must configure a complete deployment for FrankenPHP in the target environment.

## Arguments
$ARGUMENTS

Arguments:
- Platform description
- (Optional) Method: docker-compose, kubernetes, standalone-binary (default: docker-compose)
- (Optional) Framework: symfony, laravel, php (default: auto-detect)

Example: `/frankenphp:deploy-setup "Production API" method:kubernetes framework:symfony`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze the target environment, propose a deployment strategy, and wait for validation.

## MISSION

### Step 1: Analyze Environment

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
ENVIRONMENT DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Details |
|-----------|----------|---------|
| PHP Framework | {Symfony/Laravel/PHP} | {version} |
| Deployment target | {Docker/K8s/standalone} | {details} |
| Existing FrankenPHP | {yes/no} | {version} |
| TLS strategy | {auto/proxy/manual} | {details} |
| Secrets management | {method} | {K8s Secrets/Vault/env} |
```

### Step 2: Choose Deployment Strategy

```
──────────────────────────────────────────────────────────────
DEPLOYMENT STRATEGY
──────────────────────────────────────────────────────────────

Method: {Docker Compose / Kubernetes / Standalone Binary}
Image: dunglas/frankenphp:1.11-php8.5-bookworm
Worker mode: {yes/no}

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deployment method | {method} | {reason} |
| Replicas | {count} | {reason} |
| Health check | {HTTP /healthz} | {reason} |
| TLS termination | {FrankenPHP/proxy} | {reason} |
```

### Step 3: Generate Deployment Files

Generate all deployment configuration files:
- Dockerfile (multi-stage, production-optimized)
- docker-compose.yml (if Docker method)
- Kubernetes manifests: Deployment, Service, HPA (if K8s method)
- Caddyfile for the environment
- PHP configuration (opcache, security)
- Health check endpoint

### Step 4: Generate Health Check

Generate health check appropriate for the deployment target:
- Docker: HEALTHCHECK instruction
- Kubernetes: livenessProbe + readinessProbe (HTTP)
- Standalone: systemd check

### Step 5: Generate Reload Script

Generate zero-downtime reload script:
```bash
#!/bin/bash
# reload-frankenphp.sh
# Reloads FrankenPHP workers without dropping connections (SIGUSR1)
```

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
| {file} | {description} |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Configure environment variables (SERVER_NAME, secrets)
2. [ ] Build and deploy FrankenPHP image
3. [ ] Verify health checks passing
4. [ ] Audit security with /frankenphp:security-audit
5. [ ] Optimize performance with /frankenphp:optimize
```
