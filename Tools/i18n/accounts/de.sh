#!/bin/bash
# =============================================================================
# Claude Accounts - Deutsche Nachrichten
# =============================================================================

# Header
MSG_HEADER="Claude Code Multi-Account Manager"

# Menu
MSG_MENU_TITLE="Was möchtest du tun?"
MSG_MENU_LIST="Profile auflisten"
MSG_MENU_ADD="Profil hinzufügen"
MSG_MENU_REMOVE="Profil löschen"
MSG_MENU_AUTH="Profil authentifizieren"
MSG_MENU_LAUNCH="Claude Code starten"
MSG_MENU_CCSP_FUNC="ccsp() Funktion installieren"
MSG_MENU_MIGRATE="Legacy-Profil migrieren"
MSG_MENU_HELP="Hilfe"
MSG_MENU_QUIT="Beenden"

# Status
MSG_STATUS_AUTH="authentifiziert"
MSG_STATUS_NOT_AUTH="nicht authentifiziert"
MSG_STATUS_LEGEND_AUTH="= authentifiziert"
MSG_STATUS_LEGEND_NOT_AUTH="= nicht authentifiziert"

# Profile modes
MSG_MODE_SHARED="geteilt"
MSG_MODE_ISOLATED="isoliert"
MSG_MODE_LEGACY="legacy"
MSG_MODE_LABEL_SHARED="[geteilt]"
MSG_MODE_LABEL_ISOLATED="[isoliert]"
MSG_MODE_LABEL_LEGACY="[legacy]"
MSG_MODE_LEGEND="Config ~/.claude"
MSG_MODE_LEGEND_ISOLATED="unabhängige Config"
MSG_MODE_LEGEND_LEGACY="altes Profil"

# List profiles
MSG_PROFILES_TITLE="Konfigurierte Profile:"
MSG_NO_PROFILE="Kein Profil konfiguriert"
MSG_USE_ADD="Verwende Profil hinzufügen um zu beginnen"
MSG_PROFILES_AVAILABLE="Verfügbare Profile:"
MSG_ALIAS_LABEL="Alias:"

# Directory
MSG_PROFILES_DIR_CREATED="Profilverzeichnis erstellt:"

# Add profile
MSG_ADD_TITLE="Neues Profil hinzufügen"
MSG_ADD_NAME_PROMPT="Profilname (z.B. privat, arbeit, kunde-acme):"
MSG_ADD_NAME_EMPTY="Name darf nicht leer sein"
MSG_ADD_PROFILE_EXISTS="Profil existiert bereits"
MSG_ADD_PROFILE_CREATED="Profil erstellt"
MSG_ADD_AUTH_NOW="Dieses Profil jetzt authentifizieren?"
MSG_ADD_AUTH_LATER="Zur späteren Authentifizierung:"
MSG_ADD_AUTH_OR="Oder starte dieses Script neu und wähle 'Profil authentifizieren'"

# Mode selection
MSG_MODE_CHOOSE="Profilmodus wählen:"
MSG_MODE_SHARED_DESC="Geteilt  - Gleiche Config wie ~/.claude (Wechsel bei Limits)"
MSG_MODE_ISOLATED_DESC="Isoliert - Unabhängige Config (z.B. Kunde)"
MSG_MODE_PROMPT="Modus [1]:"

# Setup messages
MSG_SYMLINK_CREATED="Symlink zu ~/.claude erstellt"
MSG_CLAUDE_DIR_MISSING="~/.claude existiert nicht, Symlink wird später erstellt"
MSG_CONFIG_COPIED="Konfiguration von ~/.claude kopiert"
MSG_EMPTY_PROFILE="~/.claude existiert nicht, leeres Profil erstellt"

# Remove profile
MSG_REMOVE_TITLE="Profil löschen"
MSG_REMOVE_NO_PROFILE="Kein Profil zum Löschen"
MSG_REMOVE_NUMBER_PROMPT="Profilnummer zum Löschen (oder Name):"
MSG_REMOVE_NOT_FOUND="Profil nicht gefunden"
MSG_REMOVE_CONFIRM="Du wirst das Profil löschen"
MSG_REMOVE_CANCELLED="Löschung abgebrochen"
MSG_REMOVE_DONE="Profil gelöscht"
MSG_ALIAS_REMOVED="Alias entfernt aus"

