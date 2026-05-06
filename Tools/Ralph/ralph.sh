#!/bin/bash
# =============================================================================
# Ralph Wiggum - Continuous AI Agent Loop
# Run Claude in a continuous loop until task completion
# =============================================================================

set -euo pipefail

# Version
RALPH_VERSION="2.0.0"

# Script paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n/ralph"
TEMPLATES_DIR="$SCRIPT_DIR/templates"

# Configuration defaults
DEFAULT_MAX_ITERATIONS=25
DEFAULT_TIMEOUT=600000
DEFAULT_DELAY=1000
DEFAULT_SESSION_DIR=".ralph"
DEFAULT_CONFIG_FILE="ralph.yml"
DEFAULT_COMPLETION_MARKER="<promise>COMPLETE</promise>"

# i18n Configuration
VALID_LANGS=("en" "fr" "es" "de" "pt")
DEFAULT_LANG="en"

# Colors
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_DIM='\033[2m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'

# Global state
LANG_ARG=""
PROMPT=""
CONFIG_FILE=""
SESSION_ID=""
MAX_ITERATIONS=$DEFAULT_MAX_ITERATIONS
TIMEOUT=$DEFAULT_TIMEOUT
DELAY=$DEFAULT_DELAY
VERBOSE=false
DRY_RUN=false
CONTINUE_SESSION=""

# v2.0 New flags
AUTO_DETECT=false
INIT_ONLY=false
INTERACTIVE=false

# v3.0 ASC (Autonomous Sprint Conductor) flags
AUTONOMOUS_MODE=false
SESSION_ISOLATED=false
STORY_ID=""
SPRINT_MODE=false
OVERNIGHT_MODE=false
PARALLEL_ENABLED=false
PARALLEL_MAX_CONCURRENT=""

# =============================================================================
# i18n - Load messages
# =============================================================================

load_messages() {
    local lang="${LANG_ARG:-$DEFAULT_LANG}"
    local msg_file="$I18N_DIR/${lang}.sh"

    if [[ -f "$msg_file" ]]; then
        # shellcheck source=/dev/null
        source "$msg_file"
    else
        # Fallback to English
        local fallback="$I18N_DIR/en.sh"
        if [[ -f "$fallback" ]]; then
            # shellcheck source=/dev/null
            source "$fallback"
        else
            # Minimal embedded defaults
            MSG_HEADER="Ralph Wiggum - Continuous AI Agent Loop"
            MSG_ERROR="Error"
            MSG_GOODBYE="Goodbye!"
        fi
    fi
}

# =============================================================================
# Utilities
# =============================================================================

print_header() {
    echo -e "\n${C_CYAN}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_BOLD}🔁 ${MSG_HEADER}${C_RESET}           ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_DIM}${MSG_VERSION} ${RALPH_VERSION}${C_RESET}                                          ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"
}

print_success() {
    echo -e "${C_GREEN}✓${C_RESET} $1"
}

print_error() {
    echo -e "${C_RED}✗${C_RESET} $1" >&2
}

print_info() {
    echo -e "${C_BLUE}ℹ${C_RESET} $1"
}

print_warning() {
    echo -e "${C_YELLOW}⚠${C_RESET} $1"
}

print_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${C_DIM}  $1${C_RESET}"
    fi
}

print_iteration() {
    local current=$1
    local max=$2
    echo -e "\n${C_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"
    echo -e "${C_BOLD}${MSG_ITERATION} ${current} ${MSG_OF} ${max}${C_RESET}"
    echo -e "${C_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}\n"
}

# =============================================================================
# Dependency checks
# =============================================================================

# Implementation extracted to lib/dependencies.sh (audit ARCH-002 partial).
# The function is provided once load_modules() sources that file. We keep a
# light fallback here so `check_dependencies` remains callable even if the
# module is missing for some reason — the fallback only checks `claude` and
# exits with a clear message.
check_dependencies() {
    if declare -F ralph_check_dependencies > /dev/null; then
        ralph_check_dependencies
        return
    fi
    if ! command -v claude &> /dev/null; then
        echo "Error: 'claude' CLI not found (lib/dependencies.sh missing too)" >&2
        exit 1
    fi
}

# =============================================================================
# Load library modules
# =============================================================================

