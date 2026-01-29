#!/bin/bash
# =============================================================================
# Ralph Wiggum - Configuration Generator Module
# Generate ralph.yml configuration from project detection
# =============================================================================

# =============================================================================
# Generate Configuration
# =============================================================================

generate_config() {
    local output_file="${1:-ralph.yml}"
    local project_dir="${2:-.}"
    local docker_service="${3:-}"

    # Detect project if not already done
    if [[ -z "$DETECTED_PROJECT_TYPE" ]]; then
        detect_project_type "$project_dir"
    fi

    # Detect docker support
    local docker_support
    docker_support=$(detect_docker_support "$project_dir")

    if [[ -z "$docker_service" && "$docker_support" != "none" ]]; then
        docker_service=$(get_docker_service_name "$project_dir")
    fi

    # Generate the configuration
    cat > "$output_file" <<EOF
# =============================================================================
# Ralph Wiggum Configuration
# Auto-generated for: $DETECTED_PROJECT_TYPE
# Confidence: $DETECTED_PROJECT_CONFIDENCE
# =============================================================================

version: "2.0"

# =============================================================================
# Session Settings
# =============================================================================
session:
  id: auto
  timeout: 600000
  max_iterations: 25
  delay_between_iterations: 1000

# =============================================================================
# Hooks Integration (Claude Code 2.1.23+)
# =============================================================================
hooks:
  enabled: true
  mode: "advanced"  # simple or advanced

# =============================================================================
# Auto-Detection (enabled for this project)
# =============================================================================
auto_detect:
  enabled: true
  interactive: false
  detected_type: "$DETECTED_PROJECT_TYPE"
  detected_package_manager: "${DETECTED_PACKAGE_MANAGER:-none}"
  detected_test_framework: "${DETECTED_TEST_FRAMEWORK:-none}"
  detected_lint_tool: "${DETECTED_LINT_TOOL:-none}"

# =============================================================================
# Metrics & Observability
# =============================================================================
metrics:
  enabled: true
  format: "both"  # json, prometheus, both
  realtime:
    enabled: true
    interval_ms: 1000

# =============================================================================
# Dashboard
# =============================================================================
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# =============================================================================
# Health Monitoring
# =============================================================================
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true

# =============================================================================
# Circuit Breaker - Adaptive Mode
# =============================================================================
circuit_breaker:
  enabled: true
  adaptive: true
  default_profile: "medium_feature"

  # Manual thresholds (used when adaptive: false)
  no_file_changes_threshold: 4
  repeated_error_threshold: 6
  output_decline_threshold: 70

  # Learning from history
  learning:
    enabled: true
    min_samples: 5

# =============================================================================
# Context Management
# =============================================================================
context:
  auto_compact: true
  max_compacts: 5
  overflow_strategy: "new_session"
  preventive_threshold: 95
  min_threshold: 50
  smart_reconstruction: true
  max_continuation_sessions: 5

# =============================================================================
# Sprint Progress Tracking
# =============================================================================
sprint:
  enabled: true
  progress_file: ".ralph/sprint-progress.md"
  auto_update_progress: true
  include_git_diff: true
  include_test_status: true
  compact_on_start: true
  compact_on_task_complete: false
  compact_on_us_complete: false

# =============================================================================
# Git Checkpointing
# =============================================================================
checkpointing:
  enabled: true
  async: true
  branch_prefix: "ralph/"
  commit_message_template: "checkpoint: Ralph iteration {iteration}"

# =============================================================================
# Agent Settings
# =============================================================================
agent:
  name: claude
  command: claude
  args:
    - "--continue"
    - "\${SESSION_ID}"
    - "-p"
    - "\${PROMPT}"

EOF

    # Add DoD section
    generate_dod_section "$output_file" "$docker_service"

    # Add output section
    cat >> "$output_file" <<EOF

# =============================================================================
# Output Settings
# =============================================================================
output:
  log_file: ".ralph/session.log"
  metrics_file: ".ralph/metrics.json"
  verbose: false
EOF

    print_success "${MSG_CONFIG_GENERATED:-Configuration generated}: $output_file"
}

