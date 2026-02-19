---
description: Setup CI/CD pipeline for Hetzner Cloud deployments
argument-hint: <Platform> [ci-tool]
---

# Hcloud Deploy Setup

You are a Hetzner Cloud deployment specialist. You must configure a complete CI/CD pipeline for hcloud-based infrastructure deployments.

## Arguments
$ARGUMENTS

Arguments:
- Platform description
- (Optional) CI tool: github-actions, gitlab-ci (default: github-actions)
- (Optional) Strategy: blue-green, snapshot, rebuild (default: blue-green)

Example: `/hcloud:deploy-setup "Web platform" ci:github-actions strategy:blue-green`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze the project, propose a pipeline strategy, and wait for validation.

## MISSION

### Step 1: Analyze Project

```
══════════════════════════════════════════════════════════════
HCLOUD DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
INFRASTRUCTURE DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Details |
|-----------|----------|---------|
| Servers | {count} | {types, locations} |
| Networks | {count} | {names, subnets} |
| Load Balancers | {count} | {names} |
| Firewalls | {count} | {names} |
| Volumes | {count} | {sizes} |
| Floating IPs | {count} | {assigned/unassigned} |
| Snapshots | {count} | {latest date} |
```

### Step 2: Design Pipeline

```
──────────────────────────────────────────────────────────────
PIPELINE STRATEGY
──────────────────────────────────────────────────────────────

CI Tool: {GitHub Actions / GitLab CI}
Strategy: {Blue-Green / Snapshot / Rebuild}

Pipeline:
  Push / PR
    → Lint & Test (application code)
    → Build Image (Packer, optional)
    → Deploy Staging (auto)
    → Smoke Tests
    → Approval Gate
    → Deploy Production

──────────────────────────────────────────────────────────────
STRATEGY SELECTION
──────────────────────────────────────────────────────────────

| Stage | Tool | Trigger | Artifacts |
|-------|------|---------|-----------|
| Build | Packer / cloud-init | On push | Snapshot ID |
| Deploy Staging | hcloud CLI | On merge to main | Server status |
| Smoke Test | curl / health check | After staging | Test report |
| Deploy Prod | hcloud CLI | Manual approval | Server status |
```

### Step 3: Generate CI Pipeline

Generate the CI/CD configuration file:

For **GitHub Actions** (`.github/workflows/hcloud-deploy.yml`):
- Install hcloud CLI via `hetznercloud/setup-hcloud@v1`
- Build Packer image (optional) or use cloud-init
- Deploy to staging on merge to main
- Run health checks against staging
- Deploy to production with manual approval gate
- Blue-green: create new server, swap floating IP, delete old
- Use GitHub Secrets for `HCLOUD_TOKEN` per environment

For **GitLab CI** (`.gitlab-ci.yml`):
- Use stages: build, deploy-staging, test, deploy-prod
- Install hcloud CLI via curl/pip
- Use protected variables for HCLOUD_TOKEN

### Step 4: Generate Deployment Scripts

Generate deployment helper scripts:
- `scripts/deploy.sh` -- Main deployment script using hcloud CLI
- `scripts/rollback.sh` -- Rollback to previous snapshot
- `scripts/health-check.sh` -- Verify deployment health

### Step 5: Generate Packer Template (if image-based)

Generate `hcloud.pkr.hcl` Packer template for building golden images with the hcloud builder plugin.

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
| .github/workflows/hcloud-deploy.yml | CI/CD pipeline |
| scripts/deploy.sh | Deployment script |
| scripts/rollback.sh | Rollback script |
| scripts/health-check.sh | Health check script |
| hcloud.pkr.hcl | Packer template (if applicable) |
| cloud-init.yml | Server provisioning template |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Store HCLOUD_TOKEN in CI secrets (per environment)
2. [ ] Store SSH private key in CI secrets
3. [ ] Test pipeline end-to-end on a feature branch
4. [ ] Audit security posture with /hcloud:security-audit
5. [ ] Optimize costs with /hcloud:optimize
```
