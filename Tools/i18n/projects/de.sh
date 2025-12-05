#!/bin/bash
# =============================================================================
# Claude Projects - Deutsche Nachrichten
# =============================================================================

# Header
MSG_HEADER="Claude Projektmanager"

# Menu
MSG_MENU_TITLE="Was möchtest du tun?"
MSG_MENU_LIST="Projekte auflisten"
MSG_MENU_ADD="Projekt hinzufügen"
MSG_MENU_EDIT="Projekt bearbeiten"
MSG_MENU_MODULE="Modul hinzufügen"
MSG_MENU_DELETE="Projekt löschen"
MSG_MENU_VALIDATE="Konfiguration validieren"
MSG_MENU_CHANGE_CONFIG="Config-Datei wechseln"
MSG_MENU_QUIT="Beenden"

# Config file
MSG_CONFIG_TITLE="Konfigurationsdatei"
MSG_CONFIG_FILES_FOUND="Gefundene Dateien:"
MSG_CONFIG_OTHER="Anderer Pfad..."
MSG_CONFIG_NEW="Neue Datei"
MSG_CONFIG_PROMPT="Auswahl:"
MSG_CONFIG_NEW_PATH="Pfad der neuen Datei:"
MSG_CONFIG_PATH="Dateipfad:"
MSG_CONFIG_NONE="Keine Datei gefunden."
MSG_CONFIG_DEFAULT="(Standard:"
MSG_CONFIG_CREATING="Erstelle Konfigurationsdatei..."
MSG_CONFIG_CREATED="Datei erstellt:"
MSG_CONFIG_CURRENT="Konfiguration:"

# Projects
MSG_PROJECTS_TITLE="Konfigurierte Projekte"
MSG_PROJECTS_NONE="Kein Projekt konfiguriert"
MSG_PROJECTS_USE_ADD="Verwende Projekt hinzufügen um zu beginnen"
MSG_PROJECTS_SELECT="Wähle ein Projekt:"
MSG_PROJECTS_MODULES="Modul(e)"
MSG_PROJECTS_COMMON="Common:"

# Add project
MSG_ADD_PROJECT_TITLE="Neues Projekt hinzufügen"
MSG_ADD_PROJECT_NAME="Projektname (z.B. meine-app):"
MSG_ADD_PROJECT_NAME_EMPTY="Name darf nicht leer sein"
MSG_ADD_PROJECT_EXISTS="Projekt existiert bereits"
MSG_ADD_PROJECT_DESC="Beschreibung (optional):"
MSG_ADD_PROJECT_ROOT="Wurzelpfad (z.B. ~/Projects/meine-app):"
MSG_ADD_PROJECT_ROOT_EMPTY="Pfad darf nicht leer sein"
MSG_ADD_PROJECT_COMMON="Common-Regeln im Wurzelverzeichnis installieren?"
MSG_ADD_PROJECT_CREATED="Projekt erstellt"
MSG_ADD_PROJECT_MODULES_NOW="Module jetzt hinzufügen?"

# Edit project
MSG_EDIT_PROJECT_TITLE="Projekt bearbeiten"
MSG_EDIT_PROJECT_SELECT="Wähle ein Projekt zum Bearbeiten:"
MSG_EDIT_PROJECT_EDITING="Bearbeite"
MSG_EDIT_PROJECT_KEEP="(Enter drücken um aktuellen Wert zu behalten)"
MSG_EDIT_PROJECT_NAME="Name"
MSG_EDIT_PROJECT_DESC="Beschreibung"
MSG_EDIT_PROJECT_ROOT="Wurzelpfad"
MSG_EDIT_PROJECT_COMMON="Common installieren?"
MSG_EDIT_PROJECT_DONE="Projekt geändert"
MSG_EDIT_PROJECT_MANAGE_MODULES="Module verwalten?"

