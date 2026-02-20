---
description: Audit PgBouncer security posture
argument-hint: [scope]
---

# Auditoria de Seguranca PgBouncer

Voce e um especialista em seguranca PgBouncer. Voce deve realizar uma auditoria de seguranca abrangente do deployment PgBouncer.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Escopo: auth, tls, access, admin, network, full (padrao: full)

Exemplo: `/pgbouncer:security-audit scope:full`

## Plan Mode

> **Plan mode e condicional.** Ativa automaticamente quando o escopo e "full" para apresentar o plano de auditoria antes de prosseguir.

## MISSAO

### Passo 1: Definicao do Escopo

```
══════════════════════════════════════════════════════════════
AUDITORIA DE SEGURANCA PGBOUNCER
══════════════════════════════════════════════════════════════

Escopo: {auth, tls, access, admin, network, full}

──────────────────────────────────────────────────────────────
ESCOPO DA AUDITORIA
──────────────────────────────────────────────────────────────

| Categoria | Incluida | Peso |
|-----------|----------|------|
| Autenticacao | {sim/nao} | 25% |
| Criptografia TLS | {sim/nao} | 25% |
| Controle de Acesso | {sim/nao} | 20% |
| Seguranca Admin | {sim/nao} | 15% |
| Seguranca de Rede | {sim/nao} | 15% |
```

### Passo 2: Auditoria de Autenticacao

```
──────────────────────────────────────────────────────────────
AUTENTICACAO
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| auth_type | {scram/md5/trust} | {recomendacao} |
| Permissoes auth_file | {0600/outro} | {proprietario} |
| auth_query usado | {sim/nao} | {nome da funcao} |
| auth_hba_file | {sim/nao} | {contagem de regras} |
| Forca da senha | {forte/fraca} | {politica} |
| Rotacao de credenciais | {agendada/nenhuma} | {frequencia} |
```

### Passo 3: Auditoria TLS

```
──────────────────────────────────────────────────────────────
CRIPTOGRAFIA TLS
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| Modo TLS cliente | {require/prefer/disable} | {configuracao} |
| Modo TLS servidor | {verify-full/require/disable} | {configuracao} |
| Versao protocolo TLS | {1.3/1.2/1.1} | {recomendacao} |
| Validade do certificado | {valido/expirando/expirado} | {dias restantes} |
| Permissoes do key file | {0600/outro} | {proprietario} |
| Forca do cipher | {HIGH/MEDIUM/LOW} | {lista de ciphers} |
```

### Passo 4: Auditoria de Controle de Acesso

```
──────────────────────────────────────────────────────────────
CONTROLE DE ACESSO
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| auth_hba_file configurado | {sim/nao} | {caminho} |
| Restricoes por IP | {sim/nao} | {regras} |
| Limites de conexao por usuario | {sim/nao} | {max_user_connections} |
| Limites de conexao por banco | {sim/nao} | {max_db_connections} |
| Acesso wildcard a banco | {restrito/aberto} | {config} |
```

### Passo 5: Auditoria de Seguranca Admin

```
──────────────────────────────────────────────────────────────
SEGURANCA ADMIN
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| admin_users restrito | {sim/nao} | {usuarios} |
| stats_users restrito | {sim/nao} | {usuarios} |
| Admin apenas localhost | {sim/nao} | {listen_addr} |
| Forca da senha admin | {forte/fraca} | {avaliacao} |
| Log de conexoes habilitado | {sim/nao} | {configuracao} |
```

### Passo 6: Auditoria de Seguranca de Rede

```
──────────────────────────────────────────────────────────────
SEGURANCA DE REDE
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| listen_addr restrito | {sim/nao} | {interfaces} |
| Firewall na porta 6432 | {sim/nao} | {regras} |
| Unix socket disponivel | {sim/nao} | {permissoes} |
| Processo roda como nao-root | {sim/nao} | {usuario} |
| Permissoes do config file | {0600/outro} | {proprietario} |
```

### Passo 7: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE AUDITORIA DE SEGURANCA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
PONTUACAO
──────────────────────────────────────────────────────────────

| Categoria | Pontuacao | Status |
|-----------|-----------|--------|
| Autenticacao | {x}/100 | {pass/warn/fail} |
| Criptografia TLS | {x}/100 | {pass/warn/fail} |
| Controle de Acesso | {x}/100 | {pass/warn/fail} |
| Seguranca Admin | {x}/100 | {pass/warn/fail} |
| Seguranca de Rede | {x}/100 | {pass/warn/fail} |
| **Geral** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
DESCOBERTAS CRITICAS
──────────────────────────────────────────────────────────────

1. [ ] {descoberta critica 1}
2. [ ] {descoberta critica 2}

──────────────────────────────────────────────────────────────
RECOMENDACOES
──────────────────────────────────────────────────────────────

Prioridade 1 (Imediata):
- [ ] {recomendacao}

Prioridade 2 (Este sprint):
- [ ] {recomendacao}

Prioridade 3 (Proximo trimestre):
- [ ] {recomendacao}
```
