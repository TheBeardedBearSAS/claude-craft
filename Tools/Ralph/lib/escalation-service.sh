#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Escalation Service Module
# Manages escalation queue, notifications, and human decision points
# =============================================================================

# Escalation service state
ESCALATION_ENABLED="${ESCALATION_ENABLED:-true}"
ESCALATION_TIMEOUT_HOURS="${ESCALATION_TIMEOUT_HOURS:-4}"
ESCALATION_DEFAULT_ACTION="${ESCALATION_DEFAULT_ACTION:-skip}"
ESCALATION_CRITICAL_ACTION="${ESCALATION_CRITICAL_ACTION:-pause}"
ESCALATION_WEBHOOK_URL=""
ESCALATION_WEBHOOK_TYPE=""  # slack, teams, discord, generic
ESCALATION_NOTIFY_ON_CREATE="${ESCALATION_NOTIFY_ON_CREATE:-true}"

# Escalation directories
ESCALATION_BASE_DIR=""
ESCALATION_QUEUE_DIR=""
ESCALATION_RESOLVED_DIR=""
ESCALATION_AUDIT_FILE=""

# Escalation priorities
declare -A ESCALATION_PRIORITIES=(
    ["critical"]=1
    ["high"]=2
    ["medium"]=3
    ["low"]=4
)

# =============================================================================
# Initialization
# =============================================================================

init_escalation_service() {
    # Set up directories
    ESCALATION_BASE_DIR="${RALPH_SESSION_BASE:-.ralph}/escalations"
    ESCALATION_QUEUE_DIR="$ESCALATION_BASE_DIR/queue"
    ESCALATION_RESOLVED_DIR="$ESCALATION_BASE_DIR/resolved"
    ESCALATION_AUDIT_FILE="$ESCALATION_BASE_DIR/audit.jsonl"

    mkdir -p "$ESCALATION_QUEUE_DIR"
    mkdir -p "$ESCALATION_RESOLVED_DIR"

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.escalation.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        ESCALATION_ENABLED="$enabled"

        local timeout
        timeout=$(yq e '.escalation.timeout_hours // "4"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$timeout" =~ ^[0-9]+$ ]]; then
            ESCALATION_TIMEOUT_HOURS=$timeout
        fi

        local default_action
        default_action=$(yq e '.escalation.default_action // "skip"' "$CONFIG_FILE" 2>/dev/null)
        ESCALATION_DEFAULT_ACTION="$default_action"

        local critical_action
        critical_action=$(yq e '.escalation.critical_action // "pause"' "$CONFIG_FILE" 2>/dev/null)
        ESCALATION_CRITICAL_ACTION="$critical_action"

        local webhook
        webhook=$(yq e '.escalation.webhook.url // ""' "$CONFIG_FILE" 2>/dev/null)
        ESCALATION_WEBHOOK_URL="$webhook"

        local webhook_type
        webhook_type=$(yq e '.escalation.webhook.type // "generic"' "$CONFIG_FILE" 2>/dev/null)
        ESCALATION_WEBHOOK_TYPE="$webhook_type"

        local notify
        notify=$(yq e '.escalation.notify_on_create // "true"' "$CONFIG_FILE" 2>/dev/null)
        ESCALATION_NOTIFY_ON_CREATE="$notify"
    fi

    print_verbose "Escalation service initialized:"
    print_verbose "  - Enabled: $ESCALATION_ENABLED"
    print_verbose "  - Timeout: ${ESCALATION_TIMEOUT_HOURS}h"
    print_verbose "  - Default action: $ESCALATION_DEFAULT_ACTION"
    print_verbose "  - Critical action: $ESCALATION_CRITICAL_ACTION"
    print_verbose "  - Webhook: ${ESCALATION_WEBHOOK_URL:-none}"
}

# =============================================================================
# Escalation Creation
# =============================================================================

create_escalation() {
    local session_id="$1"
    local level="$2"          # blocked, critical, decision_needed
    local error_type="$3"
    local details="$4"
    local story_id="${5:-}"
    local options="${6:-}"    # JSON array of options for decision

    if [[ "$ESCALATION_ENABLED" != "true" ]]; then
        print_verbose "Escalation service disabled"
        return 1
    fi

    # Generate escalation ID
    local escalation_id
    escalation_id="ESC-$(date +%s)-$$"

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local timeout_at
    timeout_at=$(date -u -d "+${ESCALATION_TIMEOUT_HOURS} hours" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || \
                 date -u -v+${ESCALATION_TIMEOUT_HOURS}H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || \
                 echo "")

    # Determine priority
    local priority="medium"
    case "$level" in
        blocked) priority="high" ;;
        critical) priority="critical" ;;
        decision_needed) priority="medium" ;;
    esac

    # Create escalation file
    local escalation_file="$ESCALATION_QUEUE_DIR/${escalation_id}.yaml"
    cat > "$escalation_file" << EOF
