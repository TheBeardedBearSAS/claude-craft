#!/bin/bash
# =============================================================================
# Ralph Wiggum - Sprint Progress Module
# Persistent progress tracking across context windows and sessions
# =============================================================================
# Based on Anthropic's "Effective Harnesses for Long-Running Agents"
# https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
# =============================================================================

# Configuration
SPRINT_PROGRESS_FILE="${SPRINT_PROGRESS_FILE:-.ralph/sprint-progress.md}"
SPRINT_PROGRESS_ENABLED="${SPRINT_PROGRESS_ENABLED:-true}"
SPRINT_AUTO_UPDATE="${SPRINT_AUTO_UPDATE:-true}"
SPRINT_MAX_BACKUPS="${SPRINT_MAX_BACKUPS:-3}"

# Strategic compact configuration
SPRINT_COMPACT_ON_START="${SPRINT_COMPACT_ON_START:-true}"
SPRINT_COMPACT_ON_TASK_COMPLETE="${SPRINT_COMPACT_ON_TASK_COMPLETE:-true}"
SPRINT_COMPACT_ON_US_COMPLETE="${SPRINT_COMPACT_ON_US_COMPLETE:-false}"  # Optional, checkpoint is usually enough

# Track previous phase for transition detection
SPRINT_PREVIOUS_PHASE=""

# =============================================================================
# File Locking (local implementation if utils.sh not loaded)
# =============================================================================

_acquire_progress_lock() {
    local timeout="${1:-30}"
    local lockfile="${SPRINT_PROGRESS_FILE}.lock"

    # Use utils function if available
    if type acquire_file_lock &>/dev/null; then
        acquire_file_lock "$SPRINT_PROGRESS_FILE" "$timeout"
        return $?
    fi

    # Local implementation
    local count=0
    while [[ $count -lt $timeout ]]; do
        if mkdir "$lockfile" 2>/dev/null; then
            return 0
        fi
        sleep 0.1
        count=$((count + 1))
    done
    return 1
}

_release_progress_lock() {
    local lockfile="${SPRINT_PROGRESS_FILE}.lock"

    # Use utils function if available
    if type release_file_lock &>/dev/null; then
        release_file_lock "$SPRINT_PROGRESS_FILE"
        return
    fi

    rmdir "$lockfile" 2>/dev/null || true
}

# =============================================================================
# Atomic File Operations
# =============================================================================

# Escape string for sed replacement
_escape_sed() {
    printf '%s\n' "$1" | sed -e 's/[\/&]/\\&/g' -e 's/[]\/$*.^[]/\\&/g'
}

# Atomic sed operation with temp file pattern
_atomic_sed() {
    local file="$1"
    shift
    local patterns=("$@")

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    # Acquire lock
    if ! _acquire_progress_lock; then
        print_error "Could not acquire lock for progress file" 2>/dev/null || true
        return 1
    fi

    local temp_file="${file}.tmp.$$"
    local result=0

    # Copy to temp file
    if cp "$file" "$temp_file" 2>/dev/null; then
        # Apply all sed patterns to temp file
        for pattern in "${patterns[@]}"; do
            if ! sed -i "$pattern" "$temp_file" 2>/dev/null; then
                result=1
                break
            fi
        done

        # Atomic commit if all operations succeeded
        if [[ $result -eq 0 ]]; then
            mv "$temp_file" "$file"
        else
            rm -f "$temp_file"
        fi
    else
        result=1
    fi

    # Release lock
    _release_progress_lock

    return $result
}

# =============================================================================
# Validation
# =============================================================================

validate_progress_file() {
    local file="${1:-$SPRINT_PROGRESS_FILE}"

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    # Check for required sections
    grep -q "^## Metadata$" "$file" || return 1
    grep -q "^## Current State$" "$file" || return 1
    grep -q "^## Completed Tasks$" "$file" || return 1

    return 0
}

