#!/bin/bash
# =============================================================================
# Ralph Wiggum - Mensagens em Portugues
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Loop Continuo de Agente IA"
MSG_VERSION="Versao"

# Status
MSG_ITERATION="Iteracao"
MSG_OF="de"
MSG_SESSION="Sessao"
MSG_STATUS="Status"
MSG_RUNNING="Executando"
MSG_COMPLETE="Completo"
MSG_FAILED="Falhou"
MSG_TIMEOUT="Tempo esgotado"
MSG_CIRCUIT_BREAKER="Disjuntor"

# Session
MSG_SESSION_CREATED="Sessao criada"
MSG_SESSION_RESUMED="Sessao retomada"
MSG_SESSION_ID="ID da sessao"
MSG_SESSION_NOT_FOUND="Sessao nao encontrada"
MSG_SESSION_DIR="Diretorio da sessao"

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
MSG_DOD_CHECKING="Verificando criterios DoD..."
MSG_DOD_PASSED="DoD APROVADO"
MSG_DOD_FAILED="DoD NAO COMPLETO"
MSG_DOD_ITEM_PASSED="OK"
MSG_DOD_ITEM_FAILED="FALHA"
MSG_DOD_ITEM_SKIPPED="IGNORADO"
MSG_DOD_REQUIRED="Obrigatorio"
MSG_DOD_OPTIONAL="Opcional"
MSG_DOD_ALL_REQUIRED_PASSED="Todos os criterios obrigatorios aprovados!"
MSG_DOD_MISSING_REQUIRED="Criterios obrigatorios faltando:"
MSG_DOD_HUMAN_GATE="Validacao humana"
MSG_DOD_HUMAN_PROMPT="Parece correto? (s/n):"

# Validators
MSG_VALIDATOR_COMMAND="Executando comando"
MSG_VALIDATOR_OUTPUT="Verificando padrao de saida"
MSG_VALIDATOR_FILE="Verificando alteracoes de arquivos"
MSG_VALIDATOR_HOOK="Executando hook"
MSG_VALIDATOR_HUMAN="Aguardando validacao humana"

# Circuit Breaker
MSG_CB_TRIGGERED="Disjuntor acionado"
MSG_CB_NO_CHANGES="Sem alteracoes de arquivos por"
MSG_CB_ITERATIONS="iteracoes"
MSG_CB_REPEATED_ERRORS="Erros repetidos detectados"
MSG_CB_OUTPUT_DECLINE="Saida reduzida em"
MSG_CB_PERCENT="porcento"
MSG_CB_MAX_REACHED="Maximo de iteracoes atingido"
MSG_CB_RESET="Disjuntor reiniciado"

# Checkpointing
MSG_CHECKPOINT_CREATING="Criando checkpoint..."
MSG_CHECKPOINT_CREATED="Checkpoint criado"
MSG_CHECKPOINT_RESTORING="Restaurando de checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint restaurado"
MSG_CHECKPOINT_BRANCH="Branch de checkpoint"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Falha no checkpoint"

# Configuration
MSG_CONFIG_LOADING="Carregando configuracao..."
MSG_CONFIG_LOADED="Configuracao carregada"
MSG_CONFIG_NOT_FOUND="Arquivo de configuracao nao encontrado"
MSG_CONFIG_USING_DEFAULTS="Usando configuracao padrao"
MSG_CONFIG_INVALID="Configuracao invalida"
MSG_CONFIG_CREATED="Configuracao criada"

# Output
MSG_OUTPUT_LOG="Arquivo de log"
MSG_OUTPUT_METRICS="Arquivo de metricas"
MSG_OUTPUT_WRITING="Escrevendo saida..."
MSG_OUTPUT_SAVED="Saida salva"

# Errors
MSG_ERROR="Erro"
MSG_ERROR_CLAUDE_NOT_FOUND="Comando claude nao encontrado"
MSG_ERROR_NO_PROMPT="Nenhum prompt fornecido"
MSG_ERROR_INVALID_SESSION="Sessao invalida"
MSG_ERROR_TIMEOUT="Operacao expirou"
MSG_ERROR_VALIDATION="Erro de validacao"
MSG_ERROR_GIT_NOT_FOUND="Git nao encontrado (necessario para checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq nao encontrado (necessario para parsing JSON)"
MSG_ERROR_YQ_NOT_FOUND="yq nao encontrado (necessario para parsing YAML)"

# Summary
MSG_SUMMARY_TITLE="Resumo da sessao"
MSG_SUMMARY_ITERATIONS="Total de iteracoes"
MSG_SUMMARY_DURATION="Duracao"
MSG_SUMMARY_DOD_STATUS="Status DoD"
MSG_SUMMARY_FILES_CHANGED="Arquivos alterados"
MSG_SUMMARY_EXIT_REASON="Motivo da saida"

# Help
MSG_HELP_USAGE="Uso"
MSG_HELP_DESCRIPTION="Executar Claude em loop continuo ate completar a tarefa"
MSG_HELP_OPTIONS="Opcoes"
MSG_HELP_PROMPT="O prompt da tarefa para Claude"
MSG_HELP_CONFIG="Caminho para arquivo ralph.yml"
MSG_HELP_CONTINUE="Retomar sessao existente"
MSG_HELP_MAX_ITER="Iteracoes maximas (padrao: 25)"
MSG_HELP_VERBOSE="Ativar saida verbosa"
MSG_HELP_DRY_RUN="Mostrar o que seria feito sem executar"
MSG_HELP_LANG="Idioma (en, fr, es, de, pt)"
MSG_HELP_HELP="Mostrar esta mensagem de ajuda"
MSG_HELP_EXAMPLES="Exemplos"
MSG_HELP_EXAMPLE_BASIC="Uso basico com prompt"
MSG_HELP_EXAMPLE_CONFIG="Com arquivo de configuracao"
MSG_HELP_EXAMPLE_RESUME="Retomar sessao anterior"

# Menu (if interactive)
MSG_MENU_TITLE="O que deseja fazer?"
MSG_MENU_START="Iniciar nova sessao Ralph"
MSG_MENU_RESUME="Retomar sessao existente"
MSG_MENU_LIST="Listar sessoes"
MSG_MENU_CONFIG="Criar configuracao"
MSG_MENU_HELP="Ajuda"
MSG_MENU_QUIT="Sair"

# Misc
MSG_PRESS_ENTER="Pressione Enter para continuar..."
MSG_YES="sim"
MSG_NO="nao"
MSG_CANCEL="Cancelado"
MSG_GOODBYE="Adeus!"
MSG_INVALID_CHOICE="Escolha invalida"
MSG_CONFIRM="Confirmar"
MSG_WARNING="Aviso"
MSG_INFO="Info"
MSG_SUCCESS="Sucesso"