load_modules() {
    # Order matters:
    # 1. utils must be loaded first (shared helper functions)
    # 2. sprint-progress and context-reconstruction must be loaded before context-manager
    # 3. v2.0 modules loaded after core modules
    # 4. ASC modules (recovery, escalation, parallel, conductor) loaded last
    local modules=(
        "utils"
        "dependencies"
        "session"
        "loop"
        "dod-validator"
        "dod-templates"
        "circuit-breaker"
        "checkpoint"
        "sprint-progress"
        "context-reconstruction"
        "context-manager"
        "project-detector"
        "config-generator"
        "metrics-exporter"
        "dashboard"
        "health-monitor"
        "hooks-generator"
        "recovery-engine"
        "escalation-service"
        "parallel-manager"
        "sprint-conductor"
    )

    for module in "${modules[@]}"; do
        local module_file="$LIB_DIR/${module}.sh"
        if [[ -f "$module_file" ]]; then
            # shellcheck source=/dev/null
            source "$module_file"
            print_verbose "Loaded module: $module"
        else
            # utils is optional for backwards compatibility
            if [[ "$module" != "utils" ]]; then
                print_warning "Module not found: $module_file"
            fi
        fi
    done
}

# =============================================================================
# Configuration loading
# =============================================================================

load_config() {
    local config_path="${CONFIG_FILE:-$DEFAULT_CONFIG_FILE}"

    # Check multiple locations
    local search_paths=(
        "$config_path"
        ".claude/$config_path"
        "$PWD/$config_path"
    )

    for path in "${search_paths[@]}"; do
        if [[ -f "$path" ]]; then
            print_info "${MSG_CONFIG_LOADING}"

            # Parse YAML config if yq is available
            if command -v yq &> /dev/null; then
                # Session settings with validation
                local max_iter
                max_iter=$(yq e '.session.max_iterations // ""' "$path" 2>/dev/null)
                if [[ -n "$max_iter" ]]; then
                    if [[ "$max_iter" =~ ^[1-9][0-9]*$ ]]; then
                        MAX_ITERATIONS=$max_iter
                    else
                        print_warning "Invalid max_iterations in config: '$max_iter' (using default: $MAX_ITERATIONS)"
                    fi
                fi

                local timeout
                timeout=$(yq e '.session.timeout // ""' "$path" 2>/dev/null)
                if [[ -n "$timeout" ]]; then
                    if [[ "$timeout" =~ ^[0-9]+$ ]]; then
                        TIMEOUT=$timeout
                    else
                        print_warning "Invalid timeout in config: '$timeout' (using default: $TIMEOUT)"
                    fi
                fi

                local delay
                delay=$(yq e '.session.delay_between_iterations // ""' "$path" 2>/dev/null)
                if [[ -n "$delay" ]]; then
                    if [[ "$delay" =~ ^[0-9]+$ ]]; then
                        DELAY=$delay
                    else
                        print_warning "Invalid delay_between_iterations in config: '$delay' (using default: $DELAY)"
                    fi
                fi

                # Circuit breaker settings are loaded in circuit-breaker.sh
                # DoD settings are loaded in dod-validator.sh

                print_success "${MSG_CONFIG_LOADED}: $path"
            else
                print_warning "${MSG_ERROR_YQ_NOT_FOUND} - Using CLI arguments only"
            fi

            CONFIG_FILE="$path"
            return 0
        fi
    done

    print_verbose "${MSG_CONFIG_NOT_FOUND}, ${MSG_CONFIG_USING_DEFAULTS}"
    return 0
}

# =============================================================================
# Help
# =============================================================================