# Migrate profile
MSG_MIGRATE_TITLE="Legacy-Profil migrieren"
MSG_MIGRATE_NO_LEGACY="Kein Legacy-Profil zu migrieren (alle haben einen Modus)"
MSG_MIGRATE_LEGACY_LIST="Legacy-Profile (ohne Modus):"
MSG_MIGRATE_NUMBER_PROMPT="Profilnummer zum Migrieren:"
MSG_MIGRATE_TO_MODE="Zu welchem Modus migrieren?"
MSG_MIGRATE_SHARED_DESC="Geteilt  - Symlink zu ~/.claude erstellen"
MSG_MIGRATE_ISOLATED_DESC="Isoliert - Aktuelle Config isoliert behalten"
MSG_MIGRATE_DONE_SHARED="Profil zu GETEILT-Modus migriert"
MSG_MIGRATE_DONE_ISOLATED="Profil zu ISOLIERT-Modus migriert"
MSG_MIGRATE_CONFIG_KEPT="Bestehende Konfiguration wird beibehalten"

# Auth profile
MSG_AUTH_TITLE="Profil authentifizieren"
MSG_AUTH_CREATE_FIRST="Kein Profil konfiguriert. Erstelle zuerst ein Profil."
MSG_AUTH_NUMBER_PROMPT="Profilnummer zum Authentifizieren:"
MSG_AUTH_LAUNCHING="Starte Claude Code für Profil"
MSG_AUTH_CONNECT="Verbinde dich mit dem gewünschten Konto"

# Launch profile
MSG_LAUNCH_TITLE="Claude Code starten"
MSG_LAUNCH_DEFAULT="default (Standardconfig)"
MSG_LAUNCH_PROMPT="Auswahl:"
MSG_LAUNCH_WITH_DEFAULT="Starte mit Standardconfig..."
MSG_LAUNCH_WITH_PROFILE="Starte Profil"
MSG_LAUNCH_NO_PROFILE="Kein Profil konfiguriert, starte mit Standardconfig"

# Usage/Help
MSG_USAGE_TITLE="Verwendung"
MSG_USAGE_QUICK="Schnelle Befehle:"
MSG_USAGE_ADD_DESC="Neues Profil hinzufügen (geteilt oder isoliert)"
MSG_USAGE_RM_DESC="Profil löschen"
MSG_USAGE_LIST_DESC="Profile mit Modus auflisten"
MSG_USAGE_AUTH_DESC="Profil authentifizieren"
MSG_USAGE_RUN_DESC="Claude Code mit Profil starten"
MSG_USAGE_MIGRATE_DESC="Legacy-Profil zu shared/isolated migrieren"
MSG_USAGE_MODES="Profilmodi:"
MSG_USAGE_MODE_SHARED_DESC="Gemeinsame Config (~/.claude), Wechsel bei Limits"
MSG_USAGE_MODE_ISOLATED_DESC="Unabhängige Config, für Kunden"
MSG_USAGE_MODE_LEGACY_DESC="Altes Profil, kann migriert werden"
MSG_USAGE_ALIAS="Nach der Konfiguration, verwende Aliase:"
MSG_USAGE_OR_CC="Oder die ccsp() Funktion falls hinzugefügt:"
MSG_USAGE_LANG_DESC="Sprache (en, fr, es, de, pt)"

# ccsp() function
MSG_CC_TITLE="ccsp() Funktion installieren"
MSG_CC_ALREADY="ccsp() Funktion ist bereits installiert"
MSG_CC_ADDED="ccsp() Funktion hinzugefügt zu"
MSG_CC_USAGE="Verwendung:"
MSG_CC_MENU="Auswahlmenü"
MSG_CC_PROFILE="Profil"
MSG_CC_NOT_FOUND="nicht gefunden. Verfügbare Profile:"
MSG_CC_NONE="(keine)"

# Alias
MSG_ALIAS_EXISTS="Alias bereits vorhanden in"
MSG_ALIAS_ADDED="Alias hinzugefügt zu"
MSG_SOURCE_OR_NEW="Führe source aus oder öffne ein neues Terminal"

# Prompts
MSG_CONFIRM_YES_NO="(j/N)"
MSG_PRESS_ENTER="Drücke Enter um fortzufahren..."
MSG_INVALID_CHOICE="Ungültige Auswahl"
MSG_UNKNOWN_COMMAND="Unbekannter Befehl:"
MSG_GOODBYE="Auf Wiedersehen!"
MSG_INVALID_LANG="Ungültige Sprache:"
MSG_VALID_LANGS="Gültige Sprachen:"

# Mode in creation
MSG_MODE_IN="im Modus"
