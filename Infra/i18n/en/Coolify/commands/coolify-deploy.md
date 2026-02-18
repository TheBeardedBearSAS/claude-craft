---
description: Deploy application to Coolify
argument-hint: [arguments]
---

# Coolify Deploy

You are a Coolify deployment expert. You must guide the deployment of an application to a Coolify self-hosted PaaS instance.

## Arguments
$ARGUMENTS

Arguments:
- Application name or repository
- (Optional) Environment: production, staging, preview
- (Optional) Branch: main, develop, feature/*

Example: `/coolify:deploy "my-app" env:production branch:main` or `/coolify:deploy . env:staging`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## MISSION

### Step 1: Verify Prerequisites

```
══════════════════════════════════════════════════════════════
COOLIFY DEPLOYMENT
══════════════════════════════════════════════════════════════

Application: {name}
Environment: {production/staging/preview}
Branch: {branch}

──────────────────────────────────────────────────────────────
PREREQUISITES CHECK
──────────────────────────────────────────────────────────────

| Prerequisite | Status | Details |
|--------------|--------|---------|
| Coolify instance | {OK/FAIL} | {url} |
| Git provider | {OK/FAIL} | {GitHub/GitLab/Bitbucket} |
| DNS records | {OK/FAIL} | {domain} → {ip} |
| SSL capability | {OK/FAIL} | {Let's Encrypt / custom} |
| Build configuration | {OK/FAIL} | {Nixpacks/Dockerfile/Compose} |
```

### Step 2: Configure Git Provider Connection

```
──────────────────────────────────────────────────────────────
GIT PROVIDER SETUP
──────────────────────────────────────────────────────────────

Provider: {GitHub / GitLab / Bitbucket}

### GitHub App (Recommended)
1. Coolify Dashboard > Sources > Add
2. Select "GitHub App"
3. Authorize Coolify GitHub App
4. Select repositories to grant access
5. Verify webhook delivery: GitHub > Settings > GitHub Apps > Recent deliveries

### GitLab (Deploy Key)
1. Coolify Dashboard > Sources > Add
2. Select "GitLab"
3. Copy generated SSH public key
4. GitLab > Repository > Settings > Repository > Deploy Keys > Add
5. Configure webhook:
   - URL: https://coolify.example.com/webhooks/source/gitlab
   - Secret: {from Coolify}
   - Triggers: Push events, Merge request events

Status: {configured / needs setup}
```

### Step 3: Set Environment Variables

```
──────────────────────────────────────────────────────────────
ENVIRONMENT VARIABLES
──────────────────────────────────────────────────────────────

### Required Variables
| Variable | Value | Type |
|----------|-------|------|
| {VAR_NAME} | {value or instruction} | Build / Runtime |

### Database Connection
DATABASE_URL=postgresql://{user}:{password}@{host}:5432/{database}
→ Use Coolify service reference: $SERVICE_URL_POSTGRES

### Cache Connection
REDIS_URL=redis://{host}:6379
→ Use Coolify service reference: $SERVICE_URL_REDIS

### Secrets
{SECRET_NAME}={instruction to generate}
→ openssl rand -hex 32

### Shared Variables (across environments)
Configure in: Settings > Shared Variables
```

### Step 4: Choose and Configure Build Pack

```
──────────────────────────────────────────────────────────────
BUILD CONFIGURATION
──────────────────────────────────────────────────────────────

Build Pack: {Nixpacks / Dockerfile / Docker Compose}

### Nixpacks Configuration
| Setting | Value |
|---------|-------|
| Base Directory | {/} |
| Build Command | {auto-detected or custom} |
| Start Command | {auto-detected or custom} |
| Install Command | {auto-detected or custom} |
| Port | {auto-detected or custom} |

### Dockerfile Configuration
| Setting | Value |
|---------|-------|
| Dockerfile Location | {./Dockerfile} |
| Build Target | {production} |
| Build Args | {KEY=value} |
| Port | {from EXPOSE or manual} |

### Docker Compose Configuration
| Setting | Value |
|---------|-------|
| Compose File | {./docker-compose.yml} |
| Services | {list of services to deploy} |
```

### Step 5: Configure Domain and SSL

```
──────────────────────────────────────────────────────────────
DOMAIN & SSL CONFIGURATION
──────────────────────────────────────────────────────────────

### Domain Setup
| Setting | Value |
|---------|-------|
| Domain | {app.example.com} |
| Force HTTPS | Yes |
| WWW Redirect | {Yes/No} |
| Port | {application port} |

### SSL Certificate
Method: {Let's Encrypt HTTP / Let's Encrypt DNS / Custom}

For HTTP challenge (default):
- Automatic, no extra config needed
- Port 80 must be accessible

For DNS challenge (wildcard):
- Provider: {Cloudflare / DigitalOcean / Hetzner}
- API Token: {configured in Coolify settings}
- Wildcard domain: *.example.com

### Preview Deployments (optional)
- Enable: {Yes/No}
- Domain pattern: pr-{{PR_NUMBER}}.preview.example.com
- DNS: *.preview.example.com → {server-ip}
```

### Step 6: Trigger Deployment and Verify

```
──────────────────────────────────────────────────────────────
DEPLOYMENT
──────────────────────────────────────────────────────────────

### Deploy Method
Option A: Git Push (automatic)
  git push origin {branch}
  → Webhook triggers Coolify build + deploy

Option B: Manual (Coolify Dashboard)
  Dashboard > Service > Deploy

Option C: API
  curl -X POST https://coolify.example.com/api/v1/deploy \
    -H "Authorization: Bearer {api-token}" \
    -H "Content-Type: application/json" \
    -d '{"uuid": "{service-uuid}"}'

### Health Verification
# Wait for deployment to complete
# Check deployment logs in Coolify Dashboard

# Verify application health
curl -s -o /dev/null -w "%{http_code}" https://{domain}/health

# Verify SSL certificate
openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | \
  openssl x509 -noout -dates

# Quick smoke test
curl -s https://{domain}/
```

### Step 7: Final Report

```
══════════════════════════════════════════════════════════════
DEPLOYMENT REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
DEPLOYMENT STATUS
──────────────────────────────────────────────────────────────

| Item | Status |
|------|--------|
| Build | {SUCCESS / FAILED} |
| Deploy | {SUCCESS / FAILED} |
| Health Check | {PASSING / FAILING} |
| SSL | {VALID / INVALID} |

──────────────────────────────────────────────────────────────
URLS
──────────────────────────────────────────────────────────────

| Environment | URL |
|-------------|-----|
| Production | https://{domain} |
| Coolify Dashboard | https://coolify.example.com |
| Deployment Logs | https://coolify.example.com/project/... |

──────────────────────────────────────────────────────────────
ROLLBACK INSTRUCTIONS
──────────────────────────────────────────────────────────────

If issues are found:
1. Dashboard > Service > Deployments
2. Select previous successful deployment
3. Click "Rollback"

Or via Git:
  git revert HEAD
  git push origin {branch}

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Verify all endpoints functional
2. [ ] Run database migrations (if applicable)
3. [ ] Configure monitoring with /coolify:backup
4. [ ] Setup preview deployments (if not done)
5. [ ] Document deployment in project README
```
