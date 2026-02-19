---
description: Audit Ansible security posture
argument-hint: [scope]
---

# Ansible Security Audit

You are an Ansible security specialist. You must perform a comprehensive security audit of the Ansible project.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Scope: vault, ssh, become, secrets, lint, full (default: full)

Example: `/ansible:security-audit scope:full`

## Plan Mode

> **Plan mode is conditional.** Activates automatically when scope is "full" to present the audit plan before proceeding.

## MISSION

### Step 1: Scope Definition

```
══════════════════════════════════════════════════════════════
ANSIBLE SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {vault, ssh, become, secrets, lint, full}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────

| Category | Included | Weight |
|----------|----------|--------|
| Vault | {yes/no} | 25% |
| SSH | {yes/no} | 20% |
| Privilege Escalation | {yes/no} | 20% |
| Secrets Management | {yes/no} | 20% |
| Lint Security | {yes/no} | 15% |
```

### Step 2: Vault Audit

```
──────────────────────────────────────────────────────────────
VAULT ANALYSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Vault files encrypted | {yes/no/partial} | {files found} |
| Vault ID strategy | {single/multi/none} | {vault-ids} |
| Password management | {file/env/prompt} | {method} |
| Password file in .gitignore | {yes/no} | {path} |
| Plaintext secrets in vars | {count} | {files} |
| ansible-vault rekey schedule | {yes/no} | {frequency} |
```

Scan for unencrypted secrets, verify vault encryption on expected files, and check ansible.cfg vault settings.

### Step 3: SSH Audit

```
──────────────────────────────────────────────────────────────
SSH SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| SSH key type | {ed25519/rsa/dsa} | {recommendation} |
| Host key checking | {enabled/disabled} | {ansible.cfg setting} |
| ControlMaster | {enabled/disabled} | {multiplexing config} |
| Pipelining | {enabled/disabled} | {ansible.cfg setting} |
| SSH agent forwarding | {enabled/disabled} | {risk assessment} |
| ansible_ssh_common_args | {set/unset} | {value} |
```

### Step 4: Privilege Escalation Audit

```
──────────────────────────────────────────────────────────────
PRIVILEGE ESCALATION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| become usage pattern | {play/task/both} | {scope} |
| become_method | {sudo/su/other} | {method} |
| become_user scope | {root/specific} | {users} |
| NOPASSWD sudoers | {yes/no} | {risk level} |
| Task-level become | {count} | {tasks with become: true} |
| Least privilege | {yes/no} | {over-privileged tasks} |
```

Scan for play-level become (broad scope) and identify tasks that could run without root.

### Step 5: Secrets Management Audit

```
──────────────────────────────────────────────────────────────
SECRETS MANAGEMENT
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| External secrets integration | {yes/no} | {tool: HashiCorp Vault, AWS SM} |
| no_log usage | {adequate/missing} | {tasks exposing secrets} |
| Sensitive variable naming | {consistent/inconsistent} | {convention} |
| .gitignore coverage | {complete/partial} | {missing patterns} |
| CI secrets storage | {secure/exposed} | {method} |
| Secret rotation | {automated/manual/none} | {policy} |
```

Find tasks that may leak secrets without `no_log` and check for hardcoded secrets outside vault files.

### Step 6: Lint Security Audit

```
──────────────────────────────────────────────────────────────
LINT SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| ansible-lint safety profile | {enabled/disabled} | {profile level} |
| FQCN usage | {full/partial} | {% compliance} |
| shell/command overuse | {count} | {tasks using shell} |
| command changed_when | {set/missing} | {tasks missing it} |
| Package pinning | {yes/no} | {unpinned packages} |
| File permissions | {explicit/default} | {tasks missing mode} |
```

Run `ansible-lint -p safety` and check for shell/command tasks without `changed_when`.

### Step 7: Final Report

```
══════════════════════════════════════════════════════════════
SECURITY AUDIT REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Category | Score | Status |
|----------|-------|--------|
| Vault | {x}/100 | {pass/warn/fail} |
| SSH | {x}/100 | {pass/warn/fail} |
| Privilege Escalation | {x}/100 | {pass/warn/fail} |
| Secrets Management | {x}/100 | {pass/warn/fail} |
| Lint Security | {x}/100 | {pass/warn/fail} |
| **Overall** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
CRITICAL FINDINGS
──────────────────────────────────────────────────────────────

1. [ ] {critical finding 1}
2. [ ] {critical finding 2}

──────────────────────────────────────────────────────────────
RECOMMENDATIONS
──────────────────────────────────────────────────────────────

Priority 1 (Immediate):
- [ ] {recommendation}

Priority 2 (This sprint):
- [ ] {recommendation}

Priority 3 (Next quarter):
- [ ] {recommendation}
```
