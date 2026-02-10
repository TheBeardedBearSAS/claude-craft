#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Circuit Breaker Module
# Safety mechanism to prevent infinite loops and detect stalls
# Now with adaptive profiles and learning capabilities (v2.0)
# =============================================================================

# Circuit breaker thresholds (defaults)
CB_NO_CHANGES_THRESHOLD="${CB_NO_CHANGES_THRESHOLD:-3}"
CB_REPEATED_ERROR_THRESHOLD="${CB_REPEATED_ERROR_THRESHOLD:-5}"
CB_OUTPUT_DECLINE_THRESHOLD="${CB_OUTPUT_DECLINE_THRESHOLD:-70}"

# Circuit breaker state
CB_ITERATIONS_WITHOUT_CHANGES=0
CB_CONSECUTIVE_ERRORS=0
CB_PEAK_OUTPUT_LENGTH=0
CB_LAST_OUTPUT_LENGTH=0
CB_TRIGGERED=false
CB_TRIGGER_REASON=""

# Adaptive mode settings
CB_ADAPTIVE_ENABLED="${CB_ADAPTIVE_ENABLED:-false}"
CB_CURRENT_PROFILE="medium_feature"
CB_LEARNING_ENABLED="${CB_LEARNING_ENABLED:-true}"
CB_LEARNING_MIN_SAMPLES=5

# =============================================================================
# Adaptive Profiles
# =============================================================================
# Each profile defines thresholds optimized for different task types

declare -A CB_PROFILE_QUICK_FIX=(
    ["no_changes"]=2
    ["errors"]=3
    ["max_iterations"]=10
    ["keywords"]="fix bug typo hotfix patch"
)

declare -A CB_PROFILE_SMALL_FEATURE=(
    ["no_changes"]=3
    ["errors"]=4
    ["max_iterations"]=15
    ["keywords"]="add implement small simple"
)

declare -A CB_PROFILE_MEDIUM_FEATURE=(
    ["no_changes"]=4
    ["errors"]=6
    ["max_iterations"]=25
    ["keywords"]="feature create with tests"
)

declare -A CB_PROFILE_LARGE_FEATURE=(
    ["no_changes"]=5
    ["errors"]=8
    ["max_iterations"]=50
    ["keywords"]="refactor migrate complex large"
)

declare -A CB_PROFILE_EXPLORATION=(
    ["no_changes"]=10
    ["errors"]=15
    ["max_iterations"]=100
    ["keywords"]="explore investigate research analyze"
)

# Autonomous profile for overnight/unattended runs
declare -A CB_PROFILE_AUTONOMOUS=(
    ["no_changes"]=5
    ["errors"]=8
    ["max_iterations"]=50
    ["keywords"]="autonomous overnight unattended sprint"
    ["recovery_enabled"]="true"
)

# Recovery integration
CB_RECOVERY_ENABLED="${CB_RECOVERY_ENABLED:-false}"
CB_RECOVERY_ATTEMPTS=0
CB_MAX_RECOVERY_ATTEMPTS=3

# =============================================================================
# Initialization
# =============================================================================

