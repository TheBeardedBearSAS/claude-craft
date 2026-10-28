#!/bin/bash
# =============================================================================
# Ralph Wiggum - Mensagens em Português
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Loop Contínuo de Agente IA"
MSG_VERSION="Versão"

# Status
MSG_ITERATION="Iteração"
MSG_OF="de"
MSG_SESSION="Sessão"
MSG_STATUS="Status"
MSG_RUNNING="Executando"
MSG_COMPLETE="Completo"
MSG_FAILED="Falhou"
MSG_TIMEOUT="Tempo esgotado"
MSG_CIRCUIT_BREAKER="Disjuntor"

# Session
MSG_SESSION_CREATED="Sessão criada"
MSG_SESSION_RESUMED="Sessão retomada"
MSG_SESSION_ID="ID da sessão"
MSG_SESSION_NOT_FOUND="Sessão não encontrada"
MSG_SESSION_DIR="Diretório da sessão"

# Loop
MSG_STARTING_LOOP="Iniciando loop Ralph"
MSG_PROMPT="Prompt"
MSG_INVOKING_CLAUDE="Invocando Claude..."
MSG_WAITING="Aguardando"
MSG_SECONDS="segundos"
MSG_LOOP_COMPLETE="Loop completo"
MSG_LOOP_STOPPED="Loop parado"

# Definition of Done
MSG_DOD_TITLE="Definition of Done"
MSG_DOD_CHECKING="Verificando critérios DoD..."
MSG_DOD_PASSED="DoD APROVADO"
MSG_DOD_FAILED="DoD NÃO COMPLETO"
MSG_DOD_ITEM_PASSED="OK"
MSG_DOD_ITEM_FAILED="FALHA"
MSG_DOD_ITEM_SKIPPED="IGNORADO"
MSG_DOD_REQUIRED="Obrigatório"
MSG_DOD_OPTIONAL="Opcional"
MSG_DOD_ALL_REQUIRED_PASSED="Todos os critérios obrigatórios aprovados!"
MSG_DOD_MISSING_REQUIRED="Critérios obrigatórios faltando:"
MSG_DOD_HUMAN_GATE="Validação humana"
MSG_DOD_HUMAN_PROMPT="Parece correto? (s/n):"

# Validators
MSG_VALIDATOR_COMMAND="Executando comando"
MSG_VALIDATOR_OUTPUT="Verificando padrão de saída"
MSG_VALIDATOR_FILE="Verificando alterações de arquivos"
MSG_VALIDATOR_HOOK="Executando hook"
MSG_VALIDATOR_HUMAN="Aguardando validação humana"

# Circuit Breaker
MSG_CB_TRIGGERED="Disjuntor acionado"
MSG_CB_NO_CHANGES="Sem alterações de arquivos por"
MSG_CB_ITERATIONS="iterações"
MSG_CB_REPEATED_ERRORS="Erros repetidos detectados"
MSG_CB_OUTPUT_DECLINE="Saída reduzida em"
MSG_CB_PERCENT="porcento"
MSG_CB_MAX_REACHED="Máximo de iterações atingido"
MSG_CB_RESET="Disjuntor reiniciado"

# Gerenciamento de contexto
MSG_CONTEXT_LIMIT_DETECTED="Limite de contexto detectado"
MSG_CONTEXT_COMPACTING="Executando auto-compact"
MSG_CONTEXT_COMPACTED="Contexto compactado com sucesso"
MSG_CONTEXT_COMPACT_FAILED="Falha no auto-compact"
MSG_CONTEXT_RETRYING="Tentando novamente após compact"
MSG_CONTEXT_MAX_REACHED="Máximo de compacts atingido"
MSG_CONTEXT_DISABLED="Auto-compact desativado"

