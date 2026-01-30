#!/bin/bash
# =============================================================================
# Recette - Session Management Module
# Handles session creation, checkpoints, and resume functionality
# =============================================================================

# Session directory
RECETTE_BASE="${RECETTE_BASE:-$PWD/.recette}"

# Session state
RECETTE_SESSION_ID=""
RECETTE_SESSION_DIR=""
RECETTE_SESSION_STATUS=""

# =============================================================================
# Session ID Generation
# =============================================================================

generate_recette_session_id() {
    local scope="$1"
    local target_id="$2"
    local timestamp
    timestamp=$(date +%Y%m%d-%H%M%S)

    # Clean target_id for use in filename
    local clean_id
    clean_id=$(echo "$target_id" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')

    echo "REC-${timestamp}-${scope}-${clean_id}"
}

# =============================================================================
# Session Creation
# =============================================================================

create_recette_session() {
    local scope="$1"
    local target_id="$2"
    local plan_file="$3"

    local session_id
    session_id=$(generate_recette_session_id "$scope" "$target_id")

    local session_dir="$RECETTE_BASE/sessions/$session_id"

    # Create session directory structure
    mkdir -p "$session_dir"/{screenshots,checkpoints,logs}

    # Create session state file
    local state_file="$session_dir/state.yaml"
    cat > "$state_file" << EOF
session:
  id: "$session_id"
  created_at: "$(date -Iseconds)"
  status: "pending"
  scope: "$scope"
  target_id: "$target_id"

progress:
  current_test_index: 0
  current_step_index: 0
  tests:
    total: 0
    passed: 0
    failed: 0
    skipped: 0
    pending: 0

errors_detected: []

recovery:
  resumable: true
  resume_from:
    test_id: ""
    step_index: 0
  last_checkpoint: ""

metadata:
  plan_file: "$plan_file"
  started_at: ""
  completed_at: ""
  duration_seconds: 0
EOF

    # Create log file
    touch "$session_dir/logs/session.log"

    # Export session info
    RECETTE_SESSION_ID="$session_id"
    RECETTE_SESSION_DIR="$session_dir"
    RECETTE_SESSION_STATUS="pending"

    echo "$session_id"
}

# =============================================================================
# Session Loading
# =============================================================================

load_recette_session() {
    local session_id="$1"
    local session_dir="$RECETTE_BASE/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    if [[ ! -f "$state_file" ]]; then
        echo "Session not found: $session_id" >&2
        return 1
    fi

    RECETTE_SESSION_ID="$session_id"
    RECETTE_SESSION_DIR="$session_dir"

    # Load status
    if command -v yq &>/dev/null; then
        RECETTE_SESSION_STATUS=$(yq e '.session.status' "$state_file" 2>/dev/null)
    else
        RECETTE_SESSION_STATUS="unknown"
    fi

    return 0
}

# =============================================================================
# Session Resume
# =============================================================================

resume_recette_session() {
    local session_id="$1"

    if ! load_recette_session "$session_id"; then
        return 1
    fi

    local state_file="$RECETTE_SESSION_DIR/state.yaml"

    # Update status to running
    if command -v yq &>/dev/null; then
        yq e -i '.session.status = "running" | .session.resumed_at = "'"$(date -Iseconds)"'"' "$state_file"
    fi

    RECETTE_SESSION_STATUS="running"

    # Get resume point
    local resume_test=""
    local resume_step=0

    if command -v yq &>/dev/null; then
        resume_test=$(yq e '.recovery.resume_from.test_id // ""' "$state_file")
        resume_step=$(yq e '.recovery.resume_from.step_index // 0' "$state_file")
    fi

    echo "$resume_test:$resume_step"
    return 0
}

# =============================================================================
# Checkpoint Management
# =============================================================================

create_checkpoint() {
    local test_id="$1"
    local step_index="$2"
    local status="$3"

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        return 1
    fi

    local checkpoint_id
    checkpoint_id=$(date +%s)
    local checkpoint_file="$RECETTE_SESSION_DIR/checkpoints/$checkpoint_id.yaml"

    cat > "$checkpoint_file" << EOF
checkpoint:
  id: "$checkpoint_id"
  created_at: "$(date -Iseconds)"
  test_id: "$test_id"
  step_index: $step_index
  status: "$status"
EOF

    # Update state with resume point
    local state_file="$RECETTE_SESSION_DIR/state.yaml"
    if command -v yq &>/dev/null; then
        yq e -i ".recovery.resume_from.test_id = \"$test_id\" | .recovery.resume_from.step_index = $step_index | .recovery.last_checkpoint = \"$checkpoint_id\"" "$state_file"
    fi

    echo "$checkpoint_id"
}

# Get last checkpoint
get_last_checkpoint() {
    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        echo ""
        return 1
    fi

    local checkpoints_dir="$RECETTE_SESSION_DIR/checkpoints"

    if [[ ! -d "$checkpoints_dir" ]]; then
        echo ""
        return 1
    fi

    # Get most recent checkpoint file
    local latest
    latest=$(ls -t "$checkpoints_dir"/*.yaml 2>/dev/null | head -1)

    if [[ -n "$latest" ]]; then
        cat "$latest"
    else
        echo ""
    fi
}

# =============================================================================
# Progress Tracking
# =============================================================================

update_progress() {
    local test_index="$1"
    local step_index="$2"
    local total_tests="$3"

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        return 1
    fi

    local state_file="$RECETTE_SESSION_DIR/state.yaml"

    if command -v yq &>/dev/null; then
        yq e -i ".progress.current_test_index = $test_index | .progress.current_step_index = $step_index | .progress.tests.total = $total_tests" "$state_file"
    fi
}

update_test_result() {
    local result="$1"  # passed, failed, skipped

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        return 1
    fi

    local state_file="$RECETTE_SESSION_DIR/state.yaml"

    if command -v yq &>/dev/null; then
        case "$result" in
            passed)
                yq e -i '.progress.tests.passed += 1 | .progress.tests.pending -= 1' "$state_file"
                ;;
            failed)
                yq e -i '.progress.tests.failed += 1 | .progress.tests.pending -= 1' "$state_file"
                ;;
            skipped)
                yq e -i '.progress.tests.skipped += 1 | .progress.tests.pending -= 1' "$state_file"
                ;;
        esac
    fi
}

# =============================================================================
# Error Recording
# =============================================================================

record_error() {
    local test_id="$1"
    local error_type="$2"
    local description="$3"
    local step_index="${4:-0}"

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        return 1
    fi

    local error_id
    error_id="ERR-$(date +%s)-$RANDOM"

    local state_file="$RECETTE_SESSION_DIR/state.yaml"

    # Create error entry
    local error_entry="
  - id: \"$error_id\"
    test_id: \"$test_id\"
    step_index: $step_index
    type: \"$error_type\"
    description: \"$description\"
    detected_at: \"$(date -Iseconds)\"
    status: \"pending_fix\"
    generated_tests:
      unit: \"\"
      functional: \"\"
      behat: \"\"
"

    # Append to errors_detected
    if command -v yq &>/dev/null; then
        # Read current errors
        local current_errors
        current_errors=$(yq e '.errors_detected' "$state_file")

        if [[ "$current_errors" == "[]" || -z "$current_errors" ]]; then
            yq e -i ".errors_detected = [$error_entry]" "$state_file" 2>/dev/null || true
        else
            yq e -i ".errors_detected += [$error_entry]" "$state_file" 2>/dev/null || true
        fi
    fi

    echo "$error_id"
}

# Update error with generated tests
update_error_tests() {
    local error_id="$1"
    local unit_test="$2"
    local functional_test="$3"
    local behat_test="$4"

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        return 1
    fi

    local state_file="$RECETTE_SESSION_DIR/state.yaml"

    if command -v yq &>/dev/null; then
        yq e -i "(.errors_detected[] | select(.id == \"$error_id\")).generated_tests.unit = \"$unit_test\" | (.errors_detected[] | select(.id == \"$error_id\")).generated_tests.functional = \"$functional_test\" | (.errors_detected[] | select(.id == \"$error_id\")).generated_tests.behat = \"$behat_test\"" "$state_file" 2>/dev/null || true
    fi
}

# =============================================================================
# Session Finalization
# =============================================================================

finalize_session() {
    local status="$1"  # completed, failed, paused

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        return 1
    fi

    local state_file="$RECETTE_SESSION_DIR/state.yaml"
    local start_time=""
    local end_time
    end_time=$(date -Iseconds)

    if command -v yq &>/dev/null; then
        start_time=$(yq e '.metadata.started_at // ""' "$state_file")

        # Calculate duration
        local duration=0
        if [[ -n "$start_time" ]]; then
            local start_epoch
            local end_epoch
            start_epoch=$(date -d "$start_time" +%s 2>/dev/null || echo "0")
            end_epoch=$(date +%s)
            duration=$((end_epoch - start_epoch))
        fi

        yq e -i ".session.status = \"$status\" | .metadata.completed_at = \"$end_time\" | .metadata.duration_seconds = $duration" "$state_file"
    fi

    RECETTE_SESSION_STATUS="$status"
}

# =============================================================================
# Session Listing
# =============================================================================

list_recette_sessions() {
    local sessions_dir="$RECETTE_BASE/sessions"

    if [[ ! -d "$sessions_dir" ]]; then
        echo "[]"
        return
    fi

    local sessions=()

    for dir in "$sessions_dir"/*/; do
        if [[ -d "$dir" ]]; then
            local state_file="$dir/state.yaml"
            if [[ -f "$state_file" ]] && command -v yq &>/dev/null; then
                local id scope target_id status
                id=$(yq e '.session.id' "$state_file")
                scope=$(yq e '.session.scope' "$state_file")
                target_id=$(yq e '.session.target_id' "$state_file")
                status=$(yq e '.session.status' "$state_file")

                sessions+=("{\"id\":\"$id\",\"scope\":\"$scope\",\"target_id\":\"$target_id\",\"status\":\"$status\"}")
            fi
        fi
    done

    # Convert to JSON array
    if [[ ${#sessions[@]} -gt 0 ]]; then
        printf '[%s]\n' "$(IFS=,; echo "${sessions[*]}")"
    else
        echo "[]"
    fi
}

# Get resumable sessions
list_resumable_sessions() {
    local sessions_dir="$RECETTE_BASE/sessions"

    if [[ ! -d "$sessions_dir" ]]; then
        echo "[]"
        return
    fi

    local sessions=()

    for dir in "$sessions_dir"/*/; do
        if [[ -d "$dir" ]]; then
            local state_file="$dir/state.yaml"
            if [[ -f "$state_file" ]] && command -v yq &>/dev/null; then
                local status resumable
                status=$(yq e '.session.status' "$state_file")
                resumable=$(yq e '.recovery.resumable // "false"' "$state_file")

                # Only include paused or running sessions that are resumable
                if [[ "$resumable" == "true" && ("$status" == "paused" || "$status" == "running" || "$status" == "pending") ]]; then
                    local id scope target_id
                    id=$(yq e '.session.id' "$state_file")
                    scope=$(yq e '.session.scope' "$state_file")
                    target_id=$(yq e '.session.target_id' "$state_file")

                    sessions+=("{\"id\":\"$id\",\"scope\":\"$scope\",\"target_id\":\"$target_id\",\"status\":\"$status\"}")
                fi
            fi
        fi
    done

    if [[ ${#sessions[@]} -gt 0 ]]; then
        printf '[%s]\n' "$(IFS=,; echo "${sessions[*]}")"
    else
        echo "[]"
    fi
}

# =============================================================================
# Screenshot Management
# =============================================================================

save_screenshot() {
    local test_id="$1"
    local step_index="$2"
    local screenshot_data="$3"  # Base64 or file path

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        return 1
    fi

    local screenshots_dir="$RECETTE_SESSION_DIR/screenshots"
    local filename="${test_id}_step${step_index}_$(date +%H%M%S).png"

    # If it's base64 data, decode it
    if [[ "$screenshot_data" == data:* ]] || [[ ${#screenshot_data} -gt 200 ]]; then
        echo "$screenshot_data" | base64 -d > "$screenshots_dir/$filename"
    elif [[ -f "$screenshot_data" ]]; then
        cp "$screenshot_data" "$screenshots_dir/$filename"
    fi

    echo "$screenshots_dir/$filename"
}

# =============================================================================
# Logging
# =============================================================================

log_recette() {
    local level="$1"
    local message="$2"

    if [[ -z "$RECETTE_SESSION_DIR" ]]; then
        echo "[$level] $message" >&2
        return
    fi

    local log_file="$RECETTE_SESSION_DIR/logs/session.log"
    echo "[$(date -Iseconds)] [$level] $message" >> "$log_file"
}

# =============================================================================
# Get Session Summary
# =============================================================================

get_session_summary() {
    local session_id="${1:-$RECETTE_SESSION_ID}"

    if [[ -z "$session_id" ]]; then
        echo "{}"
        return 1
    fi

    local session_dir="$RECETTE_BASE/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    if [[ ! -f "$state_file" ]]; then
        echo "{}"
        return 1
    fi

    if command -v yq &>/dev/null; then
        yq e '.' "$state_file" -o json
    else
        echo "{\"error\": \"yq not available\"}"
    fi
}

# =============================================================================
# Export
# =============================================================================

export RECETTE_BASE
export RECETTE_SESSION_ID
export RECETTE_SESSION_DIR
export RECETTE_SESSION_STATUS
