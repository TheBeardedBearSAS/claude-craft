#!/bin/bash
# =============================================================================
# RTK (Rust Token Killer) - English Messages
# =============================================================================

# Header
MSG_HEADER="RTK - Token Optimizer for Claude Code"

# Prerequisites
MSG_PREREQ_TITLE="Checking prerequisites"
MSG_PREREQ_JQ="jq is installed"
MSG_PREREQ_JQ_MISSING="jq is required. Install it: sudo apt install jq"
MSG_PREREQ_CURL="curl is installed"
MSG_PREREQ_CURL_MISSING="curl is required. Install it: sudo apt install curl"

# RTK binary
MSG_RTK_CHECK="Checking RTK installation"
MSG_RTK_INSTALLED="RTK is already installed"
MSG_RTK_VERSION="RTK version:"
MSG_RTK_NOT_FOUND="RTK not found, installing..."
MSG_RTK_INSTALL_START="Installing RTK binary..."
MSG_RTK_INSTALL_OK="RTK installed successfully"
MSG_RTK_INSTALL_FAIL="RTK installation failed"

# Hooks
MSG_HOOKS_TITLE="Configuring RTK hooks"
MSG_HOOKS_INIT="Running rtk init..."
MSG_HOOKS_INIT_OK="RTK hooks configured"
MSG_HOOKS_INIT_FAIL="RTK hook configuration failed"
MSG_HOOKS_SKIP="RTK hooks already configured"

# Settings merge
MSG_MERGE_TITLE="Merging settings.json"
MSG_MERGE_BACKUP="Backup created:"
MSG_MERGE_CREATED="settings.json created with RTK hook"
MSG_MERGE_ADDED="RTK hook added to PreToolUse"
MSG_MERGE_EXISTS="RTK hook already present in settings.json"
MSG_MERGE_FAIL="Failed to merge settings.json"

# Verification
MSG_VERIFY_TITLE="Verifying installation"
MSG_VERIFY_BINARY="RTK binary"
MSG_VERIFY_HOOK="RTK hook script"
MSG_VERIFY_SETTINGS="settings.json hook entry"
MSG_VERIFY_OK="RTK installation verified successfully"
MSG_VERIFY_FAIL="RTK installation verification failed"

# Uninstall
MSG_UNINSTALL_TITLE="Uninstalling RTK"
MSG_UNINSTALL_HOOK_REMOVED="RTK hook removed from settings.json"
MSG_UNINSTALL_SCRIPT_REMOVED="Hook script removed"
MSG_UNINSTALL_MD_REMOVED="RTK.md removed"
MSG_UNINSTALL_DONE="RTK hooks uninstalled (binary kept)"
MSG_UNINSTALL_NOTHING="No RTK hooks found to uninstall"

# Gain / Stats
MSG_GAIN_TITLE="RTK Token Savings"
MSG_GAIN_NONE="No savings data yet. Use Claude Code with RTK to start tracking."

# General
MSG_DONE="Done!"
MSG_ABORTED="Aborted."