# Gerenciamento avançado de contexto
MSG_CONTEXT_NEW_SESSION="Criando sessão de continuação"
MSG_CONTEXT_EXTEND="Limite de compacts estendido"
MSG_CONTEXT_OVERFLOW_FAIL="Limite de contexto excedido, parando"
MSG_CONTEXT_PREVENTIVE="Contexto em {0}% - compact preventivo"
MSG_CONTEXT_BELOW_MIN="Contexto em {0}% - abaixo do limite mínimo ({1}%), compact ignorado"
MSG_CONTEXT_CONTINUATION_CREATED="Sessão de continuação criada"
MSG_CONTEXT_MAX_CONTINUATIONS="Máximo de sessões de continuação atingido"
MSG_CONTEXT_RECONSTRUCTING="Reconstruindo contexto do arquivo de progresso"

# Progresso do sprint
MSG_SPRINT_PROGRESS_SAVED="Progresso do sprint salvo"
MSG_SPRINT_PROGRESS_LOADED="Progresso do sprint carregado"
MSG_SPRINT_CURRENT_TASK="Tarefa atual"
MSG_SPRINT_COMPLETED_TASKS="Tarefas concluídas"
MSG_SPRINT_PHASE="Fase"

# Compact estratégico
MSG_CONTEXT_SPRINT_START="Compact no início do sprint para contexto limpo"
MSG_CONTEXT_TASK_COMPLETE="Tarefa concluída - compact estratégico"
MSG_CONTEXT_US_COMPLETE="US concluída - compact estratégico"

# Checkpointing
MSG_CHECKPOINT_CREATING="Criando checkpoint..."
MSG_CHECKPOINT_CREATED="Checkpoint criado"
MSG_CHECKPOINT_RESTORING="Restaurando de checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint restaurado"
MSG_CHECKPOINT_BRANCH="Branch de checkpoint"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Falha no checkpoint"

# Configuration
MSG_CONFIG_LOADING="Carregando configuração..."
MSG_CONFIG_LOADED="Configuração carregada"
MSG_CONFIG_NOT_FOUND="Arquivo de configuração não encontrado"
MSG_CONFIG_USING_DEFAULTS="Usando configuração padrão"
MSG_CONFIG_INVALID="Configuração inválida"
MSG_CONFIG_CREATED="Configuração criada"

# Output
MSG_OUTPUT_LOG="Arquivo de log"
MSG_OUTPUT_METRICS="Arquivo de métricas"
MSG_OUTPUT_WRITING="Escrevendo saída..."
MSG_OUTPUT_SAVED="Saída salva"

# Errors
MSG_ERROR="Erro"
MSG_ERROR_CLAUDE_NOT_FOUND="Comando claude não encontrado"
MSG_ERROR_NO_PROMPT="Nenhum prompt fornecido"
MSG_ERROR_INVALID_SESSION="Sessão inválida"
MSG_ERROR_TIMEOUT="Operação expirou"
MSG_ERROR_VALIDATION="Erro de validação"
MSG_ERROR_GIT_NOT_FOUND="Git não encontrado (necessário para checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq não encontrado (necessário para parsing JSON)"
MSG_ERROR_YQ_NOT_FOUND="yq não encontrado (necessário para parsing YAML)"

# Summary
MSG_SUMMARY_TITLE="Resumo da sessão"
MSG_SUMMARY_ITERATIONS="Total de iterações"
MSG_SUMMARY_DURATION="Duração"
MSG_SUMMARY_DOD_STATUS="Status DoD"
MSG_SUMMARY_FILES_CHANGED="Arquivos alterados"
MSG_SUMMARY_EXIT_REASON="Motivo da saída"

