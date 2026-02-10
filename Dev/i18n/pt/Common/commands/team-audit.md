---
description: Equipe de Auditoria Completa - Auditoria multi-tecnologia paralela usando Agent Teams
argument-hint: [--techs=auto|tech1,tech2] [--max-workers=4]
---

# Equipe de Auditoria Completa - Auditoria Multi-Tecnologia Paralela

Orquestra uma auditoria completa paralela em multiplos stacks tecnologicos usando Claude Code Agent Teams (v2.1.32+). Inicia um agente lider (opus) mais N auditores workers (haiku), um por stack tecnologico detectado, ate um maximo configuravel.

## Argumentos

$ARGUMENTS

- `--techs=auto`: Auto-detectar tecnologias (padrao). Ou especificar separado por virgula: `--techs=symfony,react`
- `--max-workers=4`: Maximo de workers auditores paralelos (padrao: 4, max: 4)
- `--output-dir=<path>`: Diretorio de saida personalizado para resultados da auditoria
- `--dry-run`: Mostrar composicao da equipe e custo estimado sem executar
- `--skip-aggregation`: Gerar resultados por stack sem consolidar
- `--sequential`: Executar auditorias sequencialmente em vez de em paralelo (sem overhead de Agent Teams, equivalente a `/common:full-audit` mas com formato de relatorio team-audit). Util para projetos de tecnologia unica ou quando Agent Teams nao esta disponivel.

## Pre-requisitos

- Claude Code v2.1.32+ com suporte a Agent Teams
- Variavel de ambiente `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` definida
- Projeto com 2+ stacks tecnologicos detectados (projetos de stack unico devem usar `/common:full-audit` sequencial)
- `Tools/AgentTeams/lib/compatibility-check.sh` disponivel
- `Tools/AgentTeams/lib/result-aggregator.sh` disponivel
- `Tools/AgentTeams/lib/cost-estimator.sh` disponivel

## Quando Usar (vs. Auditoria Sequencial)

| Condicao | Usar Team Audit | Usar `/common:full-audit` Sequencial |
|----------|----------------|--------------------------------------|
| 1 stack tecnologico | Nao | Sim |
| 2+ stacks tecnologicos | Sim | Tambem valido (mais simples, mais barato) |
| Urgencia de tempo | Sim (speedup 2-3x) | Nao |
| Orcamento limitado | Nao (+20-35% overhead de tokens) | Sim |

**Ponto de equilibrio**: Beneficios de paralelizacao surgem a partir de 2+ stacks. Para um unico stack, o overhead de coordenacao supera o tempo economizado.

## Processo

### Etapa 1: Deteccao de Tecnologias

```
Audit Leader (opus)
  |
  v
Escanear raiz do projeto buscando marcadores de tecnologia:
  composer.json + symfony/*      -> Symfony
  pubspec.yaml + flutter:        -> Flutter
  pyproject.toml / requirements  -> Python
  package.json + react           -> React
  package.json + react-native    -> React Native
  package.json + @angular/core   -> Angular
  package.json + vue             -> Vue.js
  artisan + laravel/*            -> Laravel
  *.csproj + dotnet              -> C#/.NET
  composer.json (sem symfony)    -> PHP
```

Se `--techs=auto`, detectar todos. Se explicito, validar que os stacks especificados existem.

**Gate de decisao**: Se apenas 1 tecnologia detectada, voltar para `/common:full-audit` sequencial (sem necessidade de overhead de equipe).

### Etapa 2: Verificacao de Compatibilidade

Antes de iniciar os workers, validar cada agente auditor contra os requisitos do papel:

```bash
# Para cada stack detectado, verificar se o agente reviewer tem as ferramentas necessarias
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash \
  --require-model haiku
```

Se algum agente falhar na compatibilidade, registrar um aviso e excluir aquele stack da execucao paralela (fallback para o lider tratar sequencialmente).

### Etapa 3: Estimativa de Custo

Antes de iniciar a equipe, estimar custos de tokens:

