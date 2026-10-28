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
MSG_TIMEOUT="Zeitüberschreitung"
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
MSG_DOD_CHECKING="DoD-Kriterien werden geprüft..."
MSG_DOD_PASSED="DoD BESTANDEN"
MSG_DOD_FAILED="DoD NICHT ABGESCHLOSSEN"
MSG_DOD_ITEM_PASSED="OK"
MSG_DOD_ITEM_FAILED="FEHLER"
MSG_DOD_ITEM_SKIPPED="ÜBERSPRUNGEN"
MSG_DOD_REQUIRED="Erforderlich"
MSG_DOD_OPTIONAL="Optional"
MSG_DOD_ALL_REQUIRED_PASSED="Alle erforderlichen Kriterien bestanden!"
MSG_DOD_MISSING_REQUIRED="Fehlende erforderliche Kriterien:"
MSG_DOD_HUMAN_GATE="Menschliche Validierung"
MSG_DOD_HUMAN_PROMPT="Sieht das korrekt aus? (j/n):"

# Validators
MSG_VALIDATOR_COMMAND="Befehl wird ausgeführt"
MSG_VALIDATOR_OUTPUT="Ausgabemuster wird geprüft"
MSG_VALIDATOR_FILE="Dateiänderungen werden geprüft"
MSG_VALIDATOR_HOOK="Hook wird ausgeführt"
MSG_VALIDATOR_HUMAN="Warten auf menschliche Validierung"

# Circuit Breaker
MSG_CB_TRIGGERED="Sicherungsschalter ausgelöst"
MSG_CB_NO_CHANGES="Keine Dateiänderungen seit"
MSG_CB_ITERATIONS="Iterationen"
MSG_CB_REPEATED_ERRORS="Wiederholte Fehler erkannt"
MSG_CB_OUTPUT_DECLINE="Ausgabe reduziert um"
MSG_CB_PERCENT="Prozent"
MSG_CB_MAX_REACHED="Maximale Iterationen erreicht"
MSG_CB_RESET="Sicherungsschalter zurückgesetzt"

# Kontext-Verwaltung
MSG_CONTEXT_LIMIT_DETECTED="Kontextlimit erreicht"
MSG_CONTEXT_COMPACTING="Auto-Compact wird ausgeführt"
MSG_CONTEXT_COMPACTED="Kontext erfolgreich kompaktiert"
MSG_CONTEXT_COMPACT_FAILED="Auto-Compact fehlgeschlagen"
MSG_CONTEXT_RETRYING="Wiederholung nach Compact"
MSG_CONTEXT_MAX_REACHED="Maximale Compacts erreicht"
MSG_CONTEXT_DISABLED="Auto-Compact deaktiviert"

# Erweiterte Kontext-Verwaltung
MSG_CONTEXT_NEW_SESSION="Fortsetzungssitzung wird erstellt"
MSG_CONTEXT_EXTEND="Compact-Limit erweitert"
MSG_CONTEXT_OVERFLOW_FAIL="Kontextlimit überschritten, wird gestoppt"
MSG_CONTEXT_PREVENTIVE="Kontext bei {0}% - präventives Compact"
MSG_CONTEXT_BELOW_MIN="Kontext bei {0}% - unter Mindestschwelle ({1}%), Compact übersprungen"
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
MSG_CONTEXT_SPRINT_START="Compact bei Sprint-Start für sauberen Kontext"
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
MSG_CONFIG_INVALID="Ungültige Konfiguration"
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
MSG_ERROR_INVALID_SESSION="Ungültige Sitzung"
MSG_ERROR_TIMEOUT="Zeitüberschreitung"
MSG_ERROR_VALIDATION="Validierungsfehler"
MSG_ERROR_GIT_NOT_FOUND="Git nicht gefunden (erforderlich für Checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq nicht gefunden (erforderlich für JSON-Parsing)"
MSG_ERROR_YQ_NOT_FOUND="yq nicht gefunden (erforderlich für YAML-Parsing)"

# Summary
MSG_SUMMARY_TITLE="Sitzungszusammenfassung"
MSG_SUMMARY_ITERATIONS="Gesamtiterationen"
MSG_SUMMARY_DURATION="Dauer"
MSG_SUMMARY_DOD_STATUS="DoD-Status"
MSG_SUMMARY_FILES_CHANGED="Geänderte Dateien"
MSG_SUMMARY_EXIT_REASON="Beendigungsgrund"

