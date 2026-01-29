#!/bin/bash
# BMAD v6 - Batch Executor
# Manages batch processing of stories and sprints

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BMAD_DIR="$(dirname "$SCRIPT_DIR")"
SPRINT_STATUS_FILE="${BMAD_DIR}/sprint-status.yaml"
BATCH_QUEUE_FILE="${BMAD_DIR}/batch-queue.yaml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# Helper Functions
# ============================================

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# ============================================
# Queue Management
# ============================================

# Initialize batch queue
init_queue() {
    if [[ ! -f "$BATCH_QUEUE_FILE" ]]; then
        cat > "$BATCH_QUEUE_FILE" << 'EOF'
version: "1.0"
queue: []
execution:
  mode: "sequential"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600
checkpoints:
  last_completed: ""
  timestamp: ""
  stories_completed: 0
  stories_failed: 0
  stories_skipped: 0
settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
  notify_on_completion: true
  notify_on_failure: true
EOF
        log_success "Batch queue initialized: $BATCH_QUEUE_FILE"
    fi
}

# Add story to queue
add_to_queue() {
    local story_id="$1"
    local priority="${2:-99}"

    init_queue

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    # Check if already in queue
    local exists=$(yq "[.queue[] | select(.story_id == \"$story_id\")] | length" "$BATCH_QUEUE_FILE")
    if [[ "$exists" -gt 0 ]]; then
        log_warning "$story_id already in queue"
        return 0
    fi

    # Get dependencies from sprint-status
    local deps=$(yq ".stories.${story_id}.blocked_by // []" "$SPRINT_STATUS_FILE" 2>/dev/null || echo "[]")

    yq -i ".queue += [{
        \"story_id\": \"$story_id\",
        \"priority\": $priority,
        \"status\": \"pending\",
        \"dependencies\": $deps,
        \"added_at\": \"$(timestamp)\",
        \"started_at\": \"\",
        \"completed_at\": \"\",
        \"error\": \"\"
    }]" "$BATCH_QUEUE_FILE"

    log_success "Added $story_id to queue with priority $priority"
}

# Show queue status
show_queue() {
    init_queue

    echo ""
    echo "════════════════════════════════════════"
    echo "        BMAD Batch Queue Status"
    echo "════════════════════════════════════════"
    echo ""

    if command -v yq &> /dev/null; then
        local mode=$(yq '.execution.mode' "$BATCH_QUEUE_FILE")
        local total=$(yq '.queue | length' "$BATCH_QUEUE_FILE")
        local pending=$(yq '[.queue[] | select(.status == "pending")] | length' "$BATCH_QUEUE_FILE")
        local running=$(yq '[.queue[] | select(.status == "running")] | length' "$BATCH_QUEUE_FILE")
        local completed=$(yq '[.queue[] | select(.status == "completed")] | length' "$BATCH_QUEUE_FILE")
        local failed=$(yq '[.queue[] | select(.status == "failed")] | length' "$BATCH_QUEUE_FILE")

        echo "Mode: $mode"
        echo "Total in queue: $total"
        echo ""
        echo "Status breakdown:"
        echo "  ⏳ Pending:   $pending"
        echo "  🔄 Running:   $running"
        echo "  ✅ Completed: $completed"
        echo "  ❌ Failed:    $failed"
        echo ""

        if [[ "$total" -gt 0 ]]; then
            echo "Queue:"
            echo "────────────────────────────────────────"
            yq '.queue[] | "[\(.priority)] \(.story_id): \(.status)"' "$BATCH_QUEUE_FILE"
        fi

        # Show checkpoints
        local last=$(yq '.checkpoints.last_completed // "none"' "$BATCH_QUEUE_FILE")
        local checkpoint_time=$(yq '.checkpoints.timestamp // "never"' "$BATCH_QUEUE_FILE")

        echo ""
        echo "Last checkpoint: $last at $checkpoint_time"
    else
        log_warning "yq not installed - showing raw queue"
        cat "$BATCH_QUEUE_FILE"
    fi
}

# ============================================
# Epic Processing
# ============================================

