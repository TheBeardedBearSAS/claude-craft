---
description: Security Review Team - Parallel multi-dimension security audit using Agent Teams
argument-hint: [--scope=full|code|deps|infra] [--max-workers=3]
---

# Security Review Team - Parallel Multi-Dimension Security Audit

Orchestrate a comprehensive security audit using Claude Code Agent Teams (v2.1.32+). Spawns a security lead (opus) plus 3 specialized haiku reviewers, each analyzing a different security dimension in parallel: source code vulnerabilities, dependency/supply chain, and infrastructure/configuration.

## Arguments

$ARGUMENTS

- `--scope=full`: Audit scope (default: `full`). Options: `full`, `code`, `deps`, `infra`
- `--max-workers=3`: Maximum parallel reviewers (default: 3, max: 3)
- `--severity=medium`: Minimum severity to report: `low`, `medium`, `high`, `critical`
- `--output-dir=<path>`: Custom output directory for security results
- `--dry-run`: Show team composition and scan plan without executing
- `--sarif`: Output results in SARIF format (for CI/CD integration)

## Prerequisites

- Claude Code v2.1.32+ with Agent Teams support
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment variable set
- Docker available for running security scanners
- `Tools/AgentTeams/lib/compatibility-check.sh` available
- `Tools/AgentTeams/lib/result-aggregator.sh` available
- `Tools/AgentTeams/lib/cost-estimator.sh` available

## Team Composition

| Role | Model | Agent | Responsibility |
|------|-------|-------|----------------|
| Security Lead | opus | Custom (team lead) | Orchestration, threat modeling, report |
| Code Reviewer | haiku | `{tech}-reviewer` | Source code vulnerability analysis |
| Dependency Auditor | haiku | `{tech}-reviewer` | Supply chain, CVE, license compliance |
| Infra Reviewer | haiku | `devops-engineer` or `docker-architect` | Container security, secrets, config |

**Team size**: 4 agents (1 lead + 3 workers). Fixed composition for security review.

## Process

### Step 1: Project Reconnaissance

The security lead performs initial reconnaissance:

1. Detect technology stacks (same as full-audit detection)
2. Identify entry points: API endpoints, forms, file uploads
3. Map the attack surface: public routes, authentication boundaries, data flows
4. Create threat model outline (STRIDE categories)

### Step 2: Compatibility Check

```bash
# Verify code reviewer agent has required tools
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash

# Verify infra reviewer
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/Common/agents/devops-engineer.md \
  --require-tools Read,Glob,Grep,Bash
```

### Step 3: Team Spawn (Fan-Out)

```
Security Lead (opus) — orchestrates via TaskCreate/SendMessage
  |
  +-- [Parallel Reviewers] ------------------+
  |   Code Reviewer (haiku): Source analysis   |
  |   Dependency Auditor (haiku): Supply chain |
  |   Infra Reviewer (haiku): Configuration    |
  +-------------------------------------------+
  |
  v (sync barrier)
  |
  Security Lead: Correlate, prioritize, report
```

The lead creates 3 tasks via `TaskCreate`:

#### Task A: Source Code Security Review

**Scope**: Application source code vulnerability analysis

| Check | What to Look For | OWASP Category |
|-------|-----------------|----------------|
| Injection | SQL, NoSQL, OS command, LDAP injection patterns | A03:2021 |
| XSS | Unescaped output, innerHTML, dangerouslySetInnerHTML | A03:2021 |
| Authentication | Weak password policies, missing MFA, session fixation | A07:2021 |
| Authorization | Missing access controls, IDOR, privilege escalation | A01:2021 |
| Cryptography | Weak algorithms, hardcoded keys, insecure random | A02:2021 |
| Input Validation | Missing sanitization, type coercion, file upload | A03:2021 |
| Error Handling | Stack traces in responses, verbose errors | A05:2021 |
| Logging | Sensitive data in logs, missing audit trail | A09:2021 |

**Docker commands per stack**:

```bash
# PHP/Symfony
docker compose exec php vendor/bin/phpstan analyse --level=max
docker compose exec php php bin/console security:check

# React/Node
docker compose exec node npm run lint -- --rule 'no-eval: error'
docker compose exec node npx eslint --plugin security .

# Python
docker compose exec app bandit -r src/
docker compose exec app ruff check --select S .

# General (all stacks)
# Grep patterns for common vulnerabilities
# Search for: eval(, exec(, system(, shell_exec(, innerHTML, dangerouslySetInnerHTML
# Search for: hardcoded passwords, API keys, tokens in source
```

#### Task B: Dependency / Supply Chain Audit

**Scope**: Third-party dependency vulnerability and license analysis

| Check | What to Analyze |
|-------|----------------|
| Known CVEs | All direct and transitive dependencies |
| Severity | Critical and High CVEs requiring immediate action |
| License compliance | Copyleft licenses in proprietary projects |
| Outdated packages | Packages with available security patches |
| Typosquatting | Suspicious package names similar to popular packages |
| Unused deps | Dependencies declared but never imported |

**Docker commands per stack**:

```bash
# PHP
docker compose exec php composer audit --format=json
docker compose exec php composer outdated --direct

# Node/React/Angular/Vue
docker compose exec node npm audit --json
docker compose exec node npm outdated

# Python
docker compose exec app pip-audit --format=json
docker compose exec app pip list --outdated

# Flutter/Dart
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated --json

# C#/.NET
docker compose exec app dotnet list package --vulnerable
docker compose exec app dotnet list package --outdated
```

#### Task C: Infrastructure / Configuration Security Review

**Scope**: Docker, deployment configuration, secrets management