# Help
MSG_HELP_USAGE="Verwendung"
MSG_HELP_DESCRIPTION="Claude in kontinuierlicher Schleife ausführen bis Aufgabe abgeschlossen"
MSG_HELP_OPTIONS="Optionen"
MSG_HELP_PROMPT="Der Aufgaben-Prompt für Claude"
MSG_HELP_CONFIG="Pfad zur ralph.yml-Konfiguration"
MSG_HELP_CONTINUE="Bestehende Sitzung fortsetzen"
MSG_HELP_MAX_ITER="Maximale Iterationen (Standard: 25)"
MSG_HELP_VERBOSE="Ausführliche Ausgabe aktivieren"
MSG_HELP_DRY_RUN="Zeigen was getan würde ohne Ausführung"
MSG_HELP_LANG="Sprache (en, fr, es, de, pt)"
MSG_HELP_HELP="Diese Hilfemeldung anzeigen"
MSG_HELP_EXAMPLES="Beispiele"
MSG_HELP_EXAMPLE_BASIC="Grundlegende Verwendung mit Prompt"
MSG_HELP_EXAMPLE_CONFIG="Mit Konfigurationsdatei"
MSG_HELP_EXAMPLE_RESUME="Vorherige Sitzung fortsetzen"

# Menu (if interactive)
MSG_MENU_TITLE="Was möchten Sie tun?"
MSG_MENU_START="Neue Ralph-Sitzung starten"
MSG_MENU_RESUME="Bestehende Sitzung fortsetzen"
MSG_MENU_LIST="Sitzungen auflisten"
MSG_MENU_CONFIG="Konfiguration erstellen"
MSG_MENU_HELP="Hilfe"
MSG_MENU_QUIT="Beenden"

# Misc
MSG_PRESS_ENTER="Drücken Sie Enter um fortzufahren..."
MSG_YES="ja"
MSG_NO="nein"
MSG_CANCEL="Abgebrochen"
MSG_GOODBYE="Auf Wiedersehen!"
MSG_INVALID_CHOICE="Ungültige Auswahl"
MSG_CONFIRM="Bestätigen"
MSG_WARNING="Warnung"
MSG_INFO="Info"
MSG_SUCCESS="Erfolg"

# =============================================================================
# v2.0 Nachrichten
# =============================================================================

# Auto-Erkennung
MSG_AUTO_DETECT="Automatische Erkennung des Projekttyps..."
MSG_AUTO_DETECT_FOUND="Projekttyp erkannt"
MSG_AUTO_DETECT_CONFIDENCE="Konfidenz"
MSG_AUTO_DETECT_NOT_FOUND="Projekttyp konnte nicht erkannt werden"
MSG_HELP_AUTO_DETECT="Projekttyp automatisch erkennen und DoD konfigurieren"
MSG_HELP_INIT="Konfiguration generieren ohne auszuführen (nur init)"
MSG_HELP_INTERACTIVE="Interaktiver Konfigurationsassistent"

# Dashboard
MSG_DASHBOARD_ENABLED="Dashboard aktiviert"
MSG_DASHBOARD_DISABLED="Dashboard deaktiviert"
MSG_DASHBOARD_MODE="Dashboard-Modus"

# Metriken
MSG_METRICS_ENABLED="Metrikenerfassung aktiviert"
MSG_METRICS_EXPORTED="Metriken exportiert"
MSG_METRICS_FORMAT="Metrikenformat"

# Gesundheitsmonitor
MSG_HEALTH_HEALTHY="Gesundheit: OK"
MSG_HEALTH_WARNING="Gesundheitswarnung"
MSG_HEALTH_CRITICAL="Kritische Gesundheit"
MSG_HEALTH_STALL="Stillstand erkannt"
MSG_HEALTH_ERROR_SPIRAL="Fehlerspirale erkannt"
MSG_HEALTH_CONTEXT_BLOAT="Kontextaufblähung erkannt"

# Hooks
MSG_HOOKS_ENABLED="Hooks-Integration aktiviert"
MSG_HOOKS_DISABLED="Hooks-Integration deaktiviert"
MSG_HOOKS_CONFIG_GENERATED="Hooks-Konfiguration generiert"
MSG_HOOKS_DOD_BLOCKED="DoD nicht erfüllt - Stopp blockiert"

# Adaptiver Schutzschalter
MSG_CB_ADAPTIVE_ENABLED="Adaptiver Schutzschalter aktiviert"
MSG_CB_PROFILE_DETECTED="Profil erkannt"
MSG_CB_LEARNING_ENABLED="Historisches Lernen aktiviert"
MSG_CB_LEARNING_ADJUSTED="Schwellenwerte basierend auf Historie angepasst"

# Konfigurationsgenerator
MSG_CONFIG_GENERATED="Konfiguration generiert"
MSG_CONFIG_WIZARD_TITLE="Konfigurationsassistent"
MSG_CONFIG_DETECTING="Projekteinstellungen werden erkannt..."
MSG_CONFIG_CONFIRM="Ist das korrekt?"

