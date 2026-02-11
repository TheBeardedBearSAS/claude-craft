---
description: Equipe de Entrega - Ciclo de vida completo do sprint (redacao + implementacao) usando Agent Teams
argument-hint: <sprint-name|prd-path> [--phase=all|writing|implementation] [--max-workers=3]
---

# Equipe de Entrega - Ciclo de Vida Completo do Sprint (Redacao + Implementacao)

Orquestra o ciclo completo do sprint usando Claude Code Agent Teams (v2.1.32+). A Fase 1 redige EPICs, User Stories (INVEST+3C+Gherkin) e tarefas com revisao cruzada. A Fase 2 implementa em paralelo usando mapeamento de dominio de arquivo da Fase 1. O mesmo Delivery Lead (opus) orquestra ambas as fases, preservando contexto completo durante a transicao.

## Argumentos

$ARGUMENTS

- `<sprint-name|prd-path>`: Nome/ID do sprint ou caminho para o documento PRD
- `--phase=all`: Fase a executar (padrao: `all`). Opcoes: `all`, `writing`, `implementation`
- `--max-workers=3`: Maximo de workers paralelos por fase (padrao: 3, max: 3)
- `--overnight`: Executar em modo noturno (limitado, para as 6h)
- `--supervised`: Pausar antes de cada story para confirmacao humana
- `--max-stories=10`: Maximo de stories a processar (padrao: 10)
- `--timeout=16`: Tempo maximo de execucao em horas (padrao: 16)
- `--dry-run`: Mostrar composicao da equipe, estimativa de custo e atribuicoes de stories sem executar
- `--quality-threshold=6`: Pontuacao INVEST minima para Fase 1 (padrao: 6/6)
- `--max-rewrites=2`: Maximo de loops de reescrita por artefato na Fase 1 (padrao: 2)

## Pre-requisitos

- Claude Code v2.1.32+ com suporte a Agent Teams
- Variavel de ambiente `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` definida
- PRD ou tech spec disponivel (para Fase 1) ou backlog de sprint BMAD com stories `ready-for-dev` (somente Fase 2)
- Metadados do sprint em `.bmad/sprint-status.yaml`
- `Tools/AgentTeams/lib/compatibility-check.sh` disponivel
- `Tools/AgentTeams/lib/cost-estimator.sh` disponivel
- `Tools/AgentTeams/lib/result-aggregator.sh` disponivel

## Quando Usar (vs. Sequencial ou Outras Equipes)

| Condicao | Usar Team Delivery | Alternativa |
|----------|-------------------|-------------|
| Ciclo completo (planejar + codar), 3+ stories | **Sim (~2.2x speedup)** | Muito lento sequencialmente |
| < 3 stories | Nao | `@product-owner` + `/common:team-sprint --sequential` |
| Story unica | Nao | `/common:ralph-run` |
| 5+ stories independentes | **Sim (melhor ROI)** | Possivel mas lento sequencialmente |
| Somente implementacao (stories existem) | Usar `--phase=implementation` | `/common:team-sprint` |
| Somente redacao (sem codificacao) | Usar `--phase=writing` | `@product-owner` manualmente |
| Orcamento muito limitado | Nao (+30-40% overhead de tokens) | Workflow sequencial |
| Precisa de mapeamento de dominio de arquivo | **Sim (integrado)** | Coordenacao manual |

**Ponto de equilibrio**: Rentavel a partir de 3+ stories para redigir E implementar.

## Processo

### Fase 1: Redacao (Qualidade + Confiabilidade)

#### Composicao da Equipe Fase 1

```
Delivery Lead (opus) — orquestracao, validacao, contexto compartilhado
  |
  +-- Writer (sonnet)    : Cria EPICs, US (INVEST+3C+Gherkin), tarefas
  +-- Reviewer (sonnet)  : Valida qualidade (INVEST 6/6, cobertura AC, testabilidade, fatiamento)
  +-- Architect (sonnet) : Valida viabilidade tecnica + mapeamento de dominio de arquivo
```

