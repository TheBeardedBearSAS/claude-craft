#!/bin/bash
# =============================================================================
# Ralph Wiggum - Deutsche Nachrichten
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Kontinuierliche KI-Agenten-Schleife"
MSG_VERSION="Version"

# Status
MSG_ITERATION="Iteration"
MSG_OF="von"
MSG_SESSION="Sitzung"
MSG_STATUS="Status"
MSG_RUNNING="Laufend"
MSG_COMPLETE="Abgeschlossen"
MSG_FAILED="Fehlgeschlagen"
MSG_TIMEOUT="Zeituberschreitung"
MSG_CIRCUIT_BREAKER="Sicherungsschalter"

# Session
MSG_SESSION_CREATED="Sitzung erstellt"
MSG_SESSION_RESUMED="Sitzung fortgesetzt"
MSG_SESSION_ID="Sitzungs-ID"
MSG_SESSION_NOT_FOUND="Sitzung nicht gefunden"
MSG_SESSION_DIR="Sitzungsverzeichnis"

# Loop
MSG_STARTING_LOOP="Ralph-Schleife wird gestartet"
MSG_PROMPT="Prompt"
MSG_INVOKING_CLAUDE="Claude wird aufgerufen..."
MSG_WAITING="Warten"
MSG_SECONDS="Sekunden"
MSG_LOOP_COMPLETE="Schleife abgeschlossen"
MSG_LOOP_STOPPED="Schleife gestoppt"

# Definition of Done
MSG_DOD_TITLE="Definition of Done"
MSG_DOD_CHECKING="DoD-Kriterien werden gepruft..."
MSG_DOD_PASSED="DoD BESTANDEN"
MSG_DOD_FAILED="DoD NICHT ABGESCHLOSSEN"
MSG_DOD_ITEM_PASSED="OK"
MSG_DOD_ITEM_FAILED="FEHLER"
MSG_DOD_ITEM_SKIPPED="UBERSPRUNGEN"
MSG_DOD_REQUIRED="Erforderlich"
MSG_DOD_OPTIONAL="Optional"
MSG_DOD_ALL_REQUIRED_PASSED="Alle erforderlichen Kriterien bestanden!"
MSG_DOD_MISSING_REQUIRED="Fehlende erforderliche Kriterien:"
MSG_DOD_HUMAN_GATE="Menschliche Validierung"
MSG_DOD_HUMAN_PROMPT="Sieht das korrekt aus? (j/n):"

# Validators
MSG_VALIDATOR_COMMAND="Befehl wird ausgefuhrt"
MSG_VALIDATOR_OUTPUT="Ausgabemuster wird gepruft"
MSG_VALIDATOR_FILE="Dateienderungen werden gepruft"
MSG_VALIDATOR_HOOK="Hook wird ausgefuhrt"
MSG_VALIDATOR_HUMAN="Warten auf menschliche Validierung"

# Circuit Breaker
MSG_CB_TRIGGERED="Sicherungsschalter ausgelost"
MSG_CB_NO_CHANGES="Keine Dateienderungen seit"
MSG_CB_ITERATIONS="Iterationen"
MSG_CB_REPEATED_ERRORS="Wiederholte Fehler erkannt"
MSG_CB_OUTPUT_DECLINE="Ausgabe reduziert um"
MSG_CB_PERCENT="Prozent"
MSG_CB_MAX_REACHED="Maximale Iterationen erreicht"
MSG_CB_RESET="Sicherungsschalter zuruckgesetzt"

# Kontext-Verwaltung
MSG_CONTEXT_LIMIT_DETECTED="Kontextlimit erreicht"
MSG_CONTEXT_COMPACTING="Auto-Compact wird ausgefuhrt"
MSG_CONTEXT_COMPACTED="Kontext erfolgreich kompaktiert"
MSG_CONTEXT_COMPACT_FAILED="Auto-Compact fehlgeschlagen"
MSG_CONTEXT_RETRYING="Wiederholung nach Compact"
MSG_CONTEXT_MAX_REACHED="Maximale Compacts erreicht"
MSG_CONTEXT_DISABLED="Auto-Compact deaktiviert"

# Erweiterte Kontext-Verwaltung
MSG_CONTEXT_NEW_SESSION="Fortsetzungssitzung wird erstellt"
MSG_CONTEXT_EXTEND="Compact-Limit erweitert"
MSG_CONTEXT_OVERFLOW_FAIL="Kontextlimit uberschritten, wird gestoppt"
MSG_CONTEXT_PREVENTIVE="Kontext bei {0}% - praventives Compact"
MSG_CONTEXT_CONTINUATION_CREATED="Fortsetzungssitzung erstellt"
MSG_CONTEXT_MAX_CONTINUATIONS="Maximale Fortsetzungssitzungen erreicht"
MSG_CONTEXT_RECONSTRUCTING="Kontext wird aus Fortschrittsdatei rekonstruiert"

# Sprint-Fortschritt
MSG_SPRINT_PROGRESS_SAVED="Sprint-Fortschritt gespeichert"
MSG_SPRINT_PROGRESS_LOADED="Sprint-Fortschritt geladen"
MSG_SPRINT_CURRENT_TASK="Aktuelle Aufgabe"
MSG_SPRINT_COMPLETED_TASKS="Abgeschlossene Aufgaben"
MSG_SPRINT_PHASE="Phase"

