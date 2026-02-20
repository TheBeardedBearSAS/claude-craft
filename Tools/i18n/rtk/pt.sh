#!/bin/bash
# =============================================================================
# RTK (Rust Token Killer) - Mensagens em Portugues
# =============================================================================

# Header
MSG_HEADER="RTK - Otimizador de Tokens para Claude Code"

# Prerequisites
MSG_PREREQ_TITLE="Verificando pre-requisitos"
MSG_PREREQ_JQ="jq esta instalado"
MSG_PREREQ_JQ_MISSING="jq e necessario. Instale-o: sudo apt install jq"
MSG_PREREQ_CURL="curl esta instalado"
MSG_PREREQ_CURL_MISSING="curl e necessario. Instale-o: sudo apt install curl"

# RTK binary
MSG_RTK_CHECK="Verificando instalacao do RTK"
MSG_RTK_INSTALLED="RTK ja esta instalado"
MSG_RTK_VERSION="Versao RTK:"
MSG_RTK_NOT_FOUND="RTK nao encontrado, instalando..."
MSG_RTK_INSTALL_START="Instalando binario RTK..."
MSG_RTK_INSTALL_OK="RTK instalado com sucesso"
MSG_RTK_INSTALL_FAIL="Instalacao do RTK falhou"

# Hooks
MSG_HOOKS_TITLE="Configurando hooks RTK"
MSG_HOOKS_INIT="Executando rtk init..."
MSG_HOOKS_INIT_OK="Hooks RTK configurados"
MSG_HOOKS_INIT_FAIL="Configuracao dos hooks RTK falhou"
MSG_HOOKS_SKIP="Hooks RTK ja configurados"

# Settings merge
MSG_MERGE_TITLE="Mesclando settings.json"
MSG_MERGE_BACKUP="Backup criado:"
MSG_MERGE_CREATED="settings.json criado com hook RTK"
MSG_MERGE_ADDED="Hook RTK adicionado ao PreToolUse"
MSG_MERGE_EXISTS="Hook RTK ja presente no settings.json"
MSG_MERGE_FAIL="Falha ao mesclar settings.json"

# Verification
MSG_VERIFY_TITLE="Verificando instalacao"
MSG_VERIFY_BINARY="Binario RTK"
MSG_VERIFY_HOOK="Script hook RTK"
MSG_VERIFY_SETTINGS="Entrada hook settings.json"
MSG_VERIFY_OK="Instalacao RTK verificada com sucesso"
MSG_VERIFY_FAIL="Verificacao da instalacao RTK falhou"

# Uninstall
MSG_UNINSTALL_TITLE="Desinstalando RTK"
MSG_UNINSTALL_HOOK_REMOVED="Hook RTK removido do settings.json"
MSG_UNINSTALL_SCRIPT_REMOVED="Script hook removido"
MSG_UNINSTALL_MD_REMOVED="RTK.md removido"
MSG_UNINSTALL_DONE="Hooks RTK desinstalados (binario mantido)"
MSG_UNINSTALL_NOTHING="Nenhum hook RTK encontrado para desinstalar"

# Gain / Stats
MSG_GAIN_TITLE="Economias de Tokens RTK"
MSG_GAIN_NONE="Sem dados ainda. Use Claude Code com RTK para iniciar o rastreamento."

# General
MSG_DONE="Concluido!"
MSG_ABORTED="Abortado."