# =============================================================================
# Initialization
# =============================================================================

init_sprint_progress() {
    if [[ "$SPRINT_PROGRESS_ENABLED" != "true" ]]; then
        print_verbose "Sprint progress tracking disabled"
        return 0
    fi

    # Create .ralph directory if needed
    local progress_dir=$(dirname "$SPRINT_PROGRESS_FILE")
    if [[ ! -d "$progress_dir" ]]; then
        mkdir -p "$progress_dir"
    fi

    # Check if progress file exists
    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        print_info "${MSG_SPRINT_PROGRESS_LOADED:-Sprint progress loaded}"
        return 0
    fi

    # Create new progress file from template or defaults
    create_sprint_progress_file
}

create_sprint_progress_file() {
    # Idempotent: check if file already exists and is valid
    if [[ -f "$SPRINT_PROGRESS_FILE" ]] && validate_progress_file "$SPRINT_PROGRESS_FILE"; then
        print_verbose "Sprint progress file already exists and is valid"
        return 0
    fi

    local session_id="${SESSION_ID:-unknown}"
    local timestamp
    timestamp=$(date -Iseconds)

    # Create .ralph directory if needed
    local progress_dir
    progress_dir=$(dirname "$SPRINT_PROGRESS_FILE")
    mkdir -p "$progress_dir" 2>/dev/null || true

    cat > "$SPRINT_PROGRESS_FILE" << EOF
# Sprint Progress

## Metadata
- Session ID: $session_id
- Started: $timestamp
- Last Update: $timestamp
- Compacts: 0
- Context Resets: 0

## Current State
- **Sprint**: unknown
- **Current US**: none
- **Current Task**: none
- **Phase**: INIT

## Completed Tasks
<!-- Tasks will be added here as they complete -->

## Key Decisions
<!-- Important architectural/technical decisions -->

## Files Modified This Session
<!-- Files changed during this sprint -->

## Current Test Status
- Unit: unknown
- Integration: unknown

## Blockers
- None

## Next Steps
1. Initialize sprint
2. Load tasks
3. Begin implementation
EOF

    print_verbose "Created sprint progress file: $SPRINT_PROGRESS_FILE"
}

# =============================================================================
# Read Operations
# =============================================================================

read_sprint_progress() {
    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        echo ""
        return 1
    fi

    cat "$SPRINT_PROGRESS_FILE"
}

get_progress_metadata() {
    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        echo "{}"
        return 1
    fi

    local session_id=$(grep -oP 'Session ID: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
    local started=$(grep -oP 'Started: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
    local last_update=$(grep -oP 'Last Update: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
    local compacts=$(grep -oP 'Compacts: \K\d+' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "0")
    local resets=$(grep -oP 'Context Resets: \K\d+' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "0")

    cat << EOF
{
    "session_id": "$session_id",
    "started": "$started",
    "last_update": "$last_update",
    "compacts": $compacts,
    "context_resets": $resets
}
EOF
}

get_current_state() {
    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        echo "{}"
        return 1
    fi

    local sprint=$(grep -oP '\*\*Sprint\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
    local current_us=$(grep -oP '\*\*Current US\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "none")
    local current_task=$(grep -oP '\*\*Current Task\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "none")
    local phase=$(grep -oP '\*\*Phase\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "INIT")

    cat << EOF
{
    "sprint": "$sprint",
    "current_us": "$current_us",
    "current_task": "$current_task",
    "phase": "$phase"
}
EOF
}

get_completed_tasks_count() {
    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        echo "0"
        return
    fi

    grep -c '^\- \[x\]' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "0"
}

# =============================================================================
# Write Operations
# =============================================================================

update_sprint_progress() {
    local section="$1"
    local content="$2"

    if [[ "$SPRINT_PROGRESS_ENABLED" != "true" ]]; then
        return 0
    fi

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        create_sprint_progress_file
    fi

    # Update last update timestamp atomically
    local timestamp=$(date -Iseconds)
    _atomic_sed "$SPRINT_PROGRESS_FILE" "s/Last Update: .*/Last Update: $timestamp/"

    case "$section" in
        "metadata")
            update_metadata_section "$content"
            ;;
        "state")
            update_state_section "$content"
            ;;
        "task_complete")
            add_completed_task "$content"
            ;;
        "decision")
            add_key_decision "$content"
            ;;
        "file_modified")
            add_modified_file "$content"
            ;;
        "test_status")
            update_test_status "$content"
            ;;
        "blocker")
            update_blockers "$content"
            ;;
        "next_steps")
            update_next_steps "$content"
            ;;
        "compact")
            increment_compact_count
            ;;
        "context_reset")
            increment_context_reset_count
            ;;
        *)
            print_verbose "Unknown progress section: $section"
            ;;
    esac
}

