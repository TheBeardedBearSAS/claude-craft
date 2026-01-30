#!/bin/bash
# Post Tool Use Failure Hook: Recovery after tool failure
# Runs on PostToolUseFailure event
set -e

# Read JSON input from stdin
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
ERROR=$(echo "$INPUT" | jq -r '.error // "unknown"')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TIMESTAMP=$(date -Iseconds)

# Ensure logs directory exists
mkdir -p .claude/logs

# Log the failure for analysis
log_failure() {
    local severity="$1"
    local message="$2"
    echo "[${TIMESTAMP}] [${severity}] [${TOOL_NAME}] ${message}" >> .claude/logs/tool-failures.log
}

# Provide recovery context based on tool type
case "$TOOL_NAME" in
    "Bash")
        log_failure "ERROR" "Bash command failed: $ERROR"

        # Check for common recoverable errors
        if echo "$ERROR" | grep -q "command not found"; then
            echo '{"additionalContext": "Command not found. Check if the command is installed or use Docker container."}'
        elif echo "$ERROR" | grep -q "permission denied"; then
            echo '{"additionalContext": "Permission denied. Check file permissions or use appropriate privileges."}'
        elif echo "$ERROR" | grep -q "No such file or directory"; then
            echo '{"additionalContext": "File or directory not found. Verify the path exists."}'
        elif echo "$ERROR" | grep -q "timeout"; then
            echo '{"additionalContext": "Command timed out. Consider increasing timeout or optimizing the command."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    "Edit"|"Write")
        log_failure "ERROR" "File operation failed: $ERROR"

        if echo "$ERROR" | grep -q "Permission denied"; then
            echo '{"additionalContext": "File permission denied. Check write permissions on the file."}'
        elif echo "$ERROR" | grep -q "No such file"; then
            echo '{"additionalContext": "Target directory may not exist. Create parent directories first."}'
        elif echo "$ERROR" | grep -q "not unique"; then
            echo '{"additionalContext": "Edit old_string not unique. Provide more context to make it unique."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    "Read")
        log_failure "WARN" "Read failed: $ERROR"

        if echo "$ERROR" | grep -q "No such file"; then
            echo '{"additionalContext": "File not found. Use Glob to search for the correct file path."}'
        elif echo "$ERROR" | grep -q "Is a directory"; then
            echo '{"additionalContext": "Target is a directory, not a file. Use ls or Glob to list contents."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    "Glob"|"Grep")
        log_failure "WARN" "Search failed: $ERROR"
        echo '{"additionalContext": "Search operation failed. Check pattern syntax and path."}'
        ;;

    "Task")
        log_failure "ERROR" "Sub-agent failed: $ERROR"

        if echo "$ERROR" | grep -q "timeout"; then
            echo '{"additionalContext": "Sub-agent timed out. Consider breaking the task into smaller parts."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    *)
        log_failure "INFO" "Tool failed: $ERROR"
        echo '{"continue": true}'
        ;;
esac

exit 0