id: "$escalation_id"
session_id: "$session_id"
story_id: "$story_id"
level: "$level"
priority: "$priority"
error_type: "$error_type"
status: "pending"
created_at: "$timestamp"
timeout_at: "$timeout_at"
timeout_hours: $ESCALATION_TIMEOUT_HOURS
default_action: "$ESCALATION_DEFAULT_ACTION"
details: |
$(echo "$details" | sed 's/^/  /')
options: $options
resolution:
  action: ""
  by: ""
  at: ""
  notes: ""
EOF

    print_warning "Escalation created: $escalation_id ($level - $error_type)"

    # Log to audit trail
    log_escalation_event "$escalation_id" "created" "$level" "$error_type"

    # Send notification if enabled
    if [[ "$ESCALATION_NOTIFY_ON_CREATE" == "true" ]]; then
        send_escalation_notification "$escalation_id" "created"
    fi

    # Return escalation ID
    echo "$escalation_id"
}

# =============================================================================
# Escalation Queue Management
# =============================================================================

list_escalations() {
    local status_filter="${1:-pending}"

    local dir="$ESCALATION_QUEUE_DIR"
    [[ "$status_filter" == "resolved" ]] && dir="$ESCALATION_RESOLVED_DIR"

    echo ""
    echo "════════════════════════════════════════"
    echo "    Escalation Queue ($status_filter)"
    echo "════════════════════════════════════════"
    echo ""

    local count=0
    for file in "$dir"/*.yaml 2>/dev/null; do
        [[ ! -f "$file" ]] && continue

        if command -v yq &>/dev/null; then
            local id level error_type created priority
            id=$(yq e '.id' "$file")
            level=$(yq e '.level' "$file")
            error_type=$(yq e '.error_type' "$file")
            created=$(yq e '.created_at' "$file")
            priority=$(yq e '.priority' "$file")

            printf "[%s] %s: %s - %s (%s)\n" "$priority" "$id" "$level" "$error_type" "$created"
            ((count++))
        fi
    done

    if [[ $count -eq 0 ]]; then
        echo "No $status_filter escalations"
    else
        echo ""
        echo "Total: $count"
    fi
}

get_escalation() {
    local escalation_id="$1"

    local file="$ESCALATION_QUEUE_DIR/${escalation_id}.yaml"
    [[ ! -f "$file" ]] && file="$ESCALATION_RESOLVED_DIR/${escalation_id}.yaml"

    if [[ -f "$file" ]]; then
        cat "$file"
    else
        echo "Escalation not found: $escalation_id" >&2
        return 1
    fi
}

# =============================================================================
# Escalation Resolution
# =============================================================================

resolve_escalation() {
    local escalation_id="$1"
    local action="$2"       # proceed, skip, retry, abort
    local resolved_by="${3:-human}"
    local notes="${4:-}"

    local file="$ESCALATION_QUEUE_DIR/${escalation_id}.yaml"

    if [[ ! -f "$file" ]]; then
        print_error "Escalation not found: $escalation_id"
        return 1
    fi

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Update resolution
    if command -v yq &>/dev/null; then
        yq -i ".status = \"resolved\"" "$file"
        yq -i ".resolution.action = \"$action\"" "$file"
        yq -i ".resolution.by = \"$resolved_by\"" "$file"
        yq -i ".resolution.at = \"$timestamp\"" "$file"
        yq -i ".resolution.notes = \"$notes\"" "$file"
    fi

    # Move to resolved
    mv "$file" "$ESCALATION_RESOLVED_DIR/"

    print_success "Escalation resolved: $escalation_id ($action)"

    # Log to audit trail
    log_escalation_event "$escalation_id" "resolved" "$action" "$resolved_by"

    # Notify resolution
    send_escalation_notification "$escalation_id" "resolved"
}

# =============================================================================
# Timeout Handling
# =============================================================================

check_escalation_timeouts() {
    local current_time
    current_time=$(date +%s)

    for file in "$ESCALATION_QUEUE_DIR"/*.yaml 2>/dev/null; do
        [[ ! -f "$file" ]] && continue

        if command -v yq &>/dev/null; then
            local id timeout_at level
            id=$(yq e '.id' "$file")
            timeout_at=$(yq e '.timeout_at' "$file")
            level=$(yq e '.level' "$file")

            # Parse timeout timestamp
            local timeout_epoch
            timeout_epoch=$(date -d "$timeout_at" +%s 2>/dev/null || \
                           date -jf "%Y-%m-%dT%H:%M:%SZ" "$timeout_at" +%s 2>/dev/null || \
                           echo "0")

            if [[ $current_time -ge $timeout_epoch && $timeout_epoch -gt 0 ]]; then
                print_warning "Escalation $id timed out"

                # Determine action based on level
                local action="$ESCALATION_DEFAULT_ACTION"
                [[ "$level" == "critical" ]] && action="$ESCALATION_CRITICAL_ACTION"

                # Auto-resolve with timeout action
                resolve_escalation "$id" "$action" "timeout" "Auto-resolved due to timeout"
            fi
        fi
    done
}

get_pending_count() {
    local count=0
    for file in "$ESCALATION_QUEUE_DIR"/*.yaml 2>/dev/null; do
        [[ -f "$file" ]] && ((count++))
    done
    echo "$count"
}

has_critical_pending() {
    for file in "$ESCALATION_QUEUE_DIR"/*.yaml 2>/dev/null; do
        [[ ! -f "$file" ]] && continue

        if command -v yq &>/dev/null; then
            local priority
            priority=$(yq e '.priority' "$file")
            [[ "$priority" == "critical" ]] && return 0
        fi
    done
    return 1
}

# =============================================================================
# Wait for Resolution
# =============================================================================

wait_for_resolution() {
    local escalation_id="$1"
    local max_wait_seconds="${2:-0}"  # 0 = wait until timeout

    local file="$ESCALATION_QUEUE_DIR/${escalation_id}.yaml"
    local start_time
    start_time=$(date +%s)

    print_info "Waiting for escalation resolution: $escalation_id"

    while [[ -f "$file" ]]; do
        # Check for timeout
        if command -v yq &>/dev/null; then
            local status
            status=$(yq e '.status' "$file")
            [[ "$status" == "resolved" ]] && break
        fi

        # Check max wait
        if [[ $max_wait_seconds -gt 0 ]]; then
            local elapsed=$(($(date +%s) - start_time))
            if [[ $elapsed -ge $max_wait_seconds ]]; then
                print_warning "Wait timeout reached"
                return 1
            fi
        fi

        # Check escalation timeout
        check_escalation_timeouts

        # Wait before next check
        sleep 30
    done

    # Get resolution action
    file="$ESCALATION_RESOLVED_DIR/${escalation_id}.yaml"
    if [[ -f "$file" ]] && command -v yq &>/dev/null; then
        local action
        action=$(yq e '.resolution.action' "$file")
        echo "$action"
        return 0
    fi

    return 1
}

# =============================================================================
# Notification System
# =============================================================================

send_escalation_notification() {
    local escalation_id="$1"
    local event_type="$2"  # created, resolved

    [[ -z "$ESCALATION_WEBHOOK_URL" ]] && return 0

    local file="$ESCALATION_QUEUE_DIR/${escalation_id}.yaml"
    [[ ! -f "$file" ]] && file="$ESCALATION_RESOLVED_DIR/${escalation_id}.yaml"
    [[ ! -f "$file" ]] && return 1

    if ! command -v yq &>/dev/null; then
        return 1
    fi

    local level error_type details session_id
    level=$(yq e '.level' "$file")
    error_type=$(yq e '.error_type' "$file")
    details=$(yq e '.details' "$file")
    session_id=$(yq e '.session_id' "$file")

    # Build message based on webhook type
    local payload=""

    case "$ESCALATION_WEBHOOK_TYPE" in
        slack)
            payload=$(build_slack_payload "$escalation_id" "$event_type" "$level" "$error_type" "$details" "$session_id")
            ;;
        teams)
            payload=$(build_teams_payload "$escalation_id" "$event_type" "$level" "$error_type" "$details" "$session_id")
            ;;
        discord)
            payload=$(build_discord_payload "$escalation_id" "$event_type" "$level" "$error_type" "$details" "$session_id")
            ;;
        *)
            payload=$(build_generic_payload "$escalation_id" "$event_type" "$level" "$error_type" "$details" "$session_id")
            ;;
    esac

    # Send notification
    if command -v curl &>/dev/null; then
        curl -s -X POST -H "Content-Type: application/json" --data "$payload" "$ESCALATION_WEBHOOK_URL" &>/dev/null &
        print_verbose "Notification sent for $escalation_id"
    fi
}

build_slack_payload() {
    local id="$1" event="$2" level="$3" error="$4" details="$5" session="$6"

    local color="#ff0000"
    [[ "$event" == "resolved" ]] && color="#00ff00"
    [[ "$level" == "medium" ]] && color="#ffaa00"

    local title="Ralph Escalation: $event"
    local truncated_details
    truncated_details=$(echo "$details" | head -c 500 | tr '\n' ' ')

    jq -n \
        --arg color "$color" \
        --arg title "$title" \
        --arg id "$id" \
        --arg level "$level" \
        --arg error "$error" \
        --arg session "$session" \
        --arg text "$truncated_details" \
        '{attachments: [{color: $color, title: $title, fields: [{title: "ID", value: $id, short: true}, {title: "Level", value: $level, short: true}, {title: "Error Type", value: $error, short: true}, {title: "Session", value: $session, short: true}], text: $text}]}'
}

build_teams_payload() {
    local id="$1" event="$2" level="$3" error="$4" details="$5" session="$6"

    local color="attention"
    [[ "$event" == "resolved" ]] && color="good"

    local truncated_details
    truncated_details=$(echo "$details" | head -c 500 | tr '\n' ' ')

    jq -n \
        --arg type "MessageCard" \
        --arg color "$color" \
        --arg title "Ralph Escalation: $event" \
        --arg id "$id" \
        --arg level "$level" \
        --arg error "$error" \
        --arg session "$session" \
        --arg text "$truncated_details" \
        '{"@type": $type, themeColor: $color, title: $title, sections: [{facts: [{name: "ID", value: $id}, {name: "Level", value: $level}, {name: "Error Type", value: $error}, {name: "Session", value: $session}], text: $text}]}'
}

build_discord_payload() {
    local id="$1" event="$2" level="$3" error="$4" details="$5" session="$6"

    local color=16711680  # Red
    [[ "$event" == "resolved" ]] && color=65280  # Green

    local truncated_details
    truncated_details=$(echo "$details" | head -c 500 | tr '\n' ' ')

    jq -n \
        --arg title "Ralph Escalation: $event" \
        --argjson color "$color" \
        --arg id "$id" \
        --arg level "$level" \
        --arg error "$error" \
        --arg session "$session" \
        --arg desc "$truncated_details" \
        '{embeds: [{title: $title, color: $color, fields: [{name: "ID", value: $id, inline: true}, {name: "Level", value: $level, inline: true}, {name: "Error", value: $error, inline: true}, {name: "Session", value: $session, inline: true}], description: $desc}]}'
}

build_generic_payload() {
    local id="$1" event="$2" level="$3" error="$4" details="$5" session="$6"

    local truncated_details
    truncated_details=$(echo "$details" | head -c 500 | tr '\n' ' ')

    jq -n \
        --arg event "$event" \
        --arg id "$id" \
        --arg level "$level" \
        --arg error "$error" \
        --arg session "$session" \
        --arg details "$truncated_details" \
        '{event: $event, escalation: {id: $id, level: $level, error_type: $error, session_id: $session, details: $details}}'
}

# =============================================================================
# Audit Trail
# =============================================================================

log_escalation_event() {
    local escalation_id="$1"
    local event_type="$2"
    local data1="$3"
    local data2="$4"

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    jq -n --arg ts "$timestamp" --arg eid "$escalation_id" --arg evt "$event_type" --arg d1 "$data1" --arg d2 "$data2" \
        '{timestamp: $ts, escalation_id: $eid, event: $evt, data1: $d1, data2: $d2}' >> "$ESCALATION_AUDIT_FILE"
}

get_escalation_stats() {
    if [[ ! -f "$ESCALATION_AUDIT_FILE" ]]; then
        echo '{"total":0,"created":0,"resolved":0}'
        return
    fi

    if command -v jq &>/dev/null; then
        jq -s '
            {
                total: length,
                created: [.[] | select(.event == "created")] | length,
                resolved: [.[] | select(.event == "resolved")] | length,
                by_level: [.[] | select(.event == "created")] | group_by(.data1) | map({(.[0].data1): length}) | add
            }
        ' "$ESCALATION_AUDIT_FILE" 2>/dev/null || echo '{"total":0}'
    else
        local total
        total=$(wc -l < "$ESCALATION_AUDIT_FILE" 2>/dev/null || echo "0")
        echo "{\"total\":$total}"
    fi
}

# =============================================================================
# Interactive Resolution (for terminal use)
# =============================================================================

interactive_resolve() {
    local escalation_id="$1"

    local file="$ESCALATION_QUEUE_DIR/${escalation_id}.yaml"

    if [[ ! -f "$file" ]]; then
        print_error "Escalation not found: $escalation_id"
        return 1
    fi

    echo ""
    echo "════════════════════════════════════════"
    echo "    Escalation: $escalation_id"
    echo "════════════════════════════════════════"
    echo ""

    if command -v yq &>/dev/null; then
        local level error_type details options
        level=$(yq e '.level' "$file")
        error_type=$(yq e '.error_type' "$file")
        details=$(yq e '.details' "$file")
        options=$(yq e '.options // "[]"' "$file")

        echo "Level: $level"
        echo "Error: $error_type"
        echo ""
        echo "Details:"
        echo "$details"
        echo ""

        # Show options if available
        if [[ "$options" != "[]" && "$options" != "null" ]]; then
            echo "Custom options available"
        fi
    fi

    echo "Actions:"
    echo "  1) proceed  - Continue with the task"
    echo "  2) skip     - Skip this item and continue"
    echo "  3) retry    - Retry the failed operation"
    echo "  4) abort    - Stop the sprint"
    echo ""

    read -rp "Select action (1-4): " choice

    local action=""
    case "$choice" in
        1) action="proceed" ;;
        2) action="skip" ;;
        3) action="retry" ;;
        4) action="abort" ;;
        *) print_error "Invalid choice"; return 1 ;;
    esac

    read -rp "Notes (optional): " notes

    resolve_escalation "$escalation_id" "$action" "human" "$notes"
}

# =============================================================================
# Export for use by other modules
# =============================================================================

export ESCALATION_ENABLED
export ESCALATION_TIMEOUT_HOURS
export ESCALATION_DEFAULT_ACTION
export ESCALATION_CRITICAL_ACTION
