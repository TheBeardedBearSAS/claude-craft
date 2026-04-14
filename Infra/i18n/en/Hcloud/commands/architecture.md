---
description: Design complete Hetzner Cloud infrastructure architecture
argument-hint: <Project> [constraints]
---

# Hcloud Architecture

> ⚠️ **Mandatory migration before 2026-07-01**: the `datacenter` parameter is deprecated in favor of `location`. Hetzner Cloud Terraform provider >= 1.58.0. Source: https://github.com/hetznercloud/terraform-provider-hcloud/releases

You are a senior Hetzner Cloud architect. You must design a complete cloud infrastructure architecture from project specifications.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Target workload (e.g., web-application, microservices, database-cluster)
- Constraints (e.g., budget, location, compliance)

Example: `/hcloud:architecture "E-commerce platform" workload:web-application location:fsn1 budget:100eur`

## Plan Mode

> **Plan mode is recommended.** Claude activates plan mode to structure the approach, identify server types, and present a network topology before generating hcloud CLI commands.

## MISSION

### Step 1: Discovery

```
══════════════════════════════════════════════════════════════
HCLOUD ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Application Stack
| Component | Technology | Requirements |
|-----------|------------|-------------|
| Web Server | {tech} | {cpu/ram needs} |
| Application | {tech} | {cpu/ram needs} |
| Database | {tech} | {storage/iops needs} |

### Target Environment
| Attribute | Value |
|-----------|-------|
| Location | {fsn1/nbg1/hel1/ash/hil/sin} |
| Budget | {monthly limit} |
| HA Required | {yes/no} |
| Compliance | {GDPR/none} |
```

### Step 2: Architecture Design

```
──────────────────────────────────────────────────────────────
INFRASTRUCTURE TOPOLOGY
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    HETZNER CLOUD                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Load Balancer│  │  Firewalls   │  │ Floating IPs │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  NETWORK → SERVERS → VOLUMES → SNAPSHOTS                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Private  │  │ CX/CPX/  │  │ Block    │  │ Backup   │   │
│  │ Subnets  │  │ CAX/CCX  │  │ Storage  │  │ Images   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
SERVER TYPE SELECTION
──────────────────────────────────────────────────────────────

| Role | Server Type | Count | Justification |
|------|-------------|-------|---------------|
| Web | {cax21/cx22} | {n} | {reason} |
| App | {cpx31/cax31} | {n} | {reason} |
| DB | {ccx23/ccx33} | {n} | {reason} |

──────────────────────────────────────────────────────────────
NETWORK DESIGN
──────────────────────────────────────────────────────────────

| Subnet | IP Range | Purpose | Servers |
|--------|----------|---------|---------|
| web | 10.0.1.0/24 | Web frontends | web-01, web-02 |
| app | 10.0.2.0/24 | Application tier | app-01 |
| data | 10.0.3.0/24 | Databases, cache | db-01, redis-01 |
```

### Step 3: Firewall Rules

```
──────────────────────────────────────────────────────────────
FIREWALL DESIGN
──────────────────────────────────────────────────────────────

| Firewall | Direction | Protocol | Port | Source | Applied To |
|----------|-----------|----------|------|--------|------------|
| fw-web | in | TCP | 80,443 | 0.0.0.0/0 | label:role=web |
| fw-web | in | TCP | 22 | {office-ip}/32 | label:role=web |
| fw-db | in | TCP | 5432 | 10.0.0.0/8 | label:role=db |
| fw-db | in | TCP | 22 | 10.0.0.0/8 | label:role=db |
```

### Step 4: Generate hcloud CLI Commands

Generate the complete provisioning script with hcloud CLI commands for:
- Network and subnet creation
- Firewall rules with label selectors
- SSH key registration
- Placement groups for critical services
- Server creation with cloud-init
- Volume creation and attachment
- Load balancer with health checks
- Floating IP assignment (if needed)

### Step 5: Generate Cloud-Init

Generate `cloud-init.yml` templates for each server role with package installation, security hardening (fail2ban, UFW), and application setup.

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESOURCE SUMMARY
──────────────────────────────────────────────────────────────

| Resource | Count | Monthly Cost |
|----------|-------|-------------|
| Servers | {n} | {cost}€ |
| Volumes | {n} | {cost}€ |
| Load Balancers | {n} | {cost}€ |
| Floating IPs | {n} | {cost}€ |
| **Total** | | **{total}€** |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review server types and adjust for budget
2. [ ] Audit security posture with /hcloud:security-audit
3. [ ] Configure CI/CD pipeline with /hcloud:deploy-setup
4. [ ] Optimize costs with @hcloud-cost
5. [ ] Setup monitoring and alerting
```