#### Etapa 1.1: Validacao de Entrada

O Delivery Lead valida a entrada:

1. Ler PRD ou tech spec do caminho fornecido
2. Validar PRD Gate (>=80%) — se a pontuacao estiver abaixo do limiar, abortar com mensagem clara
3. Extrair features, requisitos e escopo de criterios de aceitacao
4. Criar equipe via `TeamCreate`

#### Etapa 1.2: Criacao da Equipe (Fase 1)

O Lead inicia 3 workers da Fase 1 via ferramenta `Task`:

1. **Writer** (sonnet): Instruido a criar EPICs e User Stories seguindo formato INVEST+3C+Gherkin
2. **Reviewer** (sonnet): Instruido a validar qualidade contra a tabela de verificacoes abaixo
3. **Architect** (sonnet): Instruido a validar viabilidade tecnica e produzir mapas de dominio de arquivo

#### Etapa 1.3: Pipeline de Artefatos

O pipeline e sequencial por artefato, mas **pipelinizado** entre artefatos (multiplos artefatos em voo em diferentes estagios simultaneamente):

```
Writer cria -> Reviewer valida qualidade -> Architect valida tech + dominios -> Lead aceita/retorna
     ^                                                                                    |
     +-- Loop de reescrita (max 2x, feedback consolidado) --------------------------------+
```

O Lead coordena via `SendMessage`:
1. Atribui um artefato ao Writer via tarefa
2. Quando Writer completa, envia artefato ao Reviewer para validacao de qualidade
3. Quando Reviewer aprova, envia ao Architect para validacao tecnica + mapeamento de dominio
4. Quando Architect aprova, Lead marca artefato como aceito
5. Se Reviewer OU Architect rejeitar, Lead consolida feedback e retorna ao Writer (max `--max-rewrites` loops)
6. Se artefato ainda falhar apos max reescritas, Lead sinaliza como `needs_human_review` e continua

#### Verificacoes de Qualidade do Reviewer

| Verificacao | Limiar | Fonte |
|-------------|--------|-------|
| Pontuacao INVEST | 6/6 | `backlog-gate.yaml` |
| AC nominais | >= 1 | Padroes `@product-owner` |
| AC alternativos | >= 2 | Padroes `@product-owner` |
| AC de erro | >= 2 | Padroes `@product-owner` |
| Formato Gherkin | 100% | Validacao de gate |
| Fatiamento vertical | Sim | Padroes `@tech-lead` |
| Story points | 1-8 | Criterio "Small" do INVEST |
| Beneficio explicito | Sim | Criterio "Valuable" do INVEST |

#### Saida do Mapa de Dominio de Arquivo do Architect

O Architect produz um mapa de dominio de arquivo para cada User Story:

```yaml
US-001:
  file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  overlaps_with: []
US-002:
  file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]
  overlaps_with: []
US-003:
  file_domains: [src/Domain/User/, src/App/Auth/]
  overlaps_with: [US-001]  # -> sequenciado apos US-001 na Fase 2
```

Este mapa determina as ondas de paralelizacao na Fase 2.

#### Etapa 1.4: Gate Sprint Ready

Quando todos os artefatos sao processados, o Lead valida o Sprint Ready Gate (100%):

1. Todas as stories tem INVEST 6/6 (ou estao sinalizadas como `needs_human_review`)
2. Mapa de dominio de arquivo esta completo
3. Ondas de paralelizacao estao calculadas
4. Backlog do sprint e gravado em `.bmad/sprint-status.yaml`

#### Saida da Fase 1

