#!/bin/bash
# =============================================================================
# Claude Craft - Deutsche Nachrichten
# =============================================================================

# Installation
MSG_INSTALLING="Installiere..."
MSG_INSTALL_COMPLETE="Installation abgeschlossen!"
MSG_INSTALL_FAILED="Installation fehlgeschlagen"
MSG_INSTALL_SUCCESS="Installation erfolgreich!"

# Actions
MSG_CREATING="Erstelle:"
MSG_UPDATING="Aktualisiere:"
MSG_SKIPPING="Überspringe (Datei existiert):"
MSG_BACKUP_CREATED="Sicherung erstellt:"
MSG_COPIED="Kopiert"

# Status
MSG_INFO="INFO"
MSG_SUCCESS="ERFOLG"
MSG_WARNING="WARNUNG"
MSG_ERROR="FEHLER"
MSG_DRY_RUN="SIMULATION"

# Errors
MSG_ERR_UNKNOWN_OPTION="Unbekannte Option:"
MSG_ERR_UNEXPECTED_ARG="Unerwartetes Argument:"
MSG_ERR_INVALID_DIR="Ungültiges Zielverzeichnis:"
MSG_ERR_FILE_NOT_FOUND="Quelldatei nicht gefunden:"
MSG_ERR_DIR_NOT_FOUND="Quellverzeichnis nicht gefunden:"

# Components
MSG_INSTALLING_AGENTS="Installiere Agenten..."
MSG_INSTALLING_COMMANDS="Installiere Befehle..."
MSG_INSTALLING_RULES="Installiere Regeln..."
MSG_INSTALLING_TEMPLATES="Installiere Vorlagen..."
MSG_INSTALLING_CHECKLISTS="Installiere Checklisten..."

MSG_AGENTS_NOT_FOUND="Agenten-Verzeichnis nicht gefunden:"
MSG_COMMANDS_NOT_FOUND="Befehle-Verzeichnis nicht gefunden:"
MSG_RULES_NOT_FOUND="Regeln-Verzeichnis nicht gefunden:"
MSG_TEMPLATES_NOT_FOUND="Vorlagen-Verzeichnis nicht gefunden:"
MSG_CHECKLISTS_NOT_FOUND="Checklisten-Verzeichnis nicht gefunden:"

# Summary
MSG_SUMMARY="ZUSAMMENFASSUNG"
MSG_MODE="Modus:"
MSG_TARGET="Ziel:"
MSG_FILES_CREATED="Erstellte Dateien:"
MSG_FILES_UPDATED="Aktualisierte Dateien:"
MSG_FILES_SKIPPED="Übersprungene Dateien:"
MSG_ERRORS="Fehler:"

# Dry run
MSG_DRY_RUN_NOTE="Ohne --dry-run ausführen, um Änderungen anzuwenden."
MSG_DRY_RUN_WOULD_CREATE="Würde Verzeichnis erstellen:"
MSG_DRY_RUN_WOULD_COPY="Würde kopieren:"

# Headers
MSG_HEADER_COMMON="Installation gemeinsamer Regeln"
MSG_HEADER_SYMFONY="Installation Symfony-Regeln"
MSG_HEADER_FLUTTER="Installation Flutter-Regeln"
MSG_HEADER_PYTHON="Installation Python-Regeln"
MSG_HEADER_REACT="Installation React-Regeln"
MSG_HEADER_REACTNATIVE="Installation React Native-Regeln"

# Help
MSG_HELP_USAGE="Verwendung:"
MSG_HELP_OPTIONS="Optionen:"
MSG_HELP_EXAMPLES="Beispiele:"
MSG_HELP_INSTALL="Dateien installieren (Standard)"
MSG_HELP_UPDATE="Nur bestehende Dateien aktualisieren"
MSG_HELP_FORCE="Alle Dateien überschreiben"
MSG_HELP_DRY_RUN="Simulation ohne Änderungen"
MSG_HELP_BACKUP="Sicherung vor Änderungen erstellen"
MSG_HELP_INTERACTIVE="Interaktiver Modus"
MSG_HELP_LANG="Sprache (en, fr, es, de, pt)"

# Next steps
MSG_NEXT_STEPS="Nächste Schritte:"
MSG_STEP_EDIT_CONTEXT=".claude/rules/00-project-context.md bearbeiten"
MSG_STEP_CUSTOMIZE_CLAUDE=".claude/CLAUDE.md anpassen"
MSG_STEP_RESTART="Claude Code neu starten, um Befehle zu laden"

# Validation
MSG_VALIDATING="Konfiguration wird validiert..."
MSG_CONFIG_VALID="Konfiguration gültig"
MSG_CONFIG_INVALID="Konfiguration ungültig"
MSG_PROJECT="Projekt:"
MSG_MODULES="Module:"
