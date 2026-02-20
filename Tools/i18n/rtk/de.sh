#!/bin/bash
# =============================================================================
# RTK (Rust Token Killer) - Deutsche Nachrichten
# =============================================================================

# Header
MSG_HEADER="RTK - Token-Optimierer fuer Claude Code"

# Prerequisites
MSG_PREREQ_TITLE="Voraussetzungen pruefen"
MSG_PREREQ_JQ="jq ist installiert"
MSG_PREREQ_JQ_MISSING="jq wird benoetigt. Installieren: sudo apt install jq"
MSG_PREREQ_CURL="curl ist installiert"
MSG_PREREQ_CURL_MISSING="curl wird benoetigt. Installieren: sudo apt install curl"

# RTK binary
MSG_RTK_CHECK="RTK-Installation pruefen"
MSG_RTK_INSTALLED="RTK ist bereits installiert"
MSG_RTK_VERSION="RTK-Version:"
MSG_RTK_NOT_FOUND="RTK nicht gefunden, wird installiert..."
MSG_RTK_INSTALL_START="RTK-Binary wird installiert..."
MSG_RTK_INSTALL_OK="RTK erfolgreich installiert"
MSG_RTK_INSTALL_FAIL="RTK-Installation fehlgeschlagen"

# Hooks
MSG_HOOKS_TITLE="RTK-Hooks konfigurieren"
MSG_HOOKS_INIT="rtk init ausfuehren..."
MSG_HOOKS_INIT_OK="RTK-Hooks konfiguriert"
MSG_HOOKS_INIT_FAIL="RTK-Hook-Konfiguration fehlgeschlagen"
MSG_HOOKS_SKIP="RTK-Hooks bereits konfiguriert"

# Settings merge
MSG_MERGE_TITLE="settings.json zusammenfuehren"
MSG_MERGE_BACKUP="Sicherung erstellt:"
MSG_MERGE_CREATED="settings.json mit RTK-Hook erstellt"
MSG_MERGE_ADDED="RTK-Hook zu PreToolUse hinzugefuegt"
MSG_MERGE_EXISTS="RTK-Hook bereits in settings.json vorhanden"
MSG_MERGE_FAIL="Zusammenfuehrung von settings.json fehlgeschlagen"

# Verification
MSG_VERIFY_TITLE="Installation ueberpruefen"
MSG_VERIFY_BINARY="RTK-Binary"
MSG_VERIFY_HOOK="RTK-Hook-Skript"
MSG_VERIFY_SETTINGS="settings.json Hook-Eintrag"
MSG_VERIFY_OK="RTK-Installation erfolgreich verifiziert"
MSG_VERIFY_FAIL="RTK-Installationsverifizierung fehlgeschlagen"

# Uninstall
MSG_UNINSTALL_TITLE="RTK deinstallieren"
MSG_UNINSTALL_HOOK_REMOVED="RTK-Hook aus settings.json entfernt"
MSG_UNINSTALL_SCRIPT_REMOVED="Hook-Skript entfernt"
MSG_UNINSTALL_MD_REMOVED="RTK.md entfernt"
MSG_UNINSTALL_DONE="RTK-Hooks deinstalliert (Binary beibehalten)"
MSG_UNINSTALL_NOTHING="Keine RTK-Hooks zum Deinstallieren gefunden"

# Gain / Stats
MSG_GAIN_TITLE="RTK Token-Einsparungen"
MSG_GAIN_NONE="Noch keine Daten. Verwende Claude Code mit RTK, um das Tracking zu starten."

# General
MSG_DONE="Fertig!"
MSG_ABORTED="Abgebrochen."
