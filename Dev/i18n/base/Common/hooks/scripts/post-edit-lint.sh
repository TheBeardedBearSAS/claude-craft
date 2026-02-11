#!/bin/bash
# Post-edit hook: Auto-lint modified files
# This hook runs after Write or Edit operations
set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract the file path that was modified
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Get file extension
EXT="${FILE_PATH##*.}"

# Run appropriate linter based on file type
case "$EXT" in
    js|jsx|ts|tsx)
        if command -v npx &> /dev/null && [ -f "package.json" ]; then
            npx eslint --fix "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
    php)
        if command -v php-cs-fixer &> /dev/null; then
            php-cs-fixer fix "$FILE_PATH" --quiet 2>/dev/null || true
        elif command -v vendor/bin/php-cs-fixer &> /dev/null; then
            vendor/bin/php-cs-fixer fix "$FILE_PATH" --quiet 2>/dev/null || true
        fi
        ;;
    py)
        if command -v black &> /dev/null; then
            black --quiet "$FILE_PATH" 2>/dev/null || true
        fi
        if command -v isort &> /dev/null; then
            isort --quiet "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
    dart)
        if command -v dart &> /dev/null; then
            dart format "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
    go)
        if command -v gofmt &> /dev/null; then
            gofmt -w "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
    rs)
        if command -v rustfmt &> /dev/null; then
            rustfmt "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
esac

exit 0
