---
description: Equipe de Desenvolvimento de Sprint - Implementacao paralela de stories usando Agent Teams
argument-hint: <sprint-name> [--max-workers=3] [--overnight]
---

# Equipe de Desenvolvimento de Sprint - Implementacao Paralela de Stories

Orquestra a execucao paralela de sprints usando Claude Code Agent Teams (v2.1.32+). Inicia um condutor de sprint (opus) mais 2-3 dev workers (sonnet), cada um assumindo uma story independente do backlog.

## Argumentos

$ARGUMENTS

- `<sprint-name>`: Nome ou ID do sprint a processar
- `--max-workers=3`: Maximo de dev workers paralelos (padrao: 2, max: 3)
- `--overnight`: Executar em modo noturno (limitado, para as 6h)
- `--supervised`: Pausar antes de cada story para confirmacao humana
- `--max-stories=10`: Maximo de stories a processar (padrao: 10)
- `--timeout=12`: Tempo maximo de execucao em horas (padrao: 12)
- `--dry-run`: Mostrar composicao da equipe e atribuicoes de stories sem executar
- `--ralph-mode`: Ativar motor de recuperacao Ralph (classificacao de erros, auto-retry, servico de escalacao) junto com paralelismo Agent Teams.

## Pre-requisitos

- Claude Code v2.1.32+ com suporte a Agent Teams
- Variavel de ambiente `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` definida
- Backlog de sprint BMAD com stories em status `ready-for-dev`
- Metadados do sprint em `.bmad/sprint-status.yaml`
- Ao menos 2 stories independentes (sprints de story unica usam Ralph sequencial)
- `Tools/AgentTeams/lib/ralph-teams-adapter.sh` disponivel
- `Tools/AgentTeams/lib/compatibility-check.sh` disponivel
- `Tools/AgentTeams/lib/cost-estimator.sh` disponivel

## Quando Usar (vs. Sprint Sequencial)

| Condicao | Usar Team Sprint (paralelo) | Usar `--sequential` ou story unica |
|----------|----------------------------|------------------------------------|
| 1 story restante | Nao | Sim |
| 2+ stories independentes | Sim (~2x speedup) | Tambem valido (mais simples) |
| Stories com arquivos compartilhados | Nao (conflitos de escrita) | Sim |
| Noturno sem supervisao | Sim (com `--overnight`) | Tambem valido |
| Orcamento limitado | Nao (+25-35% overhead de tokens) | Sim |

**Critico**: Stories devem ser totalmente independentes (sem dominios de arquivo compartilhados). Se stories modificam arquivos sobrepostos, o condutor as atribui sequencialmente ao mesmo worker.

## Processo

### Etapa 1: Inicializacao do Sprint

O condutor de sprint carrega o estado do sprint:

1. Ler `.bmad/sprint-status.yaml` para lista de stories e status
2. Filtrar stories com status `ready-for-dev`
3. Analisar independencia das stories (verificar sobreposicao de dominio de arquivo)
4. Particionar stories em grupos paralelizaveis

**Verificacao de independencia**: Duas stories sao independentes se seus criterios de aceitacao e escopo de implementacao nao referenciam os mesmos arquivos fonte. O condutor revisa a descricao de cada story e referencias do tech spec para determinar isso.

### Etapa 2: Atribuicao de Stories

```
Sprint Conductor (opus) — coordena via TaskCreate/SendMessage
  |
  +-- [Workers Paralelos - max 3] ---------+
  |   dev-worker-1 (sonnet): US-001        |
  |   dev-worker-2 (sonnet): US-002        |
  |   dev-worker-3 (sonnet): US-003        |
  +----------------------------------------+
  |
  v (barreira de sincronizacao - todas as stories completas)
  |
  +-- [Revisao Sequencial] ----------------+
  |   Condutor valida DoD de cada story     |
  +----------------------------------------+
```

O condutor cria um `TaskCreate` por story:

- **Subject**: `Implement US-XXX: <titulo da story>`
- **Description**: Conteudo completo da story, criterios de aceitacao, referencias do tech spec, requisitos TDD
- **activeForm**: `Implementing US-XXX`

### Etapa 3: Execucao do Worker (Por Story)

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

### Etapa 4: Transicao de Story

Conforme cada worker completa, o condutor:

1. Valida Definition of Done (DoD) para a story
2. Transiciona status da story: `in-progress` -> `review`
3. Atribui a proxima story `ready-for-dev` ao worker agora livre
4. Repete ate nao restarem stories ou limites serem atingidos

**Checklist de validacao DoD**:
- [ ] Todos os testes de criterios de aceitacao passam
- [ ] Nenhum novo erro de linting introduzido
- [ ] Cobertura de codigo nao diminuiu
- [ ] Sem segredos no codigo commitado
- [ ] Implementacao da story corresponde ao tech spec