# =============================================================================
# Generate DoD Section
# =============================================================================

generate_dod_section() {
    local output_file="$1"
    local docker_service="${2:-app}"

    # Build command prefix
    local cmd_prefix=""
    if [[ -n "$docker_service" ]]; then
        cmd_prefix="docker compose exec $docker_service "
    fi

    cat >> "$output_file" <<EOF

# =============================================================================
# Definition of Done
# =============================================================================
definition_of_done:
  completion_marker: "<promise>COMPLETE</promise>"
  checklist:
EOF

    # Add test check based on detected framework
    case "$DETECTED_TEST_FRAMEWORK" in
        phpunit)
            cat >> "$output_file" <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "${cmd_prefix}vendor/bin/phpunit"
      required: true
EOF
            ;;
        jest|vitest)
            cat >> "$output_file" <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "${cmd_prefix}npm test -- --watchAll=false"
      required: true
EOF
            ;;
        pytest)
            cat >> "$output_file" <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "${cmd_prefix}pytest -v"
      required: true
EOF
            ;;
        flutter_test)
            cat >> "$output_file" <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "flutter test"
      required: true
EOF
            ;;
        xunit)
            cat >> "$output_file" <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "${cmd_prefix}dotnet test"
      required: true
EOF
            ;;
        go_test)
            cat >> "$output_file" <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "${cmd_prefix}go test ./..."
      required: true
EOF
            ;;
        cargo_test)
            cat >> "$output_file" <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "${cmd_prefix}cargo test"
      required: true
EOF
            ;;
    esac

    # Add lint check based on detected linter
    case "$DETECTED_LINT_TOOL" in
        phpstan)
            cat >> "$output_file" <<EOF
    - id: lint
      name: "PHPStan passes"
      type: command
      command: "${cmd_prefix}vendor/bin/phpstan analyse"
      required: true
EOF
            ;;
        eslint)
            cat >> "$output_file" <<EOF
    - id: lint
      name: "No lint errors"
      type: command
      command: "${cmd_prefix}npm run lint"
      required: true
EOF
            ;;
        ruff)
            cat >> "$output_file" <<EOF
    - id: lint
      name: "Ruff passes"
      type: command
      command: "${cmd_prefix}ruff check ."
      required: true
EOF
            ;;
        flutter_lints)
            cat >> "$output_file" <<EOF
    - id: lint
      name: "Flutter analyze passes"
      type: command
      command: "flutter analyze"
      required: true
EOF
            ;;
        golangci-lint)
            cat >> "$output_file" <<EOF
    - id: lint
      name: "golangci-lint passes"
      type: command
      command: "${cmd_prefix}golangci-lint run"
      required: true
EOF
            ;;
        clippy)
            cat >> "$output_file" <<EOF
    - id: lint
      name: "Clippy passes"
      type: command
      command: "${cmd_prefix}cargo clippy -- -D warnings"
      required: true
EOF
            ;;
    esac

    # Add completion marker check
    cat >> "$output_file" <<EOF
    - id: completion
      name: "Claude signals completion"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
EOF
}

# =============================================================================
# Interactive Configuration
# =============================================================================

