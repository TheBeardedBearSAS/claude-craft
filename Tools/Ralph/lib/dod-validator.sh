#!/bin/bash
# =============================================================================
# Ralph Wiggum - Definition of Done Validator Module
# Validates completion criteria using configurable checklist
# =============================================================================

# Default completion marker
DOD_COMPLETION_MARKER="${DOD_COMPLETION_MARKER:-<promise>COMPLETE</promise>}"

# DoD validator types
declare -A DOD_VALIDATORS=(
    ["command"]="validate_command"
    ["output_contains"]="validate_output_contains"
    ["file_changed"]="validate_file_changed"
    ["hook"]="validate_hook"
    ["human"]="validate_human"
)

# =============================================================================
# Main DoD Validation
# =============================================================================

validate_dod() {
    local output="$1"
    local config_file="$2"

    # If no config, use simple completion marker check
    if [[ -z "$config_file" || ! -f "$config_file" ]]; then
        return $(validate_simple_completion "$output")
    fi

    # Check if yq is available for YAML parsing
    if ! command -v yq &> /dev/null; then
        return $(validate_simple_completion "$output")
    fi

    # Get DoD checklist from config
    local checklist=$(yq e '.definition_of_done.checklist // []' "$config_file" 2>/dev/null)

    # If no checklist, use simple completion marker
    if [[ "$checklist" == "[]" || -z "$checklist" ]]; then
        local marker=$(yq e '.definition_of_done.completion_marker // ""' "$config_file" 2>/dev/null)
        if [[ -n "$marker" ]]; then
            DOD_COMPLETION_MARKER="$marker"
        fi
        return $(validate_simple_completion "$output")
    fi

    # Process checklist items
    local all_required_passed=true
    local results=()

    # Get count of checklist items
    local count=$(echo "$checklist" | yq e 'length' -)

    for ((i=0; i<count; i++)); do
        local item=$(yq e ".definition_of_done.checklist[$i]" "$config_file")
        local id=$(echo "$item" | yq e '.id' -)
        local name=$(echo "$item" | yq e '.name' -)
        local type=$(echo "$item" | yq e '.type' -)
        local required=$(echo "$item" | yq e '.required // true' -)

        # Validate based on type
        local passed=false
        local message=""

        case "$type" in
            command)
                local cmd=$(echo "$item" | yq e '.command' -)
                if validate_command "$cmd"; then
                    passed=true
                    message="Command passed"
                else
                    message="Command failed"
                fi
                ;;
            output_contains)
                local pattern=$(echo "$item" | yq e '.pattern' -)
                if validate_output_contains "$output" "$pattern"; then
                    passed=true
                    message="Pattern found"
                else
                    message="Pattern not found"
                fi
                ;;
            file_changed)
                local pattern=$(echo "$item" | yq e '.pattern' -)
                if validate_file_changed "$pattern"; then
                    passed=true
                    message="Files changed"
                else
                    message="No files changed"
                fi
                ;;
            hook)
                local script=$(echo "$item" | yq e '.script' -)
                if validate_hook "$script" "$output"; then
                    passed=true
                    message="Hook passed"
                else
                    message="Hook failed"
                fi
                ;;
            human)
                local prompt=$(echo "$item" | yq e '.prompt // ""' -)
                if validate_human "$name" "$prompt"; then
                    passed=true
                    message="Human approved"
                else
                    message="Human rejected"
                fi
                ;;
            *)
                message="Unknown validator type: $type"
                ;;
        esac

        # Print result
        if [[ "$passed" == "true" ]]; then
            echo -e "  ${C_GREEN}✓${C_RESET} [$id] $name - ${C_GREEN}${MSG_DOD_ITEM_PASSED}${C_RESET}"
        else
            if [[ "$required" == "true" ]]; then
                echo -e "  ${C_RED}✗${C_RESET} [$id] $name - ${C_RED}${MSG_DOD_ITEM_FAILED}${C_RESET} (${MSG_DOD_REQUIRED})"
                all_required_passed=false
            else
                echo -e "  ${C_YELLOW}○${C_RESET} [$id] $name - ${C_YELLOW}${MSG_DOD_ITEM_SKIPPED}${C_RESET} (${MSG_DOD_OPTIONAL})"
            fi
        fi

        # Store result
        results+=("{\"id\":\"$id\",\"passed\":$passed,\"required\":$required,\"message\":\"$message\"}")
    done

    # Return overall result
    if [[ "$all_required_passed" == "true" ]]; then
        echo -e "\n  ${C_GREEN}${MSG_DOD_ALL_REQUIRED_PASSED}${C_RESET}"
        return 0
    else
        echo -e "\n  ${C_RED}${MSG_DOD_MISSING_REQUIRED}${C_RESET}"
        return 1
    fi
}

