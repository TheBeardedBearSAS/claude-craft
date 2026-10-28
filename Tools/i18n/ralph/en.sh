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

# Context Management
MSG_CONTEXT_LIMIT_DETECTED="Context limit detected"
MSG_CONTEXT_COMPACTING="Running auto-compact"
MSG_CONTEXT_COMPACTED="Context compacted successfully"
MSG_CONTEXT_COMPACT_FAILED="Auto-compact failed"
MSG_CONTEXT_RETRYING="Retrying after compact"
MSG_CONTEXT_MAX_REACHED="Maximum compacts reached"
MSG_CONTEXT_DISABLED="Auto-compact is disabled"

# Advanced Context Management
MSG_CONTEXT_NEW_SESSION="Creating continuation session"
MSG_CONTEXT_EXTEND="Extended max compacts"
MSG_CONTEXT_OVERFLOW_FAIL="Context limit exceeded, stopping"
MSG_CONTEXT_PREVENTIVE="Context at {0}% - running preventive compact"
MSG_CONTEXT_BELOW_MIN="Context at {0}% - below minimum threshold ({1}%), skipping compact"
MSG_CONTEXT_CONTINUATION_CREATED="Continuation session created"
MSG_CONTEXT_MAX_CONTINUATIONS="Maximum continuation sessions reached"
MSG_CONTEXT_RECONSTRUCTING="Reconstructing context from progress file"

# Sprint Progress
MSG_SPRINT_PROGRESS_SAVED="Sprint progress saved"
MSG_SPRINT_PROGRESS_LOADED="Sprint progress loaded"
MSG_SPRINT_CURRENT_TASK="Current task"
MSG_SPRINT_COMPLETED_TASKS="Completed tasks"
MSG_SPRINT_PHASE="Phase"

# Strategic Compact
MSG_CONTEXT_SPRINT_START="Compact at sprint start for clean context"
MSG_CONTEXT_TASK_COMPLETE="Task complete - running strategic compact"
MSG_CONTEXT_US_COMPLETE="US complete - running strategic compact"

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

# =============================================================================
# v2.0 Messages
# =============================================================================

# Auto-detection
MSG_AUTO_DETECT="Auto-detecting project type..."
MSG_AUTO_DETECT_FOUND="Detected project type"
MSG_AUTO_DETECT_CONFIDENCE="Confidence"
MSG_AUTO_DETECT_NOT_FOUND="Could not detect project type"
MSG_HELP_AUTO_DETECT="Auto-detect project type and configure DoD"
MSG_HELP_INIT="Generate config without running (init only)"
MSG_HELP_INTERACTIVE="Interactive configuration wizard"

# Dashboard
MSG_DASHBOARD_ENABLED="Dashboard enabled"
MSG_DASHBOARD_DISABLED="Dashboard disabled"
MSG_DASHBOARD_MODE="Dashboard mode"

# Metrics
MSG_METRICS_ENABLED="Metrics collection enabled"
MSG_METRICS_EXPORTED="Metrics exported"
MSG_METRICS_FORMAT="Metrics format"

# Health Monitor
MSG_HEALTH_HEALTHY="Health: OK"
MSG_HEALTH_WARNING="Health Warning"
MSG_HEALTH_CRITICAL="Health Critical"
MSG_HEALTH_STALL="Stall detected"
MSG_HEALTH_ERROR_SPIRAL="Error spiral detected"
MSG_HEALTH_CONTEXT_BLOAT="Context bloat detected"

# Hooks
MSG_HOOKS_ENABLED="Hooks integration enabled"
MSG_HOOKS_DISABLED="Hooks integration disabled"
MSG_HOOKS_CONFIG_GENERATED="Hooks configuration generated"
MSG_HOOKS_DOD_BLOCKED="DoD not satisfied - stop blocked"

# Circuit Breaker Adaptive
MSG_CB_ADAPTIVE_ENABLED="Adaptive circuit breaker enabled"
MSG_CB_PROFILE_DETECTED="Profile detected"
MSG_CB_LEARNING_ENABLED="Learning from history enabled"
MSG_CB_LEARNING_ADJUSTED="Thresholds adjusted based on history"

