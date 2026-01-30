#!/bin/bash
# =============================================================================
# Ralph Wiggum - Sprint Conductor Module
# Autonomous Sprint Conductor (ASC) - Main orchestrator for overnight runs
# =============================================================================

# Sprint conductor state
ASC_ENABLED="${ASC_ENABLED:-true}"
ASC_MODE="${ASC_MODE:-bounded}"  # bounded, continuous, supervised
ASC_MAX_STORIES="${ASC_MAX_STORIES:-10}"
ASC_MAX_CONSECUTIVE_FAILURES="${ASC_MAX_CONSECUTIVE_FAILURES:-3}"
ASC_MAX_RUNTIME_HOURS="${ASC_MAX_RUNTIME_HOURS:-12}"
ASC_STOP_WINDOW="${ASC_STOP_WINDOW:-06:00}"
ASC_PARALLEL_ENABLED="${ASC_PARALLEL_ENABLED:-false}"
ASC_PARALLEL_MAX="${ASC_PARALLEL_MAX:-3}"

# Current state
ASC_CURRENT_STORY=""
ASC_STORIES_COMPLETED=0
ASC_STORIES_FAILED=0
ASC_STORIES_SKIPPED=0
ASC_CONSECUTIVE_FAILURES=0
ASC_START_TIME=0
ASC_SESSION_ID=""
ASC_SPRINT_ID=""

# Paths
ASC_BASE_DIR=""
ASC_STATE_FILE=""
ASC_LOG_FILE=""
ASC_METRICS_FILE=""

# =============================================================================
# Initialization
# =============================================================================

