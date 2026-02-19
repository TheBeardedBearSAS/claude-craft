---
description: Optimize Ansible performance and playbook quality
argument-hint: [target]
---

# Ansible Optimize

Voce e um especialista em otimizacao Ansible. Voce deve analisar a performance dos playbooks e fornecer recomendacoes acionaveis para melhorias de velocidade, qualidade e manutenibilidade.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Alvo: performance, quality, both (padrao: both)

Exemplo: `/ansible:optimize target:performance`

## Plan Mode

> **Plan mode e recomendado.** Claude analisa a estrutura atual dos playbooks e padroes de execucao antes de propor otimizacoes.

## MISSAO

### Passo 1: Analise de Performance

```
══════════════════════════════════════════════════════════════
ANSIBLE OPTIMIZATION
══════════════════════════════════════════════════════════════

Alvo: {performance/quality/both}

──────────────────────────────────────────────────────────────
PERFIL DE PERFORMANCE ATUAL
──────────────────────────────────────────────────────────────

| Configuracao | Atual | Recomendado | Impacto |
|-------------|-------|-------------|---------|
| forks | {value} | 20-50 | Paralelismo |
| pipelining | {habilitado/desabilitado} | habilitado | Roundtrips SSH |
| fact_caching | {none/jsonfile/redis} | jsonfile/redis | Coleta de facts |
| gather_facts | {yes/no/smart} | smart | Tempo de inicializacao |
| strategy | {linear/free/host_pinned} | free (quando seguro) | Ordem de execucao |
| SSH multiplexing | {habilitado/desabilitado} | habilitado | Reutilizacao de conexao |
```

Analisar com `ANSIBLE_CALLBACKS_ENABLED=timer,profile_tasks` e medir overhead de conexao com `ansible.builtin.ping`.

### Passo 2: Otimizacao de Conexao

```
──────────────────────────────────────────────────────────────
AJUSTE DE CONEXAO
──────────────────────────────────────────────────────────────
```

Gerar configuracoes de conexao otimizadas no `ansible.cfg`:

```ini
[defaults]
forks = 25
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout = 86400
callbacks_enabled = timer, profile_tasks

[ssh_connection]
pipelining = True
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
control_path_dir = ~/.ansible/cp
```

| Otimizacao | Antes | Depois | Melhoria |
|-----------|-------|--------|----------|
| Pipelining | desabilitado | habilitado | ~2x mais rapido por task |
| ControlMaster | desabilitado | auto | Reutiliza conexoes SSH |
| Cache de facts | none | jsonfile | Pula gather_facts |
| Forks | 5 | 25 | 5x paralelismo |

### Passo 3: Otimizacao de Playbook

```
──────────────────────────────────────────────────────────────
AJUSTE DE PLAYBOOK
──────────────────────────────────────────────────────────────

| Padrao | Atual | Recomendacao | Impacto |
|--------|-------|--------------|---------|
| gather_facts | sempre | smart / por play | Reduzir inicializacao |
| import vs include | {misto} | import para estatico, include para dinamico | Previsibilidade |
| Batching serial | {value} | serial: "30%" para rolling | Disponibilidade |
| Tasks assincronas | {count} | Usar para tarefas longas (>30s) | Paralelismo |
| Estrategia free | {usado/nao usado} | Usar para tasks independentes | Tempo de execucao |
| Tags | {usadas/nao usadas} | Taguear todas as tasks para execucoes seletivas | Flexibilidade |
```

Padroes de otimizacao chave:
- **Async** para tasks >30s: `async: 300, poll: 10`
- **Estrategia free** para hosts independentes: `strategy: free`
- **Facts seletivos**: `gather_subset: [network]` em vez de coleta completa
- **Chamadas de modulo em lote**: passar lista para `ansible.builtin.apt name:` em vez de loop

### Passo 4: Analise de Qualidade

```
──────────────────────────────────────────────────────────────
AUDITORIA DE QUALIDADE
──────────────────────────────────────────────────────────────

| Verificacao | Pontuacao | Detalhes |
|-------------|-----------|----------|
| Conformidade ansible-lint | {x}/100 | {contagem de violacoes} |
| Uso de FQCN | {x}% | {tasks sem FQCN} |
| Idempotencia | {pass/fail} | {tasks nao idempotentes} |
| Design de roles | {bom/precisa melhorar} | {roles monoliticas} |
| Nomenclatura de variaveis | {consistente/inconsistente} | {violacoes de convencao} |
| Uso de handlers | {adequado/ausente} | {restart sem handler} |
| Cobertura de tags | {x}% | {tasks sem tag} |
| Cobertura Molecule | {x}% | {roles sem teste} |
```

Executar `ansible-lint`, verificar tasks shell/command nao idempotentes sem `changed_when`/`creates`/`removes` e validar conformidade FQCN.

### Passo 5: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE OTIMIZACAO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMO
──────────────────────────────────────────────────────────────

| Otimizacao | Impacto | Esforco | Prioridade |
|-----------|---------|---------|------------|
| Habilitar pipelining | Alto | Baixo | 1 |
| Habilitar cache de facts | Alto | Baixo | 2 |
| Aumentar forks | Medio | Baixo | 3 |
| Otimizar loops | Medio | Medio | 4 |
| Adicionar async para tasks longas | Medio | Medio | 5 |
| Corrigir violacoes ansible-lint | Medio | Medio | 6 |
| Adicionar testes Molecule | Alto | Alto | 7 |

──────────────────────────────────────────────────────────────
ARQUIVOS GERADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descricao |
|---------|-----------|
| ansible.cfg | Configuracao Ansible otimizada |
| .ansible-lint | Configuracao de lint atualizada |
| {playbook} | Playbook refatorado com otimizacoes |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar ajustes do ansible.cfg em todos os ambientes
2. [ ] Executar testes molecule para validar ausencia de regressoes
3. [ ] Configurar pipeline CI com /ansible:deploy-setup
4. [ ] Auditar postura de seguranca com /ansible:security-audit
5. [ ] Monitorar tempos de execucao com profiling de callbacks
```
