#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Git Checkpointing Module
# Creates git checkpoints for recovery and history tracking
# =============================================================================

# Checkpointing configuration
CP_ENABLED="${CP_ENABLED:-true}"
CP_ASYNC="${CP_ASYNC:-true}"
CP_BRANCH_PREFIX="${CP_BRANCH_PREFIX:-ralph/}"
CP_COMMIT_TEMPLATE="${CP_COMMIT_TEMPLATE:-checkpoint: Ralph iteration {iteration}}"

# =============================================================================
# Initialization
# =============================================================================

init_checkpointing() {
    # Check if git is available
    if ! command -v git &> /dev/null; then
        CP_ENABLED=false
        print_verbose "Git not found, checkpointing disabled"
        return 1
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir &> /dev/null; then
        CP_ENABLED=false
        print_verbose "Not in a git repository, checkpointing disabled"
        return 1
    fi

    # Load config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled=$(yq e '.checkpointing.enabled // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ "$enabled" == "false" ]] && CP_ENABLED=false

        local async=$(yq e '.checkpointing.async // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ "$async" == "false" ]] && CP_ASYNC=false

        local prefix=$(yq e '.checkpointing.branch_prefix // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$prefix" ]] && CP_BRANCH_PREFIX="$prefix"

        local template=$(yq e '.checkpointing.commit_message_template // ""' "$CONFIG_FILE" 2>/dev/null)
        [[ -n "$template" ]] && CP_COMMIT_TEMPLATE="$template"
    fi

    print_verbose "Checkpointing initialized:"
    print_verbose "  - Enabled: $CP_ENABLED"
    print_verbose "  - Async: $CP_ASYNC"
    print_verbose "  - Branch prefix: $CP_BRANCH_PREFIX"

    return 0
}

# =============================================================================
# Create Checkpoint
# =============================================================================

create_checkpoint() {
    local session_id="$1"
    local iteration="$2"

    if [[ "$CP_ENABLED" != "true" ]]; then
        return 0
    fi

    # Check for changes to commit
    if [[ -z "$(git status --porcelain 2>/dev/null)" ]]; then
        print_verbose "No changes to checkpoint"
        return 0
    fi

    # Generate commit message
    local commit_msg="${CP_COMMIT_TEMPLATE/\{iteration\}/$iteration}"
    commit_msg="${commit_msg/\{session_id\}/$session_id}"

    if [[ "$CP_ASYNC" == "true" ]]; then
        # Run checkpoint in background
        _create_checkpoint_async "$session_id" "$iteration" "$commit_msg" &
        print_verbose "${MSG_CHECKPOINT_CREATING} (async)"
    else
        # Run checkpoint synchronously
        _create_checkpoint_sync "$session_id" "$iteration" "$commit_msg"
    fi
}

# =============================================================================
# Synchronous Checkpoint
# =============================================================================

_create_checkpoint_sync() {
    local session_id="$1"
    local iteration="$2"
    local commit_msg="$3"

    print_verbose "${MSG_CHECKPOINT_CREATING}"

    # Stage all changes
    git add -A 2>/dev/null

    # Create commit
    local commit_hash
    commit_hash=$(git commit -m "$commit_msg" 2>/dev/null && git rev-parse --short HEAD)

    if [[ -n "$commit_hash" ]]; then
        print_verbose "${MSG_CHECKPOINT_CREATED}: $commit_hash"
        log_session "$session_id" "INFO" "Checkpoint created: $commit_hash"
    else
        print_verbose "${MSG_CHECKPOINT_FAILED}"
        log_session "$session_id" "WARN" "Checkpoint failed"
    fi
}

# =============================================================================
# Asynchronous Checkpoint
# =============================================================================

_create_checkpoint_async() {
    local session_id="$1"
    local iteration="$2"
    local commit_msg="$3"

    # Create a lock file to prevent concurrent checkpoints
    # Use session directory instead of /tmp (per CLAUDE.md restrictions)
    local session_dir="${RALPH_SESSION_BASE:-$PWD/.ralph}/sessions/$session_id"
    local lock_file="$session_dir/checkpoint.lock"

    # Ensure session directory exists
    mkdir -p "$session_dir" 2>/dev/null

    # Try to acquire lock
    if ! mkdir "$lock_file" 2>/dev/null; then
        # Another checkpoint is in progress
        return 0
    fi

    # Cleanup function
    _checkpoint_cleanup() {
        rmdir "$lock_file" 2>/dev/null || true
    }

    # Stage all changes
    git add -A 2>/dev/null

    # Create commit and capture result
    local commit_result=0
    git commit -m "$commit_msg" 2>/dev/null || commit_result=$?

    # Log result
    if [[ $commit_result -eq 0 ]]; then
        local commit_hash
        commit_hash=$(git rev-parse --short HEAD 2>/dev/null)
        log_session "$session_id" "INFO" "Async checkpoint created: $commit_hash"
    fi

    _checkpoint_cleanup
}

# =============================================================================
# Restore from Checkpoint
# =============================================================================

restore_checkpoint() {
    local session_id="$1"
    local commit_hash="$2"

    if [[ "$CP_ENABLED" != "true" ]]; then
        print_error "Checkpointing is disabled"
        return 1
    fi

    print_info "${MSG_CHECKPOINT_RESTORING}"

    # Verify commit exists
    if ! git cat-file -e "$commit_hash" 2>/dev/null; then
        print_error "Commit not found: $commit_hash"
        return 1
    fi

    # Create a backup branch of current state
    local backup_branch="ralph-backup-$(date +%s)"
    git branch "$backup_branch" 2>/dev/null

    # Reset to the checkpoint
    if git reset --hard "$commit_hash" 2>/dev/null; then
        print_success "${MSG_CHECKPOINT_RESTORED}"
        log_session "$session_id" "INFO" "Restored to checkpoint: $commit_hash (backup: $backup_branch)"
        return 0
    else
        print_error "${MSG_CHECKPOINT_FAILED}"
        return 1
    fi
}

# =============================================================================
# List Checkpoints
# =============================================================================

list_checkpoints() {
    local session_id="$1"

    if [[ "$CP_ENABLED" != "true" ]]; then
        echo "[]"
        return
    fi

    # Find commits matching the checkpoint pattern
    local commits
    commits=$(git log --oneline --grep="checkpoint: Ralph" 2>/dev/null | head -20)

    if [[ -n "$commits" ]]; then
        echo "$commits" | while read -r line; do
            local hash=$(echo "$line" | cut -d' ' -f1)
            local msg=$(echo "$line" | cut -d' ' -f2-)
            echo "{\"hash\":\"$hash\",\"message\":\"$msg\"}"
        done | jq -s '.'
    else
        echo "[]"
    fi
}

# =============================================================================
# Create Branch for Session
# =============================================================================

create_session_branch() {
    local session_id="$1"
    local branch_name="${CP_BRANCH_PREFIX}${session_id}"

    if [[ "$CP_ENABLED" != "true" ]]; then
        return 1
    fi

    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch_name" 2>/dev/null; then
        # Switch to existing branch
        git checkout "$branch_name" 2>/dev/null
    else
        # Create new branch
        git checkout -b "$branch_name" 2>/dev/null
    fi

    print_verbose "${MSG_CHECKPOINT_BRANCH}: $branch_name"
}
