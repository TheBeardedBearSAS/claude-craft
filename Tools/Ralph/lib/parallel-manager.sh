#!/usr/bin/env bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Parallel Manager Module
# Manages parallel execution of multiple Ralph sessions
#
# Single-writer pattern: Only the leader (main process) writes to shared state
# files. Background worker sessions report via individual temp files in
# .ralph/parallel/workers/worker-{id}.yaml. The leader merges reports after
# workers complete.
# =============================================================================

# Parallel manager state
PARALLEL_ENABLED="${PARALLEL_ENABLED:-false}"
PARALLEL_MAX_CONCURRENT="${PARALLEL_MAX_CONCURRENT:-3}"
PARALLEL_RESOURCE_LIMIT_CPU="${PARALLEL_RESOURCE_LIMIT_CPU:-80}"
PARALLEL_RESOURCE_LIMIT_MEM="${PARALLEL_RESOURCE_LIMIT_MEM:-80}"

# Session tracking
# `=()`: a declared-but-unassigned array is "unbound" for `${#arr[@]}` under set -u
declare -gA PARALLEL_SESSIONS=()
declare -gA PARALLEL_PIDS=()
PARALLEL_SESSION_COUNT=0
PARALLEL_COMPLETED_COUNT=0
PARALLEL_FAILED_COUNT=0
# Results returned through globals: spawn_session and collect_completed_sessions
# must run in the leader shell, never in `$(...)` (the worker would hold the
# substitution pipe open, and the tracking arrays would be lost).
PARALLEL_SPAWNED_SESSION_ID=""
# One story id per line (ids may contain spaces).
PARALLEL_COLLECTED_STORIES=""
PARALLEL_FAILED_STORIES=""

# Paths
PARALLEL_BASE_DIR=""
PARALLEL_STATE_FILE=""
PARALLEL_DEPENDENCY_GRAPH=""
PARALLEL_WORKER_DIR=""

# =============================================================================
# Initialization
# =============================================================================