# Strategisches Compact
MSG_CONTEXT_SPRINT_START="Compact bei Sprint-Start fur sauberen Kontext"
MSG_CONTEXT_TASK_COMPLETE="Aufgabe abgeschlossen - strategisches Compact"
MSG_CONTEXT_US_COMPLETE="US abgeschlossen - strategisches Compact"

# Checkpointing
MSG_CHECKPOINT_CREATING="Checkpoint wird erstellt..."
MSG_CHECKPOINT_CREATED="Checkpoint erstellt"
MSG_CHECKPOINT_RESTORING="Wiederherstellung vom Checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint wiederhergestellt"
MSG_CHECKPOINT_BRANCH="Checkpoint-Branch"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Checkpoint fehlgeschlagen"

# Configuration
MSG_CONFIG_LOADING="Konfiguration wird geladen..."
MSG_CONFIG_LOADED="Konfiguration geladen"
MSG_CONFIG_NOT_FOUND="Konfigurationsdatei nicht gefunden"
MSG_CONFIG_USING_DEFAULTS="Standardkonfiguration wird verwendet"
MSG_CONFIG_INVALID="Ungultige Konfiguration"
MSG_CONFIG_CREATED="Konfiguration erstellt"

# Output
MSG_OUTPUT_LOG="Log-Datei"
MSG_OUTPUT_METRICS="Metriken-Datei"
MSG_OUTPUT_WRITING="Ausgabe wird geschrieben..."
MSG_OUTPUT_SAVED="Ausgabe gespeichert"

# Errors
MSG_ERROR="Fehler"
MSG_ERROR_CLAUDE_NOT_FOUND="Claude-Befehl nicht gefunden"
MSG_ERROR_NO_PROMPT="Kein Prompt angegeben"
MSG_ERROR_INVALID_SESSION="Ungultige Sitzung"
MSG_ERROR_TIMEOUT="Zeituberschreitung"
MSG_ERROR_VALIDATION="Validierungsfehler"
MSG_ERROR_GIT_NOT_FOUND="Git nicht gefunden (erforderlich fur Checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq nicht gefunden (erforderlich fur JSON-Parsing)"
MSG_ERROR_YQ_NOT_FOUND="yq nicht gefunden (erforderlich fur YAML-Parsing)"

# Summary
MSG_SUMMARY_TITLE="Sitzungszusammenfassung"
MSG_SUMMARY_ITERATIONS="Gesamtiterationen"
MSG_SUMMARY_DURATION="Dauer"
MSG_SUMMARY_DOD_STATUS="DoD-Status"
MSG_SUMMARY_FILES_CHANGED="Geanderte Dateien"
MSG_SUMMARY_EXIT_REASON="Beendigungsgrund"

# Help
MSG_HELP_USAGE="Verwendung"
MSG_HELP_DESCRIPTION="Claude in kontinuierlicher Schleife ausfuhren bis Aufgabe abgeschlossen"
MSG_HELP_OPTIONS="Optionen"
MSG_HELP_PROMPT="Der Aufgaben-Prompt fur Claude"
MSG_HELP_CONFIG="Pfad zur ralph.yml-Konfiguration"
MSG_HELP_CONTINUE="Bestehende Sitzung fortsetzen"
MSG_HELP_MAX_ITER="Maximale Iterationen (Standard: 25)"
MSG_HELP_VERBOSE="Ausfuhrliche Ausgabe aktivieren"
MSG_HELP_DRY_RUN="Zeigen was getan wurde ohne Ausfuhrung"
MSG_HELP_LANG="Sprache (en, fr, es, de, pt)"
MSG_HELP_HELP="Diese Hilfemeldung anzeigen"
MSG_HELP_EXAMPLES="Beispiele"
MSG_HELP_EXAMPLE_BASIC="Grundlegende Verwendung mit Prompt"
MSG_HELP_EXAMPLE_CONFIG="Mit Konfigurationsdatei"
MSG_HELP_EXAMPLE_RESUME="Vorherige Sitzung fortsetzen"

# Menu (if interactive)
MSG_MENU_TITLE="Was mochten Sie tun?"
MSG_MENU_START="Neue Ralph-Sitzung starten"
MSG_MENU_RESUME="Bestehende Sitzung fortsetzen"
MSG_MENU_LIST="Sitzungen auflisten"
MSG_MENU_CONFIG="Konfiguration erstellen"
MSG_MENU_HELP="Hilfe"
MSG_MENU_QUIT="Beenden"

# Misc
MSG_PRESS_ENTER="Drucken Sie Enter um fortzufahren..."
MSG_YES="ja"
MSG_NO="nein"
MSG_CANCEL="Abgebrochen"
MSG_GOODBYE="Auf Wiedersehen!"
MSG_INVALID_CHOICE="Ungultige Auswahl"
MSG_CONFIRM="Bestatigen"
MSG_WARNING="Warnung"
MSG_INFO="Info"
MSG_SUCCESS="Erfolg"
