---
description: Design complete Ansible automation architecture
argument-hint: <Project> [constraints]
---

# Ansible Architecture

You are a senior Ansible architect. You must design a complete automation architecture from project specifications.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Target infrastructure (e.g., web-servers, databases, multi-cloud)
- Required automation (e.g., provisioning, configuration, deployment)
- Constraints (e.g., multi-env, compliance, team-size)

Example: `/ansible:architecture "E-commerce platform" infra:aws services:nginx,postgresql,redis compliance:soc2`

## Plan Mode

> **Plan mode is recommended.** Claude activates plan mode to structure the approach, identify infrastructure targets, and present an automation strategy before generating playbooks and roles.

## MISSION

### Step 1: Discovery

```
══════════════════════════════════════════════════════════════
ANSIBLE ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Web Server | {tech} | {version} |
| Database | {tech} | {version} |
| Cache | {tech} | {version} |

### Target Hosts
| Group | OS | Count | Purpose |
|-------|----|-------|---------|
| {group} | {os} | {count} | {purpose} |

### Environments
| Env | Purpose | Specifics |
|-----|---------|-----------|
| dev | Development | Local VMs (Vagrant/Docker) |
| staging | Validation | Production-like |
| prod | Production | HA, hardened, monitored |
```

### Step 2: Architecture Design

```
──────────────────────────────────────────────────────────────
AUTOMATION TOPOLOGY
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                     CONTROL NODE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ansible.cfg │  │ requirements │  │  .ansible-   │      │
│  │              │  │     .yml     │  │    lint       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  INVENTORIES → PLAYBOOKS → ROLES → TARGET HOSTS            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ dev/stg/ │  │ site.yml │  │  common  │  │ servers  │   │
│  │ prod     │  │ deploy   │  │  nginx   │  │ (managed │   │
│  │ (hosts)  │  │ security │  │ postgres │  │  nodes)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
INVENTORY STRATEGY
──────────────────────────────────────────────────────────────

| Environment | Source | Group Vars | Specifics |
|-------------|--------|------------|-----------|
| dev | Static YAML | Reduced resources | Vagrant/local |
| staging | Dynamic (cloud) | Production-like | Auto-discovery |
| prod | Dynamic (cloud) | Full resources, HA | Encrypted vault |

──────────────────────────────────────────────────────────────
ROLE DECOMPOSITION
──────────────────────────────────────────────────────────────

| Role | Scope | Dependencies | Molecule |
|------|-------|-------------|----------|
| common | Base OS config, users, packages | none | Yes |
| {service} | {description} | common | Yes |
```

### Step 3: Project Structure

```
──────────────────────────────────────────────────────────────
PROJECT STRUCTURE
──────────────────────────────────────────────────────────────

ansible/
├── ansible.cfg
├── requirements.yml
├── .ansible-lint
├── inventories/
│   ├── dev/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   ├── staging/
│   │   └── hosts.yml, group_vars/
│   └── prod/
│       ├── hosts.yml
│       └── group_vars/all/{vars,vault}.yml
├── playbooks/
│   ├── site.yml
│   ├── deploy.yml
│   └── security.yml
├── roles/
│   ├── common/
│   │   ├── defaults/, handlers/, tasks/main.yml
│   │   ├── templates/
│   │   └── molecule/default/
│   └── {service}/
└── collections/
    └── requirements.yml
```

### Step 4: Generate Configuration

Generate `ansible.cfg` (inventory paths, SSH settings, fact caching, security defaults), `requirements.yml` (collections: `ansible.posix`, `community.general`), inventory structure per environment, and `.ansible-lint` with production safety profile. All tasks must use FQCN (e.g., `ansible.builtin.copy`).

### Step 5: Generate Roles

Generate role skeletons for each identified service with `defaults/main.yml`, `tasks/main.yml` (idempotent), `handlers/main.yml`, `templates/`, and `molecule/default/` for testing.

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
| ansible/ansible.cfg | Main Ansible configuration |
| ansible/requirements.yml | Collection dependencies |
| ansible/inventories/prod/hosts.yml | Production inventory |
| ansible/playbooks/site.yml | Master playbook |
| ansible/roles/common/tasks/main.yml | Base OS configuration role |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review group_vars and adjust for each environment
2. [ ] Setup Ansible Vault with /ansible:security-audit
3. [ ] Configure CI/CD pipeline with /ansible:deploy-setup
4. [ ] Run quality check with @ansible-quality
5. [ ] Test roles with Molecule before first deployment
```
