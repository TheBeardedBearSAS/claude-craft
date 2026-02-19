---
description: Audit Ansible security posture
argument-hint: [scope]
---

# Ansible Security Audit

Voce e um especialista em seguranca Ansible. Voce deve realizar uma auditoria de seguranca abrangente do projeto Ansible.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Escopo: vault, ssh, become, secrets, lint, full (padrao: full)

Exemplo: `/ansible:security-audit scope:full`

## Plan Mode

> **Plan mode e condicional.** Ativa automaticamente quando o escopo e "full" para apresentar o plano de auditoria antes de prosseguir.

## MISSAO

### Passo 1: Definicao de Escopo

```
══════════════════════════════════════════════════════════════
ANSIBLE SECURITY AUDIT
══════════════════════════════════════════════════════════════

Escopo: {vault, ssh, become, secrets, lint, full}

──────────────────────────────────────────────────────────────
ESCOPO DA AUDITORIA
──────────────────────────────────────────────────────────────

| Categoria | Incluido | Peso |
|-----------|----------|------|
| Vault | {yes/no} | 25% |
| SSH | {yes/no} | 20% |
| Escalacao de Privilegios | {yes/no} | 20% |
| Gerenciamento de Secrets | {yes/no} | 20% |
| Lint de Seguranca | {yes/no} | 15% |
```

### Passo 2: Auditoria de Vault

```
──────────────────────────────────────────────────────────────
ANALISE DE VAULT
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Arquivos vault criptografados | {yes/no/parcial} | {files found} |
| Estrategia de vault ID | {unico/multi/nenhum} | {vault-ids} |
| Gerenciamento de senha | {file/env/prompt} | {method} |
| Arquivo de senha no .gitignore | {yes/no} | {path} |
| Secrets em texto plano nas vars | {count} | {files} |
| Cronograma de rekey do ansible-vault | {yes/no} | {frequency} |
```

Verificar secrets nao criptografados, validar criptografia vault nos arquivos esperados e checar configuracoes de vault no ansible.cfg.

### Passo 3: Auditoria de SSH

```
──────────────────────────────────────────────────────────────
SEGURANCA SSH
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Tipo de chave SSH | {ed25519/rsa/dsa} | {recommendation} |
| Verificacao de chave de host | {habilitado/desabilitado} | {ansible.cfg setting} |
| ControlMaster | {habilitado/desabilitado} | {multiplexing config} |
| Pipelining | {habilitado/desabilitado} | {ansible.cfg setting} |
| SSH agent forwarding | {habilitado/desabilitado} | {risk assessment} |
| ansible_ssh_common_args | {definido/indefinido} | {value} |
```

### Passo 4: Auditoria de Escalacao de Privilegios

```
──────────────────────────────────────────────────────────────
ESCALACAO DE PRIVILEGIOS
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Padrao de uso do become | {play/task/ambos} | {scope} |
| become_method | {sudo/su/outro} | {method} |
| Escopo do become_user | {root/especifico} | {users} |
| NOPASSWD no sudoers | {yes/no} | {risk level} |
| Become no nivel de task | {count} | {tasks com become: true} |
| Privilegio minimo | {yes/no} | {tasks com privilegio excessivo} |
```

Verificar become no nivel de play (escopo amplo) e identificar tasks que poderiam executar sem root.

### Passo 5: Auditoria de Gerenciamento de Secrets

```
──────────────────────────────────────────────────────────────
GERENCIAMENTO DE SECRETS
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Integracao de secrets externo | {yes/no} | {ferramenta: HashiCorp Vault, AWS SM} |
| Uso de no_log | {adequado/ausente} | {tasks expondo secrets} |
| Nomenclatura de variaveis sensiveis | {consistente/inconsistente} | {convencao} |
| Cobertura do .gitignore | {completa/parcial} | {padroes ausentes} |
| Armazenamento de secrets no CI | {seguro/exposto} | {method} |
| Rotacao de secrets | {automatizada/manual/nenhuma} | {policy} |
```

Encontrar tasks que possam vazar secrets sem `no_log` e verificar secrets hardcoded fora dos arquivos vault.

### Passo 6: Auditoria de Lint de Seguranca

```
──────────────────────────────────────────────────────────────
LINT DE SEGURANCA
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Perfil safety do ansible-lint | {habilitado/desabilitado} | {profile level} |
| Uso de FQCN | {completo/parcial} | {% conformidade} |
| Uso excessivo de shell/command | {count} | {tasks usando shell} |
| changed_when em command | {definido/ausente} | {tasks sem ele} |
| Fixacao de versao de pacotes | {yes/no} | {pacotes sem versao fixada} |
| Permissoes de arquivo | {explicito/padrao} | {tasks sem mode} |
```

Executar `ansible-lint -p safety` e verificar tasks shell/command sem `changed_when`.

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
| Vault | {x}/100 | {pass/warn/fail} |
| SSH | {x}/100 | {pass/warn/fail} |
| Escalacao de Privilegios | {x}/100 | {pass/warn/fail} |
| Gerenciamento de Secrets | {x}/100 | {pass/warn/fail} |
| Lint de Seguranca | {x}/100 | {pass/warn/fail} |
| **Geral** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
ACHADOS CRITICOS
──────────────────────────────────────────────────────────────

1. [ ] {achado critico 1}
2. [ ] {achado critico 2}

──────────────────────────────────────────────────────────────
RECOMENDACOES
──────────────────────────────────────────────────────────────

Prioridade 1 (Imediato):
- [ ] {recomendacao}

Prioridade 2 (Neste sprint):
- [ ] {recomendacao}

Prioridade 3 (Proximo trimestre):
- [ ] {recomendacao}
```
