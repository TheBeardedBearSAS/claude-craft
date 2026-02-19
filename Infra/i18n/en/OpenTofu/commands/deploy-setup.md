---
description: Setup CI/CD pipeline for OpenTofu
argument-hint: <Platform> [environments]
---

# OpenTofu Deploy Setup

You are an OpenTofu deployment specialist. You must configure a complete CI/CD pipeline for safe infrastructure deployment.

## Arguments
$ARGUMENTS

Arguments:
- CI/CD platform (github-actions, gitlab-ci)
- (Optional) Environments: dev,staging,prod
- (Optional) Approval strategy: manual, auto-dev-manual-prod

Example: `/opentofu:deploy-setup "github-actions" envs:dev,staging,prod approval:manual-prod`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze the project, propose a deployment strategy, and wait for validation.

## MISSION

### Step 1: Analyze Project

```
══════════════════════════════════════════════════════════════
OPENTOFU DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
PROJECT DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Details |
|-----------|----------|---------|
| OpenTofu version | {version} | versions.tf |
| Backend | {type} | {S3/GCS/Azure} |
| Environments | {count} | {list} |
| State encryption | {yes/no} | {method} |
| Modules | {count} | {list} |
```

### Step 2: Design Pipeline Strategy

```
──────────────────────────────────────────────────────────────
PIPELINE STRATEGY
──────────────────────────────────────────────────────────────

Platform: {GitHub Actions / GitLab CI}
Approval: {auto-dev / manual-staging / manual-prod}

Pipeline:
  PR opened
    -> Validate (fmt, validate)
    -> Plan (per environment)
    -> Comment PR with plan output

  PR merged to main
    -> Plan (saved artifact)
    -> Apply dev (auto)
    -> Apply staging (auto/manual)
    -> Apply prod (manual approval)
```

### Step 3: Generate CI/CD Pipeline

Generate complete pipeline configuration with:
- OpenTofu setup step (`opentofu/setup-opentofu@v1`)
- Init, plan, apply stages
- Plan artifact for safe applies
- PR comment with plan output
- Environment approval gates
- OIDC authentication (no long-lived secrets)

### Step 4: Generate Drift Detection

Generate scheduled drift detection workflow:
- Cron-based execution (e.g., weekday mornings)
- Plan with `-detailed-exitcode`
- Notification on drift detected

### Step 5: Generate Rollback Procedure

Document rollback strategy:
- State versioning and restore
- Targeted destroy for new resources
- Manual intervention procedures

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
| .github/workflows/tofu-plan.yml | PR plan workflow |
| .github/workflows/tofu-apply.yml | Apply workflow |
| .github/workflows/tofu-drift.yml | Drift detection |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Configure OIDC provider in cloud account
2. [ ] Create IAM roles for plan and apply
3. [ ] Set GitHub environment protection rules
4. [ ] Test pipeline with a no-op change
5. [ ] Configure monitoring with drift detection
```