| Check | What to Analyze |
|-------|----------------|
| Dockerfile security | Base image pinning, non-root user, multi-stage builds |
| Secrets exposure | .env files, hardcoded credentials, unencrypted secrets |
| Docker Compose | Privileged containers, exposed ports, volume mounts |
| Network policy | Unnecessary port exposure, missing network isolation |
| TLS/SSL | Certificate validation, protocol versions, cipher suites |
| CI/CD security | Secret injection, pipeline permissions, artifact integrity |
| File permissions | World-readable configs, .git exposure, backup files |

**Scan commands**:

```bash
# Docker security
docker compose config --quiet  # Validate compose syntax
# Review Dockerfiles for: USER root, latest tags, ADD vs COPY

# Secrets scan
# Search for: .env files not in .gitignore
# Search for: AWS_SECRET, PRIVATE_KEY, password=, token= in source
# Search for: base64-encoded secrets, SSH keys in repo

# Configuration review
# Check: CORS policies, CSP headers, HSTS
# Check: Debug mode disabled in production configs
# Check: Rate limiting configured
```

### Step 4: Sync Barrier

Security lead waits for all 3 reviewer tasks to complete. Timeout: 8 minutes per reviewer. If a reviewer exceeds timeout, lead proceeds with available results and notes the gap.

### Step 5: Correlation and Prioritization

The security lead correlates findings across all 3 dimensions:

1. **Cross-reference**: A vulnerable dependency (Task B) used in an injection-prone code path (Task A) is elevated to Critical
2. **Attack chain analysis**: Combine findings to identify multi-step attack paths
3. **Deduplicate**: Same issue found by multiple reviewers is merged
4. **Prioritize**: Score each finding by severity x exploitability x impact

**Severity matrix**:

| Severity | CVSS Range | Response |
|----------|-----------|----------|
| Critical | 9.0 - 10.0 | Immediate fix required |
| High | 7.0 - 8.9 | Fix within current sprint |
| Medium | 4.0 - 6.9 | Plan for next sprint |
| Low | 0.1 - 3.9 | Backlog / accept risk |

### Step 6: Report Generation

```
================================================================
SECURITY REVIEW TEAM - Report
================================================================

Project: <project-name>
Date: YYYY-MM-DD
Scope: <full|code|deps|infra>
Team: 1 lead + 3 reviewers

================================================================
EXECUTIVE SUMMARY
================================================================

| Severity | Count |
|----------|-------|
| Critical | X |
| High | X |
| Medium | X |
| Low | X |
| Total | X |

Overall Risk Level: <Critical|High|Medium|Low>

================================================================
FINDINGS BY DIMENSION
================================================================

-- SOURCE CODE (Code Reviewer) --

| # | Severity | Category | File | Description |
|---|----------|----------|------|-------------|
| 1 | HIGH | A03:Injection | src/... | SQL injection in... |
| 2 | MEDIUM | A07:Auth | src/... | Weak password... |

-- DEPENDENCIES (Dependency Auditor) --

| # | Severity | Package | Version | CVE | Fix Available |
|---|----------|---------|---------|-----|---------------|
| 1 | CRITICAL | lib-x | 1.2.3 | CVE-2026-XXXX | 1.2.4 |
| 2 | HIGH | lib-y | 4.5.6 | CVE-2026-YYYY | 5.0.0 |

-- INFRASTRUCTURE (Infra Reviewer) --

| # | Severity | Component | Description |
|---|----------|-----------|-------------|
| 1 | HIGH | Dockerfile | Running as root |
| 2 | MEDIUM | .env | Not in .gitignore |

================================================================
ATTACK CHAINS (Correlated Findings)
================================================================

Chain 1: SQL Injection via vulnerable dependency
  Step 1: Outdated ORM library (CVE-2026-XXXX)
  Step 2: User input reaches query builder without sanitization
  Impact: Database compromise
  Severity: CRITICAL

================================================================
REMEDIATION PLAN
================================================================

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 1 | Update lib-x to 1.2.4 | Low | Fixes CVE-2026-XXXX |
| 2 | Add input sanitization in src/... | Medium | Blocks injection |
| 3 | Switch to non-root Docker user | Low | Reduces blast radius |

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Total time | Xs (vs ~Ys sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Findings discovered | X |
| Reviewers completed | 3/3 |
```

### Step 7: Cleanup

Security lead sends `shutdown_request` to all reviewers and cleans up isolated output directories.

## Performance Expectations

| Scope | Sequential Est. | Team Est. | Speedup | Token Overhead |
|-------|----------------|-----------|---------|----------------|
| Code only | ~5 min | ~5 min | 1x (no parallelism) | 0% |
| Deps only | ~3 min | ~3 min | 1x (no parallelism) | 0% |
| Full | ~12 min | ~6 min | ~2x | +30% |

**Note**: Full scope benefits from 3-way parallelism. Individual scopes (`--scope=code`) run as single-worker tasks with no team overhead.

## Error Handling

| Error | Recovery |
|-------|----------|
| Reviewer timeout (>8min) | Lead proceeds with partial results, notes gap |
| Reviewer crash | Lead logs error, reports dimension as "not assessed" |
| Docker not available | Reviewer falls back to source-only pattern analysis |
| No vulnerabilities found | Report states clean status (not an error) |
| Scanner tool not installed | Reviewer skips scanner, uses grep-based analysis |

## Limitations

- Fixed team of 4 agents (1 lead + 3 reviewers)
- Cannot replace specialized security tools (SAST/DAST/SCA) -- supplements them
- Findings depend on model's security knowledge (no zero-day detection)
- Token cost ~30% higher than sequential due to context duplication
- Requires Agent Teams Research Preview (API may change)
- Attack chain correlation quality depends on lead agent's reasoning capability