interactive_config() {
    local output_file="${1:-ralph.yml}"
    local project_dir="${2:-.}"

    echo ""
    echo -e "${C_BOLD}Ralph Wiggum Configuration Wizard${C_RESET}"
    echo "=================================="
    echo ""

    # Detect project
    echo "Detecting project type..."
    detect_project_type "$project_dir"
    echo ""
    get_detection_summary
    echo ""

    # Confirm project type
    read -p "Is this correct? (y/n): " confirm
    if [[ "${confirm,,}" != "y" ]]; then
        echo ""
        echo "Available project types:"
        echo "  1) symfony    2) laravel    3) react"
        echo "  4) vue        5) angular    6) nextjs"
        echo "  7) flutter    8) python     9) dotnet"
        echo "  10) go        11) rust      12) generic"
        echo ""
        read -p "Select project type (1-12): " choice

        case "$choice" in
            1) DETECTED_PROJECT_TYPE="symfony"; DETECTED_TEST_FRAMEWORK="phpunit"; DETECTED_LINT_TOOL="phpstan" ;;
            2) DETECTED_PROJECT_TYPE="laravel"; DETECTED_TEST_FRAMEWORK="phpunit" ;;
            3) DETECTED_PROJECT_TYPE="react"; DETECTED_TEST_FRAMEWORK="jest"; DETECTED_LINT_TOOL="eslint" ;;
            4) DETECTED_PROJECT_TYPE="vue"; DETECTED_TEST_FRAMEWORK="vitest"; DETECTED_LINT_TOOL="eslint" ;;
            5) DETECTED_PROJECT_TYPE="angular"; DETECTED_TEST_FRAMEWORK="karma"; DETECTED_LINT_TOOL="eslint" ;;
            6) DETECTED_PROJECT_TYPE="nextjs"; DETECTED_TEST_FRAMEWORK="jest"; DETECTED_LINT_TOOL="eslint" ;;
            7) DETECTED_PROJECT_TYPE="flutter"; DETECTED_TEST_FRAMEWORK="flutter_test"; DETECTED_LINT_TOOL="flutter_lints" ;;
            8) DETECTED_PROJECT_TYPE="python"; DETECTED_TEST_FRAMEWORK="pytest"; DETECTED_LINT_TOOL="ruff" ;;
            9) DETECTED_PROJECT_TYPE="dotnet"; DETECTED_TEST_FRAMEWORK="xunit" ;;
            10) DETECTED_PROJECT_TYPE="go"; DETECTED_TEST_FRAMEWORK="go_test"; DETECTED_LINT_TOOL="golangci-lint" ;;
            11) DETECTED_PROJECT_TYPE="rust"; DETECTED_TEST_FRAMEWORK="cargo_test"; DETECTED_LINT_TOOL="clippy" ;;
            *) DETECTED_PROJECT_TYPE="generic" ;;
        esac
    fi

    # Docker configuration
    echo ""
    local docker_support
    docker_support=$(detect_docker_support "$project_dir")

    local docker_service=""
    if [[ "$docker_support" != "none" ]]; then
        echo "Docker Compose detected."
        docker_service=$(get_docker_service_name "$project_dir")
        echo "Detected service: ${docker_service:-none}"
        read -p "Use Docker for commands? (y/n): " use_docker
        if [[ "${use_docker,,}" != "y" ]]; then
            docker_service=""
        else
            read -p "Docker service name [$docker_service]: " custom_service
            if [[ -n "$custom_service" ]]; then
                docker_service="$custom_service"
            fi
        fi
    fi

    # Max iterations
    echo ""
    read -p "Max iterations [25]: " max_iter
    max_iter="${max_iter:-25}"

    # Dashboard mode
    echo ""
    echo "Dashboard modes:"
    echo "  1) full     - Complete dashboard with progress bar"
    echo "  2) simple   - Single line status"
    echo "  3) headless - No dashboard (for CI/CD)"
    read -p "Select dashboard mode (1-3) [1]: " dash_mode
    case "$dash_mode" in
        2) DASHBOARD_MODE="simple" ;;
        3) DASHBOARD_MODE="headless" ;;
        *) DASHBOARD_MODE="full" ;;
    esac

    # Generate configuration
    echo ""
    echo "Generating configuration..."
    generate_config "$output_file" "$project_dir" "$docker_service"

    # Update max iterations in generated file
    if command -v yq &>/dev/null; then
        yq e -i ".session.max_iterations = $max_iter" "$output_file" 2>/dev/null
        yq e -i ".dashboard.mode = \"$DASHBOARD_MODE\"" "$output_file" 2>/dev/null
    fi

    echo ""
    print_success "Configuration saved to: $output_file"
    echo ""
    echo "You can now run Ralph with:"
    echo "  ralph.sh --config=$output_file \"Your task description\""
    echo ""
}