init_sprint_conductor() {
    local sprint_id="${1:-}"

    ASC_START_TIME=$(date +%s)
    ASC_SESSION_ID="ASC-$(date +%Y%m%d-%H%M%S)-$$"
    ASC_SPRINT_ID="$sprint_id"

    # Set up directories
    ASC_BASE_DIR="${RALPH_SESSION_BASE:-.ralph}/conductor"
    mkdir -p "$ASC_BASE_DIR"

    ASC_STATE_FILE="$ASC_BASE_DIR/state-${ASC_SESSION_ID}.yaml"
    ASC_LOG_FILE="$ASC_BASE_DIR/log-${ASC_SESSION_ID}.log"
    ASC_METRICS_FILE="$ASC_BASE_DIR/metrics-${ASC_SESSION_ID}.json"

    # Initialize state file
    cat > "$ASC_STATE_FILE" << EOF
session_id: "$ASC_SESSION_ID"
sprint_id: "$ASC_SPRINT_ID"
mode: "$ASC_MODE"
status: "running"
started_at: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
stories:
  completed: 0
  failed: 0
  skipped: 0
  current: ""
limits:
  max_stories: $ASC_MAX_STORIES
  max_failures: $ASC_MAX_CONSECUTIVE_FAILURES
  max_runtime_hours: $ASC_MAX_RUNTIME_HOURS
  stop_window: "$ASC_STOP_WINDOW"
parallel:
  enabled: $ASC_PARALLEL_ENABLED
  max_concurrent: $ASC_PARALLEL_MAX
  active_sessions: []
checkpoints: []
EOF

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local mode
        mode=$(yq e '.autonomous.mode // "bounded"' "$CONFIG_FILE" 2>/dev/null)
        ASC_MODE="$mode"

        local max_stories
        max_stories=$(yq e '.autonomous.limits.max_stories_per_session // "10"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$max_stories" =~ ^[0-9]+$ ]]; then
            ASC_MAX_STORIES=$max_stories
        fi

        local max_failures
        max_failures=$(yq e '.autonomous.limits.max_consecutive_failures // "3"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$max_failures" =~ ^[0-9]+$ ]]; then
            ASC_MAX_CONSECUTIVE_FAILURES=$max_failures
        fi

        local max_runtime
        max_runtime=$(yq e '.autonomous.schedule.max_runtime_hours // "12"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$max_runtime" =~ ^[0-9]+$ ]]; then
            ASC_MAX_RUNTIME_HOURS=$max_runtime
        fi

        local stop_window
        stop_window=$(yq e '.autonomous.schedule.stop_window // "06:00"' "$CONFIG_FILE" 2>/dev/null)
        ASC_STOP_WINDOW="$stop_window"

        local parallel
        parallel=$(yq e '.autonomous.parallel.enabled // "false"' "$CONFIG_FILE" 2>/dev/null)
        ASC_PARALLEL_ENABLED="$parallel"

        local parallel_max
        parallel_max=$(yq e '.autonomous.parallel.max_concurrent // "3"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$parallel_max" =~ ^[0-9]+$ ]]; then
            ASC_PARALLEL_MAX=$parallel_max
        fi
    fi

    # Initialize submodules
    if type init_recovery_engine &>/dev/null; then
        init_recovery_engine
    fi

    if type init_escalation_service &>/dev/null; then
        init_escalation_service
    fi

    # Initialize parallel manager if enabled
    if [[ "$ASC_PARALLEL_ENABLED" == "true" ]]; then
        if type init_parallel_manager &>/dev/null; then
            PARALLEL_ENABLED="true"
            PARALLEL_MAX_CONCURRENT="$ASC_PARALLEL_MAX"
            init_parallel_manager
        else
            print_warning "Parallel manager not available, falling back to sequential"
            ASC_PARALLEL_ENABLED="false"
        fi
    fi

    # Enable autonomous mode in circuit breaker
    if type enable_autonomous_mode &>/dev/null; then
        enable_autonomous_mode
    fi

    log_conductor "Initialized Sprint Conductor"
    log_conductor "  Session: $ASC_SESSION_ID"
    log_conductor "  Mode: $ASC_MODE"
    log_conductor "  Max stories: $ASC_MAX_STORIES"
    log_conductor "  Max runtime: ${ASC_MAX_RUNTIME_HOURS}h"
    log_conductor "  Parallel: $ASC_PARALLEL_ENABLED (max $ASC_PARALLEL_MAX)"

    print_info "Sprint Conductor initialized: $ASC_SESSION_ID"
}

# =============================================================================
# Main Conductor Loop
# =============================================================================

run_sprint_conductor() {
    local sprint_name="$1"
    local overnight="${2:-false}"
    local supervised="${3:-false}"

    print_header_conductor "$sprint_name"

    # Set mode based on options
    [[ "$overnight" == "true" ]] && ASC_MODE="bounded"
    [[ "$supervised" == "true" ]] && ASC_MODE="supervised"

    log_conductor "Starting sprint conductor for: $sprint_name (mode: $ASC_MODE)"

    # Use parallel or sequential execution based on configuration
    if [[ "$ASC_PARALLEL_ENABLED" == "true" ]] && type process_stories_parallel &>/dev/null; then
        run_sprint_conductor_parallel "$sprint_name"
    else
        run_sprint_conductor_sequential "$sprint_name"
    fi

    # Finalize
    finalize_sprint_conductor
}

# =============================================================================
# Parallel Sprint Execution
# =============================================================================

run_sprint_conductor_parallel() {
    local sprint_name="$1"

    log_conductor "Running in PARALLEL mode (max $ASC_PARALLEL_MAX concurrent)"

    # Get all stories for the sprint
    local all_stories
    all_stories=$(get_all_ready_stories)

    if [[ -z "$all_stories" ]]; then
        log_conductor "No stories available for parallel processing"
        return 0
    fi

    local story_count
    story_count=$(echo "$all_stories" | wc -w | tr -d ' ')
    log_conductor "Found $story_count stories for parallel processing"

    # Build dependency graph
    if type build_dependency_graph &>/dev/null; then
        build_dependency_graph "$all_stories" > /dev/null
    fi

    # Process in waves based on dependencies
    local processed=0
    local wave=1

    while [[ $processed -lt $story_count ]]; do
        # Check stop conditions
        if ! check_continue_conditions; then
            log_conductor "Stop condition met, halting parallel processing"
            break
        fi

        log_conductor "=== Wave $wave ==="

        # Collect completed sessions from previous wave
        if type collect_completed_sessions &>/dev/null; then
            local completed_stories
            completed_stories=$(collect_completed_sessions)

            for story_id in $completed_stories; do
                ASC_STORIES_COMPLETED=$((ASC_STORIES_COMPLETED + 1))
                ASC_CONSECUTIVE_FAILURES=0
                transition_story "$story_id" "review"
                log_conductor "Story completed in parallel: $story_id"
            done
        fi

        # Get stories ready for this wave (dependencies satisfied)
        local ready_stories
        if type get_ready_stories &>/dev/null; then
            ready_stories=$(get_ready_stories)
        else
            ready_stories=$(get_all_ready_stories)
        fi

        if [[ -z "$ready_stories" ]]; then
            # No ready stories - check if any are still running
            if type get_active_count &>/dev/null; then
                local active
                active=$(get_active_count)
                if [[ $active -gt 0 ]]; then
                    log_conductor "Waiting for $active active sessions to complete..."
                    sleep 10
                    continue
                fi
            fi

            # Check for blocked stories
            local pending_escalations=0
            if type get_pending_count &>/dev/null; then
                pending_escalations=$(get_pending_count)
            fi

            if [[ $pending_escalations -gt 0 ]]; then
                log_conductor "Waiting for $pending_escalations pending escalations..."
                sleep 60
                continue
            fi

            # Truly done
            break
        fi

        # Get available slots
        local slots
        if type get_available_slots &>/dev/null; then
            slots=$(get_available_slots)
        else
            slots=$ASC_PARALLEL_MAX
        fi

        # Spawn sessions for ready stories (up to available slots)
        local spawned=0
        for story_id in $ready_stories; do
            [[ $spawned -ge $slots ]] && break

            # Skip if already processed or in progress
            if is_story_in_progress "$story_id"; then
                continue
            fi

            # Supervised mode - pause for confirmation
            if [[ "$ASC_MODE" == "supervised" ]]; then
                if ! confirm_story_start "$story_id"; then
                    log_conductor "Story skipped by user: $story_id"
                    ASC_STORIES_SKIPPED=$((ASC_STORIES_SKIPPED + 1))
                    ((processed++))
                    continue
                fi
            fi

            # Claim the story
            if ! claim_story "$story_id"; then
                log_conductor "Failed to claim story: $story_id (may be claimed by another process)"
                continue
            fi

            # Build prompt for the story
            local prompt
            prompt=$(build_story_prompt "$story_id")

            # Spawn parallel session
            if type spawn_session &>/dev/null; then
                local session_id
                session_id=$(spawn_session "$story_id" "$prompt")
                if [[ -n "$session_id" ]]; then
                    log_conductor "Spawned parallel session $session_id for story $story_id"
                    ((spawned++))
                    ((processed++))
                else
                    log_conductor "Failed to spawn session for $story_id"
                    unclaim_story "$story_id"
                    ASC_STORIES_FAILED=$((ASC_STORIES_FAILED + 1))
                fi
            else
                # Fallback: execute sequentially
                execute_story_with_ralph "$story_id"
                ((processed++))
            fi
        done

        # Update state
        update_conductor_state "stories" ""
        update_parallel_conductor_state

        # Create checkpoint
        create_conductor_checkpoint

        ((wave++))

        # Small delay between waves
        sleep 2
    done

    # Wait for remaining sessions
    if type wait_all_sessions &>/dev/null; then
        log_conductor "Waiting for all parallel sessions to complete..."
        wait_all_sessions 0

        # Final collection
        if type collect_completed_sessions &>/dev/null; then
            local final_completed
            final_completed=$(collect_completed_sessions)

            for story_id in $final_completed; do
                ASC_STORIES_COMPLETED=$((ASC_STORIES_COMPLETED + 1))
                transition_story "$story_id" "review"
            done
        fi
    fi

    # Print parallel summary
    if type print_parallel_summary &>/dev/null; then
        print_parallel_summary
    fi
}

# Check if a story is already in progress (parallel tracking)
is_story_in_progress() {
    local story_id="$1"

    # Check in parallel sessions
    if [[ -n "${PARALLEL_SESSIONS[$story_id]:-}" ]]; then
        return 0
    fi

    # Check in BMAD status
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        local status
        status=$(yq ".stories.${story_id}.status" "$status_file" 2>/dev/null)
        [[ "$status" == "in-progress" ]] && return 0
    fi

    return 1
}

# Update parallel-specific conductor state
update_parallel_conductor_state() {
    if [[ ! -f "$ASC_STATE_FILE" ]] || ! command -v yq &>/dev/null; then
        return
    fi

    # Update active sessions list
    if type get_active_count &>/dev/null; then
        local active_count
        active_count=$(get_active_count)
        yq -i ".parallel.active_count = $active_count" "$ASC_STATE_FILE"
    fi

    # Update parallel stats
    if [[ -n "$PARALLEL_COMPLETED_COUNT" ]]; then
        yq -i ".parallel.completed = $PARALLEL_COMPLETED_COUNT" "$ASC_STATE_FILE"
    fi

    if [[ -n "$PARALLEL_FAILED_COUNT" ]]; then
        yq -i ".parallel.failed = $PARALLEL_FAILED_COUNT" "$ASC_STATE_FILE"
    fi
}

# =============================================================================
# Sequential Sprint Execution (Original Logic)
# =============================================================================

run_sprint_conductor_sequential() {
    local sprint_name="$1"

    log_conductor "Running in SEQUENTIAL mode"

    # Main loop
    while true; do
        # Check stop conditions
        if ! check_continue_conditions; then
            break
        fi

        # Get next story
        local next_story
        next_story=$(get_next_ready_story)

        if [[ -z "$next_story" ]]; then
            log_conductor "No more stories available"

            # Check escalation queue
            if type get_pending_count &>/dev/null; then
                local pending
                pending=$(get_pending_count)
                if [[ $pending -gt 0 ]]; then
                    log_conductor "Waiting for $pending pending escalations..."
                    if type check_escalation_timeouts &>/dev/null; then
                        check_escalation_timeouts
                    fi
                    sleep 60
                    continue
                fi
            fi

            break
        fi

        # Process story
        ASC_CURRENT_STORY="$next_story"
        update_conductor_state "current" "$next_story"

        log_conductor "Processing story: $next_story"

        # Claim the story
        if ! claim_story "$next_story"; then
            log_conductor "Failed to claim story: $next_story"
            ASC_STORIES_SKIPPED=$((ASC_STORIES_SKIPPED + 1))
            continue
        fi

        # Supervised mode - pause for confirmation
        if [[ "$ASC_MODE" == "supervised" ]]; then
            if ! confirm_story_start "$next_story"; then
                log_conductor "Story skipped by user: $next_story"
                unclaim_story "$next_story"
                ASC_STORIES_SKIPPED=$((ASC_STORIES_SKIPPED + 1))
                continue
            fi
        fi

        # Execute story with Ralph
        local result
        result=$(execute_story_with_ralph "$next_story")
        local status=$?

        # Process result
        case $status in
            0)
                # Success
                log_conductor "Story completed: $next_story"
                ASC_STORIES_COMPLETED=$((ASC_STORIES_COMPLETED + 1))
                ASC_CONSECUTIVE_FAILURES=0
                transition_story "$next_story" "review"
                ;;
            1)
                # Failed but recoverable
                log_conductor "Story failed: $next_story"
                ASC_STORIES_FAILED=$((ASC_STORIES_FAILED + 1))
                ASC_CONSECUTIVE_FAILURES=$((ASC_CONSECUTIVE_FAILURES + 1))
                transition_story "$next_story" "blocked"
                ;;
            2)
                # Escalated
                log_conductor "Story escalated: $next_story"
                # Keep in-progress, will be handled by escalation resolution
                ;;
            3)
                # Skipped
                log_conductor "Story skipped: $next_story"
                ASC_STORIES_SKIPPED=$((ASC_STORIES_SKIPPED + 1))
                transition_story "$next_story" "ready-for-dev"
                ;;
        esac

        # Update state
        update_conductor_state "stories" ""

        # Create checkpoint
        create_conductor_checkpoint

        # Rate limiting
        sleep 5
    done
}

