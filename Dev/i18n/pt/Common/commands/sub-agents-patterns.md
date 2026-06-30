---
description: "Padrões de sub-agentes para tarefas paralelas e complexas"
---

# Padroes de Sub-Agents

Guia para uso eficaz de sub-agents no Claude Code para tarefas paralelas e complexas.

## Tipos de Agents

### 1. Explore Agent (Pesquisa Rapida)
Utilize para exploracao rapida do codebase e coleta de informacoes.

```
Task tool com subagent_type: "Explore"
- Buscas rapidas por padroes de arquivos
- Pesquisas de palavras-chave no codigo
- Compreensao da estrutura do codebase
```

**Quando utilizar:**
- Encontrar arquivos por padrao
- Buscar padroes especificos de codigo
- Responder perguntas sobre organizacao do codebase

### 2. General-Purpose Agent (Tarefas Complexas)
Utilize para tarefas de multiplas etapas que requerem autonomia.

```
Task tool com subagent_type: "general-purpose"
- Refatoracao complexa
- Atualizacoes em multiplos arquivos
- Pesquisa e implementacao
```

**Quando utilizar:**
- Tarefas que abrangem multiplos arquivos
- Sub-tarefas independentes que podem executar em paralelo
- Tarefas que requerem julgamento e iteracao

### 3. Plan Agent (Arquitetura)
Utilize para projetar estrategias de implementacao.

```
Task tool com subagent_type: "Plan"
- Planejamento de implementacao
- Decisoes de arquitetura
- Analise de trade-offs
```

**Quando utilizar:**
- Antes de implementar funcionalidades complexas
- Quando multiplas abordagens sao possiveis
- Para decisoes arquiteturais

## Padroes de Tarefas Paralelas

### Padrao 1: Pesquisa Paralela
Lance multiplos Explore agents para diferentes aspectos:

```
# Lancamento em paralelo (mensagem unica com multiplas chamadas de ferramenta):
- Agent 1: Buscar padroes de autenticacao
- Agent 2: Buscar endpoints de API
- Agent 3: Buscar modelos de banco de dados
```

### Padrao 2: Atualizacoes Paralelas
Para atualizacoes independentes de arquivos entre linguas/modulos:

```
# Lancamento em paralelo:
- Agent 1: Atualizar templates em Frances
- Agent 2: Atualizar templates em Espanhol
- Agent 3: Atualizar templates em Alemao
- Agent 4: Atualizar templates em Portugues
```

### Padrao 3: Verificacoes de Qualidade Paralelas
Execute diferentes verificacoes de qualidade simultaneamente:

```
# Lancamento em paralelo:
- Agent 1: Executar linter
- Agent 2: Executar testes
- Agent 3: Verificar tipos
- Agent 4: Auditoria de seguranca
```

## Agents em Background

Utilize `run_in_background: true` para tarefas de longa duracao:

```
Task tool com:
  run_in_background: true

Beneficios:
- Continuar trabalhando enquanto o agent executa
- Verificar progresso via arquivo de saida
- Notificacao ao concluir
```

**Ideal para:**
- Suites de testes
- Processos de build
- Migracoes extensas
- Pipelines de qualidade

## Melhores Praticas

### Recomendado
- Lancar tarefas independentes em paralelo (mensagem unica, multiplas ferramentas)
- Utilizar Explore agent para buscas rapidas
- Utilizar modo background para tarefas longas
- Fornecer prompts claros e detalhados

### Evitar
- Lancar tarefas dependentes em paralelo
- Utilizar agents para leituras simples de arquivo unico
- Esquecer de verificar resultados de agents em background
- Utilizar prompts vagos que requerem clarificacao

## Exemplo: Atualizacao Multi-Idioma

```markdown
# Tarefa: Atualizar todos os templates i18n para novo formato

## Execucao Paralela:
1. Lancar 4 agents (FR, ES, DE, PT) com run_in_background: true
2. Continuar trabalhando em outras fases
3. Verificar resultados quando notificado

## Cada agent recebe:
- Lista de arquivos para atualizar
- Formato de template a seguir
- Instrucoes para ler antes de escrever
```

## Padroes de Coordenacao

### Sequencial com Checkpoints
Para tarefas que possuem dependencias:

```
1. Agent A completa tarefa A
2. Verificar resultado
3. Agent B utiliza resultado para tarefa B
4. Verificar resultado
5. Continuar...
```

### Fan-Out/Fan-In
Para trabalho paralelo com resultados combinados:

```
1. Fan-out: Lancar N agents em paralelo
2. Aguardar: Todos os agents concluirem
3. Fan-in: Combinar/verificar resultados
4. Continuar com estado consolidado
```

## Referencias

- Documentacao do Task tool do Claude Code
- `.claude/rules/01-workflow-analysis.md` para padroes de analise
- `.claude/settings.json` para configuracao de permissoes
