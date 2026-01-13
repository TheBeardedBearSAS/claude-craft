#!/bin/bash
# =============================================================================
# Ralph Wiggum - Context Manager Module
# Automatic context limit handling and auto-compaction
# =============================================================================

# Configuration defaults
CONTEXT_AUTO_COMPACT="${CONTEXT_AUTO_COMPACT:-true}"
CONTEXT_MAX_COMPACTS="${CONTEXT_MAX_COMPACTS:-3}"

# Context state
CONTEXT_COMPACT_COUNT=0

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

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local auto_compact=$(yq e '.context.auto_compact // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$auto_compact" ]] && CONTEXT_AUTO_COMPACT=$auto_compact

        local max_compacts=$(yq e '.context.max_compacts // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$max_compacts" ]] && CONTEXT_MAX_COMPACTS=$max_compacts
    fi

    print_verbose "Context manager initialized:"
    print_verbose "  - Auto-compact: $CONTEXT_AUTO_COMPACT"
    print_verbose "  - Max compacts: $CONTEXT_MAX_COMPACTS"
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

    # Check if we've exceeded max compacts
    if [[ $CONTEXT_COMPACT_COUNT -ge $CONTEXT_MAX_COMPACTS ]]; then
        log_session "$session_id" "ERROR" "Maximum compacts reached ($CONTEXT_MAX_COMPACTS)"
        print_error "${MSG_CONTEXT_MAX_REACHED:-Maximum compacts reached} ($CONTEXT_MAX_COMPACTS)"
        return 2
    fi

    # Increment compact counter
    CONTEXT_COMPACT_COUNT=$((CONTEXT_COMPACT_COUNT + 1))

    print_info "${MSG_CONTEXT_COMPACTING:-Running auto-compact}... (#$CONTEXT_COMPACT_COUNT/$CONTEXT_MAX_COMPACTS)"
    log_session "$session_id" "INFO" "Running auto-compact #$CONTEXT_COMPACT_COUNT"

    # Create checkpoint before compact (safety)
    if type create_checkpoint &>/dev/null; then
        create_checkpoint "$session_id" "pre-compact-$CONTEXT_COMPACT_COUNT"
    fi

    # Execute /compact via Claude CLI
    local compact_output
    local compact_status

    if command -v timeout &> /dev/null; then
        compact_output=$(timeout 60s $CLAUDE_COMMAND --continue -p "/compact" 2>&1)
        compact_status=$?
    else
        compact_output=$($CLAUDE_COMMAND --continue -p "/compact" 2>&1)
        compact_status=$?
    fi

    if [[ $compact_status -eq 0 ]]; then
        print_success "${MSG_CONTEXT_COMPACTED:-Context compacted successfully}"
        log_session "$session_id" "INFO" "Auto-compact successful"

        # Update session state
        if [[ -n "$SESSION_ID" ]]; then
            update_session_state "$SESSION_ID" "context.compact_count" "$CONTEXT_COMPACT_COUNT"
            update_session_state "$SESSION_ID" "context.last_compact_at" "$(date -Iseconds)"
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
    cat <<EOF
{
    "auto_compact_enabled": $CONTEXT_AUTO_COMPACT,
    "compact_count": $CONTEXT_COMPACT_COUNT,
    "max_compacts": $CONTEXT_MAX_COMPACTS,
    "remaining_compacts": $((CONTEXT_MAX_COMPACTS - CONTEXT_COMPACT_COUNT))
}
EOF
}

# =============================================================================
# Reset Context Manager
# =============================================================================

reset_context_manager() {
    CONTEXT_COMPACT_COUNT=0
    print_verbose "Context manager reset"
}