# Help
MSG_HELP_USAGE="Uso"
MSG_HELP_DESCRIPTION="Executar Claude em loop contínuo até completar a tarefa"
MSG_HELP_OPTIONS="Opções"
MSG_HELP_PROMPT="O prompt da tarefa para Claude"
MSG_HELP_CONFIG="Caminho para arquivo ralph.yml"
MSG_HELP_CONTINUE="Retomar sessão existente"
MSG_HELP_MAX_ITER="Iterações maximas (padrão: 25)"
MSG_HELP_VERBOSE="Ativar saída verbosa"
MSG_HELP_DRY_RUN="Mostrar o que seria feito sem executar"
MSG_HELP_LANG="Idioma (en, fr, es, de, pt)"
MSG_HELP_HELP="Mostrar esta mensagem de ajuda"
MSG_HELP_EXAMPLES="Exemplos"
MSG_HELP_EXAMPLE_BASIC="Uso básico com prompt"
MSG_HELP_EXAMPLE_CONFIG="Com arquivo de configuração"
MSG_HELP_EXAMPLE_RESUME="Retomar sessão anterior"

# Menu (if interactive)
MSG_MENU_TITLE="O que deseja fazer?"
MSG_MENU_START="Iniciar nova sessão Ralph"
MSG_MENU_RESUME="Retomar sessão existente"
MSG_MENU_LIST="Listar sessões"
MSG_MENU_CONFIG="Criar configuração"
MSG_MENU_HELP="Ajuda"
MSG_MENU_QUIT="Sair"

# Misc
MSG_PRESS_ENTER="Pressione Enter para continuar..."
MSG_YES="sim"
MSG_NO="não"
MSG_CANCEL="Cancelado"
MSG_GOODBYE="Adeus!"
MSG_INVALID_CHOICE="Escolha inválida"
MSG_CONFIRM="Confirmar"
MSG_WARNING="Aviso"
MSG_INFO="Info"
MSG_SUCCESS="Sucesso"

# =============================================================================
# Mensagens v2.0
# =============================================================================

# Auto-detecção
MSG_AUTO_DETECT="Detectando tipo de projeto automaticamente..."
MSG_AUTO_DETECT_FOUND="Tipo de projeto detectado"
MSG_AUTO_DETECT_CONFIDENCE="Confiança"
MSG_AUTO_DETECT_NOT_FOUND="Não foi possível detectar o tipo de projeto"
MSG_HELP_AUTO_DETECT="Detectar auto o tipo de projeto e configurar DoD"
MSG_HELP_INIT="Gerar config sem executar (apenas init)"
MSG_HELP_INTERACTIVE="Assistente de configuração interativo"

# Dashboard
MSG_DASHBOARD_ENABLED="Dashboard habilitado"
MSG_DASHBOARD_DISABLED="Dashboard desabilitado"
MSG_DASHBOARD_MODE="Modo dashboard"

# Métricas
MSG_METRICS_ENABLED="Coleta de métricas habilitada"
MSG_METRICS_EXPORTED="Métricas exportadas"
MSG_METRICS_FORMAT="Formato de métricas"

# Monitor de saúde
MSG_HEALTH_HEALTHY="Saúde: OK"
MSG_HEALTH_WARNING="Aviso de saúde"
MSG_HEALTH_CRITICAL="Saúde crítica"
MSG_HEALTH_STALL="Estagnação detectada"
MSG_HEALTH_ERROR_SPIRAL="Espiral de erros detectada"
MSG_HEALTH_CONTEXT_BLOAT="Inflação de contexto detectada"

# Hooks
MSG_HOOKS_ENABLED="Integração de hooks habilitada"
MSG_HOOKS_DISABLED="Integração de hooks desabilitada"
MSG_HOOKS_CONFIG_GENERATED="Configuração de hooks gerada"
MSG_HOOKS_DOD_BLOCKED="DoD não satisfeito - parada bloqueada"

# Disjuntor adaptativo
MSG_CB_ADAPTIVE_ENABLED="Disjuntor adaptativo habilitado"
MSG_CB_PROFILE_DETECTED="Perfil detectado"
MSG_CB_LEARNING_ENABLED="Aprendizado histórico habilitado"
MSG_CB_LEARNING_ADJUSTED="Limiares ajustados com base no histórico"

