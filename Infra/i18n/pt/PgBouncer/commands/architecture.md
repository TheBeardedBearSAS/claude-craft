---
description: Design complete PgBouncer connection pooling architecture
argument-hint: <Project> [constraints]
---

# Arquitetura PgBouncer

Voce e um arquiteto senior de PgBouncer. Voce deve projetar uma arquitetura completa de connection pooling a partir das especificacoes do projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao do projeto
- Workload alvo (ex: web-application, microservices, multi-tenant)
- Restricoes (ex: pool-mode, max-connections, ha-required)

Exemplo: `/pgbouncer:architecture "E-commerce platform" workload:web-application pg-max-conn:100`

## Plan Mode

> **Plan mode e recomendado.** Claude ativa o plan mode para estruturar a abordagem, selecionar o pool mode e apresentar uma topologia antes de gerar o pgbouncer.ini.

## MISSAO

### Passo 1: Descoberta

```
══════════════════════════════════════════════════════════════
ARQUITETURA PGBOUNCER
══════════════════════════════════════════════════════════════

Projeto: {name}
Descricao: {description}

──────────────────────────────────────────────────────────────
ANALISE DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack da Aplicacao
| Componente | Tecnologia | Conexoes |
|------------|------------|----------|
| App Server | {framework} | {conn por instancia} |
| Instancias | {count} | {total de conexoes} |
| Funcionalidades ORM | {prepared stmts, temp tables} | {compatibilidade} |

### Configuracao PostgreSQL
| Atributo | Valor |
|----------|-------|
| max_connections | {value} |
| Bancos de dados | {count} |
| Replicacao | {primary-only / primary+replica} |
| Metodo de auth | {scram-sha-256 / md5} |
```

### Passo 2: Decisao do Pool Mode

```
──────────────────────────────────────────────────────────────
SELECAO DO POOL MODE
──────────────────────────────────────────────────────────────

Aplicacao usa prepared statements? {sim/nao}
Aplicacao usa SET/variaveis de sessao? {sim/nao}
Aplicacao usa LISTEN/NOTIFY? {sim/nao}
Aplicacao usa temp tables entre queries? {sim/nao}

Decisao: {transaction / session} mode
Justificativa: {explicacao}

server_reset_query: {DISCARD ALL / vazio}
```

### Passo 3: Design da Topologia

```
──────────────────────────────────────────────────────────────
TOPOLOGIA DO POOL
──────────────────────────────────────────────────────────────

[Diagrama ASCII: Instancias App -> PgBouncer -> PostgreSQL]

──────────────────────────────────────────────────────────────
CALCULO DE DIMENSIONAMENTO
──────────────────────────────────────────────────────────────

| Parametro | Valor | Formula |
|-----------|-------|---------|
| max_client_conn | {value} | {instancias × conn + 20% margem} |
| default_pool_size | {value} | {PG max_conn / pools × 0.8} |
| min_pool_size | {value} | {50% do default} |
| reserve_pool_size | {value} | {25% do default} |
| reserve_pool_timeout | {value} | {segundos} |
```

### Passo 4: Gerar pgbouncer.ini

Gerar o arquivo de configuracao completo `pgbouncer.ini` com:
- Secao [databases] com todas as entradas de banco de dados
- Secao [pgbouncer] com todas as configuracoes de pool
- Configuracao de autenticacao (auth_type, auth_file ou auth_query)
- Configuracoes de timeout (server_lifetime, server_idle_timeout, query_wait_timeout)
- Configuracao de logging
- Usuarios admin e stats

### Passo 5: Gerar userlist.txt

Gerar o arquivo de autenticacao ou funcao SQL auth_query.

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
ARQUITETURA GERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMO DA CONFIGURACAO
──────────────────────────────────────────────────────────────

| Configuracao | Valor |
|-------------|-------|
| Pool mode | {transaction/session} |
| max_client_conn | {value} |
| default_pool_size | {value} |
| Bancos de dados | {count} |
| HA | {sim/nao} |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar dimensionamento do pool contra trafego real
2. [ ] Implantar com /pgbouncer:deploy-setup
3. [ ] Auditar seguranca com /pgbouncer:security-audit
4. [ ] Configurar monitoramento com @pgbouncer-monitoring
5. [ ] Teste de carga para validar dimensionamento do pool
```