# =============================================================================
# Stop Conditions
# =============================================================================

check_continue_conditions() {
    # Check max stories
    local total_processed=$((ASC_STORIES_COMPLETED + ASC_STORIES_FAILED + ASC_STORIES_SKIPPED))
    if [[ $total_processed -ge $ASC_MAX_STORIES ]]; then
        log_conductor "Max stories reached: $total_processed"
        return 1
    fi

    # Check consecutive failures
    if [[ $ASC_CONSECUTIVE_FAILURES -ge $ASC_MAX_CONSECUTIVE_FAILURES ]]; then
        log_conductor "Max consecutive failures reached: $ASC_CONSECUTIVE_FAILURES"
        return 1
    fi

    # Check runtime
    local current_time
    current_time=$(date +%s)
    local runtime_hours=$(((current_time - ASC_START_TIME) / 3600))

    if [[ $runtime_hours -ge $ASC_MAX_RUNTIME_HOURS ]]; then
        log_conductor "Max runtime reached: ${runtime_hours}h"
        return 1
    fi

    # Check stop window (for overnight runs)
    if [[ -n "$ASC_STOP_WINDOW" ]]; then
        local current_hour
        current_hour=$(date +%H:%M)

        if [[ "$current_hour" > "$ASC_STOP_WINDOW" && "$current_hour" < "12:00" ]]; then
            log_conductor "Stop window reached: $current_hour (window: $ASC_STOP_WINDOW)"
            return 1
        fi
    fi

    # Check for critical escalations
    if type has_critical_pending &>/dev/null && has_critical_pending; then
        log_conductor "Critical escalation pending - pausing"

        # Wait for resolution or timeout
        sleep 300  # 5 minutes
        if has_critical_pending; then
            return 1  # Stop if still pending
        fi
    fi

    return 0
}