init_circuit_breaker() {
    CB_ITERATIONS_WITHOUT_CHANGES=0
    CB_CONSECUTIVE_ERRORS=0
    CB_PEAK_OUTPUT_LENGTH=0
    CB_LAST_OUTPUT_LENGTH=0
    CB_TRIGGERED=false
    CB_TRIGGER_REASON=""

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        # Check for adaptive mode
        local adaptive
        adaptive=$(yq e '.circuit_breaker.adaptive // "false"' "$CONFIG_FILE" 2>/dev/null)
        CB_ADAPTIVE_ENABLED="$adaptive"

        # Load default profile
        local default_profile
        default_profile=$(yq e '.circuit_breaker.default_profile // "medium_feature"' "$CONFIG_FILE" 2>/dev/null)
        CB_CURRENT_PROFILE="$default_profile"

        # Load learning settings
        local learning
        learning=$(yq e '.circuit_breaker.learning.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        CB_LEARNING_ENABLED="$learning"

        local min_samples
        min_samples=$(yq e '.circuit_breaker.learning.min_samples // "5"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$min_samples" =~ ^[0-9]+$ ]]; then
            CB_LEARNING_MIN_SAMPLES=$min_samples
        fi

        # Load manual thresholds (used when adaptive is disabled)
        if [[ "$CB_ADAPTIVE_ENABLED" != "true" ]]; then
            local no_changes
            no_changes=$(yq e '.circuit_breaker.no_file_changes_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
            if [[ -n "$no_changes" && "$no_changes" =~ ^[0-9]+$ ]]; then
                CB_NO_CHANGES_THRESHOLD=$no_changes
            fi

            local errors
            errors=$(yq e '.circuit_breaker.repeated_error_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
            if [[ -n "$errors" && "$errors" =~ ^[0-9]+$ ]]; then
                CB_REPEATED_ERROR_THRESHOLD=$errors
            fi

            local decline
            decline=$(yq e '.circuit_breaker.output_decline_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
            if [[ -n "$decline" && "$decline" =~ ^[0-9]+$ ]]; then
                CB_OUTPUT_DECLINE_THRESHOLD=$decline
            fi
        fi
    fi

    # If adaptive mode, detect profile from prompt
    if [[ "$CB_ADAPTIVE_ENABLED" == "true" && -n "$PROMPT" ]]; then
        detect_task_profile "$PROMPT"
        load_profile_thresholds "$CB_CURRENT_PROFILE"

        # Apply learning adjustments if available
        if [[ "$CB_LEARNING_ENABLED" == "true" ]]; then
            apply_learned_adjustments "$CB_CURRENT_PROFILE"
        fi
    fi

    print_verbose "Circuit breaker initialized:"
    print_verbose "  - Adaptive mode: $CB_ADAPTIVE_ENABLED"
    print_verbose "  - Profile: $CB_CURRENT_PROFILE"
    print_verbose "  - No changes threshold: $CB_NO_CHANGES_THRESHOLD"
    print_verbose "  - Error threshold: $CB_REPEATED_ERROR_THRESHOLD"
    print_verbose "  - Output decline threshold: ${CB_OUTPUT_DECLINE_THRESHOLD}%"
}

# =============================================================================
# Profile Detection
# =============================================================================

detect_task_profile() {
    local prompt="$1"
    local prompt_lower
    prompt_lower=$(echo "$prompt" | tr '[:upper:]' '[:lower:]')

    # Check each profile's keywords
    local profiles=("quick_fix" "small_feature" "medium_feature" "large_feature" "exploration" "autonomous")

    for profile in "${profiles[@]}"; do
        local keywords
        case "$profile" in
            quick_fix) keywords="${CB_PROFILE_QUICK_FIX["keywords"]}" ;;
            small_feature) keywords="${CB_PROFILE_SMALL_FEATURE["keywords"]}" ;;
            medium_feature) keywords="${CB_PROFILE_MEDIUM_FEATURE["keywords"]}" ;;
            large_feature) keywords="${CB_PROFILE_LARGE_FEATURE["keywords"]}" ;;
            exploration) keywords="${CB_PROFILE_EXPLORATION["keywords"]}" ;;
            autonomous) keywords="${CB_PROFILE_AUTONOMOUS["keywords"]}" ;;
        esac

        for keyword in $keywords; do
            if [[ "$prompt_lower" == *"$keyword"* ]]; then
                CB_CURRENT_PROFILE="$profile"
                print_verbose "Detected profile '$profile' from keyword '$keyword'"
                return 0
            fi
        done
    done

    # Default to medium_feature if no match
    CB_CURRENT_PROFILE="medium_feature"
    print_verbose "No profile match, using default: $CB_CURRENT_PROFILE"
}

# =============================================================================
# Load Profile Thresholds
# =============================================================================

