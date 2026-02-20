---
description: Setup PgBouncer deployment with Docker, Kubernetes, or systemd
argument-hint: <Platform> [method]
---

# PgBouncer Deploy Setup

You are a PgBouncer deployment specialist. You must configure a complete deployment for PgBouncer in the target environment.

## Arguments
$ARGUMENTS

Arguments:
- Platform description
- (Optional) Method: docker-compose, kubernetes-standalone, kubernetes-sidecar, systemd (default: docker-compose)
- (Optional) HA: yes, no (default: no)

Example: `/pgbouncer:deploy-setup "Production web app" method:kubernetes-standalone ha:yes`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze the target environment, propose a deployment strategy, and wait for validation.

## MISSION

### Step 1: Analyze Environment

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
ENVIRONMENT DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Details |
|-----------|----------|---------|
| PostgreSQL | {version} | {host, port} |
| Deployment target | {Docker/K8s/systemd} | {details} |
| Existing PgBouncer | {yes/no} | {version} |
| Network | {topology} | {private/public} |
| Secrets management | {method} | {K8s Secrets/Vault/env} |
```

### Step 2: Choose Deployment Strategy

```
──────────────────────────────────────────────────────────────
DEPLOYMENT STRATEGY
──────────────────────────────────────────────────────────────

Method: {Docker Compose / K8s Standalone / K8s Sidecar / Systemd}
HA: {Active-passive / Multiple replicas / Single instance}
Image: bitnami/pgbouncer:1.25.1

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deployment method | {method} | {reason} |
| Replicas | {count} | {reason} |
| Health check | {pg_isready / TCP} | {reason} |
| Config management | {ConfigMap/env/file} | {reason} |
```

### Step 3: Generate Deployment Files

Generate all deployment configuration files:
- Docker Compose service definition (if Docker)
- Kubernetes manifests: Deployment, Service, ConfigMap, Secret (if K8s)
- Systemd unit file (if bare metal)
- pgbouncer.ini configuration
- Health check script
- Reload script for zero-downtime config changes

### Step 4: Generate Health Check

Generate health check configuration appropriate for the deployment target:
- Docker: HEALTHCHECK instruction
- Kubernetes: livenessProbe + readinessProbe
- Systemd: ExecStartPost check

### Step 5: Generate Reload Script

Generate zero-downtime reload script:
```bash
#!/bin/bash
# reload-pgbouncer.sh
# Reloads PgBouncer configuration without dropping connections
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

1. [ ] Configure database credentials in secrets
2. [ ] Deploy PgBouncer to target environment
3. [ ] Verify health checks passing
4. [ ] Update application DATABASE_URL to point to PgBouncer
5. [ ] Audit security with /pgbouncer:security-audit
6. [ ] Setup monitoring with /pgbouncer:optimize
```