# =============================================================================
# Simple Completion Check
# =============================================================================

validate_simple_completion() {
    local output="$1"

    if echo "$output" | grep -qF "$DOD_COMPLETION_MARKER"; then
        echo -e "  ${C_GREEN}✓${C_RESET} Completion marker found"
        return 0
    else
        echo -e "  ${C_YELLOW}○${C_RESET} Completion marker not found"
        return 1
    fi
}

# =============================================================================
# Validator: Command
# =============================================================================

validate_command() {
    local cmd="$1"

    echo -e "  ${C_DIM}${MSG_VALIDATOR_COMMAND}: $cmd${C_RESET}"

    # Execute the command
    if eval "$cmd" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# Validator: Output Contains Pattern
# =============================================================================

validate_output_contains() {
    local output="$1"
    local pattern="$2"

    echo -e "  ${C_DIM}${MSG_VALIDATOR_OUTPUT}: $pattern${C_RESET}"

    if echo "$output" | grep -qE "$pattern"; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# Validator: File Changed
# =============================================================================

validate_file_changed() {
    local pattern="$1"

    echo -e "  ${C_DIM}${MSG_VALIDATOR_FILE}: $pattern${C_RESET}"

    # Use git to check for changes matching pattern
    if command -v git &> /dev/null && git rev-parse --git-dir &> /dev/null; then
        local changes=$(git status --porcelain 2>/dev/null | grep -E "$pattern" | wc -l)
        if [[ $changes -gt 0 ]]; then
            return 0
        fi
    else
        # Fallback: check for recently modified files
        local changes=$(find . -name "$pattern" -mmin -5 2>/dev/null | wc -l)
        if [[ $changes -gt 0 ]]; then
            return 0
        fi
    fi

    return 1
}

# =============================================================================
# Validator: Hook
# =============================================================================

validate_hook() {
    local script="$1"
    local output="$2"

    echo -e "  ${C_DIM}${MSG_VALIDATOR_HOOK}: $script${C_RESET}"

    # Check if script exists
    if [[ ! -f "$script" ]]; then
        echo -e "  ${C_RED}Hook script not found: $script${C_RESET}"
        return 1
    fi

    # Prepare input JSON (same format as Claude hooks)
    local input_json=$(jq -n \
        --arg cwd "$PWD" \
        --arg output "$output" \
        '{cwd: $cwd, output: $output}')

    # Execute hook with JSON input
    local result
    result=$(echo "$input_json" | bash "$script" 2>&1)
    local exit_code=$?

    # Check exit code (0 = continue/pass, 2 = block/fail)
    if [[ $exit_code -eq 0 ]]; then
        return 0
    elif [[ $exit_code -eq 2 ]]; then
        return 1
    else
        # Other exit codes treated as errors
        echo -e "  ${C_YELLOW}Hook exited with code $exit_code${C_RESET}"
        return 1
    fi
}

# =============================================================================
# Validator: Human
# =============================================================================

validate_human() {
    local name="$1"
    local prompt="$2"

    echo -e "\n  ${C_MAGENTA}${MSG_DOD_HUMAN_GATE}: $name${C_RESET}"

    # Default prompt if not provided
    if [[ -z "$prompt" ]]; then
        prompt="${MSG_DOD_HUMAN_PROMPT}"
    fi

    # Ask for human input
    echo -ne "  ${C_BOLD}$prompt ${C_RESET}"
    read -r response

    # Check response
    case "${response,,}" in
        y|yes|o|oui|s|si|j|ja|sim)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# =============================================================================
# DoD Result Storage
# =============================================================================

store_dod_results() {
    local session_id="$1"
    local results="$2"

    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ ! -f "$state_file" ]]; then
        return 1
    fi

    # Store results to separate JSON file
    local results_file="$session_dir/dod_results.json"
    if ! echo "$results" | jq -s '.' > "$results_file" 2>/dev/null; then
        return 1
    fi

    # Update state file (with error handling and atomic operation)
    local tmp_file="${state_file}.tmp.$$"
    if jq --slurpfile results "$results_file" '.dod_results = $results[0]' "$state_file" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$state_file"
        return 0
    else
        rm -f "$tmp_file"
        return 1
    fi
}

