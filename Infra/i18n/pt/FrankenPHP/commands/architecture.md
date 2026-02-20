---
description: Design complete FrankenPHP serving architecture
argument-hint: <Project> [constraints]
---

# Arquitetura FrankenPHP

Voce e um arquiteto senior de FrankenPHP. Voce deve projetar uma arquitetura completa de servico PHP a partir das especificacoes do projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao do projeto
- Workload alvo (ex: web-application, api-only, real-time)
- Restricoes (ex: worker-mode, classic-mode, behind-proxy)

Exemplo: `/frankenphp:architecture "E-commerce platform" workload:web-application framework:symfony`

## Plan Mode

> **Plan mode e recomendado.** Claude ativa o plan mode para estruturar a abordagem, selecionar worker/classic mode e apresentar uma topologia de servico antes de gerar o Caddyfile.

## MISSAO

### Passo 1: Descoberta

```
══════════════════════════════════════════════════════════════
ARQUITETURA FRANKENPHP
══════════════════════════════════════════════════════════════

Projeto: {name}
Descricao: {description}

──────────────────────────────────────────────────────────────
ANALISE DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack da Aplicacao
| Componente | Tecnologia | Detalhes |
|------------|------------|---------|
| Framework | {Symfony/Laravel/PHP} | {versao} |
| Versao PHP | {8.x} | {extensoes} |
| Estado Global | {nenhum/minimo/pesado} | {session files, statics} |
| Servidor Atual | {nginx+fpm/Apache/nenhum} | {versao} |

### Padrao de Trafego
| Atributo | Valor |
|----------|-------|
| Pico simultaneo | {requests} |
| Tempo medio de resposta | {ms} |
| Real-time necessario | {sim/nao} |
| Requests de longa duracao | {sim/nao} |
```

### Passo 2: Decisao de Modo

```
──────────────────────────────────────────────────────────────
SELECAO DE MODO
──────────────────────────────────────────────────────────────

Framework suporta worker mode? {sim/nao}
Estado global impede worker mode? {sim/nao}
OPcache preloading possivel? {sim/nao}

Decisao: {worker / classic} mode
Justificativa: {explicacao}

Configuracao de threads: {auto / contagem fixa}
max_requests: {500 / customizado}
```

### Passo 3: Design da Topologia

```
──────────────────────────────────────────────────────────────
TOPOLOGIA DE SERVICO
──────────────────────────────────────────────────────────────

[Diagrama ASCII: Cliente -> FrankenPHP (worker pool) -> Camada de dados]

──────────────────────────────────────────────────────────────
DIMENSIONAMENTO DE THREADS
──────────────────────────────────────────────────────────────

| Parametro | Valor | Formula |
|-----------|-------|---------|
| Threads | {auto/contagem} | {cpu_count * 2 ou auto} |
| max_requests | {500} | {estabilidade de memoria} |
| Orcamento de memoria | {MB por worker} | {total / threads} |
```

### Passo 4: Gerar Caddyfile

Gerar o Caddyfile completo com:
- Bloco global frankenphp (worker ou classic mode)
- Bloco do site com root, php_server, headers de seguranca
- Configuracao de Early Hints (se aplicavel)
- Mercure hub (se real-time necessario)
- Configuracao de logging

### Passo 5: Gerar Artefatos Docker

Gerar Dockerfile e docker-compose.yml para a arquitetura escolhida.

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
| Modo | {worker/classic} |
| Threads | {auto/contagem} |
| max_requests | {valor} |
| Auto-TLS | {sim/nao} |
| Early Hints | {sim/nao} |
| Mercure | {sim/nao} |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar Caddyfile e dimensionamento de threads
2. [ ] Implantar com /frankenphp:deploy-setup
3. [ ] Auditar seguranca com /frankenphp:security-audit
4. [ ] Otimizar performance com /frankenphp:optimize
5. [ ] Benchmark com wrk ou k6
```
