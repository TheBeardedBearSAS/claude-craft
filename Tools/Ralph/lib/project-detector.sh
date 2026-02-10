#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Project Detector Module
# Automatic stack and technology detection
# =============================================================================

# Detection confidence levels
CONFIDENCE_HIGH="HIGH"
CONFIDENCE_MEDIUM="MEDIUM"
CONFIDENCE_LOW="LOW"

# Detected project info (global state)
DETECTED_PROJECT_TYPE=""
DETECTED_PROJECT_CONFIDENCE=""
DETECTED_PACKAGE_MANAGER=""
DETECTED_TEST_FRAMEWORK=""
DETECTED_LINT_TOOL=""

# =============================================================================
# Main Detection Function
# =============================================================================

detect_project_type() {
    local project_dir="${1:-.}"

    # Reset state
    DETECTED_PROJECT_TYPE=""
    DETECTED_PROJECT_CONFIDENCE=""
    DETECTED_PACKAGE_MANAGER=""
    DETECTED_TEST_FRAMEWORK=""
    DETECTED_LINT_TOOL=""

    # Run all detectors in order of specificity
    detect_symfony "$project_dir" && return 0
    detect_laravel "$project_dir" && return 0
    detect_flutter "$project_dir" && return 0
    detect_react "$project_dir" && return 0
    detect_vue "$project_dir" && return 0
    detect_angular "$project_dir" && return 0
    detect_nextjs "$project_dir" && return 0
    detect_dotnet "$project_dir" && return 0
    detect_python "$project_dir" && return 0
    detect_go "$project_dir" && return 0
    detect_rust "$project_dir" && return 0
    detect_generic_node "$project_dir" && return 0
    detect_generic_php "$project_dir" && return 0

    # No detection
    DETECTED_PROJECT_TYPE="unknown"
    DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_LOW"
    return 1
}

# =============================================================================
# PHP Framework Detectors
# =============================================================================