load_profile_thresholds() {
    local profile="$1"

    case "$profile" in
        quick_fix)
            CB_NO_CHANGES_THRESHOLD=${CB_PROFILE_QUICK_FIX["no_changes"]}
            CB_REPEATED_ERROR_THRESHOLD=${CB_PROFILE_QUICK_FIX["errors"]}
            MAX_ITERATIONS=${CB_PROFILE_QUICK_FIX["max_iterations"]}
            ;;
        small_feature)
            CB_NO_CHANGES_THRESHOLD=${CB_PROFILE_SMALL_FEATURE["no_changes"]}
            CB_REPEATED_ERROR_THRESHOLD=${CB_PROFILE_SMALL_FEATURE["errors"]}
            MAX_ITERATIONS=${CB_PROFILE_SMALL_FEATURE["max_iterations"]}
            ;;
        medium_feature)
            CB_NO_CHANGES_THRESHOLD=${CB_PROFILE_MEDIUM_FEATURE["no_changes"]}
            CB_REPEATED_ERROR_THRESHOLD=${CB_PROFILE_MEDIUM_FEATURE["errors"]}
            MAX_ITERATIONS=${CB_PROFILE_MEDIUM_FEATURE["max_iterations"]}
            ;;
        large_feature)
            CB_NO_CHANGES_THRESHOLD=${CB_PROFILE_LARGE_FEATURE["no_changes"]}
            CB_REPEATED_ERROR_THRESHOLD=${CB_PROFILE_LARGE_FEATURE["errors"]}
            MAX_ITERATIONS=${CB_PROFILE_LARGE_FEATURE["max_iterations"]}
            ;;
        exploration)
            CB_NO_CHANGES_THRESHOLD=${CB_PROFILE_EXPLORATION["no_changes"]}
            CB_REPEATED_ERROR_THRESHOLD=${CB_PROFILE_EXPLORATION["errors"]}
            MAX_ITERATIONS=${CB_PROFILE_EXPLORATION["max_iterations"]}
            ;;
        autonomous)
            CB_NO_CHANGES_THRESHOLD=${CB_PROFILE_AUTONOMOUS["no_changes"]}
            CB_REPEATED_ERROR_THRESHOLD=${CB_PROFILE_AUTONOMOUS["errors"]}
            MAX_ITERATIONS=${CB_PROFILE_AUTONOMOUS["max_iterations"]}
            CB_RECOVERY_ENABLED="true"
            ;;
        *)
            # Default to medium_feature
            CB_NO_CHANGES_THRESHOLD=${CB_PROFILE_MEDIUM_FEATURE["no_changes"]}
            CB_REPEATED_ERROR_THRESHOLD=${CB_PROFILE_MEDIUM_FEATURE["errors"]}
            MAX_ITERATIONS=${CB_PROFILE_MEDIUM_FEATURE["max_iterations"]}
            ;;
    esac

    print_verbose "Loaded thresholds for profile: $profile"
}

# =============================================================================
# Learning from History
# =============================================================================

