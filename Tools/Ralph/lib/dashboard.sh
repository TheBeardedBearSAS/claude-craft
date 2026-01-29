#!/bin/bash
# =============================================================================
# Ralph Wiggum - Dashboard Module
# Real-time terminal display for monitoring session progress
# =============================================================================

# Dashboard configuration
DASHBOARD_ENABLED="${DASHBOARD_ENABLED:-true}"
DASHBOARD_MODE="${DASHBOARD_MODE:-full}"
DASHBOARD_REFRESH_RATE="${DASHBOARD_REFRESH_RATE:-1000}"

# Dashboard state
DASHBOARD_LAST_RENDER=0
DASHBOARD_LINES_RENDERED=0

# Box drawing characters
BOX_TL="╔"
BOX_TR="╗"
BOX_BL="╚"
BOX_BR="╝"
BOX_H="═"
BOX_V="║"
BOX_ML="╠"
BOX_MR="╣"

# Progress bar characters
PROG_FULL="█"
PROG_PARTIAL="░"

# =============================================================================
# Initialization
# =============================================================================

init_dashboard() {
    DASHBOARD_LAST_RENDER=0
    DASHBOARD_LINES_RENDERED=0

    # Load settings from config
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.dashboard.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        DASHBOARD_ENABLED="$enabled"

        local mode
        mode=$(yq e '.dashboard.mode // "full"' "$CONFIG_FILE" 2>/dev/null)
        DASHBOARD_MODE="$mode"
    fi

    # Check if terminal supports ANSI
    if [[ ! -t 1 ]]; then
        DASHBOARD_ENABLED="false"
        print_verbose "Dashboard disabled (not a terminal)"
    fi

    print_verbose "Dashboard initialized (mode: $DASHBOARD_MODE)"
}

# =============================================================================
# Progress Bar
# =============================================================================

render_progress_bar() {
    local current="$1"
    local max="$2"
    local width="${3:-40}"

    if [[ $max -eq 0 ]]; then
        max=1
    fi

    local percent=$((current * 100 / max))
    local filled=$((current * width / max))
    local empty=$((width - filled))

    local bar=""
    for ((i=0; i<filled; i++)); do
        bar="${bar}${PROG_FULL}"
    done
    for ((i=0; i<empty; i++)); do
        bar="${bar}${PROG_PARTIAL}"
    done

    printf "%s %3d%%" "$bar" "$percent"
}

# =============================================================================
# Circuit Breaker Visual
# =============================================================================

render_circuit_breaker_status() {
    local streak="${1:-0}"
    local threshold="${2:-4}"

    local status=""
    for ((i=0; i<threshold; i++)); do
        if [[ $i -lt $streak ]]; then
            status="${status}${C_RED}█${C_RESET}"
        else
            status="${status}${C_DIM}░${C_RESET}"
        fi
    done

    printf "%s (%d/%d)" "$status" "$streak" "$threshold"
}

# =============================================================================
# Context Usage Bar
# =============================================================================

render_context_bar() {
    local usage="${1:-0}"
    local width="${2:-10}"

    local filled=$((usage * width / 100))
    local empty=$((width - filled))

    local color="$C_GREEN"
    if [[ $usage -ge 80 ]]; then
        color="$C_RED"
    elif [[ $usage -ge 60 ]]; then
        color="$C_YELLOW"
    fi

    local bar=""
    for ((i=0; i<filled; i++)); do
        bar="${bar}${PROG_FULL}"
    done
    for ((i=0; i<empty; i++)); do
        bar="${bar}${PROG_PARTIAL}"
    done

    printf "%b%s%b %d%%" "$color" "$bar" "$C_RESET" "$usage"
}

# =============================================================================
# Phase Indicator
# =============================================================================

render_phase() {
    local phase="$1"

    case "$phase" in
        RED)
            printf "%b%s%b" "$C_RED" "RED" "$C_RESET"
            ;;
        GREEN)
            printf "%b%s%b" "$C_GREEN" "GREEN" "$C_RESET"
            ;;
        REFACTOR)
            printf "%b%s%b" "$C_BLUE" "REFACTOR" "$C_RESET"
            ;;
        IDLE)
            printf "%b%s%b" "$C_DIM" "IDLE" "$C_RESET"
            ;;
        *)
            printf "%b%s%b" "$C_YELLOW" "$phase" "$C_RESET"
            ;;
    esac
}