init_parallel_manager() {
    PARALLEL_BASE_DIR="${RALPH_SESSION_BASE:-.ralph}/parallel"
    mkdir -p "$PARALLEL_BASE_DIR"
    # Absolute: workers cd into their own worktree
    PARALLEL_BASE_DIR="$(cd "$PARALLEL_BASE_DIR" && pwd)"

    PARALLEL_STATE_FILE="$PARALLEL_BASE_DIR/state.yaml"
    PARALLEL_DEPENDENCY_GRAPH="$PARALLEL_BASE_DIR/dependencies.json"
    PARALLEL_WORKER_DIR="$PARALLEL_BASE_DIR/workers"
    mkdir -p "$PARALLEL_WORKER_DIR"

    # Initialize state file
    cat > "$PARALLEL_STATE_FILE" << EOF
enabled: $PARALLEL_ENABLED
max_concurrent: $PARALLEL_MAX_CONCURRENT
sessions:
  active: []
  completed: []
  failed: []
metrics:
  total_spawned: 0
  total_completed: 0
  total_failed: 0
  efficiency: 0
resource_limits:
  cpu_percent: $PARALLEL_RESOURCE_LIMIT_CPU
  mem_percent: $PARALLEL_RESOURCE_LIMIT_MEM
EOF

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.autonomous.parallel.enabled // "false"' "$CONFIG_FILE" 2>/dev/null)
        PARALLEL_ENABLED="$enabled"

        local max_concurrent
        max_concurrent=$(yq e '.autonomous.parallel.max_concurrent // "3"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$max_concurrent" =~ ^[0-9]+$ ]]; then
            PARALLEL_MAX_CONCURRENT=$max_concurrent
        fi

        local cpu_limit
        cpu_limit=$(yq e '.autonomous.parallel.resource_limits.cpu_percent // "80"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$cpu_limit" =~ ^[0-9]+$ ]]; then
            PARALLEL_RESOURCE_LIMIT_CPU=$cpu_limit
        fi

        local mem_limit
        mem_limit=$(yq e '.autonomous.parallel.resource_limits.mem_percent // "80"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$mem_limit" =~ ^[0-9]+$ ]]; then
            PARALLEL_RESOURCE_LIMIT_MEM=$mem_limit
        fi
    fi

    print_verbose "Parallel manager initialized:"
    print_verbose "  - Enabled: $PARALLEL_ENABLED"
    print_verbose "  - Max concurrent: $PARALLEL_MAX_CONCURRENT"
    print_verbose "  - CPU limit: ${PARALLEL_RESOURCE_LIMIT_CPU}%"
    print_verbose "  - Memory limit: ${PARALLEL_RESOURCE_LIMIT_MEM}%"
}

# =============================================================================
# Dependency Graph
# =============================================================================

# Build dependency graph from stories
build_dependency_graph() {
    local stories="$1"  # Story IDs, one per line
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    # Without a status file (or yq), all stories are independent nodes: the
    # graph must still list them, get_ready_stories reads it.
    local with_deps=true
    if [[ ! -f "$status_file" ]] || ! command -v yq &>/dev/null; then
        with_deps=false
    fi

    local nodes="{}"
    local edges="[]"

    local -a story_list=()
    mapfile -t story_list <<< "$stories"
    for story_id in "${story_list[@]}"; do
        [[ -z "$story_id" ]] && continue
        # Get story dependencies
        local deps="[]"
        if [[ "$with_deps" == "true" ]]; then
            deps=$(STORY_ID="$story_id" yq '.stories[strenv(STORY_ID)].blocked_by // []' "$status_file" 2>/dev/null) || deps="[]"
        fi

        # Add node (on jq failure, keep the previous value: `next` buffers it)
        local next
        next=$(echo "$nodes" | jq --arg id "$story_id" '. + {($id): {"status": "pending", "deps": []}}') && nodes="$next"

        # Add edges for dependencies
        if [[ "$deps" != "[]" && "$deps" != "null" ]]; then
            local -a dep_list=()
            mapfile -t dep_list < <(echo "$deps" | jq -r '.[]' 2>/dev/null || true)
            for dep in "${dep_list[@]}"; do
                next=$(echo "$edges" | jq --arg from "$dep" --arg to "$story_id" '. + [{"from": $from, "to": $to}]') && edges="$next"
                next=$(echo "$nodes" | jq --arg id "$story_id" --arg dep "$dep" '.[$id].deps += [$dep]') && nodes="$next"
            done
        fi
    done

    local graph="{\"nodes\":$nodes,\"edges\":$edges}"
    echo "$graph" > "$PARALLEL_DEPENDENCY_GRAPH"
    echo "$graph"
}

# Get stories that can be processed (no pending dependencies)
get_ready_stories() {
    if [[ ! -f "$PARALLEL_DEPENDENCY_GRAPH" ]]; then
        return
    fi

    if ! command -v jq &>/dev/null; then
        return
    fi

    # Find nodes with status=pending and all deps completed
    # ($root: jq has no `$.` root accessor — that syntax failed to compile)
    jq -r '
        . as $root |
        .nodes | to_entries[] |
        select(.value.status == "pending") |
        select(
            (.value.deps | length) == 0 or
            (
                .value.deps as $deps |
                ($deps | map(. as $d | $root.nodes[$d].status == "completed") | all)
            )
        ) |
        .key
    ' "$PARALLEL_DEPENDENCY_GRAPH" 2>/dev/null || true
}

# Mark story as completed in dependency graph
mark_story_completed() {
    local story_id="$1"

    if [[ ! -f "$PARALLEL_DEPENDENCY_GRAPH" ]] || ! command -v jq &>/dev/null; then
        return
    fi

    local updated
    updated=$(jq --arg id "$story_id" '.nodes[$id].status = "completed"' "$PARALLEL_DEPENDENCY_GRAPH")
    echo "$updated" > "$PARALLEL_DEPENDENCY_GRAPH"
}

# Mark story as running in dependency graph (leader only, at spawn time)
mark_story_running() {
    local story_id="$1"

    if [[ ! -f "$PARALLEL_DEPENDENCY_GRAPH" ]] || ! command -v jq &>/dev/null; then
        return 0
    fi

    local updated
    updated=$(jq --arg id "$story_id" '.nodes[$id].status = "running"' "$PARALLEL_DEPENDENCY_GRAPH")
    echo "$updated" > "$PARALLEL_DEPENDENCY_GRAPH"
}

# Mark story as failed in dependency graph
mark_story_failed() {
    local story_id="$1"

    if [[ ! -f "$PARALLEL_DEPENDENCY_GRAPH" ]] || ! command -v jq &>/dev/null; then
        return
    fi

    local updated
    updated=$(jq --arg id "$story_id" '.nodes[$id].status = "failed"' "$PARALLEL_DEPENDENCY_GRAPH")
    echo "$updated" > "$PARALLEL_DEPENDENCY_GRAPH"
}

# =============================================================================
# Resource Management
# =============================================================================

# Check if system resources allow more sessions
check_resource_availability() {
    # Check CPU usage
    local cpu_usage=0
    if command -v top &>/dev/null; then
        if [[ "$(uname)" == "Darwin" ]]; then
            cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print int($3)}' 2>/dev/null || echo "0")
        else
            cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print int($2)}' 2>/dev/null || echo "0")
        fi
    fi

    if [[ $cpu_usage -ge $PARALLEL_RESOURCE_LIMIT_CPU ]]; then
        print_verbose "CPU usage too high: ${cpu_usage}% (limit: ${PARALLEL_RESOURCE_LIMIT_CPU}%)"
        return 1
    fi

    # Check memory usage
    local mem_usage=0
    if command -v free &>/dev/null; then
        mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}' 2>/dev/null || echo "0")
    elif [[ "$(uname)" == "Darwin" ]]; then
        local pages_free pages_active pages_inactive pages_speculative pages_wired
        pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.') || pages_free=0
        pages_active=$(vm_stat | grep "Pages active" | awk '{print $3}' | tr -d '.') || pages_active=0
        pages_inactive=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | tr -d '.') || pages_inactive=0
        pages_speculative=$(vm_stat | grep "Pages speculative" | awk '{print $3}' | tr -d '.') || pages_speculative=0
        pages_wired=$(vm_stat | grep "Pages wired" | awk '{print $4}' | tr -d '.') || pages_wired=0
        local total=$((pages_free + pages_active + pages_inactive + pages_speculative + pages_wired))
        local used=$((pages_active + pages_wired))
        mem_usage=$((used * 100 / total))
    fi

    if [[ $mem_usage -ge $PARALLEL_RESOURCE_LIMIT_MEM ]]; then
        print_verbose "Memory usage too high: ${mem_usage}% (limit: ${PARALLEL_RESOURCE_LIMIT_MEM}%)"
        return 1
    fi

    return 0
}

