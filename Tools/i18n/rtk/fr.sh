#!/bin/bash
# =============================================================================
# RTK (Rust Token Killer) - Messages Francais
# =============================================================================

# Header
MSG_HEADER="RTK - Optimiseur de Tokens pour Claude Code"

# Prerequisites
MSG_PREREQ_TITLE="Verification des prerequis"
MSG_PREREQ_JQ="jq est installe"
MSG_PREREQ_JQ_MISSING="jq est requis. Installe-le : sudo apt install jq"
MSG_PREREQ_CURL="curl est installe"
MSG_PREREQ_CURL_MISSING="curl est requis. Installe-le : sudo apt install curl"

# RTK binary
MSG_RTK_CHECK="Verification de l'installation RTK"
MSG_RTK_INSTALLED="RTK est deja installe"
MSG_RTK_VERSION="Version RTK :"
MSG_RTK_NOT_FOUND="RTK non trouve, installation en cours..."
MSG_RTK_INSTALL_START="Installation du binaire RTK..."
MSG_RTK_INSTALL_OK="RTK installe avec succes"
MSG_RTK_INSTALL_FAIL="L'installation de RTK a echoue"

# Hooks
MSG_HOOKS_TITLE="Configuration des hooks RTK"
MSG_HOOKS_INIT="Execution de rtk init..."
MSG_HOOKS_INIT_OK="Hooks RTK configures"
MSG_HOOKS_INIT_FAIL="La configuration des hooks RTK a echoue"
MSG_HOOKS_SKIP="Hooks RTK deja configures"

# Settings merge
MSG_MERGE_TITLE="Fusion de settings.json"
MSG_MERGE_BACKUP="Sauvegarde creee :"
MSG_MERGE_CREATED="settings.json cree avec le hook RTK"
MSG_MERGE_ADDED="Hook RTK ajoute a PreToolUse"
MSG_MERGE_EXISTS="Hook RTK deja present dans settings.json"
MSG_MERGE_FAIL="Echec de la fusion de settings.json"

# Verification
MSG_VERIFY_TITLE="Verification de l'installation"
MSG_VERIFY_BINARY="Binaire RTK"
MSG_VERIFY_HOOK="Script hook RTK"
MSG_VERIFY_SETTINGS="Entree hook settings.json"
MSG_VERIFY_OK="Installation RTK verifiee avec succes"
MSG_VERIFY_FAIL="La verification de l'installation RTK a echoue"

# Uninstall
MSG_UNINSTALL_TITLE="Desinstallation de RTK"
MSG_UNINSTALL_HOOK_REMOVED="Hook RTK supprime de settings.json"
MSG_UNINSTALL_SCRIPT_REMOVED="Script hook supprime"
MSG_UNINSTALL_MD_REMOVED="RTK.md supprime"
MSG_UNINSTALL_DONE="Hooks RTK desinstalles (binaire conserve)"
MSG_UNINSTALL_NOTHING="Aucun hook RTK trouve a desinstaller"

# Gain / Stats
MSG_GAIN_TITLE="Economies de Tokens RTK"
MSG_GAIN_NONE="Pas encore de donnees. Utilise Claude Code avec RTK pour commencer le suivi."

# General
MSG_DONE="Termine !"
MSG_ABORTED="Abandonne."
