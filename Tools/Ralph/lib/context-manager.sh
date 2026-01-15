#!/bin/bash
# =============================================================================
# Ralph Wiggum - Context Manager Module
# Automatic context limit handling and auto-compaction
# =============================================================================
# Based on Anthropic's "Effective Context Engineering for AI Agents"
# https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
# =============================================================================

# Configuration defaults
CONTEXT_AUTO_COMPACT="${CONTEXT_AUTO_COMPACT:-true}"
CONTEXT_MAX_COMPACTS="${CONTEXT_MAX_COMPACTS:-5}"

# Advanced context management (new features)
CONTEXT_OVERFLOW_STRATEGY="${CONTEXT_OVERFLOW_STRATEGY:-new_session}"  # new_session, extend, fail
CONTEXT_PREVENTIVE_THRESHOLD="${CONTEXT_PREVENTIVE_THRESHOLD:-95}"     # Fallback: Compact at 95% capacity
CONTEXT_MIN_THRESHOLD="${CONTEXT_MIN_THRESHOLD:-50}"                   # Don't compact if below this %
CONTEXT_SMART_RECONSTRUCTION="${CONTEXT_SMART_RECONSTRUCTION:-true}"   # Use intelligent reconstruction
CONTEXT_MAX_CONTINUATION_SESSIONS="${CONTEXT_MAX_CONTINUATION_SESSIONS:-5}"  # Max chained sessions

# Note: Strategic compacts (sprint start, task complete) are preferred over % threshold
# The 95% threshold acts as a safety net if strategic compacts miss the window

# External command (default to 'claude' if not set)
CLAUDE_COMMAND="${CLAUDE_COMMAND:-claude}"

# Context state
CONTEXT_COMPACT_COUNT=0
CONTEXT_CONTINUATION_COUNT=0
CONTEXT_CONTINUATION_PROMPT=""

# =============================================================================
# Context Limit Detection
# =============================================================================

detect_context_limit() {
    local output="$1"

    # Patterns indicating context limit has been reached
    local context_patterns=(
        "Context limit reached"
        "context window"
        "/compact or /clear"
        "conversation is too long"
        "context has been exceeded"
        "maximum context length"
    )

    for pattern in "${context_patterns[@]}"; do
        if echo "$output" | grep -qi "$pattern"; then
            return 0  # Context limit detected
        fi
    done

    return 1  # No context limit
}

# =============================================================================
# Initialization
# =============================================================================

