#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Recovery Engine Module
# Autonomous error classification and recovery system
# Enables self-healing before circuit breaker trips
# =============================================================================

# Recovery engine state
RECOVERY_ENABLED="${RECOVERY_ENABLED:-true}"
RECOVERY_MAX_ATTEMPTS="${RECOVERY_MAX_ATTEMPTS:-3}"
RECOVERY_CURRENT_ATTEMPT=0
RECOVERY_LAST_ERROR=""
RECOVERY_LAST_LEVEL=-1
RECOVERY_AUTO_FIX_LINT="${RECOVERY_AUTO_FIX_LINT:-true}"
RECOVERY_AUTO_FIX_TESTS="${RECOVERY_AUTO_FIX_TESTS:-retry_tdd}"
RECOVERY_AUTO_RETRY_TRANSIENT="${RECOVERY_AUTO_RETRY_TRANSIENT:-true}"

# Error classification levels
declare -A RECOVERY_LEVELS=(
    [0]="transient"      # Auto-retry immediately
    [1]="recoverable"    # Auto-fix possible
    [2]="degraded"       # Continue with warning
    [3]="blocked"        # Escalate required
)

# Error patterns for classification
declare -A ERROR_PATTERNS_TRANSIENT=(
    ["timeout"]="timeout|timed out|ETIMEDOUT"
    ["rate_limit"]="rate limit|429|too many requests"
    ["network"]="ECONNRESET|ECONNREFUSED|network error"
    ["temporary"]="temporary failure|try again|service unavailable|503"
)

declare -A ERROR_PATTERNS_RECOVERABLE=(
    ["lint"]="lint error|eslint|phpcs|flake8|prettier|stylelint"
    ["test_fail"]="test failed|assertion failed|tests? (failed|failing)"
    ["deps"]="dependency|package not found|module not found|could not resolve"
    ["syntax"]="syntax error|parse error|unexpected token"
    ["type_error"]="type error|typescript error|type mismatch"
)

declare -A ERROR_PATTERNS_DEGRADED=(
    ["docs"]="documentation|readme|changelog"
    ["optional_gate"]="optional.*gate|non-blocking"
    ["coverage"]="coverage below|coverage threshold"
    ["warning"]="warning:|deprecated"
)

declare -A ERROR_PATTERNS_BLOCKED=(
    ["security"]="security vulnerability|CVE-|critical security|injection"
    ["architecture"]="architecture violation|circular dependency|breaking change"
    ["auth"]="authentication failed|unauthorized|permission denied"
    ["resource"]="out of memory|disk full|quota exceeded"
)

# Recovery strategies
declare -A RECOVERY_STRATEGIES=(
    ["lint"]="run_auto_lint_fix"
    ["test_fail"]="run_tdd_retry"
    ["deps"]="run_deps_install"
    ["syntax"]="request_syntax_fix"
    ["type_error"]="request_type_fix"
    ["timeout"]="retry_with_backoff"
    ["rate_limit"]="retry_with_backoff"
    ["network"]="retry_with_backoff"
    ["temporary"]="retry_with_backoff"
)

# Escalation tracking
RECOVERY_ESCALATION_FILE=""
RECOVERY_SESSION_DIR=""

# =============================================================================
# Initialization
# =============================================================================

