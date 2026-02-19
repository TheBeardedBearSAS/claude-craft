---
description: Design complete OpenTofu IaC architecture
argument-hint: <Project> [cloud-provider] [constraints]
---

# OpenTofu Architecture

You are a senior OpenTofu architect. You must design a complete Infrastructure as Code architecture from project specifications.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Cloud provider (e.g., aws, gcp, azure, multi-cloud)
- Required services (e.g., compute, database, networking, storage)
- Constraints (e.g., multi-env, compliance, migration-from-terraform)

Example: `/opentofu:architecture "E-commerce Platform" cloud:aws services:ecs,rds,redis compliance:soc2`

## Plan Mode

> **Plan mode is recommended.** Claude activates plan mode to structure the approach, identify infrastructure components, and present an architecture strategy before creating configurations.

## MISSION

### Step 1: Discovery

```
══════════════════════════════════════════════════════════════
OPENTOFU ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Cloud Provider
| Provider | Region | Services |
|----------|--------|----------|
| {provider} | {region} | {services} |

### Required Infrastructure
| Component | Technology | Criticality |
|-----------|------------|-------------|
| {component} | {technology} | High/Medium/Low |

### Environments
| Env | Purpose | Specifics |
|-----|---------|-----------|
| dev | Development | Minimal resources |
| staging | Validation | Production-like |
| prod | Production | HA, encryption, monitoring |
```

### Step 2: Module Design

```
──────────────────────────────────────────────────────────────
MODULE ARCHITECTURE
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    NETWORKING MODULE                          │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │     VPC       │  │   Subnets     │  │ Security Groups│  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    COMPUTE MODULE                            │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  ECS/EKS/EC2  │  │  Auto-Scaling │  │  Load Balancer │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    DATA MODULE                               │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  RDS/Aurora   │  │  ElastiCache  │  │  S3 Storage    │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
MODULE LAYOUT
──────────────────────────────────────────────────────────────

| Module | Purpose | Key Resources |
|--------|---------|---------------|
| networking | VPC, subnets, SGs | aws_vpc, aws_subnet |
| compute | Application workloads | aws_ecs_service, aws_lb |
| database | Data persistence | aws_db_instance |
| monitoring | Observability | aws_cloudwatch_* |
```

### Step 3: Project Structure

```
──────────────────────────────────────────────────────────────
PROJECT STRUCTURE
──────────────────────────────────────────────────────────────

infra/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   └── monitoring/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── versions.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
└── shared/
    ├── providers.tf
    └── versions.tf
```

### Step 4: Generate Module Configurations

Generate module files with:
- Variables with type constraints and validation blocks
- Outputs for cross-module references
- Provider version pinning
- State encryption configuration (v1.7+)
- Security best practices (least privilege IAM, encryption at rest)

### Step 5: Generate Environment Configurations

Create environment-specific configurations:
- Dev: minimal resources, relaxed settings
- Staging: production-like, reduced scale
- Prod: full HA, encryption, monitoring, backups

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| infra/modules/networking/main.tf | VPC and networking |
| infra/modules/compute/main.tf | Application compute |
| infra/environments/prod/main.tf | Production config |
| infra/environments/prod/backend.tf | State backend with encryption |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review and adjust resource sizing per environment
2. [ ] Configure state encryption passphrase/KMS key
3. [ ] Setup CI/CD with /opentofu:deploy-setup
4. [ ] Run security audit with /opentofu:security-audit
5. [ ] Estimate costs with /opentofu:optimize
```
