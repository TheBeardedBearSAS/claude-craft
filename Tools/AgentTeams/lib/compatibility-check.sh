#!/usr/bin/env bash
# =============================================================================
# Agent Teams - Compatibility Checker
# Validates that an agent's frontmatter (tools, model) meets a role's
# requirements in a team template. Prevents silent failures from tool
# restrictions (see devils-advocate.md Section 3.4).
# =============================================================================

set -euo pipefail

# =============================================================================
# Constants
# =============================================================================

readonly VERSION="1.0.0"
readonly SCRIPT_NAME="$(basename "$0")"

# All known Claude Code tools
readonly ALL_TOOLS=(
    "Read" "Write" "Edit" "Glob" "Grep" "Bash"
    "Task" "NotebookEdit" "WebFetch" "WebSearch"
    "SendMessage" "TaskCreate" "TaskUpdate" "TaskList" "TaskGet"
)

# Model capability tiers (higher = more capable)
declare -A MODEL_TIERS=(
    ["opus"]=3
    ["sonnet"]=2
    ["haiku"]=1
)

# Exit codes
readonly EXIT_OK=0
readonly EXIT_INCOMPATIBLE=1
readonly EXIT_USAGE=2
readonly EXIT_FILE_ERROR=3

# Colors (disabled if not a terminal)
if [[ -t 1 ]]; then
    readonly RED='\033[0;31m'
    readonly GREEN='\033[0;32m'
    readonly YELLOW='\033[0;33m'
    readonly BLUE='\033[0;34m'
    readonly BOLD='\033[1m'
    readonly NC='\033[0m'
else
    readonly RED=''
    readonly GREEN=''
    readonly YELLOW=''
    readonly BLUE=''
    readonly BOLD=''
    readonly NC=''
fi

# =============================================================================
# Usage
# =============================================================================

show_help() {
    cat <<EOF
${BOLD}${SCRIPT_NAME}${NC} v${VERSION} - Agent Teams Compatibility Checker

Validates that an agent's frontmatter configuration (tools, model, skills)
meets the requirements of a specific role in a team template.

${BOLD}USAGE${NC}
    ${SCRIPT_NAME} --agent <agent.md> --require-tools <tool1,tool2,...> [OPTIONS]
    ${SCRIPT_NAME} --agent <agent.md> --role-file <role.yaml> [OPTIONS]
    ${SCRIPT_NAME} --agent-dir <dir> --require-tools <tools> [--batch]

${BOLD}OPTIONS${NC}
    -a, --agent <path>          Path to agent .md file with YAML frontmatter
    -d, --agent-dir <dir>       Directory of agent .md files (batch mode)
    -t, --require-tools <list>  Comma-separated list of required tools
    -m, --require-model <tier>  Minimum model tier: haiku, sonnet, opus
    -s, --require-skills <list> Comma-separated list of required skills
    -r, --role-file <path>      YAML file defining role requirements
    -b, --batch                 Check all agents in --agent-dir against requirements
    -n, --dry-run               Show what would be checked without running validation
    -q, --quiet                 Only output errors (exit code indicates result)
    -j, --json                  Output results as JSON
    -h, --help                  Show this help message
    -v, --version               Show version

${BOLD}ROLE FILE FORMAT${NC} (YAML)
    required_tools:
      - Edit
      - Write
      - Bash
    minimum_model: sonnet
    required_skills:
      - testing
    disallowed_tools_ok: false

${BOLD}EXAMPLES${NC}
    # Check if tdd-coach can perform implementation work
    ${SCRIPT_NAME} --agent agents/tdd-coach.md --require-tools Edit,Write,Bash

    # Check minimum model tier
    ${SCRIPT_NAME} --agent agents/research-assistant.md --require-model sonnet

    # Batch check all agents for audit capability
    ${SCRIPT_NAME} --agent-dir agents/ --require-tools Read,Glob,Grep,Bash --batch

    # Dry run to see what would be validated
    ${SCRIPT_NAME} --agent agents/tdd-coach.md --require-tools Edit,Write --dry-run

    # Use a role definition file
    ${SCRIPT_NAME} --agent agents/tdd-coach.md --role-file roles/implementer.yaml

${BOLD}EXIT CODES${NC}
    0  Agent is compatible with role requirements
    1  Agent is incompatible (missing tools, insufficient model, etc.)
    2  Usage error (invalid arguments)
    3  File error (agent file not found, parse error)

EOF
}