detect_symfony() {
    local project_dir="$1"
    local composer_file="$project_dir/composer.json"

    if [[ ! -f "$composer_file" ]]; then
        return 1
    fi

    # Check for Symfony framework bundle
    if grep -q '"symfony/framework-bundle"' "$composer_file" 2>/dev/null; then
        DETECTED_PROJECT_TYPE="symfony"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER="composer"

        # Detect Symfony version
        local version
        version=$(grep -o '"symfony/framework-bundle"[[:space:]]*:[[:space:]]*"[^"]*"' "$composer_file" | grep -o '[0-9]\+\.[0-9]\+' | head -1)
        if [[ -n "$version" ]]; then
            DETECTED_PROJECT_TYPE="symfony-$version"
        fi

        # Detect test framework
        if grep -q '"phpunit/phpunit"' "$composer_file" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="phpunit"
        fi

        # Detect linter
        if grep -q '"phpstan/phpstan"' "$composer_file" 2>/dev/null; then
            DETECTED_LINT_TOOL="phpstan"
        elif grep -q '"vimeo/psalm"' "$composer_file" 2>/dev/null; then
            DETECTED_LINT_TOOL="psalm"
        fi

        print_verbose "Detected Symfony project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

detect_laravel() {
    local project_dir="$1"
    local composer_file="$project_dir/composer.json"

    if [[ ! -f "$composer_file" ]]; then
        return 1
    fi

    if grep -q '"laravel/framework"' "$composer_file" 2>/dev/null; then
        DETECTED_PROJECT_TYPE="laravel"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER="composer"
        DETECTED_TEST_FRAMEWORK="phpunit"

        print_verbose "Detected Laravel project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

detect_generic_php() {
    local project_dir="$1"

    if [[ -f "$project_dir/composer.json" ]]; then
        DETECTED_PROJECT_TYPE="php"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_MEDIUM"
        DETECTED_PACKAGE_MANAGER="composer"

        if grep -q '"phpunit/phpunit"' "$project_dir/composer.json" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="phpunit"
        fi

        print_verbose "Detected generic PHP project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

# =============================================================================
# Flutter/Dart Detector
# =============================================================================

detect_flutter() {
    local project_dir="$1"
    local pubspec_file="$project_dir/pubspec.yaml"

    if [[ ! -f "$pubspec_file" ]]; then
        return 1
    fi

    # Check for Flutter SDK
    if grep -q 'flutter:' "$pubspec_file" 2>/dev/null || grep -q 'sdk: flutter' "$pubspec_file" 2>/dev/null; then
        DETECTED_PROJECT_TYPE="flutter"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER="pub"
        DETECTED_TEST_FRAMEWORK="flutter_test"
        DETECTED_LINT_TOOL="flutter_lints"

        # Detect if it's pure Dart (no flutter)
        if ! grep -q 'sdk: flutter' "$pubspec_file" 2>/dev/null; then
            DETECTED_PROJECT_TYPE="dart"
            DETECTED_TEST_FRAMEWORK="test"
        fi

        print_verbose "Detected Flutter/Dart project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    # Pure Dart project
    if [[ -f "$pubspec_file" ]]; then
        DETECTED_PROJECT_TYPE="dart"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER="pub"
        DETECTED_TEST_FRAMEWORK="test"

        print_verbose "Detected Dart project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

# =============================================================================
# JavaScript/TypeScript Framework Detectors
# =============================================================================

detect_react() {
    local project_dir="$1"
    local package_file="$project_dir/package.json"

    if [[ ! -f "$package_file" ]]; then
        return 1
    fi

    if grep -q '"react"' "$package_file" 2>/dev/null; then
        DETECTED_PROJECT_TYPE="react"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER=$(detect_node_package_manager "$project_dir")

        # Detect test framework
        if grep -q '"jest"' "$package_file" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="jest"
        elif grep -q '"vitest"' "$package_file" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="vitest"
        fi

        # Detect linter
        if grep -q '"eslint"' "$package_file" 2>/dev/null; then
            DETECTED_LINT_TOOL="eslint"
        fi

        # Check for TypeScript
        if grep -q '"typescript"' "$package_file" 2>/dev/null; then
            DETECTED_PROJECT_TYPE="react-typescript"
        fi

        print_verbose "Detected React project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

detect_vue() {
    local project_dir="$1"
    local package_file="$project_dir/package.json"

    if [[ ! -f "$package_file" ]]; then
        return 1
    fi

    if grep -q '"vue"' "$package_file" 2>/dev/null; then
        DETECTED_PROJECT_TYPE="vue"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER=$(detect_node_package_manager "$project_dir")

        if grep -q '"vitest"' "$package_file" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="vitest"
        elif grep -q '"jest"' "$package_file" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="jest"
        fi

        print_verbose "Detected Vue project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

detect_angular() {
    local project_dir="$1"
    local package_file="$project_dir/package.json"

    if [[ ! -f "$package_file" ]]; then
        return 1
    fi

    if grep -q '"@angular/core"' "$package_file" 2>/dev/null; then
        DETECTED_PROJECT_TYPE="angular"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER=$(detect_node_package_manager "$project_dir")
        DETECTED_TEST_FRAMEWORK="karma"
        DETECTED_LINT_TOOL="eslint"

        print_verbose "Detected Angular project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

detect_nextjs() {
    local project_dir="$1"
    local package_file="$project_dir/package.json"

    if [[ ! -f "$package_file" ]]; then
        return 1
    fi

    if grep -q '"next"' "$package_file" 2>/dev/null; then
        DETECTED_PROJECT_TYPE="nextjs"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER=$(detect_node_package_manager "$project_dir")

        if grep -q '"jest"' "$package_file" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="jest"
        fi

        print_verbose "Detected Next.js project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

detect_generic_node() {
    local project_dir="$1"

    if [[ -f "$project_dir/package.json" ]]; then
        DETECTED_PROJECT_TYPE="node"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_MEDIUM"
        DETECTED_PACKAGE_MANAGER=$(detect_node_package_manager "$project_dir")

        if grep -q '"jest"' "$project_dir/package.json" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="jest"
        elif grep -q '"mocha"' "$project_dir/package.json" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="mocha"
        elif grep -q '"vitest"' "$project_dir/package.json" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="vitest"
        fi

        print_verbose "Detected Node.js project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

# =============================================================================
# .NET Detector
# =============================================================================

detect_dotnet() {
    local project_dir="$1"

    # Look for .csproj files
    local csproj_count
    csproj_count=$(find "$project_dir" -maxdepth 3 -name "*.csproj" 2>/dev/null | wc -l)

    if [[ $csproj_count -gt 0 ]]; then
        DETECTED_PROJECT_TYPE="dotnet"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER="nuget"
        DETECTED_TEST_FRAMEWORK="xunit"

        # Check for solution file
        if [[ -f "$project_dir"/*.sln ]] 2>/dev/null; then
            DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        fi

        # Detect specific framework
        local csproj_file
        csproj_file=$(find "$project_dir" -maxdepth 3 -name "*.csproj" 2>/dev/null | head -1)
        if [[ -f "$csproj_file" ]]; then
            if grep -q 'Microsoft.NET.Sdk.Web' "$csproj_file" 2>/dev/null; then
                DETECTED_PROJECT_TYPE="dotnet-web"
            elif grep -q 'Microsoft.NET.Sdk.BlazorWebAssembly' "$csproj_file" 2>/dev/null; then
                DETECTED_PROJECT_TYPE="dotnet-blazor"
            fi
        fi

        print_verbose "Detected .NET project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

# =============================================================================
# Python Detector
# =============================================================================

detect_python() {
    local project_dir="$1"

    # Check for pyproject.toml (modern Python)
    if [[ -f "$project_dir/pyproject.toml" ]]; then
        DETECTED_PROJECT_TYPE="python"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"

        # Detect package manager
        if grep -q 'poetry' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_PACKAGE_MANAGER="poetry"
        elif grep -q 'pdm' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_PACKAGE_MANAGER="pdm"
        else
            DETECTED_PACKAGE_MANAGER="pip"
        fi

        # Detect test framework
        if grep -q 'pytest' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="pytest"
        fi

        # Detect linter
        if grep -q 'ruff' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_LINT_TOOL="ruff"
        elif grep -q 'black' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_LINT_TOOL="black"
        fi

        # Detect framework
        if grep -q 'django' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_PROJECT_TYPE="django"
        elif grep -q 'fastapi' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_PROJECT_TYPE="fastapi"
        elif grep -q 'flask' "$project_dir/pyproject.toml" 2>/dev/null; then
            DETECTED_PROJECT_TYPE="flask"
        fi

        print_verbose "Detected Python project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    # Check for requirements.txt
    if [[ -f "$project_dir/requirements.txt" ]]; then
        DETECTED_PROJECT_TYPE="python"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_MEDIUM"
        DETECTED_PACKAGE_MANAGER="pip"

        if grep -q 'pytest' "$project_dir/requirements.txt" 2>/dev/null; then
            DETECTED_TEST_FRAMEWORK="pytest"
        fi

        print_verbose "Detected Python project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

# =============================================================================
# Go Detector
# =============================================================================

detect_go() {
    local project_dir="$1"

    if [[ -f "$project_dir/go.mod" ]]; then
        DETECTED_PROJECT_TYPE="go"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER="go"
        DETECTED_TEST_FRAMEWORK="go_test"
        DETECTED_LINT_TOOL="golangci-lint"

        print_verbose "Detected Go project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

# =============================================================================
# Rust Detector
# =============================================================================

detect_rust() {
    local project_dir="$1"

    if [[ -f "$project_dir/Cargo.toml" ]]; then
        DETECTED_PROJECT_TYPE="rust"
        DETECTED_PROJECT_CONFIDENCE="$CONFIDENCE_HIGH"
        DETECTED_PACKAGE_MANAGER="cargo"
        DETECTED_TEST_FRAMEWORK="cargo_test"
        DETECTED_LINT_TOOL="clippy"

        print_verbose "Detected Rust project ($DETECTED_PROJECT_CONFIDENCE)"
        return 0
    fi

    return 1
}

# =============================================================================
# Helper Functions
# =============================================================================

detect_node_package_manager() {
    local project_dir="$1"

    if [[ -f "$project_dir/pnpm-lock.yaml" ]]; then
        echo "pnpm"
    elif [[ -f "$project_dir/yarn.lock" ]]; then
        echo "yarn"
    elif [[ -f "$project_dir/bun.lockb" ]]; then
        echo "bun"
    else
        echo "npm"
    fi
}

# =============================================================================
# Get Detection Results
# =============================================================================

get_detection_result() {
    cat <<EOF
{
    "type": "$DETECTED_PROJECT_TYPE",
    "confidence": "$DETECTED_PROJECT_CONFIDENCE",
    "package_manager": "$DETECTED_PACKAGE_MANAGER",
    "test_framework": "$DETECTED_TEST_FRAMEWORK",
    "lint_tool": "$DETECTED_LINT_TOOL"
}
EOF
}

get_detection_summary() {
    echo "Project Type: $DETECTED_PROJECT_TYPE"
    echo "Confidence: $DETECTED_PROJECT_CONFIDENCE"
    echo "Package Manager: ${DETECTED_PACKAGE_MANAGER:-none}"
    echo "Test Framework: ${DETECTED_TEST_FRAMEWORK:-none}"
    echo "Lint Tool: ${DETECTED_LINT_TOOL:-none}"
}

# =============================================================================
# Docker Detection
# =============================================================================

detect_docker_support() {
    local project_dir="${1:-.}"

    if [[ -f "$project_dir/docker-compose.yml" ]] || [[ -f "$project_dir/docker-compose.yaml" ]]; then
        echo "docker-compose"
    elif [[ -f "$project_dir/Dockerfile" ]]; then
        echo "dockerfile"
    else
        echo "none"
    fi
}

get_docker_service_name() {
    local project_dir="${1:-.}"
    local compose_file=""

    if [[ -f "$project_dir/docker-compose.yml" ]]; then
        compose_file="$project_dir/docker-compose.yml"
    elif [[ -f "$project_dir/docker-compose.yaml" ]]; then
        compose_file="$project_dir/docker-compose.yaml"
    else
        echo ""
        return 1
    fi

    # Try to find app service (common names)
    local services=("app" "web" "api" "server" "backend" "php" "node")

    if command -v yq &>/dev/null; then
        local available_services
        available_services=$(yq e '.services | keys | .[]' "$compose_file" 2>/dev/null)

        for service in "${services[@]}"; do
            if echo "$available_services" | grep -q "^${service}$"; then
                echo "$service"
                return 0
            fi
        done

        # Return first service if no common name found
        echo "$available_services" | head -1
    else
        # Fallback: grep for service names
        for service in "${services[@]}"; do
            if grep -q "^  ${service}:" "$compose_file" 2>/dev/null; then
                echo "$service"
                return 0
            fi
        done
    fi

    echo ""
    return 1
}
