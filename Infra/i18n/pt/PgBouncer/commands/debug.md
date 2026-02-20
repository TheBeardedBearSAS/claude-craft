---
description: Diagnose PgBouncer connection pool issues from symptoms
argument-hint: <Symptom> [resource]
---

# PgBouncer Debug

Voce e um especialista em troubleshooting PgBouncer. Voce deve diagnosticar e resolver sistematicamente problemas de connection pool a partir dos sintomas fornecidos.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao do sintoma (ex: "clients waiting", "authentication failed", "prepared statement error")
- (Opcional) Nome do banco de dados
- (Opcional) Pool mode

Exemplo: `/pgbouncer:debug "clients waiting for connections, cl_waiting=50"`

## Plan Mode

> **Plan mode nao e necessario.** Este e um comando de diagnostico que procede imediatamente com a investigacao.

## MISSAO

### Passo 1: Coletar Informacoes

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEBUG
══════════════════════════════════════════════════════════════

Sintoma: {descricao}
Banco de dados: {database}
Pool mode: {transaction/session}

──────────────────────────────────────────────────────────────
STATUS DO POOL
──────────────────────────────────────────────────────────────
```

Executar comandos de diagnostico via console admin do PgBouncer:
```sql
SHOW POOLS;
SHOW CLIENTS;
SHOW SERVERS;
SHOW STATS;
SHOW CONFIG;
SHOW DATABASES;
```

### Passo 2: Analise de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| PgBouncer rodando | {sim/nao} | {pid, uptime} |
| Utilizacao do pool | {x}% | {sv_active/pool_size} |
| Clientes esperando | {count} | {tempo max de espera} |
| Status de auth | {ok/falhando} | {metodo} |
| Conectividade com servidor | {ok/falhando} | {PG alcancavel} |
| Compatibilidade transaction mode | {ok/problemas} | {prepared stmts, SET} |

──────────────────────────────────────────────────────────────
ARVORE DE DECISAO
──────────────────────────────────────────────────────────────

Sintoma: {sintoma}
  ├── Exaustao de pool? (cl_waiting > 0)
  │   ├── Todas as conexoes de servidor ocupadas → Aumentar pool_size ou otimizar queries
  │   ├── Conexoes de servidor presas → Verificar carga do PostgreSQL
  │   └── Muitos pools → Consolidar bancos de dados
  ├── Falha de autenticacao?
  │   ├── SCRAM mismatch → Corresponder auth_type ao PG
  │   ├── Credenciais erradas → Atualizar userlist.txt
  │   └── Erro auth_query → Verificar funcao de lookup
  ├── Erro de transaction mode?
  │   ├── Prepared statement → DISCARD ALL ou desabilitar no ORM
  │   ├── SET/variaveis de sessao → Usar server_reset_query
  │   └── LISTEN/NOTIFY → Mudar para session mode
  └── Conectividade com servidor?
      ├── PG max_connections atingido → Reduzir pool_size
      ├── Problema de rede/DNS → Verificar conectividade
      └── Falha TLS → Verificar certificados

Causa Raiz: {explicacao}
```

### Passo 3: Resolucao

```
──────────────────────────────────────────────────────────────
CORRECAO
──────────────────────────────────────────────────────────────
```

Fornecer:
1. **Correcao imediata** -- Comandos admin do PgBouncer ou mudancas de config para resolver agora
2. **Explicacao** -- Porque isso aconteceu, comportamento especifico do PgBouncer
3. **Prevencao** -- Ajuste de configuracao, alertas de monitoramento

### Passo 4: Verificacao

```sql
-- Verificar saude do pool
SHOW POOLS;
-- cl_waiting deve ser 0

-- Verificar conectividade
SHOW SERVERS;
-- sv_active deve ser < pool_size

-- Verificar estatisticas
SHOW STATS;
-- avg_wait_time deve ser < 100ms
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
| Sintoma | {sintoma} |
| Causa raiz | {causa} |
| Correcao aplicada | {correcao} |
| Status | Resolvido / Precisa de acao |

──────────────────────────────────────────────────────────────
PREVENCAO
──────────────────────────────────────────────────────────────

- [ ] Adicionar alerta de monitoramento para {condicao}
- [ ] Ajustar {parametro} para prevenir {problema}
- [ ] Documentar correcao para referencia do @pgbouncer-debug
```
