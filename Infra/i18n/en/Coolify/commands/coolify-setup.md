---
description: Initialize project for Coolify deployment
argument-hint: [arguments]
---

# Coolify Setup

You are a Coolify deployment specialist. You must analyze the project and prepare it for deployment on a Coolify self-hosted PaaS instance.

## Arguments
$ARGUMENTS

Arguments:
- Project description or path
- (Optional) Target build pack: nixpacks, dockerfile, compose
- (Optional) Services needed: postgres, redis, mysql, mongodb

Example: `/coolify:setup "Node.js API with PostgreSQL and Redis"` or `/coolify:setup . buildpack:dockerfile services:postgres,redis`

## MISSION

### Step 1: Analyze Project Stack

```bash
# Detect project type
ls -la package.json composer.json requirements.txt go.mod Cargo.toml Gemfile *.csproj 2>/dev/null

# Check for existing Docker files
ls -la Dockerfile* docker-compose*.yml .dockerignore nixpacks.toml 2>/dev/null

# Check for environment configuration
ls -la .env .env.example .env.local 2>/dev/null

# Identify services from code
grep -r "DATABASE_URL\|REDIS_URL\|MONGODB_URI\|MYSQL_" .env* 2>/dev/null
```

```
══════════════════════════════════════════════════════════════
COOLIFY PROJECT SETUP
══════════════════════════════════════════════════════════════

Project: {name}
Path: {path}

──────────────────────────────────────────────────────────────
STACK DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Version |
|-----------|----------|---------|
| Language | {language} | {version} |
| Framework | {framework} | {version} |
| Package Manager | {npm/yarn/pnpm/composer/pip} | {version} |

| Service | Detected | Source |
|---------|----------|--------|
| {database} | {yes/no} | {env var / config file} |
| {cache} | {yes/no} | {env var / config file} |
| {queue} | {yes/no} | {env var / config file} |
```

### Step 2: Recommend Build Pack

```
──────────────────────────────────────────────────────────────
BUILD PACK RECOMMENDATION
──────────────────────────────────────────────────────────────

Recommended: {Nixpacks / Dockerfile / Docker Compose}

Reasoning:
- {reason 1}
- {reason 2}

| Build Pack | Pros | Cons |
|------------|------|------|
| Nixpacks | Zero-config, auto-detect | Less control |
| Dockerfile | Full control, reproducible | Manual config |
| Docker Compose | Multi-service, existing setup | More complex |

Selected: {build pack}
```

### Step 3: Generate/Validate Configuration

For Nixpacks:
```toml
# nixpacks.toml (if customization needed)
[phases.setup]
nixPkgs = ["..."]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

For Dockerfile (if not present):
```dockerfile
# Generate appropriate Dockerfile based on detected stack
# Multi-stage build optimized for Coolify deployment
```

For Docker Compose (validate existing):
```yaml
# Validate docker-compose.yml for Coolify compatibility
# Check for port conflicts, volume definitions, network config
```

### Step 4: Create Environment Template

```
──────────────────────────────────────────────────────────────
ENVIRONMENT VARIABLES
──────────────────────────────────────────────────────────────
```

Generate `.env.coolify` template:
```bash
# =============================================================================
# Coolify Environment Variables Template
# =============================================================================
# Copy these variables to your Coolify service configuration
# Dashboard > Service > Environment Variables

# Application
NODE_ENV=production
APP_URL=https://{your-domain}
PORT=3000

# Database (use Coolify-managed PostgreSQL)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${SERVICE_URL_POSTGRES}:5432/${POSTGRES_DB}

# Cache (use Coolify-managed Redis)
REDIS_URL=redis://${SERVICE_URL_REDIS}:6379

# Secrets (generate unique values)
SECRET_KEY={generate-with: openssl rand -hex 32}
JWT_SECRET={generate-with: openssl rand -hex 64}

# External Services (configure as needed)
# SMTP_HOST=
# SMTP_PORT=587
# S3_ENDPOINT=
# S3_BUCKET=
```

### Step 5: Generate Deployment Checklist

```
──────────────────────────────────────────────────────────────
DEPLOYMENT CHECKLIST
──────────────────────────────────────────────────────────────

### Server Prerequisites
- [ ] VPS provisioned (min 4 GB RAM, 2 vCPU, 50 GB SSD)
- [ ] Coolify installed: curl -fsSL https://cdn.coolify.io/install.sh | bash
- [ ] Firewall configured: ports 22, 80, 443 open
- [ ] SSH key-based authentication enabled

### DNS Configuration
- [ ] A record: {domain} → {server-ip}
- [ ] (Optional) Wildcard: *.{domain} → {server-ip}
- [ ] DNS propagation verified: dig +short {domain}

### Coolify Configuration
- [ ] Git source connected (GitHub App / deploy key)
- [ ] Project created in Coolify dashboard
- [ ] Environment created (production/staging)
- [ ] Application service added

### Service Configuration
- [ ] Build pack selected: {recommendation}
- [ ] Build/start commands verified
- [ ] Port configured: {port}
- [ ] Environment variables set
- [ ] Domain configured with SSL
- [ ] Health check endpoint: /health

### Database Setup (if applicable)
- [ ] Database service created in Coolify
- [ ] Connection URL set in environment variables
- [ ] Initial migration/seed ready
- [ ] Backup schedule configured

### Post-Deploy
- [ ] Health check responding
- [ ] SSL certificate valid
- [ ] Application functional
- [ ] Monitoring configured
```

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
SETUP REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED/VERIFIED FILES
──────────────────────────────────────────────────────────────

| File | Status | Description |
|------|--------|-------------|
| {file} | {created/verified/modified} | {description} |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review .env.coolify and set production values
2. [ ] Complete server prerequisites checklist
3. [ ] Configure DNS records
4. [ ] Deploy with /coolify:deploy
5. [ ] Configure backups with /coolify:backup
```
