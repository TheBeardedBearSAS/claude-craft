---
description: Optimize Coolify deployment
argument-hint: [arguments]
---

# Coolify Optimization

You are a DevOps Engineer expert in Coolify optimization. You must analyze and improve build performance, resource usage, monitoring, and overall infrastructure efficiency for Coolify deployments.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Focus area: build, resources, cleanup, network, all
- (Optional) Service name

Example: `/coolify:optimize` or `/coolify:optimize focus:build service:api` or `/coolify:optimize focus:cleanup`

## MISSION

### Step 1: Analyze Current Resource Usage

```bash
# Server resources
free -h
df -h /var/lib/docker
nproc
uptime

# Docker resource usage per container
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Docker disk usage breakdown
docker system df -v

# Number of images, containers, volumes
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}"
```

```
══════════════════════════════════════════════════════════════
COOLIFY OPTIMIZATION ANALYSIS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CURRENT RESOURCE USAGE
──────────────────────────────────────────────────────────────

### Server Resources
| Resource | Used | Total | Status |
|----------|------|-------|--------|
| CPU | {usage}% | {cores} cores | {OK/WARNING/CRITICAL} |
| RAM | {used} | {total} | {OK/WARNING/CRITICAL} |
| Disk | {used} | {total} | {OK/WARNING/CRITICAL} |
| Swap | {used} | {total} | {OK/WARNING/CRITICAL} |

### Docker Resources
| Type | Count | Active | Size | Reclaimable |
|------|-------|--------|------|-------------|
| Images | {n} | {n} | {size} | {size} |
| Containers | {n} | {n} | {size} | {size} |
| Volumes | {n} | {n} | {size} | {size} |
| Build Cache | - | - | {size} | {size} |

### Per-Service Usage
| Service | CPU | Memory | Net I/O | Block I/O |
|---------|-----|--------|---------|-----------|
| {name} | {%} | {used}/{limit} | {in/out} | {read/write} |
```

### Step 2: Optimize Build Performance

```
──────────────────────────────────────────────────────────────
BUILD OPTIMIZATION
──────────────────────────────────────────────────────────────

### Current Build Performance
| Service | Build Time | Image Size | Method |
|---------|------------|------------|--------|
| {name} | {duration} | {size} | {Nixpacks/Dockerfile} |

### Recommendations

#### Nixpacks Optimization
| Optimization | Impact | How |
|-------------|--------|-----|
| Cache dependencies | Build -50% | Automatic (Nixpacks caches layers) |
| .nixpacks ignore | Build -20% | Add .nixpacks file to exclude files |
| Pre-built image | Build -80% | Use pre-built Docker image instead |

#### Dockerfile Optimization
| Optimization | Impact | How |
|-------------|--------|-----|
| Multi-stage build | Size -60% | Separate build and runtime stages |
| Layer ordering | Cache hit +50% | Dependencies before source code |
| .dockerignore | Context -70% | Exclude node_modules, .git, tests |
| Alpine base | Size -40% | Use -alpine image variants |
| BuildKit cache | Build -30% | --mount=type=cache for package managers |

#### Dedicated Build Server
| Benefit | Description |
|---------|-------------|
| No prod impact | Builds don't consume prod resources |
| Faster builds | More CPU/RAM dedicated to builds |
| Parallel builds | Multiple apps build simultaneously |

Configuration:
1. Coolify Dashboard > Servers > Add Server
2. Set as "Build Server" in server settings
3. Applications will build on this server, deploy to production
```

### Step 3: Configure Auto-Cleanup