init_recovery_engine() {
    RECOVERY_CURRENT_ATTEMPT=0
    RECOVERY_LAST_ERROR=""
    RECOVERY_LAST_LEVEL=-1

    # Set session directory for escalation tracking
    RECOVERY_SESSION_DIR="${RALPH_SESSION_BASE:-.ralph}/recovery"
    mkdir -p "$RECOVERY_SESSION_DIR"

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.recovery.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        RECOVERY_ENABLED="$enabled"

        local max_attempts
        max_attempts=$(yq e '.recovery.max_attempts // "3"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$max_attempts" =~ ^[0-9]+$ ]]; then
            RECOVERY_MAX_ATTEMPTS=$max_attempts
        fi

        local auto_lint
        auto_lint=$(yq e '.recovery.auto_fix_lint // "true"' "$CONFIG_FILE" 2>/dev/null)
        RECOVERY_AUTO_FIX_LINT="$auto_lint"

        local auto_tests
        auto_tests=$(yq e '.recovery.auto_fix_tests // "retry_tdd"' "$CONFIG_FILE" 2>/dev/null)
        RECOVERY_AUTO_FIX_TESTS="$auto_tests"

        local auto_transient
        auto_transient=$(yq e '.recovery.auto_retry_transient // "true"' "$CONFIG_FILE" 2>/dev/null)
        RECOVERY_AUTO_RETRY_TRANSIENT="$auto_transient"
    fi

    print_verbose "Recovery engine initialized:"
    print_verbose "  - Enabled: $RECOVERY_ENABLED"
    print_verbose "  - Max attempts: $RECOVERY_MAX_ATTEMPTS"
    print_verbose "  - Auto-fix lint: $RECOVERY_AUTO_FIX_LINT"
    print_verbose "  - Auto-fix tests: $RECOVERY_AUTO_FIX_TESTS"
}

# =============================================================================
# Error Classification
# =============================================================================

# Classify error and return level (0-3)
classify_error() {
    local error_output="$1"
    local error_lower
    error_lower=$(echo "$error_output" | tr '[:upper:]' '[:lower:]')

    # Check Level 3 - Blocked (security, architecture)
    for pattern_name in "${!ERROR_PATTERNS_BLOCKED[@]}"; do
        local pattern="${ERROR_PATTERNS_BLOCKED[$pattern_name]}"
        if echo "$error_lower" | grep -qiE "$pattern"; then
            RECOVERY_LAST_ERROR="$pattern_name"
            RECOVERY_LAST_LEVEL=3
            echo "3:$pattern_name"
            return 0
        fi
    done

    # Check Level 0 - Transient (timeout, rate limit)
    for pattern_name in "${!ERROR_PATTERNS_TRANSIENT[@]}"; do
        local pattern="${ERROR_PATTERNS_TRANSIENT[$pattern_name]}"
        if echo "$error_lower" | grep -qiE "$pattern"; then
            RECOVERY_LAST_ERROR="$pattern_name"
            RECOVERY_LAST_LEVEL=0
            echo "0:$pattern_name"
            return 0
        fi
    done

    # Check Level 1 - Recoverable (lint, tests, deps)
    for pattern_name in "${!ERROR_PATTERNS_RECOVERABLE[@]}"; do
        local pattern="${ERROR_PATTERNS_RECOVERABLE[$pattern_name]}"
        if echo "$error_lower" | grep -qiE "$pattern"; then
            RECOVERY_LAST_ERROR="$pattern_name"
            RECOVERY_LAST_LEVEL=1
            echo "1:$pattern_name"
            return 0
        fi
    done

    # Check Level 2 - Degraded (docs, optional gates)
    for pattern_name in "${!ERROR_PATTERNS_DEGRADED[@]}"; do
        local pattern="${ERROR_PATTERNS_DEGRADED[$pattern_name]}"
        if echo "$error_lower" | grep -qiE "$pattern"; then
            RECOVERY_LAST_ERROR="$pattern_name"
            RECOVERY_LAST_LEVEL=2
            echo "2:$pattern_name"
            return 0
        fi
    done

    # Unknown error - treat as Level 1 by default
    RECOVERY_LAST_ERROR="unknown"
    RECOVERY_LAST_LEVEL=1
    echo "1:unknown"
}

# Get human-readable level name
get_level_name() {
    local level="$1"
    echo "${RECOVERY_LEVELS[$level]:-unknown}"
}

# =============================================================================
# Recovery Attempt
# =============================================================================

# Attempt recovery based on error classification
# Returns: 0 = recovered, 1 = failed, 2 = escalate
attempt_recovery() {
    local session_id="$1"
    local error_output="$2"

    if [[ "$RECOVERY_ENABLED" != "true" ]]; then
        print_verbose "Recovery engine disabled"
        return 1
    fi

    # Classify the error
    local classification
    classification=$(classify_error "$error_output")
    local level="${classification%%:*}"
    local error_type="${classification#*:}"

    local level_name
    level_name=$(get_level_name "$level")

    print_info "Error classified as Level $level ($level_name): $error_type"

    # Track recovery attempt
    RECOVERY_CURRENT_ATTEMPT=$((RECOVERY_CURRENT_ATTEMPT + 1))

    # Log recovery attempt
    log_recovery_attempt "$session_id" "$level" "$error_type" "$RECOVERY_CURRENT_ATTEMPT"

    # Check max attempts
    if [[ $RECOVERY_CURRENT_ATTEMPT -gt $RECOVERY_MAX_ATTEMPTS ]]; then
        print_warning "Max recovery attempts reached ($RECOVERY_MAX_ATTEMPTS)"
        return 2  # Escalate
    fi

    # Handle based on level
    case "$level" in
        0)  # Transient - auto-retry
            if [[ "$RECOVERY_AUTO_RETRY_TRANSIENT" == "true" ]]; then
                handle_transient_error "$error_type"
                return $?
            fi
            ;;

        1)  # Recoverable - attempt auto-fix
            handle_recoverable_error "$session_id" "$error_type" "$error_output"
            return $?
            ;;

        2)  # Degraded - continue with warning
            handle_degraded_error "$error_type"
            return 0  # Continue
            ;;

        3)  # Blocked - must escalate
            handle_blocked_error "$session_id" "$error_type" "$error_output"
            return 2  # Escalate
            ;;
    esac

    return 1  # Default: failed
}

