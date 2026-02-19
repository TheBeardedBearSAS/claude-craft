---
description: Setup CI/CD pipeline for Ansible automation
argument-hint: <Platform> [ci-tool]
---

# Ansible Deploy Setup

You are an Ansible deployment specialist. You must configure a complete CI/CD pipeline for Ansible playbook execution.

## Arguments
$ARGUMENTS

Arguments:
- Platform description
- (Optional) CI tool: github-actions, gitlab-ci (default: github-actions)
- (Optional) Controller: awx, semaphore, none

Example: `/ansible:deploy-setup "Web infrastructure" ci:github-actions controller:awx`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze the project, propose a pipeline strategy, and wait for validation.

## MISSION

### Step 1: Analyze Project

```
══════════════════════════════════════════════════════════════
ANSIBLE DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
STACK DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Details |
|-----------|----------|---------|
| Playbooks | {count} | {paths} |
| Roles | {count} | {names} |
| Collections | {count} | {names} |
| Vault usage | {yes/no} | {encrypted files} |
| Inventories | {count} | {environments} |
| Molecule tests | {yes/no} | {scenarios} |
```

### Step 2: Design Pipeline

```
──────────────────────────────────────────────────────────────
PIPELINE STRATEGY
──────────────────────────────────────────────────────────────

CI Tool: {GitHub Actions / GitLab CI}
Controller: {AWX / Semaphore / None}

Pipeline:
  Push / PR
    → Lint: ansible-lint + yamllint
    → Test: molecule converge + verify
    → Dry Run: ansible-playbook --check --diff
    → Deploy Staging: run playbook against staging
    → Approval Gate: manual approval for production
    → Deploy Prod: run playbook against production

──────────────────────────────────────────────────────────────
STRATEGY SELECTION
──────────────────────────────────────────────────────────────

| Stage | Tool | Trigger | Artifacts |
|-------|------|---------|-----------|
| Lint | ansible-lint | On push/PR | Lint report |
| Test | Molecule | On push/PR | Test results |
| Dry Run | ansible-playbook --check | On merge to main | Diff output |
| Deploy Staging | {controller/direct} | On merge to main | Run log |
| Deploy Prod | {controller/direct} | Manual approval | Run log |
```

### Step 3: Generate CI Pipeline

Generate the CI/CD configuration file:

For **GitHub Actions** (`.github/workflows/ansible.yml`):
- Install Ansible and dependencies from `requirements.yml`
- Run `yamllint` and `ansible-lint` on all playbooks and roles
- Execute `molecule test` for each role with a test scenario
- Run `ansible-playbook --check --diff` for syntax and dry-run validation
- Deploy to staging on merge to main
- Deploy to production with manual approval gate
- Use GitHub Secrets for vault password and SSH keys

For **GitLab CI** (`.gitlab-ci.yml`):
- Use stages: lint, test, deploy-staging, deploy-prod
- Cache Ansible collections between runs
- Use protected variables for vault password and SSH keys

### Step 4: Generate Controller Config

If controller is **AWX**:
- Organization, Project, and Inventory definitions
- Job Template for each playbook with survey variables
- Workflow Template chaining lint -> deploy staging -> deploy prod
- Credential types for vault password, SSH key, and cloud credentials

If controller is **Semaphore**:
- Project configuration with Git repository
- Environment definitions per inventory
- Task templates for each playbook
- Scheduling configuration for recurring tasks

### Step 5: Generate Execution Environment

Generate `execution-environment.yml` for `ansible-builder`:

```yaml
---
version: 3
dependencies:
  galaxy: requirements.yml
  python: requirements.txt
  system: bindep.txt
images:
  base_image:
    name: quay.io/ansible/ansible-runner:latest
additional_build_steps:
  append_final:
    - RUN pip3 install --upgrade pip
```

This ensures a reproducible execution environment across CI, AWX, and developer workstations.

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
SETUP REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| .github/workflows/ansible.yml | CI/CD pipeline |
| execution-environment.yml | Ansible Builder EE definition |
| .yamllint.yml | YAML lint configuration |
| .ansible-lint | Ansible lint configuration |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Install AWX/Semaphore on controller host (if applicable)
2. [ ] Store vault password in CI secrets (ANSIBLE_VAULT_PASSWORD)
3. [ ] Store SSH private key in CI secrets (ANSIBLE_SSH_KEY)
4. [ ] Test pipeline end-to-end on a feature branch
5. [ ] Setup monitoring and notification with @ansible-quality
6. [ ] Audit security posture with /ansible:security-audit
```