# =============================================================================
# Story Management
# =============================================================================

get_next_ready_story() {
    # Use BMAD routing engine if available
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        # Get first ready-for-dev story not already claimed
        yq '.stories | to_entries[] | select(.value.status == "ready-for-dev") | select(.value.claimed_by == null or .value.claimed_by == "") | .key' "$status_file" 2>/dev/null | head -1
    fi
}

# Get all ready-for-dev stories (for parallel processing)
get_all_ready_stories() {
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        # Get all ready-for-dev stories not already claimed
        # Also check that blocked_by dependencies are all in "done" or "review" status
        yq -r '
            .stories as $stories |
            .stories | to_entries[] |
            select(.value.status == "ready-for-dev") |
            select(.value.claimed_by == null or .value.claimed_by == "") |
            select(
                (.value.blocked_by // []) | length == 0 or
                (
                    (.value.blocked_by // []) | all(
                        . as $dep |
                        ($stories[$dep].status == "done" or $stories[$dep].status == "review")
                    )
                )
            ) |
            .key
        ' "$status_file" 2>/dev/null | tr '\n' ' '
    fi
}

# Get stories that are ready but have no unsatisfied dependencies
get_independent_ready_stories() {
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        # Stories with no blocked_by at all (fully independent)
        yq -r '
            .stories | to_entries[] |
            select(.value.status == "ready-for-dev") |
            select(.value.claimed_by == null or .value.claimed_by == "") |
            select((.value.blocked_by // []) | length == 0) |
            .key
        ' "$status_file" 2>/dev/null | tr '\n' ' '
    fi
}

claim_story() {
    local story_id="$1"
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        local timestamp
        timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

        yq -i ".stories.${story_id}.claimed_by = \"$ASC_SESSION_ID\"" "$status_file"
        yq -i ".stories.${story_id}.claimed_at = \"$timestamp\"" "$status_file"
        yq -i ".stories.${story_id}.status = \"in-progress\"" "$status_file"

        log_conductor "Claimed story: $story_id"
        return 0
    fi

    return 1
}

unclaim_story() {
    local story_id="$1"
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        yq -i ".stories.${story_id}.claimed_by = \"\"" "$status_file"
        yq -i ".stories.${story_id}.claimed_at = \"\"" "$status_file"

        log_conductor "Unclaimed story: $story_id"
        return 0
    fi

    return 1
}

transition_story() {
    local story_id="$1"
    local new_status="$2"
    local bmad_dir="${BMAD_DIR:-.bmad}"

    # Use routing engine if available
    if [[ -f "$bmad_dir/lib/routing-engine.sh" ]]; then
        bash "$bmad_dir/lib/routing-engine.sh" transition "$story_id" "$new_status" 2>/dev/null
        return $?
    fi

    # Direct update
    local status_file="$bmad_dir/sprint-status.yaml"
    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        local timestamp
        timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

        yq -i ".stories.${story_id}.previous_status = .stories.${story_id}.status" "$status_file"
        yq -i ".stories.${story_id}.status = \"$new_status\"" "$status_file"
        yq -i ".stories.${story_id}.updated_at = \"$timestamp\"" "$status_file"

        log_conductor "Transitioned $story_id to $new_status"
        return 0
    fi

    return 1
}

# =============================================================================
# Ralph Execution
# =============================================================================

execute_story_with_ralph() {
    local story_id="$1"

    log_conductor "Spawning Ralph for story: $story_id"

    # Build prompt for Ralph
    local prompt
    prompt=$(build_story_prompt "$story_id")

    # Get story-specific config if available
    local story_config=""
    if [[ -f ".ralph/stories/${story_id}.yml" ]]; then
        story_config="--config=.ralph/stories/${story_id}.yml"
    fi

    # Run Ralph with autonomous profile
    local ralph_script="${SCRIPT_DIR:-Tools/Ralph}/ralph.sh"

    if [[ -f "$ralph_script" ]]; then
        local output
        output=$("$ralph_script" \
            --lang="${LANG_ARG:-en}" \
            $story_config \
            "$prompt" 2>&1)
        local status=$?

        # Parse Ralph exit status
        case $status in
            0)
                return 0  # Success
                ;;
            *)
                # Check if escalation was created
                if echo "$output" | grep -q "Escalation created"; then
                    return 2  # Escalated
                fi
                return 1  # Failed
                ;;
        esac
    else
        log_conductor "Ralph script not found: $ralph_script"
        return 1
    fi
}

build_story_prompt() {
    local story_id="$1"
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    local prompt="Implement story $story_id"

    if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
        local title description acceptance_criteria
        title=$(yq ".stories.${story_id}.title" "$status_file" 2>/dev/null)
        description=$(yq ".stories.${story_id}.description" "$status_file" 2>/dev/null)
        acceptance_criteria=$(yq ".stories.${story_id}.acceptance_criteria[]" "$status_file" 2>/dev/null | tr '\n' '; ')

        prompt="Implement user story: $title

Description: $description

Acceptance Criteria:
$acceptance_criteria

Follow TDD approach: write tests first (Red), implement code (Green), then refactor (Blue).
Ensure all tests pass before marking as complete."
    fi

    echo "$prompt"
}

# =============================================================================
# Supervised Mode
# =============================================================================

confirm_story_start() {
    local story_id="$1"

    echo ""
    echo "════════════════════════════════════════"
    echo "    Supervised Mode: Story Ready"
    echo "════════════════════════════════════════"
    echo ""
    echo "Story: $story_id"

    if command -v yq &>/dev/null; then
        local bmad_dir="${BMAD_DIR:-.bmad}"
        local status_file="$bmad_dir/sprint-status.yaml"

        if [[ -f "$status_file" ]]; then
            local title
            title=$(yq ".stories.${story_id}.title" "$status_file" 2>/dev/null)
            echo "Title: $title"
        fi
    fi

    echo ""
    read -rp "Start this story? (y/n/s for skip all): " response

    case "$response" in
        y|Y) return 0 ;;
        s|S) ASC_MODE="bounded"; return 1 ;;  # Switch to non-supervised
        *) return 1 ;;
    esac
}