init_context_manager() {
    CONTEXT_COMPACT_COUNT=0
    CONTEXT_CONTINUATION_COUNT=0

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local auto_compact=$(yq e '.context.auto_compact // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$auto_compact" ]] && CONTEXT_AUTO_COMPACT=$auto_compact

        local max_compacts=$(yq e '.context.max_compacts // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$max_compacts" ]] && CONTEXT_MAX_COMPACTS=$max_compacts

        # Load advanced settings
        local overflow_strategy=$(yq e '.context.overflow_strategy // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$overflow_strategy" ]] && CONTEXT_OVERFLOW_STRATEGY=$overflow_strategy

        local preventive=$(yq e '.context.preventive_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$preventive" ]] && CONTEXT_PREVENTIVE_THRESHOLD=$preventive

        local smart_reconstruction=$(yq e '.context.smart_reconstruction // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$smart_reconstruction" ]] && CONTEXT_SMART_RECONSTRUCTION=$smart_reconstruction

        local max_continuations=$(yq e '.context.max_continuation_sessions // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$max_continuations" ]] && CONTEXT_MAX_CONTINUATION_SESSIONS=$max_continuations

        local min_threshold=$(yq e '.context.min_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$min_threshold" ]] && CONTEXT_MIN_THRESHOLD=$min_threshold
    fi

    # Initialize sprint progress module if available
    if type init_sprint_progress &>/dev/null; then
        init_sprint_progress
    fi

    print_verbose "Context manager initialized:"
    print_verbose "  - Auto-compact: $CONTEXT_AUTO_COMPACT"
    print_verbose "  - Max compacts: $CONTEXT_MAX_COMPACTS"
    print_verbose "  - Overflow strategy: $CONTEXT_OVERFLOW_STRATEGY"
    print_verbose "  - Preventive threshold: $CONTEXT_PREVENTIVE_THRESHOLD%"
    print_verbose "  - Min threshold: $CONTEXT_MIN_THRESHOLD%"
    print_verbose "  - Smart reconstruction: $CONTEXT_SMART_RECONSTRUCTION"
}

# =============================================================================
# Auto-Compact
# =============================================================================

run_auto_compact() {
    local session_id="$1"

    # Check if auto-compact is enabled
    if [[ "$CONTEXT_AUTO_COMPACT" != "true" ]]; then
        log_session "$session_id" "WARN" "Auto-compact is disabled"
        print_warning "${MSG_CONTEXT_DISABLED:-Auto-compact disabled}"
        return 1
    fi

    # Check if context is above minimum threshold before compacting
    if [[ "$CONTEXT_MIN_THRESHOLD" -gt 0 ]]; then
        local context_info
        if command -v timeout &> /dev/null; then
            context_info=$(timeout 10s $CLAUDE_COMMAND -p "/context" 2>/dev/null | head -5)
        else
            context_info=$($CLAUDE_COMMAND -p "/context" 2>/dev/null | head -5)
        fi
        local current_usage
        current_usage=$(echo "$context_info" | grep -oP '\d+(?=%)' | head -1)

        if [[ -n "$current_usage" && "$current_usage" -lt "$CONTEXT_MIN_THRESHOLD" ]]; then
            log_session "$session_id" "INFO" "Context at ${current_usage}% - below minimum threshold (${CONTEXT_MIN_THRESHOLD}%), skipping compact"
            print_verbose "Context at ${current_usage}% - below min threshold (${CONTEXT_MIN_THRESHOLD}%), skipping compact"
            return 1
        fi
    fi

    # Check if we've exceeded max compacts
    if [[ $CONTEXT_COMPACT_COUNT -ge $CONTEXT_MAX_COMPACTS ]]; then
        log_session "$session_id" "WARN" "Maximum compacts reached ($CONTEXT_MAX_COMPACTS)"
        print_warning "${MSG_CONTEXT_MAX_REACHED:-Maximum compacts reached} ($CONTEXT_MAX_COMPACTS)"

        # Handle overflow strategy
        local overflow_result
        overflow_result=$(handle_max_compacts_reached "$session_id")
        local overflow_status=$?

        if [[ $overflow_status -eq 0 && -n "$overflow_result" ]]; then
            # New session ID returned - signal continuation
            echo "$overflow_result"
            return 3  # Special return code for session continuation
        fi

        return 2  # Max reached, no continuation
    fi

    # Increment compact counter
    CONTEXT_COMPACT_COUNT=$((CONTEXT_COMPACT_COUNT + 1))

    print_info "${MSG_CONTEXT_COMPACTING:-Running auto-compact}... (#$CONTEXT_COMPACT_COUNT/$CONTEXT_MAX_COMPACTS)"
    log_session "$session_id" "INFO" "Running auto-compact #$CONTEXT_COMPACT_COUNT"

    # Save sprint progress before compact (critical for context reconstruction)
    # Guard: check module availability before calling
    if type save_sprint_progress &>/dev/null; then
        if ! save_sprint_progress "$session_id"; then
            print_warning "Failed to save sprint progress before compact"
        fi
    else
        print_verbose "sprint-progress module not loaded, skipping save"
    fi

    # Update sprint progress compact count
    if type update_sprint_progress &>/dev/null; then
        update_sprint_progress "compact" || print_verbose "Failed to update compact count"
    fi

    # Create checkpoint before compact (safety)
    if type create_checkpoint &>/dev/null; then
        create_checkpoint "$session_id" "pre-compact-$CONTEXT_COMPACT_COUNT" || print_verbose "Failed to create checkpoint"
    fi

    # Execute /compact via Claude CLI
    local compact_output
    local compact_status

    if command -v timeout &> /dev/null; then
        compact_output=$(timeout 60s $CLAUDE_COMMAND --continue -p "/compact" 2>&1)
        compact_status=$?

        # Handle timeout specifically (exit code 124)
        if [[ $compact_status -eq 124 ]]; then
            print_error "${MSG_CONTEXT_COMPACT_FAILED:-Auto-compact timed out after 60s}"
            log_session "$session_id" "ERROR" "Auto-compact timed out after 60s"
            return 1
        fi
    else
        compact_output=$($CLAUDE_COMMAND --continue -p "/compact" 2>&1)
        compact_status=$?
    fi

    if [[ $compact_status -eq 0 ]]; then
        print_success "${MSG_CONTEXT_COMPACTED:-Context compacted successfully}"
        log_session "$session_id" "INFO" "Auto-compact successful"

        # Update session state (use passed session_id, fall back to global SESSION_ID)
        local effective_session_id="${session_id:-${SESSION_ID:-}}"
        if [[ -n "$effective_session_id" ]] && type update_session_state &>/dev/null; then
            update_session_state "$effective_session_id" "context.compact_count" "$CONTEXT_COMPACT_COUNT" || true
            update_session_state "$effective_session_id" "context.last_compact_at" "$(date -Iseconds)" || true
        fi

        # Generate continuation prompt with smart reconstruction
        if [[ "$CONTEXT_SMART_RECONSTRUCTION" == "true" ]]; then
            local continuation_prompt
            if type generate_continuation_prompt &>/dev/null; then
                continuation_prompt=$(generate_continuation_prompt)
                if [[ -n "$continuation_prompt" ]]; then
                    # Store for next iteration
                    CONTEXT_CONTINUATION_PROMPT="$continuation_prompt"
                    print_verbose "Context reconstruction prompt prepared"
                fi
            fi
        fi

        return 0
    else
        print_error "${MSG_CONTEXT_COMPACT_FAILED:-Auto-compact failed}"
        log_session "$session_id" "ERROR" "Auto-compact failed: $compact_output"
        return 1
    fi
}

# =============================================================================
# Context Status
# =============================================================================

get_context_status() {
    local has_continuation_prompt="false"
    [[ -n "$CONTEXT_CONTINUATION_PROMPT" ]] && has_continuation_prompt="true"

    cat <<EOF
{
    "auto_compact_enabled": $CONTEXT_AUTO_COMPACT,
    "compact_count": $CONTEXT_COMPACT_COUNT,
    "max_compacts": $CONTEXT_MAX_COMPACTS,
    "remaining_compacts": $((CONTEXT_MAX_COMPACTS - CONTEXT_COMPACT_COUNT)),
    "overflow_strategy": "$CONTEXT_OVERFLOW_STRATEGY",
    "preventive_threshold": $CONTEXT_PREVENTIVE_THRESHOLD,
    "smart_reconstruction": $CONTEXT_SMART_RECONSTRUCTION,
    "continuation_count": $CONTEXT_CONTINUATION_COUNT,
    "max_continuation_sessions": $CONTEXT_MAX_CONTINUATION_SESSIONS,
    "has_continuation_prompt": $has_continuation_prompt
}
EOF
}

# =============================================================================
# Reset Context Manager
# =============================================================================

reset_context_manager() {
    CONTEXT_COMPACT_COUNT=0
    CONTEXT_CONTINUATION_COUNT=0
    CONTEXT_CONTINUATION_PROMPT=""
    print_verbose "Context manager reset"
}

# =============================================================================
# Overflow Strategy Handling
# =============================================================================

handle_max_compacts_reached() {
    local session_id="$1"

    log_session "$session_id" "INFO" "Handling max compacts with strategy: $CONTEXT_OVERFLOW_STRATEGY"

    case "$CONTEXT_OVERFLOW_STRATEGY" in
        "new_session")
            # Check if we've hit max continuation sessions
            if [[ $CONTEXT_CONTINUATION_COUNT -ge $CONTEXT_MAX_CONTINUATION_SESSIONS ]]; then
                log_session "$session_id" "ERROR" "Maximum continuation sessions reached ($CONTEXT_MAX_CONTINUATION_SESSIONS)"
                print_error "${MSG_CONTEXT_MAX_CONTINUATIONS:-Maximum continuation sessions reached}"
                return 2
            fi

            print_info "${MSG_CONTEXT_NEW_SESSION:-Creating continuation session}..."

            # Save sprint progress before handoff (with error handling)
            if type save_sprint_progress &>/dev/null; then
                if ! save_sprint_progress "$session_id"; then
                    print_warning "Failed to save sprint progress before session handoff"
                fi
            else
                print_verbose "sprint-progress module not loaded"
            fi

            # Update context reset count in sprint progress
            if type update_sprint_progress &>/dev/null; then
                update_sprint_progress "context_reset" || print_verbose "Failed to update context reset count"
            fi

            # Create final checkpoint
            if type create_checkpoint &>/dev/null; then
                create_checkpoint "$session_id" "session-handoff" || print_warning "Failed to create handoff checkpoint"
            fi

            # Create continuation session
            local new_session_id
            new_session_id=$(create_continuation_session "$session_id")

            if [[ -n "$new_session_id" ]]; then
                CONTEXT_CONTINUATION_COUNT=$((CONTEXT_CONTINUATION_COUNT + 1))
                print_success "${MSG_CONTEXT_CONTINUATION_CREATED:-Continuation session created}: $new_session_id"
                log_session "$session_id" "INFO" "Created continuation session: $new_session_id"
                echo "$new_session_id"
                return 0
            else
                print_error "Failed to create continuation session"
                return 1
            fi
            ;;

        "extend")
            # Extend max compacts by 2
            local old_max=$CONTEXT_MAX_COMPACTS
            CONTEXT_MAX_COMPACTS=$((CONTEXT_MAX_COMPACTS + 2))
            print_warning "${MSG_CONTEXT_EXTEND:-Extended max compacts}: $old_max -> $CONTEXT_MAX_COMPACTS"
            log_session "$session_id" "WARN" "Extended max_compacts from $old_max to $CONTEXT_MAX_COMPACTS"
            return 0
            ;;

        "fail")
            # Original behavior - just fail
            print_error "${MSG_CONTEXT_OVERFLOW_FAIL:-Context limit exceeded, stopping}"
            return 2
            ;;

        *)
            print_error "Unknown overflow strategy: $CONTEXT_OVERFLOW_STRATEGY"
            return 2
            ;;
    esac
}

create_continuation_session() {
    local previous_session="$1"

    # Generate new session ID with portable random suffix generation
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local random_suffix

    # Use utils function if available, otherwise fallback
    if type generate_random_suffix &>/dev/null; then
        random_suffix=$(generate_random_suffix 4)
    elif command -v xxd &>/dev/null; then
        random_suffix=$(head -c 4 /dev/urandom | xxd -p)
    elif command -v od &>/dev/null; then
        random_suffix=$(head -c 4 /dev/urandom | od -An -tx1 | tr -d ' \n')
    else
        # Fallback: use $RANDOM (less entropy but portable)
        random_suffix=$(printf '%04x%04x' $RANDOM $RANDOM | head -c 8)
    fi

    local new_session_id="ralph-cont-${timestamp}-${random_suffix}"

    # Create session directory if create_session is available
    if type create_session &>/dev/null; then
        if ! create_session "$new_session_id" 2>/dev/null; then
            print_warning "Failed to create session directory for $new_session_id"
        fi
    fi

    # Link sessions in state files (with error handling)
    if type update_session_state &>/dev/null; then
        update_session_state "$new_session_id" "previous_session" "$previous_session" || true
        update_session_state "$previous_session" "next_session" "$new_session_id" || true
    fi

    # Link to sprint progress
    if type link_session_to_progress &>/dev/null; then
        link_session_to_progress "$new_session_id" || print_verbose "Failed to link session to progress"
    fi

    # Reset context manager for new session
    CONTEXT_COMPACT_COUNT=0
    CONTEXT_CONTINUATION_COUNT=$((CONTEXT_CONTINUATION_COUNT))  # Keep continuation count

    echo "$new_session_id"
}

# =============================================================================
# Preventive Compaction
# =============================================================================

check_preventive_compact() {
    local session_id="$1"

    # Skip if preventive threshold is 0 or 100 (disabled)
    if [[ "$CONTEXT_PREVENTIVE_THRESHOLD" -le 0 || "$CONTEXT_PREVENTIVE_THRESHOLD" -ge 100 ]]; then
        return 1
    fi

    # Try to get context usage from Claude CLI
    # Note: This is a best-effort check, Claude may not always report usage
    local context_info
    if command -v timeout &> /dev/null; then
        context_info=$(timeout 10s $CLAUDE_COMMAND -p "/context" 2>/dev/null | head -5)
    else
        context_info=$($CLAUDE_COMMAND -p "/context" 2>/dev/null | head -5)
    fi

    # Try to extract percentage from output
    local usage
    usage=$(echo "$context_info" | grep -oP '\d+(?=%)' | head -1)

    if [[ -n "$usage" && "$usage" -ge "$CONTEXT_PREVENTIVE_THRESHOLD" ]]; then
        print_warning "${MSG_CONTEXT_PREVENTIVE:-Context at ${usage}% - running preventive compact}"
        log_session "$session_id" "INFO" "Preventive compact triggered at ${usage}%"

        # Save progress before preventive compact
        if type save_sprint_progress &>/dev/null; then
            save_sprint_progress "$session_id"
        fi

        run_auto_compact "$session_id"
        return $?
    fi

    return 1  # No preventive compact needed
}

# =============================================================================
# Context Continuation Prompt
# =============================================================================

get_context_continuation_prompt() {
    # Return the stored continuation prompt if available
    if [[ -n "$CONTEXT_CONTINUATION_PROMPT" ]]; then
        echo "$CONTEXT_CONTINUATION_PROMPT"
        # Clear after use
        CONTEXT_CONTINUATION_PROMPT=""
        return 0
    fi

    # Generate fresh if smart reconstruction is enabled
    if [[ "$CONTEXT_SMART_RECONSTRUCTION" == "true" ]]; then
        if type generate_continuation_prompt &>/dev/null; then
            generate_continuation_prompt
            return 0
        fi
    fi

    return 1
}

get_session_handoff_prompt() {
    local previous_session="$1"

    if type generate_session_handoff_prompt &>/dev/null; then
        generate_session_handoff_prompt "$previous_session"
        return 0
    fi

    # Fallback simple prompt
    cat << EOF
# Session Continuation

This session continues the work from session $previous_session.
Please read .ralph/sprint-progress.md for the full context.

Continue the implementation.
EOF
}
