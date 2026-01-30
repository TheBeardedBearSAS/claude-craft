#!/bin/bash
# =============================================================================
# Recette - Deutsche Nachrichten
# Automatisiertes Akzeptanztest-System
# =============================================================================

# Header
MSG_RECETTE_HEADER="Recette - Automatisierte Akzeptanztests"
MSG_RECETTE_VERSION="Version"
MSG_RECETTE_GOLDEN_RULE="Goldene Regel: Ein behobener Fehler darf NIE wieder auftreten"

# Chrome MCP
MSG_CHROME_CHECKING="Chrome MCP wird geprueft..."
MSG_CHROME_OK="Chrome MCP: OK"
MSG_CHROME_NOT_FOUND="MCP 'claude-in-chrome' nicht erkannt"
MSG_CHROME_NOT_CONNECTED="Chrome Extension nicht verbunden"
MSG_CHROME_VERSION_OLD="Chrome Extension Version veraltet"
MSG_CHROME_PERMISSION_REQUIRED="Chrome Berechtigung erforderlich fuer"
MSG_CHROME_SOLUTIONS="Loesungen:"
MSG_CHROME_SOLUTION_1="Claude Code starten mit: claude --chrome"
MSG_CHROME_SOLUTION_2="Oder /chrome in dieser Sitzung ausfuehren"
MSG_CHROME_SOLUTION_3="Chrome Extension pruefen (v1.0.36+)"

# Session
MSG_SESSION_CREATED="Sitzung erstellt"
MSG_SESSION_RESUMED="Sitzung fortgesetzt"
MSG_SESSION_ID="Sitzungs-ID"
MSG_SESSION_NOT_FOUND="Sitzung nicht gefunden"
MSG_SESSION_STATUS="Status"
MSG_SESSION_PAUSED="pausiert"
MSG_SESSION_RUNNING="laeuft"
MSG_SESSION_COMPLETED="abgeschlossen"
MSG_SESSION_FAILED="fehlgeschlagen"

# Test Plan
MSG_PLAN_GENERATING="Testplan wird generiert..."
MSG_PLAN_GENERATED="Testplan generiert"
MSG_PLAN_LOADING="Testplan wird geladen..."
MSG_PLAN_LOADED="Testplan geladen"
MSG_PLAN_CATEGORIES="Testkategorien"
MSG_PLAN_TESTS_COUNT="Tests"
MSG_PLAN_VALIDATION_PASSED="Planvalidierung erfolgreich"
MSG_PLAN_VALIDATION_FAILED="Planvalidierung fehlgeschlagen"

# Test Execution
MSG_EXEC_STARTING="Testausfuehrung wird gestartet..."
MSG_EXEC_TEST="Test wird ausgefuehrt"
MSG_EXEC_STEP="Schritt"
MSG_EXEC_OF="von"
MSG_EXEC_ACTION="Aktion"
MSG_EXEC_PASSED="BESTANDEN"
MSG_EXEC_FAILED="FEHLGESCHLAGEN"
MSG_EXEC_SKIPPED="UEBERSPRUNGEN"
MSG_EXEC_ASSERTION="Assertion"
MSG_EXEC_SCREENSHOT="Screenshot wird erstellt..."
MSG_EXEC_COMPLETE="Ausfuehrung abgeschlossen"

# Progress
MSG_PROGRESS_TITLE="Fortschritt"
MSG_PROGRESS_TOTAL="Gesamt"
MSG_PROGRESS_PASSED="Bestanden"
MSG_PROGRESS_FAILED="Fehlgeschlagen"
MSG_PROGRESS_PENDING="Ausstehend"
MSG_PROGRESS_SKIPPED="Uebersprungen"
MSG_PROGRESS_RATE="Erfolgsrate"

# Errors
MSG_ERROR="Fehler"
MSG_ERROR_DETECTED="Fehler erkannt"
MSG_ERROR_TYPE="Fehlertyp"
MSG_ERROR_CLASSIFYING="Fehler wird klassifiziert..."
MSG_ERROR_CLASSIFICATION="Fehlerklassifizierung"
MSG_ERROR_GENERATING_TESTS="Regressionstests werden generiert..."
MSG_ERROR_TESTS_GENERATED="Regressionstests generiert"