# =============================================================================
# Level-specific Handlers
# =============================================================================

handle_transient_error() {
    local error_type="$1"

    print_info "Handling transient error: $error_type"

    case "$error_type" in
        timeout|rate_limit|network|temporary)
            retry_with_backoff "$error_type"
            return $?
            ;;
    esac

    return 1
}

handle_recoverable_error() {
    local session_id="$1"
    local error_type="$2"
    local error_output="$3"

    print_info "Attempting auto-fix for: $error_type"

    case "$error_type" in
        lint)
            if [[ "$RECOVERY_AUTO_FIX_LINT" == "true" ]]; then
                run_auto_lint_fix
                return $?
            fi
            ;;

        test_fail)
            case "$RECOVERY_AUTO_FIX_TESTS" in
                retry_tdd)
                    run_tdd_retry "$session_id" "$error_output"
                    return $?
                    ;;
                skip)
                    print_warning "Test failures - skipping (configured)"
                    return 0
                    ;;
                *)
                    return 1
                    ;;
            esac
            ;;

        deps)
            run_deps_install
            return $?
            ;;

        syntax|type_error)
            # Request Claude to fix
            request_code_fix "$session_id" "$error_type" "$error_output"
            return $?
            ;;

        unknown)
            # Generic retry
            print_info "Unknown error - will retry"
            return 0
            ;;
    esac

    return 1
}

handle_degraded_error() {
    local error_type="$1"

    print_warning "Degraded mode: $error_type (continuing with warning)"

    # Log warning but continue
    case "$error_type" in
        docs)
            print_warning "Documentation incomplete - will continue"
            ;;
        optional_gate)
            print_warning "Optional quality gate failed - will continue"
            ;;
        coverage)
            print_warning "Coverage threshold not met - will continue"
            ;;
        warning)
            print_warning "Warnings detected - will continue"
            ;;
    esac

    return 0  # Continue
}

handle_blocked_error() {
    local session_id="$1"
    local error_type="$2"
    local error_output="$3"

    print_error "Blocked: $error_type (requires escalation)"

    # Create escalation
    if type create_escalation &>/dev/null; then
        create_escalation "$session_id" "blocked" "$error_type" "$error_output"
    fi

    return 2  # Escalate
}