# Get number of available slots
get_available_slots() {
    local active_count=0
    active_count=${#PARALLEL_PIDS[@]}
    local available=$((PARALLEL_MAX_CONCURRENT - active_count))

    # Further limit if resources are constrained
    if ! check_resource_availability; then
        available=$((available / 2))
        [[ $available -lt 1 ]] && available=0
    fi

    echo "$available"
}

# =============================================================================
# Session Spawning
# =============================================================================

# Spawn a new Ralph session for a story (id in PARALLEL_SPAWNED_SESSION_ID)
spawn_session() {
    local story_id="$1"
    local prompt="$2"
    local config="${3:-}"

    # Generate session ID. It names a directory and a git branch: the story id
    # is reduced to [A-Za-z0-9_-] (no `/`, `..` nor space), and the spawn
    # counter keeps ids that sanitize alike ("US 1", "US/1") apart.
    local session_id
    session_id="PAR-${story_id//[^A-Za-z0-9_-]/-}-$(date +%s)-${PARALLEL_SESSION_COUNT}"
    PARALLEL_SPAWNED_SESSION_ID=""

    print_info "Spawning parallel session: $session_id for $story_id"

    # Create session directory
    local session_dir="$PARALLEL_BASE_DIR/sessions/$session_id"
    mkdir -p "$session_dir"

    # Write session info (ids through strenv(): a `"` must not break the YAML)
    if command -v yq &>/dev/null; then
        SESSION_ID_ARG="$session_id" STORY_ID="$story_id" TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" yq -n '
            .session_id = strenv(SESSION_ID_ARG) |
            .story_id = strenv(STORY_ID) |
            .status = "running" |
            .started_at = strenv(TS) |
            .pid = "" |
            .exit_code = ""' > "$session_dir/info.yaml"
    fi

    # Find Ralph script
    local ralph_script=""
    for path in "${SCRIPT_DIR}/ralph.sh" "Tools/Ralph/ralph.sh" "$(dirname "${BASH_SOURCE[0]}")/../ralph.sh"; do
        if [[ -f "$path" ]]; then
            ralph_script="$(cd "$(dirname "$path")" && pwd)/$(basename "$path")"
            break
        fi
    done

    if [[ -z "$ralph_script" ]]; then
        print_error "Ralph script not found"
        return 1
    fi

    # Build command
    local -a cmd=("$ralph_script")
    [[ -n "${LANG_ARG:-}" ]] && cmd+=("--lang=$LANG_ARG")
    [[ -n "$config" ]] && cmd+=("--config=$config")

    # Isolate the worker's working tree (one git worktree per session)
    local worktree_dir=""
    if ! worktree_dir=$(create_worker_worktree "$session_id"); then
        worktree_dir=""
        print_warning "No git worktree for $session_id: worker shares the current directory"
    fi

    # Spawn in background
    # Workers write to individual temp files (single-writer pattern).
    # The leader merges results after all workers complete.
    # Derived from the (sanitized) session id: it names the report file
    local worker_id="${session_id}-$$"
    (
        if [[ -n "$worktree_dir" ]]; then
            cd "$worktree_dir" || exit 1
        fi
        # Per-worker Ralph state (incl. the Claude session UUID) under the
        # leader's .ralph/, so it survives the worktree removal.
        export RALPH_SESSION_BASE="$session_dir/ralph"

        local output
        local status=0
        output=$("${cmd[@]}" "$prompt" 2>&1) || status=$?

        if [[ -n "$worktree_dir" ]] && ! cleanup_worker_worktree "$worktree_dir" "$story_id"; then
            output+=$'\n'"[WARN] Worktree kept: $worktree_dir"
        fi

        # Save output (per-session dir, no conflict)
        echo "$output" > "$session_dir/output.log"

        # Update per-session info (isolated file, no conflict)
        if command -v yq &>/dev/null; then
            yq -i ".status = \"$([ $status -eq 0 ] && echo completed || echo failed)\"" "$session_dir/info.yaml"
            yq -i ".exit_code = $status" "$session_dir/info.yaml"
            yq -i ".completed_at = \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" "$session_dir/info.yaml"
        fi

        # Write worker report for leader to merge (avoids concurrent yq writes)
        local result_status="failed"
        [[ $status -eq 0 ]] && result_status="completed"
        write_worker_report "$worker_id" "$session_id" "$story_id" "$result_status"

        exit $status
    ) &

    local pid=$!

    # Track session
    PARALLEL_SESSIONS["$session_id"]="$story_id"
    PARALLEL_PIDS["$pid"]="$session_id"
    PARALLEL_SESSION_COUNT=$((PARALLEL_SESSION_COUNT + 1))

    # Update info with PID
    if command -v yq &>/dev/null; then
        yq -i ".pid = $pid" "$session_dir/info.yaml"
    fi

    # Update state file
    update_parallel_state "spawn" "$session_id" "$story_id"

    PARALLEL_SPAWNED_SESSION_ID="$session_id"
}

# Create a dedicated git worktree on branch ralph/<session_id> so parallel
# workers never share a working tree. Prints its path; fails outside git.
create_worker_worktree() {
    local session_id="$1"
    local worktree_dir="$PARALLEL_BASE_DIR/worktrees/$session_id"

    git rev-parse --is-inside-work-tree &> /dev/null || return 1
    git worktree add -q -b "ralph/$session_id" "$worktree_dir" HEAD &> /dev/null || return 1
    echo "$worktree_dir"
}

# Commit leftover changes as WIP on the worker branch, then remove the
# worktree. If the commit fails, the dirty worktree is kept (no data loss).
cleanup_worker_worktree() {
    local worktree_dir="$1"
    local story_id="$2"

    if [[ -n "$(git -C "$worktree_dir" status --porcelain)" ]]; then
        git -C "$worktree_dir" add -A
        git -C "$worktree_dir" commit -q -m "wip(ralph): $story_id" || return 1
    fi
    git -C "$worktree_dir" worktree remove "$worktree_dir"
}

# =============================================================================
# Session Management
# =============================================================================

# Check and collect completed sessions.
# In the single-writer pattern, this function collects finished PIDs
# and then merges worker reports written by the background processes.
# Completed (failed) stories are also appended, one per line, to
# PARALLEL_COLLECTED_STORIES (PARALLEL_FAILED_STORIES).
collect_completed_sessions() {
    local completed=()
    local failed=()
    local any_finished=false

    for pid in "${!PARALLEL_PIDS[@]}"; do
        if ! kill -0 "$pid" 2>/dev/null; then
            any_finished=true

            local session_id="${PARALLEL_PIDS[$pid]}"
            local story_id="${PARALLEL_SESSIONS[$session_id]}"

            # Check exit status (a failed worker must not kill the leader)
            local exit_code=0
            wait "$pid" 2>/dev/null || exit_code=$?

            if [[ $exit_code -eq 0 ]]; then
                completed+=("$story_id")
                PARALLEL_COLLECTED_STORIES+="$story_id"$'\n'
                PARALLEL_COMPLETED_COUNT=$((PARALLEL_COMPLETED_COUNT + 1))
                print_success "Session completed: $session_id ($story_id)"
            else
                failed+=("$story_id")
                PARALLEL_FAILED_STORIES+="$story_id"$'\n'
                PARALLEL_FAILED_COUNT=$((PARALLEL_FAILED_COUNT + 1))
                print_error "Session failed: $session_id ($story_id)"
            fi

            # Clean up tracking
            unset "PARALLEL_PIDS[$pid]"
            unset "PARALLEL_SESSIONS[$session_id]"
        fi
    done

    # Merge worker reports (single-writer: only the leader writes to shared state)
    if [[ "$any_finished" == "true" ]]; then
        merge_worker_reports
    fi

    # Return completed stories
    echo "${completed[*]}"
}

# Wait for all sessions to complete
wait_all_sessions() {
    local timeout="${1:-0}"  # 0 = wait forever
    local start_time
    start_time=$(date +%s)

    local active_count=0
    active_count=${#PARALLEL_PIDS[@]}

    while [[ $active_count -gt 0 ]]; do
        collect_completed_sessions > /dev/null

        # Check timeout
        if [[ $timeout -gt 0 ]]; then
            local elapsed=$(($(date +%s) - start_time))
            if [[ $elapsed -ge $timeout ]]; then
                print_warning "Timeout waiting for sessions"
                return 1
            fi
        fi

        sleep 5

        # Update active count
        active_count=0
        active_count=${#PARALLEL_PIDS[@]}
    done

    return 0
}

# Get active session count
get_active_count() {
    local count=0
    count=${#PARALLEL_PIDS[@]}
    echo "$count"
}

# =============================================================================
# Parallel Execution
# =============================================================================

# Process stories in parallel
process_stories_parallel() {
    local stories="$1"  # Space-separated list
    local prompt_template="${2:-Implement story}"

    if [[ "$PARALLEL_ENABLED" != "true" ]]; then
        print_warning "Parallel mode not enabled"
        return 1
    fi

    print_info "Starting parallel processing..."
    print_info "Stories: $(echo "$stories" | wc -w | tr -d ' ')"
    print_info "Max concurrent: $PARALLEL_MAX_CONCURRENT"

    # Build dependency graph (it reads one id per line)
    build_dependency_graph "$(tr -s ' ' '\n' <<< "$stories")" > /dev/null

    local processed=0
    local total
    total=$(echo "$stories" | wc -w | tr -d ' ') || total=0

    while [[ $processed -lt $total ]]; do
        # Collect completed sessions
        collect_completed_sessions > /dev/null

        # Get available slots
        local slots
        slots=$(get_available_slots)

        if [[ $slots -gt 0 ]]; then
            # Get ready stories
            local ready
            ready=$(get_ready_stories)

            for story_id in $ready; do
                [[ $slots -le 0 ]] && break

                # Build prompt
                local prompt="$prompt_template $story_id"

                # Get story details for better prompt
                local bmad_dir="${BMAD_DIR:-.bmad}"
                local status_file="$bmad_dir/sprint-status.yaml"
                if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
                    local title
                    title=$(STORY_ID="$story_id" yq '.stories[strenv(STORY_ID)].title' "$status_file" 2>/dev/null)
                    prompt="Implement user story $story_id: $title. Follow TDD approach."
                fi

                # Spawn session. "running" keeps get_ready_stories (pending
                # only) from re-spawning it before its report is merged.
                if spawn_session "$story_id" "$prompt"; then
                    mark_story_running "$story_id"
                else
                    mark_story_failed "$story_id"
                fi
                slots=$((slots - 1))
                processed=$((processed + 1))
            done
        fi

        # Wait a bit before next iteration
        sleep 2
    done

    # Wait for remaining sessions
    print_info "Waiting for remaining sessions to complete..."
    wait_all_sessions

    # Drop stale worktree metadata (e.g. a worker killed before its cleanup)
    git worktree prune &> /dev/null || true

    # Print summary
    print_parallel_summary
}

# =============================================================================
# Single-Writer Pattern: Worker Reports
# =============================================================================

# Write a worker report (called by background workers instead of writing to
# shared state files directly). This avoids concurrent yq race conditions.
write_worker_report() {
    local worker_id="$1"
    local session_id="$2"
    local story_id="$3"
    local status="$4"  # "completed" or "failed"

    local report_file="${PARALLEL_WORKER_DIR}/worker-${worker_id}.yaml"
    # Values through strenv(): a `"` in an id must not break the YAML
    WORKER_ID="$worker_id" SESSION_ID_ARG="$session_id" STORY_ID="$story_id" \
        STATUS="$status" TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" yq -n '
        .worker_id = strenv(WORKER_ID) |
        .session_id = strenv(SESSION_ID_ARG) |
        .story_id = strenv(STORY_ID) |
        .status = strenv(STATUS) |
        .reported_at = strenv(TS)' > "$report_file"
}

# Merge all worker reports into the shared state file (leader only).
# This is the ONLY function that writes to PARALLEL_STATE_FILE and the
# dependency graph during parallel execution.
merge_worker_reports() {
    local dry_run="${1:-false}"

    if ! command -v yq &>/dev/null; then
        print_error "yq required for merge" 2>/dev/null || echo "[ERROR] yq required"
        return 1
    fi

    local report_files=("${PARALLEL_WORKER_DIR}"/worker-*.yaml)

    if [[ ! -e "${report_files[0]:-}" ]]; then
        print_info "No worker reports to merge" 2>/dev/null || echo "[INFO] No worker reports"
        return 0
    fi

    local merged_count=0

    for report_file in "${report_files[@]}"; do
        [[ ! -f "$report_file" ]] && continue

        local session_id story_id status
        session_id=$(yq '.session_id' "$report_file" 2>/dev/null || echo "")
        story_id=$(yq '.story_id' "$report_file" 2>/dev/null || echo "")
        status=$(yq '.status' "$report_file" 2>/dev/null || echo "")

        if [[ -z "$session_id" || -z "$story_id" || -z "$status" ]]; then
            continue
        fi

        if [[ "$dry_run" == "true" ]]; then
            print_info "DRY RUN - Would merge: session=$session_id story=$story_id status=$status" 2>/dev/null \
                || echo "[INFO] DRY RUN - Would merge: session=$session_id story=$story_id status=$status"
            merged_count=$((merged_count + 1))
            continue
        fi

        # Update state file (single writer - no race condition)
        if [[ -f "$PARALLEL_STATE_FILE" ]]; then
            SESSION_ID_ARG="$session_id" yq -i '.sessions.active -= [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
            if [[ "$status" == "completed" ]]; then
                SESSION_ID_ARG="$session_id" yq -i '.sessions.completed += [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
                yq -i ".metrics.total_completed += 1" "$PARALLEL_STATE_FILE"
            else
                SESSION_ID_ARG="$session_id" yq -i '.sessions.failed += [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
                yq -i ".metrics.total_failed += 1" "$PARALLEL_STATE_FILE"
            fi
        fi

        # Update dependency graph (single writer - no race condition)
        if [[ -f "$PARALLEL_DEPENDENCY_GRAPH" ]] && command -v jq &>/dev/null; then
            local updated
            updated=$(jq --arg id "$story_id" --arg s "$status" '.nodes[$id].status = $s' "$PARALLEL_DEPENDENCY_GRAPH")
            echo "$updated" > "$PARALLEL_DEPENDENCY_GRAPH"
        fi

        rm -f "$report_file"
        merged_count=$((merged_count + 1))
    done

    # Update efficiency after merge
    if [[ "$dry_run" != "true" && -f "$PARALLEL_STATE_FILE" ]]; then
        local total_completed total_spawned
        total_completed=$(yq '.metrics.total_completed' "$PARALLEL_STATE_FILE")
        total_spawned=$(yq '.metrics.total_spawned' "$PARALLEL_STATE_FILE")
        if [[ $total_spawned -gt 0 ]]; then
            local efficiency=$((total_completed * 100 / total_spawned))
            yq -i ".metrics.efficiency = $efficiency" "$PARALLEL_STATE_FILE"
        fi
    fi

    if [[ "$dry_run" == "true" ]]; then
        print_info "DRY RUN - Would merge $merged_count worker reports" 2>/dev/null \
            || echo "[INFO] DRY RUN - Would merge $merged_count reports"
    else
        print_success "Merged $merged_count worker reports" 2>/dev/null \
            || echo "[SUCCESS] Merged $merged_count reports"
    fi
}

# Clean up worker temp directory
cleanup_workers() {
    if [[ -d "$PARALLEL_WORKER_DIR" ]]; then
        rm -rf "$PARALLEL_WORKER_DIR"
        mkdir -p "$PARALLEL_WORKER_DIR"
    fi
}

# =============================================================================
# State Management
# =============================================================================

# update_parallel_state is now used ONLY by the leader process for spawn events.
# Complete/fail events are handled via worker reports + merge_worker_reports().
update_parallel_state() {
    local action="$1"
    local session_id="$2"
    local story_id="$3"

    if [[ ! -f "$PARALLEL_STATE_FILE" ]] || ! command -v yq &>/dev/null; then
        return
    fi

    case "$action" in
        spawn)
            # Spawn is always called from the leader, safe to write directly
            SESSION_ID_ARG="$session_id" yq -i '.sessions.active += [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
            yq -i ".metrics.total_spawned += 1" "$PARALLEL_STATE_FILE"
            ;;
        complete|fail)
            # DEPRECATED for parallel mode: use write_worker_report() + merge_worker_reports()
            # Kept for backward compatibility with sequential mode
            if [[ "$action" == "complete" ]]; then
                SESSION_ID_ARG="$session_id" yq -i '.sessions.active -= [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
                SESSION_ID_ARG="$session_id" yq -i '.sessions.completed += [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
                yq -i ".metrics.total_completed += 1" "$PARALLEL_STATE_FILE"
            else
                SESSION_ID_ARG="$session_id" yq -i '.sessions.active -= [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
                SESSION_ID_ARG="$session_id" yq -i '.sessions.failed += [strenv(SESSION_ID_ARG)]' "$PARALLEL_STATE_FILE"
                yq -i ".metrics.total_failed += 1" "$PARALLEL_STATE_FILE"
            fi
            ;;
    esac

    # Update efficiency
    local total_completed
    total_completed=$(yq '.metrics.total_completed' "$PARALLEL_STATE_FILE")
    local total_spawned
    total_spawned=$(yq '.metrics.total_spawned' "$PARALLEL_STATE_FILE")

    if [[ $total_spawned -gt 0 ]]; then
        local efficiency=$((total_completed * 100 / total_spawned))
        yq -i ".metrics.efficiency = $efficiency" "$PARALLEL_STATE_FILE"
    fi
}

# =============================================================================
# Output
# =============================================================================

print_parallel_summary() {
    echo ""
    echo "════════════════════════════════════════"
    echo "    Parallel Execution Summary"
    echo "════════════════════════════════════════"
    echo ""
    echo "Sessions spawned:  $PARALLEL_SESSION_COUNT"
    echo "Completed:         $PARALLEL_COMPLETED_COUNT"
    echo "Failed:            $PARALLEL_FAILED_COUNT"

    if [[ $PARALLEL_SESSION_COUNT -gt 0 ]]; then
        local efficiency=$((PARALLEL_COMPLETED_COUNT * 100 / PARALLEL_SESSION_COUNT))
        echo "Efficiency:        ${efficiency}%"
    fi

    echo ""
}

get_parallel_status() {
    cat << EOF
{
    "enabled": $PARALLEL_ENABLED,
    "max_concurrent": $PARALLEL_MAX_CONCURRENT,
    "active_sessions": $(get_active_count),
    "total_spawned": $PARALLEL_SESSION_COUNT,
    "completed": $PARALLEL_COMPLETED_COUNT,
    "failed": $PARALLEL_FAILED_COUNT
}
EOF
}

# =============================================================================
# CLI Interface
# =============================================================================

cmd_parallel_manager() {
    local command="${1:-status}"
    shift || true

    # Parse flags
    local dry_run="false"
    local args=()
    for arg in "$@"; do
        case "$arg" in
            --dry-run) dry_run="true" ;;
            *) args+=("$arg") ;;
        esac
    done
    set -- "${args[@]+"${args[@]}"}"

    case "$command" in
        init)
            init_parallel_manager
            ;;
        status)
            get_parallel_status
            ;;
        process)
            local stories="${1:-}"
            if [[ -z "$stories" ]]; then
                echo "Usage: parallel-manager.sh process <story1> <story2> ..."
                return 1
            fi
            process_stories_parallel "$stories"
            ;;
        spawn)
            local story_id="${1:-}"
            local prompt="${2:-Implement story}"
            if [[ -z "$story_id" ]]; then
                echo "Usage: parallel-manager.sh spawn <story-id> [prompt]"
                return 1
            fi
            spawn_session "$story_id" "$prompt" && echo "$PARALLEL_SPAWNED_SESSION_ID"
            ;;
        wait)
            wait_all_sessions "${1:-0}"
            ;;
        collect)
            collect_completed_sessions
            ;;
        merge-reports)
            merge_worker_reports "$dry_run"
            ;;
        cleanup-workers)
            cleanup_workers
            ;;
        -h|--help|help)
            echo "Ralph Wiggum - Parallel Manager"
            echo ""
            echo "Usage: parallel-manager.sh <command> [args] [--dry-run]"
            echo ""
            echo "Commands:"
            echo "  init                Initialize parallel manager"
            echo "  status              Show parallel manager status"
            echo "  process <stories>   Process stories in parallel"
            echo "  spawn <id> [msg]    Spawn a single session"
            echo "  wait [timeout]      Wait for all sessions"
            echo "  collect             Collect completed sessions"
            echo "  merge-reports       Merge pending worker reports (leader only)"
            echo "  cleanup-workers     Clean up worker temp directory"
            echo ""
            echo "Options:"
            echo "  --dry-run           Preview without changes"
            echo ""
            echo "Single-Writer Pattern:"
            echo "  Background workers write to .ralph/parallel/workers/worker-{id}.yaml"
            echo "  Only the leader merges results into shared state files"
            echo ""
            echo "Isolation:"
            echo "  Each worker runs in its own git worktree (branch ralph/<session>),"
            echo "  removed at the end of the run (leftover changes committed as WIP)."
            echo "  Each Ralph session pins its own Claude session (--session-id, then --resume)."
            ;;
        *)
            echo "Usage: parallel-manager.sh <command> [args]"
            echo ""
            echo "Commands:"
            echo "  init              Initialize parallel manager"
            echo "  status            Show parallel manager status"
            echo "  process <stories> Process stories in parallel"
            echo "  spawn <id> [msg]  Spawn a single session"
            echo "  wait [timeout]    Wait for all sessions"
            echo "  collect           Collect completed sessions"
            echo "  merge-reports     Merge worker reports (leader)"
            echo "  cleanup-workers   Clean up worker temp files"
            echo ""
            echo "Options:"
            echo "  --dry-run         Preview without changes"
            ;;
    esac
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_parallel_manager "$@"
fi
