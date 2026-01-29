---
description: Executar o condutor de sprint autonomo para execucao overnight/sem supervisao
argument-hint: <nome-sprint> [--overnight|--parallel N|--supervised|--max-stories N]
---

# Ralph Sprint - Condutor de Sprint Autonomo (ASC)

Executa um sprint inteiro de forma autonoma com minima intervencao humana. O Condutor de Sprint Autonomo (ASC) gerencia a reivindicacao de historias, execucao, transicoes, recuperacao de erros e escalamento de problemas bloqueantes.

## Argumentos

**$ARGUMENTS**

- `<nome-sprint>`: Nome ou ID do sprint a processar
- `--overnight`: Modo noturno (limitado, para as 6h)
- `--parallel N`: Processar ate N historias em paralelo (padrao: 1)
- `--supervised`: Pausar antes de cada historia para confirmacao
- `--max-stories N`: Maximo de historias a processar (padrao: 10)
- `--timeout H`: Tempo maximo de execucao em horas (padrao: 12)

## Funcionalidades Principais

| Funcionalidade | Descricao |
|----------------|-----------|
| **Auto-Claim** | Reivindica automaticamente a proxima historia pronta |
| **Auto-Transicao** | Transiciona historias conforme estado de conclusao |
| **Motor de Recuperacao** | Auto-recuperacao de erros transitorios/recuperaveis |
| **Servico de Escalamento** | Fila de problemas bloqueantes para resolucao humana |
| **Processamento Paralelo** | Processa multiplas historias independentes simultaneamente |
| **Execucao Limitada** | Janelas de tempo, limites de historias, limiares de falhas |

## Processo

### 1. Inicializacao do Sprint

1. **Carregar configuracao do sprint**:
   - Ler metadados de `.bmad/sprint-status.yaml`
   - Carregar config autonoma de `ralph-autonomous.yml`
   - Inicializar motor de recuperacao e servico de escalamento

2. **Ativar modo autonomo**:
   - Configurar circuit breaker em perfil autonomo
   - Ativar recuperacao antes do disparo
   - Inicializar gerenciador paralelo se ativado

### 2. Loop Principal do Condutor

O ASC executa um loop continuo:

1. Verificar condicoes de parada
2. Obter proxima historia pronta
3. Reivindicar a historia
4. Executar com Ralph
5. Processar resultado (sucesso/falha/escalado)
6. Transicionar historia
7. Criar checkpoint

### 3. Recuperacao de Erros

O Motor de Recuperacao classifica erros em 4 niveis:

| Nivel | Tipo | Acao | Exemplos |
|-------|------|------|----------|
| 0 | **Transitorio** | Auto-retry com backoff | Timeout, rate limit, rede |
| 1 | **Recuperavel** | Auto-fix + retry | Lint, tests, deps, sintaxe |
| 2 | **Degradado** | Continuar com warning | Docs, gates opcionais |
| 3 | **Bloqueado** | Escalar para humano | Seguranca, arquitetura |

### 4. Gerenciamento de Escalamentos

Problemas bloqueantes sao colocados em fila para resolucao humana.

**Opcoes de resolucao**:
- `proceed` - Continuar com a tarefa
- `skip` - Pular esta historia e continuar
- `retry` - Tentar novamente a operacao falha
- `abort` - Parar o sprint

### 5. Condicoes de Parada

| Condicao | Padrao | Descricao |
|----------|--------|-----------|
| Max historias | 10 | Maximo de historias processadas |
| Max falhas | 3 | Limiar de falhas consecutivas |
| Max runtime | 12h | Tempo maximo total |
| Janela parada | 06:00 | Parada por horario (overnight) |
| Escalamento critico | - | Pausa em problemas criticos |

## Exemplos Rapidos

```bash
# Sprint noturno
/common:ralph-sprint "Sprint 3" --overnight

# Processamento paralelo com 3 sessoes
/common:ralph-sprint "Sprint 3" --parallel 3

# Modo supervisionado
/common:ralph-sprint "Sprint 3" --supervised

# Execucao limitada
/common:ralph-sprint "Sprint 3" --max-stories 5 --timeout 4
```

## Configuracao

O ASC usa `Tools/Ralph/config/ralph-autonomous.yml`:

```yaml
autonomous:
  enabled: true
  mode: "bounded"
  schedule:
    stop_window: "06:00"
    max_runtime_hours: 12
  limits:
    max_stories_per_session: 10
    max_consecutive_failures: 3
  parallel:
    enabled: false
    max_concurrent: 3

recovery:
  enabled: true
  max_attempts: 3
  auto_fix_lint: true
  auto_fix_tests: "retry_tdd"

escalation:
  enabled: true
  timeout_hours: 4
  default_action: "skip"
  critical_action: "pause"
```

## Metricas de Sucesso

| Metrica | Atual | Meta |
|---------|-------|------|
| Intervencoes humanas/sprint | ~15 | <5 |
| Historias completadas overnight | 0 | 3-5 |
| Taxa auto-recuperacao | N/A | >70% |
| Tempo ate escalamento | N/A | <15 min |
| Eficiencia paralelizacao | N/A | >60% |

## Boas Praticas

1. **Comecar supervisionado**: Usar `--supervised` primeiro
2. **Limites realistas**: Nao colocar max-stories muito alto inicialmente
3. **Monitorar escalamentos**: Verificar `.ralph/escalations/queue/` regularmente
4. **Analisar metricas**: Examinar `metrics-*.json` apos cada execucao
5. **Configurar webhooks**: Notificacoes Slack/Teams para problemas criticos

## Relacionado

- `/common:ralph-run` - Loop continuo para uma tarefa
- `/project:run-sprint` - Execucao padrao de sprint
- `/sprint:next-story` - Obter proxima historia pronta
- `@ralph-conductor` - Agente de orquestracao Ralph