# =============================================================================
# Format Duration
# =============================================================================

format_duration() {
    local seconds="$1"
    local minutes=$((seconds / 60))
    local secs=$((seconds % 60))

    printf "%02d:%02d" "$minutes" "$secs"
}

# =============================================================================
# Simple Dashboard
# =============================================================================

render_simple_dashboard() {
    local session_id="$1"
    local iteration="$2"
    local max_iterations="$3"
    local elapsed="$4"
    local phase="${5:-UNKNOWN}"

    local width=65

    # Build simple status line
    printf "\r"
    printf "%b[%b%s%b]%b " "$C_CYAN" "$C_BOLD" "$(render_phase "$phase")" "$C_CYAN" "$C_RESET"
    printf "Iter %d/%d " "$iteration" "$max_iterations"
    printf "| %s " "$(format_duration "$elapsed")"
    printf "| %s" "$(render_progress_bar "$iteration" "$max_iterations" 20)"
}

# =============================================================================
# Full Dashboard
# =============================================================================

render_full_dashboard() {
    local session_id="$1"
    local iteration="$2"
    local max_iterations="$3"
    local elapsed="$4"
    local phase="${5:-UNKNOWN}"
    local cb_streak="${6:-0}"
    local cb_threshold="${7:-4}"
    local context_usage="${8:-0}"

    local width=65

    # Calculate progress
    local progress_percent=$((iteration * 100 / max_iterations))

    # Clear previous dashboard if rendered
    if [[ $DASHBOARD_LINES_RENDERED -gt 0 ]]; then
        for ((i=0; i<DASHBOARD_LINES_RENDERED; i++)); do
            printf "\033[A\033[K"
        done
    fi

    # Render box
    local line_count=0

    # Top border
    printf "%b%s" "$C_CYAN" "$BOX_TL"
    for ((i=0; i<width-2; i++)); do printf "%s" "$BOX_H"; done
    printf "%s%b\n" "$BOX_TR" "$C_RESET"
    line_count=$((line_count + 1))

    # Title line
    local title="RALPH WIGGUM - Session: ${session_id:0:12}..."
    local phase_str=$(render_phase "$phase")
    local title_len=${#title}
    local padding=$((width - title_len - 20))

    printf "%b%s%b  %b%s%b" "$C_CYAN" "$BOX_V" "$C_RESET" "$C_BOLD" "$title" "$C_RESET"
    printf "%*s" "$padding" ""
    printf "PHASE: %s  %b%s%b\n" "$phase_str" "$C_CYAN" "$BOX_V" "$C_RESET"
    line_count=$((line_count + 1))

    # Separator
    printf "%b%s" "$C_CYAN" "$BOX_ML"
    for ((i=0; i<width-2; i++)); do printf "%s" "$BOX_H"; done
    printf "%s%b\n" "$BOX_MR" "$C_RESET"
    line_count=$((line_count + 1))

    # Iteration line
    local iter_str="ITERATION $iteration/$max_iterations"
    local elapsed_str="ELAPSED: $(format_duration "$elapsed")"
    local iter_padding=$((width - ${#iter_str} - ${#elapsed_str} - 8))

    printf "%b%s%b  %b%s%b" "$C_CYAN" "$BOX_V" "$C_RESET" "$C_BOLD" "$iter_str" "$C_RESET"
    printf "%*s" "$iter_padding" ""
    printf "%s  %b%s%b\n" "$elapsed_str" "$C_CYAN" "$BOX_V" "$C_RESET"
    line_count=$((line_count + 1))

    # Progress bar line
    local progress_bar=$(render_progress_bar "$iteration" "$max_iterations" 45)
    printf "%b%s%b  PROGRESS %s  %b%s%b\n" "$C_CYAN" "$BOX_V" "$C_RESET" "$progress_bar" "$C_CYAN" "$BOX_V" "$C_RESET"
    line_count=$((line_count + 1))

    # Empty line
    printf "%b%s%b%*s%b%s%b\n" "$C_CYAN" "$BOX_V" "$C_RESET" "$((width - 2))" "" "$C_CYAN" "$BOX_V" "$C_RESET"
    line_count=$((line_count + 1))

    # Circuit breaker and context line
    local cb_status=$(render_circuit_breaker_status "$cb_streak" "$cb_threshold")
    local ctx_bar=$(render_context_bar "$context_usage" 10)

    printf "%b%s%b  Circuit Breaker: %s    Context: %s  %b%s%b\n" \
        "$C_CYAN" "$BOX_V" "$C_RESET" \
        "$cb_status" \
        "$ctx_bar" \
        "$C_CYAN" "$BOX_V" "$C_RESET"
    line_count=$((line_count + 1))

    # Bottom border
    printf "%b%s" "$C_CYAN" "$BOX_BL"
    for ((i=0; i<width-2; i++)); do printf "%s" "$BOX_H"; done
    printf "%s%b\n" "$BOX_BR" "$C_RESET"
    line_count=$((line_count + 1))

    DASHBOARD_LINES_RENDERED=$line_count
}

# =============================================================================
# Main Render Function
# =============================================================================

render_dashboard() {
    if [[ "$DASHBOARD_ENABLED" != "true" ]]; then
        return 0
    fi

    local session_id="$1"
    local iteration="$2"
    local max_iterations="$3"
    local elapsed="$4"
    local phase="${5:-UNKNOWN}"
    local cb_streak="${6:-0}"
    local cb_threshold="${7:-4}"
    local context_usage="${8:-0}"

    case "$DASHBOARD_MODE" in
        simple)
            render_simple_dashboard "$session_id" "$iteration" "$max_iterations" "$elapsed" "$phase"
            ;;
        full)
            render_full_dashboard "$session_id" "$iteration" "$max_iterations" "$elapsed" "$phase" "$cb_streak" "$cb_threshold" "$context_usage"
            ;;
        headless)
            # No rendering in headless mode
            ;;
        *)
            render_full_dashboard "$session_id" "$iteration" "$max_iterations" "$elapsed" "$phase" "$cb_streak" "$cb_threshold" "$context_usage"
            ;;
    esac
}

