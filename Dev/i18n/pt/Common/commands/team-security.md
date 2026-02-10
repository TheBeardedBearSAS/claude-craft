---
description: Equipe de Revisao de Seguranca - Auditoria de seguranca multi-dimensao paralela usando Agent Teams
argument-hint: [--scope=full|code|deps|infra] [--max-workers=3]
---

# Equipe de Revisao de Seguranca - Auditoria de Seguranca Multi-Dimensao Paralela

Orquestra uma auditoria de seguranca abrangente usando Claude Code Agent Teams (v2.1.32+). Inicia um lider de seguranca (opus) mais 3 revisores haiku especializados, cada um analisando uma dimensao de seguranca diferente em paralelo: vulnerabilidades de codigo fonte, dependencias/cadeia de suprimentos e infraestrutura/configuracao.

## Argumentos

$ARGUMENTS

- `--scope=full`: Escopo da auditoria (padrao: `full`). Opcoes: `full`, `code`, `deps`, `infra`
- `--max-workers=3`: Maximo de revisores paralelos (padrao: 3, max: 3)
- `--severity=medium`: Severidade minima a reportar: `low`, `medium`, `high`, `critical`
- `--output-dir=<path>`: Diretorio de saida personalizado para resultados de seguranca
- `--dry-run`: Mostrar composicao da equipe e plano de scan sem executar
- `--sarif`: Saida em formato SARIF (para integracao CI/CD)

## Pre-requisitos

- Claude Code v2.1.32+ com suporte a Agent Teams
- Variavel de ambiente `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` definida
- Docker disponivel para executar scanners de seguranca
- `Tools/AgentTeams/lib/compatibility-check.sh` disponivel
- `Tools/AgentTeams/lib/result-aggregator.sh` disponivel
- `Tools/AgentTeams/lib/cost-estimator.sh` disponivel

## Composicao da Equipe

| Papel | Modelo | Agente | Responsabilidade |
|-------|--------|--------|------------------|
| Security Lead | opus | Custom (lider da equipe) | Orquestracao, threat modeling, relatorio |
| Code Reviewer | haiku | `{tech}-reviewer` | Analise de vulnerabilidades de codigo fonte |
| Dependency Auditor | haiku | `{tech}-reviewer` | Cadeia de suprimentos, CVE, conformidade de licencas |
| Infra Reviewer | haiku | `devops-engineer` ou `docker-architect` | Seguranca de container, segredos, configuracao |

**Tamanho da equipe**: 4 agentes (1 lider + 3 workers). Composicao fixa para revisao de seguranca.

## Processo

### Etapa 1: Reconhecimento do Projeto

O lider de seguranca realiza reconhecimento inicial:

1. Detectar stacks tecnologicos (mesma deteccao que full-audit)
2. Identificar pontos de entrada: endpoints de API, formularios, uploads de arquivo
3. Mapear a superficie de ataque: rotas publicas, fronteiras de autenticacao, fluxos de dados
4. Criar esboço de threat model (categorias STRIDE)

### Etapa 2: Verificacao de Compatibilidade

```bash
# Verificar se o agente code reviewer tem as ferramentas necessarias
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash

# Verificar infra reviewer
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/Common/agents/devops-engineer.md \
  --require-tools Read,Glob,Grep,Bash
```

### Etapa 3: Criacao da Equipe (Fan-Out)

```
Security Lead (opus) — orquestra via TaskCreate/SendMessage
  |
  +-- [Revisores Paralelos] -------------------+
  |   Code Reviewer (haiku): Analise de codigo   |
  |   Dependency Auditor (haiku): Cadeia supr.   |
  |   Infra Reviewer (haiku): Configuracao       |
  +---------------------------------------------+
  |
  v (barreira de sincronizacao)
  |
  Security Lead: Correlacionar, priorizar, reportar
```

O lider cria 3 tarefas via `TaskCreate`:

#### Tarefa A: Revisao de Seguranca de Codigo Fonte

**Escopo**: Analise de vulnerabilidades de codigo fonte da aplicacao