apply_learned_adjustments() {
    local profile="$1"
    local history_file="$RALPH_SESSION_BASE/history/circuit-breaker-history.json"

    if [[ ! -f "$history_file" ]]; then
        return 0
    fi

    if ! command -v jq &>/dev/null; then
        return 0
    fi

    # Get historical data for this profile
    local profile_data
    profile_data=$(jq --arg p "$profile" '
        .profiles[$p] // {samples: 0}
    ' "$history_file" 2>/dev/null)

    local samples
    samples=$(echo "$profile_data" | jq -r '.samples // 0')

    if [[ $samples -lt $CB_LEARNING_MIN_SAMPLES ]]; then
        print_verbose "Not enough samples for learning ($samples < $CB_LEARNING_MIN_SAMPLES)"
        return 0
    fi

    # Apply adjustments based on historical success rate
    local success_rate
    success_rate=$(echo "$profile_data" | jq -r '.success_rate // 0')

    local avg_iterations
    avg_iterations=$(echo "$profile_data" | jq -r '.avg_iterations // 0')

    # If success rate is low, increase thresholds
    if [[ $success_rate -lt 50 ]]; then
        CB_NO_CHANGES_THRESHOLD=$((CB_NO_CHANGES_THRESHOLD + 1))
        CB_REPEATED_ERROR_THRESHOLD=$((CB_REPEATED_ERROR_THRESHOLD + 2))
        print_verbose "Learning adjustment: increased thresholds due to low success rate ($success_rate%)"
    fi

    # Adjust max iterations based on historical average
    if [[ $avg_iterations -gt $MAX_ITERATIONS ]]; then
        MAX_ITERATIONS=$((avg_iterations + 5))
        print_verbose "Learning adjustment: increased max_iterations to $MAX_ITERATIONS"
    fi
}

record_circuit_breaker_outcome() {
    local profile="$1"
    local success="$2"
    local iterations="$3"
    local history_file="$RALPH_SESSION_BASE/history/circuit-breaker-history.json"

    # Ensure history directory exists
    mkdir -p "$(dirname "$history_file")"

    # Initialize history file if needed
    if [[ ! -f "$history_file" ]]; then
        echo '{"profiles": {}}' > "$history_file"
    fi

    if ! command -v jq &>/dev/null; then
        return 0
    fi

    # Update profile history
    local tmp_file="${history_file}.tmp.$$"
    jq --arg p "$profile" \
       --argjson s "$([[ "$success" == "true" ]] && echo 1 || echo 0)" \
       --argjson i "$iterations" '
        .profiles[$p] = (
            .profiles[$p] // {samples: 0, successes: 0, total_iterations: 0}
            | .samples += 1
            | .successes += $s
            | .total_iterations += $i
            | .success_rate = ((.successes / .samples) * 100 | floor)
            | .avg_iterations = ((.total_iterations / .samples) | floor)
        )
    ' "$history_file" > "$tmp_file" 2>/dev/null && mv "$tmp_file" "$history_file"

    print_verbose "Recorded circuit breaker outcome for profile: $profile"
}

# =============================================================================
# Get Profile Info
# =============================================================================

get_profile_info() {
    local profile="${1:-$CB_CURRENT_PROFILE}"

    cat <<EOF
{
    "profile": "$profile",
    "adaptive": $CB_ADAPTIVE_ENABLED,
    "learning": $CB_LEARNING_ENABLED,
    "thresholds": {
        "no_changes": $CB_NO_CHANGES_THRESHOLD,
        "errors": $CB_REPEATED_ERROR_THRESHOLD,
        "max_iterations": $MAX_ITERATIONS
    }
}
EOF
}

list_profiles() {
    echo "Available Circuit Breaker Profiles:"
    echo "-----------------------------------"
    echo ""
    echo "quick_fix:"
    echo "  - No changes: ${CB_PROFILE_QUICK_FIX["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_QUICK_FIX["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_QUICK_FIX["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_QUICK_FIX["keywords"]}"
    echo ""
    echo "small_feature:"
    echo "  - No changes: ${CB_PROFILE_SMALL_FEATURE["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_SMALL_FEATURE["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_SMALL_FEATURE["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_SMALL_FEATURE["keywords"]}"
    echo ""
    echo "medium_feature:"
    echo "  - No changes: ${CB_PROFILE_MEDIUM_FEATURE["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_MEDIUM_FEATURE["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_MEDIUM_FEATURE["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_MEDIUM_FEATURE["keywords"]}"
    echo ""
    echo "large_feature:"
    echo "  - No changes: ${CB_PROFILE_LARGE_FEATURE["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_LARGE_FEATURE["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_LARGE_FEATURE["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_LARGE_FEATURE["keywords"]}"
    echo ""
    echo "exploration:"
    echo "  - No changes: ${CB_PROFILE_EXPLORATION["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_EXPLORATION["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_EXPLORATION["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_EXPLORATION["keywords"]}"
}

# =============================================================================
# Circuit Breaker Check
# =============================================================================

check_circuit_breaker() {
    # Return 0 (true) if triggered, 1 (false) if OK to continue

    # Check no progress (no file changes)
    if [[ $CB_ITERATIONS_WITHOUT_CHANGES -ge $CB_NO_CHANGES_THRESHOLD ]]; then
        CB_TRIGGERED=true
        CB_TRIGGER_REASON="no_progress"
        print_warning "${MSG_CB_TRIGGERED}: ${MSG_CB_NO_CHANGES} $CB_ITERATIONS_WITHOUT_CHANGES ${MSG_CB_ITERATIONS}"
        return 0
    fi

    # Check repeated errors
    if [[ $CB_CONSECUTIVE_ERRORS -ge $CB_REPEATED_ERROR_THRESHOLD ]]; then
        CB_TRIGGERED=true
        CB_TRIGGER_REASON="repeated_errors"
        print_warning "${MSG_CB_TRIGGERED}: ${MSG_CB_REPEATED_ERRORS}"
        return 0
    fi

    # Check output decline
    if [[ $CB_PEAK_OUTPUT_LENGTH -gt 0 && $CB_LAST_OUTPUT_LENGTH -gt 0 ]]; then
        local decline_percent=$(( (CB_PEAK_OUTPUT_LENGTH - CB_LAST_OUTPUT_LENGTH) * 100 / CB_PEAK_OUTPUT_LENGTH ))
        if [[ $decline_percent -ge $CB_OUTPUT_DECLINE_THRESHOLD ]]; then
            CB_TRIGGERED=true
            CB_TRIGGER_REASON="output_decline"
            print_warning "${MSG_CB_TRIGGERED}: ${MSG_CB_OUTPUT_DECLINE} ${decline_percent}${MSG_CB_PERCENT}"
            return 0
        fi
    fi

    return 1
}

# =============================================================================
# Update Circuit Breaker State
# =============================================================================

update_circuit_breaker() {
    local event_type="$1"
    local output="$2"

    case "$event_type" in
        progress)
            # Reset counters on progress
            CB_ITERATIONS_WITHOUT_CHANGES=0
            CB_CONSECUTIVE_ERRORS=0

            # Update output tracking
            local output_length=${#output}
            CB_LAST_OUTPUT_LENGTH=$output_length
            if [[ $output_length -gt $CB_PEAK_OUTPUT_LENGTH ]]; then
                CB_PEAK_OUTPUT_LENGTH=$output_length
            fi
            ;;

        no_progress)
            CB_ITERATIONS_WITHOUT_CHANGES=$((CB_ITERATIONS_WITHOUT_CHANGES + 1))
            print_verbose "No progress: $CB_ITERATIONS_WITHOUT_CHANGES / $CB_NO_CHANGES_THRESHOLD"
            ;;

        error)
            CB_CONSECUTIVE_ERRORS=$((CB_CONSECUTIVE_ERRORS + 1))
            print_verbose "Error count: $CB_CONSECUTIVE_ERRORS / $CB_REPEATED_ERROR_THRESHOLD"
            ;;

        reset)
            CB_ITERATIONS_WITHOUT_CHANGES=0
            CB_CONSECUTIVE_ERRORS=0
            CB_TRIGGERED=false
            CB_TRIGGER_REASON=""
            print_verbose "${MSG_CB_RESET}"
            ;;
    esac

    # Update session state if available
    if [[ -n "$SESSION_ID" ]]; then
        update_session_state "$SESSION_ID" "circuit_breaker" "{
            \"iterations_without_changes\": $CB_ITERATIONS_WITHOUT_CHANGES,
            \"consecutive_errors\": $CB_CONSECUTIVE_ERRORS,
            \"peak_output_length\": $CB_PEAK_OUTPUT_LENGTH,
            \"last_output_length\": $CB_LAST_OUTPUT_LENGTH,
            \"triggered\": $CB_TRIGGERED,
            \"trigger_reason\": \"$CB_TRIGGER_REASON\"
        }"
    fi
}

