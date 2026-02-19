---
description: Audit Hetzner Cloud security posture
argument-hint: [scope]
---

# Hcloud Security Audit

Voce e um especialista em seguranca Hetzner Cloud. Voce deve realizar uma auditoria de seguranca abrangente da infraestrutura Hetzner Cloud.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Escopo: firewall, ssh, network, tokens, certificates, full (padrao: full)

Exemplo: `/hcloud:security-audit scope:full`

## Plan Mode

> **O modo plan e condicional.** Ativa automaticamente quando o escopo e "full" para apresentar o plano de auditoria antes de prosseguir.

## MISSION

### Passo 1: Definicao de Escopo

```
══════════════════════════════════════════════════════════════
HCLOUD SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope: {firewall, ssh, network, tokens, certificates, full}

──────────────────────────────────────────────────────────────
AUDIT SCOPE
──────────────────────────────────────────────────────────────

| Category | Included | Weight |
|----------|----------|--------|
| Firewalls | {yes/no} | 25% |
| SSH & Access | {yes/no} | 20% |
| Network Isolation | {yes/no} | 20% |
| API Tokens | {yes/no} | 20% |
| TLS & Certificates | {yes/no} | 15% |
```

### Passo 2: Auditoria de Firewall

```
──────────────────────────────────────────────────────────────
FIREWALL ANALYSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Todos os servidores tem firewalls | {yes/no} | {servidores desprotegidos} |
| SSH restrito a IPs conhecidos | {yes/no} | {aberto para 0.0.0.0/0?} |
| Portas de DB somente privadas | {yes/no} | {portas expostas} |
| Label selectors utilizados | {yes/no} | {estatico vs dinamico} |
| Deny-by-default | {yes/no} | {regras excessivamente permissivas} |
| Regras IPv6 correspondem a IPv4 | {yes/no} | {regras ausentes} |
```

Escanear todos os firewalls, verificar servidores sem protecao de firewall e identificar regras excessivamente permissivas.

### Passo 3: Auditoria de SSH e Acesso

```
──────────────────────────────────────────────────────────────
SSH & ACCESS SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Algoritmo de chave SSH | {ed25519/rsa} | {recomendacao} |
| Autenticacao por senha desabilitada | {yes/no} | {verificacao cloud-init} |
| fail2ban configurado | {yes/no} | {em quais servidores} |
| Politica de login root | {prohibit-password/yes/no} | {configuracao} |
| Porta SSH | {22/custom} | {protecao de firewall} |
| Rotacao de chaves | {agendada/nenhuma} | {ultima rotacao} |
```

### Passo 4: Auditoria de Isolamento de Rede

```
──────────────────────────────────────────────────────────────
NETWORK ISOLATION
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Rede privada utilizada | {yes/no} | {nome da rede} |
| Segmentacao de sub-redes | {yes/no} | {camadas web/app/data} |
| DB sem IP publico | {yes/no} | {bancos de dados expostos} |
| Padrao bastion host | {yes/no} | {metodo de acesso} |
| Inter-servico via rede privada | {yes/no} | {uso de IP publico} |
```

### Passo 5: Auditoria de Token de API

```
──────────────────────────────────────────────────────────────
API TOKEN SECURITY
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Tokens por ambiente | {yes/no} | {tokens compartilhados?} |
| Tokens somente leitura para CI | {yes/no} | {escopo} |
| Token em CI secrets | {yes/no} | {metodo de armazenamento} |
| Cronograma de rotacao de tokens | {yes/no} | {frequencia} |
| Sem tokens no codigo | {yes/no} | {tokens vazados} |
```

### Passo 6: Auditoria de TLS e Certificados

```
──────────────────────────────────────────────────────────────
TLS & CERTIFICATES
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| TLS no load balancer | {yes/no} | {protocolo} |
| Certificados gerenciados | {yes/no} | {renovacao automatica} |
| Redirecionamento HTTP para HTTPS | {yes/no} | {configurado} |
| Expiracao do certificado | {ok/warning} | {dias restantes} |
| Trafego interno criptografado | {yes/no/private-net} | {metodo} |
```

### Passo 7: Relatorio Final

```
══════════════════════════════════════════════════════════════
SECURITY AUDIT REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Category | Score | Status |
|----------|-------|--------|
| Firewalls | {x}/100 | {pass/warn/fail} |
| SSH & Access | {x}/100 | {pass/warn/fail} |
| Network Isolation | {x}/100 | {pass/warn/fail} |
| API Tokens | {x}/100 | {pass/warn/fail} |
| TLS & Certificates | {x}/100 | {pass/warn/fail} |
| **Overall** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
CRITICAL FINDINGS
──────────────────────────────────────────────────────────────

1. [ ] {achado critico 1}
2. [ ] {achado critico 2}

──────────────────────────────────────────────────────────────
RECOMMENDATIONS
──────────────────────────────────────────────────────────────

Prioridade 1 (Imediata):
- [ ] {recomendacao}

Prioridade 2 (Neste sprint):
- [ ] {recomendacao}

Prioridade 3 (Proximo trimestre):
- [ ] {recomendacao}
```