| Verificacao | O que Buscar | Categoria OWASP |
|-------------|-------------|------------------|
| Injection | Padroes de SQL, NoSQL, OS command, LDAP injection | A03:2021 |
| XSS | Saida nao escapada, innerHTML, dangerouslySetInnerHTML | A03:2021 |
| Autenticacao | Politicas de senha fracas, MFA ausente, fixacao de sessao | A07:2021 |
| Autorizacao | Controles de acesso ausentes, IDOR, escalacao de privilegios | A01:2021 |
| Criptografia | Algoritmos fracos, chaves hardcoded, random inseguro | A02:2021 |
| Validacao de Entrada | Sanitizacao ausente, coercao de tipo, upload de arquivo | A03:2021 |
| Tratamento de Erros | Stack traces em respostas, erros detalhados | A05:2021 |
| Logging | Dados sensiveis em logs, trilha de auditoria ausente | A09:2021 |

**Comandos Docker por stack**:

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

# Geral (todos os stacks)
# Padroes Grep para vulnerabilidades comuns
# Buscar: eval(, exec(, system(, shell_exec(, innerHTML, dangerouslySetInnerHTML
# Buscar: senhas hardcoded, API keys, tokens no codigo fonte
```

#### Tarefa B: Auditoria de Dependencias / Cadeia de Suprimentos

**Escopo**: Analise de vulnerabilidades e licencas de dependencias de terceiros

| Verificacao | O que Analisar |
|-------------|----------------|
| CVEs conhecidos | Todas as dependencias diretas e transitivas |
| Severidade | CVEs criticos e altos requerendo acao imediata |
| Conformidade de licencas | Licencas copyleft em projetos proprietarios |
| Pacotes desatualizados | Pacotes com patches de seguranca disponiveis |
| Typosquatting | Nomes de pacotes suspeitos similares a pacotes populares |
| Deps nao utilizadas | Dependencias declaradas mas nunca importadas |

**Comandos Docker por stack**:

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

#### Tarefa C: Revisao de Seguranca de Infraestrutura / Configuracao

**Escopo**: Docker, configuracao de deploy, gerenciamento de segredos

| Verificacao | O que Analisar |
|-------------|----------------|
| Seguranca Dockerfile | Pinagem de imagem base, usuario nao-root, multi-stage builds |
| Exposicao de segredos | Arquivos .env, credenciais hardcoded, segredos nao criptografados |
| Docker Compose | Containers privilegiados, portas expostas, montagens de volume |
| Politica de rede | Exposicao desnecessaria de portas, isolamento de rede ausente |
| TLS/SSL | Validacao de certificado, versoes de protocolo, cipher suites |
| Seguranca CI/CD | Injecao de segredos, permissoes de pipeline, integridade de artefatos |
| Permissoes de arquivo | Configs legiveis por todos, exposicao de .git, arquivos de backup |

**Comandos de scan**:

```bash
# Seguranca Docker
docker compose config --quiet  # Validar sintaxe do compose
# Revisar Dockerfiles para: USER root, tags latest, ADD vs COPY

# Scan de segredos
# Buscar: arquivos .env nao no .gitignore
# Buscar: AWS_SECRET, PRIVATE_KEY, password=, token= no codigo fonte
# Buscar: segredos codificados em base64, chaves SSH no repo

# Revisao de configuracao
# Verificar: politicas CORS, headers CSP, HSTS
# Verificar: modo debug desativado em configs de producao
# Verificar: rate limiting configurado
```

### Etapa 4: Barreira de Sincronizacao

O lider de seguranca aguarda todas as 3 tarefas de revisores completarem. Timeout: 8 minutos por revisor. Se um revisor exceder o timeout, o lider prossegue com resultados disponiveis e registra a lacuna.

### Etapa 5: Correlacao e Priorizacao

O lider de seguranca correlaciona achados entre todas as 3 dimensoes:

1. **Referencia cruzada**: Uma dependencia vulneravel (Tarefa B) usada em um caminho de codigo propenso a injection (Tarefa A) e elevada para Critico
2. **Analise de cadeia de ataque**: Combinar achados para identificar caminhos de ataque multi-etapa
3. **Desduplicar**: Mesmo problema encontrado por multiplos revisores e consolidado
4. **Priorizar**: Pontuar cada achado por severidade x exploitabilidade x impacto

**Matriz de severidade**:

| Severidade | Faixa CVSS | Resposta |
|------------|-----------|----------|
| Critica | 9.0 - 10.0 | Correcao imediata necessaria |
| Alta | 7.0 - 8.9 | Corrigir no sprint atual |
| Media | 4.0 - 6.9 | Planejar para proximo sprint |
| Baixa | 0.1 - 3.9 | Backlog / aceitar risco |

### Etapa 6: Geracao do Relatorio

```
================================================================
EQUIPE DE REVISAO DE SEGURANCA - Relatorio
================================================================