# An Claude gesendete Prompts ({0} = rekonstruierter Kontext)
MSG_PROMPT_CONTINUATION="# Sprint-Fortsetzung

Du setzt die Arbeit an diesem Sprint nach einer Kontext-Kompaktierung fort.
Die Datei sprint-progress.md enthält den vollständigen Stand der bisherigen Arbeit.

{0}

## Anweisungen

1. **Lies** den obigen Fortschritt, um den aktuellen Stand zu verstehen
2. **Prüfe** bei Bedarf die geänderten Dateien
3. **Setze** die laufende Aufgabe dort fort, wo sie stehen geblieben ist
4. **Führe** den TDD-Workflow fort (RED -> GREEN -> REFACTOR)
5. **Aktualisiere** sprint-progress.md nach jeder abgeschlossenen Aufgabe

## Wichtige Befehle

- Nach jeder Aufgabe: sprint-progress.md aktualisieren
- Bei einer Blockade: im Abschnitt Blockers notieren
- Bei einer wichtigen Entscheidung: unter Key Decisions ergänzen

Setze die Implementierung fort."

# {0} = ID der vorherigen Sitzung, {1} = rekonstruierter Kontext
MSG_PROMPT_HANDOFF="# Neue Fortsetzungssitzung

Diese Sitzung setzt die Arbeit der vorherigen Sitzung ({0}) fort.
Der Kontext wurde zurückgesetzt, aber die Datei sprint-progress.md enthält den gesamten Fortschritt.

{1}

## Kontext des Übergangs

- Vorherige Sitzung: {0}
- Grund: Kontextlimit erreicht (max compacts)
- Die Arbeit wurde in sprint-progress.md gesichert
- Die Dateien entsprechen dem letzten Git-Checkpoint

## Anweisungen

1. **Prüfe** den aktuellen Stand mit git status
2. **Lies** sprint-progress.md für den vollständigen Kontext
3. **Bestimme** die laufende Aufgabe und ihren Stand
4. **Setze** genau dort fort, wo die vorherige Sitzung aufgehört hat

Nimm die Arbeit wieder auf."

# Abschnitte des rekonstruierten Kontexts für Claude ({0} = Phase)
MSG_SECTION_PROGRESS="## Sprint-Fortschritt"
MSG_SECTION_CURRENT_STATE="### Aktueller Stand"
MSG_SECTION_UNKNOWN="Unbekannt"
MSG_SECTION_COMPLETED_TASKS="### Erledigte Aufgaben"
MSG_SECTION_NONE_YET="Noch keine"
MSG_SECTION_KEY_DECISIONS="### Wichtige Entscheidungen"
MSG_SECTION_NONE_RECORDED="Keine erfasst"
MSG_SECTION_NO_PROGRESS_FILE="Keine Sprint-Fortschrittsdatei gefunden."
MSG_SECTION_GIT="## Letzte Änderungen"
MSG_SECTION_NOT_GIT="Kein Git-Repository."
MSG_SECTION_MODIFIED_FILES="### Geänderte Dateien (letzte Commits)"
MSG_SECTION_NO_RECENT_CHANGES="Keine aktuellen Änderungen"
MSG_SECTION_NO_COMMITS="Noch keine Commits"
MSG_SECTION_RECENT_COMMITS="### Letzte Commits"
MSG_SECTION_UNCOMMITTED="### Nicht committete Änderungen"
MSG_SECTION_NO_UNCOMMITTED="Keine nicht committeten Änderungen."
MSG_SECTION_TESTS="## Teststatus"
MSG_SECTION_UNIT_TESTS="Unit-Tests"
MSG_SECTION_INTEGRATION_TESTS="Integrationstests"
MSG_SECTION_TASK="## Aktuelle Aufgabe"
MSG_SECTION_TASK_LABEL="Aufgabe"
MSG_SECTION_CONTINUE_PHASE="Machen Sie dort weiter, wo Sie in der Phase {0} aufgehört haben."
MSG_SECTION_NO_TASK="Keine Aufgabe in Bearbeitung."
MSG_SECTION_NO_TASK_INFO="Keine Informationen zur aktuellen Aufgabe verfügbar."

