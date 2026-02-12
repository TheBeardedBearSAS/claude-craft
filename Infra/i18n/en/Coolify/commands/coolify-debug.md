---
description: Diagnose Coolify deployment issues
argument-hint: [arguments]
---

# Coolify Diagnostics

You are a Coolify debugging expert. You must diagnose and resolve deployment and runtime issues on Coolify self-hosted PaaS.

## Arguments
$ARGUMENTS

Arguments:
- Symptom or error message
- (Optional) Service name
- (Optional) Context: build, runtime, networking, ssl

Example: `/coolify:debug "502 Bad Gateway on app.example.com"` or `/coolify:debug "Build fails with OOM" service:api`

## MISSION

### Step 1: Collect Symptoms

```
══════════════════════════════════════════════════════════════
COOLIFY DIAGNOSTICS
══════════════════════════════════════════════════════════════

Service: {name}
Type: {Application / Database / Docker Compose}
Build Pack: {Nixpacks / Dockerfile / Compose}

──────────────────────────────────────────────────────────────
REPORTED SYMPTOM
──────────────────────────────────────────────────────────────

{problem description}

### Symptom Classification
| Category | Likelihood |
|----------|------------|
| Build failure | {High/Medium/Low} |
| Runtime error | {High/Medium/Low} |
| Networking | {High/Medium/Low} |
| SSL/TLS | {High/Medium/Low} |
| Webhook/Git | {High/Medium/Low} |
| Storage | {High/Medium/Low} |
```

### Step 2: Check Deployment Status and Logs

```bash
# Check Coolify services
docker ps --filter "name=coolify" --format "table {{.Names}}\t{{.Status}}"

# Check application containers
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Application logs (from Coolify dashboard or CLI)
docker logs <container-name> --tail 200 2>&1

# Traefik proxy logs
docker logs coolify-proxy --tail 100 2>&1 | grep -i "error\|warn"

# System resources
free -h
df -h /var/lib/docker
```

```
──────────────────────────────────────────────────────────────
DEPLOYMENT STATUS
──────────────────────────────────────────────────────────────

| Check | Result | Details |
|-------|--------|---------|
| Container state | {running/exited/restarting} | {uptime or exit code} |
| Health check | {healthy/unhealthy/none} | {last check result} |
| Traefik route | {active/missing} | {domain routing status} |
| Last deploy | {success/failed} | {timestamp} |
| Resources | {OK/warning} | CPU: {%}, RAM: {used/total} |
| Disk | {OK/warning} | {used/total} ({percentage}) |
```

### Step 3: Check Container Status

```bash
# Detailed container inspection
docker inspect <container-name> --format='
  State: {{.State.Status}}
  Exit Code: {{.State.ExitCode}}
  OOM Killed: {{.State.OOMKilled}}
  Started: {{.State.StartedAt}}
  Finished: {{.State.FinishedAt}}
  Restarts: {{.RestartCount}}
'

# Container processes
docker exec <container-name> ps aux 2>/dev/null || echo "Cannot exec (container not running)"

# Container resource usage
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

### Step 4: Check Networking

```bash
# DNS resolution
dig +short {domain}
nslookup {domain} 8.8.8.8

# Port accessibility (from external)
curl -s -o /dev/null -w "%{http_code}" https://{domain}
curl -s -o /dev/null -w "%{http_code}" http://{domain}

# Traefik routing
docker logs coolify-proxy 2>&1 | grep "{domain}"

# Internal connectivity (from container)
docker exec <container-name> wget -q -O- http://localhost:{port}/health 2>/dev/null

# Check firewall
sudo ufw status verbose
```

### Step 5: Verify SSL and Let's Encrypt

```bash
# Certificate details
openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer

# Let's Encrypt logs
docker logs coolify-proxy 2>&1 | grep -i "acme\|certificate\|letsencrypt"

# ACME storage
docker exec coolify-proxy cat /data/acme.json 2>/dev/null | jq '.[] | keys'

# DNS challenge verification (if wildcard)
dig TXT _acme-challenge.{domain}
```

### Step 6: Check Webhooks and Git Integration

```
──────────────────────────────────────────────────────────────
GIT & WEBHOOK STATUS
──────────────────────────────────────────────────────────────

### GitHub App
- Check: GitHub > Settings > Applications > Coolify
- Recent deliveries: Settings > Developer settings > GitHub Apps > Advanced
- Verify: repository has Coolify app installed

### Webhook Delivery
| Check | Status |
|-------|--------|
| Webhook URL reachable | {yes/no} |
| Recent delivery status | {success/failure} |
| Response code | {200/404/500} |
| Branch match | {yes/no} |
| Auto-deploy enabled | {yes/no} |

### Manual Trigger Test
curl -X POST https://coolify.example.com/api/v1/deploy \
  -H "Authorization: Bearer {token}" \
  -d '{"uuid": "{service-uuid}"}'
```

### Step 7: Propose Fix

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

### Root Cause
{description of the root cause}

### Evidence
- {evidence 1}
- {evidence 2}

──────────────────────────────────────────────────────────────
SOLUTION
──────────────────────────────────────────────────────────────

### Hypothesis 1: {Most Likely}
**Cause**: {description}
**Fix**:
\`\`\`bash
{resolution commands}
\`\`\`

### Hypothesis 2: {Alternative}
**Cause**: {description}
**Fix**:
\`\`\`bash
{resolution commands}
\`\`\`

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

To avoid this problem in the future:
- [ ] {Recommendation 1}
- [ ] {Recommendation 2}
- [ ] {Recommendation 3}

──────────────────────────────────────────────────────────────
USEFUL COMMANDS
──────────────────────────────────────────────────────────────

# Redeploy service
# Dashboard > Service > Deploy (or Rebuild without cache)

# Restart Traefik proxy
docker restart coolify-proxy

# Clean Docker resources
docker system prune -af

# Check all container health
docker ps --format "{{.Names}}: {{.Status}}" | sort
```

## Diagnostic Checklist

### Basic Information
- [ ] Exact error message or symptom noted
- [ ] Problem start time identified
- [ ] Recent changes reviewed (deploy, config, DNS)
- [ ] Reproducibility confirmed

### Environment
- [ ] Coolify version checked
- [ ] Server resources verified (RAM, disk, CPU)
- [ ] Docker status verified
- [ ] Network connectivity tested

### Verifications Performed
- [ ] Deployment logs analyzed
- [ ] Container state checked
- [ ] Traefik routing verified
- [ ] DNS resolution confirmed
- [ ] SSL certificate validated
- [ ] Webhooks delivery checked