# =============================================================================
# Circuit Breaker Status
# =============================================================================

get_circuit_breaker_status() {
    cat <<EOF
{
    "iterations_without_changes": $CB_ITERATIONS_WITHOUT_CHANGES,
    "consecutive_errors": $CB_CONSECUTIVE_ERRORS,
    "peak_output_length": $CB_PEAK_OUTPUT_LENGTH,
    "last_output_length": $CB_LAST_OUTPUT_LENGTH,
    "triggered": $CB_TRIGGERED,
    "trigger_reason": "$CB_TRIGGER_REASON",
    "thresholds": {
        "no_changes": $CB_NO_CHANGES_THRESHOLD,
        "errors": $CB_REPEATED_ERROR_THRESHOLD,
        "output_decline": $CB_OUTPUT_DECLINE_THRESHOLD
    }
}
EOF
}

# =============================================================================
# Force Trip
# =============================================================================

trip_circuit_breaker() {
    local reason="$1"
    CB_TRIGGERED=true
    CB_TRIGGER_REASON="${reason:-manual}"
    print_warning "${MSG_CB_TRIGGERED}: $CB_TRIGGER_REASON"
}

# =============================================================================
# Recovery Integration
# =============================================================================

# Attempt recovery before circuit breaker trips
# Returns: 0 = recovered (don't trip), 1 = failed (trip)
attempt_recovery_before_trip() {
    local session_id="$1"
    local trigger_reason="$2"
    local last_output="$3"

    # Check if recovery is enabled
    if [[ "$CB_RECOVERY_ENABLED" != "true" ]]; then
        print_verbose "Recovery disabled - circuit breaker will trip"
        return 1
    fi

    # Check if recovery engine is available
    if ! type attempt_recovery &>/dev/null; then
        print_verbose "Recovery engine not loaded - circuit breaker will trip"
        return 1
    fi

    # Check recovery attempts
    if [[ $CB_RECOVERY_ATTEMPTS -ge $CB_MAX_RECOVERY_ATTEMPTS ]]; then
        print_warning "Max recovery attempts reached ($CB_MAX_RECOVERY_ATTEMPTS)"
        return 1
    fi

    CB_RECOVERY_ATTEMPTS=$((CB_RECOVERY_ATTEMPTS + 1))
    print_info "Recovery attempt $CB_RECOVERY_ATTEMPTS of $CB_MAX_RECOVERY_ATTEMPTS..."

    # Call recovery engine
    local recovery_result
    recovery_result=$(attempt_recovery "$session_id" "$last_output" 2>&1)
    local recovery_status=$?

    case $recovery_status in
        0)
            # Recovery successful
            print_success "Recovery successful - resetting circuit breaker state"
            reset_circuit_breaker_for_recovery
            return 0
            ;;
        2)
            # Needs escalation
            print_warning "Recovery requires escalation"
            if type create_escalation &>/dev/null; then
                create_escalation "$session_id" "blocked" "$trigger_reason" "$last_output"
            fi
            return 1
            ;;
        *)
            # Recovery failed
            print_warning "Recovery failed"
            return 1
            ;;
    esac
}