show_version() {
    echo "${SCRIPT_NAME} v${VERSION}"
}

# =============================================================================
# Logging
# =============================================================================

log_info() {
    [[ "${QUIET:-false}" == "true" ]] && return
    printf "${BLUE}[INFO]${NC} %s\n" "$1"
}

log_ok() {
    [[ "${QUIET:-false}" == "true" ]] && return
    printf "${GREEN}[PASS]${NC} %s\n" "$1"
}

log_warn() {
    printf "${YELLOW}[WARN]${NC} %s\n" "$1"
}

log_fail() {
    printf "${RED}[FAIL]${NC} %s\n" "$1"
}

log_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1" >&2
}

# =============================================================================
# Frontmatter Parser
# Extracts YAML frontmatter between --- delimiters from an agent .md file
# =============================================================================

# Parse the YAML frontmatter and set global variables:
#   AGENT_NAME, AGENT_MODEL, AGENT_TOOLS[], AGENT_DISALLOWED_TOOLS[], AGENT_SKILLS[]
parse_agent_frontmatter() {
    local agent_file="$1"

    if [[ ! -f "$agent_file" ]]; then
        log_error "Agent file not found: $agent_file"
        return $EXIT_FILE_ERROR
    fi

    # Read the frontmatter block (between first and second ---)
    local in_frontmatter=false
    local frontmatter=""

    while IFS= read -r line; do
        if [[ "$line" == "---" ]]; then
            if [[ "$in_frontmatter" == "true" ]]; then
                break  # End of frontmatter
            else
                in_frontmatter=true
                continue
            fi
        fi
        if [[ "$in_frontmatter" == "true" ]]; then
            frontmatter+="$line"$'\n'
        fi
    done < "$agent_file"

    if [[ -z "$frontmatter" ]]; then
        log_error "No YAML frontmatter found in: $agent_file"
        return $EXIT_FILE_ERROR
    fi

    # Parse individual fields
    AGENT_NAME=""
    AGENT_MODEL=""
    AGENT_TOOLS=()
    AGENT_DISALLOWED_TOOLS=()
    AGENT_SKILLS=()
    AGENT_HAS_MEMORY=""

    local current_list=""

    while IFS= read -r line; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        # Detect top-level keys (no leading whitespace)
        if [[ "$line" =~ ^([a-zA-Z_-]+):[[:space:]]*(.*) ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"

            # Trim whitespace
            value="${value#"${value%%[![:space:]]*}"}"
            value="${value%"${value##*[![:space:]]}"}"

            case "$key" in
                name)
                    AGENT_NAME="$value"
                    current_list=""
                    ;;
                model)
                    AGENT_MODEL="$value"
                    current_list=""
                    ;;
                memory)
                    AGENT_HAS_MEMORY="$value"
                    current_list=""
                    ;;
                tools)
                    current_list="tools"
                    # Handle inline list: tools: [Read, Write]
                    if [[ "$value" =~ ^\[.*\]$ ]]; then
                        local items="${value#[}"
                        items="${items%]}"
                        IFS=',' read -ra parts <<< "$items"
                        for part in "${parts[@]}"; do
                            part="${part#"${part%%[![:space:]]*}"}"
                            part="${part%"${part##*[![:space:]]}"}"
                            [[ -n "$part" ]] && AGENT_TOOLS+=("$part")
                        done
                        current_list=""
                    fi
                    ;;
                disallowedTools)
                    current_list="disallowed"
                    if [[ "$value" =~ ^\[.*\]$ ]]; then
                        local items="${value#[}"
                        items="${items%]}"
                        IFS=',' read -ra parts <<< "$items"
                        for part in "${parts[@]}"; do
                            part="${part#"${part%%[![:space:]]*}"}"
                            part="${part%"${part##*[![:space:]]}"}"
                            [[ -n "$part" ]] && AGENT_DISALLOWED_TOOLS+=("$part")
                        done
                        current_list=""
                    fi
                    ;;
                skills)
                    current_list="skills"
                    if [[ "$value" =~ ^\[.*\]$ ]]; then
                        local items="${value#[}"
                        items="${items%]}"
                        IFS=',' read -ra parts <<< "$items"
                        for part in "${parts[@]}"; do
                            part="${part#"${part%%[![:space:]]*}"}"
                            part="${part%"${part##*[![:space:]]}"}"
                            [[ -n "$part" ]] && AGENT_SKILLS+=("$part")
                        done
                        current_list=""
                    fi
                    ;;
                permissionMode|description)
                    current_list=""
                    ;;
                *)
                    current_list=""
                    ;;
            esac
        # Detect list items (  - value)
        elif [[ "$line" =~ ^[[:space:]]+-[[:space:]]+(.*) ]]; then
            local item="${BASH_REMATCH[1]}"
            item="${item#"${item%%[![:space:]]*}"}"
            item="${item%"${item##*[![:space:]]}"}"

            case "$current_list" in
                tools)
                    AGENT_TOOLS+=("$item")
                    ;;
                disallowed)
                    AGENT_DISALLOWED_TOOLS+=("$item")
                    ;;
                skills)
                    AGENT_SKILLS+=("$item")
                    ;;
            esac
        else
            # Non-list, non-key line resets list context
            current_list=""
        fi
    done <<< "$frontmatter"

    return 0
}

