#!/bin/bash
# =============================================================================
# Ralph Wiggum - English Messages
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Continuous AI Agent Loop"
MSG_VERSION="Version"

# Status
MSG_ITERATION="Iteration"
MSG_OF="of"
MSG_SESSION="Session"
MSG_STATUS="Status"
MSG_RUNNING="Running"
MSG_COMPLETE="Complete"
MSG_FAILED="Failed"
MSG_TIMEOUT="Timeout"
MSG_CIRCUIT_BREAKER="Circuit Breaker"

# Session
MSG_SESSION_CREATED="Session created"
MSG_SESSION_RESUMED="Session resumed"
MSG_SESSION_ID="Session ID"
MSG_SESSION_NOT_FOUND="Session not found"
MSG_SESSION_DIR="Session directory"

# Loop
MSG_STARTING_LOOP="Starting Ralph loop"
MSG_PROMPT="Prompt"
MSG_INVOKING_CLAUDE="Invoking Claude..."
MSG_WAITING="Waiting"
MSG_SECONDS="seconds"
MSG_LOOP_COMPLETE="Loop completed"
MSG_LOOP_STOPPED="Loop stopped"

# Definition of Done
MSG_DOD_TITLE="Definition of Done"
MSG_DOD_CHECKING="Checking DoD criteria..."
MSG_DOD_PASSED="DoD PASSED"
MSG_DOD_FAILED="DoD NOT YET COMPLETE"
MSG_DOD_ITEM_PASSED="PASS"
MSG_DOD_ITEM_FAILED="FAIL"
MSG_DOD_ITEM_SKIPPED="SKIP"
MSG_DOD_REQUIRED="Required"
MSG_DOD_OPTIONAL="Optional"
MSG_DOD_ALL_REQUIRED_PASSED="All required criteria passed!"
MSG_DOD_MISSING_REQUIRED="Missing required criteria:"
MSG_DOD_HUMAN_GATE="Human validation gate"
MSG_DOD_HUMAN_PROMPT="Does this look correct? (y/n):"

# Validators
MSG_VALIDATOR_COMMAND="Running command"
MSG_VALIDATOR_OUTPUT="Checking output pattern"
MSG_VALIDATOR_FILE="Checking file changes"
MSG_VALIDATOR_HOOK="Running hook"
MSG_VALIDATOR_HUMAN="Awaiting human validation"

# Circuit Breaker
MSG_CB_TRIGGERED="Circuit breaker triggered"
MSG_CB_NO_CHANGES="No file changes for"
MSG_CB_ITERATIONS="iterations"
MSG_CB_REPEATED_ERRORS="Repeated errors detected"
MSG_CB_OUTPUT_DECLINE="Output declined by"
MSG_CB_PERCENT="percent"
MSG_CB_MAX_REACHED="Maximum iterations reached"
MSG_CB_RESET="Circuit breaker reset"

# Checkpointing
MSG_CHECKPOINT_CREATING="Creating checkpoint..."
MSG_CHECKPOINT_CREATED="Checkpoint created"
MSG_CHECKPOINT_RESTORING="Restoring from checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint restored"
MSG_CHECKPOINT_BRANCH="Checkpoint branch"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Checkpoint failed"

# Configuration
MSG_CONFIG_LOADING="Loading configuration..."
MSG_CONFIG_LOADED="Configuration loaded"
MSG_CONFIG_NOT_FOUND="Configuration file not found"
MSG_CONFIG_USING_DEFAULTS="Using default configuration"
MSG_CONFIG_INVALID="Invalid configuration"
MSG_CONFIG_CREATED="Configuration created"

# Output
MSG_OUTPUT_LOG="Log file"
MSG_OUTPUT_METRICS="Metrics file"
MSG_OUTPUT_WRITING="Writing output..."
MSG_OUTPUT_SAVED="Output saved"

# Errors
MSG_ERROR="Error"
MSG_ERROR_CLAUDE_NOT_FOUND="Claude command not found"
MSG_ERROR_NO_PROMPT="No prompt provided"
MSG_ERROR_INVALID_SESSION="Invalid session"
MSG_ERROR_TIMEOUT="Operation timed out"
MSG_ERROR_VALIDATION="Validation error"
MSG_ERROR_GIT_NOT_FOUND="Git not found (required for checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq not found (required for JSON parsing)"
MSG_ERROR_YQ_NOT_FOUND="yq not found (required for YAML parsing)"

# Summary
MSG_SUMMARY_TITLE="Session Summary"
MSG_SUMMARY_ITERATIONS="Total iterations"
MSG_SUMMARY_DURATION="Duration"
MSG_SUMMARY_DOD_STATUS="DoD status"
MSG_SUMMARY_FILES_CHANGED="Files changed"
MSG_SUMMARY_EXIT_REASON="Exit reason"

# Help
MSG_HELP_USAGE="Usage"
MSG_HELP_DESCRIPTION="Run Claude in a continuous loop until task completion"
MSG_HELP_OPTIONS="Options"
MSG_HELP_PROMPT="The task prompt for Claude"
MSG_HELP_CONFIG="Path to ralph.yml configuration"
MSG_HELP_CONTINUE="Resume an existing session"
MSG_HELP_MAX_ITER="Maximum iterations (default: 25)"
MSG_HELP_VERBOSE="Enable verbose output"
MSG_HELP_DRY_RUN="Show what would be done without executing"
MSG_HELP_LANG="Language (en, fr, es, de, pt)"
MSG_HELP_HELP="Show this help message"
MSG_HELP_EXAMPLES="Examples"
MSG_HELP_EXAMPLE_BASIC="Basic usage with prompt"
MSG_HELP_EXAMPLE_CONFIG="With configuration file"
MSG_HELP_EXAMPLE_RESUME="Resume previous session"

# Menu (if interactive)
MSG_MENU_TITLE="What would you like to do?"
MSG_MENU_START="Start new Ralph session"
MSG_MENU_RESUME="Resume existing session"
MSG_MENU_LIST="List sessions"
MSG_MENU_CONFIG="Create configuration"
MSG_MENU_HELP="Help"
MSG_MENU_QUIT="Quit"

# Misc
MSG_PRESS_ENTER="Press Enter to continue..."
MSG_YES="yes"
MSG_NO="no"
MSG_CANCEL="Cancelled"
MSG_GOODBYE="Goodbye!"
MSG_INVALID_CHOICE="Invalid choice"
MSG_CONFIRM="Confirm"
MSG_WARNING="Warning"
MSG_INFO="Info"
MSG_SUCCESS="Success"