# Reset circuit breaker state after successful recovery
reset_circuit_breaker_for_recovery() {
    # Partial reset - reduce counters but don't zero them
    CB_ITERATIONS_WITHOUT_CHANGES=$((CB_ITERATIONS_WITHOUT_CHANGES / 2))
    CB_CONSECUTIVE_ERRORS=$((CB_CONSECUTIVE_ERRORS / 2))
    CB_TRIGGERED=false
    CB_TRIGGER_REASON=""

    print_verbose "Circuit breaker partially reset after recovery"
}

# Enhanced check that includes recovery attempt
check_circuit_breaker_with_recovery() {
    local session_id="${1:-}"
    local last_output="${2:-}"

    # First do the standard check
    if ! check_circuit_breaker; then
        # Not triggered, all good
        return 1
    fi

    # Circuit breaker would trip - attempt recovery
    if attempt_recovery_before_trip "$session_id" "$CB_TRIGGER_REASON" "$last_output"; then
        # Recovery succeeded - don't trip
        return 1
    fi

    # Recovery failed - circuit breaker trips
    return 0
}

# Set autonomous mode explicitly
enable_autonomous_mode() {
    CB_CURRENT_PROFILE="autonomous"
    load_profile_thresholds "autonomous"
    CB_RECOVERY_ENABLED="true"

    print_info "Autonomous mode enabled:"
    print_info "  - Profile: autonomous"
    print_info "  - Recovery: enabled"
    print_info "  - Max iterations: $MAX_ITERATIONS"
}

# Get recovery status
get_recovery_integration_status() {
    cat << EOF
{
    "recovery_enabled": $CB_RECOVERY_ENABLED,
    "recovery_attempts": $CB_RECOVERY_ATTEMPTS,
    "max_recovery_attempts": $CB_MAX_RECOVERY_ATTEMPTS,
    "profile": "$CB_CURRENT_PROFILE"
}
EOF
}

# =============================================================================
# Profile Info Update
# =============================================================================

list_profiles() {
    echo "Available Circuit Breaker Profiles:"
    echo "-----------------------------------"
    echo ""
    echo "quick_fix:"
    echo "  - No changes: ${CB_PROFILE_QUICK_FIX["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_QUICK_FIX["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_QUICK_FIX["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_QUICK_FIX["keywords"]}"
    echo ""
    echo "small_feature:"
    echo "  - No changes: ${CB_PROFILE_SMALL_FEATURE["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_SMALL_FEATURE["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_SMALL_FEATURE["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_SMALL_FEATURE["keywords"]}"
    echo ""
    echo "medium_feature:"
    echo "  - No changes: ${CB_PROFILE_MEDIUM_FEATURE["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_MEDIUM_FEATURE["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_MEDIUM_FEATURE["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_MEDIUM_FEATURE["keywords"]}"
    echo ""
    echo "large_feature:"
    echo "  - No changes: ${CB_PROFILE_LARGE_FEATURE["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_LARGE_FEATURE["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_LARGE_FEATURE["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_LARGE_FEATURE["keywords"]}"
    echo ""
    echo "exploration:"
    echo "  - No changes: ${CB_PROFILE_EXPLORATION["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_EXPLORATION["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_EXPLORATION["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_EXPLORATION["keywords"]}"
    echo ""
    echo "autonomous (for overnight/unattended runs):"
    echo "  - No changes: ${CB_PROFILE_AUTONOMOUS["no_changes"]}"
    echo "  - Errors: ${CB_PROFILE_AUTONOMOUS["errors"]}"
    echo "  - Max iterations: ${CB_PROFILE_AUTONOMOUS["max_iterations"]}"
    echo "  - Keywords: ${CB_PROFILE_AUTONOMOUS["keywords"]}"
    echo "  - Recovery: enabled"
}