# =============================================================================
# State Management
# =============================================================================

update_conductor_state() {
    local field="$1"
    local value="$2"

    if [[ ! -f "$ASC_STATE_FILE" ]] || ! command -v yq &>/dev/null; then
        return 1
    fi

    case "$field" in
        current)
            yq -i ".stories.current = \"$value\"" "$ASC_STATE_FILE"
            ;;
        stories)
            yq -i ".stories.completed = $ASC_STORIES_COMPLETED" "$ASC_STATE_FILE"
            yq -i ".stories.failed = $ASC_STORIES_FAILED" "$ASC_STATE_FILE"
            yq -i ".stories.skipped = $ASC_STORIES_SKIPPED" "$ASC_STATE_FILE"
            ;;
        status)
            yq -i ".status = \"$value\"" "$ASC_STATE_FILE"
            ;;
    esac
}

create_conductor_checkpoint() {
    if [[ ! -f "$ASC_STATE_FILE" ]] || ! command -v yq &>/dev/null; then
        return 1
    fi

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    yq -i ".checkpoints += [{
        \"timestamp\": \"$timestamp\",
        \"story\": \"$ASC_CURRENT_STORY\",
        \"completed\": $ASC_STORIES_COMPLETED,
        \"failed\": $ASC_STORIES_FAILED,
        \"skipped\": $ASC_STORIES_SKIPPED
    }]" "$ASC_STATE_FILE"
}