# =============================================================================
# Role Requirements Parser (from YAML file)
# =============================================================================

parse_role_file() {
    local role_file="$1"

    if [[ ! -f "$role_file" ]]; then
        log_error "Role file not found: $role_file"
        return $EXIT_FILE_ERROR
    fi

    ROLE_REQUIRED_TOOLS=()
    ROLE_MINIMUM_MODEL=""
    ROLE_REQUIRED_SKILLS=()

    local current_list=""

    while IFS= read -r line; do
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        if [[ "$line" =~ ^([a-zA-Z_-]+):[[:space:]]*(.*) ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            value="${value#"${value%%[![:space:]]*}"}"
            value="${value%"${value##*[![:space:]]}"}"

            case "$key" in
                required_tools)
                    current_list="req_tools"
                    ;;
                minimum_model)
                    ROLE_MINIMUM_MODEL="$value"
                    current_list=""
                    ;;
                required_skills)
                    current_list="req_skills"
                    ;;
                *)
                    current_list=""
                    ;;
            esac
        elif [[ "$line" =~ ^[[:space:]]+-[[:space:]]+(.*) ]]; then
            local item="${BASH_REMATCH[1]}"
            item="${item#"${item%%[![:space:]]*}"}"
            item="${item%"${item##*[![:space:]]}"}"

            case "$current_list" in
                req_tools)
                    ROLE_REQUIRED_TOOLS+=("$item")
                    ;;
                req_skills)
                    ROLE_REQUIRED_SKILLS+=("$item")
                    ;;
            esac
        fi
    done < "$role_file"

    return 0
}

# =============================================================================
# Validation Logic
# =============================================================================

