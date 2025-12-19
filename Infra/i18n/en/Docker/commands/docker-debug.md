---
description: Docker Diagnostics
argument-hint: [arguments]
---

# Docker Diagnostics

You are a Docker debugging expert. You must diagnose and resolve container-related issues.

## Arguments
$ARGUMENTS

Arguments:
- Symptom or error message
- (Optional) Container name
- (Optional) Context (dev/prod)

Example: `/docker:debug "Container exits with code 137"` or `/docker:debug app "Connection refused"`

## MISSION

### Step 1: Collect Information

```bash
# Container state
docker ps -a

# Recent logs
docker logs <container> --tail 100 2>&1

# Complete inspection
docker inspect <container>

# Resources
docker stats --no-stream
```

### Step 2: Identify the Problem

```
══════════════════════════════════════════════════════════════
🔍 DOCKER DIAGNOSTICS
══════════════════════════════════════════════════════════════

Container: {name}
Image: {image}
State: {running|exited|restarting}
Uptime: {duration}

──────────────────────────────────────────────────────────────
🚨 REPORTED SYMPTOM
──────────────────────────────────────────────────────────────

{problem description}

──────────────────────────────────────────────────────────────
📋 ANALYSIS
──────────────────────────────────────────────────────────────
```

### Step 3: Decision Trees

#### Container Won't Start

| Exit Code | Meaning | Actions |
|-----------|---------|---------|
| 0 | Terminated normally | Check CMD/ENTRYPOINT |
| 1 | Application error | Analyze logs |
| 126 | Permission denied | Check permissions |
| 127 | Command not found | Check PATH and binary |
| 137 | SIGKILL (OOM or stop) | Check memory |
| 139 | SIGSEGV | Debug code |

```bash
# Check exit code
docker inspect --format='{{.State.ExitCode}}' <container>

# Check OOM
docker inspect --format='{{.State.OOMKilled}}' <container>

# Detailed logs
docker logs <container> 2>&1
```

#### Network Issues

```bash
# DNS resolution
docker exec <container> nslookup <service>
docker exec <container> cat /etc/resolv.conf

# Connectivity
docker exec <container> ping -c 3 <host>
docker exec <container> nc -zv <host> <port>

# Network configuration
docker network inspect <network>
docker inspect --format='{{json .NetworkSettings.Networks}}' <container>
```

#### Resource Issues

```bash
# Real-time monitoring
docker stats <container>

# Processes in container
docker exec <container> ps aux
docker exec <container> top -bn1

# Detailed memory
docker exec <container> free -m
docker exec <container> cat /proc/meminfo
```

#### Volume Issues

```bash
# Filesystem changes
docker diff <container>

# Disk space
docker exec <container> df -h

# Permissions
docker exec <container> ls -la /path/to/data

# Inspect volume
docker volume inspect <volume>
```

### Step 4: Common Solutions

```
──────────────────────────────────────────────────────────────
💡 HYPOTHESES & SOLUTIONS
──────────────────────────────────────────────────────────────

### Hypothesis 1: [Most Likely]
**Cause**: {description}
**Verification**:
\`\`\`bash
{diagnostic command}
\`\`\`
**Solution**:
\`\`\`bash
{resolution command}
\`\`\`

### Hypothesis 2: [Alternative]
**Cause**: {description}
**Verification**:
\`\`\`bash
{command}
\`\`\`
**Solution**:
\`\`\`bash
{command}
\`\`\`
```

### Step 5: Final Report

```
══════════════════════════════════════════════════════════════
📊 DIAGNOSTIC REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 IDENTIFIED CAUSE
──────────────────────────────────────────────────────────────

{Root cause description}

──────────────────────────────────────────────────────────────
✅ APPLIED SOLUTION
──────────────────────────────────────────────────────────────

{Resolution steps}

──────────────────────────────────────────────────────────────
🛡️ PREVENTION
──────────────────────────────────────────────────────────────

To avoid this problem in the future:
- [ ] {Recommendation 1}
- [ ] {Recommendation 2}
- [ ] {Recommendation 3}

──────────────────────────────────────────────────────────────
🔧 USEFUL COMMANDS
──────────────────────────────────────────────────────────────

# Recreate container
docker compose up -d --force-recreate <service>

# Full rebuild
docker compose build --no-cache <service>

# Clean resources
docker system prune -af

# Check state
docker compose ps
docker compose logs -f <service>
```

## Diagnostic Checklist

### Basic Information
- [ ] Exact error message noted
- [ ] Problem timestamp
- [ ] Recent changes identified
- [ ] Reproducibility verified

### Environment
- [ ] Docker version (`docker version`)
- [ ] Host OS verified
- [ ] Available resources
- [ ] Mode (Compose/Swarm)

### Verifications Performed
- [ ] Logs analyzed
- [ ] Container state checked
- [ ] Resources verified
- [ ] Network tested (if applicable)
- [ ] Volumes checked (if applicable)
