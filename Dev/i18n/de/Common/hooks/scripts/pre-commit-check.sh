#!/bin/bash
# Pre-commit hook: Block commits with secrets or sensitive data
# Exit code 2 = block, Exit code 0 = allow
set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract the command being executed
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Check for sensitive patterns in staged files
check_secrets() {
    local patterns=(
        "password\s*="
        "api_key\s*="
        "secret\s*="
        "token\s*="
        "AWS_ACCESS_KEY"
        "AWS_SECRET_KEY"
        "PRIVATE_KEY"
        "-----BEGIN.*PRIVATE KEY-----"
    )

    for pattern in "${patterns[@]}"; do
        if git diff --cached --name-only 2>/dev/null | xargs -r grep -lE "$pattern" 2>/dev/null; then
            return 1
        fi
    done
    return 0
}

# Check for large files
check_file_size() {
    local max_size=10485760  # 10MB
    while read -r file; do
        if [ -f "$file" ]; then
            size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            if [ "$size" -gt "$max_size" ]; then
                echo "File too large: $file ($size bytes)" >&2
                return 1
            fi
        fi
    done < <(git diff --cached --name-only 2>/dev/null)
    return 0
}

# Check for .env files
check_env_files() {
    if git diff --cached --name-only 2>/dev/null | grep -qE "\.env$|\.env\..+$"; then
        echo "BLOCKED: Attempting to commit .env file" >&2
        return 1
    fi
    return 0
}

# Main checks
if ! check_env_files; then
    exit 2
fi

if ! check_secrets; then
    echo "BLOCKED: Potential secrets detected in staged files" >&2
    exit 2
fi

if ! check_file_size; then
    exit 2
fi

# All checks passed
exit 0