# =============================================================================
# DoD Validation for Hooks (v2.0)
# =============================================================================
# Returns exit code 2 to block Claude if DoD not satisfied

validate_dod_for_hook() {
    local output="$1"
    local config_file="${2:-$CONFIG_FILE}"

    # Perform validation
    local result
    result=$(validate_dod "$output" "$config_file" 2>&1)
    local status=$?

    if [[ $status -eq 0 ]]; then
        # DoD passed - allow
        return 0
    else
        # DoD not satisfied - block (exit code 2 for hooks)
        return 2
    fi
}

# =============================================================================
# Export DoD Status for Hooks Context
# =============================================================================

export_dod_status() {
    local config_file="${1:-$CONFIG_FILE}"
    local output=""

    # If no config, return simple status
    if [[ -z "$config_file" || ! -f "$config_file" ]]; then
        echo "DoD: Simple completion marker mode"
        return
    fi

    # Check if yq is available
    if ! command -v yq &>/dev/null; then
        echo "DoD: Config present but yq unavailable"
        return
    fi

    # Get checklist
    local checklist
    checklist=$(yq e '.definition_of_done.checklist // []' "$config_file" 2>/dev/null)

    if [[ "$checklist" == "[]" || -z "$checklist" ]]; then
        local marker
        marker=$(yq e '.definition_of_done.completion_marker // "<promise>COMPLETE</promise>"' "$config_file" 2>/dev/null)
        echo "DoD: Completion marker ($marker)"
        return
    fi

    # Count checks
    local total
    total=$(echo "$checklist" | yq e 'length' -)

    local required=0
    for ((i=0; i<total; i++)); do
        local is_required
        is_required=$(yq e ".definition_of_done.checklist[$i].required // true" "$config_file" 2>/dev/null)
        if [[ "$is_required" == "true" ]]; then
            required=$((required + 1))
        fi
    done

    echo "DoD: $required required checks configured ($total total)"
}

# =============================================================================
# Get DoD Checklist Summary
# =============================================================================

get_dod_summary() {
    local config_file="${1:-$CONFIG_FILE}"

    if [[ -z "$config_file" || ! -f "$config_file" ]]; then
        echo '{"mode": "marker", "checks": []}'
        return
    fi

    if ! command -v yq &>/dev/null; then
        echo '{"mode": "marker", "checks": []}'
        return
    fi

    local checklist
    checklist=$(yq e '.definition_of_done.checklist // []' "$config_file" 2>/dev/null)

    if [[ "$checklist" == "[]" || -z "$checklist" ]]; then
        local marker
        marker=$(yq e '.definition_of_done.completion_marker // "<promise>COMPLETE</promise>"' "$config_file" 2>/dev/null)
        echo "{\"mode\": \"marker\", \"marker\": \"$marker\", \"checks\": []}"
        return
    fi

    # Build summary
    local count
    count=$(echo "$checklist" | yq e 'length' -)

    local checks="["
    for ((i=0; i<count; i++)); do
        local id name required
        id=$(yq e ".definition_of_done.checklist[$i].id" "$config_file" 2>/dev/null)
        name=$(yq e ".definition_of_done.checklist[$i].name" "$config_file" 2>/dev/null)
        required=$(yq e ".definition_of_done.checklist[$i].required // true" "$config_file" 2>/dev/null)

        [[ $i -gt 0 ]] && checks="$checks,"
        checks="$checks{\"id\":\"$id\",\"name\":\"$name\",\"required\":$required}"
    done
    checks="$checks]"

    echo "{\"mode\": \"checklist\", \"checks\": $checks}"
}
