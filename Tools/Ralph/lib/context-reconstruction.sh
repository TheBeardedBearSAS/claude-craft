#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Context Reconstruction Module
# Intelligent context rebuilding after compact or session continuation
# =============================================================================
# Based on Anthropic's "Effective Context Engineering for AI Agents"
# https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
# =============================================================================

# Configuration
CONTEXT_INCLUDE_GIT_DIFF="${CONTEXT_INCLUDE_GIT_DIFF:-true}"
CONTEXT_INCLUDE_TEST_STATUS="${CONTEXT_INCLUDE_TEST_STATUS:-true}"
CONTEXT_SMART_RECONSTRUCTION="${CONTEXT_SMART_RECONSTRUCTION:-true}"
CONTEXT_MAX_PROMPT_TOKENS="${CONTEXT_MAX_PROMPT_TOKENS:-5000}"

# =============================================================================
# Main Reconstruction Function
# =============================================================================

reconstruct_context() {
    local session_id="$1"

    if [[ "$CONTEXT_SMART_RECONSTRUCTION" != "true" ]]; then
        print_verbose "Smart context reconstruction disabled"
        return 0
    fi

    print_info "${MSG_CONTEXT_RECONSTRUCTING:-Reconstructing context from progress file}..."

    local context=""

    # 1. Sprint Progress (primary source of truth)
    context+=$(build_progress_section)

    # 2. Git Changes Summary
    if [[ "$CONTEXT_INCLUDE_GIT_DIFF" == "true" ]]; then
        context+="\n\n"
        context+=$(build_git_section)
    fi

    # 3. Test Status
    if [[ "$CONTEXT_INCLUDE_TEST_STATUS" == "true" ]]; then
        context+="\n\n"
        context+=$(build_test_section)
    fi

    # 4. Current Task Details
    context+="\n\n"
    context+=$(build_current_task_section)

    echo -e "$context"
}

# =============================================================================
# Section Builders
# =============================================================================

# Headings and sentences come from Tools/i18n/ralph/<lang>.sh (MSG_SECTION_*):
# these sections are sent to Claude and must follow --lang.

build_progress_section() {
    echo "${MSG_SECTION_PROGRESS:-## Sprint Progress}"
    echo ""

    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        # Extract key sections only (not the entire file)
        echo "${MSG_SECTION_CURRENT_STATE:-### Current State}"
        grep -A4 "^## Current State" "$SPRINT_PROGRESS_FILE" 2>/dev/null | tail -n +2 || echo "- ${MSG_SECTION_UNKNOWN:-Unknown}"

        echo ""
        echo "${MSG_SECTION_COMPLETED_TASKS:-### Completed Tasks}"
        # Show last 5 completed tasks
        grep '^\- \[x\]' "$SPRINT_PROGRESS_FILE" 2>/dev/null | tail -5 || echo "- ${MSG_SECTION_NONE_YET:-None yet}"

        echo ""
        echo "${MSG_SECTION_KEY_DECISIONS:-### Key Decisions}"
        grep -A10 "^## Key Decisions" "$SPRINT_PROGRESS_FILE" 2>/dev/null | grep '^-' | head -5 || echo "- ${MSG_SECTION_NONE_RECORDED:-None recorded}"
    else
        echo "${MSG_SECTION_NO_PROGRESS_FILE:-No sprint progress file found.}"
    fi
}

build_git_section() {
    echo "${MSG_SECTION_GIT:-## Recent Changes}"
    echo ""

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "${MSG_SECTION_NOT_GIT:-Not in a git repository.}"
        return
    fi

    # Get summary of changes - check commit count first
    echo "${MSG_SECTION_MODIFIED_FILES:-### Modified Files (recent commits)}"
    local commit_count
    commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")

    local no_changes="${MSG_SECTION_NO_RECENT_CHANGES:-No recent changes}"
    if [[ "$commit_count" -ge 5 ]]; then
        git diff --stat HEAD~5 2>/dev/null | tail -15 || echo "$no_changes"
    elif [[ "$commit_count" -gt 0 ]]; then
        # Show diff from initial commit if less than 5 commits
        git diff --stat "$(git rev-list --max-parents=0 HEAD 2>/dev/null)" 2>/dev/null | tail -15 || echo "$no_changes"
    else
        echo "${MSG_SECTION_NO_COMMITS:-No commits yet}"
    fi

    echo ""
    echo "${MSG_SECTION_RECENT_COMMITS:-### Recent Commits}"
    git log --oneline -5 2>/dev/null || echo "${MSG_SECTION_NO_COMMITS:-No commits yet}"

    echo ""
    echo "${MSG_SECTION_UNCOMMITTED:-### Uncommitted Changes}"
    local status
    status=$(git status --porcelain 2>/dev/null | head -10) || true
    if [[ -n "$status" ]]; then
        echo "\`\`\`"
        echo "$status"
        echo "\`\`\`"
    else
        echo "${MSG_SECTION_NO_UNCOMMITTED:-No uncommitted changes.}"
    fi
}