```
──────────────────────────────────────────────────────────────
AUTO-CLEANUP CONFIGURATION
──────────────────────────────────────────────────────────────

### Coolify Built-in Cleanup
Dashboard > Settings > Configuration:
- Delete unused Docker images: {enable}
- Cleanup frequency: {daily/weekly}

### Docker Cleanup Script
\`\`\`bash
#!/bin/bash
# docker-cleanup.sh - Run via cron daily

# Remove stopped containers older than 24h
docker container prune -f --filter "until=24h"

# Remove unused images (not used by any container)
docker image prune -af --filter "until=72h"

# Remove unused volumes (WARNING: verify no important data)
# docker volume prune -f

# Remove build cache older than 7 days
docker builder prune -f --filter "until=168h"

# Log cleanup results
echo "$(date): Cleaned Docker resources" >> /var/log/docker-cleanup.log
docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}"
\`\`\`

### Cron Configuration
\`\`\`bash
# Add to crontab: crontab -e
0 4 * * * /opt/scripts/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
\`\`\`

### Cleanup Impact Estimate
| Resource | Current | After Cleanup | Savings |
|----------|---------|---------------|---------|
| Images | {size} | {estimated} | {saved} |
| Build Cache | {size} | {estimated} | {saved} |
| Containers | {size} | {estimated} | {saved} |
| Total | {total} | {estimated} | {saved} |
```

### Step 4: Review and Improve Monitoring

```
──────────────────────────────────────────────────────────────
MONITORING REVIEW
──────────────────────────────────────────────────────────────

### Health Check Audit
| Service | Health Check | Interval | Status |
|---------|-------------|----------|--------|
| {name} | {path or none} | {interval} | {OK/MISSING/FAILING} |

### Recommended Health Checks
For each service without a health check:
\`\`\`
Service: {name}
Path: /health (or /api/health, /healthz)
Interval: 30s
Timeout: 10s
Retries: 3
Start Period: 60s
\`\`\`

### Resource Limits
| Service | Current Limit | Recommended | Reason |
|---------|--------------|-------------|--------|
| {name} | {none/current} | {recommended} | {based on usage} |

### Alerting Gaps
| Alert | Status | Recommended |
|-------|--------|-------------|
| Container crash | {configured/missing} | Coolify notification |
| Disk > 85% | {configured/missing} | Cron + webhook |
| RAM > 90% | {configured/missing} | Cron + webhook |
| Backup failure | {configured/missing} | Coolify notification |
| SSL expiry | {configured/missing} | Uptime Kuma |
```

### Step 5: Optimize Networking

```
──────────────────────────────────────────────────────────────
NETWORK OPTIMIZATION
──────────────────────────────────────────────────────────────

### Traefik Configuration
| Setting | Current | Recommended |
|---------|---------|-------------|
| Compression | {on/off} | Enable gzip/brotli |
| Rate limiting | {on/off} | Enable for public APIs |
| Connection limits | {value} | Adjust based on traffic |
| Access logs | {on/off} | Enable for debugging |

### Compression Configuration
\`\`\`yaml
# Traefik middleware for compression
http:
  middlewares:
    compress:
      compress:
        excludedContentTypes:
          - "text/event-stream"
\`\`\`

### Security Headers
\`\`\`yaml
# Traefik middleware for security headers
http:
  middlewares:
    security-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        contentTypeNosniff: true
        frameDeny: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
\`\`\`

### DNS Optimization
| Setting | Current | Recommended |
|---------|---------|-------------|
| TTL | {value} | 300s (prod), 60s (during migration) |
| CDN | {none/Cloudflare} | Cloudflare (free tier) for static assets |
| Proxy | {direct/proxied} | Cloudflare proxy for DDoS protection |
```

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
IMPROVEMENTS APPLIED
──────────────────────────────────────────────────────────────

| Category | Before | After | Improvement |
|----------|--------|-------|-------------|
| Build time | {before} | {after} | {reduction %} |
| Image size | {before} | {after} | {reduction %} |
| Disk usage | {before} | {after} | {freed} |
| Memory usage | {before} | {after} | {freed} |

──────────────────────────────────────────────────────────────
RECOMMENDATIONS SUMMARY
──────────────────────────────────────────────────────────────

### Immediate (do now)
- [ ] {recommendation with high impact, low effort}

### Short-term (this week)
- [ ] {recommendation with medium impact}

### Long-term (this month)
- [ ] {recommendation requiring planning}

──────────────────────────────────────────────────────────────
MONITORING COMMANDS
──────────────────────────────────────────────────────────────

# Quick health check
docker ps --format "{{.Names}}: {{.Status}}" | sort

# Resource overview
docker stats --no-stream

# Disk usage
docker system df

# Cleanup (safe)
docker system prune -f
docker image prune -f --filter "until=72h"
```
