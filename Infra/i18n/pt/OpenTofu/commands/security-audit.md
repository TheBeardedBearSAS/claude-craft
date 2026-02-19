---
description: Auditar postura de segurança do OpenTofu
argument-hint: [Escopo]
---

# OpenTofu Security Audit

Você é um especialista em segurança OpenTofu. Você deve realizar uma auditoria de segurança abrangente da configuração de IaC.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Escopo: encryption, secrets, iam, policies, full (padrão: full)
- (Opcional) Caminho para o diretório de configuração

Exemplo: `/opentofu:security-audit scope:full path:infra/`

## Modo Plan

> **O modo plan é condicional.** Ativa automaticamente quando o escopo é "full" ou abrange múltiplos ambientes.

## MISSÃO

### Etapa 1: Definição de Escopo

```
══════════════════════════════════════════════════════════════
OPENTOFU SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {full / encryption / secrets / iam / policies}
Path: {configuration path}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────
```

### Etapa 2: Auditoria de Criptografia de Estado

```
──────────────────────────────────────────────────────────────
STATE ENCRYPTION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Native encryption (v1.7+) | {enabled/disabled} | {method} |
| Backend encryption | {enabled/disabled} | {type} |
| Plan encryption | {enabled/disabled} | {details} |
| Key management | {KMS/PBKDF2/none} | {details} |
```

### Etapa 3: Auditoria de Segredos

```
──────────────────────────────────────────────────────────────
SECRETS MANAGEMENT
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Hardcoded secrets | {count} | {files} |
| Sensitive variables | {%} | {missing list} |
| Ephemeral values | {used/not} | {v1.11+} |
| .tfvars in VCS | {yes/no} | {files} |
| CI/CD credentials | {OIDC/static} | {details} |
```

### Etapa 4: Auditoria de IAM e Acesso

```
──────────────────────────────────────────────────────────────
ACCESS CONTROL
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| IAM least privilege | {yes/no} | {overly broad policies} |
| State backend ACL | {scoped/open} | {details} |
| CI/CD separation | {plan/apply roles} | {details} |
| Manual apply disabled | {yes/no} | {details} |
```

### Etapa 5: Auditoria de Políticas e Conformidade

```
──────────────────────────────────────────────────────────────
POLICY ENFORCEMENT
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| tfsec/checkov | {integrated/no} | {findings} |
| OPA policies | {yes/no} | {count} |
| Provider lock file | {committed/missing} | {details} |
| Tag compliance | {enforced/no} | {details} |
```

### Etapa 6: Relatório Final

```
══════════════════════════════════════════════════════════════
SECURITY AUDIT REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Category | Score | Status |
|----------|-------|--------|
| State Encryption | {x}/100 | {pass/warn/fail} |
| Secrets Management | {x}/100 | {pass/warn/fail} |
| Access Control | {x}/100 | {pass/warn/fail} |
| Policy Enforcement | {x}/100 | {pass/warn/fail} |
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