# =============================================================================
# Recovery Strategies Implementation
# =============================================================================

retry_with_backoff() {
    local error_type="$1"
    local base_delay=5
    local max_delay=60

    # Exponential backoff
    local delay=$((base_delay * (2 ** (RECOVERY_CURRENT_ATTEMPT - 1))))
    [[ $delay -gt $max_delay ]] && delay=$max_delay

    print_info "Waiting ${delay}s before retry (attempt $RECOVERY_CURRENT_ATTEMPT)..."
    sleep "$delay"

    return 0  # Ready for retry
}

run_auto_lint_fix() {
    print_info "Running auto-lint fix..."

    # Detect and run appropriate linter with auto-fix
    if [[ -f "package.json" ]]; then
        if command -v npm &>/dev/null; then
            npm run lint:fix 2>/dev/null || npm run lint -- --fix 2>/dev/null || true
        fi
    elif [[ -f "composer.json" ]]; then
        if command -v ./vendor/bin/php-cs-fixer &>/dev/null; then
            ./vendor/bin/php-cs-fixer fix 2>/dev/null || true
        elif command -v ./vendor/bin/phpcbf &>/dev/null; then
            ./vendor/bin/phpcbf 2>/dev/null || true
        fi
    elif [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]]; then
        if command -v black &>/dev/null; then
            black . 2>/dev/null || true
        fi
        if command -v ruff &>/dev/null; then
            ruff check --fix . 2>/dev/null || true
        fi
    fi

    print_success "Auto-lint fix completed"
    return 0
}

run_tdd_retry() {
    local session_id="$1"
    local error_output="$2"

    print_info "TDD retry: extracting failing tests..."

    # Extract failing test information for focused retry
    local failing_tests=""

    # Try to parse test output
    if echo "$error_output" | grep -qE "FAIL|FAILED|Error:"; then
        failing_tests=$(echo "$error_output" | grep -E "FAIL|FAILED|Error:" | head -5)
    fi

    # Update sprint progress with TDD phase
    if type update_sprint_tdd_phase &>/dev/null; then
        update_sprint_tdd_phase "$session_id" "red"
    fi

    print_info "Will retry with focus on failing tests"
    return 0
}

run_deps_install() {
    print_info "Attempting dependency installation..."

    if [[ -f "package.json" ]]; then
        npm install 2>/dev/null || yarn install 2>/dev/null || true
    elif [[ -f "composer.json" ]]; then
        composer install 2>/dev/null || true
    elif [[ -f "pyproject.toml" ]]; then
        pip install -e . 2>/dev/null || poetry install 2>/dev/null || true
    elif [[ -f "requirements.txt" ]]; then
        pip install -r requirements.txt 2>/dev/null || true
    elif [[ -f "pubspec.yaml" ]]; then
        flutter pub get 2>/dev/null || dart pub get 2>/dev/null || true
    fi

    print_success "Dependency installation attempted"
    return 0
}