show_help() {
    echo -e "${C_BOLD}${MSG_HELP_USAGE}:${C_RESET}"
    echo "  ralph.sh [options] <prompt>"
    echo ""
    echo -e "${C_BOLD}${MSG_HELP_DESCRIPTION}${C_RESET}"
    echo ""
    echo -e "${C_BOLD}${MSG_HELP_OPTIONS}:${C_RESET}"
    echo "  <prompt>              ${MSG_HELP_PROMPT}"
    echo "  --config=<file>       ${MSG_HELP_CONFIG}"
    echo "  --continue=<id>       ${MSG_HELP_CONTINUE}"
    echo "  --max-iterations=<n>  ${MSG_HELP_MAX_ITER}"
    echo "  --verbose             ${MSG_HELP_VERBOSE}"
    echo "  --dry-run             ${MSG_HELP_DRY_RUN}"
    echo "  --lang=<code>         ${MSG_HELP_LANG}"
    echo "  --help                ${MSG_HELP_HELP}"
    echo ""
    echo -e "${C_BOLD}v2.0 Options:${C_RESET}"
    echo "  --auto-detect         ${MSG_HELP_AUTO_DETECT:-Auto-detect project type and configure DoD}"
    echo "  --init                ${MSG_HELP_INIT:-Generate config without running (init only)}"
    echo "  --interactive         ${MSG_HELP_INTERACTIVE:-Interactive configuration wizard}"
    echo ""
    echo -e "${C_BOLD}v3.0 ASC (Autonomous Sprint Conductor) Options:${C_RESET}"
    echo "  --autonomous          Enable autonomous mode with recovery"
    echo "  --story=<id>          Process specific story (isolated session)"
    echo "  --sprint              Run full sprint conductor"
    echo "  --overnight           Overnight mode (bounded, stops at 6am)"
    echo "  --parallel=<n>        Run up to N stories in parallel"
    echo ""
    echo -e "${C_BOLD}${MSG_HELP_EXAMPLES}:${C_RESET}"
    echo ""
    echo "  # ${MSG_HELP_EXAMPLE_BASIC}"
    echo "  ralph.sh \"Implement user authentication\""
    echo ""
    echo "  # ${MSG_HELP_EXAMPLE_CONFIG}"
    echo "  ralph.sh --config=ralph.yml \"Fix the login bug\""
    echo ""
    echo "  # ${MSG_HELP_EXAMPLE_RESUME}"
    echo "  ralph.sh --continue=abc123"
    echo ""
    echo "  # Auto-detect and generate config"
    echo "  ralph.sh --auto-detect --init"
    echo ""
    echo "  # Interactive configuration"
    echo "  ralph.sh --interactive"
    echo ""
}

# =============================================================================
# Argument parsing
# =============================================================================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --lang=*)
                LANG_ARG="${1#--lang=}"
                # Validate language
                local valid=false
                for l in "${VALID_LANGS[@]}"; do
                    [[ "$LANG_ARG" == "$l" ]] && valid=true
                done
                if ! $valid; then
                    echo -e "${C_RED}Invalid language: $LANG_ARG${C_RESET}"
                    echo "Valid languages: ${VALID_LANGS[*]}"
                    exit 1
                fi
                ;;
            --config=*)
                CONFIG_FILE="${1#--config=}"
                ;;
            --continue=*)
                CONTINUE_SESSION="${1#--continue=}"
                ;;
            --max-iterations=*)
                local value="${1#--max-iterations=}"
                if ! [[ "$value" =~ ^[1-9][0-9]*$ ]]; then
                    echo -e "${C_RED}Error: --max-iterations must be a positive integer, got: '$value'${C_RESET}" >&2
                    exit 1
                fi
                MAX_ITERATIONS="$value"
                ;;
            --timeout=*)
                local value="${1#--timeout=}"
                if ! [[ "$value" =~ ^[0-9]+$ ]]; then
                    echo -e "${C_RED}Error: --timeout must be a non-negative integer, got: '$value'${C_RESET}" >&2
                    exit 1
                fi
                TIMEOUT="$value"
                ;;
            --delay=*)
                local value="${1#--delay=}"
                if ! [[ "$value" =~ ^[0-9]+$ ]]; then
                    echo -e "${C_RED}Error: --delay must be a non-negative integer, got: '$value'${C_RESET}" >&2
                    exit 1
                fi
                DELAY="$value"
                ;;
            --verbose)
                VERBOSE=true
                ;;
            --dry-run)
                DRY_RUN=true
                ;;
            --auto-detect)
                AUTO_DETECT=true
                ;;
            --init)
                INIT_ONLY=true
                ;;
            --interactive)
                INTERACTIVE=true
                ;;
            --autonomous)
                AUTONOMOUS_MODE=true
                ;;
            --story=*)
                STORY_ID="${1#--story=}"
                SESSION_ISOLATED=true
                ;;
            --sprint)
                SPRINT_MODE=true
                ;;
            --overnight)
                OVERNIGHT_MODE=true
                AUTONOMOUS_MODE=true
                ;;
            --parallel=*)
                PARALLEL_ENABLED=true
                PARALLEL_MAX_CONCURRENT="${1#--parallel=}"
                ;;
            --help|-h)
                load_messages
                show_help
                exit 0
                ;;
            -*)
                echo "Unknown option: $1"
                exit 1
                ;;
            *)
                # Positional argument = prompt
                PROMPT="$1"
                ;;
        esac
        shift
    done
}

