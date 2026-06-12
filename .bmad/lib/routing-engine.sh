#!/bin/bash
# BMAD v6 - Routing Engine
# Manages story state transitions based on rules

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BMAD_DIR="$(dirname "$SCRIPT_DIR")"
SPRINT_STATUS_FILE="${BMAD_DIR}/sprint-status.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Valid states in order
VALID_STATES=("backlog" "ready-for-dev" "in-progress" "review" "done" "blocked")

# State transitions matrix (from -> allowed to states)
declare -A TRANSITIONS
TRANSITIONS["backlog"]="ready-for-dev blocked"
TRANSITIONS["ready-for-dev"]="in-progress blocked"
TRANSITIONS["in-progress"]="review blocked"
TRANSITIONS["review"]="done in-progress blocked"
TRANSITIONS["done"]=""
TRANSITIONS["blocked"]="backlog ready-for-dev in-progress review"

# Autonomous mode settings
ROUTING_AUTONOMOUS_MODE="${ROUTING_AUTONOMOUS_MODE:-false}"
ROUTING_AUTO_TRANSITION_ENABLED="${ROUTING_AUTO_TRANSITION_ENABLED:-false}"
ROUTING_AUTO_CLAIM_ENABLED="${ROUTING_AUTO_CLAIM_ENABLED:-false}"

# ============================================
# Helper Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if sprint-status.yaml exists
check_sprint_status() {
    if [[ ! -f "$SPRINT_STATUS_FILE" ]]; then
        log_error "sprint-status.yaml not found at $SPRINT_STATUS_FILE"
        log_info "Run '/project:migrate-backlog' to create it"
        exit 1
    fi
}

# Get current status of a story using yq or grep fallback
get_story_status() {
    local story_id="$1"

    if command -v yq &> /dev/null; then
        yq ".stories.${story_id}.status // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null || echo ""
    else
        # Fallback: grep-based extraction
        grep -A 5 "^  ${story_id}:" "$SPRINT_STATUS_FILE" 2>/dev/null | \
            grep "status:" | head -1 | sed 's/.*status: *"\?\([^"]*\)"\?.*/\1/' || echo ""
    fi
}

# Check if transition is valid
is_valid_transition() {
    local from_state="$1"
    local to_state="$2"

    local allowed="${TRANSITIONS[$from_state]:-}"
    [[ " $allowed " =~ " $to_state " ]]
}

# Get gate requirements for a state
get_gate_requirements() {
    local state="$1"

    if command -v yq &> /dev/null; then
        yq ".gates.${state}.checks[]" "$SPRINT_STATUS_FILE" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# ============================================
# Main Commands
# ============================================

# Get status of all stories
cmd_status() {
    check_sprint_status

    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}       BMAD Sprint Status${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"

    if command -v yq &> /dev/null; then
        # Sprint metadata
        local sprint_id=$(yq '.metadata.sprint_id // "N/A"' "$SPRINT_STATUS_FILE")
        local sprint_name=$(yq '.metadata.name // "N/A"' "$SPRINT_STATUS_FILE")
        local start_date=$(yq '.metadata.start_date // "N/A"' "$SPRINT_STATUS_FILE")
        local end_date=$(yq '.metadata.end_date // "N/A"' "$SPRINT_STATUS_FILE")

        echo ""
        echo "Sprint: $sprint_id - $sprint_name"
        echo "Period: $start_date → $end_date"
        echo ""

        # Count stories by status
        echo "Stories by Status:"
        echo "──────────────────"
        for state in "${VALID_STATES[@]}"; do
            local count=$(yq "[.stories[] | select(.status == \"$state\")] | length" "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")
            local emoji=""
            case $state in
                backlog) emoji="📋" ;;
                ready-for-dev) emoji="🎯" ;;
                in-progress) emoji="🔄" ;;
                review) emoji="👀" ;;
                done) emoji="✅" ;;
                blocked) emoji="⛔" ;;
            esac
            printf "%s %-15s: %s\n" "$emoji" "$state" "$count"
        done

        echo ""
        echo "Story Details:"
        echo "──────────────"
        yq '.stories | to_entries[] | "\(.key): \(.value.title) [\(.value.status)]"' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "No stories found"
    else
        log_warning "yq not installed - showing raw status"
        grep -E "^  (US|EPIC|TASK)-" "$SPRINT_STATUS_FILE" | head -20
    fi

    echo ""
}

