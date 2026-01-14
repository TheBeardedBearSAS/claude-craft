#!/bin/bash
# =============================================================================
# Ralph Wiggum - Utilities Module
# Common helper functions for file locking, atomic operations, and validation
# =============================================================================

# Module state
_UTILS_MODULE_INITIALIZED=false

# =============================================================================
# Module Initialization
# =============================================================================

init_utils() {
    [[ "$_UTILS_MODULE_INITIALIZED" == "true" ]] && return 0
    _UTILS_MODULE_INITIALIZED=true
}

# =============================================================================
# File Locking
# Uses mkdir for atomic lock creation (portable across systems)
# =============================================================================

acquire_file_lock() {
    local file="$1"
    local timeout="${2:-30}"  # Default 30 iterations (3 seconds)
    local lockfile="${file}.lock"

    local count=0
    while [[ $count -lt $timeout ]]; do
        if mkdir "$lockfile" 2>/dev/null; then
            # Lock acquired
            return 0
        fi
        sleep 0.1
        count=$((count + 1))
    done

    # Timeout - lock not acquired
    return 1
}

release_file_lock() {
    local file="$1"
    local lockfile="${file}.lock"

    rmdir "$lockfile" 2>/dev/null || true
}

# Ensure lock is released on script exit
cleanup_lock() {
    local file="$1"
    release_file_lock "$file"
}

# =============================================================================
# Atomic File Operations
# =============================================================================

# Atomic file update using temp-file-then-move pattern
atomic_file_update() {
    local file="$1"
    local callback="$2"
    shift 2
    local callback_args=("$@")

    local temp_file="${file}.tmp.$$"

    # Copy original to temp
    if [[ -f "$file" ]]; then
        cp "$file" "$temp_file" || return 1
    else
        touch "$temp_file" || return 1
    fi

    # Apply modifications via callback
    if ! "$callback" "$temp_file" "${callback_args[@]}"; then
        rm -f "$temp_file"
        return 1
    fi

    # Atomic commit
    mv "$temp_file" "$file"
}

# Safe sed replacement with file locking and atomic operations
safe_sed_replace() {
    local file="$1"
    local pattern="$2"
    local replacement="$3"

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    # Acquire lock
    if ! acquire_file_lock "$file"; then
        print_error "Could not acquire lock for $file" 2>/dev/null || echo "ERROR: Could not acquire lock for $file" >&2
        return 1
    fi

    local temp_file="${file}.tmp.$$"
    local result=0

    # Copy to temp file
    if cp "$file" "$temp_file"; then
        # Apply sed to temp file
        if sed -i "s|${pattern}|${replacement}|" "$temp_file" 2>/dev/null; then
            # Atomic replace
            mv "$temp_file" "$file"
        else
            rm -f "$temp_file"
            result=1
        fi
    else
        result=1
    fi

    # Release lock
    release_file_lock "$file"

    return $result
}

# Batch sed operations (multiple patterns at once)
safe_sed_batch() {
    local file="$1"
    shift
    local patterns=("$@")

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    # Acquire lock
    if ! acquire_file_lock "$file"; then
        return 1
    fi

    local temp_file="${file}.tmp.$$"
    local result=0

    # Copy to temp file
    if cp "$file" "$temp_file"; then
        # Apply all sed patterns
        for pattern in "${patterns[@]}"; do
            sed -i "$pattern" "$temp_file" 2>/dev/null || true
        done

        # Atomic replace
        mv "$temp_file" "$file"
    else
        result=1
    fi

    # Release lock
    release_file_lock "$file"

    return $result
}

# =============================================================================
# String Escaping
# =============================================================================

# Escape string for use in sed replacement
escape_sed() {
    printf '%s\n' "$1" | sed -e 's/[\/&]/\\&/g' -e 's/[]\/$*.^[]/\\&/g'
}

# Escape string for use in sed pattern
escape_sed_pattern() {
    printf '%s\n' "$1" | sed -e 's/[]\/$*.^[]/\\&/g'
}

# =============================================================================
# Validation Functions
# =============================================================================