```
================================================================
EQUIPE DE ENTREGA - Fase 1: Resumo da Redacao
================================================================

Sprint: <sprint-name>
Data: AAAA-MM-DD
Equipe: 1 lider + 3 redatores

----------------------------------------------------------------
ARTEFATOS CRIADOS
----------------------------------------------------------------

| Artefato | Tipo | INVEST | Reescritas | Status |
|----------|------|--------|------------|--------|
| EPIC-001 | Epic | - | 0 | ACEITO |
| US-001 | Story | 6/6 | 0 | ACEITO |
| US-002 | Story | 6/6 | 1 | ACEITO |
| US-003 | Story | 6/6 | 0 | ACEITO |
| US-004 | Story | 4/6 | 2 | REVISAO_HUMANA |

----------------------------------------------------------------
MAPA DE DOMINIO DE ARQUIVO
----------------------------------------------------------------

| Story | Dominios | Sobreposicoes |
|-------|----------|---------------|
| US-001 | src/Domain/User/, src/App/User/ | - |
| US-002 | src/Domain/Order/, src/App/Order/ | - |
| US-003 | src/Domain/User/, src/App/Auth/ | US-001 |

----------------------------------------------------------------
ONDAS DE PARALELIZACAO
----------------------------------------------------------------

Onda 1: [US-001, US-002] — independentes (0 sobreposicao)
Onda 2: [US-003]         — depende de arquivos da US-001

----------------------------------------------------------------
METRICAS DE QUALIDADE
----------------------------------------------------------------

| Metrica | Valor |
|---------|-------|
| Pontuacao INVEST media | 5.5/6 |
| Cobertura AC (nom/alt/err) | 100% / 95% / 90% |
| Stories aceitas | 3/4 |
| Stories para revisao | 1/4 |
| Total de reescritas | 3 |
| Sobreposicoes de dominio | 1 |
```

### Transicao de Fase

Se `--phase=all`, o Lead realiza uma transicao de equipe:

1. Envia `shutdown_request` para Writer, Reviewer, Architect
2. Aguarda todos os workers desligarem (~30s)
3. Lead mantem contexto completo da Fase 1 (stories, mapa de dominio, ondas)
4. Prossegue para criacao da Fase 2

### Fase 2: Implementacao (Velocidade + Delegacao)

#### Composicao da Equipe Fase 2

```
Delivery Lead (opus) — mesmo lider, contexto da Fase 1 preservado
  |
  +-- dev-worker-1 (sonnet) : US-001 (TDD)
  +-- dev-worker-2 (sonnet) : US-002 (TDD)
  +-- dev-worker-3 (sonnet) : US-003 (TDD)
```

#### Vantagens vs team-sprint Sozinho

1. **Mapa de dominio de arquivo ja calculado** — atribuicao e confiavel, sem analise heuristica em runtime
2. **Stories de maior qualidade** — ACs completos, menos retrabalho durante implementacao
3. **Lead com contexto completo** — melhores decisoes de atribuicao
4. **Ondas pre-calculadas**:
   ```
   Onda 1: [US-001, US-002] — independentes (0 sobreposicao)
   Onda 2: [US-003]         — depende de arquivos da US-001
   ```

#### Etapa 2.1: Criacao dos Workers

O Lead inicia dev workers (ate `--max-workers`) e atribui stories por onda:

1. Stories da Onda 1 atribuidas em paralelo (uma story por worker)
2. Quando Onda 1 completa, stories da Onda 2 sao atribuidas
3. Workers liberados de stories concluidas pegam a proxima story disponivel

O Lead cria um `TaskCreate` por story:

- **Subject**: `Implement US-XXX: <titulo da story>`
- **Description**: Conteudo completo da story, criterios de aceitacao, referencias do tech spec, requisitos TDD, escopo de dominio de arquivo
- **activeForm**: `Implementing US-XXX`

#### Etapa 2.2: Execucao do Worker (Por Story)

Cada dev worker segue o ciclo TDD para sua story atribuida:

```
1. Ler story e criterios de aceitacao
2. RED: Escrever testes que falham a partir dos criterios de aceitacao
3. GREEN: Implementar codigo minimo para passar nos testes
4. REFACTOR: Limpar mantendo testes verdes
5. Executar suite completa de testes (baseada em docker)
6. Escrever resumo do resultado
7. Marcar tarefa como concluida
```

**Comandos TDD dos workers** (especificos por tecnologia):

