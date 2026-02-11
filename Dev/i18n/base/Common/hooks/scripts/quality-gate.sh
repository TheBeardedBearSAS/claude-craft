#!/bin/bash
# Quality gate hook: Run tests before accepting Claude's response
# This runs on Stop event to validate work before completion
set -e

# Read JSON input from stdin
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')

cd "$CWD" 2>/dev/null || true

# Detect project type and run appropriate tests
run_tests() {
    # Node.js / JavaScript
    if [ -f "package.json" ]; then
        if npm test --silent 2>/dev/null; then
            return 0
        else
            return 1
        fi
    fi

    # PHP / Symfony
    if [ -f "composer.json" ]; then
        if [ -f "vendor/bin/phpunit" ]; then
            if vendor/bin/phpunit --testdox 2>/dev/null; then
                return 0
            else
                return 1
            fi
        fi
    fi

    # Python
    if [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
        if command -v pytest &> /dev/null; then
            if pytest -q 2>/dev/null; then
                return 0
            else
                return 1
            fi
        fi
    fi

    # Flutter / Dart
    if [ -f "pubspec.yaml" ]; then
        if command -v flutter &> /dev/null; then
            if flutter test --reporter compact 2>/dev/null; then
                return 0
            else
                return 1
            fi
        fi
    fi

    # Go
    if [ -f "go.mod" ]; then
        if go test ./... 2>/dev/null; then
            return 0
        else
            return 1
        fi
    fi

    # No tests found — warn but pass by default
    echo "WARNING: No test framework detected — quality gate passed by default" >&2
    return 0
}

# Run static analysis
run_static_analysis() {
    # PHP
    if [ -f "vendor/bin/phpstan" ]; then
        vendor/bin/phpstan analyse --no-progress 2>/dev/null || return 1
    fi

    # TypeScript
    if [ -f "tsconfig.json" ] && command -v npx &> /dev/null; then
        npx tsc --noEmit 2>/dev/null || return 1
    fi

    return 0
}

# Main execution
if ! run_tests; then
    echo '{"decision": "block", "reason": "Tests are failing. Please fix the failing tests before completing this task."}'
    exit 0
fi

# Static analysis is optional - warn but don't block
if ! run_static_analysis; then
    echo '{"continue": true, "systemMessage": "Warning: Static analysis found issues. Consider reviewing."}'
    exit 0
fi

# All passed
echo '{"continue": true}'
exit 0