# =============================================================================
# Update Dashboard (incremental)
# =============================================================================

update_dashboard_iteration() {
    local session_id="$1"
    local iteration="$2"
    local max_iterations="$3"

    if [[ "$DASHBOARD_ENABLED" != "true" ]]; then
        return 0
    fi

    # Calculate elapsed time
    local current_time=$(date +%s)
    local elapsed=$((current_time - METRICS_START_TIME))

    # Get current values
    local phase="UNKNOWN"
    local cb_streak="${CB_ITERATIONS_WITHOUT_CHANGES:-0}"
    local cb_threshold="${CB_NO_CHANGES_THRESHOLD:-4}"
    local context_usage="${METRICS_DATA["last_context_usage"]:-0}"

    # Get phase from sprint progress if available
    if type get_current_phase &>/dev/null; then
        phase=$(get_current_phase 2>/dev/null || echo "UNKNOWN")
    fi

    render_dashboard "$session_id" "$iteration" "$max_iterations" "$elapsed" "$phase" "$cb_streak" "$cb_threshold" "$context_usage"
}

# =============================================================================
# Clear Dashboard
# =============================================================================

clear_dashboard() {
    if [[ $DASHBOARD_LINES_RENDERED -gt 0 ]]; then
        for ((i=0; i<DASHBOARD_LINES_RENDERED; i++)); do
            printf "\033[A\033[K"
        done
        DASHBOARD_LINES_RENDERED=0
    fi
}

# =============================================================================
# Finalize Dashboard
# =============================================================================

finalize_dashboard() {
    local status="${1:-completed}"

    if [[ "$DASHBOARD_ENABLED" != "true" ]]; then
        return 0
    fi

    # Clear the dashboard
    clear_dashboard

    # Print final status
    case "$status" in
        completed)
            printf "%b✓ Session completed%b\n" "$C_GREEN" "$C_RESET"
            ;;
        failed)
            printf "%b✗ Session failed%b\n" "$C_RED" "$C_RESET"
            ;;
        interrupted)
            printf "%b⚠ Session interrupted%b\n" "$C_YELLOW" "$C_RESET"
            ;;
        *)
            printf "%bSession ended: %s%b\n" "$C_DIM" "$status" "$C_RESET"
            ;;
    esac
}
