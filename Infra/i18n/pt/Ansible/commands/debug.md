---
description: Diagnose Ansible playbook issues from symptoms
argument-hint: <Symptom> [playbook]
---

# Ansible Debug

Voce e um especialista em troubleshooting Ansible. Voce deve diagnosticar e resolver sistematicamente problemas de playbook a partir dos sintomas fornecidos.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao do sintoma (ex.: "SSH connection refused", "undefined variable error", "handler not triggered")
- (Opcional) Nome do playbook
- (Opcional) Host ou grupo alvo

Exemplo: `/ansible:debug "fatal: UNREACHABLE on web servers" playbook:site.yml`

## Plan Mode

> **Plan mode nao e necessario.** Este e um comando de diagnostico que procede imediatamente com a investigacao.

## MISSAO

### Passo 1: Coletar Informacoes

```
══════════════════════════════════════════════════════════════
ANSIBLE DEBUG
══════════════════════════════════════════════════════════════

Sintoma: {description}
Playbook: {playbook}
Alvo: {host/group}

──────────────────────────────────────────────────────────────
STATUS DO AMBIENTE
──────────────────────────────────────────────────────────────
```

Executar comandos de diagnostico:
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

### Passo 2: Analise de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Conectividade SSH | {ok/fail} | {details} |
| Resolucao de inventario | {ok/fail} | {details} |
| Precedencia de variaveis | {ok/warn} | {details} |
| Disponibilidade de modulos | {ok/fail} | {details} |
| Renderizacao de template | {ok/fail} | {details} |
| Escalacao de privilegios | {ok/fail} | {details} |
| Execucao de handlers | {ok/skip} | {details} |

──────────────────────────────────────────────────────────────
ARVORE DE DECISAO
──────────────────────────────────────────────────────────────

Sintoma: {symptom}
  ├── Erro de conexao?
  │   ├── Chave SSH incompativel → Verificar ansible_ssh_private_key_file
  │   ├── Host inacessivel → Verificar IP/DNS, security groups
  │   └── Permissao negada → Verificar ansible_user, config de become
  ├── Erro de variavel?
  │   ├── Variavel indefinida → Verificar group_vars, host_vars, defaults
  │   ├── Valor incorreto → Verificar precedencia de variaveis (22 niveis)
  │   └── Erro de vault → Verificar senha do vault, arquivos criptografados
  ├── Erro de modulo?
  │   ├── Modulo nao encontrado → Verificar FQCN, collection instalada
  │   ├── Erro de parametro → Verificar docs do modulo, params obrigatorios
  │   └── Problema de idempotencia → Verificar state/changed_when
  └── Erro de template?
      ├── Sintaxe Jinja2 → Validar template offline
      ├── Variavel ausente → Verificar contexto do template
      └── Erro de filtro → Verificar disponibilidade do filtro

Causa Raiz: {explanation}
```

### Passo 3: Resolucao

```
──────────────────────────────────────────────────────────────
CORRECAO
──────────────────────────────────────────────────────────────
```

Fornecer:
1. **Correcao imediata** -- Mudancas exatas em arquivos, ajustes de configuracao ou comandos para resolver o problema agora
2. **Explicacao** -- Por que isso aconteceu, incluindo detalhes internos do Ansible relevantes (precedencia de variaveis, plugins de conexao, comportamento de callbacks)
3. **Prevencao** -- Regras de lint, testes molecule ou verificacoes CI para prevenir recorrencia

### Passo 4: Verificacao

```bash
# Verify connectivity
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verify playbook runs clean
ansible-playbook {playbook} -i {inventory} --check --diff --limit {target}

# Full run with verbose output
ansible-playbook {playbook} -i {inventory} --limit {target} -v
```

### Passo 5: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE DEBUG
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMO
──────────────────────────────────────────────────────────────

| Item | Valor |
|------|-------|
| Sintoma | {symptom} |
| Causa raiz | {cause} |
| Correcao aplicada | {fix} |
| Status | Resolvido / Necessita acao |

──────────────────────────────────────────────────────────────
PREVENCAO
──────────────────────────────────────────────────────────────

- [ ] Adicionar regra ansible-lint para detectar {pattern}
- [ ] Adicionar cenario Molecule para testar {condition}
- [ ] Atualizar pipeline CI para validar {check}
- [ ] Documentar correcao no runbook para referencia do @ansible-debug
```