### Etapa 5: Recuperacao de Erros

O condutor classifica erros conforme o motor de recuperacao Ralph:

| Nivel | Tipo | Acao | Exemplos |
|-------|------|------|----------|
| 0 | Transiente | Auto-retry com backoff | Timeout, rate limit, rede |
| 1 | Recuperavel | Worker auto-corrige + retry | Erros de lint, falhas de teste, deps |
| 2 | Degradado | Continuar com aviso | Docs, gates opcionais, queda de cobertura |
| 3 | Bloqueado | Escalar para humano | Seguranca, arquitetura, autenticacao |

**Deteccao de worker travado**: Se um worker nao atualizar sua tarefa em 10 minutos, o condutor envia mensagem de verificacao de status. Se sem resposta em 2 minutos, o condutor marca a story como bloqueada e reatribui a outro worker ou coloca na fila para revisao humana.

### Etapa 6: Conclusao do Sprint

Quando todas as stories sao processadas:

1. Condutor gera relatorio resumido do sprint
2. Atualiza `.bmad/sprint-status.yaml` via padrao single-writer
3. Envia `shutdown_request` para todos os workers
4. Reporta metricas finais

## Saida

### Relatorio Resumido do Sprint

```
================================================================
EQUIPE DE DESENVOLVIMENTO DE SPRINT - Resumo
================================================================

Sprint: <sprint-name>
Data: AAAA-MM-DD
Modo: Paralelo (Agent Teams)
Equipe: 1 condutor + N dev workers

----------------------------------------------------------------
STORIES CONCLUIDAS
----------------------------------------------------------------

| Story | Titulo | Worker | Tempo | DoD |
|-------|--------|--------|-------|-----|
| US-001 | Login feature | dev-1 | 12m | PASS |
| US-002 | User profile | dev-2 | 18m | PASS |
| US-003 | Dashboard | dev-3 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOQUEADAS
----------------------------------------------------------------

| Story | Titulo | Motivo | Escalacao |
|-------|--------|--------|-----------|
| US-004 | Payment | Dependencia de arquitetura | Fila para humano |

================================================================
METRICAS DE EXECUCAO
================================================================

| Metrica | Valor |
|---------|-------|
| Stories concluidas | X / Y |
| Stories bloqueadas | Z |
| Tempo total | Xm (vs ~Ym sequencial) |
| Speedup | ~X.Xx |
| Total de tokens | ~XK |
| Workers iniciados | N |
| Tempo medio por story | Xm |
```

## Expectativas de Performance

| Workers | Stories | Est. Sequencial | Est. Team | Speedup | Overhead Tokens |
|---------|---------|----------------|-----------|---------|-----------------|
| 2 | 4 | ~60 min | ~35 min | ~1.7x | +25% |
| 2 | 6 | ~90 min | ~50 min | ~1.8x | +25% |
| 3 | 6 | ~90 min | ~40 min | ~2.2x | +30% |
| 3 | 9 | ~135 min | ~55 min | ~2.5x | +35% |

**Nota**: Speedup depende da independencia das stories e complexidade comparavel. Se uma story demora 3x mais que as outras, a story gargalo limita o speedup geral.

## Integracao com o motor de recuperacao Ralph

Quando `--ralph-mode` esta ativado, o adaptador Ralph Teams (`Tools/AgentTeams/lib/ralph-teams-adapter.sh`) cuida de:

1. Classificacao de erros e auto-retry para falhas transientes
2. Conectar checkpoint/recuperacao com Agent Teams
3. Garantir que atualizacoes de sprint-status.yaml sigam o padrao single-writer
4. Mapear niveis de erro Ralph para acoes de recuperacao Agent Teams

## Tratamento de Erros

| Erro | Recuperacao |
|------|-------------|
| Timeout do worker (>15min por story) | Condutor reatribui story |
| Crash do worker | Story retorna para `ready-for-dev`, outro worker assume |
| Todos os workers travados | Condutor escala para humano |
| Conflito sprint-status.yaml | Padrao single-writer via file locking |
| Story com sobreposicao de arquivo com outra | Condutor atribui sequencialmente ao mesmo worker |
| Docker indisponivel | Worker reporta erro, condutor tenta somente codigo |

## Limitacoes

- Maximo de 3 dev workers paralelos (4 total incluindo condutor)
- Stories devem ser independentes (sem dominios de arquivo compartilhados)
- Custo de tokens e ~25-35% maior que sequencial devido a duplicacao de contexto
- Requer Agent Teams Research Preview (API pode mudar)
- Modo noturno depende de estabilidade do agente condutor (risco de orfao existe)
- Nao adequado para stories que requerem decisoes humanas interativas durante implementacao
