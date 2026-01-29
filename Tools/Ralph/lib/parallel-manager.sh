#!/bin/bash
# =============================================================================
# Ralph Wiggum - Parallel Manager Module
# Manages parallel execution of multiple Ralph sessions
# =============================================================================

# Parallel manager state
PARALLEL_ENABLED="${PARALLEL_ENABLED:-false}"
PARALLEL_MAX_CONCURRENT="${PARALLEL_MAX_CONCURRENT:-3}"
PARALLEL_RESOURCE_LIMIT_CPU="${PARALLEL_RESOURCE_LIMIT_CPU:-80}"
PARALLEL_RESOURCE_LIMIT_MEM="${PARALLEL_RESOURCE_LIMIT_MEM:-80}"

# Session tracking
declare -A PARALLEL_SESSIONS
declare -A PARALLEL_PIDS
PARALLEL_SESSION_COUNT=0
PARALLEL_COMPLETED_COUNT=0
PARALLEL_FAILED_COUNT=0

# Paths
PARALLEL_BASE_DIR=""
PARALLEL_STATE_FILE=""
PARALLEL_DEPENDENCY_GRAPH=""

# =============================================================================
# Initialization
# =============================================================================

init_parallel_manager() {
    PARALLEL_BASE_DIR="${RALPH_SESSION_BASE:-.ralph}/parallel"
    mkdir -p "$PARALLEL_BASE_DIR"

    PARALLEL_STATE_FILE="$PARALLEL_BASE_DIR/state.yaml"
    PARALLEL_DEPENDENCY_GRAPH="$PARALLEL_BASE_DIR/dependencies.json"

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
    local stories="$1"  # Space-separated list of story IDs
    local bmad_dir="${BMAD_DIR:-.bmad}"
    local status_file="$bmad_dir/sprint-status.yaml"

    if [[ ! -f "$status_file" ]] || ! command -v yq &>/dev/null; then
        # No dependencies, all stories are independent
        echo '{"nodes":{},"edges":[]}'
        return
    fi

    local nodes="{}"
    local edges="[]"

    for story_id in $stories; do
        # Get story dependencies
        local deps
        deps=$(yq ".stories.${story_id}.blocked_by // []" "$status_file" 2>/dev/null)

        # Add node
        nodes=$(echo "$nodes" | jq --arg id "$story_id" '. + {($id): {"status": "pending", "deps": []}}')

        # Add edges for dependencies
        if [[ "$deps" != "[]" && "$deps" != "null" ]]; then
            for dep in $(echo "$deps" | jq -r '.[]' 2>/dev/null); do
                edges=$(echo "$edges" | jq --arg from "$dep" --arg to "$story_id" '. + [{"from": $from, "to": $to}]')
                nodes=$(echo "$nodes" | jq --arg id "$story_id" --arg dep "$dep" '.[$id].deps += [$dep]')
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
    jq -r '
        .nodes | to_entries[] |
        select(.value.status == "pending") |
        select(
            (.value.deps | length) == 0 or
            (
                .value.deps as $deps |
                ($deps | map(. as $d | $.nodes[$d].status == "completed") | all)
            )
        ) |
        .key
    ' "$PARALLEL_DEPENDENCY_GRAPH" 2>/dev/null
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
        pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
        pages_active=$(vm_stat | grep "Pages active" | awk '{print $3}' | tr -d '.')
        pages_inactive=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | tr -d '.')
        pages_speculative=$(vm_stat | grep "Pages speculative" | awk '{print $3}' | tr -d '.')
        pages_wired=$(vm_stat | grep "Pages wired" | awk '{print $4}' | tr -d '.')
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
    local active_count=${#PARALLEL_PIDS[@]}
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

# Spawn a new Ralph session for a story
spawn_session() {
    local story_id="$1"
    local prompt="$2"
    local config="${3:-}"

    # Generate session ID
    local session_id="PAR-${story_id}-$(date +%s)"

    print_info "Spawning parallel session: $session_id for $story_id"

    # Create session directory
    local session_dir="$PARALLEL_BASE_DIR/sessions/$session_id"
    mkdir -p "$session_dir"

    # Write session info
    cat > "$session_dir/info.yaml" << EOF
session_id: "$session_id"
story_id: "$story_id"
status: "running"
started_at: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
pid: ""
exit_code: ""
EOF

    # Find Ralph script
    local ralph_script=""
    for path in "${SCRIPT_DIR}/ralph.sh" "Tools/Ralph/ralph.sh" "$(dirname "${BASH_SOURCE[0]}")/../ralph.sh"; do
        if [[ -f "$path" ]]; then
            ralph_script="$path"
            break
        fi
    done

    if [[ -z "$ralph_script" ]]; then
        print_error "Ralph script not found"
        return 1
    fi

    # Build command
    local cmd="$ralph_script"
    [[ -n "$config" ]] && cmd="$cmd --config=$config"

    # Spawn in background
    (
        cd "$(pwd)" || exit 1

        local output
        output=$($cmd "$prompt" 2>&1)
        local status=$?

        # Save output
        echo "$output" > "$session_dir/output.log"

        # Update session info
        if command -v yq &>/dev/null; then
            yq -i ".status = \"$([ $status -eq 0 ] && echo completed || echo failed)\"" "$session_dir/info.yaml"
            yq -i ".exit_code = $status" "$session_dir/info.yaml"
            yq -i ".completed_at = \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" "$session_dir/info.yaml"
        fi

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

    echo "$session_id"
}

# =============================================================================
# Session Management
# =============================================================================

# Check and collect completed sessions
collect_completed_sessions() {
    local completed=()
    local failed=()

    for pid in "${!PARALLEL_PIDS[@]}"; do
        if ! kill -0 "$pid" 2>/dev/null; then
            # Process has finished
            local session_id="${PARALLEL_PIDS[$pid]}"
            local story_id="${PARALLEL_SESSIONS[$session_id]}"

            # Check exit status
            wait "$pid" 2>/dev/null
            local exit_code=$?

            if [[ $exit_code -eq 0 ]]; then
                completed+=("$story_id")
                mark_story_completed "$story_id"
                PARALLEL_COMPLETED_COUNT=$((PARALLEL_COMPLETED_COUNT + 1))
                update_parallel_state "complete" "$session_id" "$story_id"
                print_success "Session completed: $session_id ($story_id)"
            else
                failed+=("$story_id")
                mark_story_failed "$story_id"
                PARALLEL_FAILED_COUNT=$((PARALLEL_FAILED_COUNT + 1))
                update_parallel_state "fail" "$session_id" "$story_id"
                print_error "Session failed: $session_id ($story_id)"
            fi

            # Clean up tracking
            unset "PARALLEL_PIDS[$pid]"
            unset "PARALLEL_SESSIONS[$session_id]"
        fi
    done

    # Return completed stories
    echo "${completed[*]}"
}

# Wait for all sessions to complete
wait_all_sessions() {
    local timeout="${1:-0}"  # 0 = wait forever
    local start_time
    start_time=$(date +%s)

    while [[ ${#PARALLEL_PIDS[@]} -gt 0 ]]; do
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
    done

    return 0
}

# Get active session count
get_active_count() {
    echo "${#PARALLEL_PIDS[@]}"
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

    # Build dependency graph
    build_dependency_graph "$stories" > /dev/null

    local processed=0
    local total
    total=$(echo "$stories" | wc -w | tr -d ' ')

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

                # Skip if already processed
                [[ -n "${PARALLEL_SESSIONS[$story_id]:-}" ]] && continue

                # Build prompt
                local prompt="$prompt_template $story_id"

                # Get story details for better prompt
                local bmad_dir="${BMAD_DIR:-.bmad}"
                local status_file="$bmad_dir/sprint-status.yaml"
                if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
                    local title
                    title=$(yq ".stories.${story_id}.title" "$status_file" 2>/dev/null)
                    prompt="Implement user story $story_id: $title. Follow TDD approach."
                fi

                # Spawn session
                spawn_session "$story_id" "$prompt"
                ((slots--))
                ((processed++))
            done
        fi

        # Wait a bit before next iteration
        sleep 2
    done

    # Wait for remaining sessions
    print_info "Waiting for remaining sessions to complete..."
    wait_all_sessions

    # Print summary
    print_parallel_summary
}

# =============================================================================
# State Management
# =============================================================================

update_parallel_state() {
    local action="$1"
    local session_id="$2"
    local story_id="$3"

    if [[ ! -f "$PARALLEL_STATE_FILE" ]] || ! command -v yq &>/dev/null; then
        return
    fi

    case "$action" in
        spawn)
            yq -i ".sessions.active += [\"$session_id\"]" "$PARALLEL_STATE_FILE"
            yq -i ".metrics.total_spawned += 1" "$PARALLEL_STATE_FILE"
            ;;
        complete)
            yq -i ".sessions.active -= [\"$session_id\"]" "$PARALLEL_STATE_FILE"
            yq -i ".sessions.completed += [\"$session_id\"]" "$PARALLEL_STATE_FILE"
            yq -i ".metrics.total_completed += 1" "$PARALLEL_STATE_FILE"
            ;;
        fail)
            yq -i ".sessions.active -= [\"$session_id\"]" "$PARALLEL_STATE_FILE"
            yq -i ".sessions.failed += [\"$session_id\"]" "$PARALLEL_STATE_FILE"
            yq -i ".metrics.total_failed += 1" "$PARALLEL_STATE_FILE"
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
            spawn_session "$story_id" "$prompt"
            ;;
        wait)
            wait_all_sessions "${1:-0}"
            ;;
        collect)
            collect_completed_sessions
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
            ;;
    esac
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_parallel_manager "$@"
fi