# =============================================================================
# Logging
# =============================================================================

log_conductor() {
    local message="$1"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    echo "[$timestamp] $message" >> "$ASC_LOG_FILE"
    print_info "[ASC] $message"
}

# =============================================================================
# Output
# =============================================================================

print_header_conductor() {
    local sprint_name="$1"

    echo ""
    echo -e "${C_CYAN}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_BOLD}Autonomous Sprint Conductor (ASC)${C_RESET}              ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_DIM}$sprint_name${C_RESET}                                    ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}╚════════════════════════════════════════════════════════════╝${C_RESET}"
    echo ""
}

# =============================================================================
# Finalization
# =============================================================================

finalize_sprint_conductor() {
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - ASC_START_TIME))
    local duration_hours=$((duration / 3600))
    local duration_mins=$(((duration % 3600) / 60))

    # Update final state
    update_conductor_state "status" "completed"

    if command -v yq &>/dev/null && [[ -f "$ASC_STATE_FILE" ]]; then
        yq -i ".completed_at = \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" "$ASC_STATE_FILE"
        yq -i ".duration_seconds = $duration" "$ASC_STATE_FILE"
    fi

    # Generate metrics
    generate_conductor_metrics

    # Print summary
    echo ""
    echo "════════════════════════════════════════"
    echo "    Sprint Conductor Summary"
    echo "════════════════════════════════════════"
    echo ""
    echo "Session: $ASC_SESSION_ID"
    echo "Duration: ${duration_hours}h ${duration_mins}m"
    echo ""
    echo "Stories:"
    echo "  Completed: $ASC_STORIES_COMPLETED"
    echo "  Failed:    $ASC_STORIES_FAILED"
    echo "  Skipped:   $ASC_STORIES_SKIPPED"
    echo ""

    # Show escalation stats if available
    if type get_escalation_stats &>/dev/null; then
        echo "Escalations:"
        get_escalation_stats | jq -r 'to_entries[] | "  \(.key): \(.value)"' 2>/dev/null || echo "  N/A"
        echo ""
    fi

    # Show recovery stats if available
    if type get_recovery_stats &>/dev/null; then
        echo "Recovery attempts:"
        get_recovery_stats "$ASC_SESSION_ID" | jq -r '.total_attempts // 0' 2>/dev/null || echo "  N/A"
        echo ""
    fi

    log_conductor "Sprint Conductor completed"
}

