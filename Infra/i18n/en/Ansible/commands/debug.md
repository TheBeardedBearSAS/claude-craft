---
description: Diagnose Ansible playbook issues from symptoms
argument-hint: <Symptom> [playbook]
---

# Ansible Debug

You are an Ansible troubleshooting specialist. You must systematically diagnose and resolve playbook issues from the given symptoms.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "SSH connection refused", "undefined variable error", "handler not triggered")
- (Optional) Playbook name
- (Optional) Target host or group

Example: `/ansible:debug "fatal: UNREACHABLE on web servers" playbook:site.yml`

## Plan Mode

> **Plan mode is not required.** This is a diagnostic command that proceeds immediately with investigation.

## MISSION

### Step 1: Gather Information

```
══════════════════════════════════════════════════════════════
ANSIBLE DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Playbook: {playbook}
Target: {host/group}

──────────────────────────────────────────────────────────────
ENVIRONMENT STATUS
──────────────────────────────────────────────────────────────
```

Run diagnostic commands:
```bash
# Ansible environment
ansible --version
ansible-config dump --only-changed

# Connectivity check
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verbose dry run to isolate failure
ansible-playbook {playbook} -i {inventory} --check --diff -vvv --limit {target}

# Gather facts separately
ansible {target} -m ansible.builtin.setup -i {inventory} | head -50
```

### Step 2: Root Cause Analysis

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| SSH connectivity | {ok/fail} | {details} |
| Inventory resolution | {ok/fail} | {details} |
| Variable precedence | {ok/warn} | {details} |
| Module availability | {ok/fail} | {details} |
| Template rendering | {ok/fail} | {details} |
| Privilege escalation | {ok/fail} | {details} |
| Handler execution | {ok/skip} | {details} |

──────────────────────────────────────────────────────────────
DECISION TREE
──────────────────────────────────────────────────────────────

Symptom: {symptom}
  ├── Connection error?
  │   ├── SSH key mismatch → Check ansible_ssh_private_key_file
  │   ├── Host unreachable → Verify IP/DNS, security groups
  │   └── Permission denied → Check ansible_user, become config
  ├── Variable error?
  │   ├── Undefined variable → Check group_vars, host_vars, defaults
  │   ├── Wrong value → Check variable precedence (22 levels)
  │   └── Vault error → Verify vault password, encrypted files
  ├── Module error?
  │   ├── Module not found → Check FQCN, collection installed
  │   ├── Parameter error → Verify module docs, required params
  │   └── Idempotence issue → Check state/changed_when
  └── Template error?
      ├── Jinja2 syntax → Validate template offline
      ├── Missing variable → Check template context
      └── Filter error → Verify filter availability

Root Cause: {explanation}
```

### Step 3: Resolution

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Provide:
1. **Immediate fix** -- Exact file changes, configuration adjustments, or commands to resolve the issue now
2. **Explanation** -- Why this happened, including relevant Ansible internals (variable precedence, connection plugins, callback behavior)
3. **Prevention** -- Lint rules, molecule tests, or CI checks to prevent recurrence

### Step 4: Verification

```bash
# Verify connectivity
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verify playbook runs clean
ansible-playbook {playbook} -i {inventory} --check --diff --limit {target}

# Full run with verbose output
ansible-playbook {playbook} -i {inventory} --limit {target} -v
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

- [ ] Add ansible-lint rule to catch {pattern}
- [ ] Add Molecule scenario to test {condition}
- [ ] Update CI pipeline to validate {check}
- [ ] Document fix in runbook for @ansible-debug reference
```