```bash
Tools/AgentTeams/lib/cost-estimator.sh \
  --team-size <N+1> \
  --lead-model opus \
  --worker-model haiku \
  --task-type audit \
  --stacks <detected_count>
```

Exibir custo estimado para o usuario. No modo `--dry-run`, parar aqui.

### Etapa 4: Criacao da Equipe (Fan-Out)

```
Audit Leader (opus) — coordena via TaskCreate/SendMessage
  |
  +-- [Workers Paralelos - max 4] ---------+
  |   stack-auditor-1 (haiku): Symfony      |
  |   stack-auditor-2 (haiku): React        |
  |   stack-auditor-3 (haiku): Python       |
  |   stack-auditor-4 (haiku): Angular      |
  +----------------------------------------+
```

**Padrao de criacao da equipe:**

1. O lider cria diretorios de saida isolados por worker (um por stack)
2. O lider cria tarefas via `TaskCreate` para cada auditoria de stack:
   - Assunto da tarefa: `Audit <TechName> stack`
   - Descricao da tarefa: inclui instrucoes de check-architecture, check-code-quality, check-testing, check-security, check-compliance
   - Cada tarefa especifica seu caminho de saida isolado
3. Workers reivindicam tarefas via `TaskUpdate` (status: in_progress)
4. Workers escrevem resultados apenas em seu diretorio isolado

**Instrucoes dos workers** (por stack):

Cada worker executa as 4 categorias de auditoria sequencialmente dentro do seu stack:

| Categoria | Pontos | O que Verificar |
|-----------|--------|-----------------|
| Arquitetura (25pts) | Separacao de camadas, direcao de dependencias, convencoes de pastas, sem acoplamento de framework |
| Qualidade de Codigo (25pts) | Padroes de nomenclatura, linting, type hints, documentacao, complexidade < 10 |
| Testes (25pts) | Cobertura >= 80%, testes unitarios, testes de integracao, testes E2E, piramide de testes |
| Seguranca (25pts) | Sem segredos, validacao de entrada, OWASP, criptografia, CVEs de dependencias |

Workers executam comandos de diagnostico baseados em Docker por stack:

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text
docker compose exec php composer audit

# React
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
docker compose exec node npm audit

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov
docker compose exec app pip-audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

Cada worker escreve `result.json` em seu diretorio de saida isolado:

```json
{
  "tech": "symfony",
  "score": 82,
  "architecture": { "score": 22, "findings": [...] },
  "code_quality": { "score": 20, "findings": [...] },
  "testing": { "score": 18, "findings": [...] },
  "security": { "score": 22, "findings": [...] }
}
```

### Etapa 5: Barreira de Sincronizacao

O lider aguarda todas as tarefas dos workers atingirem o status `completed` via polling de `TaskList`. Se um worker exceder seu timeout (5 minutos por stack), o lider o marca como falho e prossegue com resultados parciais.

### Etapa 6: Agregacao de Resultados

O lider executa o agregador de resultados:

```bash
Tools/AgentTeams/lib/result-aggregator.sh \
  --input-dir <isolated-output-root> \
  --output-file audit-report.json
```

O agregador:
- Coleta todos os arquivos `result.json` dos diretorios isolados
- Desduplicar achados (mesmo arquivo + mesma mensagem = duplicata)
- Resolver conflitos de pontuacao via media ponderada
- Produzir relatorio unificado

### Etapa 7: Geracao do Relatorio

O lider gera o relatorio de auditoria multi-tecnologia formatado:

