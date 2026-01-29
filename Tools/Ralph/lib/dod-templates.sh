#!/bin/bash
# =============================================================================
# Ralph Wiggum - DoD Templates Module
# Load and merge Definition of Done templates by technology
# =============================================================================

# Templates directory
DOD_TEMPLATES_DIR="${DOD_TEMPLATES_DIR:-$SCRIPT_DIR/templates/dod}"

# =============================================================================
# Get Template for Project Type
# =============================================================================

get_dod_template() {
    local project_type="$1"
    local templates_dir="${2:-$DOD_TEMPLATES_DIR}"

    # Normalize project type (remove version suffixes)
    local base_type
    base_type=$(echo "$project_type" | sed 's/-[0-9.]*$//' | sed 's/-typescript$//')

    # Map to template file
    local template_file=""
    case "$base_type" in
        symfony|laravel|php)
            template_file="$templates_dir/symfony.yml"
            ;;
        flutter|dart)
            template_file="$templates_dir/flutter.yml"
            ;;
        react|vue|angular|nextjs|node)
            template_file="$templates_dir/react.yml"
            ;;
        python|django|fastapi|flask)
            template_file="$templates_dir/python.yml"
            ;;
        dotnet|dotnet-web|dotnet-blazor)
            template_file="$templates_dir/dotnet.yml"
            ;;
        go)
            template_file="$templates_dir/go.yml"
            ;;
        rust)
            template_file="$templates_dir/rust.yml"
            ;;
        *)
            template_file="$templates_dir/generic.yml"
            ;;
    esac

    # Check if template exists
    if [[ -f "$template_file" ]]; then
        cat "$template_file"
    else
        # Return empty DoD template
        echo "# No template found for: $project_type"
        echo "definition_of_done:"
        echo "  completion_marker: \"<promise>COMPLETE</promise>\""
    fi
}

# =============================================================================
# Get Template Path
# =============================================================================

get_dod_template_path() {
    local project_type="$1"
    local templates_dir="${2:-$DOD_TEMPLATES_DIR}"

    local base_type
    base_type=$(echo "$project_type" | sed 's/-[0-9.]*$//' | sed 's/-typescript$//')

    case "$base_type" in
        symfony|laravel|php)
            echo "$templates_dir/symfony.yml"
            ;;
        flutter|dart)
            echo "$templates_dir/flutter.yml"
            ;;
        react|vue|angular|nextjs|node)
            echo "$templates_dir/react.yml"
            ;;
        python|django|fastapi|flask)
            echo "$templates_dir/python.yml"
            ;;
        dotnet|dotnet-web|dotnet-blazor)
            echo "$templates_dir/dotnet.yml"
            ;;
        go)
            echo "$templates_dir/go.yml"
            ;;
        rust)
            echo "$templates_dir/rust.yml"
            ;;
        *)
            echo "$templates_dir/generic.yml"
            ;;
    esac
}

# =============================================================================
# Merge User Config with Template
# =============================================================================

merge_dod_with_template() {
    local user_config="$1"
    local template_config="$2"

    if ! command -v yq &>/dev/null; then
        # Without yq, just return user config or template
        if [[ -f "$user_config" ]]; then
            cat "$user_config"
        else
            cat "$template_config"
        fi
        return
    fi

    # If user config doesn't exist, return template
    if [[ ! -f "$user_config" ]]; then
        cat "$template_config"
        return
    fi

    # If template doesn't exist, return user config
    if [[ ! -f "$template_config" ]]; then
        cat "$user_config"
        return
    fi

    # Merge: user config takes precedence
    # Use yq to deep merge (user config overrides template)
    yq eval-all 'select(fileIndex == 0) *+ select(fileIndex == 1)' "$template_config" "$user_config" 2>/dev/null || cat "$user_config"
}

# =============================================================================
# Generate DoD from Detection
# =============================================================================