update_state_section() {
    local state_json="$1"

    # Parse JSON and update each field
    local sprint=$(echo "$state_json" | grep -oP '"sprint":\s*"\K[^"]*' 2>/dev/null)
    local current_us=$(echo "$state_json" | grep -oP '"current_us":\s*"\K[^"]*' 2>/dev/null)
    local current_task=$(echo "$state_json" | grep -oP '"current_task":\s*"\K[^"]*' 2>/dev/null)
    local phase=$(echo "$state_json" | grep -oP '"phase":\s*"\K[^"]*' 2>/dev/null)

    # Build list of sed patterns (escape special chars)
    local patterns=()

    if [[ -n "$sprint" ]]; then
        local escaped=$(_escape_sed "$sprint")
        patterns+=("s/\*\*Sprint\*\*: .*/\*\*Sprint\*\*: $escaped/")
    fi

    if [[ -n "$current_us" ]]; then
        local escaped=$(_escape_sed "$current_us")
        patterns+=("s/\*\*Current US\*\*: .*/\*\*Current US\*\*: $escaped/")
    fi

    if [[ -n "$current_task" ]]; then
        local escaped=$(_escape_sed "$current_task")
        patterns+=("s/\*\*Current Task\*\*: .*/\*\*Current Task\*\*: $escaped/")
    fi

    if [[ -n "$phase" ]]; then
        local escaped=$(_escape_sed "$phase")
        patterns+=("s/\*\*Phase\*\*: .*/\*\*Phase\*\*: $escaped/")
    fi

    # Apply all changes atomically
    if [[ ${#patterns[@]} -gt 0 ]]; then
        _atomic_sed "$SPRINT_PROGRESS_FILE" "${patterns[@]}"
    fi
}

add_completed_task() {
    local task_info="$1"

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Escape for sed
    local escaped_task
    escaped_task=$(_escape_sed "$task_info")

    # Add task to completed tasks section atomically
    # Format: - [x] TASK-XXX [TYPE] Description (Xh)
    _atomic_sed "$SPRINT_PROGRESS_FILE" "/^## Completed Tasks$/a\\- [x] $escaped_task"
}

add_key_decision() {
    local decision="$1"

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Escape for sed
    local escaped_decision
    escaped_decision=$(_escape_sed "$decision")

    # Add decision to key decisions section atomically
    _atomic_sed "$SPRINT_PROGRESS_FILE" "/^## Key Decisions$/a\\- $escaped_decision"
}

add_modified_file() {
    local file_path="$1"

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Check if file already listed
    if grep -q "^- $file_path$" "$SPRINT_PROGRESS_FILE" 2>/dev/null; then
        return 0
    fi

    # Escape for sed
    local escaped_path
    escaped_path=$(_escape_sed "$file_path")

    # Add file to modified files section atomically
    _atomic_sed "$SPRINT_PROGRESS_FILE" "/^## Files Modified This Session$/a\\- $escaped_path"
}

update_test_status() {
    local test_info="$1"

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Parse test status (format: "unit:45/47,integration:12/12")
    local unit_status
    local integration_status
    unit_status=$(echo "$test_info" | grep -oP 'unit:\K[^,]*' 2>/dev/null || echo "unknown")
    integration_status=$(echo "$test_info" | grep -oP 'integration:\K[^,]*' 2>/dev/null || echo "unknown")

    # Update both in a single atomic operation
    _atomic_sed "$SPRINT_PROGRESS_FILE" \
        "s/- Unit: .*/- Unit: $unit_status/" \
        "s/- Integration: .*/- Integration: $integration_status/"
}

update_blockers() {
    local blockers="$1"

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Replace blockers section content
    if [[ -z "$blockers" || "$blockers" == "none" ]]; then
        blockers="None"
    fi

    # Escape for sed
    local escaped_blockers
    escaped_blockers=$(_escape_sed "$blockers")

    # Update atomically
    _atomic_sed "$SPRINT_PROGRESS_FILE" "s/^- None$/- $escaped_blockers/"
}

update_next_steps() {
    local steps="$1"

    # Clear and rewrite next steps section
    # This is complex - for now just log
    print_verbose "Next steps update requested: $steps"
}

increment_compact_count() {
    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Acquire lock for atomic read-modify-write
    if ! _acquire_progress_lock; then
        print_warning "Could not acquire lock for compact count increment" 2>/dev/null || true
        return 1
    fi

    local temp_file="${SPRINT_PROGRESS_FILE}.tmp.$$"
    local result=0

    if cp "$SPRINT_PROGRESS_FILE" "$temp_file" 2>/dev/null; then
        local current=$(grep -oP 'Compacts: \K\d+' "$temp_file" 2>/dev/null || echo "0")
        local new_count=$((current + 1))

        if sed -i "s/Compacts: [0-9]*/Compacts: $new_count/" "$temp_file" 2>/dev/null; then
            mv "$temp_file" "$SPRINT_PROGRESS_FILE"
            print_verbose "Compact count incremented to $new_count"
        else
            rm -f "$temp_file"
            result=1
        fi
    else
        result=1
    fi

    _release_progress_lock
    return $result
}

increment_context_reset_count() {
    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Acquire lock for atomic read-modify-write
    if ! _acquire_progress_lock; then
        print_warning "Could not acquire lock for context reset count increment" 2>/dev/null || true
        return 1
    fi

    local temp_file="${SPRINT_PROGRESS_FILE}.tmp.$$"
    local result=0

    if cp "$SPRINT_PROGRESS_FILE" "$temp_file" 2>/dev/null; then
        local current=$(grep -oP 'Context Resets: \K\d+' "$temp_file" 2>/dev/null || echo "0")
        local new_count=$((current + 1))

        if sed -i "s/Context Resets: [0-9]*/Context Resets: $new_count/" "$temp_file" 2>/dev/null; then
            mv "$temp_file" "$SPRINT_PROGRESS_FILE"
            print_verbose "Context reset count incremented to $new_count"
        else
            rm -f "$temp_file"
            result=1
        fi
    else
        result=1
    fi

    _release_progress_lock
    return $result
}

# =============================================================================
# Session Linking
# =============================================================================

link_session_to_progress() {
    local session_id="$1"

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Update session ID in progress file
    sed -i "s/Session ID: .*/Session ID: $session_id/" "$SPRINT_PROGRESS_FILE"
}

save_sprint_progress() {
    local session_id="$1"

    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        return 1
    fi

    # Acquire lock for atomic update
    if ! _acquire_progress_lock; then
        print_error "Could not acquire lock for saving sprint progress" 2>/dev/null || true
        return 1
    fi

    local result=0
    local temp_file="${SPRINT_PROGRESS_FILE}.tmp.$$"

    if cp "$SPRINT_PROGRESS_FILE" "$temp_file" 2>/dev/null; then
        # Update timestamp in temp file
        local timestamp=$(date -Iseconds)
        if sed -i "s/Last Update: .*/Last Update: $timestamp/" "$temp_file" 2>/dev/null; then
            # Create timestamped backup before replacing
            local backup_file="${SPRINT_PROGRESS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
            if cp "$SPRINT_PROGRESS_FILE" "$backup_file" 2>/dev/null; then
                # Atomic commit
                mv "$temp_file" "$SPRINT_PROGRESS_FILE"

                # Cleanup old backups (keep only SPRINT_MAX_BACKUPS)
                ls -t "${SPRINT_PROGRESS_FILE}".backup.* 2>/dev/null | tail -n +"$((SPRINT_MAX_BACKUPS + 1))" | xargs -r rm -f 2>/dev/null || true

                print_success "${MSG_SPRINT_PROGRESS_SAVED:-Sprint progress saved}"
                if type log_session &>/dev/null && [[ -n "$session_id" ]]; then
                    log_session "$session_id" "INFO" "Sprint progress saved to $SPRINT_PROGRESS_FILE"
                fi
            else
                print_warning "Failed to create backup, proceeding anyway"
                mv "$temp_file" "$SPRINT_PROGRESS_FILE"
            fi
        else
            rm -f "$temp_file"
            result=1
        fi
    else
        result=1
    fi

    _release_progress_lock
    return $result
}

# =============================================================================
# Progress Summary for Context Reconstruction
# =============================================================================

get_progress_summary() {
    if [[ ! -f "$SPRINT_PROGRESS_FILE" ]]; then
        echo "No sprint progress file found."
        return 1
    fi

    local completed_count=$(get_completed_tasks_count)
    local state=$(get_current_state)
    local sprint=$(echo "$state" | grep -oP '"sprint":\s*"\K[^"]*' 2>/dev/null || echo "unknown")
    local current_task=$(echo "$state" | grep -oP '"current_task":\s*"\K[^"]*' 2>/dev/null || echo "none")
    local phase=$(echo "$state" | grep -oP '"phase":\s*"\K[^"]*' 2>/dev/null || echo "unknown")

    cat << EOF
Sprint: $sprint
Completed Tasks: $completed_count
Current Task: $current_task
Phase: $phase
EOF
}

# =============================================================================
# Cleanup
# =============================================================================

cleanup_sprint_progress() {
    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        # Keep as archive with timestamp
        local timestamp=$(date +%Y%m%d_%H%M%S)
        mv "$SPRINT_PROGRESS_FILE" "${SPRINT_PROGRESS_FILE%.md}_${timestamp}.md"
        print_verbose "Archived sprint progress file"
    fi
}

# =============================================================================
# Strategic Compact - Sprint Lifecycle
# =============================================================================

compact_on_sprint_start() {
    local session_id="$1"

    if [[ "$SPRINT_COMPACT_ON_START" != "true" ]]; then
        print_verbose "Sprint start compact disabled"
        return 0
    fi

    print_info "${MSG_CONTEXT_SPRINT_START:-Compact at sprint start for clean context}..."

    # Save initial state
    save_sprint_progress "$session_id"

    # Run compact if available
    if type run_auto_compact &>/dev/null; then
        run_auto_compact "$session_id"
        local status=$?
        if [[ $status -eq 0 ]]; then
            print_success "Sprint started with clean context"
            log_session "$session_id" "INFO" "Sprint start compact completed"
        fi
        return $status
    fi

    return 0
}

compact_on_task_complete() {
    local session_id="$1"
    local task_info="$2"

    if [[ "$SPRINT_COMPACT_ON_TASK_COMPLETE" != "true" ]]; then
        print_verbose "Task complete compact disabled"
        return 0
    fi

    print_info "${MSG_CONTEXT_TASK_COMPLETE:-Task complete - running strategic compact}..."

    # Save progress with completed task
    if [[ -n "$task_info" ]]; then
        update_sprint_progress "task_complete" "$task_info"
    fi
    save_sprint_progress "$session_id"

    # Run compact
    if type run_auto_compact &>/dev/null; then
        run_auto_compact "$session_id"
        local status=$?
        if [[ $status -eq 0 ]]; then
            print_success "Context compacted after task completion"
            log_session "$session_id" "INFO" "Task complete compact: $task_info"
        fi
        return $status
    fi

    return 0
}

compact_on_us_complete() {
    local session_id="$1"
    local us_id="$2"

    if [[ "$SPRINT_COMPACT_ON_US_COMPLETE" != "true" ]]; then
        # Even if compact is disabled, we should save and checkpoint
        save_sprint_progress "$session_id"
        if type create_checkpoint &>/dev/null; then
            create_checkpoint "$session_id" "us-complete-$us_id"
        fi
        print_verbose "US complete compact disabled (checkpoint only)"
        return 0
    fi

    print_info "${MSG_CONTEXT_US_COMPLETE:-US complete - running strategic compact}..."

    # Save and checkpoint
    save_sprint_progress "$session_id"
    if type create_checkpoint &>/dev/null; then
        create_checkpoint "$session_id" "us-complete-$us_id"
    fi

    # Run compact
    if type run_auto_compact &>/dev/null; then
        run_auto_compact "$session_id"
        local status=$?
        if [[ $status -eq 0 ]]; then
            print_success "Context compacted after US completion"
            log_session "$session_id" "INFO" "US complete compact: $us_id"
        fi
        return $status
    fi

    return 0
}

# =============================================================================
# Phase Transition Detection
# =============================================================================

detect_phase_transition() {
    local new_phase="$1"

    if [[ -z "$SPRINT_PREVIOUS_PHASE" ]]; then
        SPRINT_PREVIOUS_PHASE="$new_phase"
        return 1  # No transition, first phase
    fi

    if [[ "$SPRINT_PREVIOUS_PHASE" == "$new_phase" ]]; then
        return 1  # No transition
    fi

    local old_phase="$SPRINT_PREVIOUS_PHASE"
    SPRINT_PREVIOUS_PHASE="$new_phase"

    # Detect specific transitions
    case "${old_phase}_${new_phase}" in
        "REFACTOR_IDLE"|"REFACTOR_RED"|"GREEN_IDLE")
            # Task complete - REFACTOR→IDLE or REFACTOR→RED (next task) or GREEN→IDLE
            echo "task_complete"
            return 0
            ;;
        "IDLE_RED")
            # Task start
            echo "task_start"
            return 0
            ;;
        "RED_GREEN")
            # Tests passing
            echo "tests_passing"
            return 0
            ;;
        "GREEN_REFACTOR")
            # Refactoring
            echo "refactoring"
            return 0
            ;;
        *)
            echo "other"
            return 0
            ;;
    esac
}

check_and_compact_on_phase_change() {
    local session_id="$1"
    local new_phase="$2"
    local task_info="$3"

    # Detect transition
    local transition
    transition=$(detect_phase_transition "$new_phase")
    local has_transition=$?

    if [[ $has_transition -ne 0 ]]; then
        return 0  # No transition
    fi

    # Handle transition
    case "$transition" in
        "task_complete")
            compact_on_task_complete "$session_id" "$task_info"
            return $?
            ;;
        *)
            # Other transitions don't trigger compact
            print_verbose "Phase transition: $transition (no compact)"
            return 0
            ;;
    esac
}

# =============================================================================
# Update state with phase tracking
# =============================================================================

update_phase() {
    local session_id="$1"
    local new_phase="$2"
    local task_info="${3:-}"

    # Update in progress file
    update_sprint_progress "state" "{\"phase\": \"$new_phase\"}"

    # Check for transitions that trigger compact
    check_and_compact_on_phase_change "$session_id" "$new_phase" "$task_info"
}