# Sprint Conductor (ASC-Leader)
MSG_ASC_HEADER="Autonomer Sprint-Conductor (ASC)"
MSG_ASC_NO_PARALLEL_MANAGER="Parallel-Manager nicht verfügbar, Wechsel zu sequenziell"
MSG_ASC_INITIALIZED="Sprint-Conductor initialisiert"
MSG_ASC_INIT_SESSION="  Sitzung: {0}"
MSG_ASC_INIT_MODE="  Modus: {0}"
MSG_ASC_INIT_MAX_STORIES="  Max. Stories: {0}"
MSG_ASC_INIT_MAX_RUNTIME="  Max. Laufzeit: {0}h"
MSG_ASC_INIT_PARALLEL="  Parallel: {0} (max. {1})"
MSG_ASC_INITIALIZED_ID="Sprint-Conductor initialisiert: {0}"
MSG_ASC_STARTING="Sprint-Conductor wird gestartet für: {0} (Modus: {1})"
MSG_ASC_PARALLEL_MODE="PARALLELER Modus (max. {0} gleichzeitig)"
MSG_ASC_SEQUENTIAL_MODE="SEQUENZIELLER Modus"
MSG_ASC_NO_PARALLEL_STORIES="Keine Stories für die parallele Verarbeitung verfügbar"
MSG_ASC_FOUND_STORIES="{0} Stories für die parallele Verarbeitung gefunden"
MSG_ASC_STOP_PARALLEL="Stoppbedingung erreicht, parallele Verarbeitung wird beendet"
MSG_ASC_WAVE="=== Welle {0} ==="
MSG_ASC_WAITING_ACTIVE="Warten auf das Ende von {0} aktiven Sitzungen..."
MSG_ASC_WAITING_ESCALATIONS="Warten auf {0} offene Eskalationen..."
MSG_ASC_WAITING_ALL="Warten auf das Ende aller parallelen Sitzungen..."
MSG_ASC_SPAWNED="Parallele Sitzung {0} für Story {1} gestartet"
MSG_ASC_SPAWN_FAILED="Sitzung für {0} konnte nicht gestartet werden"
MSG_ASC_PAR_COMPLETED="Story parallel abgeschlossen: {0}"
MSG_ASC_PAR_FAILED="Story parallel fehlgeschlagen: {0}"
MSG_ASC_NO_MORE_STORIES="Keine weiteren Stories verfügbar"
MSG_ASC_PROCESSING="Story wird bearbeitet: {0}"
MSG_ASC_CLAIMED="Story reserviert: {0}"
MSG_ASC_UNCLAIMED="Story freigegeben: {0}"
MSG_ASC_CLAIM_FAILED="Story konnte nicht reserviert werden: {0}"
MSG_ASC_CLAIM_FAILED_OTHER="Story konnte nicht reserviert werden: {0} (evtl. von einem anderen Prozess reserviert)"
MSG_ASC_SPAWNING_RALPH="Ralph wird für Story gestartet: {0}"
MSG_ASC_RALPH_NOT_FOUND="Ralph-Skript nicht gefunden: {0}"
MSG_ASC_COMPLETED="Story abgeschlossen: {0}"
MSG_ASC_FAILED="Story fehlgeschlagen: {0}"
MSG_ASC_ESCALATED="Story eskaliert: {0}"
MSG_ASC_SKIPPED="Story übersprungen: {0}"
MSG_ASC_SKIPPED_BY_USER="Story vom Benutzer übersprungen: {0}"
MSG_ASC_TRANSITIONED="{0} nach {1} verschoben"
MSG_ASC_MAX_STORIES="Max. Anzahl Stories erreicht: {0}"
MSG_ASC_MAX_FAILURES="Max. aufeinanderfolgende Fehlschläge erreicht: {0}"
MSG_ASC_MAX_RUNTIME="Max. Laufzeit erreicht: {0}h"
MSG_ASC_STOP_WINDOW="Stoppfenster erreicht: {0} (Fenster: {1})"
MSG_ASC_CRITICAL_ESCALATION="Kritische Eskalation offen - Pause"
MSG_ASC_SUPERVISED_TITLE="Überwachter Modus: Story bereit"
MSG_ASC_SUPERVISED_STORY="Story: {0}"
MSG_ASC_SUPERVISED_TITLE_LINE="Titel: {0}"
MSG_ASC_SUPERVISED_PROMPT="Diese Story starten? (y=ja / n=nein / s=alle überspringen): "
MSG_ASC_SUMMARY="Zusammenfassung des Sprint-Conductors"
MSG_ASC_SUMMARY_SESSION="Sitzung: {0}"
MSG_ASC_SUMMARY_DURATION="Dauer: {0}h {1}m"
MSG_ASC_SUMMARY_STORIES="Stories:"
MSG_ASC_SUMMARY_COMPLETED="  Abgeschlossen:   {0}"
MSG_ASC_SUMMARY_FAILED="  Fehlgeschlagen:  {0}"
MSG_ASC_SUMMARY_SKIPPED="  Übersprungen:    {0}"
MSG_ASC_SUMMARY_ESCALATIONS="Eskalationen:"
MSG_ASC_SUMMARY_RECOVERY="Wiederherstellungsversuche:"
MSG_ASC_DONE="Sprint-Conductor abgeschlossen"