# Gerador de configuração
MSG_CONFIG_GENERATED="Configuração gerada"
MSG_CONFIG_WIZARD_TITLE="Assistente de configuração"
MSG_CONFIG_DETECTING="Detectando configurações do projeto..."
MSG_CONFIG_CONFIRM="Está correto?"

# Prompts enviados ao Claude ({0} = contexto reconstruído)
MSG_PROMPT_CONTINUATION="# Continuação do Sprint

Você está retomando o trabalho neste sprint após uma compactação de contexto.
O arquivo sprint-progress.md contém o estado completo do trabalho realizado.

{0}

## Instruções

1. **Leia** o progresso acima para entender o estado atual
2. **Verifique** os arquivos modificados, se necessário
3. **Retome** a tarefa em andamento onde ela parou
4. **Continue** o fluxo TDD (RED -> GREEN -> REFACTOR)
5. **Atualize** sprint-progress.md após cada tarefa concluída

## Comandos Importantes

- Após cada tarefa: atualizar sprint-progress.md
- Se houver bloqueio: anotar na seção Blockers
- Se houver uma decisão importante: adicionar em Key Decisions

Continue a implementação."

# {0} = id da sessão anterior, {1} = contexto reconstruído
MSG_PROMPT_HANDOFF="# Nova Sessão de Continuação

Esta sessão continua o trabalho da sessão anterior ({0}).
O contexto foi reiniciado, mas o arquivo sprint-progress.md contém todo o progresso.

{1}

## Contexto da Transição

- Sessão anterior: {0}
- Motivo: limite de contexto atingido (max compacts)
- O trabalho foi salvo em sprint-progress.md
- Os arquivos estão no estado do último checkpoint git

## Instruções

1. **Verifique** o estado atual com git status
2. **Leia** sprint-progress.md para o contexto completo
3. **Identifique** a tarefa em andamento e seu estado
4. **Continue** exatamente onde a sessão anterior parou

Retome o trabalho."

# Seções do contexto reconstruído enviadas ao Claude ({0} = fase)
MSG_SECTION_PROGRESS="## Progresso do Sprint"
MSG_SECTION_CURRENT_STATE="### Estado Atual"
MSG_SECTION_UNKNOWN="Desconhecido"
MSG_SECTION_COMPLETED_TASKS="### Tarefas Concluídas"
MSG_SECTION_NONE_YET="Nenhuma ainda"
MSG_SECTION_KEY_DECISIONS="### Decisões Importantes"
MSG_SECTION_NONE_RECORDED="Nenhuma registrada"
MSG_SECTION_NO_PROGRESS_FILE="Nenhum arquivo de progresso do sprint encontrado."
MSG_SECTION_GIT="## Alterações Recentes"
MSG_SECTION_NOT_GIT="Não está em um repositório git."
MSG_SECTION_MODIFIED_FILES="### Arquivos Modificados (commits recentes)"
MSG_SECTION_NO_RECENT_CHANGES="Nenhuma alteração recente"
MSG_SECTION_NO_COMMITS="Nenhum commit ainda"
MSG_SECTION_RECENT_COMMITS="### Commits Recentes"
MSG_SECTION_UNCOMMITTED="### Alterações Não Confirmadas"
MSG_SECTION_NO_UNCOMMITTED="Nenhuma alteração não confirmada."
MSG_SECTION_TESTS="## Estado dos Testes"
MSG_SECTION_UNIT_TESTS="Testes Unitários"
MSG_SECTION_INTEGRATION_TESTS="Testes de Integração"
MSG_SECTION_TASK="## Tarefa Atual"
MSG_SECTION_TASK_LABEL="Tarefa"
MSG_SECTION_CONTINUE_PHASE="Continue de onde parou na fase {0}."
MSG_SECTION_NO_TASK="Nenhuma tarefa em andamento."
MSG_SECTION_NO_TASK_INFO="Nenhuma informação sobre a tarefa atual disponível."