```bash
# Symfony
docker compose exec php vendor/bin/phpunit
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php php bin/console lint:container

# React
docker compose exec node npm run test
docker compose exec node npm run lint
docker compose exec node npm run build

# Python
docker compose exec app pytest --cov
docker compose exec app ruff check .
docker compose exec app mypy .

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test
docker run --rm -v $(pwd):/app -w /app dart dart analyze
```

#### Etapa 2.3: Transicao de Story

Conforme cada worker completa, o Lead:

1. Valida Definition of Done (DoD) para a story
2. Transiciona status da story: `in-progress` -> `review`
3. Atribui a proxima story (respeitando ordem de ondas) ao worker liberado
4. Repete ate nao restarem stories ou limites serem atingidos

**Checklist de validacao DoD**:
- [ ] Todos os testes de criterios de aceitacao passam
- [ ] Nenhum novo erro de linting introduzido
- [ ] Cobertura de codigo nao diminuiu
- [ ] Sem segredos no codigo commitado
- [ ] Implementacao da story corresponde ao tech spec

#### Etapa 2.4: Recuperacao de Erros

O Lead classifica erros conforme o motor de recuperacao Ralph:

| Nivel | Tipo | Acao | Exemplos |
|-------|------|------|----------|
| 0 | Transiente | Auto-retry com backoff | Timeout, rate limit, rede |
| 1 | Recuperavel | Worker auto-corrige + retry | Erros de lint, falhas de teste, deps |
| 2 | Degradado | Continuar com aviso | Docs, gates opcionais, queda de cobertura |
| 3 | Bloqueado | Escalar para humano | Seguranca, arquitetura, autenticacao |

**Deteccao de worker travado**: Se um worker nao atualizar sua tarefa em 10 minutos, o Lead envia mensagem de verificacao de status. Se sem resposta em 2 minutos, o Lead marca a story como bloqueada e reatribui a outro worker ou coloca na fila para revisao humana.

**Conflito de dominio de arquivo detectado em runtime**: Se um worker reportar conflito de arquivo com escopo de outro worker, o Lead para o worker conflitante, aguarda o primeiro completar, depois reatribui sequencialmente.

### Integracao de Gates BMAD

| Gate | Limiar | Quando | Validado Por |
|------|--------|--------|--------------|
| PRD Gate | >=80% | Antes da Fase 1 | Lead valida entrada |
| Backlog Gate | INVEST 6/6 | Fase 1 — por artefato | Reviewer |
| Sprint Ready Gate | 100% | Fim da Fase 1 | Lead |
| Story DoD Gate | 100% | Fase 2 — por story | Lead apos worker |

### Etapa Final: Conclusao do Sprint

Quando todas as stories sao processadas:

1. Lead gera o relatorio completo de entrega
2. Atualiza `.bmad/sprint-status.yaml` via padrao single-writer
3. Envia `shutdown_request` para todos os dev workers
4. Reporta metricas finais

## Saida

### Relatorio Completo de Entrega

