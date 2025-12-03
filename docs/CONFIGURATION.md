# Configuration Guide

This guide explains how to use YAML configuration for managing multiple projects and monorepos.

## Overview

The YAML configuration system allows you to:
- Define multiple projects in a single file
- Configure monorepos with different technologies per module
- Automate installation across all your projects
- Share configuration with your team

## Configuration File

### Location

Create your configuration file at:
```
Dev/claude-projects.yaml
```

A template is provided:
```bash
cp Dev/claude-projects.yaml.example Dev/claude-projects.yaml
```

### Basic Structure

```yaml
# Optional global settings
settings:
  rules_source: ""        # Custom rules source directory
  default_mode: "install" # install, update, or force
  backup: true            # Create backups by default

# Project definitions
projects:
  - name: "project-name"
    description: "Project description"
    root: "~/path/to/project"
    common: true          # Install common rules at root
    modules:
      - path: "subdir"
        tech: technology
        description: "Module description"
```

## Project Configuration

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique project identifier |
| `root` | string | Absolute path to project (supports `~`) |
| `modules` | array | List of technology modules |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | string | - | Project description |
| `common` | boolean | `true` | Install common rules at root |

### Module Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | Relative path from root (use `.` for root) |
| `tech` | string | Yes | Technology identifier |
| `description` | string | No | Module description |

### Supported Technologies

| Tech ID | Description |
|---------|-------------|
| `symfony` | PHP backend with Symfony |
| `flutter` | Mobile app with Flutter/Dart |
| `python` | Python backend/API |
| `react` | React frontend |
| `reactnative` | React Native mobile |

## Examples

### Simple Single-Technology Project

```yaml
projects:
  - name: "my-api"
    root: "~/Projects/my-api"
    common: true
    modules:
      - path: "."
        tech: symfony
```

Result:
```
~/Projects/my-api/
└── .claude/
    ├── agents/           # Common + Symfony agents
    ├── commands/
    │   ├── common/       # /common: commands
    │   └── symfony/      # /symfony: commands
    ├── rules/            # Symfony rules
    ├── templates/
    └── checklists/
```

### Monorepo with Multiple Technologies

```yaml
projects:
  - name: "ecommerce-platform"
    description: "Full-stack e-commerce platform"
    root: "~/Projects/ecommerce"
    common: true
    modules:
      - path: "frontend"
        tech: react
        description: "Next.js storefront"
      - path: "admin"
        tech: react
        description: "Admin dashboard"
      - path: "api"
        tech: symfony
        description: "REST API with API Platform"
      - path: "mobile"
        tech: reactnative
        description: "Customer mobile app"
```

Result:
```
~/Projects/ecommerce/
├── .claude/
│   ├── agents/           # 7 common agents
│   └── commands/common/  # 14 /common: commands
├── frontend/
│   └── .claude/
│       ├── agents/       # React agent
│       └── commands/react/
├── admin/
│   └── .claude/
│       ├── agents/       # React agent
│       └── commands/react/
├── api/
│   └── .claude/
│       ├── agents/       # Symfony agent
│       └── commands/symfony/
└── mobile/
    └── .claude/
        ├── agents/       # ReactNative agent
        └── commands/reactnative/
```

### SaaS Platform with Microservices

```yaml
projects:
  - name: "saas-platform"
    description: "Multi-tenant SaaS platform"
    root: "~/Projects/saas"
    common: true
    modules:
      # Frontend apps
      - path: "apps/web"
        tech: react
        description: "Main web application"
      - path: "apps/admin"
        tech: react
        description: "Administration panel"
      - path: "apps/mobile"
        tech: flutter
        description: "Cross-platform mobile app"

      # Backend services
      - path: "services/api-gateway"
        tech: symfony
        description: "API Gateway"
      - path: "services/auth"
        tech: python
        description: "Authentication service"
      - path: "services/billing"
        tech: python
        description: "Billing and subscriptions"
      - path: "services/notifications"
        tech: python
        description: "Email and push notifications"
```