# =============================================================================
# Main Ralph loop
# =============================================================================

run_ralph() {
    local iteration=0
    local exit_reason=""
    local dod_passed=false
    local response=""
    local start_time=$(date +%s)

    # Initialize v2.0 modules
    if type init_metrics_exporter &>/dev/null; then
        init_metrics_exporter
    fi

    if type init_dashboard &>/dev/null; then
        init_dashboard
    fi

    if type init_health_monitor &>/dev/null; then
        init_health_monitor
    fi

    if type init_hooks &>/dev/null; then
        init_hooks
    fi

    # Initialize or resume session
    if [[ -n "$CONTINUE_SESSION" ]]; then
        SESSION_ID="$CONTINUE_SESSION"
        resume_session "$SESSION_ID" || {
            print_error "${MSG_SESSION_NOT_FOUND}: $SESSION_ID"
            exit 1
        }
        print_success "${MSG_SESSION_RESUMED}: $SESSION_ID"
    else
        SESSION_ID=$(create_session "$PROMPT")
        print_success "${MSG_SESSION_CREATED}: $SESSION_ID"
    fi

    # Initialize circuit breaker
    init_circuit_breaker

    # Enable autonomous mode if requested
    if [[ "$AUTONOMOUS_MODE" == "true" ]]; then
        if type enable_autonomous_mode &>/dev/null; then
            enable_autonomous_mode
        fi

        # Initialize recovery engine
        if type init_recovery_engine &>/dev/null; then
            init_recovery_engine
        fi

        # Initialize escalation service
        if type init_escalation_service &>/dev/null; then
            init_escalation_service
        fi
    fi

    # Initialize context manager (auto-compact)
    if type init_context_manager &>/dev/null; then
        init_context_manager
    fi

    print_info "${MSG_STARTING_LOOP}..."
    print_verbose "${MSG_SESSION_ID}: $SESSION_ID"
    print_verbose "Max iterations: $MAX_ITERATIONS"
    print_verbose "Timeout: ${TIMEOUT}ms"

    # Export session context for hooks
    if type export_session_context_for_hooks &>/dev/null; then
        export_session_context_for_hooks "$SESSION_ID" "STARTING" "$PROMPT"
    fi

    # Main loop
    while [[ $iteration -lt $MAX_ITERATIONS ]]; do
        iteration=$((iteration + 1))
        print_iteration $iteration $MAX_ITERATIONS

        # Record iteration start for metrics
        if type record_iteration_start &>/dev/null; then
            record_iteration_start "$iteration"
        fi

        # Update dashboard
        if type update_dashboard_iteration &>/dev/null; then
            local elapsed=$(($(date +%s) - start_time))
            update_dashboard_iteration "$SESSION_ID" "$iteration" "$MAX_ITERATIONS"
        fi

        # Check circuit breaker (with recovery in autonomous mode)
        if [[ "$AUTONOMOUS_MODE" == "true" ]] && type check_circuit_breaker_with_recovery &>/dev/null; then
            if check_circuit_breaker_with_recovery "$SESSION_ID" "$response"; then
                # Recovery failed - check if we should escalate
                if type create_escalation &>/dev/null; then
                    create_escalation "$SESSION_ID" "blocked" "$CB_TRIGGER_REASON" "Circuit breaker triggered after recovery attempts"
                fi
                exit_reason="circuit_breaker"
                break
            fi
        elif check_circuit_breaker; then
            exit_reason="circuit_breaker"
            break
        fi

        # Dry run mode
        if [[ "$DRY_RUN" == "true" ]]; then
            print_info "[DRY-RUN] Would invoke Claude with session $SESSION_ID"
            continue
        fi

        # Check for preventive compact (before hitting the limit)
        if type check_preventive_compact &>/dev/null; then
            check_preventive_compact "$SESSION_ID"
        fi

        # Check if we have a continuation prompt (after compact/session handoff)
        local effective_prompt="$PROMPT"
        if type get_context_continuation_prompt &>/dev/null; then
            local continuation_prompt
            continuation_prompt=$(get_context_continuation_prompt)
            if [[ -n "$continuation_prompt" ]]; then
                # Prepend continuation context to the prompt
                effective_prompt="$continuation_prompt

---

$PROMPT"
                print_verbose "Using reconstructed context for this iteration"
            fi
        fi

        # Invoke Claude
        print_info "${MSG_INVOKING_CLAUDE}"
        local response
        response=$(invoke_claude "$SESSION_ID" "$effective_prompt" "$TIMEOUT")
        local invoke_status=$?

        if [[ $invoke_status -ne 0 ]]; then
            print_error "${MSG_ERROR}: Claude invocation failed"
            update_circuit_breaker "error" "$response"
            continue
        fi

        # Check for context limit and auto-compact if needed
        if type detect_context_limit &>/dev/null && detect_context_limit "$response"; then
            print_warning "${MSG_CONTEXT_LIMIT_DETECTED:-Context limit detected}"

            if type run_auto_compact &>/dev/null; then
                local compact_result
                compact_result=$(run_auto_compact "$SESSION_ID")
                local compact_status=$?

                case $compact_status in
                    0)
                        # Compact successful - retry with continuation prompt
                        print_info "${MSG_CONTEXT_RETRYING:-Retrying after compact}..."

                        # Get reconstructed context
                        local retry_prompt="$PROMPT"
                        if type get_context_continuation_prompt &>/dev/null; then
                            local cont_prompt
                            cont_prompt=$(get_context_continuation_prompt)
                            if [[ -n "$cont_prompt" ]]; then
                                retry_prompt="$cont_prompt