# Configuration Generator
MSG_CONFIG_GENERATED="Configuration generated"
MSG_CONFIG_WIZARD_TITLE="Configuration Wizard"
MSG_CONFIG_DETECTING="Detecting project settings..."
MSG_CONFIG_CONFIRM="Is this correct?"

# Prompts sent to Claude ({0} = reconstructed context)
MSG_PROMPT_CONTINUATION="# Sprint Continuation

You are resuming work on this sprint after a context compaction.
The sprint-progress.md file holds the full state of the work done so far.

{0}

## Instructions

1. **Read** the progress above to understand the current state
2. **Check** the modified files if needed
3. **Resume** the current task where it stopped
4. **Continue** the TDD workflow (RED -> GREEN -> REFACTOR)
5. **Update** sprint-progress.md after each completed task

## Important Commands

- After each task: update sprint-progress.md
- If blocked: note it in the Blockers section
- If an important decision is made: add it to Key Decisions

Continue the implementation."

# {0} = previous session id, {1} = reconstructed context
MSG_PROMPT_HANDOFF="# New Continuation Session

This session continues the work of the previous session ({0}).
The context was reset but the sprint-progress.md file holds all the progress.

{1}

## Transition Context

- Previous session: {0}
- Reason: context limit reached (max compacts)
- The work was saved in sprint-progress.md
- Files are in the state of the last git checkpoint

## Instructions

1. **Check** the current state with git status
2. **Read** sprint-progress.md for the full context
3. **Identify** the current task and its state
4. **Continue** exactly where the previous session stopped

Resume the work."

# Reconstructed context sections sent to Claude ({0} = phase)
MSG_SECTION_PROGRESS="## Sprint Progress"
MSG_SECTION_CURRENT_STATE="### Current State"
MSG_SECTION_UNKNOWN="Unknown"
MSG_SECTION_COMPLETED_TASKS="### Completed Tasks"
MSG_SECTION_NONE_YET="None yet"
MSG_SECTION_KEY_DECISIONS="### Key Decisions"
MSG_SECTION_NONE_RECORDED="None recorded"
MSG_SECTION_NO_PROGRESS_FILE="No sprint progress file found."
MSG_SECTION_GIT="## Recent Changes"
MSG_SECTION_NOT_GIT="Not in a git repository."
MSG_SECTION_MODIFIED_FILES="### Modified Files (recent commits)"
MSG_SECTION_NO_RECENT_CHANGES="No recent changes"
MSG_SECTION_NO_COMMITS="No commits yet"
MSG_SECTION_RECENT_COMMITS="### Recent Commits"
MSG_SECTION_UNCOMMITTED="### Uncommitted Changes"
MSG_SECTION_NO_UNCOMMITTED="No uncommitted changes."
MSG_SECTION_TESTS="## Test Status"
MSG_SECTION_UNIT_TESTS="Unit Tests"
MSG_SECTION_INTEGRATION_TESTS="Integration Tests"
MSG_SECTION_TASK="## Current Task"
MSG_SECTION_TASK_LABEL="Task"
MSG_SECTION_CONTINUE_PHASE="Continue from where you left off in the {0} phase."
MSG_SECTION_NO_TASK="No current task in progress."
MSG_SECTION_NO_TASK_INFO="No current task information available."