```
================================================================
EQUIPE DE ENTREGA - Relatorio Completo
================================================================

Sprint: <sprint-name>
Data: AAAA-MM-DD
Modo: Ciclo de Vida Completo (Redacao + Implementacao)
Equipe: 1 lider + 3 redatores (Fase 1) + N dev workers (Fase 2)

================================================================
FASE 1: RESUMO DA REDACAO
================================================================

| Artefato | Tipo | INVEST | Reescritas | Status |
|----------|------|--------|------------|--------|
| US-001 | Story | 6/6 | 0 | ACEITO |
| US-002 | Story | 6/6 | 1 | ACEITO |
| US-003 | Story | 6/6 | 0 | ACEITO |

Ondas de paralelizacao:
  Onda 1: [US-001, US-002]
  Onda 2: [US-003]

================================================================
FASE 2: RESUMO DA IMPLEMENTACAO
================================================================

| Story | Titulo | Worker | Onda | Tempo | DoD |
|-------|--------|--------|------|-------|-----|
| US-001 | Login feature | dev-1 | 1 | 12m | PASS |
| US-002 | User profile | dev-2 | 1 | 18m | PASS |
| US-003 | Dashboard | dev-1 | 2 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOQUEADAS
----------------------------------------------------------------

| Story | Titulo | Fase | Motivo | Escalacao |
|-------|--------|------|--------|-----------|
| US-004 | Payment | Redacao | INVEST 4/6 apos 2 reescritas | revisao_humana |

================================================================
METRICAS DE EXECUCAO
================================================================

| Metrica | Valor |
|---------|-------|
| Stories redigidas | X |
| Stories implementadas | Y / Z |
| Stories bloqueadas | W |
| Tempo Fase 1 | Xm |
| Tempo Fase 2 | Ym |
| Tempo total | Zm (vs ~Wm sequencial) |
| Speedup | ~X.Xx |
| Total de tokens | ~XK |
| Pontuacao INVEST media | X.X/6 |
| Workers iniciados | N (Fase 1) + M (Fase 2) |
```

## Analise de Custo

Para 1 EPIC, 5 US, ~25 tarefas:

| Metrica | Sequencial | Team Delivery | Delta |
|---------|-----------|---------------|-------|
| Tokens Fase 1 | ~350K | ~475K | +36% |
| Tokens Fase 2 | ~500K | ~650K | +30% |
| Tempo Fase 1 | ~45 min | ~20 min | -56% |
| Tempo Fase 2 | ~75 min | ~35 min | -53% |
| **Tempo total** | **~120 min** | **~55 min** | **~2.2x** |
| Custo total* | ~$28 | ~$17 | **-38%** |

*Economia de custo porque Sonnet ($3/$15/M) trata a maior parte do trabalho vs Opus ($15/$75/M) no modo sequencial.

## Expectativas de Performance

| Workers | Stories | Est. Sequencial | Est. Team | Speedup | Overhead Tokens |
|---------|---------|----------------|-----------|---------|-----------------|
| 3 (redacao) + 2 (impl) | 4 | ~80 min | ~40 min | ~2.0x | +30% |
| 3 (redacao) + 2 (impl) | 6 | ~120 min | ~55 min | ~2.2x | +32% |
| 3 (redacao) + 3 (impl) | 6 | ~120 min | ~50 min | ~2.4x | +35% |
| 3 (redacao) + 3 (impl) | 9 | ~180 min | ~75 min | ~2.4x | +37% |

**Nota**: Speedup depende da independencia das stories e complexidade comparavel. Transicao de fase adiciona ~30s de overhead.

## Tratamento de Erros

| Erro | Recuperacao |
|------|-------------|
| Artefato invalido apos max reescritas | Sinalizar `needs_human_review`, continuar com proximo artefato |
| Timeout do Architect (>5min/US) | Prosseguir com mapa de dominio parcial, stories marcadas `sequential-only` |
| Crash de worker Fase 1 | Lead reatribui ao worker restante |
| Crash de worker Fase 2 | Story retorna para `ready-for-dev`, outro worker assume |
| Conflito de dominio de arquivo na impl | Lead para worker conflitante, sequencia as stories |
| Conflito sprint-status.yaml | Padrao single-writer (somente Lead) |
| PRD Gate falha (<80%) | Abortar com mensagem clara, sugerir melhoria do PRD |
| Todos os workers travados | Lead escala para humano |

## Limitacoes

- Maximo de 5 agentes total (1 lider + 3 por fase, transicao entre fases ~30s)
- Qualidade depende da qualidade do PRD/tech spec de entrada
- Mapeamento de dominio de arquivo e heuristico (utilitarios compartilhados podem ser perdidos)
- +30-40% overhead de tokens vs sequencial
- Requer Agent Teams Research Preview (API pode mudar)
- Nao adequado para EPICs/US que requerem decisoes humanas interativas no meio do processo
- Transicao de fase requer shutdown + respawn (~30s de latencia)