# Error Types
MSG_ERROR_TYPE_VISUAL="visuell"
MSG_ERROR_TYPE_INTERACTION="Interaktion"
MSG_ERROR_TYPE_VALIDATION="Validierung"
MSG_ERROR_TYPE_LOGIC="Logik"
MSG_ERROR_TYPE_SECURITY="Sicherheit"
MSG_ERROR_TYPE_API="API"

# Regression
MSG_REGRESSION_TITLE="Regressions-Suite"
MSG_REGRESSION_REGISTRY="Regressionsregister"
MSG_REGRESSION_ADDING="Wird zum Regressionsregister hinzugefuegt..."
MSG_REGRESSION_ADDED="Zum Regressionsregister hinzugefuegt"
MSG_REGRESSION_DETECTING="Regressionen werden erkannt..."
MSG_REGRESSION_DETECTED="Regressionen erkannt"
MSG_REGRESSION_NONE="Keine Regressionen"
MSG_REGRESSION_NEW_FAILURES="Neue Fehler"
MSG_REGRESSION_FIXED="Behoben"
MSG_REGRESSION_ALERT="REGRESSIONSWARNUNG"

# Checkpoints
MSG_CHECKPOINT_CREATING="Checkpoint wird erstellt..."
MSG_CHECKPOINT_CREATED="Checkpoint erstellt"
MSG_CHECKPOINT_RESTORING="Wiederherstellung vom Checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint wiederhergestellt"

# Reports
MSG_REPORT_GENERATING="Bericht wird generiert..."
MSG_REPORT_GENERATED="Bericht generiert"
MSG_REPORT_FORMAT="Format"
MSG_REPORT_PATH="Berichtspfad"

# Summary
MSG_SUMMARY_TITLE="Recette Zusammenfassung"
MSG_SUMMARY_SESSION="Sitzung"
MSG_SUMMARY_SCOPE="Umfang"
MSG_SUMMARY_TARGET="Ziel"
MSG_SUMMARY_DURATION="Dauer"
MSG_SUMMARY_TESTS="Tests"
MSG_SUMMARY_ERRORS="Fehler"
MSG_SUMMARY_REGRESSIONS="Regressionen"

# Actions
MSG_ACTION_NAVIGATE="navigieren"
MSG_ACTION_CLICK="klicken"
MSG_ACTION_TYPE="eingeben"
MSG_ACTION_FILL_FORM="formular_ausfuellen"
MSG_ACTION_SCROLL="scrollen"
MSG_ACTION_WAIT="warten"
MSG_ACTION_SCREENSHOT="screenshot"
MSG_ACTION_HOVER="schweben"
MSG_ACTION_SELECT="auswaehlen"
MSG_ACTION_CHECK="ankreuzen"
MSG_ACTION_UPLOAD="hochladen"

# Assertions
MSG_ASSERT_URL_MATCHES="URL stimmt ueberein"
MSG_ASSERT_ELEMENT_VISIBLE="Element sichtbar"
MSG_ASSERT_ELEMENT_TEXT="Element-Text"
MSG_ASSERT_NO_CONSOLE_ERRORS="Keine Konsolenfehler"
MSG_ASSERT_RESPONSE_CODE="Antwortcode"

# Dry Run
MSG_DRY_RUN_MODE="Dry Run Modus"
MSG_DRY_RUN_PLAN_ONLY="Plan generiert (keine Ausfuehrung)"

# Resume
MSG_RESUME_FROM="Fortsetzung ab"
MSG_RESUME_TEST="Test"
MSG_RESUME_STEP="Schritt"

# Misc
MSG_LOADING="Laden..."
MSG_SAVING="Speichern..."
MSG_DONE="Fertig"
MSG_CANCELLED="Abgebrochen"
MSG_WARNING="Warnung"
MSG_INFO="Info"
MSG_SUCCESS="Erfolg"
MSG_YES="ja"
MSG_NO="nein"