# Sprint Conductor (ASC leader)
MSG_ASC_HEADER="Autonomous Sprint Conductor (ASC)"
MSG_ASC_NO_PARALLEL_MANAGER="Parallel manager not available, falling back to sequential"
MSG_ASC_INITIALIZED="Initialized Sprint Conductor"
MSG_ASC_INIT_SESSION="  Session: {0}"
MSG_ASC_INIT_MODE="  Mode: {0}"
MSG_ASC_INIT_MAX_STORIES="  Max stories: {0}"
MSG_ASC_INIT_MAX_RUNTIME="  Max runtime: {0}h"
MSG_ASC_INIT_PARALLEL="  Parallel: {0} (max {1})"
MSG_ASC_INITIALIZED_ID="Sprint Conductor initialized: {0}"
MSG_ASC_STARTING="Starting sprint conductor for: {0} (mode: {1})"
MSG_ASC_PARALLEL_MODE="Running in PARALLEL mode (max {0} concurrent)"
MSG_ASC_SEQUENTIAL_MODE="Running in SEQUENTIAL mode"
MSG_ASC_NO_PARALLEL_STORIES="No stories available for parallel processing"
MSG_ASC_FOUND_STORIES="Found {0} stories for parallel processing"
MSG_ASC_STOP_PARALLEL="Stop condition met, halting parallel processing"
MSG_ASC_WAVE="=== Wave {0} ==="
MSG_ASC_WAITING_ACTIVE="Waiting for {0} active sessions to complete..."
MSG_ASC_WAITING_ESCALATIONS="Waiting for {0} pending escalations..."
MSG_ASC_WAITING_ALL="Waiting for all parallel sessions to complete..."
MSG_ASC_SPAWNED="Spawned parallel session {0} for story {1}"
MSG_ASC_SPAWN_FAILED="Failed to spawn session for {0}"
MSG_ASC_PAR_COMPLETED="Story completed in parallel: {0}"
MSG_ASC_PAR_FAILED="Story failed in parallel: {0}"
MSG_ASC_NO_MORE_STORIES="No more stories available"
MSG_ASC_PROCESSING="Processing story: {0}"
MSG_ASC_CLAIMED="Claimed story: {0}"
MSG_ASC_UNCLAIMED="Unclaimed story: {0}"
MSG_ASC_CLAIM_FAILED="Failed to claim story: {0}"
MSG_ASC_CLAIM_FAILED_OTHER="Failed to claim story: {0} (may be claimed by another process)"
MSG_ASC_SPAWNING_RALPH="Spawning Ralph for story: {0}"
MSG_ASC_RALPH_NOT_FOUND="Ralph script not found: {0}"
MSG_ASC_COMPLETED="Story completed: {0}"
MSG_ASC_FAILED="Story failed: {0}"
MSG_ASC_ESCALATED="Story escalated: {0}"
MSG_ASC_SKIPPED="Story skipped: {0}"
MSG_ASC_SKIPPED_BY_USER="Story skipped by user: {0}"
MSG_ASC_TRANSITIONED="Transitioned {0} to {1}"
MSG_ASC_MAX_STORIES="Max stories reached: {0}"
MSG_ASC_MAX_FAILURES="Max consecutive failures reached: {0}"
MSG_ASC_MAX_RUNTIME="Max runtime reached: {0}h"
MSG_ASC_STOP_WINDOW="Stop window reached: {0} (window: {1})"
MSG_ASC_CRITICAL_ESCALATION="Critical escalation pending - pausing"
MSG_ASC_SUPERVISED_TITLE="Supervised Mode: Story Ready"
MSG_ASC_SUPERVISED_STORY="Story: {0}"
MSG_ASC_SUPERVISED_TITLE_LINE="Title: {0}"
MSG_ASC_SUPERVISED_PROMPT="Start this story? (y/n/s for skip all): "
MSG_ASC_SUMMARY="Sprint Conductor Summary"
MSG_ASC_SUMMARY_SESSION="Session: {0}"
MSG_ASC_SUMMARY_DURATION="Duration: {0}h {1}m"
MSG_ASC_SUMMARY_STORIES="Stories:"
MSG_ASC_SUMMARY_COMPLETED="  Completed: {0}"
MSG_ASC_SUMMARY_FAILED="  Failed:    {0}"
MSG_ASC_SUMMARY_SKIPPED="  Skipped:   {0}"
MSG_ASC_SUMMARY_ESCALATIONS="Escalations:"
MSG_ASC_SUMMARY_RECOVERY="Recovery attempts:"
MSG_ASC_DONE="Sprint Conductor completed"