### Multiple Independent Projects

```yaml
projects:
  - name: "client-a-website"
    root: "~/Clients/client-a/website"
    common: true
    modules:
      - path: "."
        tech: react

  - name: "client-b-api"
    root: "~/Clients/client-b/api"
    common: true
    modules:
      - path: "."
        tech: symfony

  - name: "internal-tools"
    root: "~/Projects/internal"
    common: false  # No common rules needed
    modules:
      - path: "scripts"
        tech: python
```

### Project Without Common Rules

```yaml
projects:
  - name: "simple-script"
    root: "~/Scripts/data-processor"
    common: false  # Skip common rules
    modules:
      - path: "."
        tech: python
```

## Usage

### Validate Configuration

Always validate before installing:

```bash
make config-validate CONFIG=Dev/claude-projects.yaml
```

Output:
```
──────────────────────────────────────────────────────────────
Validation de la configuration
──────────────────────────────────────────────────────────────
ℹ Fichier: Dev/claude-projects.yaml

✓ Syntaxe YAML valide
✓ 3 projet(s) défini(s)

ℹ Projet: ecommerce-platform
→   Root: /home/user/Projects/ecommerce
→   Modules: 4
✓     frontend → react
✓     admin → react
✓     api → symfony
✓     mobile → reactnative

✓ Configuration valide
```

### List Projects

```bash
make config-list CONFIG=Dev/claude-projects.yaml
```

### Install Specific Project

```bash
make config-install PROJECT=ecommerce-platform CONFIG=Dev/claude-projects.yaml
```

### Install All Projects

```bash
make config-install-all CONFIG=Dev/claude-projects.yaml
```

### Dry Run

```bash
# Single project
make config-dry-run PROJECT=ecommerce-platform CONFIG=Dev/claude-projects.yaml

# All projects
make config-dry-run CONFIG=Dev/claude-projects.yaml
```

## Direct Script Usage

You can also use the script directly:

```bash
# List projects
./Dev/install-from-config.sh --list Dev/claude-projects.yaml

# Validate
./Dev/install-from-config.sh --validate Dev/claude-projects.yaml

# Install
./Dev/install-from-config.sh --project ecommerce-platform Dev/claude-projects.yaml

# Dry run
./Dev/install-from-config.sh --dry-run --project ecommerce-platform Dev/claude-projects.yaml

# Force with backup
./Dev/install-from-config.sh --force --backup --project ecommerce-platform Dev/claude-projects.yaml
```

## Validation Rules

The configuration is validated for:

| Check | Description |
|-------|-------------|
| YAML syntax | File must be valid YAML |
| Required fields | `name`, `root`, `modules` must exist |
| Unique names | No duplicate project names |
| Valid technologies | Must be one of: symfony, flutter, python, react, reactnative |
| Module paths | Must have `path` and `tech` |

## Best Practices

### 1. Use Descriptive Names

```yaml
# Good
- name: "ecommerce-frontend"
  description: "Next.js storefront with SSR"

# Avoid
- name: "proj1"
```

### 2. Organize by Domain

```yaml
modules:
  # Group related modules
  - path: "apps/customer-web"
  - path: "apps/customer-mobile"
  - path: "services/customer-api"
```

### 3. Version Control

Add your configuration to git:
```bash
git add Dev/claude-projects.yaml
git commit -m "Add Claude Code rules configuration"
```

### 4. Team Sharing

Share the config file with your team so everyone has consistent rules:
```bash
# After cloning the project
make config-install PROJECT=our-project
```

## Troubleshooting

### "yq not found"

Install yq:
```bash
sudo apt install yq  # Debian/Ubuntu
brew install yq      # macOS
```

### "Project not found"

Check the project name matches exactly:
```bash
make config-list CONFIG=Dev/claude-projects.yaml
```

### "Invalid technology"

Use only supported technologies:
- `symfony`
- `flutter`
- `python`
- `react`
- `reactnative`