# Delete project
MSG_DELETE_PROJECT_TITLE="Projekt löschen"
MSG_DELETE_PROJECT_SELECT="Wähle ein Projekt zum Löschen:"
MSG_DELETE_PROJECT_CONFIRM="Du wirst das Projekt löschen"
MSG_DELETE_PROJECT_CANCELLED="Löschung abgebrochen"
MSG_DELETE_PROJECT_DONE="Projekt gelöscht"

# Modules
MSG_MODULES_TITLE="Module von"
MSG_MODULES_NONE="Kein Modul"
MSG_MODULES_ADD="Modul hinzufügen"
MSG_MODULES_DELETE="Modul löschen"
MSG_MODULES_BACK="Zurück"
MSG_MODULES_ADD_TO="Modul hinzufügen zu"
MSG_MODULES_PATH="Modulpfad (z.B. frontend, backend, . für Wurzel):"
MSG_MODULES_PATH_EMPTY="Pfad darf nicht leer sein"
MSG_MODULES_TECH="Verfügbare Technologien:"
MSG_MODULES_TECH_PROMPT="Auswahl:"
MSG_MODULES_DESC="Beschreibung (optional):"
MSG_MODULES_ADDED="Modul hinzugefügt"
MSG_MODULES_DELETE_PROMPT="Modulnummer zum Löschen:"
MSG_MODULES_DELETED="Modul gelöscht"
MSG_MODULES_ADD_ANOTHER="Weiteres Modul hinzufügen?"

# Validation
MSG_VALIDATE_TITLE="Konfigurationsvalidierung"
MSG_VALIDATE_PROJECT="Projekt:"
MSG_VALIDATE_NAME_MISSING="Name fehlt"
MSG_VALIDATE_ROOT_MISSING="Wurzelpfad fehlt"
MSG_VALIDATE_DIR_NOT_FOUND="Verzeichnis nicht gefunden:"
MSG_VALIDATE_DIR_FOUND="Verzeichnis gefunden:"
MSG_VALIDATE_NO_MODULE="Kein Modul konfiguriert"
MSG_VALIDATE_INVALID_TECH="ungültige Technologie"
MSG_VALIDATE_MODULE="Modul"
MSG_VALIDATE_SUMMARY="Zusammenfassung:"
MSG_VALIDATE_PROJECTS="Projekte:"
MSG_VALIDATE_ERRORS="Fehler:"
MSG_VALIDATE_WARNINGS="Warnungen:"
MSG_VALIDATE_OK="Konfiguration gültig"
MSG_VALIDATE_FAIL="Konfiguration ungültig - Fehler beheben"

# Usage/Help
MSG_USAGE_TITLE="Verwendung"
MSG_USAGE_INTERACTIVE="Interaktiver Modus:"
MSG_USAGE_MENU="Interaktives Menü"
MSG_USAGE_COMMANDS="Direkte Befehle:"
MSG_USAGE_LIST="Projekte auflisten"
MSG_USAGE_ADD="Projekt hinzufügen"
MSG_USAGE_EDIT="Projekt bearbeiten"
MSG_USAGE_DELETE="Projekt löschen"
MSG_USAGE_VALIDATE="Konfiguration validieren"
MSG_USAGE_OPTIONS="Optionen:"
MSG_USAGE_CONFIG="Konfigurationsdatei"
MSG_USAGE_LANG="Sprache (en, fr, es, de, pt)"
MSG_USAGE_EXAMPLES="Beispiele:"

# Common
MSG_YQ_REQUIRED="yq wird benötigt aber ist nicht installiert"
MSG_YQ_INSTALL="Installation:"
MSG_INVALID_CHOICE="Ungültige Auswahl"
MSG_UNKNOWN_COMMAND="Unbekannter Befehl:"
MSG_GOODBYE="Auf Wiedersehen!"
MSG_CONFIRM_YES_NO="(j/N)"
MSG_YES_NO_DEFAULT="(J/n)"
MSG_PRESS_ENTER="Drücke Enter um fortzufahren..."
MSG_INVALID_LANG="Ungültige Sprache:"
MSG_VALID_LANGS="Gültige Sprachen:"