build_test_section() {
    echo "${MSG_SECTION_TESTS:-## Test Status}"
    echo ""

    # Try to detect test framework
    local framework_detected=false

    # Check for common test runners (using ls for glob patterns)
    if [[ -f "package.json" ]] && grep -q '"test"' package.json 2>/dev/null; then
        echo "- Framework: Node.js (npm test)"
        framework_detected=true
    elif [[ -f "composer.json" ]] && grep -q 'phpunit' composer.json 2>/dev/null; then
        echo "- Framework: PHP (PHPUnit)"
        framework_detected=true
    elif ls ./*.csproj >/dev/null 2>&1 || ls ./*.sln >/dev/null 2>&1 || ls ./**/*.csproj >/dev/null 2>&1; then
        # .NET project detection (correct glob expansion)
        echo "- Framework: .NET (dotnet test)"
        framework_detected=true
    elif [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]]; then
        echo "- Framework: Python (pytest/unittest)"
        framework_detected=true
    elif [[ -f "Cargo.toml" ]]; then
        echo "- Framework: Rust (cargo test)"
        framework_detected=true
    elif [[ -f "go.mod" ]]; then
        echo "- Framework: Go (go test)"
        framework_detected=true
    fi

    if [[ "$framework_detected" == "false" ]]; then
        echo "- Framework: ${MSG_SECTION_UNKNOWN:-Unknown}"
    fi

    # Check sprint progress for recorded test status
    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        local unit_status
        unit_status=$(grep -oP 'Unit: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
        local integration_status
        integration_status=$(grep -oP 'Integration: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
        echo "- ${MSG_SECTION_UNIT_TESTS:-Unit Tests}: $unit_status"
        echo "- ${MSG_SECTION_INTEGRATION_TESTS:-Integration Tests}: $integration_status"
    fi
}

build_current_task_section() {
    echo "${MSG_SECTION_TASK:-## Current Task}"
    echo ""

    # Check for current task file
    if [[ -f ".ralph/current-task.md" ]]; then
        cat ".ralph/current-task.md"
        return
    fi

    # Try to get from sprint progress
    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        local current_task=$(grep -oP '\*\*Current Task\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null)
        local phase=$(grep -oP '\*\*Phase\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null)

        if [[ -n "$current_task" && "$current_task" != "none" ]]; then
            echo "**${MSG_SECTION_TASK_LABEL:-Task}**: $current_task"
            echo "**${MSG_SPRINT_PHASE:-Phase}**: ${phase:-unknown}"
            echo ""
            local msg="${MSG_SECTION_CONTINUE_PHASE:-"Continue from where you left off in the {0} phase."}"
            echo "${msg//\{0\}/"$phase"}"
        else
            echo "${MSG_SECTION_NO_TASK:-No current task in progress.}"
        fi
    else
        echo "${MSG_SECTION_NO_TASK_INFO:-No current task information available.}"
    fi
}

# =============================================================================
# Continuation Prompt Generation
# =============================================================================

# Templates come from Tools/i18n/ralph/<lang>.sh (MSG_PROMPT_*), so the
# prompt sent to Claude follows --lang. Replacements are quoted: bash 5.2
# would otherwise expand `&` in the context to the matched placeholder.
generate_continuation_prompt() {
    local session_id="${SESSION_ID:-unknown}"
    local context
    context=$(reconstruct_context "$session_id")

    local prompt="${MSG_PROMPT_CONTINUATION:-"{0}"}"
    echo "${prompt//\{0\}/"$context"}"
}

# =============================================================================
# Session Handoff Prompt
# =============================================================================

generate_session_handoff_prompt() {
    local previous_session="$1"
    local context
    context=$(reconstruct_context "$previous_session")

    local prompt="${MSG_PROMPT_HANDOFF:-"{1}"}"
    prompt="${prompt//\{0\}/"$previous_session"}"
    echo "${prompt//\{1\}/"$context"}"
}

# =============================================================================
# Quick Summary for Logging
# =============================================================================

get_reconstruction_summary() {
    local has_progress="No"
    local has_git="No"
    local has_tests="No"
    local has_task="No"

    [[ -f "$SPRINT_PROGRESS_FILE" ]] && has_progress="Yes"
    git rev-parse --git-dir > /dev/null 2>&1 && has_git="Yes"
    [[ -f ".ralph/current-task.md" ]] && has_task="Yes"

    cat << EOF
{
    "has_progress_file": "$has_progress",
    "has_git": "$has_git",
    "has_current_task": "$has_task",
    "timestamp": "$(date -Iseconds)"
}
EOF
}

# =============================================================================
# Set Current Task (for tracking)
# =============================================================================

set_current_task() {
    local task_id="$1"
    local task_type="$2"
    local task_description="$3"
    local task_phase="${4:-RED}"

    # Create .ralph directory if needed
    mkdir -p .ralph

    cat > ".ralph/current-task.md" << EOF
# Current Task

- **ID**: $task_id
- **Type**: $task_type
- **Description**: $task_description
- **Phase**: $task_phase
- **Started**: $(date -Iseconds)

## Files to Modify
<!-- Will be filled as work progresses -->

## Notes
<!-- Add implementation notes here -->
EOF

    # Update sprint progress
    if type update_sprint_progress &>/dev/null; then
        update_sprint_progress "state" "{\"current_task\": \"$task_id [$task_type] $task_description\", \"phase\": \"$task_phase\"}"
    fi
}

clear_current_task() {
    if [[ -f ".ralph/current-task.md" ]]; then
        rm ".ralph/current-task.md"
    fi

    # Update sprint progress
    if type update_sprint_progress &>/dev/null; then
        update_sprint_progress "state" "{\"current_task\": \"none\", \"phase\": \"IDLE\"}"
    fi
}
