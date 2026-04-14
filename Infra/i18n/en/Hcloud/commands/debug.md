---
description: Diagnose Hetzner Cloud infrastructure issues from symptoms
argument-hint: <Symptom> [resource]
---

# Hcloud Debug

> ⚠️ **Mandatory migration before 2026-07-01**: the `datacenter` parameter is deprecated in favor of `location`. Hetzner Cloud Terraform provider >= 1.58.0. Source: https://github.com/hetznercloud/terraform-provider-hcloud/releases

You are a Hetzner Cloud troubleshooting specialist. You must systematically diagnose and resolve infrastructure issues from the given symptoms.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "server unreachable", "load balancer health check failing", "volume not mounting")
- (Optional) Resource name or type
- (Optional) Location

Example: `/hcloud:debug "SSH connection refused on web-01" resource:server`

## Plan Mode

> **Plan mode is not required.** This is a diagnostic command that proceeds immediately with investigation.

## MISSION

### Step 1: Gather Information

```
══════════════════════════════════════════════════════════════
HCLOUD DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Resource: {resource}
Location: {location}

──────────────────────────────────────────────────────────────
ENVIRONMENT STATUS
──────────────────────────────────────────────────────────────
```

Run diagnostic commands:
```bash
# Server status
hcloud server describe {resource}
hcloud server list-actions {resource}

# Network status
hcloud server describe {resource} -o json | jq '.private_net'
hcloud network list

# Firewall status
hcloud firewall list
hcloud server describe {resource} -o json | jq '.public_net.firewalls'

# Volume status
hcloud volume list --server {resource}

# Load balancer status (if applicable)
hcloud load-balancer list
```

### Step 2: Root Cause Analysis

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Server status | {running/off/rebuilding} | {details} |
| Public IP | {assigned/missing} | {ip address} |
| Firewall rules | {ok/blocking} | {details} |
| Private network | {attached/detached} | {details} |
| Volume mount | {ok/fail} | {details} |
| Cloud-init | {complete/running/failed} | {details} |
| SSH key | {deployed/missing} | {details} |

──────────────────────────────────────────────────────────────
DECISION TREE
──────────────────────────────────────────────────────────────

Symptom: {symptom}
  ├── Server issue?
  │   ├── Not running → Check hcloud server describe, power on
  │   ├── Stuck rebuilding → Wait or contact support
  │   └── Cloud-init failed → Enable rescue, check logs
  ├── Network issue?
  │   ├── No public IP → Check primary IP assignment
  │   ├── Firewall blocking → Review rules with hcloud firewall describe
  │   └── Private network → Check attachment and subnet
  ├── Volume issue?
  │   ├── Not attached → hcloud volume attach
  │   ├── Mount failure → Check filesystem, /dev/disk/by-id/
  │   └── Wrong location → Volume must be in same location
  └── Load balancer issue?
      ├── Health check fail → Check port, path, status codes
      ├── No targets → Verify label selector
      └── TLS error → Check certificate

Root Cause: {explanation}
```

### Step 3: Resolution

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Provide:
1. **Immediate fix** -- Exact hcloud commands or configuration changes to resolve the issue now
2. **Explanation** -- Why this happened, including Hetzner Cloud specifics
3. **Prevention** -- Firewall rules, cloud-init scripts, or monitoring to prevent recurrence

### Step 4: Verification

```bash
# Verify server is running
hcloud server describe {resource}

# Verify connectivity
ssh root@{server-ip} echo "OK"

# Verify health checks (if LB)
hcloud load-balancer describe {lb-name} -o json | jq '.targets[].health_status'
```

### Step 5: Final Report

```
══════════════════════════════════════════════════════════════
DEBUG REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Item | Value |
|------|-------|
| Symptom | {symptom} |
| Root cause | {cause} |
| Fix applied | {fix} |
| Status | Resolved / Needs action |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] Add monitoring for {condition}
- [ ] Update cloud-init to prevent {issue}
- [ ] Add CI check for {validation}
- [ ] Document fix in runbook for @hcloud-debug reference
```
