#!/bin/bash
# PreToolUse hook: Block dangerous shell commands
# Exit code 2 = block the command
set -e

# Read JSON input from stdin
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Dangerous patterns to block (regex)
DANGEROUS_PATTERNS=(
    # rm with -r and -f combined in one flag (rm -rf, rm -fr, rm -rfi, etc.)
    "rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+/"
    "rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+~"
    # rm with -r and -f as separate flags in any order (rm -r -f /, rm -f -r /)
    "rm\s+-[a-zA-Z]*r[a-zA-Z]*\s+.*-[a-zA-Z]*f[a-zA-Z]*\s+/"
    "rm\s+-[a-zA-Z]*f[a-zA-Z]*\s+.*-[a-zA-Z]*r[a-zA-Z]*\s+/"
    "rm\s+-[a-zA-Z]*r[a-zA-Z]*\s+.*-[a-zA-Z]*f[a-zA-Z]*\s+~"
    "rm\s+-[a-zA-Z]*f[a-zA-Z]*\s+.*-[a-zA-Z]*r[a-zA-Z]*\s+~"
    "rm\s+-rf\s+/\*"
    "dd\s+if=/dev/zero"
    "mkfs"
    "chmod\s+-R\s+777\s+/"
    "chown\s+-R"
    ">\s*/dev/sda"
    "mv\s+/\*\s+/dev/null"
)

# Check for fork bomb (fixed string, contains regex special chars)
if echo "$COMMAND" | grep -qF ':(){:|:&};:'; then
    echo "BLOCKED: Dangerous command detected: fork bomb" >&2
    exit 2
fi

# Check for dangerous patterns (regex)
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qE "$pattern"; then
        echo "BLOCKED: Dangerous command detected: $pattern" >&2
        exit 2
    fi
done

# Check for commands that modify system files
if echo "$COMMAND" | grep -qE "^(sudo|su)\s"; then
    echo "BLOCKED: Elevated privilege commands not allowed" >&2
    exit 2
fi

# Check for commands that could expose secrets
if echo "$COMMAND" | grep -qE "(cat|less|head|tail|more|strings)\s.*\.(env|credentials|secret|pem|key)\b"; then
    echo "BLOCKED: Command might expose secrets" >&2
    exit 2
fi

# All checks passed
exit 0