request_code_fix() {
    local session_id="$1"
    local error_type="$2"
    local error_output="$3"

    print_info "Requesting code fix for: $error_type"

    # Store fix request for next Claude iteration
    local fix_file="$RECOVERY_SESSION_DIR/${session_id}_fix_request.txt"
    cat > "$fix_file" << EOF
## Recovery: Code Fix Required

**Error Type:** $error_type
**Attempt:** $RECOVERY_CURRENT_ATTEMPT of $RECOVERY_MAX_ATTEMPTS

### Error Output:
\`\`\`
$error_output
\`\`\`

### Instructions:
Please fix the $error_type error shown above. Focus on:
1. Identifying the root cause
2. Making the minimal fix required
3. Ensuring tests pass after the fix
EOF

    # Export for next iteration
    export RECOVERY_FIX_REQUEST="$fix_file"

    return 0
}

# =============================================================================
# Recovery Logging
# =============================================================================

log_recovery_attempt() {
    local session_id="$1"
    local level="$2"
    local error_type="$3"
    local attempt="$4"

    local log_file="$RECOVERY_SESSION_DIR/recovery-log.jsonl"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Append to log
    echo "{\"timestamp\":\"$timestamp\",\"session\":\"$session_id\",\"level\":$level,\"error_type\":\"$error_type\",\"attempt\":$attempt}" >> "$log_file"
}

get_recovery_stats() {
    local session_id="$1"
    local log_file="$RECOVERY_SESSION_DIR/recovery-log.jsonl"

    if [[ ! -f "$log_file" ]]; then
        echo '{"total_attempts":0,"successful":0,"failed":0}'
        return
    fi

    if command -v jq &>/dev/null; then
        jq -s --arg sid "$session_id" '
            [.[] | select(.session == $sid)] |
            {
                total_attempts: length,
                by_level: group_by(.level) | map({(.[0].level|tostring): length}) | add,
                by_type: group_by(.error_type) | map({(.[0].error_type): length}) | add
            }
        ' "$log_file" 2>/dev/null || echo '{"total_attempts":0}'
    else
        local count
        count=$(grep -c "\"session\":\"$session_id\"" "$log_file" 2>/dev/null || echo "0")
        echo "{\"total_attempts\":$count}"
    fi
}

# =============================================================================
# Recovery State Management
# =============================================================================

reset_recovery_state() {
    RECOVERY_CURRENT_ATTEMPT=0
    RECOVERY_LAST_ERROR=""
    RECOVERY_LAST_LEVEL=-1

    # Clear fix request if exists
    [[ -n "$RECOVERY_FIX_REQUEST" ]] && rm -f "$RECOVERY_FIX_REQUEST" 2>/dev/null
    unset RECOVERY_FIX_REQUEST
}

get_recovery_status() {
    cat << EOF
{
    "enabled": $RECOVERY_ENABLED,
    "current_attempt": $RECOVERY_CURRENT_ATTEMPT,
    "max_attempts": $RECOVERY_MAX_ATTEMPTS,
    "last_error": "$RECOVERY_LAST_ERROR",
    "last_level": $RECOVERY_LAST_LEVEL,
    "last_level_name": "$(get_level_name "$RECOVERY_LAST_LEVEL")"
}
EOF
}

# Check if recovery should be attempted before circuit breaker trip
should_attempt_recovery() {
    local error_output="$1"

    # Don't attempt if disabled
    [[ "$RECOVERY_ENABLED" != "true" ]] && return 1

    # Don't attempt if max reached
    [[ $RECOVERY_CURRENT_ATTEMPT -ge $RECOVERY_MAX_ATTEMPTS ]] && return 1

    # Classify and check if recoverable
    local classification
    classification=$(classify_error "$error_output")
    local level="${classification%%:*}"

    # Levels 0, 1, 2 are recoverable; Level 3 requires escalation
    [[ $level -lt 3 ]] && return 0

    return 1
}

# =============================================================================
# Integration with Circuit Breaker
# =============================================================================

# Hook to be called before circuit breaker trips
recovery_before_trip() {
    local session_id="$1"
    local trigger_reason="$2"
    local last_output="$3"

    if [[ "$RECOVERY_ENABLED" != "true" ]]; then
        return 1  # Let circuit breaker trip
    fi

    print_info "Recovery engine intercepting circuit breaker ($trigger_reason)..."

    # Attempt recovery
    if attempt_recovery "$session_id" "$last_output"; then
        print_success "Recovery successful - resetting circuit breaker"
        return 0  # Prevent trip
    else
        print_warning "Recovery failed - circuit breaker will trip"
        return 1  # Allow trip
    fi
}

# =============================================================================
# Export for use by other modules
# =============================================================================

export RECOVERY_ENABLED
export RECOVERY_MAX_ATTEMPTS
export RECOVERY_CURRENT_ATTEMPT
export RECOVERY_LAST_ERROR
export RECOVERY_LAST_LEVEL