# Transition a story to a new state
cmd_transition() {
    local story_id="$1"
    local target_state="$2"

    check_sprint_status

    # Validate story exists
    local current_status=$(get_story_status "$story_id")
    if [[ -z "$current_status" ]]; then
        log_error "Story $story_id not found in sprint-status.yaml"
        exit 1
    fi

    # Validate target state
    if [[ ! " ${VALID_STATES[*]} " =~ " ${target_state} " ]]; then
        log_error "Invalid state: $target_state"
        log_info "Valid states: ${VALID_STATES[*]}"
        exit 1
    fi

    # Check if transition is allowed
    if ! is_valid_transition "$current_status" "$target_state"; then
        log_error "Invalid transition: $current_status → $target_state"
        log_info "Allowed transitions from $current_status: ${TRANSITIONS[$current_status]}"
        exit 1
    fi

    # Check gate requirements
    local gates=$(get_gate_requirements "$target_state")
    if [[ -n "$gates" ]]; then
        log_info "Gate requirements for $target_state:"
        echo "$gates" | while read -r gate; do
            echo "  - $gate"
        done
    fi

    # Perform transition
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    if command -v yq &> /dev/null; then
        # Update status
        yq -i ".stories.${story_id}.previous_status = .stories.${story_id}.status" "$SPRINT_STATUS_FILE"
        yq -i ".stories.${story_id}.status = \"$target_state\"" "$SPRINT_STATUS_FILE"

        # Add history entry
        yq -i ".stories.${story_id}.history += [{
            \"timestamp\": \"$timestamp\",
            \"from\": \"$current_status\",
            \"to\": \"$target_state\",
            \"by\": \"routing-engine\",
            \"reason\": \"Manual transition\"
        }]" "$SPRINT_STATUS_FILE"

        log_success "Transitioned $story_id: $current_status → $target_state"
    else
        log_error "yq required for transitions. Install with: brew install yq"
        exit 1
    fi
}