# Check if value is a positive integer
is_positive_integer() {
    local value="$1"
    [[ "$value" =~ ^[1-9][0-9]*$ ]]
}

# Check if value is a non-negative integer (including 0)
is_non_negative_integer() {
    local value="$1"
    [[ "$value" =~ ^[0-9]+$ ]]
}

# Check if value is a valid UUID
is_valid_uuid() {
    local value="$1"
    [[ "$value" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]
}

# Check if value is a valid session ID format (ralph-TIMESTAMP-SUFFIX)
is_valid_session_id() {
    local value="$1"
    [[ "$value" =~ ^ralph(-cont)?-[0-9]{8}_[0-9]{6}-[a-f0-9]+$ ]]
}

# =============================================================================
# Random Generation
# =============================================================================

# Generate random hex suffix (portable)
generate_random_suffix() {
    local length="${1:-4}"

    if command -v xxd &>/dev/null; then
        head -c "$length" /dev/urandom | xxd -p
    elif command -v od &>/dev/null; then
        head -c "$length" /dev/urandom | od -An -tx1 | tr -d ' \n'
    else
        # Fallback using $RANDOM (less entropy but works everywhere)
        printf '%04x%04x' $RANDOM $RANDOM | head -c "$((length * 2))"
    fi
}

# =============================================================================
# Error Handling
# =============================================================================

# Exit with error message
die() {
    local message="$1"
    local exit_code="${2:-1}"

    if type print_error &>/dev/null; then
        print_error "$message"
    else
        echo "ERROR: $message" >&2
    fi

    exit "$exit_code"
}

# Log error and return failure (non-fatal)
fail() {
    local message="$1"
    local return_code="${2:-1}"

    if type print_error &>/dev/null; then
        print_error "$message"
    else
        echo "ERROR: $message" >&2
    fi

    return "$return_code"
}

# =============================================================================
# File Operations
# =============================================================================

# Create backup with timestamp
create_backup() {
    local file="$1"
    local max_backups="${2:-3}"

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    local backup_file="${file}.backup.$(date +%Y%m%d_%H%M%S)"

    if cp "$file" "$backup_file"; then
        # Cleanup old backups (keep only max_backups)
        ls -t "${file}".backup.* 2>/dev/null | tail -n +"$((max_backups + 1))" | xargs -r rm -f 2>/dev/null || true
        return 0
    fi

    return 1
}

# Safe file write with backup
safe_write() {
    local file="$1"
    local content="$2"

    # Create backup if file exists
    if [[ -f "$file" ]]; then
        create_backup "$file"
    fi

    # Write to temp then move
    local temp_file="${file}.tmp.$$"

    if printf '%s\n' "$content" > "$temp_file"; then
        mv "$temp_file" "$file"
        return 0
    fi

    rm -f "$temp_file"
    return 1
}

# =============================================================================
# Command Checking
# =============================================================================

# Check if command exists
command_exists() {
    command -v "$1" &>/dev/null
}

# Require command or exit
require_command() {
    local cmd="$1"
    local message="${2:-Command '$cmd' is required but not found}"

    if ! command_exists "$cmd"; then
        die "$message"
    fi
}

# =============================================================================
# Logging with Context
# =============================================================================

# Log with timestamp and context
log_with_context() {
    local level="$1"
    local message="$2"
    local log_file="${3:-}"

    local session="${SESSION_ID:-unknown}"
    local timestamp=$(date -Iseconds)

    local log_line="[$timestamp] [$level] [$session] $message"

    if [[ -n "$log_file" ]]; then
        printf '%s\n' "$log_line" >> "$log_file"
    else
        printf '%s\n' "$log_line" >&2
    fi
}

# =============================================================================
# Module Guard Helper
# =============================================================================

# Check if a function is available (module loaded)
module_available() {
    local function_name="$1"
    type "$function_name" &>/dev/null
}

# Call function only if module is loaded
safe_call() {
    local function_name="$1"
    shift

    if module_available "$function_name"; then
        "$function_name" "$@"
        return $?
    fi

    return 0  # Silent success if module not loaded
}