Projeto: <nome-do-projeto>
Data: AAAA-MM-DD
Escopo: <full|code|deps|infra>
Equipe: 1 lider + 3 revisores

================================================================
RESUMO EXECUTIVO
================================================================

| Severidade | Quantidade |
|------------|------------|
| Critica | X |
| Alta | X |
| Media | X |
| Baixa | X |
| Total | X |

Nivel de Risco Global: <Critico|Alto|Medio|Baixo>

================================================================
ACHADOS POR DIMENSAO
================================================================

-- CODIGO FONTE (Code Reviewer) --

| # | Severidade | Categoria | Arquivo | Descricao |
|---|------------|-----------|---------|-----------|
| 1 | ALTA | A03:Injection | src/... | SQL injection em... |
| 2 | MEDIA | A07:Auth | src/... | Senha fraca... |

-- DEPENDENCIAS (Dependency Auditor) --

| # | Severidade | Pacote | Versao | CVE | Correcao Disponivel |
|---|------------|--------|--------|-----|---------------------|
| 1 | CRITICA | lib-x | 1.2.3 | CVE-2026-XXXX | 1.2.4 |
| 2 | ALTA | lib-y | 4.5.6 | CVE-2026-YYYY | 5.0.0 |

-- INFRAESTRUTURA (Infra Reviewer) --

| # | Severidade | Componente | Descricao |
|---|------------|------------|-----------|
| 1 | ALTA | Dockerfile | Executando como root |
| 2 | MEDIA | .env | Nao no .gitignore |

================================================================
CADEIAS DE ATAQUE (Achados Correlacionados)
================================================================

Cadeia 1: SQL Injection via dependencia vulneravel
  Etapa 1: Biblioteca ORM desatualizada (CVE-2026-XXXX)
  Etapa 2: Input do usuario alcanca query builder sem sanitizacao
  Impacto: Comprometimento do banco de dados
  Severidade: CRITICA

================================================================
PLANO DE REMEDIACAO
================================================================

| Prioridade | Acao | Esforco | Impacto |
|------------|------|---------|---------|
| 1 | Atualizar lib-x para 1.2.4 | Baixo | Corrige CVE-2026-XXXX |
| 2 | Adicionar sanitizacao de input em src/... | Medio | Bloqueia injection |
| 3 | Mudar para usuario nao-root no Docker | Baixo | Reduz raio de explosao |

================================================================
METRICAS DE EXECUCAO
================================================================

| Metrica | Valor |
|---------|-------|
| Tempo total | Xs (vs ~Ys sequencial) |
| Speedup | ~X.Xx |
| Total de tokens | ~XK |
| Achados descobertos | X |
| Revisores concluidos | 3/3 |
```

### Etapa 7: Limpeza

O lider de seguranca envia `shutdown_request` para todos os revisores e limpa os diretorios de saida isolados.

## Expectativas de Performance

| Escopo | Est. Sequencial | Est. Team | Speedup | Overhead Tokens |
|--------|----------------|-----------|---------|-----------------|
| Somente codigo | ~5 min | ~5 min | 1x (sem paralelismo) | 0% |
| Somente deps | ~3 min | ~3 min | 1x (sem paralelismo) | 0% |
| Completo | ~12 min | ~6 min | ~2x | +30% |

**Nota**: Escopo completo se beneficia de paralelismo 3 vias. Escopos individuais (`--scope=code`) rodam como tarefas de worker unico sem overhead de equipe.

## Tratamento de Erros

| Erro | Recuperacao |
|------|-------------|
| Timeout do revisor (>8min) | Lider prossegue com resultados parciais, registra lacuna |
| Crash do revisor | Lider registra erro, reporta dimensao como "nao avaliada" |
| Docker indisponivel | Revisor faz fallback para analise somente por padroes de codigo |
| Nenhuma vulnerabilidade encontrada | Relatorio indica status limpo (nao e um erro) |
| Ferramenta de scanner nao instalada | Revisor pula scanner, usa analise baseada em grep |

## Limitacoes

- Equipe fixa de 4 agentes (1 lider + 3 revisores)
- Nao substitui ferramentas especializadas de seguranca (SAST/DAST/SCA) — complementa-as
- Achados dependem do conhecimento de seguranca do modelo (sem deteccao de zero-day)
- Custo de tokens ~30% maior que sequencial devido a duplicacao de contexto
- Requer Agent Teams Research Preview (API pode mudar)
- Qualidade da correlacao de cadeias de ataque depende da capacidade de raciocinio do agente lider