generate_dod_from_detection() {
    local docker_prefix="${1:-}"

    # Use detected values
    local project_type="$DETECTED_PROJECT_TYPE"
    local test_framework="$DETECTED_TEST_FRAMEWORK"
    local lint_tool="$DETECTED_LINT_TOOL"
    local package_manager="$DETECTED_PACKAGE_MANAGER"

    # Build command prefix
    local cmd_prefix=""
    if [[ -n "$docker_prefix" ]]; then
        cmd_prefix="docker compose exec $docker_prefix "
    fi

    # Generate DoD YAML
    cat <<EOF
definition_of_done:
  completion_marker: "<promise>COMPLETE</promise>"
  checklist:
EOF

    # Add test check
    if [[ -n "$test_framework" ]]; then
        local test_cmd
        case "$test_framework" in
            phpunit)
                test_cmd="${cmd_prefix}vendor/bin/phpunit"
                ;;
            jest)
                test_cmd="${cmd_prefix}npm test"
                ;;
            vitest)
                test_cmd="${cmd_prefix}npm run test"
                ;;
            pytest)
                test_cmd="${cmd_prefix}pytest"
                ;;
            flutter_test)
                test_cmd="${cmd_prefix}flutter test"
                ;;
            xunit)
                test_cmd="${cmd_prefix}dotnet test"
                ;;
            go_test)
                test_cmd="${cmd_prefix}go test ./..."
                ;;
            cargo_test)
                test_cmd="${cmd_prefix}cargo test"
                ;;
            *)
                test_cmd=""
                ;;
        esac

        if [[ -n "$test_cmd" ]]; then
            cat <<EOF
    - id: tests
      name: "All tests pass"
      type: command
      command: "$test_cmd"
      required: true
EOF
        fi
    fi

    # Add lint check
    if [[ -n "$lint_tool" ]]; then
        local lint_cmd
        case "$lint_tool" in
            phpstan)
                lint_cmd="${cmd_prefix}vendor/bin/phpstan analyse"
                ;;
            psalm)
                lint_cmd="${cmd_prefix}vendor/bin/psalm"
                ;;
            eslint)
                lint_cmd="${cmd_prefix}npm run lint"
                ;;
            ruff)
                lint_cmd="${cmd_prefix}ruff check ."
                ;;
            black)
                lint_cmd="${cmd_prefix}black --check ."
                ;;
            flutter_lints)
                lint_cmd="${cmd_prefix}flutter analyze"
                ;;
            golangci-lint)
                lint_cmd="${cmd_prefix}golangci-lint run"
                ;;
            clippy)
                lint_cmd="${cmd_prefix}cargo clippy"
                ;;
            *)
                lint_cmd=""
                ;;
        esac

        if [[ -n "$lint_cmd" ]]; then
            cat <<EOF
    - id: lint
      name: "No lint errors"
      type: command
      command: "$lint_cmd"
      required: true
EOF
        fi
    fi

    # Add type check for TypeScript projects
    if [[ "$project_type" == *"typescript"* ]] || [[ "$project_type" == "react" ]] || [[ "$project_type" == "nextjs" ]]; then
        cat <<EOF
    - id: typecheck
      name: "TypeScript compiles"
      type: command
      command: "${cmd_prefix}npx tsc --noEmit"
      required: true
EOF
    fi

    # Add completion marker check
    cat <<EOF
    - id: completion
      name: "Claude signals completion"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
EOF
}

# =============================================================================
# List Available Templates
# =============================================================================

list_dod_templates() {
    local templates_dir="${1:-$DOD_TEMPLATES_DIR}"

    echo "Available DoD Templates:"
    echo "------------------------"

    for template in "$templates_dir"/*.yml; do
        if [[ -f "$template" ]]; then
            local name
            name=$(basename "$template" .yml)
            local desc=""

            # Extract description from template if present
            if command -v yq &>/dev/null; then
                desc=$(yq e '.description // ""' "$template" 2>/dev/null)
            fi

            if [[ -n "$desc" ]]; then
                echo "  - $name: $desc"
            else
                echo "  - $name"
            fi
        fi
    done
}

# =============================================================================
# Validate Template
# =============================================================================

validate_dod_template() {
    local template_file="$1"

    if [[ ! -f "$template_file" ]]; then
        echo "Template file not found: $template_file"
        return 1
    fi

    if ! command -v yq &>/dev/null; then
        echo "yq not available, skipping validation"
        return 0
    fi

    # Validate YAML syntax
    if ! yq e '.' "$template_file" >/dev/null 2>&1; then
        echo "Invalid YAML syntax in: $template_file"
        return 1
    fi

    # Check for required fields
    local has_dod
    has_dod=$(yq e '.definition_of_done // "missing"' "$template_file" 2>/dev/null)

    if [[ "$has_dod" == "missing" ]]; then
        echo "Missing 'definition_of_done' section in: $template_file"
        return 1
    fi

    echo "Template valid: $template_file"
    return 0
}