---

$PROMPT"
                            fi
                        fi

                        response=$(invoke_claude "$SESSION_ID" "$retry_prompt" "$TIMEOUT")
                        invoke_status=$?

                        if [[ $invoke_status -ne 0 ]]; then
                            print_error "${MSG_ERROR}: Claude invocation failed after compact"
                            update_circuit_breaker "error" "context_limit_retry_failed"
                            continue
                        fi
                        ;;
                    3)
                        # Session continuation - new session created
                        SESSION_ID="$compact_result"
                        print_info "Switching to continuation session: $SESSION_ID"

                        # Get handoff prompt for new session
                        local handoff_prompt
                        if type get_session_handoff_prompt &>/dev/null; then
                            handoff_prompt=$(get_session_handoff_prompt "$compact_result")
                        else
                            handoff_prompt="Continue the implementation from where the previous session left off."
                        fi

                        # Retry with new session and handoff context
                        response=$(invoke_claude "$SESSION_ID" "$handoff_prompt

$PROMPT" "$TIMEOUT")
                        invoke_status=$?

                        if [[ $invoke_status -ne 0 ]]; then
                            print_error "${MSG_ERROR}: Claude invocation failed in continuation session"
                            update_circuit_breaker "error" "continuation_session_failed"
                            continue
                        fi
                        ;;
                    *)
                        # Auto-compact failed or max reached without continuation
                        update_circuit_breaker "error" "context_limit"
                        continue
                        ;;
                esac
            else
                # Auto-compact not available - treat as error
                update_circuit_breaker "error" "context_limit"
                continue
            fi
        fi

        # Update metrics
        update_session_metrics "$SESSION_ID" "$iteration" "$response"

        # Record iteration end for metrics
        if type record_iteration_end &>/dev/null; then
            record_iteration_end "$iteration"
        fi

        # Record health data
        if type record_health_data &>/dev/null; then
            local had_error="false"
            [[ $invoke_status -ne 0 ]] && had_error="true"
            record_health_data "$iteration" "$had_error" "${METRICS_DATA["last_context_usage"]:-0}" "${METRICS_DATA["iteration_${iteration}_duration"]:-0}"
        fi

        # Check health patterns
        if type check_health_patterns &>/dev/null; then
            if ! check_health_patterns; then
                if type print_health_warnings &>/dev/null; then
                    print_health_warnings
                fi
            fi
        fi

        # Create checkpoint (async if configured)
        create_checkpoint "$SESSION_ID" "$iteration"

        # Check Definition of Done
        print_info "${MSG_DOD_CHECKING}"
        if validate_dod "$response" "$CONFIG_FILE"; then
            dod_passed=true
            exit_reason="dod_complete"
            print_success "${MSG_DOD_PASSED}"

            # Record DoD check for metrics
            if type record_dod_check &>/dev/null; then
                record_dod_check "true"
            fi

            break
        else
            print_warning "${MSG_DOD_FAILED}"
            update_circuit_breaker "no_progress" ""

            # Record DoD check for metrics
            if type record_dod_check &>/dev/null; then
                record_dod_check "false"
            fi
        fi

        # Record circuit breaker state for metrics
        if type record_circuit_breaker_state &>/dev/null; then
            record_circuit_breaker_state "$CB_TRIGGERED" "$CB_ITERATIONS_WITHOUT_CHANGES"
        fi

        # Feed response back as prompt for next iteration
        PROMPT="$response"

        # Rate limiting delay
        if [[ $DELAY -gt 0 ]]; then
            local delay_sec=$((DELAY / 1000))
            print_verbose "${MSG_WAITING} ${delay_sec} ${MSG_SECONDS}..."
            sleep "$delay_sec"
        fi
    done

    # Check if max iterations reached
    if [[ $iteration -ge $MAX_ITERATIONS && "$dod_passed" != "true" ]]; then
        exit_reason="max_iterations"
        print_warning "${MSG_CB_MAX_REACHED}"
    fi

    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Save sprint progress before summary
    if type save_sprint_progress &>/dev/null; then
        save_sprint_progress "$SESSION_ID"
    fi

    # Save metrics export
    if type save_metrics_export &>/dev/null; then
        local final_status="completed"
        [[ "$dod_passed" != "true" ]] && final_status="failed"
        save_metrics_export "$SESSION_ID" "$final_status"
    fi

    # Aggregate metrics for history
    if type aggregate_session_metrics &>/dev/null; then
        aggregate_session_metrics "$SESSION_ID"
    fi

    # Record circuit breaker outcome for learning
    if type record_circuit_breaker_outcome &>/dev/null && [[ "$CB_ADAPTIVE_ENABLED" == "true" ]]; then
        local success="false"
        [[ "$dod_passed" == "true" ]] && success="true"
        record_circuit_breaker_outcome "$CB_CURRENT_PROFILE" "$success" "$iteration"
    fi

    # Finalize dashboard
    if type finalize_dashboard &>/dev/null; then
        local dash_status="completed"
        [[ "$dod_passed" != "true" ]] && dash_status="failed"
        [[ "$exit_reason" == "circuit_breaker" ]] && dash_status="interrupted"
        finalize_dashboard "$dash_status"
    fi

    # Print summary
    print_summary "$SESSION_ID" "$iteration" "$duration" "$dod_passed" "$exit_reason"

    # Save final state
    save_session "$SESSION_ID" "$exit_reason"

    # Return appropriate exit code
    if [[ "$dod_passed" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# Summary
# =============================================================================

print_summary() {
    local session_id="$1"
    local iterations="$2"
    local duration="$3"
    local dod_passed="$4"
    local exit_reason="$5"

    echo -e "\n${C_CYAN}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_BOLD}📊 ${MSG_SUMMARY_TITLE}${C_RESET}                                ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"

    echo -e "  ${C_BOLD}${MSG_SESSION_ID}:${C_RESET}        $session_id"
    echo -e "  ${C_BOLD}${MSG_SUMMARY_ITERATIONS}:${C_RESET}  $iterations"
    echo -e "  ${C_BOLD}${MSG_SUMMARY_DURATION}:${C_RESET}       ${duration}s"

    if [[ "$dod_passed" == "true" ]]; then
        echo -e "  ${C_BOLD}${MSG_SUMMARY_DOD_STATUS}:${C_RESET}     ${C_GREEN}${MSG_DOD_PASSED}${C_RESET}"
    else
        echo -e "  ${C_BOLD}${MSG_SUMMARY_DOD_STATUS}:${C_RESET}     ${C_RED}${MSG_DOD_FAILED}${C_RESET}"
    fi

    echo -e "  ${C_BOLD}${MSG_SUMMARY_EXIT_REASON}:${C_RESET}   $exit_reason"
    echo ""
}

# =============================================================================
# Main
# =============================================================================

main() {
    # Parse arguments first (before loading messages for --lang)
    parse_args "$@"

    # Load i18n messages
    load_messages

    # Print header
    print_header

    # Check dependencies
    check_dependencies

    # Load library modules
    load_modules

    # Handle --interactive mode
    if [[ "$INTERACTIVE" == "true" ]]; then
        if type interactive_config &>/dev/null; then
            interactive_config "ralph.yml"
            exit 0
        else
            print_error "Interactive mode not available"
            exit 1
        fi
    fi

    # Handle --auto-detect mode
    if [[ "$AUTO_DETECT" == "true" ]]; then
        print_info "${MSG_AUTO_DETECT:-Auto-detecting project type...}"

        if type detect_project_type &>/dev/null; then
            detect_project_type "."
            print_success "Detected: $DETECTED_PROJECT_TYPE ($DETECTED_PROJECT_CONFIDENCE confidence)"

            if type get_detection_summary &>/dev/null; then
                get_detection_summary
            fi
        fi

        # Generate config if --init is also set
        if [[ "$INIT_ONLY" == "true" ]]; then
            if type generate_config &>/dev/null; then
                generate_config "ralph.yml"
            fi

            # Generate hooks config
            if type generate_hooks_config &>/dev/null; then
                generate_hooks_config ".claude/settings.json"
            fi

            exit 0
        fi
    fi

    # Handle --init only mode (without auto-detect)
    if [[ "$INIT_ONLY" == "true" && "$AUTO_DETECT" != "true" ]]; then
        if type generate_config &>/dev/null; then
            # Detect project first
            if type detect_project_type &>/dev/null; then
                detect_project_type "."
            fi
            generate_config "ralph.yml"
        fi
        exit 0
    fi

    # Load configuration
    load_config

    # Handle sprint mode
    if [[ "$SPRINT_MODE" == "true" ]]; then
        if type cmd_sprint_conductor &>/dev/null; then
            local sprint_args=()
            [[ "$OVERNIGHT_MODE" == "true" ]] && sprint_args+=("--overnight")
            [[ -n "$PARALLEL_MAX_CONCURRENT" ]] && sprint_args+=("--parallel" "$PARALLEL_MAX_CONCURRENT")
            [[ -n "$PROMPT" ]] && sprint_args+=("$PROMPT")

            cmd_sprint_conductor "${sprint_args[@]}"
            exit $?
        else
            print_error "Sprint conductor module not available"
            exit 1
        fi
    fi

    # Handle story mode (isolated session)
    if [[ -n "$STORY_ID" ]]; then
        print_info "Running isolated session for story: $STORY_ID"

        # Build prompt from story if not provided
        if [[ -z "$PROMPT" ]]; then
            local bmad_dir="${BMAD_DIR:-.bmad}"
            local status_file="$bmad_dir/sprint-status.yaml"

            if [[ -f "$status_file" ]] && command -v yq &>/dev/null; then
                local title description
                title=$(yq ".stories.${STORY_ID}.title" "$status_file" 2>/dev/null)
                description=$(yq ".stories.${STORY_ID}.description" "$status_file" 2>/dev/null)
                PROMPT="Implement user story $STORY_ID: $title

$description

Follow TDD approach: write tests first (Red), implement code (Green), then refactor (Blue).
Ensure all tests pass before marking as complete."
            else
                PROMPT="Implement story $STORY_ID following TDD approach."
            fi
        fi
    fi

    # Validate we have a prompt or are resuming
    if [[ -z "$PROMPT" && -z "$CONTINUE_SESSION" ]]; then
        print_error "${MSG_ERROR_NO_PROMPT}"
        echo ""
        show_help
        exit 1
    fi

    # Run the main loop
    run_ralph
}

# Run if executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