generate_conductor_metrics() {
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - ASC_START_TIME))

    cat > "$ASC_METRICS_FILE" << EOF
{
    "session_id": "$ASC_SESSION_ID",
    "sprint_id": "$ASC_SPRINT_ID",
    "mode": "$ASC_MODE",
    "duration_seconds": $duration,
    "stories": {
        "completed": $ASC_STORIES_COMPLETED,
        "failed": $ASC_STORIES_FAILED,
        "skipped": $ASC_STORIES_SKIPPED,
        "total": $((ASC_STORIES_COMPLETED + ASC_STORIES_FAILED + ASC_STORIES_SKIPPED))
    },
    "success_rate": $(echo "scale=2; $ASC_STORIES_COMPLETED / ($ASC_STORIES_COMPLETED + $ASC_STORIES_FAILED + 1)" | bc 2>/dev/null || echo "0"),
    "interventions": $(type get_escalation_stats &>/dev/null && get_escalation_stats | jq -r '.resolved // 0' 2>/dev/null || echo "0")
}
EOF
}

# =============================================================================
# CLI Interface
# =============================================================================

cmd_sprint_conductor() {
    local sprint_name=""
    local overnight="false"
    local supervised="false"
    local parallel=1
    local max_stories=""
    local timeout=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --overnight) overnight="true"; shift ;;
            --supervised) supervised="true"; shift ;;
            --parallel) parallel="$2"; ASC_PARALLEL_ENABLED="true"; ASC_PARALLEL_MAX="$2"; shift 2 ;;
            --max-stories) max_stories="$2"; shift 2 ;;
            --timeout) timeout="$2"; shift 2 ;;
            -*) shift ;;
            *) sprint_name="$1"; shift ;;
        esac
    done

    if [[ -z "$sprint_name" ]]; then
        echo "Usage: sprint-conductor.sh [options] <sprint-name>"
        echo ""
        echo "Options:"
        echo "  --overnight         Run in overnight mode (bounded, auto-stop at 6am)"
        echo "  --supervised        Pause before each story for confirmation"
        echo "  --parallel N        Process up to N stories in parallel"
        echo "  --max-stories N     Maximum stories to process"
        echo "  --timeout HOURS     Maximum runtime in hours"
        return 1
    fi

    # Apply overrides
    [[ -n "$max_stories" ]] && ASC_MAX_STORIES="$max_stories"
    [[ -n "$timeout" ]] && ASC_MAX_RUNTIME_HOURS="$timeout"

    # Initialize and run
    init_sprint_conductor "$sprint_name"
    run_sprint_conductor "$sprint_name" "$overnight" "$supervised"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_sprint_conductor "$@"
fi
