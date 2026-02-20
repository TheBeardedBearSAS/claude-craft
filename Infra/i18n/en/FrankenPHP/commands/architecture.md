---
description: Design complete FrankenPHP serving architecture
argument-hint: <Project> [constraints]
---

# FrankenPHP Architecture

You are a senior FrankenPHP architect. You must design a complete PHP serving architecture from project specifications.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Target workload (e.g., web-application, api-only, real-time)
- Constraints (e.g., worker-mode, classic-mode, behind-proxy)

Example: `/frankenphp:architecture "E-commerce platform" workload:web-application framework:symfony`

## Plan Mode

> **Plan mode is recommended.** Claude activates plan mode to structure the approach, select worker/classic mode, and present a serving topology before generating the Caddyfile.

## MISSION

### Step 1: Discovery

```
══════════════════════════════════════════════════════════════
FRANKENPHP ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Application Stack
| Component | Technology | Details |
|-----------|------------|---------|
| Framework | {Symfony/Laravel/PHP} | {version} |
| PHP Version | {8.x} | {extensions} |
| Global State | {none/minimal/heavy} | {session files, statics} |
| Current Server | {nginx+fpm/Apache/none} | {version} |

### Traffic Pattern
| Attribute | Value |
|-----------|-------|
| Peak concurrent | {requests} |
| Avg response time | {ms} |
| Real-time needed | {yes/no} |
| Long-running requests | {yes/no} |
```

### Step 2: Mode Decision

```
──────────────────────────────────────────────────────────────
MODE SELECTION
──────────────────────────────────────────────────────────────

Framework supports worker mode? {yes/no}
Global state prevents worker mode? {yes/no}
OPcache preloading possible? {yes/no}

Decision: {worker / classic} mode
Rationale: {explanation}

Thread configuration: {auto / fixed count}
max_requests: {500 / custom}
```

### Step 3: Topology Design

```
──────────────────────────────────────────────────────────────
SERVING TOPOLOGY
──────────────────────────────────────────────────────────────

[ASCII diagram: Client -> FrankenPHP (worker pool) -> Data tier]

──────────────────────────────────────────────────────────────
THREAD SIZING
──────────────────────────────────────────────────────────────

| Parameter | Value | Formula |
|-----------|-------|---------|
| Threads | {auto/count} | {cpu_count * 2 or auto} |
| max_requests | {500} | {memory stability} |
| Memory budget | {MB per worker} | {total / threads} |
```

### Step 4: Generate Caddyfile

Generate the complete Caddyfile with:
- Global frankenphp block (worker or classic mode)
- Site block with root, php_server, security headers
- Early Hints configuration (if applicable)
- Mercure hub (if real-time needed)
- Logging configuration

### Step 5: Generate Docker Artifacts

Generate Dockerfile and docker-compose.yml for the chosen architecture.

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CONFIGURATION SUMMARY
──────────────────────────────────────────────────────────────

| Setting | Value |
|---------|-------|
| Mode | {worker/classic} |
| Threads | {auto/count} |
| max_requests | {value} |
| Auto-TLS | {yes/no} |
| Early Hints | {yes/no} |
| Mercure | {yes/no} |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review Caddyfile and thread sizing
2. [ ] Deploy with /frankenphp:deploy-setup
3. [ ] Audit security with /frankenphp:security-audit
4. [ ] Optimize performance with /frankenphp:optimize
5. [ ] Benchmark with wrk or k6
```