# Check if a tool is in the agent's effective tool set
# An agent has a tool if:
#   - tools list is empty (no restrictions, all tools available)
#   - tool is in the tools list AND not in disallowedTools
agent_has_tool() {
    local tool="$1"

    # Check disallowed first (always takes precedence)
    for disallowed in "${AGENT_DISALLOWED_TOOLS[@]}"; do
        if [[ "$disallowed" == "$tool" ]]; then
            return 1
        fi
    done

    # If no tools list specified, agent has all tools (default)
    if [[ ${#AGENT_TOOLS[@]} -eq 0 ]]; then
        return 0
    fi

    # Check if tool is in the allowed list
    for allowed in "${AGENT_TOOLS[@]}"; do
        # Handle Task(Type) restriction syntax
        local task_prefix_re='^Task\('
        if [[ "$allowed" =~ $task_prefix_re ]]; then
            if [[ "$tool" == "Task" ]]; then
                return 0  # Has Task but with type restriction
            fi
        fi
        if [[ "$allowed" == "$tool" ]]; then
            return 0
        fi
    done

    return 1
}

# Check if the agent's Task tool has a type restriction
# Returns the restriction type or empty string
get_task_restriction() {
    local task_re='^Task\(([^)]+)\)$'
    for tool in "${AGENT_TOOLS[@]}"; do
        if [[ "$tool" =~ $task_re ]]; then
            echo "${BASH_REMATCH[1]}"
            return 0
        fi
    done
    echo ""
    return 0
}

# Get model tier (numeric)
get_model_tier() {
    local model="$1"
    echo "${MODEL_TIERS[$model]:-0}"
}

# Validate agent against requirements
# Returns 0 if compatible, 1 if not
validate_agent() {
    local agent_file="$1"
    local -a required_tools=()
    local minimum_model=""
    local -a required_skills=()

    # Shift past agent_file
    shift

    # Parse remaining args
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --tools)
                IFS=',' read -ra required_tools <<< "$2"
                shift 2
                ;;
            --model)
                minimum_model="$2"
                shift 2
                ;;
            --skills)
                IFS=',' read -ra required_skills <<< "$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done

    # Parse agent frontmatter
    if ! parse_agent_frontmatter "$agent_file"; then
        return $EXIT_FILE_ERROR
    fi

    local agent_display="${AGENT_NAME:-$(basename "$agent_file" .md)}"
    local has_failures=false

    log_info "Checking agent: ${BOLD}${agent_display}${NC}"
    log_info "  File: $agent_file"
    log_info "  Model: ${AGENT_MODEL:-default}"
    log_info "  Tools: ${AGENT_TOOLS[*]:-all (no restrictions)}"
    [[ ${#AGENT_DISALLOWED_TOOLS[@]} -gt 0 ]] && \
        log_info "  Disallowed: ${AGENT_DISALLOWED_TOOLS[*]}"
    [[ ${#AGENT_SKILLS[@]} -gt 0 ]] && \
        log_info "  Skills: ${AGENT_SKILLS[*]}"

    # --- Tool checks ---
    if [[ ${#required_tools[@]} -gt 0 ]]; then
        log_info "Checking required tools: ${required_tools[*]}"
        for tool in "${required_tools[@]}"; do
            tool="${tool#"${tool%%[![:space:]]*}"}"
            tool="${tool%"${tool##*[![:space:]]}"}"

            if agent_has_tool "$tool"; then
                log_ok "  Tool '$tool' available"
            else
                log_fail "  Tool '$tool' MISSING - agent cannot perform this role"
                has_failures=true

                # Provide actionable details
                local in_disallowed=false
                for d in "${AGENT_DISALLOWED_TOOLS[@]}"; do
                    [[ "$d" == "$tool" ]] && in_disallowed=true
                done

                if [[ "$in_disallowed" == "true" ]]; then
                    log_fail "    Reason: '$tool' is in disallowedTools"
                elif [[ ${#AGENT_TOOLS[@]} -gt 0 ]]; then
                    log_fail "    Reason: '$tool' not listed in tools (restricted agent)"
                fi
            fi
        done
    fi

    # --- Task tool type restriction check ---
    local task_restriction
    task_restriction=$(get_task_restriction)
    if [[ -n "$task_restriction" ]]; then
        log_warn "  Task tool restricted to type: $task_restriction"
        # Check if any required tool is Task (without restriction)
        for tool in "${required_tools[@]}"; do
            if [[ "$tool" == "Task" ]]; then
                log_warn "  Role requires unrestricted Task but agent has Task($task_restriction)"
            fi
        done
    fi

    # --- Model tier check ---
    if [[ -n "$minimum_model" ]]; then
        log_info "Checking minimum model: $minimum_model"
        local required_tier
        required_tier=$(get_model_tier "$minimum_model")
        local agent_model="${AGENT_MODEL:-sonnet}"  # default to sonnet if unspecified
        local agent_tier
        agent_tier=$(get_model_tier "$agent_model")

        if [[ $agent_tier -ge $required_tier ]]; then
            log_ok "  Model '${agent_model}' meets minimum '${minimum_model}' (tier ${agent_tier} >= ${required_tier})"
        else
            log_fail "  Model '${agent_model}' below minimum '${minimum_model}' (tier ${agent_tier} < ${required_tier})"
            has_failures=true
        fi
    fi

    # --- Skills check ---
    if [[ ${#required_skills[@]} -gt 0 ]]; then
        log_info "Checking required skills: ${required_skills[*]}"
        for skill in "${required_skills[@]}"; do
            skill="${skill#"${skill%%[![:space:]]*}"}"
            skill="${skill%"${skill##*[![:space:]]}"}"

            local found=false
            for agent_skill in "${AGENT_SKILLS[@]}"; do
                if [[ "$agent_skill" == "$skill" ]]; then
                    found=true
                    break
                fi
            done

            if [[ "$found" == "true" ]]; then
                log_ok "  Skill '$skill' available"
            else
                log_warn "  Skill '$skill' not declared (may still work but not optimized)"
            fi
        done
    fi

    if [[ "$has_failures" == "true" ]]; then
        return $EXIT_INCOMPATIBLE
    fi

    return $EXIT_OK
}

# =============================================================================
# JSON Output
# =============================================================================

output_json_result() {
    local agent_file="$1"
    local compatible="$2"
    local -a missing_tools=("${@:3}")

    local agent_display="${AGENT_NAME:-$(basename "$agent_file" .md)}"

    printf '{\n'
    printf '  "agent": "%s",\n' "$agent_display"
    printf '  "file": "%s",\n' "$agent_file"
    printf '  "model": "%s",\n' "${AGENT_MODEL:-default}"
    printf '  "compatible": %s,\n' "$compatible"

    # Tools array
    printf '  "tools": ['
    local first=true
    for t in "${AGENT_TOOLS[@]}"; do
        [[ "$first" == "true" ]] && first=false || printf ','
        printf '"%s"' "$t"
    done
    printf '],\n'

    # Missing tools
    printf '  "missing_tools": ['
    first=true
    for t in "${missing_tools[@]}"; do
        [[ "$first" == "true" ]] && first=false || printf ','
        printf '"%s"' "$t"
    done
    printf ']\n'

    printf '}\n'
}

# =============================================================================
# Dry Run
# =============================================================================

do_dry_run() {
    local agent_file="$1"
    local require_tools="$2"
    local require_model="$3"
    local require_skills="$4"

    echo ""
    echo "${BOLD}=== DRY RUN ===${NC}"
    echo ""
    echo "Would perform the following compatibility check:"
    echo ""

    if [[ -n "$agent_file" ]]; then
        echo "  Agent file:     $agent_file"
        if [[ -f "$agent_file" ]]; then
            echo "  File exists:    yes"
            # Parse for display only
            if parse_agent_frontmatter "$agent_file" 2>/dev/null; then
                echo "  Agent name:     ${AGENT_NAME:-<not set>}"
                echo "  Agent model:    ${AGENT_MODEL:-<default>}"
                echo "  Agent tools:    ${AGENT_TOOLS[*]:-<all, no restrictions>}"
                [[ ${#AGENT_DISALLOWED_TOOLS[@]} -gt 0 ]] && \
                    echo "  Disallowed:     ${AGENT_DISALLOWED_TOOLS[*]}"
                [[ ${#AGENT_SKILLS[@]} -gt 0 ]] && \
                    echo "  Agent skills:   ${AGENT_SKILLS[*]}"
            else
                echo "  Parse status:   FAILED (no frontmatter found)"
            fi
        else
            echo "  File exists:    NO"
        fi
    fi

    echo ""
    echo "  Requirements:"
    [[ -n "$require_tools" ]] && echo "    Tools:        $require_tools"
    [[ -n "$require_model" ]] && echo "    Min model:    $require_model"
    [[ -n "$require_skills" ]] && echo "    Skills:       $require_skills"
    echo ""
    echo "No validation performed (dry run)."
    echo ""
}

# =============================================================================
# Batch Mode
# =============================================================================

do_batch_check() {
    local agent_dir="$1"
    local require_tools="$2"
    local require_model="$3"
    local require_skills="$4"
    local use_json="${5:-false}"

    if [[ ! -d "$agent_dir" ]]; then
        log_error "Agent directory not found: $agent_dir"
        return $EXIT_FILE_ERROR
    fi

    local total=0
    local passed=0
    local failed=0
    local errors=0
    local -a failed_agents=()

    [[ "$use_json" == "true" ]] && printf '[\n'
    local first_json=true

    for agent_file in "$agent_dir"/*.md; do
        [[ ! -f "$agent_file" ]] && continue
        total=$((total + 1))

        local args=()
        [[ -n "$require_tools" ]] && args+=(--tools "$require_tools")
        [[ -n "$require_model" ]] && args+=(--model "$require_model")
        [[ -n "$require_skills" ]] && args+=(--skills "$require_skills")

        if validate_agent "$agent_file" "${args[@]}" 2>/dev/null; then
            passed=$((passed + 1))
        else
            local rc=$?
            if [[ $rc -eq $EXIT_FILE_ERROR ]]; then
                errors=$((errors + 1))
            else
                failed=$((failed + 1))
                failed_agents+=("$(basename "$agent_file" .md)")
            fi
        fi

        echo ""  # Separator between agents
    done

    [[ "$use_json" == "true" ]] && printf ']\n'

    # Summary
    echo "${BOLD}========================================${NC}"
    echo "${BOLD}Batch Compatibility Summary${NC}"
    echo "${BOLD}========================================${NC}"
    echo "  Directory:    $agent_dir"
    echo "  Total agents: $total"
    printf "  ${GREEN}Compatible:   %d${NC}\n" "$passed"
    [[ $failed -gt 0 ]] && printf "  ${RED}Incompatible: %d${NC}\n" "$failed"
    [[ $errors -gt 0 ]] && printf "  ${YELLOW}Parse errors: %d${NC}\n" "$errors"

    if [[ ${#failed_agents[@]} -gt 0 ]]; then
        echo ""
        echo "  Incompatible agents:"
        for agent in "${failed_agents[@]}"; do
            printf "    ${RED}- %s${NC}\n" "$agent"
        done
    fi

    echo "${BOLD}========================================${NC}"

    [[ $failed -gt 0 || $errors -gt 0 ]] && return $EXIT_INCOMPATIBLE
    return $EXIT_OK
}

# =============================================================================
# Main
# =============================================================================

main() {
    local agent_file=""
    local agent_dir=""
    local require_tools=""
    local require_model=""
    local require_skills=""
    local role_file=""
    local batch=false
    local dry_run=false
    local use_json=false
    QUIET=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -a|--agent)
                agent_file="$2"
                shift 2
                ;;
            -d|--agent-dir)
                agent_dir="$2"
                shift 2
                ;;
            -t|--require-tools)
                require_tools="$2"
                shift 2
                ;;
            -m|--require-model)
                require_model="$2"
                shift 2
                ;;
            -s|--require-skills)
                require_skills="$2"
                shift 2
                ;;
            -r|--role-file)
                role_file="$2"
                shift 2
                ;;
            -b|--batch)
                batch=true
                shift
                ;;
            -n|--dry-run)
                dry_run=true
                shift
                ;;
            -q|--quiet)
                QUIET=true
                shift
                ;;
            -j|--json)
                use_json=true
                shift
                ;;
            -h|--help)
                show_help
                exit $EXIT_OK
                ;;
            -v|--version)
                show_version
                exit $EXIT_OK
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information." >&2
                exit $EXIT_USAGE
                ;;
        esac
    done

    # Load role file requirements if provided
    if [[ -n "$role_file" ]]; then
        if ! parse_role_file "$role_file"; then
            exit $EXIT_FILE_ERROR
        fi
        # Merge role file requirements with CLI requirements
        if [[ ${#ROLE_REQUIRED_TOOLS[@]} -gt 0 && -z "$require_tools" ]]; then
            require_tools=$(IFS=','; echo "${ROLE_REQUIRED_TOOLS[*]}")
        fi
        if [[ -n "$ROLE_MINIMUM_MODEL" && -z "$require_model" ]]; then
            require_model="$ROLE_MINIMUM_MODEL"
        fi
        if [[ ${#ROLE_REQUIRED_SKILLS[@]} -gt 0 && -z "$require_skills" ]]; then
            require_skills=$(IFS=','; echo "${ROLE_REQUIRED_SKILLS[*]}")
        fi
    fi

    # Validate inputs
    if [[ -z "$agent_file" && -z "$agent_dir" ]]; then
        log_error "Must specify --agent <file> or --agent-dir <dir>"
        echo "Use --help for usage information." >&2
        exit $EXIT_USAGE
    fi

    if [[ -z "$require_tools" && -z "$require_model" && -z "$require_skills" ]]; then
        log_error "Must specify at least one requirement: --require-tools, --require-model, or --require-skills"
        echo "Use --help for usage information." >&2
        exit $EXIT_USAGE
    fi

    # Dry run mode
    if [[ "$dry_run" == "true" ]]; then
        if [[ "$batch" == "true" && -n "$agent_dir" ]]; then
            echo ""
            echo "${BOLD}=== DRY RUN (Batch) ===${NC}"
            echo ""
            echo "Would check all .md files in: $agent_dir"
            local count=0
            for f in "$agent_dir"/*.md; do
                [[ -f "$f" ]] && count=$((count + 1)) && echo "  - $(basename "$f")"
            done
            echo ""
            echo "  Total files: $count"
            echo "  Requirements:"
            [[ -n "$require_tools" ]] && echo "    Tools:     $require_tools"
            [[ -n "$require_model" ]] && echo "    Min model: $require_model"
            [[ -n "$require_skills" ]] && echo "    Skills:    $require_skills"
            echo ""
            echo "No validation performed (dry run)."
        else
            do_dry_run "$agent_file" "$require_tools" "$require_model" "$require_skills"
        fi
        exit $EXIT_OK
    fi

    # Batch mode
    if [[ "$batch" == "true" ]]; then
        if [[ -z "$agent_dir" ]]; then
            log_error "--batch requires --agent-dir"
            exit $EXIT_USAGE
        fi
        do_batch_check "$agent_dir" "$require_tools" "$require_model" "$require_skills" "$use_json"
        exit $?
    fi

    # Single agent check
    local args=()
    [[ -n "$require_tools" ]] && args+=(--tools "$require_tools")
    [[ -n "$require_model" ]] && args+=(--model "$require_model")
    [[ -n "$require_skills" ]] && args+=(--skills "$require_skills")

    if validate_agent "$agent_file" "${args[@]}"; then
        echo ""
        log_ok "${BOLD}Agent is COMPATIBLE with role requirements${NC}"
        exit $EXIT_OK
    else
        local rc=$?
        echo ""
        if [[ $rc -eq $EXIT_FILE_ERROR ]]; then
            log_error "Could not parse agent file"
        else
            log_fail "${BOLD}Agent is INCOMPATIBLE with role requirements${NC}"
        fi
        exit $rc
    fi
}

# Run only if executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