run_epic() {
    local epic_id="$1"
    local dry_run="${2:-false}"

    echo ""
    echo "════════════════════════════════════════"
    echo "     Running Epic: $epic_id"
    echo "════════════════════════════════════════"
    echo ""

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    # Get all stories for this epic
    local stories=$(yq ".stories | to_entries[] | select(.value.epic_id == \"$epic_id\") | .key" "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ -z "$stories" ]]; then
        log_warning "No stories found for epic $epic_id"
        return 0
    fi

    log_info "Stories in $epic_id:"
    local priority=1
    for story_id in $stories; do
        local title=$(yq ".stories.${story_id}.title" "$SPRINT_STATUS_FILE")
        local status=$(yq ".stories.${story_id}.status" "$SPRINT_STATUS_FILE")
        echo "  [$priority] $story_id: $title ($status)"

        if [[ "$dry_run" != "true" ]]; then
            add_to_queue "$story_id" "$priority"
        fi
        ((priority++))
    done

    if [[ "$dry_run" == "true" ]]; then
        log_info "DRY RUN - no changes made"
    else
        log_success "Added ${priority} stories to queue"
        echo ""
        echo "Run '/project:batch-status' to see queue"
        echo "Run '/project:run-queue' to process"
    fi
}

# ============================================
# Queue Processing
# ============================================

process_queue() {
    local parallel="${1:-1}"
    local dry_run="${2:-false}"

    init_queue

    echo ""
    echo "════════════════════════════════════════"
    echo "     Processing Batch Queue"
    echo "════════════════════════════════════════"
    echo ""

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    local mode=$(yq '.execution.mode' "$BATCH_QUEUE_FILE")
    local pending=$(yq '[.queue[] | select(.status == "pending")] | length' "$BATCH_QUEUE_FILE")

    log_info "Mode: $mode"
    log_info "Pending stories: $pending"
    log_info "Parallel limit: $parallel"
    echo ""

    if [[ "$pending" -eq 0 ]]; then
        log_info "Queue is empty"
        return 0
    fi

    # Get pending stories sorted by priority
    local stories=$(yq '.queue | sort_by(.priority) | .[] | select(.status == "pending") | .story_id' "$BATCH_QUEUE_FILE")

    for story_id in $stories; do
        # Check dependencies
        local deps=$(yq ".queue[] | select(.story_id == \"$story_id\") | .dependencies[]" "$BATCH_QUEUE_FILE" 2>/dev/null || true)
        local blocked=false

        for dep in $deps; do
            local dep_status=$(yq ".queue[] | select(.story_id == \"$dep\") | .status" "$BATCH_QUEUE_FILE" 2>/dev/null || echo "")
            if [[ "$dep_status" != "completed" ]]; then
                log_warning "$story_id blocked by $dep ($dep_status)"
                blocked=true
                break
            fi
        done

        if [[ "$blocked" == "true" ]]; then
            continue
        fi

        log_step "Processing: $story_id"

        if [[ "$dry_run" == "true" ]]; then
            log_info "  DRY RUN - would process $story_id"
            continue
        fi

        # Mark as running
        yq -i "(.queue[] | select(.story_id == \"$story_id\")).status = \"running\"" "$BATCH_QUEUE_FILE"
        yq -i "(.queue[] | select(.story_id == \"$story_id\")).started_at = \"$(timestamp)\"" "$BATCH_QUEUE_FILE"

        # Simulate processing (in real use, this would call Claude commands)
        log_info "  Starting story development workflow..."
        log_info "  (In production, this triggers /sprint:dev $story_id)"

        # For demo, mark as completed
        yq -i "(.queue[] | select(.story_id == \"$story_id\")).status = \"completed\"" "$BATCH_QUEUE_FILE"
        yq -i "(.queue[] | select(.story_id == \"$story_id\")).completed_at = \"$(timestamp)\"" "$BATCH_QUEUE_FILE"

        # Update checkpoint
        yq -i ".checkpoints.last_completed = \"$story_id\"" "$BATCH_QUEUE_FILE"
        yq -i ".checkpoints.timestamp = \"$(timestamp)\"" "$BATCH_QUEUE_FILE"
        yq -i ".checkpoints.stories_completed += 1" "$BATCH_QUEUE_FILE"

        log_success "  Completed: $story_id"
        echo ""
    done

    show_queue
}

# ============================================
# Sprint Processing
# ============================================

run_sprint() {
    local auto="${1:-false}"
    local dry_run="${2:-false}"

    echo ""
    echo "════════════════════════════════════════"
    echo "     Running Sprint"
    echo "════════════════════════════════════════"
    echo ""

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    # Get sprint info
    local sprint_id=$(yq '.metadata.sprint_id // "unknown"' "$SPRINT_STATUS_FILE")
    local sprint_name=$(yq '.metadata.name // "unnamed"' "$SPRINT_STATUS_FILE")

    log_info "Sprint: $sprint_id - $sprint_name"
    echo ""

    # Get all ready-for-dev stories
    local stories=$(yq '.stories | to_entries[] | select(.value.status == "ready-for-dev") | .key' "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ -z "$stories" ]]; then
        log_warning "No stories in 'ready-for-dev' status"

        # Check backlog
        local backlog=$(yq '[.stories[] | select(.status == "backlog")] | length' "$SPRINT_STATUS_FILE")
        if [[ "$backlog" -gt 0 ]]; then
            log_info "$backlog stories in backlog - run refinement first"
        fi
        return 0
    fi

    local count=0
    for story_id in $stories; do
        local title=$(yq ".stories.${story_id}.title" "$SPRINT_STATUS_FILE")
        local points=$(yq ".stories.${story_id}.story_points // 0" "$SPRINT_STATUS_FILE")
        ((count++))

        echo "[$count] $story_id: $title ($points pts)"

        if [[ "$dry_run" != "true" ]]; then
            add_to_queue "$story_id" "$count"
        fi
    done

    echo ""
    log_info "Total: $count stories queued"

    if [[ "$dry_run" == "true" ]]; then
        log_info "DRY RUN - no changes made"
    elif [[ "$auto" == "true" ]]; then
        echo ""
        log_info "Auto mode - starting processing..."
        process_queue
    else
        echo ""
        echo "Run '/project:run-queue' to start processing"
    fi
}

# ============================================
# Resume from checkpoint
# ============================================

resume() {
    echo ""
    echo "════════════════════════════════════════"
    echo "     Resuming from Checkpoint"
    echo "════════════════════════════════════════"
    echo ""

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        return 1
    fi

    local last=$(yq '.checkpoints.last_completed // ""' "$BATCH_QUEUE_FILE")
    local timestamp=$(yq '.checkpoints.timestamp // ""' "$BATCH_QUEUE_FILE")

    if [[ -z "$last" || "$last" == "null" ]]; then
        log_info "No checkpoint found - starting fresh"
        process_queue
        return
    fi

    log_info "Last checkpoint: $last at $timestamp"

    # Reset failed stories to pending
    local failed=$(yq '[.queue[] | select(.status == "failed")] | length' "$BATCH_QUEUE_FILE")
    if [[ "$failed" -gt 0 ]]; then
        log_info "Resetting $failed failed stories to pending"
        yq -i '(.queue[] | select(.status == "failed")).status = "pending"' "$BATCH_QUEUE_FILE"
    fi

    process_queue
}

# ============================================
# Clear queue
# ============================================

clear_queue() {
    local force="${1:-false}"

    if [[ "$force" != "true" ]]; then
        log_warning "This will clear all queue items"
        echo "Use --force to confirm"
        return 1
    fi

    yq -i '.queue = []' "$BATCH_QUEUE_FILE"
    yq -i '.checkpoints = {"last_completed": "", "timestamp": "", "stories_completed": 0, "stories_failed": 0, "stories_skipped": 0}' "$BATCH_QUEUE_FILE"

    log_success "Queue cleared"
}

# ============================================
# Main
# ============================================

usage() {
    echo "BMAD v6 Batch Executor"
    echo ""
    echo "Usage: batch-executor.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                     Initialize batch queue"
    echo "  status                   Show queue status"
    echo "  add <story-id> [prio]    Add story to queue"
    echo "  epic <epic-id>           Queue all stories from epic"
    echo "  sprint [--auto]          Queue all ready-for-dev stories"
    echo "  run [--parallel N]       Process queue"
    echo "  resume                   Resume from checkpoint"
    echo "  clear [--force]          Clear queue"
    echo ""
    echo "Options:"
    echo "  --dry-run               Preview without changes"
    echo "  --auto                  Start processing immediately"
    echo "  --parallel N            Process N stories in parallel"
}

main() {
    local command="${1:-}"
    shift || true

    local dry_run="false"
    local auto="false"
    local parallel=1
    local force="false"

    # Parse flags
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run) dry_run="true"; shift ;;
            --auto) auto="true"; shift ;;
            --parallel) parallel="$2"; shift 2 ;;
            --force) force="true"; shift ;;
            *) break ;;
        esac
    done

    case "$command" in
        init)
            init_queue
            ;;
        status)
            show_queue
            ;;
        add)
            if [[ -z "${1:-}" ]]; then
                log_error "Usage: batch-executor.sh add <story-id> [priority]"
                exit 1
            fi
            add_to_queue "$1" "${2:-99}"
            ;;
        epic)
            if [[ -z "${1:-}" ]]; then
                log_error "Usage: batch-executor.sh epic <epic-id>"
                exit 1
            fi
            run_epic "$1" "$dry_run"
            ;;
        sprint)
            run_sprint "$auto" "$dry_run"
            ;;
        run|process)
            process_queue "$parallel" "$dry_run"
            ;;
        resume)
            resume
            ;;
        clear)
            clear_queue "$force"
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
