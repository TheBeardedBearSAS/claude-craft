#!/bin/bash
# =============================================================================
# RTK (Rust Token Killer) - Mensajes en Espanol
# =============================================================================

# Header
MSG_HEADER="RTK - Optimizador de Tokens para Claude Code"

# Prerequisites
MSG_PREREQ_TITLE="Verificando prerequisitos"
MSG_PREREQ_JQ="jq esta instalado"
MSG_PREREQ_JQ_MISSING="jq es necesario. Instalalo: sudo apt install jq"
MSG_PREREQ_CURL="curl esta instalado"
MSG_PREREQ_CURL_MISSING="curl es necesario. Instalalo: sudo apt install curl"

# RTK binary
MSG_RTK_CHECK="Verificando instalacion de RTK"
MSG_RTK_INSTALLED="RTK ya esta instalado"
MSG_RTK_VERSION="Version de RTK:"
MSG_RTK_NOT_FOUND="RTK no encontrado, instalando..."
MSG_RTK_INSTALL_START="Instalando binario RTK..."
MSG_RTK_INSTALL_OK="RTK instalado correctamente"
MSG_RTK_INSTALL_FAIL="La instalacion de RTK fallo"

# Hooks
MSG_HOOKS_TITLE="Configurando hooks RTK"
MSG_HOOKS_INIT="Ejecutando rtk init..."
MSG_HOOKS_INIT_OK="Hooks RTK configurados"
MSG_HOOKS_INIT_FAIL="La configuracion de hooks RTK fallo"
MSG_HOOKS_SKIP="Hooks RTK ya configurados"

# Settings merge
MSG_MERGE_TITLE="Fusionando settings.json"
MSG_MERGE_BACKUP="Copia de seguridad creada:"
MSG_MERGE_CREATED="settings.json creado con hook RTK"
MSG_MERGE_ADDED="Hook RTK agregado a PreToolUse"
MSG_MERGE_EXISTS="Hook RTK ya presente en settings.json"
MSG_MERGE_FAIL="Fallo al fusionar settings.json"

# Verification
MSG_VERIFY_TITLE="Verificando instalacion"
MSG_VERIFY_BINARY="Binario RTK"
MSG_VERIFY_HOOK="Script hook RTK"
MSG_VERIFY_SETTINGS="Entrada hook settings.json"
MSG_VERIFY_OK="Instalacion RTK verificada correctamente"
MSG_VERIFY_FAIL="La verificacion de la instalacion RTK fallo"

# Uninstall
MSG_UNINSTALL_TITLE="Desinstalando RTK"
MSG_UNINSTALL_HOOK_REMOVED="Hook RTK eliminado de settings.json"
MSG_UNINSTALL_SCRIPT_REMOVED="Script hook eliminado"
MSG_UNINSTALL_MD_REMOVED="RTK.md eliminado"
MSG_UNINSTALL_DONE="Hooks RTK desinstalados (binario conservado)"
MSG_UNINSTALL_NOTHING="No se encontraron hooks RTK para desinstalar"

# Gain / Stats
MSG_GAIN_TITLE="Ahorros de Tokens RTK"
MSG_GAIN_NONE="Sin datos aun. Usa Claude Code con RTK para comenzar el seguimiento."

# General
MSG_DONE="Listo!"
MSG_ABORTED="Abortado."
