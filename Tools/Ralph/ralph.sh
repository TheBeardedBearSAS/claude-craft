#!/bin/bash
# =============================================================================
# Ralph Wiggum - Continuous AI Agent Loop
# Run Claude in a continuous loop until task completion
# =============================================================================

set -e

# Version
RALPH_VERSION="1.0.0"

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

check_dependencies() {
    local missing=()

    # Check for claude command
    if ! command -v claude &> /dev/null; then
        missing+=("claude")
    fi

    # Check for jq (JSON parsing)
    if ! command -v jq &> /dev/null; then
        missing+=("jq")
    fi

    # Check for git (optional but recommended for checkpointing)
    if ! command -v git &> /dev/null; then
        print_warning "${MSG_ERROR_GIT_NOT_FOUND}"
    fi

    # Check for yq (YAML parsing - optional)
    if ! command -v yq &> /dev/null; then
        print_verbose "${MSG_ERROR_YQ_NOT_FOUND}"
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        print_error "${MSG_ERROR}: Missing required dependencies: ${missing[*]}"
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
    local modules=(
        "utils"
        "session"
        "loop"
        "dod-validator"
        "circuit-breaker"
        "checkpoint"
        "sprint-progress"
        "context-reconstruction"
        "context-manager"
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
    local start_time=$(date +%s)

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

    # Initialize context manager (auto-compact)
    if type init_context_manager &>/dev/null; then
        init_context_manager
    fi

    print_info "${MSG_STARTING_LOOP}..."
    print_verbose "${MSG_SESSION_ID}: $SESSION_ID"
    print_verbose "Max iterations: $MAX_ITERATIONS"
    print_verbose "Timeout: ${TIMEOUT}ms"

    # Main loop
    while [[ $iteration -lt $MAX_ITERATIONS ]]; do
        iteration=$((iteration + 1))
        print_iteration $iteration $MAX_ITERATIONS

        # Check circuit breaker
        if check_circuit_breaker; then
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

        # Create checkpoint (async if configured)
        create_checkpoint "$SESSION_ID" "$iteration"

        # Check Definition of Done
        print_info "${MSG_DOD_CHECKING}"
        if validate_dod "$response" "$CONFIG_FILE"; then
            dod_passed=true
            exit_reason="dod_complete"
            print_success "${MSG_DOD_PASSED}"
            break
        else
            print_warning "${MSG_DOD_FAILED}"
            update_circuit_breaker "no_progress" ""
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

    # Load configuration
    load_config

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