```
================================================================
AUDITORIA MULTI-TECNOLOGIA (Agent Teams) - Pontuacao Global: XX/100
================================================================

Tecnologias detectadas: [lista]
Tamanho da equipe: 1 lider + N workers
Modo de execucao: Paralelo
Data: AAAA-MM-DD

----------------------------------------------------------------
SYMFONY - Pontuacao: XX/100
----------------------------------------------------------------

Arquitetura (XX/25)
  [PASS] Clean Architecture respeitada
  [PASS] CQRS implementado corretamente
  [WARN] 2 servicos acessam Repository diretamente

Qualidade de Codigo (XX/25)
  [PASS] PHPStan nivel 8 - 0 erros
  [WARN] 5 metodos > 20 linhas

Testes (XX/25)
  [PASS] Cobertura: 85%
  [WARN] Sem testes E2E Panther

Seguranca (XX/25)
  [PASS] Sem segredos no codigo
  [WARN] Dependencia com CVE menor

----------------------------------------------------------------
REACT - Pontuacao: XX/100
----------------------------------------------------------------

[Mesma estrutura por tecnologia]

================================================================
RESUMO GLOBAL
================================================================

| Tecnologia | Arquitetura | Codigo | Testes | Seguranca | Total |
|------------|-------------|--------|--------|-----------|-------|
| Symfony    | XX/25       | XX/25  | XX/25  | XX/25     | XX/100|
| React      | XX/25       | XX/25  | XX/25  | XX/25     | XX/100|
| MEDIA      | XX/25       | XX/25  | XX/25  | XX/25     | XX/100|

================================================================
TOP 5 ACOES PRIORITARIAS
================================================================

1. [CRITICO] Descricao da acao
   -> Impacto: +X pontos | Esforco: Baixo/Medio/Alto

2. [ALTO] Descricao da acao
   -> Impacto: +X pontos | Esforco: Baixo/Medio/Alto

================================================================
METRICAS DE EXECUCAO
================================================================

| Metrica | Valor |
|---------|-------|
| Tempo total | Xs (vs ~Ys sequencial) |
| Speedup | ~X.Xx |
| Total de tokens | ~XK |
| Overhead de tokens vs sequencial | +XX% |
| Workers iniciados | N |
| Workers concluidos | N |
| Workers falharam | 0 |
```

### Etapa 8: Limpeza

O lider envia `shutdown_request` para todos os workers e limpa os diretorios de saida isolados (a menos que `--keep-artifacts` seja especificado).

## Regras de Pontuacao

Mesmas que `/common:full-audit`:

| Violacao | Pontos Perdidos |
|----------|-----------------|
| Padrao arquitetural violado | -5 |
| Acoplamento framework/dominio | -3 |
| Erro critico de linting | -2 |
| Aviso de linting | -1 |
| Metodo > 30 linhas | -1 |
| Cobertura < 80% | -5 |
| Sem testes unitarios de dominio | -5 |
| Segredo no codigo | -10 |
| Vulnerabilidade CVE critica | -10 |
| Vulnerabilidade CVE alta | -5 |

## Expectativas de Performance

| Stacks | Estimativa Sequencial | Estimativa Team | Speedup | Overhead de Tokens |
|--------|----------------------|----------------:|---------|-------------------|
| 2 | ~4 min | ~2.5 min | ~1.6x | +20% |
| 3 | ~6 min | ~3 min | ~2x | +25% |
| 4 | ~8 min | ~3.5 min | ~2.3x | +30% |
| 5+ | ~10+ min | ~4 min | ~2.5x | +35% |

**Nota**: Estas sao estimativas realistas considerando o overhead de coordenacao (spawn de agente ~5-10s, atribuicao de tarefa, agregacao de resultados). Nao esperar speedup linear.

## Tratamento de Erros

| Erro | Recuperacao |
|------|-------------|
| Timeout do worker (>5min) | Lider marca como falho, prossegue com resultados parciais |
| Crash do worker | Lider registra erro, exclui stack do relatorio |
| Docker indisponivel | Worker reporta erro, lider faz fallback para analise somente de codigo |
| Nenhuma tecnologia detectada | Abortar com mensagem clara |
| Apenas uma tecnologia | Fallback para `/common:full-audit` sequencial |
| Verificacao de compatibilidade falha | Excluir stack do paralelo, lider trata sequencialmente |

## Limitacoes

- Maximo de 4 workers paralelos (overhead de coordenacao domina alem disso)
- Custo de tokens e ~20-35% maior que sequencial devido a duplicacao de contexto por worker
- Requer Agent Teams Research Preview (API pode mudar)
- Cada worker carrega contexto do projeto independentemente (~10-20K tokens de overhead cada)