# =============================================================================
# Merge With Existing Config
# =============================================================================

merge_with_existing() {
    local new_config="$1"
    local existing_config="$2"
    local output_file="${3:-$existing_config}"

    if [[ ! -f "$existing_config" ]]; then
        cp "$new_config" "$output_file"
        return 0
    fi

    if ! command -v yq &>/dev/null; then
        print_warning "yq not available, cannot merge configurations"
        return 1
    fi

    # Deep merge: existing takes precedence for user-customized values
    yq eval-all 'select(fileIndex == 0) *+ select(fileIndex == 1)' "$new_config" "$existing_config" > "${output_file}.tmp"
    mv "${output_file}.tmp" "$output_file"

    print_success "Configurations merged: $output_file"
}

# =============================================================================
# Validate Configuration
# =============================================================================

validate_config() {
    local config_file="$1"

    if [[ ! -f "$config_file" ]]; then
        print_error "Configuration file not found: $config_file"
        return 1
    fi

    if ! command -v yq &>/dev/null; then
        print_warning "yq not available, skipping validation"
        return 0
    fi

    local errors=0

    # Check YAML syntax
    if ! yq e '.' "$config_file" >/dev/null 2>&1; then
        print_error "Invalid YAML syntax"
        errors=$((errors + 1))
    fi

    # Check required sections
    local required_sections=("session" "circuit_breaker" "definition_of_done")
    for section in "${required_sections[@]}"; do
        local value
        value=$(yq e ".$section // \"missing\"" "$config_file" 2>/dev/null)
        if [[ "$value" == "missing" ]]; then
            print_warning "Missing section: $section"
            errors=$((errors + 1))
        fi
    done

    # Validate numeric values
    local max_iter
    max_iter=$(yq e '.session.max_iterations // 25' "$config_file" 2>/dev/null)
    if ! [[ "$max_iter" =~ ^[0-9]+$ ]] || [[ "$max_iter" -lt 1 ]]; then
        print_warning "Invalid max_iterations: $max_iter"
        errors=$((errors + 1))
    fi

    if [[ $errors -eq 0 ]]; then
        print_success "Configuration valid: $config_file"
        return 0
    else
        print_error "Configuration has $errors errors"
        return 1
    fi
}

# =============================================================================
# Show Config Summary
# =============================================================================

show_config_summary() {
    local config_file="$1"

    if [[ ! -f "$config_file" ]]; then
        print_error "Configuration file not found: $config_file"
        return 1
    fi

    if ! command -v yq &>/dev/null; then
        cat "$config_file"
        return 0
    fi

    echo ""
    echo "Configuration Summary: $config_file"
    echo "========================================"
    echo ""
    echo "Session:"
    echo "  Max iterations: $(yq e '.session.max_iterations // 25' "$config_file")"
    echo "  Timeout: $(yq e '.session.timeout // 600000' "$config_file")ms"
    echo ""
    echo "Circuit Breaker:"
    echo "  Adaptive: $(yq e '.circuit_breaker.adaptive // false' "$config_file")"
    echo "  No changes threshold: $(yq e '.circuit_breaker.no_file_changes_threshold // 3' "$config_file")"
    echo ""
    echo "Features:"
    echo "  Hooks: $(yq e '.hooks.enabled // false' "$config_file")"
    echo "  Dashboard: $(yq e '.dashboard.enabled // false' "$config_file") ($(yq e '.dashboard.mode // "full"' "$config_file"))"
    echo "  Metrics: $(yq e '.metrics.enabled // false' "$config_file")"
    echo "  Health Monitor: $(yq e '.health_monitor.enabled // false' "$config_file")"
    echo ""
    echo "DoD Checks:"
    yq e '.definition_of_done.checklist[].id' "$config_file" 2>/dev/null | while read -r id; do
        echo "  - $id"
    done
    echo ""
}