# Get next story ready for development
cmd_next_story() {
    check_sprint_status

    if command -v yq &> /dev/null; then
        local next=$(yq '.stories | to_entries[] | select(.value.status == "ready-for-dev") | .key' "$SPRINT_STATUS_FILE" 2>/dev/null | head -1)

        if [[ -n "$next" ]]; then
            local title=$(yq ".stories.${next}.title" "$SPRINT_STATUS_FILE")
            local points=$(yq ".stories.${next}.story_points // \"?\"" "$SPRINT_STATUS_FILE")

            echo ""
            log_success "Next story ready for development:"
            echo ""
            echo "  📖 $next: $title"
            echo "  📊 Story Points: $points"
            echo ""
            echo "  To start: /sprint:transition $next in-progress"
            echo ""
        else
            log_info "No stories in 'ready-for-dev' status"

            # Check backlog
            local backlog=$(yq '[.stories[] | select(.status == "backlog")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null)
            if [[ "$backlog" -gt 0 ]]; then
                log_info "$backlog stories in backlog need refinement"
            fi
        fi
    else
        log_error "yq required. Install with: brew install yq"
        exit 1
    fi
}

# Auto-route based on rules
cmd_auto_route() {
    check_sprint_status

    log_info "Running auto-routing rules..."

    if ! command -v yq &> /dev/null; then
        log_error "yq required for auto-routing. Install with: brew install yq"
        exit 1
    fi

    local changes=0

    # Get all stories
    local stories=$(yq '.stories | keys | .[]' "$SPRINT_STATUS_FILE" 2>/dev/null)

    for story_id in $stories; do
        local status=$(yq ".stories.${story_id}.status" "$SPRINT_STATUS_FILE")
        local tasks_total=$(yq ".stories.${story_id}.tasks.total // 0" "$SPRINT_STATUS_FILE")
        local tasks_completed=$(yq ".stories.${story_id}.tasks.completed // 0" "$SPRINT_STATUS_FILE")
        local blocked_reason=$(yq ".stories.${story_id}.blocked_reason // \"\"" "$SPRINT_STATUS_FILE")

        # Rule: all_tasks_complete -> review
        if [[ "$status" == "in-progress" && "$tasks_total" -gt 0 && "$tasks_completed" -eq "$tasks_total" ]]; then
            log_info "Auto-transitioning $story_id to review (all tasks complete)"
            cmd_transition "$story_id" "review"
            changes=$((changes + 1))
        fi

        # Rule: blocked_detection
        if [[ "$status" != "blocked" && -n "$blocked_reason" ]]; then
            log_info "Auto-transitioning $story_id to blocked (blocker detected)"
            cmd_transition "$story_id" "blocked"
            changes=$((changes + 1))
        fi

        # Rule: unblocked
        if [[ "$status" == "blocked" && -z "$blocked_reason" ]]; then
            local previous=$(yq ".stories.${story_id}.previous_status // \"backlog\"" "$SPRINT_STATUS_FILE")
            log_info "Auto-transitioning $story_id to $previous (unblocked)"
            cmd_transition "$story_id" "$previous"
            changes=$((changes + 1))
        fi
    done

    if [[ "$changes" -eq 0 ]]; then
        log_info "No automatic transitions needed"
    else
        log_success "$changes stories transitioned"
    fi
}

# ============================================
# Autonomous Mode Functions
# ============================================

# Enable autonomous routing mode
cmd_enable_autonomous() {
    ROUTING_AUTONOMOUS_MODE="true"
    ROUTING_AUTO_TRANSITION_ENABLED="true"
    ROUTING_AUTO_CLAIM_ENABLED="true"

    log_success "Autonomous routing mode enabled"
    log_info "  - Auto-transition: enabled"
    log_info "  - Auto-claim: enabled"
}

# Disable autonomous routing mode
cmd_disable_autonomous() {
    ROUTING_AUTONOMOUS_MODE="false"
    ROUTING_AUTO_TRANSITION_ENABLED="false"
    ROUTING_AUTO_CLAIM_ENABLED="false"

    log_success "Autonomous routing mode disabled"
}

# Auto-claim next available story
cmd_auto_claim() {
    local claimed_by="${1:-autonomous}"

    check_sprint_status

    if ! command -v yq &> /dev/null; then
        log_error "yq required. Install with: brew install yq"
        return 1
    fi

    # Find next unclaimed ready-for-dev story
    local next=$(yq '.stories | to_entries[] | select(.value.status == "ready-for-dev") | select(.value.claimed_by == null or .value.claimed_by == "") | .key' "$SPRINT_STATUS_FILE" 2>/dev/null | head -1)

    if [[ -z "$next" ]]; then
        log_info "No stories available for claiming"
        return 1
    fi

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Claim the story
    yq -i ".stories.${next}.claimed_by = \"$claimed_by\"" "$SPRINT_STATUS_FILE"
    yq -i ".stories.${next}.claimed_at = \"$timestamp\"" "$SPRINT_STATUS_FILE"

    # Auto-transition to in-progress
    if [[ "$ROUTING_AUTO_TRANSITION_ENABLED" == "true" ]]; then
        cmd_transition "$next" "in-progress"
    fi

    local title=$(yq ".stories.${next}.title" "$SPRINT_STATUS_FILE")
    log_success "Claimed story: $next - $title"

    echo "$next"
}

# Auto-transition based on story completion state
cmd_auto_transition_check() {
    local story_id="$1"

    check_sprint_status

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    local status=$(get_story_status "$story_id")

    if [[ "$status" != "in-progress" ]]; then
        return 0  # Only check in-progress stories
    fi

    # Check completion criteria
    local tdd_phase=$(yq ".stories.${story_id}.tdd_phase // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)
    local tests_passing=$(yq ".stories.${story_id}.tests_passing // false" "$SPRINT_STATUS_FILE" 2>/dev/null)
    local tasks_total=$(yq ".stories.${story_id}.tasks.total // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
    local tasks_completed=$(yq ".stories.${story_id}.tasks.completed // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)

    # Criteria for auto-transition to review:
    # 1. TDD phase is "refactor" (blue) or "complete"
    # 2. Tests are passing
    # 3. All tasks completed (if tasks are tracked)

    local should_transition="false"

    if [[ "$tdd_phase" == "refactor" || "$tdd_phase" == "complete" || "$tdd_phase" == "blue" ]]; then
        if [[ "$tests_passing" == "true" ]]; then
            if [[ $tasks_total -eq 0 || $tasks_completed -ge $tasks_total ]]; then
                should_transition="true"
            fi
        fi
    fi

    if [[ "$should_transition" == "true" ]]; then
        log_info "Auto-transitioning $story_id to review (completion criteria met)"
        cmd_transition "$story_id" "review"
        return 0
    fi

    return 1
}

# Update TDD phase for a story
cmd_update_tdd_phase() {
    local story_id="$1"
    local phase="$2"  # red, green, refactor/blue, complete

    check_sprint_status

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    yq -i ".stories.${story_id}.tdd_phase = \"$phase\"" "$SPRINT_STATUS_FILE"
    yq -i ".stories.${story_id}.tdd_updated_at = \"$timestamp\"" "$SPRINT_STATUS_FILE"

    log_info "Updated TDD phase for $story_id: $phase"

    # Check for auto-transition if in autonomous mode
    if [[ "$ROUTING_AUTO_TRANSITION_ENABLED" == "true" ]]; then
        cmd_auto_transition_check "$story_id"
    fi
}

# Mark tests as passing/failing
cmd_update_tests_status() {
    local story_id="$1"
    local passing="${2:-true}"

    check_sprint_status

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    yq -i ".stories.${story_id}.tests_passing = $passing" "$SPRINT_STATUS_FILE"

    if [[ "$passing" == "true" ]]; then
        log_success "Tests passing for $story_id"
    else
        log_warning "Tests failing for $story_id"
    fi

    # Check for auto-transition if in autonomous mode
    if [[ "$ROUTING_AUTO_TRANSITION_ENABLED" == "true" && "$passing" == "true" ]]; then
        cmd_auto_transition_check "$story_id"
    fi
}

# Get next story with auto-claim (for autonomous mode)
cmd_next_story_claim() {
    local claimed_by="${1:-autonomous}"

    check_sprint_status

    if [[ "$ROUTING_AUTO_CLAIM_ENABLED" != "true" ]]; then
        # Just get next, don't claim
        cmd_next_story
        return
    fi

    # Auto-claim and return
    cmd_auto_claim "$claimed_by"
}

# Batch auto-route with autonomous enhancements
cmd_auto_route_autonomous() {
    check_sprint_status

    log_info "Running autonomous auto-routing..."

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    local changes=0

    # Get all stories
    local stories=$(yq '.stories | keys | .[]' "$SPRINT_STATUS_FILE" 2>/dev/null)

    for story_id in $stories; do
        local status=$(yq ".stories.${story_id}.status" "$SPRINT_STATUS_FILE")

        # Standard auto-route rules
        local tasks_total=$(yq ".stories.${story_id}.tasks.total // 0" "$SPRINT_STATUS_FILE")
        local tasks_completed=$(yq ".stories.${story_id}.tasks.completed // 0" "$SPRINT_STATUS_FILE")
        local blocked_reason=$(yq ".stories.${story_id}.blocked_reason // \"\"" "$SPRINT_STATUS_FILE")

        # Rule: all_tasks_complete -> review
        if [[ "$status" == "in-progress" && "$tasks_total" -gt 0 && "$tasks_completed" -eq "$tasks_total" ]]; then
            log_info "Auto-transitioning $story_id to review (all tasks complete)"
            cmd_transition "$story_id" "review"
            changes=$((changes + 1))
            continue
        fi

        # Rule: blocked_detection
        if [[ "$status" != "blocked" && -n "$blocked_reason" ]]; then
            log_info "Auto-transitioning $story_id to blocked (blocker detected)"
            cmd_transition "$story_id" "blocked"
            changes=$((changes + 1))
            continue
        fi

        # Rule: unblocked
        if [[ "$status" == "blocked" && -z "$blocked_reason" ]]; then
            local previous=$(yq ".stories.${story_id}.previous_status // \"backlog\"" "$SPRINT_STATUS_FILE")
            log_info "Auto-transitioning $story_id to $previous (unblocked)"
            cmd_transition "$story_id" "$previous"
            changes=$((changes + 1))
            continue
        fi

        # Autonomous rule: TDD completion check
        if [[ "$status" == "in-progress" ]]; then
            if cmd_auto_transition_check "$story_id"; then
                changes=$((changes + 1))
            fi
        fi
    done

    if [[ "$changes" -eq 0 ]]; then
        log_info "No automatic transitions needed"
    else
        log_success "$changes stories transitioned"
    fi
}

# Show state machine diagram
cmd_diagram() {
    echo ""
    echo "BMAD State Machine"
    echo "══════════════════"
    echo ""
    echo "  ┌─────────┐     ┌──────────────┐     ┌─────────────┐"
    echo "  │ backlog │────▶│ ready-for-dev│────▶│ in-progress │"
    echo "  └────┬────┘     └──────┬───────┘     └──────┬──────┘"
    echo "       │                 │                    │"
    echo "       │                 │                    ▼"
    echo "       │                 │              ┌──────────┐"
    echo "       │                 │              │  review  │"
    echo "       │                 │              └────┬─────┘"
    echo "       │                 │                   │"
    echo "       │                 │                   ▼"
    echo "       │                 │              ┌──────────┐"
    echo "       │                 │              │   done   │"
    echo "       │                 │              └──────────┘"
    echo "       │                 │"
    echo "       ▼                 ▼"
    echo "  ┌─────────────────────────────────────────────────┐"
    echo "  │                    blocked                       │"
    echo "  └─────────────────────────────────────────────────┘"
    echo ""
    echo "Transitions:"
    echo "  backlog → ready-for-dev (gate: ready_for_dev)"
    echo "  ready-for-dev → in-progress (gate: in_progress)"
    echo "  in-progress → review (gate: review)"
    echo "  review → done (gate: done)"
    echo "  review → in-progress (changes requested)"
    echo "  * → blocked (blocker detected)"
    echo "  blocked → previous_status (unblocked)"
    echo ""
}

# ============================================
# Main Entry Point
# ============================================

usage() {
    echo "BMAD v6 Routing Engine"
    echo ""
    echo "Usage: routing-engine.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  status                    Show sprint status"
    echo "  transition <id> <state>   Transition story to new state"
    echo "  next-story               Get next story ready for dev"
    echo "  auto-route               Run automatic routing rules"
    echo "  diagram                  Show state machine diagram"
    echo ""
    echo "Autonomous Mode Commands:"
    echo "  enable-autonomous        Enable autonomous routing mode"
    echo "  disable-autonomous       Disable autonomous routing mode"
    echo "  auto-claim [session]     Auto-claim next available story"
    echo "  next-claim [session]     Get and claim next story"
    echo "  tdd-phase <id> <phase>   Update TDD phase (red/green/refactor)"
    echo "  tests-status <id> <bool> Update tests passing status"
    echo "  auto-route-all           Run autonomous auto-routing"
    echo ""
    echo "Valid states: ${VALID_STATES[*]}"
}

main() {
    local command="${1:-}"
    shift || true

    case "$command" in
        status)
            cmd_status
            ;;
        transition)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: routing-engine.sh transition <story-id> <target-state>"
                exit 1
            fi
            cmd_transition "$1" "$2"
            ;;
        next-story|next)
            cmd_next_story
            ;;
        auto-route|auto)
            cmd_auto_route
            ;;
        diagram)
            cmd_diagram
            ;;
        enable-autonomous)
            cmd_enable_autonomous
            ;;
        disable-autonomous)
            cmd_disable_autonomous
            ;;
        auto-claim)
            cmd_auto_claim "${1:-autonomous}"
            ;;
        next-claim)
            cmd_next_story_claim "${1:-autonomous}"
            ;;
        tdd-phase)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: routing-engine.sh tdd-phase <story-id> <phase>"
                exit 1
            fi
            cmd_update_tdd_phase "$1" "$2"
            ;;
        tests-status)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: routing-engine.sh tests-status <story-id> <true|false>"
                exit 1
            fi
            cmd_update_tests_status "$1" "$2"
            ;;
        auto-route-all)
            cmd_auto_route_autonomous
            ;;
        -h|--help|help|"")
            usage
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

main "$@"
